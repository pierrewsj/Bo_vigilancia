'use strict';

const DB_NAME = 'bo-digital-prototipo';
const DB_VERSION = 1;
const STORE = 'boletins';
const SETTINGS_KEY = 'bo-digital-gsheets-settings-v1';
const DEFAULT_SETTINGS = { apiUrl: '' };

const REFERENCE_GROUPS = [
  {
    label: 'Referências gerais',
    options: [
      'Acesso',
      'Ato doloso',
      'Auditoria de processos',
      'Carga de materiais',
      'Emergência',
      'Fiscalização',
      'Irregularidade',
      'Ocorrência médica',
      'Ronda (interna / externa)',
      'Sintomas de embriaguez',
      'Transgressão disciplinar',
      'Veículos',
      'Souza Lima'
    ]
  },
  {
    label: 'Danos materiais',
    options: [
      'Agressão física',
      'Avaria em peças / vasilhames',
      'Danos às instalações industriais',
      'Entrada com danos',
      'Erro operacional',
      'Faixa horária inválida',
      'Furto em área externa',
      'Furto em área interna',
      'Incêndio',
      'Ofensa moral',
      'Queixa de desaparecimento de material / equipamento',
      'Recolhimento de material / equipamento',
      'Transporte por reboque',
      'Outra'
    ].map(item => `Danos materiais — ${item}`)
  }
];

const REFERENCES = REFERENCE_GROUPS.flatMap(group => group.options);

const DIRECTORATES = [
  'BRAND MARKETING', 'COMMERCIAL FIAT', 'COMMERCIAL JEEP', 'COMPRAS',
  'COMUNICAÇÃO CORPORATIVA', 'CUSTOMER CARE', 'DESENVOLVIMENTO DE REDE',
  'DESIGN', 'ENGENHARIA', 'FIAT BRAND', 'FINANCE', 'ICT', 'JEEP BRAND',
  'JURÍDICO', 'MANUFATURA', 'MOPAR', 'PORTIFÓLIO', 'PRESIDÊNCIA',
  'PRODUTO', 'QUALIDADE', 'RECURSOS HUMANOS', 'SUPPLY CHAIN', 'Outra'
];

const LOCATIONS = [
  'Galpão', 'Portaria', 'Pátio', 'Estacionamento', 'Rua', 'Almoxarifado',
  'Área interna', 'Área externa', 'Outro'
];

const STEPS = [
  'Ocorrência', 'Pessoas', 'Veículos', 'Materiais', 'Anexos', 'Histórico', 'Revisão'
];

const ICONS = {
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 20 4.2-1 10-10a2.1 2.1 0 0 0-3-3l-10 10zM14 7l3 3"/></svg>',
  trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
  clipboard: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5h8v3H8zM6 6H4v15h16V6h-2M8 12h8M8 16h6"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
  users: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 7a3 3 0 0 1 0 6M17 15a5 5 0 0 1 4 5"/></svg>',
  car: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 11 2-5h10l2 5M4 11h16v7H4zM7 18v2M17 18v2M7 14h.01M17 14h.01"/></svg>',
  box: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 7 8-4 8 4-8 4zM4 7v10l8 4 8-4V7M12 11v10"/></svg>',
  paperclip: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 12 6-6a4 4 0 0 1 6 6l-8 8a6 6 0 0 1-8-8l8-8"/></svg>',
  history: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
  file: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l4 4v14H6zM14 3v5h5"/></svg>',
  download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>',
  upload: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21V9M7 14l5-5 5 5M5 3h14"/></svg>',
  shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 20 6v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6zM9 12l2 2 4-4"/></svg>',
  database: '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>',
  sync: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7h-6V1M4 17h6v6M20 7a8 8 0 0 0-14-3L4 6M4 17a8 8 0 0 0 14 3l2-2"/></svg>',
  bot: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="6" width="16" height="13" rx="4"/><path d="M9 11h.01M15 11h.01M9 15h6M12 6V3"/></svg>',
  gear: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l-2-.7-.7-1.7.9-1.9-2.1-2.1-1.9.9-1.7-.7L10.5 2h-3l-.7 2-1.7.7-1.9-.9L1.1 5.9 2 7.8l-.7 1.7-2 .7v3l2 .7.7 1.7-.9 1.9 2.1 2.1 1.9-.9 1.7.7.7 2h3l.7-2 1.7-.7 1.9.9 2.1-2.1-.9-1.9.7-1.7z"/></svg>'
};

const state = {
  route: 'home',
  records: [],
  current: null,
  currentStep: 0,
  filter: 'Todos',
  search: '',
  previousRoute: 'home',
  deferredInstall: null,
  dialog: null,
  settings: { ...DEFAULT_SETTINGS },
  syncState: 'offline',
  botOpen: false
};

const app = document.querySelector('#app');
const headerTitle = document.querySelector('#header-title');
const headerSubtitle = document.querySelector('#header-subtitle');
const backButton = document.querySelector('#back-button');
const bottomNav = document.querySelector('#bottom-nav');
const installButton = document.querySelector('#install-button');
const dialog = document.querySelector('#entity-dialog');
const dialogForm = document.querySelector('#entity-form');
const dialogBody = document.querySelector('#dialog-body');
const dialogTitle = document.querySelector('#dialog-title');
const dialogEyebrow = document.querySelector('#dialog-eyebrow');
const toast = document.querySelector('#toast');
const botFab = document.querySelector('#bot-fab');
const botPanel = document.querySelector('#bot-panel');
const botClose = document.querySelector('#bot-close');
const botBackdrop = document.querySelector('#bot-backdrop');
const botMessages = document.querySelector('#bot-messages');
const botChips = document.querySelector('#bot-chips');
const botInput = document.querySelector('#bot-input');
const botSend = document.querySelector('#bot-send');

let dbPromise;
let autosaveTimer;
let toastTimer;

function openDatabase() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

async function dbGetAll() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function dbPut(record) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put(record);
    request.onsuccess = () => resolve(record);
    request.onerror = () => reject(request.error);
  });
}

async function dbDelete(id) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function localDateInput(date = new Date()) {
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return shifted.toISOString().slice(0, 10);
}

function localTimeInput(date = new Date()) {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(value) {
  if (!value) return 'Não informado';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

function formatDateOnly(value) {
  if (!value) return 'Não informado';
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function humanSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function nextNumber() {
  const year = new Date().getFullYear();
  const key = `bo-sequence-${year}`;
  const next = Number(localStorage.getItem(key) || '0') + 1;
  localStorage.setItem(key, String(next));
  return `BO-${year}-${String(next).padStart(6, '0')}`;
}

function createBlankRecord() {
  const now = new Date();
  return {
    id: uid(),
    numero: nextNumber(),
    status: 'Rascunho',
    currentStep: 0,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    finalizedAt: '',
    basic: {
      data: localDateInput(now),
      hora: localTimeInput(now),
      referencia: '',
      referenciaOutra: '',
      matriculaEmissor: '',
      nomeEmissor: '',
      emailEmissor: '',
      local: '',
      complementoLocal: '',
      diretoria: '',
      diretoriaOutra: ''
    },
    people: [],
    vehicles: [],
    materials: [],
    attachments: [],
    history: {
      relato: '',
      providencias: '',
      observacoes: ''
    }
  };
}

async function refreshRecords() {
  const records = (await dbGetAll()).map(normalizeRecord);
  for (const record of records) await dbPut(record);
  state.records = records.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

async function saveCurrent(silent = true) {
  if (!state.current) return;
  state.current.updatedAt = new Date().toISOString();
  state.current.currentStep = state.currentStep;
  await dbPut(state.current);
  await refreshRecords();
  if (!silent) showToast('Rascunho salvo neste dispositivo.');
}

function scheduleSave() {
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => saveCurrent(true), 350);
}

function setPath(target, path, value) {
  const parts = path.split('.');
  let obj = target;
  for (let i = 0; i < parts.length - 1; i += 1) obj = obj[parts[i]];
  obj[parts.at(-1)] = value;
}

function selectOptions(values, selected = '', placeholder = 'Selecione') {
  return `<option value="">${escapeHtml(placeholder)}</option>${values.map(value => `<option value="${escapeHtml(value)}" ${value === selected ? 'selected' : ''}>${escapeHtml(value)}</option>`).join('')}`;
}

function referenceSelectOptions(selected = '') {
  const groups = REFERENCE_GROUPS.map(group => {
    const options = group.options.map(value => `<option value="${escapeHtml(value)}" ${value === selected ? 'selected' : ''}>${escapeHtml(value.replace('Danos materiais — ', ''))}</option>`).join('');
    return `<optgroup label="${escapeHtml(group.label)}">${options}</optgroup>`;
  }).join('');
  return `<option value="">Selecione a referência</option>${groups}`;
}

function loadSettings() {
  try {
    state.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
  } catch {
    state.settings = { ...DEFAULT_SETTINGS };
  }
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
}

function apiConfigured() {
  return /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?.*)?$/i.test((state.settings.apiUrl || '').trim());
}

function syncBadgeHtml() {
  if (!apiConfigured()) return '<span class="sync-badge"><i></i> Planilha não configurada</span>';
  if (state.syncState === 'error') return '<span class="sync-badge error"><i></i> Erro de sincronização</span>';
  if (state.syncState === 'syncing') return '<span class="sync-badge"><i></i> Sincronizando...</span>';
  return '<span class="sync-badge online"><i></i> Google Sheets configurado</span>';
}

function normalizeRecord(record) {
  const normalized = structuredClone(record || {});
  normalized.basic ||= {};
  normalized.people ||= [];
  normalized.vehicles ||= [];
  normalized.materials ||= [];
  normalized.attachments ||= [];
  normalized.history ||= { relato: '', providencias: '', observacoes: '' };

  if (normalized.basic.subreferencia) {
    const sub = normalized.basic.subreferencia === 'Outra'
      ? normalized.basic.subreferenciaOutra
      : normalized.basic.subreferencia;
    normalized.basic.referencia = sub
      ? `${normalized.basic.referencia || 'Danos materiais'} — ${sub}`
      : normalized.basic.referencia;
  }
  normalized.basic.referenciaOutra ||= '';
  normalized.basic.diretoriaOutra ||= '';
  delete normalized.basic.subreferencia;
  delete normalized.basic.subreferenciaOutra;
  return normalized;
}

function recordForSync(record) {
  const clean = structuredClone(record);
  clean.attachments = (clean.attachments || []).map(({ id, name, type, size }) => ({ id, name, type, size }));
  return clean;
}

async function apiGet(params = {}) {
  const url = new URL(state.settings.apiUrl);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  url.searchParams.set('_', Date.now());
  const response = await fetch(url.toString(), { method: 'GET', cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const payload = await response.json();
  if (payload.ok === false) throw new Error(payload.error || 'Erro na planilha');
  return payload;
}

async function apiPost(payload) {
  const response = await fetch(state.settings.apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const result = await response.json();
  if (result.ok === false) throw new Error(result.error || 'Erro na planilha');
  return result;
}

async function syncRecord(record, notify = true) {
  if (!apiConfigured()) {
    if (notify) showToast('Configure o endereço do Apps Script na aba Banco.');
    return false;
  }
  state.syncState = 'syncing';
  try {
    await apiPost({ action: 'upsert', record: recordForSync(record) });
    state.syncState = 'online';
    record.syncedAt = new Date().toISOString();
    await dbPut(record);
    if (notify) showToast('Boletim sincronizado com o Google Sheets.');
    return true;
  } catch (error) {
    console.error(error);
    state.syncState = 'error';
    if (notify) showToast(`Não foi possível sincronizar: ${error.message}`);
    return false;
  }
}

async function pullFromSheets() {
  if (!apiConfigured()) {
    showToast('Configure o endereço do Apps Script primeiro.');
    return;
  }
  state.syncState = 'syncing';
  try {
    const payload = await apiGet({ action: 'list' });
    const records = Array.isArray(payload.records) ? payload.records : [];
    for (const record of records) await dbPut(normalizeRecord(record));
    await refreshRecords();
    state.syncState = 'online';
    showToast(`${records.length} boletim(ns) carregado(s) da planilha.`);
    renderAbout();
  } catch (error) {
    console.error(error);
    state.syncState = 'error';
    showToast(`Falha ao consultar a planilha: ${error.message}`);
    renderAbout();
  }
}

async function testSheetsConnection() {
  if (!apiConfigured()) {
    showToast('Informe um endereço de Apps Script válido.');
    return;
  }
  state.syncState = 'syncing';
  renderAbout();
  try {
    const payload = await apiGet({ action: 'ping' });
    state.syncState = 'online';
    showToast(payload.message || 'Conexão com a planilha confirmada.');
  } catch (error) {
    state.syncState = 'error';
    showToast(`Conexão não confirmada: ${error.message}`);
  }
  renderAbout();
}

async function syncAllLocalRecords() {
  if (!apiConfigured()) {
    showToast('Configure o endereço do Apps Script primeiro.');
    return;
  }
  state.syncState = 'syncing';
  renderAbout();
  let success = 0;
  for (const record of state.records) {
    if (await syncRecord(record, false)) success += 1;
  }
  await refreshRecords();
  state.syncState = success === state.records.length ? 'online' : 'error';
  showToast(`${success} de ${state.records.length} boletim(ns) sincronizado(s).`);
  renderAbout();
}

function updateHeader() {
  const config = {
    home: ['BO Digital', 'Protótipo local'],
    records: ['Boletins', 'Consulta e rascunhos'],
    about: ['Sobre o protótipo', 'Informações e dados'],
    wizard: [state.current?.numero || 'Novo boletim', `Etapa ${state.currentStep + 1} de ${STEPS.length}`],
    detail: [state.current?.numero || 'Boletim', state.current?.status || 'Detalhes']
  };
  const [title, subtitle] = config[state.route] || config.home;
  headerTitle.textContent = title;
  headerSubtitle.textContent = subtitle;
  const showBack = ['wizard', 'detail'].includes(state.route);
  backButton.classList.toggle('hidden', !showBack);
  bottomNav.classList.toggle('hidden', state.route === 'wizard');
  document.querySelectorAll('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.route === state.route));
}

async function navigate(route, options = {}) {
  state.previousRoute = state.route;
  state.route = route;
  if (options.record) state.current = options.record;
  if (Number.isInteger(options.step)) state.currentStep = options.step;
  updateHeader();
  await render();
  updateBotContext(state.botOpen);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  app.focus({ preventScroll: true });
}

async function render() {
  if (state.route === 'home') renderHome();
  if (state.route === 'records') renderRecords();
  if (state.route === 'about') renderAbout();
  if (state.route === 'wizard') renderWizard();
  if (state.route === 'detail') renderDetail();
}

function renderHome() {
  const drafts = state.records.filter(r => r.status === 'Rascunho').length;
  const finalized = state.records.filter(r => r.status === 'Finalizado').length;
  const recent = state.records.slice(0, 3);

  app.innerHTML = `
    <section class="hero">
      <p class="eyebrow">Boletim de ocorrência</p>
      <h1>Um fluxo guiado, rápido e organizado.</h1>
      <p>Cadastre a ocorrência por etapas, use o assistente Guardião e sincronize os registros com uma planilha Google Sheets.</p>
      <div class="hero-actions">
        <button class="button primary" type="button" data-action="new-bo">${ICONS.plus} Novo boletim</button>
        <button class="button ghost" type="button" data-action="show-drafts">Ver rascunhos</button>
        <button class="button ghost" type="button" data-action="show-bank">${ICONS.database} Configurar banco</button>
      </div>
      <div style="margin-top:14px">${syncBadgeHtml()}</div>
    </section>

    <div class="metric-grid" aria-label="Resumo local">
      <div class="metric-card"><span>Total</span><strong>${state.records.length}</strong></div>
      <div class="metric-card"><span>Rascunhos</span><strong>${drafts}</strong></div>
      <div class="metric-card"><span>Finalizados</span><strong>${finalized}</strong></div>
    </div>

    <div class="section-title">
      <div><p class="eyebrow">Atalhos</p><h2>O que deseja fazer?</h2></div>
    </div>
    <div class="card-grid">
      <button class="action-card" type="button" data-action="new-bo">
        <span class="card-icon">${ICONS.clipboard}</span>
        <span><strong>Novo boletim</strong><span>Iniciar um registro do zero.</span></span>
      </button>
      <button class="action-card" type="button" data-action="show-records">
        <span class="card-icon">${ICONS.search}</span>
        <span><strong>Consultar</strong><span>Pesquisar número, pessoa ou placa.</span></span>
      </button>
      <button class="action-card" type="button" data-action="show-bank">
        <span class="card-icon">${ICONS.sync}</span>
        <span><strong>Google Sheets</strong><span>Configurar e sincronizar o banco de dados.</span></span>
      </button>
      <button class="action-card" type="button" data-action="open-bot">
        <span class="card-icon">${ICONS.bot}</span>
        <span><strong>Assistente Guardião</strong><span>Receber ajuda durante o preenchimento.</span></span>
      </button>
    </div>

    <div class="section-title">
      <div><p class="eyebrow">Atividade</p><h2>Registros recentes</h2></div>
      ${state.records.length ? '<button class="button small secondary" type="button" data-action="show-records">Ver todos</button>' : ''}
    </div>
    ${recent.length ? `<div class="record-list">${recent.map(recordCard).join('')}</div>` : '<div class="entity-empty">Nenhum boletim criado neste dispositivo.</div>'}
  `;

  bindCommonCards();
}

function recordCard(record) {
  const summary = record.basic?.referencia === 'Danos materiais — Outra'
    ? record.basic?.referenciaOutra
    : (record.basic?.referencia || 'Ocorrência ainda não classificada');
  return `
    <article class="record-card">
      <div>
        <h3>${escapeHtml(record.numero)}</h3>
        <p>${escapeHtml(summary)}${record.basic?.local ? ` • ${escapeHtml(record.basic.local)}` : ''}</p>
        <div class="entity-meta">
          <span class="chip status-${record.status.toLowerCase()}">${escapeHtml(record.status)}</span>
          <span class="chip">${record.people?.length || 0} pessoa(s)</span>
        </div>
      </div>
      <div class="record-side">
        <time>${formatDateTime(record.updatedAt)}</time>
        <button class="button small secondary" type="button" data-open-record="${record.id}">${record.status === 'Rascunho' ? 'Continuar' : 'Abrir'}</button>
      </div>
    </article>`;
}

function bindCommonCards() {
  app.querySelectorAll('[data-action="new-bo"]').forEach(button => button.addEventListener('click', createNewBo));
  app.querySelectorAll('[data-action="show-records"]').forEach(button => button.addEventListener('click', () => navigate('records')));
  app.querySelectorAll('[data-action="show-bank"]').forEach(button => button.addEventListener('click', () => navigate('about')));
  app.querySelectorAll('[data-action="open-bot"]').forEach(button => button.addEventListener('click', openBot));
  app.querySelectorAll('[data-action="show-drafts"]').forEach(button => button.addEventListener('click', () => {
    state.filter = 'Rascunho';
    navigate('records');
  }));
  app.querySelectorAll('[data-open-record]').forEach(button => button.addEventListener('click', () => openRecord(button.dataset.openRecord)));
}

async function createNewBo() {
  const record = createBlankRecord();
  await dbPut(record);
  await refreshRecords();
  state.current = record;
  state.currentStep = 0;
  navigate('wizard');
}

async function openRecord(id) {
  const record = state.records.find(item => item.id === id);
  if (!record) return;
  state.current = structuredClone(record);
  if (record.status === 'Rascunho') {
    state.currentStep = Math.min(record.currentStep || 0, STEPS.length - 1);
    navigate('wizard');
  } else {
    navigate('detail');
  }
}

function renderWizard() {
  const content = [
    renderBasicStep,
    () => renderEntityStep('people'),
    () => renderEntityStep('vehicles'),
    () => renderEntityStep('materials'),
    renderAttachmentsStep,
    renderHistoryStep,
    renderReviewStep
  ][state.currentStep]();

  const progress = ((state.currentStep + 1) / STEPS.length) * 100;
  app.innerHTML = `
    <div class="step-shell">
      <section class="progress-card">
        <div class="progress-top"><strong>${escapeHtml(STEPS[state.currentStep])}</strong><span>${state.currentStep + 1} de ${STEPS.length}</span></div>
        <div class="progress-track"><span style="width:${progress}%"></span></div>
      </section>
      ${content}
      <div class="step-actions">
        <button class="button secondary" type="button" data-step-action="${state.currentStep === 0 ? 'exit' : 'previous'}">${state.currentStep === 0 ? 'Sair' : 'Voltar'}</button>
        <div class="right">
          <button class="button secondary" type="button" data-step-action="save">Salvar</button>
          ${state.currentStep < STEPS.length - 1 ? '<button class="button primary" type="button" data-step-action="next">Continuar</button>' : '<button class="button primary" type="button" data-step-action="finalize">Finalizar boletim</button>'}
        </div>
      </div>
    </div>`;

  bindWizardInputs();
  bindStepSpecific();
  app.querySelectorAll('[data-step-action]').forEach(button => button.addEventListener('click', () => handleStepAction(button.dataset.stepAction)));
}

function renderBasicStep() {
  const b = state.current.basic;
  const referenceOtherVisible = b.referencia === 'Danos materiais — Outra';
  const directorateOtherVisible = b.diretoria === 'Outra';
  return `
    <section class="form-card">
      <p class="eyebrow">Etapa 1</p>
      <h1>Dados da ocorrência</h1>
      <p>A antiga sub-referência foi incorporada ao campo Referência. Os campos em amarelo ainda precisam ser preenchidos.</p>
      <div class="form-grid">
        <div class="field">
          <label class="required" for="bo-date">Data da ocorrência</label>
          <input id="bo-date" type="date" value="${escapeHtml(b.data)}" data-path="basic.data" required>
        </div>
        <div class="field">
          <label class="required" for="bo-time">Hora da ocorrência</label>
          <input id="bo-time" type="time" value="${escapeHtml(b.hora)}" data-path="basic.hora" required>
        </div>
        <div class="field full">
          <label class="required" for="bo-ref">Referência</label>
          <select id="bo-ref" data-path="basic.referencia" data-rerender="true" required>${referenceSelectOptions(b.referencia)}</select>
        </div>
        ${referenceOtherVisible ? `<div class="field full"><label class="required" for="bo-ref-other">Descreva a referência</label><input id="bo-ref-other" type="text" value="${escapeHtml(b.referenciaOutra)}" data-path="basic.referenciaOutra" placeholder="Informe a ocorrência não listada" required></div>` : ''}
        <div class="field">
          <label class="required" for="bo-reg">Matrícula do emissor</label>
          <input id="bo-reg" type="text" inputmode="numeric" value="${escapeHtml(b.matriculaEmissor)}" data-path="basic.matriculaEmissor" placeholder="Ex.: 76313" required>
        </div>
        <div class="field">
          <label class="required" for="bo-name">Nome do emissor</label>
          <input id="bo-name" type="text" value="${escapeHtml(b.nomeEmissor)}" data-path="basic.nomeEmissor" autocomplete="name" required>
        </div>
        <div class="field full">
          <label for="bo-email">E-mail do emissor</label>
          <input id="bo-email" type="email" value="${escapeHtml(b.emailEmissor)}" data-path="basic.emailEmissor" autocomplete="email" placeholder="Opcional no protótipo">
        </div>
        <div class="field">
          <label class="required" for="bo-local">Local da ocorrência</label>
          <select id="bo-local" data-path="basic.local" required>${selectOptions(LOCATIONS, b.local)}</select>
        </div>
        <div class="field">
          <label class="required" for="bo-local-detail">Descrição complementar do local</label>
          <input id="bo-local-detail" type="text" value="${escapeHtml(b.complementoLocal)}" data-path="basic.complementoLocal" placeholder="Numeração, sala, rua, almoxarifado..." required>
        </div>
        <div class="field full">
          <label class="required" for="bo-directorate">Diretoria relacionada</label>
          <select id="bo-directorate" data-path="basic.diretoria" data-rerender="true" required>${selectOptions(DIRECTORATES, b.diretoria)}</select>
        </div>
        ${directorateOtherVisible ? `<div class="field full"><label class="required" for="bo-directorate-other">Informe a diretoria</label><input id="bo-directorate-other" type="text" value="${escapeHtml(b.diretoriaOutra)}" data-path="basic.diretoriaOutra" placeholder="Digite a diretoria relacionada" required></div>` : ''}
      </div>
    </section>
    <div class="notice">Referência única: por exemplo, “Danos materiais — Entrada com danos”. Não existe mais um campo separado de sub-referência.</div>`;
}

function renderEntityStep(type) {
  const configs = {
    people: {
      eyebrow: 'Etapa 2', title: 'Solicitantes e envolvidos', description: 'Adicione quantas pessoas forem necessárias. Não há limite fixo de envolvido 1, 2 ou 3.',
      button: 'Adicionar pessoa', icon: ICONS.users, items: state.current.people, empty: 'Nenhuma pessoa adicionada.', render: renderPersonItem
    },
    vehicles: {
      eyebrow: 'Etapa 3', title: 'Veículos', description: 'Cadastre veículos ligados ao boletim ou a uma pessoa específica.',
      button: 'Adicionar veículo', icon: ICONS.car, items: state.current.vehicles, empty: 'Nenhum veículo adicionado.', render: renderVehicleItem
    },
    materials: {
      eyebrow: 'Etapa 4', title: 'Materiais', description: 'Inclua materiais, MVM, nota fiscal, fornecedor, desenho e quantidade.',
      button: 'Adicionar material', icon: ICONS.box, items: state.current.materials, empty: 'Nenhum material adicionado.', render: renderMaterialItem
    }
  };
  const c = configs[type];
  return `
    <section class="list-card">
      <div class="entity-toolbar">
        <div><p class="eyebrow">${c.eyebrow}</p><h2>${c.title}</h2></div>
        <button class="button primary small" type="button" data-add-entity="${type}">${ICONS.plus} ${c.button}</button>
      </div>
      <p>${c.description}</p>
      <div class="entity-list">
        ${c.items.length ? c.items.map((item, index) => c.render(item, index)).join('') : `<div class="entity-empty">${c.empty}</div>`}
      </div>
    </section>`;
}

function renderPersonItem(person, index) {
  return `<article class="entity-item">
    <div><h3>${escapeHtml(person.nome || 'Pessoa sem nome')}</h3><div class="entity-meta"><span class="chip">${escapeHtml(person.tipo)}</span><span class="chip">${escapeHtml(person.vinculo)}</span>${person.matricula ? `<span class="chip">Matrícula ${escapeHtml(person.matricula)}</span>` : ''}</div></div>
    <div class="entity-buttons"><button class="mini-icon" type="button" data-edit-entity="people" data-index="${index}" aria-label="Editar pessoa">${ICONS.edit}</button><button class="mini-icon danger" type="button" data-delete-entity="people" data-index="${index}" aria-label="Excluir pessoa">${ICONS.trash}</button></div>
  </article>`;
}

function renderVehicleItem(vehicle, index) {
  return `<article class="entity-item">
    <div><h3>${escapeHtml(vehicle.placa || 'Veículo sem identificação')}</h3><div class="entity-meta">${vehicle.marca ? `<span class="chip">${escapeHtml(vehicle.marca)} ${escapeHtml(vehicle.modelo)}</span>` : ''}${vehicle.pessoaNome ? `<span class="chip">Ligado a ${escapeHtml(vehicle.pessoaNome)}</span>` : '<span class="chip">Ligado ao BO</span>'}</div></div>
    <div class="entity-buttons"><button class="mini-icon" type="button" data-edit-entity="vehicles" data-index="${index}" aria-label="Editar veículo">${ICONS.edit}</button><button class="mini-icon danger" type="button" data-delete-entity="vehicles" data-index="${index}" aria-label="Excluir veículo">${ICONS.trash}</button></div>
  </article>`;
}

function renderMaterialItem(material, index) {
  return `<article class="entity-item">
    <div><h3>${escapeHtml(material.denominacao || 'Material sem denominação')}</h3><div class="entity-meta">${material.quantidade ? `<span class="chip">${escapeHtml(material.quantidade)} ${escapeHtml(material.unidade)}</span>` : ''}${material.mvm ? `<span class="chip">MVM/NF ${escapeHtml(material.mvm)}</span>` : ''}${material.pessoaNome ? `<span class="chip">Ligado a ${escapeHtml(material.pessoaNome)}</span>` : ''}</div></div>
    <div class="entity-buttons"><button class="mini-icon" type="button" data-edit-entity="materials" data-index="${index}" aria-label="Editar material">${ICONS.edit}</button><button class="mini-icon danger" type="button" data-delete-entity="materials" data-index="${index}" aria-label="Excluir material">${ICONS.trash}</button></div>
  </article>`;
}

function renderAttachmentsStep() {
  return `
    <section class="form-card">
      <p class="eyebrow">Etapa 5</p><h1>Fotos e documentos</h1>
      <p>Os arquivos ficam armazenados somente neste navegador durante o protótipo.</p>
      <div class="upload-zone">
        <div class="card-icon" style="margin:0 auto 8px;width:46px;height:46px;display:grid;place-items:center;border-radius:14px;background:var(--primary-soft);color:var(--primary)">${ICONS.paperclip}</div>
        <strong>Adicionar anexos</strong>
        <div style="color:var(--muted);font-size:.8rem;margin-top:5px">Fotos, PDF e outros documentos. Limite sugerido: 5 MB por arquivo.</div>
        <input id="attachment-input" type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx">
      </div>
      <div class="file-grid">
        ${state.current.attachments.map((file, index) => renderFileItem(file, index)).join('')}
      </div>
    </section>
    ${state.current.attachments.length ? '' : '<div class="notice">Esta etapa é opcional. Você pode continuar sem anexos.</div>'}`;
}

function renderFileItem(file, index) {
  const preview = file.type?.startsWith('image/')
    ? `<img src="${file.dataUrl}" alt="Prévia de ${escapeHtml(file.name)}">`
    : ICONS.file;
  return `<article class="file-item"><div class="file-preview">${preview}</div><div class="file-info"><div><strong>${escapeHtml(file.name)}</strong><span>${humanSize(file.size)}</span></div><button class="mini-icon danger" type="button" data-delete-file="${index}" aria-label="Excluir anexo">${ICONS.trash}</button></div></article>`;
}

function renderHistoryStep() {
  const h = state.current.history;
  return `
    <section class="form-card">
      <p class="eyebrow">Etapa 6</p><h1>Histórico da ocorrência</h1>
      <p>Registre o início, o desenvolvimento e o desfecho da ocorrência de forma objetiva.</p>
      <div class="form-grid">
        <div class="field full"><label class="required" for="history-report">Relato completo</label><textarea id="history-report" data-path="history.relato" placeholder="Descreva o início, meio e fim da ocorrência..." required>${escapeHtml(h.relato)}</textarea></div>
        <div class="field full"><label for="history-actions">Providências adotadas</label><textarea id="history-actions" data-path="history.providencias" placeholder="Ações tomadas, contatos, isolamento, encaminhamentos...">${escapeHtml(h.providencias)}</textarea></div>
        <div class="field full"><label for="history-notes">Observações complementares</label><textarea id="history-notes" data-path="history.observacoes" placeholder="Informações adicionais...">${escapeHtml(h.observacoes)}</textarea></div>
      </div>
    </section>`;
}

function renderReviewStep() {
  const r = state.current;
  const b = r.basic;
  return `
    <section class="form-card">
      <p class="eyebrow">Etapa 7</p><h1>Revisão final</h1>
      <p>Confira todas as informações antes de finalizar o boletim.</p>
    </section>
    <div class="review-grid">
      ${reviewSection('Dados da ocorrência', 0, `
        <dl class="definition-grid">
          <div><dt>Número</dt><dd>${escapeHtml(r.numero)}</dd></div>
          <div><dt>Data e hora</dt><dd>${formatDateOnly(b.data)} ${escapeHtml(b.hora)}</dd></div>
          <div><dt>Referência</dt><dd>${escapeHtml(b.referencia === 'Danos materiais — Outra' ? b.referenciaOutra : b.referencia)}</dd></div>
          <div><dt>Emissor</dt><dd>${escapeHtml(b.nomeEmissor)} (${escapeHtml(b.matriculaEmissor)})</dd></div>
          <div><dt>Local</dt><dd>${escapeHtml(b.local)} — ${escapeHtml(b.complementoLocal)}</dd></div>
          <div><dt>Diretoria</dt><dd>${escapeHtml(b.diretoria === 'Outra' ? b.diretoriaOutra : b.diretoria)}</dd></div>
        </dl>`)}
      ${reviewSection(`Pessoas (${r.people.length})`, 1, r.people.length ? `<div class="entity-list">${r.people.map(renderPersonItemReview).join('')}</div>` : '<div class="entity-empty">Nenhuma pessoa cadastrada.</div>')}
      ${reviewSection(`Veículos (${r.vehicles.length})`, 2, r.vehicles.length ? `<div class="entity-list">${r.vehicles.map(renderVehicleItemReview).join('')}</div>` : '<div class="entity-empty">Nenhum veículo cadastrado.</div>')}
      ${reviewSection(`Materiais (${r.materials.length})`, 3, r.materials.length ? `<div class="entity-list">${r.materials.map(renderMaterialItemReview).join('')}</div>` : '<div class="entity-empty">Nenhum material cadastrado.</div>')}
      ${reviewSection(`Anexos (${r.attachments.length})`, 4, r.attachments.length ? `<div class="entity-meta">${r.attachments.map(file => `<span class="chip">${escapeHtml(file.name)}</span>`).join('')}</div>` : '<div class="entity-empty">Nenhum anexo.</div>')}
      ${reviewSection('Histórico', 5, `<dl class="definition-grid"><div style="grid-column:1/-1"><dt>Relato</dt><dd>${escapeHtml(r.history.relato)}</dd></div><div style="grid-column:1/-1"><dt>Providências</dt><dd>${escapeHtml(r.history.providencias || 'Não informado')}</dd></div></dl>`)}
    </div>
    <div class="notice warning">Ao finalizar, o registro ficará como concluído. Neste protótipo ainda será possível apenas consultar o boletim.</div>`;
}

function reviewSection(title, step, body) {
  return `<section class="review-section"><div class="review-head"><h3>${title}</h3><button class="button small secondary" type="button" data-review-edit="${step}">Editar</button></div><div class="review-body">${body}</div></section>`;
}
function renderPersonItemReview(p) { return `<div><strong>${escapeHtml(p.nome)}</strong><div class="entity-meta"><span class="chip">${escapeHtml(p.tipo)}</span><span class="chip">${escapeHtml(p.vinculo)}</span></div></div>`; }
function renderVehicleItemReview(v) { return `<div><strong>${escapeHtml(v.placa)}</strong><div class="entity-meta"><span class="chip">${escapeHtml([v.marca, v.modelo].filter(Boolean).join(' '))}</span></div></div>`; }
function renderMaterialItemReview(m) { return `<div><strong>${escapeHtml(m.denominacao)}</strong><div class="entity-meta"><span class="chip">${escapeHtml(m.quantidade || '')} ${escapeHtml(m.unidade || '')}</span></div></div>`; }

function refreshRequiredFieldStates(root = document) {
  root.querySelectorAll('input[required], select[required], textarea[required]').forEach(control => {
    const empty = control.type === 'checkbox' ? !control.checked : !String(control.value || '').trim();
    control.classList.toggle('field-control-empty', empty);
    control.classList.toggle('field-control-filled', !empty);
    control.closest('.field')?.classList.toggle('has-empty-required', empty);
  });
}

function focusFirstMissing(root = app) {
  const missing = Array.from(root.querySelectorAll('input[required], select[required], textarea[required]'))
    .find(control => control.type === 'checkbox' ? !control.checked : !String(control.value || '').trim());
  if (missing) {
    missing.focus({ preventScroll: true });
    missing.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function bindWizardInputs() {
  app.querySelectorAll('[data-path]').forEach(control => {
    const eventName = ['SELECT', 'INPUT'].includes(control.tagName) && ['date', 'time', 'checkbox'].includes(control.type) ? 'change' : control.tagName === 'SELECT' ? 'change' : 'input';
    control.addEventListener(eventName, () => {
      const value = control.type === 'checkbox' ? control.checked : control.value;
      setPath(state.current, control.dataset.path, value);
      if (control.dataset.path === 'basic.referencia' && value !== 'Danos materiais — Outra') {
        state.current.basic.referenciaOutra = '';
      }
      if (control.dataset.path === 'basic.diretoria' && value !== 'Outra') {
        state.current.basic.diretoriaOutra = '';
      }
      refreshRequiredFieldStates(app);
      scheduleSave();
      if (control.dataset.rerender === 'true') renderWizard();
    });
  });
  refreshRequiredFieldStates(app);
}

function bindStepSpecific() {
  app.querySelectorAll('[data-add-entity]').forEach(button => button.addEventListener('click', () => openEntityDialog(button.dataset.addEntity)));
  app.querySelectorAll('[data-edit-entity]').forEach(button => button.addEventListener('click', () => openEntityDialog(button.dataset.editEntity, Number(button.dataset.index))));
  app.querySelectorAll('[data-delete-entity]').forEach(button => button.addEventListener('click', async () => {
    const type = button.dataset.deleteEntity;
    const index = Number(button.dataset.index);
    if (!confirm('Excluir este item?')) return;
    state.current[type].splice(index, 1);
    await saveCurrent(true);
    renderWizard();
  }));
  app.querySelectorAll('[data-review-edit]').forEach(button => button.addEventListener('click', () => {
    state.currentStep = Number(button.dataset.reviewEdit);
    renderWizard();
    updateHeader();
    window.scrollTo(0, 0);
  }));

  const attachmentInput = app.querySelector('#attachment-input');
  if (attachmentInput) attachmentInput.addEventListener('change', handleAttachments);
  app.querySelectorAll('[data-delete-file]').forEach(button => button.addEventListener('click', async () => {
    state.current.attachments.splice(Number(button.dataset.deleteFile), 1);
    await saveCurrent(true);
    renderWizard();
  }));
}

async function handleAttachments(event) {
  const files = Array.from(event.target.files || []);
  for (const file of files) {
    if (file.size > 5 * 1024 * 1024) {
      showToast(`${file.name}: arquivo maior que 5 MB.`);
      continue;
    }
    const dataUrl = await fileToDataUrl(file);
    state.current.attachments.push({ id: uid(), name: file.name, type: file.type, size: file.size, dataUrl });
  }
  await saveCurrent(true);
  renderWizard();
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function handleStepAction(action) {
  if (action === 'save') {
    await saveCurrent(false);
    if (apiConfigured()) await syncRecord(state.current, false);
    return;
  }
  if (action === 'exit') {
    await saveCurrent(true);
    return navigate('home');
  }
  if (action === 'previous') {
    await saveCurrent(true);
    state.currentStep -= 1;
    updateHeader();
    renderWizard();
    window.scrollTo(0, 0);
    return;
  }
  if (action === 'next') {
    if (!validateStep(state.currentStep)) return;
    await saveCurrent(true);
    state.currentStep += 1;
    updateHeader();
    renderWizard();
    window.scrollTo(0, 0);
    return;
  }
  if (action === 'finalize') {
    if (!validateAll()) return;
    if (!confirm('Finalizar este boletim?')) return;
    state.current.status = 'Finalizado';
    state.current.finalizedAt = new Date().toISOString();
    state.current.currentStep = STEPS.length - 1;
    await saveCurrent(true);
    if (apiConfigured()) {
      await syncRecord(state.current, false);
      showToast(state.syncState === 'online' ? 'Boletim finalizado e enviado à planilha.' : 'Boletim finalizado localmente; verifique a sincronização.');
    } else {
      showToast('Boletim finalizado localmente. Configure a planilha na aba Banco.');
    }
    navigate('detail');
  }
}

function validateStep(step) {
  if (step === 0) {
    const b = state.current.basic;
    const missing = !b.data || !b.hora || !b.referencia || !b.matriculaEmissor || !b.nomeEmissor || !b.local || !b.complementoLocal || !b.diretoria
      || (b.referencia === 'Danos materiais — Outra' && !b.referenciaOutra.trim())
      || (b.diretoria === 'Outra' && !b.diretoriaOutra.trim());
    if (missing) {
      refreshRequiredFieldStates(app);
      focusFirstMissing(app);
      showToast('Preencha os campos destacados em amarelo.');
      return false;
    }
  }
  if (step === 5 && !state.current.history.relato.trim()) {
    refreshRequiredFieldStates(app);
    focusFirstMissing(app);
    showToast('Informe o relato completo da ocorrência.');
    return false;
  }
  return true;
}

function validateAll() {
  return validateStep(0) && validateStep(5);
}

function openEntityDialog(type, index = null) {
  state.dialog = { type, index };
  const editing = index !== null;
  const data = editing ? structuredClone(state.current[type][index]) : {};
  const configs = {
    people: ['Pessoa', personForm],
    vehicles: ['Veículo', vehicleForm],
    materials: ['Material', materialForm]
  };
  const [name, renderer] = configs[type];
  dialogEyebrow.textContent = editing ? 'Edição' : 'Novo cadastro';
  dialogTitle.textContent = `${editing ? 'Editar' : 'Adicionar'} ${name.toLowerCase()}`;
  dialogBody.innerHTML = renderer(data);
  bindDialogDynamic(type);
  dialog.showModal();
  refreshRequiredFieldStates(dialogBody);
  dialogBody.querySelectorAll('input,select,textarea').forEach(control => {
    control.addEventListener('input', () => refreshRequiredFieldStates(dialogBody));
    control.addEventListener('change', () => refreshRequiredFieldStates(dialogBody));
  });
}

function personForm(p) {
  const vinculo = p.vinculo || 'Stellantis';
  return `<div class="form-grid">
    <div class="field"><label class="required" for="person-type">Tipo de pessoa</label><select id="person-type" name="tipo" required>${selectOptions(['Solicitante', 'Envolvido', 'Testemunha'], p.tipo || 'Solicitante')}</select></div>
    <div class="field"><label class="required" for="person-link">Vínculo</label><select id="person-link" name="vinculo" required>${selectOptions(['Stellantis', 'Terceirizada', 'Sem vínculo'], vinculo)}</select></div>
    <div class="field full"><label class="required" for="person-name">Nome completo</label><input id="person-name" name="nome" value="${escapeHtml(p.nome || '')}" required></div>
    <div class="field corporate-field"><label for="person-company">Empresa</label><input id="person-company" name="empresa" value="${escapeHtml(p.empresa || '')}" placeholder="Stellantis, FPT, Comau ou terceirizada"></div>
    <div class="field corporate-field"><label for="person-reg">Matrícula</label><input id="person-reg" name="matricula" value="${escapeHtml(p.matricula || '')}"></div>
    <div class="field"><label for="person-phone">Telefone para contato</label><input id="person-phone" name="telefone" value="${escapeHtml(p.telefone || '')}" inputmode="tel"></div>
    <div class="field external-field"><label for="person-doc-type">Tipo de documento</label><select id="person-doc-type" name="tipoDocumento">${selectOptions(['Carteira de identidade', 'Carteira Nacional de Habilitação (CNH)', 'Passaporte', 'Outro'], p.tipoDocumento || '')}</select></div>
    <div class="field external-field"><label for="person-doc-number">Número do documento</label><input id="person-doc-number" name="numeroDocumento" value="${escapeHtml(p.numeroDocumento || '')}"></div>
    <div class="field full external-field"><label for="person-details">Dados complementares</label><textarea id="person-details" name="dadosComplementares" placeholder="Categoria e validade da CNH, endereço, empresa, cargo, filiação...">${escapeHtml(p.dadosComplementares || '')}</textarea></div>
    <div class="field full"><label for="person-notes">Observações</label><textarea id="person-notes" name="observacao">${escapeHtml(p.observacao || '')}</textarea></div>
  </div>`;
}

function vehicleForm(v) {
  const personOptions = state.current.people.map(p => p.nome);
  return `<div class="form-grid">
    <div class="field full"><label class="required" for="vehicle-id">Placa ou chassi</label><input id="vehicle-id" name="placa" value="${escapeHtml(v.placa || '')}" required placeholder="Placa, cavalo mecânico, carreta ou chassi"></div>
    <div class="field"><label for="vehicle-brand">Marca</label><input id="vehicle-brand" name="marca" value="${escapeHtml(v.marca || '')}"></div>
    <div class="field"><label for="vehicle-model">Modelo</label><input id="vehicle-model" name="modelo" value="${escapeHtml(v.modelo || '')}"></div>
    <div class="field"><label for="vehicle-company">Empresa do veículo</label><input id="vehicle-company" name="empresa" value="${escapeHtml(v.empresa || '')}"></div>
    <div class="field"><label for="vehicle-person">Pessoa relacionada</label><select id="vehicle-person" name="pessoaNome"><option value="">Ligado diretamente ao BO</option>${personOptions.map(name => `<option value="${escapeHtml(name)}" ${v.pessoaNome === name ? 'selected' : ''}>${escapeHtml(name)}</option>`).join('')}</select></div>
    <div class="field full"><label for="vehicle-notes">Observações</label><textarea id="vehicle-notes" name="observacao">${escapeHtml(v.observacao || '')}</textarea></div>
  </div>`;
}

function materialForm(m) {
  const personOptions = state.current.people.map(p => p.nome);
  return `<div class="form-grid">
    <div class="field full"><label class="required" for="material-name">Denominação</label><input id="material-name" name="denominacao" value="${escapeHtml(m.denominacao || '')}" required></div>
    <div class="field"><label for="material-mvm">Numeração (MVM / Nota fiscal)</label><input id="material-mvm" name="mvm" value="${escapeHtml(m.mvm || '')}"></div>
    <div class="field"><label for="material-supplier">Fornecedor</label><input id="material-supplier" name="fornecedor" value="${escapeHtml(m.fornecedor || '')}"></div>
    <div class="field"><label for="material-drawing">Desenho</label><input id="material-drawing" name="desenho" value="${escapeHtml(m.desenho || '')}"></div>
    <div class="field"><label for="material-container">Código do vasilhame</label><input id="material-container" name="codigoVasilhame" value="${escapeHtml(m.codigoVasilhame || '')}"></div>
    <div class="field"><label for="material-quantity">Quantidade</label><input id="material-quantity" type="number" step="0.01" name="quantidade" value="${escapeHtml(m.quantidade || '')}"></div>
    <div class="field"><label for="material-unit">Unidade</label><input id="material-unit" name="unidade" value="${escapeHtml(m.unidade || '')}" placeholder="un, kg, cx..."></div>
    <div class="field full"><label for="material-person">Pessoa relacionada</label><select id="material-person" name="pessoaNome"><option value="">Ligado diretamente ao BO</option>${personOptions.map(name => `<option value="${escapeHtml(name)}" ${m.pessoaNome === name ? 'selected' : ''}>${escapeHtml(name)}</option>`).join('')}</select></div>
    <div class="field full"><label for="material-notes">Observações</label><textarea id="material-notes" name="observacao">${escapeHtml(m.observacao || '')}</textarea></div>
  </div>`;
}

function bindDialogDynamic(type) {
  if (type !== 'people') return;
  const select = dialogBody.querySelector('#person-link');
  const update = () => {
    const external = select.value === 'Sem vínculo';
    dialogBody.querySelectorAll('.external-field').forEach(el => el.classList.toggle('hidden', !external));
    dialogBody.querySelectorAll('.corporate-field').forEach(el => el.classList.toggle('hidden', external));
  };
  select.addEventListener('change', update);
  update();
}

async function saveDialogEntity(event) {
  event.preventDefault();
  const formData = Object.fromEntries(new FormData(dialogForm).entries());
  const { type, index } = state.dialog;
  formData.id = index === null ? uid() : state.current[type][index].id;
  if (index === null) state.current[type].push(formData);
  else state.current[type][index] = formData;
  dialog.close();
  state.dialog = null;
  await saveCurrent(true);
  renderWizard();
  showToast('Item salvo.');
}

function closeDialog() {
  dialog.close();
  state.dialog = null;
}

function renderRecords() {
  const term = state.search.trim().toLowerCase();
  const filtered = state.records.filter(record => {
    const statusOk = state.filter === 'Todos' || record.status === state.filter;
    const haystack = [record.numero, record.basic?.referencia, record.basic?.referenciaOutra, record.basic?.diretoria, record.basic?.diretoriaOutra, record.basic?.nomeEmissor, record.basic?.local, ...(record.people || []).map(p => p.nome), ...(record.vehicles || []).map(v => v.placa)].join(' ').toLowerCase();
    return statusOk && (!term || haystack.includes(term));
  });
  app.innerHTML = `
    <section class="form-card">
      <p class="eyebrow">Consulta</p><h1>Boletins registrados</h1>
      <p>Pesquise por número do BO, referência, emissor, pessoa ou placa.</p>
      <div class="search-box">${ICONS.search}<input id="record-search" type="search" value="${escapeHtml(state.search)}" placeholder="Pesquisar..."></div>
      <div class="filter-row">${['Todos', 'Rascunho', 'Finalizado'].map(filter => `<button class="filter-button ${state.filter === filter ? 'active' : ''}" type="button" data-filter="${filter}">${filter}</button>`).join('')}</div>
    </section>
    <div class="section-title"><div><p class="eyebrow">Resultados</p><h2>${filtered.length} registro(s)</h2></div><button class="button small primary" type="button" data-action="new-bo">${ICONS.plus} Novo</button></div>
    ${filtered.length ? `<div class="record-list">${filtered.map(recordCard).join('')}</div>` : '<div class="entity-empty">Nenhum boletim encontrado.</div>'}`;
  bindCommonCards();
  app.querySelector('#record-search').addEventListener('input', event => { state.search = event.target.value; renderRecords(); requestAnimationFrame(() => { const input = app.querySelector('#record-search'); input.focus(); input.setSelectionRange(input.value.length, input.value.length); }); });
  app.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { state.filter = button.dataset.filter; renderRecords(); }));
}

function renderDetail() {
  const r = state.current;
  const b = r.basic;
  app.innerHTML = `
    <section class="hero">
      <p class="eyebrow">${escapeHtml(r.status)}</p><h1>${escapeHtml(r.numero)}</h1>
      <p>${escapeHtml(b.referencia === 'Danos materiais — Outra' ? b.referenciaOutra : b.referencia)} • ${formatDateOnly(b.data)} às ${escapeHtml(b.hora)}</p>
      <div class="hero-actions"><button class="button ghost" type="button" data-action="print">Imprimir / PDF</button><button class="button secondary" type="button" data-action="sync-record">${ICONS.sync} Sincronizar</button></div>
    </section>
    <div class="section-title"><div><p class="eyebrow">Resumo</p><h2>Dados do boletim</h2></div></div>
    <div class="review-grid">
      ${reviewSectionStatic('Ocorrência', `<dl class="definition-grid"><div><dt>Referência</dt><dd>${escapeHtml(b.referencia === 'Danos materiais — Outra' ? b.referenciaOutra : b.referencia)}</dd></div><div><dt>Local</dt><dd>${escapeHtml(b.local)} — ${escapeHtml(b.complementoLocal)}</dd></div><div><dt>Diretoria</dt><dd>${escapeHtml(b.diretoria === 'Outra' ? b.diretoriaOutra : b.diretoria)}</dd></div><div><dt>Emissor</dt><dd>${escapeHtml(b.nomeEmissor)} (${escapeHtml(b.matriculaEmissor)})</dd></div><div><dt>Criado em</dt><dd>${formatDateTime(r.createdAt)}</dd></div><div><dt>Finalizado em</dt><dd>${formatDateTime(r.finalizedAt)}</dd></div><div><dt>Sincronizado</dt><dd>${formatDateTime(r.syncedAt)}</dd></div></dl>`)}
      ${reviewSectionStatic(`Pessoas (${r.people.length})`, r.people.length ? `<div class="entity-list">${r.people.map(renderPersonItemReview).join('')}</div>` : '<div class="entity-empty">Nenhuma pessoa.</div>')}
      ${reviewSectionStatic(`Veículos (${r.vehicles.length})`, r.vehicles.length ? `<div class="entity-list">${r.vehicles.map(renderVehicleItemReview).join('')}</div>` : '<div class="entity-empty">Nenhum veículo.</div>')}
      ${reviewSectionStatic(`Materiais (${r.materials.length})`, r.materials.length ? `<div class="entity-list">${r.materials.map(renderMaterialItemReview).join('')}</div>` : '<div class="entity-empty">Nenhum material.</div>')}
      ${reviewSectionStatic('Histórico', `<dl class="definition-grid"><div style="grid-column:1/-1"><dt>Relato</dt><dd>${escapeHtml(r.history.relato)}</dd></div><div style="grid-column:1/-1"><dt>Providências</dt><dd>${escapeHtml(r.history.providencias || 'Não informado')}</dd></div><div style="grid-column:1/-1"><dt>Observações</dt><dd>${escapeHtml(r.history.observacoes || 'Não informado')}</dd></div></dl>`)}
    </div>`;
  app.querySelector('[data-action="print"]').addEventListener('click', () => window.print());
  app.querySelector('[data-action="sync-record"]').addEventListener('click', async () => {
    await syncRecord(r, true);
    await refreshRecords();
    renderDetail();
  });
}

function reviewSectionStatic(title, body) {
  return `<section class="review-section"><div class="review-head"><h3>${title}</h3></div><div class="review-body">${body}</div></section>`;
}

function renderAbout() {
  app.innerHTML = `
    <section class="form-card">
      <p class="eyebrow">Banco de dados</p><h1>Google Sheets</h1>
      <p>O aplicativo continua funcionando localmente. Ao configurar o Apps Script, os boletins também são gravados e consultados na planilha.</p>
      <div style="margin:12px 0">${syncBadgeHtml()}</div>
      <div class="form-grid">
        <div class="field full">
          <label for="sheets-url">URL do aplicativo da Web (Apps Script)</label>
          <input id="sheets-url" type="url" value="${escapeHtml(state.settings.apiUrl || '')}" placeholder="https://script.google.com/macros/s/.../exec">
        </div>
      </div>
      <div class="hero-actions">
        <button class="button primary" type="button" data-about-action="save-settings">${ICONS.gear} Salvar endereço</button>
        <button class="button secondary" type="button" data-about-action="test">${ICONS.sync} Testar conexão</button>
        <button class="button secondary" type="button" data-about-action="sync-all">${ICONS.upload} Enviar registros locais</button>
        <button class="button secondary" type="button" data-about-action="pull">${ICONS.download} Carregar da planilha</button>
      </div>
      <div class="notice warning" style="margin-top:14px">A planilha armazena os dados estruturados. Os anexos ficam apenas no aparelho nesta versão; a planilha recebe nome, tipo e tamanho dos arquivos.</div>
    </section>

    <div class="section-title"><div><p class="eyebrow">Como configurar</p><h2>Três etapas</h2></div></div>
    <div class="about-list">
      <div class="about-item"><span class="card-icon">${ICONS.file}</span><div><strong>1. Criar a planilha</strong><p>Crie uma planilha Google em branco. O script cria automaticamente as abas necessárias.</p></div></div>
      <div class="about-item"><span class="card-icon">${ICONS.gear}</span><div><strong>2. Publicar o Apps Script</strong><p>Use o arquivo <b>google-apps-script.gs</b> incluído no ZIP e publique como aplicativo da Web.</p></div></div>
      <div class="about-item"><span class="card-icon">${ICONS.database}</span><div><strong>3. Colar o endereço</strong><p>Cole acima o URL terminado em <b>/exec</b>, salve e teste a conexão.</p></div></div>
    </div>

    <div class="section-title"><div><p class="eyebrow">Backup local</p><h2>Exportar ou importar testes</h2></div></div>
    <section class="info-card">
      <div style="display:flex;gap:9px;flex-wrap:wrap">
        <button class="button secondary" type="button" data-about-action="export">${ICONS.download} Exportar JSON</button>
        <button class="button secondary" type="button" data-about-action="import">${ICONS.upload} Importar JSON</button>
        <button class="button danger" type="button" data-about-action="clear">${ICONS.trash} Apagar testes</button>
        <input id="import-file" type="file" accept="application/json" class="hidden">
      </div>
    </section>`;
  app.querySelector('[data-about-action="save-settings"]').addEventListener('click', () => {
    state.settings.apiUrl = app.querySelector('#sheets-url').value.trim();
    saveSettings();
    state.syncState = apiConfigured() ? 'online' : 'offline';
    showToast(apiConfigured() ? 'Endereço salvo. Use “Testar conexão”.' : 'Endereço salvo, mas o formato não parece válido.');
    renderAbout();
  });
  app.querySelector('[data-about-action="test"]').addEventListener('click', testSheetsConnection);
  app.querySelector('[data-about-action="sync-all"]').addEventListener('click', syncAllLocalRecords);
  app.querySelector('[data-about-action="pull"]').addEventListener('click', pullFromSheets);
  app.querySelector('[data-about-action="export"]').addEventListener('click', exportData);
  app.querySelector('[data-about-action="import"]').addEventListener('click', () => app.querySelector('#import-file').click());
  app.querySelector('#import-file').addEventListener('change', importData);
  app.querySelector('[data-about-action="clear"]').addEventListener('click', clearData);
}

function exportData() {
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), records: state.records }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bo-digital-backup-${localDateInput()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const payload = JSON.parse(await file.text());
    const records = Array.isArray(payload) ? payload : payload.records;
    if (!Array.isArray(records)) throw new Error('Formato inválido');
    for (const record of records) await dbPut(record);
    await refreshRecords();
    showToast(`${records.length} registro(s) importado(s).`);
    renderAbout();
  } catch {
    showToast('Não foi possível importar o arquivo.');
  }
}

async function clearData() {
  if (!confirm('Apagar todos os boletins de teste deste navegador?')) return;
  for (const record of state.records) await dbDelete(record.id);
  await refreshRecords();
  showToast('Dados de teste apagados.');
  renderAbout();
}


function botTime() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function addBotMessage(text, role = 'bot') {
  const message = document.createElement('div');
  message.className = `bot-message ${role}`;
  message.innerHTML = `${escapeHtml(text).replaceAll('\n', '<br>')}<small>${botTime()}</small>`;
  botMessages.appendChild(message);
  botMessages.scrollTop = botMessages.scrollHeight;
}

function currentMissingLabels() {
  if (!state.current) return [];
  const b = state.current.basic || {};
  const fields = [
    ['Data da ocorrência', b.data],
    ['Hora da ocorrência', b.hora],
    ['Referência', b.referencia],
    ['Descrição da referência', b.referencia !== 'Danos materiais — Outra' || b.referenciaOutra],
    ['Matrícula do emissor', b.matriculaEmissor],
    ['Nome do emissor', b.nomeEmissor],
    ['Local', b.local],
    ['Complemento do local', b.complementoLocal],
    ['Diretoria', b.diretoria],
    ['Nome da outra diretoria', b.diretoria !== 'Outra' || b.diretoriaOutra]
  ];
  return fields.filter(([, value]) => !value).map(([label]) => label);
}

function botContextText() {
  if (state.route === 'home') return 'Olá! Sou o Guardião GSP. Posso orientar o preenchimento, explicar as etapas e verificar o que ainda falta.';
  if (state.route === 'records') return 'Nesta tela você pode pesquisar por número do BO, referência, emissor, pessoa ou placa.';
  if (state.route === 'about') return 'Para usar o Google Sheets, publique o arquivo google-apps-script.gs como aplicativo da Web e cole aqui o endereço terminado em /exec.';
  if (state.route === 'detail') return 'Este boletim já está finalizado. Use “Imprimir / PDF” para gerar uma versão para consulta.';
  if (state.route === 'wizard') {
    const tips = [
      'Preencha os campos amarelos. A sub-referência agora está dentro da própria lista de Referência.',
      'Adicione o solicitante e quantos envolvidos ou testemunhas forem necessários.',
      'Cadastre cada veículo separadamente e relacione-o a uma pessoa quando for necessário.',
      'Cadastre materiais, MVM ou nota fiscal. Um boletim pode ter vários materiais.',
      'Anexos são opcionais e ficam no aparelho nesta versão. A planilha recebe apenas os dados dos arquivos.',
      'Descreva o início, o desenvolvimento e o desfecho da ocorrência de forma objetiva.',
      'Revise todas as seções. Ao finalizar, o aplicativo tenta enviar o BO ao Google Sheets.'
    ];
    return tips[state.currentStep] || tips[0];
  }
  return 'Como posso ajudar no preenchimento?';
}

function botChipsForContext() {
  if (state.route === 'wizard' && state.currentStep === 0) return ['O que falta?', 'Como escolher a referência?', 'Diretoria não está na lista'];
  if (state.route === 'wizard' && state.currentStep === 1) return ['Adicionar envolvido', 'Pessoa sem vínculo', 'Posso deixar sem pessoa?'];
  if (state.route === 'wizard' && state.currentStep === 4) return ['Como anexar foto?', 'Onde o anexo fica salvo?'];
  if (state.route === 'about') return ['Como configurar a planilha?', 'Testar conexão', 'Sincronizar registros'];
  return ['O que falta?', 'Explicar esta etapa', 'Como salvar rascunho?'];
}

function updateBotContext(announce = false) {
  if (!botMessages) return;
  botChips.innerHTML = botChipsForContext().map(text => `<button class="bot-chip" type="button">${escapeHtml(text)}</button>`).join('');
  botChips.querySelectorAll('.bot-chip').forEach(button => button.addEventListener('click', () => handleBotQuestion(button.textContent)));
  if (announce && state.botOpen) addBotMessage(botContextText());
}

function openBot() {
  state.botOpen = true;
  botPanel.classList.add('open');
  botPanel.setAttribute('aria-hidden', 'false');
  botBackdrop.classList.remove('hidden');
  if (!botMessages.children.length) addBotMessage(botContextText());
  updateBotContext(false);
  setTimeout(() => botInput.focus(), 120);
}

function closeBot() {
  state.botOpen = false;
  botPanel.classList.remove('open');
  botPanel.setAttribute('aria-hidden', 'true');
  botBackdrop.classList.add('hidden');
}

function botResponse(question) {
  const q = question.toLowerCase();
  if (q.includes('falta') || q.includes('obrigat')) {
    if (state.route === 'wizard' && state.currentStep === 0) {
      const missing = currentMissingLabels();
      return missing.length ? `Ainda falta preencher: ${missing.join(', ')}.` : 'Os dados principais obrigatórios estão preenchidos. Você já pode continuar.';
    }
    if (state.route === 'wizard' && state.currentStep === 5 && !state.current.history.relato.trim()) return 'Ainda falta o relato completo da ocorrência.';
    return 'Os campos obrigatórios aparecem em amarelo. Quando são preenchidos, mudam para um tom esverdeado.';
  }
  if (q.includes('refer')) return 'A antiga sub-referência foi incorporada à Referência. Exemplo: “Danos materiais — Entrada com danos”. Assim há somente uma seleção.';
  if (q.includes('diretoria')) return 'Selecione “Outra” no campo Diretoria relacionada. O aplicativo abrirá automaticamente um campo para você digitar o nome correto.';
  if (q.includes('envolvido') || q.includes('pessoa')) return 'Use “Adicionar pessoa”. Você pode cadastrar solicitante, envolvido ou testemunha, com vínculo Stellantis, terceirizada ou sem vínculo.';
  if (q.includes('sem vínculo')) return 'Ao escolher “Sem vínculo”, aparecem os campos de documento e dados complementares. Preencha somente as informações exigidas pelo processo.';
  if (q.includes('sem pessoa')) return 'Sim. A etapa de pessoas pode ficar vazia quando não houver solicitante ou envolvido identificado.';
  if (q.includes('anexo') || q.includes('foto')) return 'Na etapa Anexos, toque na área de upload e selecione fotos ou documentos. Nesta versão os arquivos ficam apenas no navegador; a planilha recebe os metadados.';
  if (q.includes('planilha') || q.includes('google') || q.includes('conex')) return 'Abra a aba Banco, cole o endereço do Apps Script terminado em /exec e toque em “Testar conexão”. O ZIP inclui o script e o passo a passo.';
  if (q.includes('sincron')) return 'Use “Salvar” durante o preenchimento ou “Enviar registros locais” na aba Banco. Ao finalizar, o aplicativo também tenta sincronizar automaticamente.';
  if (q.includes('rascunho') || q.includes('salvar')) return 'O rascunho é salvo automaticamente no aparelho. O botão Salvar força uma gravação imediata e, se o Google Sheets estiver configurado, tenta sincronizar.';
  if (q.includes('etapa') || q.includes('explicar')) return botContextText();
  return 'Posso ajudar com campos obrigatórios, referência, diretoria, pessoas, anexos, rascunhos e configuração do Google Sheets.';
}

function handleBotQuestion(question) {
  const clean = String(question || '').trim();
  if (!clean) return;
  addBotMessage(clean, 'user');
  botInput.value = '';
  setTimeout(() => addBotMessage(botResponse(clean)), 260);
}

backButton.addEventListener('click', async () => {
  if (state.route === 'wizard') {
    await saveCurrent(true);
    navigate('home');
  } else navigate('records');
});

bottomNav.addEventListener('click', event => {
  const button = event.target.closest('[data-route]');
  if (button) navigate(button.dataset.route);
});

document.querySelector('#dialog-close').addEventListener('click', closeDialog);
document.querySelector('#dialog-cancel').addEventListener('click', closeDialog);
dialogForm.addEventListener('submit', saveDialogEntity);

dialog.addEventListener('click', event => {
  if (event.target === dialog) closeDialog();
});

botFab.addEventListener('click', openBot);
botClose.addEventListener('click', closeBot);
botBackdrop.addEventListener('click', closeBot);
botSend.addEventListener('click', () => handleBotQuestion(botInput.value));
botInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') handleBotQuestion(botInput.value);
});

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  state.deferredInstall = event;
  installButton.classList.remove('hidden');
});

installButton.addEventListener('click', async () => {
  if (!state.deferredInstall) return;
  state.deferredInstall.prompt();
  await state.deferredInstall.userChoice;
  state.deferredInstall = null;
  installButton.classList.add('hidden');
});

window.addEventListener('appinstalled', () => {
  installButton.classList.add('hidden');
  showToast('Aplicativo instalado.');
});

window.addEventListener('beforeunload', () => {
  if (state.current && state.route === 'wizard') dbPut(state.current);
});

async function init() {
  try {
    loadSettings();
    state.syncState = apiConfigured() ? 'online' : 'offline';
    await refreshRecords();
    updateHeader();
    renderHome();
    updateBotContext(false);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js');
  } catch (error) {
    console.error(error);
    app.innerHTML = '<div class="notice danger">O navegador não conseguiu iniciar o armazenamento local. Abra o aplicativo em uma janela normal e verifique se o IndexedDB está permitido.</div>';
  }
}

init();
