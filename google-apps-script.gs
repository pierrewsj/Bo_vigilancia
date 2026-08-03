/**
 * BO DIGITAL GSP — Google Sheets API v4.0
 *
 * Atualização principal:
 * - número oficial do BO gerado no servidor com LockService;
 * - pesquisa direta na planilha;
 * - complementos/retificações preservados;
 * - relacionamentos por IDs;
 * - anexos enviados para pasta privada no Google Drive;
 * - compatibilidade com os registros JSON das versões anteriores;
 * - login do vigilante registrado na aba BO_Acessos;
 * - identificação do vigilante gravada em cada BO.
 */

const APP_VERSION = '4.2.0';
const SHEETS = Object.freeze({
  ocorrencias: 'BO_Ocorrencias',
  pessoas: 'BO_Pessoas',
  veiculos: 'BO_Veiculos',
  materiais: 'BO_Materiais',
  anexos: 'BO_Anexos',
  complementos: 'BO_Complementos',
  sequencia: 'BO_Sequencia',
  acessos: 'BO_Acessos'
});

const HEADERS = Object.freeze({
  BO_Ocorrencias: [
    'ID','NumeroBO','Status','Data','Hora','Referencia','ReferenciaOutra','MatriculaSolicitante','NomeSolicitante','EmailSolicitante',
    'Local','ComplementoLocal','Diretoria','DiretoriaOutra','SemPessoaIdentificada','ConfirmouRevisao','ConfirmouVeracidade',
    'Relato','Providencias','Observacoes','CriadoEm','AtualizadoEm','FinalizadoEm','SincronizadoEm','VersaoApp','RegistroJSON',
    'TurnoSolicitante','UsuarioVigilante','RegistroVigilante','TurnoVigilante','LoginVigilanteEm','NumeroTemporario','SyncStatus','VerificacoesJSON','ComplementosJSON','AuditoriaJSON'
  ],
  BO_Pessoas: ['NumeroBO','PessoaID','Tipo','Vinculo','Nome','Empresa','Matricula','Telefone','TipoDocumento','NumeroDocumento','DadosComplementares','Observacao','Setor','RegistroID'],
  BO_Veiculos: ['NumeroBO','VeiculoID','PlacaChassi','Marca','Modelo','Empresa','PessoaRelacionada','Observacao','PessoaID','RegistroID'],
  BO_Materiais: ['NumeroBO','MaterialID','Denominacao','MVMNotaFiscal','Fornecedor','Desenho','CodigoVasilhame','Quantidade','Unidade','PessoaRelacionada','Observacao','PessoaID','RegistroID'],
  BO_Anexos: ['NumeroBO','AnexoID','NomeArquivo','Tipo','TamanhoBytes','DriveFileID','DriveURL','EnviadoEm','RegistroID'],
  BO_Complementos: ['NumeroBO','ComplementoID','Tipo','Texto','Responsavel','CriadoEm','RegistroID'],
  BO_Sequencia: ['Ano','UltimoNumero','AtualizadoEm'],
  BO_Acessos: ['IDAcesso','UsuarioVigilante','RegistroVigilante','TurnoVigilante','LoginEm','RegistradoEm','Dispositivo']
});

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Abra este script a partir da planilha que será usada como banco.');
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  ensureSheets_(ss);
  getAttachmentRootFolder_();
  return `Banco BO Digital configurado — API ${APP_VERSION}`;
}

function doGet(e) {
  try {
    const params = (e && e.parameter) || {};
    const action = String(params.action || 'ping').toLowerCase();
    if (action === 'ping') return json_({ ok: true, message: 'Google Sheets conectado ao BO Digital.', version: APP_VERSION });
    if (action === 'list') return json_({ ok: true, records: listRecords_() });
    if (action === 'search') return json_({ ok: true, records: searchRecords_(String(params.q || '')) });
    if (action === 'get') return json_({ ok: true, record: getRecordByNumber_(String(params.numero || '')) });
    return json_({ ok: false, error: 'Ação GET não reconhecida.' });
  } catch (error) {
    return json_({ ok: false, error: errorMessage_(error) });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const action = String(payload.action || '').toLowerCase();
    if (action === 'login') {
      const operator = validateOperator_(payload.operator);
      logAccess_(operator);
      SpreadsheetApp.flush();
      return json_({ ok: true, message: 'Acesso do vigilante registrado.', version: APP_VERSION });
    }
    if (action !== 'upsert') throw new Error('Ação POST não reconhecida.');
    const record = payload.record;
    validateRecord_(record);
    const officialNumber = ensureOfficialNumber_(record);
    record.attachments = processAttachments_(record.attachments || [], officialNumber);
    record.syncStatus = 'synced';
    record.syncedAt = new Date().toISOString();
    if (record.operator && record.operator.usuario && record.operator.registro && record.operator.turno) {
      logAccess_(validateOperator_(record.operator));
    }
    upsertRecord_(record);
    SpreadsheetApp.flush();
    return json_({
      ok: true,
      officialNumber,
      numero: officialNumber,
      attachments: (record.attachments || []).map(stripAttachmentData_),
      message: 'Boletim salvo na planilha.'
    });
  } catch (error) {
    return json_({ ok: false, error: errorMessage_(error) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function getSpreadsheet_() {
  const properties = PropertiesService.getScriptProperties();
  const id = properties.getProperty('SPREADSHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Execute a função setup uma vez antes de publicar.');
  properties.setProperty('SPREADSHEET_ID', ss.getId());
  return ss;
}

function ensureSheets_(ss) {
  Object.keys(HEADERS).forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    const headers = HEADERS[name];
    if (sheet.getMaxColumns() < headers.length) sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  });
}

function validateOperator_(operator) {
  if (!operator || typeof operator !== 'object') throw new Error('Dados do vigilante não enviados.');
  const clean = {
    accessId: String(operator.accessId || `${operator.registro || 'SEM'}-${operator.loginAt || Date.now()}`).trim(),
    usuario: String(operator.usuario || '').trim(),
    registro: String(operator.registro || '').trim(),
    turno: String(operator.turno || '').trim(),
    loginAt: String(operator.loginAt || new Date().toISOString()),
    dispositivo: String(operator.dispositivo || '')
  };
  if (!clean.usuario) throw new Error('Usuário do vigilante não informado.');
  if (!/^\d+$/.test(clean.registro)) throw new Error('Registro do vigilante inválido.');
  if (!clean.turno) throw new Error('Turno do vigilante não informado.');
  return clean;
}

function logAccess_(operator) {
  const ss = getSpreadsheet_();
  ensureSheets_(ss);
  const sheet = ss.getSheetByName(SHEETS.acessos);
  const row = [
    operator.accessId || Utilities.getUuid(), operator.usuario, operator.registro, operator.turno,
    operator.loginAt, new Date().toISOString(), operator.dispositivo || ''
  ];
  upsertByKey_(sheet, 1, String(row[0]), row);
}

function testarRegistroLogin() {
  const operator = validateOperator_({
    accessId: `TESTE-${Date.now()}`,
    usuario: 'TESTE DE CONEXÃO',
    registro: '99999',
    turno: 'Administrativo',
    loginAt: new Date().toISOString(),
    dispositivo: 'Teste manual do Apps Script'
  });
  logAccess_(operator);
  SpreadsheetApp.flush();
  return 'Teste criado com sucesso na aba BO_Acessos.';
}

function validateRecord_(record) {
  if (!record || typeof record !== 'object') throw new Error('Registro não enviado.');
  if (!String(record.id || '').trim()) throw new Error('ID do registro não informado.');
}

function ensureOfficialNumber_(record) {
  const current = String(record.numero || '');
  if (/^BO-\d{4}-\d{6}$/.test(current)) return current;
  const dateText = String((record.basic && record.basic.data) || '');
  const year = /^\d{4}-/.test(dateText) ? Number(dateText.slice(0, 4)) : new Date().getFullYear();
  const ss = getSpreadsheet_();
  ensureSheets_(ss);
  const sheet = ss.getSheetByName(SHEETS.sequencia);
  const lastRow = sheet.getLastRow();
  let targetRow = 0;
  let lastNumber = 0;
  if (lastRow > 1) {
    const values = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    const index = values.findIndex(row => Number(row[0]) === year);
    if (index >= 0) {
      targetRow = index + 2;
      lastNumber = Number(values[index][1] || 0);
    }
  }
  if (!targetRow) targetRow = lastRow + 1;
  const next = lastNumber + 1;
  sheet.getRange(targetRow, 1, 1, 3).setValues([[year, next, new Date().toISOString()]]);
  const official = `BO-${year}-${String(next).padStart(6, '0')}`;
  record.numeroTemporario = record.numeroTemporario || current;
  record.numero = official;
  return official;
}

function getAttachmentRootFolder_() {
  const properties = PropertiesService.getScriptProperties();
  const savedId = properties.getProperty('ATTACHMENT_FOLDER_ID');
  if (savedId) {
    try { return DriveApp.getFolderById(savedId); } catch (_) {}
  }
  const folders = DriveApp.getFoldersByName('BO_Digital_GSP_Anexos');
  const folder = folders.hasNext() ? folders.next() : DriveApp.createFolder('BO_Digital_GSP_Anexos');
  properties.setProperty('ATTACHMENT_FOLDER_ID', folder.getId());
  return folder;
}

function getBoAttachmentFolder_(numero) {
  const root = getAttachmentRootFolder_();
  const safeName = String(numero || 'SEM_NUMERO').replace(/[^A-Za-z0-9_-]/g, '_');
  const folders = root.getFoldersByName(safeName);
  return folders.hasNext() ? folders.next() : root.createFolder(safeName);
}

function processAttachments_(attachments, numero) {
  if (!Array.isArray(attachments) || !attachments.length) return [];
  let folder = null;
  return attachments.map(attachment => {
    const item = Object.assign({}, attachment || {});
    if (item.driveFileId) return stripAttachmentData_(item);
    const dataUrl = String(item.dataUrl || '');
    if (!dataUrl) return stripAttachmentData_(item);
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) throw new Error(`Formato inválido do anexo: ${item.name || 'arquivo'}`);
    if (!folder) folder = getBoAttachmentFolder_(numero);
    const bytes = Utilities.base64Decode(match[2]);
    const mimeType = item.type || match[1] || 'application/octet-stream';
    const safeName = String(item.name || `anexo-${Date.now()}`).replace(/[\/:*?"<>|]/g, '_');
    const blob = Utilities.newBlob(bytes, mimeType, safeName);
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

function upsertRecord_(record) {
  const ss = getSpreadsheet_();
  ensureSheets_(ss);
  const numero = String(record.numero || '').trim();
  const basic = record.basic || {};
  const history = record.history || {};
  const verification = record.verification || {};
  const row = [
    record.id || '', numero, record.status || 'Rascunho', basic.data || '', basic.hora || '', basic.referencia || '', basic.referenciaOutra || '',
    basic.matriculaEmissor || '', basic.nomeEmissor || '', basic.emailEmissor || '', basic.local || '', basic.complementoLocal || '',
    basic.diretoria || '', basic.diretoriaOutra || '', verification.people === 'none',
    Boolean(record.acknowledgements && record.acknowledgements.reviewed), Boolean(record.acknowledgements && record.acknowledgements.truthful),
    history.relato || '', history.providencias || '', history.observacoes || history.adicional || '', record.createdAt || '', record.updatedAt || '',
    record.finalizedAt || '', new Date().toISOString(), APP_VERSION, JSON.stringify(record), basic.turnoEmissor || '',
    (record.operator && record.operator.usuario) || '', (record.operator && record.operator.registro) || '',
    (record.operator && record.operator.turno) || '', (record.operator && record.operator.loginAt) || '',
    record.numeroTemporario || '', record.syncStatus || '', JSON.stringify(verification), JSON.stringify(record.amendments || []), JSON.stringify(record.auditTrail || [])
  ];
  upsertByKey_(ss.getSheetByName(SHEETS.ocorrencias), 1, String(record.id), row);
  const oldNumbers = [numero, record.numeroTemporario].filter(Boolean);
  replaceChildren_(ss.getSheetByName(SHEETS.pessoas), oldNumbers, record.id, (record.people || []).map(p => [
    numero,p.id||'',p.tipo||'',p.vinculo||'',p.nome||'',p.empresa||'',p.matricula||'',p.telefone||'',p.tipoDocumento||'',p.numeroDocumento||'',p.dadosComplementares||'',p.observacao||'',p.setor||'',record.id
  ]));
  replaceChildren_(ss.getSheetByName(SHEETS.veiculos), oldNumbers, record.id, (record.vehicles || []).map(v => [
    numero,v.id||'',v.placa||'',v.marca||'',v.modelo||'',v.empresa||'',v.pessoaNome||'',v.observacao||'',v.pessoaId||'',record.id
  ]));
  replaceChildren_(ss.getSheetByName(SHEETS.materiais), oldNumbers, record.id, (record.materials || []).map(m => [
    numero,m.id||'',m.denominacao||'',m.mvm||'',m.fornecedor||'',m.desenho||'',m.codigoVasilhame||'',m.quantidade||'',m.unidade||'',m.pessoaNome||'',m.observacao||'',m.pessoaId||'',record.id
  ]));
  replaceChildren_(ss.getSheetByName(SHEETS.anexos), oldNumbers, record.id, (record.attachments || []).map(a => [
    numero,a.id||'',a.name||'',a.type||'',a.size||0,a.driveFileId||'',a.driveUrl||'',a.uploadedAt||'',record.id
  ]));
  replaceChildren_(ss.getSheetByName(SHEETS.complementos), oldNumbers, record.id, (record.amendments || []).map(a => [
    numero,a.id||'',a.tipo||'',a.texto||'',a.responsavel||'',a.createdAt||'',record.id
  ]));
}

function upsertByKey_(sheet, keyColumn, keyValue, row) {
  const lastRow = sheet.getLastRow();
  let targetRow = 0;
  if (lastRow > 1) {
    const values = sheet.getRange(2, keyColumn, lastRow - 1, 1).getDisplayValues().flat();
    const index = values.findIndex(value => String(value).trim() === keyValue);
    if (index >= 0) targetRow = index + 2;
  }
  if (!targetRow) targetRow = lastRow + 1;
  sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
}

function replaceChildren_(sheet, numbers, recordId, rows) {
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const width = Math.max(1, sheet.getLastColumn());
    const values = sheet.getRange(2, 1, lastRow - 1, width).getDisplayValues();
    for (let index = values.length - 1; index >= 0; index--) {
      const row = values[index];
      const numberMatch = numbers.includes(String(row[0]).trim());
      const idMatch = row.includes(String(recordId));
      if (numberMatch || idMatch) sheet.deleteRow(index + 2);
    }
  }
  if (rows.length) sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
}

function listRecords_() {
  const ss = getSpreadsheet_();
  ensureSheets_(ss);
  const sheet = ss.getSheetByName(SHEETS.ocorrencias);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const jsonColumn = HEADERS.BO_Ocorrencias.indexOf('RegistroJSON') + 1;
  return sheet.getRange(2, jsonColumn, lastRow - 1, 1).getDisplayValues().flat().map(value => {
    try { return JSON.parse(value); } catch (_) { return null; }
  }).filter(Boolean);
}

function searchRecords_(query) {
  const raw = String(query || '').trim();
  if (!raw) return listRecords_().slice(0, 100);
  const numeric = /^\d+$/.test(raw);
  const sequence = numeric ? Number(raw) : null;
  const term = raw.toLowerCase();
  return listRecords_().filter(record => {
    if (numeric) {
      const last = Number(String(record.numero || '').split('-').pop());
      return Number.isFinite(last) && last === sequence;
    }
    const basic = record.basic || {};
    const text = [record.numero,record.numeroTemporario,basic.referencia,basic.referenciaOutra,basic.nomeEmissor,basic.matriculaEmissor,basic.local,basic.complementoLocal,basic.diretoria,record.operator && record.operator.usuario,record.operator && record.operator.registro,record.operator && record.operator.turno,
      ...(record.people || []).map(p => `${p.nome} ${p.matricula} ${p.numeroDocumento}`),
      ...(record.vehicles || []).map(v => v.placa), ...(record.materials || []).map(m => m.denominacao)
    ].join(' ').toLowerCase();
    return text.includes(term);
  }).slice(0, 100);
}

function getRecordByNumber_(numero) {
  return listRecords_().find(record => String(record.numero) === String(numero) || String(record.numeroTemporario) === String(numero)) || null;
}

function errorMessage_(error) { return String(error && error.message || error); }
function json_(payload) { return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON); }
