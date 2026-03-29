"""
api.py — FastAPI REST 接口（工单系统原型后端）
═══════════════════════════════════════════════════════════
基于 db.py 的 DocStore 暴露完整 REST API。

端点概览：
  POST   /api/docs                 创建文档
  POST   /api/docs/bulk            批量创建
  GET    /api/docs/:id             读取单条
  PATCH  /api/docs/:id             局部更新 body
  PUT    /api/docs/:id             整体更新
  DELETE /api/docs/:id             删除文档（含关联日志+附件）
  POST   /api/docs/query           条件查询
  GET    /api/docs/count            统计
  POST   /api/docs/:id/logs        写入操作日志
  GET    /api/docs/:id/logs        读取操作日志
  POST   /api/docs/:id/files       写入附件元信息
  GET    /api/docs/:id/files       读取附件列表
  GET    /api/health               健康检查

启动方式：
  cd testdb
  /Users/wenshaoyang/miniforge3/bin/python3.10 scripts/api.py
  # 或
  /Users/wenshaoyang/miniforge3/bin/python3.10 -m uvicorn scripts.api:app --reload --port 8000

CORS 已全开，前端可直接从 file:// 或 localhost 调用。
"""

from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from db import DocStore, init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """启动时初始化表结构，带重试以适配 PolarDB 冷却期。"""
    for attempt in range(3):
        try:
            init_db()
            print("  ✅ 数据库表就绪", flush=True)
            break
        except Exception as e:
            if attempt == 2:
                print(f"  ⚠️  init_db 失败，将在首次请求时重试：{str(e)[:100]}", flush=True)
            else:
                wait = 5 * (attempt + 1)
                print(f"  ⏳ 数据库连接重试（{attempt+1}/3，等 {wait}s）…", flush=True)
                time.sleep(wait)
    yield


# ══════════════════════════════════════════════════════════════
# FastAPI 实例
# ══════════════════════════════════════════════════════════════
app = FastAPI(
    title="小审工单系统 API",
    description="基于 SQLAlchemy + JSONB 的文档存储 REST 接口",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

store = DocStore()


# ══════════════════════════════════════════════════════════════
# Pydantic 模型
# ══════════════════════════════════════════════════════════════
class DocCreate(BaseModel):
    type: str = Field(..., description="文档类型（work_order / user_profile / schedule / message / config …）")
    title: str = Field(..., description="标题")
    body: dict = Field(default_factory=dict, description="JSONB 业务主体")
    tags: list[str] = Field(default_factory=list, description="标签数组")

class DocBulkCreate(BaseModel):
    items: list[DocCreate]

class DocPatch(BaseModel):
    merge_body: dict = Field(..., description="要合并进 body 的字段")

class DocUpdate(BaseModel):
    title: str | None = None
    body: dict | None = None
    tags: list[str] | None = None

class DocQuery(BaseModel):
    type: str = Field(..., description="文档类型")
    body_match: dict | None = Field(None, description="JSONB @> 包含查询")
    body_path: list[str] | None = Field(None, description="[path, value] 路径查询")
    tags_contain: list[str] | None = Field(None, description="标签包含")
    title_like: str | None = Field(None, description="标题模糊搜索")
    fulltext: str | None = Field(None, description="全文检索关键词")
    order_desc: bool = True
    limit: int = Field(50, ge=1, le=500)
    offset: int = Field(0, ge=0)

class LogCreate(BaseModel):
    action: str
    actor: str
    data: dict = Field(default_factory=dict)

class FileCreate(BaseModel):
    filename: str
    zone: str = "default"
    uploader: str = ""
    size_bytes: str | None = None
    mime_type: str | None = None
    storage_url: str | None = None
    data: dict = Field(default_factory=dict)


# ══════════════════════════════════════════════════════════════
# 文档 CRUD（固定路径在前，动态 {doc_id} 在后）
# ══════════════════════════════════════════════════════════════
@app.post("/api/docs", status_code=201)
def create_doc(req: DocCreate):
    doc_id = store.create(req.type, req.title, body=req.body, tags=req.tags)
    return {"id": doc_id}


@app.post("/api/docs/bulk", status_code=201)
def bulk_create_docs(req: DocBulkCreate):
    ids = store.bulk_create([it.model_dump() for it in req.items])
    return {"ids": ids, "count": len(ids)}


@app.post("/api/docs/query")
def query_docs(req: DocQuery):
    body_path = None
    if req.body_path and len(req.body_path) == 2:
        body_path = (req.body_path[0], req.body_path[1])
    rows = store.query(
        req.type,
        body_match=req.body_match,
        body_path=body_path,
        tags_contain=req.tags_contain,
        title_like=req.title_like,
        fulltext=req.fulltext,
        order_desc=req.order_desc,
        limit=req.limit,
        offset=req.offset,
    )
    return {"items": rows, "count": len(rows)}


@app.get("/api/docs/count")
def count_docs(
    type: str | None = Query(None),
    body_match: str | None = Query(None, description="JSON 字符串"),
):
    import json
    bm = json.loads(body_match) if body_match else None
    return {"count": store.count(type, body_match=bm)}


@app.get("/api/docs/{doc_id}")
def get_doc(doc_id: str):
    doc = store.get(doc_id)
    if not doc:
        raise HTTPException(404, "文档不存在")
    return doc


@app.patch("/api/docs/{doc_id}")
def patch_doc(doc_id: str, req: DocPatch):
    result = store.patch(doc_id, req.merge_body)
    if not result:
        raise HTTPException(404, "文档不存在")
    return result


@app.put("/api/docs/{doc_id}")
def update_doc(doc_id: str, req: DocUpdate):
    fields = {k: v for k, v in req.model_dump().items() if v is not None}
    if not fields:
        raise HTTPException(400, "未提供更新字段")
    result = store.update(doc_id, **fields)
    if not result:
        raise HTTPException(404, "文档不存在")
    return result


@app.delete("/api/docs/{doc_id}")
def delete_doc(doc_id: str):
    ok = store.delete(doc_id)
    if not ok:
        raise HTTPException(404, "文档不存在")
    return {"deleted": True}


# ══════════════════════════════════════════════════════════════
# 操作日志
# ══════════════════════════════════════════════════════════════
@app.post("/api/docs/{doc_id}/logs", status_code=201)
def create_log(doc_id: str, req: LogCreate):
    log_id = store.add_log(doc_id, req.action, req.actor, data=req.data)
    return {"id": log_id}


@app.get("/api/docs/{doc_id}/logs")
def get_logs(doc_id: str, limit: int = Query(100, ge=1, le=1000)):
    return {"items": store.get_logs(doc_id, limit=limit)}


# ══════════════════════════════════════════════════════════════
# 文件附件
# ══════════════════════════════════════════════════════════════
@app.post("/api/docs/{doc_id}/files", status_code=201)
def create_file(doc_id: str, req: FileCreate):
    file_id = store.add_file(
        doc_id, req.filename, zone=req.zone, uploader=req.uploader,
        size_bytes=req.size_bytes, mime_type=req.mime_type,
        storage_url=req.storage_url, data=req.data,
    )
    return {"id": file_id}


@app.get("/api/docs/{doc_id}/files")
def get_files(doc_id: str, zone: str | None = Query(None)):
    return {"items": store.get_files(doc_id, zone=zone)}


# ══════════════════════════════════════════════════════════════
# 健康检查
# ══════════════════════════════════════════════════════════════
@app.get("/api/health")
def health():
    try:
        total = store.count()
        return {"status": "ok", "total_documents": total}
    except Exception as e:
        return {"status": "error", "detail": str(e)[:200]}


# ══════════════════════════════════════════════════════════════
# 启动入口
# ══════════════════════════════════════════════════════════════
if __name__ == "__main__":
    import uvicorn
    print("🚀 启动小审工单系统 API …", flush=True)
    print("   http://localhost:8000", flush=True)
    print("   http://localhost:8000/docs  ← Swagger UI", flush=True)
    uvicorn.run(app, host="0.0.0.0", port=8000)
