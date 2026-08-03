'use strict';

const DB_NAME = 'bo-digital-prototipo';
const DB_VERSION = 1;
const STORE = 'boletins';
const SETTINGS_KEY = 'bo-digital-gsheets-settings-v1';
const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbwrYFAMDKd02EQx41vsLsVI5TztZxOph7f7YJvJ8DDOwQoaFrCcxRr8HpNkBhlHlr-6TQ/exec';
const DEFAULT_SETTINGS = { apiUrl: DEFAULT_API_URL };

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
  gear: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l-2-.7-.7-1.7.9-1.9-2.1-2.1-1.9.9-1.7-.7L10.5 2h-3l-.7 2-1.7.7-1.9-.9L1.1 5.9 2 7.8l-.7 1.7-2 .7v3l2 .7.7 1.7-.9 1.9 2.1 2.1 1.9-.9 1.7.7.7 2h3l.7-2 1.7-.7 1.9.9 2.1-2.1-.9-1.9.7-1.7z"/></svg>',
  warning: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2.5 20h19zM12 9v5M12 18h.01"/></svg>',
  success: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12 2.6 2.6L16.5 9"/></svg>',
  info: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></svg>',
  logout: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4H4v16h6M14 8l4 4-4 4M8 12h10"/></svg>',
  list: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>'
};

const state = {
  route: 'home',
  records: [],
  current: null,
  currentStep: 0,
  filter: 'Todos',
  search: '',
  previousRoute: 'home',
  dialog: null,
  settings: { ...DEFAULT_SETTINGS },
  syncState: 'offline'
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
const headerSync = document.querySelector('#header-sync');
const appDialog = document.querySelector('#app-dialog');
const appDialogIcon = document.querySelector('#app-dialog-icon');
const appDialogEyebrow = document.querySelector('#app-dialog-eyebrow');
const appDialogTitle = document.querySelector('#app-dialog-title');
const appDialogMessage = document.querySelector('#app-dialog-message');
const appDialogDetails = document.querySelector('#app-dialog-details');
const appDialogCancel = document.querySelector('#app-dialog-cancel');
const appDialogConfirm = document.querySelector('#app-dialog-confirm');
const appDialogTertiary = document.querySelector('#app-dialog-tertiary');
const selectDialog = document.querySelector('#select-dialog');
const selectDialogTitle = document.querySelector('#select-dialog-title');
const selectDialogSearch = document.querySelector('#select-dialog-search');
const selectDialogOptions = document.querySelector('#select-dialog-options');
const selectDialogClose = document.querySelector('#select-dialog-close');
const selectDialogCancel = document.querySelector('#select-dialog-cancel');

let dbPromise;
let autosaveTimer;
let toastTimer;
let modalResolver = null;
let modalTertiaryValue = 'tertiary';
let activeModalSelect = null;
let selectModalEntries = [];

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

const memoryStorage = new Map();
function storageGet(key) {
  try { return localStorage.getItem(key); }
  catch { return memoryStorage.has(key) ? memoryStorage.get(key) : null; }
}
function storageSet(key, value) {
  try { localStorage.setItem(key, value); }
  catch { memoryStorage.set(key, String(value)); }
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


function openAppModal({
  kind = 'info',
  eyebrow = 'Aviso do sistema',
  title = 'Atenção',
  message = '',
  details = '',
  confirmText = 'Entendi',
  cancelText = '',
  tertiaryText = '',
  tertiaryValue = 'tertiary'
} = {}) {
  if (appDialog.open) appDialog.close();
  appDialogIcon.className = `app-dialog-icon ${kind}`;
  appDialogIcon.innerHTML = kind === 'success' ? ICONS.success : kind === 'danger' || kind === 'warning' ? ICONS.warning : ICONS.info;
  appDialogEyebrow.textContent = eyebrow;
  appDialogTitle.textContent = title;
  appDialogMessage.innerHTML = message;
  appDialogDetails.innerHTML = details;
  appDialogDetails.classList.toggle('hidden', !details);
  appDialogConfirm.textContent = confirmText;
  appDialogConfirm.className = `button ${kind === 'danger' ? 'danger' : kind === 'warning' ? 'warning' : kind === 'success' ? 'success' : 'primary'}`;
  appDialogCancel.textContent = cancelText || 'Cancelar';
  appDialogCancel.classList.toggle('hidden', !cancelText);
  appDialogTertiary.textContent = tertiaryText || 'Cancelar';
  appDialogTertiary.classList.toggle('hidden', !tertiaryText);
  modalTertiaryValue = tertiaryValue;
  appDialog.showModal();
  return new Promise(resolve => { modalResolver = resolve; });
}

function resolveAppModal(value) {
  if (!appDialog.open) return;
  appDialog.close();
  const resolve = modalResolver;
  modalResolver = null;
  if (resolve) resolve(value);
}

function nextNumber() {
  const year = new Date().getFullYear();
  const key = `bo-sequence-${year}`;
  const next = Number(storageGet(key) || '0') + 1;
  storageSet(key, String(next));
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
    syncedAt: '',
    peopleNone: false,
    acknowledgements: {
      reviewed: false,
      truthful: false
    },
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


function selectLabelFor(select) {
  if (select.id) {
    const label = document.querySelector(`label[for="${select.id}"]`);
    if (label) return label.textContent.replace('*', '').trim();
  }
  return select.name || 'Selecione uma opção';
}

function selectedOptionText(select) {
  const option = select.options[select.selectedIndex];
  return option && option.value ? option.textContent.trim() : (select.options[0]?.textContent.trim() || 'Selecione');
}

function syncModalSelectButton(select) {
  const button = select._modalSelectButton;
  if (!button) return;
  const empty = !String(select.value || '').trim();
  button.querySelector('.modal-select-value').textContent = selectedOptionText(select);
  button.classList.toggle('field-control-empty', empty && select.required);
  button.classList.toggle('field-control-filled', !empty);
  button.setAttribute('aria-invalid', empty && select.required ? 'true' : 'false');
}

function buildSelectModalEntries(select) {
  const entries = [];
  Array.from(select.children).forEach(child => {
    if (child.tagName === 'OPTGROUP') {
      entries.push({ type: 'group', label: child.label });
      Array.from(child.children).forEach(option => entries.push({ type: 'option', value: option.value, label: option.textContent.trim(), disabled: option.disabled }));
    } else if (child.tagName === 'OPTION') {
      entries.push({ type: 'option', value: child.value, label: child.textContent.trim(), disabled: child.disabled });
    }
  });
  return entries;
}

function renderSelectModalOptions(filter = '') {
  const term = filter.trim().toLocaleLowerCase('pt-BR');
  let html = '';
  let groupVisible = false;
  selectModalEntries.forEach((entry, index) => {
    if (entry.type === 'group') {
      groupVisible = false;
      const future = selectModalEntries.slice(index + 1).find(item => item.type === 'group' || (item.type === 'option' && (!term || item.label.toLocaleLowerCase('pt-BR').includes(term))));
      if (future?.type === 'option') {
        html += `<div class="select-option-group">${escapeHtml(entry.label)}</div>`;
        groupVisible = true;
      }
      return;
    }
    if (term && !entry.label.toLocaleLowerCase('pt-BR').includes(term)) return;
    const selected = activeModalSelect && String(activeModalSelect.value) === String(entry.value);
    html += `<button class="select-option-button ${selected ? 'selected' : ''}" type="button" role="option" aria-selected="${selected}" data-select-index="${index}" ${entry.disabled ? 'disabled' : ''}>
      <span>${escapeHtml(entry.label)}</span>${selected ? ICONS.check : ''}
    </button>`;
  });
  selectDialogOptions.innerHTML = html || '<div class="entity-empty">Nenhuma opção encontrada.</div>';
  selectDialogOptions.querySelectorAll('[data-select-index]').forEach(button => button.addEventListener('click', () => {
    const entry = selectModalEntries[Number(button.dataset.selectIndex)];
    const select = activeModalSelect;
    closeSelectionModal();
    if (!select || !entry || entry.disabled) return;
    select.value = entry.value;
    syncModalSelectButton(select);
    select.dispatchEvent(new Event('input', { bubbles: true }));
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }));
}

function openSelectionModal(select) {
  activeModalSelect = select;
  selectModalEntries = buildSelectModalEntries(select);
  selectDialogTitle.textContent = selectLabelFor(select);
  selectDialogSearch.value = '';
  renderSelectModalOptions();
  selectDialog.showModal();
  setTimeout(() => {
    if (selectModalEntries.filter(item => item.type === 'option').length > 7) selectDialogSearch.focus();
  }, 80);
}

function closeSelectionModal() {
  if (selectDialog.open) selectDialog.close();
  activeModalSelect = null;
  selectModalEntries = [];
}

function modalizeSelects(root = document) {
  root.querySelectorAll('select:not([data-native-select]):not(.modal-native-select)').forEach(select => {
    select.classList.add('modal-native-select');
    select.tabIndex = -1;
    select.setAttribute('aria-hidden', 'true');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'modal-select-button';
    button.innerHTML = `<span class="modal-select-value"></span><span class="modal-select-chevron">${ICONS.chevron}</span>`;
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-label', selectLabelFor(select));
    select.insertAdjacentElement('afterend', button);
    select._modalSelectButton = button;
    button.addEventListener('click', () => openSelectionModal(select));
    syncModalSelectButton(select);
  });
}

function loadSettings() {
  try {
    state.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(storageGet(SETTINGS_KEY) || '{}') };
  } catch {
    state.settings = { ...DEFAULT_SETTINGS };
  }
  if (!String(state.settings.apiUrl || '').trim()) state.settings.apiUrl = DEFAULT_API_URL;
}

function saveSettings() {
  storageSet(SETTINGS_KEY, JSON.stringify(state.settings));
}

function apiConfigured() {
  return /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?.*)?$/i.test((state.settings.apiUrl || '').trim());
}

function syncBadgeHtml() {
  if (!apiConfigured()) return '<span class="sync-badge"><i></i> Planilha ainda não configurada</span>';
  if (state.syncState === 'error') return '<span class="sync-badge error"><i></i> Falha de sincronização</span>';
  if (state.syncState === 'syncing') return '<span class="sync-badge syncing"><i></i> Sincronizando dados...</span>';
  return '<span class="sync-badge online"><i></i> Google Sheets conectado</span>';
}

function normalizeRecord(record) {
  const normalized = structuredClone(record || {});
  normalized.basic ||= {};
  normalized.people ||= [];
  normalized.vehicles ||= [];
  normalized.materials ||= [];
  normalized.attachments ||= [];
  normalized.history ||= { relato: '', providencias: '', observacoes: '' };
  normalized.peopleNone = Boolean(normalized.peopleNone);
  normalized.acknowledgements ||= { reviewed: false, truthful: false };
  normalized.acknowledgements.reviewed = Boolean(normalized.acknowledgements.reviewed);
  normalized.acknowledgements.truthful = Boolean(normalized.acknowledgements.truthful);

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
    if (notify) await openAppModal({ kind: 'warning', eyebrow: 'Banco não configurado', title: 'Configure o Google Sheets', message: 'Abra a aba Banco, informe o endereço do Apps Script e teste a conexão antes de sincronizar.', confirmText: 'Entendi' });
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
    if (notify) await openAppModal({ kind: 'danger', eyebrow: 'Falha de sincronização', title: 'Não foi possível enviar o boletim', message: escapeHtml(error.message), details: 'Verifique a internet, o endereço do Apps Script e as permissões da implantação.', confirmText: 'Entendi' });
    return false;
  }
}

async function pullFromSheets() {
  if (!apiConfigured()) {
    await openAppModal({ kind: 'warning', eyebrow: 'Banco não configurado', title: 'Informe o endereço do Apps Script', message: 'Abra a aba Banco, cole o endereço terminado em /exec e salve antes de carregar os registros.', confirmText: 'Entendi' });
    return;
  }
  state.syncState = 'syncing';
  updateHeader();
  try {
    const payload = await apiGet({ action: 'list' });
    const records = Array.isArray(payload.records) ? payload.records : [];
    for (const record of records) await dbPut(normalizeRecord(record));
    await refreshRecords();
    state.syncState = 'online';
    renderAbout();
    updateHeader();
    await openAppModal({ kind: 'success', eyebrow: 'Consulta concluída', title: 'Registros carregados da planilha', message: `${records.length} boletim(ns) foram carregados ou atualizados neste dispositivo.`, confirmText: 'Continuar' });
  } catch (error) {
    console.error(error);
    state.syncState = 'error';
    renderAbout();
    updateHeader();
    await openAppModal({ kind: 'danger', eyebrow: 'Falha de conexão', title: 'Não foi possível consultar a planilha', message: escapeHtml(error.message), details: 'Verifique a implantação do Apps Script, as permissões de acesso e se o endereço termina em <strong>/exec</strong>.', confirmText: 'Entendi' });
  }
}

async function testSheetsConnection() {
  if (!apiConfigured()) {
    await openAppModal({ kind: 'warning', eyebrow: 'Endereço inválido', title: 'Informe um Apps Script válido', message: 'O endereço precisa começar com https://script.google.com/macros/s/ e terminar em /exec.', confirmText: 'Corrigir endereço' });
    return;
  }
  state.syncState = 'syncing';
  renderAbout();
  updateHeader();
  try {
    const payload = await apiGet({ action: 'ping' });
    state.syncState = 'online';
    renderAbout();
    updateHeader();
    await openAppModal({ kind: 'success', eyebrow: 'Teste de conexão', title: 'Google Sheets conectado', message: escapeHtml(payload.message || 'A conexão com a planilha foi confirmada.'), confirmText: 'Concluir teste' });
  } catch (error) {
    state.syncState = 'error';
    renderAbout();
    updateHeader();
    await openAppModal({ kind: 'danger', eyebrow: 'Teste de conexão', title: 'Conexão não confirmada', message: escapeHtml(error.message), details: 'Confira se a implantação está ativa, se o acesso foi liberado conforme a política da organização e se você copiou o endereço da implantação atual.', confirmText: 'Entendi' });
  }
}

async function syncAllLocalRecords() {
  if (!apiConfigured()) {
    await openAppModal({ kind: 'warning', eyebrow: 'Banco não configurado', title: 'Configure o Google Sheets primeiro', message: 'Salve e teste o endereço do Apps Script antes de enviar os registros locais.', confirmText: 'Entendi' });
    return;
  }
  if (!state.records.length) {
    await openAppModal({ kind: 'info', eyebrow: 'Sem registros locais', title: 'Não há boletins para sincronizar', message: 'Crie um boletim ou carregue registros da planilha antes de usar esta função.', confirmText: 'Entendi' });
    return;
  }
  const confirmed = await openAppModal({
    kind: 'warning',
    eyebrow: 'Envio em lote',
    title: `Sincronizar ${state.records.length} registro(s)?`,
    message: 'Os registros locais serão enviados ao Google Sheets. Quando o número do BO já existir, a linha correspondente será atualizada.',
    confirmText: 'Enviar registros',
    cancelText: 'Cancelar'
  });
  if (!confirmed) return;
  state.syncState = 'syncing';
  renderAbout();
  updateHeader();
  let success = 0;
  for (const record of state.records) if (await syncRecord(record, false)) success += 1;
  await refreshRecords();
  state.syncState = success === state.records.length ? 'online' : 'error';
  renderAbout();
  updateHeader();
  await openAppModal({
    kind: success === state.records.length ? 'success' : 'warning',
    eyebrow: 'Sincronização em lote',
    title: `${success} de ${state.records.length} registro(s) enviados`,
    message: success === state.records.length ? 'Todos os boletins foram sincronizados com sucesso.' : 'Alguns registros não foram enviados. Verifique a conexão e tente novamente.',
    confirmText: 'Concluir'
  });
}

function updateHeader() {
  const config = {
    home: ['BO Digital GSP', 'Registro de ocorrências'],
    records: ['Boletins', 'Consulta, rascunhos e finalizados'],
    about: ['Banco de dados', 'Google Sheets e backup local'],
    wizard: [state.current?.numero || 'Novo boletim', `Etapa ${state.currentStep + 1} de ${STEPS.length} • ${STEPS[state.currentStep]}`],
    detail: [state.current?.numero || 'Boletim', state.current?.status || 'Detalhes']
  };
  const [title, subtitle] = config[state.route] || config.home;
  document.body.dataset.route = state.route;
  headerTitle.textContent = title;
  headerSubtitle.textContent = subtitle;
  const showBack = ['wizard', 'detail'].includes(state.route);
  backButton.classList.toggle('hidden', !showBack);
  bottomNav.classList.toggle('hidden', state.route === 'wizard');
  document.querySelectorAll('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.route === state.route));
  headerSync.className = `header-sync ${state.syncState === 'online' ? 'online' : state.syncState === 'error' ? 'error' : ''}`;
  headerSync.title = state.syncState === 'online' ? 'Google Sheets conectado' : state.syncState === 'error' ? 'Erro de sincronização' : 'Armazenamento local';
}

async function navigate(route, options = {}) {
  state.previousRoute = state.route;
  state.route = route;
  if (options.record) state.current = options.record;
  if (Number.isInteger(options.step)) state.currentStep = options.step;
  updateHeader();
  await render();
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
    <section class="hero no-visual">
      <div class="hero-copy">
        <p class="eyebrow">Segurança patrimonial • fluxo digital</p>
        <h1>Registre o BO com <span>clareza e controle.</span></h1>
        <p>O preenchimento é dividido em etapas curtas. O aplicativo salva rascunhos automaticamente, permite cadastrar vários envolvidos, veículos e materiais e pode enviar os registros para o Google Sheets.</p>
        <div class="hero-actions">
          <button class="button primary" type="button" data-action="new-bo">${ICONS.plus} Iniciar novo boletim</button>
          <button class="button ghost" type="button" data-action="show-drafts">Continuar rascunho</button>
        </div>
        <div style="margin-top:15px">${syncBadgeHtml()}</div>
      </div>
    </section>

    <div class="metric-grid" aria-label="Resumo dos registros neste dispositivo">
      <div class="metric-card"><span>Total de boletins</span><strong>${state.records.length}</strong></div>
      <div class="metric-card"><span>Rascunhos salvos</span><strong>${drafts}</strong></div>
      <div class="metric-card"><span>Finalizados</span><strong>${finalized}</strong></div>
    </div>

    <div class="section-title">
      <div><p class="eyebrow">Painel operacional</p><h2>Escolha uma ação</h2></div>
    </div>
    <div class="card-grid">
      <button class="action-card" data-tone="blue" type="button" data-action="new-bo">
        <span class="card-icon">${ICONS.clipboard}</span>
        <span><strong>Novo boletim</strong><span>Inicie um registro guiado do zero.</span></span>
      </button>
      <button class="action-card" data-tone="green" type="button" data-action="show-records">
        <span class="card-icon">${ICONS.search}</span>
        <span><strong>Consultar boletins</strong><span>Pesquise por número, pessoa, referência ou placa.</span></span>
      </button>
      <button class="action-card" data-tone="amber" type="button" data-action="show-bank">
        <span class="card-icon">${ICONS.database}</span>
        <span><strong>Banco Google Sheets</strong><span>Configure, teste e sincronize os registros.</span></span>
      </button>
      ${window.BO_PWA?.canInstall && !isStandaloneMode() ? `<button class="action-card" data-tone="blue" type="button" data-action="install-app">
        <span class="card-icon">${ICONS.download}</span>
        <span><strong>Instalar aplicativo</strong><span>Instalação validada pelo navegador para aparecer junto aos aplicativos.</span></span>
      </button>` : ''}
    </div>

    <div class="section-title">
      <div><p class="eyebrow">Atividade recente</p><h2>Últimos registros</h2></div>
      ${state.records.length ? '<button class="button small secondary" type="button" data-action="show-records">Ver todos</button>' : ''}
    </div>
    ${recent.length ? `<div class="record-list">${recent.map(recordCard).join('')}</div>` : '<div class="entity-empty">Nenhum boletim foi criado neste dispositivo. Use “Iniciar novo boletim” para testar o fluxo.</div>'}
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
  app.querySelectorAll('[data-action="install-app"]').forEach(button => button.addEventListener('click', handleInstallRequest));
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
        <div class="progress-top"><strong>${escapeHtml(STEPS[state.currentStep])}</strong><span>Etapa ${state.currentStep + 1} de ${STEPS.length}</span></div>
        <div class="progress-track"><span style="width:${progress}%"></span></div>
        <div class="step-map" aria-label="Etapas do boletim">
          ${STEPS.map((step, index) => `<span class="step-dot ${index < state.currentStep ? 'done' : index === state.currentStep ? 'active' : ''}">${index + 1}. ${escapeHtml(step)}</span>`).join('')}
        </div>
      </section>
      ${content}
      <div class="step-actions">
        <button class="button secondary" type="button" data-step-action="${state.currentStep === 0 ? 'exit' : 'previous'}">${state.currentStep === 0 ? `${ICONS.logout} Salvar e sair` : 'Voltar'}</button>
        <div class="right">
          <button class="button secondary" type="button" data-step-action="save">Salvar rascunho</button>
          ${state.currentStep < STEPS.length - 1 ? '<button class="button primary" type="button" data-step-action="next">Continuar</button>' : '<button class="button success" type="button" data-step-action="finalize">Finalizar boletim</button>'}
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
      <p class="eyebrow">Identificação da ocorrência</p>
      <h1>Dados principais do boletim</h1>
      <p>Informe quando e onde ocorreu o fato, a classificação da ocorrência e os dados do vigilante responsável pelo registro.</p>
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
          <label class="required" for="bo-ref">Referência da ocorrência</label>
          <select id="bo-ref" data-path="basic.referencia" data-rerender="true" required>${referenceSelectOptions(b.referencia)}</select>
          <small>As antigas sub-referências já estão incluídas nesta lista. Exemplo: “Danos materiais — Entrada com danos”.</small>
        </div>
        ${referenceOtherVisible ? `<div class="field full"><label class="required" for="bo-ref-other">Descreva a referência não listada</label><input id="bo-ref-other" type="text" value="${escapeHtml(b.referenciaOutra)}" data-path="basic.referenciaOutra" placeholder="Descreva objetivamente o motivo da ocorrência" required></div>` : ''}
        <div class="field">
          <label class="required" for="bo-reg">Matrícula do emissor</label>
          <input id="bo-reg" type="text" inputmode="numeric" value="${escapeHtml(b.matriculaEmissor)}" data-path="basic.matriculaEmissor" placeholder="Ex.: 76313" required>
        </div>
        <div class="field">
          <label class="required" for="bo-name">Nome do emissor</label>
          <input id="bo-name" type="text" value="${escapeHtml(b.nomeEmissor)}" data-path="basic.nomeEmissor" autocomplete="name" placeholder="Nome completo" required>
        </div>
        <div class="field full">
          <label for="bo-email">E-mail do emissor</label>
          <input id="bo-email" type="email" value="${escapeHtml(b.emailEmissor)}" data-path="basic.emailEmissor" autocomplete="email" placeholder="Opcional neste protótipo">
        </div>
        <div class="field">
          <label class="required" for="bo-local">Local da ocorrência</label>
          <select id="bo-local" data-path="basic.local" required>${selectOptions(LOCATIONS, b.local)}</select>
        </div>
        <div class="field">
          <label class="required" for="bo-local-detail">Complemento do local</label>
          <input id="bo-local-detail" type="text" value="${escapeHtml(b.complementoLocal)}" data-path="basic.complementoLocal" placeholder="Galpão, número, sala, rua ou ponto de referência" required>
        </div>
        <div class="field full">
          <label class="required" for="bo-directorate">Diretoria relacionada</label>
          <select id="bo-directorate" data-path="basic.diretoria" data-rerender="true" required>${selectOptions(DIRECTORATES, b.diretoria)}</select>
        </div>
        ${directorateOtherVisible ? `<div class="field full"><label class="required" for="bo-directorate-other">Nome da outra diretoria</label><input id="bo-directorate-other" type="text" value="${escapeHtml(b.diretoriaOutra)}" data-path="basic.diretoriaOutra" placeholder="Digite a diretoria relacionada à ocorrência" required></div>` : ''}
      </div>
    </section>
    <div class="notice warning"><strong>Campos destacados:</strong> os campos obrigatórios vazios aparecem em amarelo. Depois de preenchidos, passam para a cor verde.</div>`;
}

function renderEntityStep(type) {
  const configs = {
    people: {
      eyebrow: 'Pessoas relacionadas',
      title: 'Solicitantes, envolvidos e testemunhas',
      description: 'Cadastre cada pessoa separadamente. O aplicativo permite incluir quantas forem necessárias, sem limite fixo de “Envolvido 1, 2 ou 3”.',
      button: 'Adicionar pessoa', icon: ICONS.users, items: state.current.people, empty: 'Nenhuma pessoa foi adicionada a este boletim.', render: renderPersonItem
    },
    vehicles: {
      eyebrow: 'Patrimônio e transporte',
      title: 'Veículos relacionados',
      description: 'Cadastre placa ou chassi, marca, modelo e empresa. O veículo pode ser ligado diretamente ao BO ou a uma pessoa cadastrada.',
      button: 'Adicionar veículo', icon: ICONS.car, items: state.current.vehicles, empty: 'Nenhum veículo foi adicionado a este boletim.', render: renderVehicleItem
    },
    materials: {
      eyebrow: 'Materiais e documentos',
      title: 'Materiais relacionados',
      description: 'Inclua denominação, MVM ou nota fiscal, fornecedor, desenho, quantidade, unidade e código do vasilhame quando essas informações existirem.',
      button: 'Adicionar material', icon: ICONS.box, items: state.current.materials, empty: 'Nenhum material foi adicionado a este boletim.', render: renderMaterialItem
    }
  };
  const c = configs[type];
  const peopleControl = type === 'people' ? `
    <label class="checkbox-card ${state.current.peopleNone ? 'checked' : ''}">
      <input type="checkbox" data-path="peopleNone" data-rerender="true" ${state.current.peopleNone ? 'checked' : ''}>
      <span><strong>Não há pessoa identificada</strong><span>Marque esta opção somente quando não houver solicitante, envolvido ou testemunha identificável.</span></span>
    </label>` : '';
  return `
    <section class="list-card">
      <div class="entity-toolbar">
        <div><p class="eyebrow">${c.eyebrow}</p><h2>${c.title}</h2></div>
        <button class="button primary small" type="button" data-add-entity="${type}">${ICONS.plus} ${c.button}</button>
      </div>
      <p>${c.description}</p>
      ${peopleControl}
      ${type === 'people' && state.current.peopleNone && state.current.people.length ? '<div class="notice warning" style="margin:12px 0">Existem pessoas cadastradas e a opção “Não há pessoa identificada” está marcada. Revise essa informação antes de finalizar.</div>' : ''}
      <div class="entity-list" style="margin-top:12px">
        ${c.items.length ? c.items.map((item, index) => c.render(item, index)).join('') : `<div class="entity-empty">${c.empty}<br><small>Esta etapa pode ser deixada vazia quando realmente não houver dados disponíveis.</small></div>`}
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
      <p class="eyebrow">Evidências e documentos</p><h1>Anexos do boletim</h1>
      <p>Adicione fotos, PDF ou documentos que ajudem a comprovar ou esclarecer a ocorrência. Nesta versão, os arquivos permanecem armazenados no navegador.</p>
      <div class="upload-zone">
        <div class="card-icon" style="margin:0 auto 9px;width:48px;height:48px;display:grid;place-items:center;border-radius:14px;background:var(--cyan-soft);color:var(--cyan);border:1px solid rgba(67,230,243,.20)">${ICONS.paperclip}</div>
        <strong>Toque ou clique para selecionar arquivos</strong>
        <div style="color:var(--muted);font-size:.78rem;margin-top:6px;line-height:1.4">Imagens, PDF e documentos. Limite de 5 MB por arquivo neste protótipo.</div>
        <input id="attachment-input" type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx">
      </div>
      <div class="file-grid">
        ${state.current.attachments.map((file, index) => renderFileItem(file, index)).join('')}
      </div>
    </section>
    ${state.current.attachments.length ? '<div class="notice success">Os anexos listados abaixo estão salvos neste dispositivo.</div>' : '<div class="notice">Esta etapa é opcional. Você pode continuar sem anexar arquivos.</div>'}`;
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
      <p class="eyebrow">Descrição dos fatos</p><h1>Histórico da ocorrência</h1>
      <p>Escreva de forma objetiva e cronológica. Informe como a situação começou, o que foi constatado, quais pessoas ou áreas foram acionadas e como a ocorrência terminou.</p>
      <div class="form-grid">
        <div class="field full"><label class="required" for="history-report">Relato completo da ocorrência</label><textarea id="history-report" data-path="history.relato" placeholder="Exemplo: Às 20h20, durante ronda no Galpão 38, foi identificado..." required>${escapeHtml(h.relato)}</textarea><small>Evite abreviações que possam dificultar a compreensão futura.</small></div>
        <div class="field full"><label for="history-actions">Providências adotadas</label><textarea id="history-actions" data-path="history.providencias" placeholder="Descreva contatos realizados, isolamento, orientação, encaminhamento ou acionamento de outras áreas.">${escapeHtml(h.providencias)}</textarea></div>
        <div class="field full"><label for="history-notes">Observações complementares</label><textarea id="history-notes" data-path="history.observacoes" placeholder="Registre informações adicionais que não se encaixem nos campos anteriores.">${escapeHtml(h.observacoes)}</textarea></div>
      </div>
    </section>`;
}

function renderReviewStep() {
  const r = state.current;
  const b = r.basic;
  const reference = b.referencia === 'Danos materiais — Outra' ? b.referenciaOutra : b.referencia;
  const directorate = b.diretoria === 'Outra' ? b.diretoriaOutra : b.diretoria;
  return `
    <section class="form-card">
      <p class="eyebrow">Conferência antes do envio</p><h1>Revisão final do boletim</h1>
      <p>Leia cada seção com atenção. Use o botão “Editar” para voltar diretamente ao ponto que precisa ser corrigido.</p>
    </section>
    <div class="review-grid">
      ${reviewSection('Dados da ocorrência', 0, `
        <dl class="definition-grid">
          <div><dt>Número do boletim</dt><dd>${escapeHtml(r.numero)}</dd></div>
          <div><dt>Data e hora</dt><dd>${formatDateOnly(b.data)} às ${escapeHtml(b.hora)}</dd></div>
          <div><dt>Referência</dt><dd>${escapeHtml(reference || 'Não informada')}</dd></div>
          <div><dt>Emissor</dt><dd>${escapeHtml(b.nomeEmissor)} • matrícula ${escapeHtml(b.matriculaEmissor)}</dd></div>
          <div><dt>Local</dt><dd>${escapeHtml(b.local)} — ${escapeHtml(b.complementoLocal)}</dd></div>
          <div><dt>Diretoria relacionada</dt><dd>${escapeHtml(directorate || 'Não informada')}</dd></div>
        </dl>`)}
      ${reviewSection(`Pessoas (${r.people.length})`, 1, r.people.length ? `<div class="entity-list">${r.people.map(renderPersonItemReview).join('')}</div>` : `<div class="entity-empty">${r.peopleNone ? 'Foi informado que não há pessoa identificada.' : 'Nenhuma pessoa cadastrada.'}</div>`)}
      ${reviewSection(`Veículos (${r.vehicles.length})`, 2, r.vehicles.length ? `<div class="entity-list">${r.vehicles.map(renderVehicleItemReview).join('')}</div>` : '<div class="entity-empty">Nenhum veículo cadastrado.</div>')}
      ${reviewSection(`Materiais (${r.materials.length})`, 3, r.materials.length ? `<div class="entity-list">${r.materials.map(renderMaterialItemReview).join('')}</div>` : '<div class="entity-empty">Nenhum material cadastrado.</div>')}
      ${reviewSection(`Anexos (${r.attachments.length})`, 4, r.attachments.length ? `<div class="entity-meta">${r.attachments.map(file => `<span class="chip">${escapeHtml(file.name)}</span>`).join('')}</div>` : '<div class="entity-empty">Nenhum anexo.</div>')}
      ${reviewSection('Histórico da ocorrência', 5, `<dl class="definition-grid"><div style="grid-column:1/-1"><dt>Relato</dt><dd>${escapeHtml(r.history.relato)}</dd></div><div style="grid-column:1/-1"><dt>Providências</dt><dd>${escapeHtml(r.history.providencias || 'Não informado')}</dd></div><div style="grid-column:1/-1"><dt>Observações</dt><dd>${escapeHtml(r.history.observacoes || 'Não informado')}</dd></div></dl>`)}
    </div>
    <section class="form-card">
      <p class="eyebrow">Confirmações obrigatórias</p>
      <h2>Responsabilidade pelo registro</h2>
      <p>As duas confirmações abaixo precisam estar marcadas para liberar a finalização do boletim.</p>
      <div class="confirmation-stack">
        <label class="checkbox-card ${r.acknowledgements.reviewed ? 'checked' : 'required-unchecked'}">
          <input type="checkbox" data-path="acknowledgements.reviewed" required ${r.acknowledgements.reviewed ? 'checked' : ''}>
          <span><strong>Revisei todas as informações</strong><span>Confirmo que conferi os dados da ocorrência, pessoas, veículos, materiais, anexos e histórico.</span></span>
        </label>
        <label class="checkbox-card ${r.acknowledgements.truthful ? 'checked' : 'required-unchecked'}">
          <input type="checkbox" data-path="acknowledgements.truthful" required ${r.acknowledgements.truthful ? 'checked' : ''}>
          <span><strong>As informações correspondem ao registro realizado</strong><span>Declaro que o conteúdo foi preenchido de acordo com os fatos e informações disponíveis.</span></span>
        </label>
      </div>
    </section>
    <div class="notice warning"><strong>Atenção:</strong> depois da finalização, o boletim ficará disponível somente para consulta nesta versão do protótipo.</div>`;
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
    control.classList.toggle('field-control-empty', empty && control.type !== 'checkbox');
    control.classList.toggle('field-control-filled', !empty && control.type !== 'checkbox');
    control.closest('.field')?.classList.toggle('has-empty-required', empty);
    if (control.tagName === 'SELECT') syncModalSelectButton(control);
    const checkCard = control.closest('.checkbox-card');
    if (checkCard) {
      checkCard.classList.toggle('checked', !empty);
      checkCard.classList.toggle('required-unchecked', empty);
    }
  });
}

function focusFirstMissing(root = app) {
  const missing = Array.from(root.querySelectorAll('input[required], select[required], textarea[required]'))
    .find(control => control.type === 'checkbox' ? !control.checked : !String(control.value || '').trim());
  if (missing) {
    const focusTarget = missing._modalSelectButton || missing;
    focusTarget.focus({ preventScroll: true });
    focusTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function bindWizardInputs() {
  app.querySelectorAll('[data-path]').forEach(control => {
    const eventName = control.tagName === 'SELECT' || ['date', 'time', 'checkbox'].includes(control.type) ? 'change' : 'input';
    control.addEventListener(eventName, () => {
      const value = control.type === 'checkbox' ? control.checked : control.value;
      setPath(state.current, control.dataset.path, value);
      if (control.dataset.path === 'basic.referencia' && value !== 'Danos materiais — Outra') state.current.basic.referenciaOutra = '';
      if (control.dataset.path === 'basic.diretoria' && value !== 'Outra') state.current.basic.diretoriaOutra = '';
      refreshRequiredFieldStates(app);
      scheduleSave();
      if (control.dataset.rerender === 'true') renderWizard();
    });
  });
  modalizeSelects(app);
  refreshRequiredFieldStates(app);
}

function bindStepSpecific() {
  app.querySelectorAll('[data-add-entity]').forEach(button => button.addEventListener('click', () => openEntityDialog(button.dataset.addEntity)));
  app.querySelectorAll('[data-edit-entity]').forEach(button => button.addEventListener('click', () => openEntityDialog(button.dataset.editEntity, Number(button.dataset.index))));
  app.querySelectorAll('[data-delete-entity]').forEach(button => button.addEventListener('click', async () => {
    const type = button.dataset.deleteEntity;
    const index = Number(button.dataset.index);
    const labels = { people: 'esta pessoa', vehicles: 'este veículo', materials: 'este material' };
    const confirmed = await openAppModal({
      kind: 'warning',
      eyebrow: 'Exclusão de cadastro',
      title: `Excluir ${labels[type]}?`,
      message: 'O item será removido deste boletim. Esta ação não poderá ser desfeita depois que o rascunho for salvo.',
      confirmText: 'Excluir item',
      cancelText: 'Manter cadastro'
    });
    if (!confirmed) return;
    state.current[type].splice(index, 1);
    await saveCurrent(true);
    renderWizard();
    showToast('Cadastro excluído do boletim.');
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
    const confirmed = await openAppModal({
      kind: 'warning',
      eyebrow: 'Remoção de anexo',
      title: 'Excluir este arquivo?',
      message: 'O arquivo será removido do rascunho armazenado neste dispositivo.',
      confirmText: 'Excluir arquivo',
      cancelText: 'Cancelar'
    });
    if (!confirmed) return;
    state.current.attachments.splice(Number(button.dataset.deleteFile), 1);
    await saveCurrent(true);
    renderWizard();
  }));
}

async function handleAttachments(event) {
  const files = Array.from(event.target.files || []);
  for (const file of files) {
    if (file.size > 5 * 1024 * 1024) {
      await openAppModal({ kind: 'warning', eyebrow: 'Arquivo não adicionado', title: 'Anexo maior que 5 MB', message: `<strong>${escapeHtml(file.name)}</strong> ultrapassa o limite permitido nesta versão.`, details: 'Reduza o tamanho da imagem ou selecione outro arquivo.', confirmText: 'Entendi' });
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
    await saveCurrent(true);
    let synced = false;
    if (apiConfigured()) synced = await syncRecord(state.current, false);
    await openAppModal({
      kind: synced ? 'success' : 'info',
      eyebrow: 'Rascunho protegido',
      title: 'Boletim salvo',
      message: synced ? 'O rascunho foi salvo neste dispositivo e sincronizado com o Google Sheets.' : 'O rascunho foi salvo neste dispositivo. A sincronização com a planilha ocorrerá depois que o banco for configurado.',
      confirmText: 'Continuar preenchendo'
    });
    return;
  }
  if (action === 'exit') {
    const decision = await openAppModal({
      kind: 'warning',
      eyebrow: 'Saída do preenchimento',
      title: 'Salvar o rascunho e sair?',
      message: 'As informações preenchidas até agora serão mantidas neste dispositivo. Você poderá continuar depois pela tela de boletins.',
      details: `<ul><li>Número do rascunho: <strong>${escapeHtml(state.current.numero)}</strong></li><li>Etapa atual: <strong>${escapeHtml(STEPS[state.currentStep])}</strong></li></ul>`,
      confirmText: 'Salvar e sair',
      cancelText: 'Continuar no boletim',
      tertiaryText: 'Cancelar',
      tertiaryValue: 'cancel-draft'
    });
    if (decision === false) return;
    if (decision === 'cancel-draft') {
      const cancelConfirmed = await openAppModal({
        kind: 'danger',
        eyebrow: 'Cancelamento do rascunho',
        title: 'Cancelar e excluir este rascunho?',
        message: 'Todos os dados preenchidos neste boletim serão removidos deste dispositivo.',
        details: `<strong>${escapeHtml(state.current.numero)}</strong> não poderá ser recuperado depois da exclusão.`,
        confirmText: 'Excluir rascunho',
        cancelText: 'Manter rascunho'
      });
      if (!cancelConfirmed) return;
      await dbDelete(state.current.id);
      state.current = null;
      await refreshRecords();
      return navigate('home');
    }
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
    const confirmed = await openAppModal({
      kind: 'warning',
      eyebrow: 'Finalização do boletim',
      title: `Finalizar ${escapeHtml(state.current.numero)}?`,
      message: 'Depois da confirmação, o boletim será marcado como finalizado e ficará disponível somente para consulta nesta versão.',
      details: '<ul><li>Confirme que o relato está completo.</li><li>Verifique nomes, placas, materiais e anexos.</li><li>O sistema tentará enviar o registro ao Google Sheets.</li></ul>',
      confirmText: 'Finalizar boletim',
      cancelText: 'Voltar para revisão'
    });
    if (!confirmed) return;
    state.current.status = 'Finalizado';
    state.current.finalizedAt = new Date().toISOString();
    state.current.currentStep = STEPS.length - 1;
    await saveCurrent(true);
    const synced = apiConfigured() ? await syncRecord(state.current, false) : false;
    await refreshRecords();
    await navigate('detail');
    await openAppModal({
      kind: 'success',
      eyebrow: 'Registro concluído',
      title: 'Boletim finalizado com sucesso',
      message: synced ? 'O boletim foi salvo no dispositivo e enviado ao Google Sheets.' : 'O boletim foi salvo no dispositivo. Configure ou verifique o Google Sheets para realizar a sincronização.',
      details: `<strong>Número do boletim:</strong> ${escapeHtml(state.current.numero)}`,
      confirmText: 'Abrir boletim'
    });
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
      openAppModal({
        kind: 'warning',
        eyebrow: 'Campos obrigatórios',
        title: 'Ainda existem informações pendentes',
        message: 'Preencha os campos destacados em amarelo antes de continuar para a próxima etapa.',
        confirmText: 'Verificar campos'
      });
      return false;
    }
  }
  if (step === 1 && state.current.peopleNone && state.current.people.length) {
    openAppModal({
      kind: 'warning',
      eyebrow: 'Informação contraditória',
      title: 'Revise a etapa de pessoas',
      message: 'A opção “Não há pessoa identificada” está marcada, mas existem pessoas cadastradas. Desmarque a opção ou exclua os cadastros antes de continuar.',
      confirmText: 'Revisar cadastros'
    });
    return false;
  }
  if (step === 5 && !state.current.history.relato.trim()) {
    refreshRequiredFieldStates(app);
    focusFirstMissing(app);
    openAppModal({
      kind: 'warning',
      eyebrow: 'Histórico obrigatório',
      title: 'Informe o relato da ocorrência',
      message: 'O relato completo precisa descrever o início, o desenvolvimento e o desfecho da ocorrência.',
      confirmText: 'Preencher relato'
    });
    return false;
  }
  if (step === 6 && (!state.current.acknowledgements.reviewed || !state.current.acknowledgements.truthful)) {
    refreshRequiredFieldStates(app);
    focusFirstMissing(app);
    openAppModal({
      kind: 'warning',
      eyebrow: 'Confirmações obrigatórias',
      title: 'Marque as duas confirmações',
      message: 'A finalização somente será liberada depois que você confirmar a revisão e a correspondência das informações registradas.',
      confirmText: 'Revisar confirmações'
    });
    return false;
  }
  return true;
}

function validateAll() {
  return validateStep(0) && validateStep(1) && validateStep(5) && validateStep(6);
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
  modalizeSelects(dialogBody);
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
  refreshRequiredFieldStates(dialogBody);
  const missing = Array.from(dialogBody.querySelectorAll('[required]')).find(control => !String(control.value || '').trim());
  if (missing) {
    (missing._modalSelectButton || missing).focus();
    await openAppModal({
      kind: 'warning',
      eyebrow: 'Cadastro incompleto',
      title: 'Preencha os campos obrigatórios',
      message: 'Os campos destacados em amarelo precisam ser preenchidos antes de salvar este cadastro.',
      confirmText: 'Voltar ao cadastro'
    });
    return;
  }
  const formData = Object.fromEntries(new FormData(dialogForm).entries());
  const { type, index } = state.dialog;
  formData.id = index === null ? uid() : state.current[type][index].id;
  if (index === null) state.current[type].push(formData);
  else state.current[type][index] = formData;
  if (type === 'people' && state.current[type].length) state.current.peopleNone = false;
  dialog.close();
  state.dialog = null;
  await saveCurrent(true);
  renderWizard();
  showToast('Cadastro salvo no boletim.');
}

function closeDialog() {
  dialog.close();
  state.dialog = null;
}

function renderRecords() {
  const rawTerm = state.search.trim();
  const term = rawTerm.toLowerCase();
  const isSequenceSearch = /^\d+$/.test(rawTerm);
  const searchedSequence = isSequenceSearch ? Number(rawTerm) : null;

  const filtered = state.records.filter(record => {
    const statusOk = state.filter === 'Todos' || record.status === state.filter;
    if (!statusOk) return false;
    if (!term) return true;

    // Quando o usuário informa somente números, pesquisa a sequência final do BO.
    // Exemplo: "26" encontra "BO-2026-000026", sem confundir com o ano 2026.
    if (isSequenceSearch) {
      const lastPart = String(record.numero || '').split('-').pop();
      const recordSequence = Number(lastPart);
      return Number.isFinite(recordSequence) && recordSequence === searchedSequence;
    }

    const haystack = [
      record.numero,
      record.basic?.referencia,
      record.basic?.referenciaOutra,
      record.basic?.diretoria,
      record.basic?.diretoriaOutra,
      record.basic?.nomeEmissor,
      record.basic?.local,
      ...(record.people || []).map(p => p.nome),
      ...(record.vehicles || []).map(v => v.placa)
    ].join(' ').toLowerCase();
    return haystack.includes(term);
  });
  app.innerHTML = `
    <section class="form-card">
      <p class="eyebrow">Consulta operacional</p><h1>Boletins registrados</h1>
      <p>Pesquise por número do BO, referência, nome do emissor, pessoa envolvida ou placa de veículo.</p>
      <div class="search-wrap">${ICONS.search}<input class="search-input" id="record-search" type="search" inputmode="search" enterkeyhint="search" value="${escapeHtml(state.search)}" placeholder="Ex.: 26, nome, referência ou placa" aria-describedby="record-search-help"></div>
      <small class="search-help" id="record-search-help">Ao digitar somente <strong>26</strong>, o aplicativo procura exatamente o BO de sequência 26, como <strong>BO-2026-000026</strong>.</small>
      <div class="filter-row">${['Todos', 'Rascunho', 'Finalizado'].map(filter => `<button class="filter-button ${state.filter === filter ? 'active' : ''}" type="button" data-filter="${filter}">${filter}</button>`).join('')}</div>
    </section>
    <div class="section-title"><div><p class="eyebrow">Resultado da consulta</p><h2>${filtered.length} registro(s) encontrado(s)</h2></div><button class="button small primary" type="button" data-action="new-bo">${ICONS.plus} Novo boletim</button></div>
    ${filtered.length ? `<div class="record-list">${filtered.map(recordCard).join('')}</div>` : '<div class="entity-empty">Nenhum boletim corresponde aos filtros informados.</div>'}`;
  bindCommonCards();
  app.querySelector('#record-search').addEventListener('input', event => {
    state.search = event.target.value;
    renderRecords();
    requestAnimationFrame(() => {
      const input = app.querySelector('#record-search');
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    });
  });
  app.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    state.filter = button.dataset.filter;
    renderRecords();
  }));
}

function renderDetail() {
  const r = state.current;
  const b = r.basic;
  const reference = b.referencia === 'Danos materiais — Outra' ? b.referenciaOutra : b.referencia;
  const directorate = b.diretoria === 'Outra' ? b.diretoriaOutra : b.diretoria;
  app.innerHTML = `
    <section class="hero no-visual">
      <div class="hero-copy">
        <p class="eyebrow">${escapeHtml(r.status)} • boletim de ocorrência</p>
        <h1>${escapeHtml(r.numero)}</h1>
        <p>${escapeHtml(reference || 'Referência não informada')} • ${formatDateOnly(b.data)} às ${escapeHtml(b.hora)}</p>
        <div class="hero-actions">
          <button class="button ghost" type="button" data-action="print">${ICONS.file} Imprimir ou salvar em PDF</button>
          <button class="button secondary" type="button" data-action="sync-record">${ICONS.sync} Sincronizar com a planilha</button>
        </div>
        <div style="margin-top:15px">${syncBadgeHtml()}</div>
      </div>
    </section>
    <div class="section-title"><div><p class="eyebrow">Resumo consolidado</p><h2>Dados do boletim</h2></div></div>
    <div class="review-grid">
      ${reviewSectionStatic('Ocorrência', `<dl class="definition-grid"><div><dt>Referência</dt><dd>${escapeHtml(reference || 'Não informada')}</dd></div><div><dt>Local</dt><dd>${escapeHtml(b.local)} — ${escapeHtml(b.complementoLocal)}</dd></div><div><dt>Diretoria</dt><dd>${escapeHtml(directorate || 'Não informada')}</dd></div><div><dt>Emissor</dt><dd>${escapeHtml(b.nomeEmissor)} • matrícula ${escapeHtml(b.matriculaEmissor)}</dd></div><div><dt>Criado em</dt><dd>${formatDateTime(r.createdAt)}</dd></div><div><dt>Finalizado em</dt><dd>${formatDateTime(r.finalizedAt)}</dd></div><div><dt>Última sincronização</dt><dd>${formatDateTime(r.syncedAt)}</dd></div></dl>`)}
      ${reviewSectionStatic(`Pessoas (${r.people.length})`, r.people.length ? `<div class="entity-list">${r.people.map(renderPersonItemReview).join('')}</div>` : `<div class="entity-empty">${r.peopleNone ? 'Não houve pessoa identificada.' : 'Nenhuma pessoa cadastrada.'}</div>`)}
      ${reviewSectionStatic(`Veículos (${r.vehicles.length})`, r.vehicles.length ? `<div class="entity-list">${r.vehicles.map(renderVehicleItemReview).join('')}</div>` : '<div class="entity-empty">Nenhum veículo cadastrado.</div>')}
      ${reviewSectionStatic(`Materiais (${r.materials.length})`, r.materials.length ? `<div class="entity-list">${r.materials.map(renderMaterialItemReview).join('')}</div>` : '<div class="entity-empty">Nenhum material cadastrado.</div>')}
      ${reviewSectionStatic('Histórico', `<dl class="definition-grid"><div style="grid-column:1/-1"><dt>Relato</dt><dd>${escapeHtml(r.history.relato)}</dd></div><div style="grid-column:1/-1"><dt>Providências</dt><dd>${escapeHtml(r.history.providencias || 'Não informado')}</dd></div><div style="grid-column:1/-1"><dt>Observações</dt><dd>${escapeHtml(r.history.observacoes || 'Não informado')}</dd></div></dl>`)}
    </div>`;
  app.querySelector('[data-action="print"]').addEventListener('click', () => window.print());
  app.querySelector('[data-action="sync-record"]').addEventListener('click', async () => {
    const success = await syncRecord(r, false);
    await refreshRecords();
    renderDetail();
    await openAppModal({
      kind: success ? 'success' : 'danger',
      eyebrow: 'Sincronização do boletim',
      title: success ? 'Registro enviado ao Google Sheets' : 'Não foi possível sincronizar',
      message: success ? 'Os dados do boletim foram atualizados na planilha.' : 'Verifique o endereço do Apps Script, a permissão da implantação e a conexão com a internet.',
      confirmText: 'Entendi'
    });
  });
}

function reviewSectionStatic(title, body) {
  return `<section class="review-section"><div class="review-head"><h3>${title}</h3></div><div class="review-body">${body}</div></section>`;
}

function renderAbout() {
  app.innerHTML = `
    <section class="form-card">
      <p class="eyebrow">Banco de dados temporário</p><h1>Integração com Google Sheets</h1>
      <p>O aplicativo sempre mantém uma cópia local para proteger os rascunhos. Depois de configurar o Apps Script, os boletins também podem ser gravados e consultados na planilha.</p>
      <div style="margin:12px 0">${syncBadgeHtml()}</div>
      <div class="form-grid">
        <div class="field full">
          <label for="sheets-url">Endereço do aplicativo da Web</label>
          <input id="sheets-url" type="url" value="${escapeHtml(state.settings.apiUrl || '')}" placeholder="https://script.google.com/macros/s/.../exec">
          <small>Cole o endereço da implantação do Apps Script. Não use o endereço do editor do script.</small>
        </div>
      </div>
      <div class="about-actions">
        <button class="button primary" type="button" data-about-action="save-settings">${ICONS.gear} Salvar endereço</button>
        <button class="button secondary" type="button" data-about-action="test">${ICONS.sync} Testar conexão</button>
        <button class="button secondary" type="button" data-about-action="sync-all">${ICONS.upload} Enviar registros locais</button>
        <button class="button secondary" type="button" data-about-action="pull">${ICONS.download} Carregar da planilha</button>
      </div>
      <div class="notice warning" style="margin-top:14px"><strong>Anexos:</strong> nesta versão, fotos e documentos permanecem no navegador. A planilha recebe apenas o nome, o tipo e o tamanho do arquivo.</div>
    </section>

    <div class="section-title"><div><p class="eyebrow">Configuração inicial</p><h2>Como preparar a planilha</h2></div></div>
    <div class="about-list">
      <section class="about-item"><p class="eyebrow">Etapa 1</p><h3>Criar a planilha</h3><p>Crie uma planilha Google em branco e abra <strong>Extensões → Apps Script</strong>.</p></section>
      <section class="about-item"><p class="eyebrow">Etapa 2</p><h3>Publicar o script</h3><p>Cole o conteúdo do arquivo <strong>google-apps-script.gs</strong>, execute a função <strong>setup</strong> e publique como aplicativo da Web.</p></section>
      <section class="about-item"><p class="eyebrow">Etapa 3</p><h3>Conectar o aplicativo</h3><p>Cole o endereço terminado em <strong>/exec</strong>, salve e clique em “Testar conexão”.</p></section>
      <div class="code-note">Abas criadas: BO_Ocorrencias, BO_Pessoas, BO_Veiculos, BO_Materiais e BO_Anexos.</div>
    </div>

    <div class="section-title"><div><p class="eyebrow">Segurança dos testes</p><h2>Backup local</h2></div></div>
    <section class="info-card">
      <p>Exporte os dados para um arquivo JSON antes de trocar de aparelho ou navegador. Use somente informações fictícias enquanto o protótipo não estiver aprovado.</p>
      <div class="about-actions">
        <button class="button secondary" type="button" data-about-action="export">${ICONS.download} Exportar backup JSON</button>
        <button class="button secondary" type="button" data-about-action="import">${ICONS.upload} Importar backup JSON</button>
        <button class="button danger" type="button" data-about-action="clear">${ICONS.trash} Apagar dados de teste</button>
        <input id="import-file" type="file" accept="application/json" class="hidden">
      </div>
    </section>`;

  app.querySelector('[data-about-action="save-settings"]').addEventListener('click', async () => {
    state.settings.apiUrl = app.querySelector('#sheets-url').value.trim();
    saveSettings();
    state.syncState = apiConfigured() ? 'offline' : 'offline';
    updateHeader();
    renderAbout();
    await openAppModal({
      kind: apiConfigured() ? 'success' : 'warning',
      eyebrow: 'Configuração do banco',
      title: apiConfigured() ? 'Endereço salvo' : 'Endereço salvo, mas precisa ser revisado',
      message: apiConfigured() ? 'Agora use o botão “Testar conexão” para confirmar o acesso à planilha.' : 'O endereço informado não corresponde ao formato esperado de uma implantação do Apps Script.',
      confirmText: 'Continuar'
    });
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
    await openAppModal({ kind: 'danger', eyebrow: 'Falha na importação', title: 'Não foi possível importar o arquivo', message: 'O arquivo selecionado não possui um backup válido do BO Digital GSP.', confirmText: 'Entendi' });
  }
}

async function clearData() {
  if (!state.records.length) {
    await openAppModal({ kind: 'info', eyebrow: 'Banco local', title: 'Não há dados para apagar', message: 'Nenhum boletim está armazenado neste navegador.', confirmText: 'Entendi' });
    return;
  }
  const confirmed = await openAppModal({
    kind: 'danger',
    eyebrow: 'Exclusão permanente',
    title: 'Apagar todos os dados de teste?',
    message: 'Todos os boletins, rascunhos e anexos armazenados neste navegador serão excluídos. Os registros que já foram enviados à planilha não serão apagados do Google Sheets.',
    details: `<strong>${state.records.length}</strong> registro(s) serão removidos do armazenamento local.`,
    confirmText: 'Apagar dados locais',
    cancelText: 'Cancelar'
  });
  if (!confirmed) return;
  for (const record of state.records) await dbDelete(record.id);
  await refreshRecords();
  renderAbout();
  await openAppModal({ kind: 'success', eyebrow: 'Limpeza concluída', title: 'Dados locais apagados', message: 'O armazenamento de teste deste navegador foi limpo.', confirmText: 'Concluir' });
}

backButton.addEventListener('click', async () => {
  if (state.route === 'wizard') await handleStepAction('exit');
  else navigate('records');
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

appDialogConfirm.addEventListener('click', () => resolveAppModal(true));
appDialogCancel.addEventListener('click', () => resolveAppModal(false));
appDialogTertiary.addEventListener('click', () => resolveAppModal(modalTertiaryValue));
selectDialogClose.addEventListener('click', closeSelectionModal);
selectDialogCancel.addEventListener('click', closeSelectionModal);
selectDialogSearch.addEventListener('input', () => renderSelectModalOptions(selectDialogSearch.value));
selectDialog.addEventListener('cancel', event => { event.preventDefault(); closeSelectionModal(); });
selectDialog.addEventListener('click', event => { if (event.target === selectDialog) closeSelectionModal(); });
appDialog.addEventListener('cancel', event => {
  event.preventDefault();
  resolveAppModal(false);
});
appDialog.addEventListener('click', event => {
  if (event.target === appDialog && !appDialogCancel.classList.contains('hidden')) resolveAppModal(false);
});

function isStandaloneMode() {
  return window.BO_PWA?.isStandalone?.() || window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function updateInstallButton() {
  const canInstall = Boolean(window.BO_PWA?.canInstall) && !isStandaloneMode();
  installButton.hidden = !canInstall;
  installButton.classList.toggle('hidden', !canInstall);
}

async function handleInstallRequest() {
  if (isStandaloneMode()) {
    await openAppModal({ kind: 'success', eyebrow: 'Instalação', title: 'Aplicativo já instalado', message: 'O BO Digital GSP já está aberto no modo aplicativo.', confirmText: 'Concluir' });
    return;
  }
  if (!window.BO_PWA?.canInstall) {
    await openAppModal({
      kind: 'warning',
      eyebrow: 'Instalação ainda indisponível',
      title: 'O navegador ainda não validou o PWA',
      message: 'Abra o endereço publicado diretamente no Google Chrome, aguarde alguns segundos e recarregue a página. O botão Instalar aparecerá somente após a validação do navegador.',
      details: 'Não use “Adicionar à tela inicial” quando o menu mostrar apenas essa opção, pois ela pode criar somente um atalho.',
      confirmText: 'Entendi'
    });
    return;
  }

  const choice = await window.BO_PWA.install();
  updateInstallButton();
  if (state.route === 'home') renderHome();
  if (choice?.outcome === 'dismissed') {
    await openAppModal({ kind: 'info', eyebrow: 'Instalação', title: 'Instalação cancelada', message: 'A instalação foi cancelada. Recarregue a página para tentar novamente.', confirmText: 'Entendi' });
  }
}

window.addEventListener('bo-pwa-statechange', () => {
  updateInstallButton();
  if (state.route === 'home') renderHome();
});

window.addEventListener('bo-pwa-installed', async () => {
  updateInstallButton();
  if (state.route === 'home') renderHome();
  await openAppModal({ kind: 'success', eyebrow: 'Instalação concluída', title: 'BO Digital GSP instalado', message: 'O aplicativo foi instalado e pode ser aberto junto aos demais aplicativos do aparelho.', confirmText: 'Concluir' });
});

installButton.addEventListener('click', handleInstallRequest);

window.addEventListener('beforeunload', () => {
  if (state.current && state.route === 'wizard') dbPut(state.current);
});

async function init() {
  try {
    loadSettings();
    state.syncState = apiConfigured() ? 'online' : 'offline';
    await refreshRecords();
    updateHeader();
    updateInstallButton();
    renderHome();
  } catch (error) {
    console.error(error);
    app.innerHTML = '<div class="notice danger">O navegador não conseguiu iniciar o armazenamento local. Abra o aplicativo em uma janela normal e verifique se o IndexedDB está permitido.</div>';
  }
}

init();
