/* ============================================
   IM 即时通讯模块
   支持：会话列表、群聊、私聊、AI 助手（置顶）、主动推送
   ============================================ */

/* ── 会话数据模型 ── */
const IM_DATA = {
  /* 当前用户 */
  currentUser: { id: 'me', name: '我', initials: '我', color: '#6366F1' },

  /* 所有会话 */
  conversations: [

    /* ━━━ AI 助手（置顶数字助理） ━━━ */
    {
      id: 'ai-assistant',
      type: 'ai',
      name: '小审AI助手',
      pinned: true,
      online: true,
      unread: 3,
      lastTime: '刚刚',
      lastPreview: '[智能巡检] 检测到张三更新了A子公司资产负债表',
      messages: [
        /* 主动推送消息 */
        { id: 'm-ai-0', type: 'push', pushType: 'activity', time: '09:00',
          text: '项目经理王总刚刚创建了「2026 XX集团年审」项目，已自动为您分配审计底稿模板。' },
        { id: 'm-ai-1', type: 'push', pushType: 'inspection', time: '09:35',
          text: '智能巡检完成 —— A子公司应收账款周转率同比下降 23%，建议重点核查。' },
        { id: 'm-ai-2', type: 'push', pushType: 'context', time: '10:12',
          text: '您正在查看资产类底稿，发现与同行业相比，存货跌价准备比例偏低 (2.1% vs 3.8%)，这是常见风控关注点。' },
        { id: 'm-ai-3', from: 'me', type: 'text', time: '10:15', text: '帮我分析一下应收账款的账龄结构' },
        { id: 'm-ai-4', from: 'ai', type: 'text', time: '10:15',
          text: '正在分析...\n\n账龄分析结果：\n• 1年以内：¥2,450万 (65%)\n• 1-2年：¥780万 (21%)\n• 2-3年：¥340万 (9%)\n• 3年以上：¥180万 (5%)\n\n2-3年账龄占比偏高，建议关注回收风险。' },
        { id: 'm-ai-5', type: 'push', pushType: 'activity', time: '10:30',
          text: '张三刚刚更新了 A子公司 > 02 资产类 > 应收账款明细表.xlsx' },
        { id: 'm-ai-6', type: 'push', pushType: 'alert', time: '10:45',
          text: '风险预警：实习生李四的临时访问权限将于3天后到期，请确认是否续期。' },
      ]
    },

    /* ━━━ 项目群聊 ━━━ */
    {
      id: 'group-main',
      type: 'group',
      name: 'XX集团年审 · 项目组',
      initials: '项',
      color: '#6366F1',
      memberCount: 8,
      online: true,
      unread: 5,
      lastTime: '10:30',
      lastPreview: '王五: 资产类底稿已全部完成初稿',
      members: ['王总(PM)', '张三', '李四', '王五', '赵六', '钱七', '孙八', '我'],
      messages: [
        { id: 'gm-1', from: { name: '王总', initials: '王', color: '#6366F1' }, type: 'text', time: '09:05', text: '各位同事，2026 XX集团年审项目正式启动，请尽快领取各自负责的审计底稿模板。' },
        { id: 'gm-2', from: { name: '张三', initials: '张', color: '#F59E0B' }, type: 'text', time: '09:12', text: '收到！我负责A子公司和B子公司的资产类。' },
        { id: 'gm-3', from: { name: '赵六', initials: '赵', color: '#10B981' }, type: 'text', time: '09:15', text: '函证任务已经创建好了，银行函证今天发出。' },
        { id: 'gm-4', from: { name: '王五', initials: '五', color: '#3B82F6' }, type: 'text', time: '10:30', text: '资产类底稿已全部完成初稿，请王总审核。' },
        { id: 'gm-5', from: { name: '王总', initials: '王', color: '#6366F1' }, type: 'text', time: '10:32', text: '好的，下午我来看。李四函证回函进度怎么样了？' },
      ]
    },

    {
      id: 'group-a',
      type: 'group',
      name: 'A子公司审计组',
      initials: 'A',
      color: '#F59E0B',
      memberCount: 3,
      online: true,
      unread: 1,
      lastTime: '10:20',
      lastPreview: '张三: 应收账款明细已更新',
      members: ['张三', '李四', '我'],
      messages: [
        { id: 'ga-1', from: { name: '张三', initials: '张', color: '#F59E0B' }, type: 'text', time: '09:30', text: '资产负债表的数字跟报表对不上，大家帮忙核对一下。' },
        { id: 'ga-2', from: { name: '李四', initials: '李', color: '#EC4899' }, type: 'text', time: '09:45', text: '我查了一下，是02年小数点调整导致的，已修正。' },
        { id: 'ga-3', from: { name: '张三', initials: '张', color: '#F59E0B' }, type: 'text', time: '10:20', text: '应收账款明细已更新，关联方交易部分需要重点关注。' },
      ]
    },

    /* ━━━ 私聊 ━━━ */
    {
      id: 'chat-zhang',
      type: 'private',
      name: '张三',
      initials: '张',
      color: '#F59E0B',
      online: true,
      unread: 0,
      lastTime: '10:05',
      lastPreview: '好的，我看一下',
      messages: [
        { id: 'cz-1', from: { name: '张三', initials: '张', color: '#F59E0B' }, type: 'text', time: '09:50', text: '你负责的负债类底稿什么时候能完成初稿？' },
        { id: 'cz-2', from: 'me', type: 'text', time: '09:52', text: '预计明天下午，长期借款部分数据还在核实。' },
        { id: 'cz-3', from: { name: '张三', initials: '张', color: '#F59E0B' }, type: 'text', time: '10:05', text: '好的，我看一下' },
      ]
    },
    {
      id: 'chat-li',
      type: 'private',
      name: '李四',
      initials: '李',
      color: '#EC4899',
      online: false,
      unread: 2,
      lastTime: '09:40',
      lastPreview: '函证回函已收到2份，还差3份',
      messages: [
        { id: 'cl-1', from: { name: '李四', initials: '李', color: '#EC4899' }, type: 'text', time: '09:30', text: '函证回函已收到2份，还差3份。' },
        { id: 'cl-2', from: { name: '李四', initials: '李', color: '#EC4899' }, type: 'text', time: '09:40', text: '银行那边说下周一可以寄出剩余回函。' },
      ]
    },
    {
      id: 'chat-wang',
      type: 'private',
      name: '王总',
      initials: '王',
      color: '#6366F1',
      online: true,
      unread: 0,
      lastTime: '昨天',
      lastPreview: '辛苦了',
      messages: [
        { id: 'cw-1', from: 'me', type: 'text', time: '昨天 18:00', text: '王总，今天审计计划部分已完成初步撰写。' },
        { id: 'cw-2', from: { name: '王总', initials: '王', color: '#6366F1' }, type: 'text', time: '昨天 18:05', text: '辛苦了，明天我们碰一下细节。' },
      ]
    },
  ]
};


/* ── IM 状态 ── */
const imState = {
  activeConv: null,          // 当前打开的会话 id (null = 列表视图)
  containers: [],            // 两个面板容器的 id
  pushTimer: null,           // AI 主动推送定时器
};


/* ── SVG 图标 ── */
const IM_ICONS = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
  ai: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
  pin: '<svg viewBox="0 0 16 16" fill="currentColor" width="10" height="10"><path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1-.707.708l-.796-.797-3.535 3.536L10.5 13h-.5l-2.5-2.5-3.646 3.646a.5.5 0 0 1-.708-.708L6.793 9.793l-2.5-2.5v-.5l3.736-.406 3.535-3.535-.797-.797a.5.5 0 0 1 .354-.854z"/></svg>',
};


/* ══════════════════════════════════════════════
   渲染：会话列表
   ══════════════════════════════════════════════ */
function renderConvList() {
  const pinned = IM_DATA.conversations.filter(c => c.pinned);
  const groups = IM_DATA.conversations.filter(c => c.type === 'group');
  const privates = IM_DATA.conversations.filter(c => c.type === 'private');

  return `
    <div class="im-list-view">
      <!-- 搜索 -->
      <div class="im-search">
        <div class="im-search-input">
          ${IM_ICONS.search}
          <input type="text" placeholder="搜索会话、消息..." />
        </div>
      </div>

      <!-- 置顶 -->
      ${pinned.length ? `
        <div class="im-section-header">${IM_ICONS.pin} 置顶</div>
        ${pinned.map(c => renderConvItem(c, true)).join('')}
      ` : ''}

      <!-- 项目群聊 -->
      ${groups.length ? `
        <div class="im-section-header">项目群聊</div>
        ${groups.map(c => renderConvItem(c)).join('')}
      ` : ''}

      <!-- 私聊 -->
      ${privates.length ? `
        <div class="im-section-header">私聊</div>
        ${privates.map(c => renderConvItem(c)).join('')}
      ` : ''}
    </div>`;
}


/* ── 单个会话项 ── */
function renderConvItem(conv, isPinned) {
  const avatarClass = conv.type === 'ai' ? 'avatar-ai'
    : conv.type === 'group' ? 'avatar-group'
    : 'avatar-user';

  const avatarContent = conv.type === 'ai'
    ? IM_ICONS.ai
    : (conv.initials || conv.name[0]);

  const badgeHtml = conv.unread > 0
    ? `<span class="im-conv-badge">${conv.unread}</span>`
    : '';

  const onlineDot = conv.online && conv.type !== 'group'
    ? '<span class="online-dot"></span>'
    : '';

  const memberCountHtml = conv.type === 'group'
    ? `<span class="im-member-count">${conv.memberCount}人</span>`
    : '';

  return `
    <div class="im-conv-item ${isPinned ? 'pinned' : ''}" data-conv="${conv.id}">
      <div class="im-conv-avatar ${avatarClass}" style="${conv.color && conv.type !== 'ai' ? `background:${conv.color};` : ''}">
        ${avatarContent}
        ${onlineDot}
      </div>
      <div class="im-conv-info">
        <div class="im-conv-name">
          ${conv.name} ${memberCountHtml}
        </div>
        <div class="im-conv-preview">${conv.lastPreview || ''}</div>
      </div>
      <div class="im-conv-meta">
        <span class="im-conv-time">${conv.lastTime || ''}</span>
        ${badgeHtml}
      </div>
    </div>`;
}


/* ══════════════════════════════════════════════
   渲染：聊天视图
   ══════════════════════════════════════════════ */
function renderChatView(convId) {
  const conv = IM_DATA.conversations.find(c => c.id === convId);
  if (!conv) return '';

  const subtitle = conv.type === 'group'
    ? `<span class="im-chat-subtitle">${conv.memberCount}人</span>`
    : conv.type === 'ai'
    ? '<span class="im-chat-pin">置顶 · 数字助理</span>'
    : (conv.online ? '<span class="im-chat-subtitle" style="color:var(--success);">在线</span>' : '<span class="im-chat-subtitle">离线</span>');

  const quickActions = conv.type === 'ai' ? `
    <div class="im-quick-actions">
      <button class="im-quick-btn" data-quick="帮我分析这个科目的异常">科目分析</button>
      <button class="im-quick-btn" data-quick="生成应收账款数据账龄分析">账龄分析</button>
      <button class="im-quick-btn" data-quick="查找所有关联交易">关联交易</button>
      <button class="im-quick-btn" data-quick="查看项目整体进度">项目进度</button>
    </div>` : '';

  return `
    <div class="im-chat-view active">
      <!-- 头部 -->
      <div class="im-chat-header">
        <button class="im-back-btn" data-action="back">${IM_ICONS.back}</button>
        <div class="im-chat-title">${conv.name} ${subtitle}</div>
      </div>

      <!-- 消息 -->
      <div class="im-messages" id="im-messages">
        ${conv.messages.map(m => renderMessage(m, conv)).join('')}
        ${quickActions}
      </div>

      <!-- 输入 -->
      <div class="im-input-area">
        <div class="im-input-wrapper">
          <textarea rows="1" placeholder="${conv.type === 'ai' ? '向小审AI提问...' : '输入消息...'}"></textarea>
          <button class="im-send-btn">${IM_ICONS.send}</button>
        </div>
      </div>
    </div>`;
}


/* ── 单条消息 ── */
function renderMessage(msg, conv) {
  /* 主动推送 */
  if (msg.type === 'push') {
    const labelMap = {
      activity: '主动推送',
      inspection: '智能巡检',
      context: '情境提示',
      alert: '风险预警',
    };
    const iconMap = {
      activity: '📢',
      inspection: '🔍',
      context: '💡',
      alert: '⚠️',
    };
    return `
      <div class="im-msg-push push-${msg.pushType}">
        <div class="im-msg-push-label">${iconMap[msg.pushType] || ''} ${labelMap[msg.pushType] || '通知'}</div>
        <div class="im-msg-push-text">${msg.text}</div>
        <div class="im-msg-push-time">${msg.time}</div>
      </div>`;
  }

  /* 普通消息 */
  const isSelf = msg.from === 'me';
  const isAI = msg.from === 'ai';

  let avatarContent, avatarStyle, senderName;
  if (isSelf) {
    avatarContent = '我';
    avatarStyle = `background:${IM_DATA.currentUser.color};`;
    senderName = '';
  } else if (isAI) {
    avatarContent = IM_ICONS.ai;
    avatarStyle = '';
    senderName = '';
  } else {
    avatarContent = msg.from.initials || msg.from.name[0];
    avatarStyle = `background:${msg.from.color || '#64748B'};`;
    senderName = conv.type === 'group' ? `<div class="im-msg-sender">${msg.from.name}</div>` : '';
  }

  const selfClass = isSelf ? 'msg-self' : '';
  const aiClass = isAI ? 'msg-ai' : '';

  /* 处理文本中的换行 */
  const formattedText = msg.text.replace(/\n/g, '<br>');

  return `
    <div class="im-msg ${selfClass} ${aiClass}">
      <div class="im-msg-avatar" style="${avatarStyle}">${avatarContent}</div>
      <div class="im-msg-body">
        ${senderName}
        <div class="im-msg-bubble">${formattedText}</div>
      </div>
    </div>`;
}


/* ══════════════════════════════════════════════
   渲染入口 + 事件绑定
   ══════════════════════════════════════════════ */
function renderIMPanel() {
  const containers = ['im-container-file', 'im-container-biz'];

  containers.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    if (imState.activeConv) {
      el.innerHTML = renderChatView(imState.activeConv);
    } else {
      el.innerHTML = renderConvList();
    }
  });

  bindIMEvents();
  updateUnreadBadges();
  scrollMessagesToBottom();
}


function bindIMEvents() {
  /* 点击会话项 → 进入聊天 */
  document.querySelectorAll('.im-conv-item').forEach(item => {
    item.addEventListener('click', () => {
      const convId = item.dataset.conv;
      openConversation(convId);
    });
  });

  /* 返回按钮 */
  document.querySelectorAll('.im-back-btn[data-action="back"]').forEach(btn => {
    btn.addEventListener('click', () => {
      imState.activeConv = null;
      renderIMPanel();
    });
  });

  /* 发送消息 */
  document.querySelectorAll('.im-send-btn').forEach(btn => {
    const wrapper = btn.closest('.im-input-wrapper');
    if (!wrapper) return;

    btn.addEventListener('click', () => sendMessage(wrapper));
  });

  /* 回车发送 */
  document.querySelectorAll('.im-input-wrapper textarea').forEach(textarea => {
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(textarea.closest('.im-input-wrapper'));
      }
    });
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    });
  });

  /* 快捷操作按钮 */
  document.querySelectorAll('.im-quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.quick;
      if (!text) return;
      appendUserMessage(text);
      setTimeout(() => appendAIPushOrReply(text), 600);
    });
  });

  /* IM 搜索框 — 简单过滤 */
  document.querySelectorAll('.im-search-input input').forEach(input => {
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase();
      const list = input.closest('.im-list-view');
      if (!list) return;
      list.querySelectorAll('.im-conv-item').forEach(item => {
        const name = item.querySelector('.im-conv-name')?.textContent.toLowerCase() || '';
        const preview = item.querySelector('.im-conv-preview')?.textContent.toLowerCase() || '';
        item.style.display = (name.includes(q) || preview.includes(q)) ? '' : 'none';
      });
    });
  });
}


/* ── 打开会话 ── */
function openConversation(convId) {
  imState.activeConv = convId;

  /* 清除该会话未读 */
  const conv = IM_DATA.conversations.find(c => c.id === convId);
  if (conv) conv.unread = 0;

  renderIMPanel();
}


/* ── 发送文本消息 ── */
function sendMessage(wrapper) {
  const textarea = wrapper.querySelector('textarea');
  if (!textarea) return;
  const text = textarea.value.trim();
  if (!text) return;

  textarea.value = '';
  textarea.style.height = 'auto';

  appendUserMessage(text);

  /* 如果是 AI 会话，模拟回复 */
  if (imState.activeConv === 'ai-assistant') {
    setTimeout(() => appendAIPushOrReply(text), 600);
  }
}


/* ── 追加用户消息到当前会话 ── */
function appendUserMessage(text) {
  const conv = IM_DATA.conversations.find(c => c.id === imState.activeConv);
  if (!conv) return;

  const msg = { id: 'msg-' + Date.now(), from: 'me', type: 'text', time: formatNow(), text };
  conv.messages.push(msg);
  conv.lastPreview = text;
  conv.lastTime = '刚刚';

  /* 直接 DOM 追加，避免重新渲染整个面板 */
  document.querySelectorAll('#im-messages').forEach(container => {
    const quickActions = container.querySelector('.im-quick-actions');
    const html = renderMessage(msg, conv);
    if (quickActions) {
      quickActions.insertAdjacentHTML('beforebegin', html);
    } else {
      container.insertAdjacentHTML('beforeend', html);
    }
    container.scrollTop = container.scrollHeight;
  });
}


/* ── AI 回复 ── */
function appendAIPushOrReply(userText) {
  const conv = IM_DATA.conversations.find(c => c.id === 'ai-assistant');
  if (!conv) return;

  const replyText = getIMResponse(userText);
  const msg = { id: 'msg-' + Date.now(), from: 'ai', type: 'text', time: formatNow(), text: replyText };
  conv.messages.push(msg);
  conv.lastPreview = replyText.slice(0, 30) + '...';
  conv.lastTime = '刚刚';

  /* DOM 追加 */
  document.querySelectorAll('#im-messages').forEach(container => {
    const quickActions = container.querySelector('.im-quick-actions');
    const html = renderMessage(msg, conv);
    if (quickActions) {
      quickActions.insertAdjacentHTML('beforebegin', html);
    } else {
      container.insertAdjacentHTML('beforeend', html);
    }
    container.scrollTop = container.scrollHeight;
  });
}


/* ── AI 简单应答 ── */
function getIMResponse(q) {
  const responses = {
    '帮我分析这个科目的异常': '正在分析科目异常...\n\n发现以下异常点：\n1. 应收账款周转率同比下降 23%\n2. 坏账准备计提比例偏低\n3. 有 3 笔大额关联交易需关注\n\n建议重点核查。需要生成详细报告吗？',
    '生成应收账款数据账龄分析': '📊 账龄分析：\n• 1年以内：¥2,450万 (65%)\n• 1-2年：¥780万 (21%)\n• 2-3年：¥340万 (9%)\n• 3年以上：¥180万 (5%)\n\n⚠️ 2-3年占比偏高，建议关注回收风险。',
    '查找所有关联交易': '🔍 找到 12 笔关联交易：\n• A关联方：5笔，合计 ¥1,200万\n• B关联方：4笔，合计 ¥890万\n• C关联方：3笔，合计 ¥560万\n\n其中 2 笔偏离市场价 15%+，建议重点审查。',
    '查看项目整体进度': '📋 2026 XX集团年审 进度总览：\n\n✅ 审计计划 — 100%\n🔵 资产类 — 65%\n🔵 负债类 — 30%\n⬜ 审计报告 — 0%\n\n整体进度 42%，预计按计划完成。'
  };
  return responses[q] || `收到「${q}」，正在分析中...\n\n作为小审AI助手，我可以帮您：\n• 分析财务数据异常\n• 生成审计报告与底稿\n• 查找关联交易\n• 解答审计准则问题\n• 推送项目动态`;
}


/* ══════════════════════════════════════════════
   AI 主动推送模拟
   定时向用户推送消息，营造"助手在持续监控"的感觉
   ══════════════════════════════════════════════ */

const PUSH_QUEUE = [
  { pushType: 'activity', text: '赵六刚刚在「函证文件夹」中上传了 3 份银行回函文件。' },
  { pushType: 'inspection', text: '智能检查发现 B子公司固定资产折旧方法变更，建议关注会计政策一致性。' },
  { pushType: 'context', text: '提醒：本项目距离交付截止日还有 15 天，负债类底稿进度偏慢（30%），建议提速。' },
  { pushType: 'alert', text: '系统检测到 C子公司存货盘点差异率为 3.2%，超过阈值(2%)，建议复盘。' },
  { pushType: 'activity', text: '王总审核通过了 A子公司审计计划，并添加了 2 条批注。' },
  { pushType: 'inspection', text: '智能比对完成：XX集团合并报表内部交易抵消差异 ¥12.5万，需调整。' },
];

let pushIndex = 0;

function startAIPush() {
  /* 每 20~40 秒随机推送一条 */
  function schedulePush() {
    const delay = 20000 + Math.random() * 20000;
    imState.pushTimer = setTimeout(() => {
      pushNextMessage();
      schedulePush();
    }, delay);
  }
  schedulePush();
}

function pushNextMessage() {
  const item = PUSH_QUEUE[pushIndex % PUSH_QUEUE.length];
  pushIndex++;

  const conv = IM_DATA.conversations.find(c => c.id === 'ai-assistant');
  if (!conv) return;

  const msg = {
    id: 'push-' + Date.now(),
    type: 'push',
    pushType: item.pushType,
    time: formatNow(),
    text: item.text,
  };

  conv.messages.push(msg);
  conv.lastPreview = `[${pushLabelMap[item.pushType] || '通知'}] ${item.text.slice(0, 20)}...`;
  conv.lastTime = '刚刚';

  /* 如果当前正在看 AI 会话，直接追加 */
  if (imState.activeConv === 'ai-assistant') {
    document.querySelectorAll('#im-messages').forEach(container => {
      const quickActions = container.querySelector('.im-quick-actions');
      const html = renderMessage(msg, conv);
      if (quickActions) {
        quickActions.insertAdjacentHTML('beforebegin', html);
      } else {
        container.insertAdjacentHTML('beforeend', html);
      }
      container.scrollTop = container.scrollHeight;
    });
  } else {
    /* 增加未读并更新列表 */
    conv.unread = (conv.unread || 0) + 1;
    renderIMPanel();
  }

  updateUnreadBadges();

  /* 桌面通知提示 (简化 toast) */
  showIMToast(item.text.slice(0, 50));
}

const pushLabelMap = {
  activity: '主动推送',
  inspection: '智能巡检',
  context: '情境提示',
  alert: '风险预警',
};


/* ── Toast 提示 ── */
function showIMToast(text) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 9999;
    background: rgba(139,92,246,0.95); color: white;
    padding: 10px 16px; border-radius: 10px;
    font-size: 12px; max-width: 300px; line-height: 1.5;
    display: flex; align-items: center; gap: 8px;
    box-shadow: 0 4px 20px rgba(139,92,246,0.3);
    backdrop-filter: blur(12px);
    animation: slideInRight 0.3s cubic-bezier(0.16,1,0.3,1);
  `;
  toast.innerHTML = `<span style="font-size:14px;">🤖</span><span><b>小审AI</b> ${text}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}


/* ── 更新 Tab 角标 ── */
function updateUnreadBadges() {
  const total = IM_DATA.conversations.reduce((s, c) => s + (c.unread || 0), 0);
  ['tab-unread-file', 'tab-unread-biz'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (total > 0) {
      el.textContent = total > 99 ? '99+' : total;
      el.style.display = 'inline-flex';
    } else {
      el.style.display = 'none';
    }
  });
}


/* ── 滚动到底部 ── */
function scrollMessagesToBottom() {
  document.querySelectorAll('#im-messages').forEach(el => {
    el.scrollTop = el.scrollHeight;
  });
}


/* ── 时间格式化 ── */
function formatNow() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}


/* ══════════════════════════════════════════════
   初始化
   ══════════════════════════════════════════════ */
function initIM() {
  renderIMPanel();
  startAIPush();
}
