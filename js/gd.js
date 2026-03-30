/* ══════════════════════════════════════════════════════════
   gd.js — 工单中心 (交付中心工单系统) 模块
   7个Tab：首页 / 工单中心 / 派单调度 / 人员排期 / 统计报表 / 消息中心 / 系统管理
   ══════════════════════════════════════════════════════════ */

/* ────────────────── 模拟数据 ────────────────── */

const GD_USERS = [
  { id: '1',  name: '张伟', dept: '审计一部', role: '普通员工',         workload: 5, status: '忙碌' },
  { id: '2',  name: '李娜', dept: '审计一部', role: '部门负责人',       workload: 3, status: '忙碌' },
  { id: '3',  name: '王强', dept: '审计二部', role: '普通员工',         workload: 2, status: '空闲' },
  { id: '4',  name: '赵敏', dept: '审计二部', role: '普通员工',         workload: 4, status: '忙碌' },
  { id: '5',  name: '刘洋', dept: '质量管理部', role: '普通员工',       workload: 1, status: '空闲' },
  { id: '6',  name: '陈静', dept: '技术支持部', role: '普通员工',       workload: 6, status: '忙碌' },
  { id: '7',  name: '杨明', dept: '审计三部', role: '部门负责人',       workload: 2, status: '空闲' },
  { id: '8',  name: '周芳', dept: '审计三部', role: '普通员工',         workload: 0, status: '休假' },
  { id: '9',  name: '吴刚', dept: '技术支持部', role: '交付中心管理员', workload: 3, status: '忙碌' },
  { id: '10', name: '郑云', dept: '审计一部', role: '普通员工',         workload: 3, status: '忙碌' },
];

/* 服务模块枚举值 */
const GD_SERVICE_MODULES = ['数据', '试算', '报告', '函证', '底稿', '复核', '归档', '其他'];

function gdLegacyDateOnly(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  const matched = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (!matched) return text.split(' ')[0] || text;
  const [, y, m, d] = matched;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function gdLegacyShiftExpectedDate(value) {
  const dateText = gdLegacyDateOnly(value);
  if (!dateText) return '';
  const matched = dateText.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!matched) return dateText;
  const [, y, m, d] = matched;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  const target = new Date(year, month, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, lastDay));
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
}

function gdLegacyNormalizeMockWorkOrder(order) {
  if (!order || typeof order !== 'object') return order;
  order.expectedTime = gdLegacyShiftExpectedDate(order.expectedTime);
  return order;
}

function gdLegacyNormServiceModule(mod) {
  const text = String(mod || '').trim();
  if (!text) return '其他';
  if (text.includes('函证') || text.includes('制函')) return '函证';
  const primary = text.split('、')[0].split('/')[0].trim();
  return primary.split('-')[0].trim() || '其他';
}

function gdLegacyPoolKey(order) {
  if (!order || typeof order !== 'object') return '其他';
  if (order.woType === '一类工单') return '一类工单';
  return gdLegacyNormServiceModule(order.serviceModule);
}

const GD_WORK_ORDERS = [
  {
    id: 'WO202603060001', title: 'XX集团2025年度财务审计报告盖章',
    woType: '一类工单', parentOrderId: '', serviceModule: '报告',
    workspace: '中国比亚迪-年报审计-2025年度-审计一部-001',
    company: 'XX集团有限公司', firmCode: 'HQ-2025-XX-88801', reportType: '合并',
    projectManager: '张伟',
    dept: '审计一部', submitter: '李娜', submitTime: '2026-03-06 09:30',
    expectedTime: '2026-03-06 17:00', handler: '张伟',
    status: '处理中', priority: '紧急',
    desc: 'XX集团2025年度财务审计报告已完成，需要合伙人盖章确认，共3份正本。',
    attachments: ['审计报告_XX集团_2025.pdf', '盖章申请表.docx'],
  },
  {
    id: 'WO202603060002', title: 'YY公司账套资料调取',
    woType: '二类工单', parentOrderId: 'WO202603060001', serviceModule: '数据-账套处理',
    workspace: '中国石化集团-年报审计-2025年度-审计二部-002',
    company: 'YY石化（上海）有限公司', firmCode: 'HQ-2025-YY-88802', reportType: '单体',
    projectManager: '王芳',
    dept: '审计二部', submitter: '王强', submitTime: '2026-03-06 10:15',
    expectedTime: '2026-03-07 12:00', handler: '刘洋',
    status: '待处理', priority: '普通',
    desc: '需要补齐YY公司2023-2024年度账套、银行流水及合同台账资料，用于服务方完成账套处理。',
    attachments: ['资料清单.xlsx'],
  },
  {
    id: 'WO202603060004', title: 'ZZ企业年审报告提交',
    woType: '一类工单', parentOrderId: '', serviceModule: '报告、底稿',
    workspace: '阿里巴巴集团-IPO审计-2025年度-审计一部-004',
    company: 'ZZ企业股份有限公司', firmCode: 'HQ-2025-ZZ-88803', reportType: '合并',
    projectManager: '刘晓',
    dept: '审计三部', submitter: '杨明', submitTime: '2026-03-05 16:20',
    expectedTime: '2026-03-08 18:00', handler: '',
    status: '待分派', priority: '普通',
    desc: 'ZZ企业年审工作已完成，需要提交最终报告并同步整理底稿归档材料。',
    attachments: ['年审报告_ZZ企业.pdf', '工作底稿.zip'],
  },
  {
    id: 'WO202603060005', title: 'AB公司IPO专项审计启动',
    woType: '一类工单', parentOrderId: '', serviceModule: '试算',
    workspace: '阿里巴巴集团-IPO审计-2025年度-审计一部-004',
    company: 'AB科技（北京）股份有限公司', firmCode: 'HQ-2025-AB-88804', reportType: '合并',
    projectManager: '刘晓',
    dept: '审计一部', submitter: '李娜', submitTime: '2026-03-05 14:00',
    expectedTime: '2026-03-10 18:00', handler: '郑云',
    status: '处理中', priority: '紧急',
    desc: 'AB公司计划IPO上市，需要进行专项审计，请安排经验丰富的审计师。',
    attachments: ['项目启动书.pdf'],
  },
  {
    id: 'WO202603050006', title: 'CD集团合并报表编制',
    woType: '二类工单', parentOrderId: 'WO202603060004', serviceModule: '报告-报告编制',
    workspace: '万科企业股份有限公司-专项审计-2024年度-审计二部-005',
    company: 'CD控股集团有限公司', firmCode: 'HQ-2024-CD-88805', reportType: '合并',
    projectManager: '赵敏',
    dept: '审计二部', submitter: '赵敏', submitTime: '2026-03-05 11:30',
    expectedTime: '2026-03-06 18:00', handler: '',
    status: '待分派', priority: '普通',
    desc: 'CD集团合并报表及附注需统一编制后对外报送。',
    attachments: ['合并报表.xlsx'],
  },
  {
    id: 'WO202603050007', title: 'EF公司审计报告复核修改',
    woType: '二类工单', parentOrderId: 'WO202603060005', serviceModule: '报告-报告复核',
    workspace: '比亚迪股份有限公司-年报审计-2024年度-审计三部-006',
    company: 'EF实业（深圳）有限公司', firmCode: 'HQ-2024-EF-88806', reportType: '单体',
    projectManager: '孙磊',
    dept: '审计三部', submitter: '杨明', submitTime: '2026-03-04 15:45',
    expectedTime: '2026-03-05 12:00', handler: '周芳',
    status: '已驳回', priority: '紧急',
    desc: '客户对报告初稿提出修改意见，需要复核并调整部分章节。',
    attachments: ['修改意见.docx', '初稿.pdf'],
  },
  {
    id: 'WO202603040008', title: 'GH企业往来函证资料补充',
    woType: '二类工单', parentOrderId: 'WO202603060001', serviceModule: '函证-往来函证-制函',
    workspace: '中国比亚迪-年报审计-2025年度-审计一部-001',
    company: 'GH企业管理有限公司', firmCode: 'HQ-2025-GH-88807', reportType: '单体',
    projectManager: '张伟',
    dept: '审计一部', submitter: '张伟', submitTime: '2026-03-04 09:00',
    expectedTime: '2026-03-06 18:00', handler: '李娜',
    status: '已关闭', priority: '普通',
    desc: 'GH企业往来函证任务需补充导入模板及被函证单位地址联系人资料。',
    attachments: ['往来函证导入模板.xlsx'],
  },
];

GD_WORK_ORDERS.forEach(gdLegacyNormalizeMockWorkOrder);

const GD_POOL_STATS_META = {
  '一类工单': { color: '#14B8A6' },
  '数据': { color: '#3B82F6' },
  '试算': { color: '#8B5CF6' },
  '报告': { color: '#EC4899' },
  '函证': { color: '#F59E0B' },
  '底稿': { color: '#22C55E' },
};

const GD_POOL_STATS_ORDER = ['一类工单', '数据', '试算', '底稿', '函证', '报告'];

function gdLegacyBuildTypeStats() {
  const counts = GD_WORK_ORDERS.reduce((acc, order) => {
    const key = gdLegacyPoolKey(order);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return GD_POOL_STATS_ORDER
    .map(name => ({ name, value: counts[name] || 0, color: GD_POOL_STATS_META[name].color }))
    .filter(item => item.value > 0);
}

function gdLegacyBuildDeptStats() {
  const counts = GD_WORK_ORDERS.reduce((acc, order) => {
    const key = String(order.dept || '').trim();
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, 'zh-CN'));
}

function gdLegacyBuildUserStats() {
  const counts = GD_WORK_ORDERS.reduce((acc, order) => {
    const names = String(order.handler || '')
      .split(/[、,]/)
      .map(item => item.trim())
      .filter(Boolean);
    names.forEach(name => {
      acc[name] = (acc[name] || 0) + 1;
    });
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, 'zh-CN'));
}

/* 排期数据 */
const GD_SCHEDULE = [
  { id: 'sch1',  userId: '1',  userName: '张伟', startDate: '2026-03-06', endDate: '2026-03-06', type: '工单',  workOrderId: 'WO202603060001', title: 'XX集团报告盖章',  wtype: '盖章',    priority: '特急', status: '处理中', progress: 60,  client: 'XX集团' },
  { id: 'sch1b', userId: '1',  userName: '张伟', startDate: '2026-03-04', endDate: '2026-03-08', type: '工单',  workOrderId: 'WO202603040008', title: 'GH企业往来函证',  wtype: '函证',    priority: '普通', status: '已关闭', progress: 100, client: 'GH企业' },
  { id: 'sch2',  userId: '5',  userName: '刘洋', startDate: '2026-03-06', endDate: '2026-03-07', type: '工单',  workOrderId: 'WO202603060002', title: 'YY公司账套处理',  wtype: '数据',    priority: '普通', status: '处理中', progress: 40,  client: 'YY公司' },
  { id: 'sch3',  userId: '8',  userName: '周芳', startDate: '2026-03-06', endDate: '2026-03-08', type: '休假',  title: '年假' },
  { id: 'sch4',  userId: '10', userName: '郑云', startDate: '2026-03-05', endDate: '2026-03-10', type: '工单',  workOrderId: 'WO202603060005', title: 'AB公司IPO专项',  wtype: '专项',    priority: '特急', status: '处理中', progress: 55,  client: 'AB公司' },
  { id: 'sch5',  userId: '3',  userName: '王强', startDate: '2026-03-07', endDate: '2026-03-09', type: '出差',  title: '客户现场审计' },
  { id: 'sch6',  userId: '2',  userName: '李娜', startDate: '2026-03-04', endDate: '2026-03-06', type: '工单',  workOrderId: 'WO202603040011', title: 'PQ企业年报审计',  wtype: '年审',    priority: '普通', status: '处理中', progress: 80,  client: 'PQ企业' },
  { id: 'sch7',  userId: '4',  userName: '赵敏', startDate: '2026-03-05', endDate: '2026-03-08', type: '工单',  workOrderId: 'WO202603050013', title: 'TU公司财务审计',  wtype: '年审',    priority: '普通', status: '处理中', progress: 50,  client: 'TU公司' },
  { id: 'sch7b', userId: '4',  userName: '赵敏', startDate: '2026-03-08', endDate: '2026-03-09', type: '会议',  title: '项目启动会议' },
  { id: 'sch9',  userId: '7',  userName: '杨明', startDate: '2026-03-04', endDate: '2026-03-09', type: '工单',  workOrderId: 'WO202603040018', title: 'VW集团合规性审计', wtype: '专项',   priority: '紧急', status: '处理中', progress: 45,  client: 'VW集团' },
];

/* 消息数据 */
const GD_MESSAGES = [
  { id: '1', type: '催办', title: 'XX集团2025年度财务审计报告盖章', orderId: 'WO202603060001', content: '李娜催办了工单，请尽快处理', time: '2026-03-06 14:30', read: false },
  { id: '2', type: '超时', title: 'EF公司审计报告复核修改',         orderId: 'WO202603050007', content: '工单已超时，请关注处理进度', time: '2026-03-06 12:00', read: false },
  { id: '3', type: '提醒', title: 'AB公司IPO专项审计启动',          orderId: 'WO202603060005', content: '工单即将到期，剩余12小时',  time: '2026-03-06 10:00', read: false },
  { id: '4', type: '派单', title: 'YY公司账套资料调取',             orderId: 'WO202603060002', content: '您有新的工单待处理',        time: '2026-03-06 09:00', read: true  },
  { id: '6', type: '驳回', title: 'CD集团合并报表编制',             orderId: 'WO202603050006', content: '工单被驳回，请查看驳回原因', time: '2026-03-05 16:20', read: true  },
];

/* 统计数据 */
const GD_TYPE_STATS   = gdLegacyBuildTypeStats();
const GD_DEPT_STATS   = gdLegacyBuildDeptStats();
const GD_USER_STATS   = gdLegacyBuildUserStats();
const GD_TREND_STATS  = [{ date: '03-01', sub: 12, done: 10, ot: 1 }, { date: '03-02', sub: 15, done: 13, ot: 0 }, { date: '03-03', sub: 18, done: 14, ot: 2 }, { date: '03-04', sub: 14, done: 16, ot: 1 }, { date: '03-05', sub: 16, done: 15, ot: 1 }, { date: '03-06', sub: 20, done: 12, ot: 3 }];
const GD_EFF_DATA     = [{ name: '审计一部', avg: 2.5, otRate: 5 }, { name: '审计二部', avg: 3.2, otRate: 8 }, { name: '审计三部', avg: 2.8, otRate: 6 }, { name: '质量管理部', avg: 1.9, otRate: 3 }, { name: '技术支持部', avg: 1.2, otRate: 2 }];
const GD_PERF_DATA    = [{ name: '张伟', recv: 23, done: 21, rate: 91 }, { name: '李娜', recv: 21, done: 20, rate: 95 }, { name: '王强', recv: 19, done: 18, rate: 95 }, { name: '赵敏', recv: 18, done: 16, rate: 89 }];

/* ────────────────── 模块状态 ────────────────── */
const gdState = {
  currentTab:         'workorders',
  initialized:        false,
  woFilter:           { status: '', priority: '', searchId: '', searchTitle: '' },
  woPage:             1,
  selectedOrders:     new Set(),
  selectedUserId:     '',
  dispatchSelected:   new Set(),
  reportType:         'workload',
  reportTimeRange:    'week',
  scheduleViewMode:   'user',
  scheduleTimeMode:   'week',
  scheduleDate:       new Date(2026, 2, 6),
  msgFilter:          'all',
};

/* ────────────────── 初始化入口 ────────────────── */
function initGd() {
  if (gdState.initialized) return;
  gdState.initialized = true;

  /* Tab 导航 */
  document.querySelectorAll('.gd-nav-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.gdtab;
      gdSwitchTab(tab);
    });
  });

  /* 提交工单 Modal 关闭（点击遮罩） */
  const submitModal = document.getElementById('gd-submit-modal');
  if (submitModal) {
    submitModal.addEventListener('click', e => {
      if (e.target === submitModal) gdCloseSubmit();
    });
  }

  gdRenderWorkOrders();
}

/* ────────────────── Tab 切换 ────────────────── */
function gdSwitchTab(tab) {
  gdState.currentTab = tab;

  /* 更新 Tab 按钮 */
  document.querySelectorAll('.gd-nav-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.gdtab === tab);
  });

  /* 更新面板 */
  document.querySelectorAll('.gd-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === `gd-pane-${tab}`);
  });

  /* 按需渲染 */
  const renderers = {
    workorders: gdRenderWorkOrders,
    dispatch:   gdRenderDispatch,
    schedule:   gdRenderSchedule,
    reports:    gdRenderReports,
    messages:   gdRenderMessages,
    settings:   gdRenderSettings,
  };
  renderers[tab] && renderers[tab]();
}

/* ═══════════════════════════════════════════════════════
   工单总览
   ═══════════════════════════════════════════════════════ */
function gdRenderWorkOrders() {
  const pane = document.getElementById('gd-pane-workorders');
  if (!pane) return;

  const { status, priority, searchId, searchTitle } = gdState.woFilter;
  let rows = GD_WORK_ORDERS.filter(o =>
    (!status   || o.status   === status) &&
    (!priority || o.priority === priority) &&
    (!searchId    || o.id.includes(searchId)) &&
    (!searchTitle || o.title.includes(searchTitle))
  );

  const PAGE_SIZE = 10;
  const total = rows.length;
  const page  = gdState.woPage;
  const start = (page - 1) * PAGE_SIZE;
  const pageRows = rows.slice(start, start + PAGE_SIZE);

  pane.innerHTML = `
    <!-- 标题 -->
    <!-- 测试角色切换条（开发/演示用） -->
    <div class="gd-role-bar" id="gd-role-bar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="flex-shrink:0;opacity:.6;"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
      <span>测试角色：</span>
      <select id="gd-role-select" onchange="gdSwitchRole(this.value)">
        ${typeof GD_ROLE_MOCKS !== 'undefined' ? Object.keys(GD_ROLE_MOCKS).map(k =>
          `<option value="${k}">${GD_ROLE_MOCKS[k].name}（${k}）</option>`
        ).join('') : ''}
      </select>
      <span class="gd-role-bar-hint" id="gd-role-bar-hint">当前：吴刚（dc_admin）</span>
    </div>

    <div class="gd-wo-topbar">
      <div>
        <div class="gd-wo-title">工单总览</div>
        <div class="gd-wo-sub">查看和管理所有工单</div>
      </div>
    </div>

    <!-- 筛选 -->
    <div class="gd-filter-panel">
      <div class="gd-filter-row">
        <div class="gd-filter-field">
          <label>工单编号</label>
          <input class="gd-filter-input" id="gd-wo-s-id" placeholder="输入工单编号" value="${searchId}">
        </div>
        <div class="gd-filter-field">
          <label>工单标题</label>
          <input class="gd-filter-input" id="gd-wo-s-title" placeholder="输入关键词" value="${searchTitle}">
        </div>
        <div class="gd-filter-field">
          <label>状态</label>
          <select class="gd-filter-input" id="gd-wo-s-status">
            <option value="">全部</option>
            ${['待接单','资源调度中','业务处理中','内部复核中','待验收确认','驳回修改','已关闭'].map(s => `<option value="${s}" ${status===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
        <div class="gd-filter-field">
          <label>优先级</label>
          <select class="gd-filter-input" id="gd-wo-s-priority">
            <option value="">全部</option>
            ${['普通','紧急','特急'].map(p => `<option value="${p}" ${priority===p?'selected':''}>${p}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="gd-filter-actions">
        <button class="gd-btn gd-btn-primary gd-btn-sm" onclick="gdWoSearch()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          查询
        </button>
        <button class="gd-btn gd-btn-outline gd-btn-sm" onclick="gdWoReset()">重置</button>
      </div>
    </div>

    <!-- 批量操作条 -->
    <div class="gd-batch-bar" id="gd-batch-bar" style="display:${gdState.selectedOrders.size > 0 ? 'flex' : 'none'}">
      <span class="gd-batch-info">已选择 <strong>${gdState.selectedOrders.size}</strong> 个工单</span>
      <div class="gd-batch-actions">
        <button class="gd-btn gd-btn-primary gd-btn-sm" onclick="showNotification('批量派单功能即将上线')">批量派单</button>
        <button class="gd-btn gd-btn-ghost gd-btn-sm" onclick="showNotification('工单已批量催办')">批量催办</button>
        <button class="gd-btn gd-btn-outline gd-btn-sm" onclick="showNotification('正在导出工单列表…')">导出</button>
      </div>
    </div>

    <!-- 工单表格 -->
    <div class="gd-table-wrap gd-table-scrollable">
      <table class="gd-table gd-wo-table">
        <thead>
          <tr>
            <th class="gd-col-check"><input type="checkbox" id="gd-wo-check-all" onchange="gdWoCheckAll(this)"></th>
            <th class="gd-col-id">工单编号</th>
            <th class="gd-col-title">工单标题</th>
            <th class="gd-col-parent">所属一类工单</th>
            <th class="gd-col-ws">所属项目工作区</th>
            <th class="gd-col-wotype">工单类型</th>
            <th class="gd-col-svcmod">服务模块</th>
            <th class="gd-col-company">公司名称</th>
            <th class="gd-col-firmcode">总所编码</th>
            <th class="gd-col-rtype">财报类型</th>
            <th class="gd-col-pm">项目负责人</th>
            <th class="gd-col-submitter">提交人</th>
            <th class="gd-col-follower">项目组跟进人</th>
            <th class="gd-col-time">提交时间</th>
            <th class="gd-col-expected">期望完成时间</th>
            <th class="gd-col-provider">服务方</th>
            <th class="gd-col-handler gd-wo-sticky-handler">处理人</th>
            <th class="gd-col-status gd-wo-sticky-status">状态</th>
            <th class="gd-col-priority">优先级</th>
            <th class="gd-col-action gd-wo-sticky-action">操作</th>
          </tr>
        </thead>
        <tbody>
          ${pageRows.length ? pageRows.map(o => `
            <tr>
              <td class="gd-col-check"><input type="checkbox" class="gd-wo-row-check" value="${o.id}" ${gdState.selectedOrders.has(o.id)?'checked':''} onchange="gdWoCheckRow(this,'${o.id}')"></td>
              <td class="gd-col-id"><span class="gd-wo-id-link" onclick="gdOpenDetail('${o.id}')">${o.id}</span></td>
              <td class="gd-col-title gd-wo-title-cell"><div class="gd-wo-title-text" title="${o.title}">${o.title}</div></td>
              <td class="gd-col-parent">${o.parentOrderId
                ? `<span class="gd-wo-id-link" onclick="gdOpenDetail('${o.parentOrderId}')">${o.parentOrderId}</span>`
                : '<span style="color:#9CA3AF;">—</span>'
              }</td>
              <td class="gd-col-ws"><div class="gd-wo-ws-text" title="${o.workspace}">${o.workspace}</div></td>
              <td class="gd-col-wotype">${gdWoTypeTag(o.woType)}</td>
              <td class="gd-col-svcmod">${o.serviceModule ? `<span class="gd-svcmod-tag">${o.serviceModule}</span>` : '<span style="color:#9CA3AF;">—</span>'}</td>
              <td class="gd-col-company"><div class="gd-wo-company-text" title="${o.company}">${o.company}</div></td>
              <td class="gd-col-firmcode"><span class="gd-wo-code">${o.firmCode}</span></td>
              <td class="gd-col-rtype">${o.reportType && o.reportType !== '—'
                ? `<span class="gd-rtype-tag gd-rtype-${o.reportType === '合并' ? 'merged' : 'single'}">${o.reportType}</span>`
                : '<span style="color:#9CA3AF;">—</span>'
              }</td>
              <td class="gd-col-pm">${o.projectManager || '<span style="color:#9CA3AF;">—</span>'}</td>
              <td class="gd-col-submitter">${o.submitter || '—'}</td>
              <td class="gd-col-follower">${o.projectFollower || o.submitter || '—'}</td>
              <td class="gd-col-time" style="color:#6B7280;font-size:0.78rem;">${o.submitTime}</td>
              <td class="gd-col-expected" style="color:#6B7280;font-size:0.78rem;">${o.expectedTime || '<span style="color:#9CA3AF;">—</span>'}</td>
              <td class="gd-col-provider"><span class="gd-provider-tag">交付中心</span></td>
              <td class="gd-col-handler gd-wo-sticky-handler">${o.handler || '<span style="color:#9CA3AF;">—</span>'}</td>
              <td class="gd-col-status gd-wo-sticky-status">${gdStatusTag(o.status)}</td>
              <td class="gd-col-priority">${gdPriorityTag(o.priority)}</td>
              <td class="gd-col-action gd-wo-sticky-action">
                <button class="gd-btn gd-btn-ghost gd-btn-sm" onclick="gdOpenDetail('${o.id}')">查看</button>
              </td>
            </tr>`).join('') : `<tr><td colspan="20" style="text-align:center;padding:40px 0;color:#9CA3AF;">暂无工单数据</td></tr>`}
        </tbody>
      </table>
      <!-- 分页 -->
      <div class="gd-pager">
        <span class="gd-pager-info">共 <strong>${total}</strong> 条记录</span>
        <div class="gd-pager-btns">
          <button class="gd-pager-btn" ${page<=1?'disabled':''} onclick="gdWoPage(${page-1})">上一页</button>
          ${Array.from({length:Math.ceil(total/PAGE_SIZE)||1},(_,i)=>`
            <button class="gd-pager-btn${i+1===page?' active':''}" onclick="gdWoPage(${i+1})">${i+1}</button>`).join('')}
          <button class="gd-pager-btn" ${page>=Math.ceil(total/PAGE_SIZE)?'disabled':''} onclick="gdWoPage(${page+1})">下一页</button>
        </div>
      </div>
    </div>`;
}

/* 工单中心操作 */
function gdWoSearch() {
  gdState.woFilter.searchId    = document.getElementById('gd-wo-s-id')?.value.trim() || '';
  gdState.woFilter.searchTitle = document.getElementById('gd-wo-s-title')?.value.trim() || '';
  gdState.woFilter.status      = document.getElementById('gd-wo-s-status')?.value || '';
  gdState.woFilter.priority    = document.getElementById('gd-wo-s-priority')?.value || '';
  gdState.woPage = 1;
  gdRenderWorkOrders();
}
function gdWoReset() {
  gdState.woFilter = { status: '', priority: '', searchId: '', searchTitle: '' };
  gdState.woPage = 1;
  gdRenderWorkOrders();
}
function gdWoPage(p) {
  gdState.woPage = p;
  gdRenderWorkOrders();
}
function gdWoCheckAll(el) {
  if (el.checked) {
    GD_WORK_ORDERS.forEach(o => gdState.selectedOrders.add(o.id));
  } else {
    gdState.selectedOrders.clear();
  }
  gdRenderWorkOrders();
}
function gdWoCheckRow(el, id) {
  el.checked ? gdState.selectedOrders.add(id) : gdState.selectedOrders.delete(id);
  const batchBar = document.getElementById('gd-batch-bar');
  if (batchBar) {
    batchBar.style.display = gdState.selectedOrders.size > 0 ? 'flex' : 'none';
    const infoEl = batchBar.querySelector('.gd-batch-info');
    if (infoEl) infoEl.innerHTML = `已选择 <strong>${gdState.selectedOrders.size}</strong> 个工单`;
  }
}

/* ═══════════════════════════════════════════════════════
   派单调度
   ═══════════════════════════════════════════════════════ */
function gdRenderDispatch() {
  const pane = document.getElementById('gd-pane-dispatch');
  if (!pane) return;

  const pendingOrders = GD_WORK_ORDERS.filter(o => o.status === '待接单');
  const recentDispatched = GD_WORK_ORDERS.filter(o => o.handler && o.status !== '待接单').slice(0, 5);
  const { selectedUserId, dispatchSelected } = gdState;

  pane.innerHTML = `
    <div style="margin-bottom:18px;">
      <div style="font-size:1.3rem;font-weight:700;color:#111827;">派单调度</div>
      <div style="font-size:0.82rem;color:#6B7280;margin-top:2px;">为待派工单分配处理人员</div>
    </div>

    <div class="gd-dispatch-grid">
      <!-- 待派工单池 -->
      <div class="gd-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <div>
            <div class="gd-section-title" style="margin:0 0 2px;">待派工单池</div>
            <div style="font-size:0.8rem;color:#6B7280;">共 ${pendingOrders.length} 个工单待分派</div>
          </div>
          ${dispatchSelected.size > 0 ? `<span style="font-size:0.82rem;color:#2563EB;">已选 <strong>${dispatchSelected.size}</strong> 个</span>` : ''}
        </div>

        ${pendingOrders.length === 0 ? `
          <div style="text-align:center;padding:48px 0;color:#9CA3AF;">
            <svg viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="1.5" width="48" height="48" style="display:block;margin:0 auto 10px;"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            暂无待派工单
          </div>` : pendingOrders.map(o => `
          <div class="gd-order-card ${dispatchSelected.has(o.id) ? 'selected' : ''}" onclick="gdToggleDispatch('${o.id}')">
            <div class="gd-order-card-hd">
              <input type="checkbox" ${dispatchSelected.has(o.id) ? 'checked' : ''} onclick="event.stopPropagation();gdToggleDispatch('${o.id}')">
              <span class="gd-order-card-id">${o.id}</span>
              ${gdPriorityTag(o.priority)}
              <span class="gd-tag gd-tag-purple">${o.type}</span>
            </div>
            <div class="gd-order-card-title">${o.title}</div>
            <div class="gd-order-card-meta">
              <span>提交部门：${o.dept}</span>
              <span>提交人：${o.submitter}</span>
              <span>提交时间：${o.submitTime}</span>
            </div>
            <div class="gd-order-card-time">期望完成：${o.expectedTime}</div>
          </div>`).join('')}

        ${dispatchSelected.size > 0 ? `
          <div style="padding:14px 0 0;border-top:1px solid #E5E7EB;margin-top:10px;">
            <button class="gd-btn gd-btn-primary" style="width:100%;justify-content:center;"
              ${!selectedUserId ? 'disabled style="width:100%;justify-content:center;opacity:.6;cursor:not-allowed;"' : ''}
              onclick="gdDoDispatch()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              确认派单给 ${selectedUserId ? (GD_USERS.find(u => u.id === selectedUserId)?.name || '…') : '(请选择处理人)'}
            </button>
          </div>` : ''}
      </div>

      <!-- 人员选择 -->
      <div class="gd-card" style="padding:18px 0;">
        <div style="padding:0 18px 12px;border-bottom:1px solid #E5E7EB;margin-bottom:12px;">
          <div class="gd-section-title" style="margin:0 0 4px;">选择处理人</div>
          <div style="font-size:0.78rem;color:#6B7280;">根据人员负荷选择合适的处理人</div>
        </div>
        <div style="padding:0 12px;max-height:480px;overflow-y:auto;">
          ${GD_USERS.map(u => `
            <div class="gd-user-card ${selectedUserId === u.id ? 'selected' : ''}" onclick="gdSelectUser('${u.id}')">
              <div class="gd-user-card-hd">
                <div class="gd-user-card-info">
                  <input type="radio" name="gd-dispatch-user" ${selectedUserId === u.id ? 'checked' : ''} onclick="event.stopPropagation()">
                  <div class="gd-user-mini-avatar" style="background:${gdAvatarColor(u.name)};">${u.name[0]}</div>
                  <div>
                    <div class="gd-user-name-text">${u.name}</div>
                    <div class="gd-user-dept-text">${u.dept}</div>
                  </div>
                </div>
                <span class="gd-tag ${gdStatusClass(u.status)}">${u.status}</span>
              </div>
              <div class="gd-user-workload">
                <span style="color:#6B7280;">当前负荷</span>
                <span style="color:${gdWorkloadColor(u.workload)};font-weight:600;">${u.workload} 个工单</span>
              </div>
              <div class="gd-progress-track">
                <div class="gd-progress-fill" style="width:${Math.min(u.workload*10,100)}%;background:${gdWorkloadColor(u.workload)};"></div>
              </div>
              <div class="gd-user-hint">${gdUserHint(u)}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- 最近派单记录 -->
    <div class="gd-card" style="margin-top:4px;">
      <div class="gd-section-title">最近派单记录</div>
      ${recentDispatched.map(o => `
        <div class="gd-dispatch-record">
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
              <span class="gd-wo-id-link" onclick="gdOpenDetail('${o.id}')">${o.id}</span>
              <span style="font-size:0.82rem;color:#374151;">${o.title}</span>
            </div>
            <div style="font-size:0.76rem;color:#9CA3AF;">派发给：${o.handler} | 提交时间：${o.submitTime}</div>
          </div>
          ${gdStatusTag(o.status)}
        </div>`).join('')}
    </div>`;
}

/* 派单调度操作 */
function gdToggleDispatch(id) {
  gdState.dispatchSelected.has(id) ? gdState.dispatchSelected.delete(id) : gdState.dispatchSelected.add(id);
  gdRenderDispatch();
}
function gdSelectUser(id) {
  gdState.selectedUserId = id;
  gdRenderDispatch();
}
function gdDoDispatch() {
  if (!gdState.selectedUserId || gdState.dispatchSelected.size === 0) return;
  const user = GD_USERS.find(u => u.id === gdState.selectedUserId);
  gdState.dispatchSelected.forEach(id => {
    const order = GD_WORK_ORDERS.find(o => o.id === id);
    if (order) { order.handler = user.name; order.status = '待处理'; }
  });
  gdState.dispatchSelected.clear();
  gdState.selectedUserId = '';
  showNotification(`✓ 已成功派单给 ${user.name}`);
  gdRenderDispatch();
}

/* ═══════════════════════════════════════════════════════
   人员排期
   ═══════════════════════════════════════════════════════ */
function gdRenderSchedule() {
  const pane = document.getElementById('gd-pane-schedule');
  if (!pane) return;

  const cur  = gdState.scheduleDate;
  const weekDates = gdGetWeekDates(cur);
  const weekLabel = `${cur.getFullYear()}年${cur.getMonth()+1}月 第${Math.ceil((cur.getDate() + cur.getDay()) / 7)}周`;
  const TODAY_KEY = '2026-03-06';
  const WEEKDAY_ZH = ['日','一','二','三','四','五','六'];

  pane.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;">
      <div>
        <div style="font-size:1.3rem;font-weight:700;color:#111827;">人员排期</div>
        <div style="font-size:0.82rem;color:#6B7280;margin-top:2px;">查看和管理人员工作安排</div>
      </div>
      <button class="gd-btn gd-btn-primary" onclick="showNotification('新增排期功能即将上线')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        新增排期
      </button>
    </div>

    <!-- 控制栏 -->
    <div class="gd-schedule-controls">
      <div class="gd-schedule-left">
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="gd-ctrl-label">视图：</span>
          <div class="gd-ctrl-group">
            <button class="gd-ctrl-btn ${gdState.scheduleViewMode==='user'?'active':''}" onclick="gdSetScheduleView('user')">按人员</button>
            <button class="gd-ctrl-btn ${gdState.scheduleViewMode==='dept'?'active':''}" onclick="gdSetScheduleView('dept')">按部门</button>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="gd-ctrl-label">时间：</span>
          <div class="gd-ctrl-group">
            <button class="gd-ctrl-btn ${gdState.scheduleTimeMode==='day'?'active':''}" onclick="gdSetScheduleTime('day')">日</button>
            <button class="gd-ctrl-btn ${gdState.scheduleTimeMode==='week'?'active':''}" onclick="gdSetScheduleTime('week')">周</button>
            <button class="gd-ctrl-btn ${gdState.scheduleTimeMode==='month'?'active':''}" onclick="gdSetScheduleTime('month')">月</button>
          </div>
        </div>
      </div>
      <div class="gd-schedule-nav">
        <button class="gd-nav-arrow" onclick="gdScheduleNav(-1)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="gd-schedule-period">
          <svg viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" width="15" height="15" style="vertical-align:-2px;margin-right:4px;"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          ${weekLabel}
        </div>
        <button class="gd-nav-arrow" onclick="gdScheduleNav(1)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>

    <!-- 排期表格 -->
    <div class="gd-schedule-table-wrap">
      <table class="gd-schedule-table">
        <thead>
          <tr>
            <th style="text-align:left;padding-left:14px;">人员</th>
            ${weekDates.map(d => {
              const dk = gdFmtDate(d);
              const isToday = dk === TODAY_KEY;
              const isWkd   = d.getDay() === 0 || d.getDay() === 6;
              return `<th class="${isToday?'today-hd':isWkd?'weekend-hd':''}">
                <div>周${WEEKDAY_ZH[d.getDay()]}</div>
                <div style="font-size:0.7rem;font-weight:400;">${d.getMonth()+1}/${d.getDate()}</div>
              </th>`;
            }).join('')}
          </tr>
        </thead>
        <tbody>
          ${GD_USERS.slice(0,9).map(user => {
            const tds = weekDates.map(date => {
              const dk = gdFmtDate(date);
              const isToday = dk === TODAY_KEY;
              const items = GD_SCHEDULE.filter(s => s.userId === user.id && dk >= s.startDate && dk <= s.endDate);
              return `<td class="day-col${isToday?' today-col':''}">
                <div style="min-height:72px;">
                  ${items.map(s => {
                    const isStart = dk === s.startDate;
                    const colors = gdSchColor(s.type, s.priority);
                    return `<div class="gd-sch-item ${!isStart?'continuation':''}" style="background:${colors.bg};" title="${s.title}">
                      ${isStart ? `
                        <div class="sch-title">${s.title}</div>
                        <div class="sch-meta">
                          <span>${s.wtype || s.type}</span>
                          ${s.progress !== undefined ? `<span>${s.progress}%</span>` : ''}
                        </div>` : `<div class="sch-dots">···</div>`}
                    </div>`;
                  }).join('')}
                </div>
              </td>`;
            }).join('');
            return `<tr>
              <td class="user-col">
                <div class="gd-schedule-user-name">${user.name}</div>
                <div class="gd-schedule-user-dept">${user.dept}</div>
                <div class="gd-schedule-user-load">${user.workload} 个工单</div>
              </td>
              ${tds}
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>

    <!-- 图例 -->
    <div class="gd-legend">
      ${[
        ['#EF4444','特急工单'],['#F97316','紧急工单'],['#3B82F6','普通工单'],
        ['#9CA3AF','休假'],['#A855F7','出差'],['#22C55E','会议']
      ].map(([c,l]) => `
        <div class="gd-legend-item">
          <div class="gd-legend-dot" style="background:${c};"></div>
          <span>${l}</span>
        </div>`).join('')}
    </div>`;
}

/* 排期操作 */
function gdScheduleNav(dir) {
  const d = new Date(gdState.scheduleDate);
  d.setDate(d.getDate() + dir * 7);
  gdState.scheduleDate = d;
  gdRenderSchedule();
}
function gdSetScheduleView(mode) { gdState.scheduleViewMode = mode; gdRenderSchedule(); }
function gdSetScheduleTime(mode) { gdState.scheduleTimeMode = mode; gdRenderSchedule(); }

/* 取本周7天日期数组 */
function gdGetWeekDates(cur) {
  const start = new Date(cur);
  start.setDate(start.getDate() - start.getDay()); // 从周日开始
  return Array.from({length:7}, (_,i) => { const d = new Date(start); d.setDate(d.getDate()+i); return d; });
}

/* ═══════════════════════════════════════════════════════
   统计报表
   ═══════════════════════════════════════════════════════ */

/* ── 报表辅助：SVG 柱状图 ── */
function gdRptBarSvg(data, color) {
  if (!data.length) return '<div style="text-align:center;color:#9CA3AF;padding:30px 0;font-size:0.82rem;">暂无数据</div>';
  const maxV = Math.max(...data.map(d => d.value), 1);
  const w = 380, h = 170, barW = Math.min(32, Math.max(12, (w - 60) / data.length - 6));
  const grid = [0,1,2,3,4].map(i => {
    const v = Math.round(maxV / 4 * i); const y = h - (i / 4) * h;
    return `<line x1="36" y1="${y}" x2="${w}" y2="${y}" stroke="#F3F4F6" stroke-width="1"/>
      <text x="32" y="${y+4}" fill="#9CA3AF" font-size="9" text-anchor="end">${v}</text>`;
  }).join('');
  const bars = data.map((d, i) => {
    const x = 44 + i * ((w - 54) / data.length);
    const bh = Math.max(2, (d.value / maxV) * h);
    return `<rect x="${x-1}" y="0" width="${barW+2}" height="${h}" rx="3" fill="${color}" opacity="0.06"/>
      <rect x="${x}" y="${h-bh}" width="${barW}" height="${bh}" rx="3" fill="${color}"/>
      <text x="${x+barW/2}" y="${h-bh-5}" fill="${color}" font-size="9" text-anchor="middle" font-weight="600">${d.value}</text>
      <text x="${x+barW/2}" y="${h+13}" fill="#6B7280" font-size="8" text-anchor="middle">${d.label.length>4?d.label.slice(0,4):d.label}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${w} ${h+22}" width="100%" style="max-width:100%;">${grid}${bars}</svg>`;
}

/* ── 报表辅助：SVG 环形图 ── */
function gdRptDonut(data) {
  const total = data.reduce((s,d)=>s+d.value,0) || 1;
  const r = 58, ir = 36, cx = 72, cy = 72;
  let sa = -Math.PI/2;
  const slices = data.map(d => {
    const angle = (d.value/total)*Math.PI*2;
    const x1=cx+r*Math.cos(sa), y1=cy+r*Math.sin(sa);
    const x2=cx+r*Math.cos(sa+angle), y2=cy+r*Math.sin(sa+angle);
    const ix1=cx+ir*Math.cos(sa+angle), iy1=cy+ir*Math.sin(sa+angle);
    const ix2=cx+ir*Math.cos(sa), iy2=cy+ir*Math.sin(sa);
    const large=angle>Math.PI?1:0;
    const path=`M${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${ix1},${iy1} A${ir},${ir} 0 ${large},0 ${ix2},${iy2} Z`;
    sa+=angle;
    return `<path d="${path}" fill="${d.color}"/>`;
  });
  return `<svg viewBox="0 0 144 144" width="144" height="144">${slices.join('')}
    <text x="${cx}" y="${cy-4}" fill="#111827" font-size="18" font-weight="700" text-anchor="middle">${total}</text>
    <text x="${cx}" y="${cy+12}" fill="#9CA3AF" font-size="9" text-anchor="middle">总计</text></svg>`;
}

/* ── 报表辅助：折线图 ── */
function gdRptLine(data, series, colors, legends) {
  const maxV = Math.max(...data.flatMap(d => series.map(k => d[k])), 1);
  const w = 440, h = 160, pad = 36;
  const grid = [0,1,2,3,4].map(i => {
    const v = Math.round(maxV/4*i); const y = h-(i/4)*h;
    return `<line x1="${pad}" y1="${y}" x2="${w}" y2="${y}" stroke="#F3F4F6" stroke-width="1"/>
      <text x="${pad-4}" y="${y+4}" fill="#9CA3AF" font-size="9" text-anchor="end">${v}</text>`;
  }).join('');
  const lines = series.map((k,si) => {
    const pts = data.map((d,i)=>`${pad+i/(data.length-1)*(w-pad-8)},${h-(d[k]/maxV)*h}`).join(' ');
    return `<polyline points="${pts}" fill="none" stroke="${colors[si]}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join('');
  const dots = series.map((k,si) => data.map((d,i)=>{
    const x=pad+i/(data.length-1)*(w-pad-8), y=h-(d[k]/maxV)*h;
    return `<circle cx="${x}" cy="${y}" r="3" fill="#fff" stroke="${colors[si]}" stroke-width="1.5"/>`;
  }).join('')).join('');
  const labels = data.map((d,i)=>`<text x="${pad+i/(data.length-1)*(w-pad-8)}" y="${h+14}" fill="#9CA3AF" font-size="9" text-anchor="middle">${d.date}</text>`).join('');
  const legendHtml = legends.map((l,i)=>`<div style="display:flex;align-items:center;gap:4px;font-size:0.74rem;color:#374151;">
    <div style="width:14px;height:3px;background:${colors[i]};border-radius:2px;"></div>${l}</div>`).join('');
  return `<svg viewBox="0 0 ${w} ${h+20}" width="100%" style="max-width:100%;">${grid}${lines}${dots}${labels}</svg>
    <div style="display:flex;gap:16px;margin-top:6px;justify-content:center;">${legendHtml}</div>`;
}

/* ── 报表辅助：水平条 ── */
function gdRptHBar(data, color) {
  if (!data.length) return '<div style="text-align:center;color:#9CA3AF;padding:20px 0;font-size:0.82rem;">暂无数据</div>';
  const maxV = Math.max(...data.map(d=>d.value),1);
  return data.map(d=>`<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
    <div style="width:72px;font-size:0.78rem;color:#374151;text-align:right;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${d.label}">${d.label}</div>
    <div style="flex:1;background:#F3F4F6;border-radius:4px;height:20px;overflow:hidden;">
      <div style="width:${(d.value/maxV)*100}%;height:100%;background:${color};border-radius:4px;transition:width .3s;"></div>
    </div>
    <div style="width:32px;font-size:0.78rem;color:#374151;font-weight:600;">${d.value}</div>
  </div>`).join('');
}

function gdRenderReports() {
  const pane = document.getElementById('gd-pane-reports');
  if (!pane) return;

  const orgId = typeof gdSelectedDeliveryOrgId !== 'undefined' ? gdSelectedDeliveryOrgId : (typeof GD_DEMO_CONTEXT !== 'undefined' ? GD_DEMO_CONTEXT.orgId : '');
  const allOrders = GD_WORK_ORDERS;
  const orgOrders = allOrders.filter(o => o.providerOrgId === orgId);
  const orders = orgOrders.length ? orgOrders : allOrders;

  const statusList = ['待启用','待接单','已接单','待验收','验收通过','已驳回'];
  const statusColors = { '待启用':'#6B7280','待接单':'#3B82F6','已接单':'#F59E0B','待验收':'#8B5CF6','验收通过':'#10B981','已驳回':'#EF4444' };
  const total = orders.length;
  const passed = orders.filter(o=>o.status==='验收通过').length;
  const avgDoneRate = total ? Math.round(passed / total * 100) : 0;

  const kpis = [
    { label:'工单总数', value:total, color:'#2563EB', icon:'<rect x="3" y="12" width="5" height="9" rx="1" fill="#93C5FD"/><rect x="10" y="6" width="5" height="15" rx="1" fill="#60A5FA"/><rect x="17" y="2" width="5" height="19" rx="1" fill="#3B82F6"/>' },
    { label:'待接单', value:orders.filter(o=>o.status==='待接单').length, color:'#3B82F6', icon:'<circle cx="12" cy="12" r="9" fill="none" stroke="#93C5FD" stroke-width="2"/><path d="M12 8v4l3 3" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round"/>' },
    { label:'已接单', value:orders.filter(o=>o.status==='已接单').length, color:'#F59E0B', icon:'<circle cx="12" cy="12" r="9" fill="none" stroke="#FCD34D" stroke-width="2"/><polyline points="8 12 11 15 16 9" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' },
    { label:'待验收', value:orders.filter(o=>o.status==='待验收').length, color:'#8B5CF6', icon:'<rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="#C4B5FD" stroke-width="2"/><path d="M8 12h8M8 8h5" fill="none" stroke="#8B5CF6" stroke-width="1.5" stroke-linecap="round"/>' },
    { label:'验收通过', value:passed, color:'#10B981', icon:'<circle cx="12" cy="12" r="9" fill="none" stroke="#6EE7B7" stroke-width="2"/><polyline points="8 12 11 15 16 9" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' },
    { label:'已驳回', value:orders.filter(o=>o.status==='已驳回').length, color:'#EF4444', icon:'<circle cx="12" cy="12" r="9" fill="none" stroke="#FCA5A5" stroke-width="2"/><line x1="9" y1="9" x2="15" y2="15" stroke="#EF4444" stroke-width="2" stroke-linecap="round"/><line x1="15" y1="9" x2="9" y2="15" stroke="#EF4444" stroke-width="2" stroke-linecap="round"/>' },
    { label:'完成率', value: avgDoneRate + '%', color:'#059669', icon:'<path d="M12 2a10 10 0 0 1 0 20 10 10 0 0 1 0-20" fill="none" stroke="#D1FAE5" stroke-width="2.5"/><path d="M12 2a10 10 0 0 1 7.07 17.07" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round"/>' },
  ];

  const statusData = statusList.map(s => ({ label: s, value: orders.filter(o=>o.status===s).length }));

  const typeMap = {};
  orders.forEach(o => { const t = o.woType || '其他'; typeMap[t] = (typeMap[t]||0)+1; });
  const typeColors = ['#3B82F6','#F59E0B','#8B5CF6','#10B981','#EF4444','#EC4899'];
  const typeData = Object.entries(typeMap).map(([name,value],i) => ({ name, value, color: typeColors[i % typeColors.length] }));

  const moduleMap = {};
  orders.forEach(o => { const m = gdLegacyNormServiceModule(o.serviceModule) || '其他'; moduleMap[m]=(moduleMap[m]||0)+1; });
  const moduleData = Object.entries(moduleMap).map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value);

  const deptMap = {};
  orders.forEach(o => { const d = o.dept || o.workspaceDept || '未知'; deptMap[d]=(deptMap[d]||0)+1; });
  const deptData = Object.entries(deptMap).map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value);

  const handlerMap = {};
  orders.forEach(o => {
    const h2 = o.handler || '未分配';
    if (!handlerMap[h2]) handlerMap[h2] = { recv:0, done:0 };
    handlerMap[h2].recv++;
    if (o.status === '验收通过') handlerMap[h2].done++;
  });
  const handlerData = Object.entries(handlerMap)
    .map(([name,d])=>({name,recv:d.recv,done:d.done,rate:d.recv?Math.round(d.done/d.recv*100):0}))
    .sort((a,b)=>b.recv-a.recv).slice(0,10);

  const cfgIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';

  pane.innerHTML = `
    <div class="gd-report-topbar">
      <div>
        <div class="gd-report-title">统计报表</div>
        <div style="font-size:0.82rem;color:#6B7280;margin-top:2px;">当前交付组织全局视角的工单统计与分析</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <label class="gd-schedule-org-field" style="margin-right:4px;">
          <span>交付组织</span>
          <select class="gd-filter-input gd-schedule-org-select" onchange="gdSelectedDeliveryOrgId=this.value;GD_DEMO_CONTEXT.orgId=this.value;gdRenderReports()">
            ${(typeof GD_DELIVERY_ORGS!=='undefined'?GD_DELIVERY_ORGS:[]).map(o=>`<option value="${o.id}" ${o.id===orgId?'selected':''}>${o.name}</option>`).join('')}
          </select>
        </label>
        <button class="gd-btn gd-btn-primary" onclick="gdOpenReportConfig()">${cfgIcon} 配置</button>
        <button class="gd-btn gd-btn-outline" onclick="showNotification('正在导出报表…')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          导出报表
        </button>
      </div>
    </div>

    <!-- KPI 卡片 -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-bottom:20px;">
      ${kpis.map(k=>`
        <div style="background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:16px;display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:10px;background:${k.color}10;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <svg viewBox="0 0 24 24" width="22" height="22">${k.icon}</svg>
          </div>
          <div>
            <div style="font-size:1.4rem;font-weight:700;color:${k.color};line-height:1.2;">${k.value}</div>
            <div style="font-size:0.74rem;color:#6B7280;">${k.label}</div>
          </div>
        </div>`).join('')}
    </div>

    <!-- 第一行：工单池分布 + 状态分布 -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
      <div class="gd-card" style="padding:20px;">
        <div style="font-size:0.9rem;font-weight:600;color:#111827;margin-bottom:14px;">工单池分布</div>
        <div style="display:flex;align-items:center;gap:24px;">
          ${gdRptDonut(typeData)}
          <div style="display:flex;flex-direction:column;gap:8px;flex:1;">
            ${typeData.map(d=>`<div style="display:flex;align-items:center;gap:8px;">
              <div style="width:10px;height:10px;border-radius:3px;background:${d.color};flex-shrink:0;"></div>
              <span style="font-size:0.78rem;color:#374151;flex:1;">${d.name}</span>
              <span style="font-size:0.82rem;font-weight:600;color:#111827;">${d.value}</span>
              <span style="font-size:0.72rem;color:#9CA3AF;">${Math.round(d.value/total*100)}%</span>
            </div>`).join('')}
          </div>
        </div>
      </div>
      <div class="gd-card" style="padding:20px;">
        <div style="font-size:0.9rem;font-weight:600;color:#111827;margin-bottom:14px;">工单状态分布</div>
        ${gdRptBarSvg(statusData, '#3B82F6')}
      </div>
    </div>

    <!-- 第二行：服务模块分布 + 部门工单量 -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
      <div class="gd-card" style="padding:20px;">
        <div style="font-size:0.9rem;font-weight:600;color:#111827;margin-bottom:14px;">服务模块分布</div>
        ${gdRptHBar(moduleData, '#8B5CF6')}
      </div>
      <div class="gd-card" style="padding:20px;">
        <div style="font-size:0.9rem;font-weight:600;color:#111827;margin-bottom:14px;">部门工单量</div>
        ${gdRptBarSvg(deptData, '#10B981')}
      </div>
    </div>

    <!-- 第三行：近7日趋势 -->
    <div class="gd-card" style="padding:20px;margin-bottom:16px;">
      <div style="font-size:0.9rem;font-weight:600;color:#111827;margin-bottom:14px;">近 7 日工单趋势</div>
      ${gdRptLine(GD_TREND_STATS, ['sub','done','ot'], ['#3B82F6','#10B981','#EF4444'], ['提交','完成','超时'])}
    </div>

    <!-- 第四行：处理人绩效 -->
    <div class="gd-card" style="padding:20px;margin-bottom:16px;">
      <div style="font-size:0.9rem;font-weight:600;color:#111827;margin-bottom:14px;">处理人绩效排行</div>
      ${handlerData.length ? `
      <div style="overflow-x:auto;">
        <table class="gd-table" style="width:100%;">
          <thead><tr>
            <th style="text-align:left;">处理人</th>
            <th style="text-align:center;">接单量</th>
            <th style="text-align:center;">完成量</th>
            <th style="text-align:center;">完成率</th>
            <th style="min-width:140px;">进度</th>
            <th style="text-align:center;">评级</th>
          </tr></thead>
          <tbody>
            ${handlerData.map(d=>{
              const badge = d.rate>=80?'#10B981':d.rate>=50?'#F59E0B':'#EF4444';
              const label = d.rate>=80?'优秀':d.rate>=50?'良好':'待提升';
              return `<tr>
                <td style="font-weight:500;">${d.name}</td>
                <td style="text-align:center;">${d.recv}</td>
                <td style="text-align:center;">${d.done}</td>
                <td style="text-align:center;font-weight:600;color:${badge};">${d.rate}%</td>
                <td><div style="background:#F3F4F6;border-radius:4px;height:8px;overflow:hidden;">
                  <div style="width:${d.rate}%;height:100%;background:${badge};border-radius:4px;"></div>
                </div></td>
                <td style="text-align:center;">
                  <span style="display:inline-block;padding:2px 10px;border-radius:10px;font-size:0.72rem;font-weight:500;color:${badge};background:${badge}14;">${label}</span>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>` : '<div style="text-align:center;color:#9CA3AF;padding:24px 0;">暂无处理人数据</div>'}
    </div>

    <!-- 第五行：处理效率 -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
      <div class="gd-card" style="padding:20px;">
        <div style="font-size:0.9rem;font-weight:600;color:#111827;margin-bottom:14px;">部门平均处理时长</div>
        ${GD_EFF_DATA.map(d=>`<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <div style="width:72px;font-size:0.78rem;color:#374151;text-align:right;flex-shrink:0;">${d.name}</div>
          <div style="flex:1;background:#F3F4F6;border-radius:4px;height:22px;overflow:hidden;position:relative;">
            <div style="width:${(d.avg/4*100)|0}%;height:100%;background:linear-gradient(90deg,#93C5FD,#3B82F6);border-radius:4px;"></div>
            <span style="position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:0.72rem;font-weight:600;color:#374151;">${d.avg}天</span>
          </div>
        </div>`).join('')}
      </div>
      <div class="gd-card" style="padding:20px;">
        <div style="font-size:0.9rem;font-weight:600;color:#111827;margin-bottom:14px;">部门超时率</div>
        ${GD_EFF_DATA.map(d=>{
          const c = d.otRate<5?'#10B981':d.otRate<10?'#F59E0B':'#EF4444';
          return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
            <div style="width:72px;font-size:0.78rem;color:#374151;text-align:right;flex-shrink:0;">${d.name}</div>
            <div style="flex:1;background:#F3F4F6;border-radius:4px;height:22px;overflow:hidden;position:relative;">
              <div style="width:${d.otRate*5}%;height:100%;background:${c};border-radius:4px;"></div>
              <span style="position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:0.72rem;font-weight:600;color:#374151;">${d.otRate}%</span>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
}

/* ═══════════════════════════════════════════════════════
   消息中心
   ═══════════════════════════════════════════════════════ */
function gdRenderMessages() {
  const pane = document.getElementById('gd-pane-messages');
  if (!pane) return;

  const filter = gdState.msgFilter;
  const unread = GD_MESSAGES.filter(m => !m.read).length;

  let msgs = GD_MESSAGES;
  if (filter === 'unread') msgs = GD_MESSAGES.filter(m => !m.read);
  else if (filter === '催办') msgs = GD_MESSAGES.filter(m => m.type === '催办');
  else if (filter === '超时') msgs = GD_MESSAGES.filter(m => m.type === '超时');
  else if (filter === '状态') msgs = GD_MESSAGES.filter(m => ['完成','驳回','派单'].includes(m.type));

  const MSG_ICON = {
    催办: { color:'#FEF3C7', stroke:'#F59E0B' },
    超时: { color:'#FEE2E2', stroke:'#EF4444' },
    提醒: { color:'#DBEAFE', stroke:'#3B82F6' },
    派单: { color:'#EDE9FE', stroke:'#8B5CF6' },
    完成: { color:'#D1FAE5', stroke:'#10B981' },
    驳回: { color:'#FEE2E2', stroke:'#EF4444' },
  };
  const MSG_TAG = {
    催办: 'gd-tag-orange', 超时: 'gd-tag-red', 提醒: 'gd-tag-blue',
    派单: 'gd-tag-purple', 完成: 'gd-tag-green', 驳回: 'gd-tag-red',
  };

  pane.innerHTML = `
    <div class="gd-msg-topbar">
      <div class="gd-msg-title-wrap">
        <div class="gd-msg-title">消息中心</div>
        ${unread > 0 ? `<span class="gd-tag gd-tag-red" style="font-size:0.72rem;">${unread}</span>` : ''}
      </div>
      <button class="gd-btn gd-btn-ghost gd-btn-sm" onclick="gdMarkAllRead()">全部标记为已读</button>
    </div>

    <div class="gd-msg-filter-bar">
      ${[['all',`全部 (${GD_MESSAGES.length})`],['unread',`未读 (${unread})`],['催办','催办通知'],['超时','超时提醒'],['状态','工单状态']].map(
        ([k,l]) => `<button class="gd-msg-filter-btn ${filter===k?'active':''}" onclick="gdMsgFilter('${k}')">${l}</button>`
      ).join('')}
    </div>

    <div class="gd-msg-list">
      ${msgs.length ? msgs.map(m => {
        const ic = MSG_ICON[m.type] || { color:'#F3F4F6', stroke:'#6B7280' };
        return `
          <div class="gd-msg-item" style="background:${!m.read?ic.color.replace('0B','05')+'20':'#fff'}" onclick="gdOpenDetail('${m.orderId}')">
            <div class="gd-msg-icon" style="background:${ic.color};">
              <svg viewBox="0 0 24 24" fill="none" stroke="${ic.stroke}" stroke-width="2" width="18" height="18">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
              </svg>
            </div>
            <div class="gd-msg-content">
              <div class="gd-msg-hd">
                <span class="gd-tag ${MSG_TAG[m.type]||'gd-tag-gray'}">${m.type}</span>
                <span style="font-size:0.78rem;color:#9CA3AF;">${m.orderId}</span>
                ${!m.read ? '<div class="gd-msg-unread-dot"></div>' : ''}
              </div>
              <div class="gd-msg-name ${m.read?'read':''}">${m.title}</div>
              <div class="gd-msg-desc">${m.content}</div>
              <div class="gd-msg-time">
                <svg viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" width="12" height="12" style="vertical-align:-2px;margin-right:3px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${m.time}
              </div>
            </div>
          </div>`;
      }).join('') : '<p style="text-align:center;color:#9CA3AF;padding:40px 0;font-size:0.84rem;">暂无相关消息</p>'}
    </div>

    <!-- 统计 -->
    <div class="gd-card">
      <div class="gd-section-title">消息统计</div>
      <div class="gd-msg-stats">
        ${[
          [`${GD_MESSAGES.length}`, '总消息数', '#2563EB'],
          [`${unread}`, '未读消息', '#DC2626'],
          [`${GD_MESSAGES.filter(m=>m.type==='催办').length}`, '催办通知', '#D97706'],
          [`${GD_MESSAGES.filter(m=>m.type==='超时').length}`, '超时提醒', '#DC2626'],
          [`${GD_MESSAGES.filter(m=>m.type==='派单').length}`, '派单通知', '#7C3AED'],
        ].map(([v,l,c]) => `
          <div style="text-align:center;">
            <div style="font-size:1.8rem;font-weight:700;color:${c};">${v}</div>
            <div style="font-size:0.78rem;color:#6B7280;margin-top:4px;">${l}</div>
          </div>`).join('')}
      </div>
    </div>`;
}

/* 消息操作 */
function gdMsgFilter(f) { gdState.msgFilter = f; gdRenderMessages(); }
function gdMarkAllRead() {
  GD_MESSAGES.forEach(m => { m.read = true; });
  const badge = document.getElementById('gd-msg-badge');
  if (badge) badge.style.display = 'none';
  showNotification('✓ 已全部标记为已读');
  gdRenderMessages();
}

/* ═══════════════════════════════════════════════════════
   系统管理
   ═══════════════════════════════════════════════════════ */
function gdRenderSettings() {
  const pane = document.getElementById('gd-pane-settings');
  if (!pane) return;

  const modules = [
    { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" width="22" height="22"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`, iconBg:'#DBEAFE', name:'权限管理', desc:'管理用户角色和权限配置', items:['角色配置','权限分配','菜单权限'], color:'#2563EB' },
    { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" width="22" height="22"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`, iconBg:'#D1FAE5', name:'用户管理', desc:'管理系统用户和部门', items:['用户列表','部门架构','账号管理'], color:'#059669' },
    { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="2" width="22" height="22"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`, iconBg:'#EDE9FE', name:'流程配置', desc:'配置工单流转流程', items:['流程定义','审批配置','SLA规则'], color:'#7C3AED' },
    { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2" width="22" height="22"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`, iconBg:'#FEF3C7', name:'字典管理', desc:'管理系统数据字典', items:['工单类型','优先级配置','状态定义'], color:'#D97706' },
  ];

  pane.innerHTML = `
    <div class="gd-settings-title">系统管理</div>
    <div class="gd-settings-sub">配置系统权限、流程和字典</div>

    <!-- 模块卡片 -->
    <div class="gd-settings-module-grid">
      ${modules.map(m => `
        <div class="gd-settings-module-card" onclick="showNotification('${m.name}功能即将上线')">
          <div class="gd-settings-module-hd">
            <div class="gd-settings-module-icon" style="background:${m.iconBg};">${m.icon}</div>
            <div>
              <div class="gd-settings-module-name">${m.name}</div>
              <div class="gd-settings-module-desc">${m.desc}</div>
            </div>
          </div>
          <div class="gd-settings-module-items">
            ${m.items.map(i => `<div class="gd-settings-module-item"><div class="gd-settings-dot" style="background:${m.color};"></div>${i}</div>`).join('')}
          </div>
        </div>`).join('')}
    </div>

    <div class="gd-card" style="margin-bottom:16px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:18px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
        <div class="gd-section-title" style="margin:0;">系统配置</div>
      </div>
      <div style="margin-bottom:16px;">
        <div style="font-size:0.86rem;font-weight:600;color:#374151;margin-bottom:10px;">通知配置</div>
        ${[['工单派发通知','工单被派发时通知处理人'],['到期提醒通知','工单临近期望完成时间时发送提醒'],['催办通知','工单被催办时通知处理人'],['状态变更通知','工单状态变更时通知提交人']].map(([n,d]) => `
          <div class="gd-notify-item">
            <div><div style="font-size:0.88rem;font-weight:500;color:#111827;">${n}</div><div style="font-size:0.78rem;color:#6B7280;margin-top:2px;">${d}</div></div>
            <input type="checkbox" class="gd-toggle" checked>
          </div>`).join('')}
      </div>
      <div style="display:flex;justify-content:flex-end;padding-top:14px;border-top:1px solid #E5E7EB;">
        <button class="gd-btn gd-btn-primary" onclick="showNotification('✓ 配置已保存')">保存配置</button>
      </div>
    </div>

    <!-- 系统信息 -->
    <div class="gd-card">
      <div class="gd-section-title">系统信息</div>
      <div class="gd-sys-info-grid">
        <div class="gd-sys-info-item"><div class="gd-sys-info-label">系统版本</div><div class="gd-sys-info-val">小审 3.0</div></div>
        <div class="gd-sys-info-item"><div class="gd-sys-info-label">更新时间</div><div class="gd-sys-info-val">2026-03-01</div></div>
        <div class="gd-sys-info-item"><div class="gd-sys-info-label">在线用户</div><div class="gd-sys-info-val">28 人</div></div>
        <div class="gd-sys-info-item"><div class="gd-sys-info-label">系统状态</div><div class="gd-sys-info-val ok">运行正常</div></div>
      </div>
    </div>`;
}

/* ═══════════════════════════════════════════════════════
   工单详情抽屉
   ═══════════════════════════════════════════════════════ */
const GD_LOGS = {
  WO202603060001: [
    { action:'提交工单', op:'李娜', content:'创建工单：XX集团2025年度财务审计报告盖章', time:'2026-03-06 09:30:00', active:false },
    { action:'派单',     op:'吴刚', content:'将工单派发给张伟处理',                     time:'2026-03-06 09:35:00', active:false },
    { action:'确认接收', op:'张伟', content:'已确认接收工单',                           time:'2026-03-06 09:40:00', active:false },
    { action:'开始处理', op:'张伟', content:'已联系合伙人办公室，正在协调盖章事宜',     time:'2026-03-06 10:00:00', active:true  },
  ],
};

function gdOpenDetail(id) {
  const order = GD_WORK_ORDERS.find(o => o.id === id);
  if (!order) return;

  const logs = GD_LOGS[id] || [{ action:'提交工单', op:order.submitter, content:`创建工单：${order.title}`, time:order.submitTime, active:true }];

  const inner = document.getElementById('gd-drawer-inner');
  if (!inner) return;

  inner.innerHTML = `
    <div class="gd-drawer-header">
      <div>
        <div class="gd-drawer-id">${order.id}</div>
        <div class="gd-drawer-title">${order.title}</div>
      </div>
      <button class="gd-drawer-close" onclick="gdCloseDetail()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <!-- 标签行 -->
    <div style="display:flex;gap:8px;margin-bottom:18px;flex-wrap:wrap;">
      ${gdStatusTag(order.status)} ${gdPriorityTag(order.priority)}
      <span class="gd-tag gd-tag-purple">${order.woType || order.type || ''}</span>
      ${order.serviceModule ? `<span class="gd-tag gd-tag-blue">${order.serviceModule}</span>` : ''}
    </div>

    <!-- 基本信息 -->
    <div class="gd-drawer-meta">
      <div class="gd-drawer-meta-item"><div class="gd-dm-label">提交部门</div><div class="gd-dm-val">${order.dept}</div></div>
      <div class="gd-drawer-meta-item"><div class="gd-dm-label">提交人</div><div class="gd-dm-val">${order.submitter}</div></div>
      <div class="gd-drawer-meta-item"><div class="gd-dm-label">项目组跟进人</div><div class="gd-dm-val">${order.projectFollower || order.submitter || '—'}</div></div>
      <div class="gd-drawer-meta-item"><div class="gd-dm-label">处理人</div><div class="gd-dm-val">${order.handler || '待分派'}</div></div>
      <div class="gd-drawer-meta-item"><div class="gd-dm-label">提交时间</div><div class="gd-dm-val">${order.submitTime}</div></div>
      <div class="gd-drawer-meta-item"><div class="gd-dm-label">期望完成时间</div><div class="gd-dm-val" style="color:#EF4444;">${order.expectedTime}</div></div>
    </div>

    <!-- 描述 -->
    <div class="gd-drawer-section-title">工单描述</div>
    <div class="gd-drawer-desc">${order.desc}</div>

    <!-- 附件 -->
    ${order.attachments && order.attachments.length ? `
      <div class="gd-drawer-section-title">附件</div>
      <div class="gd-drawer-attachments">
        ${order.attachments.map(a => `
          <div class="gd-attachment-tag">
            <svg viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" width="13" height="13"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            ${a}
          </div>`).join('')}
      </div>` : ''}

    <!-- 操作日志 -->
    <div class="gd-drawer-section-title" style="margin-top:8px;">操作日志</div>
    <div class="gd-log-list">
      ${logs.map(l => `
        <div class="gd-log-item">
          <div class="gd-log-dot ${l.active?'active':''}"></div>
          <div class="gd-log-body">
            <div class="gd-log-action">${l.action} <span class="gd-log-op">· ${l.op}</span></div>
            <div class="gd-log-content">${l.content}</div>
            <div class="gd-log-time">${l.time}</div>
          </div>
        </div>`).join('')}
    </div>

    <!-- 操作区：接单（交付中心角色可用）-->
    ${order.status === '待接单' ? `
    <div class="wo-drawer-actions">
      <button class="wo-take-btn" onclick="woTakeOrder('${order.id}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="14" height="14">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        接单
      </button>
      <span style="font-size:.78rem;color:var(--text-tertiary);">接单后发起人不可撤回/编辑</span>
    </div>` : ''}
    ${order.status === '资源调度中' || order.status === '业务处理中' ? `
    <div class="wo-drawer-actions">
      <button class="wo-take-btn" style="background:#10B981;" onclick="gdSubmitDelivery('${order.id}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="14" height="14">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        提交交付
      </button>
      <span style="font-size:.78rem;color:var(--text-tertiary);">上传交付物并完成内部复核后提交</span>
    </div>` : ''}`;

  document.getElementById('gd-detail-drawer')?.classList.add('open');
  document.getElementById('gd-drawer-overlay')?.classList.add('open');
}

function gdCloseDetail() {
  document.getElementById('gd-detail-drawer')?.classList.remove('open');
  document.getElementById('gd-drawer-overlay')?.classList.remove('open');
}

/* 服务方：提交交付，状态流转至"待验收确认" */
function gdSubmitDelivery(id) {
  const order = GD_WORK_ORDERS.find(o => o.id === id);
  if (!order) return;
  if (!confirm(`确认提交交付「${order.title}」？\n提交后项目组将收到验收通知。`)) return;
  order.status = '待验收确认';
  showNotification(`工单 ${id} 交付已提交，等待项目组验收`);
  if (typeof gdRenderWorkOrders === 'function') gdRenderWorkOrders();
  gdOpenDetail(id);
}

/* ═══════════════════════════════════════════════════════
   提交工单 Modal
   ═══════════════════════════════════════════════════════ */
function gdOpenSubmit() {
  const body = document.getElementById('gd-submit-body');
  if (!body) return;

  body.innerHTML = `
    <div>
      <label style="font-size:0.82rem;font-weight:500;color:#374151;display:block;margin-bottom:5px;">工单标题 <span style="color:#EF4444;">*</span></label>
      <input id="gd-sub-title" class="gd-filter-input" style="display:block;width:100%;box-sizing:border-box;" placeholder="请输入工单标题">
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div>
        <label style="font-size:0.82rem;font-weight:500;color:#374151;display:block;margin-bottom:5px;">工单类型 <span style="color:#EF4444;">*</span></label>
        <select id="gd-sub-type" class="gd-filter-input">
          <option value="">请选择类型</option>
          ${['年审','专项','盖章','资料调取','报告','报备','系统问题'].map(t => `<option value="${t}">${t}</option>`).join('')}
        </select>
      </div>
      <div>
        <label style="font-size:0.82rem;font-weight:500;color:#374151;display:block;margin-bottom:5px;">优先级 <span style="color:#EF4444;">*</span></label>
        <select id="gd-sub-priority" class="gd-filter-input">
          <option value="普通">普通</option>
          <option value="紧急">紧急</option>
          <option value="特急">特急</option>
        </select>
      </div>
    </div>
    <div>
      <label style="font-size:0.82rem;font-weight:500;color:#374151;display:block;margin-bottom:5px;">期望完成时间</label>
      <input id="gd-sub-time" type="date" class="gd-filter-input" style="display:block;width:100%;box-sizing:border-box;">
    </div>
    <div>
      <label style="font-size:0.82rem;font-weight:500;color:#374151;display:block;margin-bottom:5px;">工单描述</label>
      <textarea id="gd-sub-desc" class="gd-filter-input" style="display:block;width:100%;height:80px;resize:vertical;box-sizing:border-box;font-family:inherit;" placeholder="请详细描述工单内容和要求"></textarea>
    </div>`;

  const confirmBtn = document.getElementById('gd-submit-confirm');
  if (confirmBtn) {
    confirmBtn.onclick = null;
    confirmBtn.addEventListener('click', gdConfirmSubmit);
  }

  const modal = document.getElementById('gd-submit-modal');
  if (modal) { modal.style.display = 'flex'; modal.setAttribute('aria-hidden','false'); }
}

function gdCloseSubmit() {
  const modal = document.getElementById('gd-submit-modal');
  if (modal) { modal.style.display = 'none'; modal.setAttribute('aria-hidden','true'); }
}

function gdConfirmSubmit() {
  const title    = document.getElementById('gd-sub-title')?.value.trim();
  const type     = document.getElementById('gd-sub-type')?.value;
  const priority = document.getElementById('gd-sub-priority')?.value;
  const desc     = document.getElementById('gd-sub-desc')?.value.trim();

  if (!title) { showNotification('请填写工单标题'); return; }
  if (!type)  { showNotification('请选择工单类型'); return; }

  const now = new Date();
  const pad = n => String(n).padStart(2,'0');
  const submitTime = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const seq = String(GD_WORK_ORDERS.length + 1).padStart(4,'0');
  const newId = `WO${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}${seq}`;

  GD_WORK_ORDERS.unshift({
    id: newId, title, type, dept: '审计一部', submitter: '吴刚', projectFollower: '吴刚',
    submitTime, expectedTime: '—', handler: '', status: '待分派',
    priority, desc: desc || '（无描述）', attachments: [],
  });

  gdCloseSubmit();
  showNotification(`✓ 工单已提交，编号 ${newId}`);
  if (gdState.currentTab === 'workorders') gdRenderWorkOrders();
}

/* ═══════════════════════════════════════════════════════
   图表渲染工具函数
   ═══════════════════════════════════════════════════════ */

/** 渲染 donut SVG */
function gdRenderDonut(data) {
  if (!Array.isArray(data) || !data.length) {
    return `<div style="width:140px;height:140px;border-radius:50%;border:12px solid #E5E7EB;display:flex;align-items:center;justify-content:center;font-size:0.82rem;color:#9CA3AF;flex-shrink:0;">暂无数据</div>`;
  }
  const total = data.reduce((s,d) => s+d.value, 0);
  if (!total) {
    return `<div style="width:140px;height:140px;border-radius:50%;border:12px solid #E5E7EB;display:flex;align-items:center;justify-content:center;font-size:0.82rem;color:#9CA3AF;flex-shrink:0;">暂无数据</div>`;
  }
  const R = 55; const cx = 70; const cy = 70; const C = 2*Math.PI*R;
  let offset = 0;
  const segments = data.map(d => {
    const pct = d.value / total;
    const dash = pct * C;
    const ro   = -(offset * C);
    const seg  = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${d.color}" stroke-width="20"
      stroke-dasharray="${dash} ${C - dash}" stroke-dashoffset="${ro}"
      transform="rotate(-90 ${cx} ${cy})"/>`;
    offset += pct;
    return seg;
  }).join('');
  return `<svg width="140" height="140" viewBox="0 0 140 140" style="flex-shrink:0;">${segments}
    <circle cx="${cx}" cy="${cy}" r="${R-12}" fill="white"/>
    <text x="${cx}" y="${cy-4}" text-anchor="middle" fill="#111827" font-size="14" font-weight="700">${total}</text>
    <text x="${cx}" y="${cy+12}" text-anchor="middle" fill="#9CA3AF" font-size="9">总计</text>
  </svg>`;
}

/** 渲染水平 CSS 柱状图 */
function gdRenderBarList(data, defaultColor) {
  if (!Array.isArray(data) || !data.length) {
    return `<div style="font-size:0.82rem;color:#9CA3AF;padding:12px 0;">暂无数据</div>`;
  }
  const max = Math.max(...data.map(d => d.value));
  return data.map(d => `
    <div class="gd-bar-row">
      <div class="gd-bar-row-label">${d.name}</div>
      <div class="gd-bar-track">
        <div class="gd-bar-fill" style="width:${max>0?(d.value/max*100)|0:0}%;background:${d.color||defaultColor};"></div>
      </div>
      <div class="gd-bar-row-val">${d.value}</div>
    </div>`).join('');
}

/** 渲染折线趋势图 */
function gdRenderLineChart(data) {
  const maxSub = Math.max(...data.map(d=>d.sub));
  const h = 120; const w = 380;
  const pts = (key) => data.map((d,i) => `${(i/(data.length-1))*w},${h - (d[key]/Math.max(maxSub,1))*h}`).join(' ');
  return `<svg viewBox="0 0 ${w} ${h+18}" width="100%">
    ${[0, Math.round(maxSub/2), maxSub].map(v=>`
      <line x1="0" y1="${h-(v/Math.max(maxSub,1))*h}" x2="${w}" y2="${h-(v/Math.max(maxSub,1))*h}" stroke="#F3F4F6" stroke-width="1"/>
    `).join('')}
    <polyline points="${pts('sub')}"  fill="none" stroke="#3B82F6" stroke-width="2"/>
    <polyline points="${pts('done')}" fill="none" stroke="#10B981" stroke-width="2"/>
    <polyline points="${pts('ot')}"   fill="none" stroke="#EF4444" stroke-width="2"/>
    ${data.map((d,i)=>`<text x="${(i/(data.length-1))*w}" y="${h+14}" fill="#9CA3AF" font-size="10" text-anchor="middle">${d.date}</text>`).join('')}
  </svg>
  <div style="display:flex;gap:14px;margin-top:4px;">
    ${[['#3B82F6','提交'],['#10B981','完成'],['#EF4444','超时']].map(([c,l])=>`
      <div style="display:flex;align-items:center;gap:4px;font-size:0.74rem;color:#374151;">
        <div style="width:14px;height:3px;background:${c};border-radius:2px;"></div>${l}
      </div>`).join('')}
  </div>`;
}

/* ═══════════════════════════════════════════════════════
   统计报表 — 仪表盘配置
   ═══════════════════════════════════════════════════════ */

const GD_DASHBOARD_CHARTS = [];

const GD_CHART_TYPES = [
  { id:'bar',    name:'柱状图',   icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="6" width="4" height="15" rx="1"/><rect x="17" y="2" width="4" height="19" rx="1"/></svg>' },
  { id:'line',   name:'折线图',   icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><polyline points="3 17 9 11 13 15 21 7"/><circle cx="3" cy="17" r="1.5" fill="currentColor"/><circle cx="9" cy="11" r="1.5" fill="currentColor"/><circle cx="13" cy="15" r="1.5" fill="currentColor"/><circle cx="21" cy="7" r="1.5" fill="currentColor"/></svg>' },
  { id:'pie',    name:'饼图',     icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>' },
  { id:'hbar',   name:'条形图',   icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><rect x="3" y="3" width="12" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="17" width="8" height="4" rx="1"/></svg>' },
  { id:'combo',  name:'组合图',   icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><rect x="3" y="14" width="4" height="7" rx="1"/><rect x="10" y="10" width="4" height="11" rx="1"/><rect x="17" y="6" width="4" height="15" rx="1"/><polyline points="3 10 10 4 17 8 21 3" stroke="#3B82F6" stroke-width="2"/></svg>' },
  { id:'table',  name:'表格',     icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>' },
  { id:'cloud',  name:'词云',     icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>' },
  { id:'kpi',    name:'指标卡',   icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><text x="4" y="17" font-size="14" font-weight="700" fill="currentColor" stroke="none">123</text></svg>' },
  { id:'text',   name:'文本',     icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><path d="M4 7V4h16v3"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="8" y1="20" x2="16" y2="20"/></svg>' },
];

const GD_BAR_SUBTYPES = [
  { id:'grouped', name:'柱状图' },
  { id:'stacked', name:'堆积柱状图' },
  { id:'percent', name:'百分比堆积柱状图' },
];

const GD_THEME_PALETTES = [
  ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4','#6366F1'],
  ['#1D4ED8','#047857','#B45309','#B91C1C','#6D28D9','#BE185D','#0E7490','#4338CA'],
  ['#60A5FA','#34D399','#FCD34D','#FCA5A5','#C4B5FD','#F9A8D4','#67E8F9','#A5B4FC'],
  ['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#9B59B6','#E67E22','#1ABC9C','#34495E'],
];

const GD_CHART_DATASOURCES = [
  { id:'wo-summary', name:'工单总览' },
  { id:'wo-status', name:'工单状态统计' },
  { id:'wo-type',   name:'工单类型分布' },
  { id:'wo-dept',   name:'部门工单量' },
  { id:'wo-trend',  name:'工单趋势（近7日）' },
  { id:'wo-eff',    name:'处理效率' },
  { id:'wo-perf',   name:'人员绩效' },
];

const GD_CHART_FIELDS = {
  'wo-summary': ['工单总数','待接单','已接单','待验收','验收通过','已驳回'],
  'wo-status':  ['状态','数量'],
  'wo-type':    ['工单类型','数量'],
  'wo-dept':    ['部门','工单量'],
  'wo-trend':   ['日期','提交数','完成数','超时数'],
  'wo-eff':     ['部门','平均处理时长','超时率'],
  'wo-perf':    ['姓名','接单量','完成量','及时率'],
};

const GD_SORT_OPTIONS = ['横轴值','纵轴值'];
const GD_SORT_DIRS = ['选项正序','选项倒序'];

let gdChartWiz = {
  chartType: 'bar',
  barSubType: 'grouped',
  paletteIdx: 0,
  datasource: 'wo-status',
  xField: '',
  sortBy: '横轴值',
  sortDir: '选项正序',
  xField2: '',
  chartName: '',
};

function gdResetChartWiz() {
  gdChartWiz = {
    chartType: 'bar', barSubType: 'grouped', paletteIdx: 0,
    datasource: 'wo-status', xField: '', sortBy: '横轴值',
    sortDir: '选项正序', xField2: '', chartName: '',
  };
}

function gdOpenReportConfig() {
  let overlay = document.getElementById('gd-dashboard-config');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'gd-dashboard-config';
    overlay.className = 'gd-dash-config-overlay';
    document.getElementById('gd-pane-reports').appendChild(overlay);
  }
  overlay.style.display = 'flex';
  gdRenderDashboardConfig();
}

function gdCloseDashboardConfig() {
  const overlay = document.getElementById('gd-dashboard-config');
  if (overlay) overlay.style.display = 'none';
}

function gdRenderDashboardConfig() {
  const overlay = document.getElementById('gd-dashboard-config');
  if (!overlay) return;

  const hasCharts = GD_DASHBOARD_CHARTS.length > 0;

  overlay.innerHTML = `
    <div class="gd-dash-config-topbar">
      <div class="gd-dash-config-left">
        <button class="gd-dash-cfg-add-btn" onclick="gdOpenAddChartModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          添加图表
        </button>
        <button class="gd-dash-cfg-tool-btn" onclick="showNotification('筛选功能演示')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          筛选
        </button>
      </div>
      <div class="gd-dash-config-right">
        <button class="gd-dash-cfg-tool-btn" onclick="showNotification('全屏查看')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          全屏查看
        </button>
        <button class="gd-dash-cfg-close-btn" onclick="gdCloseDashboardConfig()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>

    <div class="gd-dash-config-body ${hasCharts ? 'has-charts' : ''}">
      ${hasCharts ? gdRenderDashboardCharts() : gdRenderEmptyDashboard()}
    </div>

    <div class="gd-dash-watermark-layer">
      ${Array.from({length: 80}, () => '<span class="gd-dash-wm-text">小神审计</span>').join('')}
    </div>`;
}

function gdRenderEmptyDashboard() {
  return `
    <div class="gd-dash-empty">
      <div class="gd-dash-empty-illustrations">
        <div class="gd-dash-empty-card">
          <svg viewBox="0 0 120 80" width="120" height="80">
            <rect x="10" y="40" width="18" height="30" rx="3" fill="#93C5FD"/>
            <rect x="35" y="25" width="18" height="45" rx="3" fill="#60A5FA"/>
            <rect x="60" y="35" width="18" height="35" rx="3" fill="#93C5FD"/>
            <rect x="85" y="20" width="18" height="50" rx="3" fill="#3B82F6"/>
            ${[10,35,60,85].map(x => `<circle cx="${x+9}" cy="75" r="2" fill="#BFDBFE"/>`).join('')}
          </svg>
        </div>
        <div class="gd-dash-empty-card">
          <svg viewBox="0 0 120 80" width="120" height="80">
            <path d="M10 50 Q30 20 50 45 Q70 60 90 25 Q100 15 110 30" fill="none" stroke="#93C5FD" stroke-width="2.5"/>
            <path d="M10 55 Q30 35 50 50 Q70 65 90 35 Q100 28 110 40" fill="none" stroke="#60A5FA" stroke-width="2.5"/>
            ${[10,30,50,70,90,110].map(x => `<circle cx="${x}" cy="75" r="2" fill="#BFDBFE"/>`).join('')}
          </svg>
        </div>
        <div class="gd-dash-empty-card">
          <div class="gd-dash-empty-kpi">
            <span class="gd-dash-empty-yen">¥</span>
            <span class="gd-dash-empty-num">6,023</span>
          </div>
        </div>
      </div>
      <div class="gd-dash-empty-title">用仪表盘实时展示业务趋势</div>
      <div class="gd-dash-empty-desc">可添加柱状图、饼图、折线图等图表展示数据，关注业务动向，快速获取洞察。</div>
      <button class="gd-dash-empty-btn" onclick="gdOpenAddChartModal()">添加图表</button>
    </div>`;
}

function gdRenderDashboardCharts() {
  return `<div class="gd-dash-chart-grid">
    ${GD_DASHBOARD_CHARTS.map((c, i) => `
      <div class="gd-dash-chart-item">
        <div class="gd-dash-chart-header">
          <span class="gd-dash-chart-title">${c.name || c.chartType + '图表'}</span>
          <div class="gd-dash-chart-actions">
            <button class="gd-dash-chart-act-btn" onclick="gdRemoveDashChart(${i})" title="删除">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
        <div class="gd-dash-chart-body">${gdRenderMockChart(c)}</div>
      </div>`).join('')}
  </div>`;
}

function gdRemoveDashChart(idx) {
  GD_DASHBOARD_CHARTS.splice(idx, 1);
  gdRenderDashboardConfig();
}

function gdRenderMockChart(c) {
  const pal = GD_THEME_PALETTES[c.paletteIdx || 0];
  switch (c.chartType) {
    case 'bar': return gdMockBarChart(c, pal);
    case 'line': return gdMockLineChart(c, pal);
    case 'pie': return gdMockPieChart(c, pal);
    case 'hbar': return gdMockHBarChart(c, pal);
    case 'kpi': return gdMockKpiChart(c, pal);
    default: return gdMockBarChart(c, pal);
  }
}

function gdMockBarChart(c, pal) {
  const ds = c.datasource;
  let data;
  if (ds === 'wo-status') {
    data = [
      {label:'待接单', value: GD_WORK_ORDERS.filter(o=>o.status==='待接单').length},
      {label:'已接单', value: GD_WORK_ORDERS.filter(o=>o.status==='已接单').length},
      {label:'待验收', value: GD_WORK_ORDERS.filter(o=>o.status==='待验收').length},
      {label:'验收通过', value: GD_WORK_ORDERS.filter(o=>o.status==='验收通过').length},
      {label:'已驳回', value: GD_WORK_ORDERS.filter(o=>o.status==='已驳回').length},
    ];
  } else if (ds === 'wo-type') {
    data = GD_TYPE_STATS.map(d => ({label:d.name, value:d.value}));
  } else if (ds === 'wo-dept') {
    data = GD_DEPT_STATS.map(d => ({label:d.name, value:d.value}));
  } else {
    data = [{label:'数据A', value:5},{label:'数据B', value:3},{label:'数据C', value:7}];
  }
  const maxV = Math.max(...data.map(d=>d.value), 1);
  const w = 400, h = 200, barW = Math.min(40, (w-40)/data.length - 8);
  return `<svg viewBox="0 0 ${w} ${h+30}" width="100%" style="max-width:100%;">
    ${[0,1,2,3,4].map(i => {
      const v = Math.round(maxV/4*i);
      const y = h - (i/4)*h;
      return `<line x1="30" y1="${y}" x2="${w}" y2="${y}" stroke="#F3F4F6" stroke-width="1"/>
        <text x="26" y="${y+4}" fill="#9CA3AF" font-size="10" text-anchor="end">${v}</text>`;
    }).join('')}
    ${data.map((d, i) => {
      const x = 40 + i * ((w-50)/data.length);
      const bh = (d.value/maxV) * h;
      return `<rect x="${x}" y="${h-bh}" width="${barW}" height="${bh}" rx="3" fill="${pal[i % pal.length]}"/>
        <text x="${x + barW/2}" y="${h-bh-6}" fill="#374151" font-size="10" text-anchor="middle" font-weight="600">${d.value}</text>
        <text x="${x + barW/2}" y="${h+16}" fill="#6B7280" font-size="9" text-anchor="middle">${d.label}</text>`;
    }).join('')}
  </svg>`;
}

function gdMockLineChart(c, pal) {
  const data = GD_TREND_STATS.length > 0 ? GD_TREND_STATS : [{date:'周一',sub:3,done:2,ot:1},{date:'周二',sub:5,done:4,ot:0},{date:'周三',sub:2,done:3,ot:1}];
  const maxV = Math.max(...data.map(d => Math.max(d.sub,d.done,d.ot)),1);
  const w = 400, h = 180;
  const pts = (key) => data.map((d,i) => `${40+(i/(data.length-1))*(w-50)},${h-(d[key]/maxV)*h}`).join(' ');
  return `<svg viewBox="0 0 ${w} ${h+30}" width="100%" style="max-width:100%;">
    ${[0,1,2,3,4].map(i => {
      const v = Math.round(maxV/4*i); const y = h-(i/4)*h;
      return `<line x1="30" y1="${y}" x2="${w}" y2="${y}" stroke="#F3F4F6" stroke-width="1"/>
        <text x="26" y="${y+4}" fill="#9CA3AF" font-size="10" text-anchor="end">${v}</text>`;
    }).join('')}
    <polyline points="${pts('sub')}" fill="none" stroke="${pal[0]}" stroke-width="2"/>
    <polyline points="${pts('done')}" fill="none" stroke="${pal[1]}" stroke-width="2"/>
    <polyline points="${pts('ot')}" fill="none" stroke="${pal[3]}" stroke-width="2"/>
    ${data.map((d,i)=>`<text x="${40+(i/(data.length-1))*(w-50)}" y="${h+16}" fill="#9CA3AF" font-size="9" text-anchor="middle">${d.date}</text>`).join('')}
  </svg>
  <div style="display:flex;gap:12px;margin-top:4px;justify-content:center;">
    ${[['提交',pal[0]],['完成',pal[1]],['超时',pal[3]]].map(([l,c2])=>`
      <div style="display:flex;align-items:center;gap:4px;font-size:0.72rem;color:#6B7280;">
        <div style="width:12px;height:3px;background:${c2};border-radius:2px;"></div>${l}
      </div>`).join('')}
  </div>`;
}

function gdMockPieChart(c, pal) {
  const data = GD_TYPE_STATS.length > 0 ? GD_TYPE_STATS : [{name:'A',value:5},{name:'B',value:3},{name:'C',value:4}];
  const total = data.reduce((s,d) => s+d.value, 0);
  const r = 70, cx = 100, cy = 90;
  let startAngle = 0;
  const slices = data.map((d,i) => {
    const angle = (d.value/total) * Math.PI * 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(startAngle + angle);
    const y2 = cy + r * Math.sin(startAngle + angle);
    const large = angle > Math.PI ? 1 : 0;
    const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`;
    startAngle += angle;
    return `<path d="${path}" fill="${pal[i % pal.length]}"/>`;
  });
  return `<div style="display:flex;align-items:center;gap:24px;">
    <svg viewBox="0 0 200 180" width="200" height="180">${slices.join('')}</svg>
    <div style="display:flex;flex-direction:column;gap:6px;">
      ${data.map((d,i) => `
        <div style="display:flex;align-items:center;gap:6px;font-size:0.78rem;color:#374151;">
          <div style="width:10px;height:10px;border-radius:2px;background:${pal[i%pal.length]};"></div>
          ${d.name}: ${d.value}
        </div>`).join('')}
    </div>
  </div>`;
}

function gdMockHBarChart(c, pal) {
  const data = GD_DEPT_STATS.length > 0 ? GD_DEPT_STATS : [{name:'A',value:8},{name:'B',value:5},{name:'C',value:12}];
  const maxV = Math.max(...data.map(d=>d.value), 1);
  return `<div style="display:flex;flex-direction:column;gap:8px;padding:8px 0;">
    ${data.map((d,i) => `
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="width:60px;font-size:0.78rem;color:#374151;text-align:right;">${d.name}</div>
        <div style="flex:1;background:#F3F4F6;border-radius:4px;height:22px;overflow:hidden;">
          <div style="width:${(d.value/maxV)*100}%;height:100%;background:${pal[i%pal.length]};border-radius:4px;transition:width .3s;"></div>
        </div>
        <div style="width:30px;font-size:0.78rem;color:#374151;font-weight:600;">${d.value}</div>
      </div>`).join('')}
  </div>`;
}

function gdMockKpiChart(c, pal) {
  return `<div style="display:flex;align-items:center;justify-content:center;padding:24px 0;">
    <div style="text-align:center;">
      <div style="font-size:2.4rem;font-weight:700;color:${pal[0]};">${GD_WORK_ORDERS.length}</div>
      <div style="font-size:0.82rem;color:#6B7280;margin-top:4px;">工单总数</div>
    </div>
  </div>`;
}

/* ── 添加图表弹窗 ── */

function gdOpenAddChartModal() {
  gdResetChartWiz();
  const fields = GD_CHART_FIELDS[gdChartWiz.datasource] || [];
  if (fields.length > 0) gdChartWiz.xField = fields[0];

  let modal = document.getElementById('gd-add-chart-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'gd-add-chart-modal';
    modal.className = 'gd-chart-modal-overlay';
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';
  gdRenderChartModal();
}

function gdCloseChartModal() {
  const modal = document.getElementById('gd-add-chart-modal');
  if (modal) modal.style.display = 'none';
}

function gdRenderChartModal() {
  const modal = document.getElementById('gd-add-chart-modal');
  if (!modal) return;
  const wiz = gdChartWiz;
  const fields = GD_CHART_FIELDS[wiz.datasource] || [];
  const showBarSub = (wiz.chartType === 'bar');

  modal.innerHTML = `
    <div class="gd-chart-modal">
      <div class="gd-chart-modal-header">
        <div class="gd-chart-modal-tabs">
          <button class="gd-chart-modal-tab active">基础配置</button>
          <button class="gd-chart-modal-tab" onclick="showNotification('更多配置演示')">更多配置</button>
        </div>
        <div class="gd-chart-modal-preview-title">图表</div>
        <button class="gd-chart-modal-close" onclick="gdCloseChartModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="gd-chart-modal-body">
        <div class="gd-chart-modal-config">
          <div class="gd-chart-cfg-section">
            <div class="gd-chart-cfg-label">图表类型</div>
            <div class="gd-chart-type-grid">
              ${GD_CHART_TYPES.map(t => `
                <div class="gd-chart-type-item ${wiz.chartType===t.id?'active':''}"
                     onclick="gdChartWiz.chartType='${t.id}';gdRenderChartModal()">
                  ${t.icon}
                  <span>${t.name}</span>
                </div>`).join('')}
            </div>
          </div>

          ${showBarSub ? `
          <div class="gd-chart-cfg-section">
            <div class="gd-chart-cfg-label">柱状图类型</div>
            <div class="gd-chart-subtype-grid">
              ${GD_BAR_SUBTYPES.map(s => `
                <div class="gd-chart-subtype-item ${wiz.barSubType===s.id?'active':''}"
                     onclick="gdChartWiz.barSubType='${s.id}';gdRenderChartModal()">
                  <div class="gd-chart-subtype-icon gd-subtype-${s.id}"></div>
                  <span>${s.name}</span>
                </div>`).join('')}
            </div>
          </div>` : ''}

          <div class="gd-chart-cfg-section">
            <div class="gd-chart-cfg-label">主题色</div>
            <select class="gd-chart-cfg-select" onchange="gdChartWiz.paletteIdx=+this.value;gdRenderChartModal()">
              ${GD_THEME_PALETTES.map((p, i) => `
                <option value="${i}" ${wiz.paletteIdx===i?'selected':''}>主题 ${i+1}</option>`).join('')}
            </select>
            <div class="gd-chart-palette-preview">
              ${GD_THEME_PALETTES[wiz.paletteIdx].map(c2 => `<div class="gd-palette-dot" style="background:${c2};"></div>`).join('')}
            </div>
          </div>

          <div class="gd-chart-cfg-section">
            <div class="gd-chart-cfg-label">数据源</div>
            <div style="display:flex;gap:6px;align-items:center;">
              <select class="gd-chart-cfg-select" style="flex:1;" onchange="gdChartWiz.datasource=this.value;gdChartWiz.xField=(GD_CHART_FIELDS[this.value]||[])[0]||'';gdRenderChartModal()">
                ${GD_CHART_DATASOURCES.map(d => `
                  <option value="${d.id}" ${wiz.datasource===d.id?'selected':''}>${d.name}</option>`).join('')}
              </select>
              <button class="gd-chart-cfg-filter-btn" onclick="showNotification('数据筛选器演示')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              </button>
            </div>
          </div>

          <div class="gd-chart-cfg-section">
            <div class="gd-chart-cfg-label">横轴（类别）</div>
            <div class="gd-chart-cfg-sub">
              <label class="gd-chart-cfg-sublabel">类别字段</label>
              <select class="gd-chart-cfg-select" onchange="gdChartWiz.xField=this.value;gdRenderChartModal()">
                ${fields.map(f => `<option value="${f}" ${wiz.xField===f?'selected':''}>${f}</option>`).join('')}
              </select>
            </div>
            <div class="gd-chart-cfg-sub">
              <label class="gd-chart-cfg-sublabel">排序依据</label>
              <div style="display:flex;gap:6px;">
                <select class="gd-chart-cfg-select" style="flex:1;" onchange="gdChartWiz.sortBy=this.value">
                  ${GD_SORT_OPTIONS.map(o => `<option ${wiz.sortBy===o?'selected':''}>${o}</option>`).join('')}
                </select>
                <select class="gd-chart-cfg-select" style="flex:1;" onchange="gdChartWiz.sortDir=this.value">
                  ${GD_SORT_DIRS.map(o => `<option ${wiz.sortDir===o?'selected':''}>${o}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="gd-chart-cfg-sub">
              <label class="gd-chart-cfg-sublabel">二级类别字段</label>
              <select class="gd-chart-cfg-select" onchange="gdChartWiz.xField2=this.value">
                <option value="">无</option>
                ${fields.filter(f=>f!==wiz.xField).map(f => `<option value="${f}" ${wiz.xField2===f?'selected':''}>${f}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="gd-chart-cfg-section">
            <div class="gd-chart-cfg-label">图表名称</div>
            <input type="text" class="gd-chart-cfg-input" placeholder="可选，为图表命名"
                   value="${wiz.chartName}" onchange="gdChartWiz.chartName=this.value">
          </div>
        </div>

        <div class="gd-chart-modal-preview">
          <div class="gd-chart-preview-area">
            ${gdRenderChartPreview()}
          </div>
        </div>
      </div>

      <div class="gd-chart-modal-footer">
        <button class="gd-btn gd-btn-outline" onclick="gdCloseChartModal()">取消</button>
        <button class="gd-btn gd-btn-primary" onclick="gdAddChartConfirm()">添加</button>
      </div>
    </div>`;
}

function gdRenderChartPreview() {
  const wiz = gdChartWiz;
  const mockChart = {
    chartType: wiz.chartType,
    datasource: wiz.datasource,
    paletteIdx: wiz.paletteIdx,
    name: wiz.chartName || (GD_CHART_TYPES.find(t=>t.id===wiz.chartType)||{}).name || '图表',
  };
  return gdRenderMockChart(mockChart);
}

function gdAddChartConfirm() {
  const wiz = gdChartWiz;
  GD_DASHBOARD_CHARTS.push({
    chartType: wiz.chartType,
    barSubType: wiz.barSubType,
    paletteIdx: wiz.paletteIdx,
    datasource: wiz.datasource,
    xField: wiz.xField,
    name: wiz.chartName || (GD_CHART_TYPES.find(t=>t.id===wiz.chartType)||{}).name || '图表',
  });
  gdCloseChartModal();
  gdRenderDashboardConfig();
  showNotification('图表添加成功');
}

/* ═══════════════════════════════════════════════════════
   工具函数
   ═══════════════════════════════════════════════════════ */

/** 格式化日期 → YYYY-MM-DD */
function gdFmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

/** 状态 tag */
function gdStatusTag(status) {
  const cls = { '待分派':'gd-tag-gray','待处理':'gd-tag-orange','处理中':'gd-tag-blue','已解决':'gd-tag-green','已关闭':'gd-tag-gray','已驳回':'gd-tag-red' }[status] || 'gd-tag-gray';
  return `<span class="gd-tag ${cls}">${status}</span>`;
}

/** 优先级 tag */
function gdPriorityTag(p) {
  const cls = { '特急':'gd-tag-red','紧急':'gd-tag-orange','普通':'gd-tag-gray' }[p] || 'gd-tag-gray';
  return `<span class="gd-tag ${cls}">${p}</span>`;
}

/** 工单类型 tag（一类/二类/三类） */
function gdWoTypeTag(t) {
  const cls = { '一类工单':'gd-wotype-1','二类工单':'gd-wotype-2','三类工单':'gd-wotype-3' }[t] || 'gd-wotype-3';
  return `<span class="gd-wotype-tag ${cls}">${t}</span>`;
}

/** 排期颜色 */
function gdSchColor(type, priority) {
  if (type === '工单') {
    if (priority === '特急') return { bg:'#EF4444' };
    if (priority === '紧急') return { bg:'#F97316' };
    return { bg:'#3B82F6' };
  }
  return { '休假':'#9CA3AF','出差':'#A855F7','会议':'#22C55E','培训':'#EAB308' }[type]
    ? { bg: { '休假':'#9CA3AF','出差':'#A855F7','会议':'#22C55E','培训':'#EAB308' }[type] }
    : { bg:'#6B7280' };
}

/** 用户状态 tag class */
function gdStatusClass(s) {
  return { '空闲':'gd-tag-green','忙碌':'gd-tag-orange','休假':'gd-tag-gray','出差':'gd-tag-blue' }[s] || 'gd-tag-gray';
}

/** 工作量颜色 */
function gdWorkloadColor(w) {
  if (w === 0) return '#059669';
  if (w <= 3)  return '#2563EB';
  if (w <= 5)  return '#D97706';
  return '#DC2626';
}

/** 用户状态提示 */
function gdUserHint(u) {
  if (u.status === '空闲')  return '✓ 推荐派单';
  if (u.status === '忙碌')  return u.workload <= 5 ? '可派单' : '负荷较重';
  if (u.status === '休假')  return '休假中，不建议派单';
  if (u.status === '出差')  return '出差中';
  return '';
}

/** 用户头像背景色（根据姓名首字哈希） */
function gdAvatarColor(name) {
  const colors = ['#3B82F6','#6366F1','#8B5CF6','#EC4899','#F59E0B','#10B981','#06B6D4','#EF4444'];
  return colors[name.charCodeAt(0) % colors.length];
}
