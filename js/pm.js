/* ══════════════════════════════════════════════════════════
   PM ── 项目成员模块
   所有与"项目成员"Tab相关的数据、渲染、交互逻辑
   ══════════════════════════════════════════════════════════ */

/* ── PM-1. 角色数据 ── */
const PM_ROLES_DATA = [
  { id: 'r01', name: '部门负责人',     desc: '拥有项目全部权限',         color: '#6366F1' },
  { id: 'r02', name: '项目负责人',     desc: '负责项目整体进展与交付',   color: '#0EA5E9' },
  { id: 'r03', name: '项目管理员',     desc: '协助管理日常事务与成员',   color: '#10B981' },
  { id: 'r04', name: '项目组正式人员', desc: '参与项目执行的正式成员',   color: '#F59E0B' },
  { id: 'r05', name: '项目组实习生',   desc: '有限权限的实习成员',       color: '#94A3B8' },
];

/* ── PM-2. 权限模块数据 ── */
const PM_PERM_MODULES = [
  {
    id: 'doc', label: '项目文档',
    groups: [
      { id: 'doc_access', label: '页面访问权限', perms: [
          { id: 'doc_access_main',  label: '项目文档访问', desc: '允许访问项目文档列表页' },
          { id: 'doc_access_draft', label: '底稿视图访问', desc: '允许进入底稿视图页面' },
          { id: 'doc_access_trash', label: '回收站访问',   desc: '允许查看文档回收站' },
      ]},
      { id: 'doc_view', label: '查看权限', perms: [
          { id: 'doc_view_preview',  label: '文件预览',     desc: '在线预览文档内容' },
          { id: 'doc_view_hist_pre', label: '历史版本预览', desc: '查看历史版本内容' },
          { id: 'doc_view_readonly', label: '文件只读',     desc: '以只读模式打开文件' },
          { id: 'doc_view_hist_ro',  label: '历史版本只读', desc: '以只读模式查看历史版本' },
      ]},
      { id: 'doc_create', label: '新建权限', perms: [
          { id: 'doc_create_new',    label: '文档创建', desc: '创建新文档' },
          { id: 'doc_create_upload', label: '文档上传', desc: '上传本地文件' },
          { id: 'doc_create_paste',  label: '文档粘贴', desc: '通过粘贴创建文档' },
      ]},
      { id: 'doc_edit', label: '编辑权限', perms: [
          { id: 'doc_edit_online',  label: '本地/在线编辑', desc: '支持本地及在线编辑' },
          { id: 'doc_edit_rename',  label: '文档重命名',    desc: '修改文档名称' },
          { id: 'doc_edit_version', label: '新版本上传',    desc: '上传文档新版本' },
          { id: 'doc_edit_restore', label: '历史版本还原',  desc: '还原至指定历史版本' },
          { id: 'doc_edit_delete',  label: '文档删除',      desc: '删除文档' },
          { id: 'doc_edit_cut',     label: '文档剪切',      desc: '剪切文档到其他目录' },
          { id: 'doc_edit_ref',     label: '引用目录',      desc: '为文档设置引用目录' },
          { id: 'doc_edit_index',   label: '编辑底稿索引',  desc: '修改底稿索引信息' },
      ]},
      { id: 'doc_share', label: '下载与分享权限', perms: [
          { id: 'doc_share_dl',       label: '文档下载',     desc: '下载当前版本文档' },
          { id: 'doc_share_hist_dl',  label: '历史版本下载', desc: '下载历史版本文档' },
          { id: 'doc_share_chat',     label: '发送到聊天',   desc: '通过聊天分享文档' },
          { id: 'doc_share_link',     label: '外链分享',     desc: '生成外部分享链接' },
          { id: 'doc_share_link_log', label: '外链分享记录', desc: '查看外链分享历史' },
          { id: 'doc_share_copy',     label: '文档复制',     desc: '复制文档到其他目录' },
      ]},
      { id: 'doc_admin', label: '文档管理权限', perms: [
          { id: 'doc_admin_unlock',  label: '文件解锁(管理员)', desc: '强制解锁被占用的文件' },
          { id: 'doc_admin_setting', label: '文档设置',          desc: '配置文档权限与属性' },
      ]},
    ]
  },
  {
    id: 'order', label: '项目工单',
    groups: [
      { id: 'order_view', label: '查看权限', perms: [
          { id: 'order_view_list',   label: '工单列表查看', desc: '查看工单列表' },
          { id: 'order_view_detail', label: '工单详情查看', desc: '查看工单详细信息' },
      ]},
      { id: 'order_edit', label: '操作权限', perms: [
          { id: 'order_edit_create', label: '工单创建', desc: '发起新工单' },
          { id: 'order_edit_update', label: '工单编辑', desc: '编辑已有工单' },
          { id: 'order_edit_close',  label: '工单关闭', desc: '关闭进行中工单' },
      ]},
      { id: 'order_admin', label: '管理权限', perms: [
          { id: 'order_admin_assign', label: '工单分配', desc: '分配工单处理人' },
          { id: 'order_admin_delete', label: '工单删除', desc: '删除工单记录' },
      ]},
    ]
  },
  {
    id: 'log', label: '项目日志',
    groups: [
      { id: 'log_view', label: '查看权限', perms: [
          { id: 'log_view_op',    label: '操作日志查看', desc: '查看成员操作记录' },
          { id: 'log_view_audit', label: '审计日志查看', desc: '查看审计追踪记录' },
      ]},
      { id: 'log_admin', label: '管理权限', perms: [
          { id: 'log_admin_export', label: '日志导出', desc: '导出日志文件' },
      ]},
    ]
  },
  {
    id: 'info', label: '项目信息',
    groups: [
      { id: 'info_view', label: '查看权限', perms: [
          { id: 'info_view_basic',    label: '项目基本信息', desc: '查看项目基本资料' },
          { id: 'info_view_progress', label: '项目进度查看', desc: '查看项目进度状态' },
      ]},
      { id: 'info_edit', label: '编辑权限', perms: [
          { id: 'info_edit_basic',  label: '项目信息编辑', desc: '修改项目基本资料' },
          { id: 'info_edit_config', label: '项目配置修改', desc: '修改项目高级配置' },
      ]},
    ]
  },
  {
    id: 'approval', label: '项目审批',
    groups: [
      { id: 'approval_view', label: '查看权限', perms: [
          { id: 'approval_view_list', label: '审批列表查看', desc: '查看审批单列表' },
          { id: 'approval_view_hist', label: '审批历史查看', desc: '查看历史审批记录' },
      ]},
      { id: 'approval_edit', label: '操作权限', perms: [
          { id: 'approval_edit_create',  label: '发起审批', desc: '创建新的审批申请' },
          { id: 'approval_edit_process', label: '处理审批', desc: '审核或拒绝审批申请' },
      ]},
    ]
  },
  {
    id: 'member', label: '成员管理',
    groups: [
      { id: 'member_view', label: '查看权限', perms: [
          { id: 'member_view_list', label: '成员列表查看', desc: '查看项目成员列表' },
          { id: 'member_view_role', label: '角色权限查看', desc: '查看角色及权限配置' },
      ]},
      { id: 'member_admin', label: '管理权限', perms: [
          { id: 'member_admin_edit',   label: '成员添加/移除', desc: '管理项目成员资格' },
          { id: 'member_admin_config', label: '角色配置修改',  desc: '修改角色权限设置' },
      ]},
    ]
  },
];

/* 根据角色 ID 构建默认权限映射 */
function pmBuildDefaultPerms(roleId) {
  const all = PM_PERM_MODULES.flatMap(m => m.groups.flatMap(g => g.perms.map(p => p.id)));
  const r04Set = new Set([
    'doc_access_main','doc_access_draft',
    'doc_view_preview','doc_view_hist_pre','doc_view_readonly',
    'doc_create_new','doc_create_upload',
    'doc_share_dl',
    'order_view_list','order_view_detail',
    'order_edit_create','order_edit_update',
    'log_view_op',
    'info_view_basic','info_view_progress',
    'approval_view_list','approval_edit_create',
    'member_view_list',
  ]);
  const r05Set = new Set([
    'doc_access_main','doc_view_preview',
    'order_view_list','log_view_op',
    'info_view_basic','approval_view_list','member_view_list',
  ]);
  const result = {};
  all.forEach(id => {
    if      (roleId === 'r01') result[id] = true;
    else if (roleId === 'r02') result[id] = !id.startsWith('member_admin');
    else if (roleId === 'r03') result[id] = !['doc_admin_unlock','doc_admin_setting',
      'order_admin_delete','member_admin_config','approval_edit_process'].includes(id);
    else if (roleId === 'r04') result[id] = r04Set.has(id);
    else if (roleId === 'r05') result[id] = r05Set.has(id);
    else result[id] = false;
  });
  return result;
}

/* ── PM-3. 成员 Mock 数据 ── */
const PM_MEMBERS_ALL = [
  { id:'pm01', wsIds:['ws-001','ws-002','ws-003','ws-004','ws-005','ws-006'],
    name:'张伟',   roleId:'r01', dept:'审计一部', position:'部门负责人',   phone:'138****0001', joinedAt:'2025-09-01', validUntil:null,         addedBy:'系统管理员', status:'joined', leftAt:null },
  { id:'pm02', wsIds:['ws-001','ws-002'],
    name:'李明',   roleId:'r02', dept:'审计一部', position:'正式员工',     phone:'139****0022', joinedAt:'2025-09-03', validUntil:null,         addedBy:'张伟',   status:'joined', leftAt:null },
  { id:'pm03', wsIds:['ws-001','ws-003'],
    name:'王芳',   roleId:'r03', dept:'审计一部', position:'正式员工',     phone:'136****0033', joinedAt:'2025-09-05', validUntil:null,         addedBy:'张伟',   status:'joined', leftAt:null },
  { id:'pm04', wsIds:['ws-001','ws-002','ws-004'],
    name:'陈小红', roleId:'r04', dept:'审计一部', position:'正式员工',     phone:'157****0044', joinedAt:'2025-09-10', validUntil:null,         addedBy:'李明',   status:'joined', leftAt:null },
  { id:'pm05', wsIds:['ws-001','ws-005'],
    name:'刘洋',   roleId:'r04', dept:'审计一部', position:'正式员工',     phone:'150****0055', joinedAt:'2025-09-12', validUntil:null,         addedBy:'李明',   status:'joined', leftAt:null },
  { id:'pm06', wsIds:['ws-001','ws-002','ws-003','ws-006'],
    name:'周梦',   roleId:'r03', dept:'质控中心', position:'部门行政秘书', phone:'178****0066', joinedAt:'2025-09-15', validUntil:null,         addedBy:'张伟',   status:'joined', leftAt:null },
  { id:'pm07', wsIds:['ws-001','ws-004'],
    name:'吴静',   roleId:'r04', dept:'审计三部', position:'正式员工',     phone:'182****0077', joinedAt:'2025-10-01', validUntil:null,         addedBy:'王芳',   status:'joined', leftAt:null },
  { id:'pm08', wsIds:['ws-001','ws-002','ws-005'],
    name:'林佳',   roleId:'r05', dept:'审计一部', position:'实习生',       phone:'159****0088', joinedAt:'2025-11-01', validUntil:'2026-06-30', addedBy:'张伟',   status:'joined', leftAt:null },
  { id:'pm09', wsIds:['ws-001','ws-003'],
    name:'黄磊',   roleId:'r05', dept:'审计二部', position:'实习生',       phone:'153****0099', joinedAt:'2025-11-15', validUntil:'2026-03-31', addedBy:'李明',   status:'joined', leftAt:null },
  { id:'pm10', wsIds:['ws-001','ws-002','ws-004','ws-006'],
    name:'陈伟',   roleId:'r04', dept:'审计三部', position:'正式员工',     phone:'131****0010', joinedAt:'2025-08-20', validUntil:null,         addedBy:'张伟',   status:'left',   leftAt:'2026-01-15' },
  { id:'pm11', wsIds:['ws-001','ws-005'],
    name:'郑杰',   roleId:'r05', dept:'审计二部', position:'实习生',       phone:'145****0011', joinedAt:'2025-10-20', validUntil:'2026-02-28', addedBy:'王芳',   status:'left',   leftAt:'2026-02-01' },
  { id:'pm12', wsIds:['ws-001','ws-003','ws-006'],
    name:'赵敏',   roleId:'r02', dept:'审计二部', position:'正式员工',     phone:'137****0012', joinedAt:'2025-08-01', validUntil:null,         addedBy:'系统管理员', status:'left', leftAt:'2025-12-31' },
];

/* ── PM-4. 运行时状态 ── */
const pmState = {
  wsId:          null,
  members:       [],
  innerTab:      'mgmt',
  memberStatus:  'joined',
  searchText:    '',
  filterRole:    '',
  filterDept:    '',
  filterAdded:   '',
  sortBy:        null,
  sortDir:       'desc',
  selectedIds:   new Set(),
  currentPage:   1,
  pageSize:      10,
  selectedRoleId: null,
  permState:     {},
  permsDirty:    false,
  roles:         [],
};

/* ── PM-5. 工具函数 ── */
function pmRoleName(roleId) {
  return (pmState.roles.find(r => r.id === roleId) || PM_ROLES_DATA.find(r => r.id === roleId) || {}).name || roleId;
}
function pmRoleColor(roleId) {
  return (pmState.roles.find(r => r.id === roleId) || PM_ROLES_DATA.find(r => r.id === roleId) || {}).color || '#94A3B8';
}
function pmAvatarBg(name) {
  const colors = ['#6366F1','#0EA5E9','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

/* ── PM-6. 主入口 ── */
function pmRenderAll() {
  const ws = typeof currentDetailWs !== 'undefined' ? currentDetailWs : null;
  if (!ws) return;

  /* 工作区切换时重新初始化 */
  if (pmState.wsId !== ws.id) {
    pmState.wsId          = ws.id;
    pmState.members       = PM_MEMBERS_ALL.filter(m => m.wsIds.includes(ws.id)).map(m => ({ ...m }));
    pmState.roles         = PM_ROLES_DATA.map(r => ({ ...r }));
    pmState.permState     = {};
    pmState.roles.forEach(r => { pmState.permState[r.id] = pmBuildDefaultPerms(r.id); });
    pmState.selectedRoleId = null;
    pmState.permsDirty     = false;
    pmState.selectedIds    = new Set();
    pmState.innerTab       = 'mgmt';
    pmState.memberStatus   = 'joined';
    pmState.searchText     = '';
    pmState.filterRole     = '';
    pmState.filterDept     = '';
    pmState.filterAdded    = '';
    pmState.sortBy         = null;
    pmState.currentPage    = 1;
  }

  pmRenderInnerNav();
  if (pmState.innerTab === 'mgmt')  pmRenderMgmt();
  else if (pmState.innerTab === 'roles') pmRenderRoles();
}

/* ── PM-7. 内部导航 Tab ── */
function pmRenderInnerNav() {
  document.querySelectorAll('.pm-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.pmtab === pmState.innerTab);
    btn.onclick = () => {
      pmState.innerTab = btn.dataset.pmtab;
      document.querySelectorAll('.pm-pane').forEach(p =>
        p.classList.toggle('active', p.id === `pm-pane-${pmState.innerTab}`)
      );
      pmRenderInnerNav();
      if (pmState.innerTab === 'roles') pmRenderRoles();
      else pmRenderMgmt();
    };
  });
  document.querySelectorAll('.pm-pane').forEach(p =>
    p.classList.toggle('active', p.id === `pm-pane-${pmState.innerTab}`)
  );
}

/* ── PM-8. 成员管理 ── */
function pmRenderMgmt() {
  pmUpdateCountBadges();
  pmRenderTable();
  pmRenderPager();

  /* 状态标签 */
  document.querySelectorAll('.pm-status').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.pms === pmState.memberStatus);
    btn.onclick = () => {
      pmState.memberStatus = btn.dataset.pms;
      pmState.currentPage  = 1;
      pmState.selectedIds  = new Set();
      document.querySelectorAll('.pm-status').forEach(b =>
        b.classList.toggle('active', b.dataset.pms === pmState.memberStatus)
      );
      pmRenderTable();
      pmRenderPager();
    };
  });

  /* 搜索 */
  const searchEl = document.getElementById('pm-search');
  if (searchEl) {
    searchEl.value = pmState.searchText;
    searchEl.oninput = () => {
      pmState.searchText  = searchEl.value.trim();
      pmState.currentPage = 1;
      pmRenderTable();
      pmRenderPager();
    };
  }

  /* 添加成员 */
  const addBtn = document.getElementById('pm-add-btn');
  if (addBtn) addBtn.onclick = () => pmOpenModal('add');

  /* 批量编辑 */
  const batchBtn = document.getElementById('pm-batch-btn');
  if (batchBtn) batchBtn.onclick = () => {
    if (pmState.selectedIds.size > 0) pmOpenModal('batch');
  };

  /* 导出 */
  const exportBtn = document.getElementById('pm-export-btn');
  if (exportBtn) exportBtn.onclick = () => showNotification('正在生成 Excel 文件，请稍候…');
}

function pmUpdateCountBadges() {
  const jEl = document.getElementById('pm-cnt-joined');
  const lEl = document.getElementById('pm-cnt-left');
  if (jEl) jEl.textContent = pmState.members.filter(m => m.status === 'joined').length;
  if (lEl) lEl.textContent = pmState.members.filter(m => m.status === 'left').length;
}

/* 过滤 + 排序 */
function pmFilteredList() {
  let list = pmState.members.filter(m => m.status === pmState.memberStatus);
  if (pmState.searchText)  list = list.filter(m => m.name.includes(pmState.searchText));
  if (pmState.filterRole)  list = list.filter(m => m.roleId === pmState.filterRole);
  if (pmState.filterDept)  list = list.filter(m => m.dept === pmState.filterDept);
  if (pmState.filterAdded) list = list.filter(m => m.addedBy === pmState.filterAdded);
  if (pmState.sortBy) {
    list = [...list].sort((a, b) => {
      const av = a[pmState.sortBy] || '', bv = b[pmState.sortBy] || '';
      return pmState.sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }
  return list;
}

/* 渲染表格 */
function pmRenderTable() {
  const isJoined = pmState.memberStatus === 'joined';
  const list   = pmFilteredList();
  const start  = (pmState.currentPage - 1) * pmState.pageSize;
  const page   = list.slice(start, start + pmState.pageSize);
  const thead  = document.getElementById('pm-thead');
  const tbody  = document.getElementById('pm-tbody');
  const empty  = document.getElementById('pm-table-empty');
  if (!thead || !tbody) return;

  /* 筛选选项 */
  const roles    = [...new Set(pmState.members.map(m => m.roleId))];
  const depts    = [...new Set(pmState.members.map(m => m.dept))];
  const addedBys = [...new Set(pmState.members.map(m => m.addedBy))];

  function filterSelect(id, val, opts, label, cb) {
    const opts_html = opts.map(o => `<option value="${o.v}" ${o.v === val ? 'selected' : ''}>${o.l}</option>`).join('');
    return `<div class="pm-th-filter-wrap">
      <span class="pm-th-label">${label}</span>
      <select class="pm-col-filter" id="${id}" onchange="${cb}(this.value)">
        <option value="">全部</option>${opts_html}
      </select>
    </div>`;
  }
  function sortTh(field, label) {
    const active = pmState.sortBy === field;
    const cls    = active ? (pmState.sortDir === 'asc' ? 'pm-sort-asc' : 'pm-sort-desc') : '';
    return `<span class="pm-th-sort ${active?'pm-sort-active':''} ${cls}" data-sort="${field}">${label}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="10" height="10"><polyline points="18 15 12 9 6 15"/></svg></span>`;
  }

  /* 是否全选 */
  const allChecked = page.length > 0 && page.every(m => pmState.selectedIds.has(m.id));

  thead.innerHTML = `<tr>
    <th class="pm-th pm-th-cb"><input type="checkbox" id="pm-check-all" ${allChecked ? 'checked' : ''}></th>
    <th class="pm-th">姓名</th>
    <th class="pm-th">${filterSelect('pm-f-role', pmState.filterRole, roles.map(r=>({v:r,l:pmRoleName(r)})), '角色', 'pmOnFilterRole')}</th>
    <th class="pm-th">${filterSelect('pm-f-dept', pmState.filterDept, depts.map(d=>({v:d,l:d})), '部门', 'pmOnFilterDept')}</th>
    <th class="pm-th">职位</th>
    <th class="pm-th">手机号码</th>
    <th class="pm-th">${sortTh('joinedAt','加入时间')}</th>
    <th class="pm-th">${isJoined ? sortTh('validUntil','有效期') : sortTh('leftAt','离开时间')}</th>
    <th class="pm-th">${filterSelect('pm-f-added', pmState.filterAdded, addedBys.map(a=>({v:a,l:a})), '添加人', 'pmOnFilterAdded')}</th>
    <th class="pm-th pm-th-op">操作</th>
  </tr>`;

  /* 排序点击 */
  thead.querySelectorAll('.pm-th-sort').forEach(el => {
    el.onclick = () => {
      const f = el.dataset.sort;
      if (pmState.sortBy === f) pmState.sortDir = pmState.sortDir === 'asc' ? 'desc' : 'asc';
      else { pmState.sortBy = f; pmState.sortDir = 'desc'; }
      pmRenderTable();
    };
  });

  /* 全选 */
  const checkAll = document.getElementById('pm-check-all');
  if (checkAll) {
    checkAll.onchange = e => {
      page.forEach(m => e.target.checked ? pmState.selectedIds.add(m.id) : pmState.selectedIds.delete(m.id));
      pmRenderTable();
      const bb = document.getElementById('pm-batch-btn');
      if (bb) bb.disabled = pmState.selectedIds.size === 0;
    };
  }

  /* 表体 */
  if (page.length === 0) {
    tbody.innerHTML = '';
    if (empty) empty.style.display = 'flex';
  } else {
    if (empty) empty.style.display = 'none';
    tbody.innerHTML = page.map(m => {
      const checked    = pmState.selectedIds.has(m.id) ? 'checked' : '';
      const roleName   = pmRoleName(m.roleId);
      const roleColor  = pmRoleColor(m.roleId);
      const avatar     = `<div class="pm-avatar" style="background:${pmAvatarBg(m.name)}">${m.name.charAt(0)}</div>`;
      const timeVal    = isJoined
        ? (m.position === '实习生' && m.validUntil ? m.validUntil : '—')
        : (m.leftAt || '—');
      const timeWarn   = isJoined && m.position === '实习生' && m.validUntil && m.validUntil < '2026-04-15' ? 'pm-date-warn' : '';
      const ops = isJoined
        ? `<button class="pm-op-btn" onclick="pmOpenModal('edit','${m.id}')">编辑</button>
           <button class="pm-op-btn pm-op-danger" onclick="pmOpenModal('remove','${m.id}')">移除</button>
           ${m.position === '实习生' ? `<button class="pm-op-btn pm-op-renew" onclick="pmOpenModal('renew','${m.id}')">续期</button>` : ''}`
        : `<button class="pm-op-btn pm-op-readd" onclick="pmReaddMember('${m.id}')">重新拉入</button>`;
      return `<tr class="pm-row ${checked ? 'pm-row-selected' : ''}">
        <td class="pm-td pm-td-cb"><input type="checkbox" class="pm-row-cb" data-mid="${m.id}" ${checked}></td>
        <td class="pm-td"><div class="pm-member-cell">${avatar}<span class="pm-member-name">${m.name}</span></div></td>
        <td class="pm-td"><span class="pm-role-tag" style="background:${roleColor}18;color:${roleColor};border-color:${roleColor}40">${roleName}</span></td>
        <td class="pm-td pm-col-dept">${m.dept}</td>
        <td class="pm-td pm-col-pos">${m.position}</td>
        <td class="pm-td pm-col-phone">${m.phone}</td>
        <td class="pm-td pm-col-date">${m.joinedAt}</td>
        <td class="pm-td pm-col-date ${timeWarn}">${timeVal}</td>
        <td class="pm-td pm-col-added">${m.addedBy}</td>
        <td class="pm-td pm-ops">${ops}</td>
      </tr>`;
    }).join('');

    /* 行勾选事件 */
    tbody.querySelectorAll('.pm-row-cb').forEach(cb => {
      cb.onchange = e => {
        const mid = cb.dataset.mid;
        e.target.checked ? pmState.selectedIds.add(mid) : pmState.selectedIds.delete(mid);
        pmRenderTable();
        const bb = document.getElementById('pm-batch-btn');
        if (bb) bb.disabled = pmState.selectedIds.size === 0;
      };
    });
  }
}

/* 筛选回调（供 HTML 内联调用） */
function pmOnFilterRole(v)  { pmState.filterRole  = v; pmState.currentPage = 1; pmRenderTable(); pmRenderPager(); }
function pmOnFilterDept(v)  { pmState.filterDept  = v; pmState.currentPage = 1; pmRenderTable(); pmRenderPager(); }
function pmOnFilterAdded(v) { pmState.filterAdded = v; pmState.currentPage = 1; pmRenderTable(); pmRenderPager(); }

/* ── PM-8d. 分页 ── */
function pmRenderPager() {
  const total = pmFilteredList().length;
  const pages = Math.max(1, Math.ceil(total / pmState.pageSize));
  const pager = document.getElementById('pm-pager');
  if (!pager) return;

  const btn = (n, label, disabled, active) =>
    `<button class="pm-pg-btn${active ? ' pm-pg-active' : ''}" ${disabled ? 'disabled' : ''} onclick="pmGoPage(${n})">${label}</button>`;

  let html = `<span class="pm-pg-info">共 ${total} 条</span>`;
  html += btn(pmState.currentPage - 1, '‹', pmState.currentPage <= 1, false);
  for (let i = 1; i <= pages; i++) {
    if (pages > 7 && Math.abs(i - pmState.currentPage) > 2 && i !== 1 && i !== pages) {
      if (i === pmState.currentPage - 3 || i === pmState.currentPage + 3)
        html += `<span class="pm-pg-ellipsis">…</span>`;
      continue;
    }
    html += btn(i, i, false, i === pmState.currentPage);
  }
  html += btn(pmState.currentPage + 1, '›', pmState.currentPage >= pages, false);
  html += `<span class="pm-pg-jump">跳转 <input class="pm-pg-input" type="number" min="1" max="${pages}" value="${pmState.currentPage}" onchange="pmGoPage(+this.value)"> 页</span>`;
  pager.innerHTML = html;
}

function pmGoPage(n) {
  const pages = Math.max(1, Math.ceil(pmFilteredList().length / pmState.pageSize));
  pmState.currentPage = Math.max(1, Math.min(Math.floor(n), pages));
  pmRenderTable();
  pmRenderPager();
}

/* ── PM-9. 重新拉入 ── */
function pmReaddMember(mid) {
  const m = pmState.members.find(x => x.id === mid);
  if (!m) return;
  m.status   = 'joined';
  m.leftAt   = null;
  m.joinedAt = new Date().toISOString().slice(0, 10);
  pmUpdateCountBadges();
  pmRenderTable();
  pmRenderPager();
  showNotification(`${m.name} 已重新加入项目`);
}

/* ── PM-10. 角色权限 ── */
function pmRenderRoles() {
  pmRenderRoleList();
  if (pmState.selectedRoleId) pmRenderPermBody(pmState.selectedRoleId);

  const addRoleBtn = document.getElementById('pm-add-role-btn');
  if (addRoleBtn) addRoleBtn.onclick = () => pmOpenModal('add-role');

  const saveBtn = document.getElementById('pm-save-perms');
  if (saveBtn) saveBtn.onclick = () => {
    pmState.permsDirty  = false;
    saveBtn.disabled    = true;
    showNotification('权限保存成功');
  };
}

function pmRenderRoleList() {
  const listEl = document.getElementById('pm-role-list');
  if (!listEl) return;
  listEl.innerHTML = pmState.roles.map(r => {
    const cnt = pmState.members.filter(m => m.roleId === r.id && m.status === 'joined').length;
    return `<div class="pm-role-item${r.id === pmState.selectedRoleId ? ' active' : ''}" data-rid="${r.id}">
      <div class="pm-role-dot" style="background:${r.color || '#94A3B8'}"></div>
      <div class="pm-role-info">
        <div class="pm-role-name">${r.name}</div>
        <div class="pm-role-desc">${r.desc || ''}</div>
      </div>
      <div class="pm-role-cnt">${cnt}人</div>
    </div>`;
  }).join('');
  listEl.querySelectorAll('.pm-role-item').forEach(el => {
    el.onclick = () => {
      pmState.selectedRoleId = el.dataset.rid;
      pmRenderRoleList();
      pmRenderPermBody(pmState.selectedRoleId);
    };
  });
}

function pmRenderPermBody(roleId) {
  const body  = document.getElementById('pm-perm-body');
  const title = document.getElementById('pm-role-title');
  if (!body) return;
  const role  = pmState.roles.find(r => r.id === roleId);
  if (title)  title.textContent = role ? role.name : '';
  const perms = pmState.permState[roleId] || {};

  body.innerHTML = PM_PERM_MODULES.map(mod => {
    const allPerms   = mod.groups.flatMap(g => g.perms);
    const enabledCnt = allPerms.filter(p => perms[p.id]).length;

    const groupsHtml = mod.groups.map(grp => {
      const allChk  = grp.perms.every(p => perms[p.id]);
      const someChk = grp.perms.some(p => perms[p.id]);
      const items   = grp.perms.map(p => `
        <label class="pm-perm-item">
          <input type="checkbox" class="pm-perm-cb" data-rid="${roleId}" data-pid="${p.id}" ${perms[p.id] ? 'checked' : ''}>
          <div class="pm-perm-label-wrap">
            <span class="pm-perm-label">${p.label}</span>
            <span class="pm-perm-desc">${p.desc}</span>
          </div>
        </label>`).join('');
      return `<div class="pm-perm-group">
        <div class="pm-perm-grp-hd">
          <label class="pm-perm-grp-all">
            <input type="checkbox" class="pm-perm-grp-cb" data-rid="${roleId}" data-grp="${grp.id}"
              ${allChk ? 'checked' : ''}> <span class="pm-perm-grp-label">${grp.label}</span>
          </label>
        </div>
        <div class="pm-perm-items">${items}</div>
      </div>`;
    }).join('');

    return `<div class="pm-perm-module">
      <div class="pm-perm-mod-hd" data-modid="${mod.id}">
        <div class="pm-perm-mod-title">
          <svg class="pm-perm-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="12" height="12"><polyline points="9 18 15 12 9 6"/></svg>
          ${mod.label}
        </div>
        <span class="pm-perm-cnt-badge">${enabledCnt}/${allPerms.length}</span>
      </div>
      <div class="pm-perm-mod-body" id="pm-mod-${mod.id}">${groupsHtml}</div>
    </div>`;
  }).join('');

  /* 折叠展开 */
  body.querySelectorAll('.pm-perm-mod-hd').forEach(hd => {
    hd.onclick = () => {
      const mb = document.getElementById(`pm-mod-${hd.dataset.modid}`);
      if (mb) {
        mb.classList.toggle('collapsed');
        hd.querySelector('.pm-perm-chevron').classList.toggle('rotated');
      }
    };
  });

  /* 组全选 indeterminate */
  body.querySelectorAll('.pm-perm-grp-cb').forEach(cb => {
    const grp = PM_PERM_MODULES.flatMap(m => m.groups).find(g => g.id === cb.dataset.grp);
    if (!grp) return;
    const all  = grp.perms.every(p => perms[p.id]);
    const some = grp.perms.some(p => perms[p.id]);
    cb.indeterminate = !all && some;
    cb.onchange = e => {
      grp.perms.forEach(p => { pmState.permState[roleId][p.id] = e.target.checked; });
      pmState.permsDirty = true;
      const sb = document.getElementById('pm-save-perms');
      if (sb) sb.disabled = false;
      pmRenderPermBody(roleId);
      pmRenderRoleList();
    };
  });

  /* 单项勾选 */
  body.querySelectorAll('.pm-perm-cb').forEach(cb => {
    cb.onchange = e => {
      pmState.permState[roleId][cb.dataset.pid] = e.target.checked;
      pmState.permsDirty = true;
      const sb = document.getElementById('pm-save-perms');
      if (sb) sb.disabled = false;
      pmRenderPermBody(roleId);
      pmRenderRoleList();
    };
  });
}

/* ── PM-11. 弹窗 ── */
function pmOpenModal(type, mid) {
  /* 关闭所有 PM 弹窗 */
  ['add','edit','remove','renew','batch','add-role'].forEach(t => {
    const el = document.getElementById(`pm-modal-${t}`);
    if (el) el.classList.remove('open');
  });

  if (type === 'add') {
    const sel = document.getElementById('pm-add-role');
    if (sel) sel.innerHTML = pmState.roles.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
    const posEl = document.getElementById('pm-add-pos');
    if (posEl) posEl.onchange = function() {
      const row = document.getElementById('pm-add-validity-row');
      if (row) row.style.display = this.value === '实习生' ? '' : 'none';
    };
    const confirmBtn = document.getElementById('pm-add-confirm');
    if (confirmBtn) confirmBtn.onclick = () => {
      const name  = (document.getElementById('pm-add-name')?.value || '').trim();
      const rId   = document.getElementById('pm-add-role')?.value || '';
      const dept  = document.getElementById('pm-add-dept')?.value || '';
      const pos   = document.getElementById('pm-add-pos')?.value || '';
      const phone = (document.getElementById('pm-add-phone')?.value || '').trim();
      const valid = document.getElementById('pm-add-validity')?.value || '';
      if (!name || !rId || !pos) { showNotification('请填写必填项'); return; }
      const newM = {
        id: `pm${Date.now()}`, wsIds: [pmState.wsId],
        name, roleId: rId, dept, position: pos, phone: phone || '—',
        joinedAt: new Date().toISOString().slice(0, 10),
        validUntil: pos === '实习生' ? valid : null,
        addedBy: '我', status: 'joined', leftAt: null,
      };
      PM_MEMBERS_ALL.push(newM);
      pmState.members.push(newM);
      /* 重置表单 */
      ['pm-add-name','pm-add-phone','pm-add-validity'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
      });
      pmCloseModal('add');
      pmUpdateCountBadges();
      pmRenderTable();
      pmRenderPager();
      showNotification(`成员「${name}」已添加`);
    };
  }

  if (type === 'edit' && mid) {
    const m = pmState.members.find(x => x.id === mid);
    if (!m) return;
    const idEl = document.getElementById('pm-edit-id');
    if (idEl) idEl.value = mid;
    const subEl = document.getElementById('pm-edit-subtitle');
    if (subEl) subEl.textContent = `编辑 ${m.name} 的信息`;
    const rSel = document.getElementById('pm-edit-role');
    if (rSel) rSel.innerHTML = pmState.roles.map(r => `<option value="${r.id}" ${r.id===m.roleId?'selected':''}>${r.name}</option>`).join('');
    const dSel = document.getElementById('pm-edit-dept');
    if (dSel) Array.from(dSel.options).forEach(o => { o.selected = o.value === m.dept; });
    const pSel = document.getElementById('pm-edit-pos');
    if (pSel) {
      Array.from(pSel.options).forEach(o => { o.selected = o.value === m.position; });
      const vRow = document.getElementById('pm-edit-validity-row');
      if (vRow) vRow.style.display = m.position === '实习生' ? '' : 'none';
      pSel.onchange = function() {
        const vr = document.getElementById('pm-edit-validity-row');
        if (vr) vr.style.display = this.value === '实习生' ? '' : 'none';
      };
    }
    const vEl = document.getElementById('pm-edit-validity');
    if (vEl) vEl.value = m.validUntil || '';
    const confirmBtn = document.getElementById('pm-edit-confirm');
    if (confirmBtn) confirmBtn.onclick = () => {
      m.roleId    = document.getElementById('pm-edit-role')?.value || m.roleId;
      m.dept      = document.getElementById('pm-edit-dept')?.value || m.dept;
      m.position  = document.getElementById('pm-edit-pos')?.value  || m.position;
      m.validUntil = m.position === '实习生' ? (document.getElementById('pm-edit-validity')?.value || null) : null;
      pmCloseModal('edit');
      pmRenderTable();
      showNotification(`${m.name} 的信息已更新`);
    };
  }

  if (type === 'remove' && mid) {
    const m = pmState.members.find(x => x.id === mid);
    if (!m) return;
    const idEl   = document.getElementById('pm-remove-id');
    const nameEl = document.getElementById('pm-remove-name');
    if (idEl)   idEl.value          = mid;
    if (nameEl) nameEl.textContent   = m.name;
    const confirmBtn = document.getElementById('pm-remove-confirm');
    if (confirmBtn) confirmBtn.onclick = () => {
      m.status = 'left';
      m.leftAt = new Date().toISOString().slice(0, 10);
      pmState.selectedIds.delete(mid);
      pmCloseModal('remove');
      pmUpdateCountBadges();
      pmRenderTable();
      pmRenderPager();
      showNotification(`${m.name} 已移出项目`);
    };
  }

  if (type === 'renew' && mid) {
    const m = pmState.members.find(x => x.id === mid);
    if (!m) return;
    const idEl  = document.getElementById('pm-renew-id');
    const subEl = document.getElementById('pm-renew-subtitle');
    const dEl   = document.getElementById('pm-renew-date');
    if (idEl)  idEl.value            = mid;
    if (subEl) subEl.textContent     = `延长 ${m.name} 的有效期`;
    if (dEl)   dEl.value             = m.validUntil || '';
    const confirmBtn = document.getElementById('pm-renew-confirm');
    if (confirmBtn) confirmBtn.onclick = () => {
      m.validUntil = document.getElementById('pm-renew-date')?.value || m.validUntil;
      pmCloseModal('renew');
      pmRenderTable();
      showNotification(`${m.name} 有效期已更新至 ${m.validUntil}`);
    };
  }

  if (type === 'batch') {
    const cnt   = pmState.selectedIds.size;
    const subEl = document.getElementById('pm-batch-subtitle');
    if (subEl) subEl.textContent = `共选中 ${cnt} 名成员`;
    const sel = document.getElementById('pm-batch-role');
    if (sel) sel.innerHTML = pmState.roles.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
    const confirmBtn = document.getElementById('pm-batch-confirm');
    if (confirmBtn) confirmBtn.onclick = () => {
      const newRoleId = document.getElementById('pm-batch-role')?.value;
      if (!newRoleId) return;
      pmState.members.filter(m => pmState.selectedIds.has(m.id)).forEach(m => { m.roleId = newRoleId; });
      pmState.selectedIds.clear();
      pmCloseModal('batch');
      pmRenderTable();
      showNotification(`已批量更新 ${cnt} 名成员的角色`);
    };
  }

  if (type === 'add-role') {
    const nEl = document.getElementById('pm-new-role-name');
    const dEl = document.getElementById('pm-new-role-desc');
    if (nEl) nEl.value = '';
    if (dEl) dEl.value = '';
    const confirmBtn = document.getElementById('pm-add-role-confirm');
    if (confirmBtn) confirmBtn.onclick = () => {
      const name = (document.getElementById('pm-new-role-name')?.value || '').trim();
      const desc = (document.getElementById('pm-new-role-desc')?.value || '').trim();
      if (!name) { showNotification('请输入角色名称'); return; }
      const newRole = { id: `r_${Date.now()}`, name, desc, color: '#8B5CF6' };
      pmState.roles.push(newRole);
      pmState.permState[newRole.id] = {};
      PM_PERM_MODULES.flatMap(m => m.groups.flatMap(g => g.perms)).forEach(p => {
        pmState.permState[newRole.id][p.id] = false;
      });
      pmCloseModal('add-role');
      pmState.selectedRoleId = newRole.id;
      pmRenderRoles();
      showNotification(`角色「${name}」已创建`);
    };
  }

  const modal = document.getElementById(`pm-modal-${type}`);
  if (modal) modal.classList.add('open');
}

function pmCloseModal(type) {
  const modal = document.getElementById(`pm-modal-${type}`);
  if (modal) modal.classList.remove('open');
}

/* ── PM-12. 弹窗关闭监听（全局，仅初始化一次） ── */
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-pmclose]');
  if (btn) { pmCloseModal(btn.dataset.pmclose); return; }
  /* 点击遮罩关闭 */
  if (e.target.classList.contains('modal-backdrop') && e.target.id.startsWith('pm-modal-')) {
    pmCloseModal(e.target.id.replace('pm-modal-', ''));
  }
});
