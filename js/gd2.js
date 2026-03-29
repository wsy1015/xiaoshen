/* ══════════════════════════════════════════════════════════
   gd2.js — 工单中心 P0 功能实现扩展
   必须在 gd.js 之后加载。通过同名函数声明覆盖原有实现。
   P0-1/2: 工单详情抽屉（双列 + 四 Tab）
   P0-3:   我的任务 + 任务池（按服务模块分组抢单）
   P0-4:   操作权限矩阵（撤回/派单/接单/提交交付/驳回/通过）
   P0-5:   系统管理 · 人员服务标签配置
   P0-6:   派单面板（人员选择 + 负载提示）
   ══════════════════════════════════════════════════════════ */

/* ════════════════════════════════════════
   当前登录用户 Mock（可通过角色切换器测试）
   ════════════════════════════════════════ */
const GD_CURRENT_USER = {
  id: '1', name: '张伟', dept: '审计一部', role: 'proj_lead',
  serviceTags: [],
};

/* 角色 Mock 预设（用于抽屉内角色切换测试） */
const GD_ROLE_MOCKS = {
  proj_member: { id: '3', name: '王强',  dept: '审计二部', role: 'proj_member', serviceTags: [] },
  proj_lead:   { id: '1', name: '张伟',  dept: '审计一部', role: 'proj_lead',   serviceTags: [] },
  dc_exec:     { id: '5', name: '刘洋',  dept: '交付中心', role: 'dc_exec',     serviceTags: ['数据', '试算'] },
  dc_reviewer: { id: '10',name: '郑云',  dept: '交付中心', role: 'dc_reviewer', serviceTags: ['数据', '底稿'] },
  dc_admin:    { id: '9', name: '吴刚',  dept: '交付中心', role: 'dc_admin',    serviceTags: ['数据', '试算', '报告', '制函', '底稿'] },
};

/* ════════════════════════════════════════
   P0-5 数据：服务标签配置
   ════════════════════════════════════════ */
const GD_SERVICE_TAGS = {
  '1':  { name: '张伟',  tags: ['报告', '底稿'] },
  '2':  { name: '李娜',  tags: ['制函', '报告'] },
  '3':  { name: '王强',  tags: ['数据', '底稿'] },
  '4':  { name: '赵敏',  tags: ['试算', '报告'] },
  '5':  { name: '刘洋',  tags: ['数据', '试算'] },
  '6':  { name: '陈静',  tags: ['制函'] },
  '7':  { name: '杨明',  tags: ['底稿', '报告'] },
  '8':  { name: '周芳',  tags: ['底稿'] },
  '9':  { name: '吴刚',  tags: ['数据', '试算', '报告', '制函', '底稿'] },
  '10': { name: '郑云',  tags: ['数据', '底稿'] },
};

/* ════════════════════════════════════════
   工单状态迁移：旧值 → 新状态机
   ════════════════════════════════════════ */
(function patchWorkOrderStatuses() {
  const STATUS_MAP = {
    '待分派': '待接单',
    '待处理': '待接单',
    '处理中': '业务处理中',
    '已解决': '待验收确认',
    '已驳回': '驳回修改',
  };
  GD_WORK_ORDERS.forEach(o => {
    if (STATUS_MAP[o.status]) o.status = STATUS_MAP[o.status];
    if (!o.assignee) o.assignee = o.handler || '';
    if (!o.provider) o.provider = '交付中心';
  });

  /* 补充典型状态样例工单（用于全流程测试） */
  GD_WORK_ORDERS.push(
    gdNormalizeMockWorkOrderDates({
      id: 'WO202603120020', title: '某集团数据清洗 · 待验收',
      woType: '二类工单', parentOrderId: 'WO202603060001', serviceModule: '数据-账套处理',
      workspace: '中国比亚迪-年报审计-2025年度-审计一部-001',
      company: 'XX集团有限公司', firmCode: 'HQ-2025-XX-88801', reportType: '合并',
      projectManager: '张伟', provider: '交付中心',
      dept: '审计一部', submitter: '李娜', submitTime: '2026-03-08 10:00',
      expectedTime: '2026-03-15', assignee: '刘洋', handler: '刘洋',
      status: '待验收确认', priority: '普通',
      desc: '数据清洗已完成，请项目组验收结果。',
      attachments: ['征信报告_XX集团.pdf'],
    }),
    gdNormalizeMockWorkOrderDates({
      id: 'WO202603120021', title: '某企业底稿编制 · 复核中',
      woType: '二类工单', parentOrderId: '', serviceModule: '底稿',
      workspace: '阿里巴巴集团-IPO审计-2025年度-审计一部-004',
      company: 'AB科技（北京）股份有限公司', firmCode: 'HQ-2025-AB-88804', reportType: '合并',
      projectManager: '刘晓', provider: '交付中心',
      dept: '审计一部', submitter: '李娜', submitTime: '2026-03-10 14:00',
      expectedTime: '2026-03-18', assignee: '郑云', handler: '郑云',
      status: '内部复核中', priority: '紧急',
      desc: '底稿初稿已提交，复核人正在内部审核中。',
      attachments: [],
    })
  );
})();

/* ════════════════════════════════════════
   文件区 Mock 数据（需求方 / 服务方）
   ════════════════════════════════════════ */
const GD_ORDER_FILES = {
  WO202603060001: {
    req: [
      { name: '审计报告_XX集团_2025.pdf', size: '2.1 MB', uploader: '李娜', time: '2026-03-06 09:35' },
      { name: '盖章申请表.docx',          size: '45 KB',  uploader: '李娜', time: '2026-03-06 09:35' },
    ],
    svc: [
      { name: '审计报告_盖章版_v1.pdf', size: '2.3 MB', uploader: '张伟', time: '2026-03-06 16:00', ver: 1 },
    ],
  },
  WO202603120020: {
    req: [
      { name: '征信报告_XX集团.pdf', size: '1.2 MB', uploader: '李娜', time: '2026-03-08 10:05' },
      { name: '开立户清单_2025.xlsx', size: '88 KB', uploader: '李娜', time: '2026-03-08 10:05' },
    ],
    svc: [
      { name: '数据清洗结果_v3.xlsx', size: '512 KB', uploader: '刘洋', time: '2026-03-14 18:00', ver: 3 },
      { name: '数据清洗结果_v2.xlsx', size: '489 KB', uploader: '刘洋', time: '2026-03-13 17:30', ver: 2 },
      { name: '数据清洗结果_v1.xlsx', size: '490 KB', uploader: '刘洋', time: '2026-03-12 16:00', ver: 1 },
    ],
  },
  WO202603060005: {
    req: [
      { name: '项目启动书.pdf', size: '820 KB', uploader: '李娜', time: '2026-03-05 14:10' },
    ],
    svc: [],
  },
};

/* ════════════════════════════════════════
   日常沟通 Mock 数据
   ════════════════════════════════════════ */
const GD_ORDER_COMMENTS = {
  WO202603060001: [
    { author: '李娜',  dept: '审计一部', content: '请重点关注盖章日期，需要与签字日期一致', time: '2026-03-06 09:40' },
    { author: '张伟',  dept: '交付中心', content: '好的，已确认，今天下午完成', time: '2026-03-06 10:05' },
    { author: '李娜',  dept: '审计一部', content: '感谢，请务必在下班前发送给我确认', time: '2026-03-06 10:12' },
  ],
  WO202603120020: [
    { author: '李娜',  dept: '审计一部', content: '请注意第三季度末的应收账款明细，已在需求方上传区追加文件', time: '2026-03-10 09:30' },
    { author: '刘洋',  dept: '交付中心', content: '收到，今天完成数据核查，明天提交 v3', time: '2026-03-10 10:15' },
    { author: '李娜',  dept: '审计一部', content: 'v3 已收到，正在验收，今天给结论', time: '2026-03-15 09:00' },
  ],
};

/* ════════════════════════════════════════
   扩展操作日志 Mock 数据
   ════════════════════════════════════════ */
Object.assign(GD_LOGS, {
  WO202603120020: [
    { action: '提交工单', op: '李娜',  content: '创建工单：某集团数据清洗',           time: '2026-03-08 10:00', active: false },
    { action: '接单',     op: '刘洋',  content: '刘洋接单，工单进入「资源调度中」',    time: '2026-03-08 10:30', active: false },
    { action: '开始处理', op: '刘洋',  content: '工单进入「业务处理中」',              time: '2026-03-09 09:00', active: false },
    { action: '提交交付', op: '刘洋',  content: '交付物 v3 已上传，等待项目组验收',   time: '2026-03-14 18:00', active: true  },
  ],
  WO202603120021: [
    { action: '提交工单', op: '李娜',  content: '创建工单：某企业底稿编制',           time: '2026-03-10 14:00', active: false },
    { action: '派单',     op: '吴刚',  content: '管理员将工单派发给郑云',             time: '2026-03-10 14:10', active: false },
    { action: '转入复核', op: '郑云',  content: '底稿初稿完成，转入内部复核',         time: '2026-03-12 17:00', active: true  },
  ],
});

/* ════════════════════════════════════════
   抽屉运行时状态
   ════════════════════════════════════════ */
let gdDrawerOrderId = null;
let gdDrawerHost = 'center';
let gdDrawerRejectId = null;
let gdDispatchOrderId = null;
let gdMyTasksSubTab = 'mytasks';

/* ════════════════════════════════════════
   P0-4：操作权限判断
   ════════════════════════════════════════ */
function gdCanOperate(order, op) {
  const { role, name, id } = GD_CURRENT_USER;
  const s = order.status;
  const isSubmitter = order.submitter === name;
  const isAssignee  = gdOrderHasAssignee(order, name, id);
  const isProjRole  = role === 'proj_member' || role === 'proj_lead';
  const isExecRole  = role === 'dc_exec' || role === 'dc_admin';

  /* 服务标签匹配 */
  const myTags  = GD_SERVICE_TAGS[id]?.tags || GD_CURRENT_USER.serviceTags || [];
  const modText = order.serviceModule || '';
  const tagMatch = myTags.some(t => modText.includes(t)) || !modText;

  switch (op) {
    case 'recall':
      return isProjRole && s === '待接单' && (isSubmitter || role === 'proj_lead');
    case 'dispatch':
      return role === 'dc_admin' && (s === '待接单' || s === '资源调度中');
    case 'take':
      return role === 'dc_exec' && s === '待接单' && tagMatch;
    case 'deliver':
      return isExecRole && (s === '业务处理中' || s === '驳回修改') && (isAssignee || role === 'dc_admin');
    case 'review_pass':
    case 'review_reject':
      return role === 'dc_reviewer' && s === '内部复核中';
    case 'reject':
      return isProjRole && s === '待验收确认' && (isSubmitter || role === 'proj_lead');
    case 'accept':
      return isProjRole && s === '待验收确认' && (isSubmitter || role === 'proj_lead');
    default:
      return false;
  }
}

/* ════════════════════════════════════════
   P0-1：抽屉左列 HTML 生成
   ════════════════════════════════════════ */
function gdDrawerLeftHtml(order) {
  /* 操作按钮列表 */
  const ops = [];
  if (gdCanOperate(order, 'recall'))        ops.push(`<button class="gd-op-btn gd-op-outline" onclick="gdRecall('${order.id}')">撤回工单</button>`);
  if (gdCanOperate(order, 'dispatch'))      ops.push(`<button class="gd-op-btn gd-op-primary" onclick="gdOpenDispatch('${order.id}')">派单</button>`);
  if (gdCanOperate(order, 'take'))          ops.push(`<button class="gd-op-btn gd-op-primary" onclick="gdTakeOrder2('${order.id}')">接单</button>`);
  if (gdCanOperate(order, 'deliver'))       ops.push(`<button class="gd-op-btn gd-op-success" onclick="gdSubmitDelivery('${order.id}')">提交交付</button>`);
  if (gdCanOperate(order, 'review_pass'))   ops.push(`<button class="gd-op-btn gd-op-success" onclick="gdReviewPass('${order.id}')">复核通过</button>`);
  if (gdCanOperate(order, 'review_reject')) ops.push(`<button class="gd-op-btn gd-op-outline" onclick="gdOpenRejectDrawer('${order.id}','review')">复核驳回</button>`);
  if (gdCanOperate(order, 'accept'))        ops.push(`<button class="gd-op-btn gd-op-success" onclick="gdAccept('${order.id}')">验收通过</button>`);
  if (gdCanOperate(order, 'reject'))        ops.push(`<button class="gd-op-btn gd-op-danger" onclick="gdOpenRejectDrawer('${order.id}','reject')">驳回</button>`);

  const opHint = {
    '待接单':    '工单等待服务方接单或管理员派单',
    '资源调度中': '服务方已接单，正在资源调度中',
    '业务处理中': '执行人处理中，可上传交付物后提交',
    '内部复核中': '交付物内部复核中',
    '待验收确认': '交付物已提交，等待项目组验收',
    '驳回修改':  `交付被驳回，服务方需重新提交${order.rejectReason ? `：「${order.rejectReason}」` : ''}`,
    '已关闭':    '工单已关闭',
  }[order.status] || '';

  return `
    <!-- 抽屉头 -->
    <div class="gd-drawer-head">
      <div class="gd-drawer-head-info">
        <div class="gd-drawer-id">${order.id}</div>
        <div class="gd-drawer-title">${order.title}</div>
      </div>
      <button class="gd-drawer-close" onclick="gdCloseDetail()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="14" height="14">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- 状态标签行 -->
    <div class="gd-drawer-tags">
      ${gdStatusTag(order.status)}
      ${gdWoTypeTag(order.woType || order.type || '')}
      ${order.serviceModule ? `<span class="gd-tag gd-tag-blue">${order.serviceModule}</span>` : ''}
      ${(order.rejectCount||0) >= 2 ? `<span class="gd-tag gd-tag-red" style="font-size:0.7rem;">反复驳回 ${order.rejectCount} 次</span>` : ''}
    </div>

    <!-- 基础信息 -->
    <div class="gd-drawer-section-title">基础信息</div>
    <div class="gd-dinfo-grid">
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">期望完成时间</span>
        <span class="gd-dinfo-val">${gdFormatDateOnly(order.expectedTime) || '—'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">优先级</span>
        <span class="gd-dinfo-val">${gdPriorityTag(order.priority)}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">提交人</span>
        <span class="gd-dinfo-val">${order.submitter} · ${order.dept}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">提交时间</span>
        <span class="gd-dinfo-val">${order.submitTime}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">服务方</span>
        <span class="gd-dinfo-val">${order.provider || '交付中心'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">处理人</span>
        <span class="gd-dinfo-val">${gdOrderAssigneeText(order) || '<span style="color:#9CA3AF;">待分派</span>'}</span>
      </div>
      <div class="gd-dinfo-item gd-dinfo-full">
        <span class="gd-dinfo-label">所属工作区</span>
        <span class="gd-dinfo-val">${order.workspace}</span>
      </div>
      ${order.desc ? `
      <div class="gd-dinfo-item gd-dinfo-full">
        <span class="gd-dinfo-label">备注</span>
        <span class="gd-dinfo-val" style="white-space:pre-wrap;">${order.desc}</span>
      </div>` : ''}
    </div>

    <!-- 关联项目信息 -->
    <div class="gd-drawer-section-title" style="margin-top:14px;">关联项目信息</div>
    <div class="gd-dinfo-grid">
      <div class="gd-dinfo-item gd-dinfo-full">
        <span class="gd-dinfo-label">公司名称</span>
        <span class="gd-dinfo-val">${order.company || '—'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">总所编码</span>
        <span class="gd-dinfo-val gd-wo-code">${order.firmCode || '—'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">财报类型</span>
        <span class="gd-dinfo-val">${order.reportType || '—'}</span>
      </div>
      <div class="gd-dinfo-item gd-dinfo-full">
        <span class="gd-dinfo-label">项目负责人</span>
        <span class="gd-dinfo-val">${order.projectManager || '—'}</span>
      </div>
    </div>

    <!-- 数据载体 -->
    <div class="gd-drawer-section-title" style="margin-top:14px;">数据载体</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;padding-bottom:16px;border-bottom:1px solid #F3F4F6;">
      <button class="gd-op-btn gd-op-ghost" onclick="showNotification('正在唤起鼎信诺本地账套…')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>唤起鼎信诺
      </button>
      <button class="gd-op-btn gd-op-ghost" onclick="showNotification('正在跳转友数聚…')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
        </svg>友数聚网页版
      </button>
    </div>

    <!-- 操作区 -->
    ${ops.length ? `
    <div class="gd-drawer-op-zone">
      ${opHint ? `<div class="gd-op-hint">${opHint}</div>` : ''}
      <div class="gd-op-btns">${ops.join('')}</div>
    </div>` : `
    <div class="gd-drawer-op-zone" style="opacity:0.5;">
      <div class="gd-op-hint">${opHint || '当前状态无可用操作'}</div>
    </div>`}

    `;
}

/* ════════════════════════════════════════
   P0-2：抽屉右列四 Tab 内容渲染
   ════════════════════════════════════════ */
function gdDrawerRenderTab(tab, id) {
  const el = document.getElementById('gd-itab-content');
  if (!el) return;
  const order = GD_WORK_ORDERS.find(o => o.id === id);
  if (!order) return;
  document.querySelectorAll('#gd-drawer-itabs .gd-itab').forEach(b =>
    b.classList.toggle('active', b.dataset.itab === tab)
  );
  switch (tab) {
    case 'logs': el.innerHTML = gdRenderLogsContent(id, order); break;
    case 'req':  el.innerHTML = gdRenderReqContent(id, order);  break;
    case 'svc':  el.innerHTML = gdRenderSvcContent(id, order);  break;
    case 'chat': el.innerHTML = gdRenderChatContent(id);
      setTimeout(() => {
        const list = document.getElementById(`gd-chat-list-${id}`);
        if (list) list.scrollTop = list.scrollHeight;
        const inp = document.getElementById('gd-chat-input');
        if (inp) {
          inp.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); gdSendComment(id); } };
        }
      }, 50);
      break;
  }
}

/* Tab 1：操作日志 */
function gdRenderLogsContent(id, order) {
  const logs = GD_LOGS[id] || [
    { action: '提交工单', op: order.submitter, content: `创建工单：${order.title}`, time: order.submitTime, active: true }
  ];
  return `
    <div class="gd-log-list" style="padding:4px 0;">
      ${logs.slice().reverse().map(l => `
        <div class="gd-log-item">
          <div class="gd-log-dot ${l.active ? 'active' : ''}"></div>
          <div class="gd-log-body">
            <div class="gd-log-action">${l.action}<span class="gd-log-op"> · ${gdResolveUserDisplayName(l.op) || '—'}</span></div>
            <div class="gd-log-content">${l.content}</div>
            <div class="gd-log-time">${l.time}</div>
          </div>
        </div>`).join('')}
    </div>`;
}

/* Tab 2：需求方上传区 */
function gdRenderReqContent(id, order) {
  const files = GD_ORDER_FILES[id]?.req
    || order.attachments?.map(n => ({ name: n, size: '—', uploader: order.submitter, time: order.submitTime }))
    || [];
  const canUpload = GD_CURRENT_USER.role === 'proj_member' || GD_CURRENT_USER.role === 'proj_lead';

  return `
    <div class="gd-tab-section-title">关联账套</div>
    <div class="gd-ledger-list">
      <div class="gd-ledger-item">
        <div class="gd-ledger-icon">账</div>
        <div class="gd-ledger-info">
          <div class="gd-ledger-name">${order.company || '主体公司'} · FY2025</div>
          <div class="gd-ledger-meta">2024-01-01 ~ 2024-12-31</div>
        </div>
        <div style="display:flex;gap:5px;">
          <button class="gd-op-btn gd-op-ghost gd-btn-xs" onclick="showNotification('正在唤起本地账套…')">本地查阅</button>
          <button class="gd-op-btn gd-op-ghost gd-btn-xs" onclick="showNotification('正在跳转网页账套…')">在线打开</button>
        </div>
      </div>
    </div>

    <div class="gd-tab-section-title" style="margin-top:16px;">
      补充资料
      ${canUpload && order.status !== '已关闭' ? `<span style="font-size:0.74rem;color:#9CA3AF;font-weight:400;">（项目组可上传，服务方只读）</span>` : ''}
    </div>
    ${files.length ? `
      <div class="gd-file-list">
        ${files.map(f => `
          <div class="gd-file-item">
            <div class="gd-file-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="1.5" width="16" height="16">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div class="gd-file-info">
              <div class="gd-file-name">${f.name}</div>
              <div class="gd-file-meta">${f.size} · ${f.uploader} · ${f.time}</div>
            </div>
            <button class="gd-op-btn gd-op-ghost gd-btn-xs" onclick="showNotification('正在下载…')">下载</button>
          </div>`).join('')}
      </div>` : `<div class="gd-empty-inline">暂无上传资料</div>`}
    ${canUpload && order.status !== '已关闭' ? `
      <div class="gd-upload-zone" onclick="showNotification('文件上传功能即将上线')">
        <svg viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="2" width="20" height="20">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <span>点击或拖拽上传补充资料</span>
      </div>` : ''}`;
}

/* Tab 3：服务方上传区 */
function gdRenderSvcContent(id, order) {
  const files = GD_ORDER_FILES[id]?.svc || [];
  const canUpload = (GD_CURRENT_USER.role === 'dc_exec' || GD_CURRENT_USER.role === 'dc_admin')
    && (order.status === '业务处理中' || order.status === '驳回修改')
    && (gdOrderHasAssignee(order, GD_CURRENT_USER.name, GD_CURRENT_USER.id) || GD_CURRENT_USER.role === 'dc_admin');

  const maxVer = files.length ? Math.max(...files.map(f => f.ver || 1)) : 0;
  const latest  = files.filter(f => (f.ver || 1) === maxVer);
  const history = files.filter(f => (f.ver || 1) < maxVer);

  return `
    <div class="gd-tab-section-title">
      交付物
      ${!canUpload && (GD_CURRENT_USER.role === 'proj_member' || GD_CURRENT_USER.role === 'proj_lead') ?
        `<span style="font-size:0.74rem;color:#9CA3AF;font-weight:400;">（项目组只读，服务方可上传）</span>` : ''}
    </div>
    ${files.length ? `
      <div class="gd-file-list">
        ${latest.map(f => `
          <div class="gd-file-item">
            <div class="gd-file-icon" style="color:#059669;">
              <svg viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="1.5" width="16" height="16">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div class="gd-file-info">
              <div class="gd-file-name">${f.name} <span class="gd-ver-badge">v${f.ver}</span></div>
              <div class="gd-file-meta">${f.size} · ${f.uploader} · ${f.time}</div>
            </div>
            <button class="gd-op-btn gd-op-ghost gd-btn-xs" onclick="showNotification('正在下载…')">下载</button>
          </div>`).join('')}
      </div>
      ${history.length ? `
        <details style="margin-top:6px;">
          <summary style="font-size:0.78rem;color:#9CA3AF;cursor:pointer;user-select:none;">
            查看历史版本（${history.length} 条）
          </summary>
          <div class="gd-file-list" style="margin-top:8px;opacity:.7;">
            ${history.map(f => `
              <div class="gd-file-item">
                <div class="gd-file-info">
                  <div class="gd-file-name">${f.name} <span class="gd-ver-badge">v${f.ver}</span></div>
                  <div class="gd-file-meta">${f.uploader} · ${f.time}</div>
                </div>
                <button class="gd-op-btn gd-op-ghost gd-btn-xs" onclick="showNotification('正在下载…')">下载</button>
              </div>`).join('')}
          </div>
        </details>` : ''}
    ` : `<div class="gd-empty-inline">暂无交付物</div>`}
    ${canUpload ? `
      <div class="gd-upload-zone" style="margin-top:12px;" onclick="showNotification('文件上传功能即将上线（版本自动递增）')">
        <svg viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="2" width="20" height="20">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <span>上传交付物（自动标注版本号 v${maxVer + 1}）</span>
      </div>` : ''}`;
}

/* Tab 4：日常沟通 */
function gdRenderChatContent(id) {
  const comments = GD_ORDER_COMMENTS[id] || [];
  return `
    <div class="gd-chat-list" id="gd-chat-list-${id}">
      ${comments.length ? comments.map(c => `
        <div class="gd-chat-item">
          <div class="gd-chat-avatar" style="background:${gdAvatarColor(c.author)};">${c.author.slice(0,1)}</div>
          <div class="gd-chat-bubble">
            <div class="gd-chat-meta">
              <span class="gd-chat-author">${c.author}</span>
              <span class="gd-chat-dept"> · ${c.dept}</span>
              <span class="gd-chat-time">${c.time}</span>
            </div>
            <div class="gd-chat-text">${c.content}</div>
          </div>
        </div>`).join('')
      : `<div class="gd-empty-inline" style="margin-top:24px;">暂无沟通记录，发消息开始对话</div>`}
    </div>
    <div class="gd-chat-input-wrap">
      <textarea class="gd-chat-input" id="gd-chat-input" placeholder="输入消息，Enter 发送，Shift+Enter 换行" rows="2"></textarea>
      <button class="gd-op-btn gd-op-primary gd-btn-xs" onclick="gdSendComment('${id}')">发送</button>
    </div>`;
}

/* ════════════════════════════════════════
   P0-1 Override: gdOpenDetail — 双列抽屉
   ════════════════════════════════════════ */
function gdOpenDetail(id) {
  const order = GD_WORK_ORDERS.find(o => o.id === id);
  if (!order) return;
  gdDrawerOrderId = id;

  const left = document.getElementById('gd-drawer-left');
  const itabs = document.getElementById('gd-drawer-itabs');
  if (!left || !itabs) return;

  left.innerHTML = gdDrawerLeftHtml(order);

  /* 重置 Tab 为「操作日志」 */
  gdDrawerRenderTab('logs', id);

  /* 绑定 Tab 点击 */
  itabs.querySelectorAll('.gd-itab').forEach(btn => {
    btn.onclick = () => gdDrawerRenderTab(btn.dataset.itab, id);
  });

  document.getElementById('gd-detail-drawer')?.classList.add('open');
  document.getElementById('gd-drawer-overlay')?.classList.add('open');
}

/* ════════════════════════════════════════
   P0-4 操作函数
   ════════════════════════════════════════ */

/* 向工单追加操作日志 */
function gdAddLog(id, action, content) {
  if (!GD_LOGS[id]) GD_LOGS[id] = [];
  GD_LOGS[id].forEach(l => l.active = false);
  const now = new Date();
  const fmt = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
  GD_LOGS[id].push({ action, op: GD_CURRENT_USER.name, content, time: fmt, active: true });
}

/* 撤回（待接单 → 待启用） */
function gdRecall(id) {
  const order = GD_WORK_ORDERS.find(o => o.id === id);
  if (!order || !gdCanOperate(order, 'recall')) return;
  if (!confirm(`确认撤回工单「${order.title}」？\n撤回后工单将变为"待启用"状态，可重新提交。`)) return;
  order.status = '待启用';
  gdAddLog(id, '撤回工单', `${GD_CURRENT_USER.name} 撤回工单，工单变为待启用`);
  showNotification(`✓ 工单 ${id} 已撤回，状态变为"待启用"`);
  gdOpenDetail(id);
  gdRefreshLists();
}

/* 接单（P0-3 任务池 + 详情抽屉共用） */
function gdTakeOrder2(id) {
  const order = GD_WORK_ORDERS.find(o => o.id === id);
  if (!order || !gdCanOperate(order, 'take')) { showNotification('不满足接单条件（请检查服务标签匹配）'); return; }
  if (!confirm(`确认接单「${order.title}」？\n接单后发起人不可撤回/编辑。`)) return;
  order.status   = '资源调度中';
  order.assignee = GD_CURRENT_USER.name;
  order.handler  = GD_CURRENT_USER.name;
  gdAddLog(id, '接单', `${GD_CURRENT_USER.name} 自主接单，工单进入「资源调度中」`);
  showNotification(`✓ 已接单：${id}`);
  gdOpenDetail(id);
  gdRefreshLists();
}

/* 提交交付（override gd.js 中同名函数） */
function gdSubmitDelivery(id) {
  const order = GD_WORK_ORDERS.find(o => o.id === id);
  if (!order || !gdCanOperate(order, 'deliver')) return;
  if (!confirm(`确认提交交付「${order.title}」？\n提交后项目组将收到验收通知。`)) return;
  /* 检查是否启用复核节点（Mock：底稿/报告/制函启用） */
  const reviewModules = ['底稿', '报告', '制函', '函证', '制函-银行', '制函-往来', '函证-银行电子函证', '函证-往来函证'];
  const needReview = reviewModules.some(m => (order.serviceModule || '').includes(m));
  order.status = needReview ? '内部复核中' : '待验收确认';
  gdAddLog(id, '提交交付', `交付物已提交，进入「${order.status}」`);
  showNotification(`✓ 工单 ${id} 交付已提交，进入${order.status}`);
  gdOpenDetail(id);
  gdRefreshLists();
}

/* 复核通过 */
function gdReviewPass(id) {
  const order = GD_WORK_ORDERS.find(o => o.id === id);
  if (!order) return;
  if (!confirm(`确认复核通过「${order.title}」？`)) return;
  order.status = '待验收确认';
  gdAddLog(id, '复核通过', '内部复核通过，工单提交给项目组验收');
  showNotification(`✓ 复核通过，工单 ${id}`);
  gdOpenDetail(id);
  gdRefreshLists();
}

/* 验收通过 */
function gdAccept(id) {
  const order = GD_WORK_ORDERS.find(o => o.id === id);
  if (!order || !gdCanOperate(order, 'accept')) return;
  if (!confirm(`确认验收通过「${order.title}」？\n验收后工单将完成。`)) return;
  order.status = '验收通过';
  gdAddLog(id, '验收通过', `${GD_CURRENT_USER.name} 验收通过，工单完成`);
  showNotification(`✓ 验收通过，工单 ${id}`);
  gdOpenDetail(id);
  gdRefreshLists();
}

/* 打开驳回弹窗 */
function gdOpenRejectDrawer(id, type = 'reject') {
  gdDrawerRejectId = id;
  const modal = document.getElementById('gd-reject-modal2');
  const title = document.getElementById('gd-reject-title2');
  if (title) title.textContent = type === 'review' ? '复核驳回' : '驳回工单';
  const inp = document.getElementById('gd-reject-reason2');
  if (inp) inp.value = '';
  if (modal) { modal.style.display = 'flex'; modal.setAttribute('aria-hidden', 'false'); }
}
function gdCloseRejectDrawer() {
  const modal = document.getElementById('gd-reject-modal2');
  if (modal) { modal.style.display = 'none'; modal.setAttribute('aria-hidden', 'true'); }
}
function gdConfirmRejectDrawer() {
  const reason = document.getElementById('gd-reject-reason2')?.value.trim();
  if (!reason) { showNotification('请填写驳回原因'); return; }
  const id    = gdDrawerRejectId;
  const order = GD_WORK_ORDERS.find(o => o.id === id);
  if (!order) return;
  order.status = '驳回修改';
  order.rejectCount = (order.rejectCount || 0) + 1;
  order.rejectReason = reason;
  gdAddLog(id, '驳回', `${GD_CURRENT_USER.name} 驳回：${reason}`);
  gdCloseRejectDrawer();
  showNotification(`✓ 工单 ${id} 已驳回，服务方将收到通知`);
  gdOpenDetail(id);
  gdRefreshLists();
}

/* 发送沟通评论 */
function gdSendComment(id) {
  const inp  = document.getElementById('gd-chat-input');
  const text = inp?.value.trim();
  if (!text) return;
  if (!GD_ORDER_COMMENTS[id]) GD_ORDER_COMMENTS[id] = [];
  const now = new Date();
  const fmt = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  GD_ORDER_COMMENTS[id].push({ author: GD_CURRENT_USER.name, dept: GD_CURRENT_USER.dept, content: text, time: fmt });
  inp.value = '';
  gdDrawerRenderTab('chat', id);
}

/* 角色切换 */
function gdSwitchRole(roleKey) {
  const mock = GD_ROLE_MOCKS[roleKey];
  if (!mock) return;
  Object.assign(GD_CURRENT_USER, mock);
  /* 同步顶部提示 */
  const hint = document.getElementById('gd-role-bar-hint');
  if (hint) hint.textContent = `当前：${mock.name}（${roleKey}）`;
  const sel = document.getElementById('gd-role-select');
  if (sel) sel.value = roleKey;
  showNotification(`角色已切换：${mock.name}（${roleKey}）`);
  if (gdDrawerOrderId) gdOpenDetail(gdDrawerOrderId);
  gdRefreshLists();
}

/* 刷新所有相关列表 */
function gdRefreshLists() {
  if (gdState.currentTab === 'workorders') gdRenderWorkOrders();
  if (gdState.currentTab === 'mytasks')    gdRenderMyTasks();
  if (gdState.currentTab === 'dispatch')   gdRenderDispatch();
}

/* ════════════════════════════════════════
   P0-6 派单面板
   ════════════════════════════════════════ */
function gdOpenDispatch(id) {
  gdDispatchOrderId = id;
  const order = GD_WORK_ORDERS.find(o => o.id === id);
  if (!order) return;

  const serviceTag = order.serviceModule || '';
  const candidates = GD_USERS.filter(u => {
    const tags = GD_SERVICE_TAGS[u.id]?.tags || [];
    return !serviceTag || tags.some(t => serviceTag.includes(t));
  });

  const body = document.getElementById('gd-dispatch-body');
  if (body) {
    body.innerHTML = `
      <div class="gd-dispatch-order-info">
        <div style="font-size:0.82rem;color:#6B7280;">派单工单</div>
        <div style="font-size:0.9rem;font-weight:600;color:#111827;margin-top:2px;">${order.title}</div>
        <div style="display:flex;gap:6px;margin-top:6px;">
          ${gdWoTypeTag(order.woType || '')}
          ${serviceTag ? `<span class="gd-tag gd-tag-blue">${serviceTag}</span>` : ''}
        </div>
      </div>
      <div style="font-size:0.84rem;font-weight:600;color:#374151;margin:14px 0 8px;">选择处理人</div>
      <div class="gd-dispatch-list">
        ${candidates.map(u => {
          const tags = GD_SERVICE_TAGS[u.id]?.tags || [];
          const load = GD_WORK_ORDERS.filter(o2 =>
            gdOrderHasAssignee(o2, u.name, u.id) &&
            (o2.status === '业务处理中' || o2.status === '资源调度中')
          ).length;
          const [loadColor, loadHint] =
            load === 0 ? ['#059669', '✓ 推荐'] :
            load <= 2  ? ['#2563EB', '可派'] :
            load <= 4  ? ['#D97706', '较忙'] : ['#DC2626', '负荷重'];
          return `
            <label class="gd-dispatch-person">
              <input type="radio" name="gd-dp-radio" value="${u.name}">
              <div class="gd-dispatch-avatar" style="background:${gdAvatarColor(u.name)};">${u.name.slice(0,1)}</div>
              <div class="gd-dispatch-pinfo">
                <div class="gd-dispatch-pname">${u.name}
                  <span style="color:#9CA3AF;font-size:0.76rem;margin-left:4px;">${u.dept}</span>
                </div>
                <div style="display:flex;gap:3px;flex-wrap:wrap;margin-top:3px;">
                  ${tags.map(t => `<span class="gd-svcmod-tag" style="font-size:0.7rem;padding:1px 5px;">${t}</span>`).join('')}
                </div>
              </div>
              <div class="gd-dispatch-load">
                <div style="font-size:0.86rem;font-weight:700;color:${loadColor};">${load} 单</div>
                <div style="font-size:0.72rem;color:${loadColor};">${loadHint}</div>
              </div>
            </label>`;
        }).join('')}
      </div>
      <div style="margin-top:14px;">
        <label style="font-size:0.82rem;font-weight:500;color:#374151;display:block;margin-bottom:5px;">派单备注（可选）</label>
        <textarea id="gd-dispatch-note" rows="2"
          style="width:100%;box-sizing:border-box;resize:none;border:1px solid #E5E7EB;border-radius:8px;padding:8px 10px;font-size:0.83rem;font-family:inherit;outline:none;"
          placeholder="输入派单说明"></textarea>
      </div>`;
  }

  const modal = document.getElementById('gd-dispatch-modal');
  if (modal) { modal.style.display = 'flex'; modal.setAttribute('aria-hidden', 'false'); }
}

function gdCloseDispatch() {
  const modal = document.getElementById('gd-dispatch-modal');
  if (modal) { modal.style.display = 'none'; modal.setAttribute('aria-hidden', 'true'); }
}

function gdConfirmDispatch() {
  const selected = document.querySelector('input[name="gd-dp-radio"]:checked');
  if (!selected) { showNotification('请选择处理人'); return; }
  const assignee = selected.value;
  const note     = document.getElementById('gd-dispatch-note')?.value.trim() || '';
  const id       = gdDispatchOrderId;
  const order    = GD_WORK_ORDERS.find(o => o.id === id);
  if (!order) return;

  /* 覆盖派单处理：若已有接单人则通知被替换 */
  const prevAssignee = order.assignee;
  order.status   = '业务处理中';
  order.assignee = assignee;
  order.handler  = assignee;
  gdAddLog(id, '派单',
    prevAssignee && prevAssignee !== assignee
      ? `管理员 ${GD_CURRENT_USER.name} 将工单从 ${prevAssignee} 转派给 ${assignee}${note?'：'+note:''}`
      : `管理员 ${GD_CURRENT_USER.name} 派单给 ${assignee}${note?'：'+note:''}`
  );
  gdCloseDispatch();
  showNotification(`✓ 已派单给 ${assignee}`);
  gdOpenDetail(id);
  gdRefreshLists();
}

/* ════════════════════════════════════════
   P0-3：我的任务 + 任务池
   ════════════════════════════════════════ */
function gdRenderMyTasks() {
  const pane = document.getElementById('gd-pane-mytasks');
  if (!pane) return;

  const { name, id, role } = GD_CURRENT_USER;
  const myTags = GD_SERVICE_TAGS[id]?.tags || GD_CURRENT_USER.serviceTags || [];

  /* 我的任务：assignee = 当前用户，未关闭 */
  const myOrders = GD_WORK_ORDERS.filter(o => gdOrderHasAssignee(o, name, id) && o.status !== '验收通过');
  /* 任务池：待接单 + 标签匹配（管理员看全部） */
  const poolOrders = GD_WORK_ORDERS.filter(o => {
    if (o.status !== '待接单') return false;
    if (role === 'dc_admin') return true;
    return myTags.some(t => (o.serviceModule || '').includes(t));
  });

  const isMyTab = gdMyTasksSubTab === 'mytasks';
  const displayOrders = isMyTab ? myOrders : poolOrders;

  pane.innerHTML = `
    <div class="gd-wo-topbar">
      <div>
        <div class="gd-wo-title">我的工作台</div>
        <div class="gd-wo-sub">
          当前角色：<strong>${name}</strong>（${role}）· 服务标签：${myTags.length ? myTags.join('、') : '—'}
        </div>
      </div>
    </div>

    <!-- 子 Tab 切换 -->
    <div class="gd-subtab-bar">
      <button class="gd-subtab ${isMyTab?'active':''}" onclick="gdMyTasksSubTab='mytasks';gdRenderMyTasks()">
        我的任务
        ${myOrders.length ? `<span class="gd-subtab-badge">${myOrders.length}</span>` : ''}
      </button>
      <button class="gd-subtab ${!isMyTab?'active':''}" onclick="gdMyTasksSubTab='pool';gdRenderMyTasks()">
        任务池（抢单）
        ${poolOrders.length ? `<span class="gd-subtab-badge gd-subtab-badge-red">${poolOrders.length}</span>` : ''}
      </button>
    </div>

    ${isMyTab ? `
      <!-- 我的任务列表 -->
      ${myOrders.length ? `
        <div class="gd-task-grid">
          ${myOrders.map(o => gdMyTaskCard(o)).join('')}
        </div>` : `
        <div class="gd-empty-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="#E5E7EB" stroke-width="1.5" width="48" height="48">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
          </svg>
          <div>暂无进行中工单</div>
        </div>`}
    ` : `
      <!-- 任务池：按服务模块分组 -->
      ${poolOrders.length ? (() => {
        const groups = {};
        poolOrders.forEach(o => {
          const k = o.serviceModule || '其他';
          (groups[k] = groups[k] || []).push(o);
        });
        return Object.entries(groups).map(([mod, orders]) => `
          <div class="gd-pool-group">
            <div class="gd-pool-group-hd">
              <span class="gd-svcmod-tag">${mod}</span>
              <span class="gd-pool-count">${orders.length} 个待接单</span>
            </div>
            <div class="gd-task-grid">
              ${orders.map(o => gdPoolTaskCard(o)).join('')}
            </div>
          </div>`).join('');
      })() : `
        <div class="gd-empty-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="#E5E7EB" stroke-width="1.5" width="48" height="48">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>任务池暂无匹配工单</div>
        </div>`}
    `}`;
}

function gdMyTaskCard(o) {
  return `
    <div class="gd-task-card" onclick="gdOpenDetail('${o.id}')">
      <div class="gd-task-card-hd">
        <div class="gd-task-card-id">${o.id}</div>
        ${gdStatusTag(o.status)}
      </div>
      <div class="gd-task-card-title">${o.title}</div>
      <div class="gd-task-card-meta">
        ${o.serviceModule ? `<span class="gd-svcmod-tag">${o.serviceModule}</span>` : ''}
        <span class="gd-task-ws">${o.workspace}</span>
      </div>
      <div class="gd-task-card-foot">
        <span style="font-size:0.77rem;color:#6B7280;">期望完成 ${gdFormatDateOnly(o.expectedTime)||'—'}</span>
        ${(o.rejectCount||0)>0?`<span class="gd-tag gd-tag-red" style="font-size:0.7rem;">驳回 ${o.rejectCount} 次</span>`:''}
        ${gdPriorityTag(o.priority)}
      </div>
    </div>`;
}

function gdPoolTaskCard(o) {
  return `
    <div class="gd-task-card">
      <div class="gd-task-card-hd">
        <div class="gd-task-card-id">${o.id}</div>
        <button class="gd-op-btn gd-op-primary" style="font-size:0.78rem;padding:4px 10px;"
          onclick="event.stopPropagation();gdTakeOrder2('${o.id}')">接单</button>
      </div>
      <div class="gd-task-card-title">${o.title}</div>
      <div class="gd-task-card-meta">
        <span class="gd-task-ws">${o.company} · ${o.workspace}</span>
      </div>
      <div class="gd-task-card-foot">
        <span style="font-size:0.77rem;color:#374151;">期望完成 ${gdFormatDateOnly(o.expectedTime)||'—'}</span>
        ${gdPriorityTag(o.priority)}
        <button class="gd-op-btn gd-op-ghost" style="font-size:0.75rem;padding:3px 8px;"
          onclick="event.stopPropagation();gdOpenDetail('${o.id}')">详情</button>
      </div>
    </div>`;
}

/* ════════════════════════════════════════
   P0-5 Override: gdRenderSettings — 加入服务标签配置
   ════════════════════════════════════════ */
function gdRenderSettings() {
  const pane = document.getElementById('gd-pane-settings');
  if (!pane) return;

  const allMods = ['数据', '试算', '报告', '函证', '底稿'];

  pane.innerHTML = `
    <div class="gd-settings-title">系统管理</div>
    <div class="gd-settings-sub">配置人员服务标签、工单模板与系统参数</div>

    <!-- P0-5：人员服务标签配置 -->
    <div class="gd-card" style="margin-bottom:16px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
        <div>
          <div class="gd-section-title" style="margin:0;">人员服务标签配置</div>
          <div style="font-size:0.78rem;color:#9CA3AF;margin-top:3px;">决定执行人在任务池中可见/接单的服务模块范围</div>
        </div>
        <button class="gd-btn gd-btn-primary gd-btn-sm" onclick="gdSaveServiceTags()">保存配置</button>
      </div>
      <div class="gd-table-wrap">
        <table class="gd-table">
          <thead>
            <tr>
              <th>姓名</th><th>部门</th><th>职级</th>
              ${allMods.map(m => `<th style="text-align:center;width:60px;">${m}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${GD_USERS.map(u => {
              const tags = GD_SERVICE_TAGS[u.id]?.tags || [];
              return `
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:7px;">
                      <div class="gd-dispatch-avatar" style="background:${gdAvatarColor(u.name)};width:24px;height:24px;font-size:0.72rem;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;">${u.name.slice(0,1)}</div>
                      ${u.name}
                    </div>
                  </td>
                  <td style="color:#6B7280;font-size:0.82rem;">${u.dept}</td>
                  <td style="color:#6B7280;font-size:0.82rem;">${u.role}</td>
                  ${allMods.map(m => `
                    <td style="text-align:center;">
                      <input type="checkbox" class="gd-toggle" style="width:16px;height:16px;cursor:pointer;"
                        data-uid="${u.id}" data-tag="${m}"
                        ${tags.includes(m) ? 'checked' : ''}
                        onchange="gdToggleServiceTag('${u.id}','${m}',this.checked)">
                    </td>`).join('')}
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- 工单模板配置（复核节点差异化配置） -->
    <div class="gd-card" style="margin-bottom:16px;">
      <div class="gd-section-title" style="margin-bottom:14px;">
        工单模板配置
        <span style="font-size:0.76rem;color:#9CA3AF;font-weight:400;">· 复核节点按服务模块差异化配置</span>
      </div>
      <div class="gd-table-wrap">
        <table class="gd-table">
          <thead><tr><th>服务模块</th><th style="text-align:center;">启用内部复核</th><th>标准工期</th><th>操作</th></tr></thead>
          <tbody>
            ${[
              ['数据',     true,  '5 工作日'],  ['试算',   false, '3 工作日'],
              ['报告',     true,  '5 工作日'],  ['底稿',   true,  '10 工作日'],
              ['函证-银行', true,  '7 工作日'],  ['函证-往来', true, '7 工作日'],
            ].map(([mod, on, days]) => `
              <tr>
                <td><span class="gd-svcmod-tag">${mod}</span></td>
                <td style="text-align:center;">
                  <input type="checkbox" class="gd-toggle" ${on?'checked':''}
                    onchange="showNotification('已更新 ${mod} 复核配置')">
                </td>
                <td style="color:#6B7280;font-size:0.82rem;">${days}</td>
                <td>
                  <button class="gd-btn gd-btn-ghost gd-btn-sm" onclick="showNotification('${mod} 模板编辑即将上线')">编辑</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- 系统信息 -->
    <div class="gd-card">
      <div class="gd-section-title">系统信息</div>
      <div class="gd-sys-info-grid">
        <div class="gd-sys-info-item"><div class="gd-sys-info-label">系统版本</div><div class="gd-sys-info-val">小审 3.0</div></div>
        <div class="gd-sys-info-item"><div class="gd-sys-info-label">更新时间</div><div class="gd-sys-info-val">2026-03-12</div></div>
        <div class="gd-sys-info-item"><div class="gd-sys-info-label">在线用户</div><div class="gd-sys-info-val">28 人</div></div>
        <div class="gd-sys-info-item"><div class="gd-sys-info-label">系统状态</div><div class="gd-sys-info-val ok">运行正常</div></div>
      </div>
    </div>`;
}

/* 服务标签 checkbox 变更 */
function gdToggleServiceTag(uid, tag, checked) {
  if (!GD_SERVICE_TAGS[uid]) {
    GD_SERVICE_TAGS[uid] = { name: GD_USERS.find(u => u.id === uid)?.name || '', tags: [] };
  }
  const tags = GD_SERVICE_TAGS[uid].tags;
  if (checked && !tags.includes(tag)) tags.push(tag);
  if (!checked) { const i = tags.indexOf(tag); if (i > -1) tags.splice(i, 1); }
}

function gdSaveServiceTags() {
  /* 同步当前登录用户的服务标签 */
  if (GD_SERVICE_TAGS[GD_CURRENT_USER.id]) {
    GD_CURRENT_USER.serviceTags = [...GD_SERVICE_TAGS[GD_CURRENT_USER.id].tags];
  }
  showNotification('✓ 服务标签配置已保存');
}

/* ════════════════════════════════════════
   Override: gdStatusTag — 使用新状态机颜色
   ════════════════════════════════════════ */
function gdStatusTag(status) {
  const MAP = {
    '待接单':    '#DBEAFE,#1D4ED8',
    '资源调度中': '#EDE9FE,#6D28D9',
    '业务处理中': '#FEF3C7,#92400E',
    '内部复核中': '#E0E7FF,#3730A3',
    '待验收确认': '#FEF9C3,#A16207',
    '驳回修改':  '#FEE2E2,#991B1B',
    '已关闭':    '#F3F4F6,#6B7280',
    '待分派':    '#F3F4F6,#6B7280',
    '待处理':    '#DBEAFE,#1D4ED8',
    '处理中':    '#FEF3C7,#92400E',
    '已解决':    '#D1FAE5,#065F46',
    '已驳回':    '#FEE2E2,#991B1B',
  };
  const [bg, color] = (MAP[status] || '#F3F4F6,#6B7280').split(',');
  return `<span style="display:inline-flex;align-items:center;padding:2px 9px;border-radius:20px;font-size:0.75rem;font-weight:600;background:${bg};color:${color};white-space:nowrap;">${status}</span>`;
}

/* ════════════════════════════════════════
   Patch: gdSwitchTab — 注入 mytasks
   ════════════════════════════════════════ */
const _origGdSwitchTab = typeof gdSwitchTab === 'function' ? gdSwitchTab : null;
function gdSwitchTab(tab) {
  /* 基础 Tab 切换逻辑（手动复制核心逻辑，避免依赖顺序问题） */
  gdState.currentTab = tab;
  document.querySelectorAll('.gd-nav-tab').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.gdtab === tab)
  );
  document.querySelectorAll('.gd-pane').forEach(pane =>
    pane.classList.toggle('active', pane.id === `gd-pane-${tab}`)
  );
  /* 渲染逻辑 */
  const renderers = {
    workorders: gdRenderWorkOrders,
    mytasks:    gdRenderMyTasks,
    dispatch:   gdRenderDispatch,
    schedule:   gdRenderSchedule,
    reports:    gdRenderReports,
    messages:   gdRenderMessages,
    settings:   gdRenderSettings,
  };
  renderers[tab] && renderers[tab]();
}

function gdOpenBackdropModal(modal) {
  if (!modal) return;
  modal.style.display = 'flex';
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function gdCloseBackdropModal(modal) {
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  setTimeout(() => {
    modal.style.display = 'none';
    const drawerOpen = document.getElementById('gd-detail-drawer')?.classList.contains('open');
    const openedModal = document.querySelector('.modal-backdrop.open');
    if (!drawerOpen && !openedModal) document.body.style.overflow = '';
  }, 180);
}

function gdCloseDetail() {
  document.getElementById('gd-detail-drawer')?.classList.remove('open');
  document.getElementById('gd-drawer-overlay')?.classList.remove('open');
  const openedModal = document.querySelector('.modal-backdrop.open');
  if (!openedModal) document.body.style.overflow = '';
}

function gdCloseDispatch() {
  gdCloseBackdropModal(document.getElementById('gd-dispatch-modal'));
  gdResetDispatchSelectorState();
}

function gdOpenRejectDrawer(id, type = 'reject') {
  gdDrawerRejectId = id;
  const modal = document.getElementById('gd-reject-modal2');
  const title = document.getElementById('gd-reject-title2');
  if (title) title.textContent = type === 'review' ? '复核驳回' : '驳回工单';
  gdOpenBackdropModal(modal);
}

function gdCloseRejectDrawer() {
  gdCloseBackdropModal(document.getElementById('gd-reject-modal2'));
}

function gdCloseSubmit() {
  gdCloseBackdropModal(document.getElementById('gd-submit-modal'));
}

/* ════════════════════════════════════════
   v2.2：交付组织模型重构
   ════════════════════════════════════════ */

const GD_DEMO_CONTEXT = {
  role: 'proj_lead',
  orgId: 'org-backoffice-1',
};

const GD_DEMO_ROLE_OPTIONS = [
  { key: 'proj_member',    label: '项目组成员',     user: { id: '3', name: '王强', dept: '审计二部', role: 'proj_member', serviceTags: [] } },
  { key: 'proj_lead',      label: '项目负责人',     user: { id: '1', name: '张伟', dept: '审计一部', role: 'proj_lead', serviceTags: [] } },
  { key: 'delivery_owner', label: '交付负责人' },
  { key: 'module_lead',    label: '服务模块负责人' },
  { key: 'delivery_staff', label: '交付正式员工' },
  { key: 'delivery_intern',label: '交付实习生' },
  { key: 'sys_admin',      label: '系统管理员',     user: { id: '5', name: '刘洋', dept: '质量管理部', role: 'sys_admin', serviceTags: ['数据','试算','报告','函证','底稿'] } },
];

const GD_DELIVERY_ORGS = [
  { id: 'org-delivery-1',   name: '交付中心',     ownerId: '9', ownerName: '吴刚', sourceDept: '技术支持部', desc: '标准化交付主承接组织' },
  { id: 'org-backoffice-1', name: '业务一部后台', ownerId: '2', ownerName: '李娜', sourceDept: '审计一部',   desc: '面向审计一部的后台承接组织' },
  { id: 'org-backoffice-2', name: '业务二部后台', ownerId: '7', ownerName: '杨明', sourceDept: '审计二部',   desc: '面向审计二部的后台承接组织' },
];

const GD_DELIVERY_ORG_MEMBERS = {
  'org-delivery-1': [
    { userId: '9',  name: '吴刚', role: 'delivery_owner', moduleLead: '',    serviceTags: ['数据','试算','报告','函证','底稿'], dept: '技术支持部', phone: '131****4567', joinedAt: '2026-03-01', validUntil: '' },
    { userId: '5',  name: '刘洋', role: 'module_lead',    moduleLead: '数据', serviceTags: ['数据','试算'],                   dept: '质量管理部', phone: '135****7890', joinedAt: '2026-03-01', validUntil: '' },
    { userId: '10', name: '郑云', role: 'module_lead',    moduleLead: '底稿', serviceTags: ['底稿','报告'],                   dept: '审计一部',   phone: '130****8901', joinedAt: '2026-03-02', validUntil: '' },
    { userId: '1',  name: '张伟', role: 'delivery_staff', moduleLead: '',    serviceTags: ['报告','底稿'],                   dept: '审计一部',   phone: '138****1234', joinedAt: '2026-03-03', validUntil: '' },
    { userId: '4',  name: '赵敏', role: 'delivery_staff', moduleLead: '',    serviceTags: ['试算','报告'],                   dept: '审计二部',   phone: '136****9988', joinedAt: '2026-03-04', validUntil: '' },
    { userId: '8',  name: '周芳', role: 'delivery_intern',moduleLead: '',    serviceTags: ['底稿'],                         dept: '审计三部',   phone: '132****0123', joinedAt: '2026-03-05', validUntil: '2026-06-30' },
  ],
  'org-backoffice-1': [
    { userId: '2', name: '李娜', role: 'delivery_owner', moduleLead: '',     serviceTags: ['数据','试算','报告'], dept: '审计一部', phone: '139****5678', joinedAt: '2026-03-01', validUntil: '' },
    { userId: '3', name: '王强', role: 'module_lead',    moduleLead: '试算', serviceTags: ['数据','试算'],       dept: '审计二部', phone: '137****9012', joinedAt: '2026-03-02', validUntil: '' },
    { userId: '6', name: '陈静', role: 'delivery_staff', moduleLead: '',     serviceTags: ['数据','报告'],       dept: '技术支持部', phone: '134****2345', joinedAt: '2026-03-03', validUntil: '' },
    { userId: '8', name: '周芳', role: 'delivery_intern',moduleLead: '',     serviceTags: ['试算'],             dept: '审计三部', phone: '132****0123', joinedAt: '2026-03-04', validUntil: '2026-05-31' },
  ],
  'org-backoffice-2': [
    { userId: '7', name: '杨明', role: 'delivery_owner', moduleLead: '',     serviceTags: ['函证','底稿'],       dept: '审计三部', phone: '133****6789', joinedAt: '2026-03-01', validUntil: '' },
    { userId: '1', name: '张伟', role: 'module_lead',    moduleLead: '函证', serviceTags: ['函证','报告'],       dept: '审计一部', phone: '138****1234', joinedAt: '2026-03-02', validUntil: '' },
    { userId: '4', name: '赵敏', role: 'delivery_staff', moduleLead: '',     serviceTags: ['函证','底稿'],       dept: '审计二部', phone: '136****9988', joinedAt: '2026-03-03', validUntil: '' },
    { userId: '6', name: '陈静', role: 'delivery_intern',moduleLead: '',     serviceTags: ['函证'],             dept: '技术支持部', phone: '134****2345', joinedAt: '2026-03-04', validUntil: '2026-07-31' },
  ],
};

const GD_DELIVERY_ROLE_PRESETS = [
  { id: 'delivery_owner', name: '交付负责人', desc: '负责组织成员、角色权限与交付策略配置', color: '#6366F1', builtin: true },
  { id: 'module_lead', name: '服务模块负责人', desc: '负责所属模块的排班、派单与质量把控', color: '#0EA5E9', builtin: true },
  { id: 'delivery_staff', name: '交付正式员工', desc: '负责执行工单并提交交付成果', color: '#10B981', builtin: true },
  { id: 'delivery_intern', name: '交付实习生', desc: '在指导下处理分派工单并上传交付物', color: '#F59E0B', builtin: true },
];

const GD_DELIVERY_PERMISSION_MODULES = [
  {
    id: 'org',
    label: '组织管理',
    groups: [
      {
        id: 'org_view',
        label: '查看权限',
        perms: [
          { id: 'org_view_profile', label: '组织信息查看', desc: '查看交付组织概览与负责人信息' },
          { id: 'org_view_members', label: '成员管理查看', desc: '查看成员列表、加入状态与角色分布' },
          { id: 'org_view_roles', label: '角色权限查看', desc: '查看角色权限与适用范围配置' },
        ],
      },
      {
        id: 'org_admin',
        label: '管理权限',
        perms: [
          { id: 'org_admin_member', label: '成员添加/移出', desc: '管理交付组织成员资格' },
          { id: 'org_admin_role', label: '角色配置修改', desc: '新增角色并调整权限范围' },
          { id: 'org_admin_tag', label: '服务标签配置', desc: '调整成员服务标签与模块负责人' },
        ],
      },
    ],
  },
  {
    id: 'order',
    label: '工单协同',
    groups: [
      {
        id: 'order_view',
        label: '查看权限',
        perms: [
          { id: 'order_view_list', label: '工单池查看', desc: '查看本组织可处理的工单池' },
          { id: 'order_view_detail', label: '工单详情查看', desc: '查看需求、日志与交付记录' },
          { id: 'order_view_schedule', label: '成员排期查看', desc: '查看成员负载与排期分布' },
        ],
      },
      {
        id: 'order_operate',
        label: '操作权限',
        perms: [
          { id: 'order_operate_accept', label: '工单接单', desc: '处理待接单工单' },
          { id: 'order_operate_dispatch', label: '工单派单', desc: '为组织成员分配工单' },
          { id: 'order_operate_reassign', label: '调整处理人', desc: '调整已分派工单的处理人' },
          { id: 'order_operate_acceptance', label: '验收处理', desc: '执行验收通过与驳回操作' },
        ],
      },
    ],
  },
  {
    id: 'delivery',
    label: '交付资料',
    groups: [
      {
        id: 'delivery_view',
        label: '查看权限',
        perms: [
          { id: 'delivery_view_req', label: '需求资料查看', desc: '查看需求方上传的材料' },
          { id: 'delivery_view_hist', label: '历史版本查看', desc: '查看交付物历史版本' },
          { id: 'delivery_view_feedback', label: '驳回意见查看', desc: '查看验收反馈与驳回原因' },
        ],
      },
      {
        id: 'delivery_edit',
        label: '上传权限',
        perms: [
          { id: 'delivery_edit_upload', label: '上传交付物', desc: '上传服务方成果文件' },
          { id: 'delivery_edit_newver', label: '上传新版本', desc: '在驳回后上传修订版本' },
          { id: 'delivery_edit_submit', label: '提交验收', desc: '将工单推进到待验收' },
        ],
      },
    ],
  },
  {
    id: 'dashboard',
    label: '组织看板',
    groups: [
      {
        id: 'dashboard_view',
        label: '查看权限',
        perms: [
          { id: 'dashboard_view_overview', label: '组织概览查看', desc: '查看成员数、模块覆盖等概览' },
          { id: 'dashboard_view_capacity', label: '负载看板查看', desc: '查看模块与成员负载趋势' },
        ],
      },
    ],
  },
];

const GD_DELIVERY_ROLE_CONFIGS = {};
const GD_DELIVERY_ROLE_COLORS = ['#8B5CF6', '#14B8A6', '#F97316', '#EC4899', '#64748B'];

let gdOverviewTab = 'class1';
let gdSelectedDeliveryOrgId = GD_DEMO_CONTEXT.orgId;
let gdDeliveryOrgInnerTab = 'members';
let gdDeliveryMemberStatus = 'joined';
let gdDeliveryMemberSearch = '';
let gdDeliveryMemberSelected = new Set();
let gdDeliveryMemberPage = 1;
let gdDeliverySelectedRoleId = 'delivery_owner';
let gdDeliveryRolePermDirty = false;
let gdDeliveryRoleCollapsedModules = new Set();
let gdDeliveryOrgPaneScrollTop = 0;
let gdDeliveryRoleScrollTop = 0;
let gdDispatchOrderIds = [];
let gdDispatchMode = 'single';
let gdDispatchSelectedUserIds = new Set();
let gdDispatchSearchKeyword = '';
let gdDispatchSearchComposing = false;
let gdDispatchCandidateSearchMap = {};
let gdDispatchNote = '';
let gdVisiblePageOrderIds = [];

function gdGetDeliveryAllPermIds() {
  return GD_DELIVERY_PERMISSION_MODULES.flatMap(mod => mod.groups.flatMap(group => group.perms.map(perm => perm.id)));
}

function gdBuildDeliveryDefaultPerms(roleId) {
  const allIds = gdGetDeliveryAllPermIds();
  const enabled = new Set();
  if (roleId === 'delivery_owner') {
    allIds.forEach(id => enabled.add(id));
  } else if (roleId === 'module_lead') {
    [
      'org_view_profile', 'org_view_members', 'org_view_roles', 'org_admin_tag',
      'order_view_list', 'order_view_detail', 'order_view_schedule',
      'order_operate_accept', 'order_operate_dispatch', 'order_operate_reassign', 'order_operate_acceptance',
      'delivery_view_req', 'delivery_view_hist', 'delivery_view_feedback',
      'delivery_edit_upload', 'delivery_edit_newver', 'delivery_edit_submit',
      'dashboard_view_overview', 'dashboard_view_capacity',
    ].forEach(id => enabled.add(id));
  } else if (roleId === 'delivery_staff') {
    [
      'org_view_profile',
      'order_view_list', 'order_view_detail',
      'order_operate_accept',
      'delivery_view_req', 'delivery_view_hist', 'delivery_view_feedback',
      'delivery_edit_upload', 'delivery_edit_newver', 'delivery_edit_submit',
      'dashboard_view_overview',
    ].forEach(id => enabled.add(id));
  } else if (roleId === 'delivery_intern') {
    [
      'org_view_profile',
      'order_view_list', 'order_view_detail',
      'delivery_view_req', 'delivery_view_feedback',
      'delivery_edit_upload', 'delivery_edit_newver', 'delivery_edit_submit',
    ].forEach(id => enabled.add(id));
  } else {
    return gdBuildDeliveryDefaultPerms('delivery_staff');
  }
  return allIds.reduce((acc, id) => {
    acc[id] = enabled.has(id);
    return acc;
  }, {});
}

function gdCloneDeliveryPermState(source = {}) {
  return gdGetDeliveryAllPermIds().reduce((acc, id) => {
    acc[id] = !!source[id];
    return acc;
  }, {});
}

function gdEnsureDeliveryRoleConfig(orgId) {
  if (!GD_DELIVERY_ROLE_CONFIGS[orgId]) {
    GD_DELIVERY_ROLE_CONFIGS[orgId] = {
      roles: GD_DELIVERY_ROLE_PRESETS.map(item => ({ ...item })),
      permState: {},
    };
  }
  const config = GD_DELIVERY_ROLE_CONFIGS[orgId];
  GD_DELIVERY_ROLE_PRESETS.forEach(preset => {
    if (!config.roles.some(role => role.id === preset.id)) config.roles.push({ ...preset });
  });
  config.roles.forEach(role => {
    const base = gdBuildDeliveryDefaultPerms(role.id);
    config.permState[role.id] = gdCloneDeliveryPermState({ ...base, ...(config.permState[role.id] || {}) });
  });
  return config;
}

function gdGetDeliveryRoleConfig(orgId = gdSelectedDeliveryOrgId) {
  return gdEnsureDeliveryRoleConfig(orgId);
}

function gdGetDeliveryRoles(orgId = gdSelectedDeliveryOrgId) {
  return gdGetDeliveryRoleConfig(orgId).roles;
}

function gdGetDeliveryRoleById(roleId, orgId = gdSelectedDeliveryOrgId) {
  return gdGetDeliveryRoles(orgId).find(role => role.id === roleId)
    || GD_DELIVERY_ROLE_PRESETS.find(role => role.id === roleId)
    || null;
}

function gdGetDeliveryRoleMemberCount(orgId, roleId) {
  return (GD_DELIVERY_ORG_MEMBERS[orgId] || []).filter(member => member.status !== 'left' && member.role === roleId).length;
}

function gdSyncSelectedDeliveryRole(orgId = gdSelectedDeliveryOrgId) {
  const roles = gdGetDeliveryRoles(orgId);
  if (!roles.length) {
    gdDeliverySelectedRoleId = '';
    return null;
  }
  if (!roles.some(role => role.id === gdDeliverySelectedRoleId)) gdDeliverySelectedRoleId = roles[0].id;
  return gdGetDeliveryRoleById(gdDeliverySelectedRoleId, orgId);
}

function gdGetDeliveryPermissionGroup(groupId) {
  return GD_DELIVERY_PERMISSION_MODULES.flatMap(mod => mod.groups).find(group => group.id === groupId) || null;
}

function gdGetNextDeliveryRoleColor(roleCount = 0) {
  return GD_DELIVERY_ROLE_COLORS[roleCount % GD_DELIVERY_ROLE_COLORS.length];
}

function gdNormModule(mod) {
  if (!mod) return '';
  const text = String(mod).trim();
  if (!text) return '';
  if (text.includes('制函') || text.includes('函证')) return '函证';
  const primary = text.split('、')[0].split('/')[0].trim();
  return primary.split('-')[0].trim();
}

function gdGetCurrentDeliveryOrg() {
  return GD_DELIVERY_ORGS.find(o => o.id === GD_DEMO_CONTEXT.orgId) || GD_DELIVERY_ORGS[0];
}

function gdGetCurrentOrgMembers() {
  return (GD_DELIVERY_ORG_MEMBERS[GD_DEMO_CONTEXT.orgId] || []).filter(m => m.status !== 'left');
}

function gdGetDemoRoleLabel() {
  return GD_DEMO_ROLE_OPTIONS.find(r => r.key === GD_DEMO_CONTEXT.role)?.label || '—';
}

function gdApplyDemoContext() {
  const role = GD_DEMO_CONTEXT.role;
  const org = gdGetCurrentDeliveryOrg();
  const members = gdGetCurrentOrgMembers();
  let payload = null;

  if (role === 'proj_member' || role === 'proj_lead' || role === 'sys_admin') {
    payload = GD_DEMO_ROLE_OPTIONS.find(r => r.key === role)?.user || null;
  } else if (role === 'delivery_owner') {
    const owner = members.find(m => m.role === 'delivery_owner') || members[0];
    if (owner) payload = { id: owner.userId, name: owner.name, dept: owner.dept, role, serviceTags: owner.serviceTags || [], moduleLead: owner.moduleLead || '' };
  } else if (role === 'module_lead') {
    const lead = members.find(m => m.role === 'module_lead') || members.find(m => m.role === 'delivery_owner');
    if (lead) payload = { id: lead.userId, name: lead.name, dept: lead.dept, role, serviceTags: lead.serviceTags || [], moduleLead: lead.moduleLead || gdNormModule(lead.serviceTags?.[0] || '') };
  } else if (role === 'delivery_staff') {
    const staff = members.find(m => m.role === 'delivery_staff') || members.find(m => m.role === 'module_lead');
    if (staff) payload = { id: staff.userId, name: staff.name, dept: staff.dept, role, serviceTags: staff.serviceTags || [], moduleLead: '' };
  } else if (role === 'delivery_intern') {
    const intern = members.find(m => m.role === 'delivery_intern') || members.find(m => m.role === 'delivery_staff');
    if (intern) payload = { id: intern.userId, name: intern.name, dept: intern.dept, role, serviceTags: intern.serviceTags || [], moduleLead: '' };
  }

  if (!payload) {
    payload = { id: '0', name: '演示用户', dept: org.sourceDept, role, serviceTags: [], moduleLead: '' };
  }

  Object.assign(GD_CURRENT_USER, payload, {
    orgId: org.id,
    orgName: org.name,
  });
}

(function gdUpgradeV22Data() {
  const userPhoneMap = {
    '1': '138****1234',
    '2': '139****5678',
    '3': '136****0033',
    '4': '136****9988',
    '5': '135****7890',
    '6': '134****2345',
    '7': '133****6789',
    '8': '132****0123',
    '9': '131****4567',
    '10': '130****8901',
  };
  const providerMap = {
    '报告': 'org-delivery-1',
    '底稿': 'org-delivery-1',
    '数据': 'org-backoffice-1',
    '试算': 'org-backoffice-1',
    '函证': 'org-backoffice-2',
    '制函': 'org-backoffice-2',
    '其他': 'org-delivery-1',
    '归档': 'org-delivery-1',
  };

  GD_USERS.forEach(user => {
    if (!user.phone) user.phone = userPhoneMap[user.id] || '—';
  });

  GD_WORK_ORDERS.forEach((o, index) => {
    if (['待分派'].includes(o.status)) o.status = '待接单';
    if (['待处理', '处理中', '业务处理中', '资源调度中', '内部复核中'].includes(o.status)) o.status = '已接单';
    if (['待验收确认', '已解决'].includes(o.status)) o.status = '待验收';
    if (['驳回修改', '已驳回'].includes(o.status)) o.status = '已驳回';
    if (o.status === '已关闭') o.status = '验收通过';

    o.serviceModuleKey = gdNormModule(o.serviceModule);
    if (!o.assignee && o.handler) o.assignee = o.handler;
    gdSetOrderAssignees(o, gdOrderAssigneeNames(o).map((name, idx) => ({
      userId: gdOrderAssigneeIds(o)[idx] || '',
      name,
      role: Array.isArray(o.assigneeRoleList) ? o.assigneeRoleList[idx] : (idx === 0 ? o.assigneeRole : ''),
    })));

    const pid = o.providerOrgId || providerMap[o.serviceModuleKey] || GD_DELIVERY_ORGS[index % GD_DELIVERY_ORGS.length].id;
    const org = GD_DELIVERY_ORGS.find(x => x.id === pid) || GD_DELIVERY_ORGS[0];
    o.providerOrgId = org.id;
    o.providerOrgName = org.name;
    o.providerSourceDept = org.sourceDept;
    o.provider = org.name;
  });

  Object.entries(GD_DELIVERY_ORG_MEMBERS).forEach(([orgId, members]) => {
    const org = GD_DELIVERY_ORGS.find(item => item.id === orgId);
    members.forEach((m, idx) => {
      m.id = m.id || `${orgId}-member-${idx + 1}`;
      m.status = m.status || 'joined';
      m.addedBy = m.addedBy || org?.ownerName || '系统管理员';
      m.leftAt = m.leftAt || '';
      m.validUntil = m.validUntil || '';
    });
  });

  if (!GD_DELIVERY_ORG_MEMBERS['org-delivery-1'].some(m => m.status === 'left')) {
    GD_DELIVERY_ORG_MEMBERS['org-delivery-1'].push({
      id: 'org-delivery-1-member-left-1',
      userId: '11',
      name: '黄磊',
      role: 'delivery_intern',
      moduleLead: '',
      serviceTags: ['数据'],
      dept: '审计二部',
      phone: '153****0099',
      joinedAt: '2025-11-15',
      validUntil: '2026-03-31',
      addedBy: '李娜',
      status: 'left',
      leftAt: '2026-03-31',
    });
  }

  gdApplyDemoContext();
})();

function gdSwitchDemoRole(role) {
  GD_DEMO_CONTEXT.role = role;
  gdApplyDemoContext();
  gdState.woPage = 1;
  gdState.selectedOrders.clear();
  if (gdDrawerOrderId) gdOpenDetail(gdDrawerOrderId);
  gdRefreshLists();
}

function gdSwitchDemoOrg(orgId) {
  GD_DEMO_CONTEXT.orgId = orgId;
  gdSelectedDeliveryOrgId = orgId;
  gdApplyDemoContext();
  gdState.woPage = 1;
  gdState.selectedOrders.clear();
  if (gdDrawerOrderId) gdOpenDetail(gdDrawerOrderId);
  gdRefreshLists();
}

const GD_BUSINESS_DEMO_DATA = (() => {
  const workspace = '华北能源集团-年报审计-2025年度-审计一部-001';
  const workspaceGroup = workspace.split('-')[0];
  const projectManager = '李娜';
  const submitter = '李娜';
  const dept = '审计一部';
  const providerName = orgId => GD_DELIVERY_ORGS.find(item => item.id === orgId)?.name || '交付中心';
  const order = ({
    id,
    title,
    woType,
    serviceModule,
    company,
    firmCode,
    reportType = '合并',
    providerOrgId,
    status,
    submitTime,
    expectedTime,
    assignee = '',
    parentOrderId = '',
    desc = '',
    ...extra
  }) => ({
    id,
    title,
    woType,
    parentOrderId,
    serviceModule,
    workspace,
    company,
    firmCode,
    reportType,
    projectManager,
    dept,
    submitter,
    projectFollower: submitter,
    submitTime,
    expectedTime,
    assignee,
    handler: assignee,
    status,
    priority: '普通',
    desc,
    attachments: [],
    providerOrgId,
    providerOrgName: providerName(providerOrgId),
    provider: providerName(providerOrgId),
    workspaceDept: dept,
    workspaceGroup,
    ...extra,
  });
  const log = (action, op, content, time, active = false) => ({ action, op, content, time, active });

  const orders = [
    order({
      id: 'WO202603240101',
      title: '华北能源集团 FY2025 全模块统筹预排',
      woType: '一类工单',
      serviceModule: '数据、试算、报告、函证、底稿',
      company: '华北能源集团有限公司',
      firmCode: 'HQ-2025-HB-0001',
      providerOrgId: 'org-delivery-1',
      status: '已接单',
      submitTime: '2026-03-20 09:00',
      expectedTime: '2026-04-30',
      assignee: '张伟',
      assigneeIdList: ['1'],
      assigneeRoleList: ['delivery_staff'],
      desc: '涵盖数据、试算、报告、函证、底稿五大模块的全量统筹预排，可执行自动拆单按主体公司粒度生成二类/三类工单。',
      priorAuditDate: '2026-02-28',
      planReportDate: '2026-04-30',
      deliveryDeadline: '2026-04-30',
      moduleDetails: {
        数据: {
          ledgerCount: '3',
          ledgerExpectTime: '2026-03-25',
          dataExpectTime: '2026-03-25',
          expectedTime: '2026-04-05',
          note: '按主体公司逐一处理账套数据清洗、科目映射与底稿预填。',
          files: ['账套清单.xlsx', '科目映射表.xlsx'],
        },
        试算: {
          entityCount: '3',
          dataExpectTime: '2026-04-01',
          expectedTime: '2026-04-10',
          note: '基于清洗后的账套数据，搭建各主体试算平衡表并输出勾稽差异清单。',
          files: ['试算模板.xlsx'],
        },
        报告: {
          entityCount: '3',
          trialBalanceTime: '2026-04-08',
          expectedTime: '2026-04-18',
          note: '基于终版试算表编制审计报告，包含附注骨架与关键披露页。',
          files: ['报告模板.xlsx'],
        },
        函证: {
          entityCount: '3',
          materialExpectTime: '2026-03-28',
          expectedTime: '2026-04-12',
          note: '银行纸质函证与往来函证同步推进，覆盖全部主体公司的对外函证需求。',
          files: ['函证范围清单.xlsx'],
        },
        底稿: {
          entityCount: '3',
          dataExpectTime: '2026-04-01',
          materialAllExpectTime: '2026-04-05',
          expectedTime: '2026-04-25',
          note: '按主体公司拆分底稿协同任务，涵盖银行、往来、收入、存货等循环。',
          files: ['底稿协同边界表.xlsx'],
        },
      },
    }),
    order({
      id: 'WO202603240102',
      title: '华北能源集团 FY2025 报告函证底稿统筹预排',
      woType: '一类工单',
      serviceModule: '报告、函证、底稿',
      company: '华北能源集团有限公司',
      firmCode: 'HQ-2025-HB-0001',
      providerOrgId: 'org-delivery-1',
      status: '待验收',
      submitTime: '2026-03-22 10:40',
      expectedTime: '2026-04-28',
      assignee: '张伟、赵敏',
      assigneeIdList: ['1', '4'],
      assigneeRoleList: ['delivery_staff', 'delivery_staff'],
      desc: '已完成报告、函证和底稿三条线的资源统筹与阶段性交付，当前等待项目组统一验收。',
      priorAuditDate: '2026-02-27',
      planReportDate: '2026-04-02',
      deliveryDeadline: '2026-04-28',
      moduleDetails: {
        报告: {
          entityCount: '3',
          trialBalanceTime: '2026-03-24',
          expectedTime: '2026-04-26',
          note: '先出附注骨架与关键披露页，供项目组确认口径与版式。',
          files: ['附注模板差异表.xlsx'],
        },
        函证: {
          entityCount: '2',
          materialExpectTime: '2026-03-24',
          expectedTime: '2026-04-25',
          note: '银行纸函与往来函证同步推进，需优先校验地址与联系人准确性。',
          files: ['函证范围清单.xlsx', '地址校验说明.xlsx'],
        },
        底稿: {
          entityCount: '3',
          dataExpectTime: '2026-03-24',
          materialAllExpectTime: '2026-03-25',
          expectedTime: '2026-04-28',
          note: '先处理收入和往来两个重点循环，并同步补充底稿协同边界说明。',
          files: ['底稿协同边界表.xlsx'],
        },
      },
    }),
    order({
      id: 'WO202603240201',
      title: '华北能源母公司账套处理',
      woType: '二类工单',
      serviceModule: '数据-账套处理',
      company: '华北能源集团有限公司',
      firmCode: 'HQ-2025-HB-0101',
      providerOrgId: 'org-backoffice-1',
      status: '待接单',
      submitTime: '2026-03-24 11:00',
      expectedTime: '2026-03-25 18:00',
      parentOrderId: 'WO202603240101',
      desc: '项目组提交二类数据工单，需同步当前工作区已关联账套并完成账套处理，补齐科目映射口径。',
      ledgerExpectTime: '2026-03-24',
      useLedger: true,
    }),
    order({
      id: 'WO202603240202',
      title: '华北能源销售公司未审明细表生成',
      woType: '二类工单',
      serviceModule: '数据-未审明细表',
      company: '华北能源销售有限公司',
      firmCode: 'HQ-2025-HB-0102',
      providerOrgId: 'org-backoffice-1',
      status: '已接单',
      submitTime: '2026-03-23 15:10',
      expectedTime: '2026-03-26 18:00',
      assignee: '陈静',
      parentOrderId: 'WO202603240101',
      desc: '交付正式员工已接单，正在基于已关联账套生成未审明细表，并按项目组口径拆分重点科目。',
      ledgerExpectTime: '2026-03-23',
      useLedger: true,
    }),
    order({
      id: 'WO202603240203',
      title: '华北能源设备公司底稿明细预填',
      woType: '二类工单',
      serviceModule: '数据-底稿明细预填',
      company: '华北能源设备有限公司',
      firmCode: 'HQ-2025-HB-0103',
      providerOrgId: 'org-backoffice-1',
      status: '待验收',
      submitTime: '2026-03-22 09:40',
      expectedTime: '2026-03-24 18:00',
      assignee: '陈静',
      parentOrderId: 'WO202603240101',
      desc: '底稿明细预填结果及差异说明已上传，等待项目组验收。',
      ledgerExpectTime: '2026-03-22',
      useLedger: true,
    }),
    order({
      id: 'WO202603240204',
      title: '华北能源物流公司账套处理',
      woType: '二类工单',
      serviceModule: '数据-账套处理',
      company: '华北能源物流有限公司',
      firmCode: 'HQ-2025-HB-0104',
      providerOrgId: 'org-backoffice-1',
      status: '验收通过',
      submitTime: '2026-03-20 13:25',
      expectedTime: '2026-03-23 18:00',
      assignee: '陈静',
      parentOrderId: 'WO202603240101',
      desc: '该账套处理工单已完成验收，可用于展示标准件交付闭环完成态。',
      ledgerExpectTime: '2026-03-20',
      useLedger: true,
    }),
    order({
      id: 'WO202603240301',
      title: '华北能源母公司合并附注排版',
      woType: '二类工单',
      serviceModule: '报告-报告编制',
      company: '华北能源集团有限公司',
      firmCode: 'HQ-2025-HB-0201',
      providerOrgId: 'org-delivery-1',
      status: '已驳回',
      submitTime: '2026-03-22 16:30',
      expectedTime: '2026-03-24 18:00',
      assignee: '张伟',
      parentOrderId: 'WO202603240101',
      desc: '项目组对附注格式和关键页脚提出驳回意见，服务方需按意见修订后再次提交验收。',
      trialBalanceTime: '2026-03-23',
    }),
    order({
      id: 'WO202603240302',
      title: '华北能源销售公司合并附注排版',
      woType: '二类工单',
      serviceModule: '报告-报告编制',
      company: '华北能源销售有限公司',
      firmCode: 'HQ-2025-HB-0202',
      providerOrgId: 'org-delivery-1',
      status: '待验收',
      submitTime: '2026-03-21 09:50',
      expectedTime: '2026-03-25 18:00',
      assignee: '张伟',
      parentOrderId: 'WO202603240101',
      desc: '服务方已根据驳回意见修订附注排版，等待项目组复验。',
      trialBalanceTime: '2026-03-24',
    }),
    order({
      id: 'WO202603240401',
      title: '华北能源集团底稿协同编制',
      woType: '三类工单',
      serviceModule: '底稿',
      company: '华北能源集团有限公司',
      firmCode: 'HQ-2025-HB-0301',
      providerOrgId: 'org-delivery-1',
      status: '待接单',
      submitTime: '2026-03-24 13:20',
      expectedTime: '2026-04-27',
      parentOrderId: 'WO202603240101',
      useLedger: true,
      attachments: ['主体-科目-定级表_华北能源集团有限公司.xls'],
      desc: '三类工单：底稿，主体 华北能源集团有限公司，服务方按主体-科目-定级表结果进入工作区协同编制。',
      dataExpectTime: '2026-03-25',
      materialAllExpectTime: '2026-03-26',
    }),
    order({
      id: 'WO202603240402',
      title: '华北能源燃气公司底稿协同编制',
      woType: '三类工单',
      serviceModule: '底稿',
      company: '华北能源燃气有限公司',
      firmCode: 'HQ-2025-HB-0302',
      providerOrgId: 'org-delivery-1',
      status: '已接单',
      submitTime: '2026-03-23 09:10',
      expectedTime: '2026-04-28',
      assignee: '周芳',
      parentOrderId: 'WO202603240101',
      useLedger: true,
      attachments: ['主体-科目-定级表_华北能源燃气有限公司.xls'],
      desc: '三类工单：底稿，主体 华北能源燃气有限公司，服务方按主体-科目-定级表结果进入工作区协同编制。',
      dataExpectTime: '2026-03-24',
      materialAllExpectTime: '2026-03-25',
    }),
    order({
      id: 'WO202603240403',
      title: '华北能源装备制造公司底稿协同编制',
      woType: '三类工单',
      serviceModule: '底稿',
      company: '华北能源装备制造有限公司',
      firmCode: 'HQ-2025-HB-0303',
      providerOrgId: 'org-delivery-1',
      status: '待验收',
      submitTime: '2026-03-21 17:20',
      expectedTime: '2026-04-24',
      assignee: '周芳',
      parentOrderId: 'WO202603240101',
      useLedger: true,
      attachments: ['主体-科目-定级表_华北能源装备制造有限公司.xls'],
      desc: '三类工单：底稿，主体 华北能源装备制造有限公司，服务方按主体-科目-定级表结果进入工作区协同编制。',
      dataExpectTime: '2026-03-22',
      materialAllExpectTime: '2026-03-23',
    }),
    order({
      id: 'WO202603240501',
      title: '华北能源合并试算搭建',
      woType: '二类工单',
      serviceModule: '试算-试算搭建',
      company: '华北能源集团有限公司',
      firmCode: 'HQ-2025-HB-0401',
      providerOrgId: 'org-backoffice-1',
      status: '已接单',
      submitTime: '2026-03-23 11:40',
      expectedTime: '2026-03-26 12:00',
      assignee: '王强',
      parentOrderId: 'WO202603240101',
      desc: '试算池样例工单，用于演示服务模块负责人在模块池内查看与分派任务。',
      dataExpectTime: '2026-03-24',
    }),
    order({
      id: 'WO202603240601',
      title: '华北能源集团银行纸质函证-制函',
      woType: '二类工单',
      serviceModule: '函证-银行纸质函证-制函',
      company: '华北能源集团有限公司',
      firmCode: 'HQ-2025-HB-0501',
      providerOrgId: 'org-backoffice-2',
      status: '待接单',
      submitTime: '2026-03-24 15:15',
      expectedTime: '2026-03-26 18:00',
      parentOrderId: 'WO202603240101',
      desc: '函证池样例工单，需基于项目组上传的授权书、开户清单集中开展银行纸质函证制函。',
      materialExpectTime: '2026-03-24',
    }),
  ].map(gdNormalizeMockWorkOrderDates);

  const files = {
    WO202603240101: {
      req: [],
      reqModules: {
        数据: [
          { name: '账套清单.xlsx', size: '126 KB', uploader: '李娜', time: '2026-03-20 09:10', ver: 1 },
          { name: '科目映射表.xlsx', size: '38 KB', uploader: '李娜', time: '2026-03-20 09:12', ver: 1 },
        ],
        试算: [
          { name: '试算模板.xlsx', size: '42 KB', uploader: '李娜', time: '2026-03-20 09:15', ver: 1 },
        ],
        报告: [
          { name: '报告模板.xlsx', size: '64 KB', uploader: '李娜', time: '2026-03-20 09:18', ver: 1 },
        ],
        函证: [
          { name: '函证范围清单.xlsx', size: '72 KB', uploader: '李娜', time: '2026-03-20 09:20', ver: 1 },
        ],
        底稿: [
          { name: '底稿协同边界表.xlsx', size: '58 KB', uploader: '李娜', time: '2026-03-20 09:22', ver: 1 },
        ],
      },
      svc: [],
    },
    WO202603240102: {
      req: [],
      reqModules: {
        报告: [
          { name: '附注模板差异表.xlsx', size: '64 KB', uploader: '李娜', time: '2026-03-22 10:45', ver: 1 },
        ],
        函证: [
          { name: '函证范围清单.xlsx', size: '72 KB', uploader: '李娜', time: '2026-03-22 10:48', ver: 1 },
          { name: '地址校验说明.xlsx', size: '35 KB', uploader: '李娜', time: '2026-03-22 10:50', ver: 1 },
        ],
        底稿: [
          { name: '底稿协同边界表.xlsx', size: '58 KB', uploader: '李娜', time: '2026-03-22 10:52', ver: 1 },
        ],
      },
      svc: [
        { name: '资源统筹方案_V1.xlsx', size: '168 KB', uploader: '张伟', time: '2026-03-24 15:30', ver: 1 },
        { name: '阶段性交付摘要.docx', size: '92 KB', uploader: '赵敏', time: '2026-03-24 15:42', ver: 1 },
      ],
    },
    WO202603240201: {
      req: [
        { name: '华北能源集团有限公司_2025-12账套快照.zip', size: '2.8 MB', uploader: '李娜', time: '2026-03-24 11:02', ver: 1 },
        { name: '账套处理口径说明.docx', size: '48 KB', uploader: '李娜', time: '2026-03-24 11:03', ver: 1 },
      ],
      svc: [],
    },
    WO202603240202: {
      req: [
        { name: '华北能源销售有限公司_2025-12账套快照.zip', size: '2.1 MB', uploader: '李娜', time: '2026-03-23 15:12', ver: 1 },
        { name: '未审明细字段口径.xlsx', size: '64 KB', uploader: '李娜', time: '2026-03-23 15:14', ver: 1 },
      ],
      svc: [{ name: '未审明细表_V1.xlsx', size: '615 KB', uploader: '陈静', time: '2026-03-24 16:40', ver: 1 }],
    },
    WO202603240203: {
      req: [
        { name: '华北能源设备有限公司_2025-12账套快照.zip', size: '2.4 MB', uploader: '李娜', time: '2026-03-22 09:45', ver: 1 },
        { name: '底稿模板映射表.xlsx', size: '138 KB', uploader: '李娜', time: '2026-03-22 09:47', ver: 1 },
      ],
      svc: [
        { name: '底稿明细预填结果_V2.xlsx', size: '752 KB', uploader: '陈静', time: '2026-03-24 15:10', ver: 2 },
        { name: '预填差异说明.docx', size: '64 KB', uploader: '陈静', time: '2026-03-24 15:12', ver: 1 },
      ],
    },
    WO202603240204: {
      req: [{ name: '华北能源物流有限公司_2025-12账套快照.zip', size: '1.9 MB', uploader: '李娜', time: '2026-03-20 13:28', ver: 1 }],
      svc: [{ name: '账套处理结果_V1.xlsx', size: '538 KB', uploader: '陈静', time: '2026-03-22 18:30', ver: 1 }],
    },
    WO202603240301: {
      req: [
        { name: '附注排版规范.docx', size: '42 KB', uploader: '李娜', time: '2026-03-22 16:35', ver: 1 },
        { name: '关键页眉页脚说明.xlsx', size: '36 KB', uploader: '李娜', time: '2026-03-22 16:36', ver: 1 },
      ],
      svc: [{ name: '合并附注排版_V1.docx', size: '315 KB', uploader: '张伟', time: '2026-03-23 18:00', ver: 1 }],
    },
    WO202603240302: {
      req: [{ name: '销售公司附注素材包.zip', size: '3.1 MB', uploader: '李娜', time: '2026-03-21 10:00', ver: 1 }],
      svc: [{ name: '合并附注排版_V2.docx', size: '322 KB', uploader: '张伟', time: '2026-03-24 11:30', ver: 2 }],
    },
    WO202603240401: {
      req: [{ name: '主体-科目-定级表.xlsx', size: '118 KB', uploader: '李娜', time: '2026-03-24 13:25', ver: 1 }],
      svc: [],
    },
    WO202603240402: {
      req: [{ name: '主体-科目-定级表.xlsx', size: '126 KB', uploader: '李娜', time: '2026-03-23 09:15', ver: 1 }],
      svc: [{ name: '存货底稿_v1.zip', size: '5.4 MB', uploader: '周芳', time: '2026-03-24 17:20', ver: 1 }],
    },
    WO202603240403: {
      req: [{ name: '主体-科目-定级表.xlsx', size: '121 KB', uploader: '李娜', time: '2026-03-21 17:24', ver: 1 }],
      svc: [{ name: '往来底稿_v2.zip', size: '6.1 MB', uploader: '周芳', time: '2026-03-24 14:05', ver: 2 }],
    },
    WO202603240501: {
      req: [{ name: '合并试算映射模板.xlsx', size: '186 KB', uploader: '李娜', time: '2026-03-23 11:45', ver: 1 }],
      svc: [{ name: '合并试算_V1.xlsx', size: '824 KB', uploader: '王强', time: '2026-03-24 12:20', ver: 1 }],
    },
    WO202603240601: {
      req: [
        { name: '银行账户清单.xlsx', size: '74 KB', uploader: '李娜', time: '2026-03-24 15:18', ver: 1 },
        { name: '授权书.pdf', size: '1.1 MB', uploader: '李娜', time: '2026-03-24 15:19', ver: 1 },
        { name: '银行函证寄送地址清单.xlsx', size: '42 KB', uploader: '李娜', time: '2026-03-24 15:20', ver: 1 },
      ],
      svc: [],
    },
  };

  const comments = {
    WO202603240101: [
      { author: '李娜', dept: '审计一部', content: '本次先锁定数据与试算两条线，请优先校准账套范围与合并试算口径。', time: '2026-03-24 09:28' },
      { author: '王强', dept: '审计二部', content: '已收到，今天先确认账套完整性，明早给出试算资源排期。', time: '2026-03-24 10:05' },
    ],
    WO202603240102: [
      { author: '赵敏', dept: '审计二部', content: '报告、函证、底稿三条线已按优先级拆解完成，请项目组先确认函证范围与附注口径。', time: '2026-03-24 15:48' },
    ],
    WO202603240202: [
      { author: '李娜', dept: '审计一部', content: '请按收入、应收、其他应收三个分组输出未审明细表，并单列大额异常。', time: '2026-03-23 15:20' },
      { author: '陈静', dept: '技术支持部', content: '收到，今晚先交第一版未审明细表。', time: '2026-03-23 15:36' },
    ],
    WO202603240203: [
      { author: '李娜', dept: '审计一部', content: '预填差异说明已看，待我核对底稿模板后给验收结论。', time: '2026-03-24 15:50' },
    ],
    WO202603240301: [
      { author: '李娜', dept: '审计一部', content: '页脚客户简称有误，且目录页码未同步，请按驳回意见修正。', time: '2026-03-24 09:40' },
      { author: '张伟', dept: '审计一部', content: '收到，今天午前完成修订版。', time: '2026-03-24 09:55' },
    ],
    WO202603240402: [
      { author: '周芳', dept: '审计三部', content: '已进入工作区开始编制存货底稿，预计今晚补齐监盘差异说明。', time: '2026-03-24 17:30' },
    ],
  };

  const logs = {
    WO202603240101: [
      log('提交工单', '李娜', '创建一类工单：华北能源集团 FY2025 数据试算资源预排', '2026-03-24 09:20', true),
    ],
    WO202603240102: [
      log('提交工单', '李娜', '创建一类工单：华北能源集团 FY2025 报告函证底稿统筹预排', '2026-03-22 10:40'),
      log('派单', '吴刚', '已安排张伟与赵敏共同负责报告、函证、底稿三条线统筹', '2026-03-22 11:10'),
      log('提交验收', '张伟', '阶段性交付方案与模块拆解清单已提交验收', '2026-03-24 15:42', true),
    ],
    WO202603240201: [
      log('提交工单', '李娜', '创建二类数据工单：华北能源母公司账套处理', '2026-03-24 11:00', true),
    ],
    WO202603240202: [
      log('提交工单', '李娜', '创建二类数据工单：华北能源销售公司未审明细表生成', '2026-03-23 15:10'),
      log('派单', '李娜', '业务一部后台负责人已将工单派给陈静', '2026-03-23 15:28'),
      log('开始作业', '陈静', '已开始基于已关联账套生成未审明细表', '2026-03-24 09:05', true),
    ],
    WO202603240203: [
      log('提交工单', '李娜', '创建二类数据工单：华北能源设备公司底稿明细预填', '2026-03-22 09:40'),
      log('派单', '李娜', '业务一部后台负责人已将工单派给陈静', '2026-03-22 10:10'),
      log('提交验收', '陈静', '底稿明细预填结果及差异说明已提交验收', '2026-03-24 15:12', true),
    ],
    WO202603240204: [
      log('提交工单', '李娜', '创建二类数据工单：华北能源物流公司账套处理', '2026-03-20 13:25'),
      log('提交验收', '陈静', '账套处理结果已上传', '2026-03-22 18:30'),
      log('验收通过', '李娜', '项目组确认账套处理结果无误，工单完成', '2026-03-23 09:15', true),
    ],
    WO202603240301: [
      log('提交工单', '李娜', '创建二类报告工单：华北能源母公司合并附注排版', '2026-03-22 16:30'),
      log('提交验收', '张伟', '附注排版 V1 已提交验收', '2026-03-23 18:00'),
      log('驳回', '李娜', '页脚客户简称错误、目录页码未同步，已驳回重做', '2026-03-24 09:38', true),
    ],
    WO202603240302: [
      log('提交工单', '李娜', '创建二类报告工单：华北能源销售公司合并附注排版', '2026-03-21 09:50'),
      log('驳回后修订', '张伟', '根据项目组意见完成修订版并再次提交验收', '2026-03-24 11:30', true),
    ],
    WO202603240401: [
      log('提交工单', '李娜', '创建三类工单：华北能源集团底稿协同编制', '2026-03-24 13:20', true),
    ],
    WO202603240402: [
      log('提交工单', '李娜', '创建三类工单：华北能源燃气公司底稿协同编制', '2026-03-23 09:10'),
      log('派单', '吴刚', '周芳已被派入项目工作区，开始协同编制底稿', '2026-03-23 09:40', true),
    ],
    WO202603240403: [
      log('提交工单', '李娜', '创建三类工单：华北能源装备制造公司底稿协同编制', '2026-03-21 17:20'),
      log('派单', '吴刚', '周芳已进入工作区，开始协同编制底稿', '2026-03-21 17:55'),
      log('提交验收', '周芳', '底稿与工作区回填记录已提交验收', '2026-03-24 14:06', true),
    ],
    WO202603240501: [
      log('提交工单', '李娜', '创建二类试算工单：华北能源合并试算搭建', '2026-03-23 11:40'),
      log('派单', '李娜', '试算池模块负责人王强已接管该工单', '2026-03-23 12:00', true),
    ],
    WO202603240601: [
      log('提交工单', '李娜', '创建二类函证工单：华北能源集团银行纸质函证-制函', '2026-03-24 15:15', true),
    ],
  };

  const messages = [
    { id: 'msg-1', type: '提醒', title: '一类工单待承接确认', orderId: 'WO202603240101', content: '华北能源集团一类工单已提交，请业务一部后台尽快确认数据与试算资源方案。', time: '2026-03-24 09:30', read: false },
    { id: 'msg-2', type: '派单', title: '二类数据工单待派单', orderId: 'WO202603240201', content: '业务一部后台收到新的数据池工单，请尽快指派处理人。', time: '2026-03-24 11:05', read: false },
    { id: 'msg-3', type: '驳回', title: '报告工单被驳回', orderId: 'WO202603240301', content: '项目组已驳回报告附注排版工单，请按意见修订后再次提交验收。', time: '2026-03-24 09:40', read: false },
    { id: 'msg-4', type: '提醒', title: '三类底稿协同单待验收', orderId: 'WO202603240403', content: '底稿协同工单已提交验收，请项目组及时处理。', time: '2026-03-24 14:10', read: true },
  ];

  const schedules = [
    { id: 'sch-demo-1', userId: '1', userName: '张伟', startDate: '2026-03-24', endDate: '2026-03-25', type: '工单', workOrderId: 'WO202603240302', title: '合并附注排版修订', wtype: '报告', priority: '普通', status: '待验收', progress: 88, client: '华北能源销售公司' },
    { id: 'sch-demo-2', userId: '6', userName: '陈静', startDate: '2026-03-24', endDate: '2026-03-26', type: '工单', workOrderId: 'WO202603240202', title: '未审明细表生成', wtype: '数据', priority: '普通', status: '已接单', progress: 55, client: '华北能源销售公司' },
    { id: 'sch-demo-3', userId: '8', userName: '周芳', startDate: '2026-03-23', endDate: '2026-03-25', type: '工单', workOrderId: 'WO202603240402', title: '底稿协同编制', wtype: '底稿', priority: '普通', status: '已接单', progress: 62, client: '华北能源燃气有限公司' },
    { id: 'sch-demo-4', userId: '3', userName: '王强', startDate: '2026-03-23', endDate: '2026-03-26', type: '工单', workOrderId: 'WO202603240501', title: '合并试算搭建', wtype: '试算', priority: '普通', status: '已接单', progress: 48, client: '华北能源集团有限公司' },
  ];

  return { orders, files, comments, logs, messages, schedules };
})();

(function gdApplyBusinessDemoMockData() {
  GD_WORK_ORDERS.splice(0, GD_WORK_ORDERS.length, ...GD_BUSINESS_DEMO_DATA.orders);

  Object.keys(GD_ORDER_FILES).forEach(key => delete GD_ORDER_FILES[key]);
  Object.assign(GD_ORDER_FILES, GD_BUSINESS_DEMO_DATA.files);

  Object.keys(GD_ORDER_COMMENTS).forEach(key => delete GD_ORDER_COMMENTS[key]);
  Object.assign(GD_ORDER_COMMENTS, GD_BUSINESS_DEMO_DATA.comments);

  Object.keys(GD_LOGS).forEach(key => delete GD_LOGS[key]);
  Object.assign(GD_LOGS, GD_BUSINESS_DEMO_DATA.logs);

  if (typeof GD_MESSAGES !== 'undefined' && Array.isArray(GD_MESSAGES)) {
    GD_MESSAGES.splice(0, GD_MESSAGES.length, ...GD_BUSINESS_DEMO_DATA.messages);
  }

  if (typeof GD_SCHEDULE !== 'undefined' && Array.isArray(GD_SCHEDULE)) {
    GD_SCHEDULE.splice(0, GD_SCHEDULE.length, ...GD_BUSINESS_DEMO_DATA.schedules);
  }
})();

const GD_DEMO_SCENARIOS = [
  {
    id: 'class1-plan',
    badge: '一类工单',
    title: '多模块资源预排',
    summary: '演示一类工单在不同服务组织下的多模块资源预排与详情查看方式，重点展示模块拆解信息。',
    steps: [
      { label: '项目组发起', role: 'proj_lead', orgId: 'org-backoffice-1', overviewTab: 'class1', orderId: 'WO202603240101', drawerTab: 'req', note: '查看一类工单发起态：数据与试算两条线的需求资料、状态=待接单。' },
      { label: '服务组织接收', role: 'delivery_owner', orgId: 'org-backoffice-1', overviewTab: 'class1', orderId: 'WO202603240101', drawerTab: 'logs', note: '切到业务一部后台负责人视角，可查看该一类工单的承接与后续派单日志。' },
      { label: '多模块交付', role: 'delivery_staff', orgId: 'org-delivery-1', overviewTab: 'class1', orderId: 'WO202603240102', drawerTab: 'svc', note: '查看报告、函证、底稿三条线已提交后的详情与服务方上传区。' },
      { label: '项目组查看', role: 'proj_lead', orgId: 'org-delivery-1', overviewTab: 'class1', orderId: 'WO202603240102', drawerTab: 'svc', note: '查看一类工单待验收态，重点演示详情中的模块拆解与细分内容。' },
    ],
  },
  {
    id: 'class2-standard',
    badge: '二类工单',
    title: '数据池标准件交付',
    summary: '演示数据池中的标准件流转：项目组下单、交付负责人派单、交付正式员工提交验收、项目组确认通过。',
    steps: [
      { label: '项目组下单', role: 'proj_lead', orgId: 'org-backoffice-1', overviewTab: '数据', orderId: 'WO202603240201', drawerTab: 'req', note: '查看二类数据工单待接单状态与需求方上传资料。' },
      { label: '交付负责人派单', role: 'delivery_owner', orgId: 'org-backoffice-1', overviewTab: '数据', orderId: 'WO202603240201', drawerTab: 'logs', note: '切到业务一部后台负责人视角，可在详情或列表中完成派单。' },
      { label: '交付正式员工作业', role: 'delivery_staff', orgId: 'org-backoffice-1', overviewTab: '数据', orderId: 'WO202603240202', drawerTab: 'svc', note: '查看数据清洗执行中快照，演示服务方上传交付物并提交验收。' },
      { label: '项目组验收', role: 'proj_lead', orgId: 'org-backoffice-1', overviewTab: '数据', orderId: 'WO202603240203', drawerTab: 'svc', note: '查看待验收快照，可直接演示项目组验收通过。' },
    ],
  },
  {
    id: 'class2-rework',
    badge: '驳回闭环',
    title: '报告工单驳回重提',
    summary: '演示二类报告工单被项目组驳回后，服务方修订并再次提交验收的闭环。',
    steps: [
      { label: '项目组驳回', role: 'proj_lead', orgId: 'org-delivery-1', overviewTab: '报告', orderId: 'WO202603240301', drawerTab: 'svc', note: '查看报告池中的已驳回工单与驳回原因。' },
      { label: '服务方修订', role: 'delivery_staff', orgId: 'org-delivery-1', overviewTab: '报告', orderId: 'WO202603240301', drawerTab: 'svc', note: '切到服务方视角，可继续上传新版本并再次提交验收。' },
      { label: '项目组复验', role: 'proj_lead', orgId: 'org-delivery-1', overviewTab: '报告', orderId: 'WO202603240302', drawerTab: 'svc', note: '查看修订后的待验收快照，演示复验通过。' },
    ],
  },
  {
    id: 'class3-onsite',
    badge: '三类工单',
    title: '底稿驻场协同',
    summary: '演示三类工单的驻场协同：项目组提交、交付负责人派人进驻工作区、驻场人员提交验收、项目组确认。',
    steps: [
      { label: '项目组发起', role: 'proj_lead', orgId: 'org-delivery-1', overviewTab: '底稿', orderId: 'WO202603240401', drawerTab: 'req', note: '查看三类驻场工单待接单状态与需求边界。' },
      { label: '交付负责人派单', role: 'delivery_owner', orgId: 'org-delivery-1', overviewTab: '底稿', orderId: 'WO202603240401', drawerTab: 'logs', note: '切到交付负责人视角，将三类工单派给驻场人员。' },
      { label: '驻场人员协同', role: 'delivery_intern', orgId: 'org-delivery-1', overviewTab: '底稿', orderId: 'WO202603240402', drawerTab: 'svc', note: '切到三类服务方视角，演示在服务方上传区提交驻场成果。' },
      { label: '项目组验收', role: 'proj_lead', orgId: 'org-delivery-1', overviewTab: '底稿', orderId: 'WO202603240403', drawerTab: 'svc', note: '查看三类工单待验收快照，演示项目组确认通过。' },
    ],
  },
];

let gdActiveDemoScenarioId = 'class2-standard';
let gdActiveDemoStepIndex = 0;

function gdGetActiveDemoScenario() {
  return GD_DEMO_SCENARIOS.find(item => item.id === gdActiveDemoScenarioId) || GD_DEMO_SCENARIOS[0];
}

function gdSetDemoContext(role, orgId, overviewTab) {
  GD_DEMO_CONTEXT.role = role;
  GD_DEMO_CONTEXT.orgId = orgId;
  gdSelectedDeliveryOrgId = orgId;
  if (overviewTab) gdOverviewTab = overviewTab;
  gdApplyDemoContext();
  gdState.woPage = 1;
  gdState.selectedOrders.clear();
}

function gdSetActiveDemoScenario(id) {
  gdActiveDemoScenarioId = id;
  gdActiveDemoStepIndex = 0;
  if (gdState.currentTab === 'workorders') gdRenderWorkOrders();
}

function gdGoDemoStep(scenarioId, stepIndex) {
  const scenario = GD_DEMO_SCENARIOS.find(item => item.id === scenarioId);
  const step = scenario?.steps?.[stepIndex];
  if (!scenario || !step) return;
  gdActiveDemoScenarioId = scenarioId;
  gdActiveDemoStepIndex = stepIndex;
  gdCloseDetail();
  gdSetDemoContext(step.role, step.orgId, step.overviewTab);
  gdSwitchTab('workorders');
  setTimeout(() => {
    if (step.orderId) gdOpenDetail(step.orderId, step.drawerTab || (gdIsProjectRole() ? 'req' : 'svc'));
  }, 0);
  showNotification(step.note || `${scenario.title} · ${step.label}`);
}

function gdRenderDemoJourney(mode = 'full') {
  const active = gdGetActiveDemoScenario();

  if (mode === 'compact') {
    return `
      <div class="gd-demo-strip">
        <div class="gd-demo-strip-head">
          <div>
            <div class="gd-section-title" style="margin-bottom:4px;">推荐演示路径</div>
            <div class="gd-demo-strip-sub">点击下方步骤，自动切换演示身份、交付组织、模块池并打开对应工单。</div>
          </div>
          <div class="gd-demo-chip-row">
            ${GD_DEMO_SCENARIOS.map(item => `<button class="gd-demo-chip ${item.id === active.id ? 'active' : ''}" onclick="gdSetActiveDemoScenario('${item.id}')">${item.badge} · ${item.title}</button>`).join('')}
          </div>
        </div>
        <div class="gd-demo-strip-body">
          <div class="gd-demo-strip-summary">${active.summary}</div>
          <div class="gd-demo-step-row">
            ${active.steps.map((step, index) => `<button class="gd-demo-step-btn ${active.id === gdActiveDemoScenarioId && gdActiveDemoStepIndex === index ? 'active' : ''}" onclick="gdGoDemoStep('${active.id}', ${index})">${index + 1}. ${step.label}</button>`).join('')}
          </div>
        </div>
      </div>`;
  }

  return `
    <div class="gd-card gd-demo-section">
      <div class="gd-demo-head">
        <div>
          <div class="gd-section-title" style="margin-bottom:4px;">推荐演示路径</div>
          <div class="gd-demo-strip-sub">围绕一类资源预排、二类标准交付、驳回重提、三类驻场协同整理了 4 条可直接点击的业务演示线。</div>
        </div>
      </div>
      <div class="gd-demo-grid">
        ${GD_DEMO_SCENARIOS.map(item => `
          <div class="gd-demo-card ${item.id === active.id ? 'active' : ''}">
            <div class="gd-demo-card-top">
              <span class="gd-demo-badge">${item.badge}</span>
              <button class="gd-btn gd-btn-primary gd-btn-sm" onclick="gdGoDemoStep('${item.id}',0)">开始演示</button>
            </div>
            <div class="gd-demo-title">${item.title}</div>
            <div class="gd-demo-summary">${item.summary}</div>
            <div class="gd-demo-step-row">
              ${item.steps.map((step, index) => `<button class="gd-demo-step-btn ${item.id === gdActiveDemoScenarioId && gdActiveDemoStepIndex === index ? 'active' : ''}" onclick="gdGoDemoStep('${item.id}', ${index})">${index + 1}. ${step.label}</button>`).join('')}
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}

function gdGetOverviewTabs() {
  return [
    { key: 'class1', label: '一类工单' },
    { key: '数据', label: '数据池' },
    { key: '试算', label: '试算池' },
    { key: '报告', label: '报告池' },
    { key: '函证', label: '函证池' },
    { key: '底稿', label: '底稿池' },
  ];
}

function gdGetFilteredOrdersByTab() {
  return GD_WORK_ORDERS.filter(o => {
    if (gdOverviewTab === 'class1') return o.woType === '一类工单';
    return o.woType !== '一类工单' && gdNormModule(o.serviceModule) === gdOverviewTab;
  });
}

function gdIsProjectRole() {
  return GD_CURRENT_USER.role === 'proj_member' || GD_CURRENT_USER.role === 'proj_lead';
}

function gdIsDeliveryRole() {
  return ['delivery_owner', 'module_lead', 'delivery_staff', 'delivery_intern'].includes(GD_CURRENT_USER.role);
}

function gdResolveDrawerHost(host) {
  if (host === 'workspace' || host === 'center') return host;
  return document.getElementById('ws-detail-modal')?.classList.contains('open') ? 'workspace' : 'center';
}

function gdIsWorkspaceDrawer() {
  return gdDrawerHost === 'workspace';
}

function gdCanOperateInDrawer(order, op) {
  if (!gdIsWorkspaceDrawer()) return gdCanOperate(order, op);

  switch (op) {
    case 'submit_pending':
      return order.status === '待启用';
    case 'recall':
      return order.status === '待接单';
    case 'accept':
    case 'reject':
      return order.status === '待验收';
    default:
      return false;
  }
}

function gdGetVisibleOrders() {
  const role = GD_CURRENT_USER.role;
  const name = GD_CURRENT_USER.name;
  const orgId = GD_DEMO_CONTEXT.orgId;
  const myTags = GD_CURRENT_USER.serviceTags || [];
  const myModule = GD_CURRENT_USER.moduleLead || '';

  return gdGetFilteredOrdersByTab().filter(o => {
    if (role === 'sys_admin') return true;
    if (role === 'proj_member') return gdResolveUserDisplayName(o.submitter) === name;
    if (role === 'proj_lead') return o.projectManager === name || gdResolveUserDisplayName(o.submitter) === name || o.dept === GD_CURRENT_USER.dept;
    if (role === 'delivery_owner') return o.providerOrgId === orgId;
    if (role === 'module_lead') return o.providerOrgId === orgId && gdNormModule(o.serviceModule) === myModule;
    if (role === 'delivery_staff') {
      return o.providerOrgId === orgId && (gdOrderHasAssignee(o, name, GD_CURRENT_USER.id) || myTags.includes(gdNormModule(o.serviceModule)));
    }
    if (role === 'delivery_intern') return o.providerOrgId === orgId && gdOrderHasAssignee(o, name, GD_CURRENT_USER.id);
    return false;
  });
}

function gdCanBatchDispatch() {
  if (!gdState.selectedOrders.size) return false;
  if (gdOverviewTab === 'class1') return false;
  if (GD_CURRENT_USER.role === 'delivery_owner') return true;
  if (GD_CURRENT_USER.role === 'module_lead') return gdOverviewTab === GD_CURRENT_USER.moduleLead;
  return false;
}

/* ════════════════════════════════════════
   v2.2 Override：权限判断
   ════════════════════════════════════════ */
function gdCanOperate(order, op) {
  const role = GD_CURRENT_USER.role;
  const isSubmitter = gdResolveUserDisplayName(order.submitter) === GD_CURRENT_USER.name;
  const isAssignee = gdOrderHasAssignee(order, GD_CURRENT_USER.name, GD_CURRENT_USER.id);
  const sameOrg = order.providerOrgId === GD_DEMO_CONTEXT.orgId;
  const sameModule = gdNormModule(order.serviceModule) === (GD_CURRENT_USER.moduleLead || gdOverviewTab);

  switch (op) {
    case 'recall':
      return gdIsProjectRole() && order.status === '待接单' && (isSubmitter || role === 'proj_lead');
    case 'dispatch':
      return (role === 'delivery_owner' && sameOrg && (order.status === '待接单' || order.status === '待启用'))
        || (role === 'module_lead' && sameOrg && sameModule && (order.status === '待接单' || order.status === '待启用'));
    case 'deliver':
      return gdIsDeliveryRole() && sameOrg && isAssignee && (order.status === '已接单' || order.status === '已驳回');
    case 'accept':
      return gdIsProjectRole() && order.status === '待验收' && (isSubmitter || role === 'proj_lead');
    case 'reject':
      return gdIsProjectRole() && order.status === '待验收' && (isSubmitter || role === 'proj_lead');
    case 'work':
      return true;
    default:
      return false;
  }
}

function gdStatusTag(status) {
  const MAP = {
    '待启用': '#EDE9FE,#6D28D9',
    '待接单': '#DBEAFE,#1D4ED8',
    '已接单': '#FEF3C7,#92400E',
    '待验收': '#FEF9C3,#A16207',
    '验收通过': '#D1FAE5,#065F46',
    '已驳回': '#FEE2E2,#991B1B',
    '已关闭': '#F3F4F6,#6B7280',
  };
  const [bg, color] = (MAP[status] || '#F3F4F6,#6B7280').split(',');
  return `<span style="display:inline-flex;align-items:center;padding:2px 9px;border-radius:20px;font-size:0.75rem;font-weight:600;background:${bg};color:${color};white-space:nowrap;">${status}</span>`;
}

function gdOpenDetail(id, defaultTab = 'logs', host) {
  const order = GD_WORK_ORDERS.find(o => o.id === id);
  if (!order) return;
  gdDrawerOrderId = id;
  gdDrawerHost = gdResolveDrawerHost(host);

  const overlay = document.getElementById('gd-drawer-overlay');
  const drawer  = document.getElementById('gd-detail-drawer');
  const left    = document.getElementById('gd-drawer-left');
  const itabs   = document.getElementById('gd-drawer-itabs');
  if (!overlay || !drawer || !left || !itabs) return;

  left.innerHTML = gdDrawerLeftHtml(order);
  itabs.querySelectorAll('.gd-itab').forEach(btn => {
    btn.onclick = () => gdDrawerRenderTab(btn.dataset.itab, id);
  });
  overlay.classList.add('open');
  drawer.classList.add('open');
  document.body.style.overflow = 'hidden';
  gdDrawerRenderTab(defaultTab, id);
}

function gdOpenWork(id) {
  const host = gdResolveDrawerHost();
  if (host === 'workspace') {
    gdOpenDetail(id, 'req', host);
    return;
  }
  if (gdIsProjectRole()) gdOpenDetail(id, 'req', host);
  else gdOpenDetail(id, 'svc', host);
}

function gdGetOrderWorkspaceMeta(order) {
  const meta = {
    dept: order.workspaceDept || '',
    group: order.workspaceGroup || '',
  };

  if (typeof WORKSPACE_DATA !== 'undefined' && Array.isArray(WORKSPACE_DATA)) {
    const orderWorkspaceId = String(order.workspaceId || '').trim();
    const orderWorkspaceName = String(order.workspace || '').trim();
    const ws = WORKSPACE_DATA.find(item => String(item.id || '').trim() === orderWorkspaceId)
      || WORKSPACE_DATA.find(item => String(item.name || '').trim() === orderWorkspaceName);
    if (ws) {
      if (!meta.dept) meta.dept = ws.dept || '';
      if (!meta.group) meta.group = ws.group || '';
    }
  }

  if ((!meta.group || !meta.dept) && order.workspace) {
    const parts = String(order.workspace).split('-');
    if (!meta.group) meta.group = parts[0] || '';
    if (!meta.dept) meta.dept = parts.length >= 4 ? parts[3] : '';
  }

  if (!meta.dept) meta.dept = order.dept || '';
  return meta;
}

function gdResolveUserDisplayName(name) {
  const text = String(name || '').trim();
  if (!text) return '';
  if (text === '当前用户') return GD_CURRENT_USER.name || text;
  return text;
}

function gdOrderAssigneeNames(order) {
  if (!order) return [];
  const rawList = Array.isArray(order.assigneeList) && order.assigneeList.length
    ? order.assigneeList
    : String(order.assignee || order.handler || '').split(/[、,，]/);
  return [...new Set(rawList.map(item => gdResolveUserDisplayName(item)).filter(Boolean))];
}

function gdOrderAssigneeIds(order) {
  if (!order) return [];
  const rawList = Array.isArray(order.assigneeIdList) && order.assigneeIdList.length
    ? order.assigneeIdList
    : (order.assigneeId ? [order.assigneeId] : []);
  return [...new Set(rawList.map(item => String(item || '').trim()).filter(Boolean))];
}

function gdOrderHasAssignee(order, name, userId = '') {
  if (!order) return false;
  if (userId && gdOrderAssigneeIds(order).includes(String(userId))) return true;
  if (!name) return false;
  return gdOrderAssigneeNames(order).includes(name);
}

function gdOrderAssigneeText(order) {
  const names = gdOrderAssigneeNames(order);
  return names.length ? names.join('、') : '';
}

function gdSetOrderAssignees(order, members) {
  if (!order) return;
  const normalized = [];
  const seen = new Set();
  (members || []).forEach(member => {
    const dedupeKey = String(member?.userId || member?.id || member?.name || '').trim();
    const userId = String(member?.userId || member?.id || '').trim();
    const name = String(member?.name || '').trim();
    if (!dedupeKey || !name || seen.has(dedupeKey)) return;
    seen.add(dedupeKey);
    normalized.push({
      userId,
      name,
      role: member?.role || member?.assigneeRole || '',
    });
  });

  const names = normalized.map(member => member.name);
  const ids = normalized.map(member => member.userId).filter(Boolean);
  const roles = normalized.map(member => member.role).filter(Boolean);
  const text = names.join('、');

  order.assigneeList = names;
  order.assigneeIdList = ids;
  order.assigneeRoleList = roles;
  order.assignee = text;
  order.handler = text;
  order.assigneeId = ids.length === 1 ? ids[0] : '';
  order.assigneeRole = roles.length === 1 ? roles[0] : '';
}

const GD_CLASS1_MODULE_META = {
  数据: {
    fields: [
      ['ledgerCount', '账套数量'],
      ['ledgerExpectTime', '预计账套提供时间'],
    ],
  },
  试算: {
    fields: [
      ['entityCount', '主体数量'],
      ['dataExpectTime', '预计账套提供时间'],
    ],
  },
  报告: {
    fields: [
      ['entityCount', '主体数量'],
      ['trialBalanceTime', '预计终版试算（含附表1-3）提供时间'],
    ],
  },
  函证: {
    fields: [
      ['entityCount', '主体数量'],
      ['materialExpectTime', '预计资料提供时间'],
    ],
  },
  底稿: {
    fields: [
      ['entityCount', '主体数量'],
      ['dataExpectTime', '预计账套提供时间'],
      ['materialAllExpectTime', '预计整体资料提供时间'],
    ],
  },
};

function gdGetClass1ModuleEntries(order) {
  if (!order || order.woType !== '一类工单') return [];
  const detailMap = order.moduleDetails || {};
  const serviceKeys = String(order.serviceModule || '')
    .split(/[、,，/]/)
    .map(item => String(item || '').trim())
    .filter(Boolean);
  const keys = [...new Set([...Object.keys(detailMap), ...serviceKeys])];
  return keys.map(key => ({
    key,
    meta: GD_CLASS1_MODULE_META[key] || { scope: '', fields: [] },
    detail: detailMap[key] || {},
  }));
}

function gdClass1ModuleSectionHtml(order) {
  const entries = gdGetClass1ModuleEntries(order);
  if (!entries.length) return '';

  const hasSplit = !!order._hasSplit;
  const splitIds = order._splitOrderIds || [];
  const splitOrders = hasSplit ? GD_WORK_ORDERS.filter(o => splitIds.includes(o.id)) : [];

  const splitBadge = hasSplit
    ? `<span style="margin-left:8px;font-size:0.75rem;font-weight:600;padding:2px 10px;border-radius:12px;background:#EDE9FE;color:#6D28D9;">已拆单 · ${splitIds.length} 个子工单</span>`
    : '';

  return `
    <div class="gd-drawer-section-title" style="margin-top:14px;">服务模块拆解${splitBadge}</div>
    <div class="gd-c1-module-list">
      ${entries.map(({ key, meta, detail }) => {
        const infoItems = meta.fields.map(([field, label]) => [label, detail[field] || '—']);
        const moduleChildren = splitOrders.filter(o => gdNormModule(o.serviceModule) === key);
        return `
          <section class="gd-c1-module-card">
            <div class="gd-c1-module-head">
              <div class="gd-c1-module-title-wrap">
                <span class="gd-c1-module-tag">${key}</span>
              </div>
              <div class="gd-c1-module-time">
                <span>模块期望完成</span>
                <strong>${gdFormatDateOnly(detail.expectedTime || order.deliveryDeadline || order.expectedTime) || '—'}</strong>
              </div>
            </div>
            ${infoItems.length ? `
            <div class="gd-c1-module-grid">
              ${infoItems.map(([label, value]) => `
                <div class="gd-c1-module-kv">
                  <span class="gd-c1-module-k">${label}</span>
                  <span class="gd-c1-module-v">${value}</span>
                </div>
              `).join('')}
            </div>` : ''}
            ${detail.note ? `
              <div class="gd-c1-module-note">
                <div class="gd-c1-block-label">补充说明</div>
                <div class="gd-c1-block-text">${detail.note}</div>
              </div>` : ''}
            ${moduleChildren.length ? `
              <div style="margin-top:8px;border-top:1px solid #F3F4F6;padding-top:8px;">
                <div style="font-size:0.75rem;font-weight:600;color:#6B7280;margin-bottom:4px;">拆解子工单（${moduleChildren.length}）</div>
                ${moduleChildren.map(child => `
                  <div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:0.8rem;cursor:pointer;" onclick="gdOpenDetail('${child.id}','req',gdDrawerHost)">
                    ${gdStatusTag(child.status)}
                    <span style="color:#1D4ED8;text-decoration:underline;">${child.id}</span>
                    <span style="color:#374151;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${gdEscapeAttrText(child.title)}">${gdEscapeAttrText(child.title)}</span>
                    <span style="color:#9CA3AF;font-size:0.72rem;">${child.company || ''}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </section>`;
      }).join('')}
    </div>
  `;
}

/* ── 一类工单：判断是否可执行自动拆单 ── */
function gdCanAutoSplit(order) {
  if (!order || order.woType !== '一类工单') return false;
  if (order.status === '验收通过' || order.status === '已关闭') return false;
  if (order._hasSplit) return false;
  return gdIsWorkspaceDrawer() && gdIsProjectRole();
}

/* ── 一类工单自动拆单：按模块+主体拆分成二类/三类工单 ── */
function gdAutoSplitClass1Order(parentId) {
  const parent = GD_WORK_ORDERS.find(o => o.id === parentId);
  if (!parent || parent.woType !== '一类工单') {
    showNotification('未找到一类工单'); return;
  }
  if (parent._hasSplit) {
    showNotification('该工单已执行过自动拆单'); return;
  }

  const entries = gdGetClass1ModuleEntries(parent);
  if (!entries.length) {
    showNotification('该一类工单未包含服务模块，无法拆单'); return;
  }

  const modNames = entries.map(e => e.key).join('、');
  if (!confirm(`确认对工单 ${parentId} 执行自动拆单？\n\n将按 [${modNames}] 模块及主体公司粒度拆解为二类/三类工单，拆解后的子工单状态为"待启用"。`)) return;

  const ws = typeof WORKSPACE_DATA !== 'undefined'
    ? WORKSPACE_DATA.find(w => w.name === parent.workspace)
    : null;
  const entities = ws?.projectEntities || [parent.company || '未命名主体'];
  const bindingRows = ws?.bindingRows || entities.map(name => ({ name, firmCode: '—', reportType: '—', firmManager: ws?.manager || '—' }));
  const uniqueCompanies = [...new Set(bindingRows.map(r => r.name).filter(Boolean))];

  const MODULE_TYPE_MAP = { '数据': '二类工单', '试算': '二类工单', '报告': '二类工单', '函证': '二类工单', '底稿': '三类工单' };
  const MODULE_DEFAULT_SUB = {
    '数据': '账套处理', '试算': '试算搭建', '报告': '报告编制',
    '函证': '银行纸质函证-制函', '底稿': '',
  };
  const MODULE_START_FIELD = {
    '数据': 'dataExpectTime', '试算': 'dataExpectTime',
    '报告': 'trialBalanceTime', '函证': 'materialExpectTime',
    '底稿': 'dataExpectTime',
  };

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  let splitCount = 0;
  const splitIds = [];

  entries.forEach(({ key: moduleKey, detail }) => {
    const woType = MODULE_TYPE_MAP[moduleKey] || '二类工单';
    const subType = MODULE_DEFAULT_SUB[moduleKey] || '';
    const modLabel = subType ? `${moduleKey}-${subType}` : moduleKey;
    const startField = MODULE_START_FIELD[moduleKey];
    const startValue = detail[startField] || '';
    const moduleExpectedTime = detail.expectedTime || parent.expectedTime || '';

    const subjects = moduleKey === '函证' ? bindingRows : uniqueCompanies.map(name => {
      const row = bindingRows.find(r => r.name === name);
      return row || { name, firmCode: '—', reportType: '—', manager: '—' };
    });
    const subjectList = moduleKey === '函证' ? subjects : subjects.map(s => (typeof s === 'string' ? { name: s } : s));

    subjectList.forEach((subject, idx) => {
      const companyName = typeof subject === 'string' ? subject : (subject.name || '未命名主体');
      const firmCode = subject.firmCode || parent.firmCode || '—';
      const reportType = subject.reportType || parent.reportType || '—';
      const manager = subject.manager || parent.projectManager || '—';

      splitCount++;
      const splitId = `${parentId}-S${String(splitCount).padStart(3, '0')}`;
      splitIds.push(splitId);

      const titleVerb = woType === '三类工单' ? '协同编制' : '处理';
      const splitOrder = {
        id: splitId,
        woType,
        parentOrderId: parentId,
        workspace: parent.workspace,
        workspaceId: parent.workspaceId || '',
        company: companyName,
        firmCode,
        reportType,
        projectManager: manager,
        submitter: parent.submitter,
        projectFollower: parent.projectFollower || parent.submitter,
        submitTime: now,
        expectedTime: moduleExpectedTime,
        handler: '',
        status: '待启用',
        priority: parent.priority || '普通',
        title: `${companyName} ${subType || moduleKey}${titleVerb}`,
        serviceModule: modLabel,
        serviceProvider: parent.serviceProvider || parent.provider || '交付中心',
        provider: parent.provider || '交付中心',
        providerOrgName: parent.providerOrgName || parent.provider || '交付中心',
        providerOrgId: parent.providerOrgId || '',
        rejectReason: '',
        revisionCount: 0,
        dept: parent.dept || parent.workspaceDept || '',
        workspaceDept: parent.workspaceDept || '',
        workspaceGroup: parent.workspaceGroup || '',
        type: woType,
        desc: `由一类工单 ${parentId} 自动拆解生成。${detail.note || ''}`,
      };

      if (woType === '二类工单') {
        if (startField) splitOrder[startField] = startValue;
        splitOrder.useLedger = false;
        splitOrder.attachments = (detail.files || []).map(f => typeof f === 'string' ? f : f.name);
      } else {
        splitOrder.dataExpectTime = detail.dataExpectTime || startValue || '';
        splitOrder.materialAllExpectTime = detail.materialAllExpectTime || '';
        splitOrder.useLedger = true;
        splitOrder.attachments = [`主体-科目-定级表_${companyName}.xls`];
      }

      if (typeof gdNormalizeMockWorkOrderDates === 'function') {
        gdNormalizeMockWorkOrderDates(splitOrder);
      }

      GD_WORK_ORDERS.unshift(splitOrder);

      if (typeof GD_ORDER_FILES !== 'undefined') {
        const reqFiles = (splitOrder.attachments || []).map(name => ({
          name, size: '—', uploader: splitOrder.submitter, time: now, ver: 1,
        }));
        GD_ORDER_FILES[splitId] = { req: reqFiles, svc: [], ledger: [] };
      }

      if (typeof GD_LOGS !== 'undefined') {
        GD_LOGS[splitId] = [{
          action: '自动拆单', op: '系统',
          content: `由一类工单 ${parentId} 自动拆解生成（${modLabel} · ${companyName}）`,
          time: now, active: true,
        }];
      }
    });
  });

  parent._hasSplit = true;
  parent._splitOrderIds = splitIds;

  if (typeof GD_LOGS !== 'undefined') {
    if (!GD_LOGS[parentId]) GD_LOGS[parentId] = [];
    GD_LOGS[parentId].push({
      action: '自动拆单', op: parent.submitter,
      content: `执行自动拆单，共拆解为 ${splitCount} 个子工单（${entries.map(e => e.key).join('、')}）`,
      time: now, active: true,
    });
  }

  showNotification(`自动拆单完成，共生成 ${splitCount} 个子工单`);

  gdOpenDetail(parentId, 'logs', gdDrawerHost);
  if (document.querySelector('#pd-panel-orders.active') && typeof renderWoMgrPanel === 'function') renderWoMgrPanel();
  if (typeof gdRenderWorkOrders === 'function') gdRenderWorkOrders();
}

function gdOpenParentOrder(id) {
  if (!id) return;
  gdOpenDetail(id, 'req', gdDrawerHost);
}

function gdParentOrderLinkHtml(order) {
  if (!order?.parentOrderId) return '—';
  return `<span class="gd-wo-id-link" onclick="gdOpenParentOrder('${order.parentOrderId}')">${order.parentOrderId}</span>`;
}

const GD_CLASS1_MODULE_TIME_FIELDS = ['ledgerExpectTime', 'dataExpectTime', 'trialBalanceTime', 'materialExpectTime', 'materialAllExpectTime', 'expectedTime'];

function gdParseDateValue(value) {
  const text = String(value || '').trim();
  if (!text) return null;
  const matched = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:\s+(\d{1,2})(?::(\d{1,2}))?)?$/);
  if (matched) {
    const [, y, m, d, hh = '0', mm = '0'] = matched;
    return new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm)).getTime();
  }
  const fallback = Date.parse(text.replace(/\s+/, 'T'));
  return Number.isNaN(fallback) ? null : fallback;
}

function gdPickLaterDateValue(values, fallback = '') {
  let selected = '';
  let selectedTs = null;
  (values || []).forEach(value => {
    const ts = gdParseDateValue(value);
    if (ts === null) return;
    if (selectedTs === null || ts > selectedTs) {
      selected = value;
      selectedTs = ts;
    }
  });
  return selected || fallback;
}

function gdFormatDateOnly(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  const matched = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (matched) {
    const [, y, m, d] = matched;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  const ts = gdParseDateValue(text);
  if (ts === null) return text;
  const date = new Date(ts);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function gdShiftDateByMonths(value, months = 1) {
  const dateText = gdFormatDateOnly(value);
  if (!dateText) return '';
  const matched = dateText.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!matched) return dateText;
  const [, y, m, d] = matched;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  const target = new Date(year, month - 1 + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, lastDay));
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
}

function gdNormalizeMockModuleDetails(moduleDetails) {
  if (!moduleDetails || typeof moduleDetails !== 'object') return moduleDetails;
  return Object.fromEntries(Object.entries(moduleDetails).map(([key, detail]) => {
    if (!detail || typeof detail !== 'object') return [key, detail];
    return [key, {
      ...detail,
      expectedTime: detail.expectedTime ? gdShiftDateByMonths(detail.expectedTime, 1) : '',
      ledgerExpectTime: gdFormatDateOnly(detail.ledgerExpectTime || ''),
      dataExpectTime: gdFormatDateOnly(detail.dataExpectTime || ''),
      trialBalanceTime: gdFormatDateOnly(detail.trialBalanceTime || ''),
      materialExpectTime: gdFormatDateOnly(detail.materialExpectTime || ''),
      materialAllExpectTime: gdFormatDateOnly(detail.materialAllExpectTime || ''),
    }];
  }));
}

function gdNormalizeMockWorkOrderDates(order) {
  if (!order || typeof order !== 'object') return order;
  return {
    ...order,
    expectedTime: order.expectedTime ? gdShiftDateByMonths(order.expectedTime, 1) : '',
    deliveryDeadline: order.deliveryDeadline ? gdShiftDateByMonths(order.deliveryDeadline, 1) : (order.deliveryDeadline || ''),
    ledgerExpectTime: gdFormatDateOnly(order.ledgerExpectTime || ''),
    dataExpectTime: gdFormatDateOnly(order.dataExpectTime || ''),
    trialBalanceTime: gdFormatDateOnly(order.trialBalanceTime || ''),
    materialExpectTime: gdFormatDateOnly(order.materialExpectTime || ''),
    materialAllExpectTime: gdFormatDateOnly(order.materialAllExpectTime || ''),
    moduleDetails: gdNormalizeMockModuleDetails(order.moduleDetails),
  };
}

function gdHasClass1ModuleTime(order) {
  const detailMap = order?.moduleDetails || {};
  return Object.values(detailMap).some(detail => GD_CLASS1_MODULE_TIME_FIELDS.some(field => detail?.[field]));
}

function gdGetOrderStartTime(order) {
  if (!order) return '';
  const submitTime = order.startTime || order.submitTime || '';
  if (order.woType === '一类工单') {
    return gdFormatDateOnly(gdHasClass1ModuleTime(order) ? (order.startTime || order.submitTime || '') : (order.submitTime || ''));
  }
  if (order.woType === '二类工单') {
    const mod = gdNormModule(order.serviceModule);
    if (mod === '数据') return gdFormatDateOnly(gdPickLaterDateValue([order.ledgerExpectTime || order.dataExpectTime, submitTime], submitTime));
    if (mod === '试算') return gdFormatDateOnly(gdPickLaterDateValue([order.dataExpectTime || order.ledgerExpectTime, submitTime], submitTime));
    if (mod === '报告') return gdFormatDateOnly(gdPickLaterDateValue([order.trialBalanceTime, submitTime], submitTime));
    if (mod === '函证') return gdFormatDateOnly(gdPickLaterDateValue([order.materialExpectTime, submitTime], submitTime));
    return gdFormatDateOnly(submitTime);
  }
  if (order.woType === '三类工单') {
    return gdFormatDateOnly(gdPickLaterDateValue([order.dataExpectTime, order.materialAllExpectTime], order.submitTime || ''));
  }
  return gdFormatDateOnly(submitTime);
}

function gdGetWorkOrderExtraInfoItems(order) {
  if (!order) return [];

  const items = [];
  if (order.woType === '二类工单' || order.woType === '三类工单') {
    items.push({ label: '所属一类工单', html: gdParentOrderLinkHtml(order) });
  }

  if (order.woType === '二类工单') {
    const mod = gdNormModule(order.serviceModule);
    if (mod === '数据') {
      items.push({ label: '预计账套提供时间', text: gdFormatDateOnly(order.ledgerExpectTime || order.dataExpectTime) || '—' });
    } else if (mod === '试算') {
      items.push({ label: '预计账套提供时间', text: gdFormatDateOnly(order.dataExpectTime || order.ledgerExpectTime) || '—' });
    } else if (mod === '报告') {
      items.push({ label: '预计终版试算（含附表 1-3）提供时间', text: gdFormatDateOnly(order.trialBalanceTime) || '—' });
    } else if (mod === '函证') {
      items.push({ label: '预计资料提供时间', text: gdFormatDateOnly(order.materialExpectTime) || '—' });
    }
  }

  if (order.woType === '三类工单') {
    items.push({ label: '预计账套提供时间', text: gdFormatDateOnly(order.dataExpectTime) || '—' });
    items.push({ label: '整体资料提供时间', text: gdFormatDateOnly(order.materialAllExpectTime) || '—' });
  }

  return items;
}

function gdProjectFollowerName(order) {
  return gdResolveUserDisplayName(order.projectFollower) || gdResolveUserDisplayName(order.submitter) || '—';
}

function gdSplitMultiValueText(value) {
  return [...new Set(
    String(value || '')
      .split(/[、,，]/)
      .map(item => String(item || '').trim())
      .filter(Boolean)
  )];
}

function gdNormalizeRelatedProjectRow(row) {
  return {
    company: String(row?.company || row?.name || '').trim(),
    reportType: String(row?.reportType || '').trim(),
    firmCode: String(row?.firmCode || row?.totalCode || '').trim(),
  };
}

function gdUniqueRelatedProjectRows(rows = []) {
  const list = [];
  const seen = new Set();
  (rows || []).forEach(row => {
    const item = gdNormalizeRelatedProjectRow(row);
    if (!item.company && !item.reportType && !item.firmCode) return;
    const key = `${item.company}__${item.reportType}__${item.firmCode}`;
    if (seen.has(key)) return;
    seen.add(key);
    list.push(item);
  });
  return list;
}

function gdGetCandidateBindingRows(order) {
  if (typeof WORKSPACE_DATA === 'undefined' || !Array.isArray(WORKSPACE_DATA)) return [];
  const orderWorkspaceId = String(order?.workspaceId || '').trim();
  const orderWorkspaceName = String(order?.workspace || '').trim();
  const exactWorkspace = WORKSPACE_DATA.find(item => String(item.id || '').trim() === orderWorkspaceId)
    || WORKSPACE_DATA.find(item => String(item.name || '').trim() === orderWorkspaceName);
  if (exactWorkspace?.bindingRows?.length) return exactWorkspace.bindingRows;

  const fuzzyWorkspace = WORKSPACE_DATA.find(item => {
    const name = String(item?.name || '').trim();
    return name && orderWorkspaceName && (name.includes(orderWorkspaceName) || orderWorkspaceName.includes(name));
  });
  if (fuzzyWorkspace?.bindingRows?.length) return fuzzyWorkspace.bindingRows;

  return WORKSPACE_DATA.flatMap(item => Array.isArray(item?.bindingRows) ? item.bindingRows : []);
}

function gdExtractRelatedProjectRowsFromDesc(order, workspaceRows = []) {
  const descText = String(order?.desc || '').trim();
  if (!descText) return [];
  const rows = gdUniqueRelatedProjectRows(workspaceRows);
  const moduleKey = gdNormModule(order?.serviceModule);
  const subjectMatch = descText.match(/主体\s+(.+?)(?:；|。|$)/);
  const subjectText = subjectMatch?.[1] || '';

  if (moduleKey === '报告' && subjectText) {
    const parsedRows = gdSplitMultiValueText(subjectText)
      .map(chunk => String(chunk || '').trim())
      .filter(Boolean)
      .map(chunk => {
        const reportType = chunk.includes('合并') ? '合并' : (chunk.includes('单体') ? '单体' : '');
        const company = chunk.replace(/\s*(合并|单体)\s*$/, '').trim();
        const matched = rows.find(row => row.company === company && (!reportType || row.reportType === reportType))
          || rows.find(row => row.company === company);
        return matched || { company, reportType, firmCode: '' };
      });
    return gdUniqueRelatedProjectRows(parsedRows);
  }

  if (moduleKey === '函证' && subjectText) {
    const parsedRows = gdSplitMultiValueText(subjectText)
      .map(chunk => String(chunk || '').trim())
      .filter(Boolean)
      .map(chunk => {
        const matchedCode = chunk.match(/(HQ-[A-Z0-9-]+)/i);
        const firmCode = matchedCode?.[1] || '';
        const company = chunk.replace(/\s*HQ-[A-Z0-9-]+\s*/i, '').trim();
        const matched = rows.find(row => firmCode && row.firmCode === firmCode)
          || rows.find(row => row.company === company);
        return matched || { company, reportType: '', firmCode };
      });
    return gdUniqueRelatedProjectRows(parsedRows);
  }

  return gdUniqueRelatedProjectRows(rows.filter(row => descText.includes(row.company || '') || descText.includes(row.firmCode || '')));
}

function gdScoreRelatedProjectRows(rows = [], workspaceRows = []) {
  const normalizedRows = gdUniqueRelatedProjectRows(rows);
  if (!normalizedRows.length) return -1;
  const workspaceSet = new Set(gdUniqueRelatedProjectRows(workspaceRows).map(
    row => `${row.company}__${row.reportType}__${row.firmCode}`
  ));
  const completeCount = normalizedRows.filter(row => row.company && row.reportType && row.firmCode).length;
  const codeCount = normalizedRows.filter(row => row.firmCode && row.firmCode !== '—').length;
  const workspaceMatchCount = workspaceSet.size
    ? normalizedRows.filter(row => workspaceSet.has(`${row.company}__${row.reportType}__${row.firmCode}`)).length
    : 0;
  return normalizedRows.length * 100 + workspaceMatchCount * 20 + completeCount * 10 + codeCount;
}

function gdResolveRelatedProjectData(order) {
  if (!order) return { rows: [], source: 'empty' };

  const storedRows = gdUniqueRelatedProjectRows(
    Array.isArray(order.relatedProjectRows) ? order.relatedProjectRows : []
  );

  const firmCodes = gdSplitMultiValueText(order.firmCode);
  const companies = gdSplitMultiValueText(order.company);
  const reportTypes = gdSplitMultiValueText(order.reportType);

  const workspaceRows = gdUniqueRelatedProjectRows(gdGetCandidateBindingRows(order));

  let workspaceMatchedRows = [];
  if (workspaceRows.length && (firmCodes.length || companies.length)) {
    if (firmCodes.length) {
      workspaceMatchedRows = firmCodes
        .map(code => workspaceRows.find(row => row.firmCode === code))
        .filter(Boolean);
      if (!workspaceMatchedRows.length) workspaceMatchedRows = workspaceRows.filter(row => firmCodes.includes(row.firmCode));
    } else {
      workspaceMatchedRows = companies
        .map(company => workspaceRows.find(row => row.company === company))
        .filter(Boolean);
    }
  }
  workspaceMatchedRows = gdUniqueRelatedProjectRows(workspaceMatchedRows);

  const descMatchedRows = gdExtractRelatedProjectRowsFromDesc(order, workspaceRows);

  const maxLength = Math.max(companies.length, firmCodes.length, reportTypes.length);
  const splitRows = gdUniqueRelatedProjectRows(Array.from({ length: maxLength }, (_, index) => ({
    company: companies[index] || companies[0] || '—',
    reportType: reportTypes[index] || reportTypes[0] || '—',
    firmCode: firmCodes[index] || firmCodes[0] || '—',
  })).filter(row => row.company !== '—' || row.reportType !== '—' || row.firmCode !== '—'));

  const candidates = [
    { source: 'stored', rows: storedRows },
    { source: 'workspace', rows: workspaceMatchedRows },
    { source: 'desc', rows: descMatchedRows },
    { source: 'split', rows: splitRows },
  ].filter(item => item.rows.length);

  if (!candidates.length) return { rows: [], source: 'empty' };
  return candidates.reduce((best, current) => (
    gdScoreRelatedProjectRows(current.rows, workspaceRows) > gdScoreRelatedProjectRows(best.rows, workspaceRows) ? current : best
  ), candidates[0]);
}

function gdGetRelatedProjectRows(order) {
  return gdResolveRelatedProjectData(order).rows;
}

function gdRelatedProjectReportTypeHtml(reportType) {
  const text = String(reportType || '').trim();
  if (!text || text === '—') return '<span style="color:#9CA3AF;">—</span>';
  if (text === '合并' || text === '单体') {
    const isMerged = text === '合并';
    const bg = isMerged ? 'rgba(99,102,241,0.10)' : 'rgba(16,185,129,0.10)';
    const color = isMerged ? '#4F46E5' : '#065F46';
    return `<span style="display:inline-flex;align-items:center;justify-content:center;padding:3px 9px;border-radius:999px;font-size:0.72rem;font-weight:600;background:${bg};color:${color};white-space:nowrap;">${gdEscapeAttrText(text)}</span>`;
  }
  return gdEscapeAttrText(text);
}

function gdRenderRelatedProjectSection(order, mode = 'grid') {
  if (mode === 'table') {
    const relatedData = gdResolveRelatedProjectData(order);
    const rows = relatedData.rows;
    const sourceLabelMap = {
      stored: '已存主体',
      workspace: '工作区绑定',
      desc: '备注解析',
      split: '字段拆分',
      empty: '暂无数据',
    };
    if (rows.length) {
      const storedLen = Array.isArray(order?.relatedProjectRows) ? order.relatedProjectRows.length : 0;
      if (storedLen < rows.length) {
        order.relatedProjectRows = rows.map(row => ({ ...row }));
      }
    }
    return `
    <div class="gd-drawer-section-head" style="margin-top:14px;">
      <div class="gd-drawer-section-title" style="margin-bottom:0;">关联项目信息</div>
      <div class="gd-drawer-section-meta" title="当前识别来源：${sourceLabelMap[relatedData.source] || '—'}">共 ${rows.length} 行</div>
    </div>
    ${rows.length ? `
    <div class="gd-related-project-wrap" style="margin-bottom:4px;border:1px solid #E5E7EB;border-radius:14px;background:#FFF;overflow:hidden;">
      <div style="padding:8px 12px;background:#F8FAFC;border-bottom:1px solid #E5E7EB;font-size:0.74rem;font-weight:600;color:#64748B;">主体公司 / 财报类型 / 总所项目编号</div>
      ${rows.map((row, index) => `
      <div style="padding:9px 12px;${index < rows.length - 1 ? 'border-bottom:1px solid #F3F4F6;' : ''}overflow-x:auto;overflow-y:hidden;white-space:nowrap;font-size:0.79rem;line-height:1.5;">
        <span style="display:inline-block;width:18px;color:#94A3B8;font-weight:600;">${index + 1}</span>
        <span title="${gdEscapeAttrText(row.company || '—')}" style="display:inline-block;min-width:max-content;color:#111827;font-weight:600;">${gdEscapeAttrText(row.company || '—')}</span>
        <span style="display:inline-block;margin:0 10px;color:#CBD5E1;">|</span>
        <span style="display:inline-block;vertical-align:middle;">${gdRelatedProjectReportTypeHtml(row.reportType)}</span>
        <span style="display:inline-block;margin:0 10px;color:#CBD5E1;">|</span>
        <span style="display:inline-block;color:#94A3B8;">总所项目编号</span>
        <span class="gd-wo-code" style="display:inline-block;margin-left:6px;min-width:max-content;">${gdEscapeAttrText(row.firmCode || '—')}</span>
      </div>`).join('')}
    </div>` : `<div class="gd-empty-inline" style="padding:4px 0 12px;">暂无关联项目信息</div>`}`;
  }

  return `
    <div class="gd-drawer-section-title" style="margin-top:14px;">关联项目信息</div>
    <div class="gd-dinfo-grid">
      <div class="gd-dinfo-item gd-dinfo-full">
        <span class="gd-dinfo-label">公司名称</span>
        <span class="gd-dinfo-val">${order.company || '—'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">总所编码</span>
        <span class="gd-dinfo-val gd-wo-code">${order.firmCode || '—'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">财报类型</span>
        <span class="gd-dinfo-val">${order.reportType || '—'}</span>
      </div>
      <div class="gd-dinfo-item gd-dinfo-full">
        <span class="gd-dinfo-label">项目负责人</span>
        <span class="gd-dinfo-val">${order.projectManager || '—'}</span>
      </div>
    </div>`;
}

function gdOverviewActionHtml(order) {
  const hasHandler = gdOrderAssigneeNames(order).length > 0;

  if (!hasHandler && gdCanOperate(order, 'dispatch')) {
    return `<div class="gd-wo-act-group"><button class="gd-btn gd-btn-primary gd-btn-sm" onclick="event.stopPropagation();gdOpenDispatch('${order.id}')">派单</button></div>`;
  }

  if (hasHandler && ['已接单', '已驳回'].includes(order.status) && gdCanOperate(order, 'deliver')) {
    return `<div class="gd-wo-act-group"><button class="gd-btn gd-btn-primary gd-btn-sm" onclick="event.stopPropagation();gdSubmitDelivery('${order.id}')">提交验收</button></div>`;
  }

  return `<span class="gd-wo-act-empty">—</span>`;
}

function gdDrawerLeftHtml(order) {
  const wsMeta = gdGetOrderWorkspaceMeta(order);
  const isClass2DataLikeOrder = order.woType === '二类工单'
    && ['数据', '试算'].includes(gdNormModule(order.serviceModule));
  const isClass3Order = order.woType === '三类工单';
  const showCompanyNameField = isClass2DataLikeOrder || isClass3Order;
  const shouldUseRelatedProjectTable = (order.woType === '二类工单' && ['报告', '函证'].includes(gdNormModule(order.serviceModule)));
  const jumpLabel = '快捷跳转';
  const jumpBtnText = gdIsWorkspaceDrawer() ? '工单文件夹' : '跳转作业区';
  const extraInfoItems = gdGetWorkOrderExtraInfoItems(order);
  const ops = [];
  if (gdCanAutoSplit(order))                          ops.push(`<button class="gd-op-btn gd-op-primary" onclick="gdAutoSplitClass1Order('${order.id}')" style="background:#7C3AED;border-color:#7C3AED;">自动拆单</button>`);
  if (gdCanOperateInDrawer(order, 'submit_pending'))  ops.push(`<button class="gd-op-btn gd-op-primary" onclick="woSubmitPending('${order.id}')">提交</button>`);
  if (gdCanOperateInDrawer(order, 'recall'))          ops.push(`<button class="gd-op-btn gd-op-outline" onclick="gdRecall('${order.id}')">撤回</button>`);
  if (gdCanOperateInDrawer(order, 'dispatch'))        ops.push(`<button class="gd-op-btn gd-op-primary" onclick="gdOpenDispatch('${order.id}')">派单</button>`);
  if (gdCanOperateInDrawer(order, 'deliver'))  ops.push(`<button class="gd-op-btn gd-op-success" onclick="gdSubmitDelivery('${order.id}')">提交验收</button>`);
  if (gdCanOperateInDrawer(order, 'accept'))   ops.push(`<button class="gd-op-btn gd-op-success" onclick="gdAccept('${order.id}')">验收通过</button>`);
  if (gdCanOperateInDrawer(order, 'reject'))   ops.push(`<button class="gd-op-btn gd-op-danger" onclick="gdOpenRejectDrawer('${order.id}','reject')">驳回</button>`);

  const opHint = {
    '待启用': '工单待启用，项目组可提交或批量合并后提交，交付可预派单',
    '待接单': '工单已提交，等待交付组织分派人员',
    '已接单': '交付人员已承接，可上传交付物并提交验收',
    '待验收': '交付物已提交，等待项目组验收',
    '已驳回': `工单已被驳回${order.rejectReason ? `：${order.rejectReason}` : ''}`,
    '验收通过': '工单已验收通过',
  }[order.status] || '';

  return `
    <div class="gd-drawer-head">
      <div class="gd-drawer-head-info">
        <div class="gd-drawer-id">${order.id}</div>
        <div class="gd-drawer-title">${order.title}</div>
      </div>
      <button class="gd-drawer-close" onclick="gdCloseDetail()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="14" height="14">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div class="gd-drawer-tags">
      ${gdStatusTag(order.status)}
      ${gdWoTypeTag(order.woType || order.type || '')}
      ${order.serviceModule ? `<span class="gd-tag gd-tag-blue">${order.serviceModule}</span>` : ''}
    </div>

    <div class="gd-drawer-section-title">基础信息</div>
    <div class="gd-dinfo-grid">
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">${jumpLabel}</span>
        <span class="gd-dinfo-val"><button class="gd-op-btn gd-op-primary" onclick="gdOpenWork('${order.id}')">${jumpBtnText}</button></span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">工单开始时间</span>
        <span class="gd-dinfo-val">${gdGetOrderStartTime(order) || '—'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">期望完成时间</span>
        <span class="gd-dinfo-val">${gdFormatDateOnly(order.expectedTime) || '—'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">提交人</span>
        <span class="gd-dinfo-val">${gdResolveUserDisplayName(order.submitter) || '—'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">项目组跟进人</span>
        <span class="gd-dinfo-val">${gdProjectFollowerName(order)}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">所属部门</span>
        <span class="gd-dinfo-val">${wsMeta.dept || '—'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">提交时间</span>
        <span class="gd-dinfo-val">${order.submitTime}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">服务方</span>
        <span class="gd-dinfo-val">${order.providerOrgName || order.provider || '—'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">处理人</span>
        <span class="gd-dinfo-val">${gdOrderAssigneeText(order) || '<span style="color:#9CA3AF;">待分派</span>'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">所属集团客户</span>
        <span class="gd-dinfo-val">${wsMeta.group || '—'}</span>
      </div>
      <div class="gd-dinfo-item gd-dinfo-full">
        <span class="gd-dinfo-label">服务模块</span>
        <span class="gd-dinfo-val">${order.serviceModule || '—'}</span>
      </div>
      ${showCompanyNameField ? `
      <div class="gd-dinfo-item gd-dinfo-full">
        <span class="gd-dinfo-label">公司名称</span>
        <span class="gd-dinfo-val">${order.company || '—'}</span>
      </div>` : ''}
      ${extraInfoItems.map(item => `
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">${item.label}</span>
        <span class="gd-dinfo-val">${item.html || item.text || '—'}</span>
      </div>`).join('')}
      ${order.woType === '一类工单' ? `
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">上一年度审计报告日</span>
        <span class="gd-dinfo-val">${order.priorAuditDate || '—'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">当年度年报计划报告日</span>
        <span class="gd-dinfo-val">${order.planReportDate || '—'}</span>
      </div>` : ''}
      <div class="gd-dinfo-item gd-dinfo-full">
        <span class="gd-dinfo-label">所属项目工作区</span>
        <span class="gd-dinfo-val">${order.workspace}</span>
      </div>
      ${order.desc ? `
      <div class="gd-dinfo-item gd-dinfo-full">
        <span class="gd-dinfo-label">备注</span>
        <span class="gd-dinfo-val" style="white-space:pre-wrap;">${order.desc}</span>
      </div>` : ''}
    </div>

    ${(!showCompanyNameField && shouldUseRelatedProjectTable) ? gdRenderRelatedProjectSection(order, 'table') : ''}
    ${(!showCompanyNameField && !shouldUseRelatedProjectTable && !isClass3Order) ? gdRenderRelatedProjectSection(order, 'grid') : ''}

    ${order.woType === '一类工单' ? gdClass1ModuleSectionHtml(order) : ''}

    <div class="gd-drawer-op-zone">
      ${opHint ? `<div class="gd-op-hint">${opHint}</div>` : ''}
      <div class="gd-op-btns">${ops.length ? ops.join('') : '<span style="color:#9CA3AF;font-size:0.82rem;">当前状态无可用操作</span>'}</div>
    </div>
  `;
}

function gdFileTableHtml(id, zone, files, canUpload, zoneLabel) {
  const rows = files.map(f => {
    const ver = f.ver || f.version || 1;
    return `
      <tr>
        <td>${f.name}</td>
        <td>${f.size || '—'}</td>
        <td><span class="gd-ver-badge">V${ver}</span></td>
        <td>${gdResolveUserDisplayName(f.uploader || f.submitter) || '—'}</td>
        <td style="color:#6B7280;">${f.time || f.submitTime || '—'}</td>
        <td>
          <div style="display:flex;gap:6px;justify-content:flex-end;">
            <button class="gd-op-btn gd-op-ghost gd-btn-xs" onclick="showNotification('正在下载…')">下载</button>
            ${canUpload ? `<button class="gd-op-btn gd-op-primary gd-btn-xs" onclick="showNotification('正在上传新版本…')">上传新版本</button>` : ''}
          </div>
        </td>
      </tr>`;
  }).join('');

  return `
    <div class="gd-tab-section-title">${zoneLabel}</div>
    <div class="gd-table-wrap">
      <table class="gd-table gd-file-table">
        <thead>
          <tr>
            <th>文件名</th><th>大小</th><th>版本</th><th>提交人</th><th>提交时间</th><th style="text-align:right;">操作</th>
          </tr>
        </thead>
        <tbody>
          ${rows || `<tr><td colspan="6" style="text-align:center;padding:28px 0;color:#9CA3AF;">暂无文件</td></tr>`}
        </tbody>
      </table>
    </div>
    ${canUpload ? `
      <div class="gd-upload-zone" style="margin-top:12px;" onclick="showNotification('${zoneLabel}上传功能即将上线')">
        <svg viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="2" width="20" height="20">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <span>点击上传文件</span>
      </div>` : ''}
  `;
}

function gdGetClass1ReqFiles(order, moduleKey) {
  const stored = GD_ORDER_FILES[order.id]?.reqModules?.[moduleKey];
  if (Array.isArray(stored) && stored.length) {
    return stored.map(file => ({
      ...file,
      ver: file.ver || file.version || 1,
    }));
  }

  const rawFiles = Array.isArray(order.moduleDetails?.[moduleKey]?.files)
    ? order.moduleDetails[moduleKey].files
    : [];

  return rawFiles
    .map(file => {
      if (typeof file === 'string') {
        return {
          name: file,
          size: '—',
          uploader: order.submitter || '—',
          time: order.submitTime || '—',
          ver: 1,
        };
      }
      if (file && typeof file === 'object') {
        return {
          ...file,
          ver: file.ver || file.version || 1,
        };
      }
      return null;
    })
    .filter(Boolean);
}

function gdRenderClass1ReqContent(order, canUpload) {
  const entries = gdGetClass1ModuleEntries(order);
  if (!entries.length) {
    return `<div style="color:#9CA3AF;font-size:0.82rem;">暂无可展示的模块上传区</div>`;
  }

  return `
    <div class="gd-c1-upload-list">
      ${entries.map(({ key }) => `
        <div class="gd-c1-upload-block">
          ${gdFileTableHtml(order.id, 'req', gdGetClass1ReqFiles(order, key), canUpload, `${key}模块上传区`)}
        </div>
      `).join('')}
    </div>
  `;
}

function gdFindOrderWorkspace(order) {
  if (typeof WORKSPACE_DATA === 'undefined' || !Array.isArray(WORKSPACE_DATA)) return null;
  const orderWorkspaceId = String(order?.workspaceId || '').trim();
  const orderWorkspaceName = String(order?.workspace || '').trim();
  return WORKSPACE_DATA.find(item => String(item.id || '').trim() === orderWorkspaceId)
    || WORKSPACE_DATA.find(item => String(item.name || '').trim() === orderWorkspaceName)
    || null;
}

function gdOrderSupportsLedgerSync(order) {
  if (!order) return false;
  if (order.woType === '三类工单') return true;
  if (order.woType !== '二类工单') return false;
  const serviceText = String(order.serviceModule || '');
  const moduleKey = gdNormModule(serviceText);
  return moduleKey === '数据' || moduleKey === '试算' || serviceText.includes('往来函证-制函');
}

function gdLedgerMonthTextToRank(value) {
  const match = String(value || '').trim().match(/^(\d{4})-(\d{2})$/);
  if (!match) return 0;
  return Number(match[1]) * 100 + Number(match[2]);
}

function gdResolveLedgerVendorName(ledger) {
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
      const files = VENDOR_LEDGER_FILES[vendorName] || [];
      if (files.some(f => f.name && String(ledger?.name || '').includes(vendorName))) {
        return vendorName;
      }
    }
  }
  return '—';
}

function gdResolveLedgerSnapshotSize(ledgerId, version) {
  const digits = String(ledgerId || '').replace(/\D/g, '');
  const base = Number(digits.slice(-2) || 12);
  const size = (base * 0.37 + (Number(version) || 1) * 0.28 + 1.2).toFixed(1);
  return `${size} MB`;
}

function gdPickLatestLedgerMapping(linkMap = {}) {
  return Object.values(linkMap || {})
    .filter(item => item && item.ledgerId)
    .sort((a, b) => {
      const periodDiff = gdLedgerMonthTextToRank(b.endPeriod || b.startPeriod) - gdLedgerMonthTextToRank(a.endPeriod || a.startPeriod);
      if (periodDiff) return periodDiff;
      const versionDiff = Number(b.version || 0) - Number(a.version || 0);
      if (versionDiff) return versionDiff;
      return String(b.ledgerId || '').localeCompare(String(a.ledgerId || ''));
    })[0] || null;
}

function gdResolveOrderLedgerCompanies(order) {
  const relatedCompanies = Array.isArray(order?.relatedProjectRows)
    ? order.relatedProjectRows.map(item => item.company)
    : [];
  return [...new Set(
    [...gdSplitMultiValueText(order?.company || ''), ...relatedCompanies]
      .map(item => String(item || '').trim())
      .filter(Boolean)
  )];
}

function gdNormalizeLedgerSnapshotRow(row, fallbackCompany = '') {
  if (!row || typeof row !== 'object') return null;
  const version = Number(row.version || row.ver || 1) || (row.unbound ? 0 : 1);
  const company = String(row.company || fallbackCompany || '').trim();
  const fileName = String(row.fileName || row.name || '').trim() || `${company || '主体公司'}账套文件`;
  return {
    company: company || '—',
    fileName,
    startPeriod: String(row.startPeriod || '').trim() || '—',
    endPeriod: String(row.endPeriod || '').trim() || '—',
    size: String(row.size || '').trim() || gdResolveLedgerSnapshotSize(row.ledgerId, version),
    vendor: String(row.vendor || '').trim() || '—',
    version,
    uploader: gdResolveUserDisplayName(row.uploader || row.submitter) || '—',
    ledgerId: String(row.ledgerId || '').trim(),
    ledgerType: String(row.ledgerType || '').trim(),
    unbound: !!row.unbound,
  };
}

function gdBuildLedgerSnapshotsFromWorkspace(order) {
  const ws = gdFindOrderWorkspace(order);
  const companies = gdResolveOrderLedgerCompanies(order);
  if (!ws || !companies.length) return [];
  const isClass3 = order.woType === '三类工单';
  return companies.map(company => {
    const selected = gdPickLatestLedgerMapping(ws.assocMap?.[company]);
    if (!selected) {
      /* 三类工单允许未绑定账套的主体展示占位行 */
      if (isClass3) {
        return gdNormalizeLedgerSnapshotRow({
          company, fileName: '—', ledgerId: '', startPeriod: '—', endPeriod: '—',
          size: '—', vendor: '—', version: 0, uploader: '—', ledgerType: '',
          unbound: true,
        }, company);
      }
      return null;
    }
    const ledger = typeof LEDGER_DATA !== 'undefined' && Array.isArray(LEDGER_DATA)
      ? LEDGER_DATA.find(item => item.id === selected.ledgerId)
      : null;
    return gdNormalizeLedgerSnapshotRow({
      company,
      fileName: String(ledger?.name || '').trim() || `${company}账套文件`,
      ledgerId: selected.ledgerId,
      startPeriod: selected.startPeriod,
      endPeriod: selected.endPeriod,
      size: gdResolveLedgerSnapshotSize(selected.ledgerId, selected.version),
      vendor: gdResolveLedgerVendorName(ledger),
      version: selected.version,
      uploader: ledger?.uploader || order.submitter,
      ledgerType: ledger?.type || '',
    }, company);
  }).filter(Boolean);
}

function gdResolveOrderLedgerSnapshots(order) {
  const stored = Array.isArray(GD_ORDER_FILES?.[order?.id]?.ledger) ? GD_ORDER_FILES[order.id].ledger : [];
  if (stored.length) {
    return stored.map(item => gdNormalizeLedgerSnapshotRow(item)).filter(Boolean);
  }
  const snapshots = Array.isArray(order?.ledgerSnapshots) ? order.ledgerSnapshots : [];
  if (snapshots.length) {
    return snapshots.map(item => gdNormalizeLedgerSnapshotRow(item)).filter(Boolean);
  }
  if (!gdOrderSupportsLedgerSync(order)) return [];
  /* 三类工单即使 useLedger 为 false 也可能有未绑定占位行需要展示 */
  if (order.woType === '三类工单') return gdBuildLedgerSnapshotsFromWorkspace(order);
  if (!order?.useLedger) return [];
  return gdBuildLedgerSnapshotsFromWorkspace(order);
}

function gdCanUpdateLedgerSnapshots(order) {
  if (!order) return false;
  if (order.status === '验收通过' || order.status === '已关闭') return false;
  return gdIsWorkspaceDrawer() && gdIsProjectRole();
}

function gdUpdateLedgerSnapshot(orderId, company) {
  const order = GD_WORK_ORDERS.find(o => o.id === orderId);
  if (!order) { showNotification('未找到工单'); return; }
  const ws = gdFindOrderWorkspace(order);
  if (!ws) { showNotification('未找到关联工作区，无法更新'); return; }
  const linkMap = ws.assocMap?.[company];
  if (!linkMap || Object.keys(linkMap).length === 0) {
    showNotification(`主体「${company}」在当前工作区中未关联账套，请先完成账套关联`);
    return;
  }
  const selected = gdPickLatestLedgerMapping(linkMap);
  if (!selected) { showNotification('未找到可用的账套映射'); return; }
  const ledger = typeof LEDGER_DATA !== 'undefined' && Array.isArray(LEDGER_DATA)
    ? LEDGER_DATA.find(item => item.id === selected.ledgerId)
    : null;
  const newRow = gdNormalizeLedgerSnapshotRow({
    company,
    fileName: String(ledger?.name || '').trim() || `${company}账套文件`,
    ledgerId: selected.ledgerId,
    startPeriod: selected.startPeriod,
    endPeriod: selected.endPeriod,
    size: gdResolveLedgerSnapshotSize(selected.ledgerId, selected.version),
    vendor: gdResolveLedgerVendorName(ledger),
    version: selected.version,
    uploader: ledger?.uploader || order.submitter,
    ledgerType: ledger?.type || '',
  }, company);
  if (!newRow) { showNotification('构建账套快照失败'); return; }

  if (!GD_ORDER_FILES[orderId]) GD_ORDER_FILES[orderId] = {};
  if (!Array.isArray(GD_ORDER_FILES[orderId].ledger)) GD_ORDER_FILES[orderId].ledger = [];
  const arr = GD_ORDER_FILES[orderId].ledger;
  const idx = arr.findIndex(item => String(item.company || '').trim() === company);
  if (idx >= 0) arr[idx] = newRow;
  else arr.push(newRow);

  if (Array.isArray(order.ledgerSnapshots)) {
    const oi = order.ledgerSnapshots.findIndex(item => String(item.company || '').trim() === company);
    if (oi >= 0) order.ledgerSnapshots[oi] = { ...newRow };
    else order.ledgerSnapshots.push({ ...newRow });
  }

  showNotification(`✓「${company}」账套已更新至最新版本 V${newRow.version}`);
  gdDrawerRenderTab('req', orderId);
}

function gdLedgerSnapshotTableHtml(order, rows = []) {
  const normalizedRows = (rows || []).map(item => gdNormalizeLedgerSnapshotRow(item)).filter(Boolean);
  const canUpdate = gdCanUpdateLedgerSnapshots(order);
  const note = canUpdate
    ? '以下为提交工单时同步的最新版本时点账套文件；若后续版本有更新，可在当前区域手动更新。'
    : '以下为提交工单时同步给服务方的最新版本时点账套文件。';
  const bodyHtml = normalizedRows.length
    ? normalizedRows.map(row => {
      const safeCompany = gdEscapeAttrText(row.company);
      const isUnbound = row.version === 0 || row.unbound;
      return `
      <tr${isUnbound ? ' style="color:#9CA3AF;"' : ''}>
        <td><div class="gd-ledger-company-cell" title="${safeCompany}">${safeCompany}</div></td>
        <td><div class="gd-ledger-file-cell" title="${gdEscapeAttrText(row.fileName)}">${isUnbound ? '—' : gdEscapeAttrText(row.fileName)}</div></td>
        <td>${isUnbound ? '—' : gdEscapeAttrText(row.startPeriod)}</td>
        <td>${isUnbound ? '—' : gdEscapeAttrText(row.endPeriod)}</td>
        <td>${isUnbound ? '—' : gdEscapeAttrText(row.size)}</td>
        <td>${isUnbound ? '—' : gdEscapeAttrText(row.vendor)}</td>
        <td>${isUnbound ? '<span style="color:#9CA3AF;">—</span>' : `<span class="gd-ver-badge">V${row.version}</span>`}</td>
        <td>${isUnbound ? '—' : gdEscapeAttrText(row.uploader)}</td>
        <td>
          <div class="gd-ledger-actions">
            ${isUnbound ? '' : `<button class="gd-op-btn gd-op-ghost gd-btn-xs" onclick="showNotification('正在打开账套…')">查账</button>`}
            ${isUnbound ? '' : `<button class="gd-op-btn gd-op-ghost gd-btn-xs" onclick="showNotification('正在下载账套快照…')">下载</button>`}
            ${canUpdate ? `<button class="gd-op-btn gd-op-primary gd-btn-xs" onclick="gdUpdateLedgerSnapshot('${order.id}',decodeURIComponent('${encodeURIComponent(row.company)}'))">更新版本</button>` : ''}
          </div>
        </td>
      </tr>`;
    }).join('')
    : `<tr><td colspan="9" style="text-align:center;padding:28px 0;color:#9CA3AF;">暂无已同步账套文件</td></tr>`;

  return `
    <div class="gd-tab-section-title">账套带入</div>
    <div class="gd-ledger-zone-note">${note}</div>
    <div class="gd-table-wrap gd-table-scrollable">
      <table class="gd-table gd-file-table gd-ledger-sync-table">
        <thead>
          <tr>
            <th>主体公司名称</th>
            <th>账套文件名</th>
            <th>起始账期</th>
            <th>截止账期</th>
            <th>大小</th>
            <th>供应商</th>
            <th>版本</th>
            <th>上传人</th>
            <th style="text-align:right;">操作</th>
          </tr>
        </thead>
        <tbody>${bodyHtml}</tbody>
      </table>
    </div>
  `;
}

function gdCanUploadReqFiles(order) {
  if (!order) return false;
  if (order.status === '验收通过' || order.status === '已关闭') return false;
  return gdIsWorkspaceDrawer() || gdIsProjectRole();
}

function gdRenderReqContent(id, order) {
  const canUpload = gdCanUploadReqFiles(order);
  if (order.woType === '一类工单') {
    return gdRenderClass1ReqContent(order, canUpload);
  }
  const files = (GD_ORDER_FILES[id]?.req
    || order.attachments?.map(n => ({ name: n, size: '—', uploader: order.submitter, time: order.submitTime, ver: 1 }))
    || []).map(f => ({ ...f, ver: f.ver || 1 }));
  const ledgerSnapshots = gdResolveOrderLedgerSnapshots(order);
  const showLedgerZone = ledgerSnapshots.length > 0
    || (gdOrderSupportsLedgerSync(order) && (order.useLedger || order.woType === '三类工单'));
  return [
    showLedgerZone ? gdLedgerSnapshotTableHtml(order, ledgerSnapshots) : '',
    gdFileTableHtml(id, 'req', files, canUpload, showLedgerZone ? '补充资料' : '需求方上传区'),
  ].filter(Boolean).join('');
}

function gdRenderSvcContent(id, order) {
  const files = (GD_ORDER_FILES[id]?.svc || []).map(f => ({ ...f, ver: f.ver || 1 }));
  const canUpload = gdIsDeliveryRole()
    && order.providerOrgId === GD_DEMO_CONTEXT.orgId
    && (gdOrderHasAssignee(order, GD_CURRENT_USER.name, GD_CURRENT_USER.id) || GD_CURRENT_USER.role === 'delivery_owner' || GD_CURRENT_USER.role === 'module_lead')
    && (order.status === '已接单' || order.status === '已驳回');
  return gdFileTableHtml(id, 'svc', files, canUpload, '服务方上传区');
}

function gdSubmitDelivery(id) {
  const order = GD_WORK_ORDERS.find(o => o.id === id);
  if (!order || !gdCanOperate(order, 'deliver')) return;
  if (!confirm(`确认提交验收「${order.title}」？\n提交后项目组将收到验收通知。`)) return;
  order.status = '待验收';
  gdAddLog(id, '提交验收', `${GD_CURRENT_USER.name} 提交验收，工单进入「待验收」`);
  showNotification(`✓ 工单 ${id} 已提交验收`);
  gdOpenDetail(id, 'svc');
  gdRefreshLists();
}

function gdAccept(id) {
  const order = GD_WORK_ORDERS.find(o => o.id === id);
  if (!order || !gdCanOperate(order, 'accept')) return;
  if (!confirm(`确认验收通过「${order.title}」？\n验收后工单将完成。`)) return;
  order.status = '验收通过';
  gdAddLog(id, '验收通过', `${GD_CURRENT_USER.name} 验收通过，工单完成`);
  showNotification(`✓ 工单 ${id} 已验收通过`);
  gdOpenDetail(id, 'svc');
  gdRefreshLists();
}

function gdConfirmRejectDrawer() {
  const reason = document.getElementById('gd-reject-reason2')?.value.trim();
  if (!reason) { showNotification('请填写驳回原因'); return; }
  const id = gdDrawerRejectId;
  const order = GD_WORK_ORDERS.find(o => o.id === id);
  if (!order) return;
  order.status = '已驳回';
  order.rejectReason = reason;
  order.rejectCount = (order.rejectCount || 0) + 1;
  gdAddLog(id, '驳回', `${GD_CURRENT_USER.name} 驳回工单：${reason}`);
  gdCloseRejectDrawer();
  showNotification(`✓ 工单 ${id} 已驳回`);
  gdOpenDetail(id, 'svc');
  gdRefreshLists();
}

function gdOpenDispatch(id) {
  gdDispatchMode = 'single';
  gdDispatchOrderIds = [id];
  gdDispatchSelectedUserIds = new Set();
  gdDispatchSearchKeyword = '';
  gdDispatchSearchComposing = false;
  gdDispatchCandidateSearchMap = {};
  gdState.selectedUserId = '';
  gdRenderDispatchSelector();
}

function gdOpenBatchDispatch() {
  if (!gdCanBatchDispatch()) return;
  gdDispatchMode = 'batch';
  gdDispatchOrderIds = [...gdState.selectedOrders];
  gdDispatchSelectedUserIds = new Set();
  gdDispatchSearchKeyword = '';
  gdDispatchSearchComposing = false;
  gdDispatchCandidateSearchMap = {};
  gdState.selectedUserId = '';
  gdRenderDispatchSelector();
}

function gdGetDispatchCandidates(module) {
  return gdGetCurrentOrgMembers().filter(m => {
    if (!['module_lead', 'delivery_staff', 'delivery_intern'].includes(m.role)) return false;
    if (!module) return true;
    return (m.serviceTags || []).includes(module) || m.moduleLead === module;
  });
}

function gdResetDispatchSelectorState() {
  gdDispatchOrderIds = [];
  gdDispatchMode = 'single';
  gdDispatchSelectedUserIds = new Set();
  gdDispatchSearchKeyword = '';
  gdDispatchSearchComposing = false;
  gdDispatchCandidateSearchMap = {};
  gdDispatchNote = '';
  gdState.selectedUserId = '';
}

function gdGetSelectedDispatchUserIds() {
  const ids = [...gdDispatchSelectedUserIds];
  if (ids.length) return ids;
  return gdState.selectedUserId ? [gdState.selectedUserId] : [];
}

function gdGetSelectedDispatchMembers(candidates) {
  return gdGetSelectedDispatchUserIds()
    .map(id => candidates.find(item => item.userId === id))
    .filter(Boolean);
}

function gdToggleDispatchCandidate(userId) {
  if (gdDispatchMode === 'batch') {
    if (gdDispatchSelectedUserIds.has(userId)) gdDispatchSelectedUserIds.delete(userId);
    else gdDispatchSelectedUserIds.add(userId);
  } else {
    gdDispatchSelectedUserIds = new Set([userId]);
    gdState.selectedUserId = userId;
  }
  gdRenderDispatchSelector();
}

function gdApplyDispatchCandidateFilter() {
  const list = document.getElementById('gd-dispatch-list');
  if (!list) return;

  const keyword = gdDispatchSearchKeyword.trim().toLowerCase();
  const selectedSet = new Set(gdGetSelectedDispatchUserIds());
  const rows = [...list.querySelectorAll('.gd-dispatch-person[data-user-id]')];
  let visibleCount = 0;

  rows.forEach(row => {
    const userId = row.dataset.userId || '';
    const text = gdDispatchCandidateSearchMap[userId] || '';
    const visible = !keyword || selectedSet.has(userId) || text.includes(keyword);
    row.style.display = visible ? '' : 'none';
    if (visible) visibleCount += 1;
  });

  const countEl = document.getElementById('gd-dispatch-count');
  if (countEl) countEl.textContent = keyword ? `匹配 ${visibleCount} 人` : `共 ${rows.length} 人`;

  const emptyEl = document.getElementById('gd-dispatch-empty');
  if (emptyEl) emptyEl.style.display = visibleCount ? 'none' : 'block';
}

function gdBindDispatchSearch() {
  const input = document.getElementById('gd-dispatch-search');
  if (!input) return;

  input.value = gdDispatchSearchKeyword;
  input.addEventListener('compositionstart', () => {
    gdDispatchSearchComposing = true;
  });
  input.addEventListener('compositionend', e => {
    gdDispatchSearchComposing = false;
    gdDispatchSearchKeyword = e.target.value;
    gdApplyDispatchCandidateFilter();
  });
  input.addEventListener('input', e => {
    gdDispatchSearchKeyword = e.target.value;
    if (gdDispatchSearchComposing || e.isComposing) return;
    gdApplyDispatchCandidateFilter();
  });

  gdApplyDispatchCandidateFilter();
}

function gdRenderDispatchSelector() {
  const modal = document.getElementById('gd-dispatch-modal');
  const body = document.getElementById('gd-dispatch-body');
  if (!modal || !body || !gdDispatchOrderIds.length) return;
  const orders = gdDispatchOrderIds.map(id => GD_WORK_ORDERS.find(o => o.id === id)).filter(Boolean);
  const module = gdOverviewTab === 'class1' ? '' : gdOverviewTab;
  const candidates = gdGetDispatchCandidates(module);
  const isBatch = gdDispatchMode === 'batch';
  const selectedIds = gdGetSelectedDispatchUserIds();
  const selectedMembers = gdGetSelectedDispatchMembers(candidates);

  gdDispatchCandidateSearchMap = {};
  candidates.forEach(c => {
    gdDispatchCandidateSearchMap[c.userId] = [
      c.name,
      c.dept,
      gdDeliveryRoleLabel(c.role),
      c.moduleLead,
      ...(c.serviceTags || []),
    ].filter(Boolean).join(' ').toLowerCase();
  });

  body.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:14px;">
      ${isBatch ? `
      <div class="gd-dispatch-tip">可勾选多人，批量派单后每个工单都会挂上全部已选处理人，共同交付。</div>
      <div class="gd-dispatch-selected">
        ${selectedMembers.length
          ? selectedMembers.map(m => `<span class="gd-dispatch-chip">${m.name}</span>`).join('')
          : `<span class="gd-empty-inline">尚未选择处理人</span>`}
      </div>` : ''}
      <div class="gd-dispatch-head">
        <div style="font-size:0.84rem;font-weight:600;color:#374151;">${isBatch ? '选择处理人（可多选）' : '选择处理人'}</div>
        <span class="gd-dispatch-meta" id="gd-dispatch-count">共 ${candidates.length} 人</span>
      </div>
      <label class="gd-dispatch-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="15" height="15" aria-hidden="true">
          <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input id="gd-dispatch-search" type="text" placeholder="搜索姓名、部门、角色、服务标签">
      </label>
      <div class="gd-dispatch-list" id="gd-dispatch-list">
        ${candidates.length ? candidates.map(c => `
          <label class="gd-dispatch-person ${selectedIds.includes(c.userId) ? 'selected' : ''}" data-user-id="${c.userId}" onclick="gdToggleDispatchCandidate('${c.userId}')">
            <div style="display:flex;align-items:center;gap:10px;min-width:0;flex:1;">
              <input type="${isBatch ? 'checkbox' : 'radio'}" name="gd-dp-radio" value="${c.userId}" ${selectedIds.includes(c.userId) ? 'checked' : ''} onclick="event.stopPropagation();gdToggleDispatchCandidate('${c.userId}')">
              <div class="gd-user-mini-avatar" style="background:${gdAvatarColor(c.name)};">${c.name[0]}</div>
              <div style="min-width:0;">
                <div style="font-size:0.84rem;font-weight:600;color:#111827;">${c.name}</div>
                <div style="font-size:0.76rem;color:#6B7280;line-height:1.5;">${gdDeliveryRoleLabel(c.role)} · ${c.dept || '—'} · 标签：${(c.serviceTags || []).join('、') || '—'}</div>
              </div>
            </div>
            ${c.moduleLead ? `<span class="gd-svcmod-tag">${c.moduleLead}组长</span>` : ''}
          </label>`).join('') : `<div class="gd-empty-inline">当前模块暂无可派交付人员</div>`}
        <div class="gd-empty-inline" id="gd-dispatch-empty" style="display:none;">未找到匹配成员，请换个关键词试试</div>
      </div>
      <div>
        <label style="display:block;font-size:0.82rem;font-weight:600;color:#374151;margin-bottom:6px;">备注说明</label>
        <textarea id="gd-dispatch-note" rows="3" style="width:100%;box-sizing:border-box;resize:vertical;border:1px solid #E5E7EB;border-radius:10px;padding:10px 12px;font-size:0.84rem;font-family:inherit;outline:none;line-height:1.5;" placeholder="请输入派单备注（可选）"></textarea>
      </div>
    </div>`;

  gdBindDispatchSearch();
  const noteEl = document.getElementById('gd-dispatch-note');
  if (noteEl) {
    noteEl.value = gdDispatchNote;
    noteEl.addEventListener('input', e => {
      gdDispatchNote = e.target.value;
    });
  }
  gdOpenBackdropModal(modal);
}

function gdConfirmDispatch() {
  const selectedIds = gdGetSelectedDispatchUserIds();
  if (!selectedIds.length || !gdDispatchOrderIds.length) { showNotification('请选择处理人'); return; }
  const module = gdOverviewTab === 'class1' ? '' : gdOverviewTab;
  const candidates = gdGetDispatchCandidates(module);
  const members = selectedIds
    .map(id => candidates.find(m => m.userId === id))
    .filter(Boolean);
  if (!members.length) { showNotification('未找到处理人'); return; }
  const note = gdDispatchNote.trim();
  const orderCount = gdDispatchOrderIds.length;

  gdDispatchOrderIds.forEach(id => {
    const order = GD_WORK_ORDERS.find(o => o.id === id);
    if (!order) return;
    const prevText = gdOrderAssigneeText(order);
    const nextText = members.map(member => member.name).join('、');
    gdSetOrderAssignees(order, members);
    if (order.status !== '待启用') order.status = '已接单';
    order.providerOrgId = GD_DEMO_CONTEXT.orgId;
    order.providerOrgName = gdGetCurrentDeliveryOrg().name;
    order.provider = order.providerOrgName;
    gdAddLog(
      id,
      '派单',
      prevText && prevText !== nextText
        ? `${GD_CURRENT_USER.name} 将工单处理人从 ${prevText} 调整为 ${nextText}${note ? `：${note}` : ''}`
        : `${GD_CURRENT_USER.name} 将工单派给 ${nextText}${note ? `：${note}` : ''}`
    );
  });

  const usedNames = members.map(member => member.name);

  gdState.selectedOrders.clear();
  gdCloseDispatch();
  showNotification(
    usedNames.length === 1
      ? `✓ 已派单给 ${usedNames[0]}`
      : `✓ 已为 ${orderCount} 个工单设置 ${usedNames.length} 位共同处理人`
  );
  gdRefreshLists();
}

const GD_SCHEDULE_MODULE_PALETTE = {
  一类工单: { bg: '#CCFBF1', text: '#0F766E', border: '#2DD4BF' },
  数据: { bg: '#DBEAFE', text: '#1D4ED8', border: '#60A5FA' },
  试算: { bg: '#EDE9FE', text: '#6D28D9', border: '#A78BFA' },
  报告: { bg: '#FCE7F3', text: '#BE185D', border: '#F472B6' },
  函证: { bg: '#FEF3C7', text: '#B45309', border: '#FBBF24' },
  底稿: { bg: '#DCFCE7', text: '#15803D', border: '#4ADE80' },
  其他: { bg: '#E5E7EB', text: '#374151', border: '#9CA3AF' },
};

const GD_SCHEDULE_MISC_PALETTE = {
  休假: { bg: '#E5E7EB', text: '#4B5563', border: '#9CA3AF' },
  出差: { bg: '#EDE9FE', text: '#7C3AED', border: '#A78BFA' },
  会议: { bg: '#DCFCE7', text: '#166534', border: '#4ADE80' },
  培训: { bg: '#FEF3C7', text: '#92400E', border: '#FBBF24' },
};

const GD_SCHEDULE_LEGEND_ORDER = ['一类工单', '数据', '试算', '底稿', '函证', '报告'];

function gdEscapeAttrText(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function gdEscapeJsText(text) {
  return String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'");
}

function gdScheduleDateFromKey(value) {
  const key = gdFormatDateOnly(value);
  const matched = key.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!matched) return new Date();
  return new Date(Number(matched[1]), Number(matched[2]) - 1, Number(matched[3]));
}

function gdScheduleBuildDateList(start, end) {
  const dates = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  while (cursor <= end) {
    dates.push(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function gdScheduleStartOfWeek(date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - start.getDay());
  return start;
}

function gdGetScheduleActiveOrgId() {
  return gdSelectedDeliveryOrgId || GD_DEMO_CONTEXT.orgId || GD_DELIVERY_ORGS[0]?.id || '';
}

function gdGetScheduleActiveOrg() {
  const orgId = gdGetScheduleActiveOrgId();
  return GD_DELIVERY_ORGS.find(org => org.id === orgId) || GD_DELIVERY_ORGS[0] || null;
}

function gdGetScheduleMembers(orgId = gdGetScheduleActiveOrgId()) {
  const roleOrder = { delivery_owner: 0, module_lead: 1, delivery_staff: 2, delivery_intern: 3 };
  return [...(GD_DELIVERY_ORG_MEMBERS[orgId] || [])]
    .filter(member => member.status !== 'left')
    .sort((a, b) => {
      const roleDiff = (roleOrder[a.role] ?? 99) - (roleOrder[b.role] ?? 99);
      if (roleDiff !== 0) return roleDiff;
      return String(a.name || '').localeCompare(String(b.name || ''), 'zh-CN');
    });
}

function gdGetScheduleBaseOrders(orgId = gdGetScheduleActiveOrgId()) {
  return GD_WORK_ORDERS.filter(order => order.providerOrgId === orgId);
}

function gdGetScheduleOrderItems(orgId = gdGetScheduleActiveOrgId()) {
  const members = gdGetScheduleMembers(orgId);
  const memberById = new Map(members.map(member => [String(member.userId || ''), member]));
  const memberByName = new Map(members.map(member => [String(member.name || ''), member]));

  return gdGetScheduleBaseOrders(orgId).flatMap(order => {
    const startDateRaw = gdGetOrderStartTime(order) || gdFormatDateOnly(order.submitTime);
    const endDateRaw = gdFormatDateOnly(order.expectedTime) || startDateRaw;
    if (!startDateRaw || !endDateRaw) return [];

    const startDate = startDateRaw <= endDateRaw ? startDateRaw : endDateRaw;
    const endDate = startDateRaw <= endDateRaw ? endDateRaw : startDateRaw;
    const moduleKey = gdNormModule(order.serviceModule) || '其他';
    const categoryKey = order.woType === '一类工单' ? '一类工单' : moduleKey;
    const wsMeta = gdGetOrderWorkspaceMeta(order);
    const deptKey = wsMeta.dept || order.workspaceDept || order.dept || '';

    const linkedMembers = new Map();
    gdOrderAssigneeIds(order).forEach((userId, index) => {
      const member = memberById.get(String(userId)) || memberByName.get(gdOrderAssigneeNames(order)[index] || '');
      if (!member) return;
      linkedMembers.set(member.userId || member.name, member);
    });
    if (!linkedMembers.size) {
      gdOrderAssigneeNames(order).forEach(name => {
        const member = memberByName.get(name);
        if (!member) return;
        linkedMembers.set(member.userId || member.name, member);
      });
    }

    return [...linkedMembers.values()].map(member => ({
      id: `sch-order-${order.id}-${member.userId || member.name}`,
      source: 'order',
      type: '工单',
      workOrderId: order.id,
      userId: member.userId,
      userName: member.name,
      title: order.title,
      moduleKey,
      categoryKey,
      deptKey,
      serviceModule: order.serviceModule || '—',
      woType: order.woType || '',
      status: order.status || '',
      startDate,
      endDate,
    }));
  });
}

function gdGetScheduleMiscItems(orgId = gdGetScheduleActiveOrgId()) {
  const memberIds = new Set(gdGetScheduleMembers(orgId).map(member => String(member.userId || '')));
  return (GD_SCHEDULE || [])
    .filter(item => item && item.type !== '工单' && memberIds.has(String(item.userId || '')))
    .map(item => ({
      ...item,
      id: item.id || `sch-misc-${item.userId}-${item.startDate}-${item.type}`,
      source: 'misc',
      moduleKey: item.type || '其他',
      startDate: gdFormatDateOnly(item.startDate),
      endDate: gdFormatDateOnly(item.endDate || item.startDate),
    }));
}

function gdGetScheduleAllItems(orgId = gdGetScheduleActiveOrgId()) {
  return [
    ...gdGetScheduleOrderItems(orgId),
    ...gdGetScheduleMiscItems(orgId),
  ];
}

function gdGetScheduleDefaultDate(orgId = gdGetScheduleActiveOrgId()) {
  const startCandidates = [];
  const fallbackCandidates = [];
  gdGetScheduleAllItems(orgId).forEach(item => {
    if (item.startDate) startCandidates.push(item.startDate);
    if (item.endDate) fallbackCandidates.push(item.endDate);
  });
  if (!startCandidates.length) {
    gdGetScheduleBaseOrders(orgId).forEach(order => {
      const start = gdGetOrderStartTime(order) || gdFormatDateOnly(order.submitTime);
      const end = gdFormatDateOnly(order.expectedTime);
      if (start) startCandidates.push(start);
      if (end) fallbackCandidates.push(end);
    });
  }
  const candidates = startCandidates.length ? startCandidates : fallbackCandidates;
  if (!candidates.length) return gdScheduleDateFromKey('2026-03-24');
  return gdScheduleDateFromKey([...candidates].sort().at(-1));
}

function gdEnsureScheduleState(orgId = gdGetScheduleActiveOrgId()) {
  if (!(gdState.scheduleDate instanceof Date) || Number.isNaN(gdState.scheduleDate.getTime())) {
    gdState.scheduleDate = gdGetScheduleDefaultDate(orgId);
  }
  if (!gdState.scheduleTimeMode) gdState.scheduleTimeMode = 'week';
  if (typeof gdState.scheduleCustomPickerOpen !== 'boolean') gdState.scheduleCustomPickerOpen = false;
  if (!Array.isArray(gdState.scheduleDeptFilters)) gdState.scheduleDeptFilters = [];
  if (!Array.isArray(gdState.schedulePoolFilters)) gdState.schedulePoolFilters = [];
  if (typeof gdState.scheduleFilterMenu !== 'string') gdState.scheduleFilterMenu = '';
  if (!(gdState.scheduleCustomPickerMonth instanceof Date) || Number.isNaN(gdState.scheduleCustomPickerMonth?.getTime?.())) {
    gdState.scheduleCustomPickerMonth = gdScheduleMonthStart(gdState.scheduleDate);
  }

  const orgChanged = gdState.scheduleOrgId !== orgId;
  if (orgChanged) {
    gdState.scheduleDate = gdGetScheduleDefaultDate(orgId);
    const customStart = new Date(gdState.scheduleDate);
    customStart.setDate(customStart.getDate() - 6);
    const customEnd = new Date(gdState.scheduleDate);
    customEnd.setDate(customEnd.getDate() + 6);
    gdState.scheduleCustomStart = gdFmtDate(customStart);
    gdState.scheduleCustomEnd = gdFmtDate(customEnd);
    gdState.scheduleOrgId = orgId;
    gdState.scheduleCustomPickerOpen = false;
    gdState.scheduleCustomPickerMonth = gdScheduleMonthStart(customStart);
    gdState.scheduleFilterMenu = '';
  }

  if (!gdState.scheduleCustomStart || !gdState.scheduleCustomEnd) {
    const customStart = new Date(gdState.scheduleDate);
    customStart.setDate(customStart.getDate() - 6);
    const customEnd = new Date(gdState.scheduleDate);
    customEnd.setDate(customEnd.getDate() + 6);
    gdState.scheduleCustomStart = gdFmtDate(customStart);
    gdState.scheduleCustomEnd = gdFmtDate(customEnd);
  }
  if (typeof gdState.scheduleCustomDraftStart !== 'string') gdState.scheduleCustomDraftStart = gdState.scheduleCustomStart || '';
  if (typeof gdState.scheduleCustomDraftEnd !== 'string') gdState.scheduleCustomDraftEnd = gdState.scheduleCustomEnd || '';
  const deptOptions = gdGetScheduleDeptOptions(orgId);
  gdState.scheduleDeptFilters = gdState.scheduleDeptFilters.filter(item => deptOptions.includes(item));
  gdState.schedulePoolFilters = gdState.schedulePoolFilters.filter(item => GD_SCHEDULE_LEGEND_ORDER.includes(item));
  if (gdState.scheduleFilterMenu && !['dept', 'pool'].includes(gdState.scheduleFilterMenu)) gdState.scheduleFilterMenu = '';
}

function gdScheduleMonthStart(dateLike) {
  const date = dateLike instanceof Date ? new Date(dateLike) : gdScheduleDateFromKey(dateLike);
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function gdScheduleAddMonths(dateLike, offset) {
  const date = gdScheduleMonthStart(dateLike);
  date.setMonth(date.getMonth() + offset);
  return gdScheduleMonthStart(date);
}

function gdSyncScheduleCustomDraft() {
  gdEnsureScheduleState(gdGetScheduleActiveOrgId());
  gdState.scheduleCustomDraftStart = gdState.scheduleCustomStart || '';
  gdState.scheduleCustomDraftEnd = gdState.scheduleCustomEnd || '';
  gdState.scheduleCustomPickerMonth = gdScheduleMonthStart(
    gdState.scheduleCustomDraftStart || gdState.scheduleCustomStart || gdFmtDate(gdState.scheduleDate)
  );
}

function gdGetScheduleCustomRangeText(useDraft = false) {
  const start = useDraft ? (gdState.scheduleCustomDraftStart || '') : (gdState.scheduleCustomStart || '');
  const end = useDraft ? (gdState.scheduleCustomDraftEnd || '') : (gdState.scheduleCustomEnd || '');
  if (!start || !end) return start || '选择时间段';
  return `${start} 至 ${end}`;
}

function gdGetScheduleDraftRangeHint() {
  const start = gdState.scheduleCustomDraftStart || '';
  const end = gdState.scheduleCustomDraftEnd || '';
  if (!start) return '请选择开始日期';
  if (!end) return `开始于 ${start}，请继续选择结束日期`;
  return `${start} 至 ${end}`;
}

function gdScheduleGetMonthGrid(monthDate) {
  const monthStart = gdScheduleMonthStart(monthDate);
  const gridStart = gdScheduleStartOfWeek(monthStart);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
}

function gdShiftSchedulePickerMonth(offset) {
  gdEnsureScheduleState(gdGetScheduleActiveOrgId());
  gdState.scheduleCustomPickerMonth = gdScheduleAddMonths(gdState.scheduleCustomPickerMonth, offset);
  gdRenderSchedule();
}

function gdGetSchedulePickerYearOptions() {
  const currentYear = new Date().getFullYear();
  const pickerYear = gdScheduleMonthStart(gdState.scheduleCustomPickerMonth || gdState.scheduleDate).getFullYear();
  const startYear = Math.min(currentYear - 10, pickerYear - 10);
  const endYear = Math.max(currentYear + 10, pickerYear + 10);
  return Array.from({ length: endYear - startYear + 1 }, (_, index) => startYear + index);
}

function gdSetSchedulePickerYear(year) {
  const month = gdScheduleMonthStart(gdState.scheduleCustomPickerMonth || gdState.scheduleDate).getMonth();
  gdState.scheduleCustomPickerMonth = new Date(Number(year), month, 1);
  gdRenderSchedule();
}

function gdSetSchedulePickerMonth(month) {
  const year = gdScheduleMonthStart(gdState.scheduleCustomPickerMonth || gdState.scheduleDate).getFullYear();
  gdState.scheduleCustomPickerMonth = new Date(year, Number(month) - 1, 1);
  gdRenderSchedule();
}

function gdScheduleSelectDraftDate(dateKey) {
  gdEnsureScheduleState(gdGetScheduleActiveOrgId());
  const start = gdState.scheduleCustomDraftStart || '';
  const end = gdState.scheduleCustomDraftEnd || '';
  if (!start || (start && end)) {
    gdState.scheduleCustomDraftStart = dateKey;
    gdState.scheduleCustomDraftEnd = '';
  } else if (dateKey < start) {
    gdState.scheduleCustomDraftStart = dateKey;
    gdState.scheduleCustomDraftEnd = start;
  } else {
    gdState.scheduleCustomDraftEnd = dateKey;
  }
  gdRenderSchedule();
}

function gdRenderSchedulePickerMonth(monthDate) {
  const monthStart = gdScheduleMonthStart(monthDate);
  const cells = gdScheduleGetMonthGrid(monthStart);
  const today = gdFmtDate(new Date());
  const start = gdState.scheduleCustomDraftStart || '';
  const end = gdState.scheduleCustomDraftEnd || '';
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
          const key = gdFmtDate(date);
          const outside = date.getMonth() !== monthStart.getMonth();
          const isStart = key === start;
          const isEnd = key === end;
          const inRange = rangeStart && rangeEnd && key >= rangeStart && key <= rangeEnd;
          const isToday = key === today;
          return `<button
            class="gd-schedule-cal-day${outside ? ' outside' : ''}${isToday ? ' is-today' : ''}${inRange ? ' in-range' : ''}${isStart ? ' is-start' : ''}${isEnd ? ' is-end' : ''}"
            onclick="gdScheduleSelectDraftDate('${key}')"
            title="${key}">
            <span>${date.getDate()}</span>
          </button>`;
        }).join('')}
      </div>
    </div>`;
}

function gdGetScheduleRange() {
  const orgId = gdGetScheduleActiveOrgId();
  gdEnsureScheduleState(orgId);
  const mode = gdState.scheduleTimeMode || 'week';
  const anchor = gdScheduleDateFromKey(gdFmtDate(gdState.scheduleDate));
  let start;
  let end;

  if (mode === 'day') {
    start = anchor;
    end = new Date(anchor);
  } else if (mode === 'month') {
    start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  } else if (mode === 'custom') {
    start = gdScheduleDateFromKey(gdState.scheduleCustomStart);
    end = gdScheduleDateFromKey(gdState.scheduleCustomEnd);
    if (end < start) {
      const tmp = start;
      start = end;
      end = tmp;
    }
  } else {
    start = gdScheduleStartOfWeek(anchor);
    end = new Date(start);
    end.setDate(end.getDate() + 6);
  }

  const dates = gdScheduleBuildDateList(start, end);
  let label = `${gdFmtDate(start)} 至 ${gdFmtDate(end)}`;
  if (mode === 'day') label = gdFmtDate(start);
  if (mode === 'month') label = `${start.getFullYear()}年${start.getMonth() + 1}月`;

  return {
    mode,
    start,
    end,
    dates,
    label,
    startKey: gdFmtDate(start),
    endKey: gdFmtDate(end),
  };
}

function gdGetScheduleDeptOptions(orgId = gdGetScheduleActiveOrgId()) {
  return [...new Set(
    gdGetScheduleBaseOrders(orgId)
      .map(order => gdGetOrderWorkspaceMeta(order).dept || order.workspaceDept || order.dept || '')
      .map(item => String(item || '').trim())
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

function gdGetSchedulePoolOptions() {
  return [...GD_SCHEDULE_LEGEND_ORDER];
}

function gdGetScheduleFilterSummary(values, fallback = '全部') {
  if (!values.length) return fallback;
  if (values.length <= 2) return values.join('、');
  return `已选 ${values.length} 项`;
}

function gdToggleScheduleFilterMenu(key) {
  gdEnsureScheduleState(gdGetScheduleActiveOrgId());
  gdState.scheduleCustomPickerOpen = false;
  gdState.scheduleFilterMenu = gdState.scheduleFilterMenu === key ? '' : key;
  gdRenderSchedule();
}

function gdToggleScheduleFilterValue(kind, value) {
  gdEnsureScheduleState(gdGetScheduleActiveOrgId());
  const stateKey = kind === 'dept' ? 'scheduleDeptFilters' : 'schedulePoolFilters';
  const nextValues = new Set(gdState[stateKey] || []);
  if (nextValues.has(value)) nextValues.delete(value);
  else nextValues.add(value);
  gdState[stateKey] = [...nextValues];
  gdRenderSchedule();
}

function gdResetScheduleFilters() {
  gdEnsureScheduleState(gdGetScheduleActiveOrgId());
  gdState.scheduleDeptFilters = [];
  gdState.schedulePoolFilters = [];
  gdState.scheduleFilterMenu = '';
  gdRenderSchedule();
}

function gdScheduleItemMatchesFilters(item) {
  if (!item || item.source !== 'order') return true;
  const deptFilters = gdState.scheduleDeptFilters || [];
  const poolFilters = gdState.schedulePoolFilters || [];
  const poolKey = item.categoryKey || item.moduleKey || '';
  if (deptFilters.length && !deptFilters.includes(item.deptKey || '')) return false;
  if (poolFilters.length && !poolFilters.includes(poolKey)) return false;
  return true;
}

function gdGetScheduleOrderPoolLabel(item) {
  if (!item || item.source !== 'order') return item?.type || '';
  return item.categoryKey || item.moduleKey || '其他';
}

function gdGetScheduleOrderMetaLabel(item) {
  if (!item || item.source !== 'order') return item?.type || '';
  return item.woType === '一类工单'
    ? '一类工单'
    : (item.serviceModule || item.moduleKey || '—');
}

function gdGetScheduleContinuationLabel(item) {
  if (!item || item.source !== 'order') return item?.type || '';
  return item.woType === '一类工单'
    ? '一类工单'
    : (item.moduleKey || item.serviceModule || '工单');
}

function gdRenderScheduleFilterDropdown(kind, label, options) {
  const selected = kind === 'dept'
    ? (gdState.scheduleDeptFilters || [])
    : (gdState.schedulePoolFilters || []);
  const isOpen = gdState.scheduleFilterMenu === kind;
  const summary = gdGetScheduleFilterSummary(selected);
  const title = selected.length ? `${label}：${selected.join('、')}` : `${label}：全部`;

  return `
    <div class="gd-schedule-filter-dropdown">
      <button
        class="gd-schedule-filter-trigger${selected.length ? ' active' : ''}${isOpen ? ' open' : ''}"
        onclick="gdToggleScheduleFilterMenu('${kind}')"
        title="${gdEscapeAttrText(title)}">
        <div class="gd-schedule-filter-text">
          <span class="gd-schedule-filter-name">${label}</span>
          <span class="gd-schedule-filter-value">${summary}</span>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" aria-hidden="true">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      ${isOpen ? `
        <div class="gd-schedule-filter-panel">
          ${options.length ? options.map(option => `
            <label class="gd-schedule-filter-option">
              <input
                type="checkbox"
                ${selected.includes(option) ? 'checked' : ''}
                onchange="gdToggleScheduleFilterValue('${kind}','${gdEscapeJsText(option)}')">
              <span>${option}</span>
            </label>
          `).join('') : '<div class="gd-schedule-filter-empty">暂无可筛选项</div>'}
        </div>
      ` : ''}
    </div>`;
}

let gdScheduleOutsideCloseBound = false;

function gdBindScheduleOutsideClose() {
  if (gdScheduleOutsideCloseBound) return;
  gdScheduleOutsideCloseBound = true;
  document.addEventListener('click', e => {
    if (gdState.currentTab !== 'schedule') return;
    const target = e.target;
    if (!(target instanceof Element)) return;
    const clickedFilter = target.closest('.gd-schedule-filter-dropdown');
    const clickedPicker = target.closest('.gd-schedule-custom-wrap');
    let shouldRerender = false;
    if (!clickedFilter && gdState.scheduleFilterMenu) {
      gdState.scheduleFilterMenu = '';
      shouldRerender = true;
    }
    if (!clickedPicker && gdState.scheduleCustomPickerOpen) {
      gdState.scheduleCustomPickerOpen = false;
      shouldRerender = true;
    }
    if (shouldRerender) gdRenderSchedule();
  });
}

function gdSetScheduleOrg(orgId) {
  if (!orgId) return;
  gdSelectedDeliveryOrgId = orgId;
  GD_DEMO_CONTEXT.orgId = orgId;
  gdApplyDemoContext();
  gdState.scheduleOrgId = '';
  gdRefreshLists();
}

function gdToggleScheduleCustomPicker(force) {
  gdEnsureScheduleState(gdGetScheduleActiveOrgId());
  const nextOpen = typeof force === 'boolean'
    ? force
    : !gdState.scheduleCustomPickerOpen;
  gdState.scheduleCustomPickerOpen = nextOpen;
  if (nextOpen) gdState.scheduleFilterMenu = '';
  if (nextOpen) gdSyncScheduleCustomDraft();
  gdRenderSchedule();
}

function gdSetScheduleTime(mode) {
  gdState.scheduleTimeMode = mode;
  gdState.scheduleCustomPickerOpen = mode === 'custom';
  gdState.scheduleFilterMenu = '';
  if (mode === 'custom') gdSyncScheduleCustomDraft();
  gdRenderSchedule();
}

function gdApplyScheduleCustomRange() {
  const start = gdState.scheduleCustomDraftStart || '';
  const end = gdState.scheduleCustomDraftEnd || '';
  if (!start || !end) {
    showNotification('请选择完整的自定义时间段');
    return;
  }
  if (end < start) {
    showNotification('结束日期不能早于开始日期');
    return;
  }
  gdState.scheduleTimeMode = 'custom';
  gdState.scheduleCustomStart = start;
  gdState.scheduleCustomEnd = end;
  gdState.scheduleDate = gdScheduleDateFromKey(start);
  gdState.scheduleCustomPickerOpen = false;
  gdState.scheduleFilterMenu = '';
  gdRenderSchedule();
}

function gdScheduleNav(dir) {
  const range = gdGetScheduleRange();
  const nextDate = new Date(gdState.scheduleDate);
  gdState.scheduleCustomPickerOpen = false;
  gdState.scheduleFilterMenu = '';
  if (range.mode === 'day') {
    nextDate.setDate(nextDate.getDate() + dir);
    gdState.scheduleDate = nextDate;
  } else if (range.mode === 'month') {
    nextDate.setMonth(nextDate.getMonth() + dir);
    gdState.scheduleDate = nextDate;
  } else if (range.mode === 'custom') {
    const span = Math.max(range.dates.length, 1);
    const nextStart = gdScheduleDateFromKey(gdState.scheduleCustomStart);
    const nextEnd = gdScheduleDateFromKey(gdState.scheduleCustomEnd);
    nextStart.setDate(nextStart.getDate() + dir * span);
    nextEnd.setDate(nextEnd.getDate() + dir * span);
    gdState.scheduleCustomStart = gdFmtDate(nextStart);
    gdState.scheduleCustomEnd = gdFmtDate(nextEnd);
    gdState.scheduleDate = gdScheduleDateFromKey(gdState.scheduleCustomStart);
  } else {
    nextDate.setDate(nextDate.getDate() + dir * 7);
    gdState.scheduleDate = nextDate;
  }
  gdRenderSchedule();
}

function gdGetScheduleItemPalette(item) {
  if (item.source === 'order') return GD_SCHEDULE_MODULE_PALETTE[item.categoryKey || item.moduleKey] || GD_SCHEDULE_MODULE_PALETTE.其他;
  return GD_SCHEDULE_MISC_PALETTE[item.type] || GD_SCHEDULE_MODULE_PALETTE.其他;
}

function gdScheduleItemsForMember(items, member, range) {
  return items
    .filter(item => String(item.userId || '') === String(member.userId || ''))
    .filter(item => item.startDate <= range.endKey && item.endDate >= range.startKey)
    .sort((a, b) => {
      if (a.startDate !== b.startDate) return a.startDate.localeCompare(b.startDate);
      return String(a.title || '').localeCompare(String(b.title || ''), 'zh-CN');
    });
}

function gdOpenScheduleItem(workOrderId) {
  if (!workOrderId) return;
  gdOpenDetail(workOrderId, 'logs', 'center');
}

function gdRenderScheduleLegend(items) {
  return GD_SCHEDULE_LEGEND_ORDER.map(label => `
    <div class="gd-legend-item">
      <div class="gd-legend-dot" style="background:${GD_SCHEDULE_MODULE_PALETTE[label].bg};border-color:${GD_SCHEDULE_MODULE_PALETTE[label].border};"></div>
      <span>${label}</span>
    </div>`).join('');
}

function gdRenderSchedule() {
  const pane = document.getElementById('gd-pane-schedule');
  if (!pane) return;
  gdBindScheduleOutsideClose();

  const org = gdGetScheduleActiveOrg();
  const orgId = org?.id || gdGetScheduleActiveOrgId();
  gdEnsureScheduleState(orgId);

  const range = gdGetScheduleRange();
  const members = gdGetScheduleMembers(orgId);
  const allItems = gdGetScheduleAllItems(orgId);
  const deptOptions = gdGetScheduleDeptOptions(orgId);
  const poolOptions = gdGetSchedulePoolOptions();
  const visibleItems = allItems
    .filter(item => item.startDate <= range.endKey && item.endDate >= range.startKey)
    .filter(item => gdScheduleItemMatchesFilters(item));
  const pickerMonth = gdScheduleMonthStart(gdState.scheduleCustomPickerMonth || gdState.scheduleDate);
  const pickerYearOptions = gdGetSchedulePickerYearOptions();
  const hasActiveFilters = (gdState.scheduleDeptFilters || []).length || (gdState.schedulePoolFilters || []).length;
  const visibleOrderCount = new Set(
    visibleItems
      .filter(item => item.source === 'order' && item.workOrderId)
      .map(item => item.workOrderId)
  ).size;
  const TODAY_KEY = gdFmtDate(new Date());
  const WEEKDAY_ZH = ['日', '一', '二', '三', '四', '五', '六'];

  pane.innerHTML = `
    <div class="gd-schedule-topbar">
      <div>
        <div class="gd-schedule-title">人员排期</div>
        <div class="gd-schedule-sub">默认展示当前所选交付组织的成员排期，工单块会根据开始时间与期望完成时间自动生成。</div>
      </div>
      <div class="gd-schedule-summary">
        <label class="gd-schedule-org-field">
          <span>交付组织</span>
          <select class="gd-filter-input gd-schedule-org-select" onchange="gdSetScheduleOrg(this.value)">
            ${GD_DELIVERY_ORGS.map(item => `<option value="${item.id}" ${item.id === orgId ? 'selected' : ''}>${item.name}</option>`).join('')}
          </select>
        </label>
        <div class="gd-schedule-stat-card">
          <strong>${members.length}</strong>
          <span>成员</span>
        </div>
        <div class="gd-schedule-stat-card">
          <strong>${visibleOrderCount}</strong>
          <span>当前范围工单</span>
        </div>
      </div>
    </div>

    <div class="gd-schedule-controls">
      <div class="gd-schedule-left">
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="gd-ctrl-label">时间：</span>
          <div class="gd-ctrl-group">
            <button class="gd-ctrl-btn ${gdState.scheduleTimeMode === 'day' ? 'active' : ''}" onclick="gdSetScheduleTime('day')">日</button>
            <button class="gd-ctrl-btn ${gdState.scheduleTimeMode === 'week' ? 'active' : ''}" onclick="gdSetScheduleTime('week')">周</button>
            <button class="gd-ctrl-btn ${gdState.scheduleTimeMode === 'month' ? 'active' : ''}" onclick="gdSetScheduleTime('month')">月</button>
            <button class="gd-ctrl-btn ${gdState.scheduleTimeMode === 'custom' ? 'active' : ''}" onclick="gdSetScheduleTime('custom')">自定义</button>
          </div>
        </div>
        <div class="gd-schedule-nav">
          <button class="gd-nav-arrow" onclick="gdScheduleNav(-1)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="gd-schedule-period">
            <svg viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" width="15" height="15"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>${range.label}</span>
          </div>
          <button class="gd-nav-arrow" onclick="gdScheduleNav(1)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
      <div class="gd-schedule-filterbar">
        <div class="gd-schedule-filter-row">
          ${gdRenderScheduleFilterDropdown('dept', '工单所属部门', deptOptions)}
          ${gdRenderScheduleFilterDropdown('pool', '工单池', poolOptions)}
        </div>
        <button class="gd-btn gd-btn-ghost gd-btn-sm" onclick="gdResetScheduleFilters()" ${hasActiveFilters ? '' : 'disabled'}>恢复默认</button>
      </div>
      <div class="gd-schedule-custom-wrap">
        <button class="gd-schedule-range-input ${gdState.scheduleTimeMode === 'custom' ? 'active' : ''}" onclick="gdToggleScheduleCustomPicker()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>${gdGetScheduleCustomRangeText(gdState.scheduleCustomPickerOpen)}</span>
        </button>
        ${gdState.scheduleCustomPickerOpen ? `
          <div class="gd-schedule-picker-panel">
            <div class="gd-schedule-picker-head">
              <button class="gd-nav-arrow" onclick="gdShiftSchedulePickerMonth(-1)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <div class="gd-schedule-picker-summary">
                <div class="gd-schedule-picker-label">选择时间段</div>
                <div class="gd-schedule-picker-value">${gdGetScheduleDraftRangeHint()}</div>
                <div class="gd-schedule-picker-jump">
                  <select class="gd-filter-input gd-schedule-picker-select" onchange="gdSetSchedulePickerYear(this.value)">
                    ${pickerYearOptions.map(year => `<option value="${year}" ${year === pickerMonth.getFullYear() ? 'selected' : ''}>${year} 年</option>`).join('')}
                  </select>
                  <select class="gd-filter-input gd-schedule-picker-select" onchange="gdSetSchedulePickerMonth(this.value)">
                    ${Array.from({ length: 12 }, (_, index) => index + 1).map(month => `<option value="${month}" ${month === pickerMonth.getMonth() + 1 ? 'selected' : ''}>${month} 月</option>`).join('')}
                  </select>
                </div>
              </div>
              <button class="gd-nav-arrow" onclick="gdShiftSchedulePickerMonth(1)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
            <div class="gd-schedule-picker-calendars">
              ${gdRenderSchedulePickerMonth(pickerMonth)}
              ${gdRenderSchedulePickerMonth(gdScheduleAddMonths(pickerMonth, 1))}
            </div>
            <div class="gd-schedule-picker-actions">
              <button class="gd-btn gd-btn-ghost gd-btn-sm" onclick="gdToggleScheduleCustomPicker(false)">取消</button>
              <button class="gd-btn gd-btn-primary gd-btn-sm" onclick="gdApplyScheduleCustomRange()" ${gdState.scheduleCustomDraftStart && gdState.scheduleCustomDraftEnd ? '' : 'disabled'}>确定</button>
            </div>
          </div>` : ''}
      </div>
    </div>

    <div class="gd-schedule-table-wrap">
      ${members.length ? `
      <table class="gd-schedule-table gd-schedule-table-v2">
        <thead>
          <tr>
            <th style="text-align:left;padding-left:14px;">人员</th>
            ${range.dates.map(date => {
              const key = gdFmtDate(date);
              const isToday = key === TODAY_KEY;
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              return `<th class="${isToday ? 'today-hd' : isWeekend ? 'weekend-hd' : ''}">
                <div>周${WEEKDAY_ZH[date.getDay()]}</div>
                <div style="font-size:0.7rem;font-weight:400;">${date.getMonth() + 1}/${date.getDate()}</div>
              </th>`;
            }).join('')}
          </tr>
        </thead>
        <tbody>
          ${members.map(member => {
            const memberItems = gdScheduleItemsForMember(visibleItems, member, range);
            const workload = memberItems.filter(item => item.source === 'order').length;
            return `<tr>
              <td class="user-col">
                <div class="gd-schedule-user-name">${member.name}</div>
                <div class="gd-schedule-user-dept">${gdDeliveryRoleLabel(member.role)} · ${member.dept || '—'}</div>
                <div class="gd-schedule-tag-row">
                  ${(member.serviceTags || []).map(tag => `<span class="gd-schedule-tag">${tag}</span>`).join('') || '<span class="gd-schedule-tag gd-schedule-tag-muted">未配置标签</span>'}
                </div>
                <div class="gd-schedule-user-load">当前范围 ${workload} 个工单</div>
              </td>
              ${range.dates.map(date => {
                const key = gdFmtDate(date);
                const dayItems = memberItems.filter(item => item.startDate <= key && item.endDate >= key);
                return `<td class="day-col${key === TODAY_KEY ? ' today-col' : ''}">
                  <div class="gd-schedule-cell">
                    ${dayItems.length ? dayItems.map(item => {
                      const isStart = key === item.startDate;
                      const palette = gdGetScheduleItemPalette(item);
                      const title = item.source === 'order'
                        ? `${item.title}\n工单池：${gdGetScheduleOrderPoolLabel(item)}\n服务模块：${item.serviceModule}\n${item.startDate} 至 ${item.endDate}`
                        : `${item.title}\n${item.type}\n${item.startDate} 至 ${item.endDate}`;
                      const clickAttr = item.workOrderId ? ` onclick="event.stopPropagation();gdOpenScheduleItem('${item.workOrderId}')"` : '';
                      const metaText = item.source === 'order' ? `至 ${item.endDate}` : item.type;
                      const continuationText = item.source === 'order' ? gdGetScheduleContinuationLabel(item) : item.type;
                      return `<div class="gd-sch-item ${item.source === 'order' ? 'gd-sch-order' : 'gd-sch-misc'} ${!isStart ? 'continuation' : ''}"
                        style="--sch-bg:${palette.bg};--sch-text:${palette.text};--sch-border:${palette.border};"
                        title="${gdEscapeAttrText(title)}"${clickAttr}>
                        ${isStart ? `
                          <div class="sch-title">${item.title}</div>
                          <div class="sch-meta">
                            <span>${item.source === 'order' ? gdGetScheduleOrderMetaLabel(item) : item.type}</span>
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
        <div>当前交付组织暂无在岗成员</div>
      </div>`}
    </div>

    <div class="gd-legend">
      ${gdRenderScheduleLegend(visibleItems)}
    </div>`;
}

function gdDeliveryRoleLabel(role) {
  return gdGetDeliveryRoleById(role, gdSelectedDeliveryOrgId)?.name
    || gdGetDeliveryRoleById(role, GD_DEMO_CONTEXT.orgId)?.name
    || role;
}

function gdRenderWorkOrders() {
  const pane = document.getElementById('gd-pane-workorders');
  if (!pane) return;

  const rows = gdGetVisibleOrders();
  const PAGE_SIZE = 10;
  const total = rows.length;
  const page = gdState.woPage;
  const start = (page - 1) * PAGE_SIZE;
  const pageRows = rows.slice(start, start + PAGE_SIZE);
  gdVisiblePageOrderIds = pageRows.map(o => o.id);
  const allChecked = pageRows.length > 0 && pageRows.every(o => gdState.selectedOrders.has(o.id));
  const canSelect = true;

  pane.innerHTML = `
    <div class="gd-overview-head">
      <div class="gd-subtab-bar gd-overview-tabs">
        ${gdGetOverviewTabs().map(t => `<button class="gd-subtab ${gdOverviewTab===t.key?'active':''}" onclick="gdSwitchOverviewTab('${t.key}')">${t.label}</button>`).join('')}
      </div>
      <div class="gd-overview-context">
        <div class="gd-context-item">
          <span class="gd-context-label">演示身份</span>
          <select class="gd-filter-input gd-context-select" onchange="gdSwitchDemoRole(this.value)">
            ${GD_DEMO_ROLE_OPTIONS.map(r => `<option value="${r.key}" ${GD_DEMO_CONTEXT.role===r.key?'selected':''}>${r.label}</option>`).join('')}
          </select>
        </div>
        <div class="gd-context-item">
          <span class="gd-context-label">交付组织</span>
          <select class="gd-filter-input gd-context-select" onchange="gdSwitchDemoOrg(this.value)">
            ${GD_DELIVERY_ORGS.map(o => `<option value="${o.id}" ${GD_DEMO_CONTEXT.orgId===o.id?'selected':''}>${o.name}</option>`).join('')}
          </select>
        </div>
      </div>
    </div>

    ${gdRenderDemoJourney('compact')}

    <div class="gd-batch-bar" id="gd-batch-bar" style="display:${gdState.selectedOrders.size ? 'flex' : 'none'}">
      <span class="gd-batch-info">已选择 <strong>${gdState.selectedOrders.size}</strong> 个工单</span>
      <div class="gd-batch-actions">
        ${gdCanBatchDispatch() ? '<button class="gd-btn gd-btn-primary gd-btn-sm" onclick="gdOpenBatchDispatch()">批量派单</button>' : ''}
      </div>
    </div>

    <div class="gd-table-wrap gd-table-scrollable">
      <table class="gd-table gd-wo-table">
        <thead>
          <tr>
            <th class="gd-col-check gd-wo-sticky-check">${canSelect ? `<input type="checkbox" id="gd-wo-check-all" ${allChecked?'checked':''} onchange="gdWoCheckAll(this)">` : ''}</th>
            <th class="gd-col-jump gd-wo-sticky-jump">快捷跳转</th>
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
            <th class="gd-col-follower">项目组跟进人</th>
            <th class="gd-col-time">提交时间</th>
            <th class="gd-col-start">工单开始时间</th>
            <th class="gd-col-expected">期望完成时间</th>
            <th class="gd-col-provider">服务方</th>
            <th class="gd-col-handler gd-wo-sticky-handler">处理人</th>
            <th class="gd-col-status gd-wo-sticky-status">状态</th>
            <th class="gd-col-action gd-wo-sticky-action">操作</th>
          </tr>
        </thead>
        <tbody>
          ${pageRows.length ? pageRows.map(o => {
            const wsMeta = gdGetOrderWorkspaceMeta(o);
            const startTime = gdGetOrderStartTime(o);
            return `
            <tr class="gd-wo-row-clickable" data-order-id="${o.id}">
              <td class="gd-col-check gd-wo-sticky-check">${canSelect ? `<input type="checkbox" class="gd-wo-row-check" value="${o.id}" ${gdState.selectedOrders.has(o.id)?'checked':''} onchange="gdWoCheckRow(this,'${o.id}')">` : ''}</td>
              <td class="gd-col-jump gd-wo-sticky-jump"><button class="gd-btn gd-btn-primary gd-btn-sm gd-wo-jump-btn" onclick="event.stopPropagation();gdOpenWork('${o.id}')">跳转作业区</button></td>
              <td class="gd-col-id gd-wo-open-cell" onclick="gdOpenDetail('${o.id}')"><span class="gd-wo-id-link">${o.id}</span></td>
              <td class="gd-col-title gd-wo-title-cell gd-wo-open-cell" onclick="gdOpenDetail('${o.id}')"><div class="gd-wo-title-text" title="${o.title}">${o.title}</div></td>
              <td class="gd-col-parent gd-wo-open-cell" onclick="gdOpenDetail('${o.id}')">${o.parentOrderId ? `<span class="gd-wo-id-link" onclick="event.stopPropagation();gdOpenDetail('${o.parentOrderId}')">${o.parentOrderId}</span>` : '<span style="color:#9CA3AF;">—</span>'}</td>
              <td class="gd-col-ws gd-wo-open-cell" onclick="gdOpenDetail('${o.id}')"><div class="gd-wo-ws-text" title="${o.workspace}">${o.workspace}</div></td>
              <td class="gd-col-wsdept gd-wo-open-cell" onclick="gdOpenDetail('${o.id}')">${wsMeta.dept || '<span style="color:#9CA3AF;">—</span>'}</td>
              <td class="gd-col-wsgroup gd-wo-open-cell" onclick="gdOpenDetail('${o.id}')"><div class="gd-wo-group-text" title="${wsMeta.group || ''}">${wsMeta.group || '—'}</div></td>
              <td class="gd-col-wotype gd-wo-open-cell" onclick="gdOpenDetail('${o.id}')">${gdWoTypeTag(o.woType)}</td>
              <td class="gd-col-svcmod gd-wo-open-cell" onclick="gdOpenDetail('${o.id}')">${o.serviceModule ? `<span class="gd-svcmod-tag gd-wo-svcmod" title="${o.serviceModule}">${o.serviceModule}</span>` : '<span style="color:#9CA3AF;">—</span>'}</td>
              <td class="gd-col-company gd-wo-open-cell" onclick="gdOpenDetail('${o.id}')"><div class="gd-wo-company-text" title="${o.company}">${o.company}</div></td>
              <td class="gd-col-firmcode gd-wo-open-cell" onclick="gdOpenDetail('${o.id}')"><span class="gd-wo-code">${o.firmCode}</span></td>
              <td class="gd-col-rtype gd-wo-open-cell" onclick="gdOpenDetail('${o.id}')">${o.reportType && o.reportType !== '—' ? `<span class="gd-rtype-tag gd-rtype-${o.reportType === '合并' ? 'merged' : 'single'}">${o.reportType}</span>` : '<span style="color:#9CA3AF;">—</span>'}</td>
              <td class="gd-col-pm gd-wo-open-cell" onclick="gdOpenDetail('${o.id}')">${o.projectManager || '<span style="color:#9CA3AF;">—</span>'}</td>
              <td class="gd-col-submitter gd-wo-open-cell" onclick="gdOpenDetail('${o.id}')">${gdResolveUserDisplayName(o.submitter) || '—'}</td>
              <td class="gd-col-follower gd-wo-open-cell" onclick="gdOpenDetail('${o.id}')">${gdProjectFollowerName(o)}</td>
              <td class="gd-col-time gd-wo-open-cell" onclick="gdOpenDetail('${o.id}')" style="color:#6B7280;font-size:0.78rem;">${o.submitTime}</td>
              <td class="gd-col-start gd-wo-open-cell" onclick="gdOpenDetail('${o.id}')" style="color:#6B7280;font-size:0.78rem;">${startTime || '<span style="color:#9CA3AF;">—</span>'}</td>
              <td class="gd-col-expected gd-wo-open-cell" onclick="gdOpenDetail('${o.id}')" style="color:#6B7280;font-size:0.78rem;">${gdFormatDateOnly(o.expectedTime) || '<span style="color:#9CA3AF;">—</span>'}</td>
              <td class="gd-col-provider gd-wo-open-cell" onclick="gdOpenDetail('${o.id}')"><span class="gd-provider-tag">${o.providerOrgName || o.provider}</span></td>
              <td class="gd-col-handler gd-wo-sticky-handler gd-wo-open-cell" onclick="gdOpenDetail('${o.id}')">${gdOrderAssigneeText(o) ? `<div class="gd-wo-handler-text" title="${gdOrderAssigneeText(o)}">${gdOrderAssigneeText(o)}</div>` : '<span style="color:#9CA3AF;">—</span>'}</td>
              <td class="gd-col-status gd-wo-sticky-status gd-wo-open-cell" onclick="gdOpenDetail('${o.id}')">${gdStatusTag(o.status)}</td>
              <td class="gd-col-action gd-wo-sticky-action">${gdOverviewActionHtml(o)}</td>
            </tr>`;
          }).join('') : `<tr><td colspan="23" style="text-align:center;padding:40px 0;color:#9CA3AF;">当前视图暂无工单数据</td></tr>`}
        </tbody>
      </table>
      <div class="gd-pager">
        <span class="gd-pager-info">共 <strong>${total}</strong> 条记录</span>
        <div class="gd-pager-btns">
          <button class="gd-pager-btn" ${page<=1?'disabled':''} onclick="gdWoPage(${page-1})">上一页</button>
          ${Array.from({length:Math.ceil(total/PAGE_SIZE)||1},(_,i)=>`<button class="gd-pager-btn${i+1===page?' active':''}" onclick="gdWoPage(${i+1})">${i+1}</button>`).join('')}
          <button class="gd-pager-btn" ${page>=Math.ceil(total/PAGE_SIZE)?'disabled':''} onclick="gdWoPage(${page+1})">下一页</button>
        </div>
      </div>
    </div>`;
}

function gdSwitchOverviewTab(tab) {
  gdOverviewTab = tab;
  gdState.woPage = 1;
  gdState.selectedOrders.clear();
  gdRenderWorkOrders();
}

function gdWoPage(p) {
  gdState.woPage = p;
  gdRenderWorkOrders();
}

function gdWoCheckAll(el) {
  gdVisiblePageOrderIds.forEach(id => {
    if (el.checked) gdState.selectedOrders.add(id);
    else gdState.selectedOrders.delete(id);
  });
  gdRenderWorkOrders();
}

function gdWoCheckRow(el, id) {
  el.checked ? gdState.selectedOrders.add(id) : gdState.selectedOrders.delete(id);
  gdRenderWorkOrders();
}

function gdGetSelectedDeliveryOrg() {
  return GD_DELIVERY_ORGS.find(o => o.id === gdSelectedDeliveryOrgId) || GD_DELIVERY_ORGS[0];
}

function gdGetSelectedOrgMembers() {
  return GD_DELIVERY_ORG_MEMBERS[gdSelectedDeliveryOrgId] || [];
}

function gdGetDeliveryRoleOptions(includeOwner = true) {
  const options = gdGetDeliveryRoles(gdSelectedDeliveryOrgId).map(role => ({ value: role.id, label: role.name }));
  return includeOwner ? options : options.filter(item => item.value !== 'delivery_owner');
}

function gdDeliveryRoleBadge(role) {
  const roleItem = gdGetDeliveryRoleById(role, gdSelectedDeliveryOrgId) || gdGetDeliveryRoleById(role, GD_DEMO_CONTEXT.orgId);
  const label = roleItem?.name || role;
  const color = roleItem?.color || '#6B7280';
  const bgMap = {
    delivery_owner: '#EDE9FE',
    module_lead: '#DBEAFE',
    delivery_staff: '#DCFCE7',
    delivery_intern: '#FEF3C7',
  };
  const bg = bgMap[role] || '#F3F4F6';
  return `<span class="gd-delmem-role" style="background:${bg};color:${color};">${label}</span>`;
}

function gdTodayStr() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function gdAddOneMonth(dateStr) {
  const base = dateStr ? new Date(`${dateStr}T00:00:00`) : new Date();
  if (Number.isNaN(base.getTime())) return gdTodayStr();
  base.setMonth(base.getMonth() + 1);
  const pad = n => String(n).padStart(2, '0');
  return `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}`;
}

function gdResetDeliveryMemberState(resetStatus = false) {
  if (resetStatus) gdDeliveryMemberStatus = 'joined';
  gdDeliveryMemberSearch = '';
  gdDeliveryMemberSelected.clear();
  gdDeliveryMemberPage = 1;
}

function gdGetDeliveryMemberCounts(orgId) {
  const members = GD_DELIVERY_ORG_MEMBERS[orgId] || [];
  return {
    joined: members.filter(m => m.status !== 'left').length,
    left: members.filter(m => m.status === 'left').length,
  };
}

function gdGetAvailableDeliveryUsers(orgId) {
  const existingIds = new Set((GD_DELIVERY_ORG_MEMBERS[orgId] || []).map(m => m.userId));
  return GD_USERS.filter(user => !existingIds.has(user.id));
}

function gdGetFilteredDeliveryMembers(orgId) {
  const keyword = gdDeliveryMemberSearch.trim();
  return (GD_DELIVERY_ORG_MEMBERS[orgId] || []).filter(m => {
    const matchStatus = gdDeliveryMemberStatus === 'joined' ? m.status !== 'left' : m.status === 'left';
    if (!matchStatus) return false;
    if (!keyword) return true;
    return [m.name, m.dept, m.phone, gdDeliveryRoleLabel(m.role)].filter(Boolean).some(v => String(v).includes(keyword));
  });
}

function gdGetSubmitModalParts() {
  const modal = document.getElementById('gd-submit-modal');
  const body = document.getElementById('gd-submit-body');
  const title = modal?.querySelector('.modal-title');
  const sub = modal?.querySelector('.modal-subtitle');
  const oldBtn = document.getElementById('gd-submit-confirm');
  if (!modal || !body || !title || !sub || !oldBtn) return null;
  const newBtn = oldBtn.cloneNode(true);
  oldBtn.replaceWith(newBtn);
  return { modal, body, title, sub, confirmBtn: newBtn };
}

function gdOpenDeliveryFormModal({ title, subtitle, bodyHtml, confirmText = '确认', danger = false, onConfirm }) {
  const parts = gdGetSubmitModalParts();
  if (!parts) return;
  parts.title.textContent = title;
  parts.sub.textContent = subtitle || '';
  parts.body.innerHTML = bodyHtml;
  parts.confirmBtn.textContent = confirmText;
  parts.confirmBtn.style.background = danger ? '#EF4444' : '';
  parts.confirmBtn.onclick = () => {
    const result = onConfirm?.();
    if (result === false) return;
    gdCloseSubmit();
  };
  gdOpenBackdropModal(parts.modal);
}

function gdPromoteDeliveryOwner(orgId, member) {
  const org = GD_DELIVERY_ORGS.find(item => item.id === orgId);
  const members = GD_DELIVERY_ORG_MEMBERS[orgId] || [];
  members.forEach(item => {
    if (item.id !== member.id && item.role === 'delivery_owner') item.role = 'delivery_staff';
  });
  member.role = 'delivery_owner';
  if (org) {
    org.ownerId = member.userId;
    org.ownerName = member.name;
  }
}

function gdPrefillDeliveryMemberFromUser(userId) {
  const user = GD_USERS.find(item => item.id === userId);
  const nameEl = document.getElementById('gd-del-member-name');
  const phoneEl = document.getElementById('gd-del-member-phone');
  const deptEl = document.getElementById('gd-del-member-dept');
  if (!user) {
    if (nameEl) nameEl.value = '';
    if (phoneEl) phoneEl.value = '';
    if (deptEl) deptEl.value = '';
    return;
  }
  if (nameEl) nameEl.value = user.name || '';
  if (phoneEl) phoneEl.value = user.phone || '—';
  if (deptEl) deptEl.value = user.dept || '';
}

function gdRenderDeliveryMembersPanel(org) {
  const counts = gdGetDeliveryMemberCounts(org.id);
  const list = gdGetFilteredDeliveryMembers(org.id);
  const pageSize = 8;
  const pages = Math.max(1, Math.ceil(list.length / pageSize));
  gdDeliveryMemberPage = Math.min(gdDeliveryMemberPage, pages);
  const start = (gdDeliveryMemberPage - 1) * pageSize;
  const pageRows = list.slice(start, start + pageSize);
  const allChecked = pageRows.length > 0 && pageRows.every(m => gdDeliveryMemberSelected.has(m.id));
  const isJoined = gdDeliveryMemberStatus === 'joined';

  return `
    <div class="gd-card">
      <div class="gd-delmem-toolbar">
        <div class="gd-delmem-status-tabs">
          <button class="gd-delmem-status ${isJoined ? 'active' : ''}" onclick="gdSwitchDeliveryMemberStatus('joined')">已加入 <span class="gd-delmem-badge">${counts.joined}</span></button>
          <button class="gd-delmem-status ${!isJoined ? 'active' : ''}" onclick="gdSwitchDeliveryMemberStatus('left')">已退出 <span class="gd-delmem-badge">${counts.left}</span></button>
        </div>
        <div class="gd-delmem-actions">
          <div class="gd-delmem-search">
            <input class="gd-filter-input" placeholder="搜索成员姓名 / 部门 / 手机号" value="${gdDeliveryMemberSearch}" oninput="gdSetDeliveryMemberSearch(this.value)">
          </div>
          ${isJoined ? `<button class="gd-btn gd-btn-outline gd-btn-sm" ${gdDeliveryMemberSelected.size ? '' : 'disabled'} onclick="gdOpenBatchDeliveryRole()">批量编辑角色</button>` : ''}
          ${isJoined ? `<button class="gd-btn gd-btn-primary gd-btn-sm" onclick="gdOpenAddDeliveryMember()">添加成员</button>` : ''}
        </div>
      </div>

      <div class="gd-table-wrap">
        <table class="gd-table">
          <thead>
            <tr>
              <th style="width:44px;text-align:center;">${isJoined ? `<input type="checkbox" ${allChecked ? 'checked' : ''} onchange="gdToggleDeliveryMemberSelectAll(this.checked)">` : ''}</th>
              <th>姓名</th>
              <th>角色</th>
              <th>所属部门</th>
              <th>手机号码</th>
              <th>加入时间</th>
              <th>${isJoined ? '有效期' : '退出时间'}</th>
              <th>添加人</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${pageRows.length ? pageRows.map(m => `
              <tr class="${gdDeliveryMemberSelected.has(m.id) ? 'gd-delmem-row-selected' : ''}">
                <td style="text-align:center;">${isJoined ? `<input type="checkbox" ${gdDeliveryMemberSelected.has(m.id) ? 'checked' : ''} onchange="gdToggleDeliveryMemberSelect('${m.id}', this.checked)">` : ''}</td>
                <td>
                  <div class="gd-delmem-user">
                    <div class="gd-delmem-avatar" style="background:${gdAvatarColor(m.name)};">${m.name[0]}</div>
                    <span>${m.name}</span>
                  </div>
                </td>
                <td>${gdDeliveryRoleBadge(m.role)}</td>
                <td style="color:#6B7280;">${m.dept || '—'}</td>
                <td style="color:#6B7280;">${m.phone || '—'}</td>
                <td style="color:#6B7280;">${m.joinedAt || '—'}</td>
                <td style="color:${!isJoined && m.leftAt ? '#DC2626' : '#6B7280'};">${isJoined ? (m.validUntil || '—') : (m.leftAt || '—')}</td>
                <td style="color:#6B7280;">${m.addedBy || '—'}</td>
                <td>
                  <div class="gd-delmem-ops">
                    ${isJoined ? `<button class="gd-btn gd-btn-ghost gd-btn-sm" onclick="gdOpenEditDeliveryMember('${m.id}')">编辑</button>` : ''}
                    ${isJoined ? `<button class="gd-btn gd-btn-outline gd-btn-sm" onclick="gdOpenRemoveDeliveryMember('${m.id}')">移出</button>` : ''}
                    ${isJoined && m.role === 'delivery_intern' ? `<button class="gd-btn gd-btn-outline gd-btn-sm" onclick="gdOpenRenewDeliveryMember('${m.id}')">续期</button>` : ''}
                    ${!isJoined ? `<button class="gd-btn gd-btn-primary gd-btn-sm" onclick="gdOpenReaddDeliveryMember('${m.id}')">重新加入</button>` : ''}
                  </div>
                </td>
              </tr>`).join('') : `<tr><td colspan="9" style="text-align:center;padding:36px 0;color:#9CA3AF;">暂无成员数据</td></tr>`}
          </tbody>
        </table>
      </div>

      <div class="gd-pager">
        <span class="gd-pager-info">共 <strong>${list.length}</strong> 条记录</span>
        <div class="gd-pager-btns">
          <button class="gd-pager-btn" ${gdDeliveryMemberPage <= 1 ? 'disabled' : ''} onclick="gdSetDeliveryMemberPage(${gdDeliveryMemberPage - 1})">上一页</button>
          <span class="gd-delmem-page-text">${gdDeliveryMemberPage} / ${pages}</span>
          <button class="gd-pager-btn" ${gdDeliveryMemberPage >= pages ? 'disabled' : ''} onclick="gdSetDeliveryMemberPage(${gdDeliveryMemberPage + 1})">下一页</button>
        </div>
      </div>
    </div>`;
}

function gdRenderDeliveryRolesPanel(org) {
  const config = gdGetDeliveryRoleConfig(org.id);
  const role = gdSyncSelectedDeliveryRole(org.id);
  if (!role) {
    return `<div class="gd-card"><div style="font-size:0.85rem;color:#6B7280;">当前交付组织暂无角色配置。</div></div>`;
  }
  const perms = config.permState[role.id] || {};
  return `
    <div class="gd-card gd-drp-layout">
      <aside class="gd-drp-left">
        <div class="gd-drp-left-hd">
          <button class="gd-btn gd-btn-outline gd-btn-sm" onclick="gdOpenAddDeliveryRole()">+ 添加角色</button>
        </div>
        <div class="gd-drp-role-list">
          ${config.roles.map(item => `
            <button class="gd-drp-role-item ${item.id === role.id ? 'active' : ''}" onclick="gdSetDeliveryRole('${item.id}')">
              <span class="gd-drp-role-dot" style="background:${item.color || '#94A3B8'};"></span>
              <span class="gd-drp-role-info">
                <span class="gd-drp-role-name">${item.name}</span>
                <span class="gd-drp-role-desc">${item.desc || '—'}</span>
              </span>
              <span class="gd-drp-role-cnt">${gdGetDeliveryRoleMemberCount(org.id, item.id)}人</span>
            </button>`).join('')}
        </div>
      </aside>
      <section class="gd-drp-right">
        <div class="gd-drp-right-hd">
          <div>
            <div class="gd-drp-role-title-row">
              <div class="gd-drp-role-title">${role.name}</div>
              <span class="gd-drp-role-tag ${role.builtin ? 'is-system' : 'is-custom'}">${role.builtin ? '系统角色' : '自定义角色'}</span>
            </div>
            <div class="gd-drp-role-sub">${role.desc || '可按当前交付组织的协同边界调整权限范围。'}</div>
          </div>
          <button class="gd-btn gd-btn-primary gd-btn-sm" ${gdDeliveryRolePermDirty ? '' : 'disabled'} onclick="gdSaveDeliveryRolePerms()">保存</button>
        </div>
        <div class="gd-drp-perm-scroll">
          ${GD_DELIVERY_PERMISSION_MODULES.map(mod => {
            const allPerms = mod.groups.flatMap(group => group.perms);
            const enabledCnt = allPerms.filter(perm => perms[perm.id]).length;
            const collapsed = gdDeliveryRoleCollapsedModules.has(`${org.id}:${mod.id}`);
            return `
              <div class="gd-drp-perm-module">
                <div class="gd-drp-perm-mod-hd" onclick="gdToggleDeliveryPermModule('${org.id}','${mod.id}')">
                  <div class="gd-drp-perm-mod-title">
                    <svg class="gd-drp-perm-chevron ${collapsed ? '' : 'rotated'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" width="12" height="12"><polyline points="9 18 15 12 9 6"/></svg>
                    ${mod.label}
                  </div>
                  <span class="gd-drp-perm-cnt-badge">${enabledCnt}/${allPerms.length}</span>
                </div>
                <div class="gd-drp-perm-mod-body ${collapsed ? 'collapsed' : ''}">
                  ${mod.groups.map(group => {
                    const allChecked = group.perms.every(perm => perms[perm.id]);
                    const someChecked = group.perms.some(perm => perms[perm.id]);
                    return `
                      <div class="gd-drp-perm-group">
                        <div class="gd-drp-perm-grp-hd">
                          <label class="gd-drp-perm-grp-all">
                            <input
                              type="checkbox"
                              class="gd-drp-group-cb"
                              data-indeterminate="${!allChecked && someChecked ? '1' : '0'}"
                              ${allChecked ? 'checked' : ''}
                              onchange="gdToggleDeliveryPermGroup('${org.id}','${role.id}','${group.id}',this.checked)"
                            >
                            <span class="gd-drp-perm-grp-label">${group.label}</span>
                          </label>
                        </div>
                        <div class="gd-drp-perm-items">
                          ${group.perms.map(perm => `
                            <label class="gd-drp-perm-item">
                              <input
                                type="checkbox"
                                ${perms[perm.id] ? 'checked' : ''}
                                onchange="gdToggleDeliveryPerm('${org.id}','${role.id}','${perm.id}',this.checked)"
                              >
                              <span class="gd-drp-perm-label-wrap">
                                <span class="gd-drp-perm-label">${perm.label}</span>
                                <span class="gd-drp-perm-desc">${perm.desc}</span>
                              </span>
                            </label>`).join('')}
                        </div>
                      </div>`;
                  }).join('')}
                </div>
              </div>`;
          }).join('')}
        </div>
      </section>
    </div>`;
}

function gdSetDeliveryRole(roleId) {
  gdDeliverySelectedRoleId = roleId;
  gdRenderDeliveryOrgs();
}

function gdToggleDeliveryPermModule(orgId, moduleId) {
  const key = `${orgId}:${moduleId}`;
  if (gdDeliveryRoleCollapsedModules.has(key)) gdDeliveryRoleCollapsedModules.delete(key);
  else gdDeliveryRoleCollapsedModules.add(key);
  gdRenderDeliveryOrgs();
}

function gdToggleDeliveryPermGroup(orgId, roleId, groupId, checked) {
  const config = gdGetDeliveryRoleConfig(orgId);
  const group = gdGetDeliveryPermissionGroup(groupId);
  if (!group || !config.permState[roleId]) return;
  group.perms.forEach(perm => { config.permState[roleId][perm.id] = checked; });
  gdDeliveryRolePermDirty = true;
  gdRenderDeliveryOrgs();
}

function gdToggleDeliveryPerm(orgId, roleId, permId, checked) {
  const config = gdGetDeliveryRoleConfig(orgId);
  if (!config.permState[roleId]) return;
  config.permState[roleId][permId] = checked;
  gdDeliveryRolePermDirty = true;
  gdRenderDeliveryOrgs();
}

function gdApplyDeliveryRolePanelState() {
  document.querySelectorAll('.gd-drp-group-cb').forEach(cb => {
    cb.indeterminate = cb.dataset.indeterminate === '1';
  });
}

function gdOpenAddDeliveryRole() {
  const org = gdGetSelectedDeliveryOrg();
  const config = gdGetDeliveryRoleConfig(org.id);
  gdOpenDeliveryFormModal({
    title: '添加角色',
    subtitle: `为交付组织「${org.name}」新增角色`,
    confirmText: '创建角色',
    bodyHtml: `
      <div>
        <label class="gd-modal-label">角色名称 <span class="gd-required">*</span></label>
        <input id="gd-del-role-name" class="gd-filter-input" placeholder="请输入角色名称，如：交付质检员">
      </div>
      <div>
        <label class="gd-modal-label">角色说明</label>
        <textarea id="gd-del-role-desc" class="gd-filter-input" rows="3" style="resize:vertical;width:100%;box-sizing:border-box;" placeholder="请输入该角色的职责边界"></textarea>
      </div>
      <div>
        <label class="gd-modal-label">权限模板</label>
        <select id="gd-del-role-copy" class="gd-filter-input">
          ${config.roles.map(role => `<option value="${role.id}" ${role.id === gdDeliverySelectedRoleId ? 'selected' : ''}>复制「${role.name}」权限</option>`).join('')}
        </select>
      </div>`,
    onConfirm: () => {
      const name = (document.getElementById('gd-del-role-name')?.value || '').trim();
      const desc = (document.getElementById('gd-del-role-desc')?.value || '').trim();
      const copyFrom = document.getElementById('gd-del-role-copy')?.value || 'delivery_staff';
      if (!name) {
        showNotification('请填写角色名称');
        return false;
      }
      if (config.roles.some(role => role.name === name)) {
        showNotification('当前交付组织已存在同名角色');
        return false;
      }
      const roleId = `delivery_custom_${Date.now()}`;
      const sourcePerms = config.permState[copyFrom] || gdBuildDeliveryDefaultPerms('delivery_staff');
      config.roles.push({
        id: roleId,
        name,
        desc: desc || `负责 ${name} 相关的交付协同与权限范围`,
        color: gdGetNextDeliveryRoleColor(config.roles.length),
        builtin: false,
      });
      config.permState[roleId] = gdCloneDeliveryPermState(sourcePerms);
      gdDeliverySelectedRoleId = roleId;
      gdDeliveryRolePermDirty = false;
      gdRenderDeliveryOrgs();
      showNotification(`✓ 已新增角色「${name}」`);
    },
  });
}

function gdSaveDeliveryRolePerms() {
  gdDeliveryRolePermDirty = false;
  gdRenderDeliveryOrgs();
  showNotification('角色权限已保存');
}

function gdRenderDeliveryTagsPanel(org) {
  const modCols = ['数据', '试算', '报告', '函证', '底稿'];
  const members = (GD_DELIVERY_ORG_MEMBERS[org.id] || []).filter(m => m.status !== 'left');
  return `
    <div class="gd-card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
        <div>
          <div class="gd-section-title" style="margin:0;">交付人员服务标签配置</div>
          <div style="font-size:0.78rem;color:#9CA3AF;margin-top:3px;">决定成员可见的模块工单池与可被派单范围</div>
        </div>
        <button class="gd-btn gd-btn-primary gd-btn-sm" onclick="showNotification('交付人员服务标签已保存')">保存配置</button>
      </div>
      <div class="gd-table-wrap">
        <table class="gd-table">
          <thead>
            <tr>
              <th>姓名</th><th>角色</th><th>服务模块组长</th>
              ${modCols.map(m => `<th style="text-align:center;width:60px;">${m}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${members.map(m => `
              <tr>
                <td>${m.name}</td>
                <td style="color:#6B7280;">${gdDeliveryRoleLabel(m.role)}</td>
                <td>
                  <select class="gd-filter-input" style="min-width:120px;" onchange="gdSetModuleLead('${org.id}','${m.userId}',this.value)">
                    <option value="">—</option>
                    ${modCols.map(mod => `<option value="${mod}" ${m.moduleLead===mod?'selected':''}>${mod}</option>`).join('')}
                  </select>
                </td>
                ${modCols.map(mod => `
                  <td style="text-align:center;">
                    <input type="checkbox" style="width:16px;height:16px;cursor:pointer;"
                      ${(m.serviceTags || []).includes(mod) ? 'checked' : ''}
                      onchange="gdToggleDeliveryServiceTag('${org.id}','${m.userId}','${mod}',this.checked)">
                  </td>`).join('')}
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

function gdRenderDeliveryOrgs() {
  const pane = document.getElementById('gd-pane-deliveryorgs');
  if (!pane) return;
  gdDeliveryOrgPaneScrollTop = pane.scrollTop || 0;
  const existingRoleScroll = pane.querySelector('.gd-drp-perm-scroll');
  if (existingRoleScroll) gdDeliveryRoleScrollTop = existingRoleScroll.scrollTop || 0;
  const org = gdGetSelectedDeliveryOrg();
  const counts = gdGetDeliveryMemberCounts(org.id);
  const joinedMembers = (GD_DELIVERY_ORG_MEMBERS[org.id] || []).filter(m => m.status !== 'left');
  const modCount = ['数据', '试算', '报告', '函证', '底稿'].filter(mod => joinedMembers.some(m => (m.serviceTags || []).includes(mod))).length;

  pane.innerHTML = `
    <div class="gd-delorg-layout">
      <aside class="gd-delorg-side">
        <div class="gd-delorg-side-hd">
          <div>
            <div class="gd-settings-title" style="margin-bottom:2px;">交付组织</div>
            <div class="gd-settings-sub" style="margin-bottom:0;">搭建不同服务部门的工单承接组织</div>
          </div>
          <button class="gd-btn gd-btn-primary gd-btn-sm" onclick="gdOpenCreateDeliveryOrg()">新建交付组织</button>
        </div>
        <div class="gd-delorg-list">
          ${GD_DELIVERY_ORGS.map(item => `
            <button class="gd-delorg-card ${item.id===org.id?'active':''}" onclick="gdSelectDeliveryOrg('${item.id}')">
              <div class="gd-delorg-card-name">${item.name}</div>
              <div class="gd-delorg-card-desc">${item.desc}</div>
              <div class="gd-delorg-card-meta">${item.sourceDept} · 负责人 ${item.ownerName}</div>
            </button>`).join('')}
        </div>
      </aside>
      <section class="gd-delorg-main">
        <div class="gd-card" style="margin-bottom:16px;">
          <div class="gd-delorg-orghead">
            <div>
              <div class="gd-delorg-orgname">${org.name}</div>
              <div class="gd-delorg-orgmeta">所属部门：${org.sourceDept} · 交付负责人：${org.ownerName}</div>
            </div>
            <div class="gd-delorg-head-actions">
              <button class="gd-btn gd-btn-outline gd-btn-sm" onclick="gdOpenEditDeliveryOrg()">编辑组织</button>
              <button class="gd-btn gd-btn-outline gd-btn-sm" onclick="gdOpenRemoveDeliveryOrg()">移出组织</button>
            </div>
            <div class="gd-delorg-statgroup">
              <div class="gd-delorg-stat"><span class="gd-delorg-stat-label">已加入成员</span><strong>${counts.joined}</strong></div>
              <div class="gd-delorg-stat"><span class="gd-delorg-stat-label">模块覆盖</span><strong>${modCount}</strong></div>
            </div>
          </div>
        </div>

        <div class="gd-subtab-bar gd-overview-tabs" style="margin-bottom:16px;">
          <button class="gd-subtab ${gdDeliveryOrgInnerTab==='members'?'active':''}" onclick="gdDeliveryOrgInnerTab='members';gdRenderDeliveryOrgs()">成员管理</button>
          <button class="gd-subtab ${gdDeliveryOrgInnerTab==='roles'?'active':''}" onclick="gdDeliveryOrgInnerTab='roles';gdRenderDeliveryOrgs()">角色权限</button>
          <button class="gd-subtab ${gdDeliveryOrgInnerTab==='tags'?'active':''}" onclick="gdDeliveryOrgInnerTab='tags';gdRenderDeliveryOrgs()">交付人员服务标签配置</button>
        </div>

        ${gdDeliveryOrgInnerTab === 'members' ? gdRenderDeliveryMembersPanel(org) : ''}
        ${gdDeliveryOrgInnerTab === 'roles' ? gdRenderDeliveryRolesPanel(org) : ''}
        ${gdDeliveryOrgInnerTab === 'tags' ? gdRenderDeliveryTagsPanel(org) : ''}
      </section>
    </div>`;
  pane.scrollTop = gdDeliveryOrgPaneScrollTop;
  if (gdDeliveryOrgInnerTab === 'roles') {
    gdApplyDeliveryRolePanelState();
    const roleScroll = pane.querySelector('.gd-drp-perm-scroll');
    if (roleScroll) roleScroll.scrollTop = gdDeliveryRoleScrollTop;
  }
}

function gdSelectDeliveryOrg(id) {
  gdSelectedDeliveryOrgId = id;
  GD_DEMO_CONTEXT.orgId = id;
  gdSyncSelectedDeliveryRole(id);
  gdDeliveryRolePermDirty = false;
  gdDeliveryOrgPaneScrollTop = 0;
  gdDeliveryRoleScrollTop = 0;
  gdApplyDemoContext();
  gdResetDeliveryMemberState(true);
  gdRenderDeliveryOrgs();
}

function gdSwitchDeliveryMemberStatus(status) {
  gdDeliveryMemberStatus = status;
  gdDeliveryMemberSelected.clear();
  gdDeliveryMemberPage = 1;
  gdRenderDeliveryOrgs();
}

function gdSetDeliveryMemberSearch(value) {
  gdDeliveryMemberSearch = value;
  gdDeliveryMemberSelected.clear();
  gdDeliveryMemberPage = 1;
  gdRenderDeliveryOrgs();
}

function gdSetDeliveryMemberPage(page) {
  gdDeliveryMemberPage = Math.max(1, page);
  gdRenderDeliveryOrgs();
}

function gdToggleDeliveryMemberSelectAll(checked) {
  gdGetFilteredDeliveryMembers(gdSelectedDeliveryOrgId)
    .slice((gdDeliveryMemberPage - 1) * 8, gdDeliveryMemberPage * 8)
    .forEach(m => {
      if (checked) gdDeliveryMemberSelected.add(m.id);
      else gdDeliveryMemberSelected.delete(m.id);
    });
  gdRenderDeliveryOrgs();
}

function gdToggleDeliveryMemberSelect(id, checked) {
  if (checked) gdDeliveryMemberSelected.add(id);
  else gdDeliveryMemberSelected.delete(id);
  gdRenderDeliveryOrgs();
}

function gdToggleDeliveryServiceTag(orgId, userId, mod, checked) {
  const members = GD_DELIVERY_ORG_MEMBERS[orgId] || [];
  const member = members.find(m => m.userId === userId && m.status !== 'left');
  if (!member) return;
  member.serviceTags = member.serviceTags || [];
  if (checked && !member.serviceTags.includes(mod)) member.serviceTags.push(mod);
  if (!checked) member.serviceTags = member.serviceTags.filter(t => t !== mod);
}

function gdSetModuleLead(orgId, userId, mod) {
  const members = GD_DELIVERY_ORG_MEMBERS[orgId] || [];
  members.forEach(m => { if (m.userId !== userId && m.moduleLead === mod && mod) m.moduleLead = ''; });
  const member = members.find(m => m.userId === userId && m.status !== 'left');
  if (member) member.moduleLead = mod;
  if (gdState.currentTab === 'deliveryorgs') gdRenderDeliveryOrgs();
}

function gdOpenCreateDeliveryOrg() {
  const deptUsers = GD_USERS.filter(u => u.dept === GD_CURRENT_USER.dept);
  gdOpenDeliveryFormModal({
    title: '新建交付组织',
    subtitle: '配置组织名称、交付负责人和所属部门',
    confirmText: '创建组织',
    bodyHtml: `
      <div>
        <label class="gd-modal-label">组织名称 <span class="gd-required">*</span></label>
        <input id="gd-new-org-name" class="gd-filter-input" placeholder="请输入交付组织名称">
      </div>
      <div>
        <label class="gd-modal-label">交付负责人</label>
        <select id="gd-new-org-owner" class="gd-filter-input">
          ${deptUsers.map(u => `<option value="${u.id}" ${u.id===GD_CURRENT_USER.id?'selected':''}>${u.name}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="gd-modal-label">交付组织所属部门</label>
        <input class="gd-filter-input" value="${GD_CURRENT_USER.dept}" readonly>
      </div>`,
    onConfirm: () => {
      const name = document.getElementById('gd-new-org-name')?.value.trim();
      const ownerId = document.getElementById('gd-new-org-owner')?.value;
      const owner = GD_USERS.find(u => u.id === ownerId) || GD_CURRENT_USER;
      if (!name) { showNotification('请输入组织名称'); return false; }
      const newId = `org-${Date.now()}`;
      GD_DELIVERY_ORGS.push({ id: newId, name, ownerId: owner.id, ownerName: owner.name, sourceDept: GD_CURRENT_USER.dept, desc: '新建交付组织' });
      GD_DELIVERY_ORG_MEMBERS[newId] = [{
        id: `${newId}-member-1`,
        userId: owner.id,
        name: owner.name,
        role: 'delivery_owner',
        moduleLead: '',
        serviceTags: ['数据', '试算'],
        dept: owner.dept,
        phone: owner.phone || '—',
        joinedAt: gdTodayStr(),
        validUntil: '',
        addedBy: GD_CURRENT_USER.name,
        status: 'joined',
        leftAt: '',
      }];
      gdSelectedDeliveryOrgId = newId;
      GD_DEMO_CONTEXT.orgId = newId;
      gdApplyDemoContext();
      gdResetDeliveryMemberState(true);
      gdRenderDeliveryOrgs();
      showNotification(`✓ 已创建交付组织「${name}」`);
    }
  });
}

function gdOpenEditDeliveryOrg() {
  const org = gdGetSelectedDeliveryOrg();
  const deptUsers = GD_USERS.filter(u => u.dept === org.sourceDept);
  gdOpenDeliveryFormModal({
    title: '编辑交付组织',
    subtitle: '更新组织名称与负责人信息',
    confirmText: '保存修改',
    bodyHtml: `
      <div>
        <label class="gd-modal-label">组织名称 <span class="gd-required">*</span></label>
        <input id="gd-edit-org-name" class="gd-filter-input" value="${org.name}">
      </div>
      <div>
        <label class="gd-modal-label">交付负责人</label>
        <select id="gd-edit-org-owner" class="gd-filter-input">
          ${deptUsers.map(u => `<option value="${u.id}" ${u.id===org.ownerId?'selected':''}>${u.name}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="gd-modal-label">交付组织所属部门</label>
        <input class="gd-filter-input" value="${org.sourceDept}" readonly>
      </div>`,
    onConfirm: () => {
      const name = document.getElementById('gd-edit-org-name')?.value.trim();
      const ownerId = document.getElementById('gd-edit-org-owner')?.value;
      const owner = GD_USERS.find(u => u.id === ownerId);
      if (!name) { showNotification('请输入组织名称'); return false; }
      org.name = name;
      if (owner) {
        org.ownerId = owner.id;
        org.ownerName = owner.name;
        org.sourceDept = owner.dept;
        const members = GD_DELIVERY_ORG_MEMBERS[org.id] || [];
        let ownerMember = members.find(m => m.userId === owner.id);
        if (!ownerMember) {
          ownerMember = {
            id: `${org.id}-member-${Date.now()}`,
            userId: owner.id,
            name: owner.name,
            role: 'delivery_owner',
            moduleLead: '',
            serviceTags: ['数据'],
            dept: owner.dept,
            phone: owner.phone || '—',
            joinedAt: gdTodayStr(),
            validUntil: '',
            addedBy: GD_CURRENT_USER.name,
            status: 'joined',
            leftAt: '',
          };
          members.unshift(ownerMember);
        }
        gdPromoteDeliveryOwner(org.id, ownerMember);
      }
      gdApplyDemoContext();
      gdRenderDeliveryOrgs();
      showNotification(`✓ 已更新交付组织「${org.name}」`);
    }
  });
}

function gdOpenRemoveDeliveryOrg() {
  const org = gdGetSelectedDeliveryOrg();
  if (GD_DELIVERY_ORGS.length <= 1) { showNotification('至少保留一个交付组织'); return; }
  gdOpenDeliveryFormModal({
    title: '移出交付组织',
    subtitle: '移出后该组织下的交付成员配置将一并移除',
    confirmText: '确认移出',
    danger: true,
    bodyHtml: `<div class="gd-modal-confirm">确认移出交付组织「${org.name}」吗？移出后不会影响历史工单记录，但该组织将不再可选。</div>`,
    onConfirm: () => {
      const nextOrg = GD_DELIVERY_ORGS.find(item => item.id !== org.id);
      const idx = GD_DELIVERY_ORGS.findIndex(item => item.id === org.id);
      if (idx >= 0) GD_DELIVERY_ORGS.splice(idx, 1);
      delete GD_DELIVERY_ORG_MEMBERS[org.id];
      gdSelectedDeliveryOrgId = nextOrg?.id || GD_DELIVERY_ORGS[0]?.id;
      GD_DEMO_CONTEXT.orgId = gdSelectedDeliveryOrgId;
      gdApplyDemoContext();
      gdResetDeliveryMemberState(true);
      gdRenderDeliveryOrgs();
      showNotification(`✓ 已移出交付组织「${org.name}」`);
    }
  });
}

function gdOpenAddDeliveryMember() {
  const org = gdGetSelectedDeliveryOrg();
  const availableUsers = gdGetAvailableDeliveryUsers(org.id);
  if (!availableUsers.length) {
    showNotification('暂无可添加的现有成员');
    return;
  }
  const defaultUser = availableUsers[0];
  gdOpenDeliveryFormModal({
    title: '添加成员',
    subtitle: `将成员加入交付组织「${org.name}」`,
    confirmText: '确认添加',
    bodyHtml: `
      <div>
        <label class="gd-modal-label">选择现有成员 <span class="gd-required">*</span></label>
        <select id="gd-del-member-user" class="gd-filter-input" onchange="gdPrefillDeliveryMemberFromUser(this.value)">
          ${availableUsers.map(u => `<option value="${u.id}" ${u.id === defaultUser.id ? 'selected' : ''}>${u.name} · ${u.dept}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="gd-modal-label">姓名</label>
        <input id="gd-del-member-name" class="gd-filter-input" value="${defaultUser.name}" readonly>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <label class="gd-modal-label">角色 <span class="gd-required">*</span></label>
          <select id="gd-del-member-role" class="gd-filter-input">
            ${gdGetDeliveryRoleOptions().map(item => `<option value="${item.value}" ${item.value === 'delivery_staff' ? 'selected' : ''}>${item.label}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="gd-modal-label">所属部门</label>
          <input id="gd-del-member-dept" class="gd-filter-input" value="${defaultUser.dept}" readonly>
        </div>
      </div>
      <div>
        <label class="gd-modal-label">手机号</label>
        <input id="gd-del-member-phone" class="gd-filter-input" value="${defaultUser.phone || '—'}" readonly>
      </div>`,
    onConfirm: () => {
      const members = GD_DELIVERY_ORG_MEMBERS[org.id] || [];
      const userId = document.getElementById('gd-del-member-user')?.value;
      const user = GD_USERS.find(item => item.id === userId);
      const role = document.getElementById('gd-del-member-role')?.value;
      if (!user) { showNotification('请选择现有成员'); return false; }
      const existing = members.find(m => m.userId === user.id);
      if (existing) { showNotification(existing.status === 'left' ? '该成员已存在于已退出列表，请使用“重新加入”' : '该成员已在当前交付组织中'); return false; }
      const member = {
        id: `${org.id}-member-${Date.now()}`,
        userId: user.id,
        name: user.name,
        role,
        moduleLead: '',
        serviceTags: role === 'module_lead' ? ['数据'] : [],
        dept: user.dept,
        phone: user.phone || '—',
        joinedAt: gdTodayStr(),
        validUntil: '',
        addedBy: GD_CURRENT_USER.name,
        status: 'joined',
        leftAt: '',
      };
      members.unshift(member);
      if (role === 'delivery_owner') gdPromoteDeliveryOwner(org.id, member);
      gdResetDeliveryMemberState();
      gdRenderDeliveryOrgs();
      showNotification(`✓ 已添加成员「${user.name}」`);
    }
  });
}

function gdOpenEditDeliveryMember(memberId) {
  const org = gdGetSelectedDeliveryOrg();
  const members = GD_DELIVERY_ORG_MEMBERS[org.id] || [];
  const member = members.find(item => item.id === memberId);
  if (!member) return;
  const isCurrentOwner = member.role === 'delivery_owner';
  gdOpenDeliveryFormModal({
    title: '编辑成员',
    subtitle: `更新成员「${member.name}」的角色与有效期`,
    confirmText: '保存修改',
    bodyHtml: `
      <div>
        <label class="gd-modal-label">姓名</label>
        <input class="gd-filter-input" value="${member.name}" readonly>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <label class="gd-modal-label">角色</label>
          <select id="gd-edit-member-role" class="gd-filter-input">
            ${gdGetDeliveryRoleOptions().map(item => `<option value="${item.value}" ${item.value===member.role?'selected':''}>${item.label}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="gd-modal-label">有效期</label>
          <input id="gd-edit-member-valid" type="date" class="gd-filter-input" value="${member.validUntil || ''}">
        </div>
      </div>
      <div>
        <label class="gd-modal-label">手机号</label>
        <input id="gd-edit-member-phone" class="gd-filter-input" value="${member.phone || ''}">
      </div>`,
    onConfirm: () => {
      const role = document.getElementById('gd-edit-member-role')?.value;
      const validUntil = document.getElementById('gd-edit-member-valid')?.value;
      const phone = document.getElementById('gd-edit-member-phone')?.value.trim();
      if (isCurrentOwner && role !== 'delivery_owner') {
        showNotification('当前交付负责人不能直接降级，请先将其他成员设为交付负责人');
        return false;
      }
      member.phone = phone || '—';
      member.validUntil = role === 'delivery_intern' ? validUntil : '';
      member.role = role;
      if (role === 'delivery_owner') gdPromoteDeliveryOwner(org.id, member);
      gdApplyDemoContext();
      gdRenderDeliveryOrgs();
      showNotification(`✓ 已更新成员「${member.name}」`);
    }
  });
}

function gdOpenRemoveDeliveryMember(memberId) {
  const org = gdGetSelectedDeliveryOrg();
  const members = GD_DELIVERY_ORG_MEMBERS[org.id] || [];
  const member = members.find(item => item.id === memberId);
  if (!member) return;
  if (member.role === 'delivery_owner') { showNotification('请先变更交付负责人后再移出当前负责人'); return; }
  gdOpenDeliveryFormModal({
    title: '移出成员',
    subtitle: '移出后该成员将失去当前交付组织权限，但保留历史记录',
    confirmText: '确认移出',
    danger: true,
    bodyHtml: `<div class="gd-modal-confirm">确认移出 ${member.name} 吗？移出后该成员将失去当前交付组织的所有权限，但保留所有操作记录。</div>`,
    onConfirm: () => {
      member.status = 'left';
      member.leftAt = gdTodayStr();
      gdDeliveryMemberSelected.delete(member.id);
      gdRenderDeliveryOrgs();
      showNotification(`✓ 已移出成员「${member.name}」`);
    }
  });
}

function gdOpenRenewDeliveryMember(memberId) {
  const member = gdGetSelectedOrgMembers().find(item => item.id === memberId);
  if (!member) return;
  const nextDate = gdAddOneMonth(member.validUntil || gdTodayStr());
  gdOpenDeliveryFormModal({
    title: '成员续期',
    subtitle: `为实习生「${member.name}」延长有效期`,
    confirmText: '确认续期',
    bodyHtml: `
      <div class="gd-modal-confirm" style="margin-bottom:12px;">可在下方调整新的有效期，默认在当前日期基础上顺延一个月。</div>
      <div>
        <label class="gd-modal-label">新的有效期</label>
        <input id="gd-renew-member-valid" type="date" class="gd-filter-input" value="${nextDate}">
      </div>`,
    onConfirm: () => {
      member.validUntil = document.getElementById('gd-renew-member-valid')?.value || nextDate;
      gdRenderDeliveryOrgs();
      showNotification(`✓ ${member.name} 已续期至 ${member.validUntil}`);
    }
  });
}

function gdOpenReaddDeliveryMember(memberId) {
  const member = (GD_DELIVERY_ORG_MEMBERS[gdSelectedDeliveryOrgId] || []).find(item => item.id === memberId);
  if (!member) return;
  gdOpenDeliveryFormModal({
    title: '重新加入成员',
    subtitle: '重新加入后将恢复其在当前交付组织的成员身份',
    confirmText: '确认加入',
    bodyHtml: `<div class="gd-modal-confirm">确认让 ${member.name} 重新加入当前交付组织吗？</div>`,
    onConfirm: () => {
      member.status = 'joined';
      member.leftAt = '';
      member.joinedAt = gdTodayStr();
      gdRenderDeliveryOrgs();
      showNotification(`✓ ${member.name} 已重新加入交付组织`);
    }
  });
}

function gdOpenBatchDeliveryRole() {
  const org = gdGetSelectedDeliveryOrg();
  const members = GD_DELIVERY_ORG_MEMBERS[org.id] || [];
  const selected = members.filter(item => gdDeliveryMemberSelected.has(item.id) && item.status !== 'left');
  if (!selected.length) return;
  if (selected.some(item => item.role === 'delivery_owner')) {
    showNotification('批量编辑暂不支持包含交付负责人，请先取消勾选');
    return;
  }
  gdOpenDeliveryFormModal({
    title: '批量编辑角色',
    subtitle: `已选择 ${selected.length} 名成员`,
    confirmText: '确认修改',
    bodyHtml: `
      <div>
        <label class="gd-modal-label">目标角色</label>
        <select id="gd-batch-delivery-role" class="gd-filter-input">
          ${gdGetDeliveryRoleOptions(false).map(item => `<option value="${item.value}">${item.label}</option>`).join('')}
        </select>
      </div>`,
    onConfirm: () => {
      const role = document.getElementById('gd-batch-delivery-role')?.value;
      selected.forEach(item => {
        item.role = role;
        if (role !== 'delivery_intern') item.validUntil = '';
      });
      gdDeliveryMemberSelected.clear();
      gdRenderDeliveryOrgs();
      showNotification(`✓ 已批量更新 ${selected.length} 名成员的角色`);
    }
  });
}

function gdRenderSettings() {
  const pane = document.getElementById('gd-pane-settings');
  if (!pane) return;
  pane.innerHTML = `
    <div class="gd-settings-title">系统管理</div>
    <div class="gd-settings-sub">维护工单模板与系统参数；交付成员与服务标签配置已迁移至“交付组织”</div>

    <div class="gd-card" style="margin-bottom:16px;">
      <div class="gd-section-title" style="margin-bottom:14px;">工单模板配置</div>
      <div class="gd-table-wrap">
        <table class="gd-table">
          <thead><tr><th>模板名称</th><th>适用工单类型</th><th>适用模块</th><th>更新时间</th><th>操作</th></tr></thead>
          <tbody>
            ${[
              ['一类工单-标准模板', '一类工单', '数据 / 试算 / 报告', '2026-03-24'],
              ['二类工单-数据模板', '二类工单', '数据', '2026-03-23'],
              ['三类工单-驻场模板', '三类工单', '底稿', '2026-03-22'],
            ].map(([name, type, mod, time]) => `
              <tr>
                <td>${name}</td>
                <td>${type}</td>
                <td>${mod}</td>
                <td style="color:#6B7280;">${time}</td>
                <td><button class="gd-btn gd-btn-ghost gd-btn-sm" onclick="showNotification('模板编辑功能即将上线')">编辑</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="gd-card">
      <div class="gd-section-title">系统信息</div>
      <div class="gd-sys-info-grid">
        <div class="gd-sys-info-item"><div class="gd-sys-info-label">系统版本</div><div class="gd-sys-info-val">小审 3.0 · 工单中心 v2.2</div></div>
        <div class="gd-sys-info-item"><div class="gd-sys-info-label">交付组织数</div><div class="gd-sys-info-val">${GD_DELIVERY_ORGS.length} 个</div></div>
        <div class="gd-sys-info-item"><div class="gd-sys-info-label">演示身份</div><div class="gd-sys-info-val">${gdGetDemoRoleLabel()}</div></div>
        <div class="gd-sys-info-item"><div class="gd-sys-info-label">系统状态</div><div class="gd-sys-info-val ok">运行正常</div></div>
      </div>
    </div>`;
}

function gdRefreshLists() {
  if (gdState.currentTab === 'workorders') gdRenderWorkOrders();
  if (gdState.currentTab === 'schedule') gdRenderSchedule();
  if (gdState.currentTab === 'deliveryorgs') gdRenderDeliveryOrgs();
}

function gdSwitchTab(tab) {
  gdState.currentTab = tab;
  document.querySelectorAll('.gd-nav-tab').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.gdtab === tab)
  );
  document.querySelectorAll('.gd-pane').forEach(pane =>
    pane.classList.toggle('active', pane.id === `gd-pane-${tab}`)
  );
  const renderers = {
    workorders: gdRenderWorkOrders,
    schedule: gdRenderSchedule,
    reports: gdRenderReports,
    messages: gdRenderMessages,
    deliveryorgs: gdRenderDeliveryOrgs,
    settings: gdRenderSettings,
  };
  renderers[tab] && renderers[tab]();
}
