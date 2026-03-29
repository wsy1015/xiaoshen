"""
PolarDB 全功能测试脚本  (xiaoshen 项目)
─────────────────────────────────────────────────────────
测试范围：
  1. 基础连接 & 版本信息
  2. 内置函数（gen_random_uuid / now）
  3. JSONB 文档存储（CREATE TABLE / INSERT / UPDATE / DELETE）
  4. JSONB 路径查询 / 包含查询（@>）
  5. 数组字段查询（tags @>）
  6. 全文检索（to_tsvector / to_tsquery）
  7. 事务与回滚
  8. execute_batch 批量写入性能（100 条）
  9. 清理测试数据

PolarDB 特殊说明（已在此脚本中全部处理）：
  ① sslmode='disable' 必须设置（否则 SSL 握手与 psycopg2 不兼容）
  ② 不设 application_name / keepalives（会被此实例拒绝）
  ③ PolarDB 在某些错误后主动关闭连接，脚本全程复用单一连接，
     仅在连接断开时才重连（带指数退避），避免触发频率限制。
  ④ 不访问 pg_extension、pgcrypto 等需要 SUPERUSER 权限的对象。

运行方式：
  cd testdb
  /Users/wenshaoyang/miniforge3/bin/python3.10 scripts/full-test.py
"""

import json
import os
import sys
import time

# ──────────────────────────────────────────────────────────────
# 读取 .env
# ──────────────────────────────────────────────────────────────
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ENV_PATH = os.path.join(ROOT_DIR, ".env")


def load_env():
    if not os.path.exists(ENV_PATH):
        print("❌ 未找到 .env 文件")
        sys.exit(1)
    # 清理可能干扰的 libpq 原生环境变量，以 .env 为唯一来源
    for pg_var in ["PGHOST", "PGPORT", "PGUSER", "PGPASSWORD",
                   "PGDATABASE", "PGSSLMODE", "PGAPPNAME"]:
        os.environ.pop(pg_var, None)
    with open(ENV_PATH, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ[k.strip()] = v.strip()


load_env()

try:
    import psycopg2
    import psycopg2.extras
except ImportError:
    print("❌ 未找到 psycopg2，请用 conda Python：")
    print("   /Users/wenshaoyang/miniforge3/bin/python3.10 scripts/full-test.py")
    sys.exit(1)

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
    print(f"{'─' * 52}", flush=True)
    print(f"  {title}", flush=True)
    print(f"{'─' * 52}", flush=True)


# ──────────────────────────────────────────────────────────────
# 连接管理：全程复用单一连接
# ──────────────────────────────────────────────────────────────
_conn = None   # 全局连接


def _make_conn():
    return psycopg2.connect(
        host=os.environ["DB_HOST"],
        port=int(os.environ.get("DB_PORT", "5432")),
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        dbname=os.environ.get("DB_NAME", "xiaoshen"),
        sslmode="disable",
    )


def get_conn():
    """
    返回活跃连接。若连接已关闭则重连（最多 3 次，指数退避）。
    全程尽量复用同一连接以避免 PolarDB 的连接频率限制。
    """
    global _conn
    if _conn is not None:
        try:
            if _conn.closed == 0:
                return _conn
        except Exception:
            pass
        try:
            _conn.close()
        except Exception:
            pass
        _conn = None

    for attempt in range(3):
        try:
            _conn = _make_conn()
            return _conn
        except Exception as e:
            if attempt == 2:
                raise
            wait = 2 ** (attempt + 1)
            print(f"  ⏳ 重连中（{attempt+1}/3，等待 {wait}s）…", flush=True)
            time.sleep(wait)


def safe_exec(sql, params=None, fetch="one", commit=False):
    """
    执行一条 SQL，若连接断开则自动重连后重试一次。
    返回 (ok, result, error_msg)。
    """
    for attempt in range(2):
        try:
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(sql, params)
            result = None
            if fetch == "one":
                result = cur.fetchone()
            elif fetch == "all":
                result = cur.fetchall()
            if commit:
                conn.commit()
            return True, result, ""
        except Exception as e:
            err = str(e).split("\n")[0]
            # 标记连接为断开
            global _conn
            _conn = None
            if attempt == 1:
                return False, None, err
            time.sleep(2)  # 等待 PolarDB 冷却后重连
    return False, None, "未知错误"


# ──────────────────────────────────────────────────────────────
# 主测试
# ──────────────────────────────────────────────────────────────
def run():
    TABLE = "_db_test_docs"

    print(flush=True)
    print("═" * 52, flush=True)
    print("  PolarDB 全功能测试", flush=True)
    print(f"  {os.environ['DB_HOST']}:{os.environ.get('DB_PORT','5432')}", flush=True)
    print("═" * 52, flush=True)

    # ── TEST 1: 基础连接 ──────────────────────────────────────
    section("TEST 1 · 基础连接 & 版本")
    t0 = time.time()
    try:
        conn = _make_conn()   # 用原始函数，以便捕获耗时
        global _conn
        _conn = conn
        elapsed = time.time() - t0
        cur = conn.cursor()
        cur.execute("SELECT version(), current_database(), pg_postmaster_start_time()")
        version, dbname, start_time = cur.fetchone()
        check("TCP 连接", True, f"耗时 {elapsed:.2f}s")
        check("数据库版本", True, version.split(",")[0])
        check("当前库", True, dbname)
        check("启动时间", True, str(start_time)[:19])
    except Exception as e:
        check("TCP 连接", False, str(e).split("\n")[0])
        print("\n❌ 连接失败，终止后续测试", flush=True)
        sys.exit(1)

    # ── TEST 2: 内置函数 ─────────────────────────────────────
    section("TEST 2 · 内置函数检测")
    ok, r, err = safe_exec("SELECT gen_random_uuid()")
    check("gen_random_uuid()", ok, f"示例：{r[0]}" if ok else err)

    ok, r, err = safe_exec("SELECT now()")
    check("now()", ok, str(r[0])[:19] if ok else err)

    ok, r, err = safe_exec(
        "SELECT to_tsvector('simple', 'hello world') @@ to_tsquery('simple', 'hello')"
    )
    check("to_tsvector / to_tsquery", ok, "内置全文可用" if ok else err)

    # ── TEST 3: 建表 ──────────────────────────────────────────
    section("TEST 3 · 建表（JSONB 文档存储）")

    ok, _, err = safe_exec(f"""
        CREATE TABLE IF NOT EXISTS {TABLE} (
            id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
            type        TEXT        NOT NULL,
            title       TEXT        NOT NULL,
            body        JSONB       NOT NULL DEFAULT '{{}}',
            tags        TEXT[]      DEFAULT ARRAY[]::TEXT[],
            created_at  TIMESTAMPTZ DEFAULT now(),
            updated_at  TIMESTAMPTZ DEFAULT now()
        )""", commit=True, fetch=None)
    check("CREATE TABLE", ok, err if not ok else TABLE)

    ok, _, err = safe_exec(
        f"CREATE INDEX IF NOT EXISTS idx_{TABLE}_type ON {TABLE}(type)",
        commit=True, fetch=None
    )
    check("CREATE INDEX B-tree（type）", ok, err if not ok else "可用")

    ok, _, err = safe_exec(
        f"CREATE INDEX IF NOT EXISTS idx_{TABLE}_body ON {TABLE} USING GIN(body)",
        commit=True, fetch=None
    )
    check("CREATE INDEX GIN（body JSONB）", ok, err if not ok else "可用（@> 加速）")

    ok, _, err = safe_exec(
        f"CREATE INDEX IF NOT EXISTS idx_{TABLE}_tags ON {TABLE} USING GIN(tags)",
        commit=True, fetch=None
    )
    check("CREATE INDEX GIN（tags[]）", ok, err if not ok else "可用（@> 加速）")

    # ── TEST 4: INSERT ────────────────────────────────────────
    section("TEST 4 · 文档写入（INSERT）")
    sample_docs = [
        ("work_order", "二类工单 · 数据清洗 · 2025年度",
         json.dumps({"status":"待接单","serviceModule":"数据","company":"XX集团",
                     "meta":{"priority":"高"}}, ensure_ascii=False),
         ["数据","二类工单","待接单"]),
        ("work_order", "三类工单 · 底稿协同 · 合并报表",
         json.dumps({"status":"业务处理中","serviceModule":"底稿","company":"某控股集团",
                     "meta":{"priority":"中"}}, ensure_ascii=False),
         ["底稿","三类工单","业务处理中"]),
        ("user_profile", "用户 · 李四 · 交付中心",
         json.dumps({"role":"dc_exec","serviceTags":["数据","试算"]}, ensure_ascii=False),
         ["交付中心","dc_exec"]),
    ]
    doc_ids = []
    all_ok = True
    for d in sample_docs:
        ok, r, err = safe_exec(
            f"INSERT INTO {TABLE} (type, title, body, tags) VALUES (%s,%s,%s,%s) RETURNING id",
            d, fetch="one", commit=True
        )
        if ok:
            doc_ids.append(r[0])
        else:
            all_ok = False
            break
    check("批量 INSERT", all_ok and len(doc_ids) == 3,
          f"写入 {len(doc_ids)} 条" if all_ok else err)

    # ── TEST 5: SELECT ────────────────────────────────────────
    section("TEST 5 · 文档查询（SELECT & JSONB）")

    ok, r, err = safe_exec(f"SELECT COUNT(*) FROM {TABLE}", fetch="one")
    check("全量 COUNT", ok, f"共 {r[0]} 条" if ok else err)

    ok, r, err = safe_exec(
        f"SELECT title FROM {TABLE} WHERE body->>'status' = %s", ("待接单",), fetch="all"
    )
    check("JSONB 路径查询（->>'status'）", ok and len(r) >= 1,
          f"命中 {len(r)} 条" if ok else err)

    ok, r, err = safe_exec(
        f"SELECT title FROM {TABLE} WHERE body->'meta'->>'priority' = %s", ("高",), fetch="all"
    )
    check("嵌套 JSONB（->'meta'->>'priority'）", ok and len(r) >= 1,
          r[0][0] if (ok and r) else err or "无结果")

    ok, r, err = safe_exec(
        f"SELECT title FROM {TABLE} WHERE tags @> %s", (["数据"],), fetch="all"
    )
    check("数组 GIN 查询（tags @> '{数据}'）", ok and len(r) >= 1,
          f"命中 {len(r)} 条" if ok else err)

    ok, r, err = safe_exec(
        f"SELECT title FROM {TABLE} WHERE body @> %s",
        (json.dumps({"serviceModule":"底稿"}),), fetch="all"
    )
    check("JSONB 包含查询（@>）", ok and len(r) >= 1,
          r[0][0] if (ok and r) else err or "无结果")

    # ── TEST 6: UPDATE ────────────────────────────────────────
    section("TEST 6 · 文档更新（jsonb_set 局部更新）")
    if doc_ids:
        ok, r, err = safe_exec(
            f"""UPDATE {TABLE}
                SET body = jsonb_set(body, '{{status}}', '"业务处理中"'),
                    updated_at = now()
                WHERE id = %s
                RETURNING body->>'status'""",
            (str(doc_ids[0]),), fetch="one", commit=True
        )
        check("jsonb_set 局部更新", ok and r and r[0] == "业务处理中",
              f"status → {r[0]}" if ok else err)
    else:
        check("jsonb_set 局部更新", False, "无可用 ID（INSERT 未成功）")

    # ── TEST 7: 全文检索 ──────────────────────────────────────
    section("TEST 7 · 全文检索")
    ok, r, err = safe_exec(
        f"SELECT title FROM {TABLE} WHERE title LIKE %s", ("%底稿%",), fetch="all"
    )
    check("LIKE 模糊检索（%底稿%）", ok and len(r) >= 1, f"命中 {len(r)} 条" if ok else err)

    ok, r, err = safe_exec(
        f"""SELECT title FROM {TABLE}
            WHERE to_tsvector('simple', title || ' ' || body::text)
                  @@ to_tsquery('simple', %s)""",
        ("数据",), fetch="all"
    )
    check("全文检索（to_tsvector simple）", ok and len(r) >= 1,
          f"命中 {len(r)} 条" if ok else err)

    # ── TEST 8: 事务回滚 ──────────────────────────────────────
    section("TEST 8 · 事务 & 回滚")
    ok, r, err = safe_exec(f"SELECT COUNT(*) FROM {TABLE}", fetch="one")
    before = r[0] if ok else 0
    # 插入但不提交，然后回滚
    ok2, _, err2 = safe_exec(
        f"INSERT INTO {TABLE} (type, title, body) VALUES (%s,%s,%s)",
        ("_rollback_test", "回滚测试", "{}"), fetch=None, commit=False
    )
    if ok2:
        try:
            get_conn().rollback()
        except Exception:
            pass
    ok3, r3, err3 = safe_exec(f"SELECT COUNT(*) FROM {TABLE}", fetch="one")
    after = r3[0] if ok3 else -1
    check("事务回滚", ok and ok3 and before == after,
          f"回滚前 {before} 条，后 {after} 条" if ok3 else err3)

    # ── TEST 9: 批量写入性能 ──────────────────────────────────
    section("TEST 9 · 批量写入性能（100 条）")
    batch = [
        ("perf_test", f"性能测试 #{i:03d}",
         json.dumps({"index": i, "value": round(i * 3.14159, 4)}, ensure_ascii=False),
         ["perf"])
        for i in range(100)
    ]
    try:
        conn = get_conn()
        cur = conn.cursor()
        t0 = time.perf_counter()
        psycopg2.extras.execute_batch(
            cur,
            f"INSERT INTO {TABLE} (type, title, body, tags) VALUES (%s,%s,%s,%s)",
            batch, page_size=50,
        )
        conn.commit()
        elapsed = time.perf_counter() - t0
        check("execute_batch 100 条", True,
              f"{elapsed*1000:.0f} ms  ({100/elapsed:.0f} 条/秒)")
    except Exception as e:
        try:
            get_conn().rollback()
        except Exception:
            pass
        check("批量写入", False, str(e).split("\n")[0])

    # ── TEST 10: 清理 ─────────────────────────────────────────
    section("TEST 10 · 清理测试数据")
    ok, _, err = safe_exec(f"DROP TABLE IF EXISTS {TABLE}", commit=True, fetch=None)
    check("DROP TABLE", ok, TABLE if ok else err)

    try:
        if _conn:
            _conn.close()
    except Exception:
        pass

    # ── 汇总 ──────────────────────────────────────────────────
    print(flush=True)
    print("═" * 52, flush=True)
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
        print("  🎉 全部通过！PolarDB 可正常用于后端原型开发。", flush=True)
    print("═" * 52, flush=True)
    print(flush=True)


if __name__ == "__main__":
    run()
