/* ══════════════════════════════════════════════════════════
   rc.js — 风控中心模块
   5个Tab：送审单总览 / 人员排期 / 统计报表 / 消息中心 / 风控组织
   ══════════════════════════════════════════════════════════ */

/* ────────────────── 风控组织 Mock 数据 ────────────────── */

const RC_ORGS = [
  { id: 'rc-org-1', name: '风控一组', ownerId: 'EMP013', ownerName: '徐鹏', sourceDept: '风险管理部', desc: '负责 A 类客户项目的风控审核' },
  { id: 'rc-org-2', name: '风控二组', ownerId: 'EMP015', ownerName: '韩磊', sourceDept: '风险管理部', desc: '负责 B 类客户项目的风控审核' },
  { id: 'rc-org-3', name: '综合风控组', ownerId: 'EMP014', ownerName: '沈瑶', sourceDept: '风险管理部', desc: '跨部门综合风控与质量稽核' },
];

const RC_ORG_MEMBERS = {
  'rc-org-1': [
    { id: 'rc1-m1', userId: 'EMP013', name: '徐鹏',   roles: ['rc_owner'],                       dept: '风险管理部', phone: '158****6601', joinedAt: '2026-01-10', validUntil: '', status: 'joined' },
    { id: 'rc1-m2', userId: 'EMP020', name: '唐敏',   roles: ['rc_secretary'],                    dept: '风险管理部', phone: '151****6608', joinedAt: '2026-01-12', validUntil: '', status: 'joined' },
    { id: 'rc1-m3', userId: 'EMP017', name: '方毅',   roles: ['rc_25_reviewer'],                  dept: '风险管理部', phone: '155****6605', joinedAt: '2026-01-15', validUntil: '', status: 'joined' },
    { id: 'rc1-m4', userId: 'EMP018', name: '邓丽华', roles: ['rc_2_reviewer'],                    dept: '风险管理部', phone: '153****6606', joinedAt: '2026-01-20', validUntil: '', status: 'joined' },
    { id: 'rc1-m5', userId: 'EMP022', name: '林雪',   roles: ['rc_secretary','rc_25_reviewer'],    dept: '风险管理部', phone: '189****6610', joinedAt: '2026-02-01', validUntil: '2026-06-30', status: 'joined' },
    { id: 'rc1-m6', userId: 'EMP019', name: '钟伟',   roles: ['rc_2_reviewer'],                    dept: '风险管理部', phone: '152****6607', joinedAt: '2026-02-10', validUntil: '', status: 'left', leftAt: '2026-03-15' },
  ],
  'rc-org-2': [
    { id: 'rc2-m1', userId: 'EMP015', name: '韩磊',   roles: ['rc_owner'],                       dept: '风险管理部', phone: '157****6603', joinedAt: '2026-01-10', validUntil: '', status: 'joined' },
    { id: 'rc2-m2', userId: 'EMP016', name: '曹颖',   roles: ['rc_secretary'],                    dept: '风险管理部', phone: '156****6604', joinedAt: '2026-01-12', validUntil: '', status: 'joined' },
    { id: 'rc2-m3', userId: 'EMP021', name: '任刚',   roles: ['rc_25_reviewer','rc_2_reviewer'],   dept: '风险管理部', phone: '150****6609', joinedAt: '2026-01-15', validUntil: '', status: 'joined' },
    { id: 'rc2-m4', userId: 'EMP013', name: '徐鹏',   roles: ['rc_25_reviewer'],                  dept: '风险管理部', phone: '158****6601', joinedAt: '2026-02-05', validUntil: '', status: 'joined' },
  ],
  'rc-org-3': [
    { id: 'rc3-m1', userId: 'EMP014', name: '沈瑶',   roles: ['rc_owner'],                       dept: '风险管理部', phone: '159****6602', joinedAt: '2026-01-05', validUntil: '', status: 'joined' },
    { id: 'rc3-m2', userId: 'EMP020', name: '唐敏',   roles: ['rc_secretary','rc_2_reviewer'],     dept: '风险管理部', phone: '151****6608', joinedAt: '2026-01-08', validUntil: '', status: 'joined' },
    { id: 'rc3-m3', userId: 'EMP017', name: '方毅',   roles: ['rc_25_reviewer'],                  dept: '风险管理部', phone: '155****6605', joinedAt: '2026-01-15', validUntil: '', status: 'joined' },
    { id: 'rc3-m4', userId: 'EMP018', name: '邓丽华', roles: ['rc_2_reviewer'],                    dept: '风险管理部', phone: '153****6606', joinedAt: '2026-01-20', validUntil: '', status: 'joined' },
    { id: 'rc3-m5', userId: 'EMP019', name: '钟伟',   roles: ['rc_25_reviewer','rc_2_reviewer'],   dept: '风险管理部', phone: '152****6607', joinedAt: '2026-02-01', validUntil: '', status: 'joined' },
    { id: 'rc3-m6', userId: 'EMP016', name: '曹颖',   roles: ['rc_secretary'],                    dept: '风险管理部', phone: '156****6604', joinedAt: '2026-03-01', validUntil: '', status: 'left', leftAt: '2026-03-20' },
  ],
};

const RC_ROLE_PRESETS = [
  { id: 'rc_owner',       name: '风控负责人',  desc: '负责风控组织成员管理与送审审批策略配置', color: '#6366F1', builtin: true },
  { id: 'rc_secretary',   name: '秘书',       desc: '负责风控流程材料收发、日程协调与归档',   color: '#0EA5E9', builtin: true },
  { id: 'rc_25_reviewer', name: '2.5审老师',  desc: '对送审项目进行 2.5 级复核与质量把关',    color: '#10B981', builtin: true },
  { id: 'rc_2_reviewer',  name: '二审老师',    desc: '对送审项目进行最终二级审核与签发决策',   color: '#F59E0B', builtin: true },
];

const RC_PERMISSION_MODULES = [
  {
    id: 'rc_org',
    label: '组织管理',
    groups: [
      {
        id: 'rc_org_view',
        label: '查看权限',
        perms: [
          { id: 'rc_org_view_profile', label: '组织信息查看', desc: '查看风控组织概览与负责人信息' },
          { id: 'rc_org_view_members', label: '成员管理查看', desc: '查看成员列表、加入状态与角色分布' },
          { id: 'rc_org_view_roles',   label: '角色权限查看', desc: '查看角色权限与适用范围配置' },
        ],
      },
      {
        id: 'rc_org_admin',
        label: '管理权限',
        perms: [
          { id: 'rc_org_admin_member', label: '成员添加/移出', desc: '管理风控组织成员资格' },
          { id: 'rc_org_admin_role',   label: '角色配置修改', desc: '新增角色并调整权限范围' },
        ],
      },
    ],
  },
  {
    id: 'rc_review',
    label: '送审协同',
    groups: [
      {
        id: 'rc_review_view',
        label: '查看权限',
        perms: [
          { id: 'rc_review_list',    label: '送审单查看', desc: '查看本组织负责的送审单列表' },
          { id: 'rc_review_detail',  label: '送审详情查看', desc: '查看送审项目的详细材料与审核记录' },
          { id: 'rc_review_schedule',label: '排期查看',   desc: '查看成员排期与负载分布' },
        ],
      },
      {
        id: 'rc_review_operate',
        label: '操作权限',
        perms: [
          { id: 'rc_review_assign',  label: '送审分配',   desc: '为组织成员分配送审任务' },
          { id: 'rc_review_approve', label: '审核签发',   desc: '对送审项目进行审核与签发' },
          { id: 'rc_review_reject',  label: '送审驳回',   desc: '驳回不符合标准的送审项目' },
          { id: 'rc_review_comment', label: '批注反馈',   desc: '在送审材料上添加批注意见' },
        ],
      },
    ],
  },
  {
    id: 'rc_report',
    label: '统计报表',
    groups: [
      {
        id: 'rc_report_view',
        label: '查看权限',
        perms: [
          { id: 'rc_report_stats',    label: '统计数据查看', desc: '查看风控工作量与效率统计' },
          { id: 'rc_report_export',   label: '报表导出',    desc: '导出风控统计报表' },
        ],
      },
    ],
  },
];

/* ────────────────── 状态 ────────────────── */

let rcState = {
  currentTab: 'orders',
  selectedOrgId: 'rc-org-1',
  innerTab: 'members',
  memberStatus: 'joined',
  memberSearch: '',
  memberPage: 1,
  memberSelected: new Set(),
  selectedRoleId: 'rc_owner',
  rolePermDirty: false,
  roleCollapsedModules: new Set(),
  paneScrollTop: 0,
  roleScrollTop: 0,
};

const rcRoleConfigs = {};

function rcGetRoleConfig(orgId) {
  if (!rcRoleConfigs[orgId]) {
    const roles = RC_ROLE_PRESETS.map(r => ({ ...r }));
    const permState = {};
    roles.forEach(r => {
      permState[r.id] = {};
      RC_PERMISSION_MODULES.forEach(mod => {
        mod.groups.forEach(g => {
          g.perms.forEach(p => {
            permState[r.id][p.id] = (r.id === 'rc_owner');
          });
        });
      });
    });
    rcRoleConfigs[orgId] = { roles, permState };
  }
  return rcRoleConfigs[orgId];
}

/* ────────────────── 初始化 ────────────────── */

function initRc() {
  document.querySelectorAll('#rc-nav .gd-nav-tab[data-rctab]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#rc-nav .gd-nav-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.rctab;
      rcState.currentTab = tab;
      document.querySelectorAll('#biz-panel-riskctl .gd-pane').forEach(p => { p.classList.remove('active'); p.style.display = 'none'; });
      const pane = document.getElementById('rc-pane-' + tab);
      if (pane) { pane.style.display = 'block'; pane.classList.add('active'); }
      const renderers = {
        orders: rcRenderOrders,
        schedule: rcRenderSchedule,
        reports: rcRenderReports,
        messages: rcRenderMessages,
        orgs: rcRenderOrgs,
      };
      if (renderers[tab]) renderers[tab]();
    });
  });
  rcRenderOrders();
}

/* ────────────────── Tab 渲染 — 空占位 ────────────────── */

function rcEmptyPane(title, desc, iconPath) {
  return `
    <div class="rc-empty-pane">
      <svg viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="1.5" stroke-linecap="round" width="52" height="52">${iconPath}</svg>
      <div class="rc-empty-title">${title}</div>
      <div class="rc-empty-desc">${desc}</div>
    </div>`;
}

let rcOrdersState = { tab: '二审', search: '', selectedIds: new Set() };

function rcGetOrgOrders(orgId, type) {
  return RC_REVIEW_ORDERS.filter(o => o.orgId === orgId && o.type === type);
}

function rcRenderOrders() {
  const pane = document.getElementById('rc-pane-orders');
  if (!pane) return;

  const orgId = rcState.selectedOrgId;
  const org = RC_ORGS.find(o => o.id === orgId) || RC_ORGS[0];
  const tab = rcOrdersState.tab;

  const secondCount = rcGetOrgOrders(orgId, '二审').length;
  const halfCount = rcGetOrgOrders(orgId, '2.5审').length;
  const orders = rcGetOrgOrders(orgId, tab);

  const q = rcOrdersState.search.trim().toLowerCase();
  const filtered = q ? orders.filter(o =>
    o.id.toLowerCase().includes(q) || o.company.toLowerCase().includes(q) ||
    o.teacherName.toLowerCase().includes(q) || (o.projectContact||'').toLowerCase().includes(q)
  ) : orders;

  const st = rcOrdersState.selectedIds;
  const allChecked = filtered.length > 0 && filtered.every(o => st.has(o.id));

  const isSecond = tab === '二审';
  const planH = isSecond ? '预计送二审时间' : '预计送2.5审时间';
  const actualH = isSecond ? '实际送二审时间' : '实际送2.5审时间';
  const teacherH = isSecond ? '二审老师' : '2.5审老师';

  const rows = filtered.map(o => {
    const sel = st.has(o.id);
    const title = `${o.type}-${o.company}-${o.reportType}`;
    const sm = RV_STATUS_MAP[o.status] || { color: '#6B7280', bg: '#F3F4F6' };
    const planDisplay = o.planFirstReviewDate ? o.planFirstReviewDate.replace('T', ' ') : '—';
    const actualDisplay = o.actualReviewDate || '—';
    return `<tr class="${sel?'rv-row-selected':''} rv-clickable-row" onclick="rvOpenDetail('${o.id}','rc')">
      <td style="text-align:center;" onclick="event.stopPropagation()"><input type="checkbox" ${sel?'checked':''} onchange="rcOrdToggle('${o.id}',this.checked)"></td>
      <td><span class="rv-order-id">${o.id}</span></td>
      <td title="${title}"><span class="rv-order-title">${title}</span></td>
      <td>${o.projectContact||'—'}</td>
      <td title="${o.company}"><span class="rv-ellipsis">${o.company}</span></td>
      <td>${o.reportType||'—'}</td>
      <td class="rv-mono">${planDisplay}</td>
      <td class="rv-mono">${actualDisplay}</td>
      <td>${o.teacherName||'—'}</td>
      <td style="position:sticky;right:60px;z-index:1;background:#fff;">
        <span class="rv-status-badge" style="color:${sm.color};background:${sm.bg};">${o.status}</span>
      </td>
      <td style="position:sticky;right:0;z-index:1;background:#fff;" onclick="event.stopPropagation()">
        <div class="rv-ops">
          ${o.status==='审核中'?`
          <button class="rv-op-btn" title="Q单出具" onclick="rvActionQIssue('${o.id}');rcRenderOrders()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </button>` : o.status==='待清Q'?`
          <button class="rv-op-btn" title="清Q通过" onclick="rvActionPassClearQ('${o.id}');rcRenderOrders()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
          </button>` : '<span style="color:#D1D5DB;">—</span>'}
        </div>
      </td>
    </tr>`;
  }).join('');

  const thead = `<tr>
    <th style="width:36px;text-align:center;"><input type="checkbox" ${allChecked&&filtered.length?'checked':''} onchange="rcOrdToggleAll(this.checked)"></th>
    <th style="min-width:130px;">送审单编号</th>
    <th style="min-width:140px;">送审单标题</th>
    <th style="width:90px;">项目组对接人</th>
    <th style="min-width:150px;">主体公司名称</th>
    <th style="width:90px;">财务报表类型</th>
    <th style="width:130px;">${planH}</th>
    <th style="width:130px;">${actualH}</th>
    <th style="width:80px;">${teacherH}</th>
    <th style="width:80px;position:sticky;right:60px;z-index:2;background:#F8FAFC;">状态</th>
    <th style="width:60px;position:sticky;right:0;z-index:2;background:#F8FAFC;">操作</th>
  </tr>`;

  pane.innerHTML = `
    <div class="rv-mgr-panel">
      <!-- 组织选择 -->
      <div class="rc-ord-org-bar">
        <span class="rc-ord-org-label">风控组织：</span>
        ${RC_ORGS.map(o => `
          <button class="rc-ord-org-btn ${o.id===orgId?'active':''}" onclick="rcState.selectedOrgId='${o.id}';rcOrdersState.selectedIds.clear();rcRenderOrders()">${o.name}</button>
        `).join('')}
      </div>

      <!-- Tab + 搜索 -->
      <div class="rv-tab-bar">
        <div class="rv-tabs">
          <button class="rv-tab ${tab==='二审'?'active':''}" onclick="rcOrdersState.tab='二审';rcOrdersState.selectedIds.clear();rcRenderOrders()">
            二审 <span class="rv-tab-badge">${secondCount}</span>
          </button>
          <button class="rv-tab ${tab==='2.5审'?'active':''}" onclick="rcOrdersState.tab='2.5审';rcOrdersState.selectedIds.clear();rcRenderOrders()">
            2.5审 <span class="rv-tab-badge">${halfCount}</span>
          </button>
        </div>
        <div class="rv-toolbar">
          <div class="rv-search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" width="14" height="14"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input class="rv-search-input" placeholder="搜索编号、公司、老师..." value="${rcOrdersState.search}" oninput="rcOrdersState.search=this.value;rcRenderOrders()">
          </div>
        </div>
      </div>

      <!-- 列表 -->
      <div class="rv-table-wrap">
        ${filtered.length ? `<table class="rv-table"><thead>${thead}</thead><tbody>${rows}</tbody></table>`
          : `<div class="rv-empty"><svg viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="1.5" width="40" height="40"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg><p>暂无${tab}送审单</p></div>`}
      </div>
    </div>`;
}

function rcOrdToggle(id, checked) {
  if (checked) rcOrdersState.selectedIds.add(id); else rcOrdersState.selectedIds.delete(id);
  rcRenderOrders();
}
function rcOrdToggleAll(checked) {
  const orders = rcGetOrgOrders(rcState.selectedOrgId, rcOrdersState.tab);
  if (checked) orders.forEach(o => rcOrdersState.selectedIds.add(o.id)); else rcOrdersState.selectedIds.clear();
  rcRenderOrders();
}

/* ═══════════════════════════════════════════════════════
   风控中心 — 人员排期
   ═══════════════════════════════════════════════════════ */

let rcSchState = {
  orgId: 'rc-org-1',
  timeMode: 'week',
  date: new Date(),
};

const RC_REVIEW_TYPE_PALETTE = {
  '一审':  { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
  '二审':  { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  '2.5审': { bg: '#EDE9FE', text: '#5B21B6', border: '#C4B5FD' },
};

const RC_STATUS_PALETTE = {
  '待启用': { bg: '#F3F4F6', text: '#6B7280', border: '#D1D5DB' },
  '审核中': { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
  'Q单出具': { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  '待清Q':  { bg: '#EDE9FE', text: '#5B21B6', border: '#C4B5FD' },
  '清Q完成': { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
};

function rcSchFmt(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function rcSchStartOfWeek(d) {
  const r = new Date(d);
  r.setDate(r.getDate() - ((r.getDay() + 6) % 7));
  r.setHours(0,0,0,0);
  return r;
}

function rcSchBuildDates(start, end) {
  const arr = [];
  const cur = new Date(start);
  while (cur <= end) { arr.push(new Date(cur)); cur.setDate(cur.getDate() + 1); }
  return arr;
}

function rcSchGetRange() {
  const mode = rcSchState.timeMode;
  const anchor = new Date(rcSchState.date);
  let start, end;
  if (mode === 'day') { start = anchor; end = new Date(anchor); }
  else if (mode === 'month') { start = new Date(anchor.getFullYear(), anchor.getMonth(), 1); end = new Date(anchor.getFullYear(), anchor.getMonth()+1, 0); }
  else { start = rcSchStartOfWeek(anchor); end = new Date(start); end.setDate(end.getDate()+6); }

  let label = `${rcSchFmt(start)} 至 ${rcSchFmt(end)}`;
  if (mode === 'day') label = rcSchFmt(start);
  if (mode === 'month') label = `${start.getFullYear()}年${start.getMonth()+1}月`;
  return { mode, start, end, dates: rcSchBuildDates(start, end), label, startKey: rcSchFmt(start), endKey: rcSchFmt(end) };
}

function rcSchGetMembers(orgId) {
  const members = (RC_ORG_MEMBERS[orgId] || []).filter(m => m.status !== 'left');
  return members.sort((a, b) => {
    const roleOrder = { rc_owner: 0, rc_secretary: 1, rc_25_reviewer: 2, rc_2_reviewer: 3 };
    const aMin = Math.min(...a.roles.map(r => roleOrder[r] ?? 99));
    const bMin = Math.min(...b.roles.map(r => roleOrder[r] ?? 99));
    return aMin - bMin || a.name.localeCompare(b.name, 'zh-CN');
  });
}

function rcSchRoleLabel(roles) {
  const map = { rc_owner: '风控负责人', rc_secretary: '秘书', rc_25_reviewer: '2.5审老师', rc_2_reviewer: '二审老师' };
  return roles.map(r => map[r] || r).join('、');
}

function rcSchMapOrder(o) {
  const startRaw = o.actualReviewDate || (o.planFirstReviewDate ? o.planFirstReviewDate.replace('T', ' ') : '');
  const endRaw = o.qClearTime || (o.planReviewEndDate ? o.planReviewEndDate.replace('T', ' ') : '');
  const startDate = startRaw ? startRaw.slice(0, 10) : '';
  const endDate = endRaw ? endRaw.slice(0, 10) : '';
  if (!startDate || !endDate) return null;
  return {
    id: o.id,
    title: `${o.type}-${o.company}`,
    type: o.type,
    status: o.status,
    company: o.company,
    reportType: o.reportType,
    teacherName: o.teacherName,
    teacherId: o.teacherId,
    startDate,
    endDate: endDate < startDate ? startDate : endDate,
  };
}

function rcSchGetItemsForOrg(orgId) {
  const members = rcSchGetMembers(orgId);
  const memberIds = new Set(members.map(m => m.userId));
  const memberNames = new Set(members.map(m => m.name));
  return RC_REVIEW_ORDERS
    .filter(o => memberIds.has(o.teacherId) || memberNames.has(o.teacherName))
    .map(rcSchMapOrder)
    .filter(Boolean);
}

function rcSchItemsForMember(items, member) {
  return items
    .filter(it => it.teacherId === member.userId || it.teacherName === member.name)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

function rcSchGetDefaultDate(orgId) {
  const items = rcSchGetItemsForOrg(orgId);
  if (!items.length) return new Date();
  const starts = items.map(it => it.startDate).sort();
  const now = rcSchFmt(new Date());
  const future = starts.filter(s => s >= now);
  return new Date(future.length ? future[0] : starts[starts.length - 1]);
}

function rcSchNav(dir) {
  const d = new Date(rcSchState.date);
  if (rcSchState.timeMode === 'day') d.setDate(d.getDate() + dir);
  else if (rcSchState.timeMode === 'month') d.setMonth(d.getMonth() + dir);
  else d.setDate(d.getDate() + dir * 7);
  rcSchState.date = d;
  rcRenderSchedule();
}

function rcSchSetTime(mode) { rcSchState.timeMode = mode; rcRenderSchedule(); }
function rcSchSetOrg(orgId) {
  rcSchState.orgId = orgId;
  rcSchState.date = rcSchGetDefaultDate(orgId);
  rcRenderSchedule();
}

function rcRenderSchedule() {
  const pane = document.getElementById('rc-pane-schedule');
  if (!pane) return;

  const orgId = rcSchState.orgId;
  const org = RC_ORGS.find(o => o.id === orgId) || RC_ORGS[0];
  if (!rcSchState._inited) {
    rcSchState.date = rcSchGetDefaultDate(orgId);
    rcSchState._inited = true;
  }
  const range = rcSchGetRange();
  const members = rcSchGetMembers(orgId);
  const allItems = rcSchGetItemsForOrg(orgId);
  const visibleItems = allItems.filter(it => it.startDate <= range.endKey && it.endDate >= range.startKey);
  const TODAY_KEY = rcSchFmt(new Date());
  const WD = ['日','一','二','三','四','五','六'];

  const memberRows = members.map(m => {
    const mItems = rcSchItemsForMember(visibleItems, m);
    const load = mItems.length;
    const cells = range.dates.map(date => {
      const key = rcSchFmt(date);
      const dayItems = mItems.filter(it => it.startDate <= key && it.endDate >= key);
      const isToday = key === TODAY_KEY;
      return `<td class="day-col${isToday ? ' today-col' : ''}">
        <div class="gd-schedule-cell">
          ${dayItems.length ? dayItems.map(it => {
            const isStart = key === it.startDate;
            const p = RC_REVIEW_TYPE_PALETTE[it.type] || RC_STATUS_PALETTE[it.status] || { bg:'#F3F4F6', text:'#374151', border:'#D1D5DB' };
            const title = `${it.title}\n${it.reportType} · ${it.status}\n${it.startDate} 至 ${it.endDate}`;
            const clickAttr = ` onclick="event.stopPropagation();rvOpenDetail('${it.id}','rc')"`;
            return `<div class="gd-sch-item gd-sch-order ${!isStart?'continuation':''}"
              style="--sch-bg:${p.bg};--sch-text:${p.text};--sch-border:${p.border};"
              title="${title.replace(/"/g,'&quot;')}"${clickAttr}>
              ${isStart ? `
                <div class="sch-title">${it.title}</div>
                <div class="sch-meta"><span>${it.status}</span><span>至 ${it.endDate}</span></div>`
                : `<div class="sch-dots">${it.type} · ${it.status}</div>`}
            </div>`;
          }).join('') : '<div class="gd-schedule-empty"></div>'}
        </div>
      </td>`;
    }).join('');

    return `<tr>
      <td class="user-col">
        <div class="gd-schedule-user-name">${m.name}</div>
        <div class="gd-schedule-user-dept">${rcSchRoleLabel(m.roles)} · ${m.dept}</div>
        <div class="gd-schedule-user-load">当前范围 ${load} 个送审单</div>
      </td>
      ${cells}
    </tr>`;
  }).join('');

  const legendHtml = ['二审','2.5审'].map(t => {
    const p = RC_REVIEW_TYPE_PALETTE[t];
    return `<div class="gd-legend-item"><div class="gd-legend-dot" style="background:${p.bg};border-color:${p.border};"></div><span>${t}</span></div>`;
  }).join('');

  pane.innerHTML = `
    <div class="gd-schedule-topbar">
      <div>
        <div class="gd-schedule-title">人员排期</div>
        <div class="gd-schedule-sub">展示当前风控组织的成员送审单排期，排期块根据送审单时间自动生成。</div>
      </div>
      <div class="gd-schedule-summary">
        <label class="gd-schedule-org-field">
          <span>风控组织</span>
          <select class="gd-filter-input gd-schedule-org-select" onchange="rcSchSetOrg(this.value)">
            ${RC_ORGS.map(o => `<option value="${o.id}" ${o.id===orgId?'selected':''}>${o.name}</option>`).join('')}
          </select>
        </label>
        <div class="gd-schedule-stat-card"><strong>${members.length}</strong><span>成员</span></div>
        <div class="gd-schedule-stat-card"><strong>${visibleItems.length}</strong><span>当前范围送审单</span></div>
      </div>
    </div>

    <div class="gd-schedule-controls">
      <div class="gd-schedule-left">
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="gd-ctrl-label">时间：</span>
          <div class="gd-ctrl-group">
            <button class="gd-ctrl-btn ${rcSchState.timeMode==='day'?'active':''}" onclick="rcSchSetTime('day')">日</button>
            <button class="gd-ctrl-btn ${rcSchState.timeMode==='week'?'active':''}" onclick="rcSchSetTime('week')">周</button>
            <button class="gd-ctrl-btn ${rcSchState.timeMode==='month'?'active':''}" onclick="rcSchSetTime('month')">月</button>
          </div>
        </div>
        <div class="gd-schedule-nav">
          <button class="gd-nav-arrow" onclick="rcSchNav(-1)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="gd-schedule-period">
            <svg viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" width="15" height="15"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>${range.label}</span>
          </div>
          <button class="gd-nav-arrow" onclick="rcSchNav(1)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
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
              const key = rcSchFmt(date);
              const isToday = key === TODAY_KEY;
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              return `<th class="${isToday ? 'today-hd' : isWeekend ? 'weekend-hd' : ''}">
                <div>周${WD[date.getDay()]}</div>
                <div style="font-size:0.7rem;font-weight:400;">${date.getMonth()+1}/${date.getDate()}</div>
              </th>`;
            }).join('')}
          </tr>
        </thead>
        <tbody>${memberRows}</tbody>
      </table>` : `
      <div class="gd-empty-center" style="padding:48px 16px;">
        <div>当前风控组织暂无在岗成员</div>
      </div>`}
    </div>

    <div class="gd-legend">${legendHtml}</div>`;
}

/* ═══════════════════════════════════════════════════════
   风控中心 — 统计报表
   ═══════════════════════════════════════════════════════ */

const RC_RPT_MOCK_ORDERS = (() => {
  const teachers2 = [
    { name: '范冬梅', orgId: 'rc-org-1' }, { name: '邓丽华', orgId: 'rc-org-1' },
    { name: '陈文博', orgId: 'rc-org-2' }, { name: '林志强', orgId: 'rc-org-2' },
    { name: '方毅', orgId: 'rc-org-3' },
  ];
  const teachers25 = [
    { name: '周海涛', orgId: 'rc-org-1' }, { name: '任刚', orgId: 'rc-org-2' },
    { name: '方毅', orgId: 'rc-org-3' },
  ];
  const managers = ['张伟','李明','王芳','陈刚','刘洋','吴静','周梦','赵敏','陈伟','黄磊','林佳'];
  const statuses = ['待启用','审核中','Q单出具','待清Q','清Q完成'];
  const urgencies = ['常规','加急','特急'];
  const companies = ['比亚迪汽车（广东）有限公司','中国比亚迪有限公司','比亚迪新材料有限公司','比亚迪电子有限公司','比亚迪半导体有限公司'];
  const rng = (n) => Math.floor(Math.random() * n);
  const arr = [];
  for (let i = 0; i < 300; i++) {
    const type = i < 200 ? '二审' : '2.5审';
    const tList = type === '二审' ? teachers2 : teachers25;
    const t = tList[rng(tList.length)];
    const s = statuses[rng(statuses.length)];
    const m = managers[rng(managers.length)];
    const isAPT = rng(5) === 0 ? '是' : '否';
    const isSACP = rng(8) === 0 ? '是' : '否';
    const planDate = `2026-0${3 + rng(3)}-${String(1+rng(28)).padStart(2,'0')}`;
    arr.push({
      type, teacherName: t.name, orgId: t.orgId, status: s,
      projectManager: m, company: companies[rng(companies.length)],
      reportType: rng(2) ? '合并' : '单体',
      isAPT, isSACP, projectUrgency: urgencies[rng(urgencies.length)],
      planFirstReviewDate: planDate,
    });
  }
  return arr;
})();

function rcRptGetOrders() {
  return [...RC_REVIEW_ORDERS, ...RC_RPT_MOCK_ORDERS];
}

function rcRptCountByPerson(orders, personKey) {
  const map = {};
  orders.forEach(o => {
    const name = o[personKey] || '未知';
    map[name] = (map[name] || 0) + 1;
  });
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function rcRptIsOverdue(o) {
  if (!o.planFirstReviewDate) return false;
  const planDate = o.planFirstReviewDate.slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  return planDate < today;
}

function rcRptBarSvg(data, color, label, yLabel) {
  if (!data.length) return `<div style="text-align:center;color:#9CA3AF;padding:40px 0;font-size:0.82rem;">暂无数据</div>`;
  const maxV = Math.max(...data.map(d => d.count), 1);
  const w = 420, h = 200;
  const barW = Math.min(36, Math.max(14, (w - 60) / data.length - 6));
  const gridLines = [0, 1, 2, 3, 4].map(i => {
    const v = Math.round(maxV / 4 * i);
    const y = h - (i / 4) * h;
    return `<line x1="36" y1="${y}" x2="${w}" y2="${y}" stroke="#F3F4F6" stroke-width="1"/>
      <text x="32" y="${y + 4}" fill="#9CA3AF" font-size="9" text-anchor="end">${v}</text>`;
  }).join('');

  const bars = data.map((d, i) => {
    const x = 44 + i * ((w - 54) / data.length);
    const bh = Math.max(2, (d.count / maxV) * h);
    const ghostH = h;
    return `<rect x="${x - 2}" y="0" width="${barW + 4}" height="${ghostH}" rx="3" fill="${color}" opacity="0.08"/>
      <rect x="${x}" y="${h - bh}" width="${barW}" height="${bh}" rx="3" fill="${color}"/>
      <text x="${x + barW / 2}" y="${h - bh - 5}" fill="${color}" font-size="9" text-anchor="middle" font-weight="600">${d.count}</text>
      <text x="${x + barW / 2}" y="${h + 14}" fill="#6B7280" font-size="8" text-anchor="middle" transform="rotate(0)">${d.name.length > 3 ? d.name.slice(0, 3) : d.name}</text>`;
  }).join('');

  return `<div style="position:relative;">
    <div style="font-size:0.78rem;font-weight:600;color:#374151;margin-bottom:8px;">${label}</div>
    <div style="display:flex;justify-content:flex-end;gap:8px;margin-bottom:4px;">
      <div style="display:flex;align-items:center;gap:4px;font-size:0.7rem;color:#6B7280;">
        <div style="width:10px;height:10px;border-radius:2px;background:${color};"></div>记录数
      </div>
    </div>
    <div style="font-size:0.68rem;color:#9CA3AF;position:absolute;left:0;top:50%;transform:rotate(-90deg) translateX(-50%);transform-origin:0 0;">${yLabel || '项目数'}</div>
    <svg viewBox="0 0 ${w} ${h + 24}" width="100%" style="max-width:100%;">${gridLines}${bars}
      <text x="${w / 2}" y="${h + 23}" fill="#9CA3AF" font-size="9" text-anchor="middle">${data.length > 6 ? '' : ''}</text>
    </svg>
  </div>`;
}

function rcRptProgressCard(label, value, color, iconSvg) {
  return `<div style="background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:16px 18px;display:flex;flex-direction:column;gap:6px;min-width:0;">
    <div style="display:flex;align-items:center;gap:6px;">
      <svg viewBox="0 0 80 60" width="56" height="42">${iconSvg}</svg>
    </div>
    <div style="font-size:0.78rem;color:#6B7280;margin-top:2px;">${label}</div>
    <div style="font-size:1.5rem;font-weight:700;color:${color};">${value}</div>
  </div>`;
}

function rcRptProgressIcons() {
  return {
    total: '<rect x="5" y="15" width="12" height="28" rx="2" fill="#93C5FD"/><rect x="22" y="8" width="12" height="35" rx="2" fill="#60A5FA"/><rect x="39" y="20" width="12" height="23" rx="2" fill="#3B82F6"/><rect x="56" y="5" width="12" height="38" rx="2" fill="#2563EB"/>',
    notSent: '<rect x="10" y="10" width="25" height="25" rx="3" fill="#FCA5A5"/><rect x="40" y="15" width="15" height="20" rx="3" fill="#F87171"/><rect x="60" y="20" width="10" height="15" rx="3" fill="#EF4444"/>',
    sent: '<rect x="5" y="20" width="12" height="22" rx="2" fill="#93C5FD"/><rect x="22" y="12" width="12" height="30" rx="2" fill="#60A5FA"/><rect x="39" y="8" width="12" height="34" rx="2" fill="#3B82F6"/><rect x="56" y="15" width="12" height="27" rx="2" fill="#2563EB"/>',
    qIssued: '<rect x="8" y="10" width="18" height="30" rx="3" fill="#FCD34D"/><rect x="30" y="5" width="18" height="35" rx="3" fill="#FBBF24"/><rect x="52" y="15" width="18" height="25" rx="3" fill="#F59E0B"/>',
    cleared: '<rect x="5" y="18" width="12" height="24" rx="2" fill="#6EE7B7"/><rect x="22" y="10" width="12" height="32" rx="2" fill="#34D399"/><rect x="39" y="22" width="12" height="20" rx="2" fill="#10B981"/><rect x="56" y="14" width="12" height="28" rx="2" fill="#059669"/>',
    notOverdue: '<rect x="15" y="15" width="22" height="25" rx="3" fill="#67E8F9"/><rect x="42" y="10" width="22" height="30" rx="3" fill="#22D3EE"/>',
    overdue: '<rect x="15" y="12" width="22" height="28" rx="3" fill="#FCA5A5"/><rect x="42" y="18" width="22" height="22" rx="3" fill="#F87171"/>',
    major: '<rect x="10" y="10" width="25" height="30" rx="3" fill="#C4B5FD"/><rect x="42" y="15" width="25" height="25" rx="3" fill="#8B5CF6"/>',
    apt: '<rect x="10" y="12" width="20" height="28" rx="3" fill="#FDBA74"/><rect x="35" y="8" width="20" height="32" rx="3" fill="#FB923C"/><rect x="55" y="18" width="15" height="22" rx="3" fill="#F97316"/>',
    sacp: '<rect x="10" y="15" width="18" height="26" rx="3" fill="#D8B4FE"/><rect x="33" y="10" width="18" height="31" rx="3" fill="#C084FC"/><rect x="56" y="20" width="14" height="21" rx="3" fill="#A855F7"/>',
  };
}

let rcDashCharts = [];

function rcOpenReportConfig() {
  let overlay = document.getElementById('rc-dashboard-config');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'rc-dashboard-config';
    overlay.className = 'gd-dash-config-overlay';
    document.getElementById('rc-pane-reports').appendChild(overlay);
  }
  overlay.style.display = 'flex';
  rcRenderDashboardConfig();
}

function rcCloseDashboardConfig() {
  const overlay = document.getElementById('rc-dashboard-config');
  if (overlay) overlay.style.display = 'none';
}

let rcChartWiz = {
  chartType: 'bar', barSubType: 'grouped', paletteIdx: 0,
  datasource: 'rc-status', xField: '', sortBy: '横轴值',
  sortDir: '选项正序', xField2: '', chartName: '',
};

const RC_CHART_DATASOURCES = [
  { id: 'rc-status', name: '送审单状态统计' },
  { id: 'rc-type', name: '送审单类型分布' },
  { id: 'rc-teacher2', name: '二审老师工作量' },
  { id: 'rc-teacher25', name: '2.5审老师工作量' },
  { id: 'rc-manager', name: '项目负责人统计' },
  { id: 'rc-org', name: '风控组织分布' },
];

const RC_CHART_FIELDS = {
  'rc-status': ['状态', '数量'],
  'rc-type': ['类型', '数量'],
  'rc-teacher2': ['二审老师', '数量'],
  'rc-teacher25': ['2.5审老师', '数量'],
  'rc-manager': ['项目负责人', '数量'],
  'rc-org': ['风控组织', '数量'],
};

function rcResetChartWiz() {
  rcChartWiz = {
    chartType: 'bar', barSubType: 'grouped', paletteIdx: 0,
    datasource: 'rc-status', xField: '', sortBy: '横轴值',
    sortDir: '选项正序', xField2: '', chartName: '',
  };
}

function rcRenderDashboardConfig() {
  const overlay = document.getElementById('rc-dashboard-config');
  if (!overlay) return;
  const hasCharts = rcDashCharts.length > 0;

  overlay.innerHTML = `
    <div class="gd-dash-config-topbar">
      <div class="gd-dash-config-left">
        <button class="gd-dash-cfg-add-btn" onclick="rcOpenAddChartModal()">
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
        <button class="gd-dash-cfg-close-btn" onclick="rcCloseDashboardConfig()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div class="gd-dash-config-body ${hasCharts ? 'has-charts' : ''}">
      ${hasCharts ? rcRenderDashCharts() : rcRenderEmptyDash()}
    </div>
    <div class="gd-dash-watermark-layer">
      ${Array.from({ length: 80 }, () => '<span class="gd-dash-wm-text">小神审计</span>').join('')}
    </div>`;
}

function rcRenderEmptyDash() {
  return `
    <div class="gd-dash-empty">
      <div class="gd-dash-empty-illustrations">
        <div class="gd-dash-empty-card">
          <svg viewBox="0 0 120 80" width="120" height="80">
            <rect x="10" y="40" width="18" height="30" rx="3" fill="#93C5FD"/>
            <rect x="35" y="25" width="18" height="45" rx="3" fill="#60A5FA"/>
            <rect x="60" y="35" width="18" height="35" rx="3" fill="#93C5FD"/>
            <rect x="85" y="20" width="18" height="50" rx="3" fill="#3B82F6"/>
          </svg>
        </div>
        <div class="gd-dash-empty-card">
          <svg viewBox="0 0 120 80" width="120" height="80">
            <path d="M10 50 Q30 20 50 45 Q70 60 90 25 Q100 15 110 30" fill="none" stroke="#93C5FD" stroke-width="2.5"/>
            <path d="M10 55 Q30 35 50 50 Q70 65 90 35 Q100 28 110 40" fill="none" stroke="#60A5FA" stroke-width="2.5"/>
          </svg>
        </div>
        <div class="gd-dash-empty-card">
          <div class="gd-dash-empty-kpi">
            <span class="gd-dash-empty-yen">¥</span>
            <span class="gd-dash-empty-num">6,023</span>
          </div>
        </div>
      </div>
      <div class="gd-dash-empty-title">用仪表盘实时展示风控业务趋势</div>
      <div class="gd-dash-empty-desc">可添加柱状图、饼图、折线图等图表展示数据，关注风控动向，快速获取洞察。</div>
      <button class="gd-dash-empty-btn" onclick="rcOpenAddChartModal()">添加图表</button>
    </div>`;
}

function rcRenderDashCharts() {
  return `<div class="gd-dash-chart-grid">
    ${rcDashCharts.map((c, i) => `
      <div class="gd-dash-chart-item">
        <div class="gd-dash-chart-header">
          <span class="gd-dash-chart-title">${c.name || c.chartType + '图表'}</span>
          <div class="gd-dash-chart-actions">
            <button class="gd-dash-chart-act-btn" onclick="rcRemoveDashChart(${i})" title="删除">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
        <div class="gd-dash-chart-body">${rcRenderMockChart(c)}</div>
      </div>`).join('')}
  </div>`;
}

function rcRemoveDashChart(idx) { rcDashCharts.splice(idx, 1); rcRenderDashboardConfig(); }

function rcRenderMockChart(c) {
  const pal = GD_THEME_PALETTES[c.paletteIdx || 0];
  const orders = rcRptGetOrders();
  let data;
  if (c.datasource === 'rc-status') {
    data = ['待启用','审核中','Q单出具','待清Q','清Q完成'].map(s => ({ label: s, value: orders.filter(o => o.status === s).length }));
  } else if (c.datasource === 'rc-type') {
    data = ['二审','2.5审'].map(t => ({ label: t, value: orders.filter(o => o.type === t).length }));
  } else if (c.datasource === 'rc-teacher2') {
    data = rcRptCountByPerson(orders.filter(o => o.type === '二审'), 'teacherName').map(d => ({ label: d.name, value: d.count }));
  } else if (c.datasource === 'rc-teacher25') {
    data = rcRptCountByPerson(orders.filter(o => o.type === '2.5审'), 'teacherName').map(d => ({ label: d.name, value: d.count }));
  } else if (c.datasource === 'rc-manager') {
    data = rcRptCountByPerson(orders, 'projectManager').map(d => ({ label: d.name, value: d.count }));
  } else if (c.datasource === 'rc-org') {
    data = rcRptCountByPerson(orders, 'orgName').map(d => ({ label: d.name || '无', value: d.count }));
  } else {
    data = [{ label: '数据A', value: 5 }, { label: '数据B', value: 3 }];
  }
  const maxV = Math.max(...data.map(d => d.value), 1);
  const w = 400, h = 200, barW = Math.min(40, (w - 40) / data.length - 8);
  if (c.chartType === 'pie') {
    const total = data.reduce((s, d) => s + d.value, 0);
    const r = 70, cx2 = 100, cy2 = 90;
    let sa = 0;
    const slices = data.map((d, i) => {
      const angle = (d.value / total) * Math.PI * 2;
      const x1 = cx2 + r * Math.cos(sa), y1 = cy2 + r * Math.sin(sa);
      const x2 = cx2 + r * Math.cos(sa + angle), y2 = cy2 + r * Math.sin(sa + angle);
      sa += angle;
      return `<path d="M${cx2},${cy2} L${x1},${y1} A${r},${r} 0 ${angle > Math.PI ? 1 : 0},1 ${x2},${y2} Z" fill="${pal[i % pal.length]}"/>`;
    });
    return `<div style="display:flex;align-items:center;gap:24px;">
      <svg viewBox="0 0 200 180" width="200" height="180">${slices.join('')}</svg>
      <div style="display:flex;flex-direction:column;gap:6px;">
        ${data.map((d, i) => `<div style="display:flex;align-items:center;gap:6px;font-size:0.78rem;color:#374151;">
          <div style="width:10px;height:10px;border-radius:2px;background:${pal[i % pal.length]};"></div>${d.label}: ${d.value}
        </div>`).join('')}
      </div></div>`;
  }
  if (c.chartType === 'kpi') {
    return `<div style="display:flex;align-items:center;justify-content:center;padding:24px 0;">
      <div style="text-align:center;"><div style="font-size:2.4rem;font-weight:700;color:${pal[0]};">${orders.length}</div>
      <div style="font-size:0.82rem;color:#6B7280;margin-top:4px;">送审单总数</div></div></div>`;
  }
  return `<svg viewBox="0 0 ${w} ${h + 30}" width="100%" style="max-width:100%;">
    ${[0, 1, 2, 3, 4].map(i => { const v = Math.round(maxV / 4 * i); const y = h - (i / 4) * h;
      return `<line x1="30" y1="${y}" x2="${w}" y2="${y}" stroke="#F3F4F6" stroke-width="1"/>
        <text x="26" y="${y + 4}" fill="#9CA3AF" font-size="10" text-anchor="end">${v}</text>`;
    }).join('')}
    ${data.map((d, i) => { const x = 40 + i * ((w - 50) / data.length); const bh = (d.value / maxV) * h;
      return `<rect x="${x}" y="${h - bh}" width="${barW}" height="${bh}" rx="3" fill="${pal[i % pal.length]}"/>
        <text x="${x + barW / 2}" y="${h - bh - 6}" fill="#374151" font-size="10" text-anchor="middle" font-weight="600">${d.value}</text>
        <text x="${x + barW / 2}" y="${h + 16}" fill="#6B7280" font-size="9" text-anchor="middle">${d.label}</text>`;
    }).join('')}
  </svg>`;
}

function rcOpenAddChartModal() {
  rcResetChartWiz();
  let modal = document.getElementById('rc-add-chart-modal');
  if (!modal) { modal = document.createElement('div'); modal.id = 'rc-add-chart-modal'; modal.className = 'gd-chart-modal-overlay'; document.body.appendChild(modal); }
  modal.style.display = 'flex';
  rcRenderChartModal();
}

function rcCloseChartModal() {
  const modal = document.getElementById('rc-add-chart-modal');
  if (modal) modal.style.display = 'none';
}

function rcRenderChartModal() {
  const modal = document.getElementById('rc-add-chart-modal');
  if (!modal) return;
  const wiz = rcChartWiz;
  const fields = RC_CHART_FIELDS[wiz.datasource] || [];
  const showBarSub = wiz.chartType === 'bar';

  modal.innerHTML = `
    <div class="gd-chart-modal-box">
      <div class="gd-chart-modal-header">
        <span class="gd-chart-modal-title">添加图表</span>
        <button class="gd-chart-modal-close" onclick="rcCloseChartModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="gd-chart-modal-body">
        <div class="gd-chart-modal-left">
          <div class="gd-chart-cfg-section">
            <div class="gd-chart-cfg-label">图表类型</div>
            <div class="gd-chart-type-grid">
              ${GD_CHART_TYPES.map(t => `
                <button class="gd-chart-type-btn ${wiz.chartType === t.id ? 'active' : ''}" onclick="rcChartWiz.chartType='${t.id}';rcRenderChartModal()" title="${t.name}">
                  ${t.icon}<span>${t.name}</span>
                </button>`).join('')}
            </div>
            ${showBarSub ? `<div class="gd-chart-bar-sub">
              ${GD_BAR_SUBTYPES.map(s => `
                <button class="gd-chart-bar-sub-btn ${wiz.barSubType === s.id ? 'active' : ''}" onclick="rcChartWiz.barSubType='${s.id}';rcRenderChartModal()">${s.name}</button>`).join('')}
            </div>` : ''}
          </div>
          <div class="gd-chart-cfg-section">
            <div class="gd-chart-cfg-label">主题颜色</div>
            <div class="gd-chart-palette-row">
              ${GD_THEME_PALETTES.map((p, i) => `
                <button class="gd-chart-palette-btn ${wiz.paletteIdx === i ? 'active' : ''}" onclick="rcChartWiz.paletteIdx=${i};rcRenderChartModal()">
                  ${p.slice(0, 4).map(c2 => `<div style="width:12px;height:12px;border-radius:3px;background:${c2};"></div>`).join('')}
                </button>`).join('')}
            </div>
          </div>
          <div class="gd-chart-cfg-section">
            <div class="gd-chart-cfg-label">数据源</div>
            <select class="gd-filter-input" style="width:100%;" onchange="rcChartWiz.datasource=this.value;rcRenderChartModal()">
              ${RC_CHART_DATASOURCES.map(d => `<option value="${d.id}" ${wiz.datasource === d.id ? 'selected' : ''}>${d.name}</option>`).join('')}
            </select>
          </div>
          <div class="gd-chart-cfg-section">
            <div class="gd-chart-cfg-label">图表名称</div>
            <input class="gd-filter-input" style="width:100%;" placeholder="输入图表名称" value="${wiz.chartName}" oninput="rcChartWiz.chartName=this.value">
          </div>
        </div>
        <div class="gd-chart-modal-right">
          <div class="gd-chart-preview-title">预览</div>
          <div class="gd-chart-preview-area">
            ${rcRenderMockChart({ chartType: wiz.chartType, datasource: wiz.datasource, paletteIdx: wiz.paletteIdx })}
          </div>
        </div>
      </div>
      <div class="gd-chart-modal-footer">
        <button class="gd-btn gd-btn-ghost" onclick="rcCloseChartModal()">取消</button>
        <button class="gd-btn gd-btn-primary" onclick="rcAddChart()">添加</button>
      </div>
    </div>`;
}

function rcAddChart() {
  rcDashCharts.push({ ...rcChartWiz, name: rcChartWiz.chartName || rcChartWiz.datasource });
  rcCloseChartModal();
  rcRenderDashboardConfig();
}

function rcRenderReports() {
  const pane = document.getElementById('rc-pane-reports');
  if (!pane) return;

  const orgId = rcState.selectedOrgId;
  const orgName = (RC_ORGS.find(o => o.id === orgId) || {}).name || '—';
  const allOrders = rcRptGetOrders();
  const orgOrders = allOrders.filter(o => o.orgId === orgId);

  const total = orgOrders.length;
  const notSent = orgOrders.filter(o => o.status === '待启用').length;
  const sent = orgOrders.filter(o => ['审核中', 'Q单出具', '待清Q', '清Q完成'].includes(o.status)).length;
  const qIssued = orgOrders.filter(o => ['Q单出具', '待清Q', '清Q完成'].includes(o.status)).length;
  const cleared = orgOrders.filter(o => o.status === '清Q完成').length;
  const notSentNotOverdue = orgOrders.filter(o => o.status === '待启用' && !rcRptIsOverdue(o)).length;
  const notSentOverdue = orgOrders.filter(o => o.status === '待启用' && rcRptIsOverdue(o)).length;
  const majorCount = orgOrders.filter(o => o.projectUrgency === '特急').length;
  const aptCount = orgOrders.filter(o => o.isAPT === '是').length;
  const sacpCount = orgOrders.filter(o => o.isSACP === '是').length;
  const icons = rcRptProgressIcons();

  const mgrOrders = orgOrders;
  const mgrAll = rcRptCountByPerson(mgrOrders, 'projectManager');
  const mgrNotSent = rcRptCountByPerson(mgrOrders.filter(o => o.status === '待启用'), 'projectManager');
  const mgrSent = rcRptCountByPerson(mgrOrders.filter(o => ['审核中','Q单出具','待清Q','清Q完成'].includes(o.status)), 'projectManager');
  const mgrCleared = rcRptCountByPerson(mgrOrders.filter(o => o.status === '清Q完成'), 'projectManager');

  const t2Orders = orgOrders.filter(o => o.type === '二审');
  const t2All = rcRptCountByPerson(t2Orders, 'teacherName');
  const t2NotSent = rcRptCountByPerson(t2Orders.filter(o => o.status === '待启用'), 'teacherName');
  const t2Sent = rcRptCountByPerson(t2Orders.filter(o => ['审核中','Q单出具','待清Q','清Q完成'].includes(o.status)), 'teacherName');
  const t2Cleared = rcRptCountByPerson(t2Orders.filter(o => o.status === '清Q完成'), 'teacherName');
  const t2NotOverdue = rcRptCountByPerson(t2Orders.filter(o => o.status === '待启用' && !rcRptIsOverdue(o)), 'teacherName');
  const t2Overdue = rcRptCountByPerson(t2Orders.filter(o => o.status === '待启用' && rcRptIsOverdue(o)), 'teacherName');

  const t25Orders = orgOrders.filter(o => o.type === '2.5审');
  const t25All = rcRptCountByPerson(t25Orders, 'teacherName');
  const t25NotSent = rcRptCountByPerson(t25Orders.filter(o => o.status === '待启用'), 'teacherName');
  const t25Sent = rcRptCountByPerson(t25Orders.filter(o => ['审核中','Q单出具','待清Q','清Q完成'].includes(o.status)), 'teacherName');
  const t25Cleared = rcRptCountByPerson(t25Orders.filter(o => o.status === '清Q完成'), 'teacherName');
  const t25NotOverdue = rcRptCountByPerson(t25Orders.filter(o => o.status === '待启用' && !rcRptIsOverdue(o)), 'teacherName');
  const t25Overdue = rcRptCountByPerson(t25Orders.filter(o => o.status === '待启用' && rcRptIsOverdue(o)), 'teacherName');

  pane.innerHTML = `
    <div class="gd-report-topbar">
      <div>
        <div class="gd-report-title">统计报表</div>
        <div style="font-size:0.82rem;color:#6B7280;margin-top:2px;">查看风控中心各类统计数据和分析报告</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <label class="gd-schedule-org-field" style="margin-right:8px;">
          <span>风控组织</span>
          <select class="gd-filter-input gd-schedule-org-select" onchange="rcState.selectedOrgId=this.value;rcRenderReports()">
            ${RC_ORGS.map(o => `<option value="${o.id}" ${o.id === orgId ? 'selected' : ''}>${o.name}</option>`).join('')}
          </select>
        </label>
        <button class="gd-btn gd-btn-primary" onclick="rcOpenReportConfig()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          配置
        </button>
        <button class="gd-btn gd-btn-outline" onclick="showNotification('正在导出报表…')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          导出报表
        </button>
      </div>
    </div>

    <!-- 年审送审清Q进度表 -->
    <div class="rc-rpt-section">
      <div class="rc-rpt-section-header" style="background:linear-gradient(135deg,#FCA5A5 0%,#F87171 100%);color:#fff;padding:14px 20px;border-radius:12px 12px 0 0;font-size:1rem;font-weight:700;text-align:center;">
        年审送审清Q进度表（${orgName}）
      </div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;padding:16px 20px;background:#fff;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 12px 12px;">
        ${rcRptProgressCard('年审项目合计', total, '#2563EB', icons.total)}
        ${rcRptProgressCard('未送审合计', notSent, '#EF4444', icons.notSent)}
        ${rcRptProgressCard('已送审合计', sent, '#3B82F6', icons.sent)}
        ${rcRptProgressCard('已出Q合计', qIssued, '#F59E0B', icons.qIssued)}
        ${rcRptProgressCard('清Q完成合计', cleared, '#10B981', icons.cleared)}
        ${rcRptProgressCard('未送审（未逾期）', notSentNotOverdue, '#06B6D4', icons.notOverdue)}
        ${rcRptProgressCard('未送审（已逾期）', notSentOverdue, '#EF4444', icons.overdue)}
        ${rcRptProgressCard('重大项目合计', majorCount, '#8B5CF6', icons.major)}
        ${rcRptProgressCard('APT项目合计', aptCount, '#F97316', icons.apt)}
        ${rcRptProgressCard('SACP项目合计', sacpCount, '#A855F7', icons.sacp)}
      </div>
    </div>

    <!-- 项目负责人项目情况 -->
    <div class="rc-rpt-section" style="margin-top:24px;">
      <div style="font-size:1.1rem;font-weight:700;color:#111827;margin-bottom:14px;">项目负责人项目情况</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div class="gd-card" style="padding:16px;">${rcRptBarSvg(mgrAll, '#F59E0B', '年审项目数', '项目数')}</div>
        <div class="gd-card" style="padding:16px;">${rcRptBarSvg(mgrNotSent, '#F97316', '未送审项目数', '项目数')}</div>
        <div class="gd-card" style="padding:16px;">${rcRptBarSvg(mgrSent, '#B45309', '已送审项目数', '项目数')}</div>
        <div class="gd-card" style="padding:16px;">${rcRptBarSvg(mgrCleared, '#10B981', '清Q完成项目数', '项目数')}</div>
      </div>
    </div>

    <!-- 二审复核人项目情况 -->
    <div class="rc-rpt-section" style="margin-top:24px;">
      <div style="font-size:1.1rem;font-weight:700;color:#111827;margin-bottom:14px;">二审复核人项目情况</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div class="gd-card" style="padding:16px;">${rcRptBarSvg(t2All, '#F59E0B', '年审项目数', '项目数')}</div>
        <div class="gd-card" style="padding:16px;">${rcRptBarSvg(t2NotSent, '#F97316', '未送审项目数', '项目数')}</div>
        <div class="gd-card" style="padding:16px;">${rcRptBarSvg(t2Sent, '#B45309', '已送审项目数', '项目数')}</div>
        <div class="gd-card" style="padding:16px;">${rcRptBarSvg(t2Cleared, '#10B981', '清Q完成项目数', '项目数')}</div>
        <div class="gd-card" style="padding:16px;">${rcRptBarSvg(t2NotOverdue, '#06B6D4', '未送审（未逾期）', '项目数')}</div>
        <div class="gd-card" style="padding:16px;">${rcRptBarSvg(t2Overdue, '#3B82F6', '未送审（已逾期）', '项目数')}</div>
      </div>
    </div>

    <!-- 2.5审老师项目情况 -->
    <div class="rc-rpt-section" style="margin-top:24px;padding-bottom:32px;">
      <div style="font-size:1.1rem;font-weight:700;color:#111827;margin-bottom:14px;">2.5审老师项目情况</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div class="gd-card" style="padding:16px;">${rcRptBarSvg(t25All, '#F59E0B', '年审项目数', '项目数')}</div>
        <div class="gd-card" style="padding:16px;">${rcRptBarSvg(t25NotSent, '#F97316', '未送审项目数', '项目数')}</div>
        <div class="gd-card" style="padding:16px;">${rcRptBarSvg(t25Sent, '#B45309', '已送审项目数', '项目数')}</div>
        <div class="gd-card" style="padding:16px;">${rcRptBarSvg(t25Cleared, '#10B981', '清Q完成项目数', '项目数')}</div>
        <div class="gd-card" style="padding:16px;">${rcRptBarSvg(t25NotOverdue, '#06B6D4', '未送审（未逾期）', '项目数')}</div>
        <div class="gd-card" style="padding:16px;">${rcRptBarSvg(t25Overdue, '#3B82F6', '未送审（已逾期）', '项目数')}</div>
      </div>
    </div>`;
}

function rcRenderMessages() {
  const pane = document.getElementById('rc-pane-messages');
  if (!pane) return;
  pane.innerHTML = rcEmptyPane('消息中心', '风控消息通知功能即将上线，敬请期待',
    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>');
}

/* ────────────────── 风控组织 Tab ────────────────── */

function rcGetSelectedOrg() {
  return RC_ORGS.find(o => o.id === rcState.selectedOrgId) || RC_ORGS[0];
}

function rcSelectOrg(id) {
  rcState.selectedOrgId = id;
  rcState.innerTab = 'members';
  rcState.memberPage = 1;
  rcState.memberSelected = new Set();
  rcState.memberSearch = '';
  rcState.memberStatus = 'joined';
  rcState.rolePermDirty = false;
  rcState.paneScrollTop = 0;
  rcSyncSelectedRole(id);
  rcRenderOrgs();
}

function rcSyncSelectedRole(orgId) {
  const config = rcGetRoleConfig(orgId);
  if (!config.roles.find(r => r.id === rcState.selectedRoleId)) {
    rcState.selectedRoleId = config.roles[0]?.id || '';
  }
  return config.roles.find(r => r.id === rcState.selectedRoleId);
}

function rcGetMemberCounts(orgId) {
  const members = RC_ORG_MEMBERS[orgId] || [];
  return {
    joined: members.filter(m => m.status !== 'left').length,
    left: members.filter(m => m.status === 'left').length,
  };
}

function rcGetRoleMemberCount(orgId, roleId) {
  return (RC_ORG_MEMBERS[orgId] || []).filter(m => m.status !== 'left' && m.roles.includes(roleId)).length;
}

function rcRoleBadge(roles) {
  return roles.map(r => {
    const preset = RC_ROLE_PRESETS.find(p => p.id === r);
    if (!preset) return '';
    return `<span class="gd-tag" style="background:${preset.color}15;color:${preset.color};border:1px solid ${preset.color}30;font-size:0.72rem;padding:1px 7px;">${preset.name}</span>`;
  }).join(' ');
}

function rcGetRoleOptions() {
  return RC_ROLE_PRESETS.map(r => ({ value: r.id, label: r.name }));
}

function rcGetFilteredMembers(orgId) {
  const members = RC_ORG_MEMBERS[orgId] || [];
  const isJoined = rcState.memberStatus === 'joined';
  let list = members.filter(m => isJoined ? m.status !== 'left' : m.status === 'left');
  const q = rcState.memberSearch.trim().toLowerCase();
  if (q) {
    list = list.filter(m => m.name.toLowerCase().includes(q) || (m.dept||'').toLowerCase().includes(q) || (m.phone||'').includes(q));
  }
  return list;
}

function rcRenderOrgs() {
  const pane = document.getElementById('rc-pane-orgs');
  if (!pane) return;
  rcState.paneScrollTop = pane.scrollTop || 0;
  const existingRoleScroll = pane.querySelector('.gd-drp-perm-scroll');
  if (existingRoleScroll) rcState.roleScrollTop = existingRoleScroll.scrollTop || 0;

  const org = rcGetSelectedOrg();
  const counts = rcGetMemberCounts(org.id);

  pane.innerHTML = `
    <div class="gd-delorg-layout">
      <aside class="gd-delorg-side">
        <div class="gd-delorg-side-hd">
          <div>
            <div class="gd-settings-title" style="margin-bottom:2px;">风控组织</div>
            <div class="gd-settings-sub" style="margin-bottom:0;">搭建送审审核的风控团队</div>
          </div>
          <button class="gd-btn gd-btn-primary gd-btn-sm" onclick="rcOpenCreateOrg()">新建风控组织</button>
        </div>
        <div class="gd-delorg-list">
          ${RC_ORGS.map(item => `
            <button class="gd-delorg-card ${item.id===org.id?'active':''}" onclick="rcSelectOrg('${item.id}')">
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
              <div class="gd-delorg-orgmeta">所属部门：${org.sourceDept} · 风控负责人：${org.ownerName}</div>
            </div>
            <div class="gd-delorg-head-actions">
              <button class="gd-btn gd-btn-outline gd-btn-sm" onclick="rcOpenEditOrg()">编辑组织</button>
              <button class="gd-btn gd-btn-outline gd-btn-sm" onclick="rcOpenRemoveOrg()">移出组织</button>
            </div>
            <div class="gd-delorg-statgroup">
              <div class="gd-delorg-stat"><span class="gd-delorg-stat-label">已加入成员</span><strong>${counts.joined}</strong></div>
            </div>
          </div>
        </div>

        <div class="gd-subtab-bar gd-overview-tabs" style="margin-bottom:16px;">
          <button class="gd-subtab ${rcState.innerTab==='members'?'active':''}" onclick="rcState.innerTab='members';rcRenderOrgs()">成员管理</button>
          <button class="gd-subtab ${rcState.innerTab==='roles'?'active':''}" onclick="rcState.innerTab='roles';rcRenderOrgs()">角色权限</button>
        </div>

        ${rcState.innerTab === 'members' ? rcRenderMembersPanel(org) : ''}
        ${rcState.innerTab === 'roles' ? rcRenderRolesPanel(org) : ''}
      </section>
    </div>`;

  pane.scrollTop = rcState.paneScrollTop;
  if (rcState.innerTab === 'roles') {
    rcApplyRolePanelState();
    const roleScroll = pane.querySelector('.gd-drp-perm-scroll');
    if (roleScroll) roleScroll.scrollTop = rcState.roleScrollTop;
  }
}

/* ────────────────── 成员管理 ────────────────── */

function rcRenderMembersPanel(org) {
  const counts = rcGetMemberCounts(org.id);
  const list = rcGetFilteredMembers(org.id);
  const pageSize = 8;
  const pages = Math.max(1, Math.ceil(list.length / pageSize));
  rcState.memberPage = Math.min(rcState.memberPage, pages);
  const start = (rcState.memberPage - 1) * pageSize;
  const pageRows = list.slice(start, start + pageSize);
  const allChecked = pageRows.length > 0 && pageRows.every(m => rcState.memberSelected.has(m.id));
  const isJoined = rcState.memberStatus === 'joined';

  return `
    <div class="gd-card">
      <div class="gd-delmem-toolbar">
        <div class="gd-delmem-status-tabs">
          <button class="gd-delmem-status ${isJoined?'active':''}" onclick="rcSwitchMemberStatus('joined')">已加入 <span class="gd-delmem-badge">${counts.joined}</span></button>
          <button class="gd-delmem-status ${!isJoined?'active':''}" onclick="rcSwitchMemberStatus('left')">已退出 <span class="gd-delmem-badge">${counts.left}</span></button>
        </div>
        <div class="gd-delmem-actions">
          <div class="gd-delmem-search">
            <input class="gd-filter-input" placeholder="搜索成员姓名 / 部门 / 手机号" value="${rcState.memberSearch}" oninput="rcSetMemberSearch(this.value)">
          </div>
          ${isJoined ? `<button class="gd-btn gd-btn-primary gd-btn-sm" onclick="rcOpenAddMember()">添加成员</button>` : ''}
        </div>
      </div>

      <div class="gd-table-wrap">
        <table class="gd-table">
          <thead>
            <tr>
              <th style="width:44px;text-align:center;">${isJoined ? `<input type="checkbox" ${allChecked?'checked':''} onchange="rcToggleSelectAll(this.checked)">` : ''}</th>
              <th>姓名</th>
              <th>角色</th>
              <th>所属部门</th>
              <th>手机号码</th>
              <th>加入时间</th>
              <th>${isJoined ? '有效期' : '退出时间'}</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${pageRows.length ? pageRows.map(m => `
              <tr class="${rcState.memberSelected.has(m.id)?'gd-delmem-row-selected':''}">
                <td style="text-align:center;">${isJoined ? `<input type="checkbox" ${rcState.memberSelected.has(m.id)?'checked':''} onchange="rcToggleMemberSelect('${m.id}',this.checked)">` : ''}</td>
                <td>
                  <div class="gd-delmem-user">
                    <div class="gd-delmem-avatar" style="background:${gdAvatarColor(m.name)};">${m.name[0]}</div>
                    <span>${m.name}</span>
                  </div>
                </td>
                <td>${rcRoleBadge(m.roles)}</td>
                <td style="color:#6B7280;">${m.dept||'—'}</td>
                <td style="color:#6B7280;">${m.phone||'—'}</td>
                <td style="color:#6B7280;">${m.joinedAt||'—'}</td>
                <td style="color:${!isJoined&&m.leftAt?'#DC2626':'#6B7280'};">${isJoined ? (m.validUntil||'—') : (m.leftAt||'—')}</td>
                <td>
                  <div class="gd-delmem-ops">
                    ${isJoined ? `<button class="gd-btn gd-btn-ghost gd-btn-sm" onclick="rcOpenEditMember('${m.id}')">编辑</button>` : ''}
                    ${isJoined ? `<button class="gd-btn gd-btn-outline gd-btn-sm" onclick="rcOpenRemoveMember('${m.id}')">移出</button>` : ''}
                    ${!isJoined ? `<button class="gd-btn gd-btn-primary gd-btn-sm" onclick="rcOpenReaddMember('${m.id}')">重新加入</button>` : ''}
                  </div>
                </td>
              </tr>`).join('') : `<tr><td colspan="8" style="text-align:center;padding:36px 0;color:#9CA3AF;">暂无成员数据</td></tr>`}
          </tbody>
        </table>
      </div>

      <div class="gd-pager">
        <span class="gd-pager-info">共 <strong>${list.length}</strong> 条记录</span>
        <div class="gd-pager-btns">
          <button class="gd-pager-btn" ${rcState.memberPage<=1?'disabled':''} onclick="rcSetMemberPage(${rcState.memberPage-1})">上一页</button>
          <span class="gd-delmem-page-text">${rcState.memberPage} / ${pages}</span>
          <button class="gd-pager-btn" ${rcState.memberPage>=pages?'disabled':''} onclick="rcSetMemberPage(${rcState.memberPage+1})">下一页</button>
        </div>
      </div>
    </div>`;
}

function rcSwitchMemberStatus(status) {
  rcState.memberStatus = status;
  rcState.memberSelected = new Set();
  rcState.memberPage = 1;
  rcRenderOrgs();
}

function rcSetMemberSearch(val) {
  rcState.memberSearch = val;
  rcState.memberSelected = new Set();
  rcState.memberPage = 1;
  rcRenderOrgs();
}

function rcSetMemberPage(page) {
  rcState.memberPage = Math.max(1, page);
  rcRenderOrgs();
}

function rcToggleSelectAll(checked) {
  const list = rcGetFilteredMembers(rcState.selectedOrgId);
  const pageSize = 8;
  const start = (rcState.memberPage - 1) * pageSize;
  list.slice(start, start + pageSize).forEach(m => {
    if (checked) rcState.memberSelected.add(m.id);
    else rcState.memberSelected.delete(m.id);
  });
  rcRenderOrgs();
}

function rcToggleMemberSelect(id, checked) {
  if (checked) rcState.memberSelected.add(id);
  else rcState.memberSelected.delete(id);
  rcRenderOrgs();
}

/* ────────────────── 弹窗工具 ────────────────── */

function rcOpenFormModal({ title, subtitle, bodyHtml, confirmText = '确认', danger = false, onConfirm }) {
  const modal = document.getElementById('gd-submit-modal');
  const body = document.getElementById('gd-submit-body');
  const titleEl = modal?.querySelector('.modal-title');
  const subEl = modal?.querySelector('.modal-subtitle');
  const confirmBtn = modal?.querySelector('.modal-footer .btn-primary');
  if (!modal || !body || !titleEl || !confirmBtn) return;

  titleEl.textContent = title;
  if (subEl) subEl.textContent = subtitle || '';
  body.innerHTML = bodyHtml;
  confirmBtn.textContent = confirmText;
  confirmBtn.style.background = danger ? '#EF4444' : '';
  confirmBtn.onclick = () => {
    const result = onConfirm?.();
    if (result === false) return;
    modal.style.display = 'none';
    modal.classList.remove('open');
  };
  modal.style.display = 'flex';
  modal.classList.add('open');
}

function rcTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

/* ────────────────── 成员操作 ────────────────── */

function rcOpenAddMember() {
  const org = rcGetSelectedOrg();
  const existingIds = (RC_ORG_MEMBERS[org.id]||[]).filter(m => m.status !== 'left').map(m => m.userId);
  const availableUsers = GD_USERS.filter(u => !existingIds.includes(u.id));
  if (!availableUsers.length) { showNotification('当前无可添加的成员'); return; }
  const defaultUser = availableUsers[0];

  rcOpenFormModal({
    title: '添加成员',
    subtitle: `将成员加入风控组织「${org.name}」`,
    confirmText: '添加',
    bodyHtml: `
      <div>
        <label class="gd-modal-label">选择人员</label>
        <select id="rc-add-member-user" class="gd-filter-input" onchange="rcPrefillMemberFromUser(this.value)">
          ${availableUsers.map(u => `<option value="${u.id}">${u.name} - ${u.dept}</option>`).join('')}
        </select>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <label class="gd-modal-label">姓名</label>
          <input id="rc-add-member-name" class="gd-filter-input" value="${defaultUser.name}" readonly>
        </div>
        <div>
          <label class="gd-modal-label">所属部门</label>
          <input id="rc-add-member-dept" class="gd-filter-input" value="${defaultUser.dept}" readonly>
        </div>
      </div>
      <div>
        <label class="gd-modal-label">角色（可多选）</label>
        <div class="rc-role-checkbox-group" id="rc-add-member-roles">
          ${RC_ROLE_PRESETS.map(r => `
            <label class="rc-role-checkbox">
              <input type="checkbox" value="${r.id}" ${r.id==='rc_25_reviewer'?'checked':''}>
              <span style="color:${r.color};font-weight:500;">${r.name}</span>
            </label>`).join('')}
        </div>
      </div>
      <div>
        <label class="gd-modal-label">手机号</label>
        <input id="rc-add-member-phone" class="gd-filter-input" value="${defaultUser.phone||'—'}">
      </div>
      <div>
        <label class="gd-modal-label">有效期（可选）</label>
        <input id="rc-add-member-valid" type="date" class="gd-filter-input" value="">
      </div>`,
    onConfirm: () => {
      const userId = document.getElementById('rc-add-member-user')?.value;
      const user = GD_USERS.find(u => u.id === userId);
      if (!user) return false;
      const roleEls = document.querySelectorAll('#rc-add-member-roles input[type=checkbox]:checked');
      const roles = Array.from(roleEls).map(el => el.value);
      if (!roles.length) { showNotification('请至少选择一个角色'); return false; }
      const phone = document.getElementById('rc-add-member-phone')?.value.trim() || '—';
      const validUntil = document.getElementById('rc-add-member-valid')?.value || '';
      if (!RC_ORG_MEMBERS[org.id]) RC_ORG_MEMBERS[org.id] = [];
      const member = {
        id: `${org.id}-m-${Date.now()}`,
        userId: user.id, name: user.name, roles,
        dept: user.dept, phone, joinedAt: rcTodayStr(), validUntil, status: 'joined',
      };
      RC_ORG_MEMBERS[org.id].push(member);
      if (roles.includes('rc_owner')) rcPromoteOwner(org.id, member);
      rcRenderOrgs();
      showNotification(`已添加成员「${user.name}」`);
    },
  });
}

function rcPrefillMemberFromUser(userId) {
  const user = GD_USERS.find(u => u.id === userId);
  const nameEl = document.getElementById('rc-add-member-name');
  const deptEl = document.getElementById('rc-add-member-dept');
  const phoneEl = document.getElementById('rc-add-member-phone');
  if (!user) return;
  if (nameEl) nameEl.value = user.name || '';
  if (deptEl) deptEl.value = user.dept || '';
  if (phoneEl) phoneEl.value = user.phone || '—';
}

function rcOpenEditMember(memberId) {
  const org = rcGetSelectedOrg();
  const members = RC_ORG_MEMBERS[org.id] || [];
  const member = members.find(m => m.id === memberId);
  if (!member) return;

  rcOpenFormModal({
    title: '编辑成员',
    subtitle: `更新成员「${member.name}」的角色与有效期`,
    confirmText: '保存修改',
    bodyHtml: `
      <div>
        <label class="gd-modal-label">姓名</label>
        <input class="gd-filter-input" value="${member.name}" readonly>
      </div>
      <div>
        <label class="gd-modal-label">角色（可多选）</label>
        <div class="rc-role-checkbox-group" id="rc-edit-member-roles">
          ${RC_ROLE_PRESETS.map(r => `
            <label class="rc-role-checkbox">
              <input type="checkbox" value="${r.id}" ${member.roles.includes(r.id)?'checked':''}>
              <span style="color:${r.color};font-weight:500;">${r.name}</span>
            </label>`).join('')}
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <label class="gd-modal-label">有效期</label>
          <input id="rc-edit-member-valid" type="date" class="gd-filter-input" value="${member.validUntil||''}">
        </div>
        <div>
          <label class="gd-modal-label">手机号</label>
          <input id="rc-edit-member-phone" class="gd-filter-input" value="${member.phone||''}">
        </div>
      </div>`,
    onConfirm: () => {
      const roleEls = document.querySelectorAll('#rc-edit-member-roles input[type=checkbox]:checked');
      const roles = Array.from(roleEls).map(el => el.value);
      if (!roles.length) { showNotification('请至少选择一个角色'); return false; }
      const validUntil = document.getElementById('rc-edit-member-valid')?.value || '';
      const phone = document.getElementById('rc-edit-member-phone')?.value.trim() || '—';
      member.roles = roles;
      member.validUntil = validUntil;
      member.phone = phone;
      if (roles.includes('rc_owner')) rcPromoteOwner(org.id, member);
      rcRenderOrgs();
      showNotification(`已更新成员「${member.name}」`);
    },
  });
}

function rcOpenRemoveMember(memberId) {
  const org = rcGetSelectedOrg();
  const members = RC_ORG_MEMBERS[org.id] || [];
  const member = members.find(m => m.id === memberId);
  if (!member) return;
  if (member.roles.includes('rc_owner') && member.roles.length === 1) {
    showNotification('请先变更风控负责人后再移出当前负责人');
    return;
  }
  rcOpenFormModal({
    title: '移出成员',
    subtitle: '移出后该成员将失去当前风控组织权限',
    confirmText: '确认移出',
    danger: true,
    bodyHtml: `<div class="gd-modal-confirm">确认将成员「${member.name}」从风控组织「${org.name}」移出吗？</div>`,
    onConfirm: () => {
      member.status = 'left';
      member.leftAt = rcTodayStr();
      rcState.memberSelected.delete(member.id);
      rcRenderOrgs();
      showNotification(`已移出成员「${member.name}」`);
    },
  });
}

function rcOpenReaddMember(memberId) {
  const members = RC_ORG_MEMBERS[rcState.selectedOrgId] || [];
  const member = members.find(m => m.id === memberId);
  if (!member) return;
  rcOpenFormModal({
    title: '重新加入成员',
    subtitle: '重新加入后将恢复其在当前风控组织的成员身份',
    confirmText: '确认加入',
    bodyHtml: `<div class="gd-modal-confirm">确认将「${member.name}」重新加入风控组织吗？</div>`,
    onConfirm: () => {
      member.status = 'joined';
      member.leftAt = '';
      member.joinedAt = rcTodayStr();
      rcRenderOrgs();
      showNotification(`${member.name} 已重新加入风控组织`);
    },
  });
}

function rcPromoteOwner(orgId, member) {
  const org = RC_ORGS.find(o => o.id === orgId);
  if (org) {
    org.ownerId = member.userId;
    org.ownerName = member.name;
  }
}

/* ────────────────── 组织 CRUD ────────────────── */

function rcOpenCreateOrg() {
  const deptUsers = GD_USERS;
  rcOpenFormModal({
    title: '新建风控组织',
    subtitle: '配置组织名称、风控负责人和所属部门',
    confirmText: '创建',
    bodyHtml: `
      <div>
        <label class="gd-modal-label">组织名称</label>
        <input id="rc-new-org-name" class="gd-filter-input" placeholder="请输入风控组织名称">
      </div>
      <div>
        <label class="gd-modal-label">风控负责人</label>
        <select id="rc-new-org-owner" class="gd-filter-input">
          ${deptUsers.map(u => `<option value="${u.id}">${u.name} - ${u.dept}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="gd-modal-label">所属部门</label>
        <input id="rc-new-org-dept" class="gd-filter-input" value="${GD_CURRENT_USER.dept}">
      </div>`,
    onConfirm: () => {
      const name = document.getElementById('rc-new-org-name')?.value.trim();
      const ownerId = document.getElementById('rc-new-org-owner')?.value;
      const dept = document.getElementById('rc-new-org-dept')?.value.trim();
      const owner = GD_USERS.find(u => u.id === ownerId);
      if (!name) { showNotification('请输入组织名称'); return false; }
      const newId = `rc-org-${Date.now()}`;
      RC_ORGS.push({ id: newId, name, ownerId: owner.id, ownerName: owner.name, sourceDept: dept || GD_CURRENT_USER.dept, desc: '新建风控组织' });
      RC_ORG_MEMBERS[newId] = [{
        id: `${newId}-m-1`, userId: owner.id, name: owner.name,
        roles: ['rc_owner'], dept: owner.dept, phone: owner.phone || '—',
        joinedAt: rcTodayStr(), validUntil: '', status: 'joined',
      }];
      rcState.selectedOrgId = newId;
      rcState.innerTab = 'members';
      rcRenderOrgs();
      showNotification(`已创建风控组织「${name}」`);
    },
  });
}

function rcOpenEditOrg() {
  const org = rcGetSelectedOrg();
  const members = (RC_ORG_MEMBERS[org.id]||[]).filter(m => m.status !== 'left');
  rcOpenFormModal({
    title: '编辑风控组织',
    subtitle: '更新组织名称与负责人信息',
    confirmText: '保存修改',
    bodyHtml: `
      <div>
        <label class="gd-modal-label">组织名称</label>
        <input id="rc-edit-org-name" class="gd-filter-input" value="${org.name}">
      </div>
      <div>
        <label class="gd-modal-label">风控负责人</label>
        <select id="rc-edit-org-owner" class="gd-filter-input">
          ${members.map(m => `<option value="${m.userId}" ${m.userId===org.ownerId?'selected':''}>${m.name} - ${m.dept}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="gd-modal-label">组织描述</label>
        <input id="rc-edit-org-desc" class="gd-filter-input" value="${org.desc}">
      </div>`,
    onConfirm: () => {
      const name = document.getElementById('rc-edit-org-name')?.value.trim();
      const ownerId = document.getElementById('rc-edit-org-owner')?.value;
      const desc = document.getElementById('rc-edit-org-desc')?.value.trim();
      if (!name) { showNotification('请输入组织名称'); return false; }
      const owner = GD_USERS.find(u => u.id === ownerId);
      org.name = name;
      org.desc = desc || org.desc;
      if (owner) { org.ownerId = owner.id; org.ownerName = owner.name; }
      rcRenderOrgs();
      showNotification(`已更新风控组织「${name}」`);
    },
  });
}

function rcOpenRemoveOrg() {
  const org = rcGetSelectedOrg();
  if (RC_ORGS.length <= 1) { showNotification('至少保留一个风控组织'); return; }
  rcOpenFormModal({
    title: '移出风控组织',
    subtitle: '移出后该组织下的成员配置将一并移除',
    confirmText: '确认移出',
    danger: true,
    bodyHtml: `<div class="gd-modal-confirm">确认移出风控组织「${org.name}」吗？</div>`,
    onConfirm: () => {
      const nextOrg = RC_ORGS.find(o => o.id !== org.id);
      const idx = RC_ORGS.findIndex(o => o.id === org.id);
      if (idx >= 0) RC_ORGS.splice(idx, 1);
      delete RC_ORG_MEMBERS[org.id];
      rcState.selectedOrgId = nextOrg?.id || RC_ORGS[0]?.id;
      rcRenderOrgs();
      showNotification(`已移出风控组织「${org.name}」`);
    },
  });
}

/* ────────────────── 角色权限 ────────────────── */

function rcRenderRolesPanel(org) {
  const config = rcGetRoleConfig(org.id);
  const role = rcSyncSelectedRole(org.id);
  if (!role) {
    return `<div class="gd-card"><div style="font-size:0.85rem;color:#6B7280;">当前风控组织暂无角色配置。</div></div>`;
  }
  const perms = config.permState[role.id] || {};
  return `
    <div class="gd-card gd-drp-layout">
      <aside class="gd-drp-left">
        <div class="gd-drp-left-hd">
          <button class="gd-btn gd-btn-outline gd-btn-sm" onclick="rcOpenAddRole()">+ 添加角色</button>
        </div>
        <div class="gd-drp-role-list">
          ${config.roles.map(item => `
            <button class="gd-drp-role-item ${item.id===role.id?'active':''}" onclick="rcSetRole('${item.id}')">
              <span class="gd-drp-role-dot" style="background:${item.color||'#94A3B8'};"></span>
              <span class="gd-drp-role-info">
                <span class="gd-drp-role-name">${item.name}</span>
                <span class="gd-drp-role-desc">${item.desc||'—'}</span>
              </span>
              <span class="gd-drp-role-cnt">${rcGetRoleMemberCount(org.id, item.id)}人</span>
            </button>`).join('')}
        </div>
      </aside>
      <section class="gd-drp-right">
        <div class="gd-drp-right-hd">
          <div>
            <div class="gd-drp-role-title-row">
              <div class="gd-drp-role-title">${role.name}</div>
              <span class="gd-drp-role-tag ${role.builtin?'is-system':'is-custom'}">${role.builtin?'系统角色':'自定义角色'}</span>
            </div>
            <div class="gd-drp-role-sub">${role.desc||'可按当前风控组织的协同边界调整权限范围。'}</div>
          </div>
          <button class="gd-btn gd-btn-primary gd-btn-sm" ${rcState.rolePermDirty?'':'disabled'} onclick="rcSaveRolePerms()">保存</button>
        </div>
        <div class="gd-drp-perm-scroll">
          ${RC_PERMISSION_MODULES.map(mod => {
            const allPerms = mod.groups.flatMap(g => g.perms);
            const enabledCnt = allPerms.filter(p => perms[p.id]).length;
            const collapsed = rcState.roleCollapsedModules.has(`${org.id}:${mod.id}`);
            return `
              <div class="gd-drp-perm-module">
                <div class="gd-drp-perm-mod-hd" onclick="rcTogglePermModule('${org.id}','${mod.id}')">
                  <div class="gd-drp-perm-mod-title">
                    <svg class="gd-drp-perm-chevron ${collapsed?'':'rotated'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" width="12" height="12"><polyline points="9 18 15 12 9 6"/></svg>
                    ${mod.label}
                  </div>
                  <span class="gd-drp-perm-cnt-badge">${enabledCnt}/${allPerms.length}</span>
                </div>
                <div class="gd-drp-perm-mod-body ${collapsed?'collapsed':''}">
                  ${mod.groups.map(group => {
                    const allChecked = group.perms.every(p => perms[p.id]);
                    const someChecked = group.perms.some(p => perms[p.id]);
                    return `
                      <div class="gd-drp-perm-group">
                        <div class="gd-drp-perm-grp-hd">
                          <label class="gd-drp-perm-grp-all">
                            <input type="checkbox" class="gd-drp-group-cb"
                              data-indeterminate="${!allChecked&&someChecked?'1':'0'}"
                              ${allChecked?'checked':''}
                              onchange="rcTogglePermGroup('${org.id}','${role.id}','${group.id}',this.checked)">
                            <span class="gd-drp-perm-grp-label">${group.label}</span>
                          </label>
                        </div>
                        <div class="gd-drp-perm-items">
                          ${group.perms.map(perm => `
                            <label class="gd-drp-perm-item">
                              <input type="checkbox"
                                ${perms[perm.id]?'checked':''}
                                onchange="rcTogglePerm('${org.id}','${role.id}','${perm.id}',this.checked)">
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

function rcSetRole(roleId) {
  rcState.selectedRoleId = roleId;
  rcRenderOrgs();
}

function rcTogglePermModule(orgId, moduleId) {
  const key = `${orgId}:${moduleId}`;
  if (rcState.roleCollapsedModules.has(key)) rcState.roleCollapsedModules.delete(key);
  else rcState.roleCollapsedModules.add(key);
  rcRenderOrgs();
}

function rcTogglePermGroup(orgId, roleId, groupId, checked) {
  const config = rcGetRoleConfig(orgId);
  const group = rcGetPermissionGroup(groupId);
  if (!group || !config.permState[roleId]) return;
  group.perms.forEach(p => { config.permState[roleId][p.id] = checked; });
  rcState.rolePermDirty = true;
  rcRenderOrgs();
}

function rcTogglePerm(orgId, roleId, permId, checked) {
  const config = rcGetRoleConfig(orgId);
  if (!config.permState[roleId]) return;
  config.permState[roleId][permId] = checked;
  rcState.rolePermDirty = true;
  rcRenderOrgs();
}

function rcGetPermissionGroup(groupId) {
  for (const mod of RC_PERMISSION_MODULES) {
    for (const g of mod.groups) {
      if (g.id === groupId) return g;
    }
  }
  return null;
}

function rcSaveRolePerms() {
  rcState.rolePermDirty = false;
  rcRenderOrgs();
  showNotification('角色权限已保存');
}

function rcOpenAddRole() {
  const org = rcGetSelectedOrg();
  const config = rcGetRoleConfig(org.id);
  rcOpenFormModal({
    title: '添加角色',
    subtitle: `为风控组织「${org.name}」新增角色`,
    confirmText: '创建角色',
    bodyHtml: `
      <div>
        <label class="gd-modal-label">角色名称</label>
        <input id="rc-new-role-name" class="gd-filter-input" placeholder="请输入角色名称">
      </div>
      <div>
        <label class="gd-modal-label">角色描述</label>
        <input id="rc-new-role-desc" class="gd-filter-input" placeholder="简要描述角色职责">
      </div>
      <div>
        <label class="gd-modal-label">标识色</label>
        <select id="rc-new-role-color" class="gd-filter-input">
          ${['#6366F1','#0EA5E9','#10B981','#F59E0B','#EF4444','#EC4899','#8B5CF6','#14B8A6'].map(c => `<option value="${c}" style="color:${c};">● ${c}</option>`).join('')}
        </select>
      </div>`,
    onConfirm: () => {
      const name = document.getElementById('rc-new-role-name')?.value.trim();
      const desc = document.getElementById('rc-new-role-desc')?.value.trim();
      const color = document.getElementById('rc-new-role-color')?.value;
      if (!name) { showNotification('请输入角色名称'); return false; }
      const roleId = `rc_custom_${Date.now()}`;
      config.roles.push({ id: roleId, name, desc, color, builtin: false });
      config.permState[roleId] = {};
      RC_PERMISSION_MODULES.forEach(mod => {
        mod.groups.forEach(g => {
          g.perms.forEach(p => { config.permState[roleId][p.id] = false; });
        });
      });
      rcState.selectedRoleId = roleId;
      rcState.rolePermDirty = false;
      rcRenderOrgs();
      showNotification(`已新增角色「${name}」`);
    },
  });
}

function rcApplyRolePanelState() {
  document.querySelectorAll('.gd-drp-group-cb').forEach(cb => {
    if (cb.dataset.indeterminate === '1') cb.indeterminate = true;
  });
}

/* ═══════════════════════════════════════════════════════
   发起预审单 — 项目工作区
   ═══════════════════════════════════════════════════════ */

const RC_REVIEW_ORDERS = [
  {
    id: 'RV-20260320-001', type: '一审', workspace: '中国比亚迪-年度审计-2025年度-审计一部-001', workspaceId: 'ws-001',
    company: '比亚迪汽车（广东）有限公司', reportType: '合并', firmCode: 'HQ-2025-HD-88801',
    teacherId: 'EMP014', teacherName: '沈瑶', orgId: '', orgName: '',
    folderId: 'review-sub-1', folderName: '2025年年报一审送审',
    isAPT: '否', isSACP: '否', projectUrgency: '常规',
    planFirstReviewDate: '2026-04-01T09:00', planReviewEndDate: '2026-05-01T09:00',
    submitter: '张伟', projectContact: '李明',
    submitTime: '2026-03-20 14:30', actualReviewDate: '2026-03-22 10:00', status: '审核中',
  },
  {
    id: 'RV-20260321-002', type: '二审', workspace: '中国比亚迪-年度审计-2025年度-审计一部-001', workspaceId: 'ws-001',
    company: '比亚迪汽车（广东）有限公司', reportType: '合并', firmCode: 'HQ-2025-HD-88801',
    teacherId: 'rc-m-a4', teacherName: '范冬梅', orgId: 'rc-org-1', orgName: '风控一组',
    folderId: 'review-sub-2', folderName: '2025年年报二审送审',
    isAPT: '否', isSACP: '否', projectUrgency: '常规',
    planFirstReviewDate: '2026-04-15T09:00', planReviewEndDate: '2026-05-15T09:00',
    submitter: '张伟', projectContact: '李明',
    submitTime: '2026-03-21 09:15', actualReviewDate: '', status: '待启用',
  },
  {
    id: 'RV-20260322-003', type: '一审', workspace: '中国比亚迪-年度审计-2025年度-审计一部-001', workspaceId: 'ws-001',
    company: '中国比亚迪有限公司', reportType: '单体', firmCode: 'HQ-2025-HD-88802',
    teacherId: 'EMP015', teacherName: '钟天宇', orgId: '', orgName: '',
    folderId: 'review-sub-3', folderName: '半年报一审送审',
    isAPT: '是', isSACP: '否', projectUrgency: '加急',
    planFirstReviewDate: '2026-04-05T09:00', planReviewEndDate: '2026-05-05T09:00',
    submitter: '王芳', projectContact: '陈刚',
    submitTime: '2026-03-22 16:40', actualReviewDate: '', status: '待启用',
  },
  {
    id: 'RV-20260323-004', type: '2.5审', workspace: '中国比亚迪-年度审计-2025年度-审计一部-001', workspaceId: 'ws-001',
    company: '比亚迪汽车（广东）有限公司', reportType: '合并', firmCode: 'HQ-2025-HD-88801',
    teacherId: 'rc-m-a3', teacherName: '周海涛', orgId: 'rc-org-1', orgName: '风控一组',
    folderId: '', folderName: '',
    isAPT: '否', isSACP: '否', projectUrgency: '常规',
    planFirstReviewDate: '2026-05-01T09:00', planReviewEndDate: '2026-06-01T09:00',
    submitter: '张伟', projectContact: '李明',
    submitTime: '2026-03-23 11:20', actualReviewDate: '', status: '待启用',
  },
  {
    id: 'RV-20260325-005', type: '一审', workspace: '中国比亚迪-年度审计-2025年度-审计一部-001', workspaceId: 'ws-001',
    company: '比亚迪新材料有限公司', reportType: '单体', firmCode: 'HQ-2025-HD-88803',
    teacherId: 'EMP016', teacherName: '赵雅琪', orgId: '', orgName: '',
    folderId: '', folderName: '',
    isAPT: '否', isSACP: '是', projectUrgency: '特急',
    planFirstReviewDate: '2026-04-10T09:00', planReviewEndDate: '2026-05-10T09:00',
    submitter: '陈刚', projectContact: '王芳',
    submitTime: '2026-03-25 08:50', actualReviewDate: '2026-03-26 14:00', status: '清Q完成',
    qIssueTime: '2026-03-27 10:00', qClearTime: '2026-03-28 16:00',
  },
  {
    id: 'RV-20260326-006', type: '二审', workspace: '中国比亚迪-年度审计-2025年度-审计一部-001', workspaceId: 'ws-001',
    company: '中国比亚迪有限公司', reportType: '单体', firmCode: 'HQ-2025-HD-88802',
    teacherId: 'rc-m-b3', teacherName: '陈文博', orgId: 'rc-org-2', orgName: '风控二组',
    folderId: '', folderName: '',
    isAPT: '是', isSACP: '否', projectUrgency: '加急',
    planFirstReviewDate: '2026-04-20T09:00', planReviewEndDate: '2026-05-20T09:00',
    submitter: '王芳', projectContact: '陈刚',
    submitTime: '2026-03-26 10:30', actualReviewDate: '', status: '待启用',
  },
  {
    id: 'RV-20260327-007', type: '2.5审', workspace: '中国比亚迪-年度审计-2025年度-审计一部-001', workspaceId: 'ws-001',
    company: '中国比亚迪有限公司', reportType: '单体', firmCode: 'HQ-2025-HD-88802',
    teacherId: 'rc2-m3', teacherName: '任刚', orgId: 'rc-org-2', orgName: '风控二组',
    folderId: '', folderName: '',
    isAPT: '是', isSACP: '否', projectUrgency: '加急',
    planFirstReviewDate: '2026-05-05T09:00', planReviewEndDate: '2026-06-05T09:00',
    submitter: '王芳', projectContact: '陈刚',
    submitTime: '2026-03-27 09:00', actualReviewDate: '', status: '待启用',
  },
  {
    id: 'RV-20260327-008', type: '二审', workspace: '中国比亚迪-年度审计-2025年度-审计一部-001', workspaceId: 'ws-001',
    company: '比亚迪新材料有限公司', reportType: '单体', firmCode: 'HQ-2025-HD-88803',
    teacherId: 'rc1-m4', teacherName: '邓丽华', orgId: 'rc-org-1', orgName: '风控一组',
    folderId: '', folderName: '',
    isAPT: '否', isSACP: '是', projectUrgency: '特急',
    planFirstReviewDate: '2026-04-12T09:00', planReviewEndDate: '2026-05-12T09:00',
    submitter: '陈刚', projectContact: '王芳',
    submitTime: '2026-03-27 14:20', actualReviewDate: '2026-03-28 09:30', status: 'Q单出具',
    qIssueTime: '2026-03-29 11:00',
  },
  {
    id: 'RV-20260328-009', type: '2.5审', workspace: '中国比亚迪-年度审计-2025年度-审计一部-001', workspaceId: 'ws-001',
    company: '比亚迪新材料有限公司', reportType: '单体', firmCode: 'HQ-2025-HD-88803',
    teacherId: 'rc3-m3', teacherName: '方毅', orgId: 'rc-org-3', orgName: '综合风控组',
    folderId: '', folderName: '',
    isAPT: '否', isSACP: '是', projectUrgency: '特急',
    planFirstReviewDate: '2026-05-10T09:00', planReviewEndDate: '2026-06-10T09:00',
    submitter: '陈刚', projectContact: '王芳',
    submitTime: '2026-03-28 10:15', actualReviewDate: '2026-03-28 14:00', status: '待清Q',
    qIssueTime: '2026-03-29 09:00',
  },
];

let rcReviewWiz = {};

function rcResetReviewWiz() {
  rcReviewWiz = {
    type: '',
    orgId: RC_ORGS[0]?.id || '',
    teacherId: '',
    teacherName: '',
    selectedCompanyIdx: -1,
    selectedFolderId: '',
    selectedFolderName: '',
    isAPT: '',
    isSACP: '',
    projectUrgency: '',
    planFirstReviewDate: '',
    planReviewEndDate: '',
  };
}

const RC_PROJECT_URGENCY_OPTIONS = [
  { value: '常规', label: '常规' },
  { value: '加急', label: '加急' },
  { value: '特急', label: '特急' },
];

function rcOpenSubmitReview() {
  if (typeof currentDetailWs === 'undefined' || !currentDetailWs) {
    showNotification('请先进入项目工作区再发起预审单');
    return;
  }
  rcResetReviewWiz();
  rcShowReviewTypeModal();
}

function rcShowReviewTypeModal() {
  let modal = document.getElementById('rc-review-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'rc-review-modal';
    modal.className = 'rc-review-modal-overlay';
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';

  modal.innerHTML = `
    <div class="rc-review-modal" style="width:560px;">
      <div class="rc-review-modal-hd">
        <div>
          <h2 class="modal-title">发起预审单</h2>
          <p class="modal-subtitle">请选择预审单类型</p>
        </div>
        <button class="modal-close-btn" onclick="rcCloseReviewModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="rc-review-type-cards">
        <div class="rc-review-type-card" onclick="rcSelectReviewType('一审')">
          <div class="rc-review-type-icon" style="background:#3B82F6;">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" width="24" height="24"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg>
          </div>
          <div class="rc-review-type-name">一审</div>
          <div class="rc-review-type-desc">选择业务部门正式员工作为一审风控老师，对送审材料进行首轮审核</div>
        </div>
        <div class="rc-review-type-card" onclick="rcSelectReviewType('二审')">
          <div class="rc-review-type-icon" style="background:#F59E0B;">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" width="24" height="24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div class="rc-review-type-name">二审</div>
          <div class="rc-review-type-desc">由风控组织的二审老师进行最终审核与签发决策</div>
        </div>
        <div class="rc-review-type-card" onclick="rcSelectReviewType('2.5审')">
          <div class="rc-review-type-icon" style="background:#8B5CF6;">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" width="24" height="24"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>
          </div>
          <div class="rc-review-type-name">2.5 审</div>
          <div class="rc-review-type-desc">由风控组织的 2.5 审老师对送审项目进行中间级复核</div>
        </div>
        <div class="rc-review-type-card rc-review-type-batch" onclick="rcOpenBatchReview()">
          <div class="rc-review-type-icon" style="background:#10B981;">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" width="24" height="24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
          </div>
          <div class="rc-review-type-name">批量预审</div>
          <div class="rc-review-type-desc">上传 Excel 文件，批量发起多个主体公司的一审/二审/2.5审预审单</div>
        </div>
      </div>
    </div>`;
}

function rcCloseReviewModal() {
  const modal = document.getElementById('rc-review-modal');
  if (modal) modal.style.display = 'none';
}

function rcSelectReviewType(type) {
  rcReviewWiz.type = type;
  rcRenderReviewWizard();
}

/* ── 获取工作区绑定行 & 送审文件夹 ── */

function rcGetBindingRows() {
  const ws = currentDetailWs;
  if (!ws) return [];
  if (Array.isArray(ws.bindingRows) && ws.bindingRows.length) return ws.bindingRows;
  return [{ name: ws.entity || ws.group || ws.name, reportType: ws.reportType || '—', firmCode: ws.totalCode || '—' }];
}

function rcGetReviewSubFolders() {
  if (typeof REVIEW_SUB_FOLDERS !== 'undefined' && Array.isArray(REVIEW_SUB_FOLDERS) && REVIEW_SUB_FOLDERS.length) {
    return REVIEW_SUB_FOLDERS;
  }
  const ws = currentDetailWs;
  if (!ws) return [];
  const findReviewFolder = (items) => {
    for (const item of (items || [])) {
      if (item.id === 'review-root' || (item.type === 'review' && item.name === '送审文件夹')) {
        return item.children || [];
      }
      if (item.children) {
        const found = findReviewFolder(item.children);
        if (found.length) return found;
      }
    }
    return [];
  };
  if (typeof FOLDER_DATA !== 'undefined' && Array.isArray(FOLDER_DATA)) {
    return findReviewFolder(FOLDER_DATA);
  }
  return [];
}

function rcGetUsedFolderIds() {
  return new Set(RC_REVIEW_ORDERS.map(o => o.folderId).filter(Boolean));
}

function rcGetAllDeptEmployees() {
  if (typeof SM_MEMBERS !== 'undefined') {
    return SM_MEMBERS.filter(m => m.status === 'active' && (m.role === '正式员工' || m.role === '部门负责人' || m.role === '系统管理员'));
  }
  return GD_USERS.map(u => ({ id: u.id, name: u.name, dept: u.dept, phone: '' }));
}

function rcGetOrgTeachers(orgId, roleId) {
  const members = RC_ORG_MEMBERS[orgId] || [];
  return members.filter(m => m.status !== 'left' && m.roles.includes(roleId));
}

/* ── 送审向导主渲染 ── */

function rcRenderReviewWizard() {
  const modal = document.getElementById('rc-review-modal');
  if (!modal) return;
  const wiz = rcReviewWiz;
  const type = wiz.type;
  const ws = currentDetailWs;
  const rows = rcGetBindingRows();
  const subFolders = rcGetReviewSubFolders();
  const usedFolderIds = rcGetUsedFolderIds();

  const isFirst = type === '一审';
  const isSecond = type === '二审';
  const is25 = type === '2.5审';

  const titleColor = isFirst ? '#3B82F6' : isSecond ? '#F59E0B' : '#8B5CF6';

  let teacherOptions = [];
  let teacherLabel = '风控老师';
  let teacherPlaceholder = '搜索并选择风控老师';

  if (isFirst) {
    teacherOptions = rcGetAllDeptEmployees();
    teacherLabel = '选择风控老师';
    teacherPlaceholder = '输入姓名搜索所有业务部门正式员工';
  } else {
    const orgId = wiz.orgId;
    const roleId = isSecond ? 'rc_2_reviewer' : 'rc_25_reviewer';
    teacherOptions = rcGetOrgTeachers(orgId, roleId);
    teacherLabel = isSecond ? '选择二审老师' : '选择 2.5 审老师';
    teacherPlaceholder = isSecond ? '输入姓名搜索该组织下的二审老师' : '输入姓名搜索该组织下的 2.5 审老师';
  }

  let extraColHeader = '';
  let extraColFn = null;
  if (isFirst) {
    extraColHeader = '是否发起二审';
    extraColFn = (row) => {
      const has = RC_REVIEW_ORDERS.some(o => o.type === '二审' && o.company === row.name);
      return has ? '<span class="rc-rv-tag rc-rv-tag-yes">已发起</span>' : '<span class="rc-rv-tag rc-rv-tag-no">未发起</span>';
    };
  } else if (isSecond) {
    extraColHeader = '是否发起一审';
    extraColFn = (row) => {
      const has = RC_REVIEW_ORDERS.some(o => o.type === '一审' && o.company === row.name);
      return has ? '<span class="rc-rv-tag rc-rv-tag-yes">已发起</span>' : '<span class="rc-rv-tag rc-rv-tag-no">未发起</span>';
    };
  } else {
    extraColHeader = '一审 / 二审完成情况';
    extraColFn = (row) => {
      const first = RC_REVIEW_ORDERS.some(o => o.type === '一审' && o.company === row.name);
      const second = RC_REVIEW_ORDERS.some(o => o.type === '二审' && o.company === row.name);
      return `<span class="rc-rv-tag ${first ? 'rc-rv-tag-yes' : 'rc-rv-tag-no'}">${first ? '一审已发起' : '一审未发起'}</span>
              <span class="rc-rv-tag ${second ? 'rc-rv-tag-yes' : 'rc-rv-tag-no'}">${second ? '二审已发起' : '二审未发起'}</span>`;
    };
  }

  modal.innerHTML = `
    <div class="rc-review-modal" style="width:720px;max-height:90vh;">
      <div class="rc-review-modal-hd">
        <div>
          <h2 class="modal-title">发起${type}预审单</h2>
          <p class="modal-subtitle">填写预审信息并提交至风控老师</p>
        </div>
        <button class="modal-close-btn" onclick="rcCloseReviewModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="rc-review-modal-body">

        ${!isFirst ? `
        <div class="rc-rv-section">
          <div class="rc-rv-label">选择风控组织</div>
          <select class="gd-filter-input" onchange="rcReviewWiz.orgId=this.value;rcReviewWiz.teacherId='';rcReviewWiz.teacherName='';rcRenderReviewWizard()">
            ${RC_ORGS.map(o => `<option value="${o.id}" ${o.id===wiz.orgId?'selected':''}>${o.name}（${o.ownerName}）</option>`).join('')}
          </select>
        </div>` : ''}

        <div class="rc-rv-section">
          <div class="rc-rv-label">${teacherLabel} <em class="wo-req">*</em></div>
          <div class="rc-rv-search-wrap">
            <input class="gd-filter-input rc-rv-teacher-input" id="rc-rv-teacher-input"
              placeholder="${teacherPlaceholder}"
              value="${wiz.teacherName}"
              oninput="rcFilterTeacherList(this.value)"
              onfocus="rcShowTeacherDropdown()">
            <div class="rc-rv-teacher-dropdown" id="rc-rv-teacher-dropdown" style="display:none;">
              ${teacherOptions.map(t => `
                <div class="rc-rv-teacher-option ${t.id===wiz.teacherId||t.userId===wiz.teacherId?'active':''}"
                     onclick="rcSelectTeacher('${t.id||t.userId}','${t.name}')">
                  <span class="rc-rv-teacher-name">${t.name}</span>
                  <span class="rc-rv-teacher-dept">${t.dept}</span>
                </div>`).join('')}
            </div>
          </div>
        </div>

        <div class="rc-rv-section">
          <div class="rc-rv-label">选择主体公司 & 财务报表类型 <em class="wo-req">*</em></div>
          <div class="rc-rv-hint">单选一个主体公司关联此送审单</div>
          <div class="rc-rv-company-table">
            <table class="gd-table">
              <thead>
                <tr>
                  <th style="width:36px;"></th>
                  <th>主体公司</th>
                  <th>财务报表类型</th>
                  <th>${extraColHeader}</th>
                </tr>
              </thead>
              <tbody>
                ${rows.map((row, i) => {
                  const wsId = ws ? (ws.id || '') : '';
                  const wsName = ws ? ws.name : '';
                  const alreadyExists = RC_REVIEW_ORDERS.some(o =>
                    o.type === type &&
                    o.company === row.name &&
                    o.reportType === (row.reportType || '—') &&
                    (o.workspaceId === wsId || o.workspace === wsName)
                  );
                  const disabled = alreadyExists;
                  const selected = !disabled && wiz.selectedCompanyIdx === i;
                  return `
                  <tr class="${selected ? 'rc-rv-row-selected' : ''} ${disabled ? 'rc-rv-row-disabled' : ''}"
                      ${disabled ? '' : `onclick="rcSelectCompanyRow(${i})"`}>
                    <td style="text-align:center;">
                      <input type="radio" name="rc-rv-company" ${selected ? 'checked' : ''} ${disabled ? 'disabled' : ''} ${disabled ? '' : `onchange="rcSelectCompanyRow(${i})"`}>
                    </td>
                    <td>${row.name || '—'}</td>
                    <td>${row.reportType || '—'}</td>
                    <td>${disabled ? `<span class="rc-rv-tag rc-rv-tag-used">已发起${type}</span>` : (extraColFn ? extraColFn(row) : '—')}</td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="rc-rv-section rc-rv-extra-fields">
          <div class="rc-rv-field-grid">
            <div class="rc-rv-field">
              <div class="rc-rv-label">是否为 APT 项目 <em class="wo-req">*</em></div>
              <div class="rc-rv-radio-group">
                <label class="rc-rv-radio"><input type="radio" name="rc-rv-apt" value="是" ${wiz.isAPT==='是'?'checked':''} onchange="rcReviewWiz.isAPT='是'"> 是</label>
                <label class="rc-rv-radio"><input type="radio" name="rc-rv-apt" value="否" ${wiz.isAPT==='否'?'checked':''} onchange="rcReviewWiz.isAPT='否'"> 否</label>
              </div>
            </div>
            <div class="rc-rv-field">
              <div class="rc-rv-label">是否为 SACP 项目 <em class="wo-req">*</em></div>
              <div class="rc-rv-radio-group">
                <label class="rc-rv-radio"><input type="radio" name="rc-rv-sacp" value="是" ${wiz.isSACP==='是'?'checked':''} onchange="rcReviewWiz.isSACP='是'"> 是</label>
                <label class="rc-rv-radio"><input type="radio" name="rc-rv-sacp" value="否" ${wiz.isSACP==='否'?'checked':''} onchange="rcReviewWiz.isSACP='否'"> 否</label>
              </div>
            </div>
            <div class="rc-rv-field">
              <div class="rc-rv-label">总所项目类型 <em class="wo-req">*</em></div>
              <div class="rc-rv-radio-group">
                ${RC_PROJECT_URGENCY_OPTIONS.map(o => `
                  <label class="rc-rv-radio"><input type="radio" name="rc-rv-urgency" value="${o.value}" ${wiz.projectUrgency===o.value?'checked':''} onchange="rcReviewWiz.projectUrgency='${o.value}'"> ${o.label}</label>
                `).join('')}
              </div>
            </div>
            <div class="rc-rv-field">
              <div class="rc-rv-label">预计送一审时间 <em class="wo-req">*</em></div>
              <input type="datetime-local" class="gd-filter-input rc-rv-date-input" id="rc-rv-plan-date"
                value="${wiz.planFirstReviewDate}"
                min="${new Date().toISOString().slice(0,16)}"
                onchange="rcOnPlanDateChange(this.value)">
            </div>
            <div class="rc-rv-field">
              <div class="rc-rv-label">预计审核结束时间</div>
              <input type="datetime-local" class="gd-filter-input rc-rv-date-input" id="rc-rv-end-date"
                value="${wiz.planReviewEndDate}" readonly
                style="background:#F3F4F6;color:#6B7280;cursor:not-allowed;">
              <div class="rc-rv-hint" style="margin-top:4px;">自动填充：预计送一审时间后一个月</div>
            </div>
          </div>
        </div>

        <div class="rc-rv-section">
          <div class="rc-rv-label">选择送审文件夹 <em class="wo-req">*</em></div>
          <div class="rc-rv-hint">
            请选择"送审文件夹"下的子文件夹作为送审材料目录。风控老师可即时查看该文件夹下的所有文件。
            <strong>同一个子文件夹只能关联一个送审单。</strong>
          </div>
          ${subFolders.length ? `
          <div class="rc-rv-folder-list">
            ${subFolders.map(f => {
              const used = usedFolderIds.has(f.id);
              const selected = wiz.selectedFolderId === f.id;
              const displayName = f.name || f.label || '—';
              const childFiles = f.children ? (f.children||[]).filter(c => c.type === 'file') : (f.files||[]);
              const fileCount = childFiles.length;
              const escapedName = displayName.replace(/'/g, "\\'");
              return `
                <div class="rc-rv-folder-item ${selected?'selected':''} ${used?'disabled':''}"
                     onclick="${used ? '' : `rcSelectFolder('${f.id}','${escapedName}')`}">
                  <div class="rc-rv-folder-icon">
                    <svg viewBox="0 0 24 24" fill="${used?'#D1D5DB':'#EF4444'}" width="18" height="18"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <div class="rc-rv-folder-info">
                    <div class="rc-rv-folder-name">${displayName}</div>
                    <div class="rc-rv-folder-meta">${fileCount} 个文件${used ? ' · <span style="color:#DC2626;">已关联送审单</span>' : ''}</div>
                  </div>
                  ${selected ? '<svg viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2.5" width="18" height="18"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                </div>`;
            }).join('')}
          </div>` : `<div class="rc-rv-folder-empty">当前"送审文件夹"下暂无子文件夹，请先在文件目录中创建子文件夹</div>`}

          ${wiz.selectedFolderId ? rcRenderFolderPreview(subFolders.find(f => f.id === wiz.selectedFolderId)) : ''}
        </div>
      </div>

      <div class="rc-review-modal-ft">
        <button class="gd-btn gd-btn-outline" onclick="rcReviewWiz.type='';rcShowReviewTypeModal()">上一步</button>
        <button class="gd-btn gd-btn-primary" onclick="rcSubmitReview()">预送审</button>
      </div>
    </div>`;

  setTimeout(() => {
    document.addEventListener('click', rcGlobalTeacherClose);
  }, 0);
}

function rcRenderFolderPreview(folder) {
  if (!folder) return '';
  const files = folder.children
    ? (folder.children || []).filter(c => c.type === 'file')
    : (folder.files || DETAIL_FILES[folder.id] || []);
  if (!files.length) return `<div class="rc-rv-folder-preview"><div class="rc-rv-folder-empty">该文件夹为空</div></div>`;
  return `
    <div class="rc-rv-folder-preview">
      <div class="rc-rv-preview-title">文件夹内容预览（${files.length} 个文件）</div>
      <div class="rc-rv-preview-list">
        ${files.map(f => `
          <div class="rc-rv-preview-file">
            <svg viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="1.5" width="14" height="14"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span>${f.name}</span>
          </div>`).join('')}
      </div>
    </div>`;
}

/* ── 风控老师搜索 ── */

function rcFilterTeacherList(val) {
  rcReviewWiz.teacherName = val;
  const dd = document.getElementById('rc-rv-teacher-dropdown');
  if (!dd) return;
  const q = val.trim().toLowerCase();
  dd.querySelectorAll('.rc-rv-teacher-option').forEach(opt => {
    const name = opt.querySelector('.rc-rv-teacher-name')?.textContent || '';
    const dept = opt.querySelector('.rc-rv-teacher-dept')?.textContent || '';
    opt.style.display = (name.toLowerCase().includes(q) || dept.toLowerCase().includes(q) || !q) ? '' : 'none';
  });
  dd.style.display = 'block';
}

function rcShowTeacherDropdown() {
  const dd = document.getElementById('rc-rv-teacher-dropdown');
  if (dd) dd.style.display = 'block';
}

function rcSelectTeacher(id, name) {
  rcReviewWiz.teacherId = id;
  rcReviewWiz.teacherName = name;
  const dd = document.getElementById('rc-rv-teacher-dropdown');
  if (dd) dd.style.display = 'none';
  const input = document.getElementById('rc-rv-teacher-input');
  if (input) input.value = name;
}

function rcGlobalTeacherClose(e) {
  if (!e.target.closest('.rc-rv-search-wrap')) {
    const dd = document.getElementById('rc-rv-teacher-dropdown');
    if (dd) dd.style.display = 'none';
  }
  document.removeEventListener('click', rcGlobalTeacherClose);
}

/* ── 主体公司选择 ── */

function rcSelectCompanyRow(idx) {
  rcReviewWiz.selectedCompanyIdx = idx;
  rcRenderReviewWizard();
}

/* ── 送审文件夹选择 ── */

function rcSelectFolder(id, name) {
  rcReviewWiz.selectedFolderId = id;
  rcReviewWiz.selectedFolderName = name;
  rcRenderReviewWizard();
}

/* ── 预计送一审时间变更 → 自动填充结束时间 ── */

function rcOnPlanDateChange(val) {
  rcReviewWiz.planFirstReviewDate = val;
  if (val) {
    const d = new Date(val);
    d.setMonth(d.getMonth() + 1);
    const pad = (n) => String(n).padStart(2, '0');
    rcReviewWiz.planReviewEndDate = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } else {
    rcReviewWiz.planReviewEndDate = '';
  }
  const endInput = document.getElementById('rc-rv-end-date');
  if (endInput) endInput.value = rcReviewWiz.planReviewEndDate;
}

/* ── 提交预审单 ── */

function rcSubmitReview() {
  const wiz = rcReviewWiz;
  const ws = currentDetailWs;
  if (!ws) return;
  const rows = rcGetBindingRows();

  if (!wiz.teacherId && !wiz.teacherName) {
    showNotification('请选择风控老师');
    return;
  }
  if (wiz.selectedCompanyIdx < 0 || !rows[wiz.selectedCompanyIdx]) {
    showNotification('请选择主体公司');
    return;
  }
  if (!wiz.isAPT) {
    showNotification('请选择是否为 APT 项目');
    return;
  }
  if (!wiz.isSACP) {
    showNotification('请选择是否为 SACP 项目');
    return;
  }
  if (!wiz.projectUrgency) {
    showNotification('请选择总所项目类型（紧急程度）');
    return;
  }
  if (!wiz.planFirstReviewDate) {
    showNotification('请选择预计送一审时间');
    return;
  }
  const now = new Date();
  const planDate = new Date(wiz.planFirstReviewDate);
  if (planDate < now) {
    showNotification('预计送一审时间不可早于当前时间');
    return;
  }
  if (!wiz.selectedFolderId) {
    showNotification('请选择送审文件夹');
    return;
  }

  const row = rows[wiz.selectedCompanyIdx];

  const duplicate = RC_REVIEW_ORDERS.find(o =>
    o.workspaceId === (ws.id || '') &&
    o.company === row.name &&
    o.reportType === (row.reportType || '—') &&
    o.type === wiz.type
  );
  if (duplicate) {
    showNotification(`同一主体「${row.name}」（${row.reportType || '—'}）已存在${wiz.type}单（${duplicate.id}），不可重复发起`);
    return;
  }

  const order = {
    id: `RV-${Date.now()}`,
    type: wiz.type,
    workspace: ws.name,
    workspaceId: ws.id || '',
    company: row.name,
    reportType: row.reportType || '—',
    firmCode: row.firmCode || '—',
    teacherId: wiz.teacherId,
    teacherName: wiz.teacherName,
    orgId: wiz.type === '一审' ? '' : wiz.orgId,
    orgName: wiz.type === '一审' ? '' : (RC_ORGS.find(o => o.id === wiz.orgId)?.name || ''),
    folderId: wiz.selectedFolderId,
    folderName: wiz.selectedFolderName,
    isAPT: wiz.isAPT,
    isSACP: wiz.isSACP,
    projectUrgency: wiz.projectUrgency,
    planFirstReviewDate: wiz.planFirstReviewDate,
    planReviewEndDate: wiz.planReviewEndDate,
    submitter: '张伟',
    projectContact: '李明',
    submitTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
    actualReviewDate: '',
    status: '待启用',
  };

  RC_REVIEW_ORDERS.push(order);
  rcCloseReviewModal();
  showNotification(`${wiz.type}预审单已创建（待启用），风控老师：${wiz.teacherName}，主体：${row.name}`);
  if (typeof rvRenderMgrPanel === 'function') rvRenderMgrPanel();
}

/* ═══════════════════════════════════════════════════════
   批量预审（参考"批量导入全级次客户"交互模式）
   ═══════════════════════════════════════════════════════ */

const RC_BATCH_TEMPLATE_COLS = [
  '属于该生产工作区的公司名称', '财务报表类型', '公司名称对应的总所项目编号',
  '总所项目负责人', '所属业务部门', '一审老师', '二审老师', '2.5审老师',
  '预计送一审时间', '预计送二审时间', '预计送2.5审时间', '项目类型',
  '是否为APT项目', '是否为SACP项目',
];

const RCB_DEMO_ROWS = [
  { company:'比亚迪汽车（广东）有限公司', reportType:'合并', firmCode:'HQ-2025-HD-88801', firmManager:'张伟', dept:'审计一部', teacher1:'沈瑶', teacher2:'范冬梅', teacher25:'周海涛', planDate1:'2026-04-01', planDate2:'2026-04-15', planDate25:'2026-05-01', projectType:'常规', isAPT:'否', isSACP:'否' },
  { company:'中国比亚迪有限公司',         reportType:'单体', firmCode:'HQ-2025-HD-88802', firmManager:'张伟', dept:'审计一部', teacher1:'钟天宇', teacher2:'陈文博', teacher25:'',        planDate1:'2026-04-05', planDate2:'2026-04-20', planDate25:'',          projectType:'加急', isAPT:'是', isSACP:'否' },
  { company:'比亚迪新材料有限公司',       reportType:'单体', firmCode:'HQ-2025-HD-88803', firmManager:'张伟', dept:'审计一部', teacher1:'赵雅琪', teacher2:'',        teacher25:'',        planDate1:'2026-04-10', planDate2:'',           planDate25:'',          projectType:'特急', isAPT:'否', isSACP:'是' },
];

function rcOpenBatchReview() {
  rcCloseReviewModal();
  const modal = document.getElementById('rc-batch-modal');
  if (!modal) return;
  rcResetBatchModal();
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function rcResetBatchModal() {
  document.getElementById('rcb-view-upload').style.display = '';
  document.getElementById('rcb-view-result').style.display = 'none';
  const importBtn = document.getElementById('rcb-modal-import');
  if (importBtn) { importBtn.style.display = 'none'; importBtn.disabled = false; }
  const cancelEl = document.getElementById('rcb-modal-cancel');
  if (cancelEl) cancelEl.textContent = '取消';
  const titleEl = document.getElementById('rcb-modal-title');
  const subtitleEl = document.getElementById('rcb-modal-subtitle');
  if (titleEl) titleEl.textContent = '批量预审';
  if (subtitleEl) subtitleEl.textContent = '上传 Excel / CSV 文件，批量发起多个主体公司的预审单';
  document.getElementById('rcb-dz-idle').style.display = '';
  document.getElementById('rcb-dz-selected').style.display = 'none';
  document.getElementById('rcb-progress-bar').style.width = '0%';
  document.getElementById('rcb-progress-pct').textContent = '0%';
  document.getElementById('rcb-progress-label').textContent = '正在解析文件…';
}

function rcCloseBatchModal() {
  const modal = document.getElementById('rc-batch-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

function initBatchReviewModal() {
  const modal     = document.getElementById('rc-batch-modal');
  const closeBtn  = document.getElementById('rcb-modal-close');
  const cancelBtn = document.getElementById('rcb-modal-cancel');
  const importBtn = document.getElementById('rcb-modal-import');
  const dropzone  = document.getElementById('rcb-dropzone');
  const fileInput = document.getElementById('rcb-file-input');
  const dzBtn     = document.getElementById('rcb-dz-btn');
  const removeBtn = document.getElementById('rcb-file-remove');
  const tplLink   = document.getElementById('rcb-download-tpl');
  if (!modal) return;

  closeBtn?.addEventListener('click', rcCloseBatchModal);
  cancelBtn?.addEventListener('click', rcCloseBatchModal);
  modal.addEventListener('click', e => { if (e.target === modal) rcCloseBatchModal(); });

  tplLink?.addEventListener('click', e => {
    e.preventDefault();
    const ws = typeof currentDetailWs !== 'undefined' ? currentDetailWs : null;
    const bindingRows = ws && Array.isArray(ws.bindingRows) ? ws.bindingRows : [];
    const BOM = '\uFEFF';
    const header = RC_BATCH_TEMPLATE_COLS.join(',');
    const instructions = [
      '',
      '填写说明：',
      '1、属于该生产工作区的公司名称：必填，请从工作区绑定的主体公司中选择',
      '2、财务报表类型：必填，合并 / 单体',
      '3、公司名称对应的总所项目编号：选填',
      '4、总所项目负责人：选填',
      '5、所属业务部门：选填，默认使用工作区所属部门',
      '6、一审老师 / 二审老师 / 2.5审老师：填写姓名则自动生成对应类型预审单，留空则不生成',
      '7、预计送一审时间 / 预计送二审时间 / 预计送2.5审时间：格式 YYYY-MM-DD，审核结束时间自动加一个月',
      '8、项目类型：常规 / 加急 / 特急',
      '9、是否为APT项目：是 / 否',
      '10、是否为SACP项目：是 / 否',
    ];
    const sampleRows = bindingRows.length ? bindingRows.map(r =>
      [r.name||'', r.reportType||'', r.firmCode||'', r.firmManager||'',
       ws?.dept||'', '', '', '', '', '', '', '常规', '否', '否'].join(',')
    ) : ['示例公司名称,合并,PJ-2026-001,张伟,审计一部,沈瑶,范冬梅,,2026-04-01,2026-04-15,,常规,否,否'];
    const csv = BOM + header + '\n' + sampleRows.join('\n') + '\n' + instructions.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = '批量预审模板.csv'; a.click();
    URL.revokeObjectURL(a.href);
  });

  dzBtn?.addEventListener('click', () => fileInput?.click());

  dropzone?.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('dragging'); });
  dropzone?.addEventListener('dragleave', e => { if (!dropzone.contains(e.relatedTarget)) dropzone.classList.remove('dragging'); });
  dropzone?.addEventListener('drop', e => {
    e.preventDefault(); dropzone.classList.remove('dragging');
    const file = e.dataTransfer?.files?.[0];
    if (file) rcbHandleFile(file);
  });

  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) rcbHandleFile(file);
    fileInput.value = '';
  });

  removeBtn?.addEventListener('click', rcbResetToIdle);

  importBtn?.addEventListener('click', () => {
    importBtn.disabled = true;
    rcbSimulateProgress(() => {
      const result = rcbExecuteBatchImport();
      rcbShowResult(result);
    });
  });

  function rcbHandleFile(file) {
    const allowed = ['.xls', '.xlsx', '.csv'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) { showNotification('仅支持 .xls、.xlsx、.csv 格式文件'); return; }
    document.getElementById('rcb-file-name').textContent = file.name;
    document.getElementById('rcb-file-size').textContent = rcbFormatSize(file.size);
    document.getElementById('rcb-dz-idle').style.display = 'none';
    document.getElementById('rcb-dz-selected').style.display = '';
    if (importBtn) importBtn.style.display = '';
  }

  function rcbResetToIdle() {
    document.getElementById('rcb-dz-idle').style.display = '';
    document.getElementById('rcb-dz-selected').style.display = 'none';
    document.getElementById('rcb-progress-bar').style.width = '0%';
    document.getElementById('rcb-progress-pct').textContent = '0%';
    document.getElementById('rcb-progress-label').textContent = '正在解析文件…';
    if (importBtn) { importBtn.style.display = 'none'; importBtn.disabled = false; }
  }

  function rcbFormatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function rcbSimulateProgress(onComplete) {
    const bar   = document.getElementById('rcb-progress-bar');
    const pct   = document.getElementById('rcb-progress-pct');
    const label = document.getElementById('rcb-progress-label');
    const wrap  = document.getElementById('rcb-progress-wrap');
    if (wrap) wrap.style.display = '';
    const stages = [
      { target: 25, label: '正在解析文件结构…', duration: 500 },
      { target: 55, label: '正在校验数据格式…', duration: 600 },
      { target: 80, label: '正在创建预审单…',  duration: 700 },
      { target: 100, label: '批量预送审完成',   duration: 400 },
    ];
    let current = 0;
    function runStage(idx) {
      if (idx >= stages.length) { onComplete(); return; }
      const stage = stages[idx];
      if (label) label.textContent = stage.label;
      const start = current;
      const startTime = performance.now();
      function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / stage.duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const val = Math.round(start + (stage.target - start) * eased);
        if (bar) bar.style.width = val + '%';
        if (pct) pct.textContent = val + '%';
        if (progress < 1) { requestAnimationFrame(tick); }
        else { current = stage.target; setTimeout(() => runStage(idx + 1), 100); }
      }
      requestAnimationFrame(tick);
    }
    runStage(0);
  }

  function rcbExecuteBatchImport() {
    const ws = typeof currentDetailWs !== 'undefined' ? currentDetailWs : null;
    if (!ws) return { success: 0, skip: 0, fail: 0, failRows: [] };

    let success = 0, skip = 0, fail = 0;
    const failRows = [];
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const typeMap = [
      { key: 'teacher1',  type: '一审',   planKey: 'planDate1' },
      { key: 'teacher2',  type: '二审',   planKey: 'planDate2' },
      { key: 'teacher25', type: '2.5审',  planKey: 'planDate25' },
    ];

    RCB_DEMO_ROWS.forEach((r, idx) => {
      const errors = [];
      if (!r.company)    errors.push('缺少公司名称');
      if (!r.reportType) errors.push('缺少财务报表类型');
      if (errors.length) {
        fail++;
        failRows.push({ row: idx + 2, name: r.company || '(空)', reason: errors.join('；') });
        return;
      }

      typeMap.forEach(tm => {
        const teacher = r[tm.key];
        if (!teacher) return;
        const dup = RC_REVIEW_ORDERS.find(o =>
          o.workspaceId === (ws.id || '') &&
          o.company === r.company &&
          o.reportType === r.reportType &&
          o.type === tm.type
        );
        if (dup) { skip++; return; }

        const planFirst = r[tm.planKey] || '';
        let planEnd = '';
        if (planFirst) {
          try { const d = new Date(planFirst); d.setMonth(d.getMonth() + 1); planEnd = d.toISOString().slice(0, 16); } catch (_) { /* */ }
        }

        RC_REVIEW_ORDERS.push({
          id: `RV-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
          type: tm.type,
          workspace: ws.name,
          workspaceId: ws.id || '',
          company: r.company,
          reportType: r.reportType,
          firmCode: r.firmCode || '—',
          teacherId: '',
          teacherName: teacher,
          orgId: '',
          orgName: '',
          folderId: '',
          folderName: '',
          isAPT: r.isAPT || '否',
          isSACP: r.isSACP || '否',
          projectUrgency: r.projectType || '常规',
          planFirstReviewDate: planFirst,
          planReviewEndDate: planEnd,
          submitter: '张伟',
          projectContact: '李明',
          submitTime: now,
          actualReviewDate: '',
          status: '待启用',
        });
        success++;
      });
    });

    if (typeof rvRenderMgrPanel === 'function') rvRenderMgrPanel();
    return { success, skip, fail, failRows };
  }

  function rcbShowResult(result) {
    document.getElementById('rcb-view-upload').style.display = 'none';
    document.getElementById('rcb-view-result').style.display = '';
    if (importBtn) importBtn.style.display = 'none';
    const cancelEl = document.getElementById('rcb-modal-cancel');
    if (cancelEl) cancelEl.textContent = '关闭';
    const titleEl = document.getElementById('rcb-modal-title');
    const subtitleEl = document.getElementById('rcb-modal-subtitle');
    if (titleEl) titleEl.textContent = '批量预送审结果';
    if (subtitleEl) subtitleEl.textContent = '本次批量预送审已完成，详情如下';

    document.getElementById('rcb-stat-success').textContent = result.success;
    document.getElementById('rcb-stat-skip').textContent = result.skip;
    document.getElementById('rcb-stat-fail').textContent = result.fail;

    const hintEl = document.getElementById('rcb-result-hint');
    if (hintEl) {
      const msgs = [];
      if (result.skip > 0) msgs.push(`${result.skip} 条因已存在相同类型预审单被跳过`);
      if (result.fail > 0) {
        msgs.push(`${result.fail} 条因格式错误未能创建`);
        if (result.failRows.length) {
          msgs.push(result.failRows.map(r => `第${r.row}行（${r.reason}）`).join('、'));
        }
      }
      if (msgs.length) {
        hintEl.style.display = '';
        hintEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="14" height="14">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
          <circle cx="12" cy="16" r="0.5" fill="currentColor"/></svg>` + msgs.join('；');
      } else {
        hintEl.style.display = 'none';
      }
    }
  }
}

/* ═══════════════════════════════════════════════════════
   送审管理面板（项目工作区 Tab）
   ═══════════════════════════════════════════════════════ */

let rvMgrState = { tab: '一审', selectedIds: new Set(), search: '', view: 'list' };

function rvGetCurrentWsOrders() {
  const ws = typeof currentDetailWs !== 'undefined' ? currentDetailWs : null;
  if (!ws) return RC_REVIEW_ORDERS;
  return RC_REVIEW_ORDERS.filter(o => o.workspace === ws.name || o.workspaceId === (ws.id || ''));
}

function rvFindRelated(order, targetType) {
  return RC_REVIEW_ORDERS.find(o =>
    o.type === targetType &&
    o.company === order.company &&
    o.reportType === order.reportType &&
    (o.workspace === order.workspace || o.workspaceId === order.workspaceId)
  );
}

function rvGetStats() {
  const orders = rvGetCurrentWsOrders();
  const all = orders.length;
  const first = orders.filter(o => o.type === '一审').length;
  const second = orders.filter(o => o.type === '二审').length;
  const half = orders.filter(o => o.type === '2.5审').length;
  const inactive = orders.filter(o => o.status === '待启用').length;
  const reviewing = orders.filter(o => o.status === '审核中').length;
  const qIssued = orders.filter(o => o.status === 'Q单出具').length;
  const waitClearQ = orders.filter(o => o.status === '待清Q').length;
  const cleared = orders.filter(o => o.status === '清Q完成').length;
  return { all, first, second, half, inactive, reviewing, qIssued, waitClearQ, cleared };
}

const RV_STATUS_MAP = {
  '待启用': { color: '#6B7280', bg: '#F3F4F6' },
  '审核中': { color: '#3B82F6', bg: '#EFF6FF' },
  'Q单出具': { color: '#F59E0B', bg: '#FFFBEB' },
  '待清Q': { color: '#8B5CF6', bg: '#F5F3FF' },
  '清Q完成': { color: '#10B981', bg: '#ECFDF5' },
};

function rvMgrSwitchView(v) { rvMgrState.view = v; rvRenderMgrPanel(); }

function rvRenderMgrPanel() {
  const container = document.getElementById('rv-mgr-container');
  if (!container) return;

  const view = rvMgrState.view || 'list';

  container.innerHTML = `
    <div class="rv-mgr-view-tabs" style="display:flex;gap:0;border-bottom:2px solid #E5E7EB;margin-bottom:16px;">
      <button class="rv-view-tab ${view==='list'?'active':''}" onclick="rvMgrSwitchView('list')"
        style="padding:10px 20px;font-size:0.92rem;font-weight:${view==='list'?'600':'400'};color:${view==='list'?'#2563EB':'#6B7280'};
        border:none;background:none;cursor:pointer;border-bottom:2px solid ${view==='list'?'#2563EB':'transparent'};margin-bottom:-2px;">
        送审单列表</button>
      <button class="rv-view-tab ${view==='schedule'?'active':''}" onclick="rvMgrSwitchView('schedule')"
        style="padding:10px 20px;font-size:0.92rem;font-weight:${view==='schedule'?'600':'400'};color:${view==='schedule'?'#2563EB':'#6B7280'};
        border:none;background:none;cursor:pointer;border-bottom:2px solid ${view==='schedule'?'#2563EB':'transparent'};margin-bottom:-2px;">
        送审单排期</button>
    </div>
    <div id="rv-mgr-view-content"></div>`;

  if (view === 'list') rvRenderListView();
  else rvRenderScheduleView();
}

function rvRenderListView() {
  const el = document.getElementById('rv-mgr-view-content');
  if (!el) return;

  const st = rvGetStats();
  const tab = rvMgrState.tab;
  const orders = rvGetCurrentWsOrders().filter(o => o.type === tab);

  const q = rvMgrState.search.trim().toLowerCase();
  const filtered = q ? orders.filter(o =>
    o.id.toLowerCase().includes(q) ||
    o.company.toLowerCase().includes(q) ||
    o.teacherName.toLowerCase().includes(q) ||
    o.submitter.toLowerCase().includes(q)
  ) : orders;

  el.innerHTML = `
    <div class="rv-mgr-panel">
      <div class="rv-stat-grid">
        <div class="rv-stat-card"><div class="rv-stat-num">${st.all}</div><div class="rv-stat-label">送审单总数</div></div>
        <div class="rv-stat-card"><div class="rv-stat-num" style="color:#3B82F6;">${st.first}</div><div class="rv-stat-label">一审</div></div>
        <div class="rv-stat-card"><div class="rv-stat-num" style="color:#F59E0B;">${st.second}</div><div class="rv-stat-label">二审</div></div>
        <div class="rv-stat-card"><div class="rv-stat-num" style="color:#8B5CF6;">${st.half}</div><div class="rv-stat-label">2.5审</div></div>
        <div class="rv-stat-card"><div class="rv-stat-num" style="color:#6B7280;">${st.inactive}</div><div class="rv-stat-label">待启用</div></div>
        <div class="rv-stat-card"><div class="rv-stat-num" style="color:#3B82F6;">${st.reviewing}</div><div class="rv-stat-label">审核中</div></div>
        <div class="rv-stat-card"><div class="rv-stat-num" style="color:#F59E0B;">${st.qIssued}</div><div class="rv-stat-label">Q单出具</div></div>
        <div class="rv-stat-card"><div class="rv-stat-num" style="color:#8B5CF6;">${st.waitClearQ}</div><div class="rv-stat-label">待清Q</div></div>
        <div class="rv-stat-card"><div class="rv-stat-num" style="color:#10B981;">${st.cleared}</div><div class="rv-stat-label">清Q完成</div></div>
      </div>

      <div class="rv-tab-bar">
        <div class="rv-tabs">
          ${['一审','二审','2.5审'].map(t => `
            <button class="rv-tab ${t===tab?'active':''}" onclick="rvMgrState.tab='${t}';rvMgrState.selectedIds.clear();rvRenderMgrPanel()">
              ${t}
              <span class="rv-tab-badge">${rvGetCurrentWsOrders().filter(o=>o.type===t).length}</span>
            </button>`).join('')}
        </div>
        <div class="rv-toolbar">
          <div class="rv-search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" width="14" height="14"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input class="rv-search-input" placeholder="搜索编号、公司、老师..." value="${rvMgrState.search}" oninput="rvMgrState.search=this.value;rvRenderMgrPanel()">
          </div>
        </div>
      </div>

      <div class="rv-table-wrap">
        ${rvRenderTable(tab, filtered)}
      </div>
    </div>`;
}

/* ═══════════════════════════════════════════════════════
   送审单排期（项目工作区视角）
   ═══════════════════════════════════════════════════════ */

let rvSchState = { timeMode: 'week', date: null, _inited: false };

function rvSchFmt(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function rvSchStartOfWeek(d) {
  const r = new Date(d);
  r.setDate(r.getDate() - ((r.getDay() + 6) % 7));
  r.setHours(0,0,0,0);
  return r;
}

function rvSchBuildDates(start, end) {
  const arr = [];
  const cur = new Date(start);
  while (cur <= end) { arr.push(new Date(cur)); cur.setDate(cur.getDate() + 1); }
  return arr;
}

function rvSchGetRange() {
  const mode = rvSchState.timeMode;
  const anchor = new Date(rvSchState.date);
  let start, end;
  if (mode === 'day') { start = anchor; end = new Date(anchor); }
  else if (mode === 'month') { start = new Date(anchor.getFullYear(), anchor.getMonth(), 1); end = new Date(anchor.getFullYear(), anchor.getMonth()+1, 0); }
  else { start = rvSchStartOfWeek(anchor); end = new Date(start); end.setDate(end.getDate()+6); }

  let label = `${rvSchFmt(start)} 至 ${rvSchFmt(end)}`;
  if (mode === 'day') label = rvSchFmt(start);
  if (mode === 'month') label = `${start.getFullYear()}年${start.getMonth()+1}月`;
  return { mode, start, end, dates: rvSchBuildDates(start, end), label, startKey: rvSchFmt(start), endKey: rvSchFmt(end) };
}

function rvSchGetMembers() {
  const ws = typeof currentDetailWs !== 'undefined' ? currentDetailWs : null;
  if (!ws) return [];
  return (typeof PM_MEMBERS_ALL !== 'undefined' ? PM_MEMBERS_ALL : [])
    .filter(m => m.wsIds.includes(ws.id) && m.status === 'joined');
}

function rvSchMapOrder(o) {
  const startRaw = o.actualReviewDate || (o.planFirstReviewDate ? o.planFirstReviewDate.replace('T', ' ') : '');
  const endRaw = o.qClearTime || (o.planReviewEndDate ? o.planReviewEndDate.replace('T', ' ') : '');
  const startDate = startRaw ? startRaw.slice(0, 10) : '';
  const endDate = endRaw ? endRaw.slice(0, 10) : '';
  if (!startDate || !endDate) return null;
  return {
    id: o.id, title: `${o.type}-${o.company}`, type: o.type, status: o.status,
    company: o.company, reportType: o.reportType,
    projectContact: o.projectContact || o.submitter || '',
    startDate, endDate: endDate < startDate ? startDate : endDate,
  };
}

function rvSchGetItems() {
  return rvGetCurrentWsOrders().map(rvSchMapOrder).filter(Boolean);
}

function rvSchItemsForMember(items, member) {
  return items
    .filter(it => it.projectContact === member.name)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

function rvSchGetDefaultDate() {
  const items = rvSchGetItems();
  if (!items.length) return new Date();
  const starts = items.map(it => it.startDate).sort();
  const now = rvSchFmt(new Date());
  const future = starts.filter(s => s >= now);
  return new Date(future.length ? future[0] : starts[starts.length - 1]);
}

function rvSchNav(dir) {
  const d = new Date(rvSchState.date);
  if (rvSchState.timeMode === 'day') d.setDate(d.getDate() + dir);
  else if (rvSchState.timeMode === 'month') d.setMonth(d.getMonth() + dir);
  else d.setDate(d.getDate() + dir * 7);
  rvSchState.date = d;
  rvRenderScheduleView();
}

function rvSchSetTime(mode) { rvSchState.timeMode = mode; rvRenderScheduleView(); }

function rvRenderScheduleView() {
  const el = document.getElementById('rv-mgr-view-content');
  if (!el) return;

  if (!rvSchState._inited) {
    rvSchState.date = rvSchGetDefaultDate();
    rvSchState._inited = true;
  }

  const range = rvSchGetRange();
  const members = rvSchGetMembers();
  const allItems = rvSchGetItems();
  const visibleItems = allItems.filter(it => it.startDate <= range.endKey && it.endDate >= range.startKey);
  const TODAY_KEY = rvSchFmt(new Date());
  const WD = ['日','一','二','三','四','五','六'];

  const memberRows = members.map(m => {
    const mItems = rvSchItemsForMember(visibleItems, m);
    const load = mItems.length;
    const roleName = (typeof pmRoleName === 'function') ? pmRoleName(m.roleId) : m.roleId;
    const cells = range.dates.map(date => {
      const key = rvSchFmt(date);
      const dayItems = mItems.filter(it => it.startDate <= key && it.endDate >= key);
      const isToday = key === TODAY_KEY;
      return `<td class="day-col${isToday ? ' today-col' : ''}">
        <div class="gd-schedule-cell">
          ${dayItems.length ? dayItems.map(it => {
            const isStart = key === it.startDate;
            const p = RC_REVIEW_TYPE_PALETTE[it.type] || { bg:'#F3F4F6', text:'#374151', border:'#D1D5DB' };
            const title = `${it.title}\n${it.reportType} · ${it.status}\n${it.startDate} 至 ${it.endDate}`;
            const clickAttr = ` onclick="event.stopPropagation();rvOpenDetail('${it.id}','project')"`;
            return `<div class="gd-sch-item gd-sch-order ${!isStart?'continuation':''}"
              style="--sch-bg:${p.bg};--sch-text:${p.text};--sch-border:${p.border};"
              title="${title.replace(/"/g,'&quot;')}"${clickAttr}>
              ${isStart ? `
                <div class="sch-title">${it.title}</div>
                <div class="sch-meta"><span>${it.status}</span><span>至 ${it.endDate}</span></div>`
                : `<div class="sch-dots">${it.type} · ${it.status}</div>`}
            </div>`;
          }).join('') : '<div class="gd-schedule-empty"></div>'}
        </div>
      </td>`;
    }).join('');

    return `<tr>
      <td class="user-col">
        <div class="gd-schedule-user-name">${m.name}</div>
        <div class="gd-schedule-user-dept">${roleName} · ${m.dept}</div>
        <div class="gd-schedule-user-load">当前范围 ${load} 个送审单</div>
      </td>
      ${cells}
    </tr>`;
  }).join('');

  const legendHtml = ['一审','二审','2.5审'].map(t => {
    const p = RC_REVIEW_TYPE_PALETTE[t];
    return `<div class="gd-legend-item"><div class="gd-legend-dot" style="background:${p.bg};border-color:${p.border};"></div><span>${t}</span></div>`;
  }).join('');

  el.innerHTML = `
    <div class="gd-schedule-topbar">
      <div>
        <div class="gd-schedule-title">送审单排期</div>
        <div class="gd-schedule-sub">展示当前项目工作区所有成员的送审单排期，排期块根据送审单时间自动生成。</div>
      </div>
      <div class="gd-schedule-summary">
        <div class="gd-schedule-stat-card"><strong>${members.length}</strong><span>项目成员</span></div>
        <div class="gd-schedule-stat-card"><strong>${visibleItems.length}</strong><span>当前范围送审单</span></div>
      </div>
    </div>

    <div class="gd-schedule-controls">
      <div class="gd-schedule-left">
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="gd-ctrl-label">时间：</span>
          <div class="gd-ctrl-group">
            <button class="gd-ctrl-btn ${rvSchState.timeMode==='day'?'active':''}" onclick="rvSchSetTime('day')">日</button>
            <button class="gd-ctrl-btn ${rvSchState.timeMode==='week'?'active':''}" onclick="rvSchSetTime('week')">周</button>
            <button class="gd-ctrl-btn ${rvSchState.timeMode==='month'?'active':''}" onclick="rvSchSetTime('month')">月</button>
          </div>
        </div>
        <div class="gd-schedule-nav">
          <button class="gd-nav-arrow" onclick="rvSchNav(-1)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="gd-schedule-period">
            <svg viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" width="15" height="15"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>${range.label}</span>
          </div>
          <button class="gd-nav-arrow" onclick="rvSchNav(1)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
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
              const key = rvSchFmt(date);
              const isToday = key === TODAY_KEY;
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              return `<th class="${isToday ? 'today-hd' : isWeekend ? 'weekend-hd' : ''}">
                <div>周${WD[date.getDay()]}</div>
                <div style="font-size:0.7rem;font-weight:400;">${date.getMonth()+1}/${date.getDate()}</div>
              </th>`;
            }).join('')}
          </tr>
        </thead>
        <tbody>${memberRows}</tbody>
      </table>` : `
      <div class="gd-empty-center" style="padding:48px 16px;">
        <div>当前项目工作区暂无在岗成员</div>
      </div>`}
    </div>

    <div class="gd-legend">${legendHtml}</div>`;
}

function rvRenderTable(tab, orders) {
  if (!orders.length) {
    return `<div class="rv-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="1.5" width="40" height="40"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
      <p>暂无${tab}送审单</p>
    </div>`;
  }

  const isFirst = tab === '一审';
  const isSecond = tab === '二审';

  let relCol1Header, relCol2Header, planDateHeader, actualDateHeader, teacherHeader;
  if (isFirst) {
    relCol1Header = '关联二审单'; relCol2Header = '关联2.5审单';
    planDateHeader = '预计送一审时间'; actualDateHeader = '实际送一审时间'; teacherHeader = '一审老师';
  } else if (isSecond) {
    relCol1Header = '关联一审单'; relCol2Header = '关联2.5审单';
    planDateHeader = '预计送二审时间'; actualDateHeader = '实际送二审时间'; teacherHeader = '二审老师';
  } else {
    relCol1Header = '关联一审单'; relCol2Header = '关联二审单';
    planDateHeader = '预计送2.5审时间'; actualDateHeader = '实际送2.5审时间'; teacherHeader = '2.5审老师';
  }

  const allChecked = orders.every(o => rvMgrState.selectedIds.has(o.id));

  const thead = `<tr>
    <th style="width:36px;text-align:center;"><input type="checkbox" ${allChecked?'checked':''} onchange="rvToggleAll(this.checked)"></th>
    <th style="min-width:130px;">送审单编号</th>
    <th style="min-width:150px;">送审单标题</th>
    <th style="min-width:120px;">${relCol1Header}</th>
    <th style="min-width:120px;">${relCol2Header}</th>
    <th style="width:70px;">提交人</th>
    <th style="width:90px;">项目组对接人</th>
    <th style="width:130px;">提交时间</th>
    <th style="min-width:160px;">主体公司名称</th>
    <th style="width:90px;">财务报表类型</th>
    <th style="width:130px;">${planDateHeader}</th>
    <th style="width:130px;">${actualDateHeader}</th>
    <th style="width:80px;">风控组织</th>
    <th style="width:80px;">${teacherHeader}</th>
    <th style="width:80px;position:sticky;right:80px;z-index:2;background:#F8FAFC;">状态</th>
    <th style="width:80px;position:sticky;right:0;z-index:2;background:#F8FAFC;">操作</th>
  </tr>`;

  const rows = orders.map(o => {
    const sel = rvMgrState.selectedIds.has(o.id);
    const title = `${o.type}-${o.company}-${o.reportType}`;

    let rel1Type, rel2Type;
    if (isFirst) { rel1Type = '二审'; rel2Type = '2.5审'; }
    else if (isSecond) { rel1Type = '一审'; rel2Type = '2.5审'; }
    else { rel1Type = '一审'; rel2Type = '二审'; }

    const rel1 = rvFindRelated(o, rel1Type);
    const rel2 = rvFindRelated(o, rel2Type);

    const sm = RV_STATUS_MAP[o.status] || { color: '#6B7280', bg: '#F3F4F6' };
    const planDisplay = o.planFirstReviewDate ? o.planFirstReviewDate.replace('T', ' ') : '—';
    const actualDisplay = o.actualReviewDate || '—';

    return `<tr class="${sel?'rv-row-selected':''} rv-clickable-row" onclick="rvOpenDetail('${o.id}','project')">
      <td style="text-align:center;" onclick="event.stopPropagation()"><input type="checkbox" ${sel?'checked':''} onchange="rvToggleRow('${o.id}',this.checked)"></td>
      <td><span class="rv-order-id">${o.id}</span></td>
      <td title="${title}"><span class="rv-order-title">${title}</span></td>
      <td>${rel1 ? `<span class="rv-link" onclick="event.stopPropagation();rvJumpToOrder('${rel1.type}')">${rel1.id}</span>` : '<span class="rv-na">—</span>'}</td>
      <td>${rel2 ? `<span class="rv-link" onclick="event.stopPropagation();rvJumpToOrder('${rel2.type}')">${rel2.id}</span>` : '<span class="rv-na">—</span>'}</td>
      <td>${o.submitter||'—'}</td>
      <td>${o.projectContact||'—'}</td>
      <td class="rv-mono">${o.submitTime||'—'}</td>
      <td title="${o.company}"><span class="rv-ellipsis">${o.company}</span></td>
      <td>${o.reportType||'—'}</td>
      <td class="rv-mono">${planDisplay}</td>
      <td class="rv-mono">${actualDisplay}</td>
      <td>${o.orgName||'—'}</td>
      <td>${o.teacherName||'—'}</td>
      <td style="position:sticky;right:80px;z-index:1;background:#fff;">
        <span class="rv-status-badge" style="color:${sm.color};background:${sm.bg};">${o.status}</span>
      </td>
      <td style="position:sticky;right:0;z-index:1;background:#fff;" onclick="event.stopPropagation()">
        <div class="rv-ops">
          ${o.status==='待启用'?`
          <button class="rv-op-btn" title="提交" onclick="rvActionSubmit('${o.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
          </button>` : o.status==='Q单出具'?`
          <button class="rv-op-btn" title="申请清Q" onclick="rvActionApplyClearQ('${o.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </button>` : '<span style="color:#D1D5DB;">—</span>'}
        </div>
      </td>
    </tr>`;
  }).join('');

  return `<table class="rv-table"><thead>${thead}</thead><tbody>${rows}</tbody></table>`;
}

function rvToggleAll(checked) {
  const orders = rvGetCurrentWsOrders().filter(o => o.type === rvMgrState.tab);
  if (checked) orders.forEach(o => rvMgrState.selectedIds.add(o.id));
  else rvMgrState.selectedIds.clear();
  rvRenderMgrPanel();
}

function rvToggleRow(id, checked) {
  if (checked) rvMgrState.selectedIds.add(id);
  else rvMgrState.selectedIds.delete(id);
  rvRenderMgrPanel();
}

function rvJumpToOrder(type) {
  rvMgrState.tab = type;
  rvMgrState.selectedIds.clear();
  rvRenderMgrPanel();
}

function rvRecallOrder(id) {
  const o = RC_REVIEW_ORDERS.find(x => x.id === id);
  if (o) { o.status = '待启用'; showNotification(`送审单 ${id} 已撤回为待启用`); }
  rvRenderMgrPanel();
}

/* ═══════════════════════════════════════════════════════
   送审单详情页
   ═══════════════════════════════════════════════════════ */

const RV_LOGS = {};
const RV_Q_FILES = {};

(function rvInitMockLogs() {
  RC_REVIEW_ORDERS.forEach(o => {
    const isActive = (s) => o.status === s;
    RV_LOGS[o.id] = [
      { action: '发起预审单', op: o.submitter, content: `${o.submitter} 发起${o.type}预审单，状态为"待启用"`, time: o.submitTime, active: isActive('待启用') },
    ];
    if (o.actualReviewDate) {
      RV_LOGS[o.id].push({ action: '提交送审', op: o.projectContact || o.submitter, content: `项目组提交送审单，状态变为"审核中"`, time: o.actualReviewDate, active: isActive('审核中') });
    }
    if (o.qIssueTime) {
      RV_LOGS[o.id].push({ action: 'Q单出具', op: o.teacherName, content: `${o.teacherName} 出具 Q 单，状态变为"Q单出具"`, time: o.qIssueTime, active: isActive('Q单出具') });
    }
    if (o.status === '待清Q') {
      const clearApplyTime = o.qIssueTime ? o.qIssueTime.replace(/\d{2}:\d{2}$/, '16:00') : o.submitTime;
      RV_LOGS[o.id].push({ action: '申请清Q', op: o.projectContact || o.submitter, content: `项目组申请清 Q，状态变为"待清Q"`, time: clearApplyTime, active: true });
    }
    if (o.qClearTime) {
      RV_LOGS[o.id].push({ action: '清Q通过', op: o.teacherName, content: `${o.teacherName} 确认清 Q 通过，状态变为"清Q完成"`, time: o.qClearTime, active: true });
    }
  });
  RV_Q_FILES['RV-20260320-001'] = [
    { name: 'Q单-比亚迪汽车-一审.docx', size: '580 KB', modBy: '沈瑶', modAt: '2026-03-24 15:30', version: 'V1', ext: 'docx' },
  ];
  RV_Q_FILES['RV-20260327-008'] = [
    { name: 'Q单-比亚迪新材料-二审.docx', size: '420 KB', modBy: '邓丽华', modAt: '2026-03-29 11:00', version: 'V1', ext: 'docx' },
  ];
  RV_Q_FILES['RV-20260328-009'] = [
    { name: 'Q单-比亚迪新材料-2.5审.xlsx', size: '310 KB', modBy: '方毅', modAt: '2026-03-29 09:00', version: 'V1', ext: 'xlsx' },
  ];
  RV_Q_FILES['RV-20260325-005'] = [
    { name: 'Q单-比亚迪新材料-一审.docx', size: '490 KB', modBy: '赵雅琪', modAt: '2026-03-27 10:00', version: 'V1', ext: 'docx' },
  ];
})();

let rvDetailState = { orderId: null, rightTab: 'logs', viewContext: 'project' };

function rvOpenDetail(id, viewContext) {
  rvDetailState.orderId = id;
  rvDetailState.rightTab = 'logs';
  if (viewContext) rvDetailState.viewContext = viewContext;
  rvRenderDetail();
}

function rvCloseDetail() {
  rvDetailState.orderId = null;
  const overlay = document.getElementById('rv-detail-overlay');
  if (overlay) overlay.remove();
}

function rvGetWsMeta(order) {
  if (typeof WORKSPACE_DATA !== 'undefined') {
    const ws = WORKSPACE_DATA.find(w => w.id === order.workspaceId || w.name === order.workspace);
    if (ws) return ws;
  }
  return null;
}

function rvRenderDetail() {
  const id = rvDetailState.orderId;
  const order = RC_REVIEW_ORDERS.find(o => o.id === id);
  if (!order) return;

  let overlay = document.getElementById('rv-detail-overlay');
  const isNew = !overlay;
  if (isNew) {
    overlay = document.createElement('div');
    overlay.id = 'rv-detail-overlay';
    overlay.className = 'rv-detail-overlay';
    document.body.appendChild(overlay);
  }
  overlay.style.display = 'flex';
  overlay.innerHTML = `
    <div class="rv-detail-backdrop" onclick="rvCloseDetail()"></div>
    <div class="rv-detail-drawer ${isNew ? '' : 'rv-no-anim'}">
      <div class="rv-detail-2col">
        <div class="rv-detail-left" id="rv-detail-left">${rvDetailLeftHtml(order)}</div>
        <div class="rv-detail-right" id="rv-detail-right">${rvDetailRightHtml(order)}</div>
      </div>
    </div>`;

  rvBindDetailTabs();
}

function rvRefreshRight() {
  const id = rvDetailState.orderId;
  const order = RC_REVIEW_ORDERS.find(o => o.id === id);
  if (!order) return;
  const rightEl = document.getElementById('rv-detail-right');
  if (rightEl) {
    rightEl.innerHTML = rvDetailRightHtml(order);
    rvBindDetailTabs();
  }
}

function rvRefreshLeft() {
  const id = rvDetailState.orderId;
  const order = RC_REVIEW_ORDERS.find(o => o.id === id);
  if (!order) return;
  const leftEl = document.getElementById('rv-detail-left');
  if (leftEl) leftEl.innerHTML = rvDetailLeftHtml(order);
}

function rvBindDetailTabs() {
  const overlay = document.getElementById('rv-detail-overlay');
  if (!overlay) return;
  overlay.querySelectorAll('.rv-itab').forEach(btn => {
    btn.addEventListener('click', () => {
      rvDetailState.rightTab = btn.dataset.rvtab;
      rvRefreshRight();
    });
  });
}

function rvDetailLeftHtml(order) {
  const ws = rvGetWsMeta(order);
  const isFirst = order.type === '一审';
  const isSecond = order.type === '二审';
  const is25 = order.type === '2.5审';

  const titleColor = isFirst ? '#3B82F6' : isSecond ? '#F59E0B' : '#8B5CF6';
  const typeLabel = isFirst ? '一审单' : isSecond ? '二审单' : '2.5审单';
  const sm = RV_STATUS_MAP[order.status] || { color: '#6B7280', bg: '#F3F4F6' };

  const teacherLabel = isFirst ? '一审老师' : isSecond ? '二审老师' : '2.5审老师';
  const planLabel = isFirst ? '预计送一审时间' : isSecond ? '预计送二审时间' : '预计送2.5审时间';
  const actualLabel = isFirst ? '实际送一审时间' : isSecond ? '实际送二审时间' : '实际送2.5审时间';

  const rel1Type = isFirst ? '二审' : '一审';
  const rel2Type = isFirst ? '2.5审' : isSecond ? '2.5审' : '二审';
  const rel1Label = isFirst ? '关联二审单' : isSecond ? '关联一审单' : '关联一审单';
  const rel2Label = isFirst ? '关联2.5审单' : isSecond ? '关联2.5审单' : '关联二审单';

  const rel1 = rvFindRelated(order, rel1Type);
  const rel2 = rvFindRelated(order, rel2Type);

  const bindingRow = ws && ws.bindingRows
    ? ws.bindingRows.find(r => r.name === order.company && r.reportType === order.reportType)
    : null;

  const ops = [];
  const ctx = rvDetailState.viewContext || 'project';
  const isProject = ctx === 'project';
  const isRC = ctx === 'rc';

  const opHintProject = {
    '待启用': '送审单已创建，请提交后风控老师将开始审核',
    '审核中': '风控老师正在审核中，请等待',
    'Q单出具': '风控老师已出具 Q 单，请申请清 Q',
    '待清Q': '已申请清 Q，等待风控老师审核',
    '清Q完成': '清 Q 完成，送审流程结束',
  };
  const opHintRC = {
    '待启用': '送审单待项目组提交',
    '审核中': '请审核送审材料并出具 Q 单',
    'Q单出具': '已出具 Q 单，等待项目组申请清 Q',
    '待清Q': '项目组已申请清 Q，请审核后驳回或通过',
    '清Q完成': '清 Q 完成，送审流程结束',
  };
  const opHint = (isRC ? opHintRC : opHintProject)[order.status] || '';

  if (isProject && order.status === '待启用') {
    ops.push(`<button class="gd-op-btn gd-op-primary" onclick="rvActionSubmit('${order.id}')">提交</button>`);
  }
  if (isRC && order.status === '审核中') {
    ops.push(`<button class="gd-op-btn gd-op-outline" onclick="rvActionQIssue('${order.id}')">Q单出具</button>`);
  }
  if (isProject && order.status === 'Q单出具') {
    ops.push(`<button class="gd-op-btn gd-op-primary" onclick="rvActionApplyClearQ('${order.id}')">申请清Q</button>`);
  }
  if (isRC && order.status === '待清Q') {
    ops.push(`<button class="gd-op-btn gd-op-danger" onclick="rvActionRejectClearQ('${order.id}')">驳回</button>`);
    ops.push(`<button class="gd-op-btn gd-op-success" onclick="rvActionPassClearQ('${order.id}')">清Q通过</button>`);
  }

  return `
    <div class="gd-drawer-head">
      <div class="gd-drawer-head-info">
        <div class="gd-drawer-id">${order.id}</div>
        <div class="gd-drawer-title">${order.type}-${order.company}-${order.reportType}</div>
      </div>
      <button class="gd-drawer-close" onclick="rvCloseDetail()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="14" height="14">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div class="gd-drawer-tags">
      <span class="rv-status-badge" style="color:${sm.color};background:${sm.bg};">${order.status}</span>
      <span class="gd-tag" style="background:${titleColor}15;color:${titleColor};border:1px solid ${titleColor}30;">${typeLabel}</span>
    </div>

    <div class="gd-drawer-section-title">基础信息</div>
    <div class="gd-dinfo-grid">
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">${planLabel}</span>
        <span class="gd-dinfo-val">${order.planFirstReviewDate ? order.planFirstReviewDate.replace('T',' ') : '—'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">预计审核结束时间</span>
        <span class="gd-dinfo-val">${order.planReviewEndDate ? order.planReviewEndDate.replace('T',' ') : '—'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">${actualLabel}</span>
        <span class="gd-dinfo-val">${order.actualReviewDate || '<span style="color:#9CA3AF;">—</span>'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">发起人</span>
        <span class="gd-dinfo-val">${order.submitter || '—'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">项目组跟进人</span>
        <span class="gd-dinfo-val">${order.projectContact || order.submitter || '—'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">${teacherLabel}</span>
        <span class="gd-dinfo-val">${order.teacherName || '—'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">风控组织</span>
        <span class="gd-dinfo-val">${order.orgName || '<span style="color:#9CA3AF;">—</span>'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">所属业务部门</span>
        <span class="gd-dinfo-val">${ws ? ws.dept : '—'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">所属集团客户</span>
        <span class="gd-dinfo-val">${ws ? ws.group : '—'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">主体公司名称</span>
        <span class="gd-dinfo-val">${order.company || '—'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">财务报表类型</span>
        <span class="gd-dinfo-val">${order.reportType || '—'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">总所项目编号</span>
        <span class="gd-dinfo-val">${bindingRow ? bindingRow.firmCode : (order.firmCode || '—')}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">总所项目负责人</span>
        <span class="gd-dinfo-val">${bindingRow ? (bindingRow.firmManager || '—') : '—'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">总所项目类型</span>
        <span class="gd-dinfo-val">${order.projectUrgency || '—'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">是否为 APT 项目</span>
        <span class="gd-dinfo-val">${order.isAPT || '—'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">是否为 SACP 项目</span>
        <span class="gd-dinfo-val">${order.isSACP || '—'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">${rel1Label}</span>
        <span class="gd-dinfo-val">${rel1 ? `<span class="rv-link" onclick="rvOpenDetail('${rel1.id}')">${rel1.id}</span>` : '<span style="color:#9CA3AF;">—</span>'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">${rel2Label}</span>
        <span class="gd-dinfo-val">${rel2 ? `<span class="rv-link" onclick="rvOpenDetail('${rel2.id}')">${rel2.id}</span>` : '<span style="color:#9CA3AF;">—</span>'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">Q单出具时间</span>
        <span class="gd-dinfo-val">${order.qIssueTime || '<span style="color:#9CA3AF;">—</span>'}</span>
      </div>
      <div class="gd-dinfo-item">
        <span class="gd-dinfo-label">清Q完成时间</span>
        <span class="gd-dinfo-val">${order.qClearTime || '<span style="color:#9CA3AF;">—</span>'}</span>
      </div>
      <div class="gd-dinfo-item gd-dinfo-full">
        <span class="gd-dinfo-label">所属项目工作区</span>
        <span class="gd-dinfo-val">${order.workspace || '—'}</span>
      </div>
      <div class="gd-dinfo-item gd-dinfo-full">
        <span class="gd-dinfo-label">备注</span>
        <span class="gd-dinfo-val" style="white-space:pre-wrap;">${order.type}预审单，主体公司：${order.company}，${order.reportType}，由 ${order.submitter} 于 ${order.submitTime} 发起</span>
      </div>
    </div>

    <div class="gd-drawer-op-zone">
      ${opHint ? `<div class="gd-op-hint">${opHint}</div>` : ''}
      <div class="gd-op-btns">${ops.length ? ops.join('') : '<span style="color:#9CA3AF;font-size:0.82rem;">当前状态无可用操作</span>'}</div>
    </div>`;
}

function rvDetailRightHtml(order) {
  const tab = rvDetailState.rightTab;
  return `
    <div class="rv-detail-tabs">
      <button class="rv-itab ${tab==='logs'?'active':''}" data-rvtab="logs">操作日志</button>
      <button class="rv-itab ${tab==='folder'?'active':''}" data-rvtab="folder">项目组送审文件夹</button>
      <button class="rv-itab ${tab==='qsheet'?'active':''}" data-rvtab="qsheet">Q 单</button>
      <button class="rv-itab ${tab==='chat'?'active':''}" data-rvtab="chat">日常沟通</button>
    </div>
    <div class="rv-detail-tab-content">${rvDetailTabContent(order, tab)}</div>`;
}

function rvDetailTabContent(order, tab) {
  if (tab === 'logs') return rvDetailLogsHtml(order);
  if (tab === 'folder') return rvDetailFolderHtml(order);
  if (tab === 'qsheet') return rvDetailQSheetHtml(order);
  if (tab === 'chat') return rvDetailChatHtml(order);
  return '';
}

function rvDetailLogsHtml(order) {
  const logs = RV_LOGS[order.id] || [{ action: '发起送审单', op: order.submitter, content: `发起${order.type}预审单`, time: order.submitTime, active: true }];
  return `
    <div class="gd-log-list" style="padding:16px;">
      ${logs.map(l => `
        <div class="gd-log-item">
          <div class="gd-log-dot ${l.active?'active':''}"></div>
          <div class="gd-log-body">
            <div class="gd-log-action">${l.action} <span class="gd-log-op">· ${l.op}</span></div>
            <div class="gd-log-content">${l.content}</div>
            <div class="gd-log-time">${l.time}</div>
          </div>
        </div>`).join('')}
    </div>`;
}

function rvDetailFolderHtml(order) {
  const folderId = order.folderId;
  const folderName = order.folderName || '—';

  let files = [];
  if (folderId) {
    if (typeof DETAIL_FILES !== 'undefined' && DETAIL_FILES[folderId]) {
      files = DETAIL_FILES[folderId];
    } else if (typeof REVIEW_SUB_FOLDERS !== 'undefined') {
      const sf = REVIEW_SUB_FOLDERS.find(f => f.id === folderId);
      if (sf) files = sf.files || [];
    }
  }

  return `
    <div style="padding:16px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <div style="font-size:0.82rem;font-weight:600;color:#1F2937;">
          送审文件夹：${folderName}
        </div>
        <button class="gd-op-btn gd-op-primary gd-btn-xs" onclick="showNotification('跳转送审文件夹')">跳转送审文件夹</button>
      </div>
      ${files.length ? `
      <div class="rv-detail-file-table-wrap">
        <table class="rv-detail-file-table">
          <thead><tr><th>文件名</th><th>大小</th><th>修改人</th><th>修改时间</th><th>当前版本</th><th style="text-align:center;">操作</th></tr></thead>
          <tbody>${files.map(f => `
            <tr>
              <td><div class="pd-fname-cell"><span class="pd-file-ext ${f.ext||''}">${(f.ext||'').toUpperCase()}</span><span title="${f.name}">${f.name}</span></div></td>
              <td style="color:#6B7280;">${f.size||'—'}</td>
              <td>${f.modBy||'—'}</td>
              <td class="rv-mono">${f.modAt||'—'}</td>
              <td><span class="vl-version-badge">${f.version||'—'}</span></td>
              <td style="text-align:center;">
                <div class="rv-ops">
                  <button class="rv-op-btn" title="下载" onclick="showNotification('下载 ${f.name}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </button>
                  <button class="rv-op-btn" title="上传新版本" onclick="showNotification('上传新版本 ${f.name}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </button>
                  <button class="rv-op-btn" title="重命名" onclick="showNotification('重命名 ${f.name}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                </div>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>` : `<div class="rv-empty" style="padding:40px 0;"><p>送审文件夹暂无文件</p></div>`}

      <div class="rv-upload-zone" onclick="showNotification('上传文件到送审文件夹')">
        <svg viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5" width="28" height="28"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <span>点击或拖拽上传文件到送审文件夹</span>
      </div>
    </div>`;
}

function rvDetailQSheetHtml(order) {
  const qFiles = RV_Q_FILES[order.id] || [];
  return `
    <div style="padding:16px;">
      <div style="font-size:0.82rem;font-weight:600;color:#1F2937;margin-bottom:12px;">Q 单文件</div>
      ${qFiles.length ? `
      <div class="rv-detail-file-table-wrap">
        <table class="rv-detail-file-table">
          <thead><tr><th>文件名</th><th>大小</th><th>修改人</th><th>修改时间</th><th>当前版本</th><th style="text-align:center;">操作</th></tr></thead>
          <tbody>${qFiles.map(f => `
            <tr>
              <td><div class="pd-fname-cell"><span class="pd-file-ext ${f.ext||''}">${(f.ext||'').toUpperCase()}</span><span title="${f.name}">${f.name}</span></div></td>
              <td style="color:#6B7280;">${f.size||'—'}</td>
              <td>${f.modBy||'—'}</td>
              <td class="rv-mono">${f.modAt||'—'}</td>
              <td><span class="vl-version-badge">${f.version||'—'}</span></td>
              <td style="text-align:center;">
                <div class="rv-ops">
                  <button class="rv-op-btn" title="下载" onclick="showNotification('下载 ${f.name}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </button>
                  <button class="rv-op-btn" title="上传新版本" onclick="showNotification('上传新版本')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </button>
                  <button class="rv-op-btn" title="重命名" onclick="showNotification('重命名')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                </div>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>` : `<div class="rv-empty" style="padding:40px 0;"><p>暂无 Q 单文件</p></div>`}

      <div class="rv-upload-zone" onclick="showNotification('上传 Q 单文件')">
        <svg viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5" width="28" height="28"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <span>点击或拖拽上传 Q 单文件（Word / Excel）</span>
      </div>
    </div>`;
}

/* ── 日常沟通 ── */

const RV_COMMENTS = {};

function rvDetailChatHtml(order) {
  const comments = RV_COMMENTS[order.id] || [];
  return `
    <div style="padding:16px;display:flex;flex-direction:column;height:100%;">
      <div style="flex:1;overflow-y:auto;margin-bottom:12px;">
        ${comments.length ? comments.map(c => `
          <div class="rv-chat-msg">
            <div class="rv-chat-avatar" style="background:${c.author===order.submitter?'#6366F1':'#10B981'};">${c.author.charAt(0)}</div>
            <div class="rv-chat-body">
              <div class="rv-chat-meta"><span class="rv-chat-author">${c.author}</span><span class="rv-chat-dept">${c.dept||''}</span><span class="rv-chat-time">${c.time}</span></div>
              <div class="rv-chat-text">${c.content}</div>
            </div>
          </div>`).join('') : `<div class="rv-empty" style="padding:40px 0;"><p>暂无沟通记录</p></div>`}
      </div>
      <div class="rv-chat-input-wrap">
        <textarea class="rv-chat-input" id="rv-chat-input" rows="2" placeholder="输入消息，回车发送..."></textarea>
        <button class="gd-op-btn gd-op-primary" onclick="rvSendComment('${order.id}')">发送</button>
      </div>
    </div>`;
}

function rvSendComment(id) {
  const inp = document.getElementById('rv-chat-input');
  const text = inp?.value.trim();
  if (!text) return;
  if (!RV_COMMENTS[id]) RV_COMMENTS[id] = [];
  const now = new Date();
  const fmt = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  RV_COMMENTS[id].push({ author: '张伟', dept: '审计一部', content: text, time: fmt });
  inp.value = '';
  rvDetailState.rightTab = 'chat';
  rvRefreshRight();
}

/* ── 送审单操作 ── */

function rvAddLog(id, action, content) {
  if (!RV_LOGS[id]) RV_LOGS[id] = [];
  RV_LOGS[id].forEach(l => l.active = false);
  const now = new Date();
  const fmt = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  RV_LOGS[id].push({ action, op: '当前用户', content, time: fmt, active: true });
}

function rvNowStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
}

function rvActionSubmit(id) {
  const o = RC_REVIEW_ORDERS.find(x => x.id === id);
  if (!o) return;
  if (!confirm('确认提交该送审单？提交后风控老师将开始审核。')) return;
  o.status = '审核中';
  o.actualReviewDate = rvNowStr();
  rvAddLog(id, '提交送审', `项目组提交送审单，状态变为"审核中"`);
  showNotification(`送审单 ${id} 已提交，状态变为"审核中"`);
  rvRefreshLeft(); rvRefreshRight();
  rvRenderMgrPanel();
  if (typeof rcRenderOrders === 'function') rcRenderOrders();
}

function rvActionQIssue(id) {
  const o = RC_REVIEW_ORDERS.find(x => x.id === id);
  if (!o) return;
  if (!confirm('确认出具 Q 单？')) return;
  o.status = 'Q单出具';
  o.qIssueTime = rvNowStr();
  rvAddLog(id, 'Q单出具', `${o.teacherName} 出具 Q 单，状态变为"Q单出具"`);
  showNotification(`送审单 ${id} Q单已出具`);
  rvRefreshLeft(); rvRefreshRight();
  rvRenderMgrPanel();
  if (typeof rcRenderOrders === 'function') rcRenderOrders();
}

function rvActionApplyClearQ(id) {
  const o = RC_REVIEW_ORDERS.find(x => x.id === id);
  if (!o) return;
  if (!confirm('确认申请清 Q？')) return;
  o.status = '待清Q';
  rvAddLog(id, '申请清Q', `项目组申请清 Q，状态变为"待清Q"`);
  showNotification(`送审单 ${id} 已申请清Q`);
  rvRefreshLeft(); rvRefreshRight();
  rvRenderMgrPanel();
  if (typeof rcRenderOrders === 'function') rcRenderOrders();
}

function rvActionRejectClearQ(id) {
  const o = RC_REVIEW_ORDERS.find(x => x.id === id);
  if (!o) return;
  const reason = prompt('请输入驳回原因：');
  if (reason === null) return;
  o.status = 'Q单出具';
  rvAddLog(id, '驳回清Q', `${o.teacherName} 驳回清 Q 申请：${reason || '无'}，状态回退为"Q单出具"`);
  showNotification(`送审单 ${id} 清Q申请已驳回`);
  rvRefreshLeft(); rvRefreshRight();
  rvRenderMgrPanel();
  if (typeof rcRenderOrders === 'function') rcRenderOrders();
}

function rvActionPassClearQ(id) {
  const o = RC_REVIEW_ORDERS.find(x => x.id === id);
  if (!o) return;
  if (!confirm('确认清 Q 通过？')) return;
  o.status = '清Q完成';
  o.qClearTime = rvNowStr();
  rvAddLog(id, '清Q通过', `${o.teacherName} 确认清 Q 通过，状态变为"清Q完成"`);
  showNotification(`送审单 ${id} 清Q完成`);
  rvRefreshLeft(); rvRefreshRight();
  rvRenderMgrPanel();
  if (typeof rcRenderOrders === 'function') rcRenderOrders();
}
