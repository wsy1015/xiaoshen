/* ══════════════════════════════════════════════════════════
   系统管理模块 · sm.js  v1.2
   ══════════════════════════════════════════════════════════ */

/* ─── 当前活跃 Tab ─── */
let smActiveTab = 'org';

/* ─── Mock：组织架构 ─── */
const SM_ORG_TREE = [
  { id: 'dept-1', name: '审计一部', parentName: '央企事务所', memberCount: 32, lastSync: '2026-03-10 14:30' },
  { id: 'dept-2', name: '审计二部', parentName: '央企事务所', memberCount: 28, lastSync: '2026-03-10 14:30' },
  { id: 'dept-3', name: '审计三部', parentName: '央企事务所', memberCount: 25, lastSync: '2026-03-10 14:30' },
  { id: 'dept-4', name: '交付中心', parentName: '央企事务所', memberCount: 18, lastSync: '2026-03-10 14:30' },
  { id: 'dept-5', name: '质量控制部', parentName: '央企事务所', memberCount: 8,  lastSync: '2026-03-10 14:30' },
  { id: 'dept-6', name: '综合管理部', parentName: '央企事务所', memberCount: 12, lastSync: '2026-03-10 14:30' },
  { id: 'dept-7', name: '风险管理部', parentName: '央企事务所', memberCount: 10, lastSync: '2026-03-10 14:30' },
];

/* ─── Mock：组织人员 ─── */
const SM_MEMBERS = [
  { id: 'EMP001', name: '张伟',   gender: '男', firm: '央企事务所', dept: '审计一部', phone: '138****1234', role: '部门负责人',   joinedAt: '2020-03-15', validUntil: '',           status: 'active' },
  { id: 'EMP002', name: '李娜',   gender: '女', firm: '央企事务所', dept: '审计一部', phone: '139****5678', role: '正式员工',     joinedAt: '2021-06-01', validUntil: '',           status: 'active' },
  { id: 'EMP003', name: '王强',   gender: '男', firm: '央企事务所', dept: '审计二部', phone: '137****9012', role: '正式员工',     joinedAt: '2022-01-10', validUntil: '',           status: 'active' },
  { id: 'EMP004', name: '赵丽',   gender: '女', firm: '央企事务所', dept: '交付中心', phone: '136****3456', role: '部门行政秘书', joinedAt: '2021-09-01', validUntil: '',           status: 'active' },
  { id: 'EMP005', name: '刘洋',   gender: '男', firm: '央企事务所', dept: '审计三部', phone: '135****7890', role: '系统管理员',   joinedAt: '2019-07-20', validUntil: '',           status: 'active' },
  { id: 'EMP006', name: '陈静',   gender: '女', firm: '央企事务所', dept: '交付中心', phone: '134****2345', role: '正式员工',     joinedAt: '2023-03-01', validUntil: '',           status: 'active' },
  { id: 'EMP007', name: '杨明',   gender: '男', firm: '央企事务所', dept: '审计一部', phone: '133****6789', role: '实习生',       joinedAt: '2025-09-01', validUntil: '2026-06-30', status: 'active' },
  { id: 'EMP008', name: '周芳',   gender: '女', firm: '央企事务所', dept: '审计二部', phone: '132****0123', role: '实习生',       joinedAt: '2025-10-15', validUntil: '2026-04-30', status: 'active' },
  { id: 'EMP009', name: '吴刚',   gender: '男', firm: '央企事务所', dept: '交付中心', phone: '131****4567', role: '部门负责人',   joinedAt: '2018-05-10', validUntil: '',           status: 'active' },
  { id: 'EMP010', name: '郑云',   gender: '女', firm: '央企事务所', dept: '质量控制部',phone: '130****8901', role: '正式员工',     joinedAt: '2022-08-01', validUntil: '',           status: 'active' },
  { id: 'EMP013', name: '徐鹏',   gender: '男', firm: '央企事务所', dept: '风险管理部', phone: '158****6601', role: '部门负责人',   joinedAt: '2019-04-01', validUntil: '',           status: 'active' },
  { id: 'EMP014', name: '沈瑶',   gender: '女', firm: '央企事务所', dept: '风险管理部', phone: '159****6602', role: '正式员工',     joinedAt: '2020-07-15', validUntil: '',           status: 'active' },
  { id: 'EMP015', name: '韩磊',   gender: '男', firm: '央企事务所', dept: '风险管理部', phone: '157****6603', role: '正式员工',     joinedAt: '2021-03-10', validUntil: '',           status: 'active' },
  { id: 'EMP016', name: '曹颖',   gender: '女', firm: '央企事务所', dept: '风险管理部', phone: '156****6604', role: '正式员工',     joinedAt: '2021-09-01', validUntil: '',           status: 'active' },
  { id: 'EMP017', name: '方毅',   gender: '男', firm: '央企事务所', dept: '风险管理部', phone: '155****6605', role: '正式员工',     joinedAt: '2022-02-20', validUntil: '',           status: 'active' },
  { id: 'EMP018', name: '邓丽华', gender: '女', firm: '央企事务所', dept: '风险管理部', phone: '153****6606', role: '正式员工',     joinedAt: '2022-08-01', validUntil: '',           status: 'active' },
  { id: 'EMP019', name: '钟伟',   gender: '男', firm: '央企事务所', dept: '风险管理部', phone: '152****6607', role: '正式员工',     joinedAt: '2023-01-15', validUntil: '',           status: 'active' },
  { id: 'EMP020', name: '唐敏',   gender: '女', firm: '央企事务所', dept: '风险管理部', phone: '151****6608', role: '部门行政秘书', joinedAt: '2023-06-01', validUntil: '',           status: 'active' },
  { id: 'EMP021', name: '任刚',   gender: '男', firm: '央企事务所', dept: '风险管理部', phone: '150****6609', role: '正式员工',     joinedAt: '2024-01-10', validUntil: '',           status: 'active' },
  { id: 'EMP022', name: '林雪',   gender: '女', firm: '央企事务所', dept: '风险管理部', phone: '189****6610', role: '实习生',       joinedAt: '2025-09-01', validUntil: '2026-06-30', status: 'active' },
  { id: 'EMP011', name: '何磊',   gender: '男', firm: '央企事务所', dept: '审计三部', phone: '139****1122', role: '正式员工',     joinedAt: '2023-02-20', validUntil: '',           status: 'left', leftAt: '2025-12-31' },
  { id: 'EMP012', name: '孙婷',   gender: '女', firm: '央企事务所', dept: '综合管理部',phone: '138****3344', role: '实习生',       joinedAt: '2025-07-01', validUntil: '2025-12-31', status: 'left', leftAt: '2025-12-31' },
];

/* ─── Mock：角色列表 ─── */
const SM_ROLES = [
  { id: 'r1', name: '系统管理员',   builtin: true,  desc: '拥有全部系统权限' },
  { id: 'r2', name: '部门负责人',   builtin: true,  desc: '管理部门成员与项目' },
  { id: 'r3', name: '正式员工',     builtin: true,  desc: '标准业务操作权限' },
  { id: 'r4', name: '部门行政秘书', builtin: true,  desc: '部门行政与协调事务' },
  { id: 'r5', name: '实习生',       builtin: true,  desc: '有限期限的基础权限' },
];

const SM_PERM_MODULES = [
  { id: 'pm-proj', label: '项目工作区', perms: [
    { id: 'p1', label: '创建工作区' }, { id: 'p2', label: '编辑工作区信息' },
    { id: 'p3', label: '删除工作区' }, { id: 'p4', label: '查看工作区列表' },
  ]},
  { id: 'pm-doc', label: '项目文档', perms: [
    { id: 'p5', label: '文件上传' }, { id: 'p6', label: '文件下载' },
    { id: 'p7', label: '文件删除' }, { id: 'p8', label: '文件预览' },
    { id: 'p9', label: '在线编辑' }, { id: 'p10', label: '历史版本管理' },
  ]},
  { id: 'pm-wo', label: '工单管理', perms: [
    { id: 'p11', label: '发起工单' }, { id: 'p12', label: '接单' },
    { id: 'p13', label: '派单调度' }, { id: 'p14', label: '验收/驳回' },
    { id: 'p15', label: '查看全部工单' }, { id: 'p16', label: '工单模板配置' },
  ]},
  { id: 'pm-cust', label: '客户管理', perms: [
    { id: 'p17', label: '新增客户' }, { id: 'p18', label: '编辑客户' },
    { id: 'p19', label: '删除客户' }, { id: 'p20', label: '查看客户列表' },
  ]},
  { id: 'pm-sys', label: '系统管理', perms: [
    { id: 'p21', label: '组织架构管理' }, { id: 'p22', label: '人员管理' },
    { id: 'p23', label: '角色权限配置' }, { id: 'p24', label: '模板管理' },
    { id: 'p25', label: '存储空间管理' }, { id: 'p26', label: '安全与合规' },
  ]},
];

/* ─── Mock：模板（审计业务-文件管理视图） ─── */
const SM_AUDIT_TEMPLATES = [
  { id: 't1', name: '风控评估模板.xlsx',     size: '2.4 MB', updater: '刘洋', updatedAt: '2026-02-15', ver: 'V3' },
  { id: 't2', name: '抽样方案模板.xlsx',     size: '1.1 MB', updater: '张伟', updatedAt: '2026-01-20', ver: 'V2' },
  { id: 't3', name: '底稿明细预填模板.xlsx', size: '5.6 MB', updater: '李娜', updatedAt: '2026-03-01', ver: 'V5' },
  { id: 't4', name: '试算搭建模板.xlsx',     size: '3.2 MB', updater: '王强', updatedAt: '2025-12-10', ver: 'V1' },
  { id: 't5', name: '试算填充模板.xlsx',     size: '4.8 MB', updater: '赵丽', updatedAt: '2026-02-28', ver: 'V4' },
  { id: 't6', name: '审计报告模板.docx',     size: '1.9 MB', updater: '刘洋', updatedAt: '2026-03-05', ver: 'V7' },
  { id: 't7', name: '函证编制模板.xlsx',     size: '0.8 MB', updater: '陈静', updatedAt: '2026-03-08', ver: 'V2' },
];

const SM_WO_TEMPLATES = [
  { id: 'wt1', name: '一类工单-标准模板',   woType: '一类工单', nodes: 3, fields: 8,  updatedAt: '2026-02-20', status: '已启用' },
  { id: 'wt2', name: '二类工单-数据清洗',   woType: '二类工单', nodes: 5, fields: 12, updatedAt: '2026-03-01', status: '已启用' },
  { id: 'wt3', name: '二类工单-函证流程',   woType: '二类工单', nodes: 6, fields: 15, updatedAt: '2026-02-15', status: '已启用' },
  { id: 'wt4', name: '三类工单-驻场协同',   woType: '三类工单', nodes: 4, fields: 10, updatedAt: '2026-01-10', status: '草稿' },
];

const SM_FOLDER_PRESETS = [
  { id: 'fp1', name: '上市央企-年报审计',
    conditions: { entType: '中央企业', listed: '是', exchange: '境内上市-上交所-主板', bizType: '年报审计' },
    folders: ['账套文件','函证文件夹','工单文件夹','送审文件夹','计划阶段文件','范围界定文件','获取证据文件','完成阶段文件','模板文件'],
    templateIds: ['t1','t3','t6','t7'] },
  { id: 'fp2', name: '非上市民企-年报审计',
    conditions: { entType: '民营企业', listed: '否', exchange: '', bizType: '年报审计' },
    folders: ['账套文件','函证文件夹','工单文件夹','送审文件夹','计划阶段文件','获取证据文件','完成阶段文件','模板文件'],
    templateIds: ['t1','t2','t5'] },
  { id: 'fp3', name: '上市央企-IPO审计',
    conditions: { entType: '中央企业', listed: '是', exchange: '境内上市-上交所-科创板', bizType: 'IPO审计' },
    folders: ['账套文件','函证文件夹','工单文件夹','送审文件夹','计划阶段文件','范围界定文件','获取证据文件','完成阶段文件','模板文件'],
    templateIds: ['t1','t2','t3','t4','t5','t6','t7'] },
];

const SM_FOLDER_BIZ_TYPES = ['年报审计','专项审计','IPO审计','内部控制审计'];
const SM_FOLDER_ENT_TYPES = ['中央企业','地方国资','民营企业','外资企业','其他'];
const SM_FOLDER_EXCHANGES = [
  '境内上市-上交所-主板','境内上市-上交所-科创板','境内上市-深交所-创业板',
  '境内上市-深交所-主板','境内上市-新三板','境内上市-北交所',
  '境外上市-H股','境外上市-红筹股','境外上市-美股','境外上市-其他',
];
const SM_ALL_FOLDERS = ['账套文件','函证文件夹','工单文件夹','送审文件夹','计划阶段文件','范围界定文件','获取证据文件','完成阶段文件','模板文件'];

const SM_STORAGE = [
  { dept: '审计一部',   quota: 1024, used: 687 },
  { dept: '审计二部',   quota: 1024, used: 542 },
  { dept: '审计三部',   quota: 1024, used: 398 },
  { dept: '交付中心',   quota: 1024, used: 823 },
  { dept: '质量控制部', quota: 512,  used: 156 },
  { dept: '综合管理部', quota: 512,  used: 234 },
];

/* ─── 人员管理状态 ─── */
let smMemberTab = 'active';
let smMemberPage = 1;
const SM_PAGE_SIZE = 15;
const smMemberChecked = new Set();

/* ═══════════════════════════════════════
   通用弹窗组件
   ═══════════════════════════════════════ */

function smEnsureModalRoot() {
  let root = document.getElementById('sm-modal-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'sm-modal-root';
    document.body.appendChild(root);
  }
  return root;
}

/**
 * 表单弹窗
 * @param {object} opts - { title, subtitle, fields[], onSubmit, submitLabel, width }
 * fields: [{ key, label, type, required, placeholder, value, options, hint }]
 *   type: 'text' | 'select' | 'date' | 'radio-cards'
 *   options: [{ value, label, desc?, tags? }]  (for select / radio-cards)
 */
function smShowFormModal(opts) {
  const root = smEnsureModalRoot();
  const id = 'smfm-' + Date.now();
  const w = opts.width || 520;

  const fieldsHtml = (opts.fields || []).map(f => {
    let input = '';
    if (f.type === 'select') {
      input = `<select id="${id}-${f.key}" class="smm-input smm-select">${(f.options||[]).map(o =>
        `<option value="${o.value || o.label}" ${(f.value||'')===(o.value||o.label)?'selected':''}>${o.label}</option>`).join('')}</select>`;
    } else if (f.type === 'date') {
      input = `<input id="${id}-${f.key}" type="date" class="smm-input" value="${f.value || ''}">`;
    } else if (f.type === 'radio-cards') {
      input = `<div class="smm-radio-cards" id="${id}-${f.key}">${(f.options||[]).map((o, i) => `
        <label class="smm-rc ${(f.value||'')===(o.value||o.label) || (!f.value && i===0) ? 'selected' : ''}">
          <input type="radio" name="${id}-${f.key}" value="${o.value||o.label}" ${(f.value||'')===(o.value||o.label)||(!f.value&&i===0)?'checked':''}>
          <div class="smm-rc-body">
            <div class="smm-rc-label">${o.label}</div>
            ${o.desc ? `<div class="smm-rc-desc">${o.desc}</div>` : ''}
          </div>
          <div class="smm-rc-check"></div>
        </label>`).join('')}</div>`;
    } else {
      input = `<input id="${id}-${f.key}" type="${f.type||'text'}" class="smm-input" placeholder="${f.placeholder||''}" value="${f.value || ''}">`;
    }
    return `
      <div class="smm-field">
        <label class="smm-label">${f.label}${f.required ? '<span class="smm-req">*</span>' : ''}</label>
        ${input}
        ${f.hint ? `<div class="smm-hint">${f.hint}</div>` : ''}
      </div>`;
  }).join('');

  root.innerHTML = `
    <div class="smm-backdrop open" id="${id}">
      <div class="smm-box" style="max-width:${w}px;">
        <div class="smm-header">
          <div>
            <h2 class="smm-title">${opts.title || '操作'}</h2>
            ${opts.subtitle ? `<p class="smm-subtitle">${opts.subtitle}</p>` : ''}
          </div>
          <button class="smm-close" onclick="smCloseModal('${id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="smm-body">${fieldsHtml}</div>
        <div class="smm-footer">
          <button class="smm-btn smm-btn-cancel" onclick="smCloseModal('${id}')">取消</button>
          <button class="smm-btn smm-btn-primary" id="${id}-submit">${opts.submitLabel || '确定'}</button>
        </div>
      </div>
    </div>`;

  /* radio-cards 点击高亮 */
  root.querySelectorAll('.smm-radio-cards').forEach(group => {
    group.querySelectorAll('.smm-rc').forEach(card => {
      card.addEventListener('click', () => {
        group.querySelectorAll('.smm-rc').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        card.querySelector('input[type=radio]').checked = true;
      });
    });
  });

  /* 提交 */
  document.getElementById(`${id}-submit`).addEventListener('click', () => {
    const data = {};
    for (const f of (opts.fields || [])) {
      if (f.type === 'radio-cards') {
        const checked = root.querySelector(`input[name="${id}-${f.key}"]:checked`);
        data[f.key] = checked ? checked.value : '';
      } else {
        const el = document.getElementById(`${id}-${f.key}`);
        data[f.key] = el ? el.value.trim() : '';
      }
      if (f.required && !data[f.key]) {
        const inp = document.getElementById(`${id}-${f.key}`);
        if (inp) { inp.classList.add('smm-input-error'); inp.focus(); }
        return;
      }
    }
    smCloseModal(id);
    if (opts.onSubmit) opts.onSubmit(data);
  });

  /* 遮罩点击关闭 */
  document.getElementById(id).addEventListener('click', e => {
    if (e.target === e.currentTarget) smCloseModal(id);
  });

  /* 聚焦第一个输入 */
  setTimeout(() => {
    const first = root.querySelector('.smm-input');
    if (first) first.focus();
  }, 80);
}

/**
 * 确认弹窗
 * @param {object} opts - { title, message, icon?, danger?, confirmLabel, onConfirm }
 */
function smShowConfirm(opts) {
  const root = smEnsureModalRoot();
  const id = 'smcf-' + Date.now();

  const iconHtml = opts.danger
    ? `<div class="smm-confirm-icon smm-ci-danger">
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="24" height="24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
       </div>`
    : `<div class="smm-confirm-icon smm-ci-info">
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="24" height="24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
       </div>`;

  root.innerHTML = `
    <div class="smm-backdrop open" id="${id}">
      <div class="smm-box smm-box-sm">
        <div class="smm-header">
          <div><h2 class="smm-title">${opts.title || '确认操作'}</h2></div>
          <button class="smm-close" onclick="smCloseModal('${id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="smm-body smm-confirm-body">
          ${iconHtml}
          <div class="smm-confirm-msg">${opts.message || ''}</div>
        </div>
        <div class="smm-footer">
          <button class="smm-btn smm-btn-cancel" onclick="smCloseModal('${id}')">取消</button>
          <button class="smm-btn ${opts.danger ? 'smm-btn-danger' : 'smm-btn-primary'}" id="${id}-ok">${opts.confirmLabel || '确定'}</button>
        </div>
      </div>
    </div>`;

  document.getElementById(`${id}-ok`).addEventListener('click', () => {
    smCloseModal(id);
    if (opts.onConfirm) opts.onConfirm();
  });
  document.getElementById(id).addEventListener('click', e => {
    if (e.target === e.currentTarget) smCloseModal(id);
  });
}

function smCloseModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('open');
  setTimeout(() => el.remove(), 200);
}

/* ═══════════════════════════════════════
   初始化 & Tab 切换
   ═══════════════════════════════════════ */
function initSm() {
  const container = document.getElementById('sm-container');
  if (!container) return;
  smActiveTab = 'org';
  smRender();
}

function smSwitchTab(tab) {
  smActiveTab = tab;
  smMemberPage = 1;
  smMemberChecked.clear();
  smRender();
}

function smRender() {
  const container = document.getElementById('sm-container');
  if (!container) return;
  const TABS = [
    { key: 'org',      label: '组织架构', icon: smIcon('org') },
    { key: 'members',  label: '人员管理', icon: smIcon('members') },
    { key: 'roles',    label: '角色权限', icon: smIcon('roles') },
    { key: 'templates',label: '模板管理', icon: smIcon('templates') },
    { key: 'storage',  label: '存储空间', icon: smIcon('storage') },
    { key: 'security', label: '安全管理', icon: smIcon('security') },
    { key: 'compliance',label:'合规管理', icon: smIcon('compliance') },
  ];
  container.innerHTML = `
    <div class="sm-layout">
      <aside class="sm-sidebar">
        <div class="sm-sidebar-title">系统管理</div>
        ${TABS.map(t => `
          <button class="sm-nav-item ${smActiveTab === t.key ? 'active' : ''}"
                  onclick="smSwitchTab('${t.key}')">
            ${t.icon}<span>${t.label}</span>
          </button>`).join('')}
      </aside>
      <main class="sm-main" id="sm-main"></main>
    </div>`;
  const main = document.getElementById('sm-main');
  const renderers = { org: smRenderOrg, members: smRenderMembers, roles: smRenderRoles, templates: smRenderTemplates, storage: smRenderStorage, security: smRenderSecurity, compliance: smRenderCompliance };
  (renderers[smActiveTab] || smRenderOrg)(main);
}

/* ═══════════════════════════════════════
   Tab 1 · 组织架构管理
   ═══════════════════════════════════════ */
let smOrgExpanded = {};

function smRenderOrg(main) {
  main.innerHTML = `
    <div class="sm-page-hd">
      <div>
        <h2 class="sm-page-title">组织架构管理</h2>
        <p class="sm-page-desc">定时或手动同步企业微信组织架构，管理部门成员</p>
      </div>
      <div class="sm-hd-actions">
        <button class="sm-btn sm-btn-outline" onclick="showNotification('正在同步企业微信组织架构…')">
          ${smIcon('sync')}<span>同步企微架构</span>
        </button>
        <button class="sm-btn sm-btn-primary" onclick="showNotification('新增部门功能即将上线')">
          ${smIcon('plus')}<span>新增部门</span>
        </button>
      </div>
    </div>
    <div class="sm-sync-bar">
      <span class="sm-sync-dot"></span>
      <span>上次同步：${SM_ORG_TREE[0]?.lastSync || '—'}</span>
      <span class="sm-sync-sep">|</span>
      <span>同步策略：每日 02:00 自动同步</span>
      <button class="sm-link-btn" onclick="showNotification('同步策略配置即将上线')">修改策略</button>
    </div>
    <div id="sm-org-list"></div>`;
  smRenderOrgList();
}

function smRenderOrgList() {
  const el = document.getElementById('sm-org-list');
  if (!el) return;
  el.innerHTML = SM_ORG_TREE.map(d => {
    const expanded = smOrgExpanded[d.id];
    const members = SM_MEMBERS.filter(m => m.dept === d.name && m.status === 'active');
    return `
    <div class="sm-card sm-org-card">
      <div class="sm-org-row" onclick="smToggleDept('${d.id}')">
        <svg class="sm-org-chevron ${expanded ? 'open' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>
        <span class="sm-dept-name">${d.name}</span>
        <span class="sm-text-sub" style="margin-left:8px;">${d.parentName}</span>
        <span class="sm-badge-count" style="margin-left:auto;">${members.length} 人</span>
        <span class="sm-text-sub" style="margin-left:12px;font-size:0.76rem;">同步 ${d.lastSync}</span>
        <div class="sm-act-group" style="margin-left:12px;" onclick="event.stopPropagation()">
          <button class="sm-act-btn" onclick="smOrgAddMember('${d.name}')">新增</button>
          <button class="sm-act-btn sm-act-danger" onclick="showNotification('删除部门「${d.name}」功能即将上线')">删除</button>
        </div>
      </div>
      ${expanded ? `
      <div class="sm-org-members">
        <table class="sm-table sm-table-compact">
          <thead><tr><th>姓名</th><th>性别</th><th>部门</th><th>手机号</th><th>操作</th></tr></thead>
          <tbody>
            ${members.length ? members.map(m => `
              <tr>
                <td><span class="sm-member-name">${m.name}</span></td>
                <td class="sm-text-sub">${m.gender}</td>
                <td>${m.dept}</td>
                <td class="sm-text-mono">${m.phone}</td>
                <td><button class="sm-act-btn sm-act-danger" onclick="smOrgRemoveMember('${m.id}','${m.name}','${d.name}')">删除</button></td>
              </tr>`).join('')
            : '<tr><td colspan="5" class="sm-text-sub" style="text-align:center;padding:16px;">暂无成员</td></tr>'}
          </tbody>
        </table>
      </div>` : ''}
    </div>`;
  }).join('');
}

function smToggleDept(deptId) {
  smOrgExpanded[deptId] = !smOrgExpanded[deptId];
  smRenderOrgList();
}

function smOrgAddMember(deptName) {
  smShowFormModal({
    title: '新增部门成员',
    subtitle: `将成员添加至「${deptName}」`,
    fields: [
      { key: 'name',   label: '姓名',  type: 'text', required: true, placeholder: '请输入姓名' },
      { key: 'gender', label: '性别',  type: 'select', options: [{label:'男'},{label:'女'}], value: '男' },
      { key: 'phone',  label: '手机号', type: 'text', required: true, placeholder: '请输入手机号' },
    ],
    submitLabel: '添加成员',
    onSubmit(data) {
      const newId = 'EMP' + String(SM_MEMBERS.length + 1).padStart(3, '0');
      SM_MEMBERS.push({ id: newId, name: data.name, gender: data.gender, firm: '央企事务所', dept: deptName, phone: data.phone, role: '正式员工', joinedAt: new Date().toISOString().slice(0,10), validUntil: '', status: 'active' });
      showNotification(`已新增成员「${data.name}」至${deptName}`);
      smOrgExpanded[SM_ORG_TREE.find(d => d.name === deptName)?.id] = true;
      smRenderOrgList();
    }
  });
}

function smOrgRemoveMember(memberId, memberName, deptName) {
  smShowConfirm({
    title: '删除成员',
    message: `确认从「<strong>${deptName}</strong>」中删除成员「<strong>${memberName}</strong>」？<br><br><span style="color:var(--text-tertiary);font-size:0.84rem;">删除后该成员将从部门中移除。</span>`,
    danger: true,
    confirmLabel: '确认删除',
    onConfirm() {
      const idx = SM_MEMBERS.findIndex(m => m.id === memberId);
      if (idx >= 0) SM_MEMBERS.splice(idx, 1);
      showNotification(`已从「${deptName}」删除成员「${memberName}」`);
      smRenderOrgList();
    }
  });
}

/* ═══════════════════════════════════════
   Tab 2 · 组织人员管理
   ═══════════════════════════════════════ */
function smRenderMembers(main) {
  const active = SM_MEMBERS.filter(m => m.status === 'active');
  const left   = SM_MEMBERS.filter(m => m.status === 'left');
  const curList = smMemberTab === 'left' ? left : active;

  main.innerHTML = `
    <div class="sm-page-hd">
      <div>
        <h2 class="sm-page-title">组织人员管理</h2>
        <p class="sm-page-desc">管理组织成员信息，支持一键同步企微部门成员</p>
      </div>
      <div class="sm-hd-actions">
        <button class="sm-btn sm-btn-outline" onclick="showNotification('正在同步组织架构成员…')">
          ${smIcon('sync')}<span>同步企微成员</span>
        </button>
        <button class="sm-btn sm-btn-primary" onclick="smBatchRole()">
          ${smIcon('roles')}<span>批量配置组织角色</span>
        </button>
      </div>
    </div>
    <div class="sm-sub-tabs">
      <button class="sm-sub-tab ${smMemberTab==='active'?'active':''}" data-smst="active">已加入 <span class="sm-sub-count">${active.length}</span></button>
      <button class="sm-sub-tab ${smMemberTab==='left'?'active':''}" data-smst="left">已移出 <span class="sm-sub-count">${left.length}</span></button>
    </div>
    <div id="sm-member-list"></div>`;

  smRenderMemberTable(curList, smMemberTab);

  main.querySelectorAll('.sm-sub-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      main.querySelectorAll('.sm-sub-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      smMemberTab = btn.dataset.smst;
      smMemberPage = 1;
      smMemberChecked.clear();
      const list = smMemberTab === 'left'
        ? SM_MEMBERS.filter(m => m.status === 'left')
        : SM_MEMBERS.filter(m => m.status === 'active');
      smRenderMemberTable(list, smMemberTab);
    });
  });
}

function smRenderMemberTable(list, type) {
  const el = document.getElementById('sm-member-list');
  if (!el) return;

  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / SM_PAGE_SIZE));
  if (smMemberPage > totalPages) smMemberPage = totalPages;
  const start = (smMemberPage - 1) * SM_PAGE_SIZE;
  const rows = list.slice(start, start + SM_PAGE_SIZE);
  const allChecked = rows.length > 0 && rows.every(m => smMemberChecked.has(m.id));

  el.innerHTML = `
    <div class="sm-card">
      <table class="sm-table">
        <thead>
          <tr>
            <th style="width:36px;"><input type="checkbox" class="sm-cb" id="sm-check-all" ${allChecked ? 'checked' : ''}></th>
            <th>员工ID</th><th>姓名</th><th>性别</th><th>归属事务所</th><th>部门</th>
            <th>手机号</th><th>组织角色</th><th>加入时间</th>
            ${type === 'active' ? '<th>有效期</th>' : '<th>移出时间</th>'}
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(m => `
            <tr>
              <td><input type="checkbox" class="sm-cb sm-row-cb" data-mid="${m.id}" ${smMemberChecked.has(m.id)?'checked':''}></td>
              <td class="sm-text-mono">${m.id}</td>
              <td><span class="sm-member-name">${m.name}</span></td>
              <td class="sm-text-sub">${m.gender}</td>
              <td class="sm-text-sub">${m.firm}</td>
              <td>${m.dept}</td>
              <td class="sm-text-mono">${m.phone}</td>
              <td><span class="sm-role-tag sm-role-${smRoleCls(m.role)}">${m.role}</span></td>
              <td class="sm-text-sub">${m.joinedAt}</td>
              ${type === 'active'
                ? `<td class="sm-text-sub">${m.validUntil || '长期'}</td>`
                : `<td class="sm-text-sub">${m.leftAt || '—'}</td>`}
              <td>
                <div class="sm-act-group">
                  ${type === 'active' ? `
                    <button class="sm-act-btn" onclick="smEditMember('${m.id}')">编辑</button>
                    ${m.role === '实习生' ? `<button class="sm-act-btn" onclick="smRenewMember('${m.id}')">续期</button>` : ''}
                    ${m.role === '实习生' ? `<button class="sm-act-btn sm-act-danger" onclick="smRemoveMember('${m.id}')">移出</button>` : ''}
                  ` : `
                    <button class="sm-act-btn" onclick="showNotification('「${m.name}」离职交接功能即将上线')">交接</button>
                  `}
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
      <div class="sm-pager">
        <span class="sm-pager-info">共 <strong>${total}</strong> 条</span>
        <div class="sm-pager-btns">
          <button class="sm-pager-btn" ${smMemberPage<=1?'disabled':''} onclick="smMemberGoPage(${smMemberPage-1},'${type}')">上一页</button>
          ${smPagerNumbers(totalPages, smMemberPage, type)}
          <button class="sm-pager-btn" ${smMemberPage>=totalPages?'disabled':''} onclick="smMemberGoPage(${smMemberPage+1},'${type}')">下一页</button>
          <span class="sm-pager-jump">跳至 <input type="number" class="sm-pager-input" id="sm-jump-input" min="1" max="${totalPages}" value="${smMemberPage}"> 页
            <button class="sm-pager-btn" onclick="smMemberJump('${type}',${totalPages})">确定</button>
          </span>
        </div>
      </div>
    </div>`;

  el.querySelector('#sm-check-all')?.addEventListener('change', function() {
    rows.forEach(m => { if (this.checked) smMemberChecked.add(m.id); else smMemberChecked.delete(m.id); });
    el.querySelectorAll('.sm-row-cb').forEach(cb => { cb.checked = this.checked; });
  });
  el.querySelectorAll('.sm-row-cb').forEach(cb => {
    cb.addEventListener('change', function() {
      if (this.checked) smMemberChecked.add(this.dataset.mid); else smMemberChecked.delete(this.dataset.mid);
      const allEl = el.querySelector('#sm-check-all');
      if (allEl) allEl.checked = rows.every(m => smMemberChecked.has(m.id));
    });
  });
}

function smPagerNumbers(totalPages, current, type) {
  if (totalPages <= 5) {
    return Array.from({length: totalPages}, (_, i) => i+1)
      .map(p => `<button class="sm-pager-btn ${p===current?'sm-pager-active':''}" onclick="smMemberGoPage(${p},'${type}')">${p}</button>`).join('');
  }
  return `<span class="sm-pager-cur">${current} / ${totalPages}</span>`;
}

function smMemberGoPage(p, type) {
  smMemberPage = p;
  smMemberChecked.clear();
  const list = type === 'left' ? SM_MEMBERS.filter(m => m.status === 'left') : SM_MEMBERS.filter(m => m.status === 'active');
  smRenderMemberTable(list, type);
}

function smMemberJump(type, maxPage) {
  const v = parseInt(document.getElementById('sm-jump-input')?.value);
  if (!v || v < 1 || v > maxPage) { showNotification('请输入有效页码'); return; }
  smMemberGoPage(v, type);
}

function smBatchRole() {
  if (smMemberChecked.size === 0) { showNotification('请先勾选成员'); return; }
  const roleOpts = ['系统管理员','部门负责人','正式员工','部门行政秘书','实习生'];
  smShowFormModal({
    title: '批量配置组织角色',
    subtitle: `为已选中的 ${smMemberChecked.size} 名成员统一设置组织角色`,
    fields: [{
      key: 'role', label: '目标角色', type: 'radio-cards', required: true,
      options: roleOpts.map(r => ({ label: r, value: r })),
    }],
    submitLabel: '确认设置',
    onSubmit(data) {
      smMemberChecked.forEach(id => {
        const m = SM_MEMBERS.find(x => x.id === id);
        if (m) m.role = data.role;
      });
      showNotification(`已将 ${smMemberChecked.size} 名成员的组织角色设置为「${data.role}」`);
      smMemberChecked.clear();
      const main = document.getElementById('sm-main');
      if (main) smRenderMembers(main);
    }
  });
}

function smEditMember(id) {
  const m = SM_MEMBERS.find(x => x.id === id);
  if (!m) return;
  const roleOpts = ['系统管理员','部门负责人','正式员工','部门行政秘书','实习生'];
  smShowFormModal({
    title: `编辑成员信息`,
    subtitle: `${m.name}（${m.id}）· ${m.dept}`,
    fields: [
      { key: 'role', label: '组织角色', type: 'select', value: m.role,
        options: roleOpts.map(r => ({ label: r, value: r })) },
      { key: 'validUntil', label: '有效期', type: 'date', value: m.validUntil || '',
        hint: '留空表示长期有效' },
    ],
    submitLabel: '保存修改',
    onSubmit(data) {
      m.role = data.role;
      m.validUntil = data.validUntil;
      showNotification(`已更新「${m.name}」信息`);
      const main = document.getElementById('sm-main');
      if (main) smRenderMembers(main);
    }
  });
}

function smRemoveMember(id) {
  const m = SM_MEMBERS.find(x => x.id === id);
  if (!m) return;
  smShowConfirm({
    title: '移出成员',
    message: `确认移出「<strong>${m.name}</strong>」吗？<br><br><span style="color:var(--text-tertiary);font-size:0.84rem;">移出后该成员将失去所有权限，但保留所有操作记录。</span>`,
    danger: true,
    confirmLabel: '确认移出',
    onConfirm() {
      m.status = 'left';
      m.leftAt = new Date().toISOString().slice(0, 10);
      showNotification(`已移出「${m.name}」`);
      const main = document.getElementById('sm-main');
      if (main) smRenderMembers(main);
    }
  });
}

function smRenewMember(id) {
  const m = SM_MEMBERS.find(x => x.id === id);
  if (!m) return;
  const cur = m.validUntil ? new Date(m.validUntil) : new Date();
  cur.setMonth(cur.getMonth() + 1);
  const pad = v => String(v).padStart(2, '0');
  const newDate = `${cur.getFullYear()}-${pad(cur.getMonth()+1)}-${pad(cur.getDate())}`;

  smShowConfirm({
    title: '续期确认',
    message: `将「<strong>${m.name}</strong>」的有效期延长一个月：<br><br>
      <span style="color:var(--text-tertiary);font-size:0.84rem;">当前有效期：${m.validUntil || '—'}</span><br>
      <span style="color:var(--brand-600,#4F46E5);font-weight:600;font-size:0.88rem;">延长至：${newDate}</span>`,
    confirmLabel: '确认续期',
    onConfirm() {
      m.validUntil = newDate;
      showNotification(`已将「${m.name}」的有效期延长至 ${newDate}`);
      const main = document.getElementById('sm-main');
      if (main) smRenderMembers(main);
    }
  });
}

function smRoleCls(role) {
  const map = { '系统管理员':'admin', '部门负责人':'lead', '正式员工':'staff', '部门行政秘书':'sec', '实习生':'intern' };
  return map[role] || 'staff';
}

/* ═══════════════════════════════════════
   Tab 3 · 角色权限管理
   ═══════════════════════════════════════ */
let smSelectedRole = null;

function smRenderRoles(main) {
  smSelectedRole = smSelectedRole || SM_ROLES[0]?.id;
  main.innerHTML = `
    <div class="sm-page-hd">
      <div>
        <h2 class="sm-page-title">角色权限管理</h2>
        <p class="sm-page-desc">管理组织角色，配置各角色的功能权限</p>
      </div>
      <div class="sm-hd-actions">
        <button class="sm-btn sm-btn-primary" onclick="showNotification('新增角色功能即将上线')">${smIcon('plus')}<span>新增角色</span></button>
      </div>
    </div>
    <div class="sm-roles-layout">
      <div class="sm-roles-left">
        <div class="sm-roles-list">
          ${SM_ROLES.map(r => `
            <div class="sm-role-card ${smSelectedRole === r.id ? 'active' : ''}" onclick="smSelectRole('${r.id}')">
              <div class="sm-role-card-name">${r.name} ${r.builtin ? '<span class="sm-built-in">内置</span>' : ''}</div>
              <div class="sm-role-card-desc">${r.desc}</div>
            </div>`).join('')}
        </div>
      </div>
      <div class="sm-roles-right">
        <div class="sm-roles-right-hd">
          <span class="sm-roles-right-title">${SM_ROLES.find(r => r.id === smSelectedRole)?.name || '—'} — 权限配置</span>
          <button class="sm-btn sm-btn-primary sm-btn-sm" onclick="showNotification('权限已保存')">保存</button>
        </div>
        <div class="sm-perm-body">${smRenderPermModules()}</div>
      </div>
    </div>`;
}
function smSelectRole(id) { smSelectedRole = id; const main = document.getElementById('sm-main'); if (main) smRenderRoles(main); }

function smRenderPermModules() {
  const isAdmin = smSelectedRole === 'r1';
  return SM_PERM_MODULES.map(mod => `
    <div class="sm-perm-mod">
      <div class="sm-perm-mod-hd" onclick="this.closest('.sm-perm-mod').classList.toggle('collapsed')">
        <svg class="sm-perm-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="12" height="12"><polyline points="9 18 15 12 9 6"/></svg>
        <span class="sm-perm-mod-label">${mod.label}</span>
        <label class="sm-perm-all-label" onclick="event.stopPropagation()">
          <input type="checkbox" class="sm-cb" ${isAdmin?'checked':''} onchange="smToggleModPerms(this)"> 全选
        </label>
      </div>
      <div class="sm-perm-mod-body">
        ${mod.perms.map(p => `<label class="sm-perm-item"><input type="checkbox" class="sm-cb" ${isAdmin?'checked':''}><span>${p.label}</span></label>`).join('')}
      </div>
    </div>`).join('');
}
function smToggleModPerms(allCb) { allCb.closest('.sm-perm-mod').querySelectorAll('.sm-perm-mod-body .sm-cb').forEach(cb => { cb.checked = allCb.checked; }); }

/* ═══════════════════════════════════════
   Tab 4 · 模板管理
   ═══════════════════════════════════════ */
let smTplTab = 'audit';

function smRenderTemplates(main) {
  main.innerHTML = `
    <div class="sm-page-hd">
      <div>
        <h2 class="sm-page-title">模板管理</h2>
        <p class="sm-page-desc">管理审计业务模板、交付工单模板与项目工作区模板文件夹初始化规则</p>
      </div>
    </div>
    <div class="sm-sub-tabs">
      <button class="sm-sub-tab ${smTplTab==='audit'?'active':''}" data-tpl="audit">审计业务模板</button>
      <button class="sm-sub-tab ${smTplTab==='wo'?'active':''}" data-tpl="wo">交付工单模板</button>
      <button class="sm-sub-tab ${smTplTab==='folder'?'active':''}" data-tpl="folder">项目工作区模板文件夹初始化</button>
    </div>
    <div id="sm-tpl-content"></div>`;
  smRenderTplContent();
  main.querySelectorAll('.sm-sub-tab[data-tpl]').forEach(btn => {
    btn.addEventListener('click', () => {
      main.querySelectorAll('.sm-sub-tab[data-tpl]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      smTplTab = btn.dataset.tpl;
      smRenderTplContent();
    });
  });
}

function smRenderTplContent() {
  const el = document.getElementById('sm-tpl-content');
  if (!el) return;
  if (smTplTab === 'audit') smRenderAuditTpl(el);
  else if (smTplTab === 'wo') smRenderWoTpl(el);
  else smRenderFolderTpl(el);
}

function smRenderAuditTpl(el) {
  el.innerHTML = `
    <div class="sm-card">
      <div class="sm-card-hd">
        <span class="sm-card-hd-title">审计业务模板库</span>
        <button class="sm-btn sm-btn-primary sm-btn-sm" onclick="showNotification('上传新模板功能即将上线')">
          ${smIcon('plus')}<span>上传模板</span>
        </button>
      </div>
      <table class="sm-table">
        <thead><tr>
          <th style="width:28px;"></th><th>文件名</th><th>大小</th><th>更新人</th><th>更新时间</th><th>当前版本</th><th>操作</th>
        </tr></thead>
        <tbody>
          ${SM_AUDIT_TEMPLATES.map(t => {
            const ext = t.name.split('.').pop();
            return `
            <tr>
              <td>${smFileIcon(ext)}</td>
              <td class="sm-tpl-name">${t.name}</td>
              <td class="sm-text-sub">${t.size}</td>
              <td><span class="sm-member-name">${t.updater}</span></td>
              <td class="sm-text-sub">${t.updatedAt}</td>
              <td><span class="sm-ver-tag">${t.ver}</span></td>
              <td>
                <div class="sm-act-group">
                  <button class="sm-act-btn" onclick="showNotification('上传「${t.name}」新版本')">上传新版本</button>
                  <button class="sm-act-btn" onclick="showNotification('下载「${t.name}」')">下载</button>
                  <button class="sm-act-btn" onclick="showNotification('预览「${t.name}」')">预览</button>
                </div>
              </td>
            </tr>`;}).join('')}
        </tbody>
      </table>
    </div>`;
}

function smRenderWoTpl(el) {
  el.innerHTML = `
    <div class="sm-card">
      <div class="sm-card-hd">
        <span class="sm-card-hd-title">交付工单模板</span>
        <button class="sm-btn sm-btn-primary sm-btn-sm" onclick="smNewWoTemplate()">
          ${smIcon('plus')}<span>新建模板</span>
        </button>
      </div>
      <div class="sm-wo-tpl-hint">
        ${smIcon('info')}
        <span>支持拖拉拽组件方式自定义工单模板，配置表单字段与流转节点（类似飞书审批表单设计器）</span>
      </div>
      <table class="sm-table">
        <thead><tr><th>模板名称</th><th>工单类型</th><th>流转节点</th><th>表单字段</th><th>更新时间</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          ${SM_WO_TEMPLATES.map(t => `
            <tr>
              <td class="sm-tpl-name">${t.name}</td>
              <td>${smWoTypeBadge(t.woType)}</td>
              <td><span class="sm-badge-count">${t.nodes} 节点</span></td>
              <td><span class="sm-badge-count">${t.fields} 字段</span></td>
              <td class="sm-text-sub">${t.updatedAt}</td>
              <td>${smStatusDot(t.status)}</td>
              <td>
                <div class="sm-act-group">
                  <button class="sm-act-btn" onclick="showNotification('打开模板设计器「${t.name}」')">设计</button>
                  <button class="sm-act-btn" onclick="showNotification('预览「${t.name}」')">预览</button>
                  <button class="sm-act-btn" onclick="showNotification('复制模板「${t.name}」')">复制</button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function smNewWoTemplate() {
  smShowFormModal({
    title: '新建工单模板',
    subtitle: '选择工单类型并为模板命名',
    fields: [
      { key: 'woType', label: '工单类型', type: 'radio-cards', required: true,
        options: [
          { value: '一类工单', label: '一类工单', desc: '资源意向 · 计划阶段发起' },
          { value: '二类工单', label: '二类工单', desc: '标准模块 · 执行阶段发起' },
          { value: '三类工单', label: '三类工单', desc: '深度协同 · 驻场作业' },
        ]},
      { key: 'name', label: '模板名称', type: 'text', required: true, placeholder: '请输入模板名称' },
    ],
    submitLabel: '创建并设计',
    width: 560,
    onSubmit(data) {
      showNotification(`模板「${data.name}」已创建，即将打开拖拉拽设计器…`);
    }
  });
}

function smFormatConditions(conds) {
  if (!conds) return '—';
  const parts = [];
  if (conds.entType) parts.push(`企业类型 = ${conds.entType}`);
  if (conds.listed) parts.push(`是否上市 = ${conds.listed}`);
  if (conds.exchange) parts.push(`上市板块 = ${conds.exchange}`);
  if (conds.bizType) parts.push(`业务类型 = ${conds.bizType}`);
  return parts.length ? parts.join('  且  ') : '无条件限制';
}

function smRenderFolderTpl(el) {
  el.innerHTML = `
    <div class="sm-card">
      <div class="sm-card-hd">
        <span class="sm-card-hd-title">项目工作区模板文件夹初始化</span>
        <button class="sm-btn sm-btn-primary sm-btn-sm" onclick="smNewFolderRule()">
          ${smIcon('plus')}<span>新增规则</span>
        </button>
      </div>
      <div class="sm-folder-presets">
        ${SM_FOLDER_PRESETS.map(fp => {
          const tplNames = (fp.templateIds || [])
            .map(id => SM_AUDIT_TEMPLATES.find(t => t.id === id))
            .filter(Boolean)
            .map(t => t.name);
          return `
          <div class="sm-folder-card">
            <div class="sm-folder-card-hd">
              <span class="sm-folder-card-name">${fp.name}</span>
              <div class="sm-act-group">
                <button class="sm-act-btn" onclick="showNotification('编辑规则「${fp.name}」')">编辑</button>
                <button class="sm-act-btn sm-act-danger" onclick="showNotification('删除规则「${fp.name}」')">删除</button>
              </div>
            </div>
            <div class="sm-folder-card-cond">
              <span class="smfr-cond-label">匹配条件</span>
              <span class="smfr-cond-text">${smFormatConditions(fp.conditions)}</span>
            </div>
            <div class="smfr-section-label">初始化文件夹</div>
            <div class="sm-folder-tags">
              ${fp.folders.map(f => `<span class="sm-folder-tag">${smIcon('folder-sm')}${f}</span>`).join('')}
            </div>
            ${tplNames.length ? `
            <div class="smfr-section-label" style="margin-top:8px;">预置模板文件</div>
            <div class="sm-folder-tags">
              ${tplNames.map(n => `<span class="sm-folder-tag smfr-tpl-tag">${smFileIcon(n.split('.').pop())}${n}</span>`).join('')}
            </div>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>`;
}

function smNewFolderRule() {
  const root = smEnsureModalRoot();
  const mid = 'smfr-' + Date.now();

  const optHtml = (arr, placeholder) =>
    `<option value="">${placeholder}</option>` + arr.map(v => `<option value="${v}">${v}</option>`).join('');

  const folderCheckboxes = SM_ALL_FOLDERS.map((f, i) =>
    `<label class="smfr-cb"><input type="checkbox" value="${f}" checked><span>${f}</span></label>`).join('');

  const tplCheckboxes = SM_AUDIT_TEMPLATES.map(t => {
    const ext = t.name.split('.').pop();
    return `<label class="smfr-cb smfr-tpl-cb"><input type="checkbox" value="${t.id}"><span>${smFileIcon(ext)}${t.name}</span><span class="smfr-tpl-meta">${t.size} · ${t.ver}</span></label>`;
  }).join('');

  root.innerHTML = `
    <div class="smm-backdrop open" id="${mid}">
      <div class="smm-box" style="max-width:640px;">
        <div class="smm-header">
          <div>
            <h2 class="smm-title">新增初始化规则</h2>
            <p class="smm-subtitle">配置匹配条件与自动创建的模板文件夹结构</p>
          </div>
          <button class="smm-close" onclick="smCloseModal('${mid}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="smm-body">
          <div class="smm-field">
            <label class="smm-label">规则名称<span class="smm-req">*</span></label>
            <input id="${mid}-name" type="text" class="smm-input" placeholder="如：上市央企-年报审计">
          </div>

          <div class="smm-field">
            <label class="smm-label">匹配条件</label>
            <div class="smm-hint" style="margin-bottom:8px;">当新建项目工作区满足以下全部条件时，自动应用此规则</div>
            <div class="smfr-cond-grid">
              <div class="smfr-cond-row">
                <span class="smfr-cond-prefix">当</span>
                <span class="smfr-cond-dim">所属集团客户的「企业类型」为</span>
                <select id="${mid}-entType" class="smm-input smm-select smfr-cond-sel">${optHtml(SM_FOLDER_ENT_TYPES, '不限')}</select>
              </div>
              <div class="smfr-cond-row">
                <span class="smfr-cond-prefix">且</span>
                <span class="smfr-cond-dim">所属集团客户的「是否上市公司」为</span>
                <select id="${mid}-listed" class="smm-input smm-select smfr-cond-sel">${optHtml(['是','否'], '不限')}</select>
              </div>
              <div class="smfr-cond-row" id="${mid}-exchange-row">
                <span class="smfr-cond-prefix">且</span>
                <span class="smfr-cond-dim">所属集团客户的「上市板块」为</span>
                <select id="${mid}-exchange" class="smm-input smm-select smfr-cond-sel">${optHtml(SM_FOLDER_EXCHANGES, '不限')}</select>
              </div>
              <div class="smfr-cond-row">
                <span class="smfr-cond-prefix">且</span>
                <span class="smfr-cond-dim">项目工作区的「业务类型」为</span>
                <select id="${mid}-bizType" class="smm-input smm-select smfr-cond-sel">${optHtml(SM_FOLDER_BIZ_TYPES, '不限')}</select>
              </div>
            </div>
          </div>

          <div class="smm-field">
            <label class="smm-label">初始化文件夹<span class="smm-req">*</span></label>
            <div class="smm-hint" style="margin-bottom:6px;">勾选新建工作区时自动创建的文件夹</div>
            <div class="smfr-cb-grid" id="${mid}-folders">${folderCheckboxes}</div>
          </div>

          <div class="smm-field">
            <label class="smm-label">预置模板文件</label>
            <div class="smm-hint" style="margin-bottom:6px;">从审计业务模板库中选择需自动放入「模板文件」夹的文件</div>
            <div class="smfr-cb-grid smfr-tpl-list" id="${mid}-tpls">${tplCheckboxes}</div>
          </div>
        </div>
        <div class="smm-footer">
          <button class="smm-btn smm-btn-cancel" onclick="smCloseModal('${mid}')">取消</button>
          <button class="smm-btn smm-btn-primary" id="${mid}-submit">创建规则</button>
        </div>
      </div>
    </div>`;

  /* 上市联动：非"是"时隐藏上市板块行 */
  const listedSel = document.getElementById(`${mid}-listed`);
  const exchRow = document.getElementById(`${mid}-exchange-row`);
  function syncExchange() {
    if (exchRow) exchRow.style.display = listedSel?.value === '是' ? '' : 'none';
  }
  listedSel?.addEventListener('change', syncExchange);
  syncExchange();

  /* 遮罩点击关闭 */
  document.getElementById(mid).addEventListener('click', e => {
    if (e.target === e.currentTarget) smCloseModal(mid);
  });

  /* 提交 */
  document.getElementById(`${mid}-submit`).addEventListener('click', () => {
    const name = document.getElementById(`${mid}-name`)?.value.trim();
    if (!name) {
      const inp = document.getElementById(`${mid}-name`);
      inp?.classList.add('smm-input-error'); inp?.focus();
      return;
    }
    const folders = [...document.querySelectorAll(`#${mid}-folders input:checked`)].map(cb => cb.value);
    if (!folders.length) { showNotification('请至少勾选一个文件夹'); return; }

    const entType = document.getElementById(`${mid}-entType`)?.value || '';
    const listed = document.getElementById(`${mid}-listed`)?.value || '';
    const exchange = listed === '是' ? (document.getElementById(`${mid}-exchange`)?.value || '') : '';
    const bizType = document.getElementById(`${mid}-bizType`)?.value || '';
    const templateIds = [...document.querySelectorAll(`#${mid}-tpls input:checked`)].map(cb => cb.value);

    SM_FOLDER_PRESETS.push({
      id: 'fp' + (SM_FOLDER_PRESETS.length + 1),
      name,
      conditions: { entType, listed, exchange, bizType },
      folders,
      templateIds,
    });

    smCloseModal(mid);
    showNotification(`已新增模板文件夹初始化规则「${name}」`);
    smRenderTplContent();
  });
}

/* ═══════════════════════════════════════
   Tab 5 · 存储空间管理
   ═══════════════════════════════════════ */
function smRenderStorage(main) {
  const totalQuota = SM_STORAGE.reduce((s, d) => s + d.quota, 0);
  const totalUsed  = SM_STORAGE.reduce((s, d) => s + d.used, 0);
  main.innerHTML = `
    <div class="sm-page-hd">
      <div>
        <h2 class="sm-page-title">存储空间管理</h2>
        <p class="sm-page-desc">监控各部门存储用量，调整空间配额</p>
      </div>
    </div>
    <div class="sm-storage-summary">
      <div class="sm-storage-stat">
        <div class="sm-storage-stat-label">总配额</div>
        <div class="sm-storage-stat-val">${(totalQuota/1024).toFixed(1)} TB</div>
      </div>
      <div class="sm-storage-stat">
        <div class="sm-storage-stat-label">已使用</div>
        <div class="sm-storage-stat-val sm-storage-used">${(totalUsed/1024).toFixed(2)} TB</div>
      </div>
      <div class="sm-storage-stat">
        <div class="sm-storage-stat-label">使用率</div>
        <div class="sm-storage-stat-val">${((totalUsed/totalQuota)*100).toFixed(1)}%</div>
      </div>
    </div>
    <div class="sm-card">
      <table class="sm-table">
        <thead><tr><th>部门</th><th>配额</th><th>已用</th><th>使用率</th><th>用量条</th><th>操作</th></tr></thead>
        <tbody>
          ${SM_STORAGE.map(d => {
            const pct = ((d.used / d.quota) * 100).toFixed(1);
            const cls = pct > 80 ? 'danger' : pct > 60 ? 'warn' : 'ok';
            return `
            <tr>
              <td class="sm-dept-name">${d.dept}</td>
              <td class="sm-text-sub">${d.quota >= 1024 ? (d.quota/1024).toFixed(0)+' TB' : d.quota+' GB'}</td>
              <td>${d.used} GB</td>
              <td><span class="sm-pct-text sm-pct-${cls}">${pct}%</span></td>
              <td style="min-width:160px;">
                <div class="sm-bar-track"><div class="sm-bar-fill sm-bar-${cls}" style="width:${pct}%"></div></div>
              </td>
              <td><div class="sm-act-group"><button class="sm-act-btn" onclick="showNotification('调整「${d.dept}」配额')">调整配额</button></div></td>
            </tr>`;}).join('')}
        </tbody>
      </table>
    </div>`;
}

/* ═══════════════════════════════════════
   Tab 6 · 安全管理
   ═══════════════════════════════════════ */
function smRenderSecurity(main) {
  const items = [
    { icon: smIcon('shield'), title: '账号安全', desc: '密码策略、登录失败锁定、二次验证', configs: [
      { label: '强密码策略', desc: '要求包含大小写字母、数字及特殊字符', on: true },
      { label: '登录失败锁定', desc: '连续 5 次失败后锁定账号 30 分钟', on: true },
      { label: '二次验证（MFA）', desc: '敏感操作需短信/企微验证码确认', on: false },
    ]},
    { icon: smIcon('network'), title: '网络安全', desc: 'IP 白名单、API 访问控制', configs: [
      { label: 'IP 白名单', desc: '仅允许白名单内 IP 访问管理后台', on: false },
      { label: 'API Token 过期策略', desc: 'Token 有效期 24 小时，到期自动刷新', on: true },
    ]},
    { icon: smIcon('link'), title: '链接安全', desc: '外链分享控制、链接有效期', configs: [
      { label: '外链分享审批', desc: '文件外链分享需审批后生效', on: true },
      { label: '链接自动过期', desc: '外链 7 天后自动失效', on: true },
    ]},
    { icon: smIcon('data'), title: '数据安全', desc: '传输加密、存储加密、脱敏规则', configs: [
      { label: 'TLS 1.3 传输加密', desc: '所有数据传输强制使用 TLS 1.3', on: true },
      { label: '存储 AES-256 加密', desc: '文件与数据库字段静态加密', on: true },
      { label: '手机号脱敏', desc: '非授权人员仅可见 138****1234 格式', on: true },
    ]},
    { icon: smIcon('deploy'), title: '部署安全', desc: '容器隔离、镜像签名验证', configs: [
      { label: '容器网络隔离', desc: '各服务容器独立网络命名空间', on: true },
      { label: '镜像签名验证', desc: '仅部署经签名验证的镜像', on: false },
    ]},
  ];
  main.innerHTML = `
    <div class="sm-page-hd"><div><h2 class="sm-page-title">安全管理</h2><p class="sm-page-desc">账号、网络、链接、数据与部署全方位安全防护</p></div></div>
    <div class="sm-security-grid">
      ${items.map(sec => `
        <div class="sm-sec-card">
          <div class="sm-sec-card-hd"><div class="sm-sec-icon">${sec.icon}</div><div><div class="sm-sec-title">${sec.title}</div><div class="sm-sec-desc">${sec.desc}</div></div></div>
          <div class="sm-sec-configs">
            ${sec.configs.map(c => `
              <div class="sm-sec-config-row">
                <div class="sm-sec-config-info"><div class="sm-sec-config-label">${c.label}</div><div class="sm-sec-config-desc">${c.desc}</div></div>
                <label class="sm-switch"><input type="checkbox" ${c.on?'checked':''} onchange="showNotification('${c.label}：'+(this.checked?'已开启':'已关闭'))"><span class="sm-switch-slider"></span></label>
              </div>`).join('')}
          </div>
        </div>`).join('')}
    </div>`;
}

/* ═══════════════════════════════════════
   Tab 7 · 合规管理
   ═══════════════════════════════════════ */
function smRenderCompliance(main) {
  const auditLogs = [
    { time: '2026-03-12 09:32', user: '刘洋', action: '修改角色权限', target: '实习生 → 新增「文件上传」权限', ip: '10.0.12.45' },
    { time: '2026-03-11 16:15', user: '张伟', action: '删除项目文档', target: '工作区「中国比亚迪」→ 风控评估报告.xlsx', ip: '10.0.12.88' },
    { time: '2026-03-11 14:08', user: '吴刚', action: '派单调度',     target: '工单 WO202603060002 → 指派给「王强」', ip: '10.0.13.22' },
    { time: '2026-03-10 17:45', user: '刘洋', action: '新增成员',     target: '周芳 加入审计二部（实习生）', ip: '10.0.12.45' },
    { time: '2026-03-10 11:20', user: '张伟', action: '创建工作区',   target: '万科企业-专项审计-2024年度', ip: '10.0.12.88' },
    { time: '2026-03-09 09:05', user: '刘洋', action: '调整存储配额', target: '质量控制部 1TB → 512GB', ip: '10.0.12.45' },
    { time: '2026-03-08 15:30', user: '李娜', action: '外链分享文件', target: '试算底稿-合并报表.xlsx → 链接有效期7天', ip: '10.0.14.10' },
  ];
  main.innerHTML = `
    <div class="sm-page-hd"><div><h2 class="sm-page-title">合规管理</h2><p class="sm-page-desc">日志审计与权限变更追踪，满足内部合规与外部监管要求</p></div>
      <div class="sm-hd-actions"><button class="sm-btn sm-btn-outline" onclick="showNotification('导出审计日志功能即将上线')">${smIcon('export')}<span>导出日志</span></button></div>
    </div>
    <div class="sm-sub-tabs">
      <button class="sm-sub-tab active">日志审计</button>
      <button class="sm-sub-tab" onclick="showNotification('权限审计报表即将上线')">权限审计</button>
    </div>
    <div class="sm-card">
      <table class="sm-table">
        <thead><tr><th>时间</th><th>操作人</th><th>操作类型</th><th>操作对象</th><th>来源 IP</th></tr></thead>
        <tbody>
          ${auditLogs.map(l => `<tr>
            <td class="sm-text-mono">${l.time}</td>
            <td><span class="sm-member-name">${l.user}</span></td>
            <td><span class="sm-action-tag">${l.action}</span></td>
            <td class="sm-text-sub" style="max-width:300px;">${l.target}</td>
            <td class="sm-text-mono sm-text-sub">${l.ip}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

/* ═══════════════════════════════════════
   工具函数
   ═══════════════════════════════════════ */
function smIcon(type) {
  const icons = {
    org:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="18" height="18"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    members:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="18" height="18"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    roles:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="18" height="18"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    templates:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="18" height="18"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    storage:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="18" height="18"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
    security:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="18" height="18"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    compliance: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    sync:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
    plus:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    info:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    shield:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="20" height="20"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    network:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    link:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="20" height="20"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    data:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="20" height="20"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
    deploy:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="20" height="20"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    export:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    'folder-sm':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="12" height="12"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
  };
  return icons[type] || '';
}

function smFileIcon(ext) {
  const color = { xlsx: '#10793F', xls: '#10793F', docx: '#2B579A', doc: '#2B579A', pdf: '#D32F2F' }[ext] || '#6B7280';
  const label = (ext || '?').toUpperCase().slice(0, 4);
  return `<span class="sm-file-icon" style="background:${color};">${label}</span>`;
}

function smStatusDot(status) {
  const cls = status === '已发布' || status === '已启用' ? 'sm-st-ok' : 'sm-st-draft';
  return `<span class="sm-status-dot ${cls}">${status}</span>`;
}

function smWoTypeBadge(type) {
  const cls = { '一类工单':'sm-wot-1','二类工单':'sm-wot-2','三类工单':'sm-wot-3' }[type] || '';
  return `<span class="sm-wo-type-badge ${cls}">${type}</span>`;
}
