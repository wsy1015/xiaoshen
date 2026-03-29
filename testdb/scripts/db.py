"""
db.py — SQLAlchemy 文档存储引擎（PolarDB / PostgreSQL）
═══════════════════════════════════════════════════════════
核心能力：
  - 基于 SQLAlchemy 2.0 + JSONB 的通用文档存储
  - pool_pre_ping=True / pool_size=1 自动处理连接复用与断线重连
  - 适配 PolarDB 特殊限制（sslmode=disable、禁 application_name）
  - 三张预设表覆盖工单系统原型后端全部数据需求：
      documents   — 万能文档表（工单 / 用户 / 客户 / 工作区 …）
      logs        — 操作日志（按 doc_id 关联任意文档）
      files       — 文件附件元信息

导入方式：
  from db import engine, Session, Document, Log, File
  from db import DocStore     # 高级封装：CRUD + JSONB 查询

运行前提：
  pip install sqlalchemy psycopg2-binary
  testdb/.env 填写 DB_HOST / DB_USER / DB_PASSWORD / DB_NAME
"""

from __future__ import annotations

import json
import os
import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import (
    Column, DateTime, Index, String, Text,
    create_engine, func, text,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Session as SASession, sessionmaker

# ══════════════════════════════════════════════════════════════
# 1. 读取 .env
# ══════════════════════════════════════════════════════════════
_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
_ENV  = os.path.join(_ROOT, ".env")

def _load_env():
    if not os.path.exists(_ENV):
        raise FileNotFoundError(f".env not found at {_ENV}")
    for pg in ("PGHOST","PGPORT","PGUSER","PGPASSWORD","PGDATABASE","PGSSLMODE","PGAPPNAME"):
        os.environ.pop(pg, None)
    with open(_ENV, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ[k.strip()] = v.strip()

_load_env()


# ══════════════════════════════════════════════════════════════
# 2. SQLAlchemy Engine
# ══════════════════════════════════════════════════════════════
import time as _time
import psycopg2 as _pg2

def _raw_connect():
    """
    原始 psycopg2 连接工厂（带重试）。
    绕过 SQLAlchemy 方言内部探测，适配 PolarDB 冷却期。
    """
    for attempt in range(3):
        try:
            return _pg2.connect(
                host=os.environ["DB_HOST"],
                port=int(os.environ.get("DB_PORT", "5432")),
                user=os.environ["DB_USER"],
                password=os.environ["DB_PASSWORD"],
                dbname=os.environ.get("DB_NAME", "xiaoshen"),
                sslmode="disable",
            )
        except _pg2.OperationalError:
            if attempt == 2:
                raise
            wait = 3 * (attempt + 1)
            _time.sleep(wait)

engine = create_engine(
    "postgresql+psycopg2://",    # 占位 URL，实际由 creator 提供连接
    creator=_raw_connect,        # 用原始 psycopg2 创建连接
    pool_pre_ping=False,         # PolarDB 不支持方言默认 ping
    pool_size=1,                 # 单连接池，避免频率限制
    max_overflow=0,
    pool_recycle=300,
    echo=False,
    use_native_hstore=False,     # PolarDB 查询 pg_type 会断连，禁用 hstore OID 检测
)

# 自定义连接健康检测：每次从池中取连接时用 SELECT 1 验证存活
from sqlalchemy import event as _sa_event
from sqlalchemy.exc import DisconnectionError

@_sa_event.listens_for(engine, "checkout")
def _ping_on_checkout(dbapi_conn, connection_record, connection_proxy):
    try:
        dbapi_conn.cursor().execute("SELECT 1")
    except Exception:
        raise DisconnectionError("PolarDB 连接断开，触发自动重连")

Session = sessionmaker(bind=engine)


# ══════════════════════════════════════════════════════════════
# 3. ORM 模型
# ══════════════════════════════════════════════════════════════
class Base(DeclarativeBase):
    pass


class Document(Base):
    """
    万能文档表 — 用 type 字段区分业务含义。
    type 推荐值：work_order / user_profile / customer / workspace / config …
    body 存放全部业务字段（JSONB），tags 用于标签化快速筛选。
    """
    __tablename__ = "documents"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
                        server_default=text("gen_random_uuid()"))
    type       = Column(String(64),  nullable=False, index=True, comment="文档类型（work_order / user_profile / …）")
    title      = Column(Text,        nullable=False, default="", comment="标题 / 可读标识")
    body       = Column(JSONB,       nullable=False, server_default=text("'{}'::jsonb"), comment="JSONB 业务主体")
    tags       = Column(ARRAY(Text), nullable=False, server_default=text("ARRAY[]::TEXT[]"), comment="标签数组")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index("idx_documents_body", body, postgresql_using="gin"),
        Index("idx_documents_tags", tags, postgresql_using="gin"),
    )

    def to_dict(self) -> dict:
        return {
            "id":         str(self.id),
            "type":       self.type,
            "title":      self.title,
            "body":       self.body,
            "tags":       self.tags or [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<Document {self.type}/{self.id}>"


class Log(Base):
    """
    操作日志 — 按 doc_id 关联任意文档，记录状态变更 / 操作痕迹。
    data 字段存放上下文快照（如旧状态 → 新状态）。
    """
    __tablename__ = "logs"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
                        server_default=text("gen_random_uuid()"))
    doc_id     = Column(UUID(as_uuid=True), nullable=False, index=True, comment="关联文档 ID")
    action     = Column(String(64),  nullable=False, comment="操作名称（create / update / dispatch / accept / …）")
    actor      = Column(String(128), nullable=False, default="", comment="操作人")
    data       = Column(JSONB,       nullable=False, server_default=text("'{}'::jsonb"), comment="操作上下文")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self) -> dict:
        return {
            "id":         str(self.id),
            "doc_id":     str(self.doc_id),
            "action":     self.action,
            "actor":      self.actor,
            "data":       self.data,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<Log {self.action} by {self.actor}>"


class File(Base):
    """
    文件附件元信息 — 文件本身存 OSS/本地，这里只记 meta。
    doc_id 关联所属文档（如工单），zone 区分上传区域（需求方 / 服务方）。
    """
    __tablename__ = "files"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
                        server_default=text("gen_random_uuid()"))
    doc_id     = Column(UUID(as_uuid=True), nullable=False, index=True, comment="关联文档 ID")
    zone       = Column(String(32), nullable=False, default="default", comment="上传区域（requester / provider / default）")
    filename   = Column(Text,       nullable=False, comment="文件名")
    size_bytes = Column(String(32), nullable=True, comment="文件大小（字节）")
    mime_type  = Column(String(128),nullable=True, comment="MIME 类型")
    storage_url= Column(Text,       nullable=True, comment="存储路径 / OSS URL")
    uploader   = Column(String(128),nullable=False, default="", comment="上传人")
    data       = Column(JSONB,      nullable=False, server_default=text("'{}'::jsonb"), comment="扩展信息")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self) -> dict:
        return {
            "id":          str(self.id),
            "doc_id":      str(self.doc_id),
            "zone":        self.zone,
            "filename":    self.filename,
            "size_bytes":  self.size_bytes,
            "mime_type":   self.mime_type,
            "storage_url": self.storage_url,
            "uploader":    self.uploader,
            "data":        self.data,
            "created_at":  self.created_at.isoformat() if self.created_at else None,
        }


# ══════════════════════════════════════════════════════════════
# 4. 初始化表结构（幂等）
# ══════════════════════════════════════════════════════════════
def init_db():
    """创建所有 ORM 表（已存在则跳过）。"""
    Base.metadata.create_all(engine)


# ══════════════════════════════════════════════════════════════
# 5. DocStore — 高级文档操作封装
# ══════════════════════════════════════════════════════════════
class DocStore:
    """
    面向业务的文档 CRUD 工具。
    所有方法自行管理 Session 生命周期，调用方无需关心事务 / 连接。

    用法示例：
        store = DocStore()
        doc_id = store.create("work_order", "二类工单·数据", body={...}, tags=["数据"])
        doc    = store.get(doc_id)
        store.patch(doc_id, {"status": "业务处理中"})
        orders = store.query("work_order", body_match={"status": "待接单"})
        store.add_log(doc_id, "dispatch", "管理员", {"to": "李四"})
    """

    # ── 文档 CRUD ────────────────────────────────────────────

    def create(self, doc_type: str, title: str,
               body: dict | None = None,
               tags: list[str] | None = None) -> str:
        """新建文档，返回 UUID 字符串。"""
        with Session() as s:
            doc = Document(type=doc_type, title=title,
                           body=body or {}, tags=tags or [])
            s.add(doc)
            s.commit()
            return str(doc.id)

    def bulk_create(self, items: list[dict]) -> list[str]:
        """
        批量写入文档，单次 commit 减少网络往返。
        items 格式: [{"type": "...", "title": "...", "body": {...}, "tags": [...]}]
        返回新建文档的 UUID 列表。
        """
        with Session() as s:
            docs = [
                Document(
                    type=it["type"], title=it["title"],
                    body=it.get("body", {}), tags=it.get("tags", []),
                )
                for it in items
            ]
            s.add_all(docs)
            s.commit()
            return [str(d.id) for d in docs]

    def get(self, doc_id: str) -> dict | None:
        """按 ID 获取文档，返回 dict 或 None。"""
        with Session() as s:
            doc = s.get(Document, uuid.UUID(doc_id))
            return doc.to_dict() if doc else None

    def patch(self, doc_id: str, merge_body: dict) -> dict | None:
        """
        局部更新 body（合并，不覆盖未涉及字段）。
        相当于 SQL: body = body || :new_fields
        """
        with Session() as s:
            doc = s.get(Document, uuid.UUID(doc_id))
            if not doc:
                return None
            merged = {**(doc.body or {}), **merge_body}
            doc.body = merged
            doc.updated_at = func.now()
            s.commit()
            s.refresh(doc)
            return doc.to_dict()

    def update(self, doc_id: str, **fields) -> dict | None:
        """直接更新 Document 的顶层列（title / tags / body 整体替换等）。"""
        with Session() as s:
            doc = s.get(Document, uuid.UUID(doc_id))
            if not doc:
                return None
            for k, v in fields.items():
                if hasattr(doc, k):
                    setattr(doc, k, v)
            doc.updated_at = func.now()
            s.commit()
            s.refresh(doc)
            return doc.to_dict()

    def delete(self, doc_id: str) -> bool:
        """删除文档及其关联日志和附件。"""
        uid = uuid.UUID(doc_id)
        with Session() as s:
            s.query(Log).filter(Log.doc_id == uid).delete()
            s.query(File).filter(File.doc_id == uid).delete()
            n = s.query(Document).filter(Document.id == uid).delete()
            s.commit()
            return n > 0

    def query(self, doc_type: str,
              body_match: dict | None = None,
              body_path: tuple[str, str] | None = None,
              tags_contain: list[str] | None = None,
              title_like: str | None = None,
              fulltext: str | None = None,
              order_desc: bool = True,
              limit: int = 50,
              offset: int = 0) -> list[dict]:
        """
        按条件查询文档列表。
        body_match   — JSONB @> 包含查询，如 {"status": "待接单"}
        body_path    — (path, value) 路径查询，如 ("meta.priority", "高")
        tags_contain — 数组包含查询，如 ["数据"]
        title_like   — LIKE 模糊查询
        fulltext     — to_tsvector 全文检索
        """
        with Session() as s:
            q = s.query(Document).filter(Document.type == doc_type)

            if body_match:
                q = q.filter(Document.body.op("@>")(json.dumps(body_match, ensure_ascii=False)))

            if body_path:
                path_parts = body_path[0].split(".")
                col = Document.body
                for p in path_parts[:-1]:
                    col = col[p]
                q = q.filter(col[path_parts[-1]].astext == body_path[1])

            if tags_contain:
                q = q.filter(Document.tags.op("@>")(tags_contain))

            if title_like:
                q = q.filter(Document.title.ilike(f"%{title_like}%"))

            if fulltext:
                q = q.filter(
                    text("to_tsvector('simple', title || ' ' || body::text) "
                         "@@ to_tsquery('simple', :kw)")
                ).params(kw=fulltext)

            order = Document.created_at.desc() if order_desc else Document.created_at.asc()
            rows = q.order_by(order).offset(offset).limit(limit).all()
            return [r.to_dict() for r in rows]

    def count(self, doc_type: str | None = None,
              body_match: dict | None = None) -> int:
        """统计文档数量。"""
        with Session() as s:
            q = s.query(func.count(Document.id))
            if doc_type:
                q = q.filter(Document.type == doc_type)
            if body_match:
                q = q.filter(Document.body.op("@>")(json.dumps(body_match, ensure_ascii=False)))
            return q.scalar() or 0

    # ── 操作日志 ─────────────────────────────────────────────

    def add_log(self, doc_id: str, action: str, actor: str,
                data: dict | None = None) -> str:
        """向文档追加操作日志，返回日志 ID。"""
        with Session() as s:
            log = Log(doc_id=uuid.UUID(doc_id), action=action,
                      actor=actor, data=data or {})
            s.add(log)
            s.commit()
            return str(log.id)

    def get_logs(self, doc_id: str, limit: int = 100) -> list[dict]:
        """获取文档的操作日志（时间倒序）。"""
        with Session() as s:
            rows = (s.query(Log)
                    .filter(Log.doc_id == uuid.UUID(doc_id))
                    .order_by(Log.created_at.desc())
                    .limit(limit).all())
            return [r.to_dict() for r in rows]

    # ── 文件附件 ─────────────────────────────────────────────

    def add_file(self, doc_id: str, filename: str, zone: str = "default",
                 uploader: str = "", **meta) -> str:
        """记录文件附件元信息，返回文件记录 ID。"""
        with Session() as s:
            f = File(doc_id=uuid.UUID(doc_id), zone=zone,
                     filename=filename, uploader=uploader,
                     size_bytes=meta.get("size_bytes"),
                     mime_type=meta.get("mime_type"),
                     storage_url=meta.get("storage_url"),
                     data=meta.get("data", {}))
            s.add(f)
            s.commit()
            return str(f.id)

    def get_files(self, doc_id: str, zone: str | None = None) -> list[dict]:
        """获取文档的附件列表，可按 zone 筛选。"""
        with Session() as s:
            q = s.query(File).filter(File.doc_id == uuid.UUID(doc_id))
            if zone:
                q = q.filter(File.zone == zone)
            return [r.to_dict() for r in q.order_by(File.created_at.asc()).all()]


# ══════════════════════════════════════════════════════════════
# 6. 快捷入口：直接 python db.py 则初始化表结构
# ══════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("初始化表结构…", flush=True)
    init_db()
    print("✅ documents / logs / files 三张表就绪", flush=True)
