/**
 * BO DIGITAL GSP — Banco de dados em Google Sheets
 *
 * Uso:
 * 1. Crie uma planilha Google em branco.
 * 2. Abra Extensões > Apps Script.
 * 3. Substitua o conteúdo pelo código deste arquivo.
 * 4. Execute a função setup uma vez e autorize.
 * 5. Implantar > Nova implantação > Aplicativo da Web.
 * 6. Executar como: você. Acesso: conforme permitido pela organização.
 * 7. Copie o URL terminado em /exec para a aba Banco do PWA.
 */

const SHEETS = {
  ocorrencias: 'BO_Ocorrencias',
  pessoas: 'BO_Pessoas',
  veiculos: 'BO_Veiculos',
  materiais: 'BO_Materiais',
  anexos: 'BO_Anexos'
};

const HEADERS = {
  BO_Ocorrencias: [
    'ID', 'NumeroBO', 'Status', 'Data', 'Hora', 'Referencia', 'ReferenciaOutra',
    'MatriculaEmissor', 'NomeEmissor', 'EmailEmissor', 'Local', 'ComplementoLocal',
    'Diretoria', 'DiretoriaOutra', 'Relato', 'Providencias', 'Observacoes',
    'CriadoEm', 'AtualizadoEm', 'FinalizadoEm', 'SincronizadoEm', 'RegistroJSON'
  ],
  BO_Pessoas: [
    'NumeroBO', 'PessoaID', 'Tipo', 'Vinculo', 'Nome', 'Empresa', 'Matricula',
    'Telefone', 'TipoDocumento', 'NumeroDocumento', 'DadosComplementares', 'Observacao'
  ],
  BO_Veiculos: [
    'NumeroBO', 'VeiculoID', 'PlacaChassi', 'Marca', 'Modelo', 'Empresa',
    'PessoaRelacionada', 'Observacao'
  ],
  BO_Materiais: [
    'NumeroBO', 'MaterialID', 'Denominacao', 'MVMNotaFiscal', 'Fornecedor', 'Desenho',
    'CodigoVasilhame', 'Quantidade', 'Unidade', 'PessoaRelacionada', 'Observacao'
  ],
  BO_Anexos: ['NumeroBO', 'AnexoID', 'NomeArquivo', 'Tipo', 'TamanhoBytes']
};

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Abra este script a partir da planilha Google que será usada como banco.');
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  ensureSheets_(ss);
  return 'Banco BO Digital configurado: ' + ss.getName();
}

function doGet(e) {
  try {
    const action = String((e && e.parameter && e.parameter.action) || 'ping').toLowerCase();
    if (action === 'ping') return json_({ ok: true, message: 'Google Sheets conectado ao BO Digital.' });
    if (action === 'list') return json_({ ok: true, records: listRecords_() });
    if (action === 'get') {
      const numero = String(e.parameter.numero || '').trim();
      return json_({ ok: true, record: getRecordByNumber_(numero) });
    }
    return json_({ ok: false, error: 'Ação GET não reconhecida.' });
  } catch (error) {
    return json_({ ok: false, error: String(error && error.message || error) });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const action = String(payload.action || '').toLowerCase();
    if (action !== 'upsert') return json_({ ok: false, error: 'Ação POST não reconhecida.' });
    const record = payload.record;
    validateRecord_(record);
    upsertRecord_(record);
    return json_({ ok: true, numero: record.numero, message: 'Boletim salvo na planilha.' });
  } catch (error) {
    return json_({ ok: false, error: String(error && error.message || error) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function getSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Execute a função setup uma vez antes de publicar o aplicativo da Web.');
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  return ss;
}

function ensureSheets_(ss) {
  Object.keys(HEADERS).forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    const headers = HEADERS[name];
    if (sheet.getMaxColumns() < headers.length) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
    }
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  });
}

function validateRecord_(record) {
  if (!record || typeof record !== 'object') throw new Error('Registro do boletim não enviado.');
  if (!String(record.numero || '').trim()) throw new Error('Número do BO não informado.');
}

function upsertRecord_(record) {
  const ss = getSpreadsheet_();
  ensureSheets_(ss);
  const numero = String(record.numero).trim();
  const basic = record.basic || {};
  const history = record.history || {};
  const row = [
    record.id || '', numero, record.status || 'Rascunho', basic.data || '', basic.hora || '',
    basic.referencia || '', basic.referenciaOutra || '', basic.matriculaEmissor || '',
    basic.nomeEmissor || '', basic.emailEmissor || '', basic.local || '', basic.complementoLocal || '',
    basic.diretoria || '', basic.diretoriaOutra || '', history.relato || '',
    history.providencias || '', history.observacoes || '', record.createdAt || '',
    record.updatedAt || '', record.finalizedAt || '', new Date().toISOString(), JSON.stringify(record)
  ];

  upsertByKey_(ss.getSheetByName(SHEETS.ocorrencias), 2, numero, row);

  replaceChildren_(ss.getSheetByName(SHEETS.pessoas), numero, (record.people || []).map(p => [
    numero, p.id || '', p.tipo || '', p.vinculo || '', p.nome || '', p.empresa || '',
    p.matricula || '', p.telefone || '', p.tipoDocumento || '', p.numeroDocumento || '',
    p.dadosComplementares || '', p.observacao || ''
  ]));

  replaceChildren_(ss.getSheetByName(SHEETS.veiculos), numero, (record.vehicles || []).map(v => [
    numero, v.id || '', v.placa || '', v.marca || '', v.modelo || '', v.empresa || '',
    v.pessoaNome || '', v.observacao || ''
  ]));

  replaceChildren_(ss.getSheetByName(SHEETS.materiais), numero, (record.materials || []).map(m => [
    numero, m.id || '', m.denominacao || '', m.mvm || '', m.fornecedor || '', m.desenho || '',
    m.codigoVasilhame || '', m.quantidade || '', m.unidade || '', m.pessoaNome || '', m.observacao || ''
  ]));

  replaceChildren_(ss.getSheetByName(SHEETS.anexos), numero, (record.attachments || []).map(a => [
    numero, a.id || '', a.name || '', a.type || '', a.size || 0
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

function replaceChildren_(sheet, numero, rows) {
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const values = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues().flat();
    for (let index = values.length - 1; index >= 0; index--) {
      if (String(values[index]).trim() === numero) sheet.deleteRow(index + 2);
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
  return sheet.getRange(2, jsonColumn, lastRow - 1, 1).getDisplayValues().flat()
    .map(value => {
      try { return JSON.parse(value); } catch (_) { return null; }
    })
    .filter(Boolean);
}

function getRecordByNumber_(numero) {
  return listRecords_().find(record => String(record.numero) === String(numero)) || null;
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
