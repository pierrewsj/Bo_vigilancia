'use strict';

const DB_NAME = 'bo-digital-prototipo';
const DB_VERSION = 1;
const STORE = 'boletins';
const SETTINGS_KEY = 'bo-digital-gsheets-settings-v1';
const OPERATOR_SESSION_KEY = 'bo-digital-operator-session-v2';
const APP_STATE_KEY = 'bo-digital-navigation-state-v1';
const PENDING_LOGIN_KEY = 'bo-digital-pending-login-v1';
const RECENT_LOCATIONS_KEY = 'bo-digital-recent-locations-v1';
const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbwrYFAMDKd02EQx41vsLsVI5TztZxOph7f7YJvJ8DDOwQoaFrCcxRr8HpNkBhlHlr-6TQ/exec';
const DEFAULT_SETTINGS = { apiUrl: DEFAULT_API_URL };
const APP_VERSION = '22.0.0';
const REQUIRED_API_VERSION = '6.1.0';
const REQUIRED_API_SCHEMA = 'compact-u';

const REFERENCE_DESCRIPTIONS = {
  'Acesso': 'Use para entrada, saída, autorização, credenciamento ou tentativa de acesso.',
  'Ato doloso': 'Use quando houver indício de ação intencional para causar dano ou prejuízo.',
  'Auditoria de processos': 'Use para constatações realizadas durante auditoria ou verificação de procedimento.',
  'Carga de materiais': 'Use para ocorrências relacionadas ao transporte, conferência ou liberação de materiais.',
  'Emergência': 'Use para situações urgentes que exijam resposta imediata.',
  'Fiscalização': 'Use para registros resultantes de fiscalização ou inspeção de segurança.',
  'Irregularidade': 'Use quando for identificada uma situação fora do procedimento esperado.',
  'Ocorrência médica': 'Use para mal-estar, acidente pessoal, atendimento médico ou encaminhamento.',
  'Ronda (interna / externa)': 'Use para fatos identificados durante ronda de segurança.',
  'Sintomas de embriaguez': 'Use quando houver sinais compatíveis com consumo de álcool ou alteração de comportamento.',
  'Transgressão disciplinar': 'Use para descumprimento de normas ou condutas internas.',
  'Veículos': 'Use para ocorrências envolvendo veículos, placas, carretas, danos ou circulação.',
  'Souza Lima': 'Use para ocorrências relacionadas à empresa prestadora de segurança.',
  'Danos materiais — Agressão física': 'Use para agressão envolvendo pessoas, ainda que também haja dano material.',
  'Danos materiais — Avaria em peças / vasilhames': 'Use para danos identificados em peças, embalagens ou vasilhames.',
  'Danos materiais — Danos às instalações industriais': 'Use para danos em estruturas, equipamentos ou instalações.',
  'Danos materiais — Entrada com danos': 'Use quando veículo, equipamento ou material chega à unidade já avariado.',
  'Danos materiais — Erro operacional': 'Use quando o dano estiver relacionado a falha durante uma operação.',
  'Danos materiais — Faixa horária inválida': 'Use para divergência ou irregularidade relacionada a horário autorizado.',
  'Danos materiais — Furto em área externa': 'Use para desaparecimento ou subtração em área externa.',
  'Danos materiais — Furto em área interna': 'Use para desaparecimento ou subtração em área interna.',
  'Danos materiais — Incêndio': 'Use para princípio de incêndio, incêndio confirmado ou danos decorrentes.',
  'Danos materiais — Ofensa moral': 'Use para relato de ofensa, ameaça ou constrangimento.',
  'Danos materiais — Queixa de desaparecimento de material / equipamento': 'Use quando houver comunicação de item não localizado.',
  'Danos materiais — Recolhimento de material / equipamento': 'Use para material encontrado, recolhido ou entregue à segurança.',
  'Danos materiais — Transporte por reboque': 'Use para remoção ou transporte de veículo por reboque.',
  'Danos materiais — Outra': 'Use somente quando nenhuma referência da lista representar o fato.'
};

const POPULAR_REFERENCES = [
  'Irregularidade', 'Veículos', 'Ronda (interna / externa)',
  'Danos materiais — Entrada com danos',
  'Danos materiais — Avaria em peças / vasilhames',
  'Danos materiais — Queixa de desaparecimento de material / equipamento'
];

const REFERENCE_GROUPS = [
  {
    label: 'Referências gerais',
    options: [
      'Acesso','Ato doloso','Auditoria de processos','Carga de materiais','Emergência','Fiscalização',
      'Irregularidade','Ocorrência médica','Ronda (interna / externa)','Sintomas de embriaguez',
      'Transgressão disciplinar','Veículos','Souza Lima'
    ]
  },
  {
    label: 'Danos materiais',
    options: [
      'Agressão física','Avaria em peças / vasilhames','Danos às instalações industriais','Entrada com danos',
      'Erro operacional','Faixa horária inválida','Furto em área externa','Furto em área interna','Incêndio',
      'Ofensa moral','Queixa de desaparecimento de material / equipamento','Recolhimento de material / equipamento',
      'Transporte por reboque','Outra'
    ].map(item => `Danos materiais — ${item}`)
  }
];
const REFERENCES = REFERENCE_GROUPS.flatMap(group => group.options);

const DIRECTORATES = [
  'BRAND MARKETING','COMMERCIAL FIAT','COMMERCIAL JEEP','COMPRAS','COMUNICAÇÃO CORPORATIVA',
  'CUSTOMER CARE','DESENVOLVIMENTO DE REDE','DESIGN','ENGENHARIA','FIAT BRAND','FINANCE','ICT',
  'JEEP BRAND','JURÍDICO','MANUFATURA','MOPAR','PORTIFÓLIO','PRESIDÊNCIA','PRODUTO','QUALIDADE',
  'RECURSOS HUMANOS','SUPPLY CHAIN','Outra'
];
const LOCATIONS = ['Galpão','Portaria','Pátio','Estacionamento','Rua','Almoxarifado','Área interna','Área externa','Outro'];
const STEPS = ['Ocorrência','Elementos relacionados','Relato e providências','Evidências','Revisão'];

function referenceFlow(reference = '') {
  const value = String(reference).toLocaleLowerCase('pt-BR');
  return {
    people: true,
    vehicles: /(veículo|entrada com danos|reboque|acesso|faixa horária)/.test(value),
    materials: /(material|peça|vasilhame|carga|equipamento|recolhimento|desaparecimento)/.test(value),
    attachments: /(dano|furto|incêndio|irregularidade|veículo|agressão|ofensa|ato doloso)/.test(value),
    medical: /(médica|embriaguez|agressão)/.test(value)
  };
}

function locationHelp(local = '') {
  const map = {
    'Galpão': 'Informe o número do galpão e, quando possível, coluna, sala ou área.',
    'Portaria': 'Informe o nome ou número da portaria e o sentido de entrada ou saída.',
    'Pátio': 'Informe o nome do pátio, vaga, rua interna ou ponto de referência.',
    'Estacionamento': 'Informe o estacionamento, setor, vaga ou proximidade.',
    'Rua': 'Informe o nome ou número da rua e um ponto de referência.',
    'Almoxarifado': 'Informe o código, nome ou identificação do almoxarifado.',
    'Área interna': 'Informe o setor, prédio, corredor ou ponto de referência.',
    'Área externa': 'Informe o acesso, via, pátio ou referência visual.',
    'Outro': 'Descreva o local de forma que outra pessoa consiga encontrá-lo.'
  };
  return map[local] || 'Informe galpão, número, sala, rua ou outro ponto de referência.';
}

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
  syncState: 'offline',
  remoteRecords: [],
  remoteSearching: false,
  operator: null,
  validationIssues: []
};

const app = document.querySelector('#app');
const headerTitle = document.querySelector('#header-title');
const headerSubtitle = document.querySelector('#header-subtitle');
const backButton = document.querySelector('#back-button');
const bottomNav = document.querySelector('#bottom-nav');
const installButton = document.querySelector('#install-button');
const technicalButton = document.querySelector('#technical-button');
const dialog = document.querySelector('#entity-dialog');
const dialogForm = document.querySelector('#entity-form');
const dialogBody = document.querySelector('#dialog-body');
const dialogTitle = document.querySelector('#dialog-title');
const dialogEyebrow = document.querySelector('#dialog-eyebrow');
const toast = document.querySelector('#toast');
const headerSync = document.querySelector('#header-sync');
const headerSyncLabel = document.querySelector('#header-sync-label');
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
const busyOverlay = document.querySelector('#busy-overlay');
const busyTitle = document.querySelector('#busy-title');
const busyMessage = document.querySelector('#busy-message');

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


function storageRemove(key) {
  try { localStorage.removeItem(key); }
  catch { memoryStorage.delete(key); }
}
function loadOperatorSession() {
  try {
    const operator = JSON.parse(storageGet(OPERATOR_SESSION_KEY) || 'null');
    return operator && operator.usuario && operator.registro && operator.turno ? operator : null;
  } catch { return null; }
}
function saveOperatorSession(operator) {
  storageSet(OPERATOR_SESSION_KEY, JSON.stringify(operator));
  state.operator = operator;
}
function clearOperatorSession() {
  storageRemove(OPERATOR_SESSION_KEY);
  storageRemove(PENDING_LOGIN_KEY);
  state.operator = null;
}
function operatorSnapshot() {
  const operator = state.operator || loadOperatorSession();
  if (!operator || !operator.usuario || !operator.registro || !operator.turno) return null;
  return {
    usuario: String(operator.usuario).trim(),
    registro: String(operator.registro).trim(),
    turno: String(operator.turno).trim(),
    loginAt: operator.loginAt || new Date().toISOString(),
    accessId: operator.accessId || uid(),
    dispositivo: operator.dispositivo || navigator.userAgent || ''
  };
}
function stampOperator(record) {
  const operator = operatorSnapshot();
  if (!record || !operator) return record;
  const current = record.operator || {};
  if (current.usuario && current.registro && current.turno) return record;
  record.operator = { ...operator };
  return record;
}
async function migrateOperatorToLocalRecords() {
  if (!operatorSnapshot()) return false;
  let changed = false;
  for (const record of state.records) {
    if (!record.operator?.usuario || !record.operator?.registro || !record.operator?.turno) {
      stampOperator(record);
      record.syncStatus = 'pending';
      record.updatedAt = new Date().toISOString();
      await dbPut(record);
      changed = true;
    }
  }
  if (changed) await refreshRecords();
  return changed;
}
function loadNavigationState() {
  try { return JSON.parse(storageGet(APP_STATE_KEY) || 'null'); }
  catch { return null; }
}
function persistNavigationState() {
  if (!state.operator) return;
  const value = {
    route: state.route,
    currentId: state.current?.id || '',
    currentStep: Number.isInteger(state.currentStep) ? state.currentStep : 0,
    savedAt: new Date().toISOString()
  };
  storageSet(APP_STATE_KEY, JSON.stringify(value));
}
function clearNavigationState() {
  storageRemove(APP_STATE_KEY);
}
async function registerOperatorAccess(operator = state.operator) {
  const clean = operator || operatorSnapshot();
  if (!clean) return false;
  storageSet(PENDING_LOGIN_KEY, JSON.stringify(clean));
  if (!apiConfigured() || !navigator.onLine) return false;
  try {
    const result = await apiPost({ action: 'login', operator: clean });
    if (!result || result.ok === false) throw new Error(result?.error || 'O servidor não confirmou o login.');
    if (result.version !== REQUIRED_API_VERSION || result.schema !== REQUIRED_API_SCHEMA || result.operatorSaved !== true) {
      throw new Error(`Implantação incompatível. Esperado ${REQUIRED_API_VERSION} (${REQUIRED_API_SCHEMA}); recebido ${result.version || 'sem versão'} (${result.schema || 'sem esquema'}).`);
    }
    storageRemove(PENDING_LOGIN_KEY);
    return true;
  } catch (error) {
    console.warn('Acesso pendente de registro na planilha.', error);
    return false;
  }
}

function recentLocations() {
  try { return JSON.parse(storageGet(RECENT_LOCATIONS_KEY) || '[]'); } catch { return []; }
}
function rememberLocation(value) {
  const clean = String(value || '').trim();
  if (!clean) return;
  const values = [clean, ...recentLocations().filter(item => item !== clean)].slice(0, 5);
  storageSet(RECENT_LOCATIONS_KEY, JSON.stringify(values));
}
function temporaryNumber() {
  const year = new Date().getFullYear();
  return `RASC-${year}-${uid().replaceAll('-', '').slice(0, 6).toUpperCase()}`;
}
function personNameById(id) {
  return state.current?.people?.find(person => person.id === id)?.nome || '';
}
function syncStatusLabel(record) {
  const status = record.syncStatus || (record.syncedAt ? 'synced' : 'local');
  return ({local:'Salvo no aparelho',pending:'Aguardando envio',syncing:'Enviando',synced:'Sincronizado',error:'Falha no envio'})[status] || 'Salvo no aparelho';
}

function recordDisplayTitle(record = state.current) {
  if (!record) return 'Novo boletim';
  if (isOfficialNumber(record.numero)) return record.numero;
  if (record.status === 'Finalizado') return 'Aguardando número oficial';
  return 'Novo boletim';
}

function headerStatusInfo() {
  if (state.current && ['wizard','detail'].includes(state.route)) {
    const status = state.current.syncStatus || 'local';
    const labels = {
      local: 'Salvo no aparelho',
      pending: navigator.onLine ? 'Aguardando envio' : 'Aguardando internet',
      syncing: 'Enviando para a planilha',
      synced: 'Sincronizado com a planilha',
      error: 'Falha no envio'
    };
    return { status, label: labels[status] || 'Salvo no aparelho' };
  }
  if (!apiConfigured()) return { status:'local', label:'Planilha não configurada' };
  if (state.syncState === 'syncing') return { status:'syncing', label:'Sincronizando dados' };
  if (state.syncState === 'error') return { status:'error', label:'Falha de sincronização' };
  if (!navigator.onLine) return { status:'pending', label:'Sem internet' };
  return { status:'synced', label:'Google Sheets conectado' };
}

function meaningfulText(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  const normalized = text.toLocaleLowerCase('pt-BR').replace(/[.!;,]+$/g,'').trim();
  const ignored = new Set(['nada','nenhum','nenhuma','não se aplica','nao se aplica','não houve','nao houve','sem informação','sem informacao','não informado','nao informado']);
  return ignored.has(normalized) ? '' : text;
}

function cleanSentence(value) {
  const text = meaningfulText(value).replace(/\s+/g,' ').trim();
  if (!text) return '';
  return text.replace(/[.!?]+$/,'');
}

function validationIssueFor(key) {
  return state.validationIssues.find(issue => issue.key === key);
}
function isOfficialNumber(numero = '') { return /^BO-\d{4}-\d{6}$/.test(String(numero)); }
function totalAttachmentSize(record = state.current) { return (record?.attachments || []).reduce((sum, file) => sum + Number(file.size || 0), 0); }
function addAudit(record, action, details = '') {
  record.auditTrail ||= [];
  record.auditTrail.push({ id: uid(), at: new Date().toISOString(), action, details });
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



function showBusy(title = 'Aguarde o registro', message = 'Salvando as informações do boletim. Não feche o aplicativo.') {
  busyTitle.textContent = title;
  busyMessage.textContent = message;
  busyOverlay.classList.remove('hidden');
  busyOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('busy-open');
}
function updateBusy(title, message) {
  if (title) busyTitle.textContent = title;
  if (message) busyMessage.textContent = message;
}
function hideBusy() {
  busyOverlay.classList.add('hidden');
  busyOverlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('busy-open');
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

function createBlankRecord() {
  const now = new Date();
  const operator = state.operator || loadOperatorSession() || {};
  const temp = temporaryNumber();
  return {
    schemaVersion: 2,
    id: uid(),
    numero: temp,
    numeroTemporario: temp,
    status: 'Rascunho',
    syncStatus: 'local',
    currentStep: 0,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    finalizedAt: '',
    syncedAt: '',
    acknowledgements: { reviewed: false, truthful: false },
    verification: { people: 'pending', witnesses: 'pending', vehicles: 'pending', materials: 'pending', attachments: 'pending', providencias: 'pending' },
    operator: operatorSnapshot() || {
      usuario: operator.usuario || '',
      registro: operator.registro || '',
      turno: operator.turno || '',
      loginAt: operator.loginAt || new Date().toISOString(),
      accessId: operator.accessId || '',
      dispositivo: operator.dispositivo || ''
    },
    basic: {
      data: localDateInput(now), hora: localTimeInput(now), referencia: '', referenciaOutra: '',
      matriculaEmissor: '', nomeEmissor: '',
      emailEmissor: '', turnoEmissor: '',
      local: '', complementoLocal: '', diretoria: '', diretoriaOutra: ''
    },
    people: [], vehicles: [], materials: [], attachments: [],
    history: {
      identificado: '', inicio: '', presentes: '', providencias: '', acionados: '', desfecho: '', adicional: '',
      relato: '', relatoEditado: false, observacoes: ''
    },
    amendments: [], auditTrail: []
  };
}

async function refreshRecords() {
  const records = (await dbGetAll()).map(normalizeRecord);
  for (const record of records) await dbPut(record);
  state.records = records.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

async function saveCurrent(silent = true, autoSync = true) {
  if (!state.current) return;
  stampOperator(state.current);
  state.current.updatedAt = new Date().toISOString();
  state.current.currentStep = state.currentStep;
  state.current.syncStatus = state.current.syncedAt && state.current.syncedAt >= state.current.updatedAt ? 'synced' : 'pending';
  await dbPut(state.current);
  persistNavigationState();
  await refreshRecords();
  if (!silent) showToast('Rascunho salvo neste dispositivo.');
  if (autoSync && apiConfigured() && navigator.onLine) scheduleAutoSync(state.current.id);
}

function scheduleSave() {
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => saveCurrent(true, false), 180);
}

let autoSyncTimer;
function scheduleAutoSync(recordId) {
  clearTimeout(autoSyncTimer);
  autoSyncTimer = setTimeout(async () => {
    const record = state.records.find(item => item.id === recordId) || (state.current?.id === recordId ? state.current : null);
    if (!record || !navigator.onLine || !apiConfigured()) return;
    await syncRecord(record, false);
    await refreshRecords();
    if (state.current?.id === record.id) state.current = structuredClone(state.records.find(item => item.id === record.id) || record);
    updateHeader();
  }, 1200);
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
  const popular = POPULAR_REFERENCES.map(value => `<option value="${escapeHtml(value)}" ${value === selected ? 'selected' : ''}>${escapeHtml(value)}</option>`).join('');
  const groups = REFERENCE_GROUPS.map(group => {
    const options = group.options.filter(value => !POPULAR_REFERENCES.includes(value)).map(value => `<option value="${escapeHtml(value)}" ${value === selected ? 'selected' : ''}>${escapeHtml(value.replace('Danos materiais — ', ''))}</option>`).join('');
    return `<optgroup label="${escapeHtml(group.label)}">${options}</optgroup>`;
  }).join('');
  return `<option value="">Selecione a referência</option><optgroup label="Mais utilizadas">${popular}</optgroup>${groups}`;
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
      Array.from(child.children).forEach(option => entries.push({ type: 'option', value: option.value, label: option.textContent.trim(), disabled: option.disabled, description: select.id === 'bo-ref' ? REFERENCE_DESCRIPTIONS[option.value] : '' }));
    } else if (child.tagName === 'OPTION') {
      entries.push({ type: 'option', value: child.value, label: child.textContent.trim(), disabled: child.disabled, description: select.id === 'bo-ref' ? REFERENCE_DESCRIPTIONS[child.value] : '' });
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
      <span class="select-option-copy"><strong>${escapeHtml(entry.label)}</strong>${entry.description ? `<small>${escapeHtml(entry.description)}</small>` : ''}</span>${selected ? ICONS.check : ''}
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
  normalized.schemaVersion = Number(normalized.schemaVersion || 3);
  normalized.basic ||= {};
  normalized.people = Array.isArray(normalized.people) ? normalized.people : [];
  normalized.vehicles = Array.isArray(normalized.vehicles) ? normalized.vehicles : [];
  normalized.materials = Array.isArray(normalized.materials) ? normalized.materials : [];
  normalized.attachments = Array.isArray(normalized.attachments) ? normalized.attachments : [];
  normalized.amendments = Array.isArray(normalized.amendments) ? normalized.amendments : [];
  normalized.auditTrail = Array.isArray(normalized.auditTrail) ? normalized.auditTrail : [];
  normalized.operator ||= {};
  normalized.operator = {
    usuario: String(normalized.operator.usuario || ''),
    registro: String(normalized.operator.registro || ''),
    turno: String(normalized.operator.turno || ''),
    loginAt: String(normalized.operator.loginAt || ''),
    accessId: String(normalized.operator.accessId || ''),
    dispositivo: String(normalized.operator.dispositivo || '')
  };

  normalized.history ||= {};
  normalized.history = {
    identificado: normalized.history.identificado || '',
    inicio: normalized.history.inicio || '',
    presentes: normalized.history.presentes || '',
    providencias: normalized.history.providencias || '',
    acionados: normalized.history.acionados || '',
    desfecho: normalized.history.desfecho || '',
    adicional: normalized.history.adicional || '',
    relato: normalized.history.relato || '',
    relatoEditado: normalized.history.relatoEditado === true,
    observacoes: normalized.history.observacoes || ''
  };

  normalized.verification ||= {};
  normalized.verification = {
    people: normalized.verification.people || (normalized.people.length ? 'has' : 'pending'),
    witnesses: normalized.verification.witnesses || (normalized.people.some(p => p.tipo === 'Testemunha') ? 'has' : 'pending'),
    vehicles: normalized.verification.vehicles || (normalized.vehicles.length ? 'has' : 'pending'),
    materials: normalized.verification.materials || (normalized.materials.length ? 'has' : 'pending'),
    attachments: normalized.verification.attachments || (normalized.attachments.length ? 'has' : 'pending'),
    providencias: normalized.verification.providencias || (normalized.history.providencias ? 'has' : 'pending')
  };

  const ack = normalized.acknowledgements || {};
  normalized.acknowledgements = {
    reviewed: ack.reviewed === true || ack.reviewed === 'true' || ack.reviewed === 1,
    truthful: ack.truthful === true || ack.truthful === 'true' || ack.truthful === 1
  };

  normalized.syncStatus ||= normalized.syncedAt ? 'synced' : 'local';
  normalized.numeroTemporario ||= isOfficialNumber(normalized.numero) ? '' : normalized.numero;
  if (normalized.status === 'Finalizado' && !isOfficialNumber(normalized.numero)) {
    normalized.syncStatus = 'pending';
  }
  normalized.basic.turnoEmissor ||= '';
  normalized.basic.referenciaOutra ||= '';
  normalized.basic.diretoriaOutra ||= '';

  normalized.people = normalized.people.map(person => ({ id: person.id || uid(), ...person }));
  normalized.vehicles = normalized.vehicles.map(vehicle => {
    const person = normalized.people.find(p => p.id === vehicle.pessoaId || p.nome === vehicle.pessoaNome);
    return { id: vehicle.id || uid(), ...vehicle, pessoaId: person?.id || vehicle.pessoaId || '', pessoaNome: person?.nome || vehicle.pessoaNome || '' };
  });
  normalized.materials = normalized.materials.map(material => {
    const person = normalized.people.find(p => p.id === material.pessoaId || p.nome === material.pessoaNome);
    return { id: material.id || uid(), ...material, pessoaId: person?.id || material.pessoaId || '', pessoaNome: person?.nome || material.pessoaNome || '' };
  });

  if (normalized.basic.subreferencia) {
    const sub = normalized.basic.subreferencia === 'Outra' ? normalized.basic.subreferenciaOutra : normalized.basic.subreferencia;
    normalized.basic.referencia = sub ? `${normalized.basic.referencia || 'Danos materiais'} — ${sub}` : normalized.basic.referencia;
  }
  delete normalized.basic.subreferencia;
  delete normalized.basic.subreferenciaOutra;
  delete normalized.peopleNone;

  const oldStep = Number(normalized.currentStep || 0);
  if (oldStep > 4) normalized.currentStep = oldStep >= 6 ? 4 : oldStep === 5 ? 2 : 3;
  return normalized;
}

function recordForSync(record) {
  const clean = structuredClone(record);
  clean.attachments = (record.attachments || []).map(file => ({
    id: file.id,
    name: file.name,
    type: file.type,
    size: file.size,
    driveFileId: file.driveFileId || '',
    driveUrl: file.driveUrl || '',
    uploadedAt: file.uploadedAt || '',
    dataUrl: file.driveFileId ? '' : (file.dataUrl || '')
  }));
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
  clearTimeout(autoSyncTimer);
  stampOperator(record);

  if (!record?.operator?.usuario || !record?.operator?.registro || !record?.operator?.turno) {
    record.syncStatus = 'error';
    await dbPut(record);
    if (notify) await openAppModal({ kind:'danger', eyebrow:'Identificação ausente', title:'Faça login novamente', message:'O boletim não pode ser enviado sem os dados do vigilante responsável.', confirmText:'Entendi' });
    return false;
  }
  if (!apiConfigured()) {
    record.syncStatus = 'pending';
    await dbPut(record);
    if (notify) await openAppModal({ kind:'warning', eyebrow:'Banco não configurado', title:'Configure o Google Sheets', message:'Abra as configurações técnicas e teste a conexão antes de sincronizar.', confirmText:'Entendi' });
    return false;
  }

  state.syncState = 'syncing';
  record.syncStatus = 'syncing';
  await dbPut(record);
  updateHeader();

  try {
    const result = await apiPost({ action:'upsert', operator:record.operator, record:recordForSync(record) });
    if (result.version !== REQUIRED_API_VERSION || result.schema !== REQUIRED_API_SCHEMA || result.operatorSaved !== true) {
      throw new Error(`Implantação incompatível. Esperado API ${REQUIRED_API_VERSION} (${REQUIRED_API_SCHEMA}); recebido ${result.version || 'sem versão'} (${result.schema || 'sem esquema'}).`);
    }
    if (result.recordId && result.recordId !== record.id) {
      throw new Error('O servidor devolveu um registro diferente do boletim enviado.');
    }

    if (record.status === 'Finalizado') {
      if (!isOfficialNumber(result.officialNumber)) {
        throw new Error('A planilha não devolveu o número oficial do BO. O registro continuará pendente para evitar uma falsa sincronização.');
      }
      if (result.officialNumber !== record.numero) {
        record.numeroTemporario ||= record.numero;
        record.numero = result.officialNumber;
      }
    } else if (isOfficialNumber(result.officialNumber)) {
      record.numeroTemporario ||= record.numero;
      record.numero = result.officialNumber;
    }

    if (Array.isArray(result.attachments)) {
      const metadata = new Map(result.attachments.map(file => [file.id, file]));
      record.attachments = (record.attachments || []).map(file => ({ ...file, ...(metadata.get(file.id) || {}) }));
    }

    state.syncState = 'online';
    record.syncStatus = 'synced';
    record.syncedAt = new Date().toISOString();
    await dbPut(record);
    if (state.current?.id === record.id) state.current = structuredClone(record);
    if (notify) showToast(`Boletim ${record.numero} sincronizado.`);
    updateHeader();
    return true;
  } catch (error) {
    console.error(error);
    state.syncState = 'error';
    record.syncStatus = 'error';
    await dbPut(record);
    if (state.current?.id === record.id) state.current = structuredClone(record);
    updateHeader();
    if (notify) await openAppModal({ kind:'danger', eyebrow:'Falha de sincronização', title:'Não foi possível confirmar o envio', message:escapeHtml(error.message), details:'O registro permanece salvo no aparelho e não será mostrado como sincronizado até o servidor confirmar o número e o esquema corretos.', confirmText:'Entendi' });
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
    if (payload.version !== REQUIRED_API_VERSION) throw new Error(`API incompatível: ${payload.version || 'sem versão'}.`);
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
    await openAppModal({ kind:'warning', eyebrow:'Endereço inválido', title:'Informe um Apps Script válido', message:'O endereço precisa começar com https://script.google.com/macros/s/ e terminar em /exec.', confirmText:'Corrigir endereço' });
    return;
  }
  state.syncState = 'syncing';
  renderAbout();
  updateHeader();
  try {
    const payload = await apiGet({ action:'ping' });
    if (payload.version !== REQUIRED_API_VERSION || payload.schema !== REQUIRED_API_SCHEMA) {
      throw new Error(`A implantação aberta é ${payload.version || 'desconhecida'} (${payload.schema || 'sem esquema'}). Publique a API ${REQUIRED_API_VERSION} (${REQUIRED_API_SCHEMA}).`);
    }
    state.syncState = 'online';
    renderAbout();
    updateHeader();
    await openAppModal({ kind:'success', eyebrow:'Teste de conexão', title:'Google Sheets conectado', message:`API ${escapeHtml(payload.version)} confirmada. Estrutura compacta até a coluna U validada.`, confirmText:'Concluir teste' });
  } catch (error) {
    state.syncState = 'error';
    renderAbout();
    updateHeader();
    await openAppModal({ kind:'danger', eyebrow:'Teste de conexão', title:'Conexão incompatível', message:escapeHtml(error.message), details:'Atualize a implantação do Apps Script e confirme que o aplicativo usa exatamente o endereço /exec dessa implantação.', confirmText:'Entendi' });
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
    login: ['Acesso do vigilante', 'Identificação operacional'],
    home: ['BO Digital GSP', 'Registro de ocorrências'],
    records: ['Boletins', 'Consulta, rascunhos e finalizados'],
    about: ['Configurações técnicas', 'Google Sheets, sincronização e backup'],
    wizard: [recordDisplayTitle(state.current), `Etapa ${state.currentStep + 1} de ${STEPS.length} • ${STEPS[state.currentStep]}`],
    detail: [recordDisplayTitle(state.current), state.current?.status || 'Detalhes']
  };
  const [title, subtitle] = config[state.route] || config.home;
  document.body.dataset.route = state.route;
  headerTitle.textContent = title;
  headerSubtitle.textContent = subtitle;
  const showBack = ['wizard', 'detail'].includes(state.route);
  backButton.classList.toggle('hidden', !showBack);
  bottomNav.classList.toggle('hidden', ['wizard', 'login'].includes(state.route));
  technicalButton.classList.toggle('hidden', !['home','records'].includes(state.route));
  document.querySelectorAll('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.route === state.route));

  const info = headerStatusInfo();
  headerSync.className = `header-sync ${info.status}`;
  headerSyncLabel.textContent = info.label;
  headerSync.parentElement.title = info.label;
}

async function navigate(route, options = {}) {
  if (route !== 'login' && !state.operator) route = 'login';
  state.previousRoute = state.route;
  state.route = route;
  if (options.record) state.current = options.record;
  if (Number.isInteger(options.step)) state.currentStep = options.step;
  persistNavigationState();
  updateHeader();
  await render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  app.focus({ preventScroll: true });
}

async function render() {
  if (state.route === 'login') renderLogin();
  if (state.route === 'home') renderHome();
  if (state.route === 'records') renderRecords();
  if (state.route === 'about') renderAbout();
  if (state.route === 'wizard') renderWizard();
  if (state.route === 'detail') renderDetail();
}


function renderLogin() {
  const operator = state.operator || { usuario: '', registro: '', turno: '' };
  app.innerHTML = `
    <section class="login-screen">
      <div class="login-card">
        <div class="login-brand-area">
          <div class="stellantis-wordmark" aria-label="Stellantis">STELLANTIS</div>
          <p>SEGURANÇA PATRIMONIAL</p>
        </div>
        <div class="login-intro">
          <p class="eyebrow">Acesso operacional</p>
          <h1>Identificação do vigilante</h1>
          <span>Esses dados identificam quem preencheu o boletim. Os dados do solicitante serão informados separadamente na ocorrência.</span>
        </div>
        <form id="login-form" class="login-form" novalidate>
          <div class="field full">
            <label class="required" for="login-user">Usuário</label>
            <input id="login-user" name="usuario" type="text" value="${escapeHtml(operator.usuario || '')}" placeholder="Nome do vigilante" autocomplete="username" required>
            <span class="field-error" data-login-error="usuario"></span>
          </div>
          <div class="field full">
            <label class="required" for="login-registro">Registro</label>
            <input id="login-registro" name="registro" type="text" inputmode="numeric" pattern="[0-9]*" value="${escapeHtml(operator.registro || '')}" placeholder="Ex.: 76313" required>
            <span class="field-error" data-login-error="registro"></span>
          </div>
          <div class="field full">
            <label class="required" for="login-turno">Turno</label>
            <select id="login-turno" name="turno" required>${selectOptions(['1º turno','2º turno','3º turno','Administrativo'], operator.turno || '', 'Selecione o turno')}</select>
            <span class="field-error" data-login-error="turno"></span>
          </div>
          <button class="button primary login-submit" type="submit">${ICONS.shield} Entrar</button>
        </form>
      </div>
    </section>`;

  modalizeSelects(app);
  const form = app.querySelector('#login-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const operatorData = {
      usuario: String(formData.get('usuario') || '').trim(),
      registro: String(formData.get('registro') || '').trim(),
      turno: String(formData.get('turno') || '').trim(),
      loginAt: new Date().toISOString(),
      accessId: uid(),
      dispositivo: navigator.userAgent || ''
    };
    const errors = [];
    if (!operatorData.usuario) errors.push(['usuario', 'Informe o nome do vigilante.']);
    if (!operatorData.registro) errors.push(['registro', 'Informe o registro do vigilante.']);
    else if (!/^\d+$/.test(operatorData.registro)) errors.push(['registro', 'O registro deve conter somente números.']);
    if (!operatorData.turno) errors.push(['turno', 'Selecione o turno.']);
    form.querySelectorAll('[data-login-error]').forEach(el => { el.textContent = ''; });
    form.querySelectorAll('input, select, .modal-select-button').forEach(el => el.classList.remove('invalid-field'));
    if (errors.length) {
      errors.forEach(([field, message]) => {
        const error = form.querySelector(`[data-login-error="${field}"]`);
        if (error) error.textContent = message;
        const control = form.querySelector(`[name="${field}"]`);
        if (control) {
          control.classList.add('invalid-field');
          control._modalSelectButton?.classList.add('invalid-field');
        }
      });
      await openAppModal({ kind: 'warning', eyebrow: 'Acesso operacional', title: 'Revise os dados do login', message: 'Preencha corretamente usuário, registro e turno para continuar.', confirmText: 'Entendi' });
      return;
    }
    saveOperatorSession(operatorData);
    await migrateOperatorToLocalRecords();
    await navigate('home');
    showToast('Acesso liberado.');
    persistNavigationState();
    registerOperatorAccess(operatorData).then(ok => {
      if (!ok) showToast('Login salvo. O envio à planilha será tentado novamente.');
    });
  });
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
        <div class="operator-summary">
          <span>Vigilante responsável pelo preenchimento</span>
          <strong>${escapeHtml(state.operator?.usuario || 'Não identificado')}</strong>
          <small>Registro ${escapeHtml(state.operator?.registro || '-')} • ${escapeHtml(state.operator?.turno || '-')}</small>
          <small class="operator-sheet-status">${storageGet(PENDING_LOGIN_KEY) ? 'Login aguardando envio à planilha' : 'Login confirmado para sincronização'}</small>
        </div>
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
    <div class="technical-link-wrap home-secondary-actions">
      <button class="technical-link" type="button" data-action="show-bank">${ICONS.gear} Configurações técnicas</button>
      <button class="technical-link" type="button" data-action="logout">${ICONS.logout} Encerrar turno</button>
    </div>
  `;

  bindCommonCards();
}

function recordCard(record) {
  const summary=record.basic?.referencia==='Danos materiais — Outra'?record.basic?.referenciaOutra:(record.basic?.referencia||'Ocorrência ainda não classificada');
  const source=record._source==='remote'?'Planilha':'Aparelho';
  return `<article class="record-card"><div><h3>${escapeHtml(record.numero)}</h3><p>${escapeHtml(summary)}${record.basic?.local?` • ${escapeHtml(record.basic.local)}`:''}</p><div class="entity-meta"><span class="chip status-${record.status.toLowerCase()}">${escapeHtml(record.status)}</span><span class="chip sync-chip sync-${escapeHtml(record.syncStatus||'local')}">${escapeHtml(syncStatusLabel(record))}</span><span class="chip">${source}</span></div></div><div class="record-side"><time>${formatDateTime(record.updatedAt)}</time><button class="button small secondary" type="button" data-open-record="${record.id}">${record.status==='Rascunho'?'Continuar':'Abrir'}</button></div></article>`;
}

function bindCommonCards() {
  app.querySelectorAll('[data-action="new-bo"]').forEach(button => button.addEventListener('click', createNewBo));
  app.querySelectorAll('[data-action="show-records"]').forEach(button => button.addEventListener('click', () => navigate('records')));
  app.querySelectorAll('[data-action="show-bank"]').forEach(button => button.addEventListener('click', () => navigate('about')));
  app.querySelectorAll('[data-action="install-app"]').forEach(button => button.addEventListener('click', handleInstallRequest));
  app.querySelectorAll('[data-action="logout"]').forEach(button => button.addEventListener('click', async () => {
    const confirmed = await openAppModal({
      kind: 'warning', eyebrow: 'Encerrar turno', title: 'Sair do aplicativo?',
      message: 'A identificação atual será encerrada. O próximo vigilante deverá informar usuário, registro e turno.',
      confirmText: 'Encerrar turno', cancelText: 'Cancelar'
    });
    if (!confirmed) return;
    clearOperatorSession();
    await navigate('login');
  }));
  app.querySelectorAll('[data-action="show-drafts"]').forEach(button => button.addEventListener('click', () => {
    state.filter = 'Rascunho';
    navigate('records');
  }));
  app.querySelectorAll('[data-open-record]').forEach(button => button.addEventListener('click', () => openRecord(button.dataset.openRecord)));
}

async function createNewBo() {
  const record = stampOperator(createBlankRecord());
  await dbPut(record);
  await refreshRecords();
  state.current = record;
  state.currentStep = 0;
  navigate('wizard');
}

async function openRecord(id) {
  const record=state.records.find(item=>item.id===id)||state.remoteRecords.find(item=>item.id===id);
  if(!record)return;
  stampOperator(record);
  const normalized=normalizeRecord(record);stampOperator(normalized);await dbPut(normalized);await refreshRecords();state.current=structuredClone(normalized);
  if(normalized.status==='Rascunho'){state.currentStep=Math.min(normalized.currentStep||0,STEPS.length-1);navigate('wizard');}
  else navigate('detail');
}

function renderWizard() {
  const content = [renderBasicStep, renderRelatedStep, renderHistoryStep, renderAttachmentsStep, renderReviewStep][state.currentStep]();
  const progress = ((state.currentStep + 1) / STEPS.length) * 100;
  const issueSummary = state.validationIssues.length
    ? `<div class="validation-summary" role="alert"><span>${ICONS.warning}</span><div><strong>Revise esta etapa</strong><p>${state.validationIssues.map(issue => escapeHtml(issue.message)).join(' • ')}</p></div></div>`
    : '';
  const numberLabel = isOfficialNumber(state.current.numero)
    ? state.current.numero
    : state.current.status === 'Finalizado'
      ? 'Aguardando número oficial'
      : 'Número será gerado ao finalizar';
  app.innerHTML = `
    <div class="step-shell">
      <section class="progress-card">
        <div class="progress-top"><strong>${escapeHtml(STEPS[state.currentStep])}</strong><span>Etapa ${state.currentStep + 1} de ${STEPS.length}</span></div>
        <div class="progress-track"><span style="width:${progress}%"></span></div>
        <div class="step-map" aria-label="Etapas do boletim">
          ${STEPS.map((step, index) => `<button type="button" data-jump-step="${index}" class="step-dot ${index < state.currentStep ? 'done' : index === state.currentStep ? 'active' : ''}">${index + 1}. ${escapeHtml(step)}</button>`).join('')}
        </div>
        <div class="record-sync-line"><span class="sync-state sync-${escapeHtml(state.current.syncStatus || 'local')}"><i></i>${escapeHtml(syncStatusLabel(state.current))}</span><span class="record-number-label">${escapeHtml(numberLabel)}</span></div>
      </section>
      ${issueSummary}
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
  app.querySelectorAll('[data-jump-step]').forEach(button => button.addEventListener('click', async () => {
    const target = Number(button.dataset.jumpStep);
    if (target > state.currentStep && !(await validateStep(state.currentStep))) return;
    state.validationIssues = [];
    await saveCurrent(true,false);
    state.currentStep = target;
    updateHeader(); renderWizard(); window.scrollTo(0, 0);
  }));
}

function renderBasicStep() {
  const b = state.current.basic;
  const referenceOtherVisible = b.referencia === 'Danos materiais — Outra';
  const directorateOtherVisible = b.diretoria === 'Outra';
  const referenceDescription = REFERENCE_DESCRIPTIONS[b.referencia] || '';
  const recents = recentLocations();
  return `
    <section class="form-card">
      <p class="eyebrow">1. Identificação da ocorrência</p>
      <h1>O que aconteceu, quando e onde?</h1>
      <p>Responda aos campos na ordem. Os dados de nome, matrícula, e-mail e turno devem ser do solicitante que comunicou a ocorrência à segurança.</p>
      <div class="form-grid">
        <div class="field"><label class="required" for="bo-date">Data da ocorrência</label><input id="bo-date" type="date" value="${escapeHtml(b.data)}" data-path="basic.data" required><span class="field-error" data-error-for="bo-date"></span></div>
        <div class="field"><label class="required" for="bo-time">Hora da ocorrência</label><input id="bo-time" type="time" value="${escapeHtml(b.hora)}" data-path="basic.hora" required><span class="field-error" data-error-for="bo-time"></span></div>
        <div class="field full">
          <label class="required" for="bo-ref">Referência da ocorrência</label>
          <select id="bo-ref" data-path="basic.referencia" data-rerender="true" required>${referenceSelectOptions(b.referencia)}</select>
          ${referenceDescription ? `<div class="context-help">${ICONS.info}<span>${escapeHtml(referenceDescription)}</span></div>` : '<small>Pesquise na lista pelo assunto principal da ocorrência.</small>'}
        </div>
        ${referenceOtherVisible ? `<div class="field full"><label class="required" for="bo-ref-other">Descreva a referência</label><input id="bo-ref-other" type="text" value="${escapeHtml(b.referenciaOutra)}" data-path="basic.referenciaOutra" placeholder="Ex.: dano em equipamento não classificado" required><span class="field-error" data-error-for="bo-ref-other"></span></div>` : ''}
        <div class="field"><label class="required" for="bo-reg">Matrícula do solicitante</label><input id="bo-reg" type="text" inputmode="numeric" pattern="[0-9]*" value="${escapeHtml(b.matriculaEmissor)}" data-path="basic.matriculaEmissor" placeholder="Ex.: 76313" required><span class="field-error" data-error-for="bo-reg"></span></div>
        <div class="field"><label class="required" for="bo-name">Nome do solicitante</label><input id="bo-name" type="text" value="${escapeHtml(b.nomeEmissor)}" data-path="basic.nomeEmissor" autocomplete="name" placeholder="Nome completo" required><span class="field-error" data-error-for="bo-name"></span></div>
        <div class="field"><label for="bo-email">E-mail do solicitante</label><input id="bo-email" type="email" value="${escapeHtml(b.emailEmissor)}" data-path="basic.emailEmissor" autocomplete="email" placeholder="nome@empresa.com"><span class="field-error" data-error-for="bo-email"></span></div>
        <div class="field"><label for="bo-shift">Turno do solicitante</label><select id="bo-shift" data-path="basic.turnoEmissor">${selectOptions(['1º turno','2º turno','3º turno','Administrativo'], b.turnoEmissor, 'Selecione, se aplicável')}</select></div>
        <div class="field"><label class="required" for="bo-local">Tipo de local</label><select id="bo-local" data-path="basic.local" data-rerender="true" required>${selectOptions(LOCATIONS, b.local)}</select></div>
        <div class="field"><label class="required" for="bo-local-detail">Identificação detalhada do local</label><input id="bo-local-detail" type="text" value="${escapeHtml(b.complementoLocal)}" data-path="basic.complementoLocal" list="recent-locations" placeholder="${escapeHtml(locationHelp(b.local))}" required><datalist id="recent-locations">${recents.map(item => `<option value="${escapeHtml(item)}"></option>`).join('')}</datalist><small>${escapeHtml(locationHelp(b.local))}</small><span class="field-error" data-error-for="bo-local-detail"></span></div>
        <div class="field full"><label class="required" for="bo-directorate">Diretoria relacionada</label><select id="bo-directorate" data-path="basic.diretoria" data-rerender="true" required>${selectOptions(DIRECTORATES, b.diretoria)}</select></div>
        ${directorateOtherVisible ? `<div class="field full"><label class="required" for="bo-directorate-other">Nome da outra diretoria</label><input id="bo-directorate-other" type="text" value="${escapeHtml(b.diretoriaOutra)}" data-path="basic.diretoriaOutra" placeholder="Digite a diretoria relacionada" required><span class="field-error" data-error-for="bo-directorate-other"></span></div>` : ''}
      </div>
    </section>
    <div class="notice warning"><strong>Como funciona:</strong> amarelo indica informação obrigatória pendente. Verde indica campo conferido.</div>`;
}

function verificationChoice(key, label, hasItems, noneLabel) {
  const value = state.current.verification[key] || 'pending';
  const issue = validationIssueFor(key);
  const statusText = value === 'pending' ? 'Aguardando resposta' : 'Conferido';
  return `<div class="verification-control ${value !== 'pending' ? 'verified' : ''} ${issue ? 'verification-invalid' : ''}" data-verification-key="${key}">
    <div class="verification-heading"><span>${escapeHtml(label)}</span><small>${value === 'pending' ? ICONS.warning : ICONS.check} ${statusText}</small></div>
    <div class="segmented-control">
      <button type="button" data-set-verification="${key}:has" class="${value === 'has' ? 'active' : ''}">${hasItems ? 'Dados cadastrados' : 'Vou cadastrar'}</button>
      <button type="button" data-set-verification="${key}:none" class="${value === 'none' ? 'active' : ''}">${escapeHtml(noneLabel)}</button>
    </div>
    ${issue ? `<p class="verification-error">${escapeHtml(issue.message)}</p>` : ''}
  </div>`;
}

function relatedSection(type, config) {
  const items = state.current[type];
  const status = state.current.verification[config.verify];
  return `<section class="related-block ${config.recommended ? 'recommended' : ''}">
    <div class="entity-toolbar">
      <div><p class="eyebrow">${config.recommended ? 'Recomendado para esta referência' : 'Verificação obrigatória'}</p><h2>${config.title}</h2><p>${config.description}</p></div>
      <button class="button primary small" type="button" data-add-entity="${type}">${ICONS.plus} ${config.button}</button>
    </div>
    ${verificationChoice(config.verify, config.question, items.length > 0, config.noneLabel)}
    ${config.verify === 'people' ? verificationChoice('witnesses', 'Existem testemunhas identificadas?', state.current.people.some(p => p.tipo === 'Testemunha'), 'Não há testemunhas') : ''}
    <div class="entity-list">${items.length ? items.map((item,index) => config.render(item,index)).join('') : `<div class="entity-empty">${escapeHtml(config.empty)}</div>`}</div>
  </section>`;
}

function renderRelatedStep() {
  const flow = referenceFlow(state.current.basic.referencia);
  return `<section class="form-card"><p class="eyebrow">2. Elementos relacionados</p><h1>Quem ou o que está ligado à ocorrência?</h1><p>O aplicativo destacou os cadastros mais prováveis para a referência escolhida. Em cada grupo, cadastre os dados ou confirme que não se aplica.</p></section>
  <div class="related-grid">
    ${relatedSection('people',{verify:'people',title:'Pessoas',description:'Solicitantes, envolvidos e testemunhas.',button:'Adicionar pessoa',question:'Há pessoa identificada?',noneLabel:'Não há pessoa identificada',empty:'Nenhuma pessoa cadastrada.',render:renderPersonItem,recommended:true})}
    ${relatedSection('vehicles',{verify:'vehicles',title:'Veículos',description:'Placa, chassi, empresa e pessoa relacionada.',button:'Adicionar veículo',question:'Há veículo relacionado?',noneLabel:'Não há veículo relacionado',empty:'Nenhum veículo cadastrado.',render:renderVehicleItem,recommended:flow.vehicles})}
    ${relatedSection('materials',{verify:'materials',title:'Materiais',description:'Peças, equipamentos, volumes, notas ou vasilhames.',button:'Adicionar material',question:'Há material relacionado?',noneLabel:'Não há material relacionado',empty:'Nenhum material cadastrado.',render:renderMaterialItem,recommended:flow.materials})}
  </div>`;
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
  const flow = referenceFlow(state.current.basic.referencia);
  const size = totalAttachmentSize();
  const status = state.current.verification.attachments;
  return `
    <section class="form-card">
      <p class="eyebrow">4. Evidências</p><h1>Fotos e documentos</h1>
      <p>${flow.attachments ? 'Para esta referência, anexar evidências é recomendado.' : 'Inclua evidências quando elas ajudarem a comprovar ou esclarecer o fato.'} As imagens são reduzidas automaticamente para economizar espaço.</p>
      ${verificationChoice('attachments','Há foto ou documento relacionado?',state.current.attachments.length > 0,'Não há anexo disponível')}
      <div class="attachment-actions">
        <button class="button primary" type="button" data-pick-file="camera">${ICONS.plus} Tirar foto</button>
        <button class="button secondary" type="button" data-pick-file="gallery">Escolher da galeria</button>
        <button class="button secondary" type="button" data-pick-file="document">Selecionar documento</button>
      </div>
      <input id="attachment-camera" class="hidden" type="file" accept="image/*" capture="environment">
      <input id="attachment-gallery" class="hidden" type="file" multiple accept="image/*">
      <input id="attachment-document" class="hidden" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,text/plain">
      <div class="storage-meter"><span>${state.current.attachments.length} arquivo(s)</span><strong>${humanSize(size)} utilizados</strong></div>
      <div class="file-grid">${state.current.attachments.map((file,index)=>renderFileItem(file,index)).join('')}</div>
    </section>
    ${status === 'pending' ? '<div class="notice warning">Adicione uma evidência ou confirme “Não há anexo disponível”.</div>' : ''}`;
}

function renderFileItem(file, index) {
  const preview = file.type?.startsWith('image/') && file.dataUrl
    ? `<img src="${file.dataUrl}" alt="Prévia de ${escapeHtml(file.name)}">`
    : ICONS.file;
  const cloud = file.driveUrl
    ? `<a class="file-cloud-link" href="${escapeHtml(file.driveUrl)}" target="_blank" rel="noopener">Abrir no Drive</a>`
    : `<span class="file-local-state">${file.dataUrl ? 'Aguardando sincronização' : 'Somente metadados'}</span>`;
  return `<article class="file-item"><div class="file-preview">${preview}</div><div class="file-info"><div><strong>${escapeHtml(file.name)}</strong><span>${humanSize(file.size)}</span>${cloud}</div><button class="mini-icon danger" type="button" data-delete-file="${index}" aria-label="Excluir anexo">${ICONS.trash}</button></div></article>`;
}

function buildNarrative(record = state.current) {
  const b = record.basic || {};
  const h = record.history || {};
  const local = [meaningfulText(b.local), meaningfulText(b.complementoLocal)].filter(Boolean).join(' — ');
  const reference = b.referencia === 'Danos materiais — Outra' ? meaningfulText(b.referenciaOutra) : meaningfulText(b.referencia);
  const parts = [];

  parts.push(`Em ${formatDateOnly(b.data)}, às ${b.hora}, no local ${local || 'informado no boletim'}, foi registrada uma ocorrência${reference ? ` classificada como ${reference}` : ''}.`);

  const inicio = cleanSentence(h.inicio);
  const identificado = cleanSentence(h.identificado);
  const presentes = cleanSentence(h.presentes);
  const providencias = cleanSentence(h.providencias);
  const acionados = cleanSentence(h.acionados);
  const desfecho = cleanSentence(h.desfecho);
  const adicional = cleanSentence(h.adicional);

  if (inicio) parts.push(`${inicio}.`);
  if (identificado && identificado.toLocaleLowerCase('pt-BR') !== inicio.toLocaleLowerCase('pt-BR')) parts.push(`Foi constatado: ${identificado}.`);
  if (presentes) parts.push(`Pessoas ou equipes relacionadas: ${presentes}.`);
  if (providencias) parts.push(`Providências adotadas: ${providencias}.`);
  else if (record.verification?.providencias === 'none') parts.push('Não foi necessária providência adicional no momento do registro.');
  if (acionados && !providencias.toLocaleLowerCase('pt-BR').includes(acionados.toLocaleLowerCase('pt-BR'))) parts.push(`Áreas ou responsáveis acionados: ${acionados}.`);
  if (desfecho) parts.push(`A situação foi encerrada da seguinte forma: ${desfecho}.`);
  if (adicional) parts.push(`Informação complementar: ${adicional}.`);

  return parts.join(' ').replace(/\s+/g,' ').replace(/\.\s*\./g,'.').trim();
}

function renderHistoryStep() {
  const h=state.current.history;
  return `<section class="form-card">
    <p class="eyebrow">3. Relato e providências</p><h1>Conte o fato por partes</h1>
    <p>Responda às perguntas curtas. Depois, o aplicativo monta um relato cronológico para você revisar.</p>
    <div class="form-grid">
      <div class="field full"><label class="required" for="history-start">Como a ocorrência começou?</label><textarea id="history-start" data-path="history.inicio" placeholder="Ex.: Durante a ronda, o vigilante foi informado de que..." required>${escapeHtml(h.inicio)}</textarea><span class="field-error" data-error-for="history-start"></span></div>
      <div class="field full"><label class="required" for="history-found">O que foi identificado ou constatado?</label><textarea id="history-found" data-path="history.identificado" placeholder="Descreva o fato principal de forma objetiva." required>${escapeHtml(h.identificado)}</textarea><span class="field-error" data-error-for="history-found"></span></div>
      <div class="field full"><label for="history-people">Quem estava presente ou relacionado?</label><textarea id="history-people" data-path="history.presentes" placeholder="Informe nomes, funções, empresas ou equipes.">${escapeHtml(h.presentes)}</textarea></div>
      <div class="field full"><label for="history-actions">Quais providências foram tomadas?</label><textarea id="history-actions" data-path="history.providencias" placeholder="Ex.: área isolada, gestor acionado, material recolhido...">${escapeHtml(h.providencias)}</textarea></div>
      <div class="field full">${verificationChoice('providencias','Foi necessária alguma providência?',Boolean(h.providencias),'Nenhuma providência necessária')}</div>
      <div class="field full"><label for="history-called">Quem ou qual área foi acionada?</label><textarea id="history-called" data-path="history.acionados" placeholder="Ex.: ambulatório, bombeiros, liderança, manutenção...">${escapeHtml(h.acionados)}</textarea></div>
      <div class="field full"><label class="required" for="history-end">Como a situação terminou?</label><textarea id="history-end" data-path="history.desfecho" placeholder="Informe o desfecho e a condição final do local ou das pessoas." required>${escapeHtml(h.desfecho)}</textarea><span class="field-error" data-error-for="history-end"></span></div>
      <div class="field full"><label for="history-extra">Existe alguma informação adicional?</label><textarea id="history-extra" data-path="history.adicional" placeholder="Registre somente o que ainda não foi informado.">${escapeHtml(h.adicional)}</textarea></div>
    </div>
    <div class="narrative-builder">
      <div><p class="eyebrow">Texto consolidado</p><h2>Relato final</h2><p>Use o botão para gerar ou atualizar o texto. Depois, faça os ajustes necessários.</p></div>
      <button class="button primary" type="button" data-action="generate-narrative">${ICONS.file} Gerar relato</button>
    </div>
    <div class="field"><label class="required" for="history-report">Relato consolidado</label><textarea id="history-report" data-path="history.relato" data-manual-narrative="true" placeholder="O relato será gerado com base nas respostas acima." required>${escapeHtml(h.relato)}</textarea><small>O texto permanece editável. Alterações manuais serão preservadas.</small><span class="field-error" data-error-for="history-report"></span></div>
  </section>`;
}

function reviewChecklist(record=state.current) {
  const b=record.basic, v=record.verification;
  const checks=[
    ['Ocorrência preenchida',Boolean(b.data&&b.hora&&b.referencia&&b.matriculaEmissor&&b.nomeEmissor&&b.local&&b.complementoLocal&&b.diretoria),true],
    ['Pessoas verificadas',v.people!=='pending',true],
    ['Testemunhas verificadas',v.witnesses!=='pending',true],
    ['Veículos verificados',v.vehicles!=='pending',true],
    ['Materiais verificados',v.materials!=='pending',true],
    ['Providências verificadas',v.providencias!=='pending',true],
    ['Relato consolidado',Boolean(record.history.relato?.trim()),true],
    ['Anexos verificados',v.attachments!=='pending',referenceFlow(b.referencia).attachments]
  ];
  return checks.map(([label,ok,required])=>`<div class="checklist-item ${ok?'ok':required?'missing':'optional'}"><span>${ok?ICONS.check:required?ICONS.warning:ICONS.info}</span><div><strong>${escapeHtml(label)}</strong><small>${ok?'Conferido':required?'Pendente antes da finalização':'Opcional para esta referência'}</small></div></div>`).join('');
}

function renderReviewStep() {
  const r=state.current,b=r.basic;
  const reference=b.referencia==='Danos materiais — Outra'?b.referenciaOutra:b.referencia;
  const directorate=b.diretoria==='Outra'?b.diretoriaOutra:b.diretoria;
  return `<section class="form-card"><p class="eyebrow">5. Revisão</p><h1>Confira antes de finalizar</h1><p>As pendências obrigatórias precisam estar resolvidas. Toque em “Editar” para voltar diretamente à seção.</p><div class="review-checklist">${reviewChecklist(r)}</div></section>
  <div class="review-grid">
    ${reviewSection('Dados da ocorrência',0,`<dl class="definition-grid"><div><dt>Número</dt><dd>${escapeHtml(isOfficialNumber(r.numero) ? r.numero : 'Será gerado ao finalizar')}</dd></div><div><dt>Situação</dt><dd>${escapeHtml(syncStatusLabel(r))}</dd></div><div><dt>Data e hora</dt><dd>${formatDateOnly(b.data)} às ${escapeHtml(b.hora)}</dd></div><div><dt>Referência</dt><dd>${escapeHtml(reference||'Não informada')}</dd></div><div><dt>Solicitante</dt><dd>${escapeHtml(b.nomeEmissor)} • ${escapeHtml(b.matriculaEmissor)}</dd></div><div><dt>Local</dt><dd>${escapeHtml(b.local)} — ${escapeHtml(b.complementoLocal)}</dd></div><div><dt>Diretoria</dt><dd>${escapeHtml(directorate||'Não informada')}</dd></div></dl>`)}
    ${reviewSection('Elementos relacionados',1,`<div class="review-mini-grid"><div><strong>Pessoas</strong><span>${r.people.length||'Nenhuma'} • ${escapeHtml(r.verification.people)}</span></div><div><strong>Veículos</strong><span>${r.vehicles.length||'Nenhum'} • ${escapeHtml(r.verification.vehicles)}</span></div><div><strong>Materiais</strong><span>${r.materials.length||'Nenhum'} • ${escapeHtml(r.verification.materials)}</span></div></div>${r.people.length?`<div class="entity-list">${r.people.map(renderPersonItemReview).join('')}</div>`:''}`)}
    ${reviewSection('Relato e providências',2,`<dl class="definition-grid"><div style="grid-column:1/-1"><dt>Relato</dt><dd>${escapeHtml(r.history.relato||'Não informado')}</dd></div><div style="grid-column:1/-1"><dt>Providências</dt><dd>${escapeHtml(r.history.providencias||'Nenhuma providência informada')}</dd></div></dl>`)}
    ${reviewSection(`Evidências (${r.attachments.length})`,3,r.attachments.length?`<div class="entity-meta">${r.attachments.map(file=>`<span class="chip">${escapeHtml(file.name)}</span>`).join('')}</div>`:`<div class="entity-empty">${r.verification.attachments==='none'?'Foi confirmado que não há anexos.':'Anexos ainda não verificados.'}</div>`)}
  </div>
  <section class="form-card"><p class="eyebrow">Confirmações obrigatórias</p><h2>Responsabilidade pelo registro</h2><div class="confirmation-stack">
    <label class="checkbox-card ${r.acknowledgements.reviewed?'checked':'required-unchecked'}"><input id="ack-reviewed" type="checkbox" data-path="acknowledgements.reviewed" required ${r.acknowledgements.reviewed?'checked':''}><span><strong>Revisei todas as informações</strong><span>Conferi dados, pessoas, veículos, materiais, evidências e relato.</span></span></label>
    <label class="checkbox-card ${r.acknowledgements.truthful?'checked':'required-unchecked'}"><input id="ack-truthful" type="checkbox" data-path="acknowledgements.truthful" required ${r.acknowledgements.truthful?'checked':''}><span><strong>As informações correspondem aos fatos disponíveis</strong><span>Confirmo o conteúdo conforme o registro realizado.</span></span></label>
  </div></section>
  <div class="notice warning"><strong>Número oficial:</strong> se o registro ainda estiver com prefixo RASC, o Google Sheets atribuirá o número BO oficial durante a sincronização.</div>`;
}

function reviewSection(title, step, body) {
  return `<section class="review-section"><div class="review-head"><h3>${title}</h3><button class="button small secondary" type="button" data-review-edit="${step}">Editar</button></div><div class="review-body">${body}</div></section>`;
}
function renderPersonItemReview(p) { return `<div><strong>${escapeHtml(p.nome)}</strong><div class="entity-meta"><span class="chip">${escapeHtml(p.tipo)}</span><span class="chip">${escapeHtml(p.vinculo)}</span></div></div>`; }
function renderVehicleItemReview(v) { return `<div><strong>${escapeHtml(v.placa)}</strong><div class="entity-meta"><span class="chip">${escapeHtml([v.marca,v.modelo].filter(Boolean).join(' ')||'Sem modelo')}</span>${v.pessoaId?`<span class="chip">Ligado a ${escapeHtml(personNameById(v.pessoaId)||v.pessoaNome||'pessoa')}</span>`:''}</div></div>`; }
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



function commitVisibleControls(root = app) {
  root.querySelectorAll('[data-path]').forEach(control => {
    let value = control.type === 'checkbox' ? Boolean(control.checked) : control.value;
    if (control.id === 'bo-reg') {
      value = String(value).replace(/\D/g,'');
      control.value = value;
    }
    setPath(state.current, control.dataset.path, value);
    if (control.dataset.manualNarrative === 'true') state.current.history.relatoEditado = true;
  });
}

function bindWizardInputs() {
  app.querySelectorAll('[data-path]').forEach(control => {
    const update = () => {
      state.validationIssues = [];
      let value = control.type === 'checkbox' ? Boolean(control.checked) : control.value;
      if (control.id === 'bo-reg') {
        value = String(value).replace(/\D/g,'');
        control.value = value;
      }
      setPath(state.current, control.dataset.path, value);
      if (control.dataset.path === 'basic.referencia' && value !== 'Danos materiais — Outra') state.current.basic.referenciaOutra = '';
      if (control.dataset.path === 'basic.diretoria' && value !== 'Outra') state.current.basic.diretoriaOutra = '';
      if (control.dataset.manualNarrative === 'true') state.current.history.relatoEditado = true;
      clearFieldError(control.id);
      refreshRequiredFieldStates(app);
      scheduleSave();
      if (control.type === 'checkbox') saveCurrent(true,false);
      if (control.dataset.rerender === 'true') renderWizard();
    };

    if (control.type === 'checkbox') {
      control.addEventListener('input', update);
      control.addEventListener('change', update);
    } else if (control.tagName === 'SELECT' || ['date','time'].includes(control.type)) {
      control.addEventListener('change', update);
    } else {
      control.addEventListener('input', update);
      control.addEventListener('change', update);
    }
  });
  modalizeSelects(app);
  refreshRequiredFieldStates(app);
}

function bindStepSpecific() {
  app.querySelectorAll('[data-add-entity]').forEach(button => button.addEventListener('click',()=>openEntityDialog(button.dataset.addEntity)));
  app.querySelectorAll('[data-edit-entity]').forEach(button => button.addEventListener('click',()=>openEntityDialog(button.dataset.editEntity,Number(button.dataset.index))));
  app.querySelectorAll('[data-set-verification]').forEach(button => button.addEventListener('click',async()=>{
    const [key,value]=button.dataset.setVerification.split(':');
    state.validationIssues = state.validationIssues.filter(issue => issue.key !== key);
    const collection={people:'people',vehicles:'vehicles',materials:'materials',attachments:'attachments'}[key];
    if (value==='none' && collection && state.current[collection]?.length) {
      const ok=await openAppModal({kind:'warning',eyebrow:'Dados já cadastrados',title:'Confirmar que não se aplica?',message:`Existem ${state.current[collection].length} item(ns) cadastrados. Para marcar “não se aplica”, esses dados precisam ser removidos.`,confirmText:'Remover dados e confirmar',cancelText:'Manter dados'});
      if(!ok)return;
      state.current[collection]=[];
    }
    if(key==='witnesses'&&value==='none'&&state.current.people.some(p=>p.tipo==='Testemunha')){
      const ok=await openAppModal({kind:'warning',eyebrow:'Testemunha cadastrada',title:'Remover testemunhas?',message:'Há testemunhas cadastradas. Elas serão removidas para confirmar que não há testemunhas identificadas.',confirmText:'Remover testemunhas',cancelText:'Manter cadastros'});
      if(!ok)return;
      state.current.people=state.current.people.filter(p=>p.tipo!=='Testemunha');
    }
    state.current.verification[key] = value;
    if (key === 'people' && value === 'none') state.current.verification.witnesses = 'none';
    if (key === 'people' && value === 'has' && state.current.verification.witnesses === 'none' && state.current.people.some(p => p.tipo === 'Testemunha')) state.current.verification.witnesses = 'has';
    await saveCurrent(true, false);
    renderWizard();
  }));
  app.querySelectorAll('[data-delete-entity]').forEach(button=>button.addEventListener('click',async()=>{
    const type=button.dataset.deleteEntity,index=Number(button.dataset.index);
    const labels={people:'esta pessoa',vehicles:'este veículo',materials:'este material'};
    const confirmed=await openAppModal({kind:'warning',eyebrow:'Exclusão de cadastro',title:`Excluir ${labels[type]}?`,message:'O item será removido do boletim.',confirmText:'Excluir item',cancelText:'Manter cadastro'});
    if(!confirmed)return;
    const removed=state.current[type][index];
    state.current[type].splice(index,1);
    if(type==='people'){
      state.current.vehicles.forEach(v=>{if(v.pessoaId===removed.id){v.pessoaId='';v.pessoaNome='';}});
      state.current.materials.forEach(m=>{if(m.pessoaId===removed.id){m.pessoaId='';m.pessoaNome='';}});
      if(!state.current.people.some(p=>p.tipo==='Testemunha')) state.current.verification.witnesses='pending';
    }
    if(!state.current[type].length) state.current.verification[{people:'people',vehicles:'vehicles',materials:'materials'}[type]]='pending';
    await saveCurrent(true); renderWizard(); showToast('Cadastro excluído.');
  }));
  app.querySelectorAll('[data-review-edit]').forEach(button=>button.addEventListener('click',()=>{state.currentStep=Number(button.dataset.reviewEdit);renderWizard();updateHeader();window.scrollTo(0,0);}));
  app.querySelectorAll('[data-pick-file]').forEach(button=>button.addEventListener('click',()=>app.querySelector(`#attachment-${button.dataset.pickFile}`)?.click()));
  ['camera','gallery','document'].forEach(kind=>{const input=app.querySelector(`#attachment-${kind}`);if(input)input.addEventListener('change',handleAttachments);});
  app.querySelectorAll('[data-delete-file]').forEach(button=>button.addEventListener('click',async()=>{
    const confirmed=await openAppModal({kind:'warning',eyebrow:'Remoção de anexo',title:'Excluir este arquivo?',message:'O arquivo será removido do aparelho.',confirmText:'Excluir arquivo',cancelText:'Cancelar'});
    if(!confirmed)return;
    state.current.attachments.splice(Number(button.dataset.deleteFile),1);
    if(!state.current.attachments.length)state.current.verification.attachments='pending';
    await saveCurrent(true);renderWizard();
  }));
  const generate=app.querySelector('[data-action="generate-narrative"]');
  if(generate)generate.addEventListener('click',async()=>{
    const generated=buildNarrative(state.current);
    if(state.current.history.relatoEditado&&state.current.history.relato.trim()){
      const ok=await openAppModal({kind:'warning',eyebrow:'Texto editado manualmente',title:'Substituir o relato atual?',message:'O relato possui alterações manuais. Gerar novamente substituirá o texto consolidado.',confirmText:'Gerar novamente',cancelText:'Manter texto atual'});
      if(!ok)return;
    }
    state.current.history.relato=generated;state.current.history.relatoEditado=false;
    await saveCurrent(true);renderWizard();showToast('Relato consolidado gerado.');
  });
}

async function compressImageFile(file) {
  const dataUrl=await fileToDataUrl(file);
  const image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=dataUrl;});
  const max=1600,scale=Math.min(1,max/Math.max(image.width,image.height));
  const canvas=document.createElement('canvas');canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);
  canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
  const compressed=canvas.toDataURL('image/jpeg',0.78);
  const size=Math.round((compressed.length-compressed.indexOf(',')-1)*0.75);
  return {dataUrl:compressed,size,type:'image/jpeg',name:file.name.replace(/\.[^.]+$/,'.jpg')};
}

async function handleAttachments(event) {
  const files=Array.from(event.target.files||[]);
  for(const file of files){
    let prepared;
    try{prepared=file.type.startsWith('image/')?await compressImageFile(file):{dataUrl:await fileToDataUrl(file),size:file.size,type:file.type,name:file.name};}
    catch{await openAppModal({kind:'danger',eyebrow:'Falha no arquivo',title:'Não foi possível processar o anexo',message:escapeHtml(file.name),confirmText:'Entendi'});continue;}
    if(prepared.size>5*1024*1024){await openAppModal({kind:'warning',eyebrow:'Arquivo não adicionado',title:'Anexo maior que 5 MB',message:`<strong>${escapeHtml(prepared.name)}</strong> ultrapassa o limite.`,confirmText:'Entendi'});continue;}
    if(totalAttachmentSize()+prepared.size>15*1024*1024){await openAppModal({kind:'warning',eyebrow:'Limite do aparelho',title:'O boletim atingiu 15 MB de anexos',message:'Exclua um arquivo antes de adicionar outro.',confirmText:'Entendi'});break;}
    state.current.attachments.push({id:uid(),...prepared});
  }
  if(state.current.attachments.length)state.current.verification.attachments='has';
  await saveCurrent(true);if(state.route==='detail')renderDetail();else renderWizard();
}

function fileToDataUrl(file) {
  return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file);});
}

async function handleStepAction(action) {
  commitVisibleControls(app);

  if (action === 'save') {
    await saveCurrent(true);
    const synced = apiConfigured() ? await syncRecord(state.current, false) : false;
    await openAppModal({
      kind:synced ? 'success' : 'info',
      eyebrow:'Rascunho protegido',
      title:'Boletim salvo',
      message:synced ? 'O rascunho foi salvo no aparelho e confirmado pelo Google Sheets.' : 'O rascunho foi salvo no aparelho. O envio para a planilha permanece pendente.',
      confirmText:'Continuar preenchendo'
    });
    return;
  }

  if (action === 'exit') {
    const decision = await openAppModal({
      kind:'warning', eyebrow:'Saída do preenchimento', title:'Salvar o rascunho e sair?',
      message:'As informações preenchidas serão mantidas neste aparelho e poderão ser continuadas depois.',
      details:`<ul><li>Número: <strong>${escapeHtml(state.current.numero)}</strong></li><li>Etapa: <strong>${escapeHtml(STEPS[state.currentStep])}</strong></li></ul>`,
      confirmText:'Salvar e sair', cancelText:'Continuar no boletim', tertiaryText:'Excluir rascunho', tertiaryValue:'cancel-draft'
    });
    if (decision === false) return;
    if (decision === 'cancel-draft') {
      const confirmed = await openAppModal({ kind:'danger', eyebrow:'Exclusão permanente', title:'Excluir este rascunho?', message:'Os dados deste boletim serão apagados do aparelho.', confirmText:'Excluir rascunho', cancelText:'Manter rascunho' });
      if (!confirmed) return;
      await dbDelete(state.current.id);
      state.current = null;
      clearNavigationState();
      await refreshRecords();
      await navigate('home');
      return;
    }
    await saveCurrent(true);
    await navigate('home');
    return;
  }

  if (action === 'previous') {
    await saveCurrent(true,false);
    state.currentStep = Math.max(0,state.currentStep-1);
    updateHeader();
    renderWizard();
    window.scrollTo(0,0);
    return;
  }

  if (action === 'next') {
    if (!(await validateStep(state.currentStep))) return;
    await saveCurrent(true,false);
    state.currentStep = Math.min(STEPS.length-1,state.currentStep+1);
    updateHeader();
    renderWizard();
    window.scrollTo(0,0);
    return;
  }

  if (action === 'finalize') {
    commitVisibleControls(app);
    await saveCurrent(true,false);
    if (!(await validateAll())) return;
    const confirmed = await openAppModal({
      kind:'warning', eyebrow:'Finalização do boletim', title:`Finalizar ${escapeHtml(state.current.numero)}?`,
      message:'O registro será salvo no aparelho e enviado para o Google Sheets. A conclusão só será considerada sincronizada após receber um número oficial BO.',
      details:'<ul><li>Confira relato e providências.</li><li>Confirme pessoas, veículos, materiais e anexos.</li><li>Não feche o aplicativo durante o envio.</li></ul>',
      confirmText:'Finalizar boletim', cancelText:'Voltar para revisão'
    });
    if (!confirmed) return;

    showBusy('Aguarde o registro','Salvando o boletim no aparelho.');
    let synced = false;
    try {
      state.current.status = 'Finalizado';
      state.current.finalizedAt = new Date().toISOString();
      state.current.currentStep = STEPS.length-1;
      state.current.syncStatus = 'pending';
      addAudit(state.current,'FINALIZAR BOLETIM','Registro finalizado pelo vigilante responsável.');
      await saveCurrent(true,false);

      if (apiConfigured() && navigator.onLine) {
        updateBusy('Aguarde o registro','Enviando os dados e solicitando o número oficial do BO.');
        synced = await syncRecord(state.current,false);
      }
      await refreshRecords();
      const updated = state.records.find(item => item.id === state.current.id);
      if (updated) state.current = structuredClone(updated);
      await navigate('detail');
    } finally {
      hideBusy();
    }

    const official = isOfficialNumber(state.current.numero);
    await openAppModal({
      kind:synced && official ? 'success' : 'warning',
      eyebrow:synced && official ? 'Registro concluído' : 'Registro salvo no aparelho',
      title:synced && official ? 'Boletim finalizado com sucesso' : 'Sincronização ainda pendente',
      message:synced && official ? 'O Google Sheets confirmou o registro e devolveu o número oficial.' : 'O boletim está protegido no aparelho, mas ainda não recebeu confirmação completa da planilha.',
      details:`<strong>Número atual:</strong> ${escapeHtml(state.current.numero)}${official ? '' : '<br><small>O sistema tentará novamente quando a conexão e a API correta estiverem disponíveis.</small>'}`,
      confirmText:'Abrir boletim'
    });
  }
}

function clearFieldError(id) {
  if (!id) return;
  const control = document.getElementById(id);
  control?.classList.remove('invalid-field');
  control?._modalSelectButton?.classList.remove('invalid-field');
  const error = document.querySelector(`[data-error-for="${id}"]`);
  if (error) error.textContent = '';
}

function markFieldError(id, message) {
  const control = document.getElementById(id);
  if (control) {
    control.classList.add('invalid-field');
    control._modalSelectButton?.classList.add('invalid-field');
  }
  const error = document.querySelector(`[data-error-for="${id}"]`);
  if (error) error.textContent = message;
}

async function showValidation(errors, step = state.currentStep) {
  state.validationIssues = errors;
  if (step !== state.currentStep) {
    state.currentStep = step;
    updateHeader();
  }
  renderWizard();
  await new Promise(resolve => requestAnimationFrame(resolve));
  errors.forEach(issue => { if (issue.id) markFieldError(issue.id, issue.message); });
  const firstIssue = errors[0];
  const first = firstIssue?.id ? document.getElementById(firstIssue.id) : null;
  const verification = firstIssue?.key ? document.querySelector(`[data-verification-key="${firstIssue.key}"]`) : null;
  const target = first?._modalSelectButton || first || verification || document.querySelector('.validation-summary');
  target?.scrollIntoView({ behavior:'smooth', block:'center' });
  target?.focus?.({ preventScroll:true });
}

function dateTimeInFuture(date, time) {
  if (!date || !time) return false;
  return new Date(`${date}T${time}:00`).getTime() > Date.now() + 60000;
}

function collectStepIssues(step, record = state.current) {
  const issues = [];
  const add = (id, message, title='Preenchimento incompleto', key='') => issues.push({ step, id, message, title, key });

  if (step === 0) {
    const b = record.basic;
    if (!b.data) add('bo-date','Informe a data da ocorrência.');
    if (!b.hora) add('bo-time','Informe a hora da ocorrência.');
    if (b.data && b.hora && dateTimeInFuture(b.data,b.hora)) add('bo-time','A data e a hora não podem estar no futuro.');
    if (!b.referencia) add('bo-ref','Selecione a referência da ocorrência.');
    if (b.referencia === 'Danos materiais — Outra' && !String(b.referenciaOutra || '').trim()) add('bo-ref-other','Descreva a referência não listada.');
    if (!/^\d+$/.test(b.matriculaEmissor || '')) add('bo-reg','A matrícula do solicitante deve conter somente números.');
    if (!String(b.nomeEmissor || '').trim()) add('bo-name','Informe o nome completo do solicitante.');
    if (b.emailEmissor && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.emailEmissor)) add('bo-email','Informe um e-mail válido.');
    if (!b.local) add('bo-local','Selecione o tipo de local.');
    if (!String(b.complementoLocal || '').trim()) add('bo-local-detail','Identifique o local com detalhes.');
    if (!b.diretoria) add('bo-directorate','Selecione a diretoria relacionada.');
    if (b.diretoria === 'Outra' && !String(b.diretoriaOutra || '').trim()) add('bo-directorate-other','Informe o nome da diretoria.');
  }

  if (step === 1) {
    const v = record.verification;
    if (v.people === 'pending') add('', 'Confirme se há pessoa identificada.','Verificação incompleta','people');
    if (v.witnesses === 'pending') add('', 'Confirme se existem testemunhas identificadas.','Verificação incompleta','witnesses');
    if (v.vehicles === 'pending') add('', 'Confirme se há veículo relacionado.','Verificação incompleta','vehicles');
    if (v.materials === 'pending') add('', 'Confirme se há material relacionado.','Verificação incompleta','materials');
    if (v.people === 'has' && !record.people.length) add('', 'Você marcou que há pessoa identificada, mas nenhum cadastro foi incluído.','Pessoa não cadastrada','people');
    if (v.vehicles === 'has' && !record.vehicles.length) add('', 'Você marcou que há veículo relacionado, mas nenhum cadastro foi incluído.','Veículo não cadastrado','vehicles');
    if (v.materials === 'has' && !record.materials.length) add('', 'Você marcou que há material relacionado, mas nenhum cadastro foi incluído.','Material não cadastrado','materials');
    if (v.witnesses === 'has' && !record.people.some(p => p.tipo === 'Testemunha')) add('', 'Você marcou que há testemunhas, mas nenhuma pessoa foi cadastrada como testemunha.','Testemunha não cadastrada','witnesses');
    if (v.people === 'none' && record.people.length) add('', 'Existem pessoas cadastradas, mas foi marcado “não há pessoa identificada”.','Informação contraditória','people');
    if (v.witnesses === 'none' && record.people.some(p => p.tipo === 'Testemunha')) add('', 'Existe testemunha cadastrada, mas foi marcado “não há testemunhas”.','Informação contraditória','witnesses');
  }

  if (step === 2) {
    const h = record.history;
    if (!String(h.inicio || '').trim()) add('history-start','Explique como a ocorrência começou.');
    if (!String(h.identificado || '').trim()) add('history-found','Informe o que foi identificado.');
    if (!String(h.desfecho || '').trim()) add('history-end','Informe como a situação terminou.');
    if (record.verification.providencias === 'pending') add('history-actions','Confirme se houve providência.');
    if (record.verification.providencias === 'has' && !String(h.providencias || '').trim()) add('history-actions','Descreva as providências adotadas.');
    if (!String(h.relato || '').trim()) add('history-report','Gere ou escreva o relato consolidado.');
  }

  if (step === 3) {
    if (record.verification.attachments === 'pending') add('', 'Informe se existem fotos ou documentos.','Evidências não verificadas','attachments');
    if (record.verification.attachments === 'has' && !record.attachments.length) add('', 'Você marcou que há evidência, mas nenhum arquivo foi adicionado.','Anexo não incluído','attachments');
  }

  if (step === 4) {
    if (!record.acknowledgements.reviewed) add('ack-reviewed','Marque que revisou todas as informações.','Confirmações obrigatórias');
    if (!record.acknowledgements.truthful) add('ack-truthful','Marque que as informações correspondem aos fatos disponíveis.','Confirmações obrigatórias');
  }
  return issues;
}

async function validateStep(step) {
  commitVisibleControls(app);
  const issues = collectStepIssues(step);
  if (!issues.length) {
    state.validationIssues = [];
    if (step === 0) rememberLocation(state.current.basic.complementoLocal);
    return true;
  }
  await showValidation(issues, step);
  return false;
}

async function validateAll() {
  commitVisibleControls(app);
  for (let step=0; step<STEPS.length; step+=1) {
    const issues = collectStepIssues(step);
    if (issues.length) {
      await showValidation(issues, step);
      return false;
    }
  }
  return true;
}

function openEntityDialog(type, index = null) {
  state.dialog = { type, index };
  const editing = index !== null;
  const data = editing ? structuredClone(state.current[type][index]) : {};
  const configs = {
    people: ['Pessoa', personForm],
    vehicles: ['Veículo', vehicleForm],
    materials: ['Material', materialForm],
    amendments: ['Complemento', amendmentForm]
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
  const vinculo=p.vinculo||'Stellantis';
  return `<div class="form-grid">
    <div class="field"><label class="required" for="person-type">Tipo de pessoa</label><select id="person-type" name="tipo" required>${selectOptions(['Solicitante','Envolvido','Testemunha'],p.tipo||'Solicitante')}</select></div>
    <div class="field"><label class="required" for="person-link">Vínculo</label><select id="person-link" name="vinculo" required>${selectOptions(['Stellantis','Terceirizada','Sem vínculo'],vinculo)}</select></div>
    <div class="field full"><label class="required" for="person-name">Nome completo</label><input id="person-name" name="nome" value="${escapeHtml(p.nome||'')}" autocomplete="name" required></div>
    <div class="field company-field"><label for="person-company">Empresa</label><input id="person-company" name="empresa" value="${escapeHtml(p.empresa||'')}" placeholder="Nome da empresa terceirizada"></div>
    <div class="field registration-field"><label for="person-reg">Matrícula</label><input id="person-reg" name="matricula" inputmode="numeric" value="${escapeHtml(p.matricula||'')}" placeholder="Somente números"></div>
    <div class="field corporate-field"><label for="person-sector">Setor / área</label><input id="person-sector" name="setor" value="${escapeHtml(p.setor||'')}" placeholder="Setor ou área de atuação"></div>
    <div class="field"><label for="person-phone">Telefone para contato</label><input id="person-phone" name="telefone" value="${escapeHtml(p.telefone||'')}" inputmode="tel" placeholder="(31) 99999-9999"></div>
    <div class="field external-field"><label for="person-doc-type">Tipo de documento</label><select id="person-doc-type" name="tipoDocumento">${selectOptions(['Carteira de identidade','Carteira Nacional de Habilitação (CNH)','Passaporte','Outro'],p.tipoDocumento||'')}</select></div>
    <div class="field external-field"><label for="person-doc-number">Número do documento</label><input id="person-doc-number" name="numeroDocumento" value="${escapeHtml(p.numeroDocumento||'')}"></div>
    <div class="field full external-field"><label for="person-details">Dados complementares</label><textarea id="person-details" name="dadosComplementares" placeholder="Endereço, cargo, validade da CNH ou outra informação útil.">${escapeHtml(p.dadosComplementares||'')}</textarea></div>
    <div class="field full"><label for="person-notes">Observações</label><textarea id="person-notes" name="observacao">${escapeHtml(p.observacao||'')}</textarea></div>
  </div>`;
}

function vehicleForm(v) {
  return `<div class="form-grid">
    <div class="field full"><label class="required" for="vehicle-id">Placa ou chassi</label><input id="vehicle-id" name="placa" value="${escapeHtml(v.placa||'')}" required placeholder="Ex.: ABC1D23 ou chassi com 17 caracteres" autocapitalize="characters"></div>
    <div class="field"><label for="vehicle-brand">Marca</label><input id="vehicle-brand" name="marca" value="${escapeHtml(v.marca||'')}"></div>
    <div class="field"><label for="vehicle-model">Modelo</label><input id="vehicle-model" name="modelo" value="${escapeHtml(v.modelo||'')}"></div>
    <div class="field"><label for="vehicle-company">Empresa do veículo</label><input id="vehicle-company" name="empresa" value="${escapeHtml(v.empresa||'')}"></div>
    <div class="field"><label for="vehicle-person">Pessoa relacionada</label><select id="vehicle-person" name="pessoaId"><option value="">Ligado diretamente ao BO</option>${state.current.people.map(person=>`<option value="${escapeHtml(person.id)}" ${v.pessoaId===person.id?'selected':''}>${escapeHtml(person.nome)}</option>`).join('')}</select></div>
    <div class="field full"><label for="vehicle-notes">Observações</label><textarea id="vehicle-notes" name="observacao">${escapeHtml(v.observacao||'')}</textarea></div>
  </div>`;
}

function materialForm(m) {
  return `<div class="form-grid">
    <div class="field full"><label class="required" for="material-name">Denominação</label><input id="material-name" name="denominacao" value="${escapeHtml(m.denominacao||'')}" required placeholder="Nome do material, peça ou equipamento"></div>
    <div class="field"><label for="material-mvm">MVM / Nota fiscal</label><input id="material-mvm" name="mvm" value="${escapeHtml(m.mvm||'')}"></div>
    <div class="field"><label for="material-supplier">Fornecedor</label><input id="material-supplier" name="fornecedor" value="${escapeHtml(m.fornecedor||'')}"></div>
    <div class="field"><label for="material-drawing">Desenho</label><input id="material-drawing" name="desenho" value="${escapeHtml(m.desenho||'')}"></div>
    <div class="field"><label for="material-container">Código do vasilhame</label><input id="material-container" name="codigoVasilhame" value="${escapeHtml(m.codigoVasilhame||'')}"></div>
    <div class="field"><label class="required" for="material-quantity">Quantidade</label><input id="material-quantity" type="number" min="0.01" step="0.01" name="quantidade" value="${escapeHtml(m.quantidade||'')}" required></div>
    <div class="field"><label class="required" for="material-unit">Unidade</label><input id="material-unit" name="unidade" value="${escapeHtml(m.unidade||'')}" placeholder="un, kg, cx..." required></div>
    <div class="field full"><label for="material-person">Pessoa relacionada</label><select id="material-person" name="pessoaId"><option value="">Ligado diretamente ao BO</option>${state.current.people.map(person=>`<option value="${escapeHtml(person.id)}" ${m.pessoaId===person.id?'selected':''}>${escapeHtml(person.nome)}</option>`).join('')}</select></div>
    <div class="field full"><label for="material-notes">Observações</label><textarea id="material-notes" name="observacao">${escapeHtml(m.observacao||'')}</textarea></div>
  </div>`;
}

function amendmentForm(a) {
  const operator=state.operator||loadOperatorSession()||{};
  return `<div class="form-grid"><div class="field"><label class="required" for="amendment-type">Tipo de registro</label><select id="amendment-type" name="tipo" required>${selectOptions(['Complemento','Retificação'],a.tipo||'Complemento')}</select></div><div class="field"><label class="required" for="amendment-author">Responsável</label><input id="amendment-author" name="responsavel" value="${escapeHtml(a.responsavel||[operator.usuario,operator.registro].filter(Boolean).join(' / '))}" required></div><div class="field full"><label class="required" for="amendment-text">Descrição</label><textarea id="amendment-text" name="texto" placeholder="Descreva claramente a informação acrescentada ou corrigida, sem apagar o registro original." required>${escapeHtml(a.texto||'')}</textarea></div></div>`;
}

function bindDialogDynamic(type) {
  if(type==='people'){
    const select=dialogBody.querySelector('#person-link');
    const update=()=>{
      const value=select.value;
      const external=value==='Sem vínculo',third=value==='Terceirizada',stellantis=value==='Stellantis';
      dialogBody.querySelectorAll('.external-field').forEach(el=>el.classList.toggle('hidden',!external));
      dialogBody.querySelectorAll('.corporate-field').forEach(el=>el.classList.toggle('hidden',external));
      dialogBody.querySelectorAll('.company-field').forEach(el=>el.classList.toggle('hidden',!third));
      const company=dialogBody.querySelector('#person-company'),reg=dialogBody.querySelector('#person-reg'),docType=dialogBody.querySelector('#person-doc-type'),doc=dialogBody.querySelector('#person-doc-number');
      company.required=third;reg.required=stellantis;docType.required=external;doc.required=external;
      if(stellantis&&!company.value)company.value='Stellantis';
      refreshRequiredFieldStates(dialogBody);
    };
    select.addEventListener('change',update);update();
    const phone=dialogBody.querySelector('#person-phone');phone?.addEventListener('input',()=>{let n=phone.value.replace(/\D/g,'').slice(0,11);phone.value=n.length>10?`(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`:n.length>6?`(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`:n;});
    const reg=dialogBody.querySelector('#person-reg');reg?.addEventListener('input',()=>reg.value=reg.value.replace(/\D/g,''));
  }
  if(type==='vehicles'){
    const input=dialogBody.querySelector('#vehicle-id');input?.addEventListener('input',()=>input.value=input.value.toUpperCase().replace(/[^A-Z0-9-]/g,''));
  }
}

async function saveDialogEntity(event) {
  event.preventDefault();refreshRequiredFieldStates(dialogBody);
  const missing=Array.from(dialogBody.querySelectorAll('[required]')).find(control=>!String(control.value||'').trim());
  if(missing){(missing._modalSelectButton||missing).focus();await openAppModal({kind:'warning',eyebrow:'Cadastro incompleto',title:'Preencha os campos obrigatórios',message:'Os campos destacados precisam ser preenchidos.',confirmText:'Voltar ao cadastro'});return;}
  const formData=Object.fromEntries(new FormData(dialogForm).entries());
  const {type,index}=state.dialog;
  if(type==='amendments'){
    formData.id=index===null?uid():state.current.amendments[index].id;
    formData.createdAt=index===null?new Date().toISOString():state.current.amendments[index].createdAt;
    if(index===null)state.current.amendments.push(formData);else state.current.amendments[index]=formData;
    addAudit(state.current,'REGISTRAR COMPLEMENTO',`${formData.tipo}: ${formData.texto.slice(0,80)}`);
    dialog.close();state.dialog=null;await saveCurrent(true);if(apiConfigured()&&navigator.onLine)await syncRecord(state.current,false);renderDetail();showToast('Complemento registrado.');return;
  }
  if(type==='people'){
    formData.nome=formData.nome.trim();formData.matricula=(formData.matricula||'').replace(/\D/g,'');formData.numeroDocumento=(formData.numeroDocumento||'').trim();
    const others=state.current.people.filter((_,i)=>i!==index);
    if(formData.matricula&&others.some(p=>p.matricula===formData.matricula)){await openAppModal({kind:'warning',eyebrow:'Possível duplicidade',title:'Matrícula já cadastrada',message:'Já existe uma pessoa com essa matrícula neste boletim.',confirmText:'Revisar cadastro'});return;}
    if(formData.numeroDocumento&&others.some(p=>p.numeroDocumento===formData.numeroDocumento)){await openAppModal({kind:'warning',eyebrow:'Possível duplicidade',title:'Documento já cadastrado',message:'Já existe uma pessoa com esse documento neste boletim.',confirmText:'Revisar cadastro'});return;}
  }
  if(type==='vehicles'){
    formData.placa=(formData.placa||'').toUpperCase().replace(/[^A-Z0-9-]/g,'');
    const compact=formData.placa.replace(/-/g,'');
    const plate=/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(compact),chassis=/^[A-HJ-NPR-Z0-9]{17}$/.test(compact);
    if(!plate&&!chassis&&compact.length<7){await openAppModal({kind:'warning',eyebrow:'Identificação do veículo',title:'Placa ou chassi incompleto',message:'Informe uma placa válida ou um chassi com 17 caracteres.',confirmText:'Corrigir'});return;}
    formData.pessoaNome=personNameById(formData.pessoaId);
  }
  if(type==='materials'){
    if(Number(formData.quantidade)<=0){await openAppModal({kind:'warning',eyebrow:'Quantidade inválida',title:'Informe uma quantidade maior que zero',message:'A quantidade do material precisa ser maior que zero.',confirmText:'Corrigir'});return;}
    formData.pessoaNome=personNameById(formData.pessoaId);
  }
  formData.id=index===null?uid():state.current[type][index].id;
  if(index===null)state.current[type].push(formData);else state.current[type][index]=formData;
  const verify={people:'people',vehicles:'vehicles',materials:'materials'}[type];state.current.verification[verify]='has';
  if(type==='people'&&formData.tipo==='Testemunha')state.current.verification.witnesses='has';
  addAudit(state.current,index===null?'ADICIONAR CADASTRO':'EDITAR CADASTRO',`${type}:${formData.id}`);
  dialog.close();state.dialog=null;await saveCurrent(true);if(state.route==='detail')renderDetail();else renderWizard();showToast('Cadastro salvo no boletim.');
}

function closeDialog() {
  dialog.close();
  state.dialog = null;
}

let remoteSearchTimer;
function recordMatches(record,rawTerm){
  const term=rawTerm.trim().toLowerCase();if(!term)return true;
  if(/^\d+$/.test(rawTerm.trim())){const seq=Number(rawTerm.trim());const last=Number(String(record.numero||'').split('-').pop());return Number.isFinite(last)&&last===seq;}
  const haystack=[record.numero,record.numeroTemporario,record.basic?.referencia,record.basic?.referenciaOutra,record.basic?.diretoria,record.basic?.diretoriaOutra,record.basic?.nomeEmissor,record.basic?.local,record.basic?.complementoLocal,...(record.people||[]).map(p=>`${p.nome} ${p.matricula} ${p.numeroDocumento}`),...(record.vehicles||[]).map(v=>v.placa),...(record.materials||[]).map(m=>m.denominacao)].join(' ').toLowerCase();
  return haystack.includes(term);
}
async function performRemoteSearch(term){
  if(!apiConfigured()||!navigator.onLine||term.trim().length<2){state.remoteRecords=[];state.remoteSearching=false;return;}
  state.remoteSearching=true;if(state.route==='records')renderRecords();
  try{const payload=await apiGet({action:'search',q:term.trim()});state.remoteRecords=(payload.records||[]).map(item=>({...normalizeRecord(item),_source:'remote'}));state.syncState='online';}
  catch(error){console.warn('Busca remota:',error);state.remoteRecords=[];state.syncState='error';}
  state.remoteSearching=false;if(state.route==='records')renderRecords();
}
function renderRecords() {
  const local=state.records.filter(record=>(state.filter==='Todos'||record.status===state.filter)&&recordMatches(record,state.search));
  const merged=new Map(local.map(record=>[record.id,{...record,_source:'local'}]));
  state.remoteRecords.filter(record=>state.filter==='Todos'||record.status===state.filter).forEach(record=>{if(!merged.has(record.id))merged.set(record.id,record);});
  const filtered=[...merged.values()].sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt));
  app.innerHTML=`<section class="form-card"><p class="eyebrow">Consulta operacional</p><h1>Boletins registrados</h1><p>A pesquisa consulta os dados do aparelho e, quando houver internet, também o Google Sheets.</p><div class="search-wrap">${ICONS.search}<input class="search-input" id="record-search" type="search" inputmode="search" enterkeyhint="search" value="${escapeHtml(state.search)}" placeholder="Ex.: 26, nome, referência ou placa" aria-describedby="record-search-help"><button type="button" class="search-clear ${state.search?'':'hidden'}" data-action="clear-search" aria-label="Limpar pesquisa">×</button></div><small id="record-search-help">Digite apenas <strong>26</strong> para procurar exatamente o BO cuja sequência termina em <strong>000026</strong>.</small><div class="filter-row">${['Todos','Rascunho','Finalizado'].map(value=>`<button class="filter-button ${state.filter===value?'active':''}" type="button" data-filter="${value}">${value}</button>`).join('')}</div></section>
  <div class="section-title"><div><p class="eyebrow">Resultado da consulta</p><h2>${filtered.length} registro(s) encontrado(s)</h2>${state.remoteSearching?'<small>Consultando a planilha...</small>':''}</div><button class="button primary small" type="button" data-action="new-bo">${ICONS.plus} Novo boletim</button></div>
  ${filtered.length?`<div class="record-list">${filtered.map(recordCard).join('')}</div>`:'<div class="entity-empty">Nenhum boletim corresponde aos filtros informados.</div>'}`;
  const search=app.querySelector('#record-search');search.addEventListener('input',()=>{state.search=search.value;clearTimeout(remoteSearchTimer);remoteSearchTimer=setTimeout(()=>performRemoteSearch(state.search),500);renderRecords();setTimeout(()=>{const el=app.querySelector('#record-search');el?.focus();el?.setSelectionRange(state.search.length,state.search.length);},0);});
  app.querySelector('[data-action="clear-search"]')?.addEventListener('click',()=>{state.search='';state.remoteRecords=[];renderRecords();});
  app.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{state.filter=button.dataset.filter;renderRecords();}));
  bindCommonCards();
}

function renderDetail() {
  const r=state.current,b=r.basic;
  const reference=b.referencia==='Danos materiais — Outra'?b.referenciaOutra:b.referencia;
  const directorate=b.diretoria==='Outra'?b.diretoriaOutra:b.diretoria;
  app.innerHTML=`<section class="hero no-visual"><div class="hero-copy"><p class="eyebrow">${escapeHtml(r.status)} • boletim de ocorrência</p><h1>${escapeHtml(r.numero)}</h1><p>${escapeHtml(reference||'Referência não informada')} • ${formatDateOnly(b.data)} às ${escapeHtml(b.hora)}</p><div class="hero-actions"><button class="button ghost" type="button" data-action="print">${ICONS.file} Imprimir ou salvar em PDF</button><button class="button secondary" type="button" data-action="sync-record">${ICONS.sync} Sincronizar</button><button class="button primary" type="button" data-action="add-amendment">${ICONS.plus} Adicionar complemento</button><button class="button secondary" type="button" data-action="add-final-attachment">${ICONS.paperclip} Novo anexo</button></div><div style="margin-top:15px"><span class="sync-state sync-${escapeHtml(r.syncStatus||'local')}"><i></i>${escapeHtml(syncStatusLabel(r))}</span></div></div></section>
  <div class="review-grid">
    ${reviewSectionStatic('Ocorrência',`<dl class="definition-grid"><div><dt>Referência</dt><dd>${escapeHtml(reference||'Não informada')}</dd></div><div><dt>Local</dt><dd>${escapeHtml(b.local)} — ${escapeHtml(b.complementoLocal)}</dd></div><div><dt>Diretoria</dt><dd>${escapeHtml(directorate||'Não informada')}</dd></div><div><dt>Solicitante</dt><dd>${escapeHtml(b.nomeEmissor)} • ${escapeHtml(b.matriculaEmissor)}</dd></div><div><dt>Criado</dt><dd>${formatDateTime(r.createdAt)}</dd></div><div><dt>Finalizado</dt><dd>${formatDateTime(r.finalizedAt)}</dd></div></dl>`)}
    ${reviewSectionStatic(`Pessoas (${r.people.length})`,r.people.length?`<div class="entity-list">${r.people.map(renderPersonItemReview).join('')}</div>`:'<div class="entity-empty">Nenhuma pessoa cadastrada.</div>')}
    ${reviewSectionStatic(`Veículos (${r.vehicles.length})`,r.vehicles.length?`<div class="entity-list">${r.vehicles.map(renderVehicleItemReview).join('')}</div>`:'<div class="entity-empty">Nenhum veículo cadastrado.</div>')}
    ${reviewSectionStatic(`Materiais (${r.materials.length})`,r.materials.length?`<div class="entity-list">${r.materials.map(renderMaterialItemReview).join('')}</div>`:'<div class="entity-empty">Nenhum material cadastrado.</div>')}
    ${reviewSectionStatic('Histórico',`<dl class="definition-grid"><div style="grid-column:1/-1"><dt>Relato</dt><dd>${escapeHtml(r.history.relato)}</dd></div><div style="grid-column:1/-1"><dt>Providências</dt><dd>${escapeHtml(r.history.providencias||'Nenhuma')}</dd></div></dl>`)}
    ${reviewSectionStatic(`Complementos e retificações (${r.amendments.length})`,r.amendments.length?`<div class="timeline">${r.amendments.map(a=>`<article><span>${formatDateTime(a.createdAt)}</span><strong>${escapeHtml(a.tipo)}</strong><p>${escapeHtml(a.texto)}</p><small>${escapeHtml(a.responsavel||'Não informado')}</small></article>`).join('')}</div>`:'<div class="entity-empty">Nenhum complemento registrado.</div>')}
  </div><input id="final-attachment" class="hidden" type="file" accept="image/*,.pdf,.doc,.docx" multiple>`;
  app.querySelector('[data-action="print"]').addEventListener('click',()=>window.print());
  app.querySelector('[data-action="sync-record"]').addEventListener('click',async()=>{const success=await syncRecord(r,false);await refreshRecords();renderDetail();await openAppModal({kind:success?'success':'danger',eyebrow:'Sincronização',title:success?'Registro enviado':'Não foi possível sincronizar',message:success?'Os dados foram atualizados na planilha.':'O registro continua salvo no aparelho.',confirmText:'Entendi'});});
  app.querySelector('[data-action="add-amendment"]').addEventListener('click',()=>openEntityDialog('amendments'));
  app.querySelector('[data-action="add-final-attachment"]').addEventListener('click',()=>app.querySelector('#final-attachment').click());
  app.querySelector('#final-attachment').addEventListener('change',async event=>{const before=state.current.attachments.length;await handleAttachments(event);const added=state.current.attachments.slice(before);if(added.length){state.current.amendments.push({id:uid(),tipo:'Novo anexo',texto:`Foram adicionados: ${added.map(f=>f.name).join(', ')}`,responsavel:[state.operator?.usuario,state.operator?.registro].filter(Boolean).join(' / '),createdAt:new Date().toISOString()});await saveCurrent(true);if(apiConfigured()&&navigator.onLine)await syncRecord(state.current,false);renderDetail();}});
}

function reviewSectionStatic(title, body) {
  return `<section class="review-section"><div class="review-head"><h3>${title}</h3></div><div class="review-body">${body}</div></section>`;
}

function renderAbout() {
  app.innerHTML = `
    <section class="form-card">
      <p class="eyebrow">Área administrativa</p><h1>Configurações técnicas e Google Sheets</h1>
      <p>Esta área é destinada à configuração técnica. O usuário operacional não precisa acessá-la durante o preenchimento. A sincronização ocorre automaticamente quando houver internet.</p>
      <div style="margin:12px 0">${syncBadgeHtml()}</div><div class="code-note">Aplicativo ${APP_VERSION} • API exigida ${REQUIRED_API_VERSION} • Estrutura ${REQUIRED_API_SCHEMA}</div>
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
      <div class="notice warning" style="margin-top:14px"><strong>Anexos:</strong> enquanto o BO estiver offline, os arquivos permanecem no aparelho. Na sincronização, são enviados para uma pasta privada no Google Drive da conta proprietária do Apps Script e a planilha recebe o link.</div>
    </section>

    <div class="section-title"><div><p class="eyebrow">Configuração inicial</p><h2>Como preparar a planilha</h2></div></div>
    <div class="about-list">
      <section class="about-item"><p class="eyebrow">Etapa 1</p><h3>Criar a planilha</h3><p>Crie uma planilha Google em branco e abra <strong>Extensões → Apps Script</strong>.</p></section>
      <section class="about-item"><p class="eyebrow">Etapa 2</p><h3>Publicar o script</h3><p>Cole o conteúdo do arquivo <strong>google-apps-script.gs</strong>, execute a função <strong>setup</strong> e publique como aplicativo da Web.</p></section>
      <section class="about-item"><p class="eyebrow">Etapa 3</p><h3>Conectar o aplicativo</h3><p>Cole o endereço terminado em <strong>/exec</strong>, salve e clique em “Testar conexão”.</p></section>
      <div class="code-note">Abas operacionais: BO_Ocorrencias (A:U), BO_Pessoas, BO_Veiculos, BO_Materiais, BO_Anexos, BO_Complementos e BO_Acessos. BO_Dados e BO_Sequencia ficam ocultas.</div>
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
  if (!state.operator) return;
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


technicalButton?.addEventListener('click', async () => {
  const confirmed = await openAppModal({ kind: 'info', eyebrow: 'Área técnica', title: 'Abrir configurações administrativas?', message: 'Esta área contém endereço do banco, sincronização, importação e exclusão de dados locais.', confirmText: 'Abrir configurações', cancelText: 'Cancelar' });
  if (confirmed) navigate('about');
});

window.addEventListener('online', async () => {
  state.syncState = 'online'; updateHeader();
  const pendingOperator = (() => { try { return JSON.parse(storageGet(PENDING_LOGIN_KEY) || 'null'); } catch { return null; } })();
  if (pendingOperator || state.operator) await registerOperatorAccess(pendingOperator || state.operator);
  const pending = state.records.filter(record => ['pending','error','local'].includes(record.syncStatus));
  for (const record of pending) await syncRecord(record, false);
  await refreshRecords();
  if (state.route === 'home') renderHome();
});
window.addEventListener('offline', () => { state.syncState = 'offline'; updateHeader(); });

installButton.addEventListener('click', handleInstallRequest);

async function persistCurrentWork() {
  if (state.current && state.route === 'wizard') commitVisibleControls(app);
  persistNavigationState();
  if (state.current && state.route === 'wizard') {
    state.current.updatedAt = new Date().toISOString();
    state.current.currentStep = state.currentStep;
    try { await dbPut(state.current); } catch (_) {}
  }
}
window.addEventListener('beforeunload', () => { persistNavigationState(); });
window.addEventListener('pagehide', () => { persistCurrentWork(); });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') persistCurrentWork();
});

async function init() {
  try {
    loadSettings();
    state.operator = loadOperatorSession();
    state.syncState = navigator.onLine && apiConfigured() ? 'online' : 'offline';
    await refreshRecords();
    if (state.operator) {
      await migrateOperatorToLocalRecords();
      const nav = loadNavigationState();
      const remembered = nav?.currentId ? state.records.find(record => record.id === nav.currentId) : null;
      if (nav?.route === 'wizard' && remembered && remembered.status === 'Rascunho') {
        state.current = structuredClone(remembered);
        state.currentStep = Math.max(0, Math.min(Number(nav.currentStep || remembered.currentStep || 0), STEPS.length - 1));
        state.route = 'wizard';
      } else if (nav?.route === 'detail' && remembered) {
        state.current = structuredClone(remembered);
        state.route = 'detail';
      } else {
        state.route = 'home';
      }
    } else {
      state.route = 'login';
    }
    updateHeader();
    updateInstallButton();
    await render();
    if (navigator.onLine && apiConfigured()) {
      const pendingOperator = (() => { try { return JSON.parse(storageGet(PENDING_LOGIN_KEY) || 'null'); } catch { return null; } })();
      registerOperatorAccess(pendingOperator || state.operator);
      const pending = state.records.filter(record => ['pending','error','local'].includes(record.syncStatus));
      pending.forEach(record => scheduleAutoSync(record.id));
    }
  } catch (error) {
    console.error(error);
    app.innerHTML = '<div class="notice danger">O navegador não conseguiu iniciar o armazenamento local. Abra o aplicativo em uma janela normal e verifique se o IndexedDB está permitido.</div>';
  }
}

init();
