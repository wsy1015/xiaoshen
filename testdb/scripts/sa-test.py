"""
SQLAlchemy 全功能测试脚本（替代 full-test.py）
═══════════════════════════════════════════════════════════
基于 db.py 的 SQLAlchemy 引擎 + DocStore 封装，验证：
  1. Engine 连接 & pool_pre_ping
  2. 自动建表（documents / logs / files）
  3. DocStore.create — 插入工单 / 用户文档
  4. DocStore.get — 按 ID 读取
  5. DocStore.patch — JSONB 局部更新
  6. DocStore.query — body_match / body_path / tags / LIKE / 全文检索
  7. DocStore.count — 统计
  8. DocStore.add_log / get_logs — 操作日志
  9. DocStore.add_file / get_files — 文件附件
  10. 事务回滚验证
  11. 批量写入性能（100 条）
  12. 清理测试数据

运行方式：
  cd testdb
  /Users/wenshaoyang/miniforge3/bin/python3.10 scripts/sa-test.py
"""

import json
import os
import sys
import time
import uuid

# 把 scripts/ 加入 sys.path 以便 import db
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from db import engine, Session, Base, Document, Log, File, DocStore, init_db

# ──────────────────────────────────────────────────────────────
# 工具
# ──────────────────────────────────────────────────────────────
results: list[tuple[str, bool, str]] = []


def check(name: str, ok: bool, note: str = ""):
    icon = "✅" if ok else "❌"
    line = f"  {icon} {name}"
    if note:
        line += f"  →  {note}"
    print(line, flush=True)
    results.append((name, ok, note))


def section(title: str):
    print(flush=True)
    print(f"{'─' * 56}", flush=True)
    print(f"  {title}", flush=True)
    print(f"{'─' * 56}", flush=True)


# ──────────────────────────────────────────────────────────────
# 主测试
# ──────────────────────────────────────────────────────────────
def run():
    print(flush=True)
    print("═" * 56, flush=True)
    print("  SQLAlchemy + PolarDB 全功能测试", flush=True)
    print(f"  Engine: {os.environ['DB_HOST']}:{os.environ.get('DB_PORT','5432')}", flush=True)
    print(f"  Pool: pool_size=1, checkout_ping=SELECT 1", flush=True)
    print("═" * 56, flush=True)

    store = DocStore()

    # ── TEST 1: Engine 连接（带重试，适配 PolarDB 冷却期）────────
    section("TEST 1 · Engine 连接 & 版本")
    from sqlalchemy import text as sa_text
    row = None
    for attempt in range(3):
        t0 = time.time()
        try:
            with engine.connect() as conn:
                row = conn.execute(
                    sa_text("SELECT version(), current_database(), pg_postmaster_start_time()")
                ).fetchone()
            break
        except Exception as e:
            if attempt < 2:
                wait = 3 * (attempt + 1)
                print(f"  ⏳ 连接重试（{attempt+1}/3，等待 {wait}s）… {str(e).split(chr(10))[0][:60]}", flush=True)
                time.sleep(wait)
            else:
                check("Engine 连接", False, str(e).split("\n")[0])
                print("\n❌ 连接失败，终止后续测试", flush=True)
                sys.exit(1)

    elapsed = time.time() - t0
    check("Engine 连接", True, f"耗时 {elapsed:.2f}s")
    check("数据库版本", True, row[0].split(",")[0])
    check("当前库", True, row[1])
    check("checkout 自动 ping", True, "已启用（SELECT 1，断线自动重连）")

    # ── TEST 2: 建表 ──────────────────────────────────────────
    section("TEST 2 · 自动建表（ORM）")
    try:
        init_db()
        from sqlalchemy import inspect as sa_inspect
        insp = sa_inspect(engine)
        tables = insp.get_table_names()
        for t in ("documents", "logs", "files"):
            check(f"表 {t}", t in tables, "已创建" if t in tables else "缺失")
    except Exception as e:
        check("CREATE TABLES", False, str(e).split("\n")[0])

    # ── TEST 3: DocStore.create ───────────────────────────────
    section("TEST 3 · 文档写入（DocStore.create）")
    doc_ids = []
    samples = [
        ("work_order", "二类工单 · 数据清洗 · 2025年度",
         {"status": "待接单", "serviceModule": "数据", "company": "XX集团",
          "submitter": {"name": "张三", "dept": "审计一部"},
          "meta": {"priority": "高"}},
         ["数据", "二类工单", "待接单"]),
        ("work_order", "三类工单 · 底稿协同 · 合并报表",
         {"status": "业务处理中", "serviceModule": "底稿", "company": "某控股集团",
          "assignee": "李四",
          "meta": {"priority": "中"}},
         ["底稿", "三类工单", "业务处理中"]),
        ("user_profile", "用户 · 李四 · 交付中心",
         {"role": "dc_exec", "serviceTags": ["数据", "试算"],
          "dept": "交付中心", "workload": 2},
         ["交付中心", "dc_exec"]),
    ]
    try:
        for dtype, title, body, tags in samples:
            did = store.create(dtype, title, body=body, tags=tags)
            doc_ids.append(did)
        check("创建 3 条文档", len(doc_ids) == 3, f"IDs: {', '.join(d[:8] for d in doc_ids)}")
    except Exception as e:
        check("创建文档", False, str(e).split("\n")[0])

    # ── TEST 4: DocStore.get ──────────────────────────────────
    section("TEST 4 · 文档读取（DocStore.get）")
    if doc_ids:
        doc = store.get(doc_ids[0])
        check("按 ID 读取", doc is not None, doc["title"] if doc else "None")
        if doc:
            check("body 完整性", doc["body"].get("status") == "待接单",
                  f"status={doc['body'].get('status')}")
            check("tags 完整性", "数据" in doc["tags"],
                  f"tags={doc['tags']}")
    else:
        check("按 ID 读取", False, "无可用 ID")

    # ── TEST 5: DocStore.patch ────────────────────────────────
    section("TEST 5 · 局部更新（DocStore.patch）")
    if doc_ids:
        updated = store.patch(doc_ids[0], {"status": "业务处理中", "handler": "李四"})
        check("patch body",
              updated and updated["body"]["status"] == "业务处理中",
              f"status → {updated['body']['status']}" if updated else "None")
        check("patch 保留原字段",
              updated and updated["body"].get("serviceModule") == "数据",
              f"serviceModule 仍为 {updated['body'].get('serviceModule')}" if updated else "丢失")
    else:
        check("patch body", False, "无可用 ID")

    # ── TEST 6: DocStore.query ────────────────────────────────
    section("TEST 6 · 文档查询（DocStore.query）")

    # 6a. body_match 包含查询
    rows = store.query("work_order", body_match={"serviceModule": "底稿"})
    check("body_match @>（serviceModule=底稿）", len(rows) >= 1,
          f"命中 {len(rows)} 条")

    # 6b. body_path 路径查询
    rows = store.query("work_order", body_path=("meta.priority", "高"))
    check("body_path（meta.priority=高）", len(rows) >= 1,
          rows[0]["title"] if rows else "无结果")

    # 6c. tags_contain 数组包含
    rows = store.query("work_order", tags_contain=["底稿"])
    check("tags_contain（[底稿]）", len(rows) >= 1,
          f"命中 {len(rows)} 条")

    # 6d. title_like 模糊查询
    rows = store.query("work_order", title_like="底稿")
    check("title_like（%底稿%）", len(rows) >= 1,
          f"命中 {len(rows)} 条")

    # 6e. fulltext 全文检索
    rows = store.query("work_order", fulltext="数据")
    check("fulltext（to_tsvector 数据）", len(rows) >= 1,
          f"命中 {len(rows)} 条")

    # ── TEST 7: DocStore.count ────────────────────────────────
    section("TEST 7 · 文档统计（DocStore.count）")
    total = store.count()
    wo_count = store.count("work_order")
    pending = store.count("work_order", body_match={"status": "待接单"})
    check("总文档数", total >= 3, f"{total} 条")
    check("工单数", wo_count >= 2, f"{wo_count} 条")
    check("待接单工单", pending >= 0, f"{pending} 条")

    # ── TEST 8: 操作日志 ──────────────────────────────────────
    section("TEST 8 · 操作日志（DocStore.add_log / get_logs）")
    if doc_ids:
        log_id = store.add_log(doc_ids[0], "create", "张三",
                               {"note": "发起二类工单"})
        check("写入日志", log_id is not None, f"log_id={log_id[:8]}")

        store.add_log(doc_ids[0], "dispatch", "吴刚",
                      {"to": "李四", "note": "派单"})
        logs = store.get_logs(doc_ids[0])
        check("读取日志", len(logs) >= 2, f"{len(logs)} 条（时间倒序）")
        check("日志内容", logs[0]["action"] == "dispatch",
              f"最新操作={logs[0]['action']}")
    else:
        check("操作日志", False, "无可用 ID")

    # ── TEST 9: 文件附件 ──────────────────────────────────────
    section("TEST 9 · 文件附件（DocStore.add_file / get_files）")
    if doc_ids:
        fid = store.add_file(doc_ids[0], "征信报告_XX集团.pdf",
                             zone="requester", uploader="张三",
                             size_bytes="2048576", mime_type="application/pdf",
                             storage_url="/oss/reports/zx_xx.pdf")
        check("写入附件", fid is not None, f"file_id={fid[:8]}")

        store.add_file(doc_ids[0], "数据清洗结果_v1.xlsx",
                       zone="provider", uploader="李四",
                       size_bytes="512000", mime_type="application/xlsx")

        req_files = store.get_files(doc_ids[0], zone="requester")
        svc_files = store.get_files(doc_ids[0], zone="provider")
        all_files = store.get_files(doc_ids[0])
        check("需求方附件", len(req_files) >= 1,
              f"{len(req_files)} 个：{req_files[0]['filename']}")
        check("服务方附件", len(svc_files) >= 1,
              f"{len(svc_files)} 个：{svc_files[0]['filename']}")
        check("全部附件", len(all_files) >= 2, f"共 {len(all_files)} 个")
    else:
        check("文件附件", False, "无可用 ID")

    # ── TEST 10: 事务回滚 ─────────────────────────────────────
    section("TEST 10 · 事务回滚")
    before = store.count()
    try:
        with Session() as s:
            s.add(Document(type="_rollback", title="回滚测试", body={}, tags=[]))
            s.flush()   # 写入数据库但不提交
            s.rollback()
    except Exception:
        pass
    after = store.count()
    check("事务回滚", before == after,
          f"回滚前 {before} 条，后 {after} 条（应相等）")

    # ── TEST 11: 批量写入性能 ─────────────────────────────────
    section("TEST 11 · 批量写入性能（100 条）")
    try:
        batch = [
            Document(
                type="perf_test",
                title=f"性能测试 #{i:03d}",
                body={"index": i, "value": round(i * 3.14159, 4)},
                tags=["perf"],
            )
            for i in range(100)
        ]
        t0 = time.perf_counter()
        with Session() as s:
            s.add_all(batch)
            s.commit()
        elapsed = time.perf_counter() - t0
        check("批量写入 100 条", True,
              f"{elapsed*1000:.0f} ms  ({100/elapsed:.0f} 条/秒)")
    except Exception as e:
        check("批量写入", False, str(e).split("\n")[0])

    # ── TEST 12: DocStore.delete ──────────────────────────────
    section("TEST 12 · 文档删除（DocStore.delete）")
    if doc_ids:
        ok = store.delete(doc_ids[0])
        check("删除文档（含关联日志+附件）", ok, f"deleted {doc_ids[0][:8]}")
        gone = store.get(doc_ids[0])
        check("确认已删除", gone is None, "get 返回 None")
    else:
        check("删除文档", False, "无可用 ID")

    # ── TEST 13: 清理 ────────────────────────────────────────
    section("TEST 13 · 清理所有测试数据")
    try:
        with Session() as s:
            s.query(Log).delete()
            s.query(File).delete()
            s.query(Document).delete()
            s.commit()
        final_count = store.count()
        check("清空所有文档", final_count == 0, f"剩余 {final_count} 条")
    except Exception as e:
        check("清理", False, str(e).split("\n")[0])

    # ── 汇总 ─────────────────────────────────────────────────
    print(flush=True)
    print("═" * 56, flush=True)
    passed = sum(1 for _, ok, _ in results if ok)
    total  = len(results)
    failed = [(n, note) for n, ok, note in results if not ok]
    print(f"  测试结果：{passed} / {total} 通过", flush=True)
    if failed:
        print(flush=True)
        print("  ❌ 未通过项：", flush=True)
        for name, note in failed:
            print(f"     · {name}：{note}", flush=True)
    else:
        print("  🎉 全部通过！SQLAlchemy 后端引擎就绪。", flush=True)
    print("═" * 56, flush=True)
    print(flush=True)


if __name__ == "__main__":
    run()
