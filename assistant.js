(() => {
  'use strict';

  const NEXO_HISTORY_KEY = 'bo-digital-nexo-history-v31';
  const NEXO_VOICE_KEY = 'bo-digital-nexo-voice-v1';
  const NEXO_CONVERSATION_KEY = 'bo-digital-nexo-conversation-v1';
  const NEXO_TOKEN_KEY = 'bo-digital-nexo-token-session-v1';
  const NEXO_CONTEXT_KEY = 'bo-digital-nexo-context-session-v35';
  const MAX_HISTORY = 28;
  const MAX_CONTEXT_RECORDS = 48;

  const ICON = {
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"/></svg>',
    send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 18-8-8 18-2-8zM11 13l4-4"/></svg>',
    speaker: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9v6h4l5 4V5L9 9zM18 9a4 4 0 0 1 0 6"/></svg>',
    spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>',
    wave: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h2l2-6 3 12 3-12 3 12 2-6h3"/></svg>'
  };

  let messages = loadHistory();
  let recognition = null;
  let listening = false;
  let manualVoiceStop = false;
  let aiStatus = { checked: false, configured: false, requiresAccessToken: true, model: '', revision: '' };
  let busy = false;
  let nexoContext = loadContext();

  const root = document.createElement('div');
  root.id = 'nexo-root';
  root.innerHTML = `
    <button id="nexo-fab" class="nexo-fab" type="button" aria-label="Abrir NEXO Assistente" title="NEXO Assistente">
      <span class="nexo-fab-core" aria-hidden="true"><img src="./nexo-robot-avatar.png" alt="" class="nexo-robot-img"></span>
      <span class="nexo-fab-label">NEXO</span>
    </button>
    <div id="nexo-backdrop" class="nexo-backdrop hidden" aria-hidden="true">
      <section class="nexo-panel" role="dialog" aria-modal="true" aria-labelledby="nexo-title">
        <header class="nexo-header">
          <div class="nexo-identity">
            <span class="nexo-orb" aria-hidden="true"><i></i><b></b><img src="./nexo-robot-avatar.png" alt="" class="nexo-robot-img"></span>
            <div>
              <p>NEXO • Perfil Operador</p>
              <h2 id="nexo-title">Assistente do operador</h2>
            </div>
          </div>
          <div class="nexo-header-actions">
            <button id="nexo-conversation-toggle" class="nexo-icon-button" type="button" aria-label="Ativar modo conversa" title="Modo conversa contínua">${ICON.wave}</button>
            <button id="nexo-voice-toggle" class="nexo-icon-button" type="button" aria-label="Ativar ou desativar resposta por voz" title="Resposta por voz">${ICON.speaker}</button>
            <button id="nexo-close" class="nexo-icon-button" type="button" aria-label="Fechar NEXO">${ICON.close}</button>
          </div>
        </header>
        <div class="nexo-statusbar">
          <span id="nexo-status-dot" class="nexo-status-dot local"><i></i><b id="nexo-status-label">Modo local</b></span>
          <span id="nexo-scope">Acesso vinculado ao operador</span>
        </div>
        <div id="nexo-messages" class="nexo-messages" aria-live="polite"></div>
        <div class="nexo-quick" aria-label="Comandos rápidos">
          <button type="button" data-nexo-prompt="Situação atual">Situação atual</button>
          <button type="button" data-nexo-prompt="Quais são as prioridades?">Prioridades</button>
          <button type="button" data-nexo-prompt="Quais rascunhos existem?">Rascunhos</button>
          <button type="button" data-nexo-prompt="Quais BOs estão sem sincronizar?">Sem sincronizar</button>
          <button type="button" data-nexo-prompt="Checklist deste BO">Checklist</button>
          <button type="button" data-nexo-prompt="Roteiro deste BO">Roteiro do BO</button>
          <button type="button" data-nexo-prompt="Revisar redação deste BO">Revisar redação</button>
          <button type="button" data-nexo-prompt="Passagem de turno">Passagem</button>
          <button type="button" data-nexo-prompt="Iniciar novo boletim">Novo BO</button>
        </div>
        <form id="nexo-form" class="nexo-compose">
          <button id="nexo-mic" class="nexo-mic" type="button" aria-label="Falar com o NEXO" title="Falar">${ICON.mic}</button>
          <label class="nexo-input-wrap" for="nexo-input">
            <span class="sr-only">Mensagem para o NEXO</span>
            <textarea id="nexo-input" rows="1" maxlength="900" placeholder="Ex.: Nexo, situação atual…"></textarea>
          </label>
          <button id="nexo-send" class="nexo-send" type="submit" aria-label="Enviar mensagem" title="Enviar">${ICON.send}</button>
        </form>
        <p class="nexo-footnote">O NEXO pode consultar, abrir e sincronizar registros. Exclusão e finalização permanecem protegidas pela interface normal.</p>
      </section>
    </div>`;
  document.body.appendChild(root);

  const fab = root.querySelector('#nexo-fab');
  const backdrop = root.querySelector('#nexo-backdrop');
  const panel = root.querySelector('.nexo-panel');
  const closeButton = root.querySelector('#nexo-close');
  const messagesEl = root.querySelector('#nexo-messages');
  const form = root.querySelector('#nexo-form');
  const input = root.querySelector('#nexo-input');
  const micButton = root.querySelector('#nexo-mic');
  const sendButton = root.querySelector('#nexo-send');
  const voiceToggle = root.querySelector('#nexo-voice-toggle');
  const conversationToggle = root.querySelector('#nexo-conversation-toggle');
  const statusDot = root.querySelector('#nexo-status-dot');
  const statusLabel = root.querySelector('#nexo-status-label');
  const scopeLabel = root.querySelector('#nexo-scope');

  if (!messages.length) {
    messages = [{
      role: 'assistant',
      text: 'Olá. Eu sou o NEXO Operador. Além de localizar e acompanhar BOs, posso orientar o roteiro padronizado de cada ocorrência, conferir pendências e ajudar a evitar informações esquecidas. Diga “situação atual”, “roteiro deste BO”, “checklist deste BO” ou “revisar redação”.',
      ts: Date.now()
    }];
    saveHistory();
  }

  function safeText(value = '') {
    return String(value ?? '').trim();
  }

  function normalize(value = '') {
    return safeText(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s/-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function escape(value = '') {
    return safeText(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function loadHistory() {
    try {
      const parsed = JSON.parse(localStorage.getItem(NEXO_HISTORY_KEY) || '[]');
      return Array.isArray(parsed) ? parsed.slice(-MAX_HISTORY) : [];
    } catch (_) {
      return [];
    }
  }

  function saveHistory() {
    try { localStorage.setItem(NEXO_HISTORY_KEY, JSON.stringify(messages.slice(-MAX_HISTORY))); } catch (_) {}
  }

  function loadContext() {
    try {
      const parsed = JSON.parse(sessionStorage.getItem(NEXO_CONTEXT_KEY) || '{}');
      return {
        lastRecordId: safeText(parsed.lastRecordId),
        lastRecordIds: Array.isArray(parsed.lastRecordIds) ? parsed.lastRecordIds.filter(Boolean).slice(0, 8) : [],
        pendingAction: parsed.pendingAction || null,
        lastIntent: safeText(parsed.lastIntent)
      };
    } catch (_) {
      return { lastRecordId: '', lastRecordIds: [], pendingAction: null, lastIntent: '' };
    }
  }

  function saveContext() {
    try { sessionStorage.setItem(NEXO_CONTEXT_KEY, JSON.stringify(nexoContext)); } catch (_) {}
  }

  function voiceEnabled() {
    try { return localStorage.getItem(NEXO_VOICE_KEY) !== 'off'; } catch (_) { return true; }
  }

  function setVoiceEnabled(enabled) {
    try { localStorage.setItem(NEXO_VOICE_KEY, enabled ? 'on' : 'off'); } catch (_) {}
    voiceToggle.classList.toggle('active', enabled);
    voiceToggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
  }

  function conversationEnabled() {
    try { return localStorage.getItem(NEXO_CONVERSATION_KEY) === 'on'; } catch (_) { return false; }
  }

  function setConversationEnabled(enabled) {
    try { localStorage.setItem(NEXO_CONVERSATION_KEY, enabled ? 'on' : 'off'); } catch (_) {}
    conversationToggle.classList.toggle('active', enabled);
    conversationToggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    conversationToggle.title = enabled ? 'Modo conversa contínua ativo' : 'Modo conversa contínua';
    updateScopeLabel();
    if (enabled && !backdrop.classList.contains('hidden') && !busy) {
      manualVoiceStop = false;
      setTimeout(() => startListening(true), 180);
    } else if (!enabled) {
      stopListening(true);
    }
  }

  function renderMessages() {
    messagesEl.innerHTML = messages.map(message => `
      <article class="nexo-message ${message.role === 'user' ? 'user' : 'assistant'}">
        <span class="nexo-message-avatar ${message.role === 'user' ? 'user' : 'assistant'}" aria-hidden="true">${message.role === 'user' ? 'EU' : '<img src=\"./nexo-robot-avatar.png\" alt=\"\" class=\"nexo-robot-img\">'}</span>
        <div><p>${escape(message.text).replace(/\n/g, '<br>')}</p></div>
      </article>`).join('');
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addMessage(role, text, options = {}) {
    const value = safeText(text);
    if (!value) return;
    messages.push({ role, text: value, ts: Date.now() });
    messages = messages.slice(-MAX_HISTORY);
    saveHistory();
    renderMessages();
    if (role === 'assistant' && options.speak !== false) speak(value);
  }

  function actionFeedback(text, kind = 'progress') {
    try { window.BO_NEXO_FEEDBACK?.(text, kind, 'NEXO Operador'); } catch (_) {}
  }

  function setBusy(value, label = '') {
    busy = value;
    form.classList.toggle('busy', value);
    sendButton.disabled = value;
    micButton.disabled = value;
    input.disabled = value;
    if (label) statusLabel.textContent = label;
  }

  function updateScopeLabel() {
    if (conversationEnabled()) {
      scopeLabel.textContent = 'Operador • conversa ativa';
      return;
    }
    const route = document.body.dataset.route || state?.route || 'home';
    const labels = {
      home: 'Operador • visão geral',
      records: 'Operador • consulta de BOs',
      wizard: 'Operador • preenchimento de BO',
      detail: 'Operador • BO em análise',
      about: 'Operador • área técnica'
    };
    scopeLabel.textContent = labels[route] || 'Acesso vinculado ao operador';
  }

  function updateVisibility() {
    const loggedIn = document.body.dataset.route !== 'login' && Boolean(state?.operator);
    fab.classList.toggle('hidden', !loggedIn);
    fab.setAttribute('aria-hidden', loggedIn ? 'false' : 'true');
    updateScopeLabel();
    if (!loggedIn && !backdrop.classList.contains('hidden')) closeAssistant();
  }

  async function checkAiStatus(force = false) {
    if (aiStatus.checked && !force) return aiStatus;
    aiStatus = { checked: true, configured: false, requiresAccessToken: true, model: '', revision: '' };
    if (!navigator.onLine || !apiConfigured()) {
      updateStatus();
      return aiStatus;
    }
    try {
      const result = await apiGet({ action: 'assistantstatus' });
      aiStatus = {
        checked: true,
        configured: result.assistantConfigured === true,
        requiresAccessToken: result.requiresAccessToken !== false,
        model: safeText(result.model),
        revision: safeText(result.revision)
      };
    } catch (_) {
      aiStatus = { checked: true, configured: false, requiresAccessToken: true, model: '', revision: '' };
    }
    updateStatus();
    return aiStatus;
  }

  function updateStatus() {
    statusDot.classList.remove('online', 'local', 'offline', 'listening', 'thinking');
    if (listening) {
      statusDot.classList.add('listening');
      statusLabel.textContent = conversationEnabled() ? 'Ouvindo • conversa ativa' : 'Ouvindo…';
      return;
    }
    if (busy) {
      statusDot.classList.add('thinking');
      statusLabel.textContent = 'Analisando…';
      return;
    }
    if (!navigator.onLine) {
      statusDot.classList.add('offline');
      statusLabel.textContent = 'Offline • modo local';
    } else if (aiStatus.configured) {
      statusDot.classList.add('online');
      statusLabel.textContent = 'IA conectada';
    } else {
      statusDot.classList.add('local');
      statusLabel.textContent = 'NEXO local + voz';
    }
  }

  async function openAssistant() {
    if (!state?.operator) return;
    backdrop.classList.remove('hidden');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nexo-open');
    renderMessages();
    setVoiceEnabled(voiceEnabled());
    setConversationEnabled(conversationEnabled());
    input.focus({ preventScroll: true });
    await checkAiStatus();
  }

  function closeAssistant() {
    stopListening(true);
    backdrop.classList.add('hidden');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nexo-open');
    window.speechSynthesis?.cancel?.();
    fab.focus({ preventScroll: true });
  }

  function scheduleConversationListening(delay = 500) {
    if (!conversationEnabled() || manualVoiceStop || busy || backdrop.classList.contains('hidden')) return;
    setTimeout(() => {
      if (!conversationEnabled() || manualVoiceStop || busy || listening || backdrop.classList.contains('hidden')) return;
      if (window.speechSynthesis?.speaking) return;
      startListening(true);
    }, delay);
  }

  function speak(text) {
    if (!voiceEnabled() || !('speechSynthesis' in window)) {
      scheduleConversationListening(250);
      return;
    }
    const clean = safeText(text).replace(/\bhttps?:\/\/\S+/gi, '').slice(0, 1100);
    if (!clean) {
      scheduleConversationListening(250);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'pt-BR';
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => scheduleConversationListening(420);
    utterance.onerror = () => scheduleConversationListening(420);
    window.speechSynthesis.speak(utterance);
  }

  function setupRecognition() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return null;
    const rec = new Recognition();
    rec.lang = 'pt-BR';
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.onstart = () => {
      listening = true;
      micButton.classList.add('listening');
      updateStatus();
    };
    rec.onresult = event => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) transcript += event.results[i][0]?.transcript || '';
      input.value = transcript.trim();
      autoGrowInput();
      const last = event.results[event.results.length - 1];
      if (last?.isFinal && input.value.trim()) setTimeout(() => submitPrompt(input.value.trim()), 100);
    };
    rec.onerror = event => {
      listening = false;
      micButton.classList.remove('listening');
      updateStatus();
      const blocked = ['not-allowed', 'service-not-allowed'].includes(event.error);
      if (blocked) {
        manualVoiceStop = true;
        addMessage('assistant', 'O navegador não liberou o microfone. Autorize o acesso nas permissões do site ou use o campo de texto.', { speak: false });
      } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
        addMessage('assistant', 'Não consegui entender o áudio. Tente novamente.', { speak: false });
      }
    };
    rec.onend = () => {
      listening = false;
      micButton.classList.remove('listening');
      updateStatus();
      scheduleConversationListening(700);
    };
    return rec;
  }

  function startListening(auto = false) {
    if (busy || listening) return;
    if (!auto) manualVoiceStop = false;
    if (!recognition) recognition = setupRecognition();
    if (!recognition) {
      manualVoiceStop = true;
      addMessage('assistant', 'Este navegador não oferece reconhecimento de voz pelo Web Speech. O NEXO continua funcionando por texto.', { speak: false });
      return;
    }
    try {
      window.speechSynthesis?.cancel?.();
      recognition.start();
    } catch (_) {}
  }

  function stopListening(manual = true) {
    if (manual) manualVoiceStop = true;
    if (!recognition || !listening) return;
    try { recognition.stop(); } catch (_) {}
  }

  function mergedRecords(localRecords, remoteRecords) {
    const map = new Map();
    (localRecords || []).forEach(record => { if (record?.id) map.set(record.id, record); });
    (remoteRecords || []).forEach(record => {
      if (!record?.id) return;
      const current = map.get(record.id);
      if (!current || safeText(record.updatedAt) > safeText(current.updatedAt)) map.set(record.id, record);
    });
    return [...map.values()].sort((a, b) => safeText(b.updatedAt).localeCompare(safeText(a.updatedAt)));
  }

  async function getAllRecords(refreshRemote = false) {
    let remote = state.remoteRecords || [];
    if (refreshRemote && navigator.onLine && apiConfigured()) {
      try {
        const payload = await apiGet({ action: 'list' });
        remote = (payload.records || []).map(item => ({ ...normalizeRecord(item), _source: 'remote' }));
        state.remoteRecords = remote;
      } catch (_) {}
    }
    return mergedRecords(state.records || [], remote);
  }

  function recordNumber(record) {
    return safeText(record?.numero || record?.numeroTemporario || 'Sem número');
  }

  function recordReference(record) {
    return safeText(resolvedReference(record) || record?.basic?.referencia || 'Referência não informada');
  }

  function summarizeRecord(record) {
    if (!record) return 'Registro não encontrado.';
    const b = record.basic || {};
    const local = [b.local, b.complementoLocal].filter(Boolean).join(' — ');
    const sync = safeText(record.syncStatus || 'local');
    const syncText = sync === 'synced' ? 'sincronizado' : sync === 'error' ? 'falha de sincronização' : sync === 'pending' ? 'aguardando sincronização' : 'salvo no aparelho';
    return `${recordNumber(record)} • ${safeText(record.status || 'Sem status')} • ${recordReference(record)}${local ? ` • ${local}` : ''}${b.data ? ` • ${b.data}${b.hora ? ` às ${b.hora}` : ''}` : ''} • ${syncText}`;
  }

  function detailedRecordSummary(record) {
    if (!record) return 'Registro não encontrado.';
    const b = record.basic || {};
    const h = record.history || {};
    const local = [b.local, b.complementoLocal].filter(Boolean).join(' — ') || 'não informado';
    const related = `${(record.people || []).length} pessoa(s), ${(record.vehicles || []).length} veículo(s), ${(record.materials || []).length} material(is) e ${(record.documents || []).length} documento(s)`;
    const relato = safeText(h.relato).slice(0, 320);
    const providencias = safeText(h.providencias).slice(0, 220);
    const round = ['Ronda interna','Ronda externa'].includes(safeText(b.origemOcorrencia));
    const responsible = round ? `Vigilante da ronda: ${safeText(record.operator?.usuario || 'não informado')} • ${safeText(record.operator?.registro || '')}` : `Solicitante: ${safeText(b.nomeEmissor || 'não informado')}`;
    return [
      `${recordNumber(record)} está como ${safeText(record.status || 'sem status')}.`,
      `Referência: ${recordReference(record)}. Origem: ${safeText(b.origemOcorrencia || 'não informada')}. Local: ${local}. ${responsible}.`,
      `Relacionados: ${related}.`,
      relato ? `Relato: ${relato}${safeText(h.relato).length > 320 ? '…' : ''}` : 'Relato consolidado ainda não informado.',
      providencias ? `Providências: ${providencias}${safeText(h.providencias).length > 220 ? '…' : ''}` : 'Providências não informadas.',
      `Sincronização: ${safeText(record.syncStatus || 'local')}.`
    ].join(' ');
  }

  function ageMs(record) {
    const value = new Date(record?.updatedAt || record?.createdAt || 0).getTime();
    return value ? Math.max(0, Date.now() - value) : 0;
  }

  function ageLabel(record) {
    const ms = ageMs(record);
    if (!ms) return 'sem horário de atualização';
    const minutes = Math.floor(ms / 60000);
    if (minutes < 60) return `há ${Math.max(1, minutes)} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `há ${hours} h`;
    const days = Math.floor(hours / 24);
    return `há ${days} dia${days === 1 ? '' : 's'}`;
  }

  function setLastRecords(records, intent = '') {
    const ids = (records || []).map(record => record?.id).filter(Boolean).slice(0, 8);
    nexoContext.lastRecordIds = ids;
    if (ids[0]) nexoContext.lastRecordId = ids[0];
    if (intent) nexoContext.lastIntent = intent;
    saveContext();
  }

  function setLastRecord(record, intent = '') {
    if (!record?.id) return;
    nexoContext.lastRecordId = record.id;
    nexoContext.lastRecordIds = [record.id, ...nexoContext.lastRecordIds.filter(id => id !== record.id)].slice(0, 8);
    if (intent) nexoContext.lastIntent = intent;
    saveContext();
  }

  function listText(records, emptyText = 'Nenhum registro encontrado.', limit = 5) {
    if (!records.length) return emptyText;
    const selected = records.slice(0, limit);
    return selected.map((record, index) => `${index + 1}. ${summarizeRecord(record)}`).join('\n') + (records.length > limit ? `\n+ ${records.length - limit} outro(s).` : '');
  }

  function attentionRecords(records) {
    const score = record => {
      let value = 0;
      if (record.syncStatus === 'conflict') value += 1500;
      if (record.syncStatus === 'error') value += 1100;
      if (record.syncStatus === 'pending') value += 800;
      if (record.status === 'Rascunho') value += 100;
      const sla = window.BO_SLA_INFO?.(record);
      if (sla?.ongoing && sla?.level === 'critical') value += 650;
      else if (sla?.ongoing && sla?.level === 'warning') value += 350;
      value += Math.min(120, Math.floor(ageMs(record) / 3600000) * 4);
      return value;
    };
    return records.filter(record => record.status === 'Rascunho' || ['error', 'pending', 'conflict'].includes(record.syncStatus)).sort((a, b) => score(b) - score(a));
  }

  function currentSituation(records) {
    const today = localDateInput();
    const todayRecords = records.filter(record => safeText(record.basic?.data) === today);
    const drafts = records.filter(record => record.status === 'Rascunho');
    const pendingSync = records.filter(record => record.status === 'Finalizado' && ['error', 'pending', 'conflict'].includes(record.syncStatus));
    const attention = attentionRecords(records);
    setLastRecords(attention.length ? attention : todayRecords, 'situacao');
    const top = attention[0];
    return `Situação atual: ${todayRecords.length} BO(s) com data de hoje, sendo ${todayRecords.filter(r => r.status === 'Finalizado').length} finalizado(s) e ${todayRecords.filter(r => r.status === 'Rascunho').length} rascunho(s). No total existem ${drafts.length} rascunho(s) e ${pendingSync.length} registro(s) com sincronização pendente ou em erro.${top ? ` Atenção principal: ${recordNumber(top)}, ${top.status}, ${top.syncStatus || 'local'}, atualizado ${ageLabel(top)}.` : ' Não identifiquei pendências operacionais nos dados disponíveis.'}`;
  }

  function compactContext(records) {
    const today = localDateInput();
    const selected = records.slice(0, MAX_CONTEXT_RECORDS);
    const attention = attentionRecords(records).slice(0, 8);
    return {
      app: 'BO Digital GSP',
      dataLocal: today,
      vigilante: {
        nome: safeText(state.operator?.usuario),
        registro: safeText(state.operator?.registro),
        turno: safeText(state.operator?.turno)
      },
      totais: {
        total: records.length,
        rascunhos: records.filter(r => r.status === 'Rascunho').length,
        finalizados: records.filter(r => r.status === 'Finalizado').length,
        hoje: records.filter(r => safeText(r.basic?.data) === today).length,
        syncPendente: records.filter(r => r.status === 'Finalizado' && ['pending', 'error', 'conflict'].includes(r.syncStatus)).length
      },
      focoAtual: {
        ultimoRegistro: nexoContext.lastRecordId || '',
        ultimaIntencao: nexoContext.lastIntent || ''
      },
      atencao: attention.map(record => ({ numero: recordNumber(record), status: record.status, syncStatus: record.syncStatus, atualizadoEm: record.updatedAt })),
      registrosRecentes: selected.map(record => ({
        id: safeText(record.id),
        numero: recordNumber(record),
        status: safeText(record.status),
        syncStatus: safeText(record.syncStatus),
        data: safeText(record.basic?.data),
        hora: safeText(record.basic?.hora),
        referencia: recordReference(record),
        local: [record.basic?.local, record.basic?.complementoLocal].filter(Boolean).join(' — '),
        origem: safeText(record.basic?.origemOcorrencia),
        solicitante: ['Ronda interna','Ronda externa'].includes(safeText(record.basic?.origemOcorrencia)) ? '' : safeText(record.basic?.nomeEmissor),
        matriculaSolicitante: ['Ronda interna','Ronda externa'].includes(safeText(record.basic?.origemOcorrencia)) ? '' : safeText(record.basic?.matriculaEmissor),
        vigilanteRonda: ['Ronda interna','Ronda externa'].includes(safeText(record.basic?.origemOcorrencia)) ? safeText(record.operator?.usuario) : '',
        registroVigilanteRonda: ['Ronda interna','Ronda externa'].includes(safeText(record.basic?.origemOcorrencia)) ? safeText(record.operator?.registro) : '',
        relacionados: {
          pessoas: (record.people || []).length,
          veiculos: (record.vehicles || []).length,
          materiais: (record.materials || []).length,
          documentos: (record.documents || []).length
        },
        atualizadoEm: safeText(record.updatedAt)
      }))
    };
  }

  function extractRecordQuery(text) {
    const raw = safeText(text).toUpperCase();
    const boMatch = raw.match(/(?:BO|BOLETIM)\s*[-#:º°N]*\s*([A-Z0-9./-]{1,})/i);
    if (boMatch?.[1]) return boMatch[1];
    const numeric = raw.match(/\b(\d{1,8})\b/);
    return numeric?.[1] || '';
  }

  function matchesRecordNumber(record, query) {
    const q = normalize(query).replace(/\s/g, '');
    if (!q) return false;
    const number = normalize(recordNumber(record)).replace(/\s/g, '');
    if (number === q || number.endsWith(q)) return true;
    const digitsQ = q.replace(/\D/g, '');
    const digitsN = number.replace(/\D/g, '');
    return Boolean(digitsQ && digitsN && digitsN.endsWith(digitsQ));
  }

  function contextualRecord(text, records) {
    const query = extractRecordQuery(text);
    if (query) {
      const explicit = records.find(record => matchesRecordNumber(record, query));
      if (explicit) return explicit;
    }
    const n = normalize(text);
    const list = nexoContext.lastRecordIds.map(id => records.find(record => record.id === id)).filter(Boolean);
    if (/\b(segundo|2o|2)\b/.test(n) && list[1]) return list[1];
    if (/\b(terceiro|3o|3)\b/.test(n) && list[2]) return list[2];
    if (/\b(ultimo|ultima)\b/.test(n) && list.length) return list[list.length - 1];
    if (/\b(primeiro|primeira|esse|essa|ele|ela|dele|dela|registro|bo)\b/.test(n) && list[0]) return list[0];
    if (nexoContext.lastRecordId) return records.find(record => record.id === nexoContext.lastRecordId) || null;
    return null;
  }

  function setPendingAction(action) {
    nexoContext.pendingAction = action;
    saveContext();
  }

  function clearPendingAction() {
    nexoContext.pendingAction = null;
    saveContext();
  }

  function isYes(text) {
    return /^(sim|confirmo|confirmar|pode|ok|certo|isso|execute|executar|prosseguir|vai|manda)$/i.test(normalize(text));
  }

  function isNo(text) {
    return /^(nao|não|cancelar|cancela|pare|deixa|voltar)$/i.test(safeText(text));
  }

  async function performPendingAction(records) {
    const action = nexoContext.pendingAction;
    clearPendingAction();
    if (!action) return 'Não há ação aguardando confirmação.';

    if (action.type === 'sync-record') {
      const record = records.find(item => item.id === action.recordId);
      if (!record) return 'O registro não está mais disponível.';
      if (record.status !== 'Finalizado') return `${recordNumber(record)} ainda é um rascunho e não deve ser enviado antes da finalização.`;
      if (!navigator.onLine) return 'Estou sem internet. O BO continua salvo no aparelho e pode ser sincronizado quando a conexão voltar.';
      actionFeedback(`Sincronizando ${recordNumber(record)}…`);
      const ok = await syncRecord(record, false);
      actionFeedback(ok ? `${recordNumber(record)} sincronizado.` : `${recordNumber(record)} continua pendente.`, ok ? 'success' : 'warning');
      await refreshRecords();
      setLastRecord(record, 'sincronizacao');
      return ok ? `${recordNumber(record)} sincronizado com sucesso.` : `Não consegui confirmar a sincronização de ${recordNumber(record)}. O registro continua salvo no aparelho.`;
    }

    if (action.type === 'sync-pending') {
      const targets = records.filter(record => action.ids.includes(record.id));
      if (!navigator.onLine) return 'Estou sem internet. A sincronização em lote não pode ser executada agora.';
      let success = 0;
      actionFeedback(`Sincronizando ${targets.length} registro(s)…`);
      for (const record of targets) if (await syncRecord(record, false)) success += 1;
      actionFeedback(`${success} de ${targets.length} sincronizado(s).`, success === targets.length ? 'success' : 'warning');
      await refreshRecords();
      return `Sincronização concluída: ${success} de ${targets.length} registro(s) confirmado(s) no Google Sheets.`;
    }

    if (action.type === 'open-review') {
      const record = records.find(item => item.id === action.recordId);
      if (!record) return 'O registro não está mais disponível.';
      setLastRecord(record, 'revisao');
      addMessage('assistant', `Abrindo ${recordNumber(record)} para revisão. A finalização continuará exigindo as confirmações normais do aplicativo.`);
      actionFeedback(`Abrindo ${recordNumber(record)}…`);
      closeAssistant();
      await openRecord(record.id);
      actionFeedback(`${recordNumber(record)} aberto.`, 'success');
      return '';
    }

    return 'A ação pendente não é mais válida.';
  }

  async function handlePendingConfirmation(text, records) {
    if (!nexoContext.pendingAction) return { handled: false };
    if (isNo(text)) {
      clearPendingAction();
      return { handled: true, response: 'Ação cancelada.' };
    }
    if (isYes(text)) {
      const response = await performPendingAction(records);
      return { handled: true, response };
    }
    return { handled: true, response: 'Há uma ação aguardando confirmação. Responda “sim” para executar ou “cancelar” para desistir.' };
  }

  async function handleLocalCommand(text, records) {
    const n = normalize(text);
    const today = localDateInput();

    const pending = await handlePendingConfirmation(text, records);
    if (pending.handled) return pending;

    if (/\b(excluir|apagar|deletar|remover)\b/.test(n) && /\b(bo|boletim|registro|esse|ele)\b/.test(n)) {
      return { handled: true, response: 'Por segurança, o NEXO não exclui boletins. Use a interface normal do aplicativo para qualquer exclusão permitida.' };
    }

    if (/\b(finalizar|concluir|fechar)\b/.test(n) && /\b(bo|boletim|registro|esse|ele)\b/.test(n)) {
      const record = contextualRecord(text, records);
      if (!record) return { handled: true, response: 'Informe o número do BO que deseja revisar para finalização.' };
      if (record.status === 'Finalizado') return { handled: true, response: `${recordNumber(record)} já está finalizado.` };
      setLastRecord(record, 'revisao');
      setPendingAction({ type: 'open-review', recordId: record.id });
      return { handled: true, response: `Por segurança eu não finalizo o BO automaticamente. Posso abrir ${recordNumber(record)} para revisão e você confirma a finalização na tela normal. Confirmar?` };
    }

    const syncActionRequested = /\b(sincronize|envie|enviar|sincronizar agora|sincronizar pendentes|sincronizar todos|sincronizar esse|sincronizar este|sincronizar bo)\b/.test(n)
      && !/\b(quais|quantos|quantas|lista|listar|mostre|mostrar|existem|tem|status)\b/.test(n);
    if (syncActionRequested) {
      if (!apiConfigured()) return { handled: true, response: 'O endereço do Google Sheets não está configurado neste aplicativo.' };
      if (/\b(pendentes|pendente|todos|tudo|sem sincronizar|nao sincronizados)\b/.test(n)) {
        const targets = records.filter(record => record.status === 'Finalizado' && ['pending', 'error', 'conflict'].includes(record.syncStatus) && record._source !== 'remote');
        if (!targets.length) return { handled: true, response: 'Não encontrei registros locais aguardando sincronização.' };
        setLastRecords(targets, 'sincronizacao');
        setPendingAction({ type: 'sync-pending', ids: targets.map(record => record.id) });
        return { handled: true, response: `Encontrei ${targets.length} registro(s) local(is) para sincronizar com o Google Sheets. Confirmar o envio?` };
      }
      const record = contextualRecord(text, records);
      if (!record) return { handled: true, response: 'Informe o número do BO que deseja sincronizar.' };
      if (record.status !== 'Finalizado') return { handled: true, response: `${recordNumber(record)} ainda é um rascunho. Durante o preenchimento ele fica salvo no aparelho e só entra na sincronização após a finalização.` };
      if (record.syncStatus === 'synced') return { handled: true, response: `${recordNumber(record)} já aparece como sincronizado.` };
      setLastRecord(record, 'sincronizacao');
      setPendingAction({ type: 'sync-record', recordId: record.id });
      return { handled: true, response: `Vou tentar sincronizar ${recordNumber(record)} com o Google Sheets. Confirmar?` };
    }

    if (/\b(novo|nova|iniciar|criar)\b.*\b(bo|boletim|ocorrencia)\b/.test(n)) {
      addMessage('assistant', 'Vou abrir um novo boletim.');
      actionFeedback('Criando novo boletim…');
      closeAssistant();
      await createNewBo();
      actionFeedback('Novo boletim aberto.', 'success');
      return { handled: true, action: true };
    }

    if (/\b(passagem de turno|troca de turno|pendencias para o proximo turno)\b/.test(n)) {
      if (/\b(abrir|abra|mostrar tela|ir para)\b/.test(n)) {
        addMessage('assistant', 'Abrindo a passagem de turno.');
        actionFeedback('Abrindo passagem de turno…');
        closeAssistant();
        await navigate('handoff');
        actionFeedback('Passagem de turno aberta.', 'success');
        return { handled:true, action:true };
      }
      const summary = window.BO_HANDOFF_SUMMARY?.();
      return { handled:true, response: summary || 'A passagem de turno ainda não está disponível.' };
    }

    if (/\b(fila de sincronizacao|abrir fila|ver fila|fila pendente)\b/.test(n)) {
      addMessage('assistant', 'Abrindo a fila de sincronização.');
      actionFeedback('Abrindo fila de sincronização…');
      closeAssistant();
      await navigate('syncqueue');
      actionFeedback('Fila de sincronização aberta.', 'success');
      return { handled:true, action:true };
    }

    if (/\b(diagnostico|diagnosticar|saude do sistema)\b/.test(n)) {
      addMessage('assistant', 'Abrindo o diagnóstico do sistema.');
      actionFeedback('Abrindo diagnóstico…');
      closeAssistant();
      await navigate('diagnostics');
      actionFeedback('Diagnóstico aberto.', 'success');
      return { handled:true, action:true };
    }

    if (/\b(revisar|revise|corrigir|corrija|melhorar|melhore)\b.*\b(redacao|texto|relato)\b|\b(redacao|texto|relato)\b.*\b(revisar|revise|corrigir|corrija|melhorar|melhore)\b/.test(n)) {
      const reviewButton = document.querySelector('[data-action="assistant-review-text"]');
      if (!reviewButton || !state.current || state.current.status === 'Finalizado') {
        return { handled:true, response:'Abra um BO em elaboração e gere o relato consolidado. Depois posso acionar a revisão textual local.' };
      }
      addMessage('assistant', 'Vou revisar a redação do relato atual com as regras locais do NEXO.');
      actionFeedback('Revisando redação…');
      closeAssistant();
      reviewButton.click();
      return { handled:true, action:true };
    }

    if (/\b(roteiro deste bo|roteiro do bo|o que devo coletar|o que preciso coletar|o que perguntar|informacoes deste bo)\b/.test(n)) {
      const record = contextualRecord(text, records) || state.current;
      if (!record) return { handled:true, response:'Abra ou informe um BO para eu mostrar o roteiro padronizado.' };
      const reference = typeof resolvedReference === 'function' ? resolvedReference(record.basic) : safeText(record.basic?.referencia);
      const template = typeof templateFor === 'function' ? templateFor(record.basic?.referencia) : null;
      const questions = typeof templateQuestionList === 'function' ? templateQuestionList(record) : [];
      const essentials = questions.filter(item=>item.required).map(item=>item.label);
      const recommended = questions.filter(item=>item.recommended).map(item=>item.label);
      setLastRecord(record, 'roteiro');
      const parts = [`Roteiro de ${reference || recordNumber(record)}.`];
      if (template?.guidance) parts.push(template.guidance);
      if (essentials.length) parts.push(`Essenciais: ${essentials.slice(0,8).join('; ')}${essentials.length>8?`; + ${essentials.length-8} item(ns)`:''}.`);
      if (recommended.length) parts.push(`Quando disponível: ${recommended.slice(0,5).join('; ')}${recommended.length>5?`; + ${recommended.length-5} item(ns)`:''}.`);
      parts.push('O aplicativo também valida pessoas, veículos, materiais, testemunhas e evidências conforme este modelo.');
      return { handled:true, response:parts.join('\n') };
    }

    if (/\b(checklist|o que falta|faltando|pendencias deste bo|pendencias do bo|verificar bo)\b/.test(n)) {
      const record = contextualRecord(text, records) || state.current;
      if (!record) return { handled:true, response:'Abra ou informe um BO para eu verificar o checklist.' };
      const missing = typeof assistantMissing === 'function' ? assistantMissing(record) : [];
      setLastRecord(record, 'checklist');
      if (!missing.length) return { handled:true, response:`${recordNumber(record)} não possui pendências identificadas pelo checklist local.` };
      const required = missing.filter(item=>item.level==='required');
      const recommended = missing.filter(item=>item.level==='recommended');
      const lines = missing.slice(0,8).map((item,index)=>`${index+1}. ${item.label}: ${item.message}`);
      return { handled:true, response:`Checklist de ${recordNumber(record)}: ${required.length} obrigatória(s) e ${recommended.length} recomendada(s) pendente(s).\n${lines.join('\n')}${missing.length>8?`\n+ ${missing.length-8} outra(s).`:''}` };
    }

    if (/\b(situacao atual|panorama|painel|como esta|status geral)\b/.test(n)) {
      return { handled: true, response: currentSituation(records) };
    }

    if (/\b(prioridade|prioridades|atencao|precisa de atencao|pendencias principais)\b/.test(n)) {
      const attention = attentionRecords(records);
      setLastRecords(attention, 'prioridades');
      return { handled: true, response: attention.length
        ? `Prioridades encontradas:\n${listText(attention, '', 5)}\nConsiderei primeiro falhas/pendências de sincronização e atendimentos operacionais em curso. Rascunhos antigos aparecem apenas como pendência administrativa, sem serem tratados como tempo de atendimento.`
        : 'Não identifiquei rascunhos nem falhas de sincronização que exijam atenção nos dados disponíveis.' };
    }

    if (/\b(ajuda|o que voce faz|comandos|capaz)\b/.test(n)) {
      return { handled: true, response: 'Posso mostrar a situação atual, orientar o roteiro padronizado do BO, conferir checklist e pendências, revisar a redação do relato, apontar prioridades, listar rascunhos, abrir a passagem de turno, a fila e o diagnóstico, localizar/abrir/resumir BOs, sincronizar com confirmação e iniciar um novo boletim. Diga “roteiro deste BO”, “checklist deste BO” ou “modo conversa”.' };
    }

    if (/\b(modo conversa|conversa continua|voz continua)\b/.test(n)) {
      const enable = !/\b(desativar|desligar|parar|off)\b/.test(n);
      setConversationEnabled(enable);
      return { handled: true, response: enable ? 'Modo conversa contínua ativado. Depois de cada resposta, volto a ouvir automaticamente.' : 'Modo conversa contínua desativado.' };
    }

    const target = contextualRecord(text, records);

    if (target && /\b(abrir|abra|ver|mostrar|mostre)\b/.test(n) && !/\b(lista|rascunhos|finalizados|todos|hoje)\b/.test(n)) {
      setLastRecord(target, 'abrir');
      addMessage('assistant', `Encontrei ${summarizeRecord(target)}. Vou abrir o registro.`);
      actionFeedback(`Abrindo ${recordNumber(target)}…`);
      closeAssistant();
      await openRecord(target.id);
      actionFeedback(`${recordNumber(target)} aberto.`, 'success');
      return { handled: true, action: true };
    }

    if (target && /\b(resumir|resuma|resumo|detalhes|detalhe|o que aconteceu|conteudo)\b/.test(n)) {
      setLastRecord(target, 'resumo-registro');
      return { handled: true, response: detailedRecordSummary(target) };
    }

    if (target && /\b(status|situacao|como esta|qual estado)\b/.test(n)) {
      setLastRecord(target, 'status-registro');
      return { handled: true, response: summarizeRecord(target) };
    }

    const recordQuery = extractRecordQuery(text);
    if (recordQuery && /\b(consult|buscar|procura|localiz)\w*\b/.test(n)) {
      const found = records.find(record => matchesRecordNumber(record, recordQuery));
      if (!found) return { handled: true, response: `Não encontrei um boletim correspondente a ${recordQuery} nos dados disponíveis.` };
      setLastRecord(found, 'consulta');
      return { handled: true, response: summarizeRecord(found) };
    }

    if (/\b(ultimo|mais recente|recente)\b.*\b(bo|boletim|registro)\b/.test(n)) {
      if (!records.length) return { handled: true, response: 'Ainda não há boletins disponíveis.' };
      setLastRecord(records[0], 'ultimo');
      return { handled: true, response: `O boletim mais recente é: ${summarizeRecord(records[0])}.` };
    }

    if (/\b(rascunh)\w*\b/.test(n) && /\b(quant|exist|tem|lista|mostr|quais|abrir)\w*\b/.test(n)) {
      const drafts = records.filter(record => record.status === 'Rascunho').sort((a, b) => ageMs(b) - ageMs(a));
      setLastRecords(drafts, 'rascunhos');
      return { handled: true, response: drafts.length ? `Existem ${drafts.length} rascunho(s).\n${listText(drafts, '', 5)}` : 'Não há rascunhos disponíveis.' };
    }

    if (/\b(sem sincronizar|sincronizacao|sincronizar)\b/.test(n) && /\b(quais|lista|mostr|quant|pendente|erro)\w*\b/.test(n)) {
      const pendingSync = records.filter(record => record.status === 'Finalizado' && ['pending', 'error', 'conflict'].includes(record.syncStatus) && record._source !== 'remote');
      setLastRecords(pendingSync, 'pendencias-sync');
      return { handled: true, response: pendingSync.length ? `Há ${pendingSync.length} registro(s) sem confirmação de sincronização.\n${listText(pendingSync, '', 5)}` : 'Todos os registros locais disponíveis estão sincronizados.' };
    }

    if (/\b(finaliz)\w*\b/.test(n) && /\b(quant|exist|tem|total|quais|lista|mostr)\w*\b/.test(n)) {
      const onlyToday = /\bhoje\b/.test(n);
      const finalized = records.filter(record => record.status === 'Finalizado' && (!onlyToday || safeText(record.basic?.data) === today));
      setLastRecords(finalized, 'finalizados');
      return { handled: true, response: finalized.length ? `${onlyToday ? 'Hoje há' : 'Há'} ${finalized.length} BO(s) finalizado(s).\n${listText(finalized, '', 5)}` : `Não encontrei BOs finalizados${onlyToday ? ' com a data de hoje' : ''}.` };
    }

    if (/\b(hoje|resumo|atividade)\b/.test(n) && /\b(bo|boletim|registro|resumo|atividade|quant)\w*\b/.test(n)) {
      const todayRecords = records.filter(record => safeText(record.basic?.data) === today);
      setLastRecords(todayRecords, 'hoje');
      const finalized = todayRecords.filter(record => record.status === 'Finalizado').length;
      const drafts = todayRecords.filter(record => record.status === 'Rascunho').length;
      const refs = new Map();
      todayRecords.forEach(record => {
        const ref = recordReference(record);
        refs.set(ref, (refs.get(ref) || 0) + 1);
      });
      const topRef = [...refs.entries()].sort((a, b) => b[1] - a[1])[0];
      return { handled: true, response: todayRecords.length
        ? `Hoje há ${todayRecords.length} BO(s): ${finalized} finalizado(s) e ${drafts} rascunho(s).${topRef ? ` Referência mais frequente: ${topRef[0]} (${topRef[1]}).` : ''}`
        : 'Não encontrei boletins com a data de hoje nos dados disponíveis.' };
    }

    if (/\b(quant|total|numero de)\w*\b.*\b(bo|boletim|registro)\w*\b/.test(n)) {
      return { handled: true, response: `Há ${records.length} BO(s) disponível(is): ${records.filter(r => r.status === 'Rascunho').length} rascunho(s) e ${records.filter(r => r.status === 'Finalizado').length} finalizado(s).` };
    }

    if (/\b(ir|abrir|mostrar)\b.*\b(lista|boletins|registros)\b/.test(n)) {
      addMessage('assistant', 'Abrindo a consulta de boletins.');
      actionFeedback('Abrindo consulta de boletins…');
      closeAssistant();
      await navigate('records');
      actionFeedback('Consulta aberta.', 'success');
      return { handled: true, action: true };
    }

    return { handled: false };
  }

  function getAssistantToken(askIfMissing = true) {
    let token = '';
    try { token = sessionStorage.getItem(NEXO_TOKEN_KEY) || ''; } catch (_) {}
    if (token || !askIfMissing) return token;
    const entered = window.prompt('Código de acesso do NEXO IA. Esse código é definido nas propriedades do Apps Script e não é a chave da OpenAI.');
    token = safeText(entered);
    if (token) {
      try { sessionStorage.setItem(NEXO_TOKEN_KEY, token); } catch (_) {}
    }
    return token;
  }

  function clearAssistantToken() {
    try { sessionStorage.removeItem(NEXO_TOKEN_KEY); } catch (_) {}
  }

  async function askAi(text, records) {
    const status = await checkAiStatus();
    if (!status.configured) return null;
    const assistantToken = status.requiresAccessToken ? getAssistantToken(true) : '';
    if (status.requiresAccessToken && !assistantToken) return null;
    const recentConversation = messages.slice(-10).map(item => ({ role: item.role, text: item.text }));
    const payload = {
      action: 'assistant',
      assistantToken,
      message: safeText(text),
      context: compactContext(records),
      history: recentConversation,
      operator: {
        usuario: safeText(state.operator?.usuario),
        registro: safeText(state.operator?.registro),
        turno: safeText(state.operator?.turno)
      }
    };
    try {
      const result = await apiPost(payload);
      if (!result?.answer) throw new Error('A IA não devolveu uma resposta válida.');
      aiStatus.configured = result.assistantConfigured !== false;
      aiStatus.model = safeText(result.model || aiStatus.model);
      updateStatus();
      return safeText(result.answer);
    } catch (error) {
      if (String(error?.message || '').includes('NEXO_AUTH_REQUIRED')) clearAssistantToken();
      throw error;
    }
  }

  async function submitPrompt(rawText) {
    const text = safeText(rawText);
    if (!text || busy) return;
    stopListening(false);
    input.value = '';
    autoGrowInput();
    addMessage('user', text, { speak: false });
    setBusy(true, 'Analisando…');
    updateStatus();

    try {
      const records = await getAllRecords(true);
      const local = await handleLocalCommand(text, records);
      if (local.handled) {
        if (local.response) addMessage('assistant', local.response);
        return;
      }

      try {
        const aiAnswer = await askAi(text, records);
        if (aiAnswer) {
          addMessage('assistant', aiAnswer);
          return;
        }
      } catch (error) {
        console.warn('NEXO IA:', error);
        aiStatus.configured = false;
        updateStatus();
      }

      addMessage('assistant', 'Não reconheci esse pedido no modo local. Tente “situação atual”, “roteiro deste BO”, “checklist deste BO”, “prioridades”, “resumir BO 26”, “abrir BO 26” ou “sincronizar pendentes”. Perguntas livres continuam opcionais e exigem integração externa.', { speak: false });
    } finally {
      setBusy(false);
      updateStatus();
      input.disabled = false;
      input.focus({ preventScroll: true });
      scheduleConversationListening(500);
    }
  }

  function autoGrowInput() {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 112)}px`;
  }

  fab.addEventListener('click', openAssistant);
  closeButton.addEventListener('click', closeAssistant);
  backdrop.addEventListener('click', event => { if (event.target === backdrop) closeAssistant(); });
  panel.addEventListener('click', event => event.stopPropagation());
  micButton.addEventListener('click', () => listening ? stopListening(true) : startListening(false));
  voiceToggle.addEventListener('click', () => {
    const enabled = !voiceEnabled();
    setVoiceEnabled(enabled);
    if (!enabled) window.speechSynthesis?.cancel?.();
  });
  conversationToggle.addEventListener('click', () => setConversationEnabled(!conversationEnabled()));
  form.addEventListener('submit', event => {
    event.preventDefault();
    submitPrompt(input.value);
  });
  input.addEventListener('input', autoGrowInput);
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  root.querySelectorAll('[data-nexo-prompt]').forEach(button => button.addEventListener('click', () => submitPrompt(button.dataset.nexoPrompt)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !backdrop.classList.contains('hidden')) closeAssistant();
  });
  window.addEventListener('online', () => { aiStatus.checked = false; checkAiStatus(true); });
  window.addEventListener('offline', updateStatus);

  const routeObserver = new MutationObserver(updateVisibility);
  routeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-route'] });

  setVoiceEnabled(voiceEnabled());
  setConversationEnabled(conversationEnabled());
  renderMessages();
  updateVisibility();
  updateStatus();

  window.NEXO_ASSISTANT = {
    open: openAssistant,
    close: closeAssistant,
    ask: submitPrompt,
    refreshStatus: () => checkAiStatus(true),
    clearContext: () => {
      nexoContext = { lastRecordId: '', lastRecordIds: [], pendingAction: null, lastIntent: '' };
      saveContext();
    }
  };
})();
