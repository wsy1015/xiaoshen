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

function rcRenderOrders() {
  const pane = document.getElementById('rc-pane-orders');
  if (!pane) return;
  pane.innerHTML = rcEmptyPane('送审单总览', '送审单管理功能即将上线，敬请期待',
    '<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 14l2 2 4-4"/>');
}

function rcRenderSchedule() {
  const pane = document.getElementById('rc-pane-schedule');
  if (!pane) return;
  pane.innerHTML = rcEmptyPane('人员排期', '风控人员排期功能即将上线，敬请期待',
    '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>');
}

function rcRenderReports() {
  const pane = document.getElementById('rc-pane-reports');
  if (!pane) return;
  pane.innerHTML = rcEmptyPane('统计报表', '风控统计报表功能即将上线，敬请期待',
    '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>');
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
    id: 'RV-20260320-001', type: '一审', workspace: '2025-比亚迪-年报审计', workspaceId: 'ws-001',
    company: '比亚迪汽车（广东）有限公司', reportType: '合并报表', firmCode: 'ZS-2025-0001',
    teacherId: 'EMP014', teacherName: '沈瑶', orgId: '', orgName: '',
    folderId: 'review-sub-1', folderName: '2025年年报一审送审',
    isAPT: '否', isSACP: '否', projectUrgency: '常规',
    planFirstReviewDate: '2026-04-01T09:00', planReviewEndDate: '2026-05-01T09:00',
    submitter: '张伟', projectContact: '李明',
    submitTime: '2026-03-20 14:30', actualReviewDate: '2026-03-22 10:00', status: '审核中',
  },
  {
    id: 'RV-20260321-002', type: '二审', workspace: '2025-比亚迪-年报审计', workspaceId: 'ws-001',
    company: '比亚迪汽车（广东）有限公司', reportType: '合并报表', firmCode: 'ZS-2025-0001',
    teacherId: 'rc-m-a4', teacherName: '范冬梅', orgId: 'rc-org-1', orgName: '风控一组',
    folderId: 'review-sub-2', folderName: '2025年年报二审送审',
    isAPT: '否', isSACP: '否', projectUrgency: '常规',
    planFirstReviewDate: '2026-04-15T09:00', planReviewEndDate: '2026-05-15T09:00',
    submitter: '张伟', projectContact: '李明',
    submitTime: '2026-03-21 09:15', actualReviewDate: '', status: '待审核',
  },
  {
    id: 'RV-20260322-003', type: '一审', workspace: '2025-比亚迪-年报审计', workspaceId: 'ws-001',
    company: '比亚迪电池（深圳）有限公司', reportType: '单体报表', firmCode: 'ZS-2025-0002',
    teacherId: 'EMP015', teacherName: '钟天宇', orgId: '', orgName: '',
    folderId: 'review-sub-3', folderName: '半年报一审送审',
    isAPT: '是', isSACP: '否', projectUrgency: '加急',
    planFirstReviewDate: '2026-04-05T09:00', planReviewEndDate: '2026-05-05T09:00',
    submitter: '王芳', projectContact: '陈刚',
    submitTime: '2026-03-22 16:40', actualReviewDate: '', status: '待审核',
  },
  {
    id: 'RV-20260323-004', type: '2.5审', workspace: '2025-比亚迪-年报审计', workspaceId: 'ws-001',
    company: '比亚迪汽车（广东）有限公司', reportType: '合并报表', firmCode: 'ZS-2025-0001',
    teacherId: 'rc-m-a3', teacherName: '周海涛', orgId: 'rc-org-1', orgName: '风控一组',
    folderId: '', folderName: '',
    isAPT: '否', isSACP: '否', projectUrgency: '常规',
    planFirstReviewDate: '2026-05-01T09:00', planReviewEndDate: '2026-06-01T09:00',
    submitter: '张伟', projectContact: '李明',
    submitTime: '2026-03-23 11:20', actualReviewDate: '', status: '待审核',
  },
  {
    id: 'RV-20260325-005', type: '一审', workspace: '2025-比亚迪-年报审计', workspaceId: 'ws-001',
    company: '比亚迪半导体股份有限公司', reportType: '合并报表', firmCode: 'ZS-2025-0003',
    teacherId: 'EMP016', teacherName: '赵雅琪', orgId: '', orgName: '',
    folderId: '', folderName: '',
    isAPT: '否', isSACP: '是', projectUrgency: '特急',
    planFirstReviewDate: '2026-04-10T09:00', planReviewEndDate: '2026-05-10T09:00',
    submitter: '陈刚', projectContact: '王芳',
    submitTime: '2026-03-25 08:50', actualReviewDate: '2026-03-26 14:00', status: '审核通过',
  },
  {
    id: 'RV-20260326-006', type: '二审', workspace: '2025-比亚迪-年报审计', workspaceId: 'ws-001',
    company: '比亚迪电池（深圳）有限公司', reportType: '单体报表', firmCode: 'ZS-2025-0002',
    teacherId: 'rc-m-b3', teacherName: '陈文博', orgId: 'rc-org-2', orgName: '风控二组',
    folderId: '', folderName: '',
    isAPT: '是', isSACP: '否', projectUrgency: '加急',
    planFirstReviewDate: '2026-04-20T09:00', planReviewEndDate: '2026-05-20T09:00',
    submitter: '王芳', projectContact: '陈刚',
    submitTime: '2026-03-26 10:30', actualReviewDate: '', status: '待审核',
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
    <div class="rc-review-modal" style="width:520px;">
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
                ${rows.map((row, i) => `
                  <tr class="${wiz.selectedCompanyIdx===i?'rc-rv-row-selected':''}" onclick="rcSelectCompanyRow(${i})">
                    <td style="text-align:center;">
                      <input type="radio" name="rc-rv-company" ${wiz.selectedCompanyIdx===i?'checked':''} onchange="rcSelectCompanyRow(${i})">
                    </td>
                    <td>${row.name||'—'}</td>
                    <td>${row.reportType||'—'}</td>
                    <td>${extraColFn ? extraColFn(row) : '—'}</td>
                  </tr>`).join('')}
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
    status: '待审核',
  };

  RC_REVIEW_ORDERS.push(order);
  rcCloseReviewModal();
  showNotification(`${wiz.type}预审单已提交，风控老师：${wiz.teacherName}，主体：${row.name}`);
  if (typeof rvRenderMgrPanel === 'function') rvRenderMgrPanel();
}

/* ═══════════════════════════════════════════════════════
   送审管理面板（项目工作区 Tab）
   ═══════════════════════════════════════════════════════ */

let rvMgrState = { tab: '一审', selectedIds: new Set(), search: '' };

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
  const pending = orders.filter(o => o.status === '待审核').length;
  const reviewing = orders.filter(o => o.status === '审核中').length;
  const passed = orders.filter(o => o.status === '审核通过').length;
  const rejected = orders.filter(o => o.status === '已驳回').length;
  return { all, first, second, half, pending, reviewing, passed, rejected };
}

const RV_STATUS_MAP = {
  '待审核': { color: '#F59E0B', bg: '#FFFBEB' },
  '审核中': { color: '#3B82F6', bg: '#EFF6FF' },
  '审核通过': { color: '#10B981', bg: '#ECFDF5' },
  '已驳回': { color: '#EF4444', bg: '#FEF2F2' },
  '已撤回': { color: '#6B7280', bg: '#F3F4F6' },
};

function rvRenderMgrPanel() {
  const container = document.getElementById('rv-mgr-container');
  if (!container) return;

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

  container.innerHTML = `
    <div class="rv-mgr-panel">
      <!-- 统计 -->
      <div class="rv-stat-grid">
        <div class="rv-stat-card"><div class="rv-stat-num">${st.all}</div><div class="rv-stat-label">送审单总数</div></div>
        <div class="rv-stat-card"><div class="rv-stat-num" style="color:#3B82F6;">${st.first}</div><div class="rv-stat-label">一审</div></div>
        <div class="rv-stat-card"><div class="rv-stat-num" style="color:#F59E0B;">${st.second}</div><div class="rv-stat-label">二审</div></div>
        <div class="rv-stat-card"><div class="rv-stat-num" style="color:#8B5CF6;">${st.half}</div><div class="rv-stat-label">2.5审</div></div>
        <div class="rv-stat-card"><div class="rv-stat-num" style="color:#F59E0B;">${st.pending}</div><div class="rv-stat-label">待审核</div></div>
        <div class="rv-stat-card"><div class="rv-stat-num" style="color:#3B82F6;">${st.reviewing}</div><div class="rv-stat-label">审核中</div></div>
        <div class="rv-stat-card"><div class="rv-stat-num" style="color:#10B981;">${st.passed}</div><div class="rv-stat-label">审核通过</div></div>
        <div class="rv-stat-card"><div class="rv-stat-num" style="color:#EF4444;">${st.rejected}</div><div class="rv-stat-label">已驳回</div></div>
      </div>

      <!-- Tab 切换 -->
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

      <!-- 列表 -->
      <div class="rv-table-wrap">
        ${rvRenderTable(tab, filtered)}
      </div>
    </div>`;
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

    return `<tr class="${sel?'rv-row-selected':''}">
      <td style="text-align:center;"><input type="checkbox" ${sel?'checked':''} onchange="rvToggleRow('${o.id}',this.checked)"></td>
      <td><span class="rv-order-id">${o.id}</span></td>
      <td title="${title}"><span class="rv-order-title">${title}</span></td>
      <td>${rel1 ? `<span class="rv-link" onclick="rvJumpToOrder('${rel1.type}')">${rel1.id}</span>` : '<span class="rv-na">—</span>'}</td>
      <td>${rel2 ? `<span class="rv-link" onclick="rvJumpToOrder('${rel2.type}')">${rel2.id}</span>` : '<span class="rv-na">—</span>'}</td>
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
      <td style="position:sticky;right:0;z-index:1;background:#fff;">
        <div class="rv-ops">
          <button class="rv-op-btn" title="查看" onclick="showNotification('查看送审单 ${o.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          ${o.status==='待审核'?`
          <button class="rv-op-btn" title="撤回" onclick="rvRecallOrder('${o.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          </button>` : ''}
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
  if (o) { o.status = '已撤回'; showNotification(`送审单 ${id} 已撤回`); }
  rvRenderMgrPanel();
}
