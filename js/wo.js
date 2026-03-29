/* ══════════════════════════════════════════════════════════
   工单发起与管理系统 · wo.js  v1.0
   依赖：GD_WORK_ORDERS (gd.js)、currentDetailWs / WORKSPACE_DATA (app.js)
   功能：
     1. 类型选择器（一类 / 二类 / 三类）
     2. 多步骤发起向导
     3. 项目作业区工单管理面板
     4. 工单操作：接单 / 撤回 / 验收通过 / 驳回
   ══════════════════════════════════════════════════════════ */

/* ─── 服务模块枚举定义（与设计文档保持同步）─── */
const WO_C2_DEFAULT_PROVIDER = '交付中心';
const WO_C2_DEFAULT_MODULE = '数据';
const WO_C3_DEFAULT_PROVIDER = '交付中心';
const WO_C3_DEFAULT_MODULE = '底稿';

const WO_MOD_DEF = [
  { key: '数据', desc: '账套数据清洗、科目映射与核查', sub: ['账套处理', '未审明细表', '底稿明细预填'],
    c1Extra: [
      { field: 'ledgerCount',      label: '账套数量',         type: 'number', placeholder: '请输入整数' },
      { field: 'ledgerExpectTime',  label: '预计账套提供时间', type: 'date' },
    ] },
  { key: '试算', desc: '试算平衡表生成、勾稽关系验证', sub: ['试算搭建', '试算填充'],
    c1Extra: [
      { field: 'entityCount',      label: '主体数量',         type: 'number', placeholder: '请输入整数' },
      { field: 'dataExpectTime',   label: '预计账套提供时间', type: 'date' },
    ] },
  { key: '报告', desc: '审计报告编制与格式化输出', sub: ['报告编制', '报告复核'],
    c1Extra: [
      { field: 'entityCount',      label: '主体数量',                             type: 'number', placeholder: '请输入整数' },
      { field: 'trialBalanceTime', label: '预计终版试算（含附表 1-3）提供时间', type: 'date' },
    ] },
  { key: '函证', desc: '函证编制与发送', sub: ['银行纸质函证-制函', '往来函证-制函'],
    c1Extra: [
      { field: 'entityCount',      label: '主体数量',         type: 'number', placeholder: '请输入整数' },
      { field: 'materialExpectTime',label: '预计资料提供时间', type: 'date' },
    ] },
  { key: '底稿', desc: '审计底稿编制与整理',
    c1Extra: [
      { field: 'entityCount',          label: '主体数量',               type: 'number', placeholder: '请输入整数' },
      { field: 'dataExpectTime',       label: '预计账套提供时间',       type: 'date' },
      { field: 'materialAllExpectTime',label: '预计整体资料提供时间',   type: 'date' },
    ] },
];

/* ─── 状态 → CSS 类映射 ─── */
const WO_STATUS_CLS = {
  '待启用':    'wo-st-purple',
  '待接单':    'wo-st-blue',
  '已接单':    'wo-st-orange',
  '待验收':    'wo-st-yellow',
  '已驳回':    'wo-st-red',
  '验收通过':  'wo-st-green',
};

/* ─── 向导运行时状态 ─── */
const woWiz = {
  type: null,   // '一类工单' | '二类工单' | '三类工单'
  step: 1,
  ws:   null,   // 发起时所在工作区对象
  /* 一类（三步合一） */
  c1Title: '', c1Provider: '交付中心',
  c1PriorAuditDate: '', c1PlanReportDate: '', c1DeliveryDeadline: '',
  c1Modules: {},
  /* 二类 */
  c2Provider: WO_C2_DEFAULT_PROVIDER, c2Module: WO_C2_DEFAULT_MODULE, c2ModuleSub: '账套处理',
  c2Companies: new Set(), c2SubjectKeys: new Set(), c2SubjectKeyword: '', c2NeedComm: false, c2ServiceFlags: {},
  c2LedgerExpectTime: '', c2DataExpectTime: '', c2TrialBalanceTime: '', c2MaterialExpectTime: '',
  c2ExpectedTime: '', c2UseLedger: false,
  c2ReqFiles: [], c2OptFiles: [],
  /* 三类 */
  c3Provider: WO_C3_DEFAULT_PROVIDER, c3Module: WO_C3_DEFAULT_MODULE, c3ModuleSub: '',
  c3Companies: new Set(),
  c3UnboundCompanies: [],
  c3UseLedger: false,
  c3ReqFiles: [],
  c3DataExpectTime: '', c3MaterialTime: '', c3ExpectedTime: '',
  c3Note: '',
};

/* ─── 工单管理面板筛选状态 ─── */
const woMgr = {
  wsId: '',
  keyword: '',
  status: '',
  view: 'list',
  poolTab: 'class1',
  page: 1,
  pageSize: 8,
  selectedIds: new Set(),
  scheduleWsId: '',
  scheduleDate: null,
  scheduleTimeMode: 'week',
  scheduleCustomStart: '',
  scheduleCustomEnd: '',
  scheduleCustomPickerOpen: false,
  scheduleCustomPickerMonth: null,
  scheduleCustomDraftStart: '',
  scheduleCustomDraftEnd: '',
  schedulePoolFilters: [],
  scheduleFilterMenu: '',
};

const WO_MGR_VIEW_TABS = [
  { key: 'list', label: '工单列表' },
  { key: 'schedule', label: '工单排期' },
];

const WO_POOL_TABS = [
  { key: 'class1', label: '一类工单' },
  { key: '数据', label: '数据池' },
  { key: '试算', label: '试算池' },
  { key: '报告', label: '报告池' },
  { key: '函证', label: '函证池' },
  { key: '底稿', label: '底稿池' },
];

const WO_SCHEDULE_LEGEND_ORDER = ['一类工单', '数据', '试算', '底稿', '函证', '报告'];

const WO_SCHEDULE_MODULE_PALETTE = {
  一类工单: { bg: '#CCFBF1', text: '#0F766E', border: '#2DD4BF' },
  数据: { bg: '#DBEAFE', text: '#1D4ED8', border: '#60A5FA' },
  试算: { bg: '#EDE9FE', text: '#6D28D9', border: '#A78BFA' },
  报告: { bg: '#FCE7F3', text: '#BE185D', border: '#F472B6' },
  函证: { bg: '#FEF3C7', text: '#B45309', border: '#FBBF24' },
  底稿: { bg: '#DCFCE7', text: '#15803D', border: '#4ADE80' },
  其他: { bg: '#E5E7EB', text: '#374151', border: '#9CA3AF' },
};

const WO_WS_MOCK_SEEDED = new Set();
let woVisibleSelectableIds = [];
let woBatchDispatchOrderIds = [];
let woBatchSelectedMemberId = '';
let woBatchMemberKeyword = '';
let woBatchMemberKeywordComposing = false;
let woBatchDispatchNote = '';
let woMgrKeywordComposing = false;
let woScheduleOutsideCloseBound = false;

/* ─── 驳回操作目标 ─── */
let woRejectTargetId = null;

/* ─── 批量合并提交状态 ─── */
const woBatchMerge = {
  active: false,
  sourceOrders: [],
  parentOrderId: '',
  serviceModule: '',
  moduleKey: '',
  moduleSub: '',
  provider: '',
};

const WO_BATCH_MERGE_MODULES = [
  '数据-账套处理', '数据-未审明细表', '数据-底稿明细预填',
  '试算-试算搭建', '试算-试算填充',
  '报告-报告编制', '报告-报告复核',
  '函证-银行纸质函证-制函',
];

function woBatchMergePreFillSubjects() {
  if (!woBatchMerge.active) return;
  const ws = woWiz.ws;
  const options = woGetC2SubjectOptions(ws);
  const sourceCompanies = new Set(
    woBatchMerge.sourceOrders.flatMap(o => (o.company || '').split('、').map(s => s.trim())).filter(Boolean)
  );
  const matchedKeys = new Set();
  options.forEach(opt => {
    const names = opt.companyNames || [opt.name];
    if (names.some(n => sourceCompanies.has(n))) matchedKeys.add(opt.key);
  });
  woWiz.c2SubjectKeys = matchedKeys;
  woWiz.c2Companies = new Set(woGetC2SelectedCompanies(options));
}

function woResetBatchMerge() {
  woBatchMerge.active = false;
  woBatchMerge.sourceOrders = [];
  woBatchMerge.parentOrderId = '';
  woBatchMerge.serviceModule = '';
  woBatchMerge.moduleKey = '';
  woBatchMerge.moduleSub = '';
  woBatchMerge.provider = '';
}

/* ════════════════════════════════════════
   辅助函数
   ════════════════════════════════════════ */

function woNow() {
  const n = new Date(), p = v => String(v).padStart(2, '0');
  return `${n.getFullYear()}-${p(n.getMonth()+1)}-${p(n.getDate())} ${p(n.getHours())}:${p(n.getMinutes())}`;
}

/* 返回当前日期 +offsetDays 的 yyyy-MM-dd 字符串，用于 input[type=date] 的 min 属性 */
function woMinDate(offsetDays = 3) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const p = v => String(v).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
}

function woGenId() {
  const n = new Date();
  const d = `${n.getFullYear()}${String(n.getMonth()+1).padStart(2,'0')}${String(n.getDate()).padStart(2,'0')}`;
  const seq = String(GD_WORK_ORDERS.filter(o => o.id && o.id.startsWith('WO'+d)).length + 1).padStart(4, '0');
  return `WO${d}${seq}`;
}

function woGenTitle(type) {
  const ws = woWiz.ws || currentDetailWs;
  if (!ws) return '';
  /* 一类工单标题使用工作区主体公司名称（entity），与 Step1 展示保持一致 */
  const company = ws.entity || ws.group || ws.bindingRows?.[0]?.name || '';
  const pfx = type === '一类工单' ? '一类' : type === '二类工单' ? '二类' : '三类';
  const seq = String(GD_WORK_ORDERS.filter(o => o.woType === type && o.workspace === ws.name).length + 1).padStart(3, '0');
  return `${pfx}工单-${company}-${seq}`;
}

function woStatusBadge(status) {
  return `<span class="wo-status-badge ${WO_STATUS_CLS[status] || ''}">${status}</span>`;
}

/* 复用 gd.js 中的类型徽章样式 */
function woTypeBadge(type) {
  const cls = { '一类工单': 'gd-wotype-1', '二类工单': 'gd-wotype-2', '三类工单': 'gd-wotype-3' };
  return `<span class="gd-wotype-tag ${cls[type] || ''}">${type || '—'}</span>`;
}

function woNormModule(mod) {
  if (!mod) return '';
  if (String(mod).includes('制函') || String(mod).includes('函证')) return '函证';
  if (String(mod).includes('数据')) return '数据';
  if (String(mod).includes('试算')) return '试算';
  if (String(mod).includes('报告')) return '报告';
  if (String(mod).includes('底稿')) return '底稿';
  return String(mod);
}

function woProviderOrgIdByName(name) {
  const dynamicId = typeof GD_DELIVERY_ORGS !== 'undefined' && Array.isArray(GD_DELIVERY_ORGS)
    ? GD_DELIVERY_ORGS.find(item => item.name === name)?.id
    : '';
  if (dynamicId) return dynamicId;
  return {
    '交付中心': 'org-delivery-1',
    '业务一部后台': 'org-backoffice-1',
    '业务二部后台': 'org-backoffice-2',
  }[name] || '';
}

function woProviderName(order) {
  return order.providerOrgName || order.provider || order.serviceProvider || '—';
}

function woStatusHtml(status) {
  if (typeof gdStatusTag === 'function') return gdStatusTag(status);
  return woStatusBadge(status);
}

function woCurrentUserName() {
  return (typeof GD_CURRENT_USER !== 'undefined' && GD_CURRENT_USER?.name)
    ? GD_CURRENT_USER.name
    : '张伟';
}

function woCurrentUserDept(ws = currentDetailWs) {
  if (typeof GD_CURRENT_USER !== 'undefined' && GD_CURRENT_USER?.dept) return GD_CURRENT_USER.dept;
  return ws?.dept || '';
}

function woWorkspaceMeta(order) {
  if (typeof gdGetOrderWorkspaceMeta === 'function') return gdGetOrderWorkspaceMeta(order);
  return {
    dept: order.workspaceDept || order.dept || '',
    group: order.workspaceGroup || '',
  };
}

function woProjectFollowerName(order) {
  return order.projectFollower || order.submitter || '—';
}

function woCanAssignProjectFollower(order) {
  return !!order;
}

function woWorkspaceMemberRoleName(member) {
  if (typeof pmRoleName === 'function' && member?.roleId) return pmRoleName(member.roleId);
  return member?.position || '项目组成员';
}

function woAvatarBg(name) {
  if (typeof pmAvatarBg === 'function') return pmAvatarBg(name);
  if (typeof gdAvatarColor === 'function') return gdAvatarColor(name);
  return '#6366F1';
}

function woOrderAssigneeText(order) {
  if (typeof gdOrderAssigneeText === 'function') return gdOrderAssigneeText(order);
  const raw = Array.isArray(order?.assigneeList) && order.assigneeList.length
    ? order.assigneeList
    : String(order?.assignee || order?.handler || '').split(/[、,，]/);
  const names = [...new Set(raw.map(item => String(item || '').trim()).filter(Boolean))];
  return names.join('、');
}

function woRestoreInputFocus(inputId, selectionStart, selectionEnd = selectionStart) {
  requestAnimationFrame(() => {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.focus();
    if (typeof selectionStart === 'number' && typeof input.setSelectionRange === 'function') {
      const safeStart = Math.max(0, Math.min(selectionStart, input.value.length));
      const safeEnd = typeof selectionEnd === 'number'
        ? Math.max(safeStart, Math.min(selectionEnd, input.value.length))
        : safeStart;
      input.setSelectionRange(safeStart, safeEnd);
    }
  });
}

function woGetWorkspaceMembers(ws = currentDetailWs) {
  if (!ws) return [];

  const rank = { r01: 1, r02: 2, r03: 3, r04: 4, r05: 5 };
  const byName = new Map();
  const addMember = member => {
    if (!member?.name || byName.has(member.name)) return;
    byName.set(member.name, {
      id: member.id,
      name: member.name,
      dept: member.dept || ws.dept || '—',
      roleId: member.roleId || '',
      position: member.position || '',
      phone: member.phone || '',
    });
  };

  if (typeof PM_MEMBERS_ALL !== 'undefined' && Array.isArray(PM_MEMBERS_ALL)) {
    PM_MEMBERS_ALL
      .filter(member => member.status === 'joined' && Array.isArray(member.wsIds) && member.wsIds.includes(ws.id))
      .forEach(addMember);
  }

  [ws.manager].filter(Boolean).forEach((name, idx) => {
    const user = typeof GD_USERS !== 'undefined' && Array.isArray(GD_USERS)
      ? GD_USERS.find(item => item.name === name)
      : null;
    addMember({
      id: `wo-ws-member-${ws.id}-${idx + 1}`,
      name,
      dept: user?.dept || ws.dept || '—',
      roleId: 'r02',
      position: '项目负责人',
      phone: user?.phone || '',
    });
  });

  return [...byName.values()].sort((a, b) =>
    (rank[a.roleId] || 99) - (rank[b.roleId] || 99)
    || a.name.localeCompare(b.name, 'zh-Hans-CN')
  );
}

function woTypeHtml(type) {
  if (typeof gdWoTypeTag === 'function') return gdWoTypeTag(type);
  return type || '—';
}

function woReportTypeHtml(reportType) {
  if (reportType && reportType !== '—') {
    return `<span class="gd-rtype-tag gd-rtype-${reportType === '合并' ? 'merged' : 'single'}">${reportType}</span>`;
  }
  return '<span style="color:#9CA3AF;">—</span>';
}

function woOpenWorkspaceFolder(id) {
  if (typeof gdOpenDetail === 'function') gdOpenDetail(id, 'req', 'workspace');
}

function woGetC2ModuleOptions() {
  return WO_MOD_DEF.filter(item => ['数据', '试算', '报告', '函证'].includes(item.key));
}

function woGetC2ModuleDef(moduleKey = woWiz.c2Module) {
  return woGetC2ModuleOptions().find(item => item.key === moduleKey) || null;
}

function woGetC2DefaultSub(moduleKey = woWiz.c2Module) {
  return woGetC2ModuleDef(moduleKey)?.sub?.[0] || '';
}

function woEnsureC2Defaults() {
  if (!woWiz.c2Provider) woWiz.c2Provider = WO_C2_DEFAULT_PROVIDER;
  if (!woWiz.c2Module) woWiz.c2Module = WO_C2_DEFAULT_MODULE;
  const moduleDef = woGetC2ModuleDef(woWiz.c2Module);
  if (moduleDef?.sub?.length) {
    if (!woWiz.c2ModuleSub) woWiz.c2ModuleSub = moduleDef.sub[0];
  } else {
    woWiz.c2ModuleSub = '';
  }
}

function woResetC2Step2State() {
  woWiz.c2Companies = new Set();
  woWiz.c2SubjectKeys = new Set();
  woWiz.c2SubjectKeyword = '';
  woC2SubjectDropdownOpen = false;
  woWiz.c2NeedComm = false;
  woWiz.c2ServiceFlags = {};
  woWiz.c2LedgerExpectTime = '';
  woWiz.c2DataExpectTime = '';
  woWiz.c2TrialBalanceTime = '';
  woWiz.c2MaterialExpectTime = '';
  woWiz.c2ExpectedTime = '';
  woWiz.c2UseLedger = false;
  woWiz.c2ReqFiles = [];
  woWiz.c2OptFiles = [];
}

function woGetC2BindingRows(ws = woWiz.ws || currentDetailWs) {
  if (Array.isArray(ws?.bindingRows) && ws.bindingRows.length) return ws.bindingRows;
  if (!ws) return [];
  return [{
    name: ws.entity || ws.group || ws.name,
    firmCode: ws.totalCode || ws.firmCode || '—',
    reportType: ws.reportType || '—',
    manager: ws.manager || '—',
  }];
}

function woGetC2MissingLedgerCompanies(ws = woWiz.ws || currentDetailWs, companies) {
  const targets = (companies?.length ? companies : woGetC2BindingRows(ws).map(item => item.name))
    .filter(Boolean);
  return targets.filter(company => {
    const mapped = ws?.assocMap?.[company];
    return !mapped || Object.keys(mapped).length === 0;
  });
}

function woGetC2LedgerCount(ws = woWiz.ws || currentDetailWs, companies) {
  const targets = (companies?.length ? companies : woGetC2BindingRows(ws).map(item => item.name))
    .filter(Boolean);
  return targets.reduce((sum, company) => {
    const mapped = ws?.assocMap?.[company];
    return sum + (mapped ? Object.keys(mapped).length : 0);
  }, 0);
}

function woMonthTextToRank(value) {
  const match = String(value || '').trim().match(/^(\d{4})-(\d{2})$/);
  if (!match) return 0;
  return Number(match[1]) * 100 + Number(match[2]);
}

function woPickLatestLedgerMapping(linkMap = {}) {
  return Object.values(linkMap || {})
    .filter(item => item && item.ledgerId)
    .sort((a, b) => {
      const periodDiff = woMonthTextToRank(b.endPeriod || b.startPeriod) - woMonthTextToRank(a.endPeriod || a.startPeriod);
      if (periodDiff) return periodDiff;
      const versionDiff = Number(b.version || 0) - Number(a.version || 0);
      if (versionDiff) return versionDiff;
      return String(b.ledgerId || '').localeCompare(String(a.ledgerId || ''));
    })[0] || null;
}

function woResolveLedgerVendorName(ledger) {
  const parts = String(ledger?.name || '')
    .split('-')
    .map(item => String(item || '').trim())
    .filter(Boolean);
  if (parts.length >= 3) {
    const folderName = parts[1];
    if (typeof VENDOR_LEDGER_FILES !== 'undefined' && VENDOR_LEDGER_FILES.hasOwnProperty(folderName)) {
      return folderName;
    }
    return folderName;
  }
  if (typeof VENDOR_LEDGER_FILES !== 'undefined') {
    for (const vendorName of Object.keys(VENDOR_LEDGER_FILES)) {
      if (String(ledger?.name || '').includes(vendorName)) {
        return vendorName;
      }
    }
  }
  return '—';
}

function woResolveLedgerSnapshotSize(ledgerId, version) {
  const digits = String(ledgerId || '').replace(/\D/g, '');
  const base = Number(digits.slice(-2) || 12);
  const size = (base * 0.37 + (Number(version) || 1) * 0.28 + 1.2).toFixed(1);
  return `${size} MB`;
}

function woBuildLedgerSnapshotRows(ws = woWiz.ws || currentDetailWs, companies = []) {
  const targets = [...new Set(
    (companies || [])
      .map(item => String(item || '').trim())
      .filter(Boolean)
  )];
  return targets.map(company => {
    const selected = woPickLatestLedgerMapping(ws?.assocMap?.[company]);
    if (!selected) return null;
    const ledger = typeof LEDGER_DATA !== 'undefined' && Array.isArray(LEDGER_DATA)
      ? LEDGER_DATA.find(item => item.id === selected.ledgerId)
      : null;
    const version = Number(selected.version || 1) || 1;
    const fileName = String(ledger?.name || '').trim() || `${company}账套文件`;
    return {
      company,
      fileName,
      ledgerId: String(selected.ledgerId || ''),
      startPeriod: String(selected.startPeriod || ''),
      endPeriod: String(selected.endPeriod || ''),
      size: woResolveLedgerSnapshotSize(selected.ledgerId, version),
      vendor: woResolveLedgerVendorName(ledger),
      version,
      uploader: ledger?.uploader || woCurrentUserName(),
      ledgerType: ledger?.type || '',
    };
  }).filter(Boolean);
}

function woBuildOrderFileRows(files = [], uploader = woCurrentUserName(), time = woNow()) {
  return (files || []).map(item => {
    if (!item) return null;
    if (typeof item === 'string') {
      return {
        name: item,
        size: '—',
        uploader,
        time,
        ver: 1,
      };
    }
    if (typeof item === 'object') {
      return {
        ...item,
        size: item.size || '—',
        uploader: item.uploader || uploader,
        time: item.time || time,
        ver: item.ver || item.version || 1,
      };
    }
    return null;
  }).filter(Boolean);
}

function woGetC2ServiceLabel() {
  return woWiz.c2ModuleSub ? `${woWiz.c2Module} / ${woWiz.c2ModuleSub}` : (woWiz.c2Module || '—');
}

function woGetC2ServiceProfile() {
  if (woWiz.c2Module === '数据') {
    if (woWiz.c2ModuleSub === '未审明细表') {
      return {
        summary: '系统会基于已关联账套生成未审明细表，适合项目组快速拉齐基础明细。',
        uploadHint: '可补充上传未审明细表口径说明、样表模板、字段映射要求等资料。',
      };
    }
    if (woWiz.c2ModuleSub === '底稿明细预填') {
      return {
        summary: '系统会同步选中主体的账套与底稿规则，预填明细底稿，减少重复录入。',
        uploadHint: '可补充上传底稿模板、预填规则说明、特殊取数口径等资料。',
      };
    }
    return {
      summary: '系统会同步选中主体已关联的时点账套，完成账套处理与标准化清洗。',
      uploadHint: '可补充上传账套处理口径、科目映射规则、特殊调整说明等资料。',
    };
  }
  if (woWiz.c2Module === '函证') {
    if (woIsC2BankLetterService()) {
      return {
        summary: '系统会基于所选主体与总所项目编号发起银行纸质函证制函任务，并按勾选项补充沟通或地址校验服务。',
        uploadHint: '请提供开立户清单、征信报告、对账单等必备资料。',
      };
    }
    if (woIsC2CounterpartyLetterService()) {
      return {
        summary: '系统会基于所选主体与总所项目编号发起往来函证制函任务，并结合账套带入与导入模板完成制函准备。',
        uploadHint: '请提供导入模板文件。',
      };
    }
    return {
      summary: '系统会根据你选择的函证细分服务生成对应任务，并结合主体账套与补充资料处理。',
      uploadHint: '可补充上传开户清单、往来对象名单、寄送要求、联系人信息等资料。',
    };
  }
  if (woWiz.c2Module === '试算') {
    if (woWiz.c2ModuleSub === '试算填充') {
      return {
        summary: '系统会基于已搭建好的试算底表完成数据填充与勾稽校验，适合项目执行阶段快速补齐试算结果。',
        uploadHint: '可补充上传试算模板、填充规则、异常勾稽说明等资料。',
      };
    }
    return {
      summary: '系统会结合关联账套与试算需求，先完成试算结构搭建，再进入后续填充或校验流程。',
      uploadHint: '可补充上传试算模板、勾稽要求、特殊科目处理说明等资料。',
    };
  }
  if (woWiz.c2Module === '报告') {
    if (woWiz.c2ModuleSub === '报告复核') {
      return {
        summary: '系统会基于所选主体与财务报表类型发起报告复核任务，聚焦附注、披露和交叉引用的完整性检查。',
        uploadHint: '需提供各个主体的终版试算表（含附表 1-3）。',
      };
    }
    return {
      summary: '系统会基于所选主体与财务报表类型开展报告编制工作，适合统一生成主体级报告与附注草稿。',
      uploadHint: '需提供各个主体的终版试算表（含附表 1-3）。',
    };
  }
  return {
    summary: '系统会结合当前工作区已有关联资料与所选主体，为该服务模块生成标准交付任务。',
    uploadHint: '可补充上传该服务模块所需的其他说明材料、模板或业务规则。',
  };
}

function woIsC2LetterService() {
  return woWiz.c2Module === '函证';
}

function woIsC2ReportService() {
  return woWiz.c2Module === '报告';
}

function woIsC2RawSubjectService() {
  return woIsC2LetterService() || woIsC2ReportService();
}

function woIsC2BankLetterService() {
  return woIsC2LetterService() && woWiz.c2ModuleSub === '银行纸质函证-制函';
}

function woIsC2CounterpartyLetterService() {
  return woIsC2LetterService() && woWiz.c2ModuleSub === '往来函证-制函';
}

function woC2NeedsLedgerCarry() {
  if (woIsC2ReportService()) return false;
  return !woIsC2LetterService() || woIsC2CounterpartyLetterService();
}

function woGetC2SubjectOptions(ws = woWiz.ws || currentDetailWs) {
  const rows = woGetC2BindingRows(ws);
  if (woIsC2RawSubjectService()) {
    return rows.map((row, idx) => ({
      key: `c2-row-${idx}`,
      name: row.name || '未命名主体',
      firmCode: row.firmCode || '—',
      reportType: row.reportType || '—',
      manager: row.manager || '—',
      rows: [row],
      companyNames: row.name ? [row.name] : [],
      duplicateCount: 1,
      firmCodes: [row.firmCode || '—'],
    }));
  }

  const dedupMap = new Map();
  rows.forEach((row, idx) => {
    const name = row.name || `未命名主体 ${idx + 1}`;
    if (!dedupMap.has(name)) {
      dedupMap.set(name, {
        key: `c2-company-${encodeURIComponent(name)}`,
        name,
        rows: [],
      });
    }
    dedupMap.get(name).rows.push(row);
  });

  return [...dedupMap.values()].map(item => {
    const firmCodes = [...new Set(item.rows.map(row => row.firmCode).filter(Boolean))];
    const reportTypes = [...new Set(item.rows.map(row => row.reportType).filter(Boolean))];
    const managers = [...new Set(item.rows.map(row => row.manager).filter(Boolean))];
    return {
      key: item.key,
      name: item.name,
      firmCode: firmCodes.join('、') || '—',
      reportType: reportTypes.join('、') || '—',
      manager: managers.join('、') || '—',
      rows: item.rows,
      companyNames: [item.name],
      duplicateCount: item.rows.length,
      firmCodes,
    };
  });
}

function woSyncC2SelectedSubjects(options = woGetC2SubjectOptions()) {
  const validKeys = new Set(options.map(item => item.key));
  woWiz.c2SubjectKeys = new Set([...woWiz.c2SubjectKeys].filter(key => validKeys.has(key)));
  woWiz.c2Companies = new Set(woGetC2SelectedCompanies(options));
}

function woGetSelectedC2Subjects(options = woGetC2SubjectOptions()) {
  return options.filter(item => woWiz.c2SubjectKeys.has(item.key));
}

function woGetC2SelectedCompanies(options = woGetC2SubjectOptions()) {
  return [...new Set(
    woGetSelectedC2Subjects(options)
      .flatMap(item => item.companyNames || [])
      .filter(Boolean)
  )];
}

function woBuildRelatedProjectRows(rows = []) {
  const result = [];
  const seen = new Set();
  (rows || []).forEach(row => {
    const item = {
      company: String(row?.name || row?.company || '').trim(),
      reportType: String(row?.reportType || '').trim(),
      firmCode: String(row?.firmCode || '').trim(),
      manager: String(row?.manager || '').trim(),
    };
    if (!item.company && !item.reportType && !item.firmCode) return;
    const key = `${item.company}__${item.reportType}__${item.firmCode}`;
    if (seen.has(key)) return;
    seen.add(key);
    result.push(item);
  });
  return result;
}

function woJoinRelatedProjectField(rows = [], field) {
  return [...new Set(
    (rows || [])
      .map(item => String(item?.[field] || '').trim())
      .filter(Boolean)
  )].join('、');
}

function woToggleC2Subject(key, options = woGetC2SubjectOptions()) {
  if (woWiz.c2SubjectKeys.has(key)) woWiz.c2SubjectKeys.delete(key);
  else woWiz.c2SubjectKeys.add(key);
  woWiz.c2Companies = new Set(woGetC2SelectedCompanies(options));
  woSyncC2LedgerAutoSelection();
}

function woRemoveC2Subject(key, options = woGetC2SubjectOptions()) {
  woWiz.c2SubjectKeys.delete(key);
  woWiz.c2Companies = new Set(woGetC2SelectedCompanies(options));
  woSyncC2LedgerAutoSelection();
}

function woGetC2LetterServiceOptions() {
  return {
    '银行纸质函证-制函': [
      { key: 'needCommService', label: '是否需要沟通服务' },
      { key: 'needAddressCheck', label: '是否需要地址校验服务' },
    ],
    '往来函证-制函': [
      { key: 'needSampleService', label: '是否需要选样服务' },
      { key: 'needCollectAddress', label: '是否需要收集地址服务' },
      { key: 'needAddressInquiry', label: '是否需要地址校验&生成地址不符说明&服务方接触客户完成地址差异问询' },
    ],
  }[woWiz.c2ModuleSub] || [];
}

function woGetC2RequiredUploadSpec() {
  if (woIsC2BankLetterService()) {
    return {
      hint: '请提供开立户清单、征信报告、对账单等必备资料',
      sampleKey: '',
    };
  }
  if (woIsC2CounterpartyLetterService()) {
    return {
      hint: '请提供导入模板文件',
      sampleKey: '往来函证导入模板',
    };
  }
  if (woIsC2ReportService()) {
    return {
      hint: '需提供各个主体的终版试算表（含附表 1-3）',
      sampleKey: '',
    };
  }
  return null;
}

function woGetC2StartFieldConfig() {
  if (woWiz.c2Module === '数据') {
    return {
      stateKey: 'c2LedgerExpectTime',
      orderField: 'ledgerExpectTime',
      label: '预计账套提供时间',
      hint: '项目组预计向服务方补齐账套资料的时间，该时间会参与计算工单开始时间。',
    };
  }
  if (woWiz.c2Module === '试算') {
    return {
      stateKey: 'c2DataExpectTime',
      orderField: 'dataExpectTime',
      label: '预计账套提供时间',
      hint: '项目组预计向服务方补齐账套资料的时间，该时间会参与计算工单开始时间。',
    };
  }
  if (woWiz.c2Module === '报告') {
    return {
      stateKey: 'c2TrialBalanceTime',
      orderField: 'trialBalanceTime',
      label: '预计终版试算（含附表 1-3）提供时间',
      hint: '项目组预计向服务方提供终版试算表（含附表 1-3）的时间，该时间会参与计算工单开始时间。',
    };
  }
  if (woWiz.c2Module === '函证') {
    return {
      stateKey: 'c2MaterialExpectTime',
      orderField: 'materialExpectTime',
      label: '预计资料提供时间',
      hint: '项目组预计向服务方补齐函证必备资料的时间，该时间会参与计算工单开始时间。',
    };
  }
  return null;
}

function woGetC2StartFieldValue() {
  const config = woGetC2StartFieldConfig();
  return config ? (woWiz[config.stateKey] || '') : '';
}

function woSetC2StartFieldValue(value) {
  const config = woGetC2StartFieldConfig();
  if (!config) return;
  woWiz[config.stateKey] = value;
}

function woGetC3ModuleDef(moduleKey = woWiz.c3Module) {
  return WO_MOD_DEF.find(item => item.key === moduleKey && item.key === '底稿') || null;
}

function woGetC3DefaultSub(moduleKey = woWiz.c3Module) {
  return woGetC3ModuleDef(moduleKey)?.sub?.[0] || '';
}

function woEnsureC3Defaults() {
  if (!woWiz.c3Provider) woWiz.c3Provider = WO_C3_DEFAULT_PROVIDER;
  if (!woWiz.c3Module) woWiz.c3Module = WO_C3_DEFAULT_MODULE;
  const moduleDef = woGetC3ModuleDef(woWiz.c3Module);
  if (moduleDef?.sub?.length) {
    if (!woWiz.c3ModuleSub) woWiz.c3ModuleSub = moduleDef.sub[0];
  } else {
    woWiz.c3ModuleSub = '';
  }
}

function woGetC3ServiceLabel() {
  return woWiz.c3ModuleSub ? `${woWiz.c3Module} / ${woWiz.c3ModuleSub}` : (woWiz.c3Module || '—');
}

function woGetC3ServiceProfile() {
  return {
    summary: '服务方将进入当前工作区协同编制审计底稿，涵盖银行、往来、收入、存货等循环。',
    uploadHint: '请上传主体-科目-定级表',
  };
}

function woSyncC3CompaniesFromFiles() {
  if (!woWiz.c3ReqFiles.length) {
    woWiz.c3Companies = new Set();
    woWiz.c3UnboundCompanies = [];
    return;
  }
  const bindingRows = woGetC2BindingRows(woWiz.ws);
  const bindingNames = new Set(bindingRows.map(row => row.name).filter(Boolean));
  /* 模拟从 Excel 中解析出的主体公司：取工作区 projectEntities 作为 mock */
  const parsedCompanies = Array.isArray(woWiz.ws?.projectEntities) && woWiz.ws.projectEntities.length
    ? [...woWiz.ws.projectEntities]
    : [...bindingNames];
  woWiz.c3Companies = new Set(parsedCompanies);
  woWiz.c3UnboundCompanies = parsedCompanies.filter(co => !bindingNames.has(co));
}

function woGetC3CompaniesText() {
  return [...woWiz.c3Companies].join(', ');
}

function woGetC3UploadNotice() {
  if (!woWiz.c3ReqFiles.length) {
    return {
      tone: 'pending',
      title: '待上传校验',
      message: '上传后会在此提示模板异常、主体缺失、定级列缺失等问题。',
    };
  }
  const hasNonExcel = woWiz.c3ReqFiles.some(name => !/\.(xls|xlsx)$/i.test(name));
  if (hasNonExcel) {
    return {
      tone: 'error',
      title: '上传格式异常',
      message: '建议上传 Excel 文件，当前文件格式可能无法完成主体抽取。',
    };
  }
  if (woWiz.c3ReqFiles.length > 1) {
    return {
      tone: 'warning',
      title: '已上传多份文件',
      message: '当前原型会按最新一份文件展示主体抽取结果，请确认最终版本。',
    };
  }
  if (woWiz.c3UnboundCompanies && woWiz.c3UnboundCompanies.length > 0) {
    return {
      tone: 'error',
      title: '主体校验异常',
      message: `以下主体公司不在当前工作区绑定文件中：<strong>${woWiz.c3UnboundCompanies.join('、')}</strong>。请更新工作区绑定文件或删除表中对应行后重新上传。`,
    };
  }
  return {
    tone: 'success',
    title: '校验通过',
    message: `已识别 ${woWiz.c3Companies.size} 家主体公司，系统将自动按主体公司拆分为独立工单。`,
  };
}

function woSyncC2LedgerAutoSelection() {
  if (!woC2NeedsLedgerCarry()) {
    woWiz.c2UseLedger = false;
    return;
  }
  const selectedCompanies = woGetC2SelectedCompanies();
  if (!selectedCompanies.length) {
    woWiz.c2UseLedger = false;
    return;
  }
  woWiz.c2UseLedger = woGetC2MissingLedgerCompanies(woWiz.ws, selectedCompanies).length === 0;
}

function woTableTimeHtml(value) {
  if (!value) return '—';
  const [date, time = ''] = String(value).split(' ');
  return `
    <div class="wo-table-time">
      <div class="wo-table-date">${date}</div>
      ${time ? `<div class="wo-table-clock">${time}</div>` : ''}
    </div>`;
}

function woDateOnlyText(value) {
  if (typeof gdFormatDateOnly === 'function') return gdFormatDateOnly(value);
  const text = String(value || '').trim();
  return text ? text.split(' ')[0] : '';
}

function woTableDateHtml(value) {
  const date = woDateOnlyText(value);
  if (!date) return '—';
  return `
    <div class="wo-table-time">
      <div class="wo-table-date">${date}</div>
    </div>`;
}

function woOrderStartTime(order) {
  if (typeof gdGetOrderStartTime === 'function') return gdGetOrderStartTime(order);
  return woDateOnlyText(order?.startTime || order?.submitTime || '');
}

function woEscapeAttrText(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function woFmtDate(date) {
  if (typeof gdFmtDate === 'function') return gdFmtDate(date);
  const target = date instanceof Date ? date : new Date(date);
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
}

function woScheduleDateFromKey(dateKey) {
  if (typeof gdScheduleDateFromKey === 'function') return gdScheduleDateFromKey(dateKey);
  const text = String(dateKey || '').trim();
  if (!text) return new Date();
  const [year = 0, month = 1, day = 1] = text.split('-').map(Number);
  return new Date(year, Math.max(month - 1, 0), day || 1);
}

function woScheduleStartOfWeek(dateLike) {
  const date = dateLike instanceof Date ? new Date(dateLike) : woScheduleDateFromKey(dateLike);
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
}

function woScheduleBuildDateList(startDate, endDate) {
  const start = startDate instanceof Date ? new Date(startDate) : woScheduleDateFromKey(startDate);
  const end = endDate instanceof Date ? new Date(endDate) : woScheduleDateFromKey(endDate);
  const list = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  while (cursor <= end) {
    list.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return list;
}

function woScheduleMonthStart(dateLike) {
  const date = dateLike instanceof Date ? new Date(dateLike) : woScheduleDateFromKey(dateLike);
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function woScheduleAddMonths(dateLike, offset) {
  const date = woScheduleMonthStart(dateLike);
  date.setMonth(date.getMonth() + offset);
  return woScheduleMonthStart(date);
}

function woSchedulePoolKey(order) {
  if (!order || typeof order !== 'object') return '其他';
  return order.woType === '一类工单' ? '一类工单' : (woNormModule(order.serviceModule) || '其他');
}

function woSchedulePalette(key) {
  if (typeof GD_SCHEDULE_MODULE_PALETTE !== 'undefined' && GD_SCHEDULE_MODULE_PALETTE?.[key]) {
    return GD_SCHEDULE_MODULE_PALETTE[key];
  }
  return WO_SCHEDULE_MODULE_PALETTE[key] || WO_SCHEDULE_MODULE_PALETTE.其他;
}

function woGetWorkspaceOrders(ws = currentDetailWs) {
  const wsName = ws?.name;
  if (!wsName) return [];
  return GD_WORK_ORDERS
    .filter(order => order.workspace === wsName)
    .sort((a, b) => (b.submitTime || '').localeCompare(a.submitTime || ''));
}

function woGetMgrPoolCounts(allOrders) {
  return WO_POOL_TABS.reduce((acc, tab) => {
    acc[tab.key] = allOrders.filter(order => {
      if (tab.key === 'class1') return order.woType === '一类工单';
      return order.woType !== '一类工单' && woNormModule(order.serviceModule) === tab.key;
    }).length;
    return acc;
  }, {});
}

function woGetMgrFilteredOrders(allOrders) {
  let list = allOrders.filter(order => {
    if (woMgr.poolTab === 'class1') return order.woType === '一类工单';
    return order.woType !== '一类工单' && woNormModule(order.serviceModule) === woMgr.poolTab;
  });

  if (woMgr.keyword) {
    const kw = woMgr.keyword.toLowerCase();
    list = list.filter(order =>
      (order.id || '').toLowerCase().includes(kw) ||
      (order.title || '').toLowerCase().includes(kw) ||
      (order.firmCode || '').toLowerCase().includes(kw) ||
      (order.company || '').toLowerCase().includes(kw));
  }
  if (woMgr.status) list = list.filter(order => order.status === woMgr.status);
  return list;
}

function woGetScheduleDefaultDate(allOrders) {
  const candidates = allOrders
    .flatMap(order => [woDateOnlyText(woOrderStartTime(order)), woDateOnlyText(order.expectedTime)])
    .filter(Boolean)
    .sort();
  if (!candidates.length) return new Date();
  return woScheduleDateFromKey(candidates[candidates.length - 1]);
}

function woEnsureScheduleState(ws, allOrders) {
  if (!(woMgr.scheduleDate instanceof Date) || Number.isNaN(woMgr.scheduleDate?.getTime?.())) {
    woMgr.scheduleDate = woGetScheduleDefaultDate(allOrders);
  }
  if (!woMgr.scheduleTimeMode) woMgr.scheduleTimeMode = 'week';
  if (typeof woMgr.scheduleCustomPickerOpen !== 'boolean') woMgr.scheduleCustomPickerOpen = false;
  if (!Array.isArray(woMgr.schedulePoolFilters)) woMgr.schedulePoolFilters = [];
  if (typeof woMgr.scheduleFilterMenu !== 'string') woMgr.scheduleFilterMenu = '';
  if (!(woMgr.scheduleCustomPickerMonth instanceof Date) || Number.isNaN(woMgr.scheduleCustomPickerMonth?.getTime?.())) {
    woMgr.scheduleCustomPickerMonth = woScheduleMonthStart(woMgr.scheduleDate);
  }

  const wsChanged = woMgr.scheduleWsId !== ws?.id;
  if (wsChanged) {
    woMgr.scheduleDate = woGetScheduleDefaultDate(allOrders);
    const customStart = new Date(woMgr.scheduleDate);
    customStart.setDate(customStart.getDate() - 6);
    const customEnd = new Date(woMgr.scheduleDate);
    customEnd.setDate(customEnd.getDate() + 6);
    woMgr.scheduleCustomStart = woFmtDate(customStart);
    woMgr.scheduleCustomEnd = woFmtDate(customEnd);
    woMgr.scheduleCustomDraftStart = woMgr.scheduleCustomStart;
    woMgr.scheduleCustomDraftEnd = woMgr.scheduleCustomEnd;
    woMgr.scheduleCustomPickerOpen = false;
    woMgr.scheduleCustomPickerMonth = woScheduleMonthStart(customStart);
    woMgr.schedulePoolFilters = [];
    woMgr.scheduleFilterMenu = '';
    woMgr.scheduleWsId = ws?.id || '';
  }

  if (!woMgr.scheduleCustomStart || !woMgr.scheduleCustomEnd) {
    const customStart = new Date(woMgr.scheduleDate);
    customStart.setDate(customStart.getDate() - 6);
    const customEnd = new Date(woMgr.scheduleDate);
    customEnd.setDate(customEnd.getDate() + 6);
    woMgr.scheduleCustomStart = woFmtDate(customStart);
    woMgr.scheduleCustomEnd = woFmtDate(customEnd);
  }
  if (typeof woMgr.scheduleCustomDraftStart !== 'string') woMgr.scheduleCustomDraftStart = woMgr.scheduleCustomStart || '';
  if (typeof woMgr.scheduleCustomDraftEnd !== 'string') woMgr.scheduleCustomDraftEnd = woMgr.scheduleCustomEnd || '';
  woMgr.schedulePoolFilters = woMgr.schedulePoolFilters.filter(item => WO_SCHEDULE_LEGEND_ORDER.includes(item));
  if (woMgr.scheduleFilterMenu !== 'pool') woMgr.scheduleFilterMenu = '';
}

function woGetScheduleRange() {
  const anchor = woScheduleDateFromKey(woFmtDate(woMgr.scheduleDate || new Date()));
  const mode = woMgr.scheduleTimeMode || 'week';
  let start;
  let end;

  if (mode === 'day') {
    start = anchor;
    end = new Date(anchor);
  } else if (mode === 'month') {
    start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  } else if (mode === 'custom') {
    start = woScheduleDateFromKey(woMgr.scheduleCustomStart);
    end = woScheduleDateFromKey(woMgr.scheduleCustomEnd);
    if (end < start) {
      const temp = start;
      start = end;
      end = temp;
    }
  } else {
    start = woScheduleStartOfWeek(anchor);
    end = new Date(start);
    end.setDate(end.getDate() + 6);
  }

  const dates = woScheduleBuildDateList(start, end);
  let label = `${woFmtDate(start)} 至 ${woFmtDate(end)}`;
  if (mode === 'day') label = woFmtDate(start);
  if (mode === 'month') label = `${start.getFullYear()}年${start.getMonth() + 1}月`;

  return {
    mode,
    start,
    end,
    dates,
    label,
    startKey: woFmtDate(start),
    endKey: woFmtDate(end),
  };
}

function woSyncScheduleCustomDraft() {
  woMgr.scheduleCustomDraftStart = woMgr.scheduleCustomStart || '';
  woMgr.scheduleCustomDraftEnd = woMgr.scheduleCustomEnd || '';
  woMgr.scheduleCustomPickerMonth = woScheduleMonthStart(
    woMgr.scheduleCustomDraftStart || woMgr.scheduleCustomStart || woFmtDate(woMgr.scheduleDate || new Date())
  );
}

function woGetScheduleCustomRangeText(useDraft = false) {
  const start = useDraft ? (woMgr.scheduleCustomDraftStart || '') : (woMgr.scheduleCustomStart || '');
  const end = useDraft ? (woMgr.scheduleCustomDraftEnd || '') : (woMgr.scheduleCustomEnd || '');
  if (!start || !end) return start || '选择时间段';
  return `${start} 至 ${end}`;
}

function woGetScheduleDraftRangeHint() {
  const start = woMgr.scheduleCustomDraftStart || '';
  const end = woMgr.scheduleCustomDraftEnd || '';
  if (!start) return '请选择开始日期';
  if (!end) return `开始于 ${start}，请继续选择结束日期`;
  return `${start} 至 ${end}`;
}

function woScheduleGetMonthGrid(monthDate) {
  const monthStart = woScheduleMonthStart(monthDate);
  const gridStart = woScheduleStartOfWeek(monthStart);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
}

function woGetSchedulePickerYearOptions() {
  const currentYear = new Date().getFullYear();
  const pickerYear = woScheduleMonthStart(woMgr.scheduleCustomPickerMonth || woMgr.scheduleDate || new Date()).getFullYear();
  const startYear = Math.min(currentYear - 10, pickerYear - 10);
  const endYear = Math.max(currentYear + 10, pickerYear + 10);
  return Array.from({ length: endYear - startYear + 1 }, (_, index) => startYear + index);
}

function woGetWorkspaceScheduleItems(ws, allOrders = woGetWorkspaceOrders(ws), members = woGetWorkspaceMembers(ws)) {
  const memberByName = new Map(members.map(member => [String(member.name || ''), member]));
  return allOrders.flatMap(order => {
    const member = memberByName.get(woProjectFollowerName(order));
    if (!member) return [];
    const startDateRaw = woDateOnlyText(woOrderStartTime(order)) || woDateOnlyText(order.submitTime);
    const endDateRaw = woDateOnlyText(order.expectedTime) || startDateRaw;
    if (!startDateRaw || !endDateRaw) return [];
    const startDate = startDateRaw <= endDateRaw ? startDateRaw : endDateRaw;
    const endDate = startDateRaw <= endDateRaw ? endDateRaw : startDateRaw;
    return [{
      id: `wo-sch-${order.id}-${member.id || member.name}`,
      workOrderId: order.id,
      userId: member.id || member.name,
      userName: member.name,
      title: order.title || order.id,
      serviceModule: order.serviceModule || '—',
      moduleKey: woNormModule(order.serviceModule) || '其他',
      categoryKey: woSchedulePoolKey(order),
      woType: order.woType || '',
      status: order.status || '',
      startDate,
      endDate,
    }];
  });
}

function woScheduleItemMatchesFilters(item) {
  const poolFilters = woMgr.schedulePoolFilters || [];
  if (poolFilters.length && !poolFilters.includes(item.categoryKey || item.moduleKey || '')) return false;
  return true;
}

function woScheduleItemsForMember(items, member, range) {
  return items
    .filter(item => String(item.userId || '') === String(member.id || member.name || ''))
    .filter(item => item.startDate <= range.endKey && item.endDate >= range.startKey)
    .sort((a, b) => {
      if (a.startDate !== b.startDate) return a.startDate.localeCompare(b.startDate);
      return String(a.title || '').localeCompare(String(b.title || ''), 'zh-CN');
    });
}

function woGetScheduleFilterSummary(values, fallback = '全部') {
  if (!values.length) return fallback;
  if (values.length <= 2) return values.join('、');
  return `已选 ${values.length} 项`;
}

function woGetScheduleMetaLabel(item) {
  return item.woType === '一类工单' ? '一类工单' : (item.serviceModule || item.moduleKey || '—');
}

function woGetScheduleContinuationLabel(item) {
  return item.woType === '一类工单' ? '一类工单' : (item.moduleKey || item.serviceModule || '工单');
}

function woGetScheduleVisibleStartKey(item, range) {
  if (!item || !range) return '';
  return item.startDate < range.startKey ? range.startKey : item.startDate;
}

function woRenderSchedulePickerMonth(monthDate) {
  const monthStart = woScheduleMonthStart(monthDate);
  const cells = woScheduleGetMonthGrid(monthStart);
  const today = woFmtDate(new Date());
  const start = woMgr.scheduleCustomDraftStart || '';
  const end = woMgr.scheduleCustomDraftEnd || '';
  const rangeStart = start && end ? (start < end ? start : end) : '';
  const rangeEnd = start && end ? (start < end ? end : start) : '';
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  return `
    <div class="gd-schedule-cal">
      <div class="gd-schedule-cal-title">${monthStart.getFullYear()}年${monthStart.getMonth() + 1}月</div>
      <div class="gd-schedule-cal-weekdays">
        ${weekdays.map(day => `<span>${day}</span>`).join('')}
      </div>
      <div class="gd-schedule-cal-grid">
        ${cells.map(date => {
          const key = woFmtDate(date);
          const outside = date.getMonth() !== monthStart.getMonth();
          const isStart = key === start;
          const isEnd = key === end;
          const inRange = rangeStart && rangeEnd && key >= rangeStart && key <= rangeEnd;
          const isToday = key === today;
          return `<button
            class="gd-schedule-cal-day${outside ? ' outside' : ''}${isToday ? ' is-today' : ''}${inRange ? ' in-range' : ''}${isStart ? ' is-start' : ''}${isEnd ? ' is-end' : ''}"
            onclick="woSelectScheduleDraftDate('${key}')"
            title="${key}">
            <span>${date.getDate()}</span>
          </button>`;
        }).join('')}
      </div>
    </div>`;
}

function woRenderScheduleLegend() {
  return WO_SCHEDULE_LEGEND_ORDER.map(label => {
    const palette = woSchedulePalette(label);
    return `
      <div class="gd-legend-item">
        <div class="gd-legend-dot" style="background:${palette.bg};border-color:${palette.border};"></div>
        <span>${label}</span>
      </div>`;
  }).join('');
}

function woRenderScheduleFilterDropdown() {
  const selected = woMgr.schedulePoolFilters || [];
  const isOpen = woMgr.scheduleFilterMenu === 'pool';
  const summary = woGetScheduleFilterSummary(selected);
  const title = selected.length ? `工单池：${selected.join('、')}` : '工单池：全部';

  return `
    <div class="gd-schedule-filter-dropdown">
      <button
        class="gd-schedule-filter-trigger${selected.length ? ' active' : ''}${isOpen ? ' open' : ''}"
        onclick="woToggleScheduleFilterMenu('pool')"
        title="${woEscapeAttrText(title)}">
        <div class="gd-schedule-filter-text">
          <span class="gd-schedule-filter-name">工单池</span>
          <span class="gd-schedule-filter-value">${summary}</span>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" aria-hidden="true">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      ${isOpen ? `
        <div class="gd-schedule-filter-panel">
          ${WO_SCHEDULE_LEGEND_ORDER.map(option => `
            <label class="gd-schedule-filter-option">
              <input
                type="checkbox"
                ${selected.includes(option) ? 'checked' : ''}
                onchange="woToggleSchedulePoolFilter('${option}')">
              <span>${option}</span>
            </label>`).join('')}
        </div>
      ` : ''}
    </div>`;
}

function woBindScheduleOutsideClose() {
  if (woScheduleOutsideCloseBound) return;
  woScheduleOutsideCloseBound = true;
  document.addEventListener('click', e => {
    if (woMgr.view !== 'schedule') return;
    const target = e.target;
    if (!(target instanceof Element)) return;
    const clickedFilter = target.closest('.gd-schedule-filter-dropdown');
    const clickedPicker = target.closest('.gd-schedule-custom-wrap');
    let shouldRerender = false;
    if (!clickedFilter && woMgr.scheduleFilterMenu) {
      woMgr.scheduleFilterMenu = '';
      shouldRerender = true;
    }
    if (!clickedPicker && woMgr.scheduleCustomPickerOpen) {
      woMgr.scheduleCustomPickerOpen = false;
      shouldRerender = true;
    }
    if (shouldRerender) renderWoMgrPanel();
  });
}

function woWorkspaceMockId(ws, seq) {
  const digits = String(ws.id || '')
    .replace(/\D/g, '')
    .padStart(3, '0');
  return `WO${digits}9${String(seq).padStart(2, '0')}`;
}

function woSeedWorkspaceMockOrders(ws) {
  if (!ws || WO_WS_MOCK_SEEDED.has(ws.id)) return;
  if (GD_WORK_ORDERS.some(item => item.workspace === ws.name && !item._wsMock)) {
    WO_WS_MOCK_SEEDED.add(ws.id);
    return;
  }

  const rows = Array.isArray(ws.bindingRows) && ws.bindingRows.length
    ? ws.bindingRows
    : [{
        name: ws.entity || ws.group || ws.name,
        firmCode: ws.totalCode || ws.firmCode || '—',
        reportType: ws.reportType || '—',
        manager: ws.manager || '—',
      }];

  const lead = rows[0];
  const second = rows[1] || rows[0];
  const third = rows[2] || rows[1] || rows[0];
  const submitter = ws.manager || woCurrentUserName();
  const dept = ws.dept || '';
  const class1Id = woWorkspaceMockId(ws, 1);
  const class1AltId = woWorkspaceMockId(ws, 7);

  const seedDefs = [
    {
      id: class1Id,
      title: `${ws.group || ws.entity || ws.name} FY${ws.year || '2025'} 全模块统筹预排`,
      woType: '一类工单',
      serviceModule: '数据、试算、报告、函证、底稿',
      company: lead.name,
      firmCode: lead.firmCode,
      reportType: lead.reportType,
      projectManager: lead.manager || ws.manager || '—',
      provider: '交付中心',
      status: '已接单',
      submitTime: '2026-03-20 09:00',
      expectedTime: '2026-04-30',
      assignee: '张伟',
      desc: '涵盖数据、试算、报告、函证、底稿五大模块的全量统筹预排，可执行自动拆单按主体公司粒度生成二类/三类工单。',
      priorAuditDate: '2026-02-28',
      planReportDate: '2026-04-30',
      deliveryDeadline: '2026-04-30',
      moduleDetails: {
        数据: {
          ledgerCount: String((ws.projectEntities || [lead.name]).length),
          ledgerExpectTime: '2026-03-25',
          dataExpectTime: '2026-03-25',
          expectedTime: '2026-04-05',
          note: '按主体公司逐一处理账套数据清洗、科目映射与底稿预填。',
          files: ['账套清单.xlsx', '科目映射表.xlsx'],
        },
        试算: {
          entityCount: String((ws.projectEntities || [lead.name]).length),
          dataExpectTime: '2026-04-01',
          expectedTime: '2026-04-10',
          note: '基于清洗后的账套数据，搭建各主体试算平衡表并输出勾稽差异清单。',
          files: ['试算模板.xlsx'],
        },
        报告: {
          entityCount: String((ws.projectEntities || [lead.name]).length),
          trialBalanceTime: '2026-04-08',
          expectedTime: '2026-04-18',
          note: '基于终版试算表编制审计报告，包含附注骨架与关键披露页。',
          files: ['报告模板.xlsx'],
        },
        函证: {
          entityCount: String((ws.projectEntities || [lead.name]).length),
          materialExpectTime: '2026-03-28',
          expectedTime: '2026-04-12',
          note: '银行纸质函证与往来函证同步推进，覆盖全部主体公司的对外函证需求。',
          files: ['函证范围清单.xlsx'],
        },
        底稿: {
          entityCount: String((ws.projectEntities || [lead.name]).length),
          dataExpectTime: '2026-04-01',
          materialAllExpectTime: '2026-04-05',
          expectedTime: '2026-04-25',
          note: '按主体公司拆分底稿协同任务，涵盖银行、往来、收入、存货等循环。',
          files: ['底稿协同边界表.xlsx'],
        },
      },
    },
    {
      id: class1AltId,
      title: `${lead.name} FY${ws.year || '2025'} 报告函证底稿统筹预排`,
      woType: '一类工单',
      serviceModule: '报告、函证、底稿',
      company: lead.name,
      firmCode: lead.firmCode,
      reportType: lead.reportType,
      projectManager: lead.manager || ws.manager || '—',
      provider: '交付中心',
      status: '待验收',
      submitTime: '2026-03-22 10:40',
      expectedTime: '2026-03-28 18:00',
      assignee: '张伟、赵敏',
      assigneeMembers: [
        { userId: '1', name: '张伟', role: 'delivery_staff' },
        { userId: '4', name: '赵敏', role: 'delivery_staff' },
      ],
      desc: '已完成报告、函证和底稿三条线的资源统筹与阶段性交付，当前等待项目组统一验收。',
      priorAuditDate: '2026-02-27',
      planReportDate: '2026-04-02',
      deliveryDeadline: '2026-03-28 18:00',
      moduleDetails: {
        报告: {
          entityCount: '3',
          trialBalanceTime: '2026-03-24',
          expectedTime: '2026-03-26',
          note: '先出附注骨架与关键披露页，供项目组确认口径与版式。',
          files: ['附注模板差异表.xlsx'],
        },
        函证: {
          entityCount: '2',
          materialExpectTime: '2026-03-24',
          expectedTime: '2026-03-25',
          note: '银行纸函与往来函证同步推进，需优先校验地址与联系人准确性。',
          files: ['函证范围清单.xlsx', '地址校验说明.xlsx'],
        },
        底稿: {
          entityCount: '3',
          dataExpectTime: '2026-03-24',
          materialAllExpectTime: '2026-03-25',
          expectedTime: '2026-03-28',
          note: '先处理收入和往来两个重点循环，并同步补充底稿协同边界说明。',
          files: ['底稿协同边界表.xlsx'],
        },
      },
    },
    {
      id: woWorkspaceMockId(ws, 2),
      title: `${lead.name} 应收账款数据清洗`,
      woType: '二类工单',
      serviceModule: '数据-账套处理',
      company: lead.name,
      firmCode: lead.firmCode,
      reportType: lead.reportType,
      projectManager: lead.manager || ws.manager || '—',
      provider: '业务一部后台',
      status: '待接单',
      submitTime: '2026-03-24 11:10',
      expectedTime: '2026-03-25 18:00',
      assignee: '',
      parentOrderId: class1Id,
      desc: '项目工作区内的标准数据交付工单，等待服务方派单。',
      ledgerExpectTime: '2026-03-24',
    },
    {
      id: woWorkspaceMockId(ws, 3),
      title: `${second.name} 合并试算搭建`,
      woType: '二类工单',
      serviceModule: '试算-试算搭建',
      company: second.name,
      firmCode: second.firmCode,
      reportType: second.reportType,
      projectManager: second.manager || ws.manager || '—',
      provider: '业务一部后台',
      status: '已接单',
      submitTime: '2026-03-23 15:30',
      expectedTime: '2026-03-26 12:00',
      assignee: '王强',
      parentOrderId: class1Id,
      desc: '交付人员已开始试算搭建，用于展示执行中工单。',
      dataExpectTime: '2026-03-24',
    },
    {
      id: woWorkspaceMockId(ws, 4),
      title: `${lead.name} 审计报告附注排版`,
      woType: '二类工单',
      serviceModule: '报告-报告编制',
      company: lead.name,
      firmCode: lead.firmCode,
      reportType: lead.reportType,
      projectManager: lead.manager || ws.manager || '—',
      provider: '交付中心',
      status: '待验收',
      submitTime: '2026-03-22 10:20',
      expectedTime: '2026-03-25 18:00',
      assignee: '张伟',
      parentOrderId: class1Id,
      desc: '报告模块已提交服务方交付物，等待项目组验收。',
      trialBalanceTime: '2026-03-24',
    },
    {
      id: woWorkspaceMockId(ws, 5),
      title: `${second.name} 银行纸质函证制函`,
      woType: '二类工单',
      serviceModule: '函证-银行纸质函证-制函',
      company: second.name,
      firmCode: second.firmCode,
      reportType: second.reportType,
      projectManager: second.manager || ws.manager || '—',
      provider: '业务二部后台',
      status: '已驳回',
      submitTime: '2026-03-21 16:40',
      expectedTime: '2026-03-24 18:00',
      assignee: '张伟',
      parentOrderId: class1Id,
      desc: '函证结果被项目组驳回，需根据意见修订后重新提交。',
      materialExpectTime: '2026-03-22',
      rejectReason: '开户清单与函证范围未完全匹配',
      revisionCount: 1,
    },
    {
      id: woWorkspaceMockId(ws, 6),
      title: `${third.name} 底稿协同编制`,
      woType: '三类工单',
      serviceModule: '底稿',
      company: third.name,
      firmCode: third.firmCode,
      reportType: third.reportType,
      projectManager: third.manager || ws.manager || '—',
      provider: '交付中心',
      status: '已接单',
      submitTime: '2026-03-23 09:10',
      expectedTime: '2026-04-28',
      assignee: '周芳',
      parentOrderId: class1Id,
      useLedger: true,
      attachments: [`主体-科目-定级表_${third.name}.xls`],
      desc: `三类工单：底稿，主体 ${third.name}，服务方按主体-科目-定级表结果进入工作区协同编制。`,
      dataExpectTime: '2026-03-24',
      materialAllExpectTime: '2026-03-25',
    },
    {
      id: woWorkspaceMockId(ws, 8),
      title: `${lead.name} 账套数据处理`,
      woType: '二类工单',
      serviceModule: '数据-账套处理',
      company: lead.name,
      firmCode: lead.firmCode,
      reportType: lead.reportType,
      projectManager: lead.manager || ws.manager || '—',
      provider: '交付中心',
      status: '待启用',
      submitTime: '2026-03-20 09:30',
      expectedTime: '2026-04-05',
      assignee: '',
      parentOrderId: class1Id,
      desc: '由一类工单自动拆解生成，待项目组批量合并后提交。',
      ledgerExpectTime: '2026-03-25',
    },
    {
      id: woWorkspaceMockId(ws, 9),
      title: `${second.name} 账套数据处理`,
      woType: '二类工单',
      serviceModule: '数据-账套处理',
      company: second.name,
      firmCode: second.firmCode,
      reportType: second.reportType,
      projectManager: second.manager || ws.manager || '—',
      provider: '交付中心',
      status: '待启用',
      submitTime: '2026-03-20 09:31',
      expectedTime: '2026-04-05',
      assignee: '',
      parentOrderId: class1Id,
      desc: '由一类工单自动拆解生成，待项目组批量合并后提交。',
      ledgerExpectTime: '2026-03-25',
    },
    {
      id: woWorkspaceMockId(ws, 10),
      title: `${third.name} 账套数据处理`,
      woType: '二类工单',
      serviceModule: '数据-账套处理',
      company: third.name,
      firmCode: third.firmCode,
      reportType: third.reportType,
      projectManager: third.manager || ws.manager || '—',
      provider: '交付中心',
      status: '待启用',
      submitTime: '2026-03-20 09:32',
      expectedTime: '2026-04-08',
      assignee: '',
      parentOrderId: class1Id,
      desc: '由一类工单自动拆解生成，待项目组批量合并后提交。',
      ledgerExpectTime: '2026-03-26',
    },
  ];
  const normalizedSeedDefs = seedDefs.map(def => (
    typeof gdNormalizeMockWorkOrderDates === 'function'
      ? gdNormalizeMockWorkOrderDates(def)
      : def
  ));

  normalizedSeedDefs.forEach(def => {
    if (GD_WORK_ORDERS.some(item => item.id === def.id)) return;
    const providerOrgId = woProviderOrgIdByName(def.provider);
    const orderItem = {
      id: def.id,
      title: def.title,
      woType: def.woType,
      type: def.woType,
      parentOrderId: def.parentOrderId || '',
      workspace: ws.name,
      workspaceId: ws.id || '',
      company: def.company,
      firmCode: def.firmCode || ws.totalCode || ws.firmCode || '—',
      reportType: def.reportType || ws.reportType || '—',
      projectManager: def.projectManager,
      submitter,
      projectFollower: def.projectFollower || submitter,
      submitTime: def.submitTime,
      expectedTime: def.expectedTime,
      handler: def.assignee || '',
      assignee: def.assignee || '',
      status: def.status,
      priority: '普通',
      desc: def.desc || '',
      attachments: [],
      serviceModule: def.serviceModule,
      serviceProvider: def.provider,
      provider: def.provider,
      providerOrgName: def.provider,
      providerOrgId,
      rejectReason: def.rejectReason || '',
      revisionCount: def.revisionCount || 0,
      dept,
      workspaceDept: ws.dept || '',
      workspaceGroup: ws.group || '',
      priorAuditDate: def.priorAuditDate || '',
      planReportDate: def.planReportDate || '',
      deliveryDeadline: def.deliveryDeadline || '',
      ledgerExpectTime: def.ledgerExpectTime || '',
      dataExpectTime: def.dataExpectTime || '',
      trialBalanceTime: def.trialBalanceTime || '',
      materialExpectTime: def.materialExpectTime || '',
      materialAllExpectTime: def.materialAllExpectTime || '',
      moduleDetails: def.moduleDetails ? JSON.parse(JSON.stringify(def.moduleDetails)) : undefined,
      _wsMock: true,
      _wsId: ws.id,
    };
    if (Array.isArray(def.assigneeMembers) && def.assigneeMembers.length && typeof gdSetOrderAssignees === 'function') {
      gdSetOrderAssignees(orderItem, def.assigneeMembers);
    }
    GD_WORK_ORDERS.unshift(orderItem);
  });

  if (typeof GD_ORDER_FILES !== 'undefined') {
    const fileSeeds = {
      [class1Id]: {
        req: [],
        reqModules: {
          数据: [
            { name: '账套清单.xlsx', size: '126 KB', uploader: submitter, time: '2026-03-20 09:10', ver: 1 },
            { name: '科目映射表.xlsx', size: '38 KB', uploader: submitter, time: '2026-03-20 09:12', ver: 1 },
          ],
          试算: [
            { name: '试算模板.xlsx', size: '42 KB', uploader: submitter, time: '2026-03-20 09:15', ver: 1 },
          ],
          报告: [
            { name: '报告模板.xlsx', size: '64 KB', uploader: submitter, time: '2026-03-20 09:18', ver: 1 },
          ],
          函证: [
            { name: '函证范围清单.xlsx', size: '72 KB', uploader: submitter, time: '2026-03-20 09:20', ver: 1 },
          ],
          底稿: [
            { name: '底稿协同边界表.xlsx', size: '58 KB', uploader: submitter, time: '2026-03-20 09:22', ver: 1 },
          ],
        },
        svc: [],
      },
      [class1AltId]: {
        req: [],
        reqModules: {
          报告: [
            { name: '附注模板差异表.xlsx', size: '64 KB', uploader: submitter, time: '2026-03-22 10:45', ver: 1 },
          ],
          函证: [
            { name: '函证范围清单.xlsx', size: '72 KB', uploader: submitter, time: '2026-03-22 10:48', ver: 1 },
            { name: '地址校验说明.xlsx', size: '35 KB', uploader: submitter, time: '2026-03-22 10:50', ver: 1 },
          ],
          底稿: [
            { name: '底稿协同边界表.xlsx', size: '58 KB', uploader: submitter, time: '2026-03-22 10:52', ver: 1 },
          ],
        },
        svc: [
          { name: '资源统筹方案_V1.xlsx', size: '168 KB', uploader: '张伟', time: '2026-03-24 15:30', ver: 1 },
          { name: '阶段性交付摘要.docx', size: '92 KB', uploader: '赵敏', time: '2026-03-24 15:42', ver: 1 },
        ],
      },
      [woWorkspaceMockId(ws, 4)]: {
        req: [{ name: '附注排版规范.docx', size: '42 KB', uploader: submitter, time: '2026-03-22 10:25', ver: 1 }],
        svc: [{ name: '审计报告附注排版_V1.docx', size: '318 KB', uploader: '张伟', time: '2026-03-24 16:10', ver: 1 }],
      },
      [woWorkspaceMockId(ws, 6)]: {
        req: [{ name: '底稿边界说明.xlsx', size: '88 KB', uploader: submitter, time: '2026-03-23 09:12', ver: 1 }],
        svc: [{ name: '收入循环底稿_V1.zip', size: '5.2 MB', uploader: '周芳', time: '2026-03-24 17:40', ver: 1 }],
      },
    };
    Object.entries(fileSeeds).forEach(([id, files]) => {
      if (!GD_ORDER_FILES[id]) GD_ORDER_FILES[id] = files;
    });
  }

  if (typeof GD_LOGS !== 'undefined') {
    const logSeeds = {
      [class1Id]: [{ action: '提交工单', op: submitter, content: '项目组发起一类工单，锁定数据与试算模块资源', time: '2026-03-24 09:20', active: true }],
      [class1AltId]: [
        { action: '提交工单', op: submitter, content: '项目组发起一类工单，统筹报告、函证、底稿三条服务线', time: '2026-03-22 10:40', active: false },
        { action: '提交验收', op: '张伟', content: '服务方已提交阶段性交付方案，等待项目组统一验收', time: '2026-03-24 15:42', active: true },
      ],
      [woWorkspaceMockId(ws, 2)]: [{ action: '提交工单', op: submitter, content: '项目组提交二类数据工单，等待服务方派单', time: '2026-03-24 11:10', active: true }],
      [woWorkspaceMockId(ws, 4)]: [
        { action: '提交工单', op: submitter, content: '项目组提交二类报告工单', time: '2026-03-22 10:20', active: false },
        { action: '提交验收', op: '张伟', content: '服务方已上传报告排版结果，等待项目组验收', time: '2026-03-24 16:10', active: true },
      ],
    };
    Object.entries(logSeeds).forEach(([id, logs]) => {
      if (!GD_LOGS[id]) GD_LOGS[id] = logs;
    });
  }

  if (typeof GD_ORDER_COMMENTS !== 'undefined') {
    const commentSeeds = {
      [class1AltId]: [{ author: '赵敏', dept: '审计二部', content: '报告、函证、底稿三条线已按优先级拆解完成，请项目组先确认函证范围与附注口径。', time: '2026-03-24 15:48' }],
      [woWorkspaceMockId(ws, 2)]: [{ author: submitter, dept, content: '请优先处理账龄 3 年以上的大额客户。', time: '2026-03-24 11:16' }],
      [woWorkspaceMockId(ws, 6)]: [{ author: '周芳', dept: '审计三部', content: '已进入工作区开始协同编制收入循环底稿。', time: '2026-03-24 10:05' }],
    };
    Object.entries(commentSeeds).forEach(([id, comments]) => {
      if (!GD_ORDER_COMMENTS[id]) GD_ORDER_COMMENTS[id] = comments;
    });
  }

  WO_WS_MOCK_SEEDED.add(ws.id);
}

/* ════════════════════════════════════════
   1. 类型选择器
   ════════════════════════════════════════ */

function openWoTypePicker() {
  if (typeof currentDetailWs === 'undefined' || !currentDetailWs) {
    showNotification('请先进入项目工作区再发起工单');
    return;
  }
  const hasBinding = (currentDetailWs.bindingRows || []).length > 0;

  /* 渲染三张卡片 */
  const cardsEl = document.getElementById('wo-tp-cards');
  if (cardsEl) {
    const defs = [
      { type: '一类工单', tag: '大工单',   steps: '1 步提交', color: 'purple',
        desc: '计划阶段发起，锁定服务方资源与服务模块组合，预估整体工作量' },
      { type: '二类工单', tag: '标准件',   steps: '2 步提交', color: 'blue',
        desc: '执行阶段发起，提供原料账套，服务方产出标准化结果' },
      { type: '三类工单', tag: '驻场协同', steps: '2 步提交', color: 'green',
        desc: '执行阶段发起，邀请交付组织按底稿模块进入工作区深度协同编制' },
    ];
    cardsEl.innerHTML = defs.map(t => `
      <div class="wo-tp-card" data-type="${t.type}">
        <div class="wo-tp-card-top">
          <span class="wo-tp-badge wo-tp-bdg-${t.color}">${t.tag}</span>
          <span class="wo-tp-steps-hint">${t.steps}</span>
        </div>
        <div class="wo-tp-card-title">${t.type}</div>
        <div class="wo-tp-card-desc">${t.desc}</div>
        <div class="wo-tp-card-cta">选择此类型 →</div>
      </div>`).join('');

    cardsEl.querySelectorAll('.wo-tp-card').forEach(card => {
      card.addEventListener('click', () => {
        if (card.dataset.type !== '三类工单' && !hasBinding) {
          showNotification('请先完成工作区的总所项目编码绑定，再发起一/二类工单');
          return;
        }
        openWoWizard(card.dataset.type);
      });
    });
  }

  const picker = document.getElementById('wo-type-picker');
  if (!picker) return;
  picker.classList.add('open');
  picker.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeWoTypePicker() {
  const el = document.getElementById('wo-type-picker');
  if (el) { el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); }
  document.body.style.overflow = '';
}

/* ════════════════════════════════════════
   2. 向导打开 / 关闭
   ════════════════════════════════════════ */

function openWoWizard(type) {
  closeWoTypePicker();
  /* 重置状态 */
  woWiz.type = type; woWiz.step = 1; woWiz.ws = currentDetailWs;
  woWiz.c1Title = woGenTitle(type); woWiz.c1Provider = '交付中心';
  woWiz.c1PriorAuditDate = ''; woWiz.c1PlanReportDate = ''; woWiz.c1DeliveryDeadline = '';
  woWiz.c1Modules = {};
  woWiz.c2Provider = WO_C2_DEFAULT_PROVIDER; woWiz.c2Module = WO_C2_DEFAULT_MODULE; woWiz.c2ModuleSub = woGetC2DefaultSub(WO_C2_DEFAULT_MODULE);
  woWiz.c2Companies = new Set(); woWiz.c2SubjectKeys = new Set(); woWiz.c2SubjectKeyword = ''; woWiz.c2NeedComm = false; woWiz.c2ServiceFlags = {};
  woWiz.c2LedgerExpectTime = ''; woWiz.c2DataExpectTime = ''; woWiz.c2TrialBalanceTime = ''; woWiz.c2MaterialExpectTime = '';
  woWiz.c2ExpectedTime = ''; woWiz.c2UseLedger = false;
  woWiz.c2ReqFiles = []; woWiz.c2OptFiles = [];
  woWiz.c3Provider = WO_C3_DEFAULT_PROVIDER; woWiz.c3Module = WO_C3_DEFAULT_MODULE; woWiz.c3ModuleSub = woGetC3DefaultSub(WO_C3_DEFAULT_MODULE);
  woWiz.c3Companies = new Set();
  woWiz.c3UnboundCompanies = [];
  woWiz.c3UseLedger = false;
  woWiz.c3ReqFiles = [];
  woWiz.c3DataExpectTime = ''; woWiz.c3MaterialTime = ''; woWiz.c3ExpectedTime = '';
  woWiz.c3Note = '';

  if (woBatchMerge.active && type === '二类工单') {
    const orders = woBatchMerge.sourceOrders;
    woWiz.c2Provider = woBatchMerge.provider;
    woWiz.c2Module = woBatchMerge.moduleKey;
    woWiz.c2ModuleSub = woBatchMerge.moduleSub;
    const maxExpTime = orders.map(o => o.expectedTime).filter(Boolean).sort().pop() || '';
    woWiz.c2ExpectedTime = maxExpTime;
    woWiz.c2LedgerExpectTime = orders.map(o => o.ledgerExpectTime).filter(Boolean).sort()[0] || '';
    woWiz.c2DataExpectTime = orders.map(o => o.dataExpectTime).filter(Boolean).sort()[0] || '';
    woWiz.c2TrialBalanceTime = orders.map(o => o.trialBalanceTime).filter(Boolean).sort()[0] || '';
    woWiz.c2MaterialExpectTime = orders.map(o => o.materialExpectTime).filter(Boolean).sort()[0] || '';
    woWiz.c2UseLedger = orders.some(o => o.useLedger);
    woBatchMergePreFillSubjects();
  }

  const modal = document.getElementById('wo-wizard-modal');
  if (!modal) return;
  const titleEl = document.getElementById('wo-wiz-title');
  if (titleEl) titleEl.textContent = woBatchMerge.active
    ? (woBatchMerge.sourceOrders.length > 1 ? '批量合并提交' : '提交工单')
    : `发起${type}`;

  renderWoWizardStep();
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeWoWizard() {
  const modal = document.getElementById('wo-wizard-modal');
  if (modal) { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); }
  document.body.style.overflow = '';
  woResetBatchMerge();
}

/* ════════════════════════════════════════
   3. 步骤指示器
   ════════════════════════════════════════ */

function woTotalSteps() {
  if (woWiz.type === '一类工单') return 1;
  if (woWiz.type === '二类工单') return 2;
  if (woWiz.type === '三类工单') return 2;
  return 1;
}

function woStepLabels() {
  if (woWiz.type === '一类工单') return ['填写工单'];
  if (woWiz.type === '二类工单') return ['选择服务方&服务模块', '选择主体&上传资料'];
  if (woWiz.type === '三类工单') return ['选择服务方&服务模块', '选择主体&上传资料'];
  return ['填写信息'];
}

function renderWoStepBar() {
  const el = document.getElementById('wo-wiz-steps');
  if (!el) return;
  const labels = woStepLabels(), total = woTotalSteps();
  /* 单步骤时隐藏步骤指示器 */
  if (total <= 1) { el.innerHTML = ''; el.style.display = 'none'; return; }
  el.style.display = '';
  el.innerHTML = labels.map((label, i) => {
    const n = i + 1;
    const cls = n < woWiz.step ? 'done' : n === woWiz.step ? 'active' : '';
    return `
      <div class="wo-step ${cls}">
        <div class="wo-step-circle">${n < woWiz.step ? '✓' : n}</div>
        <div class="wo-step-lbl">${label}</div>
      </div>
      ${i < total - 1 ? `<div class="wo-step-line ${n < woWiz.step ? 'done' : ''}"></div>` : ''}`;
  }).join('');
}

function updateWoNavBtns() {
  const prevBtn = document.getElementById('wo-wiz-prev');
  const nextBtn = document.getElementById('wo-wiz-next');
  const total = woTotalSteps();
  if (prevBtn) prevBtn.style.visibility = woWiz.step > 1 ? 'visible' : 'hidden';
  if (nextBtn) nextBtn.textContent = woWiz.step === total ? '提交工单' : '下一步 →';
  const sub = document.getElementById('wo-wiz-sub');
  const labels = woStepLabels();
  if (sub) sub.textContent = total === 1
    ? labels[0]
    : `第 ${woWiz.step} 步 / 共 ${total} 步  ·  ${labels[woWiz.step - 1]}`;
}

/* ════════════════════════════════════════
   4. 步骤内容渲染
   ════════════════════════════════════════ */

function renderWoWizardStep() {
  renderWoStepBar();
  updateWoNavBtns();
  const body = document.getElementById('wo-wiz-body');
  if (!body) return;
  body.scrollTop = 0;
  const t = woWiz.type, s = woWiz.step;
  if      (t === '一类工单') renderC1All(body);
  else if (t === '二类工单' && s === 1) renderC2S1(body);
  else if (t === '二类工单' && s === 2) renderC2S2(body);
  else if (t === '三类工单' && s === 1) renderC3S1(body);
  else if (t === '三类工单' && s === 2) renderC3S2(body);
  else renderC3S1(body);
}

/* ──────────────────────────────
   一类工单：三步合一的单页表单
   区域 A：项目信息（只读）
   区域 B：服务方选择 + 三个必选日期
   区域 C：服务模块多选（含各模块可选补充字段）
   ────────────────────────────── */
function renderC1All(body) {
  const ws = woWiz.ws;
  const entity    = ws.entity    || ws.group || '';
  const totalCode = ws.totalCode || '';
  const repType   = ws.reportType || '';
  const manager   = ws.manager   || '';
  const hasBound  = !!(entity && totalCode);
  const min3      = woMinDate(3);

  body.innerHTML = `
    <!-- ── A. 项目信息 ── -->
    <div class="wo-fs wo-fs-compact">
      <div class="wo-stitle">项目信息</div>
      <div class="wo-field-row wo-field-row-meta">
        <label class="wo-flbl">所属工作区</label>
        <div class="wo-fval wo-fval-muted">${ws.name}</div>
      </div>
      <div class="wo-field-row wo-field-row-meta">
        <label class="wo-flbl">工单标题 <em class="wo-req">*</em></label>
        <input type="text" class="form-input wo-c1-title-input" id="c1-title" value="${woWiz.c1Title}" placeholder="系统已自动生成，可二次编辑" style="flex:1;">
      </div>
      <div class="wo-field-row wo-field-row-meta">
        <label class="wo-flbl">工单编号</label>
        <div class="wo-fval wo-fval-muted">提交时自动生成</div>
      </div>
      ${!hasBound
        ? `<div class="wo-warn-box">⚠️ 当前工作区尚未完成总所项目编码绑定，无法发起一类工单。<br>请先在工作区详情中上传绑定文件。</div>`
        : `<table class="wo-info-table">
            <thead><tr>
              <th>公司名称</th><th>总所项目编码</th><th>财报类型</th><th>项目负责人</th>
            </tr></thead>
            <tbody>
              <tr>
                <td>${entity}</td>
                <td class="wo-code">${totalCode}</td>
                <td>${repType}</td>
                <td>${manager}</td>
              </tr>
            </tbody>
          </table>`}
    </div>

    <!-- ── B. 服务方 ── -->
    <div class="wo-fs wo-fs-compact">
      <div class="wo-stitle">选择服务方 <em class="wo-req">*</em></div>
      <div class="wo-provider-list wo-c1-prov-inline">${woProviderCards('c1-prov', woWiz.c1Provider)}</div>
    </div>

    <!-- ── B2. 关键时间节点 ── -->
    <div class="wo-fs wo-fs-compact">
      <div class="wo-stitle">关键时间节点</div>
      <div class="wo-c1-dates-grid">
        <div class="wo-c1-date-card wo-c1-dc-history">
          <div class="wo-c1-dc-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" width="20" height="20">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="wo-c1-dc-body">
            <div class="wo-c1-dc-label">上一年度审计报告日 <em class="wo-req">*</em></div>
            <div class="wo-c1-dc-hint">上一年度报告出具日期</div>
            <input type="date" class="form-input wo-c1-dc-input" id="c1-prior-audit" value="${woWiz.c1PriorAuditDate}">
          </div>
        </div>
        <div class="wo-c1-date-card wo-c1-dc-plan">
          <div class="wo-c1-dc-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" width="20" height="20">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div class="wo-c1-dc-body">
            <div class="wo-c1-dc-label">当年度年报计划报告日 <em class="wo-req">*</em></div>
            <div class="wo-c1-dc-hint">当年度计划出具报告的日期</div>
            <input type="date" class="form-input wo-c1-dc-input" id="c1-plan-report" value="${woWiz.c1PlanReportDate}">
          </div>
        </div>
        <div class="wo-c1-date-card wo-c1-dc-deadline">
          <div class="wo-c1-dc-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" width="20" height="20">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div class="wo-c1-dc-body">
            <div class="wo-c1-dc-label">期望完成时间 <em class="wo-req">*</em></div>
            <div class="wo-c1-dc-hint">所有模块需在该期望完成时间前交付完毕</div>
            <input type="date" class="form-input wo-c1-dc-input" id="c1-delivery-dl" value="${woWiz.c1DeliveryDeadline}" min="${min3}">
          </div>
        </div>
      </div>
    </div>

    <!-- ── C. 服务模块（多选 + 展开详情） ── -->
    <div class="wo-fs wo-fs-compact">
      <div class="wo-stitle">选择服务模块（可多选）<em class="wo-req">*</em></div>
      <div id="c1-mods">
        ${WO_MOD_DEF.map(m => {
          const checked = !!woWiz.c1Modules[m.key];
          return `
            <div class="wo-mod-item ${checked ? 'checked' : ''}" data-key="${m.key}">
              <label class="wo-mod-hd">
                <input type="checkbox" class="wo-mod-cb" value="${m.key}" ${checked ? 'checked' : ''}>
                <span class="wo-mod-name">${m.key}</span>
                <span class="wo-mod-desc">${m.desc}</span>
              </label>
              ${checked ? c1ModDetail(m.key) : ''}
            </div>`;
        }).join('')}
      </div>
    </div>`;

  /* --- 事件绑定 --- */
  body.querySelector('#c1-title')?.addEventListener('input', e => { woWiz.c1Title = e.target.value.trim(); });

  /* 服务方 */
  body.querySelectorAll('input[name="c1-prov"]').forEach(r => {
    r.addEventListener('change', () => {
      woWiz.c1Provider = r.value;
      body.querySelectorAll('.wo-prov-card').forEach(el => el.classList.remove('selected'));
      r.closest('.wo-prov-card')?.classList.add('selected');
    });
  });

  /* 三个日期 */
  body.querySelector('#c1-prior-audit')?.addEventListener('change', e => { woWiz.c1PriorAuditDate = e.target.value; });
  body.querySelector('#c1-plan-report')?.addEventListener('change', e => { woWiz.c1PlanReportDate = e.target.value; });
  body.querySelector('#c1-delivery-dl')?.addEventListener('change', e => {
    woWiz.c1DeliveryDeadline = e.target.value;
    /* 交付 deadline 变化时，校验所有模块的期望完成时间 */
    c1ValidateModDeadlines(body);
  });

  /* 服务模块 checkbox */
  body.querySelectorAll('.wo-mod-cb').forEach(cb => {
    cb.addEventListener('change', () => {
      const key = cb.value, item = cb.closest('.wo-mod-item');
      if (cb.checked) {
        woWiz.c1Modules[key] = { note: '', expectedTime: '', files: [] };
        item.classList.add('checked');
        if (!item.querySelector('.wo-mod-detail')) {
          item.insertAdjacentHTML('beforeend', c1ModDetail(key));
          bindC1ModDetail(item, key);
        }
      } else {
        delete woWiz.c1Modules[key];
        item.classList.remove('checked');
        item.querySelector('.wo-mod-detail')?.remove();
      }
    });
    if (cb.checked) bindC1ModDetail(cb.closest('.wo-mod-item'), cb.value);
  });

  const nextBtn = document.getElementById('wo-wiz-next');
  if (nextBtn) nextBtn.disabled = !hasBound;
}

function c1ModDetail(key) {
  const d = woWiz.c1Modules[key] || {};
  const files = d.files || [];
  /* 取该模块定义中的可选补充字段 */
  const modDef = WO_MOD_DEF.find(m => m.key === key);
  const extras = modDef?.c1Extra || [];
  const min3 = woMinDate(3);

  return `<div class="wo-mod-detail">
    ${extras.length ? `<div class="wo-c1-extras">${extras.map(ex => `
      <div class="wo-mdr">
        <label class="wo-mdlbl">${ex.label}（可选）</label>
        ${ex.type === 'number'
          ? `<input type="number" class="form-input wo-md-extra" data-field="${ex.field}" min="1" step="1"
               value="${d[ex.field] || ''}" placeholder="${ex.placeholder || ''}">`
          : `<input type="date" class="form-input wo-md-extra" data-field="${ex.field}"
               value="${d[ex.field] || ''}" min="${min3}">`}
      </div>`).join('')}</div>` : ''}
    <div class="wo-mdr">
      <label class="wo-mdlbl">备注说明</label>
      <input type="text" class="form-input wo-md-note" value="${d.note || ''}" placeholder="可选，补充说明">
    </div>
    <div class="wo-mdr">
      <label class="wo-mdlbl">期望完成时间</label>
      <input type="date" class="form-input wo-md-time" value="${d.expectedTime || ''}" min="${min3}"
        ${woWiz.c1DeliveryDeadline ? `max="${woWiz.c1DeliveryDeadline}"` : ''}>
      <div class="wo-md-time-warn" style="display:none;"></div>
    </div>
    <div class="wo-mdr wo-mdr-attach">
      <label class="wo-mdlbl">说明附件</label>
      <div class="wo-attach-wrap">
        <label class="wo-attach-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="13" height="13">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          上传附件
          <input type="file" class="wo-file-input wo-md-file" multiple accept=".xlsx,.xls">
        </label>
        <span class="wo-attach-hint">支持 Excel，&lt;10MB</span>
      </div>
    </div>
    <div class="wo-mod-file-list" id="c1-flist-${key}">
      ${files.map((name, i) => c1FileItemHtml(key, name, i)).join('')}
    </div>
    <div class="wo-c1-sample-link">
      <a href="javascript:void(0)" onclick="woDownloadSample('${key}')">下载示例文件</a>
    </div>
  </div>`;
}

function c1FileItemHtml(key, name, i) {
  return `<div class="wo-file-item">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" width="13" height="13">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
    <span class="wo-file-nm">${name}</span>
    <button class="wo-file-rm" onclick="woRemoveC1File('${key}',${i})">×</button>
  </div>`;
}

function bindC1ModDetail(item, key) {
  item.querySelector('.wo-md-note')?.addEventListener('input', e => {
    if (woWiz.c1Modules[key]) woWiz.c1Modules[key].note = e.target.value;
  });
  /* 期望完成时间 + 校验（不得晚于工单期望完成时间） */
  const timeInput = item.querySelector('.wo-md-time');
  const timeWarn  = item.querySelector('.wo-md-time-warn');
  if (timeInput) {
    timeInput.addEventListener('change', e => {
      if (woWiz.c1Modules[key]) woWiz.c1Modules[key].expectedTime = e.target.value;
      c1CheckSingleDeadline(timeInput, timeWarn, key);
    });
  }
  /* 各模块的可选补充字段 */
  item.querySelectorAll('.wo-md-extra').forEach(inp => {
    const evtType = inp.type === 'number' ? 'input' : 'change';
    inp.addEventListener(evtType, () => {
      if (woWiz.c1Modules[key]) {
        woWiz.c1Modules[key][inp.dataset.field] = inp.value;
      }
    });
  });
  /* 文件上传 */
  item.querySelector('.wo-md-file')?.addEventListener('change', function() {
    if (!woWiz.c1Modules[key]) return;
    Array.from(this.files).forEach(f => {
      if (f.size > 10 * 1024 * 1024) { showNotification(`"${f.name}" 超过 10MB 限制`); return; }
      woWiz.c1Modules[key].files.push(f.name);
    });
    this.value = '';
    const listEl = document.getElementById(`c1-flist-${key}`);
    if (listEl) listEl.innerHTML = (woWiz.c1Modules[key].files || []).map((n, i) => c1FileItemHtml(key, n, i)).join('');
  });
}

/* 下载示例文件（Mock：提示即将上线） */
function woDownloadSample(modKey) {
  const sampleMap = {
    '主体-科目-定级表': {
      filename: '主体-科目-定级表示例.xls',
      header: '填写指引：不同主体公司和不同科目的交叉单元格中填写级次信息：如 A、B、C、D。若为空，表示该主体公司无需该科目服务。',
      rows: [
        ['', '货币资金', '固定资产', '无形资产', '销售费用', '管理费用'],
        ['比亚迪汽车（广东）有限公司', 'A', 'B', '', 'C', 'B'],
        ['中国比亚迪有限公司', 'A', '', 'B', 'A', ''],
        ['比亚迪新材料有限公司', 'B', 'C', 'A', '', 'D'],
      ],
    },
    '数据': {
      filename: '数据模块示例.xls',
      rows: [
        ['主体公司', '账套期间', '币种', '取数口径', '账套处理细分', '备注'],
        ['比亚迪汽车（广东）有限公司', '2025-01 ~ 2025-12', 'CNY', '合并口径', '账套处理', '含外币重分类'],
        ['中国比亚迪有限公司', '2025-01 ~ 2025-12', 'CNY', '单体口径', '账套处理', ''],
        ['比亚迪新材料有限公司', '2025-01 ~ 2025-12', 'CNY', '单体口径', '未审明细表', ''],
      ],
    },
    '试算': {
      filename: '试算模块示例.xls',
      rows: [
        ['主体公司', '试算类型', '勾稽基准', '备注'],
        ['比亚迪汽车（广东）有限公司', '试算搭建', '合并报表', '需同步验证内部抵消分录'],
        ['中国比亚迪有限公司', '试算搭建', '单体报表', ''],
        ['比亚迪新材料有限公司', '试算填充', '单体报表', ''],
      ],
    },
    '报告': {
      filename: '报告模块示例.xls',
      rows: [
        ['主体公司', '财务报表类型', '报告类型', '备注'],
        ['比亚迪汽车（广东）有限公司', '合并', '报告编制', '含附注骨架与关键披露页'],
        ['中国比亚迪有限公司', '单体', '报告编制', ''],
        ['比亚迪新材料有限公司', '单体', '报告复核', ''],
      ],
    },
    '函证': {
      filename: '函证模块示例.xls',
      rows: [
        ['主体公司', '总所项目编号', '函证类型', '预计发函数量', '备注'],
        ['比亚迪汽车（广东）有限公司', 'HQ-2025-HD-88801', '银行纸质函证-制函', '15', '含 5 家银行基本户'],
        ['中国比亚迪有限公司', 'HQ-2025-HD-88802', '往来函证-制函', '32', '应收/应付各 16 份'],
        ['比亚迪新材料有限公司', 'HQ-2025-HD-88803', '银行纸质函证-制函', '8', ''],
      ],
    },
    '底稿': {
      filename: '底稿模块示例.xls',
      header: '填写指引：不同主体公司和不同科目的交叉单元格中填写级次信息：如 A、B、C、D。若为空，表示该主体公司无需该科目服务。',
      rows: [
        ['', '货币资金', '固定资产', '无形资产', '销售费用', '管理费用'],
        ['比亚迪汽车（广东）有限公司', 'A', 'B', '', 'C', 'B'],
        ['中国比亚迪有限公司', 'A', '', 'B', 'A', ''],
        ['比亚迪新材料有限公司', 'B', 'C', 'A', '', 'D'],
      ],
    },
    '往来函证导入模板': {
      filename: '往来函证导入模板.xls',
      rows: [
        ['函证索引', '编号', '询证函截止日期/出票日期', '查验科目', '自定义科目', '询证金额', '询证金额', '币种符号', '询证金额（折合人民币）', '收件单位', '收件单位所在省/国家', '收件单位所在市', '收件地址', '收件人', '联系电话', '邮政编码（挂号信或DHL发函必填）', '催函日期', '首次发函编号', '信件单号（发函）', '发函日期', '盖章公司名称（被审计主体）', '备注'],
        ['HZ-001', '001', '2026-03-31', '应收账款', '重点客户款', '1200000', '1200000', 'CNY', '1200000', '北京华能贸易有限公司', '北京', '北京', '朝阳区建国路 88 号', '王磊', '13800000000', '100022', '2026-04-08', 'FH-001', 'DHL001234', '2026-04-02', '华北能源集团有限公司', '请核对邮编与联系人'],
      ],
    },
  };
  const sample = sampleMap[modKey] || {
    filename: `${modKey}示例.xls`,
    rows: [
      ['字段 1', '字段 2', '字段 3'],
      ['示例值 A', '示例值 B', `请按「${modKey}」的业务场景补充内容`],
    ],
  };
  const tableRows = sample.rows
    .map(row => `<tr>${row.map(cell => `<td style="border:1px solid #D9DCE3;padding:8px 10px;">${cell}</td>`).join('')}</tr>`)
    .join('');
  const headerHtml = sample.header
    ? `<div style="margin-bottom:8px;padding:10px 12px;background:#FFFBE6;border:1px solid #FFE58F;border-radius:4px;font-size:12px;color:#333;">${sample.header}</div>`
    : '';
  const html = `
    <html>
      <head><meta charset="utf-8"></head>
      <body>
        ${headerHtml}
        <table style="border-collapse:collapse;font-family:Arial, sans-serif;font-size:12px;">
          ${tableRows}
        </table>
      </body>
    </html>`;
  const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = sample.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showNotification(`已下载「${sample.filename}」`);
}

/* 校验单个模块的期望完成时间 ≤ 工单期望完成时间 */
function c1CheckSingleDeadline(input, warnEl, key) {
  const dl = woWiz.c1DeliveryDeadline;
  const val = input.value;
  if (!dl || !val) { if (warnEl) { warnEl.style.display = 'none'; } return; }
  if (val > dl) {
    if (warnEl) {
      warnEl.textContent = `⚠ 「${key}」期望完成时间晚于工单期望完成时间（${dl}），请调整`;
      warnEl.style.display = 'block';
    }
    input.classList.add('wo-input-warn');
  } else {
    if (warnEl) warnEl.style.display = 'none';
    input.classList.remove('wo-input-warn');
  }
}

/* 工单期望完成时间变化时批量校验所有已选模块 */
function c1ValidateModDeadlines(body) {
  const dl = woWiz.c1DeliveryDeadline;
  if (!body) return;
  body.querySelectorAll('.wo-mod-item.checked').forEach(item => {
    const key   = item.dataset.key;
    const input = item.querySelector('.wo-md-time');
    const warn  = item.querySelector('.wo-md-time-warn');
    if (input) {
      /* 同步 max 属性 */
      if (dl) input.setAttribute('max', dl); else input.removeAttribute('max');
      c1CheckSingleDeadline(input, warn, key);
    }
  });
}

/* 全局挂载，供 onclick 调用 */
function woRemoveC1File(key, idx) {
  if (!woWiz.c1Modules[key]) return;
  woWiz.c1Modules[key].files.splice(idx, 1);
  const listEl = document.getElementById(`c1-flist-${key}`);
  if (listEl) listEl.innerHTML = (woWiz.c1Modules[key].files || []).map((n, i) => c1FileItemHtml(key, n, i)).join('');
}

/* ──────────────────────────────
   二类 Step 1：服务方 & 服务模块
   ────────────────────────────── */
function renderC2S1(body) {
  woEnsureC2Defaults();
  const ws = woWiz.ws || currentDetailWs;
  const missingCos = woGetC2MissingLedgerCompanies(ws);
  const moduleOptions = woGetC2ModuleOptions();
  const isMerge = woBatchMerge.active;
  const mergeDisabled = isMerge ? 'disabled' : '';

  const isSingleSubmit = isMerge && woBatchMerge.sourceOrders.length === 1;
  const mergeBanner = isMerge ? `
    <div class="wo-fs wo-fs-compact">
      <div style="background:linear-gradient(135deg,#EEF2FF,#E0E7FF);border:1px solid #C7D2FE;border-radius:12px;padding:14px 18px;display:flex;align-items:flex-start;gap:10px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="#4F46E5" stroke-width="2" stroke-linecap="round" width="18" height="18" style="flex-shrink:0;margin-top:1px;">
          <path d="M12 2v4m0 12v4m-7.07-3.93 2.83-2.83m8.48-8.48 2.83-2.83M2 12h4m12 0h4m-3.93 7.07-2.83-2.83M7.76 7.76 4.93 4.93"/>
        </svg>
        <div style="flex:1;min-width:0;">
          <div style="font-size:0.88rem;font-weight:700;color:#3730A3;margin-bottom:4px;">${isSingleSubmit ? '提交待启用工单' : '批量合并模式'}</div>
          <div style="font-size:0.82rem;color:#4338CA;line-height:1.6;">
            ${isSingleSubmit
              ? `正在提交工单 <strong>${woBatchMerge.sourceOrders[0].id}</strong>，已自动选定服务方与服务模块，请确认后点击"下一步"补充信息。`
              : `本次将合并 <strong>${woBatchMerge.sourceOrders.length}</strong> 个待启用工单为一个新工单。已自动选定服务方与服务模块，请确认后点击"下一步"。`}
          </div>
          ${isSingleSubmit ? '' : `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">
            ${woBatchMerge.sourceOrders.map(o =>
              `<span style="display:inline-block;background:#fff;border:1px solid #C7D2FE;border-radius:6px;padding:2px 10px;font-size:0.78rem;color:#4338CA;">${o.id}</span>`
            ).join('')}
          </div>`}
        </div>
      </div>
    </div>` : '';

  body.innerHTML = `
    ${mergeBanner}
    <div class="wo-fs wo-fs-compact" ${isMerge ? 'style="pointer-events:none;opacity:0.7;"' : ''}>
      <div class="wo-stitle">选择服务方 <em class="wo-req">*</em>${isMerge ? ' <span style="font-size:0.76rem;font-weight:400;color:#6366F1;margin-left:6px;">（已自动选定）</span>' : ''}</div>
      <div class="wo-provider-list">${woProviderCards('c2-prov', woWiz.c2Provider)}</div>
    </div>
    <div class="wo-fs wo-fs-compact" ${isMerge ? 'style="pointer-events:none;opacity:0.7;"' : ''}>
      <div class="wo-stitle">选择服务模块（单选）<em class="wo-req">*</em>${isMerge ? ' <span style="font-size:0.76rem;font-weight:400;color:#6366F1;margin-left:6px;">（已自动选定）</span>' : ''}</div>
      <div id="c2-mods">
        ${moduleOptions.map(mod => {
          const checked = woWiz.c2Module === mod.key;
          return `
            <div class="wo-mod-item ${checked ? 'checked' : ''}" data-key="${mod.key}">
              <label class="wo-mod-hd">
                <input type="radio" name="c2-mod" value="${mod.key}" ${checked ? 'checked' : ''} ${mergeDisabled}>
                <span class="wo-mod-name">${mod.key}</span>
                <span class="wo-mod-desc">${mod.desc}</span>
              </label>
              ${checked && mod.sub ? c2SubDetail(mod) : ''}
            </div>`;
        }).join('')}
      </div>
    </div>
    <div class="wo-fs wo-fs-compact">
      ${missingCos.length
        ? `<div class="wo-ledger-error" style="margin-top:12px;margin-bottom:0;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="15" height="15" style="flex-shrink:0;margin-top:1px;">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>检测到 <strong>${missingCos.join('、')}</strong> 主体未关联账套</span>
          </div>`
        : `<div class="wo-ledger-ok" style="margin-top:12px;">已检测当前工作区主体均已关联账套，可继续发起二类工单。</div>`}
    </div>`;

  if (!isMerge) {
    body.querySelectorAll('input[name="c2-prov"]').forEach(r => {
      r.addEventListener('change', () => {
        woWiz.c2Provider = r.value;
        renderC2S1(body);
      });
    });
    body.querySelectorAll('input[name="c2-mod"]').forEach(r => {
      r.addEventListener('change', () => {
        if (woWiz.c2Module !== r.value) woResetC2Step2State();
        woWiz.c2Module = r.value;
        woWiz.c2ModuleSub = woGetC2DefaultSub(r.value);
        renderC2S1(body);
      });
    });
    body.querySelectorAll('input[name="c2-sub"]').forEach(r => {
      r.addEventListener('change', () => {
        if (woWiz.c2ModuleSub !== r.value) woResetC2Step2State();
        woWiz.c2ModuleSub = r.value;
        renderC2S1(body);
      });
    });
  }
  const nextBtn = document.getElementById('wo-wiz-next');
  if (nextBtn) nextBtn.disabled = false;
}

function c2SubDetail(modDef) {
  return `<div class="wo-mod-detail">
    <div class="wo-mdlbl" style="margin-bottom:8px;">细分类型 <em class="wo-req">*</em></div>
    <div class="wo-sub-list">
      ${modDef.sub.map(s => `
        <label class="wo-sub-item ${woWiz.c2ModuleSub === s ? 'selected' : ''}">
          <input type="radio" name="c2-sub" value="${s}" ${woWiz.c2ModuleSub === s ? 'checked' : ''}> ${s}
        </label>`).join('')}
    </div>
  </div>`;
}

/* ──────────────────────────────
   二类 Step 2：主体公司 & 上传资料
   ────────────────────────────── */
let woC2CompactSelectGlobalBound = false;
let woC2SubjectDropdownOpen = false;

function woGetC2SubjectTagText(subject, isLetterService = false) {
  if (isLetterService === 'firmCode') return `${subject.name || '—'} ${subject.firmCode || '—'}`;
  if (isLetterService === 'reportType') return `${subject.name || '—'} ${subject.reportType || '—'}`;
  return subject.name || '—';
}

function woGetC2SubjectMetaText(subject, mode = 'company') {
  if (mode === 'firmCode') return subject.firmCode || '—';
  if (mode === 'reportType') return subject.reportType || '—';
  return '';
}

function woRenderC2MultiSubjectOption(option, mode = 'company') {
  const isSelected = woWiz.c2SubjectKeys.has(option.key);
  const metaText = woGetC2SubjectMetaText(option, mode);
  return `<div class="ws-multisel-option ${isSelected ? 'selected' : ''}" data-value="${option.key}">
      <span class="ws-multisel-checkbox ${isSelected ? 'checked' : ''}">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11" aria-hidden="true">
          <path d="m3.5 8 3 3 6-6" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      </span>
      <div class="wo-c2-multisel-main">
        <div class="ws-multisel-opt-label">${option.name}</div>
        ${metaText ? `<div class="wo-c2-opt-meta">${metaText}</div>` : ''}
      </div>
    </div>`;
}

function woRenderC2MultiSubjectSelect(subjectOptions, selectedSubjects, mode = 'company') {
  const placeholder = mode === 'firmCode'
    ? '请选择主体公司&总所项目编号（可多选）'
    : mode === 'reportType'
      ? '请选择主体公司&财务报表类型（可多选）'
      : '请选择主体公司（可多选）';
  return `<div class="wo-c2-multisel ws-multisel-wrap" id="c2-subject-select">
      <button type="button" class="ws-multisel-trigger" id="c2-subject-trigger">
        <div class="ws-multisel-tags">
          ${selectedSubjects.length
            ? selectedSubjects.map(subject => {
              const text = woGetC2SubjectTagText(subject, mode);
              return `<span class="ws-multisel-tag" title="${text}">
                  ${text}
                  <span class="ws-multisel-tag-del" data-del-key="${subject.key}">×</span>
                </span>`;
            }).join('')
            : `<span class="ws-multisel-placeholder">${placeholder}</span>`}
        </div>
        <svg class="ws-multisel-arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16" aria-hidden="true">
          <path d="m5 7 5 6 5-6" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      </button>
      <div class="ws-multisel-dropdown" id="c2-subject-dropdown">
        <div class="css-search-row">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" width="14" height="14" aria-hidden="true">
            <circle cx="9" cy="9" r="5.5"></circle>
            <path d="m13.5 13.5 3 3" stroke-linecap="round"></path>
          </svg>
          <input type="text" class="css-filter" id="c2-subject-filter" value="${woWiz.c2SubjectKeyword || ''}" placeholder="输入公司名称筛选">
        </div>
        ${subjectOptions.length
          ? subjectOptions.map(option => woRenderC2MultiSubjectOption(option, mode)).join('')
          : `<div class="wo-c2-dropdown-empty">当前工作区暂无可选主体。</div>`}
        <div class="wo-c2-dropdown-empty" id="c2-subject-empty" style="display:none;">未找到匹配主体，请调整关键词后重试。</div>
      </div>
    </div>`;
}

function bindWoC2MultiSubjectSelect(body, subjectOptions, mode = 'company') {
  const wrap = body.querySelector('#c2-subject-select');
  const trigger = body.querySelector('#c2-subject-trigger');
  const dropdown = body.querySelector('#c2-subject-dropdown');
  const filterInput = body.querySelector('#c2-subject-filter');
  const emptyEl = body.querySelector('#c2-subject-empty');
  if (!wrap || !trigger || !dropdown || !filterInput) return;

  if (!woC2CompactSelectGlobalBound) {
    woC2CompactSelectGlobalBound = true;
    document.addEventListener('click', () => {
      woC2SubjectDropdownOpen = false;
      document.querySelectorAll('.wo-c2-multisel.open').forEach(el => el.classList.remove('open'));
    });
  }

  const updateFilter = () => {
    const q = (filterInput.value || '').trim().toLowerCase();
    woWiz.c2SubjectKeyword = filterInput.value || '';
    let visibleCount = 0;
    wrap.querySelectorAll('.ws-multisel-option[data-value]').forEach(optionEl => {
      const option = subjectOptions.find(item => item.key === optionEl.dataset.value);
      const matched = !q || (option?.name || '').toLowerCase().includes(q);
      optionEl.classList.toggle('hidden', !matched);
      if (matched) visibleCount += 1;
    });
    if (emptyEl) emptyEl.style.display = visibleCount ? 'none' : 'block';
  };

  trigger.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = wrap.classList.contains('open');
    document.querySelectorAll('.wo-c2-multisel.open').forEach(el => el.classList.remove('open'));
    if (!isOpen) {
      woC2SubjectDropdownOpen = true;
      wrap.classList.add('open');
      filterInput.focus();
      updateFilter();
    } else {
      woC2SubjectDropdownOpen = false;
    }
  });

  dropdown.addEventListener('click', e => e.stopPropagation());
  filterInput.addEventListener('input', updateFilter);

  wrap.querySelectorAll('.ws-multisel-option[data-value]').forEach(optionEl => {
    optionEl.addEventListener('click', e => {
      e.stopPropagation();
      woC2SubjectDropdownOpen = true;
      woToggleC2Subject(optionEl.dataset.value, subjectOptions);
      renderC2S2(body);
    });
  });

  wrap.querySelectorAll('.ws-multisel-tag-del[data-del-key]').forEach(tagDel => {
    tagDel.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      woC2SubjectDropdownOpen = false;
      woRemoveC2Subject(tagDel.dataset.delKey, subjectOptions);
      renderC2S2(body);
    });
  });

  if (woC2SubjectDropdownOpen) {
    wrap.classList.add('open');
    updateFilter();
    filterInput.focus();
    const len = filterInput.value.length;
    filterInput.setSelectionRange(len, len);
  } else {
    updateFilter();
  }
}

function woRenderC2LedgerSection({ hasSelected, hasUnbound, missingCos, subjectCount }) {
  return `<div class="wo-fs wo-fs-compact">
      <div class="wo-stitle">账套带入</div>
      ${!hasSelected
        ? `<div class="wo-ledger-hint">请选择主体后，系统将自动检测是否可同步已关联的最新版本时点账套文件。</div>`
        : hasUnbound
          ? `<div class="wo-ledger-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="15" height="15" style="flex-shrink:0;margin-top:1px;">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>检测到 <strong>${missingCos.join('、')}</strong> 主体未关联账套，当前不可提交工单</span>
            </div>`
          : `<label class="wo-toggle-row">
              <input type="checkbox" id="c2-use-ledger" ${woWiz.c2UseLedger ? 'checked' : ''}>
              <span>同步对应主体在当前工作区已关联的最新版本时点账套文件${subjectCount ? `（共 ${subjectCount} 个）` : ''}</span>
            </label>
            <div class="wo-ledger-hint">校验通过后已默认勾选，提交后主体公司关联最新版账套时点文件将同步至服务方；后续工作区账套更新不会自动覆盖本工单，若提交后需更新版本，您可在工单详情的“需求方上传区”中进行手动更新。</div>`}
    </div>`;
}

function woRenderC2UploadSection(id, title, hint, required = false, sampleKey = '') {
  return `<div class="wo-fs wo-fs-compact">
      <div class="wo-stitle">${title}${required ? ' <em class="wo-req">*</em>' : ''}</div>
      <div class="wo-upload-layout">
        <div class="wo-upload-copy">
          <div class="wo-up-hint">${hint}</div>
          ${sampleKey ? `<div class="wo-upload-sample"><a href="javascript:void(0)" onclick="woDownloadSample('${sampleKey}')">下载示例 Excel</a></div>` : ''}
        </div>
        <div class="wo-upload-zone">
          ${woDropZone(id)}
          <div class="wo-file-list" id="${id}-flist"></div>
        </div>
      </div>
    </div>`;
}

function renderC2S2(body) {
  woEnsureC2Defaults();
  const ws = woWiz.ws;
  const serviceProfile = woGetC2ServiceProfile();
  const startField = woGetC2StartFieldConfig();
  const startFieldValue = woGetC2StartFieldValue();
  const isLetterService = woIsC2LetterService();
  const isReportService = woIsC2ReportService();
  const subjectMode = isLetterService ? 'firmCode' : (isReportService ? 'reportType' : 'company');
  const needsLedger = woC2NeedsLedgerCarry();
  const letterOptions = woGetC2LetterServiceOptions();
  const requiredUpload = woGetC2RequiredUploadSpec();
  const subjectOptions = woGetC2SubjectOptions(ws);
  woSyncC2SelectedSubjects(subjectOptions);
  const selectedSubjects = woGetSelectedC2Subjects(subjectOptions);
  const selectedCompanies = woGetC2SelectedCompanies(subjectOptions);
  const hasSelected = selectedSubjects.length > 0;
  const missingCos = needsLedger ? woGetC2MissingLedgerCompanies(ws, selectedCompanies) : [];
  const hasUnbound = needsLedger && hasSelected && missingCos.length > 0;
  const subjectCount = needsLedger ? selectedCompanies.length : 0;
  const subjectTitle = isLetterService
    ? '选择主体公司&总所项目编号'
    : isReportService
      ? '选择主体公司&财务报表类型'
      : '选择主体公司';
  const subjectTip = isLetterService
    ? '展示列表来自当前工作区详情中的绑定文件，函证场景按“主体 + 总所项目编号”原始关系展示，不做去重。'
    : isReportService
      ? '展示列表来自当前工作区详情中的绑定文件，报告场景按“主体 + 财务报表类型”原始关系展示，不做去重。'
      : '展示列表来自当前工作区详情中的绑定文件，已按公司名称去重。';
  if (hasSelected && needsLedger && !hasUnbound) woWiz.c2UseLedger = true;
  if (!hasSelected || hasUnbound || !needsLedger) woWiz.c2UseLedger = false;

  const mergeAutoHint = woBatchMerge.active ? `
    <div class="wo-fs wo-fs-compact">
      <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:12px 16px;font-size:0.82rem;color:#166534;line-height:1.6;">
        <strong>已自动填充：</strong>主体公司列表${woWiz.c2ExpectedTime ? '、期望完成时间' : ''}${startFieldValue ? '、' + (startField?.label || '') : ''}${woWiz.c2UseLedger ? '、账套带入' : ''}。
        如有系统无法自动填充的必选项（如补充材料），请手动完成后再提交。
      </div>
    </div>` : '';

  body.innerHTML = `
    ${mergeAutoHint}
    <div class="wo-fs wo-fs-compact">
      <div class="wo-c2-service-summary wo-service-summary-compact">
        <div class="wo-service-inline">
          <span class="wo-service-pill">当前服务</span>
          <span class="wo-service-inline-meta">服务方：${woWiz.c2Provider}　·　服务模块：${woGetC2ServiceLabel()}</span>
        </div>
        <div class="wo-service-inline-desc">${serviceProfile.summary}</div>
      </div>
    </div>
    <div class="wo-fs wo-fs-compact">
      <div class="wo-stitle-row">
        <div class="wo-stitle">${subjectTitle}<em class="wo-req">*</em></div>
      </div>
      <div class="wo-field-tip">${subjectTip}</div>
      ${woRenderC2MultiSubjectSelect(subjectOptions, selectedSubjects, subjectMode)}
    </div>
    ${isLetterService ? `<div class="wo-fs wo-fs-compact">
      <div class="wo-stitle">服务勾选项</div>
      <div class="wo-check-list">
        ${letterOptions.map(item => `
          <label class="wo-check-item">
            <input type="checkbox" class="wo-c2-flag" value="${item.key}" ${woWiz.c2ServiceFlags[item.key] ? 'checked' : ''}>
            <span>${item.label}</span>
          </label>`).join('')}
      </div>
    </div>` : ''}
    ${startField ? `<div class="wo-fs wo-fs-compact">
      <div class="wo-stitle">${startField.label}</div>
      <div class="wo-field-tip">${startField.hint}</div>
      <input type="date" class="form-input" id="c2-start-source-time" value="${startFieldValue}" style="width:240px;">
    </div>` : ''}
    <div class="wo-fs wo-fs-compact">
      <div class="wo-stitle">期望完成时间 <em class="wo-req">*</em></div>
      <input type="date" class="form-input" id="c2-exp-time" value="${woWiz.c2ExpectedTime}" min="${woMinDate()}" style="width:200px;">
    </div>
    ${woIsC2BankLetterService() && requiredUpload ? woRenderC2UploadSection('c2-req', '必须资料', requiredUpload.hint, true, requiredUpload.sampleKey) : ''}
    ${woIsC2CounterpartyLetterService() ? woRenderC2LedgerSection({ hasSelected, hasUnbound, missingCos, subjectCount }) : ''}
    ${woIsC2CounterpartyLetterService() && requiredUpload ? woRenderC2UploadSection('c2-req', '必须资料', requiredUpload.hint, true, requiredUpload.sampleKey) : ''}
    ${isReportService && requiredUpload ? woRenderC2UploadSection('c2-req', '其他必要补充材料', requiredUpload.hint, true, requiredUpload.sampleKey) : ''}
    ${!isLetterService && !isReportService && needsLedger ? woRenderC2LedgerSection({ hasSelected, hasUnbound, missingCos, subjectCount }) : ''}
    ${!isLetterService && !isReportService ? woRenderC2UploadSection('c2-opt', '其他必要补充资料（可选）', serviceProfile.uploadHint, false) : ''}`;

  bindWoC2MultiSubjectSelect(body, subjectOptions, subjectMode);
  body.querySelectorAll('.wo-c2-flag').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) woWiz.c2ServiceFlags[cb.value] = true;
      else delete woWiz.c2ServiceFlags[cb.value];
    });
  });
  body.querySelector('#c2-start-source-time')?.addEventListener('change', e => { woSetC2StartFieldValue(e.target.value); });
  body.querySelector('#c2-exp-time')?.addEventListener('change', e => { woWiz.c2ExpectedTime = e.target.value; });
  body.querySelector('#c2-use-ledger')?.addEventListener('change', e => { woWiz.c2UseLedger = e.target.checked; });

  if (requiredUpload) {
    bindWoDropZone(body, 'c2-req', woWiz.c2ReqFiles, 'c2-req-flist');
    renderWoFileList(body.querySelector('#c2-req-flist'), woWiz.c2ReqFiles, 'c2-req');
  }
  if (!isLetterService && !isReportService) {
    bindWoDropZone(body, 'c2-opt', woWiz.c2OptFiles, 'c2-opt-flist');
    renderWoFileList(body.querySelector('#c2-opt-flist'), woWiz.c2OptFiles, 'c2-opt');
  }

  const nextBtn = document.getElementById('wo-wiz-next');
  if (nextBtn) nextBtn.disabled = hasUnbound;
}

/* ──────────────────────────────
   三类 Step 1：服务方 & 服务模块
   ────────────────────────────── */
function renderC3S1(body) {
  woEnsureC3Defaults();
  const moduleDef = woGetC3ModuleDef();
  body.innerHTML = `
    <div class="wo-fs">
      <div class="wo-stitle">选择服务方 <em class="wo-req">*</em></div>
      <div class="wo-provider-list">${woProviderCards('c3-prov', woWiz.c3Provider)}</div>
    </div>
    <div class="wo-fs">
      <div class="wo-stitle">选择服务模块（单选）<em class="wo-req">*</em></div>
      <div class="wo-mod-item checked" data-key="${moduleDef?.key || WO_C3_DEFAULT_MODULE}">
        <label class="wo-mod-hd">
          <input type="radio" name="c3-mod" value="${moduleDef?.key || WO_C3_DEFAULT_MODULE}" checked>
          <span class="wo-mod-name">${moduleDef?.key || WO_C3_DEFAULT_MODULE}</span>
          <span class="wo-mod-desc">${moduleDef?.desc || '按底稿模块进入当前工作区协同编制'}</span>
        </label>
      </div>
    </div>
    <div class="wo-fs">
      <div class="wo-info-tip">三类工单提交后，所选交付组织将进入当前工作区开展底稿协同编制。</div>
    </div>`;
  body.querySelectorAll('input[name="c3-prov"]').forEach(r => {
    r.addEventListener('change', () => {
      woWiz.c3Provider = r.value;
      renderC3S1(body);
    });
  });
  const nextBtn = document.getElementById('wo-wiz-next');
  if (nextBtn) nextBtn.disabled = false;
}

/* ── 三类工单：获取未关联账套的主体列表 ── */
function woGetC3MissingLedgerCompanies(ws = woWiz.ws || currentDetailWs, companies = []) {
  return companies.filter(co => {
    const mapped = ws?.assocMap?.[co];
    return !mapped || Object.keys(mapped).length === 0;
  });
}

/* ── 三类工单：账套带入区域 HTML（允许未关联主体仍可提交） ── */
function woRenderC3LedgerSection(companies = [], ws = woWiz.ws) {
  if (!companies.length) {
    return `<div class="wo-fs wo-fs-compact">
      <div class="wo-stitle">账套带入</div>
      <div class="wo-ledger-hint">上传主体-科目-定级表并通过校验后，系统将自动检测主体公司的关联账套状态。</div>
    </div>`;
  }
  const missingCos = woGetC3MissingLedgerCompanies(ws, companies);
  const boundCount = companies.length - missingCos.length;
  const hasMissing = missingCos.length > 0;

  if (hasMissing) woWiz.c3UseLedger = boundCount > 0;
  else woWiz.c3UseLedger = true;

  return `<div class="wo-fs wo-fs-compact">
    <div class="wo-stitle">账套带入</div>
    <label class="wo-toggle-row">
      <input type="checkbox" id="c3-use-ledger" ${woWiz.c3UseLedger ? 'checked' : ''}>
      <span>同步对应主体在当前工作区已关联的最新版本时点账套文件（共 ${boundCount} 个）</span>
    </label>
    ${hasMissing
      ? `<div class="wo-ledger-hint" style="color:#D97706;">检测到 <strong>${missingCos.join('、')}</strong> 主体未关联账套，请在"预计账套提供时间"之前提交，确保工单正常交付。</div>`
      : `<div class="wo-ledger-hint">校验通过后已默认勾选，提交后主体公司关联最新版账套时点文件将同步至服务方；后续工作区账套更新不会自动覆盖本工单，若提交后需更新版本，您可在工单详情的"需求方上传区"中进行手动更新。</div>`}
  </div>`;
}

/* ──────────────────────────────
   三类 Step 2：主体公司 & 上传资料
   ────────────────────────────── */
function renderC3S2(body) {
  woEnsureC3Defaults();
  const serviceProfile = woGetC3ServiceProfile();
  woSyncC3CompaniesFromFiles();
  const companyText = woGetC3CompaniesText();
  const uploadNotice = woGetC3UploadNotice();
  const companies = [...woWiz.c3Companies];
  const fileUploaded = woWiz.c3ReqFiles.length > 0;
  const fileValid = fileUploaded && uploadNotice.tone !== 'error';
  body.innerHTML = `
    <div class="wo-fs wo-c3-fs-compact">
      <div class="wo-c2-service-summary wo-c3-service-summary-compact">
        <div class="wo-c3-service-inline">
          <span class="wo-c3-service-pill">当前服务</span>
          <span class="wo-c3-service-inline-meta">服务方：${woWiz.c3Provider}　·　服务模块：${woGetC3ServiceLabel()}</span>
        </div>
        <div class="wo-c3-service-inline-desc">${serviceProfile.summary}</div>
      </div>
    </div>
    <div class="wo-fs">
      <div class="wo-stitle">资料上传区 <em class="wo-req">*</em></div>
      <div class="wo-c3-upload-layout">
        <div class="wo-c3-upload-copy">
          <div class="wo-up-hint">请上传主体-科目-定级表，系统将自动为您拆分成主体公司粒度的多个工单提交</div>
          <div class="wo-c3-sample-row">
            <a href="javascript:void(0)" onclick="woDownloadSample('主体-科目-定级表')">下载示例 Excel</a>
          </div>
        </div>
        <div class="wo-c3-upload-zone">
          ${woDropZone('c3-req')}
          <div class="wo-file-list" id="c3-req-flist"></div>
        </div>
        <div class="wo-c3-upload-notice is-${uploadNotice.tone}">
          <div class="wo-c3-upload-notice-title">${uploadNotice.title}</div>
          <div class="wo-c3-upload-notice-text">${uploadNotice.message}</div>
        </div>
      </div>
    </div>
    <div class="wo-fs wo-c3-fs-compact">
      <div class="wo-stitle-row wo-c3-auto-head">
        <div class="wo-stitle">主体公司列表（自动生成）</div>
        <div class="wo-c3-auto-hint">系统将根据上传的主体-科目-定级表自动抽取</div>
      </div>
      <input
        type="text"
        class="form-input wo-c3-auto-input"
        value="${companyText}"
        placeholder="上传主体-科目-定级表后，系统将自动填充主体名称，并使用英文逗号分隔"
        readonly
      >
    </div>
    ${fileValid && companies.length > 0 ? woRenderC3LedgerSection(companies) : ''}
    <div class="wo-fs">
      <div class="wo-stitle">关键时间节点</div>
      <div class="wo-c3-date-grid">
        <div class="wo-c3-date-card">
          <div class="wo-c3-date-label">预计账套提供时间 <em class="wo-req">*</em></div>
          <div class="wo-c3-date-hint">项目组预计向服务方补齐账套资料的时间</div>
          <input type="date" class="form-input wo-c3-date-input" id="c3-data-time" value="${woWiz.c3DataExpectTime}">
        </div>
        <div class="wo-c3-date-card">
          <div class="wo-c3-date-label">整体资料提供时间 <em class="wo-req">*</em></div>
          <div class="wo-c3-date-hint">项目组预计完成底稿所需整体资料补充的时间</div>
          <input type="date" class="form-input wo-c3-date-input" id="c3-material-time" value="${woWiz.c3MaterialTime}">
        </div>
        <div class="wo-c3-date-card">
          <div class="wo-c3-date-label">期望完成时间 <em class="wo-req">*</em></div>
          <div class="wo-c3-date-hint">服务方应完成当前底稿协同任务的时间</div>
          <input type="date" class="form-input wo-c3-date-input" id="c3-exp-time" value="${woWiz.c3ExpectedTime}" min="${woMinDate()}">
        </div>
      </div>
    </div>`;
  bindWoDropZone(body, 'c3-req', woWiz.c3ReqFiles, 'c3-req-flist', () => {
    woSyncC3CompaniesFromFiles();
    renderC3S2(body);
  });
  renderWoFileList(body.querySelector('#c3-req-flist'), woWiz.c3ReqFiles, 'c3-req');
  body.querySelector('#c3-use-ledger')?.addEventListener('change', e => { woWiz.c3UseLedger = e.target.checked; });
  body.querySelector('#c3-data-time')?.addEventListener('change', e => { woWiz.c3DataExpectTime = e.target.value; });
  body.querySelector('#c3-material-time')?.addEventListener('change', e => { woWiz.c3MaterialTime = e.target.value; });
  body.querySelector('#c3-exp-time')?.addEventListener('change', e => { woWiz.c3ExpectedTime = e.target.value; });
  const nextBtn = document.getElementById('wo-wiz-next');
  if (nextBtn) nextBtn.disabled = false;
}

/* ──────────────────────────────
   公共：服务方卡片渲染
   ────────────────────────────── */
function woProviderCards(name, selected) {
  const options = typeof GD_DELIVERY_ORGS !== 'undefined' && Array.isArray(GD_DELIVERY_ORGS) && GD_DELIVERY_ORGS.length
    ? [...GD_DELIVERY_ORGS]
        .sort((a, b) => {
          if (a.name === WO_C2_DEFAULT_PROVIDER) return -1;
          if (b.name === WO_C2_DEFAULT_PROVIDER) return 1;
          return 0;
        })
        .map(item => ({
          val: item.name,
          desc: item.desc || `${item.sourceDept || '交付组织'}承接该类服务`,
        }))
    : [
        { val: '交付中心', desc: '由交付中心专业团队承接，标准化流程执行，质量可靠' },
        { val: '业务一部后台', desc: '由审计一部后台承接，适合标准化数据与试算需求' },
        { val: '业务二部后台', desc: '由审计二部后台承接，适合函证等专项交付需求' },
      ];
  return options.map(p => `
    <label class="wo-prov-card ${selected === p.val ? 'selected' : ''}">
      <input type="radio" name="${name}" value="${p.val}" ${selected === p.val ? 'checked' : ''}>
      <div class="wo-prov-inner">
        <div class="wo-prov-name">${p.val}</div>
        <div class="wo-prov-desc">${p.desc}</div>
      </div>
    </label>`).join('');
}

/* ──────────────────────────────
   上传区域工具函数
   ────────────────────────────── */
function woDropZone(id) {
  return `<div class="wo-dz" id="${id}-zone">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" width="26" height="26">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
    <p>点击或拖拽上传</p>
    <p class="wo-dz-fmt">支持 PDF、Excel、Word，单文件不超过 20MB</p>
    <input type="file" class="wo-file-input" id="${id}-input" multiple accept=".pdf,.xlsx,.xls,.docx,.doc,.png,.jpg">
  </div>`;
}

function bindWoDropZone(container, pfx, arr, listId, onFilesChange) {
  const zone  = container.querySelector(`#${pfx}-zone`);
  const input = container.querySelector(`#${pfx}-input`);
  if (!zone || !input) return;
  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', ()  => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('drag-over');
    addWoFiles(e.dataTransfer.files, arr, container.querySelector(`#${listId}`), pfx, onFilesChange);
  });
  input.addEventListener('change', () => {
    addWoFiles(input.files, arr, container.querySelector(`#${listId}`), pfx, onFilesChange);
    input.value = '';
  });
}

function addWoFiles(files, arr, listEl, pfx, onFilesChange) {
  Array.from(files).forEach(f => {
    if (f.size > 20 * 1024 * 1024) { showNotification(`"${f.name}" 超过 20MB 限制`); return; }
    arr.push(f.name);
  });
  renderWoFileList(listEl, arr, pfx);
  if (typeof onFilesChange === 'function') onFilesChange(arr);
}

function renderWoFileList(listEl, arr, pfx) {
  if (!listEl) return;
  listEl.innerHTML = arr.map((name, i) => `
    <div class="wo-file-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" width="13" height="13">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
      <span class="wo-file-nm">${name}</span>
      <button class="wo-file-rm" onclick="woRemoveFile('${pfx}',${i})">×</button>
    </div>`).join('');
}

/* 全局挂载，供 onclick 调用 */
function woRemoveFile(pfx, idx) {
  const arr = {
    'c2-req': woWiz.c2ReqFiles,
    'c2-opt': woWiz.c2OptFiles,
    'c3-req': woWiz.c3ReqFiles,
  }[pfx];
  if (!arr) return;
  arr.splice(idx, 1);
  const container = document.getElementById('wo-wiz-body');
  if (pfx === 'c3-req' && woWiz.type === '三类工单' && woWiz.step === 2 && container) {
    woSyncC3CompaniesFromFiles();
    renderC3S2(container);
    return;
  }
  const listEl = container?.querySelector(`#${pfx}-flist`);
  if (listEl) renderWoFileList(listEl, arr, pfx);
}

/* ════════════════════════════════════════
   5. 向导导航与验证
   ════════════════════════════════════════ */

function woWizNext() {
  const nextBtn = document.getElementById('wo-wiz-next');
  if (nextBtn?.disabled) return;
  if (!validateWoStep()) return;
  if (woWiz.step < woTotalSteps()) { woWiz.step++; renderWoWizardStep(); }
  else submitWorkOrder();
}

function woWizPrev() {
  if (woWiz.step > 1) { woWiz.step--; renderWoWizardStep(); }
}

function validateWoStep() {
  const t = woWiz.type, s = woWiz.step;
  if (t === '一类工单') {
    if (!woWiz.c1Title.trim())                      { showNotification('请填写工单标题'); return false; }
    if (!woWiz.c1Provider)                           { showNotification('请选择服务方'); return false; }
    if (!woWiz.c1PriorAuditDate)                     { showNotification('请选择上一年度审计报告日'); return false; }
    if (!woWiz.c1PlanReportDate)                     { showNotification('请选择当年度年报计划报告日'); return false; }
    if (!woWiz.c1DeliveryDeadline)                   { showNotification('请选择期望完成时间'); return false; }
    if (Object.keys(woWiz.c1Modules).length === 0)   { showNotification('请至少选择一个服务模块'); return false; }
    /* 模块级 deadline 不得晚于工单期望完成时间 */
    const dl = woWiz.c1DeliveryDeadline;
    for (const [mod, detail] of Object.entries(woWiz.c1Modules)) {
      if (detail.expectedTime && detail.expectedTime > dl) {
        showNotification(`「${mod}」期望完成时间（${detail.expectedTime}）晚于工单期望完成时间（${dl}），请调整`);
        return false;
      }
    }
  }
  if (t === '二类工单') {
    if (s === 1) {
      if (!woWiz.c2Provider) { showNotification('请选择服务方'); return false; }
      if (!woWiz.c2Module) { showNotification('请选择服务模块'); return false; }
      const mdef = woGetC2ModuleDef(woWiz.c2Module);
      if (mdef?.sub && !woWiz.c2ModuleSub) { showNotification('请选择服务模块的细分类型'); return false; }
    }
    if (s === 2) {
      const selectedSubjects = woGetSelectedC2Subjects();
      if (!selectedSubjects.length) {
        showNotification(
          woIsC2LetterService()
            ? '请至少选择一个主体公司&总所项目编号'
            : woIsC2ReportService()
              ? '请至少选择一个主体公司&财务报表类型'
              : '请至少选择一个主体公司'
        );
        return false;
      }
      const c2StartField = woGetC2StartFieldConfig();
      const c2StartValue = woGetC2StartFieldValue();
      if (!woWiz.c2ExpectedTime) { showNotification('请选择期望完成时间'); return false; }
      if (c2StartField && c2StartValue && woWiz.c2ExpectedTime < c2StartValue) {
        showNotification(`期望完成时间不能早于${c2StartField.label}`);
        return false;
      }
      const selectedCompanies = woGetC2SelectedCompanies();
      const missingCos = woC2NeedsLedgerCarry() ? woGetC2MissingLedgerCompanies(woWiz.ws, selectedCompanies) : [];
      if (woC2NeedsLedgerCarry() && missingCos.length > 0) {
        showNotification(`${missingCos.join('、')} 主体未关联账套，请先完成账套关联`);
        return false;
      }
      if (woGetC2RequiredUploadSpec() && woWiz.c2ReqFiles.length === 0) {
        showNotification('请上传必须资料');
        return false;
      }
    }
  }
  if (t === '三类工单') {
    if (s === 1) {
      if (!woWiz.c3Provider) { showNotification('请选择服务方'); return false; }
      if (!woWiz.c3Module) { showNotification('请选择服务模块'); return false; }
    }
    if (s === 2) {
      woSyncC3CompaniesFromFiles();
      if (woWiz.c3ReqFiles.length === 0) { showNotification('请上传主体-科目-定级表'); return false; }
      if (woWiz.c3Companies.size === 0) { showNotification('未识别到主体公司，请重新上传主体-科目-定级表'); return false; }
      if (woWiz.c3UnboundCompanies && woWiz.c3UnboundCompanies.length > 0) {
        showNotification(`${woWiz.c3UnboundCompanies.join('、')} 不在当前工作区绑定文件中，请更新绑定文件或删除对应行`);
        return false;
      }
      if (!woWiz.c3DataExpectTime) { showNotification('请选择预计账套提供时间'); return false; }
      if (!woWiz.c3MaterialTime) { showNotification('请选择整体资料提供时间'); return false; }
      if (!woWiz.c3ExpectedTime) { showNotification('请选择期望完成时间'); return false; }
      if (woWiz.c3MaterialTime < woWiz.c3DataExpectTime) {
        showNotification('整体资料提供时间不能早于预计账套提供时间');
        return false;
      }
      if (woWiz.c3ExpectedTime < woWiz.c3MaterialTime) {
        showNotification('期望完成时间不能早于整体资料提供时间');
        return false;
      }
    }
  }
  return true;
}

/* ════════════════════════════════════════
   6. 提交工单
   ════════════════════════════════════════ */

function submitWorkOrder() {
  const ws = woWiz.ws, type = woWiz.type, id = woGenId(), now = woNow();
  const rows = woGetC2BindingRows(ws);
  const isMerge = woBatchMerge.active;
  const mergeSourceOrders = isMerge ? [...woBatchMerge.sourceOrders] : [];
  const mergeSourceIds = new Set(mergeSourceOrders.map(o => o.id));
  const mergeParentOrderId = isMerge ? woBatchMerge.parentOrderId : '';

  /* 基础字段（所有类型通用）
     一类工单：使用工作区单一主体（entity + totalCode）
     二类/三类工单：company/firmCode 等字段在各分支里精确设置 */
  const base = {
    id,
    woType:          type,
    parentOrderId:   mergeParentOrderId,
    workspace:       ws.name,
    workspaceId:     ws.id || '',
    company:         ws.entity || ws.group || '',
    firmCode:        ws.totalCode || ws.firmCode || '',
    reportType:      ws.reportType || '',
    projectManager:  ws.manager || '',
    submitter:       woCurrentUserName(),
    projectFollower: woCurrentUserName(),
    submitTime:      now,
    expectedTime:    '',
    handler:         '',
    status:          '待接单',
    priority:        '普通',
    desc:            '',
    attachments:     [],
    serviceModule:   '',
    serviceProvider: '',
    provider:        '',
    providerOrgName: '',
    providerOrgId:   '',
    rejectReason:    '',
    revisionCount:   0,
    dept:            woCurrentUserDept(ws),
    workspaceDept:   ws.dept || '',
    workspaceGroup:  ws.group || '',
    /* 兼容 gd.js 中的旧字段引用 */
    type:            type,
  };

  if (type === '一类工单') {
    const mods = Object.keys(woWiz.c1Modules);
    const providerName = woWiz.c1Provider || '交付中心';
    Object.assign(base, {
      title:           woWiz.c1Title || woGenTitle(type),
      serviceProvider: providerName,
      provider:        providerName,
      providerOrgName: providerName,
      providerOrgId:   woProviderOrgIdByName(providerName),
      serviceModule:   mods.join('、'),
      expectedTime:    woWiz.c1DeliveryDeadline,
      priorAuditDate:  woWiz.c1PriorAuditDate,
      planReportDate:  woWiz.c1PlanReportDate,
      deliveryDeadline:woWiz.c1DeliveryDeadline,
      moduleDetails:   JSON.parse(JSON.stringify(woWiz.c1Modules)),
    });
  } else if (type === '二类工单') {
    const modLabel = woWiz.c2ModuleSub ? `${woWiz.c2Module}-${woWiz.c2ModuleSub}` : woWiz.c2Module;
    const selectedSubjects = woGetSelectedC2Subjects();
    const selectedCompanies = woGetC2SelectedCompanies();
    const c2StartField = woGetC2StartFieldConfig();
    const c2StartValue = woGetC2StartFieldValue();
    const providerName = woWiz.c2Provider || '交付中心';
    const selRows = selectedSubjects.flatMap(subject => subject.rows || []);
    const relatedProjectRows = woBuildRelatedProjectRows(selRows);
    const selectedCos = woJoinRelatedProjectField(relatedProjectRows, 'company');
    const selFirmCodes   = woJoinRelatedProjectField(relatedProjectRows, 'firmCode');
    const selReportTypes = woJoinRelatedProjectField(relatedProjectRows, 'reportType');
    const selManagers    = woJoinRelatedProjectField(relatedProjectRows, 'manager');
    const selectedFlags = woGetC2LetterServiceOptions()
      .filter(item => woWiz.c2ServiceFlags[item.key])
      .map(item => item.label);
    const subjectMode = woIsC2LetterService() ? 'firmCode' : (woIsC2ReportService() ? 'reportType' : 'company');
    const allAttachments = woGetC2RequiredUploadSpec()
      ? [...woWiz.c2ReqFiles]
      : [...woWiz.c2OptFiles];
    const selectedSubjectText = selectedSubjects
      .map(subject => woGetC2SubjectTagText(subject, subjectMode))
      .join('、');
    const ledgerSnapshots = woC2NeedsLedgerCarry() && woWiz.c2UseLedger
      ? woBuildLedgerSnapshotRows(ws, selectedCompanies)
      : [];
    Object.assign(base, {
      title:           woGenTitle(type),
      serviceProvider: providerName,
      provider:        providerName,
      providerOrgName: providerName,
      providerOrgId:   woProviderOrgIdByName(providerName),
      serviceModule:   modLabel,
      company:         selectedCos || base.company,
      firmCode:        selFirmCodes   || base.firmCode,
      reportType:      selReportTypes || base.reportType,
      projectManager:  selManagers    || base.projectManager,
      expectedTime:    woWiz.c2ExpectedTime,
      attachments:     allAttachments,
      requiredAttachments: [...woWiz.c2ReqFiles],
      optionalAttachments: [...woWiz.c2OptFiles],
      useLedger:       woC2NeedsLedgerCarry() ? woWiz.c2UseLedger : false,
      serviceFlags:    { ...woWiz.c2ServiceFlags },
      serviceOptions:  selectedFlags,
      ledgerSnapshots,
      relatedProjectRows,
      desc:            `二类工单：${woGetC2ServiceLabel()}，主体 ${selectedSubjectText || base.company}${selectedFlags.length ? `；附加服务：${selectedFlags.join('、')}` : ''}${woC2NeedsLedgerCarry() && woWiz.c2UseLedger ? '；已同步账套快照' : ''}。`,
    });
    if (c2StartField?.orderField) base[c2StartField.orderField] = c2StartValue;
  } else {
    /* ── 三类工单：按主体公司拆分为多个独立工单 ── */
    const selectedCompanies = [...woWiz.c3Companies];
    const providerName = woWiz.c3Provider || WO_C3_DEFAULT_PROVIDER;
    const modLabel = woWiz.c3ModuleSub ? `${woWiz.c3Module}-${woWiz.c3ModuleSub}` : woWiz.c3Module;

    /* 模拟主体-科目-定级表中的科目列（用于拆分后的子表文件名） */
    const mockSubjects = ['货币资金', '固定资产', '无形资产', '销售费用', '管理费用'];
    const mockGrades = { A: 0.3, B: 0.35, C: 0.2, D: 0.15 };
    const gradeKeys = Object.keys(mockGrades);

    const splitOrders = [];
    selectedCompanies.forEach((co, idx) => {
      const splitId = woGenId() + '-' + String(idx + 1).padStart(2, '0');
      const bindingRow = rows.find(r => r.name === co);
      const splitFileName = `主体-科目-定级表_${co}.xls`;

      /* 构建该主体的账套快照 */
      const ledgerSnapshots = woWiz.c3UseLedger
        ? woBuildLedgerSnapshotRows(ws, [co])
        : [];

      const splitOrder = {
        ...base,
        id: splitId,
        title: `${co} 底稿协同编制`,
        serviceProvider: providerName,
        provider: providerName,
        providerOrgName: providerName,
        providerOrgId: woProviderOrgIdByName(providerName),
        serviceModule: modLabel,
        company: co,
        firmCode: bindingRow?.firmCode || base.firmCode,
        reportType: bindingRow?.reportType || base.reportType,
        projectManager: bindingRow?.firmManager || bindingRow?.manager || base.projectManager,
        expectedTime: woWiz.c3ExpectedTime,
        dataExpectTime: woWiz.c3DataExpectTime,
        materialAllExpectTime: woWiz.c3MaterialTime,
        attachments: [splitFileName],
        useLedger: woWiz.c3UseLedger,
        ledgerSnapshots,
        desc: `三类工单：${woGetC3ServiceLabel()}，主体 ${co}，服务方按主体-科目-定级表结果进入工作区协同编制。`,
      };
      splitOrders.push(splitOrder);
    });

    /* 将所有拆分工单写入数据 */
    splitOrders.forEach(order => {
      GD_WORK_ORDERS.unshift(order);
      if (typeof GD_ORDER_FILES !== 'undefined') {
        const reqFiles = woBuildOrderFileRows(order.attachments, order.submitter, order.submitTime);
        const ledger = (order.ledgerSnapshots || []).map(item => ({ ...item }));
        GD_ORDER_FILES[order.id] = { req: reqFiles, svc: [], ledger };
      }
    });

    closeWoWizard();
    showNotification(`三类工单已按 ${splitOrders.length} 家主体公司拆分提交，共生成 ${splitOrders.length} 个独立工单`);
    if (document.querySelector('#pd-panel-orders.active')) renderWoMgrPanel();
    if (typeof gdRenderWorkOrders === 'function') gdRenderWorkOrders();
    return;
  }

  const persistedReqFiles = type === '一类工单'
    ? []
    : woBuildOrderFileRows(base.attachments, base.submitter, base.submitTime);
  const persistedLedgerSnapshots = (base.ledgerSnapshots || []).map(item => ({ ...item }));

  if (isMerge && type === '二类工单') {
    for (let i = GD_WORK_ORDERS.length - 1; i >= 0; i--) {
      if (mergeSourceIds.has(GD_WORK_ORDERS[i].id)) GD_WORK_ORDERS.splice(i, 1);
    }
    if (typeof GD_ORDER_FILES !== 'undefined') {
      mergeSourceIds.forEach(srcId => { delete GD_ORDER_FILES[srcId]; });
    }
  }

  GD_WORK_ORDERS.unshift(base);
  if (typeof GD_ORDER_FILES !== 'undefined' && type !== '一类工单') {
    const prev = GD_ORDER_FILES[id] || {};
    GD_ORDER_FILES[id] = {
      ...prev,
      req: persistedReqFiles,
      svc: Array.isArray(prev.svc) ? prev.svc : [],
      ledger: persistedLedgerSnapshots,
    };
  }

  woClearSelectedOrders();
  closeWoWizard();

  if (isMerge && mergeSourceOrders.length > 1) {
    showNotification(`已将 ${mergeSourceOrders.length} 个待启用工单合并为新工单 ${id}，等待服务方接单`);
    if (typeof gdAddLog === 'function') {
      gdAddLog(id, '批量合并提交', `由 ${mergeSourceOrders.map(o => o.id).join('、')} 合并生成`);
    }
  } else if (isMerge && mergeSourceOrders.length === 1) {
    showNotification(`工单 ${id} 已提交，等待服务方接单`);
    if (typeof gdAddLog === 'function') {
      gdAddLog(id, '提交工单', `由待启用工单 ${mergeSourceOrders[0].id} 确认提交`);
    }
  } else {
    showNotification(`${type} ${id} 已提交，等待服务方接单`);
  }

  /* 刷新工单管理面板 */
  if (document.querySelector('#pd-panel-orders.active')) renderWoMgrPanel();
  /* 刷新工单总览 */
  if (typeof gdRenderWorkOrders === 'function') gdRenderWorkOrders();
}

/* ════════════════════════════════════════
   7. 工作区工单管理面板
   ════════════════════════════════════════ */

function woSyncSelectedOrders(allOrders = []) {
  const validIds = new Set(allOrders.filter(woCanAssignProjectFollower).map(order => order.id));
  woMgr.selectedIds.forEach(id => {
    if (!validIds.has(id)) woMgr.selectedIds.delete(id);
  });
}

function woClearSelectedOrders() {
  woMgr.selectedIds.clear();
  woVisibleSelectableIds = [];
}

function woGetSelectedWorkspaceOrders() {
  const wsName = currentDetailWs?.name;
  if (!wsName) return [];
  return [...woMgr.selectedIds]
    .map(id => GD_WORK_ORDERS.find(order => order.id === id))
    .filter(order => order && order.workspace === wsName && woCanAssignProjectFollower(order));
}

function woCheckAllRows(checked) {
  woVisibleSelectableIds.forEach(id => {
    if (checked) woMgr.selectedIds.add(id);
    else woMgr.selectedIds.delete(id);
  });
  renderWoMgrPanel();
}

function woCheckRow(id, checked) {
  if (checked) woMgr.selectedIds.add(id);
  else woMgr.selectedIds.delete(id);
  renderWoMgrPanel();
}

function woSelectBatchMember(memberId) {
  woBatchSelectedMemberId = memberId;
  woRenderBatchDispatchSelector();
}

function woFilterBatchMembers(members) {
  const keyword = woBatchMemberKeyword.trim().toLowerCase();
  if (!keyword) return members;
  return members.filter(member => {
    if (member.id === woBatchSelectedMemberId) return true;
    const roleName = woWorkspaceMemberRoleName(member);
    return [member.name, member.dept, roleName]
      .some(value => String(value || '').toLowerCase().includes(keyword));
  });
}

/* ─── 批量合并提交 ─── */

function woOpenBatchMerge() {
  const allSelected = [...woMgr.selectedIds]
    .map(id => GD_WORK_ORDERS.find(o => o.id === id))
    .filter(Boolean);

  if (!allSelected.length) {
    showNotification('请先勾选需要批量合并的工单');
    return;
  }

  const MERGE_ERR_MSG = '请保证所选工单均从属于同一个一类工单，并且均属于以下任一服务模块：数据-账套处理、数据-未审明细表、数据-底稿明细预填、试算-试算搭建、试算-试算填充、报告-报告编制、报告-报告复核、函证-银行纸质函证-制函';

  const nonPending = allSelected.filter(o => o.status !== '待启用');
  if (nonPending.length) {
    showNotification('批量合并仅支持"待启用"状态的工单，请检查所选工单的状态');
    return;
  }

  const parentIds = new Set(allSelected.map(o => o.parentOrderId).filter(Boolean));
  if (parentIds.size !== 1) {
    showNotification(MERGE_ERR_MSG);
    return;
  }

  const modules = new Set(allSelected.map(o => o.serviceModule));
  if (modules.size !== 1) {
    showNotification(MERGE_ERR_MSG);
    return;
  }

  const serviceModule = [...modules][0];
  if (!WO_BATCH_MERGE_MODULES.includes(serviceModule)) {
    showNotification(MERGE_ERR_MSG);
    return;
  }

  const parts = serviceModule.split('-');
  const moduleKey = parts[0];
  const moduleSub = parts.slice(1).join('-');
  const provider = allSelected[0].provider || allSelected[0].serviceProvider || '交付中心';

  woBatchMerge.active = true;
  woBatchMerge.sourceOrders = allSelected;
  woBatchMerge.parentOrderId = [...parentIds][0];
  woBatchMerge.serviceModule = serviceModule;
  woBatchMerge.moduleKey = moduleKey;
  woBatchMerge.moduleSub = moduleSub;
  woBatchMerge.provider = provider;

  openWoWizard('二类工单');
}

/* ─── 批量设置对接人 ─── */

function woCloseBatchDispatch() {
  const modal = document.getElementById('wo-batch-dispatch-modal');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
  woBatchDispatchOrderIds = [];
  woBatchSelectedMemberId = '';
  woBatchMemberKeyword = '';
  woBatchDispatchNote = '';
}

function woRenderBatchDispatchSelector() {
  const modal = document.getElementById('wo-batch-dispatch-modal');
  const body = document.getElementById('wo-batch-dispatch-body');
  const confirmBtn = document.getElementById('wo-batch-dispatch-confirm');
  if (!modal || !body) return;

  const ws = currentDetailWs;
  const orders = woBatchDispatchOrderIds
    .map(id => GD_WORK_ORDERS.find(order => order.id === id))
    .filter(order => order && woCanAssignProjectFollower(order));
  const members = woGetWorkspaceMembers(ws);
  const filteredMembers = woFilterBatchMembers(members);
  const memberCountText = woBatchMemberKeyword.trim()
    ? `匹配 ${filteredMembers.length} 人`
    : `共 ${members.length} 人`;

  body.innerHTML = `
    <div class="wo-batch-dispatch-body">
      <div class="wo-batch-summary">
        <div class="wo-batch-summary-title">本次批量设置对接人</div>
        <div class="wo-batch-summary-grid">
          <div>当前工作区：${ws?.name || '—'}</div>
          <div>已选工单：${orders.length} 个</div>
          <div>设置对象：项目组跟进人</div>
        </div>
      </div>
      <div class="wo-batch-order-list">
        ${orders.slice(0, 5).map(order => `<span class="wo-batch-order-chip">${order.id}</span>`).join('')}
        ${orders.length > 5 ? `<span class="wo-batch-order-more">另有 ${orders.length - 5} 个工单已选中</span>` : ''}
      </div>
      <div class="wo-batch-member-head">
        <div style="font-size:0.84rem;font-weight:600;color:#374151;">选择项目组成员</div>
        <span class="wo-batch-member-meta">${memberCountText}</span>
      </div>
      <label class="wo-batch-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="15" height="15" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input id="wo-batch-member-search" type="text" placeholder="搜索姓名、部门、角色">
      </label>
      <div class="gd-dispatch-list">
        ${filteredMembers.length ? filteredMembers.map(member => {
          const assignedCount = GD_WORK_ORDERS.filter(order =>
            order.workspace === ws?.name
            && woProjectFollowerName(order) === member.name
          ).length;
          return `
            <label class="gd-dispatch-person" onclick="woSelectBatchMember('${member.id}')">
              <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;">
                <input type="radio" name="wo-batch-member" value="${member.id}" ${woBatchSelectedMemberId === member.id ? 'checked' : ''}>
                <div class="gd-user-mini-avatar" style="background:${woAvatarBg(member.name)};">${member.name.slice(0,1)}</div>
                <div style="min-width:0;flex:1;">
                  <div style="font-size:0.84rem;font-weight:600;color:#111827;">${member.name}</div>
                  <div style="font-size:0.76rem;color:#6B7280;line-height:1.5;">${woWorkspaceMemberRoleName(member)} · ${member.dept || '—'}</div>
                </div>
              </div>
              <div class="wo-batch-member-side">
                <div class="wo-batch-member-count">${assignedCount} 单</div>
                <div class="wo-batch-member-hint">已分配</div>
              </div>
            </label>`;
        }).join('') : `<div class="wo-batch-empty">未找到匹配成员，请换个关键词试试</div>`}
      </div>
      <div>
        <label style="display:block;font-size:0.82rem;font-weight:600;color:#374151;margin-bottom:6px;">设置说明</label>
        <textarea id="wo-batch-dispatch-note" rows="3" style="width:100%;box-sizing:border-box;resize:vertical;border:1px solid #E5E7EB;border-radius:10px;padding:10px 12px;font-size:0.84rem;font-family:inherit;outline:none;line-height:1.5;" placeholder="可选填写本次批量设置说明"></textarea>
      </div>
    </div>`;

  const searchEl = document.getElementById('wo-batch-member-search');
  if (searchEl) {
    searchEl.value = woBatchMemberKeyword;
    searchEl.addEventListener('compositionstart', () => {
      woBatchMemberKeywordComposing = true;
    });
    searchEl.addEventListener('compositionend', e => {
      woBatchMemberKeywordComposing = false;
      woBatchMemberKeyword = e.target.value;
      const selStart = e.target.selectionStart ?? woBatchMemberKeyword.length;
      const selEnd = e.target.selectionEnd ?? selStart;
      woRenderBatchDispatchSelector();
      woRestoreInputFocus('wo-batch-member-search', selStart, selEnd);
    });
    searchEl.addEventListener('input', e => {
      woBatchMemberKeyword = e.target.value;
      if (woBatchMemberKeywordComposing || e.isComposing) return;
      const selStart = e.target.selectionStart ?? woBatchMemberKeyword.length;
      const selEnd = e.target.selectionEnd ?? selStart;
      woRenderBatchDispatchSelector();
      woRestoreInputFocus('wo-batch-member-search', selStart, selEnd);
    });
  }

  const noteEl = document.getElementById('wo-batch-dispatch-note');
  if (noteEl) {
    noteEl.value = woBatchDispatchNote;
    noteEl.addEventListener('input', e => {
      woBatchDispatchNote = e.target.value;
    });
  }

  if (confirmBtn) {
    const disabled = !members.length || !orders.length || !woBatchSelectedMemberId;
    confirmBtn.disabled = disabled;
    confirmBtn.style.opacity = disabled ? '0.6' : '';
    confirmBtn.style.cursor = disabled ? 'not-allowed' : '';
  }

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function woOpenBatchDispatch() {
  const orders = woGetSelectedWorkspaceOrders();
  if (!orders.length) {
    showNotification('请先勾选需要批量设置对接人的工单');
    return;
  }
  if (!woGetWorkspaceMembers().length) {
    showNotification('当前工作区暂无可选项目组成员');
    return;
  }
  woBatchDispatchOrderIds = orders.map(order => order.id);
  woBatchSelectedMemberId = '';
  woBatchMemberKeyword = '';
  woBatchDispatchNote = '';
  woRenderBatchDispatchSelector();
}

function woConfirmBatchDispatch() {
  const orders = woBatchDispatchOrderIds
    .map(id => GD_WORK_ORDERS.find(order => order.id === id))
    .filter(order => order && woCanAssignProjectFollower(order));
  if (!orders.length) {
    showNotification('已选工单不可派单，请重新选择');
    woCloseBatchDispatch();
    return;
  }

  const member = woGetWorkspaceMembers().find(item => item.id === woBatchSelectedMemberId);
  if (!member) {
    showNotification('请选择项目组成员');
    return;
  }

  const note = woBatchDispatchNote.trim();
  orders.forEach(order => {
    const prevFollower = woProjectFollowerName(order);
    order.projectFollower = member.name;
    order.projectFollowerId = member.id;
    order.projectFollowerDept = member.dept || '';
    order.projectFollowerRoleId = member.roleId || '';
    if (typeof gdAddLog === 'function') {
      const content = prevFollower && prevFollower !== member.name
        ? `${GD_CURRENT_USER.name} 将项目组跟进人从 ${prevFollower} 调整为 ${member.name}${note ? `：${note}` : ''}`
        : `${GD_CURRENT_USER.name} 指定 ${member.name} 为项目组跟进人${note ? `：${note}` : ''}`;
      gdAddLog(order.id, '批量设置对接人', content);
    }
  });

  const selectedIds = orders.map(order => order.id);
  woClearSelectedOrders();
  woCloseBatchDispatch();
  renderWoMgrPanel();
  if (typeof gdRenderWorkOrders === 'function') gdRenderWorkOrders();

  if (typeof gdOpenDetail === 'function'
    && typeof gdDrawerOrderId !== 'undefined'
    && gdDrawerOrderId
    && selectedIds.includes(gdDrawerOrderId)) {
    const activeTab = document.querySelector('#gd-drawer-itabs .gd-itab.active')?.dataset.itab || 'logs';
    const host = typeof gdDrawerHost !== 'undefined' ? gdDrawerHost : 'workspace';
    gdOpenDetail(gdDrawerOrderId, activeTab, host);
  }

  showNotification(`已将 ${orders.length} 个工单的项目组跟进人调整为 ${member.name}`);
}

function woSetMgrView(view) {
  if (!WO_MGR_VIEW_TABS.some(tab => tab.key === view) || woMgr.view === view) return;
  woMgr.view = view;
  woMgr.page = 1;
  woClearSelectedOrders();
  if (view !== 'schedule') {
    woMgr.scheduleFilterMenu = '';
    woMgr.scheduleCustomPickerOpen = false;
  }
  renderWoMgrPanel();
}

function woToggleScheduleFilterMenu(key) {
  woMgr.scheduleCustomPickerOpen = false;
  woMgr.scheduleFilterMenu = woMgr.scheduleFilterMenu === key ? '' : key;
  renderWoMgrPanel();
}

function woToggleSchedulePoolFilter(value) {
  const nextValues = new Set(woMgr.schedulePoolFilters || []);
  if (nextValues.has(value)) nextValues.delete(value);
  else nextValues.add(value);
  woMgr.schedulePoolFilters = [...nextValues];
  renderWoMgrPanel();
}

function woResetScheduleFilters() {
  woMgr.schedulePoolFilters = [];
  woMgr.scheduleFilterMenu = '';
  renderWoMgrPanel();
}

function woToggleScheduleCustomPicker(force) {
  const nextOpen = typeof force === 'boolean'
    ? force
    : !woMgr.scheduleCustomPickerOpen;
  woMgr.scheduleCustomPickerOpen = nextOpen;
  if (nextOpen) {
    woMgr.scheduleFilterMenu = '';
    woSyncScheduleCustomDraft();
  }
  renderWoMgrPanel();
}

function woSetScheduleTime(mode) {
  woMgr.scheduleTimeMode = mode;
  woMgr.scheduleCustomPickerOpen = mode === 'custom';
  woMgr.scheduleFilterMenu = '';
  if (mode === 'custom') woSyncScheduleCustomDraft();
  renderWoMgrPanel();
}

function woApplyScheduleCustomRange() {
  const start = woMgr.scheduleCustomDraftStart || '';
  const end = woMgr.scheduleCustomDraftEnd || '';
  if (!start || !end) {
    showNotification('请选择完整的自定义时间段');
    return;
  }
  if (end < start) {
    showNotification('结束日期不能早于开始日期');
    return;
  }
  woMgr.scheduleTimeMode = 'custom';
  woMgr.scheduleCustomStart = start;
  woMgr.scheduleCustomEnd = end;
  woMgr.scheduleDate = woScheduleDateFromKey(start);
  woMgr.scheduleCustomPickerOpen = false;
  woMgr.scheduleFilterMenu = '';
  renderWoMgrPanel();
}

function woScheduleNav(dir) {
  const range = woGetScheduleRange();
  const nextDate = new Date(woMgr.scheduleDate || new Date());
  woMgr.scheduleCustomPickerOpen = false;
  woMgr.scheduleFilterMenu = '';
  if (range.mode === 'day') {
    nextDate.setDate(nextDate.getDate() + dir);
    woMgr.scheduleDate = nextDate;
  } else if (range.mode === 'month') {
    nextDate.setMonth(nextDate.getMonth() + dir);
    woMgr.scheduleDate = nextDate;
  } else if (range.mode === 'custom') {
    const span = Math.max(range.dates.length, 1);
    const nextStart = woScheduleDateFromKey(woMgr.scheduleCustomStart);
    const nextEnd = woScheduleDateFromKey(woMgr.scheduleCustomEnd);
    nextStart.setDate(nextStart.getDate() + dir * span);
    nextEnd.setDate(nextEnd.getDate() + dir * span);
    woMgr.scheduleCustomStart = woFmtDate(nextStart);
    woMgr.scheduleCustomEnd = woFmtDate(nextEnd);
    woMgr.scheduleDate = woScheduleDateFromKey(woMgr.scheduleCustomStart);
  } else {
    nextDate.setDate(nextDate.getDate() + dir * 7);
    woMgr.scheduleDate = nextDate;
  }
  renderWoMgrPanel();
}

function woShiftSchedulePickerMonth(offset) {
  woMgr.scheduleCustomPickerMonth = woScheduleAddMonths(woMgr.scheduleCustomPickerMonth || woMgr.scheduleDate || new Date(), offset);
  renderWoMgrPanel();
}

function woSetSchedulePickerYear(year) {
  const month = woScheduleMonthStart(woMgr.scheduleCustomPickerMonth || woMgr.scheduleDate || new Date()).getMonth();
  woMgr.scheduleCustomPickerMonth = new Date(Number(year), month, 1);
  renderWoMgrPanel();
}

function woSetSchedulePickerMonth(month) {
  const year = woScheduleMonthStart(woMgr.scheduleCustomPickerMonth || woMgr.scheduleDate || new Date()).getFullYear();
  woMgr.scheduleCustomPickerMonth = new Date(year, Number(month) - 1, 1);
  renderWoMgrPanel();
}

function woSelectScheduleDraftDate(dateKey) {
  const start = woMgr.scheduleCustomDraftStart || '';
  const end = woMgr.scheduleCustomDraftEnd || '';
  if (!start || (start && end)) {
    woMgr.scheduleCustomDraftStart = dateKey;
    woMgr.scheduleCustomDraftEnd = '';
  } else if (dateKey < start) {
    woMgr.scheduleCustomDraftStart = dateKey;
    woMgr.scheduleCustomDraftEnd = start;
  } else {
    woMgr.scheduleCustomDraftEnd = dateKey;
  }
  renderWoMgrPanel();
}

function woRenderMgrViewTabs() {
  return `
    <div class="wo-mgr-view-switch">
      ${WO_MGR_VIEW_TABS.map(tab => `
        <button class="wo-mgr-view-tab ${woMgr.view === tab.key ? 'active' : ''}" data-womgr-view="${tab.key}">${tab.label}</button>
      `).join('')}
    </div>`;
}

function woRenderMgrListContent({ ws, counts, total, totalPages, rows, allChecked, selectedCount }) {
  const wsName = ws.name;
  return `
    <div class="gd-subtab-bar wo-mgr-tabs">
      ${WO_POOL_TABS.map(tab => `
        <button class="gd-subtab ${woMgr.poolTab === tab.key ? 'active' : ''}" data-pooltab="${tab.key}">
          ${tab.label}
          <span class="gd-subtab-badge">${counts[tab.key] || 0}</span>
        </button>
      `).join('')}
    </div>

    <div class="wo-mgr-toolbar">
      <div class="wo-mgr-search-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="13" height="13">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" class="wo-mgr-search" id="wo-kw" value="${woEscapeAttrText(woMgr.keyword)}" placeholder="搜索工单编号、标题、公司名称、总所编码">
      </div>
      <select class="wo-mgr-sel" id="wo-status-f">
        <option value="">全部状态</option>
        ${['待启用','待接单','已接单','待验收','已驳回','验收通过']
          .map(status => `<option value="${status}" ${woMgr.status === status ? 'selected' : ''}>${status}</option>`)
          .join('')}
      </select>
      <div class="wo-mgr-toolbar-spacer"></div>
      <span class="wo-mgr-cnt">当前工单池 <strong>${total}</strong> 条</span>
    </div>

    ${selectedCount ? `
    <div class="gd-batch-bar wo-mgr-batch-bar">
      <span class="gd-batch-info">已选择 <strong>${selectedCount}</strong> 个工单</span>
      <div class="gd-batch-actions">
        <button class="gd-btn gd-btn-primary gd-btn-sm" onclick="woOpenBatchMerge()">批量合并</button>
        <button class="gd-btn gd-btn-primary gd-btn-sm" onclick="woOpenBatchDispatch()">批量设置对接人</button>
      </div>
    </div>` : ''}

    <div class="wo-mgr-table-card">
      <table class="gd-table gd-wo-table wo-mgr-tbl wo-ws-table">
        <thead>
          <tr>
            <th class="gd-col-check gd-wo-sticky-check wmc-check">${woVisibleSelectableIds.length ? `<input type="checkbox" ${allChecked ? 'checked' : ''} onchange="woCheckAllRows(this.checked)">` : ''}</th>
            <th class="gd-col-jump gd-wo-sticky-jump wmc-jump">快捷跳转</th>
            <th class="gd-col-id">工单编号</th>
            <th class="gd-col-title">工单标题</th>
            <th class="gd-col-parent">所属一类工单</th>
            <th class="gd-col-ws">所属项目工作区</th>
            <th class="gd-col-wsdept">所属部门</th>
            <th class="gd-col-wsgroup">所属集团客户</th>
            <th class="gd-col-wotype">工单类型</th>
            <th class="gd-col-svcmod">服务模块</th>
            <th class="gd-col-company">公司名称</th>
            <th class="gd-col-firmcode">总所编码</th>
            <th class="gd-col-rtype">财报类型</th>
            <th class="gd-col-pm">项目负责人</th>
            <th class="gd-col-submitter">提交人</th>
            <th class="gd-col-follower wmc-follower">项目组跟进人</th>
            <th class="gd-col-time">提交时间</th>
            <th class="gd-col-start">工单开始时间</th>
            <th class="gd-col-expected gd-wo-sticky-expected">期望完成时间</th>
            <th class="gd-col-provider gd-wo-sticky-provider">服务方</th>
            <th class="gd-col-handler gd-wo-sticky-handler">处理人</th>
            <th class="gd-col-status gd-wo-sticky-status">状态</th>
            <th class="gd-col-action gd-wo-sticky-action wmc-action">操作</th>
          </tr>
        </thead>
        <tbody>
          ${rows.length ? rows.map(order => {
            const wsMeta = woWorkspaceMeta(order);
            const workspaceName = order.workspace || wsName || '—';
            const parentHtml = order.parentOrderId
              ? `<span class="gd-wo-id-link" onclick="event.stopPropagation();woViewOrder('${order.parentOrderId}')">${order.parentOrderId}</span>`
              : '<span style="color:#9CA3AF;">—</span>';
            const serviceModuleHtml = order.serviceModule
              ? `<span class="gd-svcmod-tag gd-wo-svcmod" title="${woEscapeAttrText(order.serviceModule)}">${order.serviceModule}</span>`
              : '<span style="color:#9CA3AF;">—</span>';
            const handlerText = woOrderAssigneeText(order);
            const handlerHtml = handlerText
              ? `<div class="gd-wo-handler-text" title="${woEscapeAttrText(handlerText)}">${handlerText}</div>`
              : '<span style="color:#9CA3AF;">—</span>';
            const startTime = woOrderStartTime(order);
            const canAssign = woCanAssignProjectFollower(order);

            return `
            <tr class="wo-row-clickable gd-wo-row-clickable" data-order-id="${order.id}">
              <td class="gd-col-check gd-wo-sticky-check wmc-check">
                ${canAssign ? `<input type="checkbox" value="${order.id}" ${woMgr.selectedIds.has(order.id) ? 'checked' : ''} onchange="woCheckRow('${order.id}', this.checked)">` : ''}
              </td>
              <td class="gd-col-jump gd-wo-sticky-jump wmc-jump">
                <button class="gd-btn gd-btn-primary gd-btn-sm gd-wo-jump-btn" onclick="event.stopPropagation();woOpenWorkspaceFolder('${order.id}')">工单文件夹</button>
              </td>
              <td class="gd-col-id wo-open-cell gd-wo-open-cell" onclick="woViewOrder('${order.id}')">
                <span class="gd-wo-id-link">${order.id}</span>
              </td>
              <td class="gd-col-title gd-wo-title-cell wo-open-cell gd-wo-open-cell" onclick="woViewOrder('${order.id}')">
                <div class="gd-wo-title-text" title="${woEscapeAttrText(order.title || '')}">${order.title || '—'}</div>
              </td>
              <td class="gd-col-parent wo-open-cell gd-wo-open-cell" onclick="woViewOrder('${order.id}')">${parentHtml}</td>
              <td class="gd-col-ws wo-open-cell gd-wo-open-cell" onclick="woViewOrder('${order.id}')">
                <div class="gd-wo-ws-text" title="${woEscapeAttrText(workspaceName)}">${workspaceName}</div>
              </td>
              <td class="gd-col-wsdept wo-open-cell gd-wo-open-cell" onclick="woViewOrder('${order.id}')">${wsMeta.dept || '<span style="color:#9CA3AF;">—</span>'}</td>
              <td class="gd-col-wsgroup wo-open-cell gd-wo-open-cell" onclick="woViewOrder('${order.id}')">
                <div class="gd-wo-group-text" title="${woEscapeAttrText(wsMeta.group || '')}">${wsMeta.group || '—'}</div>
              </td>
              <td class="gd-col-wotype wo-open-cell gd-wo-open-cell" onclick="woViewOrder('${order.id}')">${woTypeHtml(order.woType)}</td>
              <td class="gd-col-svcmod wo-open-cell gd-wo-open-cell" onclick="woViewOrder('${order.id}')">${serviceModuleHtml}</td>
              <td class="gd-col-company wo-open-cell gd-wo-open-cell" onclick="woViewOrder('${order.id}')">
                <div class="gd-wo-company-text" title="${woEscapeAttrText(order.company || '')}">${order.company || '—'}</div>
              </td>
              <td class="gd-col-firmcode wo-open-cell gd-wo-open-cell" onclick="woViewOrder('${order.id}')"><span class="gd-wo-code">${order.firmCode || '—'}</span></td>
              <td class="gd-col-rtype wo-open-cell gd-wo-open-cell" onclick="woViewOrder('${order.id}')">${woReportTypeHtml(order.reportType)}</td>
              <td class="gd-col-pm wo-open-cell gd-wo-open-cell" onclick="woViewOrder('${order.id}')">${order.projectManager || '<span style="color:#9CA3AF;">—</span>'}</td>
              <td class="gd-col-submitter wo-open-cell gd-wo-open-cell" onclick="woViewOrder('${order.id}')">${order.submitter || '—'}</td>
              <td class="gd-col-follower wmc-follower wo-open-cell gd-wo-open-cell" onclick="woViewOrder('${order.id}')">${woProjectFollowerName(order)}</td>
              <td class="gd-col-time wo-open-cell gd-wo-open-cell" onclick="woViewOrder('${order.id}')">${woTableTimeHtml(order.submitTime)}</td>
              <td class="gd-col-start wo-open-cell gd-wo-open-cell" onclick="woViewOrder('${order.id}')">${woTableDateHtml(startTime)}</td>
              <td class="gd-col-expected gd-wo-sticky-expected wo-open-cell gd-wo-open-cell" onclick="woViewOrder('${order.id}')">${woTableDateHtml(order.expectedTime)}</td>
              <td class="gd-col-provider gd-wo-sticky-provider wo-open-cell gd-wo-open-cell" onclick="woViewOrder('${order.id}')"><span class="gd-provider-tag">${woProviderName(order)}</span></td>
              <td class="gd-col-handler gd-wo-sticky-handler wo-open-cell gd-wo-open-cell" onclick="woViewOrder('${order.id}')">${handlerHtml}</td>
              <td class="gd-col-status gd-wo-sticky-status wo-open-cell gd-wo-open-cell" onclick="woViewOrder('${order.id}')">${woStatusHtml(order.status)}</td>
              <td class="gd-col-action gd-wo-sticky-action wmc-action">${renderWoRowActions(order)}</td>
            </tr>`;
          }).join('') : `
            <tr>
              <td colspan="23" class="wo-mgr-empty">当前工单池暂无匹配工单，可切换上方工单池或点击右上角“发起工单”。</td>
            </tr>
          `}
        </tbody>
      </table>
    </div>

    <div class="wo-mgr-pager">
      <span class="wo-pager-info">共 <strong>${total}</strong> 条</span>
      <div class="wo-pager-btns">
        <button class="wo-pager-btn" ${woMgr.page <= 1 ? 'disabled' : ''} onclick="woMgrPage(${woMgr.page - 1})">上一页</button>
        <span class="wo-pager-cur">${woMgr.page} / ${totalPages}</span>
        <button class="wo-pager-btn" ${woMgr.page >= totalPages ? 'disabled' : ''} onclick="woMgrPage(${woMgr.page + 1})">下一页</button>
      </div>
    </div>`;
}

function woRenderMgrScheduleContent(ws, allOrders) {
  woBindScheduleOutsideClose();
  woEnsureScheduleState(ws, allOrders);

  const range = woGetScheduleRange();
  const members = woGetWorkspaceMembers(ws);
  const allItems = woGetWorkspaceScheduleItems(ws, allOrders, members);
  const visibleItems = allItems
    .filter(item => item.startDate <= range.endKey && item.endDate >= range.startKey)
    .filter(item => woScheduleItemMatchesFilters(item));
  const pickerMonth = woScheduleMonthStart(woMgr.scheduleCustomPickerMonth || woMgr.scheduleDate || new Date());
  const pickerYearOptions = woGetSchedulePickerYearOptions();
  const hasActiveFilters = (woMgr.schedulePoolFilters || []).length > 0;
  const todayKey = woFmtDate(new Date());
  const weekdaysZh = ['日', '一', '二', '三', '四', '五', '六'];

  return `
    <div class="wo-mgr-schedule-pane">
      <div class="wo-mgr-schedule-sticky">
        <div class="gd-schedule-topbar">
          <div>
            <div class="gd-schedule-title">工单排期</div>
            <div class="gd-schedule-sub">展示当前工作区项目组成员作为项目组跟进人的工单排期，起止时间取工单开始时间与期望完成时间。</div>
          </div>
        </div>

        <div class="gd-schedule-controls">
          <div class="gd-schedule-left">
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="gd-ctrl-label">时间：</span>
              <div class="gd-ctrl-group">
                <button class="gd-ctrl-btn ${woMgr.scheduleTimeMode === 'day' ? 'active' : ''}" onclick="woSetScheduleTime('day')">日</button>
                <button class="gd-ctrl-btn ${woMgr.scheduleTimeMode === 'week' ? 'active' : ''}" onclick="woSetScheduleTime('week')">周</button>
                <button class="gd-ctrl-btn ${woMgr.scheduleTimeMode === 'month' ? 'active' : ''}" onclick="woSetScheduleTime('month')">月</button>
                <button class="gd-ctrl-btn ${woMgr.scheduleTimeMode === 'custom' ? 'active' : ''}" onclick="woSetScheduleTime('custom')">自定义</button>
              </div>
            </div>
            <div class="gd-schedule-nav">
              <button class="gd-nav-arrow" onclick="woScheduleNav(-1)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <div class="gd-schedule-period">
                <svg viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" width="15" height="15"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span>${range.label}</span>
              </div>
              <button class="gd-nav-arrow" onclick="woScheduleNav(1)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
          <div class="gd-schedule-filterbar">
            <div class="gd-schedule-filter-row">
              ${woRenderScheduleFilterDropdown()}
            </div>
            <button class="gd-btn gd-btn-ghost gd-btn-sm" onclick="woResetScheduleFilters()" ${hasActiveFilters ? '' : 'disabled'}>恢复默认</button>
          </div>
          <div class="gd-schedule-custom-wrap">
            <button class="gd-schedule-range-input ${woMgr.scheduleTimeMode === 'custom' ? 'active' : ''}" onclick="woToggleScheduleCustomPicker()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span>${woGetScheduleCustomRangeText(woMgr.scheduleCustomPickerOpen)}</span>
            </button>
            ${woMgr.scheduleCustomPickerOpen ? `
              <div class="gd-schedule-picker-panel">
                <div class="gd-schedule-picker-head">
                  <button class="gd-nav-arrow" onclick="woShiftSchedulePickerMonth(-1)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <div class="gd-schedule-picker-summary">
                    <div class="gd-schedule-picker-label">选择时间段</div>
                    <div class="gd-schedule-picker-value">${woGetScheduleDraftRangeHint()}</div>
                    <div class="gd-schedule-picker-jump">
                      <select class="gd-filter-input gd-schedule-picker-select" onchange="woSetSchedulePickerYear(this.value)">
                        ${pickerYearOptions.map(year => `<option value="${year}" ${year === pickerMonth.getFullYear() ? 'selected' : ''}>${year} 年</option>`).join('')}
                      </select>
                      <select class="gd-filter-input gd-schedule-picker-select" onchange="woSetSchedulePickerMonth(this.value)">
                        ${Array.from({ length: 12 }, (_, index) => index + 1).map(month => `<option value="${month}" ${month === pickerMonth.getMonth() + 1 ? 'selected' : ''}>${month} 月</option>`).join('')}
                      </select>
                    </div>
                  </div>
                  <button class="gd-nav-arrow" onclick="woShiftSchedulePickerMonth(1)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
                <div class="gd-schedule-picker-calendars">
                  ${woRenderSchedulePickerMonth(pickerMonth)}
                  ${woRenderSchedulePickerMonth(woScheduleAddMonths(pickerMonth, 1))}
                </div>
                <div class="gd-schedule-picker-actions">
                  <button class="gd-btn gd-btn-ghost gd-btn-sm" onclick="woToggleScheduleCustomPicker(false)">取消</button>
                  <button class="gd-btn gd-btn-primary gd-btn-sm" onclick="woApplyScheduleCustomRange()" ${woMgr.scheduleCustomDraftStart && woMgr.scheduleCustomDraftEnd ? '' : 'disabled'}>确定</button>
                </div>
              </div>` : ''}
          </div>
        </div>
      </div>

      <div class="gd-schedule-table-wrap">
        ${members.length ? `
          <table class="gd-schedule-table gd-schedule-table-v2">
            <thead>
              <tr>
                <th style="text-align:left;padding-left:14px;">人员</th>
                ${range.dates.map(date => {
                  const key = woFmtDate(date);
                  const isToday = key === todayKey;
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  return `<th class="${isToday ? 'today-hd' : isWeekend ? 'weekend-hd' : ''}">
                    <div>周${weekdaysZh[date.getDay()]}</div>
                    <div style="font-size:0.7rem;font-weight:400;">${date.getMonth() + 1}/${date.getDate()}</div>
                  </th>`;
                }).join('')}
              </tr>
            </thead>
            <tbody>
              ${members.map(member => {
                const memberItems = woScheduleItemsForMember(visibleItems, member, range);
                const workload = new Set(memberItems.map(item => item.workOrderId)).size;
                return `<tr>
                  <td class="user-col">
                    <div class="gd-schedule-user-name">${member.name}</div>
                    <div class="gd-schedule-user-dept">${woWorkspaceMemberRoleName(member)} · ${member.dept || '—'}</div>
                    <div class="gd-schedule-user-load">当前范围 ${workload} 个工单</div>
                  </td>
                  ${range.dates.map(date => {
                    const key = woFmtDate(date);
                    const dayItems = memberItems.filter(item => item.startDate <= key && item.endDate >= key);
                    return `<td class="day-col${key === todayKey ? ' today-col' : ''}">
                      <div class="gd-schedule-cell">
                        ${dayItems.length ? dayItems.map(item => {
                          const isStart = key === woGetScheduleVisibleStartKey(item, range);
                          const palette = woSchedulePalette(item.categoryKey || item.moduleKey);
                          const title = `${item.title}\n工单池：${item.categoryKey}\n服务模块：${item.serviceModule}\n${item.startDate} 至 ${item.endDate}`;
                          const metaText = `至 ${item.endDate}`;
                          const continuationText = woGetScheduleContinuationLabel(item);
                          return `<div class="gd-sch-item gd-sch-order ${!isStart ? 'continuation' : ''}"
                            style="--sch-bg:${palette.bg};--sch-text:${palette.text};--sch-border:${palette.border};"
                            title="${woEscapeAttrText(title)}"
                            onclick="event.stopPropagation();woViewOrder('${item.workOrderId}')">
                            ${isStart ? `
                              <div class="sch-title">${item.title}</div>
                              <div class="sch-meta">
                                <span>${woGetScheduleMetaLabel(item)}</span>
                                <span>${metaText}</span>
                              </div>` : `<div class="sch-dots">${continuationText}</div>`}
                          </div>`;
                        }).join('') : '<div class="gd-schedule-empty"></div>'}
                      </div>
                    </td>`;
                  }).join('')}
                </tr>`;
              }).join('')}
            </tbody>
          </table>` : `
          <div class="gd-empty-center" style="padding:48px 16px;">
            <div>当前工作区暂无项目组成员</div>
          </div>`}
      </div>

      <div class="gd-legend">
        ${woRenderScheduleLegend()}
      </div>
    </div>`;
}

function renderWoMgrPanel() {
  const container = document.getElementById('wo-mgr-container');
  if (!container) return;
  if (typeof currentDetailWs === 'undefined' || !currentDetailWs) {
    container.innerHTML = `<div style="flex:1;display:flex;align-items:center;justify-content:center;color:var(--text-tertiary);font-size:.845rem;">请先进入项目工作区</div>`;
    return;
  }
  woSeedWorkspaceMockOrders(currentDetailWs);

  const ws = currentDetailWs;
  if (woMgr.wsId !== ws.id) {
    woMgr.wsId = ws.id;
    woMgr.scheduleWsId = '';
    woClearSelectedOrders();
  }

  const allOrders = woGetWorkspaceOrders(ws);
  woSyncSelectedOrders(allOrders);

  const counts = woGetMgrPoolCounts(allOrders);
  const list = woGetMgrFilteredOrders(allOrders);
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / woMgr.pageSize));
  if (woMgr.page > totalPages) woMgr.page = totalPages;
  const start = (woMgr.page - 1) * woMgr.pageSize;
  const rows = list.slice(start, start + woMgr.pageSize);
  woVisibleSelectableIds = rows.filter(woCanAssignProjectFollower).map(order => order.id);
  const allChecked = woVisibleSelectableIds.length > 0
    && woVisibleSelectableIds.every(id => woMgr.selectedIds.has(id));
  const selectedCount = woMgr.selectedIds.size;
  const processingCount = allOrders.filter(order => ['待接单', '已接单'].includes(order.status)).length;
  const acceptanceCount = allOrders.filter(order => order.status === '待验收').length;
  const closedCount = allOrders.filter(order => order.status === '验收通过').length;

  container.innerHTML = `
    <div class="wo-mgr-hero">
      <div class="wo-mgr-stats">
        <div class="wo-mgr-stat-card">
          <div class="wo-mgr-stat-label">全部工单</div>
          <div class="wo-mgr-stat-value">${allOrders.length}</div>
        </div>
        <div class="wo-mgr-stat-card">
          <div class="wo-mgr-stat-label">服务处理中</div>
          <div class="wo-mgr-stat-value">${processingCount}</div>
        </div>
        <div class="wo-mgr-stat-card">
          <div class="wo-mgr-stat-label">待项目验收</div>
          <div class="wo-mgr-stat-value">${acceptanceCount}</div>
        </div>
        <div class="wo-mgr-stat-card">
          <div class="wo-mgr-stat-label">已完成 / 关闭</div>
          <div class="wo-mgr-stat-value">${closedCount}</div>
        </div>
      </div>
    </div>

    <div class="wo-mgr-section">
      ${woRenderMgrViewTabs()}
      ${woMgr.view === 'schedule'
        ? woRenderMgrScheduleContent(ws, allOrders)
        : woRenderMgrListContent({ ws, counts, total, totalPages, rows, allChecked, selectedCount })}
    </div>`;

  container.querySelectorAll('[data-womgr-view]').forEach(btn => {
    btn.addEventListener('click', () => woSetMgrView(btn.dataset.womgrView));
  });

  if (woMgr.view !== 'list') return;

  const keywordEl = container.querySelector('#wo-kw');
  if (keywordEl) {
    keywordEl.addEventListener('compositionstart', () => {
      woMgrKeywordComposing = true;
    });
    keywordEl.addEventListener('compositionend', e => {
      woMgrKeywordComposing = false;
      woMgr.keyword = e.target.value;
      woMgr.page = 1;
      woClearSelectedOrders();
      const selStart = e.target.selectionStart ?? woMgr.keyword.length;
      const selEnd = e.target.selectionEnd ?? selStart;
      renderWoMgrPanel();
      woRestoreInputFocus('wo-kw', selStart, selEnd);
    });
    keywordEl.addEventListener('input', e => {
      woMgr.keyword = e.target.value;
      if (woMgrKeywordComposing || e.isComposing) return;
      woMgr.page = 1;
      woClearSelectedOrders();
      const selStart = e.target.selectionStart ?? woMgr.keyword.length;
      const selEnd = e.target.selectionEnd ?? selStart;
      renderWoMgrPanel();
      woRestoreInputFocus('wo-kw', selStart, selEnd);
    });
  }
  container.querySelector('#wo-status-f')?.addEventListener('change', e => {
    woMgr.status = e.target.value;
    woMgr.page = 1;
    woClearSelectedOrders();
    renderWoMgrPanel();
  });
  container.querySelectorAll('[data-pooltab]').forEach(btn => {
    btn.addEventListener('click', () => {
      woMgr.poolTab = btn.dataset.pooltab;
      woMgr.page = 1;
      woClearSelectedOrders();
      renderWoMgrPanel();
    });
  });
}

function renderWoRowActions(o) {
  const btns = [];
  if (o.status === '待启用') {
    btns.push(`<button class="wo-act accept" onclick="event.stopPropagation(); woSubmitPending('${o.id}')">提交</button>`);
  }
  if (o.status === '待接单') {
    btns.push(`<button class="wo-act recall" onclick="event.stopPropagation(); woRecall('${o.id}')">撤回</button>`);
  }
  if (o.status === '待验收') {
    btns.push(`<button class="wo-act accept" onclick="event.stopPropagation(); woAccept('${o.id}')">验收通过</button>`);
    btns.push(`<button class="wo-act reject" onclick="event.stopPropagation(); woOpenReject('${o.id}')">驳回</button>`);
  }
  return btns.length ? `<div class="wo-act-group">${btns.join('')}</div>` : `<span class="wo-act-empty">—</span>`;
}

function woMgrPage(p) { woMgr.page = p; renderWoMgrPanel(); }

function woViewOrder(id) {
  if (typeof gdOpenDetail === 'function') gdOpenDetail(id, 'req', 'workspace');
}

function woOpenWork(id) {
  if (typeof gdOpenWork === 'function') {
    gdOpenWork(id);
    return;
  }
  woViewOrder(id);
}

/* ════════════════════════════════════════
   8. 工单操作
   ════════════════════════════════════════ */

/* 项目组：撤回工单（待接单 → 待启用） */
function woRecall(id) {
  const order = GD_WORK_ORDERS.find(o => o.id === id);
  if (!order) return;
  if (order.status !== '待接单') { showNotification('该工单已被接单，无法撤回'); return; }
  if (!confirm(`确认撤回工单「${order.title}」？\n撤回后工单将变为"待启用"状态，可重新提交。`)) return;
  order.status = '待启用';
  if (typeof gdAddLog === 'function') gdAddLog(id, '撤回工单', '项目组撤回工单，工单变为待启用');
  showNotification(`工单 ${id} 已撤回，状态变为"待启用"`);
  renderWoMgrPanel();
  if (typeof gdRenderWorkOrders === 'function') gdRenderWorkOrders();
}

/* 项目组：提交待启用工单 — 打开向导确认信息后提交 */
function woSubmitPending(id) {
  const order = GD_WORK_ORDERS.find(o => o.id === id);
  if (!order) return;
  if (order.status !== '待启用') { showNotification('该工单当前状态不可提交'); return; }

  const serviceModule = order.serviceModule || '';
  const parts = serviceModule.split('-');
  const moduleKey = parts[0];
  const moduleSub = parts.slice(1).join('-');
  const provider = order.provider || order.serviceProvider || '交付中心';

  woBatchMerge.active = true;
  woBatchMerge.sourceOrders = [order];
  woBatchMerge.parentOrderId = order.parentOrderId || '';
  woBatchMerge.serviceModule = serviceModule;
  woBatchMerge.moduleKey = moduleKey;
  woBatchMerge.moduleSub = moduleSub;
  woBatchMerge.provider = provider;

  openWoWizard('二类工单');
}

/* 项目组：验收通过 */
function woAccept(id) {
  const order = GD_WORK_ORDERS.find(o => o.id === id);
  if (!order) return;
  if (!confirm(`确认验收通过工单「${order.title}」？\n验收后工单将更新为“验收通过”。`)) return;
  order.status = '验收通过';
  if (typeof gdAddLog === 'function') gdAddLog(id, '验收通过', '项目组确认工单交付结果，验收通过');
  showNotification(`工单 ${id} 已验收通过`);
  renderWoMgrPanel();
  if (typeof gdRenderWorkOrders === 'function') gdRenderWorkOrders();
}

/* 项目组：驳回 - 打开原因弹窗 */
function woOpenReject(id) {
  woRejectTargetId = id;
  const modal = document.getElementById('wo-reject-modal');
  if (!modal) return;
  const el = document.getElementById('wo-reject-reason');
  if (el) el.value = '';
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function woCloseReject() {
  const modal = document.getElementById('wo-reject-modal');
  if (modal) { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); }
  document.body.style.overflow = '';
  woRejectTargetId = null;
}

function woConfirmReject() {
  const reason = document.getElementById('wo-reject-reason')?.value.trim();
  if (!reason) { showNotification('请填写驳回原因'); return; }
  const order = GD_WORK_ORDERS.find(o => o.id === woRejectTargetId);
  if (order) {
    order.revisionCount = (order.revisionCount || 0) + 1;
    order.status = '已驳回';
    order.rejectReason = reason;
    if (typeof gdAddLog === 'function') gdAddLog(order.id, '驳回工单', `项目组驳回工单：${reason}`);
  }
  woCloseReject();
  showNotification('工单已驳回，服务方将收到修改通知');
  renderWoMgrPanel();
  if (typeof gdRenderWorkOrders === 'function') gdRenderWorkOrders();
}

/* 交付中心：接单 */
function woTakeOrder(id) {
  const order = GD_WORK_ORDERS.find(o => o.id === id);
  if (!order || order.status !== '待接单') { showNotification('工单当前状态不可接单'); return; }
  if (!confirm(`确认接单「${order.title}」？\n接单后发起人不可撤回或编辑。`)) return;
  order.status = '已接单';
  order.handler = woCurrentUserName();
  order.assignee = woCurrentUserName();
  if (typeof gdAddLog === 'function') gdAddLog(id, '接单', '服务方已接单并开始处理');
  showNotification(`已成功接单 ${id}`);
  renderWoMgrPanel();
  if (typeof gdRenderWorkOrders === 'function') gdRenderWorkOrders();
  /* 刷新详情抽屉 */
  if (typeof gdOpenDetail === 'function') gdOpenDetail(id);
}

/* ════════════════════════════════════════
   9. 初始化
   ════════════════════════════════════════ */

function initWorkOrderSystem() {
  /* 类型选择器事件 */
  document.getElementById('wo-tp-close')?.addEventListener('click', closeWoTypePicker);
  document.getElementById('wo-type-picker')?.addEventListener('click', e => {
    if (e.target === document.getElementById('wo-type-picker')) closeWoTypePicker();
  });

  /* 向导事件 */
  document.getElementById('wo-wiz-close')?.addEventListener('click', closeWoWizard);
  document.getElementById('wo-wiz-cancel')?.addEventListener('click', closeWoWizard);
  document.getElementById('wo-wiz-next')?.addEventListener('click', woWizNext);
  document.getElementById('wo-wiz-prev')?.addEventListener('click', woWizPrev);
  document.getElementById('wo-wizard-modal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('wo-wizard-modal')) closeWoWizard();
  });

  /* 驳回弹窗事件 */
  document.getElementById('wo-reject-close')?.addEventListener('click', woCloseReject);
  document.getElementById('wo-reject-cancel')?.addEventListener('click', woCloseReject);
  document.getElementById('wo-reject-confirm')?.addEventListener('click', woConfirmReject);
  document.getElementById('wo-reject-modal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('wo-reject-modal')) woCloseReject();
  });

  /* 批量设置对接人弹窗事件 */
  document.getElementById('wo-batch-dispatch-close')?.addEventListener('click', woCloseBatchDispatch);
  document.getElementById('wo-batch-dispatch-cancel')?.addEventListener('click', woCloseBatchDispatch);
  document.getElementById('wo-batch-dispatch-confirm')?.addEventListener('click', woConfirmBatchDispatch);
  document.getElementById('wo-batch-dispatch-modal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('wo-batch-dispatch-modal')) woCloseBatchDispatch();
  });

  /* 发起工单按钮 */
  document.getElementById('btn-submit-order')?.addEventListener('click', openWoTypePicker);

  /* 工单管理 Tab 激活时渲染 */
  document.querySelectorAll('.pd-tab[data-pdtab="orders"]').forEach(tab => {
    tab.addEventListener('click', () => setTimeout(renderWoMgrPanel, 30));
  });
}

document.addEventListener('DOMContentLoaded', initWorkOrderSystem);
