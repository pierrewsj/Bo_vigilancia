/**
 * BO DIGITAL GSP — Google Sheets API v6.1.0 — revisão de acessos
 *
 * Estrutura operacional compacta e estável:
 * - BO_Ocorrencias termina na coluna U;
 * - dados técnicos ficam somente na aba oculta BO_Dados;
 * - a estrutura é validada em toda requisição;
 * - boletins finalizados recebem número oficial no servidor;
 * - login do vigilante é registrado sem coluna técnica visível;
 * - gravação por cabeçalho evita deslocamento entre colunas.
 */
const APP_VERSION = '6.1.0';
const SCRIPT_REVISION = 'acessos-bo-v2';

const SHEETS = Object.freeze({
  ocorrencias: 'BO_Ocorrencias',
  pessoas: 'BO_Pessoas',
  veiculos: 'BO_Veiculos',
  materiais: 'BO_Materiais',
  anexos: 'BO_Anexos',
  complementos: 'BO_Complementos',
  acessos: 'BO_Acessos',
  sequencia: 'BO_Sequencia',
  dados: 'BO_Dados'
});

const HEADERS = Object.freeze({
  BO_Ocorrencias: [
    'NumeroBO','Status','Data','Hora','Referencia','NomeSolicitante','MatriculaSolicitante',
    'EmailSolicitante','TurnoSolicitante','Local','Diretoria','UsuarioVigilante',
    'RegistroVigilante','TurnoVigilante','Relato','Providencias','Pessoas','Veiculos',
    'Materiais','FinalizadoEm','SincronizadoEm'
  ],
  BO_Pessoas: [
    'NumeroBO','Tipo','Vinculo','Nome','Empresa','Setor','Matricula','Documento','Telefone','Observacao'
  ],
  BO_Veiculos: [
    'NumeroBO','PlacaChassi','Marca','Modelo','Empresa','PessoaRelacionada','Observacao'
  ],
  BO_Materiais: [
    'NumeroBO','Denominacao','MVMNotaFiscal','Fornecedor','CodigoDesenho','Quantidade',
    'Unidade','PessoaRelacionada','Observacao'
  ],
  BO_Anexos: ['NumeroBO','NomeArquivo','Tipo','DriveURL','EnviadoEm'],
  BO_Complementos: ['NumeroBO','Tipo','Texto','Responsavel','CriadoEm'],
  BO_Acessos: ['UsuarioVigilante','RegistroVigilante','TurnoVigilante','LoginEm','NumerosBORegistrados','QuantidadeBOs'],
  BO_Sequencia: ['Ano','UltimoNumero','AtualizadoEm'],
  BO_Dados: ['ID','NumeroBO','NumeroTemporario','RegistroJSON','AtualizadoEm','SyncStatus','AccessId']
});

/** Execute uma vez após substituir o código. */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Abra este projeto pela planilha que será usada como banco.');

  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  const snapshot = captureSnapshot_(ss);
  rebuildAllSheets_(ss);
  restoreSnapshot_(ss, snapshot);
  getAttachmentRootFolder_();
  formatSheets_(ss);
  hideTechnicalSheets_(ss);

  return `Banco reorganizado. ${snapshot.records.length} boletim(ns) preservado(s). API ${APP_VERSION}`;
}

/** Reconstrói as abas usando os dados técnicos existentes. */
function reorganizarAbas() {
  return setup();
}

/** Corrige boletins finalizados que ainda estejam com prefixo RASC. */
function corrigirNumerosFinalizados() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const ss = getSpreadsheet_();
    ensureExactSchema_(ss);
    const records = listRecords_();
    let changed = 0;

    records.forEach(record => {
      normalizeRecord_(record);
      if (String(record.status).toLowerCase() === 'finalizado' && !isOfficialNumber_(record.numero)) {
        ensureOfficialNumber_(record);
        record.syncStatus = 'synced';
        record.syncedAt = record.syncedAt || new Date().toISOString();
        writeRecord_(record);
        changed += 1;
      }
    });

    SpreadsheetApp.flush();
    return `${changed} boletim(ns) finalizado(s) recebeu(ram) número oficial.`;
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function doGet(e) {
  try {
    const ss = getSpreadsheet_();
    ensureExactSchema_(ss);
    const p = (e && e.parameter) || {};
    const action = String(p.action || 'ping').toLowerCase();

    if (action === 'ping') {
      return json_({
        ok: true,
        version: APP_VERSION,
        revision: SCRIPT_REVISION,
        schema: 'compact-u',
        message: 'Google Sheets conectado ao BO Digital.'
      });
    }
    if (action === 'list') return json_({ok:true,version:APP_VERSION,records:listRecords_()});
    if (action === 'search') return json_({ok:true,version:APP_VERSION,records:searchRecords_(String(p.q || ''))});
    if (action === 'get') return json_({ok:true,version:APP_VERSION,record:getRecordByNumber_(String(p.numero || ''))});
    if (action === 'diagnostico') return json_({ok:true,version:APP_VERSION,sheets:diagnosticoEstrutura_()});

    return json_({ok:false,version:APP_VERSION,error:'Ação GET não reconhecida.'});
  } catch (error) {
    return json_({ok:false,version:APP_VERSION,error:errorMessage_(error)});
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const ss = getSpreadsheet_();
    ensureExactSchema_(ss);

    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const action = String(payload.action || '').toLowerCase();

    if (action === 'login') {
      const operator = validateOperator_(payload.operator);
      logAccess_(operator);
      SpreadsheetApp.flush();
      return json_({
        ok:true, version:APP_VERSION, schema:'compact-u', operatorSaved:true,
        accessId:operator.accessId, message:'Acesso do vigilante registrado.'
      });
    }

    if (action !== 'upsert') throw new Error('Ação POST não reconhecida.');

    const record = payload.record;
    validateRecord_(record);
    normalizeRecord_(record);

    const operator = validateOperator_(payload.operator || record.operator);
    record.operator = operator;
    logAccess_(operator);

    let officialNumber = '';
    if (String(record.status || '').toLowerCase() === 'finalizado') {
      officialNumber = ensureOfficialNumber_(record);
    } else {
      officialNumber = String(record.numero || record.numeroTemporario || '').trim();
    }

    record.attachments = processAttachments_(record.attachments || [], officialNumber || record.numero);
    record.syncStatus = 'synced';
    record.syncedAt = new Date().toISOString();
    writeRecord_(record);
    SpreadsheetApp.flush();

    return json_({
      ok:true,
      version:APP_VERSION,
      schema:'compact-u',
      officialNumber:isOfficialNumber_(record.numero) ? record.numero : '',
      numero:record.numero,
      recordId:record.id,
      operatorSaved:true,
      accessId:operator.accessId,
      attachments:(record.attachments || []).map(stripAttachmentData_),
      message:String(record.status).toLowerCase() === 'finalizado'
        ? 'Boletim finalizado e salvo na planilha.'
        : 'Rascunho salvo na planilha.'
    });
  } catch (error) {
    return json_({ok:false,version:APP_VERSION,error:errorMessage_(error)});
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function getSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('SPREADSHEET_ID');
  if (id) return SpreadsheetApp.openById(id);

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Execute a função setup antes de publicar.');
  props.setProperty('SPREADSHEET_ID', ss.getId());
  return ss;
}

function ensureExactSchema_(ss) {
  if (schemaIsExact_(ss)) {
    ensureOperationalVisibility_(ss);
    return;
  }

  const snapshot = captureSnapshot_(ss);
  rebuildAllSheets_(ss);
  restoreSnapshot_(ss, snapshot);
  formatSheets_(ss);
  hideTechnicalSheets_(ss);
}

function schemaIsExact_(ss) {
  return Object.keys(HEADERS).every(name => {
    const sheet = ss.getSheetByName(name);
    const expected = HEADERS[name];
    if (!sheet || sheet.getMaxColumns() !== expected.length) return false;
    const current = sheet.getRange(1,1,1,expected.length).getDisplayValues()[0];
    return expected.every((header,index) => current[index] === header);
  });
}

function captureSnapshot_(ss) {
  return {
    records:collectExistingRecords_(ss),
    accesses:collectExistingAccesses_(ss),
    sequences:collectExistingSequences_(ss)
  };
}

function restoreSnapshot_(ss, snapshot) {
  const records = snapshot.records || [];
  restoreSequences_(ss, snapshot.sequences || []);
  synchronizeSequenceWithRecords_(records);
  restoreAccesses_(ss, snapshot.accesses || []);
  records.forEach(record => {
    normalizeRecord_(record);
    if (String(record.status || '').toLowerCase() === 'finalizado' && !isOfficialNumber_(record.numero)) {
      ensureOfficialNumber_(record);
      record.syncStatus = 'synced';
      record.syncedAt = record.syncedAt || new Date().toISOString();
    }
    writeRecord_(record);
  });
}

function synchronizeSequenceWithRecords_(records) {
  const ss = getSpreadsheet_();
  const sheet = ensureSheet_(ss, SHEETS.sequencia);
  const maxima = {};
  (records || []).forEach(record => {
    const match = String(record.numero || '').match(/^BO-(\d{4})-(\d{6})$/);
    if (!match) return;
    const year = Number(match[1]);
    const number = Number(match[2]);
    maxima[year] = Math.max(maxima[year] || 0, number);
  });

  Object.keys(maxima).forEach(yearText => {
    const year = Number(yearText);
    let row = 0;
    let current = 0;
    if (sheet.getLastRow() > 1) {
      const values = sheet.getRange(2,1,sheet.getLastRow()-1,2).getValues();
      const index = values.findIndex(item => Number(item[0]) === year);
      if (index >= 0) {
        row = index + 2;
        current = Number(values[index][1] || 0);
      }
    }
    if (!row) row = sheet.getLastRow() + 1;
    sheet.getRange(row,1,1,3).setValues([[year,Math.max(current,maxima[year]),new Date().toISOString()]]);
  });
}

function rebuildAllSheets_(ss) {
  Object.keys(HEADERS).forEach(name => {
    const headers = HEADERS[name];
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);

    sheet.showSheet();
    sheet.showColumns(1, sheet.getMaxColumns());
    if (sheet.getFilter()) sheet.getFilter().remove();
    sheet.clear();

    if (sheet.getMaxColumns() < headers.length) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
    } else if (sheet.getMaxColumns() > headers.length) {
      sheet.deleteColumns(headers.length + 1, sheet.getMaxColumns() - headers.length);
    }

    sheet.getRange(1,1,1,headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  });
}

function ensureSheet_(ss, name) {
  const headers = HEADERS[name];
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getMaxColumns() < headers.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
  }
  sheet.getRange(1,1,1,headers.length).setValues([headers]);
  return sheet;
}

function collectExistingRecords_(ss) {
  const byId = {};
  collectJsonRecords_(ss.getSheetByName(SHEETS.dados), byId);
  collectJsonRecords_(ss.getSheetByName(SHEETS.ocorrencias), byId);
  return Object.values(byId);
}

function collectJsonRecords_(sheet, byId) {
  if (!sheet || sheet.getLastRow() < 2) return;
  const width = sheet.getLastColumn();
  const headers = sheet.getRange(1,1,1,width).getDisplayValues()[0];
  const jsonIndex = headers.indexOf('RegistroJSON');
  if (jsonIndex < 0) return;

  sheet.getRange(2,jsonIndex + 1,sheet.getLastRow() - 1,1).getDisplayValues().flat().forEach(value => {
    if (!value) return;
    try {
      const record = JSON.parse(value);
      const id = String(record.id || '').trim();
      if (id) byId[id] = record;
    } catch (_) {}
  });
}

function collectExistingAccesses_(ss) {
  const sheet = ss.getSheetByName(SHEETS.acessos);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const width = sheet.getLastColumn();
  const headers = sheet.getRange(1,1,1,width).getDisplayValues()[0];
  const rows = sheet.getRange(2,1,sheet.getLastRow()-1,width).getDisplayValues();

  return rows.map(row => ({
    usuario:valueByHeader_(row,headers,['UsuarioVigilante','UsuarioOperador']),
    registro:valueByHeader_(row,headers,['RegistroVigilante','RegistroOperador']),
    turno:valueByHeader_(row,headers,['TurnoVigilante','TurnoOperador']),
    loginAt:valueByHeader_(row,headers,['LoginEm','LoginVigilanteEm','LoginOperadorEm']),
    numerosBO:valueByHeader_(row,headers,['NumerosBORegistrados','BOsRegistrados','NumeroBO']),
    quantidadeBOs:Number(valueByHeader_(row,headers,['QuantidadeBOs','TotalBOs']) || 0)
  })).filter(item => item.usuario && item.registro && item.turno);
}

function collectExistingSequences_(ss) {
  const sheet = ss.getSheetByName(SHEETS.sequencia);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const width = Math.min(3, sheet.getLastColumn());
  return sheet.getRange(2,1,sheet.getLastRow()-1,width).getValues()
    .filter(row => row[0] !== '' && row[0] !== null)
    .map(row => [row[0],row[1] || 0,row[2] || '']);
}

function restoreAccesses_(ss, accesses) {
  const sheet = ensureSheet_(ss, SHEETS.acessos);
  (accesses || []).forEach(operator => logAccessToSheet_(sheet, operator));
}

function restoreSequences_(ss, sequences) {
  const sheet = ensureSheet_(ss, SHEETS.sequencia);
  if (sequences.length) sheet.getRange(2,1,sequences.length,3).setValues(sequences);
}

function valueByHeader_(row, headers, names) {
  for (let i=0; i<names.length; i+=1) {
    const pos = headers.indexOf(names[i]);
    if (pos >= 0) return String(row[pos] || '').trim();
  }
  return '';
}

function validateOperator_(operator) {
  if (!operator || typeof operator !== 'object') throw new Error('Dados do vigilante não enviados.');
  const clean = {
    accessId:String(operator.accessId || `${operator.registro || 'SEM'}-${operator.loginAt || Date.now()}`).trim(),
    usuario:String(operator.usuario || '').trim(),
    registro:String(operator.registro || '').trim(),
    turno:String(operator.turno || '').trim(),
    loginAt:String(operator.loginAt || new Date().toISOString()),
    dispositivo:String(operator.dispositivo || '')
  };
  if (!clean.usuario) throw new Error('Usuário do vigilante não informado.');
  if (!/^\d+$/.test(clean.registro)) throw new Error('Registro do vigilante inválido.');
  if (!clean.turno) throw new Error('Turno do vigilante não informado.');
  return clean;
}

function logAccess_(operator) {
  const ss = getSpreadsheet_();
  const sheet = ensureSheet_(ss, SHEETS.acessos);
  logAccessToSheet_(sheet, operator);
}

function logAccessToSheet_(sheet, operator) {
  const user = String(operator.usuario || '').trim();
  const registration = String(operator.registro || '').trim();
  const shift = String(operator.turno || '').trim();
  const loginAt = String(operator.loginAt || '').trim();
  const numerosBO = normalizeBoList_(operator.numerosBO || '');
  const quantidadeBOs = numerosBO.length || Number(operator.quantidadeBOs || 0);
  if (!user || !registration || !shift) return 0;

  const targetRow = findAccessRow_(sheet, {
    usuario:user,
    registro:registration,
    turno:shift,
    loginAt:loginAt
  });

  if (targetRow) {
    if (numerosBO.length) {
      sheet.getRange(targetRow,5,1,2).setValues([[
        numerosBO.join('\n'),
        quantidadeBOs
      ]]);
    }
    return targetRow;
  }

  sheet.appendRow([
    user,
    registration,
    shift,
    loginAt || new Date().toISOString(),
    numerosBO.join('\n'),
    quantidadeBOs
  ]);

  return sheet.getLastRow();
}

function findAccessRow_(sheet, operator) {
  if (!sheet || sheet.getLastRow() < 2) return 0;

  const user = String(operator.usuario || '').trim();
  const registration = String(operator.registro || '').trim();
  const shift = String(operator.turno || '').trim();
  const loginAt = String(operator.loginAt || '').trim();
  const rows = sheet.getRange(2,1,sheet.getLastRow()-1,4).getDisplayValues();

  let fallback = 0;
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const row = rows[index];
    if (row[0] !== user || row[1] !== registration || row[2] !== shift) continue;
    if (!fallback) fallback = index + 2;
    if (loginAt && row[3] === loginAt) return index + 2;
  }

  return loginAt ? 0 : fallback;
}

function normalizeBoList_(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map(item => String(item || '').trim()).filter(isOfficialNumber_))];
  }

  return [...new Set(
    String(value || '')
      .split(/[\n,;|]+/)
      .map(item => item.trim())
      .filter(isOfficialNumber_)
  )];
}

function linkBoToAccess_(operator, numeroBO) {
  if (!operator || !isOfficialNumber_(numeroBO)) return;

  const ss = getSpreadsheet_();
  const sheet = ensureSheet_(ss, SHEETS.acessos);
  let row = findAccessRow_(sheet, operator);

  if (!row) row = logAccessToSheet_(sheet, operator);
  if (!row) return;

  const current = normalizeBoList_(sheet.getRange(row,5).getDisplayValue());
  if (!current.includes(numeroBO)) current.push(numeroBO);

  sheet.getRange(row,5,1,2).setValues([[
    current.join('\n'),
    current.length
  ]]);
}

function testarRegistroLogin() {
  const operator = validateOperator_({
    usuario:'TESTE DE CONEXÃO', registro:'99999', turno:'Administrativo',
    loginAt:new Date().toISOString(), accessId:`TESTE-${Date.now()}`
  });
  logAccess_(operator);
  SpreadsheetApp.flush();
  return 'Linha de teste criada na aba BO_Acessos.';
}

function validateRecord_(record) {
  if (!record || typeof record !== 'object') throw new Error('Registro não enviado.');
  if (!String(record.id || '').trim()) throw new Error('ID do registro não informado.');
}

function normalizeRecord_(record) {
  record.schemaVersion = Number(record.schemaVersion || 2);
  record.basic = record.basic || {};
  record.history = record.history || {};
  record.operator = record.operator || {};
  record.verification = record.verification || {};
  record.acknowledgements = record.acknowledgements || {};
  record.people = Array.isArray(record.people) ? record.people : [];
  record.vehicles = Array.isArray(record.vehicles) ? record.vehicles : [];
  record.materials = Array.isArray(record.materials) ? record.materials : [];
  record.attachments = Array.isArray(record.attachments) ? record.attachments : [];
  record.amendments = Array.isArray(record.amendments) ? record.amendments : [];
  record.auditTrail = Array.isArray(record.auditTrail) ? record.auditTrail : [];
  record.numeroTemporario = record.numeroTemporario || (isOfficialNumber_(record.numero) ? '' : record.numero || '');
  record.syncStatus = record.syncStatus || 'local';
}

function isOfficialNumber_(value) {
  return /^BO-\d{4}-\d{6}$/.test(String(value || ''));
}

function ensureOfficialNumber_(record) {
  if (isOfficialNumber_(record.numero)) return record.numero;

  const dateText = String((record.basic && record.basic.data) || '');
  const year = /^\d{4}-/.test(dateText) ? Number(dateText.slice(0,4)) : new Date().getFullYear();
  const ss = getSpreadsheet_();
  const sheet = ensureSheet_(ss, SHEETS.sequencia);
  let targetRow = 0;
  let lastNumber = 0;

  if (sheet.getLastRow() > 1) {
    const values = sheet.getRange(2,1,sheet.getLastRow()-1,2).getValues();
    const index = values.findIndex(row => Number(row[0]) === year);
    if (index >= 0) {
      targetRow = index + 2;
      lastNumber = Number(values[index][1] || 0);
    }
  }

  if (!targetRow) targetRow = sheet.getLastRow() + 1;
  const next = lastNumber + 1;
  sheet.getRange(targetRow,1,1,3).setValues([[year,next,new Date().toISOString()]]);

  record.numeroTemporario = record.numeroTemporario || record.numero || '';
  record.numero = `BO-${year}-${String(next).padStart(6,'0')}`;
  return record.numero;
}

function getAttachmentRootFolder_() {
  const props = PropertiesService.getScriptProperties();
  const savedId = props.getProperty('ATTACHMENT_FOLDER_ID');
  if (savedId) {
    try { return DriveApp.getFolderById(savedId); } catch (_) {}
  }

  const folders = DriveApp.getFoldersByName('BO_Digital_GSP_Anexos');
  const folder = folders.hasNext() ? folders.next() : DriveApp.createFolder('BO_Digital_GSP_Anexos');
  props.setProperty('ATTACHMENT_FOLDER_ID', folder.getId());
  return folder;
}

function getBoAttachmentFolder_(numero) {
  const root = getAttachmentRootFolder_();
  const safe = String(numero || 'SEM_NUMERO').replace(/[^A-Za-z0-9_-]/g,'_');
  const folders = root.getFoldersByName(safe);
  return folders.hasNext() ? folders.next() : root.createFolder(safe);
}

function processAttachments_(attachments, numero) {
  if (!Array.isArray(attachments) || !attachments.length) return [];
  let folder = null;

  return attachments.map(attachment => {
    const item = Object.assign({}, attachment || {});
    if (item.driveFileId || !item.dataUrl) return stripAttachmentData_(item);

    const match = String(item.dataUrl).match(/^data:([^;]+);base64,(.+)$/);
    if (!match) throw new Error(`Formato inválido do anexo: ${item.name || 'arquivo'}`);
    if (!folder) folder = getBoAttachmentFolder_(numero);

    const safeName = String(item.name || `anexo-${Date.now()}`).replace(/[\/:*?"<>|]/g,'_');
    const blob = Utilities.newBlob(Utilities.base64Decode(match[2]), item.type || match[1] || 'application/octet-stream', safeName);
    const file = folder.createFile(blob);
    item.driveFileId = file.getId();
    item.driveUrl = file.getUrl();
    item.uploadedAt = new Date().toISOString();
    return stripAttachmentData_(item);
  });
}

function stripAttachmentData_(attachment) {
  const item = Object.assign({}, attachment || {});
  delete item.dataUrl;
  return item;
}

function writeRecord_(record) {
  const ss = getSpreadsheet_();
  normalizeRecord_(record);

  const numero = String(record.numero || '').trim();
  const temporary = String(record.numeroTemporario || '').trim();
  const oldNumbers = [numero,temporary].filter(Boolean);
  const basic = record.basic || {};
  const history = record.history || {};
  const operator = record.operator || {};

  const occurrence = {
    NumeroBO:numero,
    Status:record.status || 'Rascunho',
    Data:basic.data || '',
    Hora:basic.hora || '',
    Referencia:basic.referencia === 'Danos materiais — Outra'
      ? (basic.referenciaOutra || basic.referencia || '')
      : (basic.referencia || ''),
    NomeSolicitante:basic.nomeEmissor || '',
    MatriculaSolicitante:basic.matriculaEmissor || '',
    EmailSolicitante:basic.emailEmissor || '',
    TurnoSolicitante:basic.turnoEmissor || '',
    Local:[basic.local,basic.complementoLocal].filter(Boolean).join(' — '),
    Diretoria:basic.diretoria === 'Outra' ? (basic.diretoriaOutra || basic.diretoria || '') : (basic.diretoria || ''),
    UsuarioVigilante:operator.usuario || '',
    RegistroVigilante:operator.registro || '',
    TurnoVigilante:operator.turno || '',
    Relato:history.relato || '',
    Providencias:history.providencias || '',
    Pessoas:(record.people || []).length,
    Veiculos:(record.vehicles || []).length,
    Materiais:(record.materials || []).length,
    FinalizadoEm:record.finalizedAt || '',
    SincronizadoEm:record.syncedAt || new Date().toISOString()
  };

  upsertObjectByHeader_(ensureSheet_(ss,SHEETS.ocorrencias),'NumeroBO',oldNumbers,occurrence);
  upsertObjectByHeader_(ensureSheet_(ss,SHEETS.dados),'ID',[record.id],{
    ID:record.id,
    NumeroBO:numero,
    NumeroTemporario:temporary,
    RegistroJSON:JSON.stringify(record),
    AtualizadoEm:record.updatedAt || new Date().toISOString(),
    SyncStatus:record.syncStatus || '',
    AccessId:operator.accessId || ''
  });

  linkBoToAccess_(operator, numero);

  replaceChildren_(ensureSheet_(ss,SHEETS.pessoas),oldNumbers,(record.people || []).map(person => ({
    NumeroBO:numero,
    Tipo:person.tipo || '',
    Vinculo:person.vinculo || '',
    Nome:person.nome || '',
    Empresa:person.empresa || '',
    Setor:person.setor || '',
    Matricula:person.matricula || '',
    Documento:[person.tipoDocumento,person.numeroDocumento].filter(Boolean).join(': '),
    Telefone:person.telefone || '',
    Observacao:person.observacao || person.dadosComplementares || ''
  })));

  replaceChildren_(ensureSheet_(ss,SHEETS.veiculos),oldNumbers,(record.vehicles || []).map(vehicle => ({
    NumeroBO:numero,
    PlacaChassi:vehicle.placa || vehicle.chassi || '',
    Marca:vehicle.marca || '',
    Modelo:vehicle.modelo || '',
    Empresa:vehicle.empresa || '',
    PessoaRelacionada:vehicle.pessoaNome || '',
    Observacao:vehicle.observacao || ''
  })));

  replaceChildren_(ensureSheet_(ss,SHEETS.materiais),oldNumbers,(record.materials || []).map(material => ({
    NumeroBO:numero,
    Denominacao:material.denominacao || '',
    MVMNotaFiscal:material.mvm || '',
    Fornecedor:material.fornecedor || '',
    CodigoDesenho:[material.codigoVasilhame,material.desenho].filter(Boolean).join(' / '),
    Quantidade:material.quantidade || '',
    Unidade:material.unidade || '',
    PessoaRelacionada:material.pessoaNome || '',
    Observacao:material.observacao || ''
  })));

  replaceChildren_(ensureSheet_(ss,SHEETS.anexos),oldNumbers,(record.attachments || []).map(attachment => ({
    NumeroBO:numero,
    NomeArquivo:attachment.name || '',
    Tipo:attachment.type || '',
    DriveURL:attachment.driveUrl || '',
    EnviadoEm:attachment.uploadedAt || ''
  })));

  replaceChildren_(ensureSheet_(ss,SHEETS.complementos),oldNumbers,(record.amendments || []).map(amendment => ({
    NumeroBO:numero,
    Tipo:amendment.tipo || '',
    Texto:amendment.texto || '',
    Responsavel:amendment.responsavel || '',
    CriadoEm:amendment.createdAt || ''
  })));
}

function upsertObjectByHeader_(sheet, keyHeader, keyValues, object) {
  const headers = HEADERS[sheet.getName()];
  const keyIndex = headers.indexOf(keyHeader);
  if (keyIndex < 0) throw new Error(`Cabeçalho ${keyHeader} não encontrado em ${sheet.getName()}.`);

  const keys = (Array.isArray(keyValues) ? keyValues : [keyValues]).map(value => String(value || '').trim()).filter(Boolean);
  let targetRow = 0;
  if (sheet.getLastRow() > 1 && keys.length) {
    const values = sheet.getRange(2,keyIndex+1,sheet.getLastRow()-1,1).getDisplayValues().flat();
    const matches = [];
    values.forEach((value,index) => {
      if (keys.includes(String(value).trim())) matches.push(index + 2);
    });
    if (matches.length) {
      targetRow = matches[0];
      for (let i=matches.length-1; i>=1; i-=1) sheet.deleteRow(matches[i]);
    }
  }
  if (!targetRow) targetRow = sheet.getLastRow() + 1;

  const row = headers.map(header => Object.prototype.hasOwnProperty.call(object,header) ? object[header] : '');
  sheet.getRange(targetRow,1,1,headers.length).setValues([row]);
}

function replaceChildren_(sheet, oldNumbers, objects) {
  deleteRowsByFirstColumn_(sheet, oldNumbers);
  if (!objects.length) return;
  const headers = HEADERS[sheet.getName()];
  const rows = objects.map(object => headers.map(header => Object.prototype.hasOwnProperty.call(object,header) ? object[header] : ''));
  sheet.getRange(sheet.getLastRow()+1,1,rows.length,headers.length).setValues(rows);
}

function deleteRowsByFirstColumn_(sheet, valuesToDelete) {
  const keys = (valuesToDelete || []).map(value => String(value || '').trim()).filter(Boolean);
  if (!keys.length || sheet.getLastRow() < 2) return;
  const values = sheet.getRange(2,1,sheet.getLastRow()-1,1).getDisplayValues().flat();
  for (let index=values.length-1; index>=0; index-=1) {
    if (keys.includes(String(values[index]).trim())) sheet.deleteRow(index+2);
  }
}

function listRecords_() {
  const ss = getSpreadsheet_();
  const sheet = ensureSheet_(ss,SHEETS.dados);
  if (sheet.getLastRow() < 2) return [];

  const jsonColumn = HEADERS.BO_Dados.indexOf('RegistroJSON') + 1;
  return sheet.getRange(2,jsonColumn,sheet.getLastRow()-1,1).getDisplayValues().flat()
    .map(value => { try { return JSON.parse(value); } catch (_) { return null; } })
    .filter(Boolean);
}

function searchRecords_(query) {
  const raw = String(query || '').trim();
  if (!raw) return listRecords_().slice(0,100);
  const numeric = /^\d+$/.test(raw);
  const sequence = numeric ? Number(raw) : null;
  const term = raw.toLowerCase();

  return listRecords_().filter(record => {
    if (numeric) {
      const last = Number(String(record.numero || '').split('-').pop());
      return Number.isFinite(last) && last === sequence;
    }

    const basic = record.basic || {};
    const operator = record.operator || {};
    const text = [
      record.numero,record.numeroTemporario,basic.referencia,basic.referenciaOutra,
      basic.nomeEmissor,basic.matriculaEmissor,basic.emailEmissor,basic.local,
      basic.complementoLocal,basic.diretoria,operator.usuario,operator.registro,operator.turno,
      ...(record.people || []).map(person => `${person.nome || ''} ${person.matricula || ''} ${person.numeroDocumento || ''}`),
      ...(record.vehicles || []).map(vehicle => vehicle.placa || vehicle.chassi || ''),
      ...(record.materials || []).map(material => material.denominacao || '')
    ].join(' ').toLowerCase();
    return text.includes(term);
  }).slice(0,100);
}

function getRecordByNumber_(numero) {
  const target = String(numero || '');
  return listRecords_().find(record => String(record.numero) === target || String(record.numeroTemporario) === target) || null;
}

function diagnosticoEstrutura_() {
  const ss = getSpreadsheet_();
  return Object.keys(HEADERS).map(name => {
    const sheet = ss.getSheetByName(name);
    return {
      name,
      expectedColumns:HEADERS[name].length,
      actualColumns:sheet ? sheet.getMaxColumns() : 0,
      rows:sheet ? sheet.getLastRow() : 0,
      exact:sheet ? HEADERS[name].every((header,index) => sheet.getRange(1,index+1).getDisplayValue() === header) && sheet.getMaxColumns() === HEADERS[name].length : false
    };
  });
}

function ensureOperationalVisibility_(ss) {
  Object.keys(HEADERS).forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (!sheet) return;
    sheet.showColumns(1, sheet.getMaxColumns());
  });
  hideTechnicalSheets_(ss);
}

function formatSheets_(ss) {
  Object.keys(HEADERS).forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (!sheet) return;
    const columns = HEADERS[name].length;
    const rows = Math.max(sheet.getLastRow(),2);
    sheet.showColumns(1, sheet.getMaxColumns());
    if (sheet.getFilter()) sheet.getFilter().remove();

    sheet.getRange(1,1,1,columns)
      .setBackground('#0b2235')
      .setFontColor('#ffffff')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
    sheet.getRange(2,1,rows-1,columns).setVerticalAlignment('top');
    if (![SHEETS.dados,SHEETS.sequencia].includes(name)) {
      sheet.getRange(1,1,rows,columns).createFilter();
    }
  });

  const occurrences = ss.getSheetByName(SHEETS.ocorrencias);
  occurrences.setColumnWidth(1,145);
  occurrences.setColumnWidth(2,95);
  occurrences.setColumnWidths(3,2,90);
  occurrences.setColumnWidth(5,230);
  occurrences.setColumnWidth(6,190);
  occurrences.setColumnWidth(7,130);
  occurrences.setColumnWidth(8,210);
  occurrences.setColumnWidth(9,115);
  occurrences.setColumnWidth(10,260);
  occurrences.setColumnWidth(11,190);
  occurrences.setColumnWidth(12,180);
  occurrences.setColumnWidth(13,125);
  occurrences.setColumnWidth(14,115);
  occurrences.setColumnWidths(15,2,360);
  occurrences.setColumnWidths(17,3,85);
  occurrences.setColumnWidths(20,2,170);
  occurrences.getRange('O:P').setWrap(true);

  ss.getSheetByName(SHEETS.pessoas).setColumnWidths(1,10,150);
  ss.getSheetByName(SHEETS.veiculos).setColumnWidths(1,7,160);
  ss.getSheetByName(SHEETS.materiais).setColumnWidths(1,9,155);
  ss.getSheetByName(SHEETS.anexos).setColumnWidths(1,5,185);
  ss.getSheetByName(SHEETS.complementos).setColumnWidths(1,5,190);
  ss.getSheetByName(SHEETS.acessos).setColumnWidths(1,4,175);
  ss.getSheetByName(SHEETS.acessos).setColumnWidth(5,190);
  ss.getSheetByName(SHEETS.acessos).setColumnWidth(6,105);
  ss.getSheetByName(SHEETS.acessos).getRange('E:E').setWrap(true);

  occurrences.getRange('C:C').setNumberFormat('dd/mm/yyyy');
  occurrences.getRange('D:D').setNumberFormat('hh:mm');
  occurrences.getRange('T:U').setNumberFormat('dd/mm/yyyy hh:mm');
  ss.getSheetByName(SHEETS.acessos).getRange('D:D').setNumberFormat('dd/mm/yyyy hh:mm');

  const dataRows = Math.max(occurrences.getMaxRows() - 1, 1);
  const statusRange = occurrences.getRange(2,2,dataRows,1);
  occurrences.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Finalizado').setBackground('#d9ead3').setFontColor('#274e13').setRanges([statusRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Rascunho').setBackground('#fff2cc').setFontColor('#7f6000').setRanges([statusRange]).build()
  ]);
}

function hideTechnicalSheets_(ss) {
  [SHEETS.dados,SHEETS.sequencia].forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (sheet && !sheet.isSheetHidden()) sheet.hideSheet();
  });
}

function errorMessage_(error) {
  return String((error && error.message) || error || 'Erro desconhecido.');
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
