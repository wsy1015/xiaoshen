/* ============================================
   小审 3.0 - 审计作业平台 交互逻辑
   重构版：数据驱动的桌面目录系统
   ============================================ */

/* ══════════════════════════════════════════════
   1. 文件夹数据模型
   桌面 > 超级项目(建项) > 公司主体 > 底稿/函证/交付
   ══════════════════════════════════════════════ */

const FOLDER_DATA = {
  id: 'root',
  name: '工作区',
  type: 'root',
  children: [
    /* ── 超级项目 1：XX集团年审 ── */
    {
      id: 'proj-1',
      name: '中国比亚迪-年度审计-2025年度-审计一部-001',
      type: 'project',
      color: '#6366F1',
      hasLedgerLink: true,   // 已关联账套
      hasCertLink: true,     // 已关联函证中心
      meta: '50家子公司 · 8人团队',
      children: [
        /* 账套文件（含供应商子文件夹）*/
        {
          id: 'ledger-root', name: '账套文件', type: 'template', color: '#6366F1', meta: '4个来源',
          children: [
            { id: 'ledger-yousj', name: '友数聚', type: 'template', color: '#6366F1', meta: '2个账套',
              children: [
                { id: 'f-ys1', name: '比亚迪汽车（广东）-2025年度账套.zip', type: 'file', fileType: 'zip', meta: '128.4 MB · v2' },
                { id: 'f-ys2', name: '比亚迪汽车（广东）-2024年度账套.zip', type: 'file', fileType: 'zip', meta: '96.1 MB · v1' },
              ]
            },
            { id: 'ledger-dxn', name: '鼎信诺', type: 'template', color: '#3B82F6', meta: '2个账套',
              children: [
                { id: 'f-dxn1', name: '中国比亚迪-2025年度账套.dat', type: 'file', fileType: 'dat', meta: '215.7 MB · v2' },
                { id: 'f-dxn2', name: '中国比亚迪-2024年度账套.dat', type: 'file', fileType: 'dat', meta: '182.4 MB · v1' },
              ]
            },
            { id: 'ledger-xjy', name: '新纪元', type: 'template', color: '#10B981', meta: '2个账套',
              children: [
                { id: 'f-xjy1', name: '比亚迪新材料-2025年度账套.dat', type: 'file', fileType: 'dat', meta: '74.3 MB · v2' },
                { id: 'f-xjy2', name: '比亚迪新材料-2024年度账套.dat', type: 'file', fileType: 'dat', meta: '52.8 MB · v1' },
              ]
            },
            { id: 'ledger-excel', name: 'Excel 账套', type: 'template', color: '#F59E0B', meta: '2个文件',
              children: [
                { id: 'f-exc1', name: '比亚迪汽车（广东）-科目余额表-2025.xlsx', type: 'file', fileType: 'xlsx', meta: '8.6 MB · v1' },
                { id: 'f-exc2', name: '比亚迪汽车（广东）-序时账-2025.xlsx', type: 'file', fileType: 'xlsx', meta: '32.1 MB · v1' },
              ]
            },
          ]
        },
        /* 函证文件夹 */
        {
          id: 'cert-root', name: '函证文件夹', type: 'cert', color: '#3B82F6', meta: '5项函证',
          children: [
            { id: 'f-cert1', name: '银行函证-制函.xlsx', type: 'file', fileType: 'xlsx', meta: '制函完成' },
            { id: 'f-cert2', name: '银行函证-发函确认.pdf', type: 'file', fileType: 'pdf', meta: '已发函' },
            { id: 'f-cert3', name: '银行函证-回函.pdf', type: 'file', fileType: 'pdf', meta: '待回函' },
            { id: 'f-cert4', name: '应收账款函证-制函.xlsx', type: 'file', fileType: 'xlsx', meta: '制函中' },
            { id: 'f-cert5', name: '应收账款函证-发函确认.pdf', type: 'file', fileType: 'pdf', meta: '待发函' },
          ]
        },
        /* 工单文件夹 */
        {
          id: 'wo-root', name: '工单文件夹', type: 'template', color: '#6366F1', meta: '2个工单',
          children: [
            { id: 'f-wo1', name: '数据-账套处理工单.xlsx', type: 'file', fileType: 'xlsx', meta: '修改于 昨天' },
            { id: 'f-wo2', name: '试算-试算搭建工单.xlsx', type: 'file', fileType: 'xlsx', meta: '修改于 2天前' },
          ]
        },
        /* 送审文件夹 */
        {
          id: 'review-root', name: '送审文件夹', type: 'review', color: '#EF4444', meta: '3个子文件夹',
          children: [
            { id: 'review-sub-1', name: '2025年年报一审送审', type: 'folder', color: '#EF4444', meta: '2个文件',
              children: [
                { id: 'f-rv1', name: '审计报告初稿.docx', type: 'file', fileType: 'docx', meta: '修改于 3天前' },
                { id: 'f-rv2', name: '财务报表初稿.xlsx', type: 'file', fileType: 'xlsx', meta: '修改于 3天前' },
              ]
            },
            { id: 'review-sub-2', name: '2025年年报二审送审', type: 'folder', color: '#EF4444', meta: '1个文件',
              children: [
                { id: 'f-rv3', name: '审计报告终稿.docx', type: 'file', fileType: 'docx', meta: '修改于 1天前' },
              ]
            },
            { id: 'review-sub-3', name: '半年报一审送审', type: 'folder', color: '#EF4444', meta: '空', children: [] },
          ]
        },
        /* 计划阶段文件 */
        {
          id: 'plan-root', name: '计划阶段文件', type: 'template', color: '#10B981', meta: '已完成',
          children: [
            { id: 'f-plan1', name: '总体审计计划.xlsx', type: 'file', fileType: 'xlsx', meta: '修改于 3天前' },
            { id: 'f-plan2', name: '审计风险评估.xlsx', type: 'file', fileType: 'xlsx', meta: '修改于 3天前' },
            { id: 'f-plan3', name: '重要性水平确定.xlsx', type: 'file', fileType: 'xlsx', meta: '修改于 5天前' },
            { id: 'f-plan4', name: '审计时间安排表.xlsx', type: 'file', fileType: 'xlsx', meta: '修改于 1周前' },
          ]
        },
        /* 范围界定文件 */
        {
          id: 'scope-root', name: '范围界定文件', type: 'template', color: '#F59E0B', meta: '进行中',
          children: [
            { id: 'f-scope1', name: '重要性水平计算表.xlsx', type: 'file', fileType: 'xlsx', meta: '修改于 昨天' },
            { id: 'f-scope2', name: '了解被审计单位及环境.docx', type: 'file', fileType: 'docx', meta: '修改于 3天前' },
          ]
        },
        /* 获取证据文件 */
        {
          id: 'evidence-root', name: '获取证据文件', type: 'template', color: '#8B5CF6', meta: '进行中 · 42%',
          children: [
            { id: 'f-asset1', name: '货币资金.xlsx', type: 'file', fileType: 'xlsx', meta: '修改于 2小时前' },
            { id: 'f-asset2', name: '应收账款.xlsx', type: 'file', fileType: 'xlsx', meta: '修改于 昨天' },
            { id: 'f-asset3', name: '存货盘点表.xlsx', type: 'file', fileType: 'xlsx', meta: '修改于 昨天' },
            { id: 'f-asset4', name: '固定资产明细.xlsx', type: 'file', fileType: 'xlsx', meta: '修改于 3天前' },
            { id: 'f-liab1', name: '应付账款.xlsx', type: 'file', fileType: 'xlsx', meta: '修改于 昨天' },
            { id: 'f-liab2', name: '短期借款.xlsx', type: 'file', fileType: 'xlsx', meta: '修改于 2天前' },
          ]
        },
        /* 完成阶段文件 */
        {
          id: 'finish-root', name: '完成阶段文件', type: 'template', color: '#14B8A6', meta: '进行中',
          children: [
            { id: 'f-finish1', name: '审计差异调整汇总表.xlsx', type: 'file', fileType: 'xlsx', meta: '修改于 昨天' },
            { id: 'f-finish2', name: '管理层声明书.docx', type: 'file', fileType: 'docx', meta: '修改于 3天前' },
          ]
        },
        /* 模板文件 */
        {
          id: 'template-root', name: '模板文件', type: 'template', color: '#64748B', meta: '3个模板',
          children: [
            { id: 'f-tpl1', name: '底稿标准模板.xlsx', type: 'file', fileType: 'xlsx', meta: '系统提供' },
            { id: 'f-tpl2', name: '询证函模板.docx', type: 'file', fileType: 'docx', meta: '系统提供' },
            { id: 'f-tpl3', name: '审计报告模板.docx', type: 'file', fileType: 'docx', meta: '系统提供' },
          ]
        },
        /* 用户自建文件夹 */
        {
          id: 'uf-compA-desk', name: 'A子公司', type: 'template', color: '#F59E0B', meta: '6个子文件夹',
          children: [
            { id: 'uf-compA-plan-desk', name: '01 审计计划', type: 'template', color: '#3B82F6', meta: '2个文件', children: [
              { id: 'f-uf-a1', name: '审计计划-A子公司.docx', type: 'file', fileType: 'docx', meta: '修改于 3天前' },
              { id: 'f-uf-a2', name: '风险评估表-A子公司.xlsx', type: 'file', fileType: 'xlsx', meta: '修改于 4天前' },
            ]},
            { id: 'uf-compA-asset-desk', name: '02 资产类', type: 'template', color: '#10B981', meta: '3个文件', children: [
              { id: 'f-uf-a3', name: '货币资金-A子公司.xlsx', type: 'file', fileType: 'xlsx', meta: '修改于 昨天' },
              { id: 'f-uf-a4', name: '应收账款-A子公司.xlsx', type: 'file', fileType: 'xlsx', meta: '修改于 2天前' },
              { id: 'f-uf-a5', name: '存货盘点-A子公司.xlsx', type: 'file', fileType: 'xlsx', meta: '修改于 3天前' },
            ]},
            { id: 'uf-compA-liab-desk', name: '03 负债类', type: 'template', color: '#F59E0B', meta: '2个文件', children: [
              { id: 'f-uf-a6', name: '应付账款-A子公司.xlsx', type: 'file', fileType: 'xlsx', meta: '修改于 昨天' },
              { id: 'f-uf-a7', name: '长期借款-A子公司.xlsx', type: 'file', fileType: 'xlsx', meta: '修改于 4天前' },
            ]},
            { id: 'uf-compA-report-desk', name: '04 审计报告', type: 'template', color: '#8B5CF6', meta: '1个文件', children: [
              { id: 'f-uf-a8', name: '审计报告初稿-A子公司.docx', type: 'file', fileType: 'docx', meta: '修改于 昨天' },
            ]},
            { id: 'uf-compA-deliver-desk', name: '交付文件夹', type: 'template', color: '#14B8A6', meta: '空', children: [] },
            { id: 'uf-compA-review-desk', name: '送审文件夹', type: 'review', color: '#EF4444', meta: '空', children: [] },
          ]
        },
        {
          id: 'uf-compB-desk', name: 'B子公司', type: 'template', color: '#F59E0B', meta: '4个子文件夹',
          children: [
            { id: 'uf-compB-plan-desk', name: '01 审计计划', type: 'template', color: '#3B82F6', meta: '1个文件', children: [
              { id: 'f-uf-b1', name: '审计计划-B子公司.docx', type: 'file', fileType: 'docx', meta: '修改于 1周前' },
            ]},
            { id: 'uf-compB-asset-desk', name: '02 资产类', type: 'template', color: '#10B981', meta: '1个文件', children: [
              { id: 'f-uf-b2', name: '货币资金-B子公司.xlsx', type: 'file', fileType: 'xlsx', meta: '修改于 3天前' },
            ]},
            { id: 'uf-compB-liab-desk', name: '03 负债类', type: 'template', color: '#F59E0B', meta: '空', children: [] },
            { id: 'uf-compB-report-desk', name: '04 审计报告', type: 'template', color: '#8B5CF6', meta: '空', children: [] },
          ]
        },
        {
          id: 'uf-compC-desk', name: 'C子公司', type: 'template', color: '#F59E0B', meta: '2个子文件夹',
          children: [
            { id: 'uf-compC-plan-desk', name: '01 审计计划', type: 'template', color: '#3B82F6', meta: '空', children: [] },
            { id: 'uf-compC-asset-desk', name: '02 资产类', type: 'template', color: '#10B981', meta: '空', children: [] },
          ]
        },
      ]
    },
    /* ── 超级项目 2：YY科技IPO ── */
    {
      id: 'proj-2',
      name: '2026 YY科技IPO审计',
      type: 'project',
      color: '#10B981',
      hasLedgerLink: false,
      hasCertLink: false,
      meta: '3家子公司 · 5人团队',
      children: []
    },
    /* ── 超级项目 3：ZZ银行专项 ── */
    {
      id: 'proj-3',
      name: '2025 ZZ银行专项审计',
      type: 'project',
      color: '#F59E0B',
      hasLedgerLink: true,
      hasCertLink: false,
      meta: '已归档',
      children: []
    },
  ]
};


/* ══════════════════════════════════════════════
   2. 桌面状态管理
   ══════════════════════════════════════════════ */

/** 当前路径：从 root 到当前目录的 id 数组 */
let currentPath = ['root'];
/** 当前右键选中的项目数据（用于上下文菜单） */
let contextTarget = null;

/** 根据 id 在树中查找节点 */
function findNode(id, node = FOLDER_DATA) {
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNode(id, child);
      if (found) return found;
    }
  }
  return null;
}

/** 获取当前目录节点 */
function getCurrentNode() {
  const currentId = currentPath[currentPath.length - 1];
  return findNode(currentId);
}

/** 获取路径中每一级的节点信息（用于面包屑） */
function getPathNodes() {
  return currentPath.map(id => findNode(id)).filter(Boolean);
}


/* ══════════════════════════════════════════════
   3. SVG 图标生成器
   ══════════════════════════════════════════════ */

const SVG = {
  /** 文件夹图标（通用） */
  folder(color, size = 64) {
    const h = size * 0.8125;
    return `<svg class="folder-icon" viewBox="0 0 64 52" fill="none" width="${size}" height="${h}">
      <path d="M2 10C2 7.79 3.79 6 6 6H22L28 12H58C60.21 12 62 13.79 62 16V46C62 48.21 60.21 50 58 50H6C3.79 50 2 48.21 2 46V10Z" fill="${color}"/>
      <path d="M2 16H62V46C62 48.21 60.21 50 58 50H6C3.79 50 2 48.21 2 46V16Z" fill="${color}" opacity="0.7"/>
      <rect x="8" y="22" width="18" height="2" rx="1" fill="white" opacity="0.4"/>
      <rect x="8" y="28" width="12" height="2" rx="1" fill="white" opacity="0.3"/>
    </svg>`;
  },

  /** 函证文件夹：带印章标记 */
  certFolder(color) {
    return `<svg class="folder-icon" viewBox="0 0 64 52" fill="none">
      <path d="M2 10C2 7.79 3.79 6 6 6H22L28 12H58C60.21 12 62 13.79 62 16V46C62 48.21 60.21 50 58 50H6C3.79 50 2 48.21 2 46V10Z" fill="${color}"/>
      <path d="M2 16H62V46C62 48.21 60.21 50 58 50H6C3.79 50 2 48.21 2 46V16Z" fill="${color}" opacity="0.7"/>
      <circle cx="48" cy="36" r="10" fill="white" opacity="0.25"/>
      <path d="M44 36h8M48 32v8" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>
      <circle cx="48" cy="36" r="7" stroke="white" stroke-width="1" fill="none" opacity="0.5"/>
      <text x="20" y="36" fill="white" font-size="7" font-weight="600" opacity="0.7">函证</text>
    </svg>`;
  },

  /** 交付文件夹：带箱子标记 */
  deliveryFolder(color) {
    return `<svg class="folder-icon" viewBox="0 0 64 52" fill="none">
      <path d="M2 10C2 7.79 3.79 6 6 6H22L28 12H58C60.21 12 62 13.79 62 16V46C62 48.21 60.21 50 58 50H6C3.79 50 2 48.21 2 46V10Z" fill="${color}"/>
      <path d="M2 16H62V46C62 48.21 60.21 50 58 50H6C3.79 50 2 48.21 2 46V16Z" fill="${color}" opacity="0.7"/>
      <rect x="38" y="26" width="18" height="14" rx="2" fill="white" opacity="0.25"/>
      <path d="M42 26v-3a2 2 0 012-2h6a2 2 0 012 2v3" stroke="white" stroke-width="1.2" fill="none" opacity="0.6"/>
      <path d="M38 32h18" stroke="white" stroke-width="1" opacity="0.4"/>
      <text x="16" y="36" fill="white" font-size="7" font-weight="600" opacity="0.7">交付</text>
    </svg>`;
  },

  /** 送审文件夹：带勾选标记 */
  reviewFolder(color) {
    return `<svg class="folder-icon" viewBox="0 0 64 52" fill="none">
      <path d="M2 10C2 7.79 3.79 6 6 6H22L28 12H58C60.21 12 62 13.79 62 16V46C62 48.21 60.21 50 58 50H6C3.79 50 2 48.21 2 46V10Z" fill="${color}"/>
      <path d="M2 16H62V46C62 48.21 60.21 50 58 50H6C3.79 50 2 48.21 2 46V16Z" fill="${color}" opacity="0.7"/>
      <circle cx="48" cy="34" r="9" fill="white" opacity="0.25"/>
      <path d="M43 34l4 4 8-8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>
      <text x="16" y="36" fill="white" font-size="7" font-weight="600" opacity="0.7">送审</text>
    </svg>`;
  },

  /** 文件图标 */
  file(fileType) {
    const colors = {
      xlsx: { bg: '#10B981', light: '#D1FAE5', label: 'XLSX' },
      xls:  { bg: '#10B981', light: '#D1FAE5', label: 'XLS' },
      docx: { bg: '#3B82F6', light: '#DBEAFE', label: 'DOCX' },
      pdf:  { bg: '#EF4444', light: '#FEE2E2', label: 'PDF' },
      pptx: { bg: '#F59E0B', light: '#FEF3C7', label: 'PPTX' },
    };
    const c = colors[fileType] || colors.xlsx;
    return `<svg class="file-icon" viewBox="0 0 48 60" fill="none">
      <path d="M4 4C4 1.79 5.79 0 8 0H30L44 14V56C44 58.21 42.21 60 40 60H8C5.79 60 4 58.21 4 56V4Z" fill="#E8EBF0"/>
      <path d="M30 0L44 14H34C31.79 14 30 12.21 30 10V0Z" fill="#CBD5E1"/>
      <rect x="10" y="22" width="24" height="2.5" rx="1.25" fill="${c.bg}" opacity="0.6"/>
      <rect x="10" y="28" width="18" height="2.5" rx="1.25" fill="${c.bg}" opacity="0.4"/>
      <rect x="10" y="34" width="20" height="2.5" rx="1.25" fill="${c.bg}" opacity="0.3"/>
      <rect x="10" y="40" width="14" height="2.5" rx="1.25" fill="${c.bg}" opacity="0.2"/>
      <rect x="12" y="48" width="14" height="5" rx="2" fill="${c.bg}"/>
      <text x="19" y="52.5" text-anchor="middle" fill="white" font-size="4" font-weight="600">${c.label}</text>
    </svg>`;
  },

  /** 返回上一级图标 */
  backArrow() {
    return `<svg class="file-icon" viewBox="0 0 48 60" fill="none" style="opacity:0.5">
      <rect x="4" y="4" width="40" height="52" rx="8" fill="#E8EBF0"/>
      <path d="M28 22l-8 8 8 8" stroke="#64748B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="24" y="50" text-anchor="middle" fill="#64748B" font-size="5" font-weight="500">返回</text>
    </svg>`;
  }
};


/* ══════════════════════════════════════════════
   4. 桌面渲染引擎
   ══════════════════════════════════════════════ */

/** 渲染整个桌面 — 路径栏 + 网格 */
function renderDesktop() {
  renderPathBar();
  renderGrid();
}

/** 渲染路径栏（面包屑） */
function renderPathBar() {
  const bar = document.getElementById('desktop-path');
  if (!bar) return;

  const nodes = getPathNodes();
  bar.innerHTML = nodes.map((node, i) => {
    const isLast = i === nodes.length - 1;
    const icon = i === 0
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
      : '';
    return `
      <button class="path-item ${isLast ? 'current' : ''}" data-id="${node.id}">
        ${icon}<span>${node.name}</span>
      </button>
      ${!isLast ? '<span class="path-sep">›</span>' : ''}
    `;
  }).join('');

  // 路径栏右侧：当前目录信息
  const current = getCurrentNode();
  const childCount = current.children ? current.children.filter(c => c.children).length : 0;
  const fileCount = current.children ? current.children.filter(c => !c.children && c.type === 'file').length : 0;
  bar.innerHTML += `<span class="path-info">${childCount} 个文件夹${fileCount ? '，' + fileCount + ' 个文件' : ''}</span>`;

  // 绑定路径项点击
  bar.querySelectorAll('.path-item:not(.current)').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.id;
      const idx = currentPath.indexOf(targetId);
      if (idx !== -1) {
        currentPath = currentPath.slice(0, idx + 1);
        renderDesktop();
      }
    });
  });
}

/** 渲染桌面网格 */
function renderGrid() {
  const grid = document.getElementById('desktop-grid');
  if (!grid) return;

  const current = getCurrentNode();
  const items = current.children || [];

  let html = '';

  // 如果不在根目录，显示"返回上一级"
  if (currentPath.length > 1) {
    html += `
      <div class="desktop-item back-item" data-action="go-back">
        ${SVG.backArrow()}
        <span class="desktop-item-label">返回上一级</span>
      </div>
    `;
  }

  // 渲染每个子项
  items.forEach((item, index) => {
    if (item.type === 'file') {
      // 文件
      html += `
        <div class="desktop-item" data-type="file" data-id="${item.id}" style="animation-delay:${(index + 1) * 0.04}s">
          ${SVG.file(item.fileType || 'xlsx')}
          <span class="desktop-item-label">${item.name}</span>
        </div>
      `;
    } else {
      // 文件夹（各种类型）
      let icon = '';
      let badge = '';
      switch (item.type) {
        case 'cert':
          icon = SVG.certFolder(item.color);
          badge = '<span class="folder-badge cert-badge">函证</span>';
          break;
        case 'delivery':
          icon = SVG.deliveryFolder(item.color);
          badge = '<span class="folder-badge delivery-badge">交付</span>';
          break;
        case 'review':
          icon = SVG.reviewFolder(item.color);
          badge = '<span class="folder-badge review-badge">送审</span>';
          break;
        default:
          icon = SVG.folder(item.color);
      }

      // 关联状态角标
      let linkBadges = '';
      if (item.hasLedgerLink) {
        linkBadges += '<span class="link-dot ledger-linked" title="已关联账套"></span>';
      }
      if (item.hasCertLink) {
        linkBadges += '<span class="link-dot cert-linked" title="已关联函证"></span>';
      }

      html += `
        <div class="desktop-item" data-type="folder" data-id="${item.id}" data-folder-type="${item.type}" style="animation-delay:${(index + 1) * 0.04}s">
          <div class="folder-icon-wrap">
            ${icon}
            ${linkBadges ? `<div class="link-badges">${linkBadges}</div>` : ''}
          </div>
          ${badge}
          <span class="desktop-item-label">${item.name}</span>
          ${item.meta ? `<span class="desktop-item-meta">${item.meta}</span>` : ''}
        </div>
      `;
    }
  });

  // 空目录提示
  if (items.length === 0 && currentPath.length > 1) {
    html += `
      <div class="desktop-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.5" stroke-linecap="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
        <p>文件夹为空</p>
      </div>
    `;
  }

  grid.innerHTML = html;

  // 重新绑定交互事件
  bindDesktopEvents();
}


/* ══════════════════════════════════════════════
   5. 桌面交互事件
   ══════════════════════════════════════════════ */

function bindDesktopEvents() {
  const grid = document.getElementById('desktop-grid');
  if (!grid) return;

  const items = grid.querySelectorAll('.desktop-item');

  items.forEach(item => {
    // ── 单击选中 ──
    item.addEventListener('click', (e) => {
      if (item.dataset.action === 'go-back') {
        // 返回上一级
        if (currentPath.length > 1) {
          currentPath.pop();
          renderDesktop();
        }
        return;
      }
      // Ctrl/Cmd 多选
      if (!e.ctrlKey && !e.metaKey) {
        items.forEach(i => i.classList.remove('selected'));
      }
      item.classList.toggle('selected');
    });

    // ── 双击进入/打开 ──
    item.addEventListener('dblclick', () => {
      if (item.dataset.action === 'go-back') return; // 已在 click 中处理

      const id = item.dataset.id;
      const type = item.dataset.type;
      const node = findNode(id);
      if (!node) return;

      if (type === 'folder' && node.children) {
        // 进入文件夹
        currentPath.push(id);
        renderDesktop();
      } else if (type === 'file') {
        showNotification(`正在打开文件：${node.name}`);
      }
    });

    // ── 右键菜单 ──
    item.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const id = item.dataset.id;
      contextTarget = findNode(id);
      showDynamicContextMenu(e.clientX, e.clientY, contextTarget);
    });
  });

  // 桌面空白处右键
  const workspace = document.querySelector('.desktop-workspace');
  if (workspace) {
    workspace.addEventListener('contextmenu', (e) => {
      // 仅在空白处触发（不是子元素）
      if (e.target === workspace || e.target === grid || e.target.classList.contains('desktop-workspace')) {
        e.preventDefault();
        contextTarget = null;
        showDynamicContextMenu(e.clientX, e.clientY, null);
      }
    });

    // 空白处点击取消选中
    workspace.addEventListener('click', (e) => {
      if (e.target === workspace || e.target === grid) {
        grid.querySelectorAll('.desktop-item').forEach(i => i.classList.remove('selected'));
      }
    });
  }
}


/* ══════════════════════════════════════════════
   6. 动态右键上下文菜单
   根据目录类型 + 关联状态生成不同菜单项
   ══════════════════════════════════════════════ */

function showDynamicContextMenu(x, y, target) {
  const menu = document.getElementById('context-menu');
  if (!menu) return;

  // 生成菜单内容
  let menuHtml = '';

  if (!target) {
    /* ── 空白桌面右键 ── */
    menuHtml = `
      ${menuItem('new-folder', '新建文件夹', iconSvg.newFolder)}
      ${menuItem('upload', '上传文件', iconSvg.upload)}
      ${menuDivider()}
      ${menuItem('refresh', '刷新', iconSvg.refresh)}
      ${menuItem('paste', '粘贴', iconSvg.paste)}
      ${menuDivider()}
      ${menuItem('desktop-settings', '桌面设置', iconSvg.settings)}
    `;
  } else if (target.type === 'file') {
    /* ── 文件右键 ── */
    menuHtml = `
      ${menuItem('open-file', '打开', iconSvg.open)}
      ${menuItem('download', '下载', iconSvg.download)}
      ${menuDivider()}
      ${menuItem('rename', '重命名', iconSvg.rename)}
      ${menuItem('copy', '复制', iconSvg.copy)}
      ${menuItem('move', '移动到...', iconSvg.move)}
      ${menuDivider()}
      ${menuItem('delete', '删除', iconSvg.trash, 'danger')}
    `;
  } else {
    /* ── 文件夹右键（根据类型和关联状态） ── */
    menuHtml = `${menuItem('open-folder', '打开', iconSvg.open)}`;

    // 账套关联快捷操作
    if (target.type === 'project' || target.type === 'company') {
      menuHtml += menuDivider();
      menuHtml += menuSectionHeader('账套');
      if (target.hasLedgerLink) {
        menuHtml += menuItem('quick-ledger', '快捷查账套', iconSvg.ledgerLinked, 'linked');
      } else {
        menuHtml += menuItem('link-ledger', '关联账套', iconSvg.linkLedger, 'unlinked');
      }
    }

    // 函证中心快捷操作
    if (target.type === 'project' || target.type === 'company') {
      menuHtml += menuSectionHeader('函证');
      if (target.hasCertLink) {
        menuHtml += menuItem('quick-cert', '快捷查函证', iconSvg.certLinked, 'linked');
      } else {
        menuHtml += menuItem('link-cert', '关联函证项目', iconSvg.linkCert, 'unlinked');
      }
    }

    // 函证文件夹特有操作
    if (target.type === 'cert') {
      menuHtml += menuDivider();
      menuHtml += menuItem('cert-detail', '查看函证详情', iconSvg.certLinked);
      menuHtml += menuItem('cert-export', '导出函证包', iconSvg.download);
    }

    // 交付文件夹特有操作
    if (target.type === 'delivery') {
      menuHtml += menuDivider();
      menuHtml += menuItem('delivery-detail', '查看交付详情', iconSvg.delivery);
      menuHtml += menuItem('delivery-progress', '交付进度', iconSvg.progress);
    }

    // 送审文件夹特有操作
    if (target.type === 'review') {
      menuHtml += menuDivider();
      menuHtml += menuItem('start-review', '发起预审单', iconSvg.review);
      menuHtml += menuItem('review-map', '送审映射', iconSvg.mapping);
    }

    // 公司主体特有操作
    if (target.type === 'company') {
      menuHtml += menuDivider();
      menuHtml += menuSectionHeader('任务');
      menuHtml += menuItem('create-cert-task', '发起制函任务', iconSvg.certLinked);
      menuHtml += menuItem('create-delivery-task', '发起交付任务', iconSvg.delivery);
    }

    // 通用文件夹操作
    menuHtml += menuDivider();
    menuHtml += menuItem('rename', '重命名', iconSvg.rename);
    menuHtml += menuItem('folder-props', '属性', iconSvg.info);
  }

  menu.innerHTML = menuHtml;

  // 定位并显示
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
  menu.classList.add('visible');

  // 防溢出
  requestAnimationFrame(() => {
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) menu.style.left = (x - rect.width) + 'px';
    if (rect.bottom > window.innerHeight) menu.style.top = (y - rect.height) + 'px';
  });

  // 绑定菜单项事件
  menu.querySelectorAll('.context-menu-item').forEach(item => {
    item.addEventListener('click', () => {
      handleMenuAction(item.dataset.action, target);
      menu.classList.remove('visible');
    });
  });
}

/** 菜单项 HTML 模板 */
function menuItem(action, label, icon, style = '') {
  const cls = style === 'danger' ? ' context-menu-danger' : style === 'linked' ? ' context-menu-linked' : style === 'unlinked' ? ' context-menu-unlinked' : '';
  return `<div class="context-menu-item${cls}" data-action="${action}">${icon}<span>${label}</span></div>`;
}
function menuDivider() {
  return '<div class="context-menu-divider"></div>';
}
function menuSectionHeader(text) {
  return `<div class="context-menu-section">${text}</div>`;
}

/** 菜单中使用的小图标 */
const iconSvg = {
  open: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
  newFolder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
  paste: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
  rename: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  move: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  ledgerLinked: '<svg viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
  linkLedger: '<svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><line x1="1" y1="1" x2="23" y2="23" stroke="#EF4444" stroke-width="1.5" opacity="0.5"/></svg>',
  certLinked: '<svg viewBox="0 0 24 24" fill="none" stroke="#EC4899" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><circle cx="12" cy="16" r="3"/><path d="M12 13v-2"/></svg>',
  linkCert: '<svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>',
  delivery: '<svg viewBox="0 0 24 24" fill="none" stroke="#14B8A6" stroke-width="2" stroke-linecap="round"><rect x="1" y="6" width="22" height="12" rx="2"/><path d="M1 10h22"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  progress: '<svg viewBox="0 0 24 24" fill="none" stroke="#14B8A6" stroke-width="2" stroke-linecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
  review: '<svg viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  mapping: '<svg viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2" stroke-linecap="round"><rect x="2" y="3" width="8" height="7" rx="1"/><rect x="14" y="14" width="8" height="7" rx="1"/><path d="M6 10v2a2 2 0 0 0 2 2h6a2 2 0 0 1 2 2v2"/></svg>',
  uploadLedger: '<svg viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2" stroke-linecap="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><polyline points="16 17 12 13 8 17" stroke="white" stroke-width="1.5"/><line x1="12" y1="13" x2="12" y2="20" stroke="white" stroke-width="1.5"/></svg>',
  uploadFolder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><polyline points="16 13 12 9 8 13"/><line x1="12" y1="9" x2="12" y2="17"/></svg>',
  scissors: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  fileShare: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><circle cx="15" cy="16" r="2"/><circle cx="9" cy="16" r="2"/><line x1="10.8" y1="15.2" x2="13.2" y2="16.8"/></svg>',
  versions: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="8" y="2" width="13" height="18" rx="2"/><path d="M3 6h2v14h11"/></svg>',
  log: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  unlock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>',
};

/* ── 文件目录树通用右键菜单 ── */
/* type: 'root' | 'top-folder' | 'vendor-sub' | 'user-folder' | 'review-sub' */
function showTreeFolderContextMenu(x, y, folderName, type, folderId) {
  const menu = document.getElementById('context-menu');
  if (!menu) return;

  let items = '';
  if (type === 'root') {
    items = menuItem('new-subfolder', '新建子文件夹', iconSvg.newFolder);
  } else if (type === 'user-folder') {
    items = [
      menuItem('new-subfolder', '新建子文件夹', iconSvg.newFolder),
      menuItem('upload-file', '上传文件', iconSvg.upload),
      menuItem('upload-folder', '上传文件夹', iconSvg.uploadFolder),
      menuDivider(),
      menuItem('rename', '重命名', iconSvg.rename),
      menuItem('delete', '删除', iconSvg.trash, 'danger'),
    ].join('');
  } else if (type === 'review-sub') {
    items = [
      menuItem('new-subfolder', '新建子文件夹', iconSvg.newFolder),
      menuItem('upload-file', '上传文件', iconSvg.upload),
      menuItem('upload-folder', '上传文件夹', iconSvg.uploadFolder),
      menuDivider(),
      menuItem('rename', '重命名', iconSvg.rename),
      menuItem('delete', '删除', iconSvg.trash, 'danger'),
    ].join('');
  } else {
    items = [
      menuItem('new-subfolder', '新建子文件夹', iconSvg.newFolder),
      menuItem('upload-file', '上传文件', iconSvg.upload),
      menuItem('upload-folder', '上传文件夹', iconSvg.uploadFolder),
    ].join('');
  }

  menu.innerHTML = `
    <div class="context-menu-section vendor-name">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="12" height="12" style="display:inline;margin-right:4px;vertical-align:middle;">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>${folderName}
    </div>
    ${items}`;

  menu.style.left = x + 'px';
  menu.style.top  = y + 'px';
  menu.classList.add('visible');

  requestAnimationFrame(() => {
    const rect = menu.getBoundingClientRect();
    if (rect.right  > window.innerWidth)  menu.style.left = (x - rect.width)  + 'px';
    if (rect.bottom > window.innerHeight) menu.style.top  = (y - rect.height) + 'px';
  });

  menu.querySelectorAll('.context-menu-item').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      if (action === 'new-subfolder') {
        treeCreateSubFolder(folderName, type, folderId);
      } else if (action === 'upload-file') {
        treeUploadFile(folderName, type, folderId);
      } else if (action === 'upload-folder') {
        showNotification(`上传文件夹到「${folderName}」`);
      } else if (action === 'rename') {
        showNotification(`重命名「${folderName}」`);
      } else if (action === 'delete') {
        treeDeleteFolder(folderName, type, folderId);
      }
      menu.classList.remove('visible');
    });
  });
}

/* ── 新建子文件夹（弹窗输入名称后创建） ── */
function treeCreateSubFolder(parentName, parentType, parentFolderId) {
  let overlay = document.getElementById('tree-input-overlay');
  if (overlay) overlay.remove();

  overlay = document.createElement('div');
  overlay.id = 'tree-input-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.35);z-index:9999;display:flex;align-items:center;justify-content:center;';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:12px;padding:24px;width:380px;box-shadow:0 20px 60px rgba(0,0,0,0.25);">
      <h3 style="margin:0 0 6px;font-size:15px;font-weight:600;">新建子文件夹</h3>
      <p style="margin:0 0 14px;font-size:13px;color:#6B7280;">在「${parentName}」下新建</p>
      <input id="tree-new-folder-input" type="text" placeholder="请输入文件夹名称"
        style="width:100%;padding:9px 12px;border:1px solid #D1D5DB;border-radius:8px;font-size:13px;box-sizing:border-box;outline:none;" />
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px;">
        <button id="tree-new-folder-cancel" style="padding:7px 18px;border:1px solid #D1D5DB;border-radius:8px;background:#fff;cursor:pointer;font-size:13px;">取消</button>
        <button id="tree-new-folder-ok" style="padding:7px 18px;border:none;border-radius:8px;background:#4F46E5;color:#fff;cursor:pointer;font-size:13px;font-weight:500;">确定</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const inp = document.getElementById('tree-new-folder-input');
  inp.focus();

  const close = () => overlay.remove();
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.getElementById('tree-new-folder-cancel').addEventListener('click', close);

  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') document.getElementById('tree-new-folder-ok').click(); });

  document.getElementById('tree-new-folder-ok').addEventListener('click', () => {
    const name = inp.value.trim();
    if (!name) { inp.style.borderColor = '#EF4444'; return; }
    close();
    doCreateSubFolder(name, parentName, parentType, parentFolderId);
  });
}

function doCreateSubFolder(name, parentName, parentType, parentFolderId) {
  const newId = 'dyn-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
  const newFolder = { id: newId, label: name, color: '#6B7280', children: [], files: [] };

  if (parentType === 'root') {
    USER_FOLDERS.push(newFolder);
  } else if (parentType === 'user-folder') {
    const found = findUserFolderByName(USER_FOLDERS, parentName);
    if (found) {
      if (!found.children) found.children = [];
      found.children.push(newFolder);
    } else {
      USER_FOLDERS.push(newFolder);
    }
  } else if (parentType === 'review-sub') {
    /* review sub-folder: add child under matching review sub-folder — not typical, but handle gracefully */
    USER_FOLDERS.push(newFolder);
  } else if (parentType === 'top-folder') {
    const df = DETAIL_FOLDERS.find(f => f.label === parentName);
    if (df && df.id === 'review') {
      REVIEW_SUB_FOLDERS.push({ id: newId, label: name, color: '#EF4444', files: [] });
      DETAIL_FILES[newId] = [];
    } else {
      USER_FOLDERS.push(newFolder);
    }
  } else if (parentType === 'vendor-sub') {
    USER_FOLDERS.push(newFolder);
  }

  DETAIL_FILES[newId] = [];

  if (currentDetailWs) renderDetailFileTree(currentDetailWs);
  showNotification(`已在「${parentName}」下创建文件夹「${name}」`);
}

function findUserFolderByName(folders, name) {
  for (const f of folders) {
    if (f.label === name) return f;
    if (f.children) {
      const found = findUserFolderByName(f.children, name);
      if (found) return found;
    }
  }
  return null;
}

/* ── 上传文件（选择本地文件后添加到文件列表） ── */
function treeUploadFile(folderName, type, folderId) {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  input.style.display = 'none';
  document.body.appendChild(input);

  input.addEventListener('change', () => {
    const files = Array.from(input.files || []);
    if (!files.length) { input.remove(); return; }

    const targetId = resolveTreeFolderId(folderName, type, folderId);
    if (!DETAIL_FILES[targetId]) DETAIL_FILES[targetId] = [];

    const now = new Date();
    const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    files.forEach(file => {
      const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
      const sizeKB = file.size / 1024;
      const sizeStr = sizeKB >= 1024 ? (sizeKB / 1024).toFixed(1) + ' MB' : Math.round(sizeKB) + ' KB';
      DETAIL_FILES[targetId].push({
        name: file.name,
        size: sizeStr,
        modAt: ts,
        modBy: '当前用户',
        version: 'V1',
        ext: ext,
      });
    });

    if (currentDetailWs) renderDetailFileTree(currentDetailWs);
    showFolderContent(targetId, folderName);
    showNotification(`已上传 ${files.length} 个文件到「${folderName}」`);
    input.remove();
  });

  input.click();
}

function resolveTreeFolderId(folderName, type, folderId) {
  if (folderId) return folderId;
  const df = DETAIL_FOLDERS.find(f => f.label === folderName);
  if (df) return df.id;
  const vl = LEDGER_VENDORS.find(v => v.name === folderName);
  if (vl) return 'ledger-vendor-' + vl.name;
  const rsf = REVIEW_SUB_FOLDERS.find(sf => sf.label === folderName);
  if (rsf) return rsf.id;
  const uf = findUserFolderByName(USER_FOLDERS, folderName);
  if (uf) return uf.id;
  return 'unknown-' + folderName;
}

/* ── 删除文件夹（含送审文件夹关联保护） ── */
function treeDeleteFolder(folderName, type, folderId) {
  if (type === 'review-sub' && folderId) {
    const usedIds = (typeof rcGetUsedFolderIds === 'function') ? rcGetUsedFolderIds() : new Set();
    if (usedIds.has(folderId)) {
      showNotification(`「${folderName}」已关联送审单，无法删除`);
      return;
    }
    const idx = REVIEW_SUB_FOLDERS.findIndex(sf => sf.id === folderId);
    if (idx >= 0) {
      REVIEW_SUB_FOLDERS.splice(idx, 1);
      delete DETAIL_FILES[folderId];
    }
    if (currentDetailWs) renderDetailFileTree(currentDetailWs);
    showNotification(`已删除「${folderName}」`);
    return;
  }

  if (type === 'user-folder') {
    removeUserFolderByName(USER_FOLDERS, folderName);
    if (currentDetailWs) renderDetailFileTree(currentDetailWs);
    showNotification(`已删除「${folderName}」`);
    return;
  }

  showNotification(`已删除「${folderName}」`);
}

function removeUserFolderByName(folders, name) {
  for (let i = 0; i < folders.length; i++) {
    if (folders[i].label === name) { folders.splice(i, 1); return true; }
    if (folders[i].children && removeUserFolderByName(folders[i].children, name)) return true;
  }
  return false;
}

/* ── 文件列表行右键菜单工具栏 ── */
function ctxToolbar(actions) {
  return `<div class="ctx-toolbar">${actions.map(a =>
    `<button class="ctx-toolbar-btn" data-action="${a.action}" title="${a.label}">${a.icon}</button>`
  ).join('')}</div>`;
}

/* 带子菜单箭头的菜单项 */
function menuItemSub(action, label, icon) {
  return `<div class="context-menu-item" data-action="${action}">${icon}<span>${label}</span><svg class="ctx-arrow" viewBox="0 0 24 24" fill="currentColor" width="10" height="10"><path d="M8 5l8 7-8 7z"/></svg></div>`;
}

/* 带提示图标的菜单项 */
function menuItemInfo(action, label, icon) {
  return `<div class="context-menu-item" data-action="${action}">${icon}<span>${label}</span><svg class="ctx-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></div>`;
}

/* ── 文件行右键菜单 ── */
function showFileRowContextMenu(x, y, fileName) {
  const menu = document.getElementById('context-menu');
  if (!menu) return;

  menu.innerHTML = `
    ${ctxToolbar([
      { action: 'cut',    label: '剪切', icon: iconSvg.scissors },
      { action: 'copy',   label: '复制', icon: iconSvg.copy },
      { action: 'rename', label: '重命名', icon: iconSvg.rename },
      { action: 'delete', label: '删除', icon: iconSvg.trash },
    ])}
    ${menuItem('download', '下载', iconSvg.download)}
    ${menuItemSub('send-chat', '发送到聊天', iconSvg.chat)}
    ${menuItem('ext-share', '外链分享', iconSvg.share)}
    ${menuItem('ext-share-log', '外链分享记录', iconSvg.clock)}
    ${menuDivider()}
    ${menuItem('file-share-log', '文件分享记录', iconSvg.fileShare)}
    ${menuItem('upload-new-ver', '上传新版本', iconSvg.upload)}
    ${menuItem('versions', '版本', iconSvg.versions)}
    ${menuItem('properties', '属性', iconSvg.info)}
    ${menuDivider()}
    ${menuItem('op-log', '操作日志', iconSvg.log)}
    ${menuDivider()}
    ${menuItemInfo('lock', '锁定', iconSvg.lock)}`;

  positionContextMenu(menu, x, y);
  bindCtxMenuActions(menu, fileName);
}

/* ── 文件夹行右键菜单（文件列表中的子文件夹） ── */
function showFolderRowContextMenu(x, y, folderName) {
  const menu = document.getElementById('context-menu');
  if (!menu) return;

  menu.innerHTML = `
    ${ctxToolbar([
      { action: 'cut',    label: '剪切', icon: iconSvg.scissors },
      { action: 'copy',   label: '复制', icon: iconSvg.copy },
      { action: 'rename', label: '重命名', icon: iconSvg.rename },
      { action: 'delete', label: '删除', icon: iconSvg.trash },
    ])}
    ${menuItem('open-folder', '打开', iconSvg.open)}
    ${menuItem('download', '下载', iconSvg.download)}
    ${menuItemSub('send-chat', '发送到聊天', iconSvg.chat)}
    ${menuItem('ext-share', '外链分享', iconSvg.share)}
    ${menuItem('ext-share-log', '外链分享记录', iconSvg.clock)}
    ${menuDivider()}
    ${menuItem('file-share-log', '文件分享记录', iconSvg.fileShare)}
    ${menuItem('properties', '属性', iconSvg.info)}
    ${menuDivider()}
    ${menuItem('op-log', '操作日志', iconSvg.log)}
    ${menuDivider()}
    ${menuItemInfo('batch-unlock', '批量解锁', iconSvg.unlock)}`;

  positionContextMenu(menu, x, y);
  bindCtxMenuActions(menu, folderName);
}

/* 定位右键菜单（通用） */
function positionContextMenu(menu, x, y) {
  menu.style.left = x + 'px';
  menu.style.top  = y + 'px';
  menu.classList.add('visible');
  requestAnimationFrame(() => {
    const rect = menu.getBoundingClientRect();
    if (rect.right  > window.innerWidth)  menu.style.left = (x - rect.width)  + 'px';
    if (rect.bottom > window.innerHeight) menu.style.top  = (y - rect.height) + 'px';
  });
}

/* 绑定右键菜单条目点击（通用） */
function bindCtxMenuActions(menu, name) {
  menu.querySelectorAll('.context-menu-item, .ctx-toolbar-btn').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      const labels = {
        cut: '剪切', copy: '复制', rename: '重命名', delete: '删除',
        download: '下载', 'send-chat': '发送到聊天', 'ext-share': '外链分享',
        'ext-share-log': '外链分享记录', 'file-share-log': '文件分享记录',
        'upload-new-ver': '上传新版本', versions: '版本', properties: '属性',
        'op-log': '操作日志', lock: '锁定', 'batch-unlock': '批量解锁',
        'open-folder': '打开',
      };
      showNotification(`${labels[action] || action}：${name}`);
      menu.classList.remove('visible');
    });
  });
}

/* ── 为文件列表tbody绑定右键 ── */
function bindFileListContextMenu() {
  const tbody = document.getElementById('pd-file-tbody');
  if (!tbody) return;
  tbody.querySelectorAll('tr[data-row-type]').forEach(tr => {
    tr.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const name = tr.dataset.rowName || '';
      if (tr.dataset.rowType === 'folder') {
        showFolderRowContextMenu(e.clientX, e.clientY, name);
      } else {
        showFileRowContextMenu(e.clientX, e.clientY, name);
      }
    });
  });
}

/* 打开轻量账套上传弹窗（供应商右键专用）*/
function openLedgerUploadForVendor(vendorName) {
  const modal = document.getElementById('vendor-upload-modal');
  if (!modal) return;
  /* 更新副标题：显示当前供应商 */
  const subtitle = document.getElementById('vup-subtitle');
  if (subtitle) subtitle.textContent = `上传目标：${vendorName}`;
  /* 重置上传区状态 */
  resetVendorUploadModal();
  /* 打开 */
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

/* ── 供应商账套上传弹窗初始化（仅绑定一次）── */
function initVendorUploadModal() {
  const modal    = document.getElementById('vendor-upload-modal');
  const zone     = document.getElementById('vup-zone');
  const fileInput = document.getElementById('vup-file-input');
  const fileList = document.getElementById('vup-file-list');
  if (!modal) return;

  /* 关闭弹窗 */
  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  document.getElementById('vup-close')?.addEventListener('click', closeModal);
  document.getElementById('vup-cancel')?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  /* 点击选择文件 */
  document.getElementById('vup-select-file')?.addEventListener('click', () => fileInput?.click());
  zone?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', () => {
    if (fileInput.files?.length) renderVupFileList(Array.from(fileInput.files), fileList);
  });

  /* 拖拽上传 */
  zone?.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragging'); });
  zone?.addEventListener('dragleave', () => zone.classList.remove('dragging'));
  zone?.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragging');
    const files = Array.from(e.dataTransfer?.files || [])
      .filter(f => /\.(zip|rar|7z)$/i.test(f.name));
    if (files.length) renderVupFileList(files, fileList);
  });

  /* 上传按钮 */
  document.getElementById('vup-upload')?.addEventListener('click', () => {
    if (!fileList.querySelector('.lc-file-item')) {
      showNotification('请先选择要上传的账套文件');
      zone?.classList.add('shake-once');
      setTimeout(() => zone?.classList.remove('shake-once'), 400);
      return;
    }
    closeModal();
    showNotification('账套正在上传中，请稍后');
  });
}

/* 渲染已选文件列表 */
function renderVupFileList(files, listEl) {
  if (!listEl) return;
  listEl.innerHTML = files.map(f => `
    <div class="lc-file-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" width="16" height="16">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>
      <span class="lc-file-name">${f.name}</span>
      <span class="lc-file-size">${(f.size / 1024 / 1024).toFixed(1)} MB</span>
    </div>`).join('');
}

/* 重置上传区到初始状态 */
function resetVendorUploadModal() {
  const fileInput = document.getElementById('vup-file-input');
  const fileList  = document.getElementById('vup-file-list');
  if (fileInput) fileInput.value = '';
  if (fileList)  fileList.innerHTML = '';
  document.getElementById('vup-zone')?.classList.remove('dragging');
}

/** 菜单动作处理 */
function handleMenuAction(action, target) {
  const name = target?.name || '';
  switch (action) {
    // 通用
    case 'open-folder':
      if (target && target.children) { currentPath.push(target.id); renderDesktop(); }
      break;
    case 'open-file':
      showNotification(`正在打开：${name}`);
      break;
    case 'new-folder':
      showNotification('新建文件夹');
      break;
    case 'upload':
      showNotification('上传文件');
      break;
    case 'refresh':
      renderDesktop();
      showNotification('已刷新');
      break;
    case 'download':
      showNotification(`正在下载：${name}`);
      break;
    case 'rename':
      showNotification(`重命名：${name}`);
      break;
    case 'delete':
      showNotification(`删除：${name}`);
      break;
    case 'copy':
      showNotification(`已复制：${name}`);
      break;

    // 账套关联
    case 'quick-ledger':
      showNotification(`正在跳转查看「${name}」的关联账套...`);
      break;
    case 'link-ledger':
      showNotification(`为「${name}」关联账套 — 请选择数据池中的账套`);
      // 模拟关联成功
      if (target) { target.hasLedgerLink = true; renderDesktop(); }
      break;

    // 函证关联
    case 'quick-cert':
      showNotification(`正在跳转查看「${name}」的函证项目...`);
      break;
    case 'link-cert':
      showNotification(`为「${name}」关联函证项目 — 请从函证中心选择`);
      if (target) { target.hasCertLink = true; renderDesktop(); }
      break;

    // 函证文件夹
    case 'cert-detail':
      showNotification(`查看函证详情：${name}`);
      break;
    case 'cert-export':
      showNotification(`导出函证包：${name}`);
      break;

    // 交付文件夹
    case 'delivery-detail':
      showNotification(`查看交付详情：${name}`);
      break;
    case 'delivery-progress':
      showNotification(`查看交付进度：${name}`);
      break;

    // 送审
    case 'start-review':
      showNotification(`发起预审单：${name}`);
      break;
    case 'review-map':
      showNotification(`打开送审映射界面`);
      break;

    // 任务
    case 'create-cert-task':
      showNotification(`为「${name}」发起制函任务`);
      break;
    case 'create-delivery-task':
      showNotification(`为「${name}」发起交付任务`);
      break;

    default:
      showNotification(action);
  }
}


/* ══════════════════════════════════════════════
   7. 初始化入口
   ══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // 渲染桌面文件系统
  renderDesktop();

  // 全局点击关闭右键菜单
  document.addEventListener('click', () => {
    document.getElementById('context-menu')?.classList.remove('visible');
  });

  // 其他模块初始化
  initViewToggle();
  initFileTree();
  initAIPanel();
  initDock();
  initSidebarNav();
  initTabs();
  initCreateWorkspaceModal();
  initWorkspaceDetailModal();
  initVendorUploadModal();
  initProjectDetail();
  initLedgerAssocModal();
  initCustomerFilters();
  initAddCustomerModal();
  initGroupAutocomplete();
  initBatchImportModal();
  initLedgerFilters();
  /* 默认显示仪表盘 */
  renderDashboard();
});


/* ══════════════════════════════════════════════
   8. 其他模块（视图切换 / 文件树 / AI / Dock 等）
   ══════════════════════════════════════════════ */

/* ── 视图切换 ── */
function initViewToggle() {
  const toggleBtns = document.querySelectorAll('.view-toggle-btn');
  const fileView = document.getElementById('file-view');
  const businessView = document.getElementById('business-view');

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.view;
      toggleBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll(`.view-toggle-btn[data-view="${target}"]`).forEach(b => b.classList.add('active'));
      document.querySelectorAll(`.view-toggle-btn:not([data-view="${target}"])`).forEach(b => b.classList.remove('active'));

      if (target === 'file') {
        fileView.classList.add('active');
        businessView.classList.remove('active');
      } else {
        businessView.classList.add('active');
        fileView.classList.remove('active');
      }
    });
  });
}

/* ── 文件树 ── */
function initFileTree() {
  document.querySelectorAll('.tree-node-row').forEach(row => {
    row.addEventListener('click', () => {
      const node = row.closest('.tree-node');
      const toggle = row.querySelector('.tree-toggle');
      const children = node.querySelector('.tree-children');
      if (children) {
        children.style.display = children.style.display === 'none' ? 'block' : 'none';
        toggle?.classList.toggle('expanded');
      }
      document.querySelectorAll('.tree-node-row').forEach(r => r.classList.remove('active'));
      row.classList.add('active');
      const label = row.querySelector('.tree-label')?.textContent;
      if (label) updateWorkArea(label);
    });
  });
}

/* ── AI 面板 ── */
function initAIPanel() {
  /* 关闭面板按钮 */
  document.querySelectorAll('.ai-panel-close').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.ai-panel').classList.add('collapsed'));
  });

  /* Tab 切换：消息 / 工作地图 */
  document.querySelectorAll('.ai-panel-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const panel = tab.closest('.ai-panel');
      const target = tab.dataset.tab;
      panel.querySelectorAll('.ai-panel-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      panel.querySelectorAll('.ai-tab-content').forEach(c => c.classList.remove('active'));
      panel.querySelector(`[data-tab-content="${target}"]`)?.classList.add('active');
    });
  });

  /* 打开面板快捷键 */
  document.querySelectorAll('[data-action="open-ai"]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ai-panel').forEach(p => { p.classList.remove('collapsed'); p.classList.add('visible'); });
    });
  });

  /* 初始化 IM 模块 */
  initIM();
}

/* ── Dock ── */
function initDock() {
  document.querySelectorAll('.dock-item').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      if (action === 'open-ai') {
        document.querySelectorAll('.ai-panel').forEach(p => { p.classList.remove('collapsed'); p.classList.add('visible'); });
      } else if (action === 'link-ledger') {
        showNotification('打开关联账套功能');
      } else if (action === 'work-order') {
        document.querySelector('.view-toggle-btn[data-view="business"]')?.click();
        setTimeout(() => document.querySelector('.biz-tab[data-tab="orders"]')?.click(), 300);
      } else if (action === 'submit-review') {
        rcOpenSubmitReview();
      } else if (action === 'settings') {
        showNotification('打开平台设置');
      }
    });
  });
}

/* ── 侧边栏 ── */
function initSidebarNav() {
  /* 所有业务面板 ID 列表，切换时统一隐藏 */
  const ALL_PANELS = [
    'biz-panel-dashboard',
    'biz-panel-projects',
    'biz-panel-project-detail',
    'biz-panel-ledger',
    'biz-panel-customers',
    'biz-panel-orders',
    'biz-panel-riskctl',
    'biz-panel-settings',
  ];

  function hideAllPanels() {
    ALL_PANELS.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  }

  document.querySelectorAll('.sidebar-item[data-nav]').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-item[data-nav]').forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const nav = item.dataset.nav;
      hideAllPanels();

      if (nav === 'projects') {
        document.getElementById('biz-panel-projects').style.display = 'flex';
        renderWorkspaceView();
      } else if (nav === 'dashboard') {
        document.getElementById('biz-panel-dashboard').style.display = 'flex';
        renderDashboard();
      } else if (nav === 'data') {
        document.getElementById('biz-panel-ledger').style.display = 'flex';
        renderLedgerTable();
      } else if (nav === 'customers') {
        document.getElementById('biz-panel-customers').style.display = 'flex';
        renderCustomerTable();
      } else if (nav === 'orders') {
        document.getElementById('biz-panel-orders').style.display = 'flex';
        initGd();
      } else if (nav === 'riskctl') {
        document.getElementById('biz-panel-riskctl').style.display = 'flex';
        initRc();
      } else if (nav === 'settings') {
        document.getElementById('biz-panel-settings').style.display = 'flex';
        initSm();
      } else {
        /* 其他模块暂显示仪表盘占位 */
        document.getElementById('biz-panel-dashboard').style.display = 'flex';
      }
    });
  });
}

/* ── Tabs ── */
function initTabs() {
  document.querySelectorAll('.biz-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      tab.closest('.biz-tabs').querySelectorAll('.biz-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
}

/* ── 辅助函数 ── */
function showNotification(message) {
  const n = document.createElement('div');
  n.style.cssText = `position:fixed;top:20px;right:20px;background:rgba(0,0,0,0.85);color:white;padding:12px 20px;border-radius:10px;font-size:13px;z-index:999;animation:slideInRight 0.3s cubic-bezier(0.16,1,0.3,1);backdrop-filter:blur(10px);max-width:360px;line-height:1.5;`;
  n.textContent = message;
  document.body.appendChild(n);
  setTimeout(() => { n.style.opacity = '0'; n.style.transition = 'opacity 0.3s'; setTimeout(() => n.remove(), 300); }, 2500);
}

/* ══════════════════════════════════════════════
   9. 工作区模块
   数据模型 + 卡片渲染 + 筛选 + 视图切换
   ══════════════════════════════════════════════ */

/* ── 9a-0. 四阶段进度模拟数据（对应 WORKSPACE_DATA id）──
   每条数组顺序: [计划阶段%, 范围界定阶段%, 获取证据%, 完成阶段%]  */
const PHASE_PROGRESS = {
  'ws-001': [100, 78, 35,  0 ],   // 执行中 - 范围界定进行中
  'ws-002': [100, 100, 60, 18],   // 送审中 - 获取证据尾声
  'ws-003': [100, 62, 20,  0 ],   // 执行中 - 范围界定进行中
  'ws-004': [100, 90, 45,  5 ],   // 执行中 - 获取证据进行中
  'ws-005': [100, 100, 92, 74],   // 送审中 - 近完成阶段
  'ws-006': [100, 73, 28,  0 ],   // 执行中 - 范围界定进行中
};

/* ── 9a. 工作区模拟数据 ── */
const WORKSPACE_DATA = [
  {
    id: 'ws-001',
    starred: true,
    name: '中国比亚迪-年度审计-2025年度-审计一部-001',
    status: '执行中',
    group: '中国比亚迪',
    entity: '比亚迪汽车（广东）有限公司',
    bizType: '年报审计',
    period: '2025-01-01 至 2025-12-31',
    year: '2025',
    manager: '张伟',
    dept: '审计一部',
    firmCode: 'AUDIT-2025-HDA-001',
    totalCode: 'HQ-2025-HD-88801',
    reportType: '合并',
    projectEntities: [
      '比亚迪汽车（广东）有限公司',
      '中国比亚迪有限公司',
      '比亚迪新材料有限公司',
    ],
    bindingRows: [
      { name: '比亚迪汽车（广东）有限公司', reportType: '合并', firmCode: 'HQ-2025-HD-88801', firmManager: '张伟' },
      { name: '中国比亚迪有限公司',         reportType: '单体', firmCode: 'HQ-2025-HD-88802', firmManager: '张伟' },
      { name: '比亚迪新材料有限公司',       reportType: '单体', firmCode: 'HQ-2025-HD-88803', firmManager: '张伟' },
    ],
    assocMap: {
      '比亚迪汽车（广东）有限公司': {
        'LS009|2': { ledgerId: 'LS009', version: 2, startPeriod: '2025-01', endPeriod: '2025-12' },
        'LS010|1': { ledgerId: 'LS010', version: 1, startPeriod: '2024-01', endPeriod: '2024-12' },
      },
      '中国比亚迪有限公司': {
        'LS011|2': { ledgerId: 'LS011', version: 2, startPeriod: '2025-01', endPeriod: '2025-12' },
        'LS012|1': { ledgerId: 'LS012', version: 1, startPeriod: '2024-01', endPeriod: '2024-12' },
      },
      '比亚迪新材料有限公司': {
        'LS013|2': { ledgerId: 'LS013', version: 2, startPeriod: '2025-01', endPeriod: '2025-12' },
        'LS014|1': { ledgerId: 'LS014', version: 1, startPeriod: '2024-01', endPeriod: '2024-12' },
      },
    },
    updatedAt: '2026-03-10 14:32',
    updatedBy: '李明',
  },
  {
    id: 'ws-002',
    starred: true,
    name: '中国石化集团-年度审计-2025年度-审计二部-002',
    status: '送审中',
    group: '中国石化集团',
    entity: '中国石油化工股份有限公司',
    bizType: '年报审计',
    period: '2025-01-01 至 2025-12-31',
    year: '2025',
    manager: '王芳',
    dept: '审计二部',
    firmCode: 'AUDIT-2025-SIN-002',
    totalCode: '',
    reportType: '合并',
    projectEntities: [
      '中国石油化工股份有限公司',
      '中国石化炼化工程（集团）股份有限公司',
      '石化盈科信息技术有限责任公司',
    ],
    bindingRows: [
      { name: '中国石油化工股份有限公司',             reportType: '合并', firmCode: '（待补充）', firmManager: '王芳' },
      { name: '中国石化炼化工程（集团）股份有限公司', reportType: '单体', firmCode: '（待补充）', firmManager: '王芳' },
      { name: '石化盈科信息技术有限责任公司',         reportType: '单体', firmCode: '（待补充）', firmManager: '王芳' },
    ],
    updatedAt: '2026-03-09 10:15',
    updatedBy: '张伟',
  },
  {
    id: 'ws-003',
    starred: false,
    name: '华为技术有限公司-年度审计-2025年度-审计三部-003',
    status: '执行中',
    group: '华为技术有限公司',
    entity: '华为技术有限公司',
    bizType: '年报审计',
    period: '2025-01-01 至 2025-12-31',
    year: '2025',
    manager: '陈刚',
    dept: '审计三部',
    firmCode: 'AUDIT-2025-HW-003',
    totalCode: 'HQ-2025-HW-88803',
    reportType: '单体',
    projectEntities: [
      '华为技术有限公司',
      '华为软件技术有限公司',
      '华为云计算技术有限公司',
    ],
    bindingRows: [
      { name: '华为技术有限公司',       reportType: '单体', firmCode: 'HQ-2025-HW-88803', firmManager: '陈刚' },
      { name: '华为软件技术有限公司',   reportType: '单体', firmCode: 'HQ-2025-HW-88804', firmManager: '陈刚' },
      { name: '华为云计算技术有限公司', reportType: '单体', firmCode: 'HQ-2025-HW-88805', firmManager: '陈刚' },
    ],
    updatedAt: '2026-03-08 16:45',
    updatedBy: '王芳',
  },
  {
    id: 'ws-004',
    starred: false,
    name: '阿里巴巴集团-IPO审计-2025年度-审计一部-004',
    status: '执行中',
    group: '阿里巴巴集团',
    entity: '阿里巴巴（中国）网络技术有限公司',
    bizType: 'IPO审计',
    period: '2025-01-01 至 2025-12-31',
    year: '2025',
    manager: '刘晓',
    dept: '审计一部',
    firmCode: 'AUDIT-2025-ALI-004',
    totalCode: 'HQ-2025-ALI-88804',
    reportType: '合并',
    projectEntities: [
      '阿里巴巴（中国）网络技术有限公司',
      '浙江天猫技术有限公司',
      '菜鸟供应链管理有限公司',
    ],
    bindingRows: [
      { name: '阿里巴巴（中国）网络技术有限公司', reportType: '合并', firmCode: 'HQ-2025-ALI-88804', firmManager: '刘晓' },
      { name: '浙江天猫技术有限公司',             reportType: '单体', firmCode: 'HQ-2025-ALI-88805', firmManager: '刘晓' },
      { name: '菜鸟供应链管理有限公司',           reportType: '单体', firmCode: 'HQ-2025-ALI-88806', firmManager: '刘晓' },
    ],
    updatedAt: '2026-03-07 09:22',
    updatedBy: '陈刚',
  },
  {
    id: 'ws-005',
    starred: false,
    name: '万科企业股份有限公司-专项审计-2024年度-审计二部-005',
    status: '送审中',
    group: '万科企业股份有限公司',
    entity: '万科企业股份有限公司',
    bizType: '专项审计',
    period: '2024-01-01 至 2024-12-31',
    year: '2024',
    manager: '赵敏',
    dept: '审计二部',
    firmCode: 'AUDIT-2024-VKE-005',
    totalCode: '',
    reportType: '合并',
    projectEntities: [
      '万科企业股份有限公司',
      '深圳市万科房地产有限公司',
      '万科物业服务股份有限公司',
      '深圳市万科发展有限公司',
    ],
    bindingRows: [
      { name: '万科企业股份有限公司',     reportType: '合并', firmCode: '（待补充）', firmManager: '赵敏' },
      { name: '深圳市万科房地产有限公司', reportType: '单体', firmCode: '（待补充）', firmManager: '赵敏' },
      { name: '万科物业服务股份有限公司', reportType: '单体', firmCode: '（待补充）', firmManager: '赵敏' },
      { name: '深圳市万科发展有限公司',   customerId: 'XS-VKE-004', reportType: '单体', firmCode: '（待补充）', manager: '赵敏' },
    ],
    updatedAt: '2026-03-05 11:08',
    updatedBy: '刘晓',
  },
  {
    id: 'ws-006',
    starred: true,
    name: '比亚迪股份有限公司-年度审计-2024年度-审计三部-006',
    status: '执行中',
    group: '比亚迪股份有限公司',
    entity: '比亚迪股份有限公司',
    bizType: '年报审计',
    period: '2024-01-01 至 2024-12-31',
    year: '2024',
    manager: '孙磊',
    dept: '审计三部',
    firmCode: 'AUDIT-2024-BYD-006',
    totalCode: 'HQ-2024-BYD-88806',
    reportType: '合并',
    projectEntities: [
      '比亚迪股份有限公司',
      '比亚迪汽车工业有限公司',
      '比亚迪新能源汽车有限公司',
    ],
    bindingRows: [
      { name: '比亚迪股份有限公司',         reportType: '合并', firmCode: 'HQ-2024-BYD-88806', firmManager: '孙磊' },
      { name: '比亚迪汽车工业有限公司',     reportType: '单体', firmCode: 'HQ-2024-BYD-88807', firmManager: '孙磊' },
      { name: '比亚迪新能源汽车有限公司',   reportType: '单体', firmCode: 'HQ-2024-BYD-88808', firmManager: '孙磊' },
    ],
    updatedAt: '2026-03-03 15:30',
    updatedBy: '赵敏',
  },
];

/* 当前工作区视图状态 */
const wsState = {
  view: 'card',       // 'card' | 'list'
  starredOnly: false, // 只看特别关注
  filterOpen: false,  // 筛选面板是否展开
  filters: { status: '', group: '', bizType: '', year: '', dept: '' },
  searchText: '',
};

/* ── 9b. 渲染工作区视图 ── */
function renderWorkspaceView() {
  renderWorkspaceCards();
  initWorkspaceInteractions();
}

/* 根据当前 state 过滤数据 */
function getFilteredWorkspaces() {
  return WORKSPACE_DATA.filter(ws => {
    if (wsState.starredOnly && !ws.starred) return false;
    if (wsState.filters.status   && ws.status  !== wsState.filters.status)  return false;
    if (wsState.filters.bizType  && ws.bizType !== wsState.filters.bizType)  return false;
    if (wsState.filters.year     && ws.year    !== wsState.filters.year)     return false;
    if (wsState.filters.group    && !ws.group.includes(wsState.filters.group)) return false;
    if (wsState.filters.dept     && !ws.dept.includes(wsState.filters.dept))   return false;
    if (wsState.searchText       && !ws.name.toLowerCase().includes(wsState.searchText.toLowerCase())) return false;
    return true;
  });
}

/* 渲染卡片/列表（带平滑过渡动画）*/
function renderWorkspaceCards() {
  const container = document.getElementById('ws-cards-container');
  if (!container) return;

  /* ── Phase 1：淡出当前内容 ── */
  container.style.transition = 'opacity 100ms ease-out, transform 100ms ease-out';
  container.style.opacity    = '0';
  container.style.transform  = 'translateY(6px) scale(0.99)';

  setTimeout(() => {
    /* ── Phase 2：替换内容 ── */
    const data = getFilteredWorkspaces();

    if (data.length === 0) {
      container.className = 'ws-content-area';
      container.innerHTML = `
        <div class="ws-empty-state">
          <svg viewBox="0 0 64 64" fill="none" width="64" height="64">
            <rect x="8" y="12" width="48" height="40" rx="6" fill="#E8EBF0"/>
            <rect x="16" y="22" width="20" height="3" rx="1.5" fill="#CBD5E1"/>
            <rect x="16" y="30" width="32" height="2" rx="1" fill="#E2E8F0"/>
            <rect x="16" y="36" width="24" height="2" rx="1" fill="#E2E8F0"/>
          </svg>
          <p>没有找到匹配的工作区</p>
          <span>尝试修改筛选条件或搜索关键词</span>
        </div>`;
    } else if (wsState.view === 'card') {
      container.className = 'ws-content-area ws-grid-view';
      container.innerHTML = data.map((ws, i) => renderWorkspaceCard(ws, i)).join('');
    } else {
      container.className = 'ws-content-area ws-list-view';
      container.innerHTML = buildListHTML(data);
    }

    bindWorkspaceCardEvents();

    /* ── Phase 3：淡入新内容（下一帧触发，确保 DOM 已更新）── */
    requestAnimationFrame(() => {
      container.style.transition = 'opacity 220ms cubic-bezier(0.16, 1, 0.3, 1), transform 220ms cubic-bezier(0.16, 1, 0.3, 1)';
      container.style.opacity    = '1';
      container.style.transform  = 'translateY(0) scale(1)';
    });
  }, 110);
}

/* 构建列表视图 HTML（10列：名称 | 状态 | 公司名称 | 集团 | 业务类型 | 负责人 | 部门 | 总所编号 | 更新 | 操作）*/
function buildListHTML(data) {
  return `
    <div class="ws-table-wrap">
      <div class="ws-list-header">
        <span class="wsl-h wsl-h-name">工作区名称</span>
        <span class="wsl-h">状态</span>
        <span class="wsl-h">公司名称</span>
        <span class="wsl-h">关联集团</span>
        <span class="wsl-h">业务类型</span>
        <span class="wsl-h">项目负责人</span>
        <span class="wsl-h">所属部门</span>
        <span class="wsl-h">总所编号</span>
        <span class="wsl-h">最近更新</span>
        <span class="wsl-h wsl-h-actions">操作</span>
      </div>
      <div class="ws-list-body">
        ${data.map((ws, i) => renderWorkspaceRow(ws, i)).join('')}
      </div>
    </div>`;
}

/* 单张卡片 HTML */
function renderWorkspaceCard(ws, idx) {
  const statusClass = ws.status === '执行中' ? 'ws-status-active' : 'ws-status-review';
  const starFill = ws.starred ? '#F59E0B' : 'none';
  const starStroke = ws.starred ? '#F59E0B' : 'currentColor';
  return `
  <div class="ws-card animate-slide-up" data-ws-id="${ws.id}" style="animation-delay:${idx * 0.05}s">
    <div class="ws-card-top">
      <button class="ws-star-btn ${ws.starred ? 'starred' : ''}" data-action="toggle-star" data-id="${ws.id}" title="${ws.starred ? '取消特别关注' : '标为特别关注'}">
        <svg viewBox="0 0 24 24" fill="${starFill}" stroke="${starStroke}" stroke-width="2" stroke-linecap="round" width="16" height="16">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </button>
      <span class="ws-status-badge ${statusClass}">${ws.status}</span>
    </div>
    <div class="ws-card-title">${ws.name}</div>
    <div class="ws-card-meta-grid">
      <div class="ws-meta-item ws-meta-full">
        <span class="ws-meta-label">公司名称</span>
        <span class="ws-meta-value ws-meta-entity">${ws.entity || '—'}</span>
      </div>
      <div class="ws-meta-item">
        <span class="ws-meta-label">集团公司</span>
        <span class="ws-meta-value">${ws.group}</span>
      </div>
      <div class="ws-meta-item">
        <span class="ws-meta-label">业务类型</span>
        <span class="ws-meta-value">${ws.bizType}</span>
      </div>
      <div class="ws-meta-item">
        <span class="ws-meta-label">审计期间</span>
        <span class="ws-meta-value">${ws.period}</span>
      </div>
      <div class="ws-meta-item">
        <span class="ws-meta-label">项目年度</span>
        <span class="ws-meta-value">${ws.year}</span>
      </div>
      <div class="ws-meta-item">
        <span class="ws-meta-label">项目负责人</span>
        <span class="ws-meta-value">${ws.manager}</span>
      </div>
      <div class="ws-meta-item">
        <span class="ws-meta-label">所属部门</span>
        <span class="ws-meta-value">${ws.dept}</span>
      </div>
      <div class="ws-meta-item ws-meta-full">
        <span class="ws-meta-label">总所编号</span>
        <span class="ws-meta-value ws-code">${ws.firmCode}</span>
      </div>
    </div>
    <div class="ws-card-footer">
      <span class="ws-updated-info">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="12" height="12">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        ${ws.updatedAt} · ${ws.updatedBy}
      </span>
      <div class="ws-card-actions">
        <button class="ws-action-btn ws-action-detail" data-action="detail" data-id="${ws.id}" title="查看详情">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
          详情
        </button>
        <button class="ws-action-btn" data-action="edit" data-id="${ws.id}" title="编辑">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
          </svg>
          编辑
        </button>
        <button class="ws-action-btn ws-action-danger" data-action="delete" data-id="${ws.id}" title="删除">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          删除
        </button>
      </div>
    </div>
  </div>`;
}

/* 列表行 HTML（9列）*/
function renderWorkspaceRow(ws, idx) {
  const statusClass = ws.status === '执行中' ? 'ws-status-active' : 'ws-status-review';
  const starFill    = ws.starred ? '#F59E0B' : 'none';
  const starStroke  = ws.starred ? '#F59E0B' : '#CBD5E1';
  return `
  <div class="ws-list-row" data-ws-id="${ws.id}" style="animation-delay:${idx * 0.035}s">
    <!-- 1. 工作区名称 -->
    <div class="wsl-cell wsl-cell-name">
      <button class="ws-star-btn ${ws.starred ? 'starred' : ''}" data-action="toggle-star" data-id="${ws.id}" title="${ws.starred ? '取消关注' : '特别关注'}">
        <svg viewBox="0 0 24 24" fill="${starFill}" stroke="${starStroke}" stroke-width="2" stroke-linecap="round" width="13" height="13">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </button>
      <span class="wsl-name-primary">${ws.name}</span>
    </div>
    <!-- 2. 状态 -->
    <div class="wsl-cell">
      <span class="ws-status-badge ${statusClass}">${ws.status}</span>
    </div>
    <!-- 3. 公司名称 -->
    <div class="wsl-cell wsl-cell-secondary">
      <span class="wsl-truncate wsl-entity">${ws.entity || '—'}</span>
    </div>
    <!-- 4. 关联集团 -->
    <div class="wsl-cell wsl-cell-secondary">
      <span class="wsl-truncate">${ws.group}</span>
    </div>
    <!-- 4. 业务类型 -->
    <div class="wsl-cell">
      <span class="wsl-biz-tag">${ws.bizType}</span>
    </div>
    <!-- 5. 项目负责人 -->
    <div class="wsl-cell wsl-cell-person">
      <div class="wsl-avatar">${ws.manager.charAt(0)}</div>
      <span class="wsl-person-name">${ws.manager}</span>
    </div>
    <!-- 6. 所属部门 -->
    <div class="wsl-cell wsl-cell-secondary">
      <span class="wsl-truncate">${ws.dept}</span>
    </div>
    <!-- 7. 总所编号 -->
    <div class="wsl-cell">
      <span class="wsl-firm-code">${ws.firmCode}</span>
    </div>
    <!-- 8. 最近更新 -->
    <div class="wsl-cell wsl-cell-secondary">
      <div class="wsl-update-info">
        <span class="wsl-update-time">${ws.updatedAt}</span>
        <span class="wsl-update-by">${ws.updatedBy}</span>
      </div>
    </div>
    <!-- 9. 操作 -->
    <div class="wsl-cell wsl-cell-actions">
      <button class="wsl-action-btn wsl-action-detail" data-action="detail" data-id="${ws.id}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="13" height="13">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
        </svg>
        详情
      </button>
      <button class="wsl-action-btn" data-action="edit" data-id="${ws.id}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="13" height="13">
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
        </svg>
        编辑
      </button>
      <button class="wsl-action-btn wsl-action-danger" data-action="delete" data-id="${ws.id}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="13" height="13">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
        删除
      </button>
    </div>
  </div>`;
}

/* ── 9c. 绑定卡片内按钮事件 ── */
function bindWorkspaceCardEvents() {
  const container = document.getElementById('ws-cards-container');
  if (!container) return;

  /* 操作按钮（星标/编辑/删除）*/
  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      const id     = btn.dataset.id;
      const ws     = WORKSPACE_DATA.find(w => w.id === id);
      if (!ws) return;
      if (action === 'toggle-star') {
        ws.starred = !ws.starred;
        renderWorkspaceCards();
      } else if (action === 'detail') {
        openWorkspaceInfoModal(ws);
      } else if (action === 'edit') {
        showNotification(`编辑工作区：${ws.name}`);
      } else if (action === 'delete') {
        showNotification(`删除工作区：${ws.name}`);
      }
    });
  });

  /* 点击卡片/行主体 → 跳转工作区详情 */
  container.querySelectorAll('.ws-card, .ws-list-row').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      /* 如果点到了内部按钮则忽略 */
      if (e.target.closest('[data-action]') || e.target.closest('button')) return;
      const id = card.dataset.wsId;
      const ws = WORKSPACE_DATA.find(w => w.id === id);
      if (ws) openProjectDetail(ws);
    });
  });
}

/* ── 9d. 工作区交互初始化（只执行一次） ── */
let wsInteractionsBound = false;
function initWorkspaceInteractions() {
  if (wsInteractionsBound) return;
  wsInteractionsBound = true;

  /* 搜索 */
  document.getElementById('ws-search')?.addEventListener('input', (e) => {
    wsState.searchText = e.target.value;
    renderWorkspaceCards();
  });

  /* 星标筛选 */
  document.getElementById('ws-star-filter')?.addEventListener('click', function() {
    wsState.starredOnly = !wsState.starredOnly;
    this.classList.toggle('active', wsState.starredOnly);
    renderWorkspaceCards();
  });

  /* 高级筛选展开/收起 */
  document.getElementById('ws-filter-toggle')?.addEventListener('click', function() {
    wsState.filterOpen = !wsState.filterOpen;
    const panel = document.getElementById('ws-filter-panel');
    if (panel) panel.classList.toggle('open', wsState.filterOpen);
    this.classList.toggle('active', wsState.filterOpen);
    const chevron = this.querySelector('.ws-filter-chevron');
    if (chevron) chevron.style.transform = wsState.filterOpen ? 'rotate(180deg)' : '';
  });

  /* 应用筛选 */
  document.getElementById('ws-apply-filter')?.addEventListener('click', () => {
    wsState.filters.status  = document.getElementById('wf-status')?.value  || '';
    wsState.filters.bizType = document.getElementById('wf-biz-type')?.value || '';
    wsState.filters.year    = document.getElementById('wf-year')?.value    || '';
    wsState.filters.group   = document.getElementById('wf-group')?.value   || '';
    wsState.filters.dept    = document.getElementById('wf-dept')?.value    || '';
    renderWorkspaceCards();
  });

  /* 重置筛选 */
  document.getElementById('ws-reset-filter')?.addEventListener('click', () => {
    wsState.filters = { status: '', group: '', bizType: '', year: '', dept: '' };
    ['wf-status','wf-biz-type','wf-year'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    ['wf-group','wf-dept'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    renderWorkspaceCards();
  });

  /* 卡片 / 列表 视图切换 */
  document.querySelectorAll('.ws-view-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.ws-view-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      wsState.view = this.dataset.wsView;
      renderWorkspaceCards();
    });
  });

  /* 新建工作区 — 打开弹窗 */
  document.getElementById('btn-new-workspace')?.addEventListener('click', openCreateModal);
}

/* ══════════════════════════════════════════════
   10. 新建工作区弹窗模块
   ══════════════════════════════════════════════ */

/* 弹窗状态 */
const wsModal = {
  step: 1,        // 当前步骤（1 | 2 | 3）
  type: '',       // 选中的工作区类型
};

/* 全所人员名录（姓名 + 部门），用于项目负责人搜索和部门自动关联 */
const WS_ALL_STAFF = [
  { name: '张伟',   dept: '审计一部' },
  { name: '李明',   dept: '审计一部' },
  { name: '王芳',   dept: '审计一部' },
  { name: '陈小红', dept: '审计一部' },
  { name: '刘洋',   dept: '审计一部' },
  { name: '林佳',   dept: '审计一部' },
  { name: '赵敏',   dept: '审计二部' },
  { name: '黄磊',   dept: '审计二部' },
  { name: '郑杰',   dept: '审计二部' },
  { name: '陈刚',   dept: '审计三部' },
  { name: '吴静',   dept: '审计三部' },
  { name: '陈伟',   dept: '审计三部' },
  { name: '刘晓',   dept: '审计四部' },
  { name: '孙磊',   dept: '前海五部' },
  { name: '李娜',   dept: '北京四部' },
  { name: '周强',   dept: '风控中心' },
  { name: '周梦',   dept: '质控中心' },
  { name: '何志远', dept: '审计二部' },
  { name: '杨丽萍', dept: '审计四部' },
  { name: '马超',   dept: '前海五部' },
];

/* ── 10a. 初始化弹窗 ── */
function initCreateWorkspaceModal() {
  /* 关闭按钮 */
  document.getElementById('ws-modal-close')?.addEventListener('click', closeCreateModal);
  document.getElementById('ws-modal-cancel')?.addEventListener('click', closeCreateModal);

  /* 点击遮罩关闭 */
  document.getElementById('ws-create-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeCreateModal();
  });

  /* Esc 键关闭 */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCreateModal();
  });

  /* 类型卡片选择 */
  document.querySelectorAll('.ws-type-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.ws-type-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      wsModal.type = card.dataset.type;
    });
  });

  /* 下一步 / 上一步 */
  document.getElementById('ws-btn-next')?.addEventListener('click', handleNextStep);
  document.getElementById('ws-btn-prev')?.addEventListener('click', () => switchModalStep(wsModal.step - 1));

  /* 确认创建 */
  document.getElementById('ws-btn-submit')?.addEventListener('click', submitCreateWorkspace);

  /* 自动更新工作区名称（绑定 change 事件到有 data-autoname 属性的字段）*/
  ['ws-form-biztype', 'ws-form-year'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', updateAutoName);
  });

  /* 初始化可搜索下拉框 */
  initManagerSelect();
  initCustomSelects();
  initEntitySelect();
}

/* ── 10b. 打开 / 关闭弹窗 ── */
function openCreateModal() {
  resetModalState();
  document.getElementById('ws-create-modal').classList.add('open');
  document.getElementById('ws-create-modal').setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeCreateModal() {
  const backdrop = document.getElementById('ws-create-modal');
  if (!backdrop?.classList.contains('open')) return;
  backdrop.classList.remove('open');
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* ── 10c. 步骤切换（带滑动动画）── */
function handleNextStep() {
  if (wsModal.step === 1) {
    if (!wsModal.type) {
      /* 未选类型时，震动提示 */
      document.querySelectorAll('.ws-type-card').forEach(c => {
        c.style.animation = 'shake 0.35s ease';
        setTimeout(() => c.style.animation = '', 400);
      });
      showNotification('请先选择工作区类型');
      return;
    }
    switchModalStep(2);
  } else if (wsModal.step === 2) {
    if (!validateStep2()) return;
    populateStep3();
    switchModalStep(3);
  }
}

function switchModalStep(target) {
  const from     = wsModal.step;
  const direction = target > from ? 'forward' : 'backward';
  const fromEl   = document.getElementById(`ws-step-${from}`);
  const toEl     = document.getElementById(`ws-step-${target}`);
  if (!fromEl || !toEl) return;

  wsModal.step = target;
  updateStepperUI();
  updateModalFooterButtons();
  updateModalSubtitle();

  /* Phase 1：当前面板滑出 */
  fromEl.style.transition = 'opacity 130ms ease-out, transform 130ms ease-out';
  fromEl.style.opacity    = '0';
  fromEl.style.transform  = direction === 'forward' ? 'translateX(-24px)' : 'translateX(24px)';

  setTimeout(() => {
    fromEl.style.display    = 'none';
    fromEl.style.transform  = '';
    fromEl.style.opacity    = '';
    fromEl.style.transition = '';

    /* Phase 2：新面板滑入 */
    toEl.style.opacity    = '0';
    toEl.style.transform  = direction === 'forward' ? 'translateX(24px)' : 'translateX(-24px)';
    toEl.style.display    = 'block';

    /* 滚回顶部 */
    document.querySelector('.modal-body')?.scrollTo({ top: 0 });

    requestAnimationFrame(() => {
      toEl.style.transition = 'opacity 220ms cubic-bezier(0.16,1,0.3,1), transform 220ms cubic-bezier(0.16,1,0.3,1)';
      toEl.style.opacity    = '1';
      toEl.style.transform  = 'translateX(0)';
    });
  }, 140);
}

/* 更新步骤指示器 */
function updateStepperUI() {
  document.querySelectorAll('.step-item').forEach(item => {
    const n = parseInt(item.dataset.step);
    item.classList.remove('active', 'completed');
    if (n < wsModal.step)  item.classList.add('completed');
    if (n === wsModal.step) item.classList.add('active');
  });
  /* 两条连接线分别填充：conn-1 当 step>1，conn-2 当 step>2 */
  document.querySelectorAll('.step-connector').forEach(conn => {
    const idx = parseInt(conn.dataset.conn || '1');
    conn.classList.toggle('filled', wsModal.step > idx);
  });
}

/* 更新底部按钮显示 */
function updateModalFooterButtons() {
  const prev   = document.getElementById('ws-btn-prev');
  const next   = document.getElementById('ws-btn-next');
  const submit = document.getElementById('ws-btn-submit');
  prev.style.display   = wsModal.step > 1  ? 'inline-flex' : 'none';
  next.style.display   = wsModal.step < 3  ? 'inline-flex' : 'none';
  submit.style.display = wsModal.step === 3 ? 'inline-flex' : 'none';
}

/* 更新弹窗副标题 */
function updateModalSubtitle() {
  const sub = document.getElementById('ws-modal-subtitle');
  if (!sub) return;
  const subtitles = ['选择工作区类型，开始创建', '填写工作区基础信息', '绑定项目集合清单'];
  sub.textContent = subtitles[wsModal.step - 1] || '';
}

/* ── 10d-0. 填充公司名称下拉（从 CUSTOMER_DATA），绑定集团自动映射 ── */
function initEntitySelect() {
  const entitySel = document.getElementById('ws-form-entity');
  if (!entitySel) return;

  /* 用 CUSTOMER_DATA 动态填充选项 */
  const frag = document.createDocumentFragment();
  CUSTOMER_DATA.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.name;
    opt.dataset.group = c.group;
    opt.textContent = c.name;
    frag.appendChild(opt);
  });
  /* 保留默认第一项，清除旧动态项，再填充 */
  while (entitySel.options.length > 1) entitySel.remove(1);
  entitySel.appendChild(frag);

  /* 选中公司后自动映射集团 */
  entitySel.addEventListener('change', () => {
    const selected = entitySel.options[entitySel.selectedIndex];
    const groupVal = selected?.dataset.group || '';
    /* 更新 custom-select-wrap 的 hidden input 和显示文字 */
    const groupHidden = document.getElementById('ws-form-group');
    const groupWrap   = document.getElementById('ss-group');
    if (groupHidden) groupHidden.value = groupVal;
    if (groupWrap) {
      const placeholder = groupWrap.querySelector('.css-placeholder');
      if (placeholder) {
        placeholder.textContent = groupVal || '请选择或搜索集团公司…';
        placeholder.classList.toggle('selected', !!groupVal);
      }
      /* 同步选项高亮 */
      groupWrap.querySelectorAll('.css-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.value === groupVal);
      });
      groupWrap.classList.remove('field-error');
    }
    /* 清除公司名称错误状态 */
    entitySel.classList.remove('field-error');
    updateAutoName();
  });
}

/* ── 10d-1. Step 3 文件上传状态 ── */

/* 当前选择/拖入的上传文件名（空字符串表示未上传）*/
let wsUploadedFile = '';

/* 处理选中或拖入的文件 */
function wsHandleUploadedFile(file) {
  const allowed = ['.xls', '.xlsx', '.csv'];
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (!allowed.includes(ext)) {
    showNotification('仅支持 .xls / .xlsx / .csv 格式文件');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showNotification('文件大小不能超过 10 MB');
    return;
  }
  wsUploadedFile = file.name;
  const nameEl = document.getElementById('ws-uploaded-name');
  if (nameEl) nameEl.textContent = file.name;
  const fileEl = document.getElementById('ws-uploaded-file');
  const zoneEl = document.getElementById('ws-upload-zone');
  if (fileEl) fileEl.style.display = 'flex';
  if (zoneEl) zoneEl.style.display = 'none';
}

/* Step 3（总所关联）为可选步骤，无需从 Step 2 回填表单字段 */
function populateStep3() {
  /* 初始化上传区域交互（防止重复绑定） */
  const zone       = document.getElementById('ws-upload-zone');
  const selectBtn  = document.getElementById('ws-upload-select-btn');
  const fileInput  = document.getElementById('ws-upload-input');
  const tplBtn     = document.getElementById('ws-tpl-download-btn');
  const removeBtn  = document.getElementById('ws-remove-file-btn');

  if (tplBtn && !tplBtn._bound) {
    tplBtn._bound = true;
    tplBtn.addEventListener('click', () => {
      const BOM = '\uFEFF';
      const header = '属于该生产工作区的公司名称,财务报表类型,公司名称对应的总所项目编号,总所项目负责人';
      const instructions = [
        '',
        '填写指引：',
        '1、属于该生产工作区的公司名称列表：请输入与工商注册/交易所/证监会一致的标准全称，注意区分中英文括号（请注意，需要保证上传的公司在本工作区所属业务部门所维护的客户列表中）',
        '2、财务报表类型：合并、单体',
        '3、公司名称对应的总所项目编号：填写总所项目管理系统中对应的项目编号',
        '4、总所项目负责人：项目编号对应的总所项目负责人',
      ];
      const example = '中国石油化工股份有限公司,合并,PJ-2026-00123,张伟';
      const csv = BOM + header + '\n' + example + '\n' + instructions.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = '总所关联示例文件.csv'; a.click();
      URL.revokeObjectURL(url);
      showNotification('模板文件已下载');
    });
  }
  if (selectBtn && !selectBtn._bound) {
    selectBtn._bound = true;
    selectBtn.addEventListener('click', () => fileInput?.click());
  }
  if (fileInput && !fileInput._bound) {
    fileInput._bound = true;
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) wsHandleUploadedFile(file);
    });
  }
  if (zone && !zone._bound) {
    zone._bound = true;
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragging'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragging'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('dragging');
      const file = e.dataTransfer?.files?.[0];
      if (file) wsHandleUploadedFile(file);
    });
  }
  if (removeBtn && !removeBtn._bound) {
    removeBtn._bound = true;
    removeBtn.addEventListener('click', () => {
      wsUploadedFile = '';
      const fileEl = document.getElementById('ws-uploaded-file');
      const zoneEl = document.getElementById('ws-upload-zone');
      if (fileEl) fileEl.style.display = 'none';
      if (zoneEl) zoneEl.style.display = '';
      if (fileInput) fileInput.value = '';
    });

    // force TS/JS to see the old drop location
    document.addEventListener('click', (e) => {
      if (!zone?.contains(e.target)) { /* noop, kept for parity */ }
    });
  }
}

/* ── 10d-0. 动态渲染项目负责人下拉（含部门标签，选中后自动关联部门） ── */
function initManagerSelect() {
  const container = document.getElementById('ss-manager-options');
  if (!container) return;

  const byDept = {};
  WS_ALL_STAFF.forEach(s => {
    (byDept[s.dept] ||= []).push(s.name);
  });

  let html = '';
  Object.entries(byDept).forEach(([dept, names]) => {
    html += `<div class="css-option-group-label">${dept}</div>`;
    names.forEach(n => {
      html += `<div class="css-option" data-value="${n}" data-dept="${dept}">${n}<span class="css-option-dept">${dept}</span></div>`;
    });
  });
  container.innerHTML = html;
}

/* 选中负责人后自动填充部门 */
function autoLinkDeptFromManager(managerName) {
  const staff = WS_ALL_STAFF.find(s => s.name === managerName);
  if (!staff) return;
  const deptVal = staff.dept;

  const deptHidden = document.getElementById('ws-form-dept');
  if (deptHidden) deptHidden.value = deptVal;

  const deptWrap = document.getElementById('ss-dept');
  if (deptWrap) {
    const placeholder = deptWrap.querySelector('.css-placeholder');
    if (placeholder) { placeholder.textContent = deptVal; placeholder.classList.add('selected'); }
    deptWrap.querySelectorAll('.css-option').forEach(o => {
      o.classList.toggle('selected', o.dataset.value === deptVal);
    });
    deptWrap.classList.remove('field-error');
  }
  updateAutoName();
}

/* ── 10d. 自定义可搜索下拉框 ── */
function initCustomSelects() {
  document.querySelectorAll('.custom-select-wrap').forEach(wrap => {
    const trigger     = wrap.querySelector('.css-trigger');
    const placeholder = wrap.querySelector('.css-placeholder');
    const filterInput = wrap.querySelector('.css-filter');
    const dropdown    = wrap.querySelector('.css-dropdown');
    const options     = wrap.querySelectorAll('.css-option');
    const hidden      = wrap.querySelector('input[type="hidden"]');
    const needAutoName = wrap.dataset.autoname === 'true';

    if (!trigger || !dropdown) return;

    /* 打开 / 关闭 */
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = wrap.classList.contains('open');
      /* 关闭其他所有下拉 */
      document.querySelectorAll('.custom-select-wrap.open').forEach(w => w.classList.remove('open'));
      if (!isOpen) {
        wrap.classList.add('open');
        filterInput?.focus();
      }
    });

    /* 搜索过滤（含组标签联动隐藏） */
    filterInput?.addEventListener('input', () => {
      const q = filterInput.value.toLowerCase();
      const allOpts = wrap.querySelectorAll('.css-option');
      allOpts.forEach(opt => {
        const text = (opt.dataset.value || '') + (opt.dataset.dept || '') + opt.textContent;
        opt.classList.toggle('hidden', !text.toLowerCase().includes(q));
      });
      wrap.querySelectorAll('.css-option-group-label').forEach(label => {
        let next = label.nextElementSibling;
        let anyVisible = false;
        while (next && !next.classList.contains('css-option-group-label')) {
          if (next.classList.contains('css-option') && !next.classList.contains('hidden')) anyVisible = true;
          next = next.nextElementSibling;
        }
        label.classList.toggle('hidden', !anyVisible);
      });
    });

    /* 选择选项（含动态渲染的选项，用事件委托） */
    const optionsContainer = wrap.querySelector('.css-options');
    if (optionsContainer) {
      optionsContainer.addEventListener('click', (e) => {
        const opt = e.target.closest('.css-option');
        if (!opt) return;
        e.stopPropagation();
        if (hidden) hidden.value = opt.dataset.value;
        placeholder.textContent = opt.dataset.value;
        placeholder.classList.add('selected');
        optionsContainer.querySelectorAll('.css-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        if (filterInput) {
          filterInput.value = '';
          optionsContainer.querySelectorAll('.css-option').forEach(o => o.classList.remove('hidden'));
          optionsContainer.querySelectorAll('.css-option-group-label').forEach(l => l.classList.remove('hidden'));
        }
        wrap.classList.remove('open');
        if (needAutoName) updateAutoName();
        wrap.classList.remove('field-error');
        if (wrap.id === 'ss-manager') autoLinkDeptFromManager(opt.dataset.value);
      });
    }
  });

  /* 点击外部关闭所有下拉 */
  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-select-wrap.open').forEach(w => w.classList.remove('open'));
  });
}

/* ── 10e. 自动生成工作区名称 ── */
function updateAutoName() {
  const group   = document.getElementById('ws-form-group')?.value   || '';
  const bizType = document.getElementById('ws-form-biztype')?.value || '';
  const year    = document.getElementById('ws-form-year')?.value    || '';
  const dept    = document.getElementById('ws-form-dept')?.value    || '';

  const nameEl = document.getElementById('ws-auto-name');
  if (!nameEl) return;

  const parts = [group, bizType, year ? year + '年度' : '', dept].filter(Boolean);
  if (parts.length === 0) {
    nameEl.textContent = '请填写下方信息以自动生成名称';
    nameEl.classList.add('placeholder');
  } else {
    const seq  = String(WORKSPACE_DATA.length + 1).padStart(3, '0');
    nameEl.textContent = parts.join('-') + '-' + seq;
    nameEl.classList.remove('placeholder');
  }
}

/* ── 10f. 表单校验 ── */
const REQUIRED_FIELDS = [
  { id: 'ws-form-entity',        type: 'select',  label: '公司名称'     },
  { id: 'ws-form-group',         type: 'custom',  label: '所属集团' },
  { id: 'ws-form-biztype',       type: 'select',  label: '业务类型'     },
  { id: 'ws-form-period-start',  type: 'input',   label: '审计期间开始' },
  { id: 'ws-form-period-end',    type: 'input',   label: '审计期间结束' },
  { id: 'ws-form-year',          type: 'select',  label: '项目年度'     },
  { id: 'ws-form-manager',       type: 'custom',  label: '项目负责人'   },
  { id: 'ws-form-dept',          type: 'custom',  label: '工作区所属部门' },
];

function validateStep2() {
  let firstError = null;
  let valid = true;

  REQUIRED_FIELDS.forEach(({ id, type, label }) => {
    const el    = document.getElementById(id);
    if (!el) return;
    const empty = !el.value.trim();

    if (type === 'custom') {
      /* 自定义 select 的 wrapper */
      const wrap = el.closest('.custom-select-wrap');
      if (empty) {
        wrap?.classList.add('field-error');
        if (!firstError) firstError = label;
        valid = false;
      } else {
        wrap?.classList.remove('field-error');
      }
    } else {
      if (empty) {
        el.classList.add('field-error');
        if (!firstError) firstError = label;
        valid = false;
      } else {
        el.classList.remove('field-error');
      }
    }
  });

  if (!valid) { showNotification(`请填写「${firstError}」`); return false; }

  const periodStart = document.getElementById('ws-form-period-start')?.value;
  const periodEnd   = document.getElementById('ws-form-period-end')?.value;
  if (periodStart && periodEnd && periodEnd < periodStart) {
    document.getElementById('ws-form-period-end')?.classList.add('field-error');
    showNotification('审计期间结束时间不能早于开始时间');
    return false;
  }

  return true;
}

/* ── 10g. 提交：创建工作区 ── */
function submitCreateWorkspace() {
  const entity      = document.getElementById('ws-form-entity').value;
  const group       = document.getElementById('ws-form-group').value;
  const bizType     = document.getElementById('ws-form-biztype').value;
  const periodStart = document.getElementById('ws-form-period-start').value;
  const periodEnd   = document.getElementById('ws-form-period-end').value;
  const year        = document.getElementById('ws-form-year').value;
  const manager     = document.getElementById('ws-form-manager').value;
  const dept        = document.getElementById('ws-form-dept').value;

  /* 生成工作区名称 */
  const seq  = String(WORKSPACE_DATA.length + 1).padStart(3, '0');
  const name = [group, bizType, year + '年度', dept, seq].join('-');

  /* 格式化当前时间 */
  const now    = new Date();
  const pad    = n => String(n).padStart(2, '0');
  const nowStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

  /* 根据主公司生成绑定行（结构：公司名称、财务报表类型、总所项目编号、总所项目负责人）*/
  const bindingRows = [];
  if (wsUploadedFile) {
    const demoBindings = [
      { name: entity || '中国石油化工股份有限公司', reportType: '合并', firmCode: `PJ-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900+100)).padStart(5,'0')}`, firmManager: manager || '张伟' },
      { name: '石化盈科信息技术有限责任公司',       reportType: '单体', firmCode: `PJ-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900+100)).padStart(5,'0')}`, firmManager: manager || '张伟' },
      { name: '中国石化润滑油有限公司',             reportType: '单体', firmCode: `PJ-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900+100)).padStart(5,'0')}`, firmManager: '王芳' },
    ];
    demoBindings.forEach(b => bindingRows.push(b));
  } else if (entity) {
    bindingRows.push({ name: entity, reportType: '合并', firmCode: '（待补充）', firmManager: manager });
  }

  const newWs = {
    id:             `ws-${String(WORKSPACE_DATA.length + 1).padStart(3, '0')}`,
    starred:        false,
    name,
    status:         '执行中',
    group,
    entity,
    bizType,
    period:         `${periodStart} 至 ${periodEnd}`,
    year,
    manager,
    dept,
    firmCode:       '（待补充）',
    updatedAt:      nowStr,
    updatedBy:      '张伟',
    wsType:         wsModal.type,
    /* Step 3 总所关联数据 */
    bindingFile:    wsUploadedFile || '',
    bindingRows,
    projectEntities: entity ? [entity] : [],
    reportType:     '',
  };

  /* 置顶插入数据 */
  WORKSPACE_DATA.unshift(newWs);

  /* 关闭弹窗 → 刷新列表（带入场动画）*/
  closeCreateModal();
  renderWorkspaceCards();
  showNotification(`✓ 工作区「${name}」创建成功`);
}

/* ── 10h. 重置弹窗状态 ── */
function resetModalState() {
  wsModal.step = 1;
  wsModal.type = '';

  /* 步骤指示器 */
  document.querySelectorAll('.step-item').forEach((item, i) => {
    item.classList.remove('active', 'completed');
    if (i === 0) item.classList.add('active');
  });
  document.querySelectorAll('.step-connector').forEach(c => c.classList.remove('filled'));

  /* 显示 Step 1，隐藏 Step 2 和 Step 3 */
  const s1 = document.getElementById('ws-step-1');
  const s2 = document.getElementById('ws-step-2');
  const s3 = document.getElementById('ws-step-3');
  if (s1) { s1.style.display = 'block'; s1.style.opacity = ''; s1.style.transform = ''; }
  if (s2) { s2.style.display = 'none';  s2.style.opacity = ''; s2.style.transform = ''; }
  if (s3) { s3.style.display = 'none';  s3.style.opacity = ''; s3.style.transform = ''; }

  /* 类型卡片 — 默认选中「项目工作区」 */
  document.querySelectorAll('.ws-type-card').forEach(c => {
    c.classList.remove('selected');
    if (c.dataset.type === 'project') c.classList.add('selected');
  });
  wsModal.type = 'project';

  /* 底部按钮 */
  updateModalFooterButtons();

  /* 副标题 */
  updateModalSubtitle();

  /* 清空表单 */
  ['ws-form-biztype', 'ws-form-year', 'ws-form-period-start', 'ws-form-period-end'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ''; el.classList.remove('field-error'); }
  });

  /* 重置自定义 select */
  document.querySelectorAll('.custom-select-wrap').forEach(wrap => {
    const hidden      = wrap.querySelector('input[type="hidden"]');
    const placeholder = wrap.querySelector('.css-placeholder');
    const filterInput = wrap.querySelector('.css-filter');
    if (hidden) hidden.value = '';
    if (placeholder) {
      placeholder.classList.remove('selected');
      /* 恢复原始 placeholder 文字 */
      const origPlaceholder = {
        'ss-group':   '请选择或搜索集团公司…',
        'ss-manager': '请选择或搜索负责人…',
        'ss-dept':    '请选择或搜索部门…',
      };
      placeholder.textContent = origPlaceholder[wrap.id] || '请选择…';
    }
    if (filterInput) filterInput.value = '';
    wrap.querySelectorAll('.css-option').forEach(o => {
      o.classList.remove('selected', 'hidden');
    });
    wrap.classList.remove('field-error', 'open');
  });

  /* 重置公司名称 select */
  const entitySel = document.getElementById('ws-form-entity');
  if (entitySel) { entitySel.value = ''; entitySel.classList.remove('field-error'); }

  /* 重置 Step 3 上传状态 */
  wsUploadedFile = '';
  const uploadInput = document.getElementById('ws-upload-input');
  if (uploadInput) uploadInput.value = '';
  const uploadedFileEl = document.getElementById('ws-uploaded-file');
  if (uploadedFileEl) uploadedFileEl.style.display = 'none';
  const uploadZoneEl = document.getElementById('ws-upload-zone');
  if (uploadZoneEl) uploadZoneEl.style.display = '';

  /* 重置自动命名预览 */
  const nameEl = document.getElementById('ws-auto-name');
  if (nameEl) {
    nameEl.textContent = '请填写下方信息以自动生成名称';
    nameEl.classList.add('placeholder');
  }
}

/* shake 动画（CSS keyframes 添加到这里，避免污染全局 CSS）*/
if (!document.getElementById('ws-shake-style')) {
  const style = document.createElement('style');
  style.id = 'ws-shake-style';
  style.textContent = `@keyframes shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-6px); }
    40%      { transform: translateX(6px); }
    60%      { transform: translateX(-4px); }
    80%      { transform: translateX(4px); }
  }`;
  document.head.appendChild(style);
}

/* ══════════════════════════════════════════════
   10-WD. 工作区详情弹窗（只读）
   ══════════════════════════════════════════════ */

/* 初始化关闭按钮事件（只绑定一次）*/
function initWorkspaceDetailModal() {
  const closeModal = () => {
    document.getElementById('ws-detail-modal')?.classList.remove('open');
    document.getElementById('ws-detail-modal')?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  document.getElementById('ws-detail-close')?.addEventListener('click', closeModal);
  /* 点击遮罩关闭 */
  document.getElementById('ws-detail-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
}

/* 打开工作区详情弹窗，并填充数据 */
function openWorkspaceInfoModal(ws) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val || '—';
  };

  /* ── Part 1：基础信息 ── */
  set('wd-ws-name', ws.name);
  set('wd-entity',  ws.entity);
  set('wd-group',   ws.group);
  set('wd-biztype', ws.bizType);

  /* 拆分审计期间 "YYYY-MM-DD 至 YYYY-MM-DD" */
  const periodParts  = (ws.period || '').split(' 至 ');
  set('wd-period-start', periodParts[0] || '');
  set('wd-period-end',   periodParts[1] || '');

  set('wd-year',    ws.year    ? ws.year + ' 年' : '');
  set('wd-manager', ws.manager);
  set('wd-dept',    ws.dept);

  /* ── Part 2：所属总所项目集合清单绑定（表格）── */
  const bindingEl = document.getElementById('wd-binding-list');
  if (bindingEl) {
    /* 优先使用 bindingRows；如无，则从 projectEntities 或主公司名称回退生成 */
    let rows = Array.isArray(ws.bindingRows) && ws.bindingRows.length > 0
      ? ws.bindingRows
      : (() => {
          const entities = Array.isArray(ws.projectEntities) && ws.projectEntities.length > 0
            ? ws.projectEntities
            : (ws.entity ? [ws.entity] : []);
          return entities.map((name, i) => ({
            name,
            reportType: i === 0 ? (ws.reportType || '合并') : '单体',
            firmCode:   i === 0 ? (ws.firmCode || '—') : '—',
            firmManager: ws.manager,
          }));
        })();

    if (rows.length === 0) {
      bindingEl.innerHTML = '<p style="color:var(--text-tertiary);font-size:0.84rem;padding:8px 0;">暂无绑定数据</p>';
    } else {
      bindingEl.innerHTML = `
        <table class="wd-binding-table">
          <thead>
            <tr>
              <th>属于该生产工作区的公司名称</th>
              <th>财务报表类型</th>
              <th>公司名称对应的总所项目编号</th>
              <th>总所项目负责人</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <td class="wd-bt-name">${r.name || '—'}</td>
                <td>${r.reportType
                  ? `<span class="wd-bt-rtype wd-bt-rtype-${r.reportType === '合并' ? 'merged' : 'single'}">${r.reportType}</span>`
                  : '—'
                }</td>
                <td class="wd-bt-code">${r.firmCode || '—'}</td>
                <td>${r.firmManager || r.manager || '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>`;
    }
  }

  /* 隐藏上传面板（每次打开详情都重置）*/
  const uploadPanel = document.getElementById('wd-upload-panel');
  if (uploadPanel) uploadPanel.style.display = 'none';
  const updateBtn = document.getElementById('wd-update-binding-btn');
  if (updateBtn) updateBtn.classList.remove('active');

  /* 绑定「更新绑定文件」按钮（挂载一次）*/
  if (updateBtn && !updateBtn._wdBound) {
    updateBtn._wdBound = true;
    updateBtn.addEventListener('click', () => {
      const panel = document.getElementById('wd-upload-panel');
      const isOpen = panel?.style.display !== 'none';
      if (panel) panel.style.display = isOpen ? 'none' : 'block';
      updateBtn.classList.toggle('active', !isOpen);
    });
  }

  /* 打开弹窗 */
  const modal = document.getElementById('ws-detail-modal');
  if (!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  /* 初始化上传面板交互（挂载一次）*/
  initWdUploadPanel(ws);
}

/* 初始化详情弹窗中的上传面板交互 */
function initWdUploadPanel(ws) {
  const tplBtn    = document.getElementById('wd-tpl-btn');
  const dropZone  = document.getElementById('wd-drop-zone');
  const fileInput = document.getElementById('wd-file-input');
  const removeBtn = document.getElementById('wd-remove-sel');
  const cancelBtn = document.getElementById('wd-cancel-upload');
  const confirmBtn = document.getElementById('wd-confirm-upload');

  /* 重置已选文件 */
  let selectedFile = null;
  const setSelected = (file) => {
    selectedFile = file;
    const selEl = document.getElementById('wd-selected-file');
    const nameEl = document.getElementById('wd-selected-name');
    if (file) {
      if (nameEl) nameEl.textContent = file.name;
      if (selEl) selEl.style.display = 'flex';
      if (dropZone) dropZone.style.display = 'none';
    } else {
      if (selEl) selEl.style.display = 'none';
      if (dropZone) dropZone.style.display = '';
      if (fileInput) fileInput.value = '';
    }
  };
  setSelected(null);

  /* 验证文件格式与大小 */
  const validate = (file) => {
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.xls', '.xlsx', '.csv'].includes(ext)) {
      showNotification('仅支持 .xls / .xlsx / .csv 格式文件');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      showNotification('文件大小不能超过 10 MB');
      return false;
    }
    return true;
  };

  /* 下载模板 */
  if (tplBtn && !tplBtn._wdBound) {
    tplBtn._wdBound = true;
    tplBtn.addEventListener('click', () => showNotification('模板文件下载中…'));
  }

  /* 点击上传区触发 file input */
  if (dropZone && !dropZone._wdBound) {
    dropZone._wdBound = true;
    dropZone.addEventListener('click', () => fileInput?.click());
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragging'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragging'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('dragging');
      const file = e.dataTransfer?.files?.[0];
      if (file && validate(file)) setSelected(file);
    });
  }

  /* file input 变更 */
  if (fileInput && !fileInput._wdBound) {
    fileInput._wdBound = true;
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file && validate(file)) setSelected(file);
    });
  }

  /* 移除已选文件 */
  if (removeBtn && !removeBtn._wdBound) {
    removeBtn._wdBound = true;
    removeBtn.addEventListener('click', () => setSelected(null));
  }

  /* 取消 */
  if (cancelBtn && !cancelBtn._wdBound) {
    cancelBtn._wdBound = true;
    cancelBtn.addEventListener('click', () => {
      setSelected(null);
      const panel = document.getElementById('wd-upload-panel');
      if (panel) panel.style.display = 'none';
      const updateBtn = document.getElementById('wd-update-binding-btn');
      if (updateBtn) updateBtn.classList.remove('active');
    });
  }

  /* 确认更新 */
  if (confirmBtn && !confirmBtn._wdBound) {
    confirmBtn._wdBound = true;
    confirmBtn.addEventListener('click', () => {
      if (!selectedFile) {
        showNotification('请先选择要上传的文件');
        return;
      }
      /* Mock 更新：标记文件已绑定，刷新表格提示 */
      ws.bindingFile = selectedFile.name;
      const bindingEl = document.getElementById('wd-binding-list');
      if (bindingEl) {
        /* 在表格底部插入已更新标注 */
        const note = bindingEl.querySelector('.wd-binding-updated');
        if (!note) {
          const div = document.createElement('div');
          div.className = 'wd-binding-updated';
          div.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" width="13" height="13">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            已上传绑定文件：<strong>${selectedFile.name}</strong>（数据将在下次同步后更新）`;
          bindingEl.appendChild(div);
        } else {
          note.querySelector('strong').textContent = selectedFile.name;
        }
      }
      setSelected(null);
      const panel = document.getElementById('wd-upload-panel');
      if (panel) panel.style.display = 'none';
      const updateBtn = document.getElementById('wd-update-binding-btn');
      if (updateBtn) updateBtn.classList.remove('active');
      showNotification('✓ 绑定文件已更新');
    });
  }
}

function updateWorkArea(folderName) {
  const wa = document.querySelector('.work-area');
  if (!wa) return;
  const files = [
    { name: '工作底稿.xlsx', icon: '📊', color: 'rgba(16,185,129,0.1)', meta: '修改于 2小时前' },
    { name: '审计计划.docx', icon: '📝', color: 'rgba(59,130,246,0.1)', meta: '修改于 昨天' },
    { name: '询证函.pdf', icon: '📄', color: 'rgba(239,68,68,0.1)', meta: '修改于 3天前' },
    { name: '财务数据.xlsx', icon: '📈', color: 'rgba(16,185,129,0.1)', meta: '修改于 1周前' },
  ];
  wa.innerHTML = `<div class="work-area-content animate-fade-in" style="width:100%;padding:24px;">
    <h3 style="font-size:1.1rem;font-weight:600;margin-bottom:16px;color:var(--text-primary);">📁 ${folderName}</h3>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">
      ${files.map(f => `<div style="background:var(--surface);border:1px solid rgba(0,0,0,0.06);border-radius:var(--radius-md);padding:12px;display:flex;align-items:center;gap:10px;cursor:pointer;transition:all 0.15s;" onmouseover="this.style.borderColor='var(--brand-primary)'" onmouseout="this.style.borderColor='rgba(0,0,0,0.06)'">
        <div style="width:36px;height:36px;border-radius:8px;background:${f.color};display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">${f.icon}</div>
        <div style="min-width:0;"><div style="font-size:0.857rem;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${f.name}</div><div style="font-size:0.75rem;color:var(--text-tertiary);">${f.meta}</div></div>
      </div>`).join('')}
    </div></div>`;
}

/* ════════════════════════════════════════════════════════
   10. 仪表盘渲染（四大审计阶段进度总览）
   ════════════════════════════════════════════════════════ */

const PHASE_NAMES  = ['计划阶段', '范围界定', '获取证据', '完成阶段'];
const PHASE_COLORS = ['#6366F1', '#3B82F6', '#14B8A6', '#10B981'];
const PHASE_BG     = ['rgba(99,102,241,0.10)', 'rgba(59,130,246,0.10)', 'rgba(20,184,166,0.10)', 'rgba(16,185,129,0.10)'];

/* 计算整体进度（4阶段平均值）*/
function calcOverall(phases) {
  return Math.round(phases.reduce((s, v) => s + v, 0) / phases.length);
}

/* 渲染单个进度条单元格 */
function renderPhaseCell(pct, color, bg) {
  const statusCls = pct === 100 ? 'done' : pct > 0 ? 'active' : 'pending';
  return `
    <div class="dpt-col-phase dpt-cell">
      <div class="dpt-bar-track">
        <div class="dpt-bar-fill ${statusCls}" data-pct="${pct}"
             style="width:0%; background:${color}; box-shadow: 0 0 6px ${color}44;"></div>
      </div>
      <span class="dpt-pct-label ${statusCls}" style="color:${pct > 0 ? color : 'var(--text-tertiary)'}">
        ${pct}%
      </span>
    </div>`;
}

/* 渲染整体进度渐变条 */
function renderOverallCell(pct) {
  const color = pct >= 75 ? '#10B981' : pct >= 50 ? '#14B8A6' : pct >= 25 ? '#3B82F6' : '#6366F1';
  return `
    <div class="dpt-col-overall dpt-cell">
      <div class="dpt-bar-track dpt-overall-track">
        <div class="dpt-bar-fill dpt-overall-fill ${pct > 0 ? 'active' : 'pending'}" data-pct="${pct}"
             style="width:0%; background: linear-gradient(90deg,#6366F1,#3B82F6,#14B8A6,#10B981);"></div>
      </div>
      <span class="dpt-pct-label" style="color:${color}; font-weight:700;">${pct}%</span>
    </div>`;
}

/* 渲染一行项目数据 */
function renderDashboardRow(ws, idx) {
  const phases  = PHASE_PROGRESS[ws.id] || [0, 0, 0, 0];
  const overall = calcOverall(phases);
  const isRunning = ws.status === '执行中';
  const statusColor = isRunning ? '#3B82F6' : '#F59E0B';
  const statusBg    = isRunning ? 'rgba(59,130,246,0.08)' : 'rgba(245,158,11,0.08)';

  return `
    <div class="dpt-row" style="animation-delay:${idx * 55}ms">
      <!-- 工作区名称列 -->
      <div class="dpt-col-name dpt-cell">
        <div class="dpt-name-wrap">
          <span class="dpt-project-name" title="${ws.name}">${ws.name}</span>
          <div class="dpt-name-meta">
            <span class="dpt-status-tag" style="background:${statusBg}; color:${statusColor};">${ws.status}</span>
            <span class="dpt-meta-txt">${ws.manager} · ${ws.dept}</span>
          </div>
        </div>
      </div>
      ${phases.map((p, i) => renderPhaseCell(p, PHASE_COLORS[i], PHASE_BG[i])).join('')}
      ${renderOverallCell(overall)}
    </div>`;
}

/* 渲染汇总统计卡 */
function renderDashboardStats() {
  const total   = WORKSPACE_DATA.length;
  const running = WORKSPACE_DATA.filter(w => w.status === '执行中').length;
  const review  = WORKSPACE_DATA.filter(w => w.status === '送审中').length;
  // 所有项目的平均整体进度
  const avgPct  = Math.round(
    WORKSPACE_DATA.reduce((s, w) => {
      const ph = PHASE_PROGRESS[w.id] || [0,0,0,0];
      return s + calcOverall(ph);
    }, 0) / (total || 1)
  );

  const stats = [
    { label: '在审项目',   value: total,      unit: '个', color: '#6366F1', bg: 'rgba(99,102,241,0.08)',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="20" height="20"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/></svg>` },
    { label: '执行中',     value: running,    unit: '个', color: '#3B82F6', bg: 'rgba(59,130,246,0.08)',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="20" height="20"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>` },
    { label: '送审中',     value: review,     unit: '个', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="20" height="20"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>` },
    { label: '平均完成度', value: avgPct,     unit: '%',  color: '#10B981', bg: 'rgba(16,185,129,0.08)',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="20" height="20"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>` },
  ];

  const container = document.getElementById('dash-stats-row');
  if (!container) return;
  container.innerHTML = stats.map(s => `
    <div class="dash-stat-card">
      <div class="dash-stat-icon" style="background:${s.bg}; color:${s.color};">${s.icon}</div>
      <div class="dash-stat-body">
        <div class="dash-stat-value" style="color:${s.color};">${s.value}<span class="dash-stat-unit">${s.unit}</span></div>
        <div class="dash-stat-label">${s.label}</div>
      </div>
    </div>`).join('');
}

/* 主入口：渲染整个仪表盘 */
function renderDashboard() {
  renderDashboardStats();

  const rowsEl = document.getElementById('dash-phase-rows');
  if (!rowsEl) return;

  /* 淡出 → 重渲 → 淡入 */
  rowsEl.style.opacity = '0';
  setTimeout(() => {
    rowsEl.innerHTML = WORKSPACE_DATA.map((ws, i) => renderDashboardRow(ws, i)).join('');
    rowsEl.style.opacity = '1';

    /* 进度条动画：渲染完成后延迟触发宽度过渡 */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        rowsEl.querySelectorAll('.dpt-bar-fill[data-pct]').forEach(bar => {
          bar.style.width = bar.dataset.pct + '%';
        });
      });
    });
  }, 80);
}

/* ════════════════════════════════════════════════════════
   11. 工作区详情页 (Project Detail)
   ════════════════════════════════════════════════════════ */

/* ── 11a. 文件夹 Mock 数据 ── */
const DETAIL_FOLDERS = [
  { id: 'cert',      label: '函证文件夹',   color: '#3B82F6' },
  { id: 'workorder', label: '工单文件夹',   color: '#6366F1' },
  { id: 'review',    label: '送审文件夹',   color: '#EF4444' },
  { id: 'plan',      label: '计划阶段文件', color: '#10B981' },
  { id: 'scope',     label: '范围界定文件', color: '#F59E0B' },
  { id: 'evidence',  label: '获取证据文件', color: '#8B5CF6' },
  { id: 'finish',    label: '完成阶段文件', color: '#14B8A6' },
  { id: 'template',  label: '模板文件',     color: '#64748B' },
];

const DETAIL_FILES = {
  cert: [
    { name: '银行询证函-工商银行.pdf',      size: '320 KB',  modAt: '2026-02-20 10:30', modBy: '张伟', version: 'V2', ext: 'pdf'  },
    { name: '银行询证函-招商银行.pdf',      size: '285 KB',  modAt: '2026-02-22 14:15', modBy: '王芳', version: 'V1', ext: 'pdf'  },
    { name: '应收账款询证函汇总.xlsx',      size: '156 KB',  modAt: '2026-03-01 09:20', modBy: '李明', version: 'V3', ext: 'xlsx' },
  ],
  workorder: [
    { name: '数据-账套处理工单.xlsx',       size: '98 KB',   modAt: '2026-03-05 11:00', modBy: '张伟', version: 'V1', ext: 'xlsx' },
    { name: '试算-试算搭建工单.xlsx',       size: '112 KB',  modAt: '2026-03-06 14:30', modBy: '陈刚', version: 'V2', ext: 'xlsx' },
  ],
  review: [
    { name: '审计报告送审稿.docx',          size: '1.8 MB',  modAt: '2026-03-10 16:00', modBy: '张伟', version: 'V1', ext: 'docx' },
  ],
  plan: [
    { name: '审计计划书.docx',              size: '256 KB',  modAt: '2026-02-10 10:30', modBy: '张伟', version: 'V3', ext: 'docx' },
    { name: '项目风险评估表.xlsx',          size: '180 KB',  modAt: '2026-02-12 09:45', modBy: '王芳', version: 'V2', ext: 'xlsx' },
    { name: '审计时间安排表.xlsx',          size: '95 KB',   modAt: '2026-02-11 14:00', modBy: '李明', version: 'V1', ext: 'xlsx' },
  ],
  scope: [
    { name: '重要性水平计算表.xlsx',        size: '120 KB',  modAt: '2026-02-15 11:20', modBy: '张伟', version: 'V2', ext: 'xlsx' },
    { name: '了解被审计单位及环境.docx',    size: '340 KB',  modAt: '2026-02-18 09:30', modBy: '王芳', version: 'V1', ext: 'docx' },
  ],
  evidence: [
    { name: '应收账款底稿.xlsx',            size: '1.2 MB',  modAt: '2026-03-01 14:22', modBy: '李明', version: 'V3', ext: 'xlsx' },
    { name: '固定资产底稿.xlsx',            size: '890 KB',  modAt: '2026-03-02 09:15', modBy: '王芳', version: 'V1', ext: 'xlsx' },
    { name: '货币资金底稿.xlsx',            size: '320 KB',  modAt: '2026-02-28 16:40', modBy: '张伟', version: 'V2', ext: 'xlsx' },
    { name: '存货底稿.xlsx',                size: '540 KB',  modAt: '2026-03-03 11:20', modBy: '陈刚', version: 'V1', ext: 'xlsx' },
    { name: '应付账款底稿.xlsx',            size: '760 KB',  modAt: '2026-03-05 11:30', modBy: '陈刚', version: 'V2', ext: 'xlsx' },
    { name: '长期借款底稿.xlsx',            size: '540 KB',  modAt: '2026-03-04 15:20', modBy: '张伟', version: 'V1', ext: 'xlsx' },
  ],
  finish: [
    { name: '审计差异调整汇总表.xlsx',      size: '215 KB',  modAt: '2026-03-08 17:00', modBy: '张伟', version: 'V2', ext: 'xlsx' },
    { name: '管理层声明书.docx',            size: '128 KB',  modAt: '2026-03-09 10:30', modBy: '王芳', version: 'V1', ext: 'docx' },
  ],
  template: [
    { name: '底稿标准模板.xlsx',            size: '86 KB',   modAt: '2026-01-15 09:00', modBy: '系统', version: 'V1', ext: 'xlsx' },
    { name: '询证函模板.docx',              size: '45 KB',   modAt: '2026-01-15 09:00', modBy: '系统', version: 'V1', ext: 'docx' },
    { name: '审计报告模板.docx',            size: '320 KB',  modAt: '2026-01-15 09:00', modBy: '系统', version: 'V1', ext: 'docx' },
  ],
};


/* ── 用户自建文件夹（根目录下，位于"模板文件"之后）── */
const USER_FOLDERS = [
  {
    id: 'uf-compA', label: 'A子公司', color: '#F59E0B',
    children: [
      { id: 'uf-compA-plan',    label: '01 审计计划',  color: '#3B82F6', files: [
        { name: '审计计划-A子公司.docx',     size: '256 KB', modAt: '2026-03-15 10:00', modBy: '张伟', version: 'V2', ext: 'docx' },
        { name: '风险评估表-A子公司.xlsx',   size: '180 KB', modAt: '2026-03-14 15:30', modBy: '王芳', version: 'V1', ext: 'xlsx' },
      ]},
      { id: 'uf-compA-asset',   label: '02 资产类',    color: '#10B981', files: [
        { name: '货币资金-A子公司.xlsx',     size: '420 KB', modAt: '2026-03-18 09:20', modBy: '李明', version: 'V3', ext: 'xlsx' },
        { name: '应收账款-A子公司.xlsx',     size: '680 KB', modAt: '2026-03-17 14:10', modBy: '王芳', version: 'V2', ext: 'xlsx' },
        { name: '存货盘点-A子公司.xlsx',     size: '320 KB', modAt: '2026-03-16 11:45', modBy: '陈刚', version: 'V1', ext: 'xlsx' },
      ]},
      { id: 'uf-compA-liab',    label: '03 负债类',    color: '#F59E0B', files: [
        { name: '应付账款-A子公司.xlsx',     size: '380 KB', modAt: '2026-03-18 16:00', modBy: '陈刚', version: 'V2', ext: 'xlsx' },
        { name: '长期借款-A子公司.xlsx',     size: '210 KB', modAt: '2026-03-15 09:30', modBy: '张伟', version: 'V1', ext: 'xlsx' },
      ]},
      { id: 'uf-compA-report',  label: '04 审计报告',  color: '#8B5CF6', files: [
        { name: '审计报告初稿-A子公司.docx', size: '1.2 MB', modAt: '2026-03-20 10:30', modBy: '张伟', version: 'V1', ext: 'docx' },
      ]},
      { id: 'uf-compA-deliver', label: '交付文件夹',   color: '#14B8A6', files: [] },
      { id: 'uf-compA-review',  label: '送审文件夹',   color: '#EF4444', files: [] },
    ]
  },
  {
    id: 'uf-compB', label: 'B子公司', color: '#F59E0B',
    children: [
      { id: 'uf-compB-plan',    label: '01 审计计划',  color: '#3B82F6', files: [
        { name: '审计计划-B子公司.docx',     size: '230 KB', modAt: '2026-03-12 09:00', modBy: '李明', version: 'V1', ext: 'docx' },
      ]},
      { id: 'uf-compB-asset',   label: '02 资产类',    color: '#10B981', files: [
        { name: '货币资金-B子公司.xlsx',     size: '350 KB', modAt: '2026-03-16 10:20', modBy: '王芳', version: 'V1', ext: 'xlsx' },
      ]},
      { id: 'uf-compB-liab',    label: '03 负债类',    color: '#F59E0B', files: [] },
      { id: 'uf-compB-report',  label: '04 审计报告',  color: '#8B5CF6', files: [] },
    ]
  },
  {
    id: 'uf-compC', label: 'C子公司', color: '#F59E0B',
    children: [
      { id: 'uf-compC-plan',    label: '01 审计计划',  color: '#3B82F6', files: [] },
      { id: 'uf-compC-asset',   label: '02 资产类',    color: '#10B981', files: [] },
    ]
  },
];

/* 将用户文件夹的 files 注入 DETAIL_FILES */
USER_FOLDERS.forEach(uf => {
  (uf.children || []).forEach(child => {
    if (child.files) DETAIL_FILES[child.id] = child.files;
  });
});

/* 送审文件夹下的子文件夹（用于文件树展示 & 送审关联） */
const REVIEW_SUB_FOLDERS = [
  { id: 'review-sub-1', label: '2025年年报一审送审', color: '#EF4444', files: [
    { name: '审计报告初稿.docx',  size: '1.8 MB', modAt: '2026-03-10 16:00', modBy: '张伟', version: 'V1', ext: 'docx' },
    { name: '财务报表初稿.xlsx',  size: '2.1 MB', modAt: '2026-03-10 14:30', modBy: '王芳', version: 'V1', ext: 'xlsx' },
  ]},
  { id: 'review-sub-2', label: '2025年年报二审送审', color: '#EF4444', files: [
    { name: '审计报告终稿.docx',  size: '2.4 MB', modAt: '2026-03-15 09:30', modBy: '张伟', version: 'V2', ext: 'docx' },
  ]},
  { id: 'review-sub-3', label: '半年报一审送审', color: '#EF4444', files: [] },
];
REVIEW_SUB_FOLDERS.forEach(sf => { DETAIL_FILES[sf.id] = sf.files; });

/* 当前打开的工作区（供账套关联弹窗读取集团信息） */
let currentDetailWs = null;

/* ── 11b. 打开详情页 ── */
function openProjectDetail(ws) {
  currentDetailWs = ws;   /* 保存引用 */

  /* 更新面包屑 */
  const titleEl = document.getElementById('pd-ws-title');
  if (titleEl) titleEl.textContent = ws.name;

  /* 切换面板显示 */
  const panels = ['biz-panel-dashboard', 'biz-panel-projects'];
  panels.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const detail = document.getElementById('biz-panel-project-detail');
  if (detail) detail.style.display = 'flex';

  /* 重置到工作台 Tab + 空文件夹状态 */
  document.querySelectorAll('.pd-tab').forEach(t => t.classList.toggle('active', t.dataset.pdtab === 'worktable'));
  document.querySelectorAll('.pd-tab-panel').forEach(p => p.classList.toggle('active', p.id === 'pd-panel-worktable'));
  showFolderEmpty();

  /* 渲染文件树 */
  renderDetailFileTree(ws);
}

/* ── 11c. 关闭详情页，返回工作区列表 ── */
function closeProjectDetail() {
  const detail = document.getElementById('biz-panel-project-detail');
  if (detail) detail.style.display = 'none';
  const projects = document.getElementById('biz-panel-projects');
  if (projects) {
    projects.style.display = 'flex';
    /* 同步侧边栏激活项 */
    document.querySelectorAll('.sidebar-item[data-nav]').forEach(i => {
      i.classList.toggle('active', i.dataset.nav === 'projects');
    });
  }
}

/* 账套供应商列表（友数聚 / 鼎信诺 / 新纪元 / Excel 账套）*/
const LEDGER_VENDORS = [
  { name: '友数聚',    color: '#6366F1' },
  { name: '鼎信诺',    color: '#3B82F6' },
  { name: '新纪元',    color: '#10B981' },
  { name: 'Excel 账套', color: '#F59E0B' },
];

/* ── 11d. 渲染文件树（根节点 = 工作区名） ── */
function renderDetailFileTree(ws) {
  const treeEl = document.getElementById('pd-file-tree');
  if (!treeEl) return;

  /* ── 1. 账套文件（一级，含子文件夹：友数聚/鼎信诺/新纪元/Excel 账套）── */
  const vendorFoldersHTML = LEDGER_VENDORS.map(v => {
    const hasFiles = (VENDOR_LEDGER_FILES[v.name] || []).length > 0;
    const folderSvg = hasFiles
      ? `<svg class="tree-icon" viewBox="0 0 24 24" fill="${v.color}" width="15" height="15"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`
      : `<svg class="tree-icon" viewBox="0 0 24 24" fill="none" stroke="${v.color}" stroke-width="1.5" width="15" height="15"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`;
    return `
    <div class="tree-node">
      <div class="tree-node-row pd-folder-row pd-ledger-vendor-row"
           data-folder-id="ledger-vendor-${v.name}"
           data-folder-label="${v.name}"
           data-vendor-name="${v.name}"
           style="padding-left:32px;">
        <span style="width:16px;display:inline-block;flex-shrink:0;"></span>
        ${folderSvg}
        <span class="tree-label">${v.name}</span>
      </div>
    </div>`;
  }).join('');

  const ledgerRootHTML = `
    <div class="tree-node pd-ledger-vendor-root">
      <div class="tree-node-row pd-toggle-row pd-ledger-root-row" style="padding-left:16px;">
        <span class="tree-toggle expanded">
          <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><path d="M8 5l8 7-8 7z"/></svg>
        </span>
        <svg class="tree-icon" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" width="15" height="15">
          <ellipse cx="12" cy="5" rx="9" ry="3"/>
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
        </svg>
        <span class="tree-label" style="font-weight:600;color:var(--brand-600,#4F46E5);">账套文件</span>
      </div>
      <div class="tree-children">${vendorFoldersHTML}</div>
    </div>`;

  /* ── 2. 其余 8 个一级文件夹 ── */
  const otherFoldersHTML = DETAIL_FOLDERS.map(f => {
    /* 送审文件夹特殊处理：渲染为可展开的带子文件夹的节点 */
    if (f.id === 'review') {
      const hasSubs = REVIEW_SUB_FOLDERS.length > 0;
      const reviewFolderSvg = hasSubs
        ? `<svg class="tree-icon" viewBox="0 0 24 24" fill="${f.color}" width="15" height="15"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`
        : `<svg class="tree-icon" viewBox="0 0 24 24" fill="none" stroke="${f.color}" stroke-width="1.5" width="15" height="15"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`;
      const subFoldersHTML = REVIEW_SUB_FOLDERS.map(sf => {
        const sfHasFiles = (DETAIL_FILES[sf.id] || []).length > 0;
        const sfSvg = sfHasFiles
          ? `<svg class="tree-icon" viewBox="0 0 24 24" fill="${sf.color}" width="15" height="15"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`
          : `<svg class="tree-icon" viewBox="0 0 24 24" fill="none" stroke="${sf.color}" stroke-width="1.5" width="15" height="15"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`;
        return `
        <div class="tree-node">
          <div class="tree-node-row pd-folder-row pd-review-sub-row"
               data-folder-id="${sf.id}" data-folder-label="${sf.label}" data-folder-name="${sf.label}"
               style="padding-left:32px;">
            <span style="width:16px;display:inline-block;flex-shrink:0;"></span>
            ${sfSvg}
            <span class="tree-label">${sf.label}</span>
          </div>
        </div>`;
      }).join('');
      return `
      <div class="tree-node">
        <div class="tree-node-row pd-toggle-row pd-folder-row pd-review-root-row" data-folder-id="${f.id}" data-folder-label="${f.label}" style="padding-left:16px;">
          <span class="tree-toggle expanded">
            <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><path d="M8 5l8 7-8 7z"/></svg>
          </span>
          ${reviewFolderSvg}
          <span class="tree-label">${f.label}</span>
        </div>
        <div class="tree-children">${subFoldersHTML}</div>
      </div>`;
    }

    const hasFiles = (DETAIL_FILES[f.id] || []).length > 0;
    const folderSvg = hasFiles
      ? `<svg class="tree-icon" viewBox="0 0 24 24" fill="${f.color}" width="15" height="15"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`
      : `<svg class="tree-icon" viewBox="0 0 24 24" fill="none" stroke="${f.color}" stroke-width="1.5" width="15" height="15"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`;
    return `
    <div class="tree-node">
      <div class="tree-node-row pd-folder-row" data-folder-id="${f.id}" data-folder-label="${f.label}" style="padding-left:16px;">
        <span style="width:16px;display:inline-block;flex-shrink:0;"></span>
        ${folderSvg}
        <span class="tree-label">${f.label}</span>
      </div>
    </div>`;
  }).join('');

  /* ── 3. 用户自建文件夹（递归渲染）── */
  function renderUserFolder(folder, depth) {
    const pl = 16 * depth;
    const hasChildren = folder.children && folder.children.length > 0;
    const hasFiles = (DETAIL_FILES[folder.id] || []).length > 0;
    const isFilled = hasChildren || hasFiles;
    const folderSvg = isFilled
      ? `<svg class="tree-icon" viewBox="0 0 24 24" fill="${folder.color}" width="15" height="15"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`
      : `<svg class="tree-icon" viewBox="0 0 24 24" fill="none" stroke="${folder.color}" stroke-width="1.5" width="15" height="15"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`;

    if (hasChildren) {
      const childrenHTML = folder.children.map(c => renderUserFolder(c, depth + 1)).join('');
      return `
      <div class="tree-node">
        <div class="tree-node-row pd-toggle-row pd-user-folder-row" data-folder-name="${folder.label}" style="padding-left:${pl}px;">
          <span class="tree-toggle expanded">
            <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><path d="M8 5l8 7-8 7z"/></svg>
          </span>
          ${folderSvg}
          <span class="tree-label">${folder.label}</span>
        </div>
        <div class="tree-children">${childrenHTML}</div>
      </div>`;
    }
    return `
    <div class="tree-node">
      <div class="tree-node-row pd-folder-row pd-user-folder-row"
           data-folder-id="${folder.id}" data-folder-label="${folder.label}" data-folder-name="${folder.label}"
           style="padding-left:${pl}px;">
        <span style="width:16px;display:inline-block;flex-shrink:0;"></span>
        ${folderSvg}
        <span class="tree-label">${folder.label}</span>
      </div>
    </div>`;
  }

  const userFoldersHTML = USER_FOLDERS.map(uf => renderUserFolder(uf, 1)).join('');

  /* ── 4. 根节点（工作区名称）── */
  const rootLabel = ws.name.split('-').slice(0,2).join('-');
  treeEl.innerHTML = `
    <div class="tree-node">
      <div class="tree-node-row pd-toggle-row pd-root-row" data-folder-name="${rootLabel}" style="padding-left:4px;">
        <span class="tree-toggle expanded">
          <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><path d="M8 5l8 7-8 7z"/></svg>
        </span>
        <svg class="tree-icon" viewBox="0 0 24 24" fill="#6366F1" width="15" height="15">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
        <span class="tree-label" style="font-weight:600;font-size:0.8rem;color:var(--text-primary);">
          ${rootLabel}
        </span>
      </div>
      <div class="tree-children">
        ${ledgerRootHTML}
        ${otherFoldersHTML}
        ${userFoldersHTML}
      </div>
    </div>`;

  /* 展开/折叠（可折叠节点）*/
  treeEl.querySelectorAll('.pd-toggle-row').forEach(row => {
    row.addEventListener('click', () => {
      const toggle = row.querySelector('.tree-toggle');
      const children = row.nextElementSibling;
      if (!children) return;
      const isOpen = toggle.classList.contains('expanded');
      toggle.classList.toggle('expanded', !isOpen);
      children.style.display = isOpen ? 'none' : '';
    });
  });

  /* 文件夹点击 → 显示文件列表（左键） */
  treeEl.querySelectorAll('.pd-folder-row').forEach(row => {
    row.addEventListener('click', (e) => {
      e.stopPropagation();
      treeEl.querySelectorAll('.pd-folder-row').forEach(r => r.classList.remove('selected'));
      row.classList.add('selected');
      showFolderContent(row.dataset.folderId, row.dataset.folderLabel);
    });
  });

  /* ── 右键菜单绑定 ── */

  /* 1. 根文件夹：只能"新建子文件夹" */
  const rootRow = treeEl.querySelector('.pd-root-row');
  if (rootRow) {
    rootRow.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showTreeFolderContextMenu(e.clientX, e.clientY, rootRow.dataset.folderName, 'root');
    });
  }

  /* 2. "账套文件"：无右键功能，屏蔽默认菜单 */
  const ledgerRoot = treeEl.querySelector('.pd-ledger-root-row');
  if (ledgerRoot) {
    ledgerRoot.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  }

  /* 3. 账套子文件夹（友数聚 / 鼎信诺 / 新纪元 / Excel 账套）：新建/上传文件/上传文件夹 */
  treeEl.querySelectorAll('.pd-ledger-vendor-row').forEach(row => {
    row.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showTreeFolderContextMenu(e.clientX, e.clientY, row.dataset.vendorName, 'vendor-sub');
    });
  });

  /* 4. 其余 8 个一级文件夹：新建/上传文件/上传文件夹 */
  treeEl.querySelectorAll('.pd-folder-row:not(.pd-ledger-vendor-row):not(.pd-user-folder-row):not(.pd-review-root-row):not(.pd-review-sub-row)').forEach(row => {
    row.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showTreeFolderContextMenu(e.clientX, e.clientY, row.dataset.folderLabel, 'top-folder');
    });
  });

  /* 5. 用户自建文件夹（含可展开的父级和叶子级）：新建/上传文件/上传文件夹 */
  treeEl.querySelectorAll('.pd-user-folder-row').forEach(row => {
    row.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showTreeFolderContextMenu(e.clientX, e.clientY, row.dataset.folderName, 'user-folder');
    });
  });

  /* 6. 送审文件夹根节点右键 */
  const reviewRootRow = treeEl.querySelector('.pd-review-root-row');
  if (reviewRootRow) {
    reviewRootRow.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showTreeFolderContextMenu(e.clientX, e.clientY, reviewRootRow.dataset.folderLabel, 'top-folder');
    });
  }

  /* 7. 送审子文件夹右键 */
  treeEl.querySelectorAll('.pd-review-sub-row').forEach(row => {
    row.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showTreeFolderContextMenu(e.clientX, e.clientY, row.dataset.folderName, 'review-sub', row.dataset.folderId);
    });
  });
}

/* ─────────────────────────────────────────────────────
   供应商账套文件 mock 数据
   ───────────────────────────────────────────────────── */
const VENDOR_LEDGER_FILES = {
  '友数聚': [
    { name: '比亚迪汽车（广东）-2025年度账套.zip', size: '128.4 MB', modBy: '张伟', modAt: '2026-03-10 14:22', version: 'v2', status: 'latest',   ledgerId: 'LS009' },
    { name: '比亚迪汽车（广东）-2024年度账套.zip', size: '96.1 MB',  modBy: '李明', modAt: '2025-12-18 09:47', version: 'v1', status: 'latest',   ledgerId: 'LS010' },
  ],
  '鼎信诺': [
    { name: '中国比亚迪-2025年度账套.dat',       size: '215.7 MB', modBy: '王芳', modAt: '2026-03-05 16:33', version: 'v2', status: 'latest',   ledgerId: 'LS011' },
    { name: '中国比亚迪-2024年度账套.dat',       size: '182.4 MB', modBy: '王芳', modAt: '2025-12-10 14:08', version: 'v1', status: 'latest',   ledgerId: 'LS012' },
  ],
  '新纪元': [
    { name: '比亚迪新材料-2025年度账套.dat',     size: '74.3 MB',  modBy: '陈刚', modAt: '2026-02-22 11:08', version: 'v2', status: 'latest',   ledgerId: 'LS013' },
    { name: '比亚迪新材料-2024年度账套.dat',     size: '52.8 MB',  modBy: '陈刚', modAt: '2025-11-28 16:55', version: 'v1', status: 'latest',   ledgerId: 'LS014' },
  ],
  'Excel 账套': [
    { name: '比亚迪汽车（广东）-科目余额表-2025.xlsx', size: '8.6 MB', modBy: '李明', modAt: '2026-03-12 10:15', version: 'v1', status: 'latest', ledgerId: 'LS015' },
    { name: '比亚迪汽车（广东）-序时账-2025.xlsx',     size: '32.1 MB', modBy: '李明', modAt: '2026-03-12 10:18', version: 'v1', status: 'latest', ledgerId: 'LS016' },
  ],
};

const VENDOR_STATUS_MAP = {
  latest:   { label: '最新版本', cls: 'vl-status-latest'   },
  archived: { label: '已归档',   cls: 'vl-status-archived' },
};

/* ── 11e-v. 供应商账套文件夹内容视图 ── */
function showVendorLedgerContent(vendorName) {
  document.getElementById('pd-folder-empty').style.display   = 'none';
  document.getElementById('pd-folder-content').style.display = 'flex';
  document.getElementById('pd-folder-title').textContent     = vendorName;

  const theadRow = document.getElementById('pd-file-thead-row');
  if (theadRow) {
    theadRow.innerHTML = `
      <th style="min-width:200px;">文件名</th>
      <th style="width:90px;">大小</th>
      <th style="width:70px;">修改人</th>
      <th style="width:140px;">修改时间</th>
      <th style="width:80px;">当前版本</th>
      <th style="width:140px;text-align:center;">操作</th>`;
  }

  const files    = VENDOR_LEDGER_FILES[vendorName] || [];
  const tbody    = document.getElementById('pd-file-tbody');
  const emptyEl  = document.getElementById('pd-table-empty');
  const emptyMsg = document.getElementById('pd-table-empty-msg');

  if (files.length === 0) {
    tbody.innerHTML = '';
    if (emptyMsg) emptyMsg.textContent = vendorName + ' 暂无账套，右键文件夹选择「上传账套」';
    emptyEl.style.display = 'block';
  } else {
    emptyEl.style.display = 'none';
    tbody.innerHTML = files.map(f => `
        <tr data-row-type="file" data-row-name="${f.name}">
          <td>
            <div class="pd-fname-cell">
              <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.5" stroke-linecap="round" width="15" height="15" style="flex-shrink:0;">
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
              </svg>
              <span class="pd-file-name" title="${f.name}">${f.name}</span>
            </div>
          </td>
          <td class="vl-secondary">${f.size}</td>
          <td>${f.modBy}</td>
          <td class="vl-secondary vl-mono">${f.modAt}</td>
          <td><span class="vl-version-badge">${f.version}</span></td>
          <td>
            <div class="vl-ops-cell">
              <button class="vl-op-btn" data-tip="下载">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </button>
              <button class="vl-op-btn" data-tip="上传新版本">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </button>
              <button class="vl-op-btn" data-tip="重命名">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14">
                  <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
                </svg>
              </button>
              <button class="vl-op-btn vl-op-view" data-tip="查账">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>`).join('');
    bindFileListContextMenu();
  }
}

/* ── 11e. 显示文件夹内容 ── */
function showFolderContent(folderId, folderLabel) {
  if (folderId.startsWith('ledger-vendor-')) {
    showVendorLedgerContent(folderLabel);
    return;
  }

  document.getElementById('pd-folder-empty').style.display = 'none';
  document.getElementById('pd-folder-content').style.display = 'flex';
  document.getElementById('pd-folder-title').textContent = folderLabel;

  const theadRow = document.getElementById('pd-file-thead-row');
  if (theadRow) {
    theadRow.innerHTML = `
      <th style="min-width:200px;">文件名</th>
      <th style="width:90px;">大小</th>
      <th style="width:70px;">修改人</th>
      <th style="width:140px;">修改时间</th>
      <th style="width:80px;">当前版本</th>
      <th style="width:120px;text-align:center;">操作</th>`;
  }
  const emptyMsg = document.getElementById('pd-table-empty-msg');
  if (emptyMsg) emptyMsg.textContent = '该文件夹暂无文件，点击右上角新建';

  const files = DETAIL_FILES[folderId] || [];
  const tbody = document.getElementById('pd-file-tbody');
  const emptyEl = document.getElementById('pd-table-empty');

  if (files.length === 0) {
    tbody.innerHTML = '';
    emptyEl.style.display = 'block';
  } else {
    emptyEl.style.display = 'none';
    tbody.innerHTML = files.map(f => `
        <tr data-row-type="file" data-row-name="${f.name}">
          <td>
            <div class="pd-fname-cell">
              <span class="pd-file-ext ${f.ext}">${f.ext.toUpperCase()}</span>
              <span class="pd-file-name" title="${f.name}">${f.name}</span>
            </div>
          </td>
          <td style="color:var(--text-secondary);">${f.size}</td>
          <td>${f.modBy}</td>
          <td style="color:var(--text-secondary);font-family:'SF Mono','Menlo',monospace;font-size:0.8rem;">${f.modAt}</td>
          <td><span class="vl-version-badge">${f.version || '—'}</span></td>
          <td>
            <div class="vl-ops-cell">
              <button class="vl-op-btn" data-tip="下载">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </button>
              <button class="vl-op-btn" data-tip="上传新版本">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </button>
              <button class="vl-op-btn" data-tip="重命名">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14">
                  <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>`).join('');
    bindFileListContextMenu();
  }
}

/* ── 11f. 重置到空文件夹状态 ── */
function showFolderEmpty() {
  const emptyEl   = document.getElementById('pd-folder-empty');
  const contentEl = document.getElementById('pd-folder-content');
  if (emptyEl)   emptyEl.style.display = 'flex';
  if (contentEl) contentEl.style.display = 'none';
}

/* ── 11g. 初始化详情页交互 ── */
function initProjectDetail() {
  /* 面包屑返回按钮 */
  document.getElementById('pd-back-btn')?.addEventListener('click', closeProjectDetail);

  /* Tab 切换 */
  document.querySelectorAll('.pd-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.pdtab;
      document.querySelectorAll('.pd-tab').forEach(t => t.classList.toggle('active', t === tab));
      document.querySelectorAll('.pd-tab-panel').forEach(p => {
        p.classList.toggle('active', p.id === `pd-panel-${target}`);
      });
      /* 非工作台 Tab：隐藏文件目录侧边栏，获取全宽 */
      const body = document.querySelector('.pd-body');
      if (body) body.classList.toggle('pm-fullwidth', target !== 'worktable');
      /* 进入成员 Tab 时渲染成员模块 */
      if (target === 'members') pmRenderAll();
      /* 进入送审管理 Tab 时渲染 */
      if (target === 'review' && typeof rvRenderMgrPanel === 'function') rvRenderMgrPanel();
    });
  });

  /* 顶部人形图标 — 快速跳到「项目成员」Tab */
  document.getElementById('btn-members-icon')?.addEventListener('click', () => {
    const membersTab = document.getElementById('pd-tab-members');
    if (membersTab) membersTab.click();
  });
}


/* ══════════════════════════════════════════════════════════
   12. 账套中心模块
   ══════════════════════════════════════════════════════════ */

/* ── 12a. 账套表格 Mock 数据 ── */
const LEDGER_DATA = [
  {
    id: 'LS001',
    name: '2025年报-友数聚-中国石化主体',
    group: '中国石化集团',
    entity: '中国石油化工股份有限公司',
    period: '2025年度',
    uploader: '张明远',
    dept: '前海五部',
    type: 'online',
    versions: [2],
  },
  {
    id: 'LS002',
    name: '2025年报-用友U8-华润万象城',
    group: '华润集团',
    entity: '华润商业地产有限公司',
    period: '2025年度',
    uploader: '李晓燕',
    dept: '北京四部',
    type: 'local',
    versions: [1],
  },
  {
    id: 'LS003',
    name: '2024年报-新纪元-中铁建设',
    group: '中国铁建股份',
    entity: '中铁建设集团有限公司',
    period: '2024年度',
    uploader: '王建国',
    dept: '上海二部',
    type: 'local',
    versions: [1],
  },
  {
    id: 'LS004',
    name: '2025年报-鼎信诺-中粮肉食',
    group: '中粮集团',
    entity: '中粮肉食投资有限公司',
    period: '2025年度',
    uploader: '赵思远',
    dept: '广州一部',
    type: 'local',
    versions: [1],
  },
  {
    id: 'LS005',
    name: '2025年报-友数聚-招商蛇口A',
    group: '招商局集团',
    entity: '招商局蛇口工业区控股股份',
    period: '2025年度',
    uploader: '陈梅',
    dept: '前海五部',
    type: 'online',
    versions: [3],
  },
  {
    id: 'LS006',
    name: '2025年报-友数聚-招商蛇口B',
    group: '招商局集团',
    entity: '招商局置地（深圳）有限公司',
    period: '2025年度',
    uploader: '陈梅',
    dept: '前海五部',
    type: 'online',
    versions: [1],
  },
  {
    id: 'LS007',
    name: '2024年报-金蝶EAS-国家电网南网',
    group: '南方电网',
    entity: '南方电网科技股份有限公司',
    period: '2024年度',
    uploader: '林志强',
    dept: '北京四部',
    type: 'local',
    versions: [1],
  },
  {
    id: 'LS008',
    name: '2025中期-用友NC-中建三局',
    group: '中国建筑集团',
    entity: '中国建筑第三工程局有限公司',
    period: '2025中期',
    uploader: '刘雨婷',
    dept: '上海二部',
    type: 'local',
    versions: [2],
  },
  /* ── 友数聚来源账套 · 比亚迪汽车（广东）── 在线查账 ── */
  {
    id: 'LS009',
    name: '2025年报-友数聚-比亚迪汽车广东',
    group: '中国比亚迪',
    entity: '比亚迪汽车（广东）有限公司',
    period: '2025年度',
    uploader: '张伟',
    dept: '审计一部',
    type: 'online',
    versions: [2],
  },
  {
    id: 'LS010',
    name: '2024年报-友数聚-比亚迪汽车广东',
    group: '中国比亚迪',
    entity: '比亚迪汽车（广东）有限公司',
    period: '2024年度',
    uploader: '李明',
    dept: '审计一部',
    type: 'online',
    versions: [1],
  },
  /* ── 鼎信诺来源账套 · 中国比亚迪 ── 本地查账 ── */
  {
    id: 'LS011',
    name: '2025年报-鼎信诺-比亚迪主体',
    group: '中国比亚迪',
    entity: '中国比亚迪有限公司',
    period: '2025年度',
    uploader: '王芳',
    dept: '审计一部',
    type: 'local',
    versions: [2],
  },
  {
    id: 'LS012',
    name: '2024年报-鼎信诺-比亚迪主体',
    group: '中国比亚迪',
    entity: '中国比亚迪有限公司',
    period: '2024年度',
    uploader: '王芳',
    dept: '审计一部',
    type: 'local',
    versions: [1],
  },
  /* ── 新纪元来源账套 · 比亚迪新材料 ── 本地查账 ── */
  {
    id: 'LS013',
    name: '2025年报-新纪元-比亚迪新材料',
    group: '中国比亚迪',
    entity: '比亚迪新材料有限公司',
    period: '2025年度',
    uploader: '陈刚',
    dept: '审计一部',
    type: 'local',
    versions: [2],
  },
  {
    id: 'LS014',
    name: '2024年报-新纪元-比亚迪新材料',
    group: '中国比亚迪',
    entity: '比亚迪新材料有限公司',
    period: '2024年度',
    uploader: '陈刚',
    dept: '审计一部',
    type: 'local',
    versions: [1],
  },
];

/* ── 12b. 弹窗内 - 友数聚在线账套 Mock 数据 ── */

/* ── 12c. 渲染账套表格 ── */
function renderLedgerTable(filter = {}) {
  const tbody = document.getElementById('lc-table-body');
  const emptyEl = document.getElementById('lc-table-empty');
  if (!tbody) return;

  /* 筛选 */
  const keyword = (filter.keyword || '').toLowerCase();
  const period  = filter.period  || '';
  const dept    = filter.dept    || '';
  const type    = filter.type    || '';

  const list = LEDGER_DATA.filter(r => {
    if (keyword && !r.name.toLowerCase().includes(keyword) &&
        !r.group.toLowerCase().includes(keyword) &&
        !r.entity.toLowerCase().includes(keyword)) return false;
    if (period && r.period !== period) return false;
    if (dept   && r.dept   !== dept)   return false;
    if (type   && r.type   !== type)   return false;
    return true;
  });

  if (list.length === 0) {
    tbody.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'flex';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  tbody.innerHTML = list.map(r => `
    <tr class="lc-row" data-id="${r.id}">
      <td>
        <div class="lc-name-cell">
          <span class="lc-type-badge lc-type-${r.type}">${r.type === 'online' ? '在线' : '本地'}</span>
          <span class="lc-name-text" title="${r.name}">${r.name}</span>
        </div>
      </td>
      <td class="lc-td-group">${r.group}</td>
      <td class="lc-td-entity" title="${r.entity}">${r.entity}</td>
      <td><span class="lc-period-tag">${r.period}</span></td>
      <td>
        <div class="lc-uploader">
          <div class="lc-avatar">${r.uploader.charAt(0)}</div>
          <span>${r.uploader}</span>
        </div>
      </td>
      <td><span class="lc-dept-tag">${r.dept}</span></td>
      <td>
        <div class="lc-actions">
          <button class="lc-btn lc-btn-edit" data-id="${r.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="13" height="13">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            编辑
          </button>
          <button class="lc-btn lc-btn-online ${r.type !== 'online' ? 'lc-btn-disabled' : ''}" data-id="${r.id}" ${r.type !== 'online' ? 'disabled title="仅在线账套可用"' : ''}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="13" height="13">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            在线查账
          </button>
          <button class="lc-btn lc-btn-local" data-id="${r.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="13" height="13">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            本地查账
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}


/* ── 12d. 账套中心筛选交互 ── */
function initLedgerFilters() {
  const searchInput = document.getElementById('lc-search');
  const periodSel   = document.getElementById('lc-filter-period');
  const deptSel     = document.getElementById('lc-filter-dept');
  const typeSel     = document.getElementById('lc-filter-type');

  function applyFilter() {
    renderLedgerTable({
      keyword: searchInput?.value || '',
      period:  periodSel?.value  || '',
      dept:    deptSel?.value    || '',
      type:    typeSel?.value    || '',
    });
  }

  searchInput?.addEventListener('input', applyFilter);
  periodSel?.addEventListener('change', applyFilter);
  deptSel?.addEventListener('change',   applyFilter);
  typeSel?.addEventListener('change',   applyFilter);
}


/* ══════════════════════════════════════════════════════════
   13. 工作区详情 — 账套关联模块（双面板多对多 v2）
   左侧：工作区所属公司列表；右侧：账套勾选
   关联关系：company -> Set<ledgerId>，多对多
   ══════════════════════════════════════════════════════════ */

/* ── 13a. 运行时状态 ── */
const laState = {
  ws:              null,   // 当前工作区对象
  companies:       [],     // 来自 ws.projectEntities
  ledgers:         [],     // LEDGER_DATA 按集团过滤后的可用账套
  selectedCompany: null,   // 当前在左侧选中的公司名
  /* pendingMap: { company: { [key]: { ledgerId, version, startPeriod, endPeriod } } }
     多选模型：每家公司可勾选多条版本行，key = "ledgerId|version" */
  pendingMap:      {},
};

/* ── 13b. 初始化弹窗事件 ── */
function initLedgerAssocModal() {
  const modal      = document.getElementById('ws-ledger-assoc-modal');
  const openBtn    = document.getElementById('btn-ledger-assoc');
  const closeBtn   = document.getElementById('la-modal-close');
  const cancelBtn  = document.getElementById('la-modal-cancel');
  const confirmBtn = document.getElementById('la-modal-confirm');
  if (!modal) return;

  /* 打开：从当前工作区初始化状态 */
  openBtn?.addEventListener('click', () => {
    if (!currentDetailWs) return;
    openLedgerAssocModal(currentDetailWs);
  });

  /* 关闭（放弃未提交的修改） */
  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  /* 确认：校验已勾选行必须填写起止账期 → 写回工作区 */
  confirmBtn?.addEventListener('click', () => {
    let errCompany = null;
    laState.companies.forEach(company => {
      if (errCompany) return;
      Object.values(laState.pendingMap[company] || {}).forEach(sel => {
        if (!errCompany && (!sel.startPeriod || !sel.endPeriod)) errCompany = company;
      });
    });
    if (errCompany) {
      showNotification(`请填写「${errCompany}」已勾选账套的起止账期`);
      return;
    }

    /* 保存 */
    laState.ws.assocMap = {};
    laState.companies.forEach(company => {
      const map = laState.pendingMap[company] || {};
      if (Object.keys(map).length > 0) laState.ws.assocMap[company] = { ...map };
    });

    const totalLinks = Object.values(laState.ws.assocMap)
      .reduce((s, m) => s + Object.keys(m).length, 0);
    closeModal();
    showNotification(totalLinks > 0
      ? `账套关联已保存，共 ${totalLinks} 条关联关系`
      : '账套关联已保存');
  });
}

/* ── 13c. 打开并渲染弹窗内容 ── */
function openLedgerAssocModal(ws) {
  const modal = document.getElementById('ws-ledger-assoc-modal');
  if (!modal) return;

  laState.ws = ws;

  /* 公司列表：来自 projectEntities（兜底用主体公司） */
  laState.companies = Array.isArray(ws.projectEntities) && ws.projectEntities.length > 0
    ? ws.projectEntities
    : (ws.entity ? [ws.entity] : []);

  /* 可用账套：按集团过滤 */
  laState.ledgers = LEDGER_DATA.filter(r => r.group === ws.group);

  /* 初始化 pendingMap（从已保存的 assocMap 深拷贝；多选结构） */
  laState.pendingMap = {};
  laState.companies.forEach(company => {
    const existing = ws.assocMap?.[company];
    /* 兼容旧格式（Array / 单选对象）与新多选格式（{ [key]: selObj }） */
    if (existing && typeof existing === 'object' && !Array.isArray(existing) && !existing.key) {
      laState.pendingMap[company] = { ...existing };
    } else {
      laState.pendingMap[company] = {};
    }
  });

  /* 默认选中第一家公司 */
  laState.selectedCompany = laState.companies[0] || null;

  /* 更新副标题 */
  const subtitleEl = document.getElementById('la-modal-subtitle');
  if (subtitleEl) {
    subtitleEl.textContent =
      `${ws.group} · ${laState.companies.length} 家公司 · ${laState.ledgers.length} 套可用账套`;
  }

  renderLaLeftPanel();
  renderLaRightPanel();
  updateLaChangeHint();

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

/* ── 13d. 渲染左侧公司列表 ── */
function renderLaLeftPanel() {
  const listEl = document.getElementById('la-company-list');
  if (!listEl) return;

  if (laState.companies.length === 0) {
    listEl.innerHTML = `<div class="la-left-empty">该工作区暂无绑定公司</div>`;
    return;
  }

  listEl.innerHTML = laState.companies.map(company => {
    const count    = Object.keys(laState.pendingMap[company] || {}).length;
    const isActive = company === laState.selectedCompany;
    return `
      <div class="la-company-item ${isActive ? 'active' : ''}" data-company="${company.replace(/"/g,'&quot;')}">
        <span class="la-company-name">${company}</span>
        <span class="la-company-badge ${count > 0 ? 'linked' : ''}">${count}</span>
      </div>`;
  }).join('');

  listEl.querySelectorAll('.la-company-item').forEach(item => {
    item.addEventListener('click', () => {
      laState.selectedCompany = item.dataset.company;
      /* 只更新激活状态，不整体重渲染左侧，避免闪烁 */
      listEl.querySelectorAll('.la-company-item').forEach(el =>
        el.classList.toggle('active', el.dataset.company === laState.selectedCompany));
      renderLaRightPanel();
    });
  });
}

/* ── 13e. 渲染右侧账套列表（多选复选框 + 版本行 + 起止账期） ── */
function renderLaRightPanel() {
  const listEl  = document.getElementById('la-ledger-list');
  const titleEl = document.getElementById('la-ledger-panel-title');
  if (!listEl) return;

  if (!laState.selectedCompany) {
    if (titleEl) titleEl.textContent = '账套列表';
    listEl.innerHTML = `<div class="la-right-empty">← 点击左侧公司，查看或配置账套关联</div>`;
    updateLaChangeHint();
    return;
  }

  if (titleEl) titleEl.textContent = '账套列表';

  if (laState.ledgers.length === 0) {
    listEl.innerHTML = `<div class="la-right-empty">当前集团下暂无可用账套，请先上传账套</div>`;
    updateLaChangeHint();
    return;
  }

  const company    = laState.selectedCompany;
  const currentMap = laState.pendingMap[company] || {};

  /* 将每条账套按版本展开为独立行 */
  const versionRows = [];
  laState.ledgers.forEach(ledger => {
    const vers = (ledger.versions && ledger.versions.length > 0) ? ledger.versions : [1];
    vers.forEach(ver => {
      const key        = `${ledger.id}|${ver}`;
      const isChecked  = Object.prototype.hasOwnProperty.call(currentMap, key);
      versionRows.push({ ledger, ver, key, isChecked,
        savedStart: isChecked ? (currentMap[key].startPeriod || '') : '',
        savedEnd:   isChecked ? (currentMap[key].endPeriod   || '') : '',
      });
    });
  });

  /* 表头 + 行列表 */
  listEl.innerHTML = `
    <div class="la-tbl-hd">
      <span class="la-tbl-c-cb"></span>
      <span class="la-tbl-c-name">账套名称</span>
      <span class="la-tbl-c-ver">版本号</span>
      <span class="la-tbl-c-period">起始账期 <em class="la-req">*</em></span>
      <span class="la-tbl-c-sep"></span>
      <span class="la-tbl-c-period">截止账期 <em class="la-req">*</em></span>
    </div>
    ${versionRows.map(({ ledger, ver, key, isChecked, savedStart, savedEnd }) => `
      <div class="la-tbl-row ${isChecked ? 'selected' : ''}" data-key="${key}">
        <span class="la-tbl-c-cb">
          <label class="la-cb-label">
            <input type="checkbox" value="${key}"
              ${isChecked ? 'checked' : ''} class="la-cb-input">
            <span class="la-cb-box"></span>
          </label>
        </span>
        <span class="la-tbl-c-name">
          <span class="lc-type-badge lc-type-${ledger.type}">${ledger.type === 'online' ? '在线' : '本地'}</span>
          <span class="la-name-text" title="${ledger.name}">${ledger.name}</span>
        </span>
        <span class="la-tbl-c-ver">
          <span class="la-ver-badge">V${ver}</span>
        </span>
        <span class="la-tbl-c-period">
          <input type="month" class="la-month-input la-start-input"
            value="${savedStart}" ${isChecked ? '' : 'disabled'}
            placeholder="年-月">
        </span>
        <span class="la-tbl-c-sep">—</span>
        <span class="la-tbl-c-period">
          <input type="month" class="la-month-input la-end-input"
            value="${savedEnd}" ${isChecked ? '' : 'disabled'}
            placeholder="年-月">
        </span>
      </div>`).join('')}`;

  /* 绑定复选框：勾选/取消，同步启用账期输入 */
  listEl.querySelectorAll('.la-cb-input').forEach(cb => {
    cb.addEventListener('change', () => {
      const key              = cb.value;
      const [ledgerId, ver]  = key.split('|');
      const row              = cb.closest('.la-tbl-row');

      if (cb.checked) {
        /* 同一账套若已有其他版本勾选，复用其账期作为默认参考值 */
        const sibling = Object.values(laState.pendingMap[company]).find(
          s => s.ledgerId === ledgerId && (s.startPeriod || s.endPeriod)
        );
        const defaultStart = sibling?.startPeriod || '';
        const defaultEnd   = sibling?.endPeriod   || '';

        laState.pendingMap[company][key] = {
          ledgerId, version: Number(ver),
          startPeriod: defaultStart,
          endPeriod:   defaultEnd,
        };

        row?.classList.add('selected');
        row?.querySelectorAll('.la-month-input').forEach(inp => { inp.disabled = false; });

        /* 若有默认值，回填到 DOM 输入框 */
        if (defaultStart || defaultEnd) {
          const startInp = row?.querySelector('.la-start-input');
          const endInp   = row?.querySelector('.la-end-input');
          if (startInp && defaultStart) startInp.value = defaultStart;
          if (endInp   && defaultEnd)   endInp.value   = defaultEnd;
        }
      } else {
        delete laState.pendingMap[company][key];
        row?.classList.remove('selected');
        row?.querySelectorAll('.la-month-input').forEach(inp => { inp.disabled = true; inp.value = ''; });
      }

      laUpdateCompanyBadge(company);
      updateLaChangeHint();
    });
  });

  /* 绑定账期输入：实时写回 state */
  listEl.querySelectorAll('.la-tbl-row').forEach(row => {
    const key        = row.dataset.key;
    const startInput = row.querySelector('.la-start-input');
    const endInput   = row.querySelector('.la-end-input');
    startInput?.addEventListener('change', () => {
      if (laState.pendingMap[company]?.[key])
        laState.pendingMap[company][key].startPeriod = startInput.value;
    });
    endInput?.addEventListener('change', () => {
      if (laState.pendingMap[company]?.[key])
        laState.pendingMap[company][key].endPeriod = endInput.value;
    });
  });

  updateLaChangeHint();
}

/* 更新左侧指定公司的 badge（显示已勾选数量） */
function laUpdateCompanyBadge(company) {
  const companyEl = document.querySelector(
    `.la-company-item[data-company="${company.replace(/"/g, '&quot;')}"]`
  );
  if (!companyEl) return;
  const badge = companyEl.querySelector('.la-company-badge');
  const count = Object.keys(laState.pendingMap[company] || {}).length;
  if (badge) { badge.textContent = count; badge.classList.toggle('linked', count > 0); }
}

/* ── 13g. 底部变更提示 ── */
function updateLaChangeHint() {
  const hintEl = document.getElementById('la-change-hint');
  if (!hintEl || !laState.ws) return;

  const committed = laState.ws.assocMap || {};
  let changes = 0;
  laState.companies.forEach(company => {
    const p = Object.keys(laState.pendingMap[company] || {}).sort().join(',');
    const c = Object.keys(committed[company]          || {}).sort().join(',');
    if (p !== c) changes++;
  });

  if (changes > 0) {
    hintEl.textContent = `${changes} 家公司的关联已修改，点击「确认」生效`;
    hintEl.style.display = 'block';
  } else {
    hintEl.textContent = '';
    hintEl.style.display = 'none';
  }
}





/* ══════════════════════════════════════════════════════════
   15. 客户管理模块
   功能：展示本部门客户资产，支持按名称/类型/上市状态筛选
   ══════════════════════════════════════════════════════════ */

/* ── 15a. 客户模拟数据（8条，含央企、民企、上市/非上市混合） ── */
const CUSTOMER_DATA = [
  {
    id: 'CU-2025-001',
    group: '中国石化集团',
    name: '中国石油化工股份有限公司',
    type: '中央企业',
    listed: '是',
    exchange: '沪主板',
    ticker: '600028',
  },
  {
    id: 'CU-2025-002',
    group: '中国比亚迪',
    name: '比亚迪汽车（广东）有限公司',
    type: '民营企业',
    listed: '否',
    exchange: '—',
    ticker: '—',
  },
  {
    id: 'CU-2025-003',
    group: '比亚迪股份有限公司',
    name: '比亚迪股份有限公司',
    type: '民营企业',
    listed: '是',
    exchange: '深主板',
    ticker: '002594',
  },
  {
    id: 'CU-2025-004',
    group: '招商局集团',
    name: '招商局蛇口工业区控股股份有限公司',
    type: '中央企业',
    listed: '是',
    exchange: '深主板',
    ticker: '001979',
  },
  {
    id: 'CU-2025-005',
    group: '华为技术有限公司',
    name: '华为技术有限公司',
    type: '民营企业',
    listed: '否',
    exchange: '—',
    ticker: '—',
  },
  {
    id: 'CU-2025-006',
    group: '中粮集团',
    name: '中粮资本控股股份有限公司',
    type: '中央企业',
    listed: '是',
    exchange: '深主板',
    ticker: '002822',
  },
  {
    id: 'CU-2025-007',
    group: '南方电网',
    name: '广东电网有限责任公司',
    type: '国有企业',
    listed: '否',
    exchange: '—',
    ticker: '—',
  },
  {
    id: 'CU-2025-008',
    group: '阿里巴巴集团',
    name: '阿里巴巴（中国）网络技术有限公司',
    type: '民营企业',
    listed: '是',
    exchange: '港交所',
    ticker: '9988.HK',
  },
  /* ── 以下 10 条为关联工作区项目集合清单的扩展主体 ── */
  {
    id: 'CU-2025-009',
    group: '中国比亚迪',
    name: '中国比亚迪有限公司',
    type: '民营企业',
    listed: '是',
    exchange: '港交所',
    ticker: '3333.HK',
  },
  {
    id: 'CU-2025-010',
    group: '中国比亚迪',
    name: '比亚迪新材料有限公司',
    type: '民营企业',
    listed: '是',
    exchange: '港交所',
    ticker: '6666.HK',
  },
  {
    id: 'CU-2025-011',
    group: '中国石化集团',
    name: '中国石化炼化工程（集团）股份有限公司',
    type: '中央企业',
    listed: '是',
    exchange: '港交所',
    ticker: '2386.HK',
  },
  {
    id: 'CU-2025-012',
    group: '中国石化集团',
    name: '石化盈科信息技术有限责任公司',
    type: '中央企业',
    listed: '否',
    exchange: '—',
    ticker: '—',
  },
  {
    id: 'CU-2025-013',
    group: '华为技术有限公司',
    name: '华为软件技术有限公司',
    type: '民营企业',
    listed: '否',
    exchange: '—',
    ticker: '—',
  },
  {
    id: 'CU-2025-014',
    group: '华为技术有限公司',
    name: '华为云计算技术有限公司',
    type: '民营企业',
    listed: '否',
    exchange: '—',
    ticker: '—',
  },
  {
    id: 'CU-2025-015',
    group: '阿里巴巴集团',
    name: '浙江天猫技术有限公司',
    type: '民营企业',
    listed: '否',
    exchange: '—',
    ticker: '—',
  },
  {
    id: 'CU-2025-016',
    group: '阿里巴巴集团',
    name: '菜鸟供应链管理有限公司',
    type: '民营企业',
    listed: '否',
    exchange: '—',
    ticker: '—',
  },
  {
    id: 'CU-2025-017',
    group: '万科企业股份有限公司',
    name: '万科企业股份有限公司',
    type: '民营企业',
    listed: '是',
    exchange: '深主板',
    ticker: '000002',
  },
  {
    id: 'CU-2025-018',
    group: '万科企业股份有限公司',
    name: '深圳市万科房地产有限公司',
    type: '民营企业',
    listed: '否',
    exchange: '—',
    ticker: '—',
  },
  {
    id: 'CU-2025-019',
    group: '万科企业股份有限公司',
    name: '万科物业服务股份有限公司',
    type: '民营企业',
    listed: '否',
    exchange: '—',
    ticker: '—',
  },
  {
    id: 'CU-2025-020',
    group: '万科企业股份有限公司',
    name: '深圳市万科发展有限公司',
    type: '民营企业',
    listed: '否',
    exchange: '—',
    ticker: '—',
  },
  {
    id: 'CU-2025-021',
    group: '比亚迪股份有限公司',
    name: '比亚迪汽车工业有限公司',
    type: '民营企业',
    listed: '否',
    exchange: '—',
    ticker: '—',
  },
  {
    id: 'CU-2025-022',
    group: '比亚迪股份有限公司',
    name: '比亚迪新能源汽车有限公司',
    type: '民营企业',
    listed: '否',
    exchange: '—',
    ticker: '—',
  },
];

/* ── 15b. 分页状态 ── */
const cmPager = { page: 1, pageSize: 10, total: 0, filter: {} };

/* ── 15c. 渲染客户管理表格（含分页） ── */
function renderCustomerTable(filter = cmPager.filter, resetPage = true) {
  const tbody   = document.getElementById('cm-table-body');
  const emptyEl = document.getElementById('cm-table-empty');
  if (!tbody) return;

  /* 保存当前筛选条件 */
  cmPager.filter = filter;
  if (resetPage) cmPager.page = 1;

  const keyword = (filter.keyword || '').trim().toLowerCase();
  const type    = filter.type    || '';
  const listed  = filter.listed  || '';

  const allRows = CUSTOMER_DATA.filter(r => {
    const matchKeyword = !keyword ||
      r.name.toLowerCase().includes(keyword)   ||
      r.group.toLowerCase().includes(keyword)  ||
      r.ticker.toLowerCase().includes(keyword) ||
      r.id.toLowerCase().includes(keyword);
    const matchType   = !type   || r.type   === type;
    const matchListed = !listed || r.listed === listed;
    return matchKeyword && matchType && matchListed;
  });

  cmPager.total = allRows.length;

  if (allRows.length === 0) {
    tbody.innerHTML = '';
    emptyEl.style.display = 'flex';
    renderCustomerPager(0);
    return;
  }
  emptyEl.style.display = 'none';

  /* 分页切片 */
  const start = (cmPager.page - 1) * cmPager.pageSize;
  const rows  = allRows.slice(start, start + cmPager.pageSize);

  tbody.innerHTML = rows.map(r => `
    <tr>
      <td><span class="cm-group-tag">${r.group}</span></td>
      <td>
        <div class="cm-company-cell">
          <span class="cm-company-name">${r.name}</span>
        </div>
      </td>
      <td>${r.level != null && r.level !== '—' ? `<span class="cm-level-badge">${r.level}</span>` : '<span style="color:var(--text-tertiary);">—</span>'}</td>
      <td><span class="cm-type-badge cm-type-${typeCssKey(r.type)}">${r.type}</span></td>
      <td>
        <span class="cm-listed-dot cm-listed-${r.listed === '是' ? 'yes' : 'no'}">
          ${r.listed === '是'
            ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg> 是`
            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="12" height="12"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> 否`}
        </span>
      </td>
      <td>
        ${r.exchange !== '—'
          ? `<span class="cm-exchange-tag">${r.exchange}</span>`
          : `<span style="color:var(--text-tertiary);font-size:0.82rem;">—</span>`}
      </td>
      <td>
        <span class="cm-ticker">${r.ticker !== '—' ? r.ticker : '<span style="color:var(--text-tertiary);">—</span>'}</span>
      </td>
      <td><span class="cm-id">${r.id}</span></td>
      <td>
        <div class="cm-row-actions">
          <button class="cm-action-btn cm-action-edit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="13" height="13">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>编辑
          </button>
          <button class="cm-action-btn cm-action-delete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="13" height="13">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>删除
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  /* 删除按钮 */
  tbody.querySelectorAll('.cm-action-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('tr');
      const name = row.querySelector('.cm-company-name')?.textContent || '该客户';
      if (confirm(`确认删除「${name}」的客户记录？此操作不可撤销。`)) {
        row.style.opacity = '0';
        row.style.transition = 'opacity 0.3s';
        setTimeout(() => { row.remove(); }, 300);
      }
    });
  });

  /* 编辑按钮 */
  tbody.querySelectorAll('.cm-action-edit').forEach(btn => {
    btn.addEventListener('click', () => showNotification('编辑功能即将上线，敬请期待'));
  });

  /* 渲染分页器 */
  renderCustomerPager(allRows.length);
}

/* ── 15d. 渲染分页器 ── */
function renderCustomerPager(total) {
  let pagerEl = document.getElementById('cm-pager');
  if (!pagerEl) return;

  const { page, pageSize } = cmPager;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end   = Math.min(page * pageSize, total);

  /* 生成页码按钮（最多显示 5 个，两侧省略） */
  function pageButtons() {
    if (totalPages <= 1) return '';
    const btns = [];
    const delta = 2;
    const left  = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);

    if (left > 1) {
      btns.push(`<button class="cm-page-btn" data-p="1">1</button>`);
      if (left > 2) btns.push(`<span class="cm-page-ellipsis">…</span>`);
    }
    for (let i = left; i <= right; i++) {
      btns.push(`<button class="cm-page-btn ${i === page ? 'active' : ''}" data-p="${i}">${i}</button>`);
    }
    if (right < totalPages) {
      if (right < totalPages - 1) btns.push(`<span class="cm-page-ellipsis">…</span>`);
      btns.push(`<button class="cm-page-btn" data-p="${totalPages}">${totalPages}</button>`);
    }
    return btns.join('');
  }

  pagerEl.innerHTML = `
    <span class="cm-pager-info">共 <strong>${total}</strong> 条，第 ${start}–${end} 条</span>
    <div class="cm-pager-pages">
      <button class="cm-page-btn cm-page-prev" data-p="${page - 1}" ${page <= 1 ? 'disabled' : ''}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="13" height="13"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      ${pageButtons()}
      <button class="cm-page-btn cm-page-next" data-p="${page + 1}" ${page >= totalPages ? 'disabled' : ''}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="13" height="13"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
    <div class="cm-pager-jump">
      <span>跳至</span>
      <input type="number" class="cm-jump-input" id="cm-jump-input" min="1" max="${totalPages}" placeholder="${page}"/>
      <span>页</span>
      <button class="cm-jump-btn" id="cm-jump-btn">GO</button>
    </div>
  `;

  /* 页码点击 */
  pagerEl.querySelectorAll('.cm-page-btn[data-p]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = parseInt(btn.dataset.p, 10);
      if (isNaN(p) || p < 1 || p > totalPages || p === page) return;
      cmPager.page = p;
      renderCustomerTable(cmPager.filter, false);
    });
  });

  /* 跳转 */
  document.getElementById('cm-jump-btn')?.addEventListener('click', () => {
    const v = parseInt(document.getElementById('cm-jump-input')?.value, 10);
    if (isNaN(v) || v < 1 || v > totalPages) { showNotification(`请输入 1–${totalPages} 之间的页码`); return; }
    cmPager.page = v;
    renderCustomerTable(cmPager.filter, false);
  });
  document.getElementById('cm-jump-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('cm-jump-btn')?.click();
  });
}

/* 企业类型 → CSS key */
function typeCssKey(type) {
  const map = { '中央企业': 'soe', '国有企业': 'gov', '地方国资': 'gov', '民营企业': 'pri', '外资企业': 'fgn' };
  return map[type] || 'pri';
}

/* ── 15c. 初始化客户管理筛选器 ── */
function initCustomerFilters() {
  const searchInput  = document.getElementById('cm-search');
  const typeSel      = document.getElementById('cm-filter-type');
  const listedSel    = document.getElementById('cm-filter-listed');
  const addSingleBtn = document.getElementById('cm-btn-add-single');
  const batchBtn     = document.getElementById('cm-btn-batch-import');

  function applyFilter() {
    renderCustomerTable({
      keyword: searchInput?.value,
      type:    typeSel?.value,
      listed:  listedSel?.value,
    });
  }

  searchInput?.addEventListener('input',  applyFilter);
  typeSel?.addEventListener('change',     applyFilter);
  listedSel?.addEventListener('change',   applyFilter);

  addSingleBtn?.addEventListener('click', () => {
    openAddCustomerModal();
  });
  batchBtn?.addEventListener('click', () => {
    openBatchImportModal();
  });
}


/* ══════════════════════════════════════════════════════════
   16. 客户管理 — 新增单体客户弹窗
   ══════════════════════════════════════════════════════════ */

/* ── 16a. 上市板块多级树数据 ── */
const EXCHANGE_TREE = [
  {
    group: '境内上市', children: [
      { sub: '上交所', items: [
        { label: '主板',   value: '沪主板' },
        { label: '科创板', value: '科创板' },
      ]},
      { sub: '深交所', items: [
        { label: '主板',   value: '深主板' },
        { label: '创业板', value: '创业板' },
      ]},
      { label: '新三板', value: '新三板' },
      { label: '北交所', value: '北交所' },
    ],
  },
  {
    group: '境外上市', children: [
      { label: 'H股',   value: 'H股' },
      { label: '红筹股', value: '红筹股' },
      { label: '美股',   value: '美股' },
      { label: '其他',   value: '境外其他' },
    ],
  },
];

/* ── 16b. 当前选中的板块（Set<value>） ── */
const cacExchangeSelected = new Set();

/* 对外暴露的打开函数，供按钮调用 */
function openAddCustomerModal() {
  const modal = document.getElementById('cm-add-customer-modal');
  if (!modal) return;
  resetAddCustomerForm();
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/* ── 16c. 初始化弹窗 ── */
function initAddCustomerModal() {
  const modal     = document.getElementById('cm-add-customer-modal');
  const closeBtn  = document.getElementById('cac-modal-close');
  const cancelBtn = document.getElementById('cac-modal-cancel');
  const saveBtn   = document.getElementById('cac-modal-save');
  if (!modal) return;

  /* 关闭 */
  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  /* ── 是否上市联动 ── */
  document.querySelectorAll('input[name="cac-listed"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const extra = document.getElementById('cac-listed-extra');
      const isListed = radio.value === '是';
      if (extra) {
        extra.style.display = isListed ? '' : 'none';
        /* 动画打开时渲染下拉树 */
        if (isListed) renderExchangeDropdown();
      }
      /* 更新 radio card 高亮 */
      syncRadioCardStyles();
    });
  });

  /* ── 上市板块下拉开关 ── */
  const excWrap    = document.getElementById('cac-exc-wrap');
  const excTrigger = document.getElementById('cac-exc-trigger');
  const excDropdown= document.getElementById('cac-exc-dropdown');

  excTrigger?.addEventListener('click', () => {
    const isOpen = excWrap?.classList.contains('open');
    excWrap?.classList.toggle('open', !isOpen);
  });

  /* 点击外部关闭下拉 */
  document.addEventListener('click', e => {
    if (excWrap && !excWrap.contains(e.target)) {
      excWrap.classList.remove('open');
    }
  });

  /* ── 保存 ── */
  saveBtn?.addEventListener('click', () => {
    const group   = document.getElementById('cac-group')?.value.trim();
    const name    = document.getElementById('cac-name')?.value.trim();
    const levelRaw = document.getElementById('cac-level')?.value.trim();
    const type    = document.getElementById('cac-type')?.value;
    const listed  = document.querySelector('input[name="cac-listed"]:checked')?.value || '否';
    const ticker  = document.getElementById('cac-ticker')?.value.trim();

    /* ── 校验 ── */
    if (!group)  { highlightError('cac-group',  '请填写所属一级集团公司名称'); return; }
    if (!name)   { highlightError('cac-name',   '请填写公司中文名称'); return; }
    /* 级次：若填写，必须为正整数 */
    if (levelRaw !== '' && levelRaw !== undefined) {
      if (!/^\d+$/.test(levelRaw) || parseInt(levelRaw) < 1) {
        highlightError('cac-level', '级次须为正整数（如 1、2、3）');
        return;
      }
    }
    if (!type)   { highlightError('cac-type',   '请选择企业类型'); return; }

    if (listed === '是') {
      if (cacExchangeSelected.size === 0) {
        const wrap = document.getElementById('cac-exc-wrap');
        wrap?.classList.add('cac-error-shake');
        setTimeout(() => wrap?.classList.remove('cac-error-shake'), 500);
        showNotification('请至少选择一个上市板块');
        return;
      }
      if (!ticker) { highlightError('cac-ticker', '请填写股票代码'); return; }
    }

    /* ── 生成客户 ID ── */
    const year = new Date().getFullYear();
    const seq  = String(CUSTOMER_DATA.length + 1).padStart(3, '0');
    const newId = `CU-${year}-${seq}`;

    /* ── 写入模拟数据 ── */
    const exchanges = [...cacExchangeSelected];
    CUSTOMER_DATA.unshift({
      id:       newId,
      group,
      name,
      level:    levelRaw !== '' ? parseInt(levelRaw) : '—',
      type,
      listed,
      exchange: listed === '是' ? exchanges.join('、') : '—',
      ticker:   listed === '是' ? ticker : '—',
    });

    closeModal();
    showNotification(`✓ 客户添加成功，系统已生成唯一客户 ID：${newId}`);
    /* 刷新表格并跳回第 1 页 */
    renderCustomerTable(cmPager.filter, true);
  });
}

/* ── 16d. 重置表单 ── */
function resetAddCustomerForm() {
  ['cac-group', 'cac-name', 'cac-level', 'cac-ticker'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ''; el.classList.remove('cac-input-error'); }
  });
  const typeSel = document.getElementById('cac-type');
  if (typeSel) { typeSel.value = ''; typeSel.classList.remove('cac-input-error'); }

  /* 重置上市 radio → 否 */
  document.querySelectorAll('input[name="cac-listed"]').forEach(r => {
    r.checked = r.value === '否';
  });
  syncRadioCardStyles();

  /* 隐藏上市额外字段 */
  const extra = document.getElementById('cac-listed-extra');
  if (extra) extra.style.display = 'none';

  /* 清空板块选择 */
  cacExchangeSelected.clear();
  updateExchangeTags();

  /* 关闭集团名称下拉 */
  const groupWrap = document.getElementById('cac-group-wrap');
  if (groupWrap) groupWrap.classList.remove('open');
}

/* ── 16d-2. 所属集团公司名称 — 自动补全（可搜索已有 + 可新增） ── */
function initGroupAutocomplete() {
  const input = document.getElementById('cac-group');
  const wrap  = document.getElementById('cac-group-wrap');
  const dd    = document.getElementById('cac-group-dropdown');
  if (!input || !wrap || !dd) return;

  function getUniqueGroups() {
    const set = new Set();
    CUSTOMER_DATA.forEach(c => { if (c.group && c.group !== '—') set.add(c.group); });
    return [...set].sort();
  }

  function highlightMatch(text, query) {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx < 0) return text;
    return text.slice(0, idx) + '<em>' + text.slice(idx, idx + query.length) + '</em>' + text.slice(idx + query.length);
  }

  function renderDropdown() {
    const query = input.value.trim();
    const groups = getUniqueGroups();
    const filtered = query
      ? groups.filter(g => g.toLowerCase().includes(query.toLowerCase()))
      : groups;

    if (!query && filtered.length === 0) { wrap.classList.remove('open'); return; }

    let html = '';
    filtered.forEach(g => {
      html += `<div class="cac-ac-item" data-value="${g}">${highlightMatch(g, query)}</div>`;
    });

    const exactMatch = groups.some(g => g === query);
    if (query && !exactMatch) {
      html += `<div class="cac-ac-new" data-value="${query}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="13" height="13"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        新增「${query}」</div>`;
    }

    if (!html && !query) { wrap.classList.remove('open'); return; }
    if (!html) { wrap.classList.remove('open'); return; }

    dd.innerHTML = html;
    wrap.classList.add('open');
  }

  input.addEventListener('input', renderDropdown);
  input.addEventListener('focus', renderDropdown);

  dd.addEventListener('click', e => {
    const item = e.target.closest('.cac-ac-item, .cac-ac-new');
    if (!item) return;
    input.value = item.dataset.value;
    wrap.classList.remove('open');
    input.classList.remove('cac-input-error');
  });

  document.addEventListener('click', e => {
    if (!wrap.contains(e.target)) wrap.classList.remove('open');
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') wrap.classList.remove('open');
    if (e.key === 'Enter') {
      const active = dd.querySelector('.cac-ac-item.active, .cac-ac-item:hover');
      if (active) { input.value = active.dataset.value; wrap.classList.remove('open'); e.preventDefault(); }
      else wrap.classList.remove('open');
    }
  });
}

/* ── 16e. 同步 radio card 高亮样式 ── */
function syncRadioCardStyles() {
  document.querySelectorAll('#cac-listed-group .cac-radio-card').forEach(card => {
    const radio = card.querySelector('input[type=radio]');
    card.classList.toggle('checked', radio?.checked || false);
  });
}

/* ── 16f. 渲染上市板块多级下拉树 ── */
function renderExchangeDropdown() {
  const dropdown = document.getElementById('cac-exc-dropdown');
  if (!dropdown || dropdown.dataset.rendered) return;
  dropdown.dataset.rendered = '1';

  dropdown.innerHTML = EXCHANGE_TREE.map(groupNode => `
    <div class="cac-exc-group">
      <div class="cac-exc-group-label">${groupNode.group}</div>
      ${groupNode.children.map(child => {
        /* 有子分类（上交所/深交所）*/
        if (child.sub) {
          return `
            <div class="cac-exc-sub-group">
              <div class="cac-exc-sub-label">${child.sub}</div>
              ${child.items.map(item => excItemHTML(item)).join('')}
            </div>`;
        }
        /* 直接叶子（新三板/北交所 等）*/
        return excItemHTML(child);
      }).join('')}
    </div>
  `).join('');

  /* 绑定 checkbox 事件 */
  dropdown.querySelectorAll('.cac-exc-cb').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) cacExchangeSelected.add(cb.value);
      else            cacExchangeSelected.delete(cb.value);
      updateExchangeTags();
    });
  });
}

function excItemHTML(item) {
  const checked = cacExchangeSelected.has(item.value) ? 'checked' : '';
  return `
    <label class="cac-exc-item">
      <input type="checkbox" class="cac-exc-cb" value="${item.value}" ${checked}/>
      <span class="cac-exc-item-label">${item.label}</span>
    </label>`;
}

/* ── 16g. 更新板块 tags 显示 ── */
function updateExchangeTags() {
  const tagsEl      = document.getElementById('cac-exc-tags');
  const placeholder = document.getElementById('cac-exc-placeholder');
  if (!tagsEl) return;

  /* 清除旧 tags，保留 placeholder */
  tagsEl.querySelectorAll('.cac-exc-tag').forEach(t => t.remove());

  if (cacExchangeSelected.size === 0) {
    if (placeholder) placeholder.style.display = '';
  } else {
    if (placeholder) placeholder.style.display = 'none';
    [...cacExchangeSelected].forEach(val => {
      const tag = document.createElement('span');
      tag.className = 'cac-exc-tag';
      tag.innerHTML = `${val}<button class="cac-exc-tag-del" data-val="${val}" tabindex="-1">×</button>`;
      tag.querySelector('.cac-exc-tag-del')?.addEventListener('click', e => {
        e.stopPropagation();
        cacExchangeSelected.delete(val);
        /* 同步 checkbox */
        const cb = document.querySelector(`.cac-exc-cb[value="${val}"]`);
        if (cb) cb.checked = false;
        updateExchangeTags();
      });
      tagsEl.appendChild(tag);
    });
  }
}

/* ── 16h. 输入框错误高亮 ── */
function highlightError(id, msg) {
  const el = document.getElementById(id);
  el?.classList.add('cac-input-error');
  el?.focus();
  el?.addEventListener('input', () => el.classList.remove('cac-input-error'), { once: true });
  showNotification(msg);
}


/* ══════════════════════════════════════════════════════════
   17. 客户管理 — 批量导入全级次客户弹窗
   ══════════════════════════════════════════════════════════ */

/* 对外暴露的打开函数 */
function openBatchImportModal() {
  const modal = document.getElementById('cm-batch-import-modal');
  if (!modal) return;
  resetBatchImportModal();
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/* 批量导入 — 模拟数据（演示用，模拟用户上传的 Excel 数据） */
const CBI_DEMO_ROWS = [
  { group:'中国石化集团', name:'中国石化润滑油有限公司', level:'2', type:'中央企业', listed:'否', exchange:'', ticker:'' },
  { group:'中国石化集团', name:'石化盈科信息技术有限责任公司', level:'3', type:'中央企业', listed:'否', exchange:'', ticker:'' },
  { group:'招商局集团', name:'招商局港口集团股份有限公司', level:'2', type:'中央企业', listed:'是', exchange:'境内上市-深交所-主板', ticker:'001872' },
  { group:'招商局集团', name:'招商银行股份有限公司', level:'2', type:'中央企业', listed:'是', exchange:'境内上市-上交所-主板,境外上市-H股', ticker:'600036,3968.HK' },
  { group:'华为技术有限公司', name:'华为云计算技术有限公司', level:'2', type:'民营企业', listed:'否', exchange:'', ticker:'' },
  { group:'华为技术有限公司', name:'海思半导体有限公司', level:'2', type:'民营企业', listed:'否', exchange:'', ticker:'' },
  { group:'中粮集团', name:'中粮粮谷控股有限公司', level:'2', type:'中央企业', listed:'否', exchange:'', ticker:'' },
  { group:'腾讯控股有限公司', name:'腾讯科技（深圳）有限公司', level:'2', type:'民营企业', listed:'否', exchange:'', ticker:'' },
  { group:'腾讯控股有限公司', name:'微信支付科技有限公司', level:'3', type:'民营企业', listed:'否', exchange:'', ticker:'' },
  { group:'万科企业集团', name:'万科物业发展股份有限公司', level:'2', type:'民营企业', listed:'否', exchange:'', ticker:'' },
  { group:'', name:'格式错误示例行（缺少集团名称）', level:'', type:'民营企业', listed:'否', exchange:'', ticker:'' },
  { group:'中国平安', name:'', level:'', type:'中央企业', listed:'否', exchange:'', ticker:'' },
];

function initBatchImportModal() {
  const modal      = document.getElementById('cm-batch-import-modal');
  const closeBtn   = document.getElementById('cbi-modal-close');
  const cancelBtn  = document.getElementById('cbi-modal-cancel');
  const importBtn  = document.getElementById('cbi-modal-import');
  const dropzone   = document.getElementById('cbi-dropzone');
  const fileInput  = document.getElementById('cbi-file-input');
  const dzBtn      = document.getElementById('cbi-dz-btn');
  const removeBtn  = document.getElementById('cbi-file-remove');
  const tplLink    = document.getElementById('cbi-download-tpl');
  if (!modal) return;

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  /* ── 下载标准导入模板（生成 CSV） ── */
  tplLink?.addEventListener('click', e => {
    e.preventDefault();
    const BOM = '\uFEFF';
    const header = '所属集团公司名称,公司中文名称,级次（选填）,企业类型,是否上市公司,上市板块,股票代码';
    const instructions = [
      '',
      '填写说明：',
      '1、所属集团公司名称：请输入集团公司全称',
      '2、公司中文名称：请输入与工商注册/交易所/证监会一致的标准全称，注意区分中英文括号',
      '3、级次（选填）：请输入整数（如：1、2、3）',
      '4、企业类型：中央企业、地方国资、民营企业、外资企业、其他',
      '5、是否上市公司：是、否（若否，无需填写上市板块和股票代码）',
      '6、上市板块（可多选，使用英文逗号分隔）：境内上市-上交所-主板；境内上市-上交所-科创板；境内上市-深交所-创业板；境内上市-深交所-主板；境内上市-新三板；境内上市-北交所；境外上市-H股；境外上市-红筹股；境外上市-美股；境外上市-其他',
      '7、股票代码：填写相应上市板块的股票代码，使用英文逗号分隔',
    ];
    const example = '中国石化集团,中国石化润滑油有限公司,2,中央企业,否,,';
    const csv = BOM + header + '\n' + example + '\n' + instructions.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = '标准客户导入模板.csv'; a.click();
    URL.revokeObjectURL(url);
  });

  dzBtn?.addEventListener('click', () => fileInput?.click());

  dropzone?.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('dragging'); });
  dropzone?.addEventListener('dragleave', e => { if (!dropzone.contains(e.relatedTarget)) dropzone.classList.remove('dragging'); });
  dropzone?.addEventListener('drop', e => {
    e.preventDefault(); dropzone.classList.remove('dragging');
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFileSelected(file);
  });

  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) handleFileSelected(file);
    fileInput.value = '';
  });

  removeBtn?.addEventListener('click', resetToIdle);

  importBtn?.addEventListener('click', () => {
    importBtn.disabled = true;
    simulateImportProgress(() => {
      const result = batchInsertDemoRows();
      switchToResultView(result);
    });
  });

  /* ════ 内部函数 ════ */

  function handleFileSelected(file) {
    const allowed = ['.xls', '.xlsx', '.csv'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) { showNotification('仅支持 .xls、.xlsx、.csv 格式文件'); return; }
    document.getElementById('cbi-file-name').textContent = file.name;
    document.getElementById('cbi-file-size').textContent = formatFileSize(file.size);
    document.getElementById('cbi-dz-idle').style.display = 'none';
    document.getElementById('cbi-dz-selected').style.display = '';
    if (importBtn) importBtn.style.display = '';
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function resetToIdle() {
    document.getElementById('cbi-dz-idle').style.display = '';
    document.getElementById('cbi-dz-selected').style.display = 'none';
    document.getElementById('cbi-progress-bar').style.width = '0%';
    document.getElementById('cbi-progress-pct').textContent = '0%';
    document.getElementById('cbi-progress-label').textContent = '正在解析文件…';
    if (importBtn) { importBtn.style.display = 'none'; importBtn.disabled = false; }
  }

  function simulateImportProgress(onComplete) {
    const bar = document.getElementById('cbi-progress-bar');
    const pct = document.getElementById('cbi-progress-pct');
    const label = document.getElementById('cbi-progress-label');
    const progWrap = document.getElementById('cbi-progress-wrap');
    if (progWrap) progWrap.style.display = '';
    const stages = [
      { target: 30, label: '正在解析文件结构…', duration: 600 },
      { target: 65, label: '正在校验数据格式…', duration: 700 },
      { target: 88, label: '正在写入客户数据…', duration: 800 },
      { target: 100, label: '导入完成', duration: 400 },
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
        else { current = stage.target; setTimeout(() => runStage(idx + 1), 120); }
      }
      requestAnimationFrame(tick);
    }
    runStage(0);
  }

  /* 批量写入演示数据 */
  function batchInsertDemoRows() {
    const VALID_TYPES = ['中央企业','地方国资','民营企业','外资企业','其他'];
    let success = 0, fail = 0;
    const failRows = [];

    CBI_DEMO_ROWS.forEach((row, i) => {
      const errors = [];
      if (!row.group) errors.push('缺少所属集团公司名称');
      if (!row.name)  errors.push('缺少公司中文名称');
      if (!VALID_TYPES.includes(row.type)) errors.push('企业类型不合法');
      if (row.listed === '是' && !row.exchange) errors.push('上市公司缺少上市板块');
      if (row.listed === '是' && !row.ticker)   errors.push('上市公司缺少股票代码');

      if (errors.length) {
        fail++;
        failRows.push({ row: i + 2, name: row.name || '(空)', reason: errors.join('；') });
        return;
      }

      const year = new Date().getFullYear();
      const seq = String(CUSTOMER_DATA.length + 1).padStart(3, '0');
      CUSTOMER_DATA.push({
        id: `CU-${year}-${seq}`,
        group: row.group,
        name: row.name,
        level: row.level ? parseInt(row.level) : '—',
        type: row.type,
        listed: row.listed || '否',
        exchange: row.listed === '是' ? row.exchange.replace(/,/g, '、') : '—',
        ticker: row.listed === '是' ? row.ticker : '—',
      });
      success++;
    });

    renderCustomerTable(cmPager.filter, true);
    return { success, fail, failRows };
  }

  function switchToResultView(result) {
    document.getElementById('cbi-view-upload').style.display = 'none';
    document.getElementById('cbi-view-result').style.display = '';
    if (importBtn) importBtn.style.display = 'none';
    const cancelEl = document.getElementById('cbi-modal-cancel');
    if (cancelEl) cancelEl.textContent = '关闭';
    const titleEl = document.getElementById('cbi-modal-title');
    const subtitleEl = document.getElementById('cbi-modal-subtitle');
    if (titleEl) titleEl.textContent = '导入结果反馈';
    if (subtitleEl) subtitleEl.textContent = '本次批量导入已完成，详情如下';

    const successNum = document.querySelector('.cbi-stat-success .cbi-stat-num');
    const failNum = document.querySelector('.cbi-stat-fail .cbi-stat-num');
    if (successNum) successNum.textContent = result.success;
    if (failNum) failNum.textContent = result.fail;

    const hintEl = document.querySelector('.cbi-result-hint');
    if (hintEl) {
      if (result.fail > 0) {
        hintEl.style.display = '';
        hintEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="14" height="14">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
          <circle cx="12" cy="16" r="0.5" fill="currentColor"/></svg>
          ${result.fail} 条记录因格式错误未能导入` +
          (result.failRows.length ? '：' + result.failRows.map(r => `第${r.row}行（${r.reason}）`).join('、') : '');
      } else {
        hintEl.style.display = 'none';
      }
    }

    const failBtn = document.querySelector('.cbi-download-fail-btn');
    if (failBtn) failBtn.style.display = result.fail > 0 ? '' : 'none';
  }
}

/* 重置弹窗到初始状态（再次打开时调用） */
function resetBatchImportModal() {
  document.getElementById('cbi-view-upload').style.display = '';
  document.getElementById('cbi-view-result').style.display = 'none';

  const importBtn = document.getElementById('cbi-modal-import');
  if (importBtn) { importBtn.style.display = 'none'; importBtn.disabled = false; }

  const cancelEl = document.getElementById('cbi-modal-cancel');
  if (cancelEl) cancelEl.textContent = '取消';

  const titleEl    = document.getElementById('cbi-modal-title');
  const subtitleEl = document.getElementById('cbi-modal-subtitle');
  if (titleEl)    titleEl.textContent    = '批量导入客户清单';
  if (subtitleEl) subtitleEl.textContent = '支持一次性导入集团全级次客户主体';

  /* 重置上传区 */
  document.getElementById('cbi-dz-idle').style.display     = '';
  document.getElementById('cbi-dz-selected').style.display = 'none';
  document.getElementById('cbi-progress-bar').style.width  = '0%';
  document.getElementById('cbi-progress-pct').textContent  = '0%';
  document.getElementById('cbi-progress-label').textContent = '正在解析文件…';
}
