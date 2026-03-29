"""
migrate.py — 将 JS Mock 数据迁移到 PolarDB documents 表
═══════════════════════════════════════════════════════════
数据来源：gd.js / gd2.js 中的全局常量
写入目标：documents / logs / files 三张表

运行方式：
  cd testdb
  /Users/wenshaoyang/miniforge3/bin/python3.10 scripts/migrate.py

幂等设计：先清空再写入，可安全重复运行。
"""

from __future__ import annotations

import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from db import DocStore, Session, Document, Log, File, init_db

store = DocStore()

# ══════════════════════════════════════════════════════════════
# 工具
# ══════════════════════════════════════════════════════════════
stats = {"docs": 0, "logs": 0, "files": 0}

# 工单 JS id → 数据库 UUID 映射（用于关联日志和附件）
WO_ID_MAP: dict[str, str] = {}
USER_ID_MAP: dict[str, str] = {}


def section(title: str):
    print(f"\n{'─' * 50}", flush=True)
    print(f"  {title}", flush=True)
    print(f"{'─' * 50}", flush=True)


# ══════════════════════════════════════════════════════════════
# 1. 用户数据（GD_USERS + GD_SERVICE_TAGS + GD_ROLE_MOCKS）
# ══════════════════════════════════════════════════════════════
GD_USERS = [
    {"id": "1",  "name": "张伟", "dept": "审计一部",    "role": "普通员工",         "workload": 5, "status": "忙碌"},
    {"id": "2",  "name": "李娜", "dept": "审计一部",    "role": "部门负责人",       "workload": 3, "status": "忙碌"},
    {"id": "3",  "name": "王强", "dept": "审计二部",    "role": "普通员工",         "workload": 2, "status": "空闲"},
    {"id": "4",  "name": "赵敏", "dept": "审计二部",    "role": "普通员工",         "workload": 4, "status": "忙碌"},
    {"id": "5",  "name": "刘洋", "dept": "质量管理部",  "role": "普通员工",         "workload": 1, "status": "空闲"},
    {"id": "6",  "name": "陈静", "dept": "技术支持部",  "role": "普通员工",         "workload": 6, "status": "忙碌"},
    {"id": "7",  "name": "杨明", "dept": "审计三部",    "role": "部门负责人",       "workload": 2, "status": "空闲"},
    {"id": "8",  "name": "周芳", "dept": "审计三部",    "role": "普通员工",         "workload": 0, "status": "休假"},
    {"id": "9",  "name": "吴刚", "dept": "技术支持部",  "role": "交付中心管理员",   "workload": 3, "status": "忙碌"},
    {"id": "10", "name": "郑云", "dept": "审计一部",    "role": "普通员工",         "workload": 3, "status": "忙碌"},
]

GD_SERVICE_TAGS = {
    "1":  {"name": "张伟", "tags": ["报告", "底稿"]},
    "2":  {"name": "李娜", "tags": ["制函", "报告"]},
    "3":  {"name": "王强", "tags": ["数据", "底稿"]},
    "4":  {"name": "赵敏", "tags": ["试算", "报告"]},
    "5":  {"name": "刘洋", "tags": ["数据", "试算"]},
    "6":  {"name": "陈静", "tags": ["制函"]},
    "7":  {"name": "杨明", "tags": ["底稿", "报告"]},
    "8":  {"name": "周芳", "tags": ["底稿"]},
    "9":  {"name": "吴刚", "tags": ["数据", "试算", "报告", "制函", "底稿"]},
    "10": {"name": "郑云", "tags": ["数据", "底稿"]},
}

GD_ROLE_MOCKS = {
    "proj_member": {"id": "3", "name": "王强", "dept": "审计二部", "role": "proj_member"},
    "proj_lead":   {"id": "2", "name": "李娜", "dept": "审计一部", "role": "proj_lead"},
    "dc_exec":     {"id": "5", "name": "刘洋", "dept": "交付中心", "role": "dc_exec"},
    "dc_reviewer": {"id": "10","name": "郑云", "dept": "交付中心", "role": "dc_reviewer"},
    "dc_admin":    {"id": "9", "name": "吴刚", "dept": "交付中心", "role": "dc_admin"},
}


def migrate_users():
    section("用户数据（10 条）")
    items = []
    for u in GD_USERS:
        uid = u["id"]
        st = GD_SERVICE_TAGS.get(uid, {})
        role_mock = None
        for rk, rv in GD_ROLE_MOCKS.items():
            if rv["id"] == uid:
                role_mock = rk
                break
        body = {
            "jsId": uid,
            "name": u["name"],
            "dept": u["dept"],
            "role": u["role"],
            "workload": u["workload"],
            "status": u["status"],
            "serviceTags": st.get("tags", []),
        }
        if role_mock:
            body["roleMock"] = role_mock
        items.append({
            "type": "user_profile",
            "title": f"用户 · {u['name']} · {u['dept']}",
            "body": body,
            "tags": [u["dept"], u["role"]] + st.get("tags", []),
        })
    ids = store.bulk_create(items)
    for i, u in enumerate(GD_USERS):
        USER_ID_MAP[u["id"]] = ids[i]
    stats["docs"] += len(ids)
    print(f"  ✅ 写入 {len(ids)} 条用户文档", flush=True)


# ══════════════════════════════════════════════════════════════
# 2. 工单数据（GD_WORK_ORDERS — gd.js 8 条 + gd2.js 补丁 2 条）
# ══════════════════════════════════════════════════════════════
STATUS_MAP = {
    "待分派": "待接单", "待处理": "待接单",
    "处理中": "业务处理中", "已解决": "待验收确认", "已驳回": "驳回修改",
}

GD_WORK_ORDERS_RAW = [
    {
        "id": "WO202603060001", "title": "XX集团2025年度财务审计报告盖章",
        "woType": "一类工单", "parentOrderId": "", "serviceModule": "报告",
        "workspace": "中国比亚迪-年报审计-2025年度-审计一部-001",
        "company": "XX集团有限公司", "firmCode": "HQ-2025-XX-88801", "reportType": "合并",
        "projectManager": "张伟", "provider": "交付中心",
        "dept": "审计一部", "submitter": "李娜", "submitTime": "2026-03-06 09:30",
        "expectedTime": "2026-03-06 17:00", "handler": "张伟",
        "status": "处理中", "priority": "紧急",
        "desc": "XX集团2025年度财务审计报告已完成，需要合伙人盖章确认，共3份正本。",
        "attachments": ["审计报告_XX集团_2025.pdf", "盖章申请表.docx"],
    },
    {
        "id": "WO202603060002", "title": "YY公司专项审计资料调取",
        "woType": "三类工单", "parentOrderId": "WO202603060001", "serviceModule": "数据",
        "workspace": "中国石化集团-年报审计-2025年度-审计二部-002",
        "company": "YY石化（上海）有限公司", "firmCode": "HQ-2025-YY-88802", "reportType": "单体",
        "projectManager": "王芳", "provider": "交付中心",
        "dept": "审计二部", "submitter": "王强", "submitTime": "2026-03-06 10:15",
        "expectedTime": "2026-03-07 12:00", "handler": "刘洋",
        "status": "待处理", "priority": "普通",
        "desc": "需要调取YY公司2023-2024年度的银行流水、合同台账及发票明细。",
        "attachments": ["资料清单.xlsx"],
    },
    {
        "id": "WO202603060003", "title": "审计管理系统登录异常",
        "woType": "三类工单", "parentOrderId": "", "serviceModule": "其他",
        "workspace": "华为技术有限公司-年报审计-2025年度-审计三部-003",
        "company": "—", "firmCode": "—", "reportType": "—",
        "projectManager": "陈刚", "provider": "交付中心",
        "dept": "技术支持部", "submitter": "陈静", "submitTime": "2026-03-06 08:45",
        "expectedTime": "2026-03-06 12:00", "handler": "吴刚",
        "status": "已解决", "priority": "特急",
        "desc": "多名员工反馈审计管理系统无法登录，提示「系统维护中」。",
        "attachments": ["错误截图.png"],
    },
    {
        "id": "WO202603060004", "title": "ZZ企业年审报告提交",
        "woType": "一类工单", "parentOrderId": "", "serviceModule": "归档",
        "workspace": "阿里巴巴集团-IPO审计-2025年度-审计一部-004",
        "company": "ZZ企业股份有限公司", "firmCode": "HQ-2025-ZZ-88803", "reportType": "合并",
        "projectManager": "刘晓", "provider": "交付中心",
        "dept": "审计三部", "submitter": "杨明", "submitTime": "2026-03-05 16:20",
        "expectedTime": "2026-03-08 18:00", "handler": "",
        "status": "待分派", "priority": "普通",
        "desc": "ZZ企业年审工作已完成，需要提交最终报告并归档。",
        "attachments": ["年审报告_ZZ企业.pdf", "工作底稿.zip"],
    },
    {
        "id": "WO202603060005", "title": "AB公司IPO专项审计启动",
        "woType": "一类工单", "parentOrderId": "", "serviceModule": "试算",
        "workspace": "阿里巴巴集团-IPO审计-2025年度-审计一部-004",
        "company": "AB科技（北京）股份有限公司", "firmCode": "HQ-2025-AB-88804", "reportType": "合并",
        "projectManager": "刘晓", "provider": "交付中心",
        "dept": "审计一部", "submitter": "李娜", "submitTime": "2026-03-05 14:00",
        "expectedTime": "2026-03-10 18:00", "handler": "郑云",
        "status": "处理中", "priority": "紧急",
        "desc": "AB公司计划IPO上市，需要进行专项审计，请安排经验丰富的审计师。",
        "attachments": ["项目启动书.pdf"],
    },
    {
        "id": "WO202603050006", "title": "CD集团合并报表报备",
        "woType": "二类工单", "parentOrderId": "WO202603060004", "serviceModule": "报告",
        "workspace": "万科企业股份有限公司-专项审计-2024年度-审计二部-005",
        "company": "CD控股集团有限公司", "firmCode": "HQ-2024-CD-88805", "reportType": "合并",
        "projectManager": "赵敏", "provider": "交付中心",
        "dept": "审计二部", "submitter": "赵敏", "submitTime": "2026-03-05 11:30",
        "expectedTime": "2026-03-06 18:00", "handler": "",
        "status": "待分派", "priority": "普通",
        "desc": "CD集团合并报表已完成，需要向监管部门报备。",
        "attachments": ["合并报表.xlsx"],
    },
    {
        "id": "WO202603050007", "title": "EF公司审计报告修改",
        "woType": "二类工单", "parentOrderId": "WO202603060005", "serviceModule": "底稿",
        "workspace": "比亚迪股份有限公司-年报审计-2024年度-审计三部-006",
        "company": "EF实业（深圳）有限公司", "firmCode": "HQ-2024-EF-88806", "reportType": "单体",
        "projectManager": "孙磊", "provider": "交付中心",
        "dept": "审计三部", "submitter": "杨明", "submitTime": "2026-03-04 15:45",
        "expectedTime": "2026-03-05 12:00", "handler": "周芳",
        "status": "已驳回", "priority": "紧急",
        "desc": "客户对初稿提出修改意见，需要重新调整部分章节。",
        "attachments": ["修改意见.docx", "初稿.pdf"],
    },
    {
        "id": "WO202603040008", "title": "GH企业税务审计资料补充",
        "woType": "三类工单", "parentOrderId": "WO202603060001", "serviceModule": "制函",
        "workspace": "中国比亚迪-年报审计-2025年度-审计一部-001",
        "company": "GH企业管理有限公司", "firmCode": "HQ-2025-GH-88807", "reportType": "单体",
        "projectManager": "张伟", "provider": "交付中心",
        "dept": "审计一部", "submitter": "张伟", "submitTime": "2026-03-04 09:00",
        "expectedTime": "2026-03-06 18:00", "handler": "李娜",
        "status": "已关闭", "priority": "普通",
        "desc": "GH企业税务审计需要补充2024年增值税申报表。",
        "attachments": [],
    },
    # gd2.js 补丁追加
    {
        "id": "WO202603120020", "title": "某集团数据清洗 · 待验收",
        "woType": "二类工单", "parentOrderId": "WO202603060001", "serviceModule": "数据",
        "workspace": "中国比亚迪-年报审计-2025年度-审计一部-001",
        "company": "XX集团有限公司", "firmCode": "HQ-2025-XX-88801", "reportType": "合并",
        "projectManager": "张伟", "provider": "交付中心",
        "dept": "审计一部", "submitter": "李娜", "submitTime": "2026-03-08 10:00",
        "expectedTime": "2026-03-15", "assignee": "刘洋", "handler": "刘洋",
        "status": "待验收确认", "priority": "普通",
        "desc": "数据清洗已完成，请项目组验收结果。",
        "attachments": ["征信报告_XX集团.pdf"],
    },
    {
        "id": "WO202603120021", "title": "某企业底稿编制 · 复核中",
        "woType": "二类工单", "parentOrderId": "", "serviceModule": "底稿",
        "workspace": "阿里巴巴集团-IPO审计-2025年度-审计一部-004",
        "company": "AB科技（北京）股份有限公司", "firmCode": "HQ-2025-AB-88804", "reportType": "合并",
        "projectManager": "刘晓", "provider": "交付中心",
        "dept": "审计一部", "submitter": "李娜", "submitTime": "2026-03-10 14:00",
        "expectedTime": "2026-03-18", "assignee": "郑云", "handler": "郑云",
        "status": "内部复核中", "priority": "紧急",
        "desc": "底稿初稿已提交，复核人正在内部审核中。",
        "attachments": [],
    },
]


def migrate_work_orders():
    section("工单数据（10 条）")
    items = []
    for wo in GD_WORK_ORDERS_RAW:
        status = STATUS_MAP.get(wo["status"], wo["status"])
        body = {
            "jsId":           wo["id"],
            "woType":         wo["woType"],
            "parentOrderId":  wo.get("parentOrderId", ""),
            "serviceModule":  wo["serviceModule"],
            "workspace":      wo["workspace"],
            "company":        wo["company"],
            "firmCode":       wo["firmCode"],
            "reportType":     wo["reportType"],
            "projectManager": wo["projectManager"],
            "provider":       wo.get("provider", "交付中心"),
            "dept":           wo["dept"],
            "submitter":      wo["submitter"],
            "submitTime":     wo["submitTime"],
            "expectedTime":   wo["expectedTime"],
            "assignee":       wo.get("assignee", wo.get("handler", "")),
            "handler":        wo.get("handler", ""),
            "status":         status,
            "priority":       wo["priority"],
            "desc":           wo["desc"],
        }
        items.append({
            "type": "work_order",
            "title": wo["title"],
            "body": body,
            "tags": [wo["woType"], wo["serviceModule"], status, wo["priority"]],
        })
    ids = store.bulk_create(items)
    for i, wo in enumerate(GD_WORK_ORDERS_RAW):
        WO_ID_MAP[wo["id"]] = ids[i]
    stats["docs"] += len(ids)
    print(f"  ✅ 写入 {len(ids)} 条工单文档", flush=True)


# ══════════════════════════════════════════════════════════════
# 3. 操作日志（GD_LOGS — gd.js + gd2.js）
# ══════════════════════════════════════════════════════════════
GD_LOGS = {
    "WO202603060001": [
        {"action": "提交工单", "op": "李娜", "content": "创建工单：XX集团2025年度财务审计报告盖章", "time": "2026-03-06 09:30:00"},
        {"action": "派单",     "op": "吴刚", "content": "将工单派发给张伟处理",                     "time": "2026-03-06 09:35:00"},
        {"action": "确认接收", "op": "张伟", "content": "已确认接收工单",                           "time": "2026-03-06 09:40:00"},
        {"action": "开始处理", "op": "张伟", "content": "已联系合伙人办公室，正在协调盖章事宜",     "time": "2026-03-06 10:00:00"},
    ],
    "WO202603060003": [
        {"action": "提交工单", "op": "陈静", "content": "创建工单：审计管理系统登录异常", "time": "2026-03-06 08:45:00"},
        {"action": "派单",     "op": "吴刚", "content": "将工单派发给吴刚处理",         "time": "2026-03-06 08:50:00"},
        {"action": "已解决",   "op": "吴刚", "content": "系统已恢复正常，原因是服务器临时维护导致", "time": "2026-03-06 09:30:00"},
    ],
    "WO202603120020": [
        {"action": "提交工单", "op": "李娜", "content": "创建工单：某集团数据清洗",           "time": "2026-03-08 10:00"},
        {"action": "接单",     "op": "刘洋", "content": "刘洋接单，工单进入「资源调度中」",    "time": "2026-03-08 10:30"},
        {"action": "开始处理", "op": "刘洋", "content": "工单进入「业务处理中」",              "time": "2026-03-09 09:00"},
        {"action": "提交交付", "op": "刘洋", "content": "交付物 v3 已上传，等待项目组验收",   "time": "2026-03-14 18:00"},
    ],
    "WO202603120021": [
        {"action": "提交工单", "op": "李娜", "content": "创建工单：某企业底稿编制",           "time": "2026-03-10 14:00"},
        {"action": "派单",     "op": "吴刚", "content": "管理员将工单派发给郑云",             "time": "2026-03-10 14:10"},
        {"action": "转入复核", "op": "郑云", "content": "底稿初稿完成，转入内部复核",         "time": "2026-03-12 17:00"},
    ],
}


def migrate_logs():
    section("操作日志（4 个工单 · 14 条）")
    count = 0
    for js_id, entries in GD_LOGS.items():
        doc_uuid = WO_ID_MAP.get(js_id)
        if not doc_uuid:
            print(f"  ⚠️  工单 {js_id} 未在映射中，跳过日志", flush=True)
            continue
        for entry in entries:
            store.add_log(
                doc_uuid,
                action=entry["action"],
                actor=entry["op"],
                data={"content": entry["content"], "time": entry["time"]},
            )
            count += 1
    stats["logs"] += count
    print(f"  ✅ 写入 {count} 条操作日志", flush=True)


# ══════════════════════════════════════════════════════════════
# 4. 文件附件（GD_ORDER_FILES — gd2.js）
# ══════════════════════════════════════════════════════════════
GD_ORDER_FILES = {
    "WO202603060001": {
        "req": [
            {"name": "审计报告_XX集团_2025.pdf", "size": "2.1 MB", "uploader": "李娜", "time": "2026-03-06 09:35"},
            {"name": "盖章申请表.docx",          "size": "45 KB",  "uploader": "李娜", "time": "2026-03-06 09:35"},
        ],
        "svc": [
            {"name": "审计报告_盖章版_v1.pdf", "size": "2.3 MB", "uploader": "张伟", "time": "2026-03-06 16:00", "ver": 1},
        ],
    },
    "WO202603120020": {
        "req": [
            {"name": "征信报告_XX集团.pdf",   "size": "1.2 MB", "uploader": "李娜", "time": "2026-03-08 10:05"},
            {"name": "开立户清单_2025.xlsx",   "size": "88 KB",  "uploader": "李娜", "time": "2026-03-08 10:05"},
        ],
        "svc": [
            {"name": "数据清洗结果_v3.xlsx", "size": "512 KB", "uploader": "刘洋", "time": "2026-03-14 18:00", "ver": 3},
            {"name": "数据清洗结果_v2.xlsx", "size": "489 KB", "uploader": "刘洋", "time": "2026-03-13 17:30", "ver": 2},
            {"name": "数据清洗结果_v1.xlsx", "size": "490 KB", "uploader": "刘洋", "time": "2026-03-12 16:00", "ver": 1},
        ],
    },
    "WO202603060005": {
        "req": [
            {"name": "项目启动书.pdf", "size": "820 KB", "uploader": "李娜", "time": "2026-03-05 14:10"},
        ],
        "svc": [],
    },
}


def migrate_files():
    section("文件附件（3 个工单 · 8 条）")
    count = 0
    for js_id, zones in GD_ORDER_FILES.items():
        doc_uuid = WO_ID_MAP.get(js_id)
        if not doc_uuid:
            print(f"  ⚠️  工单 {js_id} 未在映射中，跳过附件", flush=True)
            continue
        for f in zones.get("req", []):
            store.add_file(
                doc_uuid, f["name"], zone="requester", uploader=f["uploader"],
                size_bytes=f["size"], data={"time": f["time"]},
            )
            count += 1
        for f in zones.get("svc", []):
            store.add_file(
                doc_uuid, f["name"], zone="provider", uploader=f["uploader"],
                size_bytes=f["size"], data={"time": f["time"], "ver": f.get("ver")},
            )
            count += 1
    stats["files"] += count
    print(f"  ✅ 写入 {count} 条附件元信息", flush=True)


# ══════════════════════════════════════════════════════════════
# 5. 日常沟通（GD_ORDER_COMMENTS — gd2.js → 存为 logs 表）
# ══════════════════════════════════════════════════════════════
GD_ORDER_COMMENTS = {
    "WO202603060001": [
        {"author": "李娜", "dept": "审计一部", "content": "请重点关注盖章日期，需要与签字日期一致", "time": "2026-03-06 09:40"},
        {"author": "张伟", "dept": "交付中心", "content": "好的，已确认，今天下午完成", "time": "2026-03-06 10:05"},
        {"author": "李娜", "dept": "审计一部", "content": "感谢，请务必在下班前发送给我确认", "time": "2026-03-06 10:12"},
    ],
    "WO202603120020": [
        {"author": "李娜", "dept": "审计一部", "content": "请注意第三季度末的应收账款明细，已在需求方上传区追加文件", "time": "2026-03-10 09:30"},
        {"author": "刘洋", "dept": "交付中心", "content": "收到，今天完成数据核查，明天提交 v3", "time": "2026-03-10 10:15"},
        {"author": "李娜", "dept": "审计一部", "content": "v3 已收到，正在验收，今天给结论", "time": "2026-03-15 09:00"},
    ],
}


def migrate_comments():
    section("日常沟通（2 个工单 · 6 条 → logs 表）")
    count = 0
    for js_id, entries in GD_ORDER_COMMENTS.items():
        doc_uuid = WO_ID_MAP.get(js_id)
        if not doc_uuid:
            print(f"  ⚠️  工单 {js_id} 未在映射中，跳过沟通", flush=True)
            continue
        for c in entries:
            store.add_log(
                doc_uuid,
                action="comment",
                actor=c["author"],
                data={"dept": c["dept"], "content": c["content"], "time": c["time"]},
            )
            count += 1
    stats["logs"] += count
    print(f"  ✅ 写入 {count} 条沟通日志", flush=True)


# ══════════════════════════════════════════════════════════════
# 6. 排期数据（GD_SCHEDULE — gd.js）
# ══════════════════════════════════════════════════════════════
GD_SCHEDULE = [
    {"id": "sch1",  "userId": "1",  "userName": "张伟", "startDate": "2026-03-06", "endDate": "2026-03-06", "type": "工单",  "workOrderId": "WO202603060001", "title": "XX集团报告盖章",  "wtype": "盖章",    "priority": "特急", "status": "处理中", "progress": 60,  "client": "XX集团"},
    {"id": "sch1b", "userId": "1",  "userName": "张伟", "startDate": "2026-03-04", "endDate": "2026-03-08", "type": "工单",  "workOrderId": "WO202603040008", "title": "GH企业税务资料",  "wtype": "资料调取", "priority": "普通", "status": "已关闭", "progress": 100, "client": "GH企业"},
    {"id": "sch2",  "userId": "5",  "userName": "刘洋", "startDate": "2026-03-06", "endDate": "2026-03-07", "type": "工单",  "workOrderId": "WO202603060002", "title": "YY公司资料调取",  "wtype": "资料调取", "priority": "普通", "status": "处理中", "progress": 40,  "client": "YY公司"},
    {"id": "sch3",  "userId": "8",  "userName": "周芳", "startDate": "2026-03-06", "endDate": "2026-03-08", "type": "休假",  "title": "年假"},
    {"id": "sch4",  "userId": "10", "userName": "郑云", "startDate": "2026-03-05", "endDate": "2026-03-10", "type": "工单",  "workOrderId": "WO202603060005", "title": "AB公司IPO专项",  "wtype": "专项",    "priority": "特急", "status": "处理中", "progress": 55,  "client": "AB公司"},
    {"id": "sch5",  "userId": "3",  "userName": "王强", "startDate": "2026-03-07", "endDate": "2026-03-09", "type": "出差",  "title": "客户现场审计"},
    {"id": "sch6",  "userId": "2",  "userName": "李娜", "startDate": "2026-03-04", "endDate": "2026-03-06", "type": "工单",  "workOrderId": "WO202603040011", "title": "PQ企业年报审计",  "wtype": "年审",    "priority": "普通", "status": "处理中", "progress": 80,  "client": "PQ企业"},
    {"id": "sch7",  "userId": "4",  "userName": "赵敏", "startDate": "2026-03-05", "endDate": "2026-03-08", "type": "工单",  "workOrderId": "WO202603050013", "title": "TU公司财务审计",  "wtype": "年审",    "priority": "普通", "status": "处理中", "progress": 50,  "client": "TU公司"},
    {"id": "sch7b", "userId": "4",  "userName": "赵敏", "startDate": "2026-03-08", "endDate": "2026-03-09", "type": "会议",  "title": "项目启动会议"},
    {"id": "sch9",  "userId": "7",  "userName": "杨明", "startDate": "2026-03-04", "endDate": "2026-03-09", "type": "工单",  "workOrderId": "WO202603040018", "title": "VW集团合规性审计", "wtype": "专项",   "priority": "紧急", "status": "处理中", "progress": 45,  "client": "VW集团"},
]


def migrate_schedules():
    section("排期数据（10 条）")
    items = []
    for s in GD_SCHEDULE:
        body = {
            "jsId":      s["id"],
            "userId":    s["userId"],
            "userName":  s["userName"],
            "startDate": s["startDate"],
            "endDate":   s["endDate"],
            "schedType": s["type"],
        }
        if s["type"] == "工单":
            body.update({
                "workOrderId": s.get("workOrderId", ""),
                "wtype":       s.get("wtype", ""),
                "priority":    s.get("priority", ""),
                "status":      s.get("status", ""),
                "progress":    s.get("progress", 0),
                "client":      s.get("client", ""),
            })
        items.append({
            "type": "schedule",
            "title": s["title"],
            "body": body,
            "tags": [s["type"], s["userName"]],
        })
    ids = store.bulk_create(items)
    stats["docs"] += len(ids)
    print(f"  ✅ 写入 {len(ids)} 条排期文档", flush=True)


# ══════════════════════════════════════════════════════════════
# 7. 消息数据（GD_MESSAGES — gd.js）
# ══════════════════════════════════════════════════════════════
GD_MESSAGES = [
    {"id": "1", "type": "催办", "title": "XX集团2025年度财务审计报告盖章", "orderId": "WO202603060001", "content": "李娜催办了工单，请尽快处理", "time": "2026-03-06 14:30", "read": False},
    {"id": "2", "type": "超时", "title": "EF公司审计报告修改",             "orderId": "WO202603050007", "content": "工单已超时，请关注处理进度", "time": "2026-03-06 12:00", "read": False},
    {"id": "3", "type": "提醒", "title": "AB公司IPO专项审计启动",          "orderId": "WO202603060005", "content": "工单即将到期，剩余12小时",  "time": "2026-03-06 10:00", "read": False},
    {"id": "4", "type": "派单", "title": "YY公司专项审计资料调取",         "orderId": "WO202603060002", "content": "您有新的工单待处理",        "time": "2026-03-06 09:00", "read": True},
    {"id": "5", "type": "完成", "title": "审计管理系统登录异常",           "orderId": "WO202603060003", "content": "工单已解决，请确认",        "time": "2026-03-06 09:30", "read": True},
    {"id": "6", "type": "驳回", "title": "CD集团合并报表报备",             "orderId": "WO202603050006", "content": "工单被驳回，请查看驳回原因", "time": "2026-03-05 16:20", "read": True},
]


def migrate_messages():
    section("消息数据（6 条）")
    items = []
    for m in GD_MESSAGES:
        body = {
            "jsId":    m["id"],
            "msgType": m["type"],
            "orderId": m["orderId"],
            "content": m["content"],
            "time":    m["time"],
            "read":    m["read"],
        }
        items.append({
            "type": "message",
            "title": m["title"],
            "body": body,
            "tags": [m["type"], "已读" if m["read"] else "未读"],
        })
    ids = store.bulk_create(items)
    stats["docs"] += len(ids)
    print(f"  ✅ 写入 {len(ids)} 条消息文档", flush=True)


# ══════════════════════════════════════════════════════════════
# 8. 配置数据（服务模块枚举）
# ══════════════════════════════════════════════════════════════
def migrate_config():
    section("配置数据（服务模块枚举）")
    body = {
        "serviceModules": ["数据", "试算", "报告", "制函", "底稿", "复核", "归档", "其他"],
    }
    doc_id = store.create("config", "服务模块枚举", body=body, tags=["config"])
    stats["docs"] += 1
    print(f"  ✅ 写入 1 条配置文档（id={doc_id[:8]}）", flush=True)


# ══════════════════════════════════════════════════════════════
# 主入口
# ══════════════════════════════════════════════════════════════
def run():
    print("═" * 50, flush=True)
    print("  Mock 数据迁移 → PolarDB", flush=True)
    print("═" * 50, flush=True)

    # 初始化表（幂等）
    init_db()

    # 清空旧数据（幂等重跑）
    section("清空旧数据")
    with Session() as s:
        s.query(Log).delete()
        s.query(File).delete()
        s.query(Document).delete()
        s.commit()
    print("  ✅ 已清空 documents / logs / files", flush=True)

    t0 = time.time()

    # 按依赖顺序迁移
    migrate_users()
    migrate_work_orders()
    migrate_logs()
    migrate_files()
    migrate_comments()
    migrate_schedules()
    migrate_messages()
    migrate_config()

    elapsed = time.time() - t0

    # 汇总
    print(flush=True)
    print("═" * 50, flush=True)
    total = stats["docs"] + stats["logs"] + stats["files"]
    print(f"  迁移完成！耗时 {elapsed:.1f}s", flush=True)
    print(f"  documents: {stats['docs']} 条", flush=True)
    print(f"  logs:      {stats['logs']} 条", flush=True)
    print(f"  files:     {stats['files']} 条", flush=True)
    print(f"  总计:      {total} 条记录", flush=True)
    print("═" * 50, flush=True)


if __name__ == "__main__":
    run()
