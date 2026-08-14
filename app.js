'use strict';

const DB_NAME = 'bo-digital-prototipo';
const DB_VERSION = 1;
const STORE = 'boletins';
const SETTINGS_KEY = 'bo-digital-gsheets-settings-v1';
const OPERATOR_SESSION_KEY = 'bo-digital-operator-session-v2';
const APP_STATE_KEY = 'bo-digital-navigation-state-v1';
const PENDING_LOGIN_KEY = 'bo-digital-pending-login-v1';
const RECENT_LOCATIONS_KEY = 'bo-digital-recent-locations-v1';
const ENCRYPTION_SETTINGS_KEY = 'bo-digital-local-encryption-v1';
const ENCRYPTION_SESSION_KEY = 'bo-digital-local-encryption-session-v1';
const HEALTH_KEY = 'bo-digital-system-health-v1';
const SLA_SETTINGS_KEY = 'bo-digital-operational-time-v1';
const HANDOFF_KEY = 'bo-digital-handoff-notes-v1';
const ERROR_LOG_KEY = 'bo-digital-error-log-v1';
const LAUNCH_INTENT_KEY = 'bo-digital-launch-intent-v1';
const RETRY_DELAYS_MS = [10000, 30000, 60000, 120000, 300000];
const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbwrYFAMDKd02EQx41vsLsVI5TztZxOph7f7YJvJ8DDOwQoaFrCcxRr8HpNkBhlHlr-6TQ/exec';
const DEFAULT_SETTINGS = { apiUrl: DEFAULT_API_URL };
const APP_VERSION = '37.9.0';
const REQUIRED_API_VERSION = '6.3.0';
const REQUIRED_API_SCHEMA = 'compact-t';

const OTHER_REFERENCE = 'Outra situação relevante para registro';

const REFERENCE_DESCRIPTIONS = {
  'Tentativa de acesso não autorizado': 'Use quando houver tentativa ou realização de entrada ou saída sem autorização válida.',
  'Divergência de autorização ou credencial': 'Use para crachá, autorização, cadastro, visitante ou documentação de acesso divergente.',
  'Acesso fora do horário autorizado': 'Use quando o acesso ocorrer ou for tentado fora da faixa de horário permitida.',
  'Pessoa ou veículo em área de acesso restrito': 'Use para permanência ou circulação em local sem permissão.',
  'Outra ocorrência de acesso ou credenciamento': 'Use para outra ocorrência relacionada a portaria, entrada, saída ou credenciamento.',

  'Acidente ou colisão envolvendo veículo': 'Use para colisão, abalroamento, atropelamento, choque, capotamento ou outro acidente de trânsito interno.',
  'Avaria constatada em veículo': 'Use para dano identificado em automóvel, caminhão, carreta, equipamento móvel ou veículo industrial.',
  'Veículo apresentado com dano preexistente': 'Use quando o veículo chega à unidade com avaria já existente.',
  'Estacionamento ou circulação em desacordo com as normas': 'Use para parada, vaga, rota, manobra ou circulação fora do procedimento.',
  'Remoção ou transporte de veículo por reboque': 'Use para remoção, transporte ou liberação de veículo por reboque.',
  'Veículo não identificado ou em situação suspeita': 'Use quando houver veículo sem identificação suficiente ou com comportamento suspeito.',
  'Outra ocorrência envolvendo veículos ou circulação': 'Use para outra ocorrência relacionada a veículos ou tráfego interno.',

  'Avaria em material, peça, equipamento ou vasilhame': 'Use para dano em peça, embalagem, equipamento, volume ou vasilhame.',
  'Divergência de carga, quantidade ou documentação': 'Use para diferença de quantidade, MVM, nota fiscal, lacre, identificação ou documentação da carga.',
  'Suspeita de subtração de material em área interna': 'Use quando houver relato ou indícios de possível subtração de material dentro da unidade, sem antecipar conclusão sobre a natureza do fato.',
  'Suspeita de subtração de material em área externa': 'Use quando houver relato ou indícios de possível subtração em área externa vinculada à unidade, sem antecipar conclusão sobre autoria ou enquadramento.',
  'Desaparecimento de material ou equipamento': 'Use quando um item não for localizado e ainda não houver elementos suficientes para caracterizar possível subtração.',
  'Material ou equipamento localizado/recolhido': 'Use para item localizado, recolhido, entregue ou mantido sob guarda da segurança.',
  'Liberação ou conferência de carga': 'Use para acompanhamento, conferência, transporte, entrada ou saída de materiais.',
  'Outra ocorrência envolvendo materiais, peças ou cargas': 'Use para outra ocorrência relacionada a material, peça, equipamento ou carga.',

  'Agressão física ou confronto entre pessoas': 'Use quando houver relato ou constatação de agressão, tentativa de agressão ou confronto físico entre pessoas. Registre fatos observáveis e declarações separadamente.',
  'Ameaça, ofensa ou conflito interpessoal': 'Use para ameaça, ofensa verbal, constrangimento, discussão ou conflito interpessoal.',
  'Descumprimento de norma ou procedimento interno': 'Use para registrar situação observada em desacordo com norma, procedimento ou orientação interna, sem realizar enquadramento disciplinar.',
  'Alteração comportamental observada': 'Use para registrar sinais físicos ou comportamentais observáveis que indiquem alteração do estado habitual, sem diagnosticar causa ou atribuir consumo de substâncias.',
  'Mal-estar, atendimento médico ou acidente pessoal': 'Use para atendimento médico, mal-estar, lesão ou acidente envolvendo pessoa.',
  'Outra ocorrência envolvendo pessoas ou comportamento': 'Use para outra ocorrência diretamente relacionada a comportamento ou condição de pessoa.',

  'Dano em instalação, equipamento ou patrimônio': 'Use para dano em estrutura, prédio, máquina, mobiliário, sistema ou patrimônio da unidade.',
  'Incêndio ou princípio de incêndio': 'Use para fumaça, princípio de incêndio, incêndio confirmado ou dano decorrente.',
  'Situação de emergência operacional': 'Use para situação urgente que exija resposta imediata e controle do local.',
  'Falha operacional com impacto': 'Use quando uma falha de execução causar ou puder causar dano, risco ou interrupção.',
  'Vazamento, derramamento ou ocorrência ambiental': 'Use para vazamento, derramamento, emissão, descarte irregular ou risco ambiental.',
  'Outra ocorrência envolvendo instalações ou emergência': 'Use para outra ocorrência envolvendo patrimônio, instalação ou emergência.',

  'Irregularidade constatada em ronda interna': 'Use para constatação realizada durante ronda dentro da unidade.',
  'Irregularidade constatada em ronda externa': 'Use para constatação realizada durante ronda no perímetro ou área externa.',
  'Constatação em fiscalização ou inspeção de segurança': 'Use para fato, condição ou não conformidade observada durante fiscalização ou inspeção de segurança.',
  'Não conformidade identificada em processo ou procedimento': 'Use para registrar divergência entre o procedimento esperado e a condição observada, sem atribuição antecipada de responsabilidade.',
  'Suspeita de dano intencional ou sabotagem': 'Use quando houver indícios verificáveis que justifiquem apuração de possível ação intencional. Não atribua autoria ou intenção sem elementos objetivos.',
  'Ocorrência envolvendo empresa de segurança prestadora de serviço': 'Use para fato relacionado à equipe ou empresa terceirizada de segurança.',
  'Outra ocorrência relacionada à segurança patrimonial': 'Use para outra ocorrência identificada em atividade operacional da segurança.',

  'Ocorrência não enquadrada nas categorias existentes': 'Use quando o fato precisar ser registrado, mas não se enquadrar adequadamente em nenhuma categoria específica disponível.',
  [OTHER_REFERENCE]: 'Use somente quando nenhuma opção existente representar adequadamente a situação. Descreva a natureza do registro de forma objetiva.'
};

const POPULAR_REFERENCES = [
  'Tentativa de acesso não autorizado',
  'Acidente ou colisão envolvendo veículo',
  'Veículo apresentado com dano preexistente',
  'Avaria em material, peça, equipamento ou vasilhame',
  'Desaparecimento de material ou equipamento',
  'Irregularidade constatada em ronda interna'
];

const REFERENCE_GROUPS = [
  {
    label: 'Acesso e credenciamento',
    options: [
      'Tentativa de acesso não autorizado',
      'Divergência de autorização ou credencial',
      'Acesso fora do horário autorizado',
      'Pessoa ou veículo em área de acesso restrito',
      'Outra ocorrência de acesso ou credenciamento'
    ]
  },
  {
    label: 'Veículos e circulação',
    options: [
      'Acidente ou colisão envolvendo veículo',
      'Avaria constatada em veículo',
      'Veículo apresentado com dano preexistente',
      'Estacionamento ou circulação em desacordo com as normas',
      'Remoção ou transporte de veículo por reboque',
      'Veículo não identificado ou em situação suspeita',
      'Outra ocorrência envolvendo veículos ou circulação'
    ]
  },
  {
    label: 'Materiais, peças e cargas',
    options: [
      'Avaria em material, peça, equipamento ou vasilhame',
      'Divergência de carga, quantidade ou documentação',
      'Suspeita de subtração de material em área interna',
      'Suspeita de subtração de material em área externa',
      'Desaparecimento de material ou equipamento',
      'Material ou equipamento localizado/recolhido',
      'Liberação ou conferência de carga',
      'Outra ocorrência envolvendo materiais, peças ou cargas'
    ]
  },
  {
    label: 'Pessoas, comportamento e saúde',
    options: [
      'Agressão física ou confronto entre pessoas',
      'Ameaça, ofensa ou conflito interpessoal',
      'Descumprimento de norma ou procedimento interno',
      'Alteração comportamental observada',
      'Mal-estar, atendimento médico ou acidente pessoal',
      'Outra ocorrência envolvendo pessoas ou comportamento'
    ]
  },
  {
    label: 'Instalações, patrimônio e emergências',
    options: [
      'Dano em instalação, equipamento ou patrimônio',
      'Incêndio ou princípio de incêndio',
      'Situação de emergência operacional',
      'Falha operacional com impacto',
      'Vazamento, derramamento ou ocorrência ambiental',
      'Outra ocorrência envolvendo instalações ou emergência'
    ]
  },
  {
    label: 'Segurança patrimonial e controle',
    options: [
      'Irregularidade constatada em ronda interna',
      'Irregularidade constatada em ronda externa',
      'Constatação em fiscalização ou inspeção de segurança',
      'Não conformidade identificada em processo ou procedimento',
      'Suspeita de dano intencional ou sabotagem',
      'Ocorrência envolvendo empresa de segurança prestadora de serviço',
      'Outra ocorrência relacionada à segurança patrimonial'
    ]
  },
  {
    label: 'Ocorrências não classificadas',
    options: ['Ocorrência não enquadrada nas categorias existentes', OTHER_REFERENCE]
  }
];
const REFERENCES = REFERENCE_GROUPS.flatMap(group => group.options);

const LEGACY_REFERENCE_MAP = Object.freeze({
  // Nomenclaturas anteriores à padronização v32
  'Acesso': 'Outra ocorrência de acesso ou credenciamento',
  'Ato doloso': 'Suspeita de dano intencional ou sabotagem',
  'Auditoria de processos': 'Não conformidade identificada em processo ou procedimento',
  'Carga de materiais': 'Liberação ou conferência de carga',
  'Emergência': 'Situação de emergência operacional',
  'Fiscalização': 'Constatação em fiscalização ou inspeção de segurança',
  'Irregularidade': 'Ocorrência não enquadrada nas categorias existentes',
  'Ocorrência médica': 'Mal-estar, atendimento médico ou acidente pessoal',
  'Ronda (interna / externa)': 'Irregularidade constatada em ronda interna',
  'Sintomas de embriaguez': 'Alteração comportamental observada',
  'Transgressão disciplinar': 'Descumprimento de norma ou procedimento interno',
  'Veículos': 'Outra ocorrência envolvendo veículos ou circulação',
  'Souza Lima': 'Ocorrência envolvendo empresa de segurança prestadora de serviço',
  'Danos materiais — Agressão física': 'Agressão física ou confronto entre pessoas',
  'Danos materiais — Avaria em peças / vasilhames': 'Avaria em material, peça, equipamento ou vasilhame',
  'Danos materiais — Danos às instalações industriais': 'Dano em instalação, equipamento ou patrimônio',
  'Danos materiais — Entrada com danos': 'Veículo apresentado com dano preexistente',
  'Danos materiais — Erro operacional': 'Falha operacional com impacto',
  'Danos materiais — Faixa horária inválida': 'Acesso fora do horário autorizado',
  'Danos materiais — Furto em área externa': 'Suspeita de subtração de material em área externa',
  'Danos materiais — Furto em área interna': 'Suspeita de subtração de material em área interna',
  'Danos materiais — Incêndio': 'Incêndio ou princípio de incêndio',
  'Danos materiais — Ofensa moral': 'Ameaça, ofensa ou conflito interpessoal',
  'Danos materiais — Queixa de desaparecimento de material / equipamento': 'Desaparecimento de material ou equipamento',
  'Danos materiais — Recolhimento de material / equipamento': 'Material ou equipamento localizado/recolhido',
  'Danos materiais — Transporte por reboque': 'Remoção ou transporte de veículo por reboque',
  'Danos materiais — Outra': OTHER_REFERENCE,

  // Nomenclaturas utilizadas pela v32 — mantidas para abrir registros antigos sem perda
  'Acesso não autorizado': 'Tentativa de acesso não autorizado',
  'Entrada ou saída fora do horário autorizado': 'Acesso fora do horário autorizado',
  'Pessoa ou veículo em área restrita': 'Pessoa ou veículo em área de acesso restrito',
  'Controle de acesso — outra situação': 'Outra ocorrência de acesso ou credenciamento',
  'Acidente ou colisão com veículo': 'Acidente ou colisão envolvendo veículo',
  'Avaria em veículo': 'Avaria constatada em veículo',
  'Entrada de veículo com danos': 'Veículo apresentado com dano preexistente',
  'Estacionamento ou circulação irregular': 'Estacionamento ou circulação em desacordo com as normas',
  'Remoção ou transporte por reboque': 'Remoção ou transporte de veículo por reboque',
  'Veículo suspeito ou não identificado': 'Veículo não identificado ou em situação suspeita',
  'Veículos e circulação — outra situação': 'Outra ocorrência envolvendo veículos ou circulação',
  'Avaria em peças, equipamentos ou vasilhames': 'Avaria em material, peça, equipamento ou vasilhame',
  'Furto de material em área interna': 'Suspeita de subtração de material em área interna',
  'Furto de material em área externa': 'Suspeita de subtração de material em área externa',
  'Material ou equipamento encontrado/recolhido': 'Material ou equipamento localizado/recolhido',
  'Materiais, peças e cargas — outra situação': 'Outra ocorrência envolvendo materiais, peças ou cargas',
  'Agressão física': 'Agressão física ou confronto entre pessoas',
  'Ameaça, ofensa ou conflito': 'Ameaça, ofensa ou conflito interpessoal',
  'Descumprimento de norma ou transgressão disciplinar': 'Descumprimento de norma ou procedimento interno',
  'Sintomas de embriaguez ou alteração de comportamento': 'Alteração comportamental observada',
  'Ocorrência médica, mal-estar ou acidente pessoal': 'Mal-estar, atendimento médico ou acidente pessoal',
  'Pessoas e conduta — outra situação': 'Outra ocorrência envolvendo pessoas ou comportamento',
  'Emergência operacional': 'Situação de emergência operacional',
  'Falha ou erro operacional com impacto': 'Falha operacional com impacto',
  'Ocorrência ambiental, vazamento ou derramamento': 'Vazamento, derramamento ou ocorrência ambiental',
  'Instalações e emergências — outra situação': 'Outra ocorrência envolvendo instalações ou emergência',
  'Fato identificado em ronda interna': 'Irregularidade constatada em ronda interna',
  'Fato identificado em ronda externa': 'Irregularidade constatada em ronda externa',
  'Fiscalização ou inspeção de segurança': 'Constatação em fiscalização ou inspeção de segurança',
  'Auditoria ou descumprimento de processo': 'Não conformidade identificada em processo ou procedimento',
  'Ato doloso, dano intencional ou sabotagem': 'Suspeita de dano intencional ou sabotagem',
  'Ocorrência envolvendo empresa prestadora de segurança': 'Ocorrência envolvendo empresa de segurança prestadora de serviço',
  'Atividade de segurança — outra situação': 'Outra ocorrência relacionada à segurança patrimonial',
  'Irregularidade não classificada': 'Ocorrência não enquadrada nas categorias existentes',
  'Outra ocorrência': OTHER_REFERENCE
});

function normalizeReference(value = '') {
  const clean = String(value || '').trim();
  return LEGACY_REFERENCE_MAP[clean] || clean;
}

function isOtherReference(value = '') {
  return normalizeReference(value) === OTHER_REFERENCE;
}

function resolvedReference(basic = {}) {
  return isOtherReference(basic.referencia)
    ? (String(basic.referenciaOutra || '').trim() || OTHER_REFERENCE)
    : normalizeReference(basic.referencia);
}

const DIRECTORATES = [
  'BRAND MARKETING','COMMERCIAL FIAT','COMMERCIAL JEEP','COMPRAS','COMUNICAÇÃO CORPORATIVA',
  'CUSTOMER CARE','DESENVOLVIMENTO DE REDE','DESIGN','ENGENHARIA','FIAT BRAND','FINANCE','ICT',
  'JEEP BRAND','JURÍDICO','MANUFATURA','MOPAR','PORTIFÓLIO','PRESIDÊNCIA','PRODUTO','QUALIDADE',
  'RECURSOS HUMANOS','SUPPLY CHAIN','Não identificada','Não se aplica','Outra'
];
const LOCATIONS = ['Galpão','Portaria','Pátio','Estacionamento','Rua','Almoxarifado','Área interna','Área externa','Outro'];
const STEPS = ['Ocorrência','Dados essenciais','Apuração','Providências e evidências','Revisão'];
const ORIGIN_OPTIONS = ['Solicitação recebida','Ronda interna','Ronda externa','Fiscalização / O.S.','Auditoria','Revista / controle de acesso','Constatação espontânea da Segurança','Outro'];
const ROUND_ORIGINS = new Set(['Ronda interna','Ronda externa']);
const SUBMODEL_LIBRARY = window.BO_SUBMODEL_LIBRARY || {};
const ROUTING_QUESTION_IDS = window.BO_ROUTING_QUESTION_IDS || {};
const QUESTION_CONDITIONS = window.BO_QUESTION_CONDITIONS || {};
const QUESTION_EXCLUSIONS = window.BO_QUESTION_EXCLUSIONS || {};
const EVIDENCE_REQUIREMENTS = window.BO_EVIDENCE_REQUIREMENTS || {};


function referenceFlow(reference = '') {
  const value = normalizeAssistantText(normalizeReference(reference));
  return {
    people: true,
    vehicles: /(veiculo|colisao|acidente|reboque|estacionamento|circulacao|acesso|area restrita)/.test(value),
    materials: /(material|peca|vasilhame|carga|equipamento|mvm|nota fiscal|subtracao|furto|desaparecimento|recolhido|localizado)/.test(value),
    attachments: /(dano|avaria|subtracao|furto|incendio|irregularidade|veiculo|agressao|ameaca|sabotagem|vazamento|derramamento|acidente)/.test(value),
    medical: /(medic|mal-estar|acidente pessoal|alteracao comportamental|embriaguez|agressao)/.test(value)
  };
}

const TEMPLATE_LIBRARY = window.BO_TEMPLATE_LIBRARY || {};

function referenceGroup(reference = '') {
  const normalized = normalizeReference(reference);
  return REFERENCE_GROUPS.find(group => group.options.includes(normalized)) || null;
}

function referenceCategory(reference = '') {
  return referenceGroup(reference)?.label || '';
}

function templateFor(reference = '') {
  const normalized = normalizeReference(reference);
  return TEMPLATE_LIBRARY[normalized] || TEMPLATE_LIBRARY[OTHER_REFERENCE] || {
    entities:{people:'recommended',witnesses:'recommended',vehicles:'recommended',materials:'recommended'},
    evidence:'recommended', guidance:'Registre os fatos de forma objetiva.', questions:[]
  };
}

function submodelsFor(reference = '') {
  return SUBMODEL_LIBRARY[normalizeReference(reference)] || [];
}

function selectedSubmodel(record = state.current) {
  const id = String(record?.templateData?.submodel || '').trim();
  return submodelsFor(record?.basic?.referencia).find(item => item.id === id) || null;
}

const REFERENCE_SUBMODEL_SEPARATOR = '::sub::';

function referenceSelectionValue(reference = '', submodel = '') {
  const ref = normalizeReference(reference || '');
  return submodel ? `${ref}${REFERENCE_SUBMODEL_SEPARATOR}${submodel}` : ref;
}

function parseReferenceSelection(value = '') {
  const raw = String(value || '');
  const marker = raw.indexOf(REFERENCE_SUBMODEL_SEPARATOR);
  if (marker < 0) return { reference: normalizeReference(raw), submodel: '' };
  return {
    reference: normalizeReference(raw.slice(0, marker)),
    submodel: raw.slice(marker + REFERENCE_SUBMODEL_SEPARATOR.length)
  };
}

function bulletinDisplayType(record = state.current) {
  return selectedSubmodel(record)?.label || resolvedReference(record?.basic || {}) || '';
}

function isRoundOrigin(record = state.current) {
  return ROUND_ORIGINS.has(String(record?.basic?.origemOcorrencia || '').trim());
}

function defaultOriginForReference(reference = '') {
  const normalized = normalizeReference(reference);
  if (normalized === 'Irregularidade constatada em ronda interna') return 'Ronda interna';
  if (normalized === 'Irregularidade constatada em ronda externa') return 'Ronda externa';
  return 'Solicitação recebida';
}

function requesterPresence(record = state.current) {
  if (isRoundOrigin(record)) return 'Não';
  const value = String(record?.basic?.temSolicitante || '').trim();
  if (value === 'Sim' || value === 'Não') return value;
  return '';
}

function requesterRequired(record = state.current) {
  return requesterPresence(record) === 'Sim';
}

function recordWithoutRequester(record = state.current) {
  return requesterPresence(record) === 'Não';
}

function clearRequesterData(record = state.current) {
  if (!record?.basic) return;
  record.basic.matriculaEmissor = '';
  record.basic.nomeEmissor = '';
  record.basic.emailEmissor = '';
  if (record.templateData) record.templateData.requesterRole = '';
  if (record.history) {
    record.history.inicio = '';
    record.history.fonteRelato = isRoundOrigin(record) ? 'Constatação da equipe em ronda' : '';
  }
}

function effectiveTemplate(record = state.current) {
  const base = templateFor(record?.basic?.referencia);
  const submodel = selectedSubmodel(record);
  return {
    ...base,
    entities:{...(base.entities||{}),...(submodel?.entities||{})},
    evidence:submodel?.evidence || base.evidence || 'recommended',
    guidance:[base.guidance, submodel?.guidance].filter(Boolean).join(' '),
    questions:[...(base.questions||[]),...(submodel?.extraQuestions||[])]
  };
}

function routingQuestionIds(reference = '') {
  return ROUTING_QUESTION_IDS[normalizeReference(reference)] || [];
}

function questionConditionFor(record, question) {
  return question.when || QUESTION_CONDITIONS[normalizeReference(record?.basic?.referencia)]?.[question.id] || null;
}

function questionVisible(record, question) {
  const when = questionConditionFor(record, question);
  if (!when) return true;
  const current = record?.templateData?.answers?.[when.id];
  if ('equals' in when) return current === when.equals;
  if (Array.isArray(when.in)) return when.in.includes(current);
  return true;
}

function questionExcludedFromInvestigation(record, question) {
  const excluded = QUESTION_EXCLUSIONS[normalizeReference(record?.basic?.referencia)] || [];
  return excluded.includes(question.id);
}

function routingQuestions(record = state.current) {
  const ids = routingQuestionIds(record?.basic?.referencia);
  const questions = effectiveTemplate(record).questions || [];
  return questions.filter(question => ids.includes(question.id) && questionVisible(record, question));
}

function effectiveEntityModes(record = state.current) {
  const modes = {...(effectiveTemplate(record).entities || {})};
  const reference = normalizeReference(record?.basic?.referencia || '');
  const answers = record?.templateData?.answers || {};
  if (reference === 'Pessoa ou veículo em área de acesso restrito') {
    if (answers.elemento === 'Pessoa') { modes.people='required'; modes.vehicles='hidden'; }
    else if (answers.elemento === 'Veículo') { modes.people='recommended'; modes.vehicles='required'; }
    else if (answers.elemento === 'Pessoa e veículo') { modes.people='required'; modes.vehicles='required'; }
  }
  if (reference === 'Tentativa de acesso não autorizado') {
    if (String(answers.tipoAcesso||'').includes('veículo')) modes.vehicles='required';
    else if (['Entrada de pessoa','Saída de pessoa'].includes(answers.tipoAcesso)) modes.vehicles='hidden';
  }
  if (reference === 'Acidente ou colisão envolvendo veículo' && answers.tipoAcidente === 'Queda de carga com impacto viário') modes.materials='required';
  if (reference === 'Divergência de carga, quantidade ou documentação') {
    modes.people = selectedSubmodel(record)?.entities?.people || 'recommended';
    modes.vehicles = selectedSubmodel(record)?.entities?.vehicles || 'recommended';
    modes.materials = 'required';
  }
  return modes;
}

function templateEntityMode(key, record = state.current) {
  return effectiveEntityModes(record)?.[key] || 'recommended';
}

function documentMode(record = state.current) {
  const reference = normalizeReference(record?.basic?.referencia || '');
  const sub = selectedSubmodel(record);
  if (sub?.documentMode) return sub.documentMode;
  if (reference === 'Liberação ou conferência de carga') return 'required';
  if (reference === 'Divergência de carga, quantidade ou documentação' && ['Quantidade','MVM/nota fiscal/documento'].includes(templateAnswer(record,'tipoDivergencia'))) return 'required';
  if (['Divergência de carga, quantidade ou documentação','Remoção ou transporte de veículo por reboque'].includes(reference)) return 'recommended';
  return 'hidden';
}

function documentTypesFor(record = state.current) {
  return selectedSubmodel(record)?.documentTypes || ['MVM','DANFE/NF','DEEM','Romaneio','Ordem de carga','Ficha Customer Care','O.S.','Guarda de objetos','Carta/declaração','Outro'];
}

function requiredDocumentTypesFor(record = state.current) {
  return selectedSubmodel(record)?.requiredDocumentTypes || [];
}

function evidenceRequirementsFor(record = state.current) {
  const reference = normalizeReference(record?.basic?.referencia || '');
  const base = (EVIDENCE_REQUIREMENTS[reference] || []).map(item => ({...item}));
  const sub = selectedSubmodel(record);
  const byId = new Map(base.map(item => [item.id,item]));
  (sub?.evidenceRequirements || []).forEach(item => byId.set(item.id,{...(byId.get(item.id)||{}),...item}));
  if (reference === 'Divergência de carga, quantidade ou documentação') {
    const kind = templateAnswer(record,'tipoDivergencia');
    if (kind === 'Lacre') byId.set('lacre',{id:'lacre',label:'Foto do lacre/identificação',type:'photo',required:true});
    if (['Quantidade','Identificação do material','Condição da carga'].includes(kind)) byId.set('carga',{id:'carga',label:'Foto da carga/material conferido',type:'photo',required:true});
  }
  return [...byId.values()];
}

function dynamicRequirementSnapshot(record = state.current) {
  const keys = new Set();
  const modes = effectiveEntityModes(record);
  ['people','witnesses','vehicles','materials'].forEach(key => { if (modes[key] === 'required') keys.add(key); });
  if (documentMode(record) === 'required') keys.add('documents');
  routingQuestions(record).filter(question => question.required).forEach(question => keys.add(`template:${question.id}`));
  templateQuestionList(record).filter(question => question.required).forEach(question => keys.add(`template:${question.id}`));
  evidenceRequirementsFor(record).filter(item => item.required).forEach(item => keys.add(`evidence:${item.id}`));
  if (requesterRequired(record)) keys.add('requester');
  else if (isRoundOrigin(record)) keys.add('round-operator');
  else if (recordWithoutRequester(record)) keys.add('operator-responsible');
  return keys;
}

function dynamicRequirementLabel(key, record = state.current) {
  const fixed = {
    people:'Pessoa envolvida', witnesses:'Testemunha', vehicles:'Veículo', materials:'Material/peça/carga',
    documents:'Documento da operação', requester:'Solicitante', 'round-operator':'Vigilante responsável pela ronda', 'operator-responsible':'Vigilante responsável pelo BO'
  };
  if (fixed[key]) return fixed[key];
  if (key.startsWith('template:')) {
    const id = key.slice(9);
    return (effectiveTemplate(record).questions || []).find(question => question.id === id)?.label || 'Informação do roteiro';
  }
  if (key.startsWith('evidence:')) {
    const id = key.slice(9);
    return evidenceRequirementsFor(record).find(item => item.id === id)?.label || 'Evidência';
  }
  return key;
}

function registerDynamicRequirementChanges(before = new Set(), after = new Set()) {
  const added = [...after].filter(key => !before.has(key));
  if (!added.length) return;
  state.dynamicRequirementKeys = added;
  state.dynamicRequirementAt = Date.now();
}

function dynamicRequirementActive(key) {
  if (!state.dynamicRequirementAt || Date.now() - state.dynamicRequirementAt > 15000) return false;
  return state.dynamicRequirementKeys.includes(key);
}

function dynamicRequirementBanner(record = state.current) {
  if (!state.dynamicRequirementAt || Date.now() - state.dynamicRequirementAt > 15000 || !state.dynamicRequirementKeys.length) return '';
  const labels = state.dynamicRequirementKeys.map(key => dynamicRequirementLabel(key, record)).filter(Boolean);
  return `<div class="dynamic-requirement-banner" role="status"><span>${ICONS.info}</span><div><strong>O roteiro foi adaptado</strong><p>Agora este cenário exige: ${labels.slice(0,5).map(escapeHtml).join(' • ')}${labels.length>5?` • +${labels.length-5}`:''}.</p></div></div>`;
}

function stepProgressData(step = state.currentStep, record = state.current) {
  const checklist = assistantChecklist(record).filter(item => item.level === 'required' && item.step === step && item.id !== 'history-report');
  const issues = collectStepIssues(step, record);
  const unique = [];
  const seen = new Set();
  issues.forEach(issue => {
    const signature = `${issue.id||''}|${issue.key||''}|${issue.message||''}`;
    if (!seen.has(signature)) { seen.add(signature); unique.push(issue); }
  });
  const okBase = checklist.filter(item => item.ok).length;
  const total = Math.max(checklist.length, okBase + unique.length);
  const completed = Math.max(0, total - unique.length);
  return { total, completed, missing: unique };
}

function renderStepProgressGuide(step = state.currentStep, record = state.current) {
  const data = stepProgressData(step, record);
  const percent = data.total ? Math.round((data.completed / data.total) * 100) : 100;
  const missingLabels = data.missing.slice(0,3).map(item => item.title && item.title !== 'Preenchimento incompleto' ? item.title : item.message);
  return `<div class="step-essential-progress" data-step-essential-progress><div class="step-essential-head"><strong data-step-progress-count>NEXO • Essenciais desta etapa: ${data.completed}/${data.total}</strong><span data-step-progress-state>${data.missing.length?'Ainda há pendências':'Tudo essencial conferido'}</span></div><div class="step-essential-track"><span data-step-progress-bar style="width:${percent}%"></span></div><div class="step-essential-missing" data-step-progress-missing>${missingLabels.length?missingLabels.map(label=>`<span>${escapeHtml(label)}</span>`).join(''):'<span class="complete">Pronto para continuar</span>'}</div></div>`;
}

function refreshStepProgressUi() {
  const root = app.querySelector('[data-step-essential-progress]');
  if (!root || !state.current) return;
  const data = stepProgressData(state.currentStep, state.current);
  const percent = data.total ? Math.round((data.completed / data.total) * 100) : 100;
  const count = root.querySelector('[data-step-progress-count]');
  const stateText = root.querySelector('[data-step-progress-state]');
  const bar = root.querySelector('[data-step-progress-bar]');
  const missing = root.querySelector('[data-step-progress-missing]');
  if (count) count.textContent = `NEXO • Essenciais desta etapa: ${data.completed}/${data.total}`;
  if (stateText) stateText.textContent = data.missing.length ? 'Ainda há pendências' : 'Tudo essencial conferido';
  if (bar) bar.style.width = `${percent}%`;
  if (missing) {
    const labels = data.missing.slice(0,3).map(item => item.title && item.title !== 'Preenchimento incompleto' ? item.title : item.message);
    missing.innerHTML = labels.length ? labels.map(label=>`<span>${escapeHtml(label)}</span>`).join('') : '<span class="complete">Pronto para continuar</span>';
  }
}


function nextRequiredElement(issue, step = state.currentStep) {
  if (!issue) return null;
  const id = String(issue.id || '');
  const key = String(issue.key || '');
  const control = id ? document.getElementById(id) : null;

  if (step === 0) {
    if (['bo-requester-presence','bo-name','bo-reg','bo-email'].includes(id)) {
      return control?.closest('.requester-presence-card') || document.querySelector('.requester-presence-card');
    }
    if (['bo-category','bo-ref','bo-ref-other','bo-origin','bo-date','bo-time','bo-local','bo-local-detail'].includes(id) || id.startsWith('template-')) {
      return control?.closest('.form-card') || document.querySelector('.occurrence-main-card');
    }
    if (['bo-directorate','bo-directorate-other','bo-sector'].includes(id)) {
      return control?.closest('.form-card') || document.querySelector('.area-related-card');
    }
  }

  if (control) {
    return control.closest('.template-question, .checkbox-card, .evidence-requirement, .field, .form-card, .related-block') || control;
  }
  if (key) {
    return document.querySelector(`[data-verification-key="${CSS.escape(key)}"]`)?.closest('.field, .form-card')
      || document.querySelector(`[data-correction-section="${CSS.escape(key)}"]`)
      || null;
  }
  return null;
}

function refreshNextRequiredHighlight() {
  app.querySelectorAll('.next-required-block').forEach(element => element.classList.remove('next-required-block'));
  if (!state.current || state.route !== 'wizard' || state.correctionFocus) return;
  const issue = collectStepIssues(state.currentStep, state.current)[0];
  const target = nextRequiredElement(issue, state.currentStep);
  if (target) target.classList.add('next-required-block');
}


const MATERIAL_LOAD_REFERENCES = new Set([
  'Divergência de carga, quantidade ou documentação',
  'Liberação ou conferência de carga'
]);

const MATERIAL_COMPACT_REFERENCES = new Set([
  'Material ou equipamento localizado/recolhido',
  'Irregularidade constatada em ronda interna',
  'Irregularidade constatada em ronda externa',
  'Constatação em fiscalização ou inspeção de segurança',
  'Outra ocorrência relacionada à segurança patrimonial',
  'Ocorrência não enquadrada nas categorias existentes',
  'Outra situação relevante para registro'
]);

function materialFieldPolicy(record = state.current, material = {}) {
  const reference = normalizeReference(record?.basic?.referencia || '');
  const answers = record?.templateData?.answers || {};
  const sub = selectedSubmodel(record);
  const loadContext = MATERIAL_LOAD_REFERENCES.has(reference) || Boolean(sub?.documentMode);
  const compactContext = MATERIAL_COMPACT_REFERENCES.has(reference);
  const quantityRequired = reference === 'Liberação ou conferência de carga' ||
    (reference === 'Divergência de carga, quantidade ou documentação' && answers.tipoDivergencia === 'Quantidade') ||
    ['deem-maior','deem-menor'].includes(sub?.id);
  const expectedQuantityCheck = (reference === 'Divergência de carga, quantidade ou documentação' && answers.tipoDivergencia === 'Quantidade') || ['deem-maior','deem-menor'].includes(sub?.id);
  const quantityCheck = Boolean(sub?.materialPolicy?.quantityCheck) || quantityRequired || ['Avaria em material, peça, equipamento ou vasilhame','Material ou equipamento localizado/recolhido'].includes(reference);
  const technicalIdCheck = Boolean(sub?.materialPolicy?.technicalIdCheck) || ['Avaria em material, peça, equipamento ou vasilhame','Divergência de carga, quantidade ou documentação','Liberação ou conferência de carga'].includes(reference);
  const showSupplier = loadContext;
  const showDrawing = technicalIdCheck;
  const showContainer = Boolean(sub?.materialPolicy?.showContainer) || /container|vasilhame/i.test(sub?.label || '');
  let guidance = 'Cadastre a identificação principal do item. Dados complementares só devem ser informados quando realmente existirem.';
  if (reference === 'Material ou equipamento localizado/recolhido' || isRoundOrigin(record)) {
    guidance = 'Priorize o que foi efetivamente encontrado: descrição, quantidade quando determinável, condição e localização. MVM, fornecedor, desenho e código de vasilhame só aparecem quando forem pertinentes.';
  } else if (loadContext) {
    guidance = 'Em contexto logístico, confirme quantidade, identificação e documentos aplicáveis. MVM só deve ser registrado quando esse documento realmente existir na operação.';
  }
  return { reference, loadContext, compactContext, quantityRequired, expectedQuantityCheck, quantityCheck, technicalIdCheck, showSupplier, showDrawing, showContainer, guidance };
}

function materialSectionDescription(record = state.current) {
  const policy = materialFieldPolicy(record);
  if (policy.compactContext) return 'Cadastre o item encontrado ou relacionado ao fato. Primeiro identifique se é peça, equipamento, máquina ou outro item; depois informe somente os dados realmente disponíveis.';
  if (policy.loadContext) return 'Cadastre a carga/item e os dados disponíveis. Documentos da operação são registrados em bloco próprio para evitar duplicidade.';
  return 'Identifique o tipo do item e cadastre somente informações confirmadas e diretamente ligadas ao fato.';
}

function inferMaterialItemType(material = {}) {
  const explicit = String(material.tipoItem || '').trim();
  if (['Peça','Equipamento','Máquina','Outro'].includes(explicit)) return explicit;
  const hasLegacyData = [material.denominacao,material.observacao,material.desenho,material.fornecedor,material.codigoVasilhame,material.quantidade].some(value=>String(value||'').trim());
  if (!hasLegacyData) return '';
  const text = normalizeAssistantText([material.denominacao,material.observacao].filter(Boolean).join(' '));
  if (/maquina/.test(text)) return 'Máquina';
  if (/equipamento/.test(text)) return 'Equipamento';
  if (material.desenho || /peca/.test(text)) return 'Peça';
  return 'Outro';
}

function materialItemTypeLabel(material = {}) {
  const type = inferMaterialItemType(material);
  return type === 'Outro' ? (String(material.tipoItemOutro || '').trim() || 'Outro item') : type;
}

function templateQuestionList(record = state.current, options = {}) {
  const includeRouting = options.includeRouting === true;
  const routing = routingQuestionIds(record?.basic?.referencia);
  return (effectiveTemplate(record).questions || []).filter(question => {
    if (!questionVisible(record,question)) return false;
    if (!includeRouting && routing.includes(question.id)) return false;
    if (!includeRouting && questionExcludedFromInvestigation(record,question)) return false;
    return true;
  });
}

function templateAnswer(record, questionId) {
  return String(record?.templateData?.answers?.[questionId] ?? '').trim();
}

function templateAnswerAvailable(value = '') {
  return Boolean(String(value || '').trim());
}

function templateQuestionLevel(question) {
  return question.required ? 'required' : question.recommended ? 'recommended' : 'optional';
}

function templateRequiredIssues(record = state.current) {
  const issues = [];
  templateQuestionList(record).forEach(question => {
    if (!question.required) return;
    if (!templateAnswerAvailable(templateAnswer(record, question.id))) {
      issues.push({step:2,id:`template-${question.id}`,key:'template',title:'Informação essencial do modelo',message:`Informe: ${question.label}`});
    }
  });
  return issues;
}

function routingRequiredIssues(record = state.current) {
  return routingQuestions(record).filter(question=>question.required && !templateAnswerAvailable(templateAnswer(record,question.id))).map(question=>({step:0,id:`template-${question.id}`,key:'occurrence',title:'Direcionamento do boletim',message:`Informe: ${question.label}`}));
}

function templateRecommendedMissing(record = state.current) {
  return templateQuestionList(record).filter(question => question.recommended && !templateAnswerAvailable(templateAnswer(record, question.id)));
}

function templateCompleteness(record = state.current) {
  const questions = [...routingQuestions(record),...templateQuestionList(record)];
  const required = questions.filter(question => question.required);
  const recommended = questions.filter(question => question.recommended);
  const requiredMissing = required.filter(question => !templateAnswerAvailable(templateAnswer(record, question.id)));
  const recommendedMissing = recommended.filter(question => !templateAnswerAvailable(templateAnswer(record, question.id)));
  return {required, recommended, requiredMissing, recommendedMissing, complete:requiredMissing.length===0};
}

function templateAnswerSummary(record = state.current) {
  return [...routingQuestions(record),...templateQuestionList(record)]
    .map(question => ({label:question.label, value:templateAnswer(record, question.id)}))
    .filter(item => item.value);
}

function syncTemplateVerification(record = state.current) {
  if (!record) return;
  const modes = effectiveEntityModes(record);
  record.verification ||= {};
  ['people','witnesses','vehicles','materials'].forEach(key => {
    const mode = modes?.[key] || 'recommended';
    const collection = key === 'people' ? (record.people || []).filter(person => person.tipo !== 'Testemunha') : key === 'witnesses' ? (record.people || []).filter(person => person.tipo === 'Testemunha') : key === 'vehicles' ? (record.vehicles || []) : (record.materials || []);
    if (mode === 'hidden') record.verification[key] = 'none';
    else if (collection.length) record.verification[key] = 'has';
    else record.verification[key] = mode === 'required' ? 'pending' : 'none';
  });
}

function requesterCountsAsInvolved(record = state.current) {
  return requesterRequired(record) && record?.templateData?.requesterRole === 'Envolvido diretamente';
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
  validationIssues: [],
  correctionFocus: null,
  recoveryRecordId: '',
  launchIntent: null,
  syncQueueRunning: false,
  pendingEvidencePurpose: '',
  dynamicRequirementKeys: [],
  dynamicRequirementAt: 0,
  suppressConnectivityBanner: false,
  attentionOnly: false
};

const app = document.querySelector('#app');
const headerTitle = document.querySelector('#header-title');
const headerSubtitle = document.querySelector('#header-subtitle');
const backButton = document.querySelector('#back-button');
const bottomNav = document.querySelector('#bottom-nav');
const installButton = document.querySelector('#install-button');
const pwaUpdateBanner = document.querySelector('#pwa-update-banner');
const pwaUpdateNow = document.querySelector('#pwa-update-now');
const pwaUpdateLater = document.querySelector('#pwa-update-later');
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
const selectDialogEyebrow = document.querySelector('#select-dialog-eyebrow');
const selectDialogTitle = document.querySelector('#select-dialog-title');
const selectDialogSearchWrap = document.querySelector('.select-dialog-search');
const selectDialogSearch = document.querySelector('#select-dialog-search');
const selectDialogOptions = document.querySelector('#select-dialog-options');
const selectDialogClose = document.querySelector('#select-dialog-close');
const selectDialogCancel = document.querySelector('#select-dialog-cancel');
const busyOverlay = document.querySelector('#busy-overlay');
const busyTitle = document.querySelector('#busy-title');
const busyMessage = document.querySelector('#busy-message');
const offlineBanner = document.querySelector('#offline-banner');
const offlineBannerText = document.querySelector('#offline-banner-text');
const offlineQueueButton = document.querySelector('#offline-queue-button');
const offlineDraftsButton = document.querySelector('#offline-drafts-button');
const offlineRetryButton = document.querySelector('#offline-retry-button');
const nexoActionFeedback = document.querySelector('#nexo-action-feedback');
const nexoActionTitle = document.querySelector('#nexo-action-title');
const nexoActionText = document.querySelector('#nexo-action-text');

let dbPromise;
let autosaveTimer;
let toastTimer;
let modalResolver = null;
let modalTertiaryValue = 'tertiary';
let activeModalSelect = null;
let selectModalEntries = [];
let syncRetryTimer = null;
const loadedScripts = new Map();

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
  const stored = await new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
  const records = [];
  for (const item of stored) records.push(await decodeStoredRecord(item));
  return records;
}

async function dbPut(record) {
  const db = await openDatabase();
  const stored = await encodeStoredRecord(record);
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put(stored);
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

function sessionGet(key) { try { return sessionStorage.getItem(key); } catch { return null; } }
function sessionSet(key, value) { try { sessionStorage.setItem(key, String(value)); } catch (_) {} }
function sessionRemove(key) { try { sessionStorage.removeItem(key); } catch (_) {} }

function base64FromBytes(bytes) {
  let binary = '';
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}
function bytesFromBase64(value) {
  const binary = atob(value || '');
  return Uint8Array.from(binary, ch => ch.charCodeAt(0));
}
function encryptionSettings() {
  try { return { enabled:false, ...(JSON.parse(storageGet(ENCRYPTION_SETTINGS_KEY) || '{}') || {}) }; }
  catch { return { enabled:false }; }
}
function encryptionEnabled() { return encryptionSettings().enabled === true; }
async function deriveEncryptionKey(passphrase, saltBase64) {
  if (!crypto?.subtle) throw new Error('Criptografia local exige HTTPS e suporte ao Web Crypto.');
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name:'PBKDF2', salt:bytesFromBase64(saltBase64), iterations:180000, hash:'SHA-256' }, material, { name:'AES-GCM', length:256 }, false, ['encrypt','decrypt']);
}
async function activeEncryptionKey() {
  if (!encryptionEnabled()) return null;
  const config = encryptionSettings();
  let passphrase = sessionGet(ENCRYPTION_SESSION_KEY) || '';
  if (!passphrase) {
    passphrase = String(window.prompt('BO Digital GSP: informe a senha da criptografia local para desbloquear os boletins deste aparelho.') || '');
    if (!passphrase) throw new Error('Banco local criptografado e ainda bloqueado. Recarregue e informe a senha para continuar.');
    sessionSet(ENCRYPTION_SESSION_KEY, passphrase);
  }
  return deriveEncryptionKey(passphrase, config.salt);
}
async function encodeStoredRecord(record) {
  if (!encryptionEnabled()) return structuredClone(record);
  const key = await activeEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plain = new TextEncoder().encode(JSON.stringify(record));
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name:'AES-GCM', iv }, key, plain));
  return { id:record.id, encrypted:true, encryptedVersion:1, iv:base64FromBytes(iv), payload:base64FromBytes(cipher), status:'Protegido', updatedAt:record.updatedAt || '' };
}
async function decodeStoredRecord(item) {
  if (!item?.encrypted) return structuredClone(item);
  const key = await activeEncryptionKey();
  try {
    const plain = await crypto.subtle.decrypt({ name:'AES-GCM', iv:bytesFromBase64(item.iv) }, key, bytesFromBase64(item.payload));
    return JSON.parse(new TextDecoder().decode(plain));
  } catch (error) {
    sessionRemove(ENCRYPTION_SESSION_KEY);
    throw new Error('Não foi possível abrir os dados criptografados. Verifique a senha e recarregue o aplicativo.');
  }
}
async function enableLocalEncryption(passphrase) {
  if (encryptionEnabled()) return true;
  if (!passphrase || passphrase.length < 6) throw new Error('Use uma senha com pelo menos 6 caracteres.');
  const records = await dbGetAll();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  storageSet(ENCRYPTION_SETTINGS_KEY, JSON.stringify({ enabled:true, salt:base64FromBytes(salt), enabledAt:new Date().toISOString() }));
  sessionSet(ENCRYPTION_SESSION_KEY, passphrase);
  for (const record of records) await dbPut(record);
  return true;
}
async function disableLocalEncryption() {
  if (!encryptionEnabled()) return true;
  const records = await dbGetAll();
  storageSet(ENCRYPTION_SETTINGS_KEY, JSON.stringify({ enabled:false, disabledAt:new Date().toISOString() }));
  sessionRemove(ENCRYPTION_SESSION_KEY);
  for (const record of records) await dbPut(record);
  return true;
}

function healthState() {
  try { return JSON.parse(storageGet(HEALTH_KEY) || '{}') || {}; } catch { return {}; }
}
function updateHealth(patch = {}) {
  storageSet(HEALTH_KEY, JSON.stringify({ ...healthState(), ...patch }));
}
function noteServerHealthy() { updateHealth({ lastServerOkAt:new Date().toISOString() }); }
function noteSyncSuccess() { updateHealth({ lastServerOkAt:new Date().toISOString(), lastSyncSuccessAt:new Date().toISOString() }); }
function noteSyncError(message='') { updateHealth({ lastSyncErrorAt:new Date().toISOString(), lastSyncError:String(message || '').slice(0,240) }); }
function errorLog() { try { return JSON.parse(storageGet(ERROR_LOG_KEY) || '[]') || []; } catch { return []; } }
function logClientError(source, error) {
  const entries = errorLog();
  entries.push({ at:new Date().toISOString(), source:String(source || 'app'), message:String(error?.message || error || 'Erro desconhecido').slice(0,500) });
  storageSet(ERROR_LOG_KEY, JSON.stringify(entries.slice(-30)));
}
function operationalTimeSettings() {
  try { return { warningMinutes:20, criticalMinutes:30, ...(JSON.parse(storageGet(SLA_SETTINGS_KEY) || '{}') || {}) }; }
  catch { return { warningMinutes:20, criticalMinutes:30 }; }
}
function formatElapsedMinutes(minutes) {
  const safe = Math.max(0, Math.round(Number(minutes || 0)));
  return safe < 60 ? `${safe} min` : `${Math.floor(safe/60)}h ${safe%60}min`;
}
function elaborationTimeInfo(record) {
  const startValue = record?.createdAt || record?.updatedAt || '';
  const start = new Date(startValue || Date.now()).getTime();
  const endValue = record?.status === 'Finalizado' && record?.finalizedAt ? record.finalizedAt : '';
  const end = endValue ? new Date(endValue).getTime() : Date.now();
  const minutes = Math.max(0, Math.round((end - start) / 60000));
  return { minutes, label:formatElapsedMinutes(minutes), startAt:startValue, endAt:endValue, active:record?.status !== 'Finalizado' };
}
function operationalTimeInfo(record) {
  const settings = operationalTimeSettings();
  const timing = record?.operationalTiming || {};
  const startedAt = String(timing.startedAt || '');
  if (!startedAt) return { active:false, ongoing:false, minutes:0, level:'muted', label:'não iniciado', startedAt:'', endedAt:'', warningMinutes:settings.warningMinutes, criticalMinutes:settings.criticalMinutes };
  const start = new Date(startedAt).getTime();
  const inferredEnd = String(timing.endedAt || (record?.status === 'Finalizado' ? record?.finalizedAt || '' : ''));
  const end = inferredEnd ? new Date(inferredEnd).getTime() : Date.now();
  const minutes = Math.max(0, Math.round((end - start) / 60000));
  const ongoing = !inferredEnd && record?.status !== 'Finalizado';
  const level = ongoing ? (minutes >= settings.criticalMinutes ? 'critical' : minutes >= settings.warningMinutes ? 'warning' : 'ok') : 'done';
  return { active:true, ongoing, minutes, level, label:formatElapsedMinutes(minutes), startedAt, endedAt:inferredEnd, warningMinutes:settings.warningMinutes, criticalMinutes:settings.criticalMinutes, autoEnded:timing.autoEnded === true };
}
window.BO_SLA_INFO = operationalTimeInfo;
window.BO_ELABORATION_INFO = elaborationTimeInfo;

function renderOperationalTimingCard(record = state.current) {
  const timing = operationalTimeInfo(record);
  const startedText = timing.startedAt ? formatDateTime(timing.startedAt) : formatDateTime(record?.createdAt);
  const endedText = timing.endedAt ? formatDateTime(timing.endedAt) : 'Em andamento';
  return `<section class="info-card operational-timing-card"><div class="operational-timing-head"><div><p class="eyebrow">Controle do atendimento</p><h2>Tempo do BO</h2></div><div class="entity-meta"><span class="chip time-chip time-${timing.level}">${record?.status==='Finalizado'?'Duração':'Em atendimento'}: ${escapeHtml(timing.label)}</span></div></div><p>O tempo é iniciado automaticamente quando o vigilante abre o novo boletim no local e termina quando o BO é finalizado.</p><dl class="definition-grid timing-definition"><div><dt>Início / chegada ao local</dt><dd>${escapeHtml(startedText)}</dd></div><div><dt>Término</dt><dd>${escapeHtml(endedText)}</dd></div></dl></section>`;
}

function loadScriptOnce(src) {
  if (loadedScripts.has(src)) return loadedScripts.get(src);
  const promise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-lazy-src="${src}"]`);
    if (existing) { existing.addEventListener('load', resolve, { once:true }); return; }
    const script = document.createElement('script');
    script.src = src; script.defer = true; script.dataset.lazySrc = src;
    script.onload = resolve; script.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
    document.body.appendChild(script);
  });
  loadedScripts.set(src, promise);
  return promise;
}
async function ensureAssistantLoaded() { if (!window.NEXO_ASSISTANT) await loadScriptOnce('assistant.js'); return window.NEXO_ASSISTANT; }
async function ensureAdvancedLoaded() { if (!window.BO_ADVANCED) await loadScriptOnce('advanced.js'); return window.BO_ADVANCED; }
function scheduleLazyModules() {
  if (!state.operator) return;
  const load = () => ensureAssistantLoaded().catch(error => logClientError('lazy-assistant', error));
  if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout:2500 }); else setTimeout(load, 900);
}
function showNexoAction(text, kind='progress', title='NEXO') {
  if (!nexoActionFeedback) return;
  nexoActionTitle.textContent = title;
  nexoActionText.textContent = text;
  nexoActionFeedback.dataset.kind = kind;
  nexoActionFeedback.classList.remove('hidden');
  clearTimeout(showNexoAction.timer);
  if (kind !== 'progress') showNexoAction.timer = setTimeout(() => nexoActionFeedback.classList.add('hidden'), 2200);
}
window.BO_NEXO_FEEDBACK = showNexoAction;
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
      record.syncStatus = record.status === 'Finalizado' ? 'pending' : 'local';
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
  return ({local:'Salvo no aparelho',pending:'Aguardando envio',syncing:'Enviando',synced:'Sincronizado',error:'Falha no envio',conflict:'Conflito com outra atualização'})[status] || 'Salvo no aparelho';
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
      error: 'Falha no envio',
      conflict: 'Conflito de atualização'
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


function normalizeAssistantText(value = '') {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');
}

function joinNatural(items = []) {
  const values = items.map(item => String(item || '').trim()).filter(Boolean);
  if (values.length <= 1) return values[0] || '';
  if (values.length === 2) return `${values[0]} e ${values[1]}`;
  return `${values.slice(0, -1).join(', ')} e ${values.at(-1)}`;
}

function assistantContext(record = state.current) {
  const basic = record?.basic || {};
  const history = record?.history || {};
  const reference = resolvedReference(basic);
  const searchable = normalizeAssistantText([
    reference,
    history.inicio,
    history.identificado,
    history.adicional
  ].join(' '));

  const accident = /(acident|colis|abalro|atropel|capot|choque|impacto|queda de veiculo)/.test(searchable);
  const vehicle = accident || /(veicul|reboque|estacionamento|circulacao|area restrita)/.test(searchable) || Boolean(record?.vehicles?.length);
  const material = /(material|peca|vasilhame|carga|equipamento|recolhimento|localizado|desaparecimento|subtracao|furto)/.test(searchable) || Boolean(record?.materials?.length);
  const access = /(acesso|credenciamento|entrada|saida)/.test(searchable);
  const fire = /(incendio|emergencia)/.test(searchable);
  const environmental = /(ambiental|vazamento|derramamento)/.test(searchable);
  const medical = /(medic|mal-estar|alteracao comportamental|embriaguez|agressao fisica|confronto)/.test(searchable);
  const theft = /(furto|desaparecimento|subtracao)/.test(searchable);
  const damage = /(dano|avaria|falha operacional|patrimonio|sabotagem)/.test(searchable);

  let profile = 'Ocorrência geral';
  if (environmental) profile = 'Ocorrência ambiental';
  else if (fire) profile = 'Emergência ou incêndio';
  else if (medical) profile = 'Pessoas, comportamento ou saúde';
  else if (theft) profile = 'Suspeita de subtração ou desaparecimento';
  else if (accident) profile = 'Acidente ou colisão';
  else if (material && vehicle) profile = 'Veículo e materiais';
  else if (material) profile = 'Materiais, peças ou equipamentos';
  else if (vehicle) profile = 'Veículo';
  else if (access) profile = 'Acesso ou credenciamento';
  else if (damage) profile = 'Dano material';

  const vehicleRequired = accident || /(avaria constatada em veiculo|dano preexistente|reboque|estacionamento|circulacao em desacordo|veiculo nao identificado|situacao suspeita)/.test(searchable);
  const materialRequired = theft || /(carga|avaria em material|peca|vasilhame|material ou equipamento localizado|desaparecimento de material|divergencia de carga)/.test(searchable);
  const actionsImportant = fire || medical || accident || theft || damage;
  const evidenceImportant = fire || theft || damage || accident;

  return {
    reference: reference || 'Não definida',
    profile,
    accident,
    vehicle,
    material,
    access,
    fire,
    environmental,
    medical,
    theft,
    damage,
    vehicleRequired,
    materialRequired,
    actionsImportant,
    evidenceImportant
  };
}

function assistantChecklist(record = state.current) {
  const r = record || {};
  const b = r.basic || {};
  const h = r.history || {};
  const template = effectiveTemplate(r);
  const modes = effectiveEntityModes(r);
  const checks = [];
  const add = (id,label,ok,level,step,message,key='') => checks.push({id,label,ok:Boolean(ok),level,step,message,key});

  add('bo-requester-presence','Existência de solicitante',requesterPresence(r)==='Sim' || requesterPresence(r)==='Não','required',0,'Confirme primeiro se existe solicitante.');
  add('bo-ref','Classificação da ocorrência',b.categoria && b.referencia,'required',0,'Selecione natureza e tipo de boletim.');
  if (requesterPresence(r) === 'Não') add('bo-origin','Origem do registro',meaningfulText(b.origemOcorrencia),'required',0,'Informe como o fato foi identificado pela Segurança.');
  add('bo-local-detail','Localização completa',b.local && meaningfulText(b.complementoLocal),'required',0,'Identifique o local do fato.');
  if (requesterRequired(r)) {
    add('bo-name','Solicitante identificado',meaningfulText(b.nomeEmissor),'required',0,'Informe quem acionou a Segurança.');
    add('bo-reg','Matrícula do solicitante, quando aplicável',!b.matriculaEmissor || /^\d+$/.test(b.matriculaEmissor||''),'recommended',0,'Informe a matrícula quando estiver disponível.');
  } else if (recordWithoutRequester(r)) {
    add('','Vigilante responsável pelo registro',meaningfulText(r.operator?.usuario) && meaningfulText(r.operator?.registro),'required',0,'O BO sem solicitante deve ficar vinculado ao vigilante logado.','operator');
  }
  add('bo-directorate','Diretoria relacionada',meaningfulText(b.diretoria),'required',0,'Informe a diretoria relacionada ou use “Não se aplica/Não identificada”.');
  routingQuestions(r).forEach(q => add(`template-${q.id}`,q.label,templateAnswerAvailable(templateAnswer(r,q.id)),'required',0,`Informe: ${q.label}`,'routing'));

  const involved = requesterCountsAsInvolved(r) || (r.people||[]).some(p=>p.tipo!=='Testemunha');
  if (modes.people === 'required') add('','Pessoa diretamente envolvida',involved,'required',1,'Cadastre a pessoa envolvida ou indique que o solicitante é o próprio envolvido.','people');
  if (modes.witnesses === 'required') add('','Testemunha identificada',(r.people||[]).some(p=>p.tipo==='Testemunha'),'required',1,'Cadastre a testemunha necessária ao modelo.','witnesses');
  if (modes.vehicles === 'required') add('','Veículo relacionado',(r.vehicles||[]).length>0,'required',1,'Cadastre o veículo relacionado.','vehicles');
  if (modes.materials === 'required') add('','Material, peça, equipamento ou carga',(r.materials||[]).length>0,'required',1,'Cadastre o item relacionado.','materials');
  if (documentMode(r) === 'required') {
    const requiredTypes = requiredDocumentTypesFor(r);
    const docs = r.documents || [];
    const missingTypes = requiredTypes.filter(type=>!docs.some(document=>normalizeAssistantText(document.tipo)===normalizeAssistantText(type)));
    add('','Documento aplicável',(docs.length>0 && missingTypes.length===0) || meaningfulText(r.templateData?.documentUnavailableReason),'required',1,missingTypes.length?`Cadastre ${missingTypes.join(', ')} ou justifique por que não foi possível obtê-lo.`:'Cadastre o documento da operação ou justifique por que não foi possível obtê-lo.','documents');
  }

  if (requesterRequired(r)) add('history-start','Relato recebido',meaningfulText(h.inicio),'required',2,'Registre o que foi informado à equipe.');
  add('history-found',isRoundOrigin(r)?'Constatação da ronda':'Constatação da Segurança',meaningfulText(h.identificado),'required',2,'Registre o que o vigilante/equipe constatou no local.');
  templateQuestionList(r).forEach(q=>add(`template-${q.id}`,q.label,templateAnswerAvailable(templateAnswer(r,q.id)),q.required?'required':q.recommended?'recommended':'optional',2,`Informe: ${q.label}`,'template'));

  add('history-end','Desfecho',meaningfulText(h.desfecho),'required',3,'Informe como a situação terminou.');
  if (r.verification?.providencias === 'has') add('history-actions','Providências descritas',meaningfulText(h.providenciasFonte)||meaningfulText(h.providencias),'required',3,'Descreva as providências adotadas.','providencias');
  const evidence = evidenceRequirementStatus(r);
  evidence.filter(item=>item.required).forEach(item=>add('',item.label,item.satisfied || meaningfulText(r.templateData?.evidenceUnavailableReason),'required',3,`Registre ${item.label.toLocaleLowerCase('pt-BR')} ou justifique a indisponibilidade.`,'attachments'));
  if (template.evidence === 'required' && !evidence.some(item=>item.required)) {
    add('evidence-unavailable-reason','Evidência ou justificativa',(r.attachments||[]).length>0 || meaningfulText(r.templateData?.evidenceUnavailableReason),'required',3,'Inclua evidência ou justifique por que não foi possível registrá-la.','attachments');
  }
  add('history-report','Relato consolidado',meaningfulText(h.relato) && !r.assistant?.stale,'required',4,r.assistant?.stale?'Atualize o relato após as alterações.':'Gere ou revise o relato consolidado.','report');
  return checks;
}

function canonicalRequiredMissing(record = state.current) {
  const issues = [];
  for (let step = 0; step <= 3; step += 1) issues.push(...collectStepIssues(step, record));
  const reportIssues = collectStepIssues(4, record).filter(issue => issue.id === 'history-report');
  issues.push(...reportIssues);
  const seen = new Set();
  const checklist = assistantChecklist(record);
  return issues.filter(issue => {
    const signature = `${issue.step}|${issue.id||''}|${issue.key||''}|${issue.message||''}`;
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  }).map(issue => {
    const known = checklist.find(item => (issue.id && item.id === issue.id) || (issue.key && item.key === issue.key && item.step === issue.step));
    return {
      id:issue.id||'', key:issue.key||'', label:known?.label || (issue.title && issue.title !== 'Preenchimento incompleto' ? issue.title : 'Informação essencial'),
      ok:false, level:'required', step:issue.step, message:issue.message
    };
  });
}

function assistantMissing(record = state.current, level = '') {
  const recommended = assistantChecklist(record).filter(item => !item.ok && item.level === 'recommended');
  const required = canonicalRequiredMissing(record);
  if (level === 'required') return required;
  if (level === 'recommended') return recommended;
  return [...required, ...recommended];
}

function markAssistantStale(record = state.current) {
  if (!record) return;
  record.assistant ||= { generatedAt: '', profile: '', stale: false };
  if (record.assistant.generatedAt || meaningfulText(record.history?.relato)) record.assistant.stale = true;
}

function assistantPersonSummary(person) {
  const identity = [person.tipo, person.nome].filter(Boolean).join(' ');
  const details = [];
  if (person.vinculo) details.push(`vínculo ${person.vinculo}`);
  if (person.empresa && normalizeAssistantText(person.empresa) !== 'stellantis') details.push(`empresa ${person.empresa}`);
  if (person.setor) details.push(`setor ${person.setor}`);
  if (person.matricula) details.push(`matrícula ${person.matricula}`);
  if (person.numeroDocumento) details.push(`${person.tipoDocumento || 'documento'} ${person.numeroDocumento}`);
  return `${identity || 'Pessoa não identificada'}${details.length ? ` (${details.join('; ')})` : ''}`;
}

function assistantVehicleSummary(vehicle) {
  const unidentified = normalizeAssistantText(vehicle.placa||'') === 'nao identificado';
  const details = [unidentified ? 'placa ou chassi não identificados' : `placa ou chassi ${vehicle.placa || 'não informado'}`];
  const model = [vehicle.marca, vehicle.modelo].filter(Boolean).join(' ');
  if (model) details.push(model);
  if (vehicle.empresa) details.push(`empresa ${vehicle.empresa}`);
  if (vehicle.pessoaNome) details.push(`relacionado a ${vehicle.pessoaNome}`);
  if (vehicle.danoStatus === 'Sim') {
    const damage=[vehicle.regiaoDano,vehicle.tipoDano,vehicle.descricaoDano].filter(Boolean).join(', ');
    if (damage) details.push(`dano: ${damage}`);
  } else if (vehicle.danoStatus) details.push(`dano aparente: ${vehicle.danoStatus.toLocaleLowerCase('pt-BR')}`);
  if (vehicle.observacao) details.push(vehicle.observacao);
  return details.join(', ');
}

function assistantMaterialSummary(material) {
  const details = [`${materialItemTypeLabel(material)}: ${material.denominacao || 'item sem denominação'}`];
  if (material.quantidadePrevista) details.push(`quantidade prevista ${material.quantidadePrevista}`);
  if (material.quantidade) details.push(`${material.quantidadePrevista?'quantidade constatada':'quantidade'} ${material.quantidade}`);
  else if (material.quantidadeStatus === 'Não foi possível determinar') details.push('quantidade não determinada');
  if (material.quantidadePrevista && material.quantidade) {
    const expected=Number(String(material.quantidadePrevista).replace(',','.')), found=Number(String(material.quantidade).replace(',','.'));
    if (Number.isFinite(expected)&&Number.isFinite(found)) details.push(`divergência ${found-expected>0?'+':''}${found-expected}`);
  }
  if (material.desenho) details.push(`desenho/código ${material.desenho}`);
  if (material.numeroSerie) details.push(`número de série ${material.numeroSerie}`);
  if (material.codigoIdentificacao) details.push(`código/identificação ${material.codigoIdentificacao}`);
  if (material.fornecedor) details.push(`fornecedor ${material.fornecedor}`);
  if (material.codigoVasilhame) details.push(`código do vasilhame ${material.codigoVasilhame}`);
  if (material.pessoaNome) details.push(`relacionado a ${material.pessoaNome}`);
  if (material.condicao) details.push(`condição ${material.condicao}`);
  if (material.observacao) details.push(material.observacao);
  return details.join(', ');
}

function assistantDocumentSummary(document) {
  const parts = [document.tipo || 'Documento'];
  if (document.numero) parts.push(`nº ${document.numero}`);
  if (document.observacao) parts.push(document.observacao);
  return parts.join(' ');
}

function sentenceCasePt(value = '') {
  const text = String(value || '').trim();
  if (!text) return '';
  return text.charAt(0).toLocaleUpperCase('pt-BR') + text.slice(1);
}

function lowerInitialPt(value = '') {
  const text = String(value || '').trim();
  if (!text) return '';
  return text.charAt(0).toLocaleLowerCase('pt-BR') + text.slice(1);
}

function titleCaseNamePt(value = '') {
  const small = new Set(['da','de','do','das','dos','e']);
  return String(value || '').trim().split(/\s+/).filter(Boolean).map((part, index) => {
    const lower = part.toLocaleLowerCase('pt-BR');
    if (index > 0 && small.has(lower)) return lower;
    return lower.charAt(0).toLocaleUpperCase('pt-BR') + lower.slice(1);
  }).join(' ');
}

function stripReceivedLead(value = '') {
  let text = cleanSentence(value);
  if (!text) return '';
  const patterns = [
    /^(?:segundo|conforme|de acordo com)\s+(?:o\s+)?relato\s+(?:(?:do|da)\s+solicitante|(?:do|da)\s+testemunha|de\s+pessoa\s+envolvida|(?:do|da)\s+envolvid[oa]|de\s+terceiro|de\s+outro\s+informante)\s*[,;:\-–—]*\s*/i,
    /^(?:segundo|conforme|de acordo com)\s+(?:as\s+)?informa(?:ç|c)(?:ões|oes)\s+(?:coletadas|colhidas|recebidas)(?:\s+no\s+(?:atendimento|local))?\s*[,;:\-–—]*\s*/i,
    /^(?:o\s+solicitante|a\s+testemunha|o\s+envolvido|a\s+envolvida|o\s+terceiro|a\s+terceira)\s+(?:informou|relatou)\s+que\s+/i,
    /^foi\s+informado\s+(?:pelo|pela)\s+(?:solicitante|testemunha|envolvid[oa]|terceir[oa])\s+que\s+/i
  ];
  let changed = true;
  while (changed) {
    changed = false;
    for (const pattern of patterns) {
      const next = text.replace(pattern, '').trim();
      if (next !== text) { text = next; changed = true; }
    }
  }
  return text;
}

function stripFindingLead(value = '') {
  let text = cleanSentence(value);
  if (!text) return '';
  const patterns = [
    /^no\s+local\s*[,;:\-–—]*\s*/i,
    /^(?:a\s+)?equipe\s+(?:de\s+)?seguran(?:ç|c)a\s+patrimonial\s+(?:constatou|verificou|identificou)\s+(?:que\s+)?/i,
    /^(?:foi|foram)\s+(?:constatado|constatada|constatados|constatadas|verificado|verificada|verificados|verificadas|identificado|identificada|identificados|identificadas)\s+(?:que\s+)?/i,
    /^constatou-se\s+(?:que\s+)?/i,
    /^verificou-se\s+(?:que\s+)?/i
  ];
  let changed = true;
  while (changed) {
    changed = false;
    for (const pattern of patterns) {
      const next = text.replace(pattern, '').trim();
      if (next !== text) { text = next; changed = true; }
    }
  }
  return text;
}

function reportSourceLead(record = state.current, rawReceived = '') {
  if (isRoundOrigin(record)) return '';
  const raw = normalizeAssistantText(rawReceived);
  if (/\btestemunha\b/.test(raw)) return 'Segundo relato de testemunha';
  if (/\b(pessoa envolvida|envolvido|envolvida)\b/.test(raw)) return 'Segundo relato de pessoa envolvida';
  if (/\b(terceiro|terceira|outro informante)\b/.test(raw)) return 'Conforme informação prestada por terceiro';
  if (/\bsolicitante\b/.test(raw)) return 'Segundo relato do solicitante';
  const source = String(record?.history?.fonteRelato || 'Solicitante');
  if (source === 'Pessoa envolvida') return 'Segundo relato de pessoa envolvida';
  if (source === 'Testemunha') return 'Segundo relato de testemunha';
  if (source === 'Terceiro/outro informante') return 'Conforme informação prestada por terceiro';
  if (source === 'Fonte não identificada') return 'Conforme informação recebida durante o atendimento';
  return 'Segundo relato do solicitante';
}

function reportTokens(value = '') {
  const stop = new Set(['a','o','as','os','um','uma','uns','umas','de','da','do','das','dos','e','em','no','na','nos','nas','por','para','com','que','foi','foram','ser','ao','à','aos','às']);
  return normalizeAssistantText(value)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !stop.has(token));
}

function similarReportText(a = '', b = '') {
  const left = normalizeAssistantText(cleanSentence(a));
  const right = normalizeAssistantText(cleanSentence(b));
  if (!left || !right) return false;
  if ((left.includes(right) || right.includes(left)) && Math.min(left.length, right.length) >= 18) return true;
  const aSet = new Set(reportTokens(left));
  const bSet = new Set(reportTokens(right));
  if (!aSet.size || !bSet.size) return false;
  let intersection = 0;
  aSet.forEach(token => { if (bSet.has(token)) intersection += 1; });
  return intersection / Math.min(aSet.size, bSet.size) >= 0.72;
}

function reviewProfessionalParagraph(value = '') {
  let text = String(value || '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([,;])(?=\S)/g, '$1 ')
    .replace(/:([^\s\d])/g, ': $1')
    .trim();
  if (!text) return '';

  // Evita conectores duplicados e vícios frequentes encontrados nos relatos.
  text = text
    .replace(/segundo\s+as\s+informa(?:ç|c)(?:ões|oes)\s+(?:coletadas|colhidas)(?:\s+no\s+(?:atendimento|local))?\s*,?\s*segundo\s+(?:o\s+)?relato\s+(?:do|da)\s+solicitante\s*,?/gi, 'Segundo relato do solicitante,')
    .replace(/segundo\s+(?:o\s+)?relato\s+(?:do|da)\s+solicitante\s*,?\s*segundo\s+/gi, 'Segundo relato do solicitante, ')
    .replace(/\b(realmente\s+houve)\b/gi, 'houve')
    .replace(/\bnada\s+aconteceu\b/gi, 'não foram registrados novos desdobramentos')
    .replace(/\bningu[eé]m\s+foi\s+visto\s+pelo\s+local\b/gi, 'nenhuma pessoa foi localizada no local')
    .replace(/\bhavia\s+marcar\s+de\b/gi, 'havia marcas de')
    .replace(/\bacionada\s+(?:a\s+)?lideran(?:ç|c)a\s+para\s+averiguar\b/gi, 'foi acionada a liderança para averiguação')
    .replace(/\bseguran(?:ç|c)a\s+patrimonial\b/gi, 'Segurança Patrimonial')
    .replace(/\b([\p{L}]{3,})\s+\1\b/giu, '$1')
    .replace(/\.{2,}/g, '.')
    .replace(/,{2,}/g, ',');

  text = sentenceCasePt(text)
    .replace(/([.!?]\s+)([a-záàâãéêíóôõúç])/gu, (_, lead, initial) => `${lead}${initial.toLocaleUpperCase('pt-BR')}`);
  if (!/[.!?]$/.test(text)) text += '.';
  return text;
}

const REPORT_SECTION_HEADINGS = new Set(['CONTEXTO','RELATO RECEBIDO','CONSTATAÇÃO DA SEGURANÇA','APURAÇÃO COMPLEMENTAR','ELEMENTOS RELACIONADOS','PROVIDÊNCIAS','DESFECHO','INFORMAÇÃO COMPLEMENTAR']);

function professionalTextReview(value = '') {
  const source = String(value || '').trim();
  if (!source) return '';
  const paragraphs = source.split(/\n{2,}/).map(block => {
    const lines = String(block || '').split(/\n/);
    const first = String(lines[0] || '').trim().toLocaleUpperCase('pt-BR');
    if (REPORT_SECTION_HEADINGS.has(first) && lines.length > 1) {
      const body = reviewProfessionalParagraph(lines.slice(1).join(' '));
      return body ? `${first}\n${body}` : '';
    }
    return reviewProfessionalParagraph(block);
  }).filter(Boolean);
  const unique = [];
  paragraphs.forEach(paragraph => {
    if (!unique.some(existing => similarReportText(existing.replace(/^[^\n]+\n/,''), paragraph.replace(/^[^\n]+\n/,'')))) unique.push(paragraph);
  });
  return unique.join('\n\n');
}

function renderReportPreview(value = '') {
  const lines = String(value || '').split(/\n/);
  return lines.map(line => {
    const clean = String(line || '').trim();
    if (REPORT_SECTION_HEADINGS.has(clean.toLocaleUpperCase('pt-BR'))) return `<strong class="report-section-title">${escapeHtml(clean.toLocaleUpperCase('pt-BR'))}</strong>`;
    return escapeHtml(line);
  }).join('<br>');
}

function templateNarrativeEntries(record = state.current) {
  const baseline = [
    record?.history?.inicio,
    record?.history?.identificado,
    record?.history?.providenciasFonte,
    record?.history?.providencias,
    record?.history?.acionados,
    record?.history?.desfecho,
    record?.history?.adicional
  ].filter(Boolean);
  return templateQuestionList(record)
    .map(question => ({ question, value: cleanSentence(templateAnswer(record, question.id)) }))
    .filter(item => item.value)
    .map(item => {
      const search = normalizeAssistantText(`${item.question.id} ${item.question.label}`);
      const kind = /(provid|orienta|acion|encaminh|controle|conten|preserva|medida|libera|isolamento|comunicad)/.test(search)
        ? 'action'
        : /(resultado|condicao final|condição final|normaliza|desfecho|situacao final|situação final)/.test(search)
          ? 'outcome'
          : 'fact';
      return { ...item, kind };
    })
    .filter(item => !baseline.some(base => similarReportText(base, item.value)));
}

function buildAssistantProvidences(record = state.current) {
  const h = record?.history || {};
  if (record?.verification?.providencias === 'none') {
    return 'Não houve necessidade de providências adicionais no encerramento do atendimento.';
  }

  const parts = [];
  const actions = cleanSentence(h.providenciasFonte || h.providencias);
  const called = cleanSentence(h.acionados);
  const templateActions = templateNarrativeEntries(record).filter(item => item.kind === 'action');

  if (actions) parts.push(`Foram adotadas as seguintes providências: ${actions}.`);
  const actionTokens = new Set(reportTokens(actions));
  const calledTokens = reportTokens(called).filter(token => !['seguranca','responsavel','responsaveis','area','areas'].includes(token));
  const calledAlreadyMentioned = called && (parts.some(part => similarReportText(part, called)) || (calledTokens.length > 0 && calledTokens.some(token => actionTokens.has(token))));
  if (called && !calledAlreadyMentioned) parts.push(`Foram acionados os seguintes responsáveis ou áreas: ${called}.`);
  if (!actions && templateActions.length) {
    const values = templateActions.map(item => item.value).filter((value, index, list) => list.findIndex(other => similarReportText(other, value)) === index);
    if (values.length) parts.push(`Foram registradas as seguintes providências: ${joinNatural(values)}.`);
  }
  return professionalTextReview(parts.join(' '));
}

function buildNarrative(record = state.current) {
  const b = record.basic || {};
  const h = record.history || {};
  const local = [meaningfulText(b.local), meaningfulText(b.complementoLocal)].filter(Boolean).join(' — ');
  const reference = meaningfulText(bulletinDisplayType(record));
  const directorate = b.diretoria === 'Outra' ? meaningfulText(b.diretoriaOutra) : meaningfulText(b.diretoria);
  const round = isRoundOrigin(record);
  const hasRequester = requesterRequired(record);
  const sections = [];
  const addSection = (title, text) => {
    const reviewed = reviewProfessionalParagraph(text);
    if (reviewed) sections.push(`${title}\n${reviewed}`);
  };

  let context = `Em ${formatDateOnly(b.data)}, às ${b.hora}`;
  if (round) {
    const vigilante = titleCaseNamePt(record.operator?.usuario || 'vigilante responsável');
    const reg = record.operator?.registro ? `, registro ${record.operator.registro}` : '';
    context += `, durante ${lowerInitialPt(b.origemOcorrencia || 'ronda programada')}, o vigilante ${vigilante}${reg} identificou`;
  } else if (!hasRequester) {
    context += `, a equipe de Segurança Patrimonial identificou`;
  } else {
    context += `, a equipe de Segurança Patrimonial iniciou atendimento para`;
  }
  context += ` ocorrência${reference ? ` classificada como ${lowerInitialPt(reference)}` : ''}${local ? ` no local ${local}` : ''}`;
  if (hasRequester && meaningfulText(b.nomeEmissor)) context += `. O atendimento foi solicitado por ${titleCaseNamePt(b.nomeEmissor)}${b.matriculaEmissor ? `, matrícula ${b.matriculaEmissor}` : ''}`;
  else if (!hasRequester && !round && meaningfulText(b.origemOcorrencia)) context += `. O fato foi registrado a partir de ${lowerInitialPt(b.origemOcorrencia)}`;
  if (directorate && !['Não identificada','Não se aplica'].includes(directorate)) context += `. A ocorrência foi relacionada à diretoria ${directorate}${b.setorArea ? `, setor/área ${b.setorArea}` : ''}`;
  else if (b.setorArea) context += `. A ocorrência foi relacionada ao setor/área ${b.setorArea}`;
  addSection('CONTEXTO', context);

  if (hasRequester) {
    const rawReceived = cleanSentence(h.inicio);
    const received = stripReceivedLead(rawReceived);
    if (received) addSection('RELATO RECEBIDO', `${reportSourceLead(record, rawReceived)}, ${lowerInitialPt(received)}`);
  }

  const found = stripFindingLead(h.identificado);
  if (found) addSection('CONSTATAÇÃO DA SEGURANÇA', sentenceCasePt(found));

  const structuredFacts = templateNarrativeEntries(record).filter(item => item.kind === 'fact');
  if (structuredFacts.length) {
    const details = structuredFacts.map(item => `${item.question.label.replace(/[?:]$/,'')}: ${item.value}`).join('; ');
    addSection('APURAÇÃO COMPLEMENTAR', details);
  }

  const elements = [];
  if (requesterCountsAsInvolved(record)) elements.push('O solicitante também foi identificado como pessoa diretamente envolvida');
  const persons = (record.people || []).filter(person => person.tipo !== 'Testemunha');
  const witnesses = (record.people || []).filter(person => person.tipo === 'Testemunha');
  if (persons.length) elements.push(`Pessoas relacionadas: ${joinNatural(persons.map(assistantPersonSummary))}`);
  if (witnesses.length) elements.push(`Testemunhas: ${joinNatural(witnesses.map(assistantPersonSummary))}`);
  if ((record.vehicles || []).length) elements.push(`Veículos: ${joinNatural(record.vehicles.map(assistantVehicleSummary))}`);
  if ((record.materials || []).length) elements.push(`Materiais/peças/cargas: ${joinNatural(record.materials.map(assistantMaterialSummary))}`);
  if ((record.documents || []).length) elements.push(`Documentos: ${joinNatural(record.documents.map(assistantDocumentSummary))}`);
  if (elements.length) addSection('ELEMENTOS RELACIONADOS', elements.join('. '));

  const providenceParts = [];
  const providences = meaningfulText(h.providencias) || buildAssistantProvidences(record);
  if (providences) providenceParts.push(providences);
  if (meaningfulText(record.templateData?.evidenceUnavailableReason)) providenceParts.push(`Não foi possível registrar toda a evidência prevista. Motivo informado: ${cleanSentence(record.templateData.evidenceUnavailableReason)}`);
  if (providenceParts.length) addSection('PROVIDÊNCIAS', providenceParts.join(' '));

  const outcome = cleanSentence(h.desfecho);
  if (outcome) {
    const cleanedOutcome = outcome.replace(/^ao\s+t[eé]rmino\s+do\s+atendimento\s*[,;:\-–—]*\s*/i, '').trim();
    addSection('DESFECHO', cleanedOutcome);
  }
  const additional = cleanSentence(h.adicional);
  if (additional) addSection('INFORMAÇÃO COMPLEMENTAR', additional);
  return professionalTextReview(sections.join('\n\n'));
}

function renderAssistantCard(record = state.current) {
  const context = assistantContext(record);
  const checks = assistantChecklist(record);
  const completed = checks.filter(item => item.ok).length;
  const percent = checks.length ? Math.round((completed / checks.length) * 100) : 0;
  const canonicalMissing = assistantMissing(record);
  const requiredMissing = canonicalMissing.filter(item => item.level === 'required').length;
  const recommendedMissing = canonicalMissing.filter(item => item.level === 'recommended').length;
  const assistantState = record.assistant || {};
  const generationStatus = assistantState.generatedAt
    ? (assistantState.stale ? 'Dados alterados após a última geração' : assistantState.reviewedAt ? `Texto revisado em ${formatDateTime(assistantState.reviewedAt)}` : `Texto atualizado em ${formatDateTime(assistantState.generatedAt)}`)
    : 'Relato ainda não gerado pelo assistente';

  const missingChecks = canonicalMissing;
  const prioritizedChecks = [
    ...missingChecks.filter(item => item.level === 'required'),
    ...missingChecks.filter(item => item.level === 'recommended')
  ];
  const visibleChecks = prioritizedChecks.slice(0, 8);
  const hiddenCount = Math.max(0, prioritizedChecks.length - visibleChecks.length);
  const items = visibleChecks.length
    ? visibleChecks.map(item => `<div class="assistant-check-item missing ${item.level}">
      <span class="assistant-check-icon">${item.level === 'required' ? ICONS.warning : ICONS.info}</span>
      <span class="assistant-check-copy"><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.message)}</small></span>
      <button type="button" class="assistant-fix" data-assistant-step="${item.step}" data-assistant-id="${escapeHtml(item.id || '')}">Corrigir</button>
    </div>`).join('')
    : `<div class="assistant-check-item ok assistant-all-ok"><span class="assistant-check-icon">${ICONS.check}</span><span class="assistant-check-copy"><strong>Informações principais conferidas</strong><small>O relato pode ser gerado ou atualizado.</small></span></div>`;

  return `<section class="assistant-card" aria-labelledby="assistant-title">
    <div class="assistant-header">
      <div class="assistant-avatar" aria-hidden="true"><img src="./nexo-robot-avatar.png" alt="" loading="lazy"></div>
      <div class="assistant-heading"><p class="eyebrow">Assistente Operacional de BO</p><h2 id="assistant-title">Padronização e conferência automática</h2><p>O assistente usa somente os dados deste boletim. Não inventa informações e funciona sem internet.</p></div>
      <span class="assistant-mode">${escapeHtml(context.profile)}</span>
    </div>
    <div class="assistant-progress-row"><div><strong>${completed} de ${checks.length}</strong><span>informações conferidas</span></div><div class="assistant-progress" aria-label="${percent}% concluído"><i style="width:${percent}%"></i></div><b>${percent}%</b></div>
    <div class="assistant-summary"><span class="assistant-summary-required">${requiredMissing} obrigatória(s) pendente(s)</span><span>${recommendedMissing} recomendada(s) pendente(s)</span><span>${escapeHtml(generationStatus)}</span></div>
    <div class="assistant-checklist">${items}</div>${hiddenCount ? `<p class="assistant-more">Mais ${hiddenCount} pendência(s). Use “Verificar informações” para consultar a lista completa.</p>` : ''}
    <div class="assistant-actions">
      <button class="button secondary" type="button" data-action="assistant-check">${ICONS.check} Verificar informações</button>
      <button class="button primary" type="button" data-action="assistant-generate">${ICONS.file} Gerar relato e providências</button>
      <button class="button secondary" type="button" data-action="assistant-review-text">${ICONS.check} Revisar redação</button>
    </div>
  </section>`;
}

function validationIssueFor(key) {
  return state.validationIssues.find(issue => issue.key === key);
}
function isOfficialNumber(numero = '') { return /^BO-\d{4}-\d{6}$/.test(String(numero)); }
function totalAttachmentSize(record = state.current) { return (record?.attachments || []).reduce((sum, file) => sum + Number(file.size || 0), 0); }
function addAudit(record, action, details = '') {
  record.auditTrail ||= [];
  const operator = operatorSnapshot() || record.operator || {};
  record.auditTrail.push({ id: uid(), at: new Date().toISOString(), action, details, actor:{ usuario:operator.usuario || '', registro:operator.registro || '', turno:operator.turno || '' } });
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
  state.suppressConnectivityBanner = true;
  busyTitle.textContent = title;
  busyMessage.textContent = message;
  busyOverlay.classList.remove('hidden');
  busyOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('busy-open');
  updateConnectivityUi();
}
function updateBusy(title, message) {
  if (title) busyTitle.textContent = title;
  if (message) busyMessage.textContent = message;
}
function hideBusy() {
  busyOverlay.classList.add('hidden');
  busyOverlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('busy-open');
  state.suppressConnectivityBanner = false;
  updateConnectivityUi();
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
    schemaVersion: 7,
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
    operationalTiming: { startedAt:now.toISOString(), endedAt:'', startedBy:operatorSnapshot(), endedBy:null, autoEnded:false },
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
      data: localDateInput(now), hora: localTimeInput(now), categoria: '', referencia: '', referenciaOutra: '', origemOcorrencia: '',
      matriculaEmissor: '', nomeEmissor: '', temSolicitante: '',
      emailEmissor: '', setorArea: '',
      local: '', complementoLocal: '', diretoria: '', diretoriaOutra: ''
    },
    people: [], vehicles: [], materials: [], documents: [], attachments: [],
    templateData: { reference:'', submodel:'', requesterRole:'', evidenceUnavailableReason:'', documentUnavailableReason:'', answers:{} },
    history: {
      identificado: '', inicio: '', fonteRelato: 'Solicitante', presentes: '', providenciasFonte: '', providencias: '',
      providenciasEditadas: false, acionados: '', desfecho: '', adicional: '',
      relato: '', relatoEditado: false, observacoes: ''
    },
    assistant: { generatedAt: '', reviewedAt: '', profile: '', stale: false },
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
  state.current.clientSync ||= {};
  state.current.clientSync.lastAutoSavedAt = new Date().toISOString();

  // Durante o preenchimento o rascunho é protegido apenas no aparelho.
  // Ele só entra na fila depois da finalização/tentativa real de envio.
  if (state.current.status === 'Finalizado') {
    const confirmed = state.current.syncedAt && state.current.syncedAt >= state.current.updatedAt;
    if (confirmed) state.current.syncStatus = 'synced';
    else if (!['conflict','error','syncing'].includes(state.current.syncStatus)) state.current.syncStatus = 'pending';
  } else {
    state.current.syncStatus = 'local';
    state.current.clientSync.attempts = 0;
    state.current.clientSync.nextRetryAt = '';
    state.current.clientSync.lastAttemptAt = '';
    state.current.clientSync.lastError = '';
    state.current.clientSync.conflictAt = '';
    state.current.clientSync.remoteUpdatedAt = '';
  }

  await dbPut(state.current);
  persistNavigationState();
  await refreshRecords();
  if (!silent) showToast('Rascunho salvo neste dispositivo.');
  if (autoSync && state.current.status === 'Finalizado' && apiConfigured() && navigator.onLine) scheduleAutoSync(state.current.id);
}

function scheduleSave() {
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => saveCurrent(true, false), 180);
}

let autoSyncTimer;
function scheduleAutoSync(recordId) {
  clearTimeout(autoSyncTimer);
  autoSyncTimer = setTimeout(() => processSyncQueue({ onlyId:recordId }).catch(error => logClientError('auto-sync', error)), 1200);
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
    const options = group.options.filter(value => !POPULAR_REFERENCES.includes(value)).map(value => `<option value="${escapeHtml(value)}" ${value === selected ? 'selected' : ''}>${escapeHtml(value)}</option>`).join('');
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
  const invalid = select.classList.contains('invalid-field') || button.classList.contains('invalid-field');
  button.querySelector('.modal-select-value').textContent = selectedOptionText(select);
  button.classList.remove('field-control-empty');
  button.classList.toggle('field-control-filled', !empty);
  button.setAttribute('aria-invalid', invalid ? 'true' : 'false');
}

function buildSelectModalEntries(select) {
  const entries = [];
  let previousWasGroup = false;
  Array.from(select.children).forEach(child => {
    if (child.tagName === 'OPTGROUP') {
      entries.push({ type: 'group', label: child.label });
      Array.from(child.children).forEach(option => entries.push({ type: 'option', value: option.value, label: option.textContent.trim(), disabled: option.disabled, description: option.dataset.description || (select.id === 'bo-ref' ? REFERENCE_DESCRIPTIONS[option.dataset.reference || option.value] : '') }));
      previousWasGroup = true;
    } else if (child.tagName === 'OPTION') {
      if ((select.id === 'bo-ref' || select.id === 'bo-ref-search') && !String(child.value || '').trim()) return;
      if (previousWasGroup && select.id === 'bo-ref') entries.push({ type:'break' });
      entries.push({ type: 'option', value: child.value, label: child.textContent.trim(), disabled: child.disabled, description: child.dataset.description || ((select.id === 'bo-ref' || select.id === 'bo-ref-search') ? REFERENCE_DESCRIPTIONS[child.dataset.reference || child.value] : '') });
      previousWasGroup = false;
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
      const future = selectModalEntries.slice(index + 1).find(item => item.type === 'group' || item.type === 'break' || (item.type === 'option' && (!term || item.label.toLocaleLowerCase('pt-BR').includes(term))));
      if (future?.type === 'option') {
        html += `<div class="select-option-group">${escapeHtml(entry.label)}</div>`;
        groupVisible = true;
      }
      return;
    }
    if (entry.type === 'break') {
      const future = selectModalEntries.slice(index + 1).find(item => item.type === 'group' || item.type === 'break' || (item.type === 'option' && (!term || item.label.toLocaleLowerCase('pt-BR').includes(term))));
      if (future?.type === 'option') html += '<div class="select-option-break" aria-hidden="true"></div>';
      return;
    }
    if (term && !entry.label.toLocaleLowerCase('pt-BR').includes(term)) return;
    const selected = activeModalSelect && String(activeModalSelect.value || '').trim() && String(activeModalSelect.value) === String(entry.value);
    const compactBoList = activeModalSelect && (activeModalSelect.id === 'bo-ref' || activeModalSelect.id === 'bo-ref-search');
    html += `<button class="select-option-button ${selected ? 'selected' : ''} ${compactBoList ? 'compact-bo-option' : ''}" type="button" role="option" aria-selected="${selected}" data-select-index="${index}" ${entry.disabled ? 'disabled' : ''}>
      <span class="select-option-copy"><strong>${escapeHtml(entry.label)}</strong>${!compactBoList && entry.description ? `<small>${escapeHtml(entry.description)}</small>` : ''}</span>${selected ? ICONS.check : ''}
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
  const categoryBoList = select.id === 'bo-ref';
  const globalBoSearch = select.id === 'bo-ref-search';
  if (categoryBoList) {
    if (selectDialogEyebrow) selectDialogEyebrow.textContent = 'Tipo de boletim';
    selectDialogTitle.textContent = state.current?.basic?.categoria || 'Tipo de boletim';
    selectDialogSearchWrap?.classList.add('hidden');
  } else if (globalBoSearch) {
    if (selectDialogEyebrow) selectDialogEyebrow.textContent = 'Pesquisa';
    selectDialogTitle.textContent = 'Pesquisar tipo de boletim';
    selectDialogSearchWrap?.classList.remove('hidden');
  } else {
    if (selectDialogEyebrow) selectDialogEyebrow.textContent = 'Lista de seleção';
    selectDialogTitle.textContent = selectLabelFor(select);
    selectDialogSearchWrap?.classList.remove('hidden');
  }
  selectDialogSearch.value = '';
  renderSelectModalOptions();
  selectDialog.showModal();
  setTimeout(() => {
    if (!selectDialogSearchWrap?.classList.contains('hidden') && selectModalEntries.filter(item => item.type === 'option').length > 7) selectDialogSearch.focus();
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
  normalized.schemaVersion = Math.max(8, Number(normalized.schemaVersion || 4));
  normalized.basic ||= {};
  normalized.operationalTiming ||= {};
  normalized.operationalTiming = {
    startedAt: String(normalized.operationalTiming.startedAt || normalized.createdAt || ''),
    endedAt: String(normalized.operationalTiming.endedAt || ''),
    startedBy: normalized.operationalTiming.startedBy || null,
    endedBy: normalized.operationalTiming.endedBy || null,
    autoEnded: normalized.operationalTiming.autoEnded === true
  };
  normalized.people = Array.isArray(normalized.people) ? normalized.people : [];
  normalized.vehicles = Array.isArray(normalized.vehicles) ? normalized.vehicles : [];
  normalized.materials = Array.isArray(normalized.materials) ? normalized.materials : [];
  normalized.documents = Array.isArray(normalized.documents) ? normalized.documents : [];
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
  const previousProvidences = normalized.history.providencias || '';
  normalized.history = {
    identificado: normalized.history.identificado || '',
    inicio: normalized.history.inicio || '',
    fonteRelato: normalized.history.fonteRelato || 'Solicitante',
    presentes: normalized.history.presentes || '',
    providenciasFonte: normalized.history.providenciasFonte ?? previousProvidences,
    providencias: previousProvidences,
    providenciasEditadas: normalized.history.providenciasEditadas === true,
    acionados: normalized.history.acionados || '',
    desfecho: normalized.history.desfecho || '',
    adicional: normalized.history.adicional || '',
    relato: normalized.history.relato || '',
    relatoEditado: normalized.history.relatoEditado === true,
    observacoes: normalized.history.observacoes || ''
  };

  normalized.assistant ||= {};
  normalized.assistant = {
    generatedAt: String(normalized.assistant.generatedAt || ''),
    reviewedAt: String(normalized.assistant.reviewedAt || ''),
    profile: String(normalized.assistant.profile || ''),
    stale: normalized.assistant.stale === true
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

  normalized.clientSync ||= {};
  normalized.clientSync = { attempts:Number(normalized.clientSync.attempts || 0), nextRetryAt:String(normalized.clientSync.nextRetryAt || ''), lastAttemptAt:String(normalized.clientSync.lastAttemptAt || ''), lastError:String(normalized.clientSync.lastError || ''), serverUpdatedAt:String(normalized.clientSync.serverUpdatedAt || ''), conflictAt:String(normalized.clientSync.conflictAt || ''), remoteUpdatedAt:String(normalized.clientSync.remoteUpdatedAt || ''), lastAutoSavedAt:String(normalized.clientSync.lastAutoSavedAt || '') };
  normalized.syncStatus ||= normalized.syncedAt ? 'synced' : 'local';
  normalized.numeroTemporario ||= isOfficialNumber(normalized.numero) ? '' : normalized.numero;
  if (normalized.status === 'Finalizado' && !isOfficialNumber(normalized.numero)) {
    if (normalized.syncStatus !== 'syncing') normalized.syncStatus = 'pending';
  } else if (normalized.status !== 'Finalizado') {
    // Migração v31.1: remove "pendência fantasma" criada pelo autosave da v31.0.
    const draftConfirmed = normalized.syncedAt && normalized.syncedAt >= normalized.updatedAt;
    normalized.syncStatus = draftConfirmed ? 'synced' : 'local';
    if (!draftConfirmed) {
      normalized.clientSync.attempts = 0;
      normalized.clientSync.nextRetryAt = '';
      normalized.clientSync.lastAttemptAt = '';
      normalized.clientSync.lastError = '';
      normalized.clientSync.conflictAt = '';
      normalized.clientSync.remoteUpdatedAt = '';
    }
  }
  normalized.basic.referencia = normalizeReference(normalized.basic.referencia);
  normalized.basic.origemOcorrencia = String(normalized.basic.origemOcorrencia || defaultOriginForReference(normalized.basic.referencia) || 'Solicitação recebida');
  normalized.basic.categoria = String(normalized.basic.categoria || referenceCategory(normalized.basic.referencia) || '');
  const requesterSeed = String(normalized.basic.temSolicitante || '').trim();
  normalized.basic.temSolicitante = ROUND_ORIGINS.has(normalized.basic.origemOcorrencia)
    ? 'Não'
    : (requesterSeed === 'Sim' || requesterSeed === 'Não' ? requesterSeed : (String(normalized.basic.nomeEmissor || '').trim() ? 'Sim' : ''));
  if (normalized.basic.temSolicitante === 'Sim') normalized.basic.origemOcorrencia = 'Solicitação recebida';
  if (normalized.basic.temSolicitante === 'Não' && normalized.basic.origemOcorrencia === 'Solicitação recebida') normalized.basic.origemOcorrencia = 'Constatação espontânea da Segurança';
  normalized.basic.setorArea = String(normalized.basic.setorArea || '');
  normalized.basic.referenciaOutra ||= '';
  normalized.templateData ||= {};
  const rawTemplateData = normalized.templateData;
  normalized.templateData = {
    reference: String(rawTemplateData.reference || normalized.basic.referencia || ''),
    submodel: String(rawTemplateData.submodel || ''),
    requesterRole: String(rawTemplateData.requesterRole || ''),
    evidenceUnavailableReason: String(rawTemplateData.evidenceUnavailableReason || ''),
    documentUnavailableReason: String(rawTemplateData.documentUnavailableReason || ''),
    answers: rawTemplateData.answers && typeof rawTemplateData.answers === 'object' ? rawTemplateData.answers : {}
  };
  const normalizedSubmodel = submodelsFor(normalized.basic.referencia).find(item=>item.id===normalized.templateData.submodel);
  if (normalizedSubmodel?.origin && (!record?.basic?.origemOcorrencia || normalized.basic.origemOcorrencia === 'Solicitação recebida')) normalized.basic.origemOcorrencia = normalizedSubmodel.origin;
  if (normalizedSubmodel?.routingAnswers) Object.entries(normalizedSubmodel.routingAnswers).forEach(([key,value])=>{ if (!normalized.templateData.answers[key]) normalized.templateData.answers[key]=value; });
  if (!isOtherReference(normalized.basic.referencia)) normalized.basic.referenciaOutra = '';
  delete normalized.basic.turnoEmissor;
  normalized.basic.diretoriaOutra ||= '';

  normalized.people = normalized.people.map(person => ({ id: person.id || uid(), ...person }));
  normalized.vehicles = normalized.vehicles.map(vehicle => {
    const person = normalized.people.find(p => p.id === vehicle.pessoaId || p.nome === vehicle.pessoaNome);
    return { id: vehicle.id || uid(), ...vehicle, pessoaId: person?.id || vehicle.pessoaId || '', pessoaNome: person?.nome || vehicle.pessoaNome || '' };
  });
  normalized.materials = normalized.materials.map(material => {
    const person = normalized.people.find(p => p.id === material.pessoaId || p.nome === material.pessoaNome);
    const migrated = { id: material.id || uid(), ...material, pessoaId: person?.id || material.pessoaId || '', pessoaNome: person?.nome || material.pessoaNome || '' };
    migrated.tipoItem = inferMaterialItemType(migrated);
    if (migrated.tipoItem === 'Outro' && !String(migrated.tipoItemOutro || '').trim()) migrated.tipoItemOutro = 'Material/item';
    migrated.numeroSerie = String(migrated.numeroSerie || '');
    migrated.codigoIdentificacao = String(migrated.codigoIdentificacao || '');
    migrated.unidade = '';
    return migrated;
  });
  normalized.documents = normalized.documents.map(document => ({id:document.id || uid(),...document}));

  if (normalized.basic.subreferencia) {
    const sub = normalized.basic.subreferencia === 'Outra' ? normalized.basic.subreferenciaOutra : normalized.basic.subreferencia;
    normalized.basic.referencia = normalizeReference(sub ? `${normalized.basic.referencia || 'Danos materiais'} — ${sub}` : normalized.basic.referencia);
  }
  delete normalized.basic.subreferencia;
  delete normalized.basic.subreferenciaOutra;
  delete normalized.peopleNone;

  const oldStep = Number(normalized.currentStep || 0);
  if (oldStep > 4) normalized.currentStep = oldStep >= 6 ? 4 : oldStep === 5 ? 2 : 3;
  if (normalized.basic.referencia) syncTemplateVerification(normalized);
  return normalized;
}

function recordForSync(record) {
  const clean = structuredClone(record);
  delete clean.clientSync;
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
  noteServerHealthy();
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
  noteServerHealthy();
  return result;
}

async function recoverRecordFromServer(record) {
  if (!record?.id || !apiConfigured() || !navigator.onLine) return false;

  try {
    const payload = await apiGet({ action:'getbyid', id:record.id });
    if (payload.version !== REQUIRED_API_VERSION || payload.schema !== REQUIRED_API_SCHEMA) return false;
    if (!payload.record || payload.record.id !== record.id) return false;

    const remote = normalizeRecord(payload.record);
    if (record.status === 'Finalizado' && !isOfficialNumber(remote.numero)) return false;

    // O servidor é a fonte de verdade para número oficial e metadados já enviados.
    if (isOfficialNumber(remote.numero)) {
      record.numeroTemporario ||= record.numero;
      record.numero = remote.numero;
    }

    if (Array.isArray(remote.attachments) && remote.attachments.length) {
      const remoteById = new Map(remote.attachments.map(file => [file.id, file]));
      record.attachments = (record.attachments || []).map(file => ({ ...file, ...(remoteById.get(file.id) || {}) }));
    }

    record.syncStatus = 'synced';
    record.clientSync ||= {};
    record.clientSync.serverUpdatedAt = remote.updatedAt || record.updatedAt || '';
    record.clientSync.attempts = 0; record.clientSync.nextRetryAt = ''; record.clientSync.lastError = '';
    record.syncedAt = remote.syncedAt || new Date().toISOString();
    record.updatedAt = record.updatedAt || remote.updatedAt || new Date().toISOString();
    await dbPut(record);
    if (state.current?.id === record.id) state.current = structuredClone(record);
    state.syncState = 'online';
    updateHeader();
    return true;
  } catch (error) {
    console.warn('Não foi possível recuperar a confirmação do servidor:', error);
    return false;
  }
}

function retryDelayFor(record) {
  const attempts = Math.max(0, Number(record?.clientSync?.attempts || 0));
  return RETRY_DELAYS_MS[Math.min(attempts, RETRY_DELAYS_MS.length - 1)];
}
function nextRetryText(record) {
  const at = record?.clientSync?.nextRetryAt;
  if (!at) return '';
  const diff = new Date(at).getTime() - Date.now();
  if (diff <= 0) return 'nova tentativa disponível agora';
  const seconds = Math.max(1, Math.ceil(diff / 1000));
  return seconds < 60 ? `nova tentativa em ${seconds}s` : `nova tentativa em ${Math.ceil(seconds/60)} min`;
}
function markRetry(record, error) {
  record.clientSync ||= {};
  record.clientSync.attempts = Number(record.clientSync.attempts || 0) + 1;
  record.clientSync.lastAttemptAt = new Date().toISOString();
  record.clientSync.lastError = String(error?.message || error || 'Falha de sincronização').slice(0,400);
  const delay = retryDelayFor(record);
  record.clientSync.nextRetryAt = new Date(Date.now() + delay).toISOString();
  record.syncStatus = navigator.onLine ? 'error' : 'pending';
  noteSyncError(record.clientSync.lastError);
}
function clearRetry(record) {
  record.clientSync ||= {};
  record.clientSync.attempts = 0; record.clientSync.nextRetryAt = ''; record.clientSync.lastError = ''; record.clientSync.lastAttemptAt = new Date().toISOString(); record.clientSync.conflictAt = ''; record.clientSync.remoteUpdatedAt = '';
}
async function detectRemoteConflict(record) {
  const base = String(record?.clientSync?.serverUpdatedAt || '');
  if (!base || !record?.id || !navigator.onLine || !apiConfigured()) return null;
  try {
    const payload = await apiGet({ action:'getbyid', id:record.id });
    if (!payload.record) return null;
    const remote = normalizeRecord(payload.record);
    const remoteUpdated = String(remote.updatedAt || '');
    if (remoteUpdated && remoteUpdated !== base && new Date(remoteUpdated).getTime() > new Date(base).getTime()) return remote;
  } catch (error) {
    console.warn('Não foi possível verificar conflito antes do envio.', error);
  }
  return null;
}
async function adoptRemoteRecord(local, remote) {
  const adopted = normalizeRecord(remote);
  adopted.clientSync ||= {};
  adopted.clientSync.serverUpdatedAt = remote.updatedAt || '';
  adopted.clientSync.attempts = 0; adopted.clientSync.nextRetryAt = ''; adopted.clientSync.lastError = '';
  await dbPut(adopted);
  if (state.current?.id === adopted.id) state.current = structuredClone(adopted);
  await refreshRecords();
  return adopted;
}

async function syncRecord(record, notify = true, options = {}) {
  clearTimeout(autoSyncTimer);
  stampOperator(record);
  record.clientSync ||= {};

  if (!record?.operator?.usuario || !record?.operator?.registro || !record?.operator?.turno) {
    record.syncStatus = 'error';
    record.clientSync.lastError = 'Identificação do operador ausente.';
    await dbPut(record);
    if (notify) await openAppModal({ kind:'danger', eyebrow:'Identificação ausente', title:'Faça login novamente', message:'O boletim não pode ser enviado sem os dados do vigilante responsável.', confirmText:'Entendi' });
    return false;
  }
  if (!apiConfigured()) {
    record.syncStatus = 'pending'; await dbPut(record); updateConnectivityUi();
    if (notify) await openAppModal({ kind:'warning', eyebrow:'Banco não configurado', title:'Configure o Google Sheets', message:'Abra as configurações técnicas e teste a conexão antes de sincronizar.', confirmText:'Entendi' });
    return false;
  }
  if (!navigator.onLine) {
    record.syncStatus = 'pending';
    markRetry(record, new Error('Sem internet'));
    await dbPut(record); scheduleSyncRetry(); updateConnectivityUi();
    if (notify) showToast('Sem internet. O BO continua salvo no aparelho.');
    return false;
  }

  if (!options.force) {
    const remote = await detectRemoteConflict(record);
    if (remote) {
      record.syncStatus = 'conflict';
      record.clientSync.conflictAt = new Date().toISOString();
      record.clientSync.remoteUpdatedAt = remote.updatedAt || '';
      addAudit(record, 'CONFLITO DE ATUALIZAÇÃO', `Versão da planilha alterada em ${remote.updatedAt || 'horário desconhecido'}.`);
      await dbPut(record); await refreshRecords(); updateHeader(); updateConnectivityUi();
      if (!notify) return false;
      const choice = await openAppModal({
        kind:'warning', eyebrow:'Conflito de edição', title:'Este BO foi atualizado em outro aparelho',
        message:'A versão da planilha mudou depois da última sincronização deste aparelho. Escolha qual versão deve continuar para evitar sobrescrever alterações sem perceber.',
        details:`<strong>Atualização remota:</strong> ${escapeHtml(formatDateTime(remote.updatedAt))}<br><strong>Responsável remoto:</strong> ${escapeHtml(remote.operator?.usuario || 'Não informado')} ${remote.operator?.registro ? `• ${escapeHtml(remote.operator.registro)}` : ''}`,
        confirmText:'Manter minha versão', cancelText:'Decidir depois', tertiaryText:'Carregar versão da planilha', tertiaryValue:'remote'
      });
      if (choice === 'remote') { await adoptRemoteRecord(record, remote); return true; }
      if (choice !== true) return false;
      options.force = true;
    }
  }

  state.syncState = 'syncing';
  record.syncStatus = 'syncing';
  record.clientSync.lastAttemptAt = new Date().toISOString();
  addAudit(record, 'TENTATIVA DE SINCRONIZAÇÃO', options.force ? 'Envio confirmado pelo operador após verificação de conflito.' : 'Envio automático/manual iniciado.');
  await dbPut(record); updateHeader(); updateConnectivityUi();

  try {
    const result = await apiPost({ action:'upsert', operator:record.operator, record:recordForSync(record) });
    if (result.version !== REQUIRED_API_VERSION || result.schema !== REQUIRED_API_SCHEMA || result.operatorSaved !== true) throw new Error(`Implantação incompatível. Esperado API ${REQUIRED_API_VERSION} (${REQUIRED_API_SCHEMA}); recebido ${result.version || 'sem versão'} (${result.schema || 'sem esquema'}).`);
    if (result.recordId && result.recordId !== record.id) throw new Error('O servidor devolveu um registro diferente do boletim enviado.');

    if (record.status === 'Finalizado') {
      if (!isOfficialNumber(result.officialNumber)) throw new Error('A planilha não devolveu o número oficial do BO. O registro continuará pendente para evitar uma falsa sincronização.');
      if (result.officialNumber !== record.numero) { record.numeroTemporario ||= record.numero; record.numero = result.officialNumber; }
    } else if (isOfficialNumber(result.officialNumber)) { record.numeroTemporario ||= record.numero; record.numero = result.officialNumber; }

    if (Array.isArray(result.attachments)) {
      const metadata = new Map(result.attachments.map(file => [file.id, file]));
      record.attachments = (record.attachments || []).map(file => ({ ...file, ...(metadata.get(file.id) || {}) }));
    }

    state.syncState = 'online'; record.syncStatus = 'synced'; record.syncedAt = new Date().toISOString();
    clearRetry(record); record.clientSync.serverUpdatedAt = record.updatedAt || new Date().toISOString();
    noteSyncSuccess();
    await dbPut(record);
    if (state.current?.id === record.id) state.current = structuredClone(record);
    if (notify) showToast(`Boletim ${record.numero} sincronizado.`);
    updateHeader(); updateConnectivityUi(); scheduleSyncRetry();
    return true;
  } catch (error) {
    console.error(error); logClientError('sync', error);
    const recovered = await recoverRecordFromServer(record);
    if (recovered) { noteSyncSuccess(); if (notify) showToast(`Boletim ${record.numero} confirmado pela planilha.`); updateConnectivityUi(); return true; }

    state.syncState = 'error'; markRetry(record, error); addAudit(record, 'FALHA DE SINCRONIZAÇÃO', record.clientSync.lastError);
    await dbPut(record);
    if (state.current?.id === record.id) state.current = structuredClone(record);
    updateHeader(); updateConnectivityUi(); scheduleSyncRetry();
    if (notify) await openAppModal({ kind:'danger', eyebrow:'Falha de sincronização', title:'Não foi possível confirmar o envio', message:escapeHtml(error.message), details:`O registro permanece salvo no aparelho. ${escapeHtml(nextRetryText(record))}. O mesmo ID será reutilizado para evitar boletins duplicados.`, confirmText:'Entendi' });
    return false;
  }
}

function pendingSyncRecords() { return state.records.filter(record => record.status === 'Finalizado' && ['pending','error','conflict'].includes(record.syncStatus)); }
function dueForRetry(record, force=false) {
  if (record.syncStatus === 'conflict') return false;
  if (force) return true;
  const at = record.clientSync?.nextRetryAt;
  return !at || new Date(at).getTime() <= Date.now();
}
async function processSyncQueue({ force=false, onlyId='' } = {}) {
  if (state.syncQueueRunning || !navigator.onLine || !apiConfigured()) { updateConnectivityUi(); return 0; }
  state.syncQueueRunning = true;
  let success = 0;
  try {
    await refreshRecords();
    const queue = state.records.filter(record => (!onlyId || record.id === onlyId) && record.status === 'Finalizado' && ['pending','error'].includes(record.syncStatus) && dueForRetry(record, force));
    for (const record of queue) if (await syncRecord(record, false)) success += 1;
    await refreshRecords();
  } finally {
    state.syncQueueRunning = false; updateConnectivityUi(); scheduleSyncRetry();
    if (state.route === 'syncqueue') renderSyncQueue();
  }
  return success;
}
function scheduleSyncRetry() {
  clearTimeout(syncRetryTimer);
  if (!navigator.onLine || !apiConfigured()) return;
  const candidates = state.records.filter(record => record.status === 'Finalizado' && ['pending','error'].includes(record.syncStatus));
  if (!candidates.length) return;
  const next = Math.min(...candidates.map(record => record.clientSync?.nextRetryAt ? new Date(record.clientSync.nextRetryAt).getTime() : Date.now() + 1200));
  const wait = Math.max(900, Math.min(300000, next - Date.now()));
  syncRetryTimer = setTimeout(() => processSyncQueue().catch(error => logClientError('retry-queue', error)), wait);
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
    await openAppModal({ kind:'success', eyebrow:'Teste de conexão', title:'Google Sheets conectado', message:`API ${escapeHtml(payload.version)} confirmada. Estrutura compacta até a coluna T validada.`, confirmText:'Concluir teste' });
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
  const targets = state.records.filter(record => record.status === 'Finalizado' && ['pending','error'].includes(record.syncStatus));
  if (!targets.length) {
    await openAppModal({ kind: 'info', eyebrow: 'Sem pendências', title: 'Não há boletins finalizados aguardando envio', message: 'Rascunhos permanecem somente no aparelho durante o preenchimento e não entram na fila de sincronização.', confirmText: 'Entendi' });
    return;
  }
  const confirmed = await openAppModal({
    kind: 'warning',
    eyebrow: 'Envio em lote',
    title: `Sincronizar ${targets.length} boletim(ns) finalizado(s)?`,
    message: 'Somente boletins já finalizados e ainda não confirmados serão enviados ao Google Sheets.',
    confirmText: 'Enviar pendências',
    cancelText: 'Cancelar'
  });
  if (!confirmed) return;
  state.syncState = 'syncing';
  renderAbout();
  updateHeader();
  let success = 0;
  for (const record of targets) if (await syncRecord(record, false)) success += 1;
  await refreshRecords();
  state.syncState = success === targets.length ? 'online' : 'error';
  renderAbout();
  updateHeader();
  await openAppModal({
    kind: success === targets.length ? 'success' : 'warning',
    eyebrow: 'Sincronização em lote',
    title: `${success} de ${targets.length} pendência(s) enviadas`,
    message: success === targets.length ? 'Todos os boletins finalizados pendentes foram sincronizados com sucesso.' : 'Alguns boletins finalizados não foram enviados. Verifique a conexão e tente novamente.',
    confirmText: 'Concluir'
  });
}

function updateHeader() {
  const config = {
    login: ['Acesso do vigilante', 'Identificação operacional'],
    home: ['BO Digital GSP', 'Registro de ocorrências'],
    records: ['Boletins', 'Consulta, rascunhos e finalizados'],
    about: ['Configurações técnicas', 'Google Sheets, sincronização e backup'],
    syncqueue: ['Fila de sincronização', 'Pendências, tentativas e conflitos'],
    handoff: ['Passagem de turno', 'Pendências para o próximo vigilante'],
    diagnostics: ['Diagnóstico do sistema', 'Conectividade, PWA e armazenamento'],
    wizard: [recordDisplayTitle(state.current), `Etapa ${state.currentStep + 1} de ${STEPS.length} • ${STEPS[state.currentStep]}`],
    detail: [recordDisplayTitle(state.current), state.current?.status || 'Detalhes']
  };
  const [title, subtitle] = config[state.route] || config.home;
  document.body.dataset.route = state.route;
  headerTitle.textContent = title;
  headerSubtitle.textContent = subtitle;
  const showBack = ['wizard', 'detail', 'syncqueue', 'handoff', 'diagnostics'].includes(state.route);
  backButton.classList.toggle('hidden', !showBack);
  bottomNav.classList.toggle('hidden', state.route === 'login');
  technicalButton.classList.toggle('hidden', !['home','records','syncqueue','handoff'].includes(state.route));
  updateConnectivityUi();
  document.querySelectorAll('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.route === state.route));

  const info = headerStatusInfo();
  headerSync.className = `header-sync ${info.status}`;
  let compactStatus = state.route === 'wizard' && info.status === 'local' ? 'Salvo' : info.label;
  if (state.route === 'home' && info.status === 'synced') compactStatus = 'Planilha OK';
  headerSyncLabel.textContent = compactStatus;
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
  window.dispatchEvent(new CustomEvent('bo-route-change', { detail:{ route:state.route, previous:state.previousRoute } }));
  if (state.operator) scheduleLazyModules();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  app.focus({ preventScroll: true });
}

async function render() {
  if (state.route === 'login') renderLogin();
  if (state.route === 'home') renderHome();
  if (state.route === 'records') renderRecords();
  if (state.route === 'about') renderAbout();
  if (state.route === 'syncqueue') renderSyncQueue();
  if (state.route === 'handoff') renderHandoff();
  if (state.route === 'diagnostics') renderDiagnostics();
  if (state.route === 'wizard') renderWizard();
  if (state.route === 'detail') renderDetail();
}


function renderLogin() {
  const operator = state.operator || { usuario: '', registro: '', turno: '' };
  app.innerHTML = `
    <section class="login-screen">
      <div class="login-card">
        <div class="login-brand-area">
          <img class="stellantis-logo" src="stellantis-logo-white.png" alt="Stellantis">
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
    scheduleLazyModules();
    await handleLaunchIntent();
    showToast('Acesso liberado.');
    persistNavigationState();
    registerOperatorAccess(operatorData).then(ok => {
      if (!ok) showToast('Login salvo. O envio à planilha será tentado novamente.');
    });
  });
}

function renderHome() {
  const drafts = state.records.filter(r=>r.status==='Rascunho');
  const finalized = state.records.filter(r=>r.status==='Finalizado').length;
  const queue = pendingSyncRecords().length;
  const recent = state.records.slice(0,3);
  const attention = drafts.filter(r=>['warning','critical'].includes(operationalTimeInfo(r).level)).length;
  const oldest = drafts.slice().sort((a,b)=>new Date(a.operationalTiming?.startedAt||a.createdAt)-new Date(b.operationalTiming?.startedAt||b.createdAt))[0];
  app.innerHTML = `
    <section class="home-command-card">
      <div class="home-command-copy"><div class="home-brand-stack" aria-label="Stellantis • Segurança Patrimonial"><img src="stellantis-logo-white.png" alt="Stellantis"><strong>Segurança Patrimonial</strong></div><p class="home-command-description">O horário do atendimento começa automaticamente. Depois, o aplicativo orienta a coleta conforme o tipo de ocorrência e confere as informações antes do envio.</p><div class="operator-inline"><span>${ICONS.shield}</span><div><strong>${escapeHtml(state.operator?.usuario||'Não identificado')}</strong><small>Registro ${escapeHtml(state.operator?.registro||'-')} • ${escapeHtml(state.operator?.turno||'-')}</small></div></div></div>
      <div class="home-primary-actions"><button class="button primary home-new-bo" type="button" data-action="new-bo">${ICONS.plus}<span><strong>Novo boletim</strong><small>Registrar chegada e iniciar atendimento</small></span></button><button class="button danger home-end-shift" type="button" data-action="end-shift">${ICONS.logout}<span><strong>Encerrar turno</strong><small>Finalizar a sessão do vigilante</small></span></button></div>
    </section>
    <section class="home-status-grid" aria-label="Situação operacional"><button type="button" class="home-status-tile" data-action="show-drafts"><span>Em andamento</span><strong>${drafts.length}</strong><small>${oldest?`Mais antigo: ${escapeHtml(operationalTimeInfo(oldest).label)}`:'Nenhum BO ativo'}</small></button><button type="button" class="home-status-tile ${attention?'attention':''}" data-action="show-attention"><span>Precisam de atenção</span><strong>${attention}</strong><small>Atendimentos acima do tempo de referência</small></button><button type="button" class="home-status-tile ${queue?'attention':''}" data-action="show-syncqueue"><span>Aguardando envio</span><strong>${queue}</strong><small>${queue?'Requer sincronização':'Fila normal'}</small></button><button type="button" class="home-status-tile" data-action="show-finalized"><span>Finalizados</span><strong>${finalized}</strong><small>Neste aparelho</small></button></section>
    <div class="section-title"><div><p class="eyebrow">Atividade recente</p><h2>Boletins recentes</h2></div>${state.records.length?'<button class="button small secondary" type="button" data-action="show-records">Ver todos</button>':''}</div>
    ${recent.length?`<div class="record-list streamlined-record-list">${recent.map(recordCard).join('')}</div>`:'<div class="entity-empty">Nenhum boletim registrado neste aparelho.</div>'}
    <div class="section-title"><div><p class="eyebrow">Apoio operacional</p><h2>Ferramentas</h2></div></div>
    <div class="card-grid compact-tools"><button class="action-card" type="button" data-action="show-records"><span class="card-icon">${ICONS.search}</span><span><strong>Consultar boletins</strong><span>Número, pessoa, referência ou placa.</span></span></button><button class="action-card" type="button" data-action="show-handoff"><span class="card-icon">${ICONS.list}</span><span><strong>Passagem de turno</strong><span>Continuidade dos atendimentos em aberto.</span></span></button><button class="action-card" type="button" data-action="show-syncqueue"><span class="card-icon">${ICONS.sync}</span><span><strong>Fila de sincronização</strong><span>Somente BOs finalizados aguardando envio.</span></span></button>${window.BO_PWA?.canInstall&&!isStandaloneMode()?`<button class="action-card" type="button" data-action="install-app"><span class="card-icon">${ICONS.download}</span><span><strong>Instalar aplicativo</strong><span>Adicionar à tela inicial.</span></span></button>`:''}</div>
    <details class="home-system-details"><summary>Saúde do sistema e opções técnicas</summary>${renderSystemHealthCard()}<div class="technical-link-wrap home-secondary-actions"><button class="technical-link" type="button" data-action="show-bank">${ICONS.gear} Configurações técnicas</button><button class="technical-link" type="button" data-action="show-diagnostics">${ICONS.warning} Diagnóstico</button></div></details>`;
  bindCommonCards();
}

function recordCard(record) {
  const summary = resolvedReference(record.basic) || 'Ocorrência ainda não classificada';
  const timing = operationalTimeInfo(record);
  const sync = syncStatusLabel(record);
  const category = record.basic?.categoria || referenceCategory(record.basic?.referencia) || '';
  const timeChip = record.status==='Rascunho' ? `<span class="chip time-chip time-${timing.level}">Atendimento: ${escapeHtml(timing.label)}</span>` : `<span class="chip time-chip time-muted">Duração: ${escapeHtml(timing.label)}</span>`;
  const syncChip = record.status==='Finalizado' ? `<span class="chip sync-chip sync-${escapeHtml(record.syncStatus||'local')}">${escapeHtml(sync)}</span>` : '';
  return `<article class="record-card streamlined"><div class="record-main"><div class="record-title-row"><h3>${escapeHtml(record.numero)}</h3><span class="chip status-${record.status.toLowerCase()}">${escapeHtml(record.status)}</span></div><p class="record-category">${escapeHtml(category)}</p><strong class="record-reference">${escapeHtml(summary)}</strong><span class="record-location">${escapeHtml([record.basic?.local,record.basic?.complementoLocal].filter(Boolean).join(' — ')||'Local ainda não informado')}</span><div class="entity-meta">${timeChip}${syncChip}</div></div><div class="record-side"><time>Atualizado ${formatDateTime(record.updatedAt)}</time><button class="button small ${record.status==='Rascunho'?'primary':'secondary'}" type="button" data-open-record="${record.id}">${record.status==='Rascunho'?'Continuar':'Abrir'}</button></div></article>`;
}

async function handleEndShift() {
  const drafts = state.records.filter(record => record.status === 'Rascunho');
  const queue = pendingSyncRecords();
  if (drafts.length) {
    const choice = await openAppModal({
      kind:'warning', eyebrow:'Encerrar turno', title:`Há ${drafts.length} boletim(ns) em andamento`,
      message:'Os atendimentos ainda não finalizados permanecerão salvos neste aparelho para continuidade no próximo turno.',
      details:`<ul><li><strong>Em andamento:</strong> ${drafts.length}</li><li><strong>Aguardando sincronização:</strong> ${queue.length}</li></ul><p>Confira os BOs em andamento antes de encerrar a sessão quando houver alguma ação pendente.</p>`,
      confirmText:'Encerrar turno mesmo assim', cancelText:'Cancelar', tertiaryText:'Ver boletins em andamento', tertiaryValue:'drafts'
    });
    if (choice === 'drafts') { state.filter='Rascunho'; state.attentionOnly=false; state.search=''; await navigate('records'); return; }
    if (choice !== true) return;
  } else {
    const confirmed = await openAppModal({
      kind: queue.length ? 'warning' : 'info', eyebrow:'Encerrar turno', title:'Finalizar a sessão do vigilante?',
      message: queue.length ? `${queue.length} boletim(ns) finalizado(s) aguardam sincronização. Eles continuarão protegidos no aparelho e permanecerão na fila.` : 'A identificação atual será encerrada. O próximo vigilante deverá informar usuário, registro e turno.',
      confirmText:'Encerrar turno', cancelText:'Cancelar'
    });
    if (!confirmed) return;
  }
  clearOperatorSession();
  await navigate('login');
}

function bindCommonCards() {
  app.querySelectorAll('[data-action="new-bo"]').forEach(button => button.addEventListener('click', createNewBo));
  app.querySelectorAll('[data-action="show-records"]').forEach(button => button.addEventListener('click', () => navigate('records')));
  app.querySelectorAll('[data-action="show-bank"]').forEach(button => button.addEventListener('click', () => navigate('about')));
  app.querySelectorAll('[data-action="show-handoff"]').forEach(button => button.addEventListener('click', () => navigate('handoff')));
  app.querySelectorAll('[data-action="show-syncqueue"]').forEach(button => button.addEventListener('click', () => navigate('syncqueue')));
  app.querySelectorAll('[data-action="show-diagnostics"]').forEach(button => button.addEventListener('click', () => navigate('diagnostics')));
  app.querySelectorAll('[data-action="install-app"]').forEach(button => button.addEventListener('click', handleInstallRequest));
  app.querySelectorAll('[data-action="end-shift"],[data-action="logout"]').forEach(button => button.addEventListener('click', handleEndShift));
  app.querySelectorAll('[data-action="show-drafts"]').forEach(button => button.addEventListener('click', () => {
    state.filter = 'Rascunho'; state.attentionOnly = false; state.search = '';
    navigate('records');
  }));
  app.querySelectorAll('[data-action="show-attention"]').forEach(button => button.addEventListener('click', () => {
    state.filter = 'Rascunho'; state.attentionOnly = true; state.search = '';
    navigate('records');
  }));
  app.querySelectorAll('[data-action="show-finalized"]').forEach(button => button.addEventListener('click', () => {
    state.filter = 'Finalizado'; state.attentionOnly = false; state.search = '';
    navigate('records');
  }));
  app.querySelectorAll('[data-open-record]').forEach(button => button.addEventListener('click', () => openRecord(button.dataset.openRecord)));
}

async function createNewBo() {
  const record = stampOperator(createBlankRecord());
  addAudit(record, 'INICIAR BOLETIM', `Boletim e atendimento iniciados automaticamente na chegada ao local, às ${formatDateTime(record.operationalTiming.startedAt)}.`);
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
  const correction = state.correctionFocus;
  const content = correction
    ? renderFocusedCorrection(correction)
    : [renderBasicStep, renderRelatedStep, renderInvestigationStep, renderActionsEvidenceStep, renderReviewStep][state.currentStep]();
  const progress = ((state.currentStep + 1) / STEPS.length) * 100;
  const issueSummary = state.validationIssues.length
    ? `<div class="validation-summary" role="alert"><span>${ICONS.warning}</span><div><strong>Revise esta informação</strong><p>${state.validationIssues.map(issue => escapeHtml(issue.message)).join(' • ')}</p></div></div>`
    : '';
  const numberLabel = isOfficialNumber(state.current.numero)
    ? state.current.numero
    : state.current.status === 'Finalizado'
      ? 'Aguardando número oficial'
      : 'Número será gerado ao finalizar';

  const reviewPending = state.currentStep === 4 && !correction ? reviewItems(state.current).filter(item => !item.ok) : [];
  const actions = correction
    ? `<div class="step-actions correction-actions"><button class="button secondary" type="button" data-correction-action="back">Voltar à revisão</button><div class="right"><button class="button primary" type="button" data-correction-action="save">Salvar correção e revisar</button></div></div>`
    : `<div class="step-actions ${reviewPending.length ? 'review-locked' : ''}">
        <button class="button secondary" type="button" data-step-action="${state.currentStep === 0 ? 'exit' : 'previous'}">${state.currentStep === 0 ? `${ICONS.logout} Salvar e sair` : 'Voltar'}</button>
        <div class="right">
          ${state.currentStep < STEPS.length - 1
            ? '<button class="button primary" type="button" data-step-action="next">Continuar</button>'
            : `<button class="button success" type="button" data-step-action="finalize" ${reviewPending.length ? 'disabled aria-disabled="true"' : ''}>Finalizar boletim</button>`}
        </div>
        ${state.currentStep === 4 && reviewPending.length ? `<p class="finalization-lock">${ICONS.warning} Resolva ${reviewPending.length} pendência(s) para finalizar.</p>` : ''}
      </div>`;

  app.innerHTML = `
    <div class="step-shell ${correction ? 'correction-mode' : ''}">
      <section class="progress-card">
        <div class="progress-top"><strong>${escapeHtml(correction ? 'Correção rápida' : STEPS[state.currentStep])}</strong><span>${correction ? 'Retorno automático à revisão' : `Etapa ${state.currentStep + 1} de ${STEPS.length}`}</span></div>
        <div class="progress-track"><span style="width:${progress}%"></span></div>
        <div class="step-map" aria-label="Etapas do boletim">
          ${STEPS.map((step, index) => `<button type="button" data-jump-step="${index}" class="step-dot ${index < state.currentStep ? 'done' : index === state.currentStep ? 'active' : ''}" ${correction ? 'disabled' : ''}>${index + 1}. ${escapeHtml(step)}</button>`).join('')}
        </div>
        ${correction ? '' : renderStepProgressGuide(state.currentStep, state.current)}
        <div class="record-sync-line"><span class="sync-state sync-${escapeHtml(state.current.syncStatus || 'local')}"><i></i>${escapeHtml(syncStatusLabel(state.current))}</span><span class="record-number-label">${escapeHtml(numberLabel)}</span></div>
      </section>
      ${issueSummary}
      ${correction ? '' : dynamicRequirementBanner(state.current)}
      ${content}
      ${actions}
    </div>`;
  bindWizardInputs();
  bindStepSpecific();
  refreshNextRequiredHighlight();
  app.querySelectorAll('[data-step-action]').forEach(button => button.addEventListener('click', () => handleStepAction(button.dataset.stepAction)));
  app.querySelectorAll('[data-correction-action]').forEach(button => button.addEventListener('click', () => handleCorrectionAction(button.dataset.correctionAction)));
  app.querySelectorAll('[data-jump-step]').forEach(button => button.addEventListener('click', async () => {
    if (state.correctionFocus) return;
    const target = Number(button.dataset.jumpStep);
    if (target > state.currentStep && !(await validateStep(state.currentStep))) return;
    state.validationIssues = [];
    await saveCurrent(true,false);
    state.currentStep = target;
    updateHeader(); renderWizard(); window.scrollTo(0, 0);
  }));
}

function basicReferenceFields(b) {
  const selectedCategory = b.categoria || referenceCategory(b.referencia) || '';
  const selectedGroup = REFERENCE_GROUPS.find(group => group.label === selectedCategory);
  const referenceOtherVisible = isOtherReference(b.referencia);
  const referenceDescription = REFERENCE_DESCRIPTIONS[normalizeReference(b.referencia)] || '';
  const template = templateFor(b.referencia);
  const categoryMarks = {
    'Acesso e credenciamento':'AC','Veículos e circulação':'VC','Materiais, peças e cargas':'MC',
    'Pessoas, comportamento e saúde':'PS','Instalações, patrimônio e emergências':'IE',
    'Segurança patrimonial e controle':'SC','Ocorrências não classificadas':'OU'
  };
  const currentSelection = referenceSelectionValue(b.referencia, state.current?.templateData?.submodel || '');
  const referencesWithCoveredBase = new Set([
    'Material ou equipamento localizado/recolhido',
    'Liberação ou conferência de carga',
    'Remoção ou transporte de veículo por reboque'
  ]);
  const fallbackLabels = {
    'Outra ocorrência de acesso ou credenciamento':'Outra situação de acesso ou credenciamento',
    'Acesso fora do horário autorizado':'Outro caso de acesso fora do horário',
    'Acidente ou colisão envolvendo veículo':'Outro acidente envolvendo veículo',
    'Avaria constatada em veículo':'Outra avaria constatada em veículo',
    'Estacionamento ou circulação em desacordo com as normas':'Outra irregularidade de estacionamento ou circulação',
    'Avaria em material, peça, equipamento ou vasilhame':'Outra avaria em material, peça, equipamento ou vasilhame',
    'Divergência de carga, quantidade ou documentação':'Outra divergência de carga, quantidade ou documentação',
    'Constatação em fiscalização ou inspeção de segurança':'Outra constatação em fiscalização ou inspeção',
    'Não conformidade identificada em processo ou procedimento':'Outra não conformidade de processo ou procedimento',
    'Falha operacional com impacto':'Outra falha operacional com impacto'
  };
  const fallbackLabelFor = reference => fallbackLabels[reference] || 'Outra situação deste tipo';
  const shouldShowBaseFallback = reference => !referencesWithCoveredBase.has(reference) || currentSelection === reference;
  const optionsForReferences = references => references.map(reference => {
    const submodels = submodelsFor(reference);
    const generalDescription = REFERENCE_DESCRIPTIONS[reference] || '';
    if (!submodels.length) {
      return `<option value="${escapeHtml(reference)}" data-reference="${escapeHtml(reference)}" data-description="${escapeHtml(generalDescription)}" ${currentSelection===reference?'selected':''}>${escapeHtml(reference)}</option>`;
    }
    const specifics = submodels.map(item => {
      const value = referenceSelectionValue(reference,item.id);
      const description = item.guidance || `Orientação específica relacionada a ${reference}.`;
      return `<option value="${escapeHtml(value)}" data-reference="${escapeHtml(reference)}" data-description="${escapeHtml(description)}" ${currentSelection===value?'selected':''}>${escapeHtml(item.label)}</option>`;
    }).join('');
    const fallback = shouldShowBaseFallback(reference)
      ? `<option value="${escapeHtml(reference)}" data-reference="${escapeHtml(reference)}" data-description="${escapeHtml(generalDescription)}" ${currentSelection===reference?'selected':''}>${escapeHtml(fallbackLabelFor(reference))}</option>`
      : '';
    return `<optgroup label="${escapeHtml(reference)}">${specifics}${fallback}</optgroup>`;
  }).join('');
  const typeOptions = selectedGroup ? optionsForReferences(selectedGroup.options) : '';
  const globalTypeOptions = REFERENCE_GROUPS.map(group => `<optgroup label="${escapeHtml(group.label)}">${group.options.map(reference => {
    const submodels = submodelsFor(reference);
    const generalDescription = REFERENCE_DESCRIPTIONS[reference] || '';
    if (!submodels.length) {
      return `<option value="${escapeHtml(reference)}" data-reference="${escapeHtml(reference)}" data-description="${escapeHtml(generalDescription)}" ${currentSelection===reference?'selected':''}>${escapeHtml(reference)}</option>`;
    }
    const specifics = submodels.map(item => {
      const value = referenceSelectionValue(reference,item.id);
      return `<option value="${escapeHtml(value)}" data-reference="${escapeHtml(reference)}" data-description="${escapeHtml(item.guidance || '')}" ${currentSelection===value?'selected':''}>${escapeHtml(item.label)}</option>`;
    }).join('');
    const fallback = shouldShowBaseFallback(reference)
      ? `<option value="${escapeHtml(reference)}" data-reference="${escapeHtml(reference)}" data-description="${escapeHtml(generalDescription)}" ${currentSelection===reference?'selected':''}>${escapeHtml(fallbackLabelFor(reference))}</option>`
      : '';
    return `${specifics}${fallback}`;
  }).join('')}</optgroup>`).join('');
  return `
    <div class="field full occurrence-classifier">
      <label class="required">Categoria</label>
      <p class="field-intro">Escolha a categoria correspondente ao fato. A lista seguinte mostrará somente os tipos de boletim daquele tema.</p>
      <div id="bo-category" class="category-choice-grid" role="list">
        ${REFERENCE_GROUPS.map(group => `<button type="button" class="category-choice ${selectedCategory===group.label?'active':''}" data-select-category="${escapeHtml(group.label)}"><span>${escapeHtml(categoryMarks[group.label]||'BO')}</span><strong>${escapeHtml(group.label)}</strong></button>`).join('')}
      </div>
      <button type="button" class="bo-type-search-launch" data-search-bo-type aria-label="Pesquisar tipo de boletim">${ICONS.search}<span>Pesquisar opção...</span></button>
      <select id="bo-ref-search" data-native-select hidden aria-label="Pesquisar tipo de boletim"><option value="" disabled ${!currentSelection?'selected':''}></option>${globalTypeOptions}</select>
      <span class="field-error" data-error-for="bo-category"></span>
    </div>
    ${selectedGroup ? `<div class="field full occurrence-type-select"><label class="required" for="bo-ref">Tipo de boletim</label><select id="bo-ref" aria-label="Tipo de boletim"><option value="" disabled ${!currentSelection?'selected':''}>Selecione o tipo de boletim</option>${typeOptions}</select><small>Toque no campo para escolher ou alterar o tipo dentro da categoria selecionada.</small><span class="field-error" data-error-for="bo-ref"></span></div>` : '<div class="notice subtle"><strong>Selecione uma categoria</strong><span>Os tipos correspondentes serão exibidos em uma lista simples.</span></div>'}
    ${b.referencia ? `<div class="template-guidance"><span class="template-guidance-mark">NX</span><div><strong>Orientação deste boletim</strong><p>${escapeHtml(template.guidance || referenceDescription || 'O aplicativo orientará a coleta das informações essenciais.')}</p></div></div>` : ''}
    ${referenceOtherVisible ? `<div class="field full"><label class="required" for="bo-ref-other">Descreva o assunto da ocorrência</label><input id="bo-ref-other" type="text" value="${escapeHtml(b.referenciaOutra)}" data-path="basic.referenciaOutra" placeholder="Descreva o tema principal de forma objetiva" required><span class="field-error" data-error-for="bo-ref-other"></span></div>` : ''}`;
}

function basicRequesterFields(b) {
  return `
    <div class="field"><label for="bo-reg">Matrícula do solicitante</label><input id="bo-reg" type="text" inputmode="numeric" pattern="[0-9]*" value="${escapeHtml(b.matriculaEmissor)}" data-path="basic.matriculaEmissor" placeholder="Quando aplicável"><small>Informe quando disponível. Não invente matrícula para solicitante externo ou não identificado.</small><span class="field-error" data-error-for="bo-reg"></span></div>
    <div class="field"><label class="required" for="bo-name">Nome do solicitante</label><input id="bo-name" type="text" value="${escapeHtml(b.nomeEmissor)}" data-path="basic.nomeEmissor" autocomplete="name" placeholder="Nome completo" required><span class="field-error" data-error-for="bo-name"></span></div>
    <div class="field full"><label for="bo-email">E-mail do solicitante</label><input id="bo-email" type="email" value="${escapeHtml(b.emailEmissor)}" data-path="basic.emailEmissor" autocomplete="email" placeholder="nome@empresa.com"><span class="field-error" data-error-for="bo-email"></span></div>`;
}

function requesterPresenceCard(record = state.current) {
  const b = record.basic || {};
  const round = isRoundOrigin(record);
  const presence = requesterPresence(record);
  const operator = record.operator || {};
  const lockedNote = round ? '<small>Em rondas internas e externas não existe solicitante: a ocorrência é identificada pela própria equipe durante a atividade programada.</small>' : '<small>Selecione “Não” quando o fato tiver sido identificado pela própria Segurança, sem acionamento de uma pessoa.</small>';
  return `<section class="form-card compact-card requester-presence-card ${(dynamicRequirementActive('requester')||dynamicRequirementActive('operator-responsible'))?'dynamic-required':''}"><p class="eyebrow">1. Solicitante</p><h2>Existe solicitante?</h2><div id="bo-requester-presence" class="segmented-control requester-presence-control" role="group" aria-label="Existe solicitante?">
    <button type="button" data-requester-presence="Sim" class="${presence==='Sim'?'active':''}" ${round?'disabled':''}>Sim</button>
    <button type="button" data-requester-presence="Não" class="${presence==='Não'?'active':''}">Não</button>
  </div>${lockedNote}<span class="field-error" data-error-for="bo-requester-presence"></span>
  ${presence==='Sim' && !round ? `<div class="form-grid requester-fields-grid">${basicRequesterFields(b)}</div>` : ''}
  ${presence==='Não' && !round ? `<div class="requester-none-summary"><strong>Registro sem solicitante</strong><span>Responsável pelo BO: ${escapeHtml(operator.usuario||'vigilante não identificado')} • ${escapeHtml(operator.registro||'registro não informado')} • ${escapeHtml(operator.turno||'turno não informado')}</span></div>` : ''}
  </section>`;
}

function basicLocationFields(b) {
  const recents = recentLocations();
  return `
    <div class="field"><label class="required" for="bo-local">Tipo de local</label><select id="bo-local" data-path="basic.local" data-rerender="true" required>${selectOptions(LOCATIONS, b.local)}</select><span class="field-error" data-error-for="bo-local"></span></div>
    <div class="field"><label class="required" for="bo-local-detail">Identificação detalhada do local</label><input id="bo-local-detail" type="text" value="${escapeHtml(b.complementoLocal)}" data-path="basic.complementoLocal" list="recent-locations" placeholder="${escapeHtml(locationHelp(b.local))}" required><datalist id="recent-locations">${recents.map(item => `<option value="${escapeHtml(item)}"></option>`).join('')}</datalist><small>${escapeHtml(locationHelp(b.local))}</small><span class="field-error" data-error-for="bo-local-detail"></span></div>`;
}

function basicDirectorateFields(b) {
  const directorateOtherVisible = b.diretoria === 'Outra';
  return `
    <div class="field"><label class="required" for="bo-directorate">Diretoria relacionada</label><select id="bo-directorate" data-path="basic.diretoria" data-rerender="true" required>${selectOptions(DIRECTORATES, b.diretoria)}</select><small>Se não houver elementos para definir a diretoria no momento do atendimento, selecione “Não identificada”.</small><span class="field-error" data-error-for="bo-directorate"></span></div>
    <div class="field"><label for="bo-sector">Setor / área relacionada</label><input id="bo-sector" type="text" value="${escapeHtml(b.setorArea || '')}" data-path="basic.setorArea" placeholder="Ex.: Logística, Montagem, GSP..."><small>Informe quando conhecido; ajuda a direcionar a apuração.</small></div>
    ${directorateOtherVisible ? `<div class="field full"><label class="required" for="bo-directorate-other">Nome da outra diretoria</label><input id="bo-directorate-other" type="text" value="${escapeHtml(b.diretoriaOutra)}" data-path="basic.diretoriaOutra" placeholder="Digite a diretoria relacionada" required><span class="field-error" data-error-for="bo-directorate-other"></span></div>` : ''}`;
}

function renderRoutingFields(record = state.current) {
  const questions = routingQuestions(record);
  if (!questions.length) return '';
  const locked = selectedSubmodel(record)?.routingAnswers || {};
  const controls = questions.map(question=>{
    if (locked[question.id] !== undefined) {
      return `<div class="field full template-question required ${dynamicRequirementActive(`template:${question.id}`)?'dynamic-required':''}"><div class="template-question-label"><label>${escapeHtml(question.label)}</label><span class="question-level required">Definido pelo roteiro</span></div><div class="origin-fixed-value"><strong>${escapeHtml(locked[question.id])}</strong><span>Preenchido automaticamente pelo tipo de boletim selecionado.</span></div></div>`;
    }
    return renderTemplateQuestion(question,record);
  }).join('');
  return `<div class="field full routing-question-block"><div class="routing-question-heading"><strong>Direcionamento do formulário</strong><span>Essas respostas definem quais campos serão exigidos nas próximas etapas.</span></div><div class="form-grid">${controls}</div></div>`;
}

function basicOriginFields(record = state.current) {
  const b = record.basic || {};
  const presence = requesterPresence(record);
  if (presence === 'Sim') return '';
  if (presence !== 'Não') return '';
  const reference = normalizeReference(b.referencia || '');
  const forcedRound = reference === 'Irregularidade constatada em ronda interna' ? 'Ronda interna' : reference === 'Irregularidade constatada em ronda externa' ? 'Ronda externa' : '';
  const allowedOrigins = ORIGIN_OPTIONS.filter(item => item !== 'Solicitação recebida');
  const current = String(b.origemOcorrencia || '').trim();
  const value = forcedRound || (allowedOrigins.includes(current) ? current : '');
  if (forcedRound) {
    return `<div class="field full origin-fixed-card"><label>Como o fato foi identificado?</label><div class="origin-fixed-value"><strong>${escapeHtml(forcedRound)}</strong><span>Ronda operacional programada da Segurança Patrimonial.</span></div></div>`;
  }
  return `<div class="field full"><label class="required" for="bo-origin">Como o fato foi identificado?</label><select id="bo-origin" data-path="basic.origemOcorrencia" data-rerender="true" required>${selectOptions(allowedOrigins,value)}</select><small>Informe a atividade pela qual a própria Segurança identificou o fato. “Solicitação recebida” não aparece porque este BO foi marcado como sem solicitante.</small><span class="field-error" data-error-for="bo-origin"></span></div>`;
}

function roundResponsibleCard(record = state.current) {
  const operator = record?.operator || {};
  const origin = record?.basic?.origemOcorrencia || defaultOriginForReference(record?.basic?.referencia);
  return `<section class="form-card compact-card round-responsible-card ${dynamicRequirementActive('round-operator')?'dynamic-required':''}"><p class="eyebrow">Ronda programada</p><h2>Vigilante responsável</h2><p>Rondas internas e externas não possuem solicitante. O responsável é identificado automaticamente pela sessão do vigilante que iniciou o BO.</p><dl class="definition-grid"><div><dt>Vigilante</dt><dd>${escapeHtml(operator.usuario||'Não identificado')}</dd></div><div><dt>Registro</dt><dd>${escapeHtml(operator.registro||'Não informado')}</dd></div><div><dt>Turno</dt><dd>${escapeHtml(operator.turno||'Não informado')}</dd></div><div><dt>Tipo</dt><dd>${escapeHtml(origin||'Ronda')}</dd></div><div><dt>Início do registro</dt><dd>${escapeHtml(formatDateTime(record.operationalTiming?.startedAt||record.createdAt))}</dd></div></dl></section>`;
}

function renderBasicStep() {
  const b = state.current.basic;
  const timing = operationalTimeInfo(state.current);
  const startedAt = state.current.operationalTiming?.startedAt || state.current.createdAt;
  const round = isRoundOrigin(state.current);
  return `
    <section class="bo-start-strip">
      <span class="bo-start-dot"></span>
      <div><strong>BO iniciado no local</strong><small>${escapeHtml(formatDateTime(startedAt))} • ${escapeHtml(timing.label)} em atendimento</small></div>
      <span class="bo-autosave-badge">Salvamento automático</span>
    </section>
    ${requesterPresenceCard(state.current)}
    <section class="form-card occurrence-main-card">
      <p class="eyebrow">2. Ocorrência</p>
      <h1>Identifique e direcione o fato</h1>
      <p>Selecione a categoria e o tipo de boletim. O restante do formulário será adaptado automaticamente ao cenário escolhido.</p>
      <div class="form-grid">
        ${basicReferenceFields(b)}
        ${renderRoutingFields(state.current)}
        ${basicOriginFields(state.current)}
        <div class="field"><label class="required" for="bo-date">Data do fato</label><input id="bo-date" type="date" value="${escapeHtml(b.data)}" data-path="basic.data" required><span class="field-error" data-error-for="bo-date"></span></div>
        <div class="field"><label class="required" for="bo-time">Hora do fato</label><input id="bo-time" type="time" value="${escapeHtml(b.hora)}" data-path="basic.hora" required><small>Se o fato ocorreu antes da chegada, ajuste para o horário informado/estimado.</small><span class="field-error" data-error-for="bo-time"></span></div>
        ${basicLocationFields(b)}
      </div>
    </section>
    ${round ? roundResponsibleCard(state.current) : ''}
    <section class="form-card compact-card area-related-card"><p class="eyebrow">Área relacionada</p><h2>Diretoria e setor</h2><div class="form-grid">${basicDirectorateFields(b)}</div></section>
    <div class="notice info"><strong>Fluxo adaptativo:</strong> o aplicativo mostra apenas o que é necessário ao tipo de BO e às respostas dadas.</div>`;
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
  const indexedItems = (state.current[type] || []).map((item,index) => ({item,index})).filter(({item}) => !config.filter || config.filter(item));
  const status = state.current.verification[config.verify];
  return `<section class="related-block ${config.recommended ? 'recommended' : ''}" data-correction-section="${config.verify}">
    <div class="entity-toolbar">
      <div><p class="eyebrow">${config.recommended ? 'Importante para esta referência' : 'Verificação obrigatória'}</p><h2>${config.title}</h2><p>${config.description}</p></div>
      <button class="button primary small" type="button" data-add-entity="${type}">${ICONS.plus} ${config.button}</button>
    </div>
    ${verificationChoice(config.verify, config.question, indexedItems.length > 0, config.noneLabel)}
    <div class="entity-list">${indexedItems.length ? indexedItems.map(({item,index}) => config.render(item,index)).join('') : `<div class="entity-empty">${escapeHtml(config.empty)}</div>`}</div>
  </section>`;
}

function requiredEntitySection(type, config) {
  const items = (state.current[type] || []).map((item,index)=>({item,index})).filter(({item})=>!config.filter || config.filter(item));
  return `<section class="related-block required-entity-block ${dynamicRequirementActive(config.key)?'dynamic-required':''}" data-correction-section="${config.key}"><div class="entity-toolbar"><div><p class="eyebrow">Informação essencial</p><h2>${config.title}</h2><p>${config.description}</p></div><button class="button primary small" type="button" data-add-entity="${type}">${ICONS.plus} ${config.button}</button></div><div class="entity-list">${items.length?items.map(({item,index})=>config.render(item,index)).join(''):`<div class="entity-empty attention-empty">${escapeHtml(config.empty)}</div>`}</div></section>`;
}

function documentItem(document,index) {
  return `<article class="entity-item"><div><h3>${escapeHtml(document.tipo||'Documento')}</h3><div class="entity-meta">${document.numero?`<span class="chip">${escapeHtml(document.numero)}</span>`:''}${document.observacao?`<span class="chip">${escapeHtml(document.observacao.slice(0,60))}</span>`:''}</div></div><div class="entity-buttons"><button class="mini-icon" type="button" data-edit-entity="documents" data-index="${index}" aria-label="Editar documento">${ICONS.edit}</button><button class="mini-icon danger" type="button" data-delete-entity="documents" data-index="${index}" aria-label="Excluir documento">${ICONS.trash}</button></div></article>`;
}

function requiredDocumentsSection(record = state.current) {
  const docs = record.documents || [];
  const requiredTypes = requiredDocumentTypesFor(record);
  const missingTypes = requiredTypes.filter(type=>!docs.some(document=>normalizeAssistantText(document.tipo)===normalizeAssistantText(type)));
  const reason = String(record.templateData?.documentUnavailableReason || '');
  const needReason = !docs.length || missingTypes.length > 0;
  return `<section class="related-block required-entity-block ${dynamicRequirementActive('documents')?'dynamic-required':''}" data-correction-section="documents"><div class="entity-toolbar"><div><p class="eyebrow">Informação essencial</p><h2>Documentos relacionados</h2><p>Registre MVM, DANFE/NF, DEEM, romaneio ou outro documento somente quando ele realmente fizer parte da operação.</p>${requiredTypes.length?`<small class="document-required-note">Documento(s) esperado(s) neste roteiro: <strong>${escapeHtml(requiredTypes.join(', '))}</strong>.</small>`:''}</div><button class="button primary small" type="button" data-add-entity="documents">${ICONS.plus} Adicionar documento</button></div><div class="entity-list">${docs.length?docs.map(documentItem).join(''):'<div class="entity-empty attention-empty">Nenhum documento cadastrado.</div>'}</div>${missingTypes.length?`<div class="notice warning compact"><strong>Documento específico pendente:</strong><span>${escapeHtml(missingTypes.join(', '))}</span></div>`:''}${needReason?`<div class="field full"><label for="document-unavailable-reason">Se algum documento essencial não puder ser obtido, justifique</label><textarea id="document-unavailable-reason" data-path="templateData.documentUnavailableReason" placeholder="Ex.: documento não estava disponível no local, ainda não havia sido emitido ou não foi apresentado pelo responsável.">${escapeHtml(reason)}</textarea><small>Não invente número de documento para concluir o BO.</small><span class="field-error" data-error-for="document-unavailable-reason"></span></div>`:''}</section>`;
}

function optionalEntitiesPanel(record = state.current, modes = effectiveEntityModes(record)) {
  const options = [];
  const add = (key,label,type,has,extra='') => options.push(`<button class="optional-entity-action ${has?'has-data':''}" type="button" ${extra || `data-add-entity="${type}"`}><span>${has?ICONS.check:ICONS.plus}</span><div><strong>${escapeHtml(label)}</strong><small>${has?'Já há dados cadastrados':'Adicionar somente se estiver relacionado ao fato'}</small></div></button>`);
  if (modes.people === 'recommended') add('people','Outra pessoa envolvida','people',(record.people||[]).some(p=>p.tipo!=='Testemunha'));
  if (modes.witnesses === 'recommended') add('witnesses','Testemunha','people',(record.people||[]).some(p=>p.tipo==='Testemunha'),'data-add-witness');
  if (modes.vehicles === 'recommended') add('vehicles','Veículo','vehicles',(record.vehicles||[]).length>0);
  if (modes.materials === 'recommended') add('materials','Material / peça / carga','materials',(record.materials||[]).length>0);
  if (documentMode(record) === 'recommended') add('documents','Documento da operação','documents',(record.documents||[]).length>0);
  if (!options.length) return '';
  return `<section class="form-card optional-entities-card"><p class="eyebrow">Somente se houver relação com o fato</p><h2>Complementos opcionais</h2><p>Não é necessário responder “não” para cada item. Adicione apenas aquilo que realmente existir.</p><div class="optional-entity-grid">${options.join('')}</div></section>`;
}

function renderRelatedStep() {
  const template = effectiveTemplate(state.current);
  const modes = effectiveEntityModes(state.current);
  const blocks = [];
  if (modes.people === 'required') blocks.push(requiredEntitySection('people',{key:'people',title:'Pessoas diretamente envolvidas',description:'Cadastre ao menos uma pessoa envolvida. Se o solicitante for o próprio envolvido, você pode indicar isso abaixo sem duplicar o cadastro.',button:'Adicionar pessoa',empty:'Nenhuma pessoa envolvida cadastrada.',render:renderPersonItem,filter:person=>person.tipo!=='Testemunha'}));
  if (modes.vehicles === 'required') blocks.push(requiredEntitySection('vehicles',{key:'vehicles',title:'Veículo principal',description:'Cadastre a identificação disponível do veículo. Se placa/chassi não puder ser obtido, registre características observáveis.',button:'Adicionar veículo',empty:'Nenhum veículo cadastrado.',render:renderVehicleItem}));
  if (modes.materials === 'required') blocks.push(requiredEntitySection('materials',{key:'materials',title:'Material, peça, equipamento ou carga',description:materialSectionDescription(state.current),button:'Adicionar item',empty:'Nenhum item cadastrado.',render:renderMaterialItem}));
  if (modes.witnesses === 'required') blocks.push(requiredEntitySection('people',{key:'witnesses',title:'Testemunhas',description:'Cadastre testemunhas que possam contribuir com fatos relevantes.',button:'Adicionar testemunha',empty:'Nenhuma testemunha cadastrada.',render:renderPersonItem,filter:person=>person.tipo==='Testemunha'}));
  if (documentMode(state.current) === 'required') blocks.push(requiredDocumentsSection(state.current));
  const requesterRole = requesterRequired(state.current) && modes.people !== 'hidden' ? `<section class="form-card requester-role-card"><p class="eyebrow">Relação do solicitante</p><h2>${escapeHtml(state.current.basic.nomeEmissor || 'Solicitante')}</h2><div class="field full"><label for="requester-role">O solicitante também está diretamente envolvido?</label><select id="requester-role" data-path="templateData.requesterRole">${selectOptions(['Apenas comunicou/solicitou o atendimento','Envolvido diretamente','Responsável pelo local/material/veículo','Não foi possível definir'],state.current.templateData?.requesterRole||'Apenas comunicou/solicitou o atendimento')}</select><small>Se for o próprio envolvido, não é necessário cadastrá-lo novamente em Pessoas.</small></div></section>` : '';
  return `<section class="form-card step-intro-card"><p class="eyebrow">2. Dados essenciais</p><h1>Cadastre apenas o que o cenário exige</h1><p>O modelo <strong>${escapeHtml(resolvedReference(state.current.basic))}</strong>${selectedSubmodel(state.current)?` • <strong>${escapeHtml(selectedSubmodel(state.current).label)}</strong>`:''} definiu automaticamente os dados essenciais. Complementos opcionais ficam separados e não exigem respostas negativas.</p><div class="template-guidance inline"><span class="template-guidance-mark">NX</span><div><strong>Orientação do modelo</strong><p>${escapeHtml(template.guidance || '')}</p></div></div></section>${requesterRole}<div class="related-grid">${blocks.join('')}</div>${optionalEntitiesPanel(state.current,modes)}`;
}

function templateQuestionExample(question) {
  const key = normalizeAssistantText(`${question.id || ''} ${question.label || ''}`);
  const type = String(question.type || 'text').toLowerCase();
  if (/area externa|trecho.*externo|ponto.*ronda|local exato|posicao\/local|localizacao/.test(key)) return {instruction:'Informe o ponto exato e um referencial físico que permitam localizar o fato sem dúvida.',example:'Lado externo da Portaria 2, junto ao muro lateral direito, próximo ao poste 14.'};
  if (/portaria|ponto de acesso|ponto de entrada/.test(key)) return {instruction:'Informe exatamente a portaria, cancela, acesso ou posto envolvido.',example:'Portaria 2 — acesso de caminhões, faixa de entrada.'};
  if (/horario.*autoriz|faixa autoriz/.test(key)) return {instruction:'Informe o período em que a pessoa, veículo ou atividade estava autorizada.',example:'07:00 às 17:00; ou “não havia autorização para este horário”.'};
  if (/horario|data\/horario|momento/.test(key)) return {instruction:'Registre o horário efetivamente confirmado ou a melhor referência disponível, sem inventar precisão.',example:'18:42; ou “aproximadamente 18:40”, quando o roteiro permitir texto.'};
  if (/justificativa|motivo alegado|motivo informado|motivo da/.test(key)) return {instruction:'Registre o motivo informado pela pessoa, sem assumir que ele é verdadeiro ou falso.',example:'O condutor informou que aguardava a liberação da carga pela área responsável.'};
  if (/responsavel|area consultada|area acionada|setor informado|lideranca|supervisor/.test(key)) return {instruction:'Informe quem foi consultado, comunicado ou acionado e, se souber, a área.',example:'Liderança da Segurança — João Silva; ou Manutenção Predial.'};
  if (/documento|credencial|mvm|nota fiscal|romaneio|deem/.test(key)) return {instruction:'Informe somente o documento realmente apresentado ou confirmado e sua identificação quando disponível.',example:'MVM 123456; DANFE 987654; crachá nº 4321.'};
  if (/quantidade|km lançado|km correto|velocidade/.test(key)) return {instruction:'Informe o valor efetivamente verificado no local, documento ou sistema.',example:'4 peças; KM constatado 128.450; velocidade medida 38 km/h.'};
  if (/lacre/.test(key)) return {instruction:'Registre o número e/ou a condição do lacre exatamente como encontrado.',example:'Lacre 458721 íntegro; ou lacre rompido no momento da conferência.'};
  if (/origem da carga|destino da carga|origem conhecida|destino previsto|local de origem|destino informado/.test(key)) return {instruction:'Informe de onde veio e/ou para onde deveria seguir o item, veículo ou carga.',example:'Origem: Doca 14. Destino: CKD / área de expedição.'};
  if (/dano|avaria|lesao|parte.*danificada|regiao atingida/.test(key)) return {instruction:'Descreva localização, tipo e extensão visível, evitando termos genéricos como “danificado”.',example:'Porta lateral esquerda trincada na região inferior, com aproximadamente 20 cm.'};
  if (/risco|impacto/.test(key)) return {instruction:'Informe o risco concreto observado ou diga que não foi identificado risco imediato.',example:'Risco de acesso indevido pelo portão destrancado; sem risco imediato a pessoas.'};
  if (/condicao.*local|cercamento|iluminacao|portoes|barreiras|sinalizacao/.test(key)) return {instruction:'Descreva o estado observado dos elementos do local que tenham relação com o fato.',example:'Cercamento íntegro, iluminação funcionando e portão lateral fechado.'};
  if (/camera|imagem/.test(key)) return {instruction:'Informe se existem câmeras/imagens úteis e, quando souber, onde estão localizadas.',example:'Câmera externa da Portaria 2 cobre o trecho do muro onde o fato ocorreu.'};
  if (/busca|verificacao|validacao|fiscalizacao|inspecao/.test(key)) return {instruction:'Registre o que foi efetivamente conferido pela equipe e o resultado obtido.',example:'Verificados entorno, vasilhames próximos e imagens disponíveis; item não localizado.'};
  if (/dinamica|circunstancia|como.*ocorreu|como.*constat|como.*perceb/.test(key)) return {instruction:'Conte a sequência do fato em ordem simples: onde começou, o que ocorreu e o que foi observado depois.',example:'Durante a manobra, a empilhadeira tocou a lateral da carreta; após a parada, foi constatado amassamento.'};
  if (/sinais|conduta|comportament|fisic/.test(key)) return {instruction:'Registre apenas sinais observáveis, sem diagnóstico ou julgamento.',example:'Fala alterada, dificuldade de equilíbrio e comportamento agitado.'};
  if (/atendimento medico|ambulatório|encaminhamento.*pessoa|destino da pessoa/.test(key)) return {instruction:'Informe o atendimento/encaminhamento realizado e o destino da pessoa.',example:'Encaminhada ao Ambulatório às 14:20, acompanhada pela liderança.'};
  if (/isolamento|interdicao|evacuad|contencao|combate inicial/.test(key)) return {instruction:'Informe a medida de segurança adotada e o alcance dela.',example:'Área isolada com cones e fita até liberação da Manutenção.'};
  if (/providencia|medida|orientacao|encaminhamento|decisao adotada|acao para regularizacao/.test(key)) return {instruction:'Registre a ação concreta realizada após a constatação.',example:'Veículo retido no local e liderança acionada para validação da autorização.'};
  if (/resultado|condicao final|situacao normalizada|termino|ao final/.test(key)) return {instruction:'Descreva como o fato ficou no encerramento do atendimento.',example:'Acesso não autorizado; pessoa orientada e retirada da área sem novos desdobramentos.'};
  if (/item|material|equipamento|bem|instalacao|substant|carga/.test(key)) return {instruction:'Identifique o objeto ou bem de forma que outra pessoa consiga reconhecê-lo.',example:'Volante automotivo preto, sem embalagem, localizado sobre a calçada externa.'};
  if (/pessoa|condutor|ocupante|proprietario|usuario/.test(key)) return {instruction:'Informe a pessoa relacionada somente quando houver identificação confirmada.',example:'Condutor João Silva, matrícula 12345; ou “não identificado”, se realmente não foi possível.'};
  if (/veiculo|carreta|empilhadeira/.test(key)) return {instruction:'Identifique o veículo/equipamento móvel pelos dados disponíveis e características observáveis.',example:'Caminhão Volvo branco, placa ABC1D23, carreta sider azul.'};
  if (/autorizacao|autorizado/.test(key)) return {instruction:'Registre se a autorização existia e como isso foi confirmado.',example:'Autorização confirmada por telefone com a liderança da área.'};
  if (/norma|procedimento|requisito esperado/.test(key)) return {instruction:'Informe qual regra, procedimento ou requisito estava relacionado ao fato.',example:'Uso obrigatório de EPI na área de carregamento.'};
  if (/descreva|descricao|fato objetivo|o que foi constatado|situacao constatada/.test(key)) return {instruction:'Comece pelo fato observável, sem opinião, culpa ou suposição.',example:'Foi constatada porta lateral aberta, sem pessoa autorizada nas proximidades.'};
  if (type === 'select') return {instruction:'Escolha a alternativa que melhor descreve o que realmente ocorreu.',example:'Selecione somente a opção correspondente ao fato observado ou confirmado.'};
  if (type === 'time') return {instruction:'Informe o horário confirmado ou use a opção de impossibilidade quando não houver base segura.',example:'18:42.'};
  if (type === 'date') return {instruction:'Informe a data correspondente ao fato ou à constatação.',example:'13/08/2026.'};
  if (type === 'number') return {instruction:'Informe apenas o número efetivamente verificado.',example:'4.'};
  if (type === 'textarea') return {instruction:'Escreva uma frase curta com fatos objetivos e verificáveis.',example:'Foi constatado o item no local indicado, sem identificação visível.'};
  return {instruction:'Informe o dado de forma objetiva, usando somente informação disponível e confirmada.',example:'Use uma descrição curta e específica, evitando suposições.'};
}

function essentialQuestionHelp(question) {
  const generated = templateQuestionExample(question);
  const explicit = String(question.help || '').trim();
  return { instruction: explicit || generated.instruction, example: generated.example };
}

function renderTemplateQuestion(question, record = state.current) {
  const value = templateAnswer(record, question.id);
  const id = `template-${question.id}`;
  const level = templateQuestionLevel(question);
  const required = question.required ? 'required' : '';
  const levelLabel = question.required ? 'Essencial' : question.recommended ? 'Recomendado' : 'Opcional';
  let control = '';
  if (question.type === 'select') control = `<select id="${id}" data-path="templateData.answers.${escapeHtml(question.id)}" data-rerender="true" ${required}>${selectOptions(question.options || [], value)}</select>`;
  else if (question.type === 'textarea') control = `<textarea id="${id}" data-path="templateData.answers.${escapeHtml(question.id)}" placeholder="${escapeHtml(question.placeholder || '')}" ${required}>${escapeHtml(value)}</textarea>`;
  else control = `<input id="${id}" type="${escapeHtml(question.type || 'text')}" value="${escapeHtml(value)}" data-path="templateData.answers.${escapeHtml(question.id)}" placeholder="${escapeHtml(question.placeholder || '')}" ${required}>`;
  const unavailable = question.type !== 'select' && question.required ? `<button type="button" class="field-helper-button" data-template-unavailable="${escapeHtml(question.id)}">Não foi possível obter</button>` : '';
  const help = essentialQuestionHelp(question);
  const helpBlock = `<div class="guided-field-help"><strong>Como preencher</strong><span>${escapeHtml(help.instruction)}</span><em><b>Exemplo:</b> ${escapeHtml(help.example)}</em></div>`;
  return `<div class="field full template-question ${level} ${dynamicRequirementActive(`template:${question.id}`)?'dynamic-required':''}" data-template-question="${escapeHtml(question.id)}"><div class="template-question-label"><label class="${question.required?'required':''}" for="${id}">${escapeHtml(question.label)}</label><span class="question-level ${level}">${levelLabel}</span></div>${control}${helpBlock}<span class="field-error" data-error-for="${id}"></span>${unavailable}</div>`;
}

function renderTemplateInsight(record = state.current) {
  const reference = normalizeReference(record.basic?.referencia || '');
  const policy = materialFieldPolicy(record);
  if (reference === 'Divergência de carga, quantidade ou documentação' && policy.expectedQuantityCheck) {
    const rows = (record.materials||[]).filter(material=>material.quantidadePrevista && material.quantidade).map(material=>{
      const expected=Number(String(material.quantidadePrevista).replace(',','.'));
      const observed=Number(String(material.quantidade).replace(',','.'));
      if (!Number.isFinite(expected)||!Number.isFinite(observed)) return null;
      const difference=observed-expected;
      return {name:material.denominacao||'Material',expected,observed,difference};
    }).filter(Boolean);
    if (rows.length) {
      return `<div class="template-calculated-insight ${rows.some(row=>row.difference!==0)?'attention':'ok'}"><span>${rows.some(row=>row.difference!==0)?ICONS.warning:ICONS.check}</span><div><strong>Conferência automática de quantidade</strong><div class="quantity-comparison-list">${rows.map(row=>`<p><b>${escapeHtml(row.name)}</b>: prevista ${escapeHtml(row.expected)} • constatada ${escapeHtml(row.observed)} • diferença ${row.difference>0?'+':''}${escapeHtml(row.difference)}</p>`).join('')}</div></div></div>`;
    }
  }
  return '';
}

function renderInvestigationStep() {
  const r = state.current;
  const h = r.history;
  const template = effectiveTemplate(r);
  const questions = templateQuestionList(r);
  const completeness = templateCompleteness(r);
  const round = isRoundOrigin(r);
  const hasRequester = requesterRequired(r);
  const sourceBlock = !hasRequester
    ? `<section class="form-card fact-source-card ${round?'round-finding-card':''}"><div class="field full"><div class="fact-source-title"><span>1</span><div><strong>${round?'Constatação da ronda':'Constatação da Segurança'}</strong><small>${round?'Registre somente fatos observados ou verificados pelo vigilante.':'O BO não possui solicitante; registre somente o que foi efetivamente observado ou confirmado pela equipe.'}</small></div></div><label class="required" for="history-found">${round?'O que foi constatado durante a ronda?':'O que a equipe constatou?'}</label><textarea id="history-found" data-path="history.identificado" placeholder="${round?'Descreva objetivamente a condição encontrada durante a ronda.':'Descreva objetivamente os fatos observados ou confirmados pela Segurança Patrimonial.'}" required>${escapeHtml(h.identificado)}</textarea><span class="field-error" data-error-for="history-found"></span></div></section>`
    : `<section class="form-card fact-source-card"><div class="fact-source-grid"><div class="field full"><div class="fact-source-title"><span>1</span><div><strong>Relato recebido</strong><small>Informação do solicitante ou de outra fonte relacionada</small></div></div><label class="required" for="history-source">Fonte principal do relato</label><select id="history-source" data-path="history.fonteRelato" required>${selectOptions(['Solicitante','Pessoa envolvida','Testemunha','Terceiro/outro informante','Fonte não identificada'],h.fonteRelato||'Solicitante')}</select><label class="required" for="history-start">O que foi informado à equipe?</label><textarea id="history-start" data-path="history.inicio" placeholder="Escreva apenas o conteúdo informado; o sistema adicionará a fonte do relato." required>${escapeHtml(h.inicio)}</textarea><span class="field-error" data-error-for="history-start"></span></div><div class="field full"><div class="fact-source-title"><span>2</span><div><strong>Constatação da Segurança</strong><small>Somente fatos observados ou verificados</small></div></div><label class="required" for="history-found">O que a equipe constatou no local?</label><textarea id="history-found" data-path="history.identificado" placeholder="Registre somente aquilo que foi efetivamente observado ou confirmado." required>${escapeHtml(h.identificado)}</textarea><span class="field-error" data-error-for="history-found"></span></div></div></section>`;
  return `<section class="form-card step-intro-card"><p class="eyebrow">3. Apuração</p><h1>Apuração guiada: ${escapeHtml(bulletinDisplayType(r))}</h1><p>${hasRequester?'Separe o relato recebido daquilo que a Segurança efetivamente constatou.':round?'A ronda não possui solicitante. Registre a constatação do vigilante e responda apenas ao que for necessário para este fato.':'Este BO não possui solicitante. Registre a constatação da Segurança e os dados específicos do fato.'}</p></section>${sourceBlock}
  <section class="form-card template-question-card"><div class="template-question-head"><div><p class="eyebrow">Roteiro padronizado</p><h2>Informações específicas que não podem ser esquecidas</h2><p>${escapeHtml(template.guidance || '')}</p><p class="template-help-intro">Em cada campo, veja <strong>como preencher</strong> e um <strong>exemplo prático</strong>. Use o exemplo apenas como referência de formato; registre sempre o que realmente ocorreu.</p></div><div class="quality-mini ${completeness.complete?'complete':'pending'}"><strong>${completeness.required.length-completeness.requiredMissing.length}/${completeness.required.length}</strong><span>essenciais</span></div></div><div class="form-grid template-form-grid">${questions.map(q=>renderTemplateQuestion(q,r)).join('')}</div>${renderTemplateInsight(r)}${!questions.length?'<div class="entity-empty">Nenhuma pergunta adicional é necessária. Continue para providências e evidências.</div>':''}</section>
  <div class="notice subtle"><strong>Linguagem profissional:</strong><span>registre fatos observáveis. Não atribua culpa, intenção, diagnóstico ou prática de ilícito sem confirmação. Quando uma informação essencial não puder ser obtida, registre a impossibilidade e o motivo.</span></div>`;
}

function attachmentSatisfiesRequirement(file, requirement) {
  if (!file || !requirement) return false;
  if (String(file.evidencePurpose || '') !== String(requirement.id || '')) return false;
  if (requirement.type === 'photo') return String(file.type || '').startsWith('image/');
  if (requirement.type === 'document') return !String(file.type || '').startsWith('image/') || Boolean(file.dataUrl);
  return true;
}

function evidenceRequirementStatus(record = state.current) {
  const requirements = evidenceRequirementsFor(record);
  return requirements.map(requirement=>({
    ...requirement,
    satisfied:(record.attachments||[]).some(file=>attachmentSatisfiesRequirement(file,requirement))
  }));
}

function renderEvidenceBlock() {
  const template = effectiveTemplate(state.current);
  const size = totalAttachmentSize();
  const requirements = evidenceRequirementStatus(state.current);
  const requiredItems = requirements.filter(item=>item.required);
  const missingRequired = requiredItems.filter(item=>!item.satisfied);
  const evidenceRequired = template.evidence === 'required' || requiredItems.length > 0;
  const unavailableReason = String(state.current.templateData?.evidenceUnavailableReason || '');
  const requirementCards = requirements.length ? `<div class="evidence-requirement-list">${requirements.map(item=>`<article class="evidence-requirement ${item.satisfied?'done':item.required?'pending':''} ${dynamicRequirementActive(`evidence:${item.id}`)?'dynamic-required':''}"><span class="evidence-requirement-icon">${item.satisfied?ICONS.check:ICONS.file}</span><div><strong>${escapeHtml(item.label)}</strong><small>${item.required?'Essencial':'Recomendado'}${item.safety?' • somente se houver condição segura':''}</small></div>${item.satisfied?'<span class="evidence-ok">Registrada</span>':`<button class="button ${item.required?'primary':'secondary'} small" type="button" data-evidence-purpose="${escapeHtml(item.id)}">${ICONS.plus} ${item.type==='photo'?'Tirar foto':'Adicionar'}</button>`}</article>`).join('')}</div>` : '';
  const reasonField = evidenceRequired && (missingRequired.length || !(state.current.attachments||[]).length)
    ? `<div class="field full evidence-reason-field"><label for="evidence-unavailable-reason">Se alguma evidência essencial não puder ser registrada, justifique</label><textarea id="evidence-unavailable-reason" data-path="templateData.evidenceUnavailableReason" placeholder="Ex.: condição de risco, local liberado antes da chegada ou impossibilidade técnica.">${escapeHtml(unavailableReason)}</textarea><small>Uma justificativa real permite concluir o BO sem induzir o vigilante a se expor a risco ou criar uma evidência inexistente.</small><span class="field-error" data-error-for="evidence-unavailable-reason"></span></div>` : '';
  return `<section class="evidence-inline-card"><div class="entity-toolbar"><div><p class="eyebrow">Evidências</p><h2>Fotos e documentos</h2><p>${evidenceRequired?'O modelo indica quais evidências são essenciais. Fotos específicas só são consideradas atendidas quando vinculadas à finalidade correta.':'Inclua evidências quando contribuírem para comprovação ou compreensão do fato.'}</p></div><span class="question-level ${evidenceRequired?'required':'recommended'}">${evidenceRequired?'Orientado':'Recomendado'}</span></div>${requirementCards}${reasonField}<div class="attachment-actions"><button class="button primary" type="button" data-pick-file="camera">${ICONS.plus} Foto adicional</button><button class="button secondary" type="button" data-pick-file="gallery">Galeria</button><button class="button secondary" type="button" data-pick-file="document">Documento adicional</button></div><input id="attachment-camera" class="hidden" type="file" accept="image/*" capture="environment"><input id="attachment-gallery" class="hidden" type="file" multiple accept="image/*"><input id="attachment-document" class="hidden" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,text/plain"><div class="storage-meter"><span>${state.current.attachments.length} arquivo(s)</span><strong>${humanSize(size)} utilizados</strong></div><div class="file-grid">${state.current.attachments.map((file,index)=>renderFileItem(file,index)).join('')}</div>${missingRequired.length&&!unavailableReason?`<div class="notice warning compact">Faltam ${missingRequired.length} evidência(s) essencial(is). Registre-as ou justifique a impossibilidade.</div>`:''}</section>`;
}

function renderActionsEvidenceStep() {
  const r = state.current;
  const h = r.history;
  return `<section class="form-card step-intro-card"><p class="eyebrow">4. Providências e evidências</p><h1>Registre a atuação e o desfecho</h1><p>Informe o que a equipe fez, quem foi acionado e como a situação terminou. Depois, confira as evidências.</p></section>
  <section class="form-card"><div class="form-grid"><div class="field full"><label for="history-actions">Quais providências foram adotadas?</label><textarea id="history-actions" data-path="history.providenciasFonte" placeholder="Ex.: orientação realizada, área isolada, material recolhido, veículo retido...">${escapeHtml(h.providenciasFonte)}</textarea><span class="field-error" data-error-for="history-actions"></span></div><div class="field full">${verificationChoice('providencias','Foi necessária alguma providência?',Boolean(h.providenciasFonte||h.providencias),'Nenhuma providência adicional foi necessária')}</div><div class="field full"><label for="history-called">Quem ou qual área foi acionada?</label><textarea id="history-called" data-path="history.acionados" placeholder="Ex.: liderança, ambulatório, bombeiros, manutenção, RH...">${escapeHtml(h.acionados)}</textarea></div><div class="field full"><label class="required" for="history-end">Como a situação terminou?</label><textarea id="history-end" data-path="history.desfecho" placeholder="Registre a condição final do local, pessoas, veículo ou material." required>${escapeHtml(h.desfecho)}</textarea><span class="field-error" data-error-for="history-end"></span></div><div class="field full"><label for="history-extra">Informação complementar</label><textarea id="history-extra" data-path="history.adicional" placeholder="Use somente para informação relevante que ainda não tenha sido registrada.">${escapeHtml(h.adicional)}</textarea></div></div></section>
  ${renderEvidenceBlock()}
  <section class="form-card assistant-output-card compact-assistant-output"><div class="narrative-builder"><div><p class="eyebrow">NEXO • padronização local</p><h2>Relato profissional</h2><p>O texto é organizado em blocos de contexto, relato recebido (quando houver), constatação, apuração, providências e desfecho.</p></div><div class="narrative-builder-actions"><button class="button primary" type="button" data-action="assistant-generate">${ICONS.file} Gerar/atualizar relato</button><button class="button secondary" type="button" data-action="assistant-review-text">${ICONS.check} Revisar redação</button></div></div><div class="field full"><label for="history-report">Prévia do relato consolidado</label><textarea id="history-report" data-path="history.relato" data-manual-narrative="true" placeholder="O relato será gerado automaticamente antes da revisão.">${escapeHtml(h.relato)}</textarea><small>Você pode ajustar a redação, sem inserir fatos não confirmados.</small></div></section>`;
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
  const quantity = material.quantidade
    ? `<span class="chip">Qtd. ${escapeHtml(material.quantidade)}</span>`
    : material.quantidadeStatus === 'Não foi possível determinar' ? '<span class="chip">Quantidade não determinada</span>' : '';
  const technical = material.desenho ? `<span class="chip">Desenho ${escapeHtml(material.desenho)}</span>` : material.numeroSerie ? `<span class="chip">Série ${escapeHtml(material.numeroSerie)}</span>` : material.codigoIdentificacao ? `<span class="chip">Cód. ${escapeHtml(material.codigoIdentificacao)}</span>` : '';
  return `<article class="entity-item">
    <div><h3>${escapeHtml(material.denominacao || 'Item sem denominação')}</h3><div class="entity-meta"><span class="chip">${escapeHtml(materialItemTypeLabel(material))}</span>${quantity}${technical}${material.pessoaNome ? `<span class="chip">Ligado a ${escapeHtml(material.pessoaNome)}</span>` : ''}</div></div>
    <div class="entity-buttons"><button class="mini-icon" type="button" data-edit-entity="materials" data-index="${index}" aria-label="Editar item">${ICONS.edit}</button><button class="mini-icon danger" type="button" data-delete-entity="materials" data-index="${index}" aria-label="Excluir item">${ICONS.trash}</button></div>
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
    ? `<button class="file-preview-button" type="button" data-preview-file="${index}" aria-label="Ampliar ${escapeHtml(file.name)}"><img src="${file.dataUrl}" alt="Prévia de ${escapeHtml(file.name)}"></button>`
    : ICONS.file;
  const cloud = file.driveUrl
    ? `<a class="file-cloud-link" href="${escapeHtml(file.driveUrl)}" target="_blank" rel="noopener">Abrir no Drive</a>`
    : `<span class="file-local-state">${file.dataUrl ? 'Aguardando sincronização' : 'Somente metadados'}</span>`;
  const purpose = file.evidencePurpose ? evidenceRequirementsFor(state.current).find(item=>item.id===file.evidencePurpose)?.label || file.evidencePurpose : '';
  return `<article class="file-item"><div class="file-preview">${preview}</div><div class="file-info"><div><strong>${escapeHtml(file.name)}</strong><span>${humanSize(file.size)}</span>${purpose?`<span class="file-purpose">${escapeHtml(purpose)}</span>`:''}${cloud}</div><button class="mini-icon danger" type="button" data-delete-file="${index}" aria-label="Excluir anexo">${ICONS.trash}</button></div></article>`;
}

function renderHistoryStep() {
  const h = state.current.history;
  return `${renderAssistantCard(state.current)}
  <section class="form-card">
    <p class="eyebrow">3. Relato e providências</p><h1>Registre os fatos por partes</h1>
    <p>Preencha somente o que ocorreu. O Assistente Operacional reúne os dados das etapas anteriores e monta o texto padronizado.</p>
    <div class="form-grid">
      <div class="field full"><label class="required" for="history-start">Como a ocorrência começou?</label><textarea id="history-start" data-path="history.inicio" placeholder="Ex.: Durante a ronda, o vigilante foi informado de que..." required>${escapeHtml(h.inicio)}</textarea><span class="field-error" data-error-for="history-start"></span></div>
      <div class="field full"><label class="required" for="history-found">O que foi identificado ou constatado?</label><textarea id="history-found" data-path="history.identificado" placeholder="Descreva o fato principal de forma objetiva." required>${escapeHtml(h.identificado)}</textarea><span class="field-error" data-error-for="history-found"></span></div>
      <div class="field full"><label for="history-people">Há outra pessoa ou equipe que ainda não foi cadastrada?</label><textarea id="history-people" data-path="history.presentes" placeholder="Use somente para informações que não aparecem nos cadastros de pessoas.">${escapeHtml(h.presentes)}</textarea></div>
      <div class="field full"><label for="history-actions">Quais ações foram realizadas?</label><textarea id="history-actions" data-path="history.providenciasFonte" placeholder="Ex.: área isolada, material recolhido, veículo retido, liderança comunicada...">${escapeHtml(h.providenciasFonte)}</textarea><span class="field-error" data-error-for="history-actions"></span></div>
      <div class="field full">${verificationChoice('providencias','Foi necessária alguma providência?',Boolean(h.providenciasFonte || h.providencias),'Nenhuma providência necessária')}</div>
      <div class="field full"><label for="history-called">Quem ou qual área foi acionada?</label><textarea id="history-called" data-path="history.acionados" placeholder="Ex.: ambulatório, bombeiros, liderança, manutenção...">${escapeHtml(h.acionados)}</textarea></div>
      <div class="field full"><label class="required" for="history-end">Como a situação terminou?</label><textarea id="history-end" data-path="history.desfecho" placeholder="Informe o desfecho e a condição final do local, pessoas, veículo ou material." required>${escapeHtml(h.desfecho)}</textarea><span class="field-error" data-error-for="history-end"></span></div>
      <div class="field full"><label for="history-extra">Existe alguma informação adicional?</label><textarea id="history-extra" data-path="history.adicional" placeholder="Registre somente o que ainda não foi informado.">${escapeHtml(h.adicional)}</textarea></div>
    </div>
  </section>
  <section class="form-card assistant-output-card">
    <div class="narrative-builder">
      <div><p class="eyebrow">Resultado do assistente</p><h2>Providências consolidadas</h2><p>O texto abaixo é organizado a partir das ações e áreas informadas. Ele continua editável.</p></div>
      <button class="button secondary" type="button" data-action="assistant-generate">${ICONS.sync} Atualizar textos</button>
    </div>
    <div class="field full"><label for="history-provisions-final">Providências finais</label><textarea id="history-provisions-final" data-path="history.providencias" data-manual-providences="true" placeholder="O assistente organizará as providências informadas.">${escapeHtml(h.providencias)}</textarea><small>Edite apenas para ajustar clareza ou acrescentar um fato confirmado.</small></div>
    <div class="field full"><label class="required" for="history-report">Relato consolidado</label><textarea id="history-report" data-path="history.relato" data-manual-narrative="true" placeholder="O assistente reunirá data, local, pessoas, veículos, materiais, documentos e demais dados efetivamente preenchidos." required>${escapeHtml(h.relato)}</textarea><small>Revise o texto antes de finalizar. Alterações manuais serão preservadas.</small><span class="field-error" data-error-for="history-report"></span></div>
  </section>`;
}

function reviewItems(record = state.current) {
  const step0 = collectStepIssues(0,record);
  const step1 = collectStepIssues(1,record);
  const step2 = collectStepIssues(2,record);
  const step3 = collectStepIssues(3,record);
  const step4 = collectStepIssues(4,record);
  const make = (key,label,step,issues,fallbackTarget,description)=>({key,label,step,issues,ok:issues.length===0,targetId:issues[0]?.id||fallbackTarget||'',targetKey:issues[0]?.key||key,description:issues[0]?.message||description});
  return [
    make('occurrence','Identificação da ocorrência',0,step0,'bo-ref',requesterRequired(record)?'Classificação, origem, local, solicitante e área conferidos.':'Classificação, origem, local, vigilante responsável e área conferidos.'),
    make('essentials','Dados essenciais',1,step1,'','Pessoas, veículos, materiais e documentos exigidos pelo cenário foram conferidos.'),
    make('investigation','Apuração padronizada',2,step2,requesterRequired(record)?'history-start':'history-found',requesterRequired(record)?'Relato recebido, constatação e dados específicos do tipo concluídos.':'Constatação da Segurança e dados específicos do tipo concluídos.'),
    make('actions','Providências e desfecho',3,step3.filter(i=>i.key!=='attachments'),'history-actions','Providências, acionamentos e condição final conferidos.'),
    make('attachments','Evidências',3,step3.filter(i=>i.key==='attachments'),'','Fotos/documentos específicos foram registrados ou a indisponibilidade foi justificada.'),
    make('report','Relato profissional',4,step4.filter(i=>i.key==='report'),'history-report','Relato consolidado atualizado.'),
    make('acknowledgements','Conferência final',4,step4.filter(i=>i.key==='acknowledgements'),'ack-reviewed','Responsabilidade pelo registro confirmada.')
  ];
}

function renderReviewStatusList(items, pending = false) {
  if (!items.length) return pending ? '<div class="review-empty-state">Nenhuma pendência obrigatória.</div>' : '';
  return items.map(item => pending
    ? `<button class="review-status-row pending" type="button" data-review-fix="${escapeHtml(item.key)}">
        <span class="review-status-icon">${ICONS.warning}</span>
        <span class="review-status-copy"><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.description)}</small></span>
        <span class="review-status-action">Corrigir ${ICONS.chevron}</span>
      </button>`
    : `<div class="review-status-row complete">
        <span class="review-status-icon">${ICONS.check}</span>
        <span class="review-status-copy"><strong>${escapeHtml(item.label)}</strong><small>Conferido</small></span>
      </div>`
  ).join('');
}

function renderAcknowledgementsCard(record = state.current, compact = false) {
  const r = record;
  return `<section class="form-card confirmations-card ${compact ? 'correction-card' : ''}" data-correction-section="acknowledgements">
    <p class="eyebrow">Confirmações obrigatórias</p><h2>Responsabilidade pelo registro</h2>
    <div class="confirmation-stack">
      <label class="checkbox-card ${r.acknowledgements.reviewed ? 'checked' : 'required-unchecked'}"><input id="ack-reviewed" type="checkbox" data-path="acknowledgements.reviewed" data-rerender="true" required ${r.acknowledgements.reviewed ? 'checked' : ''}><span><strong>Revisei todas as informações</strong><span>Conferi dados, pessoas, veículos, materiais, evidências, relato e providências.</span></span></label>
      <label class="checkbox-card ${r.acknowledgements.truthful ? 'checked' : 'required-unchecked'}"><input id="ack-truthful" type="checkbox" data-path="acknowledgements.truthful" data-rerender="true" required ${r.acknowledgements.truthful ? 'checked' : ''}><span><strong>As informações correspondem aos fatos disponíveis</strong><span>Confirmo o conteúdo conforme o registro realizado.</span></span></label>
    </div>
  </section>`;
}

function renderReviewStep() {
  const r = state.current;
  const b = r.basic;
  const reference = bulletinDisplayType(r);
  const directorate = b.diretoria === 'Outra' ? b.diretoriaOutra : b.diretoria;
  const items = reviewItems(r);
  const pending = items.filter(item=>!item.ok);
  const completed = items.filter(item=>item.ok);
  const quality = templateCompleteness(r);
  const answers = templateAnswerSummary(r);
  const timing = operationalTimeInfo(r);
  const start = r.operationalTiming?.startedAt || r.createdAt;
  const round = isRoundOrigin(r);
  const evidence = evidenceRequirementStatus(r);
  const evidenceStatus = evidence.length
    ? `<div class="evidence-review-list">${evidence.map(item=>`<div class="evidence-review-row ${item.satisfied?'complete':item.required?'pending':'optional'}"><span>${item.satisfied?ICONS.check:(item.required?ICONS.warning:ICONS.info)}</span><strong>${escapeHtml(item.label)}</strong><small>${item.satisfied?'Registrada':item.required?'Pendente':'Opcional'}</small></div>`).join('')}</div>`
    : (r.attachments.length?`<div class="entity-meta">${r.attachments.map(file=>`<span class="chip">${escapeHtml(file.name)}</span>`).join('')}</div>`:'<div class="entity-empty">Nenhuma evidência específica prevista para este cenário.</div>');
  const hasRequester = requesterRequired(r);
  const identityBlock = hasRequester
    ? `<div><dt>Origem</dt><dd>${escapeHtml(b.origemOcorrencia||'Solicitação recebida')}</dd></div><div><dt>Solicitante</dt><dd>${escapeHtml(b.nomeEmissor||'Não informado')}${b.matriculaEmissor?` • ${escapeHtml(b.matriculaEmissor)}`:''}</dd></div>`
    : `<div><dt>Origem</dt><dd>${escapeHtml(b.origemOcorrencia||'Constatação da Segurança')}</dd></div><div><dt>${round?'Vigilante da ronda':'Vigilante responsável'}</dt><dd>${escapeHtml(r.operator?.usuario||'Não identificado')} • ${escapeHtml(r.operator?.registro||'')}</dd></div>`;
  const investigationSource = hasRequester
    ? `<div style="grid-column:1/-1"><dt>Relato recebido • ${escapeHtml(r.history.fonteRelato||'Solicitante')}</dt><dd>${escapeHtml(r.history.inicio||'Não informado')}</dd></div><div style="grid-column:1/-1"><dt>Constatação da Segurança</dt><dd>${escapeHtml(r.history.identificado||'Não informado')}</dd></div>`
    : `<div style="grid-column:1/-1"><dt>${round?'Constatação da ronda':'Constatação da Segurança'}</dt><dd>${escapeHtml(r.history.identificado||'Não informado')}</dd></div>`;
  return `<div class="review-professional-layout v32-review">
    <aside class="review-overview-panel">
      <section class="review-summary-card"><p class="eyebrow">5. Revisão e finalização</p><h1>Conferência do BO</h1><div class="quality-status ${pending.length?'pending':'complete'}"><span>${pending.length?ICONS.warning:ICONS.check}</span><div><strong>${pending.length?`${pending.length} pendência(s) essencial(is)`:(quality.recommendedMissing.length?'Completo • há recomendações':'Completo')}</strong><small>${pending.length?'Corrija antes de finalizar.':'O BO pode ser finalizado após a conferência do vigilante.'}</small></div></div></section>
      ${pending.length?`<section class="review-status-group pending-group"><div class="review-group-title"><span>${ICONS.warning}</span><div><strong>Pendências</strong><small>${pending.length} item(ns)</small></div></div>${renderReviewStatusList(pending,true)}</section>`:'<section class="review-ready-card">'+ICONS.success+'<div><strong>BO pronto para envio</strong><small>Todos os itens essenciais foram conferidos.</small></div></section>'}
      <section class="review-status-group completed-group"><div class="review-group-title"><span>${ICONS.check}</span><div><strong>Blocos conferidos</strong><small>${completed.length} concluído(s)</small></div></div>${renderReviewStatusList(completed)}</section>
    </aside>
    <div class="review-detail-panel">
      <section class="review-context-card"><div><p class="eyebrow">${escapeHtml(b.categoria || referenceCategory(b.referencia))}</p><h2>${escapeHtml(reference||'Ocorrência não classificada')}</h2><p>Revise o conteúdo abaixo. O término do atendimento será registrado automaticamente ao finalizar.</p></div><span class="review-number">${escapeHtml(isOfficialNumber(r.numero)?r.numero:'Número gerado ao enviar')}</span></section>
      <section class="review-section timing-review-section"><div class="review-head"><h3>Controle do atendimento</h3></div><div class="review-body"><dl class="definition-grid"><div><dt>Início do BO / chegada ao local</dt><dd>${escapeHtml(formatDateTime(start))}</dd></div><div><dt>Duração até agora</dt><dd>${escapeHtml(timing.label)}</dd></div><div><dt>Término</dt><dd>Será registrado ao finalizar e enviar</dd></div><div><dt>Vigilante</dt><dd>${escapeHtml(r.operator?.usuario||'Não identificado')} • ${escapeHtml(r.operator?.registro||'')}</dd></div></dl></div></section>
      <div class="review-grid compact-review-grid">
        ${reviewSection('Ocorrência',0,`<dl class="definition-grid"><div><dt>Fato</dt><dd>${formatDateOnly(b.data)} às ${escapeHtml(b.hora)}</dd></div>${identityBlock}<div><dt>Local</dt><dd>${escapeHtml(b.local)} — ${escapeHtml(b.complementoLocal)}</dd></div><div><dt>Diretoria / área</dt><dd>${escapeHtml(directorate||'Não informada')}${b.setorArea?` • ${escapeHtml(b.setorArea)}`:''}</dd></div></dl>`)}
        ${reviewSection('Elementos relacionados',1,`<div class="review-mini-grid five-items"><div><strong>Envolvidos</strong><span>${r.people.filter(person=>person.tipo!=='Testemunha').length||'Nenhum'}</span></div><div><strong>Testemunhas</strong><span>${r.people.filter(person=>person.tipo==='Testemunha').length||'Nenhuma'}</span></div><div><strong>Veículos</strong><span>${r.vehicles.length||'Nenhum'}</span></div><div><strong>Materiais/cargas</strong><span>${r.materials.length||'Nenhum'}</span></div><div><strong>Documentos</strong><span>${r.documents?.length||'Nenhum'}</span></div></div>`)}
        ${reviewSection('Apuração padronizada',2,`<dl class="definition-grid">${investigationSource}${answers.map(item=>`<div><dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(item.value)}</dd></div>`).join('')}</dl>`)}
        ${reviewSection('Providências e desfecho',3,`<dl class="definition-grid"><div style="grid-column:1/-1"><dt>Providências</dt><dd>${escapeHtml(r.history.providenciasFonte||r.history.providencias||'Nenhuma providência adicional')}</dd></div><div><dt>Áreas acionadas</dt><dd>${escapeHtml(r.history.acionados||'Não informado')}</dd></div><div><dt>Desfecho</dt><dd>${escapeHtml(r.history.desfecho||'Não informado')}</dd></div></dl>`)}
        ${reviewSection(`Evidências (${r.attachments.length})`,3,`${evidenceStatus}${meaningfulText(r.templateData?.evidenceUnavailableReason)?`<div class="notice subtle"><strong>Justificativa de indisponibilidade:</strong><span>${escapeHtml(r.templateData.evidenceUnavailableReason)}</span></div>`:''}`)}
        ${reviewSection('Relato consolidado',4,`<div class="final-report-preview">${renderReportPreview(r.history.relato||'Relato ainda não gerado.')}</div><div class="about-actions"><button class="button secondary small" type="button" data-action="assistant-generate">${ICONS.sync} Atualizar relato</button><button class="button secondary small" type="button" data-action="assistant-review-text">${ICONS.check} Revisar redação</button></div>`, 'report')}
      </div>
      ${renderAcknowledgementsCard(r)}
      <div class="notice info"><strong>Ao finalizar:</strong><span>o horário de término será registrado, o BO ficará bloqueado para edição principal e o aplicativo tentará enviá-lo ao Google Sheets.</span></div>
    </div>
  </div>`;
}

function reviewSection(title, step, body, editKey = '') {
  const keyAttr = editKey ? ` data-review-edit-key="${escapeHtml(editKey)}"` : '';
  const editLabel = editKey === 'report' ? 'Editar relato' : 'Editar seção';
  return `<section class="review-section"><div class="review-head"><h3>${title}</h3><button class="button small secondary" type="button" data-review-edit="${step}"${keyAttr}>${editLabel}</button></div><div class="review-body">${body}</div></section>`;
}

function reviewItemByKey(key, record = state.current) {
  return reviewItems(record).find(item => item.key === key) || null;
}

function renderWitnessCorrection() {
  const witnesses = state.current.people.filter(person => person.tipo === 'Testemunha');
  return `<section class="related-block correction-card" data-correction-section="witnesses">
    <div class="entity-toolbar"><div><p class="eyebrow">Correção rápida</p><h2>Testemunhas</h2><p>Cadastre as testemunhas identificadas ou confirme que não existem.</p></div><button class="button primary small" type="button" data-add-entity="people">${ICONS.plus} Adicionar pessoa</button></div>
    ${verificationChoice('witnesses','Existem testemunhas identificadas?',witnesses.length > 0,'Não há testemunhas')}
    <div class="entity-list">${witnesses.length ? witnesses.map((item,index) => renderPersonItem(item, state.current.people.indexOf(item))).join('') : '<div class="entity-empty">Nenhuma testemunha cadastrada.</div>'}</div>
  </section>`;
}

function renderBasicCorrection(focus) {
  const b = state.current.basic;
  const id = focus.targetId || '';
  const round = isRoundOrigin(state.current);
  let title = 'Dados da ocorrência';
  let fields = '';
  if (['bo-date','bo-time','bo-ref','bo-ref-other','bo-origin'].includes(id)) {
    title = 'Classificação, origem, data e hora';
    fields = `${basicReferenceFields(b)}${renderRoutingFields(state.current)}${basicOriginFields(state.current)}<div class="field"><label class="required" for="bo-date">Data da ocorrência</label><input id="bo-date" type="date" value="${escapeHtml(b.data)}" data-path="basic.data" required><span class="field-error" data-error-for="bo-date"></span></div><div class="field"><label class="required" for="bo-time">Hora da ocorrência</label><input id="bo-time" type="time" value="${escapeHtml(b.hora)}" data-path="basic.hora" required><span class="field-error" data-error-for="bo-time"></span></div>`;
  } else if (['bo-requester-presence','bo-reg','bo-name','bo-email'].includes(id)) {
    title = 'Solicitante';
    fields = `<div class="field full"><label class="required" for="bo-requester-presence-select">Existe solicitante?</label><select id="bo-requester-presence-select" data-path="basic.temSolicitante" data-rerender="true" ${round?'disabled':''}>${selectOptions(['Sim','Não'],requesterPresence(state.current)|| (round?'Não':''))}</select></div>${requesterRequired(state.current)&&!round?basicRequesterFields(b):''}`;
  } else if (['bo-local','bo-local-detail'].includes(id)) {
    title = 'Local da ocorrência';
    fields = basicLocationFields(b);
  } else if (['bo-directorate','bo-directorate-other'].includes(id)) {
    title = 'Diretoria relacionada';
    fields = basicDirectorateFields(b);
  } else {
    fields = `<div class="field"><label class="required" for="bo-date">Data da ocorrência</label><input id="bo-date" type="date" value="${escapeHtml(b.data)}" data-path="basic.data" required></div><div class="field"><label class="required" for="bo-time">Hora da ocorrência</label><input id="bo-time" type="time" value="${escapeHtml(b.hora)}" data-path="basic.hora" required></div>${basicReferenceFields(b)}${renderRoutingFields(state.current)}${basicOriginFields(state.current)}${requesterPresence(state.current)==='Sim'&&!round?basicRequesterFields(b):''}${basicLocationFields(b)}${basicDirectorateFields(b)}`;
  }
  const roundCard = round ? roundResponsibleCard(state.current) : '';
  return `<section class="form-card correction-card" data-correction-section="occurrence"><p class="eyebrow">Correção rápida</p><h1>${title}</h1><p>Altere somente os dados necessários e salve para retornar à revisão.</p><div class="form-grid">${fields}</div></section>${roundCard}`;
}

function renderProvidencesCorrection() {
  const h = state.current.history;
  return `<section class="form-card correction-card" data-correction-section="providencias"><p class="eyebrow">Correção rápida</p><h1>Providências adotadas</h1><p>Registre as ações realizadas, áreas acionadas e a forma como a situação terminou.</p><div class="form-grid">
    <div class="field full"><label for="history-actions">Quais ações foram realizadas?</label><textarea id="history-actions" data-path="history.providenciasFonte" placeholder="Ex.: área isolada, material recolhido, veículo retido, liderança comunicada...">${escapeHtml(h.providenciasFonte)}</textarea><span class="field-error" data-error-for="history-actions"></span></div>
    <div class="field full">${verificationChoice('providencias','Foi necessária alguma providência?',Boolean(h.providenciasFonte || h.providencias),'Nenhuma providência necessária')}</div>
    <div class="field full"><label for="history-called">Quem ou qual área foi acionada?</label><textarea id="history-called" data-path="history.acionados" placeholder="Ex.: ambulatório, bombeiros, liderança, manutenção...">${escapeHtml(h.acionados)}</textarea></div>
    <div class="field full"><label class="required" for="history-end">Como a situação terminou?</label><textarea id="history-end" data-path="history.desfecho" required>${escapeHtml(h.desfecho)}</textarea><span class="field-error" data-error-for="history-end"></span></div>
    <div class="field full"><label for="history-provisions-final">Providências consolidadas</label><textarea id="history-provisions-final" data-path="history.providencias" data-manual-providences="true">${escapeHtml(h.providencias)}</textarea><span class="field-error" data-error-for="history-provisions-final"></span></div>
  </div></section>`;
}

function renderReportCorrection() {
  const h = state.current.history;
  return `${renderAssistantCard(state.current)}<section class="form-card correction-card report-manual-editor" data-correction-section="report"><p class="eyebrow">Correção manual do relatório</p><h1>Editar relato consolidado</h1><p>Faça diretamente os ajustes de concordância, pontuação, clareza ou organização que considerar necessários. Preserve os títulos dos blocos para manter o relato fácil de conferir. O NEXO auxilia na revisão automática, mas a decisão final de redação permanece com o vigilante.</p><div class="form-grid">
    <div class="field full"><label class="required" for="history-report">Relato consolidado</label><textarea id="history-report" rows="16" data-path="history.relato" data-manual-narrative="true" required>${escapeHtml(h.relato)}</textarea><small>Você pode corrigir livremente a redação, desde que mantenha os fatos compatíveis com as informações registradas no boletim.</small><span class="field-error" data-error-for="history-report"></span></div>
  </div><div class="notice subtle"><strong>Precisa alterar um fato?</strong><span>Use “Voltar à revisão” e edite o bloco correspondente (Ocorrência, Apuração, Providências, Pessoas, Veículos ou Materiais). Depois, atualize novamente o relato.</span></div><div class="correction-inline-action"><button class="button secondary" type="button" data-action="assistant-review-text">${ICONS.check} Aplicar revisão automática</button></div></section>`;
}

function renderFocusedCorrection(focus) {
  const requiredPeople = () => requiredEntitySection('people',{key:'people',title:'Pessoa diretamente envolvida',description:'Cadastre somente pessoas diretamente relacionadas ao fato.',button:'Adicionar pessoa',empty:'Nenhuma pessoa cadastrada.',render:renderPersonItem,filter:person=>person.tipo!=='Testemunha'});
  const requiredVehicles = () => requiredEntitySection('vehicles',{key:'vehicles',title:'Veículo relacionado',description:'Cadastre a identificação disponível. Se placa/chassi não puder ser obtido, registre características observáveis.',button:'Adicionar veículo',empty:'Nenhum veículo cadastrado.',render:renderVehicleItem});
  const requiredMaterials = () => requiredEntitySection('materials',{key:'materials',title:'Material, peça, equipamento ou carga',description:materialSectionDescription(state.current),button:'Adicionar item',empty:'Nenhum item cadastrado.',render:renderMaterialItem});
  const configs = {
    essentials: renderRelatedStep,
    investigation: renderInvestigationStep,
    actions: renderActionsEvidenceStep,
    people: requiredPeople,
    witnesses: renderWitnessCorrection,
    vehicles: requiredVehicles,
    materials: requiredMaterials,
    documents: () => requiredDocumentsSection(state.current),
    providencias: renderProvidencesCorrection,
    report: renderReportCorrection,
    attachments: renderEvidenceBlock,
    acknowledgements: () => renderAcknowledgementsCard(state.current, true)
  };
  const item = reviewItemByKey(focus.key) || focus;
  const content = focus.key === 'occurrence' ? renderBasicCorrection(focus) : (configs[focus.key]?.() || renderBasicCorrection(focus));
  return `<section class="correction-intro"><button class="correction-back-link" type="button" data-correction-action="back">${ICONS.chevron} Voltar à revisão</button><p class="eyebrow">Correção orientada</p><h1>${escapeHtml(item.label || 'Correção do boletim')}</h1><p>${escapeHtml(item.description || 'Atualize a informação pendente e salve para retornar à revisão.')}</p></section>${content}`;
}

function renderPersonItemReview(p) { return `<div><strong>${escapeHtml(p.nome)}</strong><div class="entity-meta"><span class="chip">${escapeHtml(p.tipo)}</span><span class="chip">${escapeHtml(p.vinculo)}</span></div></div>`; }
function renderVehicleItemReview(v) { return `<div><strong>${escapeHtml(v.placa)}</strong><div class="entity-meta"><span class="chip">${escapeHtml([v.marca,v.modelo].filter(Boolean).join(' ')||'Sem modelo')}</span>${v.pessoaId?`<span class="chip">Ligado a ${escapeHtml(personNameById(v.pessoaId)||v.pessoaNome||'pessoa')}</span>`:''}</div></div>`; }
function renderMaterialItemReview(m) { const qty=m.quantidade?`<span class="chip">Qtd. ${escapeHtml(m.quantidade)}</span>`:(m.quantidadeStatus==='Não foi possível determinar'?'<span class="chip">Quantidade não determinada</span>':''); return `<div><strong>${escapeHtml(m.denominacao||'Item sem identificação técnica')}</strong><div class="entity-meta"><span class="chip">${escapeHtml(materialItemTypeLabel(m))}</span>${qty}</div></div>`; }

function refreshRequiredFieldStates(root = document) {
  root.querySelectorAll('input[required], select[required], textarea[required]').forEach(control => {
    const empty = control.type === 'checkbox' ? !control.checked : !String(control.value || '').trim();
    // v32: campos vazios continuam neutros durante o preenchimento. O destaque de erro
    // só aparece quando o vigilante tenta avançar/revisar e existe uma pendência real.
    control.classList.remove('field-control-empty');
    control.classList.toggle('field-control-filled', !empty && control.type !== 'checkbox');
    control.closest('.field')?.classList.remove('has-empty-required');
    if (control.tagName === 'SELECT') syncModalSelectButton(control);
    const checkCard = control.closest('.checkbox-card');
    if (checkCard) {
      checkCard.classList.toggle('checked', !empty);
      checkCard.classList.toggle('required-unchecked', empty && state.currentStep === STEPS.length - 1);
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
    if (control.dataset.manualNarrative === 'true') {
      state.current.history.relatoEditado = true;
      state.current.assistant ||= { generatedAt: '', profile: '', stale: false };
      state.current.assistant.generatedAt = new Date().toISOString();
      state.current.assistant.stale = false;
    }
    if (control.dataset.manualProvidences === 'true') state.current.history.providenciasEditadas = true;
  });
}

function bindWizardInputs() {
  app.querySelectorAll('[data-path]').forEach(control => {
    const update = () => {
      state.validationIssues = [];
      const canChangeRequirements = control.dataset.rerender === 'true' || control.dataset.path === 'templateData.submodel' || control.dataset.path.startsWith('templateData.answers.');
      const beforeRequirements = canChangeRequirements ? dynamicRequirementSnapshot(state.current) : null;
      let value = control.type === 'checkbox' ? Boolean(control.checked) : control.value;
      if (control.id === 'bo-reg') {
        value = String(value).replace(/\D/g,'');
        control.value = value;
      }
      setPath(state.current, control.dataset.path, value);
      if (control.dataset.path === 'basic.temSolicitante') {
        if (value === 'Não') {
          if (state.current.basic.origemOcorrencia === 'Solicitação recebida') state.current.basic.origemOcorrencia = 'Constatação espontânea da Segurança';
          clearRequesterData(state.current);
        }
        if (value === 'Sim' && (!state.current.basic.origemOcorrencia || state.current.basic.origemOcorrencia === 'Constatação espontânea da Segurança')) state.current.basic.origemOcorrencia = 'Solicitação recebida';
      }
      if (control.dataset.path === 'basic.referencia' && !isOtherReference(value)) state.current.basic.referenciaOutra = '';
      if (control.dataset.path === 'basic.diretoria' && value !== 'Outra') state.current.basic.diretoriaOutra = '';
      if (control.dataset.path === 'basic.origemOcorrencia' && ROUND_ORIGINS.has(String(value||''))) {
        state.current.basic.temSolicitante = 'Não';
        clearRequesterData(state.current);
        state.current.history.fonteRelato = 'Constatação da equipe em ronda';
      }
      if (control.dataset.path === 'templateData.submodel') {
        const sub = selectedSubmodel(state.current);
        if (sub?.origin) {
          if (requesterPresence(state.current) === 'Sim') state.current.basic.origemOcorrencia = 'Solicitação recebida';
          else if (sub.origin !== 'Solicitação recebida') state.current.basic.origemOcorrencia = sub.origin;
        }
        if (sub?.routingAnswers) {
          state.current.templateData.answers ||= {};
          Object.entries(sub.routingAnswers).forEach(([key,val])=>{ state.current.templateData.answers[key]=val; });
        }
        syncTemplateVerification(state.current);
      }
      if (control.dataset.path.startsWith('templateData.answers.')) syncTemplateVerification(state.current);
      if (control.dataset.manualNarrative === 'true') {
        state.current.history.relatoEditado = true;
        state.current.assistant ||= { generatedAt: '', profile: '', stale: false };
        state.current.assistant.generatedAt = new Date().toISOString();
        state.current.assistant.stale = false;
      } else if (control.dataset.manualProvidences === 'true') {
        state.current.history.providenciasEditadas = true;
      } else if (!control.dataset.path.startsWith('acknowledgements.')) {
        markAssistantStale(state.current);
      }
      clearFieldError(control.id);
      refreshRequiredFieldStates(app);
      if (beforeRequirements) registerDynamicRequirementChanges(beforeRequirements, dynamicRequirementSnapshot(state.current));
      refreshStepProgressUi();
      refreshNextRequiredHighlight();
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
  app.querySelectorAll('[data-select-category]').forEach(button => button.addEventListener('click', async()=>{
    const category = button.dataset.selectCategory || '';
    if (!category) return;
    const changed = state.current.basic.categoria !== category;
    if (changed) {
      state.current.basic.categoria = category;
      state.current.basic.referencia = '';
      state.current.basic.referenciaOutra = '';
      state.current.basic.origemOcorrencia = requesterPresence(state.current) === 'Sim' ? 'Solicitação recebida' : '';
      state.current.templateData ||= {reference:'',submodel:'',requesterRole:'',evidenceUnavailableReason:'',documentUnavailableReason:'',answers:{}};
      state.current.templateData.reference = '';
      state.current.templateData.submodel = '';
      state.current.templateData.requesterRole = '';
      state.current.templateData.evidenceUnavailableReason = '';
      state.current.templateData.documentUnavailableReason = '';
      state.current.templateData.answers = {};
      ['people','witnesses','vehicles','materials'].forEach(key => { state.current.verification[key] = 'pending'; });
      markAssistantStale(state.current);
      await saveCurrent(true,false);
      renderWizard();
    }
    setTimeout(()=>{
      const select = document.getElementById('bo-ref');
      if (select) openSelectionModal(select);
    },60);
  }));

  const applyReferenceSelection = async (select) => {
    const parsed = parseReferenceSelection(select.value || '');
    const reference = parsed.reference;
    if (!reference) return;
    const beforeRequirements = dynamicRequirementSnapshot(state.current);
    const previousReference = normalizeReference(state.current.basic.referencia || '');
    const previousSubmodel = String(state.current.templateData?.submodel || '');
    state.current.basic.referencia = reference;
    state.current.basic.categoria = referenceCategory(reference);
    if (!isOtherReference(reference)) state.current.basic.referenciaOutra = '';
    state.current.templateData ||= {reference:'',submodel:'',requesterRole:'',evidenceUnavailableReason:'',documentUnavailableReason:'',answers:{}};
    const selectionChanged = previousReference !== reference || previousSubmodel !== parsed.submodel;
    if (selectionChanged) {
      state.current.templateData.answers = {};
      state.current.templateData.evidenceUnavailableReason = '';
      state.current.templateData.documentUnavailableReason = '';
      ['people','witnesses','vehicles','materials'].forEach(key => { state.current.verification[key] = 'pending'; });
    }
    state.current.templateData.reference = reference;
    state.current.templateData.submodel = parsed.submodel;
    const sub = selectedSubmodel(state.current);
    const routedOrigin = sub?.origin || defaultOriginForReference(reference);
    if (sub?.routingAnswers) Object.entries(sub.routingAnswers).forEach(([key,val])=>{ state.current.templateData.answers[key]=val; });
    if (ROUND_ORIGINS.has(routedOrigin)) {
      state.current.basic.origemOcorrencia = routedOrigin;
      state.current.basic.temSolicitante = 'Não';
      clearRequesterData(state.current);
      state.current.history.fonteRelato = 'Constatação da equipe em ronda';
    } else if (requesterPresence(state.current) === 'Sim') {
      state.current.basic.origemOcorrencia = 'Solicitação recebida';
    } else if (requesterPresence(state.current) === 'Não') {
      if (routedOrigin && routedOrigin !== 'Solicitação recebida') state.current.basic.origemOcorrencia = routedOrigin;
      else if (!state.current.basic.origemOcorrencia || state.current.basic.origemOcorrencia === 'Solicitação recebida') state.current.basic.origemOcorrencia = 'Constatação espontânea da Segurança';
    }
    syncTemplateVerification(state.current);
    registerDynamicRequirementChanges(beforeRequirements, dynamicRequirementSnapshot(state.current));
    markAssistantStale(state.current);
    await saveCurrent(true,false);
    renderWizard();
    showNexoAction(`Tipo “${bulletinDisplayType(state.current)}” aplicado. O fluxo foi adaptado.`, 'success', 'NEXO');
  };

  const referenceSelect = app.querySelector('#bo-ref');
  if (referenceSelect) referenceSelect.addEventListener('change', () => applyReferenceSelection(referenceSelect));
  const referenceSearchSelect = app.querySelector('#bo-ref-search');
  if (referenceSearchSelect) referenceSearchSelect.addEventListener('change', () => applyReferenceSelection(referenceSearchSelect));
  app.querySelector('[data-search-bo-type]')?.addEventListener('click', () => {
    const select = app.querySelector('#bo-ref-search');
    if (select) openSelectionModal(select);
  });

  app.querySelectorAll('[data-requester-presence]').forEach(button => button.addEventListener('click', async()=>{
    if (button.disabled) return;
    const value = button.dataset.requesterPresence === 'Sim' ? 'Sim' : 'Não';
    const beforeRequirements = dynamicRequirementSnapshot(state.current);
    state.current.basic.temSolicitante = value;
    if (value === 'Não') {
      if (!state.current.basic.origemOcorrencia || state.current.basic.origemOcorrencia === 'Solicitação recebida') state.current.basic.origemOcorrencia = 'Constatação espontânea da Segurança';
      clearRequesterData(state.current);
    } else {
      state.current.basic.origemOcorrencia = 'Solicitação recebida';
    }
    registerDynamicRequirementChanges(beforeRequirements, dynamicRequirementSnapshot(state.current));
    markAssistantStale(state.current);
    await saveCurrent(true,false);
    renderWizard();
  }));
  app.querySelectorAll('[data-template-unavailable]').forEach(button => button.addEventListener('click', async()=>{
    const id = button.dataset.templateUnavailable;
    const question = templateQuestionList(state.current).find(item => item.id === id);
    if (!question) return;
    const reason = String(prompt(`Por que não foi possível obter “${question.label}”?

Informe uma justificativa curta:`) || '').trim();
    if (!reason) return;
    state.current.templateData.answers[id] = `Não foi possível obter — ${reason}`;
    markAssistantStale(state.current);
    await saveCurrent(true,false);
    renderWizard();
    showToast('Indisponibilidade registrada com justificativa.');
  }));
  app.querySelectorAll('[data-add-witness]').forEach(button => button.addEventListener('click',()=>openEntityDialog('people',null,{tipo:'Testemunha'})));
  app.querySelectorAll('[data-timing-action]').forEach(button => button.addEventListener('click', async()=>{
    commitVisibleControls(app);
    state.current.operationalTiming ||= { startedAt:'', endedAt:'', startedBy:null, endedBy:null, autoEnded:false };
    const action = button.dataset.timingAction;
    if (action === 'start' && !state.current.operationalTiming.startedAt) {
      const now = new Date().toISOString();
      state.current.operationalTiming.startedAt = now;
      state.current.operationalTiming.endedAt = '';
      state.current.operationalTiming.startedBy = operatorSnapshot();
      state.current.operationalTiming.endedBy = null;
      state.current.operationalTiming.autoEnded = false;
      addAudit(state.current, 'INICIAR ATENDIMENTO', `Atendimento operacional iniciado em ${formatDateTime(now)}.`);
      await saveCurrent(true, false);
      renderWizard();
      showToast('Atendimento operacional iniciado.');
      return;
    }
    if (action === 'end' && state.current.operationalTiming.startedAt && !state.current.operationalTiming.endedAt) {
      const confirmed = await openAppModal({kind:'warning',eyebrow:'Controle de atendimento',title:'Encerrar o atendimento operacional agora?',message:'O horário atual será registrado como término do atendimento. O BO poderá continuar sendo preenchido normalmente.',confirmText:'Encerrar atendimento',cancelText:'Manter em andamento'});
      if (!confirmed) return;
      const now = new Date().toISOString();
      state.current.operationalTiming.endedAt = now;
      state.current.operationalTiming.endedBy = operatorSnapshot();
      state.current.operationalTiming.autoEnded = false;
      addAudit(state.current, 'ENCERRAR ATENDIMENTO', `Atendimento operacional encerrado em ${formatDateTime(now)}.`);
      await saveCurrent(true, false);
      renderWizard();
      showToast('Atendimento operacional encerrado.');
    }
  }));
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
    markAssistantStale(state.current);
    await saveCurrent(true, false);
    renderWizard();
  }));
  app.querySelectorAll('[data-delete-entity]').forEach(button=>button.addEventListener('click',async()=>{
    const type=button.dataset.deleteEntity,index=Number(button.dataset.index);
    const labels={people:'esta pessoa',vehicles:'este veículo',materials:'este material',documents:'este documento'};
    const confirmed=await openAppModal({kind:'warning',eyebrow:'Exclusão de cadastro',title:`Excluir ${labels[type]}?`,message:'O item será removido do boletim.',confirmText:'Excluir item',cancelText:'Manter cadastro'});
    if(!confirmed)return;
    const removed=state.current[type][index];
    state.current[type].splice(index,1);
    markAssistantStale(state.current);
    if(type==='people'){
      state.current.vehicles.forEach(v=>{if(v.pessoaId===removed.id){v.pessoaId='';v.pessoaNome='';}});
      state.current.materials.forEach(m=>{if(m.pessoaId===removed.id){m.pessoaId='';m.pessoaNome='';}});
      state.current.verification.people = state.current.people.some(p=>p.tipo!=='Testemunha') ? 'has' : 'pending';
      state.current.verification.witnesses = state.current.people.some(p=>p.tipo==='Testemunha') ? 'has' : 'pending';
    } else if(!state.current[type].length) {
      state.current.verification[{vehicles:'vehicles',materials:'materials'}[type]]='pending';
    }
    await saveCurrent(true); renderWizard(); showToast('Cadastro excluído.');
  }));
  app.querySelectorAll('[data-review-fix]').forEach(button => button.addEventListener('click', () => openReviewCorrection(reviewItemByKey(button.dataset.reviewFix))));
  app.querySelectorAll('[data-review-edit]').forEach(button=>button.addEventListener('click',async()=>{
    const editKey = button.dataset.reviewEditKey || '';
    if (editKey === 'report') {
      await openReviewCorrection(reviewItemByKey('report'), true);
      return;
    }
    state.correctionFocus=null;
    state.currentStep=Number(button.dataset.reviewEdit);
    renderWizard();
    updateHeader();
    window.scrollTo(0,0);
  }));
  app.querySelectorAll('[data-evidence-purpose]').forEach(button=>button.addEventListener('click',()=>{state.pendingEvidencePurpose=button.dataset.evidencePurpose||'';app.querySelector('#attachment-camera')?.click();}));
  app.querySelectorAll('[data-pick-file]').forEach(button=>button.addEventListener('click',()=>{state.pendingEvidencePurpose='';app.querySelector(`#attachment-${button.dataset.pickFile}`)?.click();}));
  ['camera','gallery','document'].forEach(kind=>{const input=app.querySelector(`#attachment-${kind}`);if(input)input.addEventListener('change',handleAttachments);});
  bindAttachmentPreviews();
  app.querySelectorAll('[data-delete-file]').forEach(button=>button.addEventListener('click',async()=>{
    const confirmed=await openAppModal({kind:'warning',eyebrow:'Remoção de anexo',title:'Excluir este arquivo?',message:'O arquivo será removido do aparelho.',confirmText:'Excluir arquivo',cancelText:'Cancelar'});
    if(!confirmed)return;
    const removed = state.current.attachments[Number(button.dataset.deleteFile)];
    state.current.attachments.splice(Number(button.dataset.deleteFile),1);
    addAudit(state.current, 'REMOVER ANEXO', removed?.name || 'Arquivo removido');
    markAssistantStale(state.current);
    if(!state.current.attachments.length)state.current.verification.attachments='pending';
    await saveCurrent(true);renderWizard();
  }));
  app.querySelectorAll('[data-assistant-step]').forEach(button => button.addEventListener('click', async () => {
    commitVisibleControls(app);
    await saveCurrent(true, false);
    state.currentStep = Number(button.dataset.assistantStep || 0);
    updateHeader();
    renderWizard();
    await new Promise(resolve => requestAnimationFrame(resolve));
    const id = button.dataset.assistantId;
    const target = id ? document.getElementById(id) : document.querySelector('.verification-control');
    target?._modalSelectButton?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    (target?._modalSelectButton || target)?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    (target?._modalSelectButton || target)?.focus?.({ preventScroll: true });
  }));

  const checkAssistant = app.querySelector('[data-action="assistant-check"]');
  if (checkAssistant) checkAssistant.addEventListener('click', async () => {
    commitVisibleControls(app);
    await saveCurrent(true, false);
    const missing = assistantMissing(state.current);
    if (!missing.length) {
      await openAppModal({
        kind: 'success',
        eyebrow: 'Assistente Operacional',
        title: 'Informações principais conferidas',
        message: 'Os dados necessários para montar o relato estão preenchidos.',
        confirmText: 'Concluir'
      });
      return;
    }
    const required = missing.filter(item => item.level === 'required');
    const recommended = missing.filter(item => item.level === 'recommended');
    const first = required[0] || recommended[0];
    const go = await openAppModal({
      kind: required.length ? 'warning' : 'info',
      eyebrow: 'Assistente Operacional',
      title: `${required.length} obrigatória(s) e ${recommended.length} recomendada(s) pendente(s)`,
      message: required.length ? 'Complete as informações obrigatórias antes de gerar o relato.' : 'As informações abaixo podem tornar o boletim mais completo.',
      details: `<ul>${missing.map(item => `<li><strong>${item.level === 'required' ? 'Obrigatória' : 'Recomendada'}:</strong> ${escapeHtml(item.label)} — ${escapeHtml(item.message)}</li>`).join('')}</ul>`,
      confirmText: 'Ir para a primeira pendência',
      cancelText: 'Fechar lista'
    });
    if (go && first) {
      state.currentStep = first.step;
      updateHeader();
      renderWizard();
      await new Promise(resolve => requestAnimationFrame(resolve));
      const target = first.id ? document.getElementById(first.id) : document.querySelector(`[data-verification-key="${first.key}"]`);
      (target?._modalSelectButton || target)?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      (target?._modalSelectButton || target)?.focus?.({ preventScroll: true });
    }
  });

  app.querySelectorAll('[data-action="assistant-generate"]').forEach(generate => generate.addEventListener('click', async () => {
    commitVisibleControls(app);
    const requiredMissing = assistantMissing(state.current, 'required').filter(item => item.id !== 'history-report');
    if (requiredMissing.length) {
      const first = requiredMissing[0];
      const confirmed = await openAppModal({
        kind: 'warning',
        eyebrow: 'Assistente Operacional',
        title: 'Há informações obrigatórias pendentes',
        message: 'O relato só será montado depois que os dados essenciais forem conferidos.',
        details: `<ul>${requiredMissing.slice(0, 8).map(item => `<li>${escapeHtml(item.label)} — ${escapeHtml(item.message)}</li>`).join('')}</ul>`,
        confirmText: 'Ir para a primeira pendência',
        cancelText: 'Continuar nesta etapa'
      });
      if (confirmed) {
        state.currentStep = first.step;
        updateHeader();
        renderWizard();
        await new Promise(resolve => requestAnimationFrame(resolve));
        const target = first.id ? document.getElementById(first.id) : document.querySelector(`[data-verification-key="${first.key}"]`);
        (target?._modalSelectButton || target)?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
        (target?._modalSelectButton || target)?.focus?.({ preventScroll: true });
      }
      return;
    }

    const manuallyEdited = (state.current.history.relatoEditado && meaningfulText(state.current.history.relato)) ||
      (state.current.history.providenciasEditadas && meaningfulText(state.current.history.providencias));
    if (manuallyEdited) {
      const ok = await openAppModal({
        kind: 'warning',
        eyebrow: 'Texto editado manualmente',
        title: 'Substituir os textos atuais?',
        message: 'O relato ou as providências possuem ajustes manuais. Gerar novamente substituirá esses textos usando os dados atuais do boletim.',
        confirmText: 'Gerar novamente',
        cancelText: 'Manter textos atuais'
      });
      if (!ok) return;
    }

    state.current.history.providencias = buildAssistantProvidences(state.current);
    state.current.history.providenciasEditadas = false;
    state.current.history.relato = buildNarrative(state.current);
    state.current.history.relatoEditado = false;
    state.current.assistant = {
      generatedAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
      profile: assistantContext(state.current).profile,
      stale: false
    };
    addAudit(state.current, 'ASSISTENTE DE RELATO', `Relato padronizado gerado para ${state.current.assistant.profile}.`);
    await saveCurrent(true, false);
    renderWizard();
    showToast('Relato gerado e revisado pelo NEXO.');
    await new Promise(resolve => requestAnimationFrame(resolve));
    document.querySelector('.assistant-output-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));

  app.querySelectorAll('[data-action="assistant-review-text"]').forEach(reviewButton => reviewButton.addEventListener('click', async () => {
    commitVisibleControls(app);
    if (state.current.assistant?.stale) {
      await openAppModal({
        kind: 'warning',
        eyebrow: 'NEXO • revisão textual',
        title: 'O relato precisa ser atualizado primeiro',
        message: 'Há dados do boletim alterados após a última geração. Atualize o relato para incorporar os fatos atuais e, em seguida, faça a revisão de redação.',
        confirmText: 'Entendi'
      });
      return;
    }
    if (!meaningfulText(state.current.history?.relato)) {
      await openAppModal({
        kind: 'info',
        eyebrow: 'NEXO • revisão textual',
        title: 'Gere o relato antes da revisão',
        message: 'A revisão atua sobre o texto consolidado. Primeiro gere o relato a partir dos dados do boletim.',
        confirmText: 'Entendi'
      });
      return;
    }

    const alreadyEditingReport = state.correctionFocus?.key === 'report';
    const beforeReport = String(state.current.history.relato || '');
    const beforeProvidences = String(state.current.history.providencias || '');
    const afterReport = professionalTextReview(beforeReport);
    const afterProvidences = professionalTextReview(beforeProvidences);
    const changed = beforeReport !== afterReport || beforeProvidences !== afterProvidences;

    state.current.history.relato = afterReport;
    state.current.history.providencias = afterProvidences;
    state.current.assistant ||= { generatedAt:'', profile:assistantContext(state.current).profile, stale:false };
    state.current.assistant.reviewedAt = new Date().toISOString();
    addAudit(state.current, 'REVISÃO TEXTUAL NEXO', changed ? 'Redação revisada automaticamente: conectores, repetições, pontuação e padronização linguística. O texto permaneceu disponível para conferência e edição manual.' : 'Revisão automática concluída sem alterações. O vigilante permaneceu com a opção de revisar e editar manualmente o relato.');
    await saveCurrent(true, false);
    renderWizard();

    if (alreadyEditingReport) {
      showToast(changed ? 'Correções automáticas aplicadas. Confira e ajuste o texto, se necessário.' : 'Nenhuma correção automática. O texto continua disponível para edição manual.');
      await new Promise(resolve => requestAnimationFrame(resolve));
      const textarea = document.getElementById('history-report');
      textarea?.scrollIntoView?.({ behavior:'smooth', block:'center' });
      textarea?.focus?.({ preventScroll:true });
      return;
    }

    const editManually = await openAppModal({
      kind: changed ? 'success' : 'info',
      eyebrow: 'NEXO • revisão textual',
      title: changed ? 'Revisão automática concluída' : 'Texto conferido',
      message: changed
        ? 'O NEXO aplicou correções automáticas de redação. Você ainda pode abrir o relato para conferir e fazer ajustes manuais antes da finalização.'
        : 'Nenhuma correção automática adicional foi identificada. Isso não significa que o texto esteja bloqueado: você pode fazer qualquer ajuste de redação que considerar necessário.',
      details: '<p><strong>Importante:</strong> a edição manual altera apenas a redação. Mantenha os fatos compatíveis com as informações registradas no boletim.</p>',
      confirmText: 'Editar texto',
      cancelText: 'Voltar à revisão'
    });
    if (editManually) await openReviewCorrection(reviewItemByKey('report'), true);
  }));

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
    const evidencePurpose = state.pendingEvidencePurpose || '';
    state.current.attachments.push({id:uid(),...prepared,evidencePurpose});
    addAudit(state.current, 'ADICIONAR ANEXO', `${prepared.name} • ${humanSize(prepared.size)}${evidencePurpose?` • finalidade ${evidencePurpose}`:''}`);
    markAssistantStale(state.current);
  }
  if(state.current.attachments.length)state.current.verification.attachments='has';
  state.pendingEvidencePurpose = '';
  await saveCurrent(true);if(state.route==='detail')renderDetail();else renderWizard();
}

function fileToDataUrl(file) {
  return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file);});
}

function correctionIssues(focus, record = state.current) {
  return reviewItemByKey(focus?.key, record)?.issues || [];
}

async function openReviewCorrection(item, force = false) {
  if (!item || (item.ok && !force)) return;
  commitVisibleControls(app);
  try { await saveCurrent(true, false); }
  catch (error) { console.warn('Não foi possível salvar antes de abrir a correção.', error); }
  state.validationIssues = [];
  state.correctionFocus = {
    key: item.key,
    step: item.step,
    targetId: item.targetId || '',
    targetKey: item.targetKey || item.key
  };
  state.currentStep = item.step;
  updateHeader();
  renderWizard();
  await new Promise(resolve => requestAnimationFrame(resolve));
  const target = item.targetId ? document.getElementById(item.targetId) : document.querySelector(`[data-correction-section="${item.key}"]`);
  (target?._modalSelectButton || target)?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  (target?._modalSelectButton || target)?.focus?.({ preventScroll: true });
}

async function handleCorrectionAction(action) {
  commitVisibleControls(app);
  await saveCurrent(true, false);
  if (action === 'back') {
    state.validationIssues = [];
    state.correctionFocus = null;
    state.currentStep = 4;
    updateHeader();
    renderWizard();
    window.scrollTo(0, 0);
    return;
  }

  if (action === 'save') {
    const focus = state.correctionFocus;
    const issues = correctionIssues(focus);
    if (issues.length) {
      state.validationIssues = issues;
      renderWizard();
      await new Promise(resolve => requestAnimationFrame(resolve));
      issues.forEach(issue => { if (issue.id) markFieldError(issue.id, issue.message); });
      const first = issues[0];
      const target = first?.id ? document.getElementById(first.id) : document.querySelector(`[data-verification-key="${first?.key || focus?.key}"]`);
      (target?._modalSelectButton || target)?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      return;
    }
    state.validationIssues = [];
    if (focus?.key === 'report' && state.current.history?.relatoEditado) {
      addAudit(state.current, 'CORREÇÃO MANUAL DO RELATO', 'Relato consolidado ajustado manualmente pelo vigilante durante a revisão final.');
    }
    state.correctionFocus = null;
    state.currentStep = 4;
    await saveCurrent(true, false);
    updateHeader();
    renderWizard();
    window.scrollTo(0, 0);
    showToast('Correção salva e revisão atualizada.');
  }
}

async function handleStepAction(action) {
  commitVisibleControls(app);

  if (action === 'save') {
    await saveCurrent(true, false);
    await openAppModal({
      kind:'success',
      eyebrow:'Rascunho protegido',
      title:'Boletim salvo no aparelho',
      message:'O preenchimento foi salvo localmente. O envio ao Google Sheets será tentado somente quando o boletim for finalizado.',
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
    state.correctionFocus = null;
    await saveCurrent(true,false);
    state.currentStep = Math.max(0,state.currentStep-1);
    updateHeader();
    renderWizard();
    window.scrollTo(0,0);
    return;
  }

  if (action === 'next') {
    state.correctionFocus = null;
    if (!(await validateStep(state.currentStep))) return;
    if (state.currentStep === 3) {
      if (!state.current.history.providenciasEditadas) state.current.history.providencias = buildAssistantProvidences(state.current);
      if (!state.current.history.relatoEditado || state.current.assistant?.stale || !meaningfulText(state.current.history.relato)) {
        state.current.history.relato = buildNarrative(state.current);
        state.current.history.relatoEditado = false;
      }
      state.current.assistant = {generatedAt:new Date().toISOString(),reviewedAt:new Date().toISOString(),profile:assistantContext(state.current).profile,stale:false};
      addAudit(state.current,'GERAR RELATO PADRONIZADO','Relato profissional atualizado automaticamente antes da revisão.');
    }
    await saveCurrent(true,false);
    state.currentStep = Math.min(STEPS.length-1,state.currentStep+1);
    updateHeader();
    renderWizard();
    window.scrollTo(0,0);
    return;
  }

  if (action === 'finalize') {
    state.correctionFocus = null;
    commitVisibleControls(app);
    const beforeFinalReview = String(state.current.history?.relato || '');
    const beforeFinalProvidences = String(state.current.history?.providencias || '');
    if (beforeFinalReview) state.current.history.relato = professionalTextReview(beforeFinalReview);
    if (beforeFinalProvidences) state.current.history.providencias = professionalTextReview(beforeFinalProvidences);
    state.current.assistant ||= {generatedAt:'', reviewedAt:'', profile:assistantContext(state.current).profile, stale:false};
    state.current.assistant.reviewedAt = new Date().toISOString();
    if (beforeFinalReview !== state.current.history.relato || beforeFinalProvidences !== state.current.history.providencias) {
      addAudit(state.current,'REVISÃO TEXTUAL AUTOMÁTICA','A redação foi revisada automaticamente antes da finalização.');
    }
    await saveCurrent(true,false);
    if (!(await validateAll())) return;
    const recommendedMissing = assistantMissing(state.current, 'recommended');
    if (recommendedMissing.length) {
      addAudit(state.current,'FINALIZAÇÃO COM RECOMENDAÇÕES PENDENTES',`${recommendedMissing.length} informação(ões) recomendada(s) não estavam disponíveis ou não foram preenchidas no momento da finalização.`);
    }

    if (state.finalizationInProgress) return;
    state.finalizationInProgress = true;
    const finalizeButton = app.querySelector('[data-step-action="finalize"]');
    if (finalizeButton) {
      finalizeButton.disabled = true;
      finalizeButton.setAttribute('aria-disabled','true');
      finalizeButton.textContent = 'Finalizando…';
    }
    showBusy('Registrando BO','✓ Validando informações\n↻ Salvando o boletim no aparelho');
    let synced = false;
    try {
      state.current.status = 'Finalizado';
      state.current.finalizedAt = new Date().toISOString();
      state.current.operationalTiming ||= { startedAt:'', endedAt:'', startedBy:null, endedBy:null, autoEnded:false };
      state.current.operationalTiming.startedAt ||= state.current.createdAt || state.current.finalizedAt;
      state.current.operationalTiming.startedBy ||= state.current.operator || operatorSnapshot();
      state.current.operationalTiming.endedAt = state.current.finalizedAt;
      state.current.operationalTiming.endedBy = operatorSnapshot();
      state.current.operationalTiming.autoEnded = true;
      addAudit(state.current, 'ENCERRAR ATENDIMENTO', 'Atendimento encerrado automaticamente no momento da finalização e envio do BO.');
      state.current.currentStep = STEPS.length-1;
      state.current.syncStatus = apiConfigured() && navigator.onLine ? 'syncing' : 'pending';
      addAudit(state.current,'FINALIZAR BOLETIM','Registro finalizado pelo vigilante responsável.');
      await saveCurrent(true,false);

      if (apiConfigured() && navigator.onLine) {
        updateBusy('Registrando BO','✓ BO salvo com segurança no aparelho\n↻ Enviando para o Google Sheets\n↻ Confirmando número oficial');
        synced = await syncRecord(state.current,false);
        if (synced) updateBusy('Registro confirmado',`✓ BO salvo no aparelho\n✓ Sincronização confirmada\n✓ Número oficial: ${state.current.numero}`);
      } else {
        updateBusy('Registro protegido','✓ BO salvo com segurança no aparelho\n! Envio pendente — será tentado automaticamente');
      }
      await refreshRecords();
      const updated = state.records.find(item => item.id === state.current.id);
      if (updated) state.current = structuredClone(updated);
      await navigate('detail');
    } finally {
      state.finalizationInProgress = false;
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
  if (state.correctionFocus && step !== state.correctionFocus.step) state.correctionFocus = null;
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
  const add = (id,message,title='Preenchimento incompleto',key='') => issues.push({step,id,message,title,key});

  if (step === 0) {
    const b = record.basic || {};
    const presence = requesterPresence(record);
    if (presence !== 'Sim' && presence !== 'Não') add('bo-requester-presence','Confirme primeiro se existe solicitante.');
    if (presence === 'Sim') {
      if (b.matriculaEmissor && !/^\d+$/.test(b.matriculaEmissor||'')) add('bo-reg','A matrícula do solicitante deve conter somente números.');
      if (!String(b.nomeEmissor||'').trim()) add('bo-name','Informe o nome completo do solicitante.');
      if (b.emailEmissor && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.emailEmissor)) add('bo-email','Informe um e-mail válido.');
    } else if (presence === 'Não' && recordWithoutRequester(record)) {
      if (!String(record.operator?.usuario||'').trim()) add('','O BO sem solicitante deve ficar vinculado ao nome do vigilante logado.','Vigilante responsável não identificado','operator');
      if (!String(record.operator?.registro||'').trim()) add('','O BO sem solicitante deve ficar vinculado ao registro do vigilante logado.','Registro do vigilante ausente','operator');
    }
    if (!b.categoria) add('bo-category','Selecione a natureza da ocorrência.');
    if (!b.referencia) add('bo-ref','Selecione o tipo de boletim.');
    if (isOtherReference(b.referencia) && !String(b.referenciaOutra||'').trim()) add('bo-ref-other','Descreva a ocorrência não listada.');
    if (presence === 'Não' && !String(b.origemOcorrencia||'').trim()) add('bo-origin','Informe como o fato foi identificado pela Segurança.');
    if (!b.data) add('bo-date','Informe a data do fato.');
    if (!b.hora) add('bo-time','Informe a hora do fato.');
    if (b.data && b.hora && dateTimeInFuture(b.data,b.hora)) add('bo-time','A data e a hora do fato não podem estar no futuro.');
    if (!b.local) add('bo-local','Selecione o tipo de local.');
    if (!String(b.complementoLocal||'').trim()) add('bo-local-detail','Identifique o local com detalhes.');
    if (!b.diretoria) add('bo-directorate','Selecione a diretoria relacionada ou use “Não se aplica/Não identificada”.');
    if (b.diretoria === 'Outra' && !String(b.diretoriaOutra||'').trim()) add('bo-directorate-other','Informe o nome da diretoria.');
    issues.push(...routingRequiredIssues(record).map(issue=>({...issue,step:0,key:issue.key||'routing'})));
  }

  if (step === 1) {
    const modes = effectiveEntityModes(record);
    const people = record.people || [];
    if (modes.people === 'required' && !(requesterCountsAsInvolved(record) || people.some(p=>p.tipo!=='Testemunha'))) add('','Cadastre ao menos uma pessoa diretamente envolvida.','Informação essencial ausente','people');
    if (modes.witnesses === 'required' && !people.some(p=>p.tipo==='Testemunha')) add('','Cadastre a testemunha exigida pelo roteiro.','Informação essencial ausente','witnesses');
    if (modes.vehicles === 'required' && !(record.vehicles||[]).length) add('','Cadastre o veículo relacionado ao fato.','Informação essencial ausente','vehicles');
    const damagePolicy=vehicleDamagePolicy(record);
    if (damagePolicy.enabled) (record.vehicles||[]).forEach(vehicle=>{
      if (!String(vehicle.danoStatus||'').trim()) add('','Confirme se houve dano aparente em cada veículo cadastrado.','Condição do veículo não conferida','vehicles');
      if (vehicle.danoStatus==='Sim' && (!String(vehicle.regiaoDano||'').trim() || !String(vehicle.tipoDano||'').trim() || !String(vehicle.descricaoDano||'').trim())) add('','Complete região, tipo e descrição objetiva do dano do veículo.','Descrição de dano incompleta','vehicles');
    });
    if (modes.materials === 'required' && !(record.materials||[]).length) add('','Cadastre o material, peça, equipamento ou carga relacionado.','Informação essencial ausente','materials');

    const policy = materialFieldPolicy(record);
    (record.materials||[]).forEach((material,index)=>{
      if (!String(material.tipoItem||'').trim()) add('','Selecione se o item é peça, equipamento, máquina ou outro.','Tipo do item não informado','materials');
      if (material.tipoItem === 'Outro' && !String(material.tipoItemOutro||'').trim()) add('','Informe qual é o outro tipo de item.','Tipo do item incompleto','materials');
      if (!String(material.denominacao||'').trim()) add('','Informe a denominação/descrição do item.','Item incompleto','materials');
      if (policy.quantityCheck) {
        if (!String(material.quantidadeStatus||'').trim()) add('','Confirme se a quantidade do item pôde ser determinada.','Quantidade não verificada','materials');
        if (material.quantidadeStatus === 'Determinada' && !String(material.quantidade||'').trim()) add('','Quando a quantidade é determinada, informe a quantidade constatada.','Quantidade incompleta','materials');
        if (policy.expectedQuantityCheck && !String(material.quantidadePrevista||'').trim()) add('','Informe a quantidade prevista/documentada para permitir a comparação com a quantidade constatada.','Quantidade prevista ausente','materials');
        if (material.quantidadeStatus === 'Não foi possível determinar' && !String(material.quantidadeIndisponivelMotivo||'').trim()) add('','Justifique por que a quantidade não pôde ser determinada.','Quantidade não determinada','materials');
      }
    });

    if (documentMode(record) === 'required') {
      const docs=record.documents||[];
      const requiredTypes=requiredDocumentTypesFor(record);
      const missingTypes=requiredTypes.filter(type=>!docs.some(document=>normalizeAssistantText(document.tipo)===normalizeAssistantText(type)));
      const justified=String(record.templateData?.documentUnavailableReason||'').trim();
      if ((!docs.length || missingTypes.length) && !justified) add('document-unavailable-reason',missingTypes.length?`Cadastre ${missingTypes.join(', ')} ou justifique por que não foi possível obtê-lo.`:'Cadastre o documento aplicável ou justifique por que não foi possível obtê-lo.','Documento essencial ausente','documents');
    }
  }

  if (step === 2) {
    const h = record.history || {};
    if (requesterRequired(record) && !String(h.inicio||'').trim()) add('history-start','Registre o que foi informado à equipe.');
    if (!String(h.identificado||'').trim()) add('history-found',isRoundOrigin(record)?'Registre o que o vigilante constatou durante a ronda.':'Registre o que a Segurança constatou no local.');
    issues.push(...templateRequiredIssues(record));
  }

  if (step === 3) {
    const h = record.history || {};
    if (record.verification.providencias === 'pending') add('history-actions','Confirme se houve providência.','Providências não verificadas','providencias');
    if (record.verification.providencias === 'has' && !String(h.providenciasFonte||h.providencias||'').trim()) add('history-actions','Descreva as providências adotadas.','Providência sem descrição','providencias');
    if (!String(h.desfecho||'').trim()) add('history-end','Informe como a situação terminou.');

    const requirements = evidenceRequirementStatus(record);
    const missingRequired = requirements.filter(item=>item.required && !item.satisfied);
    if (missingRequired.length && !String(record.templateData?.evidenceUnavailableReason||'').trim()) {
      missingRequired.forEach(item=>add('',`Registre ${item.label.toLocaleLowerCase('pt-BR')} ou justifique a indisponibilidade.`,`Evidência essencial pendente`,'attachments'));
    }
    const template = effectiveTemplate(record);
    if (template.evidence === 'required' && !requirements.some(item=>item.required) && !(record.attachments||[]).length && !String(record.templateData?.evidenceUnavailableReason||'').trim()) add('evidence-unavailable-reason','Inclua uma evidência pertinente ou justifique por que não foi possível registrá-la.','Evidência essencial indisponível','attachments');
  }

  if (step === 4) {
    if (!String(record.history?.relato||'').trim()) add('history-report','Gere ou revise o relato consolidado.','Relato pendente','report');
    if (record.assistant?.stale && String(record.history?.relato||'').trim()) add('history-report','Os dados foram alterados depois da geração. Atualize o relato.','Relato desatualizado','report');
    if (!record.acknowledgements.reviewed) add('ack-reviewed','Marque que revisou todas as informações.','Confirmações obrigatórias','acknowledgements');
    if (!record.acknowledgements.truthful) add('ack-truthful','Marque que as informações correspondem aos fatos disponíveis.','Confirmações obrigatórias','acknowledgements');
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
  for (let step = 0; step < STEPS.length; step += 1) {
    const issues = collectStepIssues(step);
    if (issues.length) {
      await showValidation(issues, step);
      return false;
    }
  }
  return true;
}

function openEntityDialog(type, index = null, defaults = {}) {
  state.dialog = { type, index };
  const editing = index !== null;
  const data = editing ? structuredClone(state.current[type][index]) : structuredClone(defaults || {});
  const configs = {
    people: ['Pessoa', personForm],
    vehicles: ['Veículo', vehicleForm],
    materials: ['Item', materialForm],
    documents: ['Documento', documentForm],
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

function personReusePanel() {
  if (state.dialog?.index !== null) return '';
  const sources = [];
  if (requesterRequired(state.current) && meaningfulText(state.current.basic?.nomeEmissor)) {
    sources.push({value:'requester',label:`Solicitante — ${state.current.basic.nomeEmissor}`});
  }
  (state.current.people || []).forEach(person => sources.push({value:`person:${person.id}`,label:`Pessoa já cadastrada — ${person.nome || 'Sem nome'}`}));
  if (!sources.length) return '';
  return `<div class="entity-reuse-panel"><div><strong>Preencher mais rápido</strong><span>Reutilize somente dados já conferidos neste BO.</span></div><div class="entity-reuse-controls"><select id="person-reuse-source"><option value="">Selecione dados anteriores</option>${sources.map(source=>`<option value="${escapeHtml(source.value)}">${escapeHtml(source.label)}</option>`).join('')}</select><button type="button" class="button secondary small" data-reuse-person>Reutilizar dados</button></div></div>`;
}

function personForm(p) {
  const vinculo=p.vinculo||'Stellantis';
  return `${personReusePanel()}<div class="entity-context-note"><strong>Identificação possível</strong><span>Registre somente os dados que puder confirmar. Matrícula, documento e empresa não devem ser inventados para concluir o cadastro.</span></div><div class="form-grid">
    <div class="field"><label class="required" for="person-type">Tipo de pessoa</label><select id="person-type" name="tipo" required>${selectOptions(['Envolvido','Testemunha','Condutor','Responsável','Comunicante adicional'],p.tipo||'Envolvido')}</select></div>
    <div class="field"><label class="required" for="person-link">Vínculo</label><select id="person-link" name="vinculo" required>${selectOptions(['Stellantis','Terceirizada','Sem vínculo','Não identificado'],vinculo)}</select></div>
    <div class="field full"><label class="required" for="person-name">Nome completo</label><input id="person-name" name="nome" value="${escapeHtml(p.nome||'')}" autocomplete="name" required><button type="button" class="field-helper-button" data-person-unidentified>Não foi possível identificar a pessoa</button><small>Use a opção acima somente quando a identificação realmente não puder ser obtida.</small></div>
    <div class="field company-field"><label for="person-company">Empresa</label><input id="person-company" name="empresa" value="${escapeHtml(p.empresa||'')}" placeholder="Quando conhecida"></div>
    <div class="field registration-field"><label for="person-reg">Matrícula</label><input id="person-reg" name="matricula" inputmode="numeric" value="${escapeHtml(p.matricula||'')}" placeholder="Quando disponível"></div>
    <div class="field corporate-field"><label for="person-sector">Setor / área</label><input id="person-sector" name="setor" value="${escapeHtml(p.setor||'')}" placeholder="Quando conhecido"></div>
    <div class="field"><label for="person-phone">Telefone para contato</label><input id="person-phone" name="telefone" value="${escapeHtml(p.telefone||'')}" inputmode="tel" placeholder="(31) 99999-9999"></div>
    <div class="field external-field"><label for="person-doc-type">Tipo de documento</label><select id="person-doc-type" name="tipoDocumento">${selectOptions(['Carteira de identidade','Carteira Nacional de Habilitação (CNH)','Passaporte','Outro'],p.tipoDocumento||'')}</select></div>
    <div class="field external-field"><label for="person-doc-number">Número do documento</label><input id="person-doc-number" name="numeroDocumento" value="${escapeHtml(p.numeroDocumento||'')}" placeholder="Quando disponível"></div>
    <div class="field full external-field"><label for="person-details">Dados complementares</label><textarea id="person-details" name="dadosComplementares" placeholder="Características, cargo ou outra informação útil quando a identificação estiver incompleta.">${escapeHtml(p.dadosComplementares||'')}</textarea></div>
    <div class="field full"><label for="person-notes">Observações</label><textarea id="person-notes" name="observacao" placeholder="Registre recusas, impossibilidade de identificação ou informação relevante.">${escapeHtml(p.observacao||'')}</textarea></div>
  </div>`;
}

function vehicleDamagePolicy(record = state.current) {
  const reference = normalizeReference(record?.basic?.referencia || '');
  if (reference === 'Avaria constatada em veículo') return {enabled:true,required:true,label:'Avaria constatada'};
  if (reference === 'Veículo apresentado com dano preexistente') return {enabled:true,required:true,label:'Dano preexistente'};
  if (reference === 'Acidente ou colisão envolvendo veículo') return {enabled:true,required:false,label:'Dano relacionado ao acidente'};
  return {enabled:false,required:false,label:''};
}

function previousLinkedPersonQuickAction(collection = '') {
  if (state.dialog?.index !== null) return '';
  const items = state.current?.[collection] || [];
  const previous = [...items].reverse().find(item => item.pessoaId && personNameById(item.pessoaId));
  if (!previous) return '';
  const name = personNameById(previous.pessoaId);
  return `<button type="button" class="field-helper-button quick-link-button" data-reuse-linked-person="${escapeHtml(previous.pessoaId)}">Usar o mesmo vínculo anterior: ${escapeHtml(name)}</button>`;
}

function vehicleForm(v) {
  const damage = vehicleDamagePolicy(state.current);
  const damageStatus = v.danoStatus || (damage.required ? 'Sim' : '');
  const damageFields = damage.enabled ? `<div class="field full vehicle-damage-heading"><div class="entity-context-note"><strong>${escapeHtml(damage.label)}</strong><span>Descreva o dano por veículo. Prefira localização e tipo objetivo do dano em vez do termo genérico “danificado”.</span></div></div>
    <div class="field"><label class="required" for="vehicle-damage-status">Houve dano/avaria aparente neste veículo?</label><select id="vehicle-damage-status" name="danoStatus" required>${selectOptions(damage.required?['Sim']:['Sim','Não','Não foi possível confirmar'],damageStatus)}</select></div>
    <div class="field vehicle-damage-detail"><label for="vehicle-damage-region">Região atingida</label><select id="vehicle-damage-region" name="regiaoDano">${selectOptions(['Dianteira','Traseira','Lateral direita','Lateral esquerda','Parte superior','Parte inferior','Múltiplas regiões','Não se aplica'],v.regiaoDano||'')}</select></div>
    <div class="field vehicle-damage-detail"><label for="vehicle-damage-type">Tipo predominante do dano</label><select id="vehicle-damage-type" name="tipoDano">${selectOptions(['Amassado','Arranhado','Empenado','Quebrado','Descascado','Riscado','Furado','Estourado','Trincado','Deformado','Solto','Múltiplos tipos','Outro'],v.tipoDano||'')}</select></div>
    <div class="field full vehicle-damage-detail"><label for="vehicle-damage-description">Descrição objetiva do dano</label><textarea id="vehicle-damage-description" name="descricaoDano" placeholder="Ex.: paralama traseiro esquerdo amassado e arranhado.">${escapeHtml(v.descricaoDano||'')}</textarea></div>` : '';
  return `<div class="entity-context-note"><strong>Identificação do veículo</strong><span>Informe placa ou chassi quando puder confirmar. Se a identificação não estiver visível ou não puder ser obtida, registre essa impossibilidade sem criar dados.</span></div><div class="form-grid">
    <div class="field full"><label class="required" for="vehicle-id">Placa ou chassi</label><input id="vehicle-id" name="placa" value="${escapeHtml(v.placa||'')}" required placeholder="Ex.: ABC1D23 ou chassi com 17 caracteres" autocapitalize="characters"><button type="button" class="field-helper-button" data-vehicle-unidentified>Não foi possível identificar placa/chassi</button><small>Nessa condição, complemente marca, modelo, características ou circunstâncias nas observações.</small></div>
    <div class="field"><label for="vehicle-brand">Marca</label><input id="vehicle-brand" name="marca" value="${escapeHtml(v.marca||'')}"></div>
    <div class="field"><label for="vehicle-model">Modelo</label><input id="vehicle-model" name="modelo" value="${escapeHtml(v.modelo||'')}"></div>
    <div class="field"><label for="vehicle-company">Empresa do veículo</label><input id="vehicle-company" name="empresa" value="${escapeHtml(v.empresa||'')}"></div>
    <div class="field"><label for="vehicle-person">Pessoa relacionada</label><select id="vehicle-person" name="pessoaId"><option value="">Ligado diretamente ao BO</option>${state.current.people.map(person=>`<option value="${escapeHtml(person.id)}" ${v.pessoaId===person.id?'selected':''}>${escapeHtml(person.nome)}</option>`).join('')}</select>${previousLinkedPersonQuickAction('vehicles')}</div>
    ${damageFields}
    <div class="field full"><label for="vehicle-notes">Observações</label><textarea id="vehicle-notes" name="observacao" placeholder="Características observadas, posição, motivo da impossibilidade de identificação ou outra informação relevante.">${escapeHtml(v.observacao||'')}</textarea></div>
  </div>`;
}

function materialForm(m) {
  const policy = materialFieldPolicy(state.current, m);
  const quantityStatus = m.quantidadeStatus || (m.quantidade ? 'Determinada' : '');
  const quantityRequired = policy.quantityRequired && quantityStatus !== 'Não foi possível determinar';
  const itemType = inferMaterialItemType(m);
  const showSupplier = policy.showSupplier;
  const showContainer = policy.showContainer;
  return `<div class="entity-context-note"><strong>Cadastro adaptado ao tipo de BO</strong><span>${escapeHtml(policy.guidance)}</span></div><div class="form-grid">
    <div class="field full"><label class="required" for="material-type">Tipo do item</label><select id="material-type" name="tipoItem" required>${selectOptions(['Peça','Equipamento','Máquina','Outro'],itemType)}</select><small>Escolha primeiro a natureza do item. O formulário mostrará somente as identificações que fazem sentido para essa escolha.</small></div>
    <div class="field full material-other-type-field"><label class="required" for="material-type-other">Qual é o outro tipo de item?</label><input id="material-type-other" name="tipoItemOutro" value="${escapeHtml(m.tipoItemOutro||'')}" placeholder="Ex.: vasilhame, ferramenta, componente, carga, objeto pessoal"><small>Use um nome simples que permita entender que tipo de item foi encontrado ou relacionado ao BO.</small></div>
    <div class="field full"><label class="required" for="material-name">Descrição / denominação</label><input id="material-name" name="denominacao" value="${escapeHtml(m.denominacao||'')}" required placeholder="Ex.: volante automotivo preto, motor elétrico, prensa hidráulica"><small>Descreva o item de forma objetiva. Se não souber o nome técnico, use características visíveis.</small><button type="button" class="field-helper-button" data-material-unidentified>Item sem identificação técnica</button></div>
    ${policy.quantityCheck?`<div class="field"><label class="required" for="material-quantity-status">A quantidade pôde ser determinada?</label><select id="material-quantity-status" name="quantidadeStatus" required>${selectOptions(['Determinada','Não foi possível determinar'],quantityStatus)}</select><small>Informe se foi possível contar ou confirmar a quantidade com segurança.</small></div>`:''}
    ${policy.expectedQuantityCheck?`<div class="field expected-quantity-field"><label class="required" for="material-expected-quantity">Quantidade prevista/documentada</label><input id="material-expected-quantity" type="number" min="0" step="0.01" name="quantidadePrevista" value="${escapeHtml(m.quantidadePrevista||'')}" required placeholder="Ex.: 120"><small>Use a quantidade indicada no documento ou sistema de referência.</small></div>`:''}
    <div class="field quantity-value-field"><label class="${quantityRequired?'required':''}" for="material-quantity">${policy.expectedQuantityCheck?'Quantidade constatada':'Quantidade'}</label><input id="material-quantity" type="number" min="0.01" step="0.01" name="quantidade" value="${escapeHtml(m.quantidade||'')}" ${quantityRequired?'required':''} placeholder="Ex.: 4"><small>Informe somente a quantidade realmente contada ou constatada.</small></div>
    ${policy.quantityCheck?`<div class="field full quantity-reason-field"><label for="material-quantity-reason">Motivo da quantidade não determinada</label><textarea id="material-quantity-reason" name="quantidadeIndisponivelMotivo" placeholder="Ex.: peças espalhadas em área de risco, impossibilitando contagem segura.">${escapeHtml(m.quantidadeIndisponivelMotivo||'')}</textarea></div>`:''}

    <div class="field full material-identification-heading"><div class="entity-context-note compact"><strong>Identificação técnica — opcional</strong><span>Preencha somente se o número estiver visível, em etiqueta, plaqueta, gravação ou documento confiável.</span></div></div>
    <div class="field material-piece-field"><label for="material-drawing">Número de desenho / código da peça</label><input id="material-drawing" name="desenho" value="${escapeHtml(m.desenho||'')}" placeholder="Ex.: 735682194"><small>Opcional. Use para peça quando houver número de desenho, part number ou código equivalente.</small></div>
    <div class="field material-serial-field"><label for="material-serial">Número de série</label><input id="material-serial" name="numeroSerie" value="${escapeHtml(m.numeroSerie||'')}" placeholder="Ex.: SN-458721"><small>Opcional. Use para equipamento ou máquina quando houver plaqueta/número de série.</small></div>
    <div class="field material-code-field"><label for="material-code">Código / identificação</label><input id="material-code" name="codigoIdentificacao" value="${escapeHtml(m.codigoIdentificacao||'')}" placeholder="Ex.: PAT-2048 ou EQ-17"><small>Opcional. Use para máquina ou outro item quando houver patrimônio, código interno ou identificação própria.</small></div>
    ${showSupplier?`<div class="field"><label for="material-supplier">Fornecedor</label><input id="material-supplier" name="fornecedor" value="${escapeHtml(m.fornecedor||'')}" placeholder="Quando conhecido"><small>Informe somente quando o fornecedor estiver identificado no item ou na documentação.</small></div>`:''}
    ${showContainer?`<div class="field"><label for="material-container">Código do vasilhame/container</label><input id="material-container" name="codigoVasilhame" value="${escapeHtml(m.codigoVasilhame||'')}" placeholder="Quando aplicável"><small>Use somente para vasilhame/container identificado.</small></div>`:''}
    <div class="field full"><label for="material-person">Pessoa relacionada</label><select id="material-person" name="pessoaId"><option value="">Ligado diretamente ao BO</option>${state.current.people.map(person=>`<option value="${escapeHtml(person.id)}" ${m.pessoaId===person.id?'selected':''}>${escapeHtml(person.nome)}</option>`).join('')}</select>${previousLinkedPersonQuickAction('materials')}</div>
    <div class="field full"><label for="material-notes">Condição / observações</label><textarea id="material-notes" name="observacao" placeholder="Ex.: encontrado sobre a calçada, sem embalagem, com marcas de sujeira.">${escapeHtml(m.observacao||'')}</textarea><small>Registre condição, características e contexto que ajudem a reconhecer o item ou entender como ele foi encontrado.</small></div>
  </div>`;
}

function documentForm(d) {
  const types = documentTypesFor(state.current);
  return `<div class="entity-context-note"><strong>Documento relacionado ao fato</strong><span>Cadastre apenas documentos que realmente existam. MVM é específico das movimentações em que esse documento é utilizado.</span></div><div class="form-grid"><div class="field"><label class="required" for="document-type">Tipo de documento</label><select id="document-type" name="tipo" required>${selectOptions(types,d.tipo||'')}</select></div><div class="field"><label class="required" for="document-number">Número / identificação</label><input id="document-number" name="numero" value="${escapeHtml(d.numero||'')}" required placeholder="Informe o número, código ou referência"></div><div class="field full"><label for="document-notes">Observações</label><textarea id="document-notes" name="observacao" placeholder="Ex.: documento apresentado pelo motorista, emitido para regularização, rasurado, segunda via...">${escapeHtml(d.observacao||'')}</textarea></div></div>`;
}

function amendmentForm(a) {
  const operator=state.operator||loadOperatorSession()||{};
  return `<div class="form-grid"><div class="field"><label class="required" for="amendment-type">Tipo de registro</label><select id="amendment-type" name="tipo" required>${selectOptions(['Complemento','Retificação'],a.tipo||'Complemento')}</select></div><div class="field"><label class="required" for="amendment-author">Responsável</label><input id="amendment-author" name="responsavel" value="${escapeHtml(a.responsavel||[operator.usuario,operator.registro].filter(Boolean).join(' / '))}" required></div><div class="field full"><label class="required" for="amendment-text">Descrição</label><textarea id="amendment-text" name="texto" placeholder="Descreva claramente a informação acrescentada ou corrigida, sem apagar o registro original." required>${escapeHtml(a.texto||'')}</textarea></div></div>`;
}

function bindDialogDynamic(type) {
  if(type==='people'){
    const select=dialogBody.querySelector('#person-link');
    const name=dialogBody.querySelector('#person-name');
    dialogBody.querySelector('[data-reuse-person]')?.addEventListener('click',()=>{
      const source = dialogBody.querySelector('#person-reuse-source')?.value || '';
      if (!source) { showToast('Selecione os dados que deseja reutilizar.'); return; }
      let data = null;
      if (source === 'requester') data = {nome:state.current.basic?.nomeEmissor||'',matricula:state.current.basic?.matriculaEmissor||''};
      else if (source.startsWith('person:')) data = (state.current.people||[]).find(person=>person.id===source.slice(7));
      if (!data) return;
      const currentType = dialogBody.querySelector('#person-type')?.value || 'Envolvido';
      const mapping = {nome:'person-name',vinculo:'person-link',empresa:'person-company',matricula:'person-reg',setor:'person-sector',telefone:'person-phone',tipoDocumento:'person-doc-type',numeroDocumento:'person-doc-number',dadosComplementares:'person-details'};
      Object.entries(mapping).forEach(([key,id])=>{ const control=dialogBody.querySelector(`#${id}`); if(control && data[key]!==undefined && data[key]!==null) control.value=data[key]; });
      const typeControl=dialogBody.querySelector('#person-type'); if(typeControl) typeControl.value=currentType;
      dialogBody.querySelectorAll('input,select,textarea').forEach(control=>control.dispatchEvent(new Event('change',{bubbles:true})));
      refreshRequiredFieldStates(dialogBody); showToast('Dados anteriores reutilizados. Confira antes de salvar.');
    });
    const update=()=>{
      const value=select.value;
      const external=value==='Sem vínculo',third=value==='Terceirizada',unidentified=value==='Não identificado' || name?.value==='Pessoa não identificada';
      dialogBody.querySelectorAll('.external-field').forEach(el=>el.classList.toggle('hidden',!external));
      dialogBody.querySelectorAll('.corporate-field').forEach(el=>el.classList.toggle('hidden',external||unidentified));
      dialogBody.querySelectorAll('.company-field').forEach(el=>el.classList.toggle('hidden',!third));
      // Dados complementares nunca bloqueiam o BO: podem não estar disponíveis no atendimento.
      ['#person-company','#person-reg','#person-doc-type','#person-doc-number'].forEach(sel=>{const el=dialogBody.querySelector(sel);if(el)el.required=false;});
      refreshRequiredFieldStates(dialogBody);
    };
    select.addEventListener('change',update);name?.addEventListener('input',update);update();
    dialogBody.querySelector('[data-person-unidentified]')?.addEventListener('click',()=>{
      name.value='Pessoa não identificada';select.value='Não identificado';
      const notes=dialogBody.querySelector('#person-notes');if(notes&&!notes.value)notes.placeholder='Informe, quando possível, por que a identificação não foi obtida e características úteis.';
      update();refreshRequiredFieldStates(dialogBody);name.focus();showToast('Pessoa registrada como não identificada.');
    });
    const phone=dialogBody.querySelector('#person-phone');phone?.addEventListener('input',()=>{let n=phone.value.replace(/\D/g,'').slice(0,11);phone.value=n.length>10?`(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`:n.length>6?`(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`:n;});
    const reg=dialogBody.querySelector('#person-reg');reg?.addEventListener('input',()=>reg.value=reg.value.replace(/\D/g,''));
  }
  dialogBody.querySelector('[data-reuse-linked-person]')?.addEventListener('click',event=>{
    const personId = event.currentTarget.dataset.reuseLinkedPerson || '';
    const select = dialogBody.querySelector(type==='vehicles'?'#vehicle-person':'#material-person');
    if (!select || !personId) return;
    select.value = personId;
    select.dispatchEvent(new Event('change',{bubbles:true}));
    syncModalSelectButton(select);
    showToast('Vínculo anterior reutilizado.');
  });
  if(type==='vehicles'){
    const input=dialogBody.querySelector('#vehicle-id');
    input?.addEventListener('input',()=>{if(normalizeAssistantText(input.value)==='nao identificado')return;input.value=input.value.toUpperCase().replace(/[^A-Z0-9-]/g,'');});
    dialogBody.querySelector('[data-vehicle-unidentified]')?.addEventListener('click',()=>{
      input.value='NÃO IDENTIFICADO';
      const notes=dialogBody.querySelector('#vehicle-notes');if(notes&&!notes.value)notes.placeholder='Descreva características observáveis e o motivo da impossibilidade de leitura da placa/chassi.';
      refreshRequiredFieldStates(dialogBody);showToast('Veículo marcado como não identificado.');
    });
    const damageStatus=dialogBody.querySelector('#vehicle-damage-status');
    const damageRegion=dialogBody.querySelector('#vehicle-damage-region');
    const damageType=dialogBody.querySelector('#vehicle-damage-type');
    const damageDescription=dialogBody.querySelector('#vehicle-damage-description');
    const updateDamage=()=>{
      const hasDamage=damageStatus?.value==='Sim';
      dialogBody.querySelectorAll('.vehicle-damage-detail').forEach(el=>el.classList.toggle('hidden',!hasDamage));
      [damageRegion,damageType,damageDescription].forEach(el=>{if(el)el.required=Boolean(hasDamage);});
      refreshRequiredFieldStates(dialogBody);
    };
    damageStatus?.addEventListener('change',updateDamage);updateDamage();
  }
  if(type==='materials'){
    const policy=materialFieldPolicy(state.current,state.dialog?.index!==null&&state.dialog?.index!==undefined?state.current.materials[state.dialog.index]||{}:{});
    const qty=dialogBody.querySelector('#material-quantity'),status=dialogBody.querySelector('#material-quantity-status'),reason=dialogBody.querySelector('#material-quantity-reason'),itemType=dialogBody.querySelector('#material-type'),otherType=dialogBody.querySelector('#material-type-other');
    const update=()=>{
      const unavailable=status?.value==='Não foi possível determinar';
      dialogBody.querySelectorAll('.quantity-value-field').forEach(el=>el.classList.toggle('hidden',unavailable));
      dialogBody.querySelector('.quantity-reason-field')?.classList.toggle('hidden',!unavailable);
      if(qty)qty.required=!unavailable && (policy.quantityRequired || policy.quantityCheck);
      if(reason)reason.required=Boolean(unavailable);
      const selected=itemType?.value||'';
      dialogBody.querySelector('.material-other-type-field')?.classList.toggle('hidden',selected!=='Outro');
      if(otherType)otherType.required=selected==='Outro';
      dialogBody.querySelectorAll('.material-piece-field').forEach(el=>el.classList.toggle('hidden',selected!=='Peça'));
      dialogBody.querySelectorAll('.material-serial-field').forEach(el=>el.classList.toggle('hidden',!['Equipamento','Máquina','Outro'].includes(selected)));
      dialogBody.querySelectorAll('.material-code-field').forEach(el=>el.classList.toggle('hidden',!['Máquina','Outro'].includes(selected)));
      refreshRequiredFieldStates(dialogBody);
    };
    qty?.addEventListener('input',update);status?.addEventListener('change',update);itemType?.addEventListener('change',update);update();
    dialogBody.querySelector('[data-material-unidentified]')?.addEventListener('click',()=>{
      const name=dialogBody.querySelector('#material-name');name.value='Item sem identificação técnica';
      update();showToast('Descrição registrada como item sem identificação técnica. Complete as características observáveis quando possível.');
    });
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
    const rawPlate=String(formData.placa||'').trim().toUpperCase();
    const unidentified=normalizeAssistantText(rawPlate)==='nao identificado';
    formData.placa=unidentified?'NÃO IDENTIFICADO':rawPlate.replace(/[^A-Z0-9-]/g,'');
    const compact=formData.placa.replace(/-/g,'');
    const plate=/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(compact),chassis=/^[A-HJ-NPR-Z0-9]{17}$/.test(compact);
    if(!unidentified&&!plate&&!chassis&&compact.length<7){await openAppModal({kind:'warning',eyebrow:'Identificação do veículo',title:'Placa ou chassi incompleto',message:'Informe uma placa válida, um chassi com 17 caracteres ou use “Não foi possível identificar”.',confirmText:'Corrigir'});return;}
    if(unidentified&&!String(formData.observacao||formData.marca||formData.modelo||'').trim()){await openAppModal({kind:'warning',eyebrow:'Veículo não identificado',title:'Inclua uma característica observável',message:'Informe marca, modelo ou uma observação que permita descrever o veículo sem placa/chassi.',confirmText:'Completar cadastro'});return;}
    if(vehicleDamagePolicy(state.current).enabled && formData.danoStatus==='Sim' && (!String(formData.regiaoDano||'').trim() || !String(formData.tipoDano||'').trim() || !String(formData.descricaoDano||'').trim())){await openAppModal({kind:'warning',eyebrow:'Descrição do dano',title:'Complete a descrição da avaria',message:'Informe região atingida, tipo predominante e descrição objetiva do dano.',confirmText:'Completar cadastro'});return;}
    formData.pessoaNome=personNameById(formData.pessoaId);
  }
  if(type==='materials'){
    const unavailable=formData.quantidadeStatus==='Não foi possível determinar';
    if(!String(formData.tipoItem||'').trim()){await openAppModal({kind:'warning',eyebrow:'Tipo do item',title:'Selecione o tipo do item',message:'Informe se é peça, equipamento, máquina ou outro.',confirmText:'Completar cadastro'});return;}
    if(formData.tipoItem==='Outro'&&!String(formData.tipoItemOutro||'').trim()){await openAppModal({kind:'warning',eyebrow:'Outro tipo de item',title:'Informe qual é o item',message:'Ex.: vasilhame, ferramenta, componente, carga ou objeto pessoal.',confirmText:'Completar cadastro'});return;}
    if(unavailable){formData.quantidade='';if(!String(formData.quantidadeIndisponivelMotivo||'').trim()){await openAppModal({kind:'warning',eyebrow:'Quantidade não determinada',title:'Informe o motivo',message:'Explique por que não foi possível determinar a quantidade com segurança.',confirmText:'Completar cadastro'});return;}}
    const hasQuantity=String(formData.quantidade||'').trim()!=='';
    if(hasQuantity&&Number(formData.quantidade)<=0){await openAppModal({kind:'warning',eyebrow:'Quantidade inválida',title:'Informe uma quantidade maior que zero',message:'Quando a quantidade for informada, ela precisa ser maior que zero.',confirmText:'Corrigir'});return;}
    formData.unidade='';
    if(formData.tipoItem!=='Peça') formData.desenho='';
    if(!['Equipamento','Máquina','Outro'].includes(formData.tipoItem)) formData.numeroSerie='';
    if(!['Máquina','Outro'].includes(formData.tipoItem)) formData.codigoIdentificacao='';
    formData.pessoaNome=personNameById(formData.pessoaId);
  }
  if(type==='documents'){
    formData.numero=String(formData.numero||'').trim();
    const others=(state.current.documents||[]).filter((_,i)=>i!==index);
    if(others.some(d=>normalizeAssistantText(d.tipo)===normalizeAssistantText(formData.tipo)&&normalizeAssistantText(d.numero)===normalizeAssistantText(formData.numero))){await openAppModal({kind:'warning',eyebrow:'Possível duplicidade',title:'Documento já cadastrado',message:'Já existe um documento com o mesmo tipo e identificação neste boletim.',confirmText:'Revisar cadastro'});return;}
    state.current.templateData.documentUnavailableReason='';
  }
  formData.id=index===null?uid():state.current[type][index].id;
  if(index===null)state.current[type].push(formData);else state.current[type][index]=formData;
  markAssistantStale(state.current);
  if(type==='people') {
    if(formData.tipo==='Testemunha') state.current.verification.witnesses='has';
    else state.current.verification.people='has';
  } else {
    const verify={vehicles:'vehicles',materials:'materials'}[type];
    if (verify) state.current.verification[verify]='has';
  }
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
  const haystack=[record.numero,record.numeroTemporario,record.basic?.referencia,record.basic?.referenciaOutra,record.basic?.origemOcorrencia,record.basic?.diretoria,record.basic?.diretoriaOutra,record.basic?.nomeEmissor,record.basic?.local,record.basic?.complementoLocal,selectedSubmodel(record)?.label,...(record.people||[]).map(p=>`${p.nome} ${p.matricula} ${p.numeroDocumento}`),...(record.vehicles||[]).map(v=>`${v.placa} ${v.marca} ${v.modelo}`),...(record.materials||[]).map(m=>`${m.tipoItem} ${m.tipoItemOutro} ${m.denominacao} ${m.desenho} ${m.numeroSerie} ${m.codigoIdentificacao} ${m.fornecedor}`),...(record.documents||[]).map(d=>`${d.tipo} ${d.numero}`)].join(' ').toLowerCase();
  return haystack.includes(term);
}

async function performRemoteSearch(term) {
  if (!apiConfigured() || !navigator.onLine || term.trim().length < 2) {
    state.remoteRecords = [];
    state.remoteSearching = false;
    return;
  }
  state.remoteSearching = true;
  if (state.route === 'records') renderRecords();
  try {
    const payload = await apiGet({ action: 'search', q: term.trim() });
    state.remoteRecords = (payload.records || []).map(item => ({ ...normalizeRecord(item), _source: 'remote' }));
    state.syncState = 'online';
  } catch (error) {
    console.warn('Busca remota:', error);
    state.remoteRecords = [];
    state.syncState = 'error';
  }
  state.remoteSearching = false;
  if (state.route === 'records') renderRecords();
}

function renderRecords() {
  const attentionMatch = record => !state.attentionOnly || (record.status === 'Rascunho' && ['warning','critical'].includes(operationalTimeInfo(record).level));
  const local=state.records.filter(record=>(state.filter==='Todos'||record.status===state.filter)&&attentionMatch(record)&&recordMatches(record,state.search));
  const merged=new Map(local.map(record=>[record.id,{...record,_source:'local'}]));
  state.remoteRecords.filter(record=>(state.filter==='Todos'||record.status===state.filter)&&attentionMatch(record)).forEach(record=>{if(!merged.has(record.id))merged.set(record.id,record);});
  const filtered=[...merged.values()].sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt));
  app.innerHTML=`<section class="form-card"><p class="eyebrow">Consulta operacional</p><h1>Boletins registrados</h1><p>A pesquisa consulta os dados do aparelho e, quando houver internet, também o Google Sheets.</p><div class="search-wrap">${ICONS.search}<input class="search-input" id="record-search" type="search" inputmode="search" enterkeyhint="search" value="${escapeHtml(state.search)}" placeholder="Ex.: 26, nome, referência ou placa" aria-describedby="record-search-help"><button type="button" class="search-clear ${state.search?'':'hidden'}" data-action="clear-search" aria-label="Limpar pesquisa">×</button></div><small id="record-search-help">Digite apenas <strong>26</strong> para procurar exatamente o BO cuja sequência termina em <strong>000026</strong>.</small><div class="filter-row">${['Todos','Rascunho','Finalizado'].map(value=>`<button class="filter-button ${!state.attentionOnly&&state.filter===value?'active':''}" type="button" data-filter="${value}">${value}</button>`).join('')}<button class="filter-button ${state.attentionOnly?'active':''}" type="button" data-filter-attention="true">Precisam de atenção</button></div></section>
  <div class="section-title"><div><p class="eyebrow">Resultado da consulta</p><h2>${filtered.length} registro(s) encontrado(s)</h2>${state.remoteSearching?'<small>Consultando a planilha...</small>':''}</div><button class="button primary small" type="button" data-action="new-bo">${ICONS.plus} Novo boletim</button></div>
  ${filtered.length?`<div class="record-list">${filtered.map(recordCard).join('')}</div>`:'<div class="entity-empty">Nenhum boletim corresponde aos filtros informados.</div>'}`;
  const search=app.querySelector('#record-search');search.addEventListener('input',()=>{state.search=search.value;clearTimeout(remoteSearchTimer);remoteSearchTimer=setTimeout(()=>performRemoteSearch(state.search),500);renderRecords();setTimeout(()=>{const el=app.querySelector('#record-search');el?.focus();el?.setSelectionRange(state.search.length,state.search.length);},0);});
  app.querySelector('[data-action="clear-search"]')?.addEventListener('click',()=>{state.search='';state.remoteRecords=[];renderRecords();});
  app.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{state.filter=button.dataset.filter;state.attentionOnly=false;renderRecords();}));
  app.querySelector('[data-filter-attention]')?.addEventListener('click',()=>{state.filter='Rascunho';state.attentionOnly=true;renderRecords();});
  bindCommonCards();
}

function printValue(value, fallback='Não informado') {
  const text = String(value ?? '').trim();
  return escapeHtml(text || fallback);
}
function printMetaItem(label, value, wide=false) {
  if (!meaningfulText(value) && !String(value||'').trim()) return '';
  return `<div class="print-meta-item ${wide?'wide':''}"><span>${escapeHtml(label)}</span><strong>${printValue(value)}</strong></div>`;
}
function printEntityList(title, items=[]) {
  if (!items.length) return '';
  return `<section class="print-section print-keep"><h2>${escapeHtml(title)}</h2><div class="print-entity-list">${items.join('')}</div></section>`;
}
function printEvidence(record) {
  const files = record.attachments || [];
  if (!files.length && !meaningfulText(record.templateData?.evidenceUnavailableReason)) return '';
  const requirements = evidenceRequirementsFor(record);
  const cards = files.map((file,index) => {
    const label = file.evidencePurpose ? (requirements.find(item=>item.id===file.evidencePurpose)?.label || file.evidencePurpose) : `Evidência ${index+1}`;
    const isImage = String(file.type||'').startsWith('image/');
    const visual = isImage && file.dataUrl
      ? `<img src="${file.dataUrl}" alt="${escapeHtml(label)}">`
      : `<div class="print-evidence-placeholder"><strong>${isImage?'Imagem armazenada no Drive':'Documento/anexo'}</strong><span>${escapeHtml(file.name||'Arquivo')}</span>${file.driveUrl?'<small>Arquivo sincronizado no Drive</small>':''}</div>`;
    return `<figure class="print-evidence-card">${visual}<figcaption><strong>${isImage?'Foto':'Anexo'} ${index+1}</strong> — ${escapeHtml(label)}</figcaption></figure>`;
  }).join('');
  const unavailable = meaningfulText(record.templateData?.evidenceUnavailableReason) ? `<p class="print-note"><strong>Justificativa de indisponibilidade:</strong> ${escapeHtml(record.templateData.evidenceUnavailableReason)}</p>` : '';
  return `<section class="print-section"><h2>Evidências</h2>${cards?`<div class="print-evidence-grid">${cards}</div>`:''}${unavailable}</section>`;
}

function buildPrintDocument(record) {
  const r = record, b = r.basic || {};
  const reference = bulletinDisplayType(r);
  const directorate = b.diretoria === 'Outra' ? b.diretoriaOutra : b.diretoria;
  const timing = operationalTimeInfo(r);
  const hasRequester = requesterRequired(r);
  const round = isRoundOrigin(r);
  const people = (r.people||[]).map(p=>`<article><strong>${printValue(p.nome,'Pessoa não identificada')}</strong><span>${[p.tipo,p.vinculo,p.matricula,p.empresa].filter(Boolean).map(escapeHtml).join(' • ')}</span></article>`);
  const vehicles = (r.vehicles||[]).map(v=>`<article><strong>${printValue(v.placa||v.chassi,'Veículo não identificado')}</strong><span>${[v.marca,v.modelo,v.regiaoDano,v.tipoDano,v.descricaoDano].filter(Boolean).map(escapeHtml).join(' • ')}</span></article>`);
  const materials = (r.materials||[]).map(m=>`<article><strong>${escapeHtml(materialItemTypeLabel(m))} — ${printValue(m.denominacao,'Item sem identificação técnica')}</strong><span>${[m.quantidade?`Quantidade ${m.quantidade}`:'',m.desenho?`Desenho/código ${m.desenho}`:'',m.numeroSerie?`Série ${m.numeroSerie}`:'',m.codigoIdentificacao?`Identificação ${m.codigoIdentificacao}`:'',m.fornecedor,m.codigoVasilhame].filter(Boolean).map(escapeHtml).join(' • ')}</span></article>`);
  const documents = (r.documents||[]).map(d=>`<article><strong>${printValue(d.tipo,'Documento')}</strong><span>${printValue(d.numero,'Número não informado')}</span></article>`);
  const amendments = (r.amendments||[]).map(a=>`<article><strong>${escapeHtml(a.tipo||'Complemento')}</strong><p>${escapeHtml(a.texto||'')}</p><span>${escapeHtml(formatDateTime(a.createdAt))}${a.responsavel?` • ${escapeHtml(a.responsavel)}`:''}</span></article>`).join('');
  const requesterMeta = hasRequester ? printMetaItem('Solicitante',[b.nomeEmissor,b.matriculaEmissor].filter(Boolean).join(' • ')) : '';
  const operatorLabel = round ? 'Vigilante responsável pela ronda' : 'Vigilante responsável';
  const report = meaningfulText(r.history?.relato) ? `<div class="print-report">${renderReportPreview(r.history.relato)}</div>` : '<p>Relato não informado.</p>';
  return `<div class="print-document">
    <header class="print-header"><div><p>SEGURANÇA PATRIMONIAL</p><h1>BO Digital GSP</h1><span>Boletim de Ocorrência</span></div><div class="print-number"><span>NÚMERO</span><strong>${escapeHtml(r.numero||'')}</strong><small>${escapeHtml(r.status||'')}</small></div></header>
    <section class="print-summary"><h2>${escapeHtml(reference||'Ocorrência')}</h2><p>${escapeHtml(b.categoria||referenceCategory(b.referencia)||'')}</p></section>
    <section class="print-section print-keep"><h2>Identificação da ocorrência</h2><div class="print-meta-grid">
      ${printMetaItem('Categoria',b.categoria||referenceCategory(b.referencia))}${printMetaItem('Tipo de boletim',reference)}${printMetaItem('Origem',b.origemOcorrencia||'Constatação da Segurança')}
      ${printMetaItem(operatorLabel,[r.operator?.usuario,r.operator?.registro,r.operator?.turno].filter(Boolean).join(' • '))}${requesterMeta}
      ${printMetaItem('Local',[b.local,b.complementoLocal].filter(Boolean).join(' — '))}${printMetaItem('Diretoria / setor',[directorate,b.setorArea].filter(Boolean).join(' • '))}
      ${printMetaItem('Data/hora do fato',`${formatDateOnly(b.data)} às ${b.hora||'-'}`)}${printMetaItem('Início / chegada',formatDateTime(r.operationalTiming?.startedAt||r.createdAt))}${printMetaItem('Término',formatDateTime(r.finalizedAt))}${printMetaItem('Duração',timing.label)}
    </div></section>
    <section class="print-section"><h2>Relato consolidado</h2>${report}</section>
    ${printEntityList('Pessoas relacionadas',people)}${printEntityList('Veículos relacionados',vehicles)}${printEntityList('Materiais / peças / cargas',materials)}${printEntityList('Documentos relacionados',documents)}
    ${printEvidence(r)}
    ${amendments?`<section class="print-section"><h2>Complementos e retificações</h2><div class="print-amendments">${amendments}</div></section>`:''}
    <footer class="print-footer"><span>${escapeHtml([r.operator?.usuario,r.operator?.registro,r.operator?.turno].filter(Boolean).join(' • '))}</span><span>${escapeHtml(r.numero||'')}</span></footer>
  </div>`;
}
function printRecord(record) {
  let root = document.getElementById('print-root');
  if (!root) { root=document.createElement('div'); root.id='print-root'; document.body.appendChild(root); }
  root.innerHTML = buildPrintDocument(record);
  const previousTitle = document.title;
  document.title = `${record.numero || 'BO'} - BO Digital GSP`;
  const cleanup = () => { document.title=previousTitle; root.innerHTML=''; window.removeEventListener('afterprint',cleanup); };
  window.addEventListener('afterprint',cleanup);
  setTimeout(()=>window.print(),60);
}

function renderDetail() {
  const r=state.current,b=r.basic;
  const reference=bulletinDisplayType(r);
  const directorate=b.diretoria==='Outra'?b.diretoriaOutra:b.diretoria;
  const attendance=operationalTimeInfo(r);
  const round=isRoundOrigin(r);
  const hasRequester=requesterRequired(r);
  const identity=hasRequester
    ? `<div><dt>Origem</dt><dd>${escapeHtml(b.origemOcorrencia||'Solicitação recebida')}</dd></div><div><dt>Solicitante</dt><dd>${escapeHtml(b.nomeEmissor||'Não informado')}${b.matriculaEmissor?` • ${escapeHtml(b.matriculaEmissor)}`:''}</dd></div>`
    : `<div><dt>Origem</dt><dd>${escapeHtml(b.origemOcorrencia||'Constatação da Segurança')}</dd></div><div><dt>${round?'Vigilante da ronda':'Vigilante responsável'}</dt><dd>${escapeHtml(r.operator?.usuario||'Não identificado')} • ${escapeHtml(r.operator?.registro||'')}</dd></div>`;
  const apuracao=hasRequester
    ? `<div style="grid-column:1/-1"><dt>Relato recebido • ${escapeHtml(r.history.fonteRelato||'Solicitante')}</dt><dd>${escapeHtml(r.history.inicio||'Não informado')}</dd></div><div style="grid-column:1/-1"><dt>Constatação da Segurança</dt><dd>${escapeHtml(r.history.identificado||'Não informado')}</dd></div>`
    : `<div style="grid-column:1/-1"><dt>${round?'Constatação da ronda':'Constatação da Segurança'}</dt><dd>${escapeHtml(r.history.identificado||'Não informado')}</dd></div>`;
  app.innerHTML=`<section class="hero no-visual"><div class="hero-copy"><p class="eyebrow">${escapeHtml(r.status)} • boletim de ocorrência</p><h1>${escapeHtml(r.numero)}</h1><p>${escapeHtml(reference||'Referência não informada')} • ${formatDateOnly(b.data)} às ${escapeHtml(b.hora)}</p><div class="hero-actions"><button class="button ghost" type="button" data-action="print">${ICONS.file} Imprimir ou salvar em PDF</button><button class="button secondary" type="button" data-action="sync-record">${ICONS.sync} Sincronizar</button><button class="button primary" type="button" data-action="add-amendment">${ICONS.plus} Adicionar complemento</button><button class="button secondary" type="button" data-action="add-final-attachment">${ICONS.paperclip} Novo anexo</button><button class="button secondary" type="button" data-action="qr-record">QR do BO</button></div><div style="margin-top:15px"><span class="sync-state sync-${escapeHtml(r.syncStatus||'local')}"><i></i>${escapeHtml(syncStatusLabel(r))}</span></div></div></section>
  ${renderOperationalTimingCard(r)}
  <div class="review-grid">
    ${reviewSectionStatic('Ocorrência',`<dl class="definition-grid"><div><dt>Categoria</dt><dd>${escapeHtml(b.categoria||referenceCategory(b.referencia)||'Não informada')}</dd></div><div><dt>Tipo de boletim</dt><dd>${escapeHtml(reference||'Não informado')}</dd></div>${identity}<div><dt>Local</dt><dd>${escapeHtml(b.local)} — ${escapeHtml(b.complementoLocal)}</dd></div><div><dt>Diretoria / área</dt><dd>${escapeHtml(directorate||'Não informada')}${b.setorArea?` • ${escapeHtml(b.setorArea)}`:''}</dd></div><div><dt>Data/hora do fato</dt><dd>${formatDateOnly(b.data)} às ${escapeHtml(b.hora)}</dd></div><div><dt>Início do BO</dt><dd>${formatDateTime(r.operationalTiming?.startedAt||r.createdAt)}</dd></div><div><dt>Finalização</dt><dd>${formatDateTime(r.finalizedAt)}</dd></div><div><dt>Duração do atendimento</dt><dd>${escapeHtml(attendance.label)}</dd></div></dl>`)}
    ${reviewSectionStatic('Apuração padronizada',`<dl class="definition-grid">${apuracao}${templateAnswerSummary(r).map(item=>`<div><dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(item.value)}</dd></div>`).join('')}</dl>`)}
    ${reviewSectionStatic(`Pessoas (${r.people.length})`,r.people.length?`<div class="entity-list">${r.people.map(renderPersonItemReview).join('')}</div>`:'<div class="entity-empty">Nenhuma pessoa cadastrada.</div>')}
    ${reviewSectionStatic(`Veículos (${r.vehicles.length})`,r.vehicles.length?`<div class="entity-list">${r.vehicles.map(renderVehicleItemReview).join('')}</div>`:'<div class="entity-empty">Nenhum veículo cadastrado.</div>')}
    ${reviewSectionStatic(`Materiais (${r.materials.length})`,r.materials.length?`<div class="entity-list">${r.materials.map(renderMaterialItemReview).join('')}</div>`:'<div class="entity-empty">Nenhum material cadastrado.</div>')}
    ${reviewSectionStatic(`Documentos (${r.documents?.length||0})`,(r.documents||[]).length?`<div class="entity-list">${r.documents.map((d,i)=>`<div><strong>${escapeHtml(d.tipo||'Documento')}</strong><div class="entity-meta">${d.numero?`<span class="chip">${escapeHtml(d.numero)}</span>`:''}</div></div>`).join('')}</div>`:'<div class="entity-empty">Nenhum documento cadastrado.</div>')}
    ${reviewSectionStatic(`Evidências (${r.attachments.length})`, r.attachments.length ? `<div class="file-grid detail-file-grid">${r.attachments.map((file,index)=>renderFileItem(file,index)).join('')}</div>` : `<div class="entity-empty">Nenhuma evidência anexada.${meaningfulText(r.templateData?.evidenceUnavailableReason)?` ${escapeHtml(r.templateData.evidenceUnavailableReason)}`:''}</div>`)}
    ${reviewSectionStatic('Histórico',`<dl class="definition-grid"><div style="grid-column:1/-1"><dt>Relato</dt><dd class="report-detail-text">${renderReportPreview(r.history.relato)}</dd></div><div style="grid-column:1/-1"><dt>Providências</dt><dd>${escapeHtml(r.history.providencias||'Nenhuma')}</dd></div></dl>`)}
    ${reviewSectionStatic(`Auditoria (${r.auditTrail.length})`, r.auditTrail.length ? `<div class="timeline audit-timeline">${r.auditTrail.slice().reverse().map(a=>`<article><span>${formatDateTime(a.at)}</span><strong>${escapeHtml(a.action)}</strong><p>${escapeHtml(a.details||'')}</p><small>${escapeHtml(a.actor?.usuario || 'Operador')} ${a.actor?.registro ? `• ${escapeHtml(a.actor.registro)}` : ''} ${a.actor?.turno ? `• ${escapeHtml(a.actor.turno)}` : ''}</small></article>`).join('')}</div>` : '<div class="entity-empty">Nenhum evento de auditoria registrado.</div>')}
    ${reviewSectionStatic(`Complementos e retificações (${r.amendments.length})`,r.amendments.length?`<div class="timeline">${r.amendments.map(a=>`<article><span>${formatDateTime(a.createdAt)}</span><strong>${escapeHtml(a.tipo)}</strong><p>${escapeHtml(a.texto)}</p><small>${escapeHtml(a.responsavel||'Não informado')}</small></article>`).join('')}</div>`:'<div class="entity-empty">Nenhum complemento registrado.</div>')}
  </div><input id="final-attachment" class="hidden" type="file" accept="image/*,.pdf,.doc,.docx" multiple>`;
  app.querySelector('[data-action="print"]').addEventListener('click',()=>printRecord(r));
  app.querySelector('[data-action="sync-record"]').addEventListener('click',async()=>{const success=await syncRecord(r,true);if(success)showToast('Registro sincronizado.');renderDetail();});
  app.querySelector('[data-action="add-amendment"]').addEventListener('click',()=>openEntityDialog('amendments'));
  app.querySelector('[data-action="add-final-attachment"]').addEventListener('click',()=>app.querySelector('#final-attachment').click());
  app.querySelector('[data-action="qr-record"]')?.addEventListener('click',()=>showQrForRecord(r));
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

    ${renderSystemHealthCard(true)}
    <section class="info-card security-settings-card"><p class="eyebrow">Proteção local opcional</p><h2>Criptografia dos boletins neste aparelho</h2><p>Quando ativada, os registros e anexos armazenados no IndexedDB ficam protegidos com AES-GCM. A senha não é enviada ao Google Sheets e precisa ser informada novamente após encerrar a sessão do navegador.</p><div class="entity-meta"><span class="chip ${encryptionEnabled()?'sync-synced':''}">${encryptionEnabled()?'Criptografia ativa':'Criptografia desativada'}</span></div><div class="about-actions">${encryptionEnabled()?'<button class="button warning" type="button" data-about-action="disable-encryption">Desativar criptografia local</button>':'<button class="button secondary" type="button" data-about-action="enable-encryption">Ativar criptografia local</button>'}<button class="button secondary" type="button" data-action="show-diagnostics">Abrir diagnóstico</button></div></section>
    <section class="info-card"><p class="eyebrow">Tempo de atendimento</p><h2>Indicador visual de atenção operacional</h2><p>As cores de atenção e crítico consideram o tempo do atendimento, iniciado automaticamente quando o novo BO é aberto no local. Este indicador é apenas uma referência operacional configurável e não representa SLA corporativo oficial.</p><div class="form-grid"><div class="field"><label for="sla-warning">Atenção no atendimento a partir de (min)</label><input id="sla-warning" type="number" min="1" max="1440" value="${operationalTimeSettings().warningMinutes}"></div><div class="field"><label for="sla-critical">Crítico no atendimento a partir de (min)</label><input id="sla-critical" type="number" min="2" max="1440" value="${operationalTimeSettings().criticalMinutes}"></div></div><div class="about-actions"><button class="button secondary" type="button" data-about-action="save-sla">Salvar tempos</button><button class="button secondary" type="button" data-action="show-syncqueue">Ver fila de sincronização</button></div></section>

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
  app.querySelector('[data-about-action="enable-encryption"]')?.addEventListener('click', async()=>{const first=String(prompt('Crie uma senha para proteger os boletins deste aparelho (mínimo 6 caracteres).')||'');if(!first)return;const second=String(prompt('Repita a senha para confirmar.')||'');if(first!==second){showToast('As senhas não coincidem.');return;}try{showBusy('Protegendo banco local','Criptografando os registros e anexos deste aparelho.');await enableLocalEncryption(first);await refreshRecords();renderAbout();showToast('Criptografia local ativada.');}catch(error){await openAppModal({kind:'danger',eyebrow:'Criptografia local',title:'Não foi possível ativar',message:escapeHtml(error.message),confirmText:'Entendi'});}finally{hideBusy();}});
  app.querySelector('[data-about-action="disable-encryption"]')?.addEventListener('click', async()=>{const ok=await openAppModal({kind:'warning',eyebrow:'Criptografia local',title:'Desativar proteção deste aparelho?',message:'Os boletins voltarão a ser armazenados sem criptografia local. A sincronização com o Google Sheets não é afetada.',confirmText:'Desativar',cancelText:'Cancelar'});if(!ok)return;try{showBusy('Atualizando banco local','Removendo a criptografia dos registros deste aparelho.');await disableLocalEncryption();await refreshRecords();renderAbout();showToast('Criptografia local desativada.');}catch(error){await openAppModal({kind:'danger',eyebrow:'Criptografia local',title:'Não foi possível desativar',message:escapeHtml(error.message),confirmText:'Entendi'});}finally{hideBusy();}});
  app.querySelector('[data-about-action="save-sla"]')?.addEventListener('click',()=>{const warning=Math.max(1,Number(app.querySelector('#sla-warning')?.value||20));const critical=Math.max(warning+1,Number(app.querySelector('#sla-critical')?.value||30));storageSet(SLA_SETTINGS_KEY,JSON.stringify({warningMinutes:warning,criticalMinutes:critical}));showToast('Tempos de atenção do atendimento atualizados.');renderAbout();});
  app.querySelectorAll('[data-action="show-diagnostics"]').forEach(button=>button.addEventListener('click',()=>navigate('diagnostics')));
  app.querySelectorAll('[data-action="show-syncqueue"]').forEach(button=>button.addEventListener('click',()=>navigate('syncqueue')));
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
  else if (['syncqueue','handoff','diagnostics'].includes(state.route)) navigate('home');
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



let pendingPwaUpdate = null;
function showPwaUpdateBanner(registration) {
  pendingPwaUpdate = registration || window.BO_PWA?.registration || null;
  pwaUpdateBanner?.classList.remove('hidden');
}
function hidePwaUpdateBanner() {
  pwaUpdateBanner?.classList.add('hidden');
}
window.addEventListener('bo-pwa-update', event => {
  showPwaUpdateBanner(event.detail);
});
pwaUpdateLater?.addEventListener('click', hidePwaUpdateBanner);
pwaUpdateNow?.addEventListener('click', async () => {
  pwaUpdateNow.disabled = true;
  pwaUpdateNow.textContent = 'Atualizando…';
  try {
    const applied = await window.BO_PWA?.applyUpdate?.(pendingPwaUpdate);
    if (!applied) {
      pwaUpdateNow.disabled = false;
      pwaUpdateNow.textContent = 'Atualizar agora';
      showToast('A atualização ainda não está pronta. Tente novamente em alguns segundos.');
    }
  } catch (error) {
    console.warn('Falha ao aplicar atualização do PWA.', error);
    pwaUpdateNow.disabled = false;
    pwaUpdateNow.textContent = 'Atualizar agora';
    showToast('Não foi possível atualizar agora. O aplicativo continua funcionando.');
  }
});

technicalButton?.addEventListener('click', async () => {
  const confirmed = await openAppModal({ kind: 'info', eyebrow: 'Área técnica', title: 'Abrir configurações administrativas?', message: 'Esta área contém endereço do banco, sincronização, importação e exclusão de dados locais.', confirmText: 'Abrir configurações', cancelText: 'Cancelar' });
  if (confirmed) navigate('about');
});

window.addEventListener('online', async () => {
  state.syncState = 'online'; updateHeader(); updateConnectivityUi();
  const pendingOperator = (() => { try { return JSON.parse(storageGet(PENDING_LOGIN_KEY) || 'null'); } catch { return null; } })();
  if (pendingOperator || state.operator) await registerOperatorAccess(pendingOperator || state.operator);
  await processSyncQueue({ force:true });
  await refreshRecords();
  if (state.route === 'home') renderHome(); else if (state.route === 'syncqueue') renderSyncQueue();
});
window.addEventListener('offline', () => { state.syncState = 'offline'; updateHeader(); updateConnectivityUi(); scheduleSyncRetry(); });

offlineQueueButton?.addEventListener('click',()=>{if(state.operator)navigate('syncqueue');});
offlineDraftsButton?.addEventListener('click',()=>{if(!state.operator)return;state.filter='Rascunho';state.search='';navigate('records');});
offlineRetryButton?.addEventListener('click',async()=>{offlineRetryButton.disabled=true;offlineRetryButton.textContent='Tentando…';try{await processSyncQueue({force:true});}finally{offlineRetryButton.disabled=false;offlineRetryButton.textContent='Tentar agora';updateConnectivityUi();}});
window.addEventListener('bo-advanced-toast',event=>showToast(event.detail || 'Ação concluída.'));
window.addEventListener('error',event=>logClientError('window',event.error || event.message));
window.addEventListener('unhandledrejection',event=>logClientError('promise',event.reason));
installButton.addEventListener('click', handleInstallRequest);


function updateConnectivityUi() {
  if (!offlineBanner) return;
  if (state.suppressConnectivityBanner || document.body.classList.contains('busy-open')) {
    offlineBanner.classList.add('hidden');
    return;
  }
  const pending = pendingSyncRecords();
  const drafts = state.records.filter(record => record.status === 'Rascunho');
  const offline = !navigator.onLine;
  const hasProblems = pending.length > 0;
  offlineBanner.classList.toggle('hidden', !offline && !hasProblems);
  if (offlineDraftsButton) {
    offlineDraftsButton.classList.toggle('hidden', drafts.length === 0);
    offlineDraftsButton.textContent = drafts.length ? `Rascunhos (${drafts.length})` : 'Rascunhos';
  }
  if (offlineQueueButton) offlineQueueButton.textContent = pending.length ? `Fila (${pending.length})` : 'Ver fila';
  offlineBanner.classList.toggle('online-pending', !offline && hasProblems);
  const conflicts = pending.filter(r => r.syncStatus === 'conflict').length;
  if (offline) {
    offlineBanner.querySelector('strong').textContent = 'Sem conexão — trabalhando offline';
    offlineBannerText.textContent = `${pending.length} registro(s) aguardando envio e ${drafts.length} rascunho(s) protegido(s) no aparelho. A fila será enviada automaticamente quando a conexão retornar.`;
  } else if (conflicts) {
    offlineBanner.querySelector('strong').textContent = 'Sincronização requer atenção';
    offlineBannerText.textContent = `${conflicts} conflito(s) de atualização e ${Math.max(0,pending.length-conflicts)} outra(s) pendência(s). Abra a fila para revisar.`;
  } else if (hasProblems) {
    offlineBanner.querySelector('strong').textContent = 'Há registros aguardando sincronização';
    const next = pending.map(r=>r.clientSync?.nextRetryAt).filter(Boolean).sort()[0];
    offlineBannerText.textContent = next ? `${pending.length} registro(s) pendente(s). Próxima tentativa automática: ${formatDateTime(next)}.` : `${pending.length} registro(s) pendente(s). A sincronização será tentada automaticamente.`;
  }
}

function renderSystemHealthCard(compact=false) {
  const health = healthState();
  const queue = pendingSyncRecords();
  const serverOk = apiConfigured() && state.syncState !== 'error' && Boolean(health.lastServerOkAt || state.syncState === 'online');
  const storageText = encryptionEnabled() ? 'Criptografado' : 'Local';
  return `<section class="system-health-card ${compact?'compact':''}"><div class="system-health-head"><div><p class="eyebrow">Saúde do sistema</p><h2>Estado operacional</h2></div><button class="button small secondary" type="button" data-action="show-diagnostics">Diagnóstico</button></div><div class="health-grid"><span class="health-item ${navigator.onLine?'ok':'warn'}"><i></i><b>Internet</b><small>${navigator.onLine?'Online':'Offline'}</small></span><span class="health-item ${serverOk?'ok':apiConfigured()?'warn':'muted'}"><i></i><b>Google Sheets</b><small>${!apiConfigured()?'Não configurado':serverOk?'Respondendo':'Sem confirmação'}</small></span><span class="health-item ${queue.length?'warn':'ok'}"><i></i><b>Fila</b><small>${queue.length} pendência(s)</small></span><span class="health-item ok"><i></i><b>Armazenamento</b><small>${storageText}</small></span></div>${health.lastSyncSuccessAt?`<small class="health-last">Última sincronização confirmada: ${escapeHtml(formatDateTime(health.lastSyncSuccessAt))}</small>`:''}</section>`;
}

function renderSyncQueue() {
  const queue = pendingSyncRecords().sort((a,b)=>new Date(a.clientSync?.nextRetryAt || a.updatedAt)-new Date(b.clientSync?.nextRetryAt || b.updatedAt));
  app.innerHTML = `<section class="form-card"><p class="eyebrow">Confiabilidade offline</p><h1>Fila de sincronização</h1><p>O aplicativo preserva os registros no aparelho e usa tentativas progressivas de 10 s, 30 s, 1 min, 2 min e 5 min quando o envio falha.</p><div class="about-actions"><button class="button primary" type="button" data-queue-action="retry-all">${ICONS.sync} Tentar pendentes agora</button><button class="button secondary" type="button" data-action="show-diagnostics">Diagnóstico</button></div></section>${queue.length?`<div class="record-list sync-queue-list">${queue.map(record=>{const meta=record.clientSync||{};return `<article class="record-card queue-card"><div><h3>${escapeHtml(record.numero)}</h3><p>${escapeHtml(resolvedReference(record.basic)||'Ocorrência')} • ${escapeHtml(syncStatusLabel(record))}</p><div class="entity-meta"><span class="chip sync-chip sync-${escapeHtml(record.syncStatus)}">${escapeHtml(syncStatusLabel(record))}</span>${meta.attempts?`<span class="chip">Tentativas: ${meta.attempts}</span>`:''}${nextRetryText(record)?`<span class="chip retry-chip">${escapeHtml(nextRetryText(record))}</span>`:''}</div>${meta.lastError?`<small class="queue-error">${escapeHtml(meta.lastError)}</small>`:''}</div><div class="record-side"><time>${formatDateTime(record.updatedAt)}</time><button class="button small ${record.syncStatus==='conflict'?'warning':'secondary'}" type="button" data-queue-retry="${record.id}">${record.syncStatus==='conflict'?'Resolver conflito':'Tentar agora'}</button></div></article>`}).join('')}</div>`:'<div class="entity-empty success-empty">Nenhuma pendência. Todos os registros locais estão confirmados ou não exigem envio.</div>'}`;
  app.querySelector('[data-queue-action="retry-all"]')?.addEventListener('click',async event=>{event.currentTarget.disabled=true;try{await processSyncQueue({force:true});}finally{event.currentTarget.disabled=false;renderSyncQueue();}});
  app.querySelectorAll('[data-queue-retry]').forEach(button=>button.addEventListener('click',async()=>{const record=state.records.find(r=>r.id===button.dataset.queueRetry);if(!record)return;await syncRecord(record,true);await refreshRecords();renderSyncQueue();}));
  app.querySelectorAll('[data-action="show-diagnostics"]').forEach(button=>button.addEventListener('click',()=>navigate('diagnostics')));
}

function handoffNotes() { try { return JSON.parse(storageGet(HANDOFF_KEY) || '[]') || []; } catch { return []; } }
function buildHandoffSummary() {
  const drafts=state.records.filter(r=>r.status==='Rascunho').sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
  const queue=pendingSyncRecords();
  const lines=[`Passagem de turno • ${new Date().toLocaleString('pt-BR')}`,`Rascunhos: ${drafts.length}`,`Pendências de sincronização: ${queue.length}`];
  drafts.slice(0,8).forEach(r=>lines.push(`- ${r.numero}: ${resolvedReference(r.basic)||'Sem referência'} • em aberto ${operationalTimeInfo(r).label}`));
  if(queue.length) lines.push(`Fila: ${queue.map(r=>`${r.numero} (${syncStatusLabel(r)})`).slice(0,8).join(', ')}`);
  return lines.join('\n');
}
window.BO_HANDOFF_SUMMARY = buildHandoffSummary;
function renderHandoff() {
  const drafts=state.records.filter(r=>r.status==='Rascunho').sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
  const queue=pendingSyncRecords(); const notes=handoffNotes().slice(-5).reverse();
  app.innerHTML=`<section class="hero no-visual"><div class="hero-copy"><p class="eyebrow">Continuidade operacional</p><h1>Passagem de turno</h1><p>Consolide rascunhos, problemas de sincronização e observações que precisam ser conhecidos pelo próximo vigilante.</p><div class="metric-grid handoff-metrics"><div class="metric-card"><span>Rascunhos</span><strong>${drafts.length}</strong></div><div class="metric-card"><span>Fila</span><strong>${queue.length}</strong></div><div class="metric-card"><span>Conflitos</span><strong>${queue.filter(r=>r.syncStatus==='conflict').length}</strong></div></div></div></section><section class="form-card"><p class="eyebrow">Observação de turno</p><h2>Registrar informação para continuidade</h2><div class="field full"><label for="handoff-note">Observação</label><textarea id="handoff-note" placeholder="Ex.: BO aguardando documento do solicitante; acompanhar retorno do setor..."></textarea></div><div class="about-actions"><button class="button primary" type="button" data-handoff-action="save">Salvar observação</button><button class="button secondary" type="button" data-handoff-action="copy">Copiar resumo</button><button class="button secondary" type="button" data-action="show-syncqueue">Abrir fila</button></div></section><div class="section-title"><div><p class="eyebrow">Pendências atuais</p><h2>BOs em andamento</h2></div></div>${drafts.length?`<div class="record-list">${drafts.map(recordCard).join('')}</div>`:'<div class="entity-empty">Nenhum rascunho em andamento.</div>'}<div class="section-title"><div><p class="eyebrow">Histórico local</p><h2>Últimas observações de passagem</h2></div></div>${notes.length?`<div class="timeline handoff-timeline">${notes.map(n=>`<article><span>${formatDateTime(n.at)}</span><strong>${escapeHtml(n.operator?.usuario || 'Operador')} • ${escapeHtml(n.operator?.turno || '')}</strong><p>${escapeHtml(n.text)}</p><small>${n.counts?.drafts||0} rascunho(s) • ${n.counts?.queue||0} pendência(s)</small></article>`).join('')}</div>`:'<div class="entity-empty">Nenhuma observação de passagem registrada neste aparelho.</div>'}`;
  bindCommonCards();
  app.querySelector('[data-handoff-action="save"]')?.addEventListener('click',()=>{const text=String(app.querySelector('#handoff-note')?.value||'').trim();if(!text){showToast('Escreva uma observação antes de salvar.');return;}const values=handoffNotes();values.push({id:uid(),at:new Date().toISOString(),operator:operatorSnapshot(),text,counts:{drafts:drafts.length,queue:queue.length}});storageSet(HANDOFF_KEY,JSON.stringify(values.slice(-30)));showToast('Observação de turno salva neste aparelho.');renderHandoff();});
  app.querySelector('[data-handoff-action="copy"]')?.addEventListener('click',async()=>{await navigator.clipboard?.writeText?.(buildHandoffSummary());showToast('Resumo da passagem de turno copiado.');});
}

function renderDiagnostics() {
  const health=healthState(); const queue=pendingSyncRecords(); const sw=Boolean(navigator.serviceWorker?.controller); const errors=errorLog().slice(-8).reverse();
  app.innerHTML=`<section class="form-card"><p class="eyebrow">Suporte técnico</p><h1>Diagnóstico do sistema</h1><p>Use esta tela quando um aparelho apresentar comportamento diferente. Ela não exibe o relato dos BOs.</p><div class="diagnostic-grid"><div><span>Aplicativo</span><strong>${APP_VERSION}</strong></div><div><span>API exigida</span><strong>${REQUIRED_API_VERSION}</strong></div><div><span>Internet</span><strong>${navigator.onLine?'Online':'Offline'}</strong></div><div><span>Service Worker</span><strong>${sw?'Ativo':'Sem controle'}</strong></div><div><span>Modo instalado</span><strong>${isStandaloneMode()?'Sim':'Navegador'}</strong></div><div><span>Criptografia local</span><strong>${encryptionEnabled()?'Ativa':'Desativada'}</strong></div><div><span>Registros locais</span><strong>${state.records.length}</strong></div><div><span>Fila</span><strong>${queue.length}</strong></div><div><span>Último servidor OK</span><strong>${health.lastServerOkAt?formatDateTime(health.lastServerOkAt):'Sem teste'}</strong></div><div><span>Última sincronização</span><strong>${health.lastSyncSuccessAt?formatDateTime(health.lastSyncSuccessAt):'Sem confirmação'}</strong></div><div id="diag-storage"><span>Armazenamento</span><strong>Calculando…</strong></div><div><span>Navegador</span><strong>${escapeHtml(navigator.userAgent.slice(0,90))}</strong></div></div><div class="about-actions"><button class="button primary" type="button" data-diag-action="test">Testar conexão</button><button class="button secondary" type="button" data-diag-action="copy">Copiar diagnóstico</button><button class="button secondary" type="button" data-diag-action="clear-errors">Limpar erros</button></div></section><div class="section-title"><div><p class="eyebrow">Erros recentes</p><h2>Registro técnico local</h2></div></div>${errors.length?`<div class="timeline diagnostic-errors">${errors.map(e=>`<article><span>${formatDateTime(e.at)}</span><strong>${escapeHtml(e.source)}</strong><p>${escapeHtml(e.message)}</p></article>`).join('')}</div>`:'<div class="entity-empty">Nenhum erro técnico recente registrado.</div>'}`;
  navigator.storage?.estimate?.().then(({usage=0,quota=0})=>{const el=app.querySelector('#diag-storage strong');if(el)el.textContent=`${humanSize(usage)} de ${humanSize(quota)}`;}).catch(()=>{});
  app.querySelector('[data-diag-action="test"]')?.addEventListener('click',testSheetsConnection);
  app.querySelector('[data-diag-action="clear-errors"]')?.addEventListener('click',()=>{storageSet(ERROR_LOG_KEY,'[]');renderDiagnostics();});
  app.querySelector('[data-diag-action="copy"]')?.addEventListener('click',async()=>{const text=[`BO Digital GSP ${APP_VERSION}`,`API ${REQUIRED_API_VERSION}`,`Internet: ${navigator.onLine}`,`Service Worker: ${sw}`,`Instalado: ${isStandaloneMode()}`,`Criptografia: ${encryptionEnabled()}`,`Registros: ${state.records.length}`,`Fila: ${queue.length}`,`Último servidor: ${health.lastServerOkAt||'-'}`,`Última sync: ${health.lastSyncSuccessAt||'-'}`,`UA: ${navigator.userAgent}`].join('\n');await navigator.clipboard?.writeText?.(text);showToast('Diagnóstico copiado.');});
}

function bindAttachmentPreviews() {
  app.querySelectorAll('[data-preview-file]').forEach(button=>button.addEventListener('click',async()=>{const index=Number(button.dataset.previewFile);const file=state.current?.attachments?.[index];if(!file)return;const mod=await ensureAdvancedLoaded();mod?.showImageLightbox?.(file);}));
}

function parseLaunchIntent() {
  const params=new URLSearchParams(location.search); const intent={ action:params.get('action')||'', bo:params.get('bo')||'', shareTitle:params.get('share_title')||'', shareText:params.get('share_text')||'', shareUrl:params.get('share_url')||'' };
  const has=Object.values(intent).some(Boolean); if(!has){try{return JSON.parse(storageGet(LAUNCH_INTENT_KEY)||'null');}catch{return null;}}
  storageSet(LAUNCH_INTENT_KEY,JSON.stringify(intent));
  try { history.replaceState({},document.title,location.pathname + location.hash); } catch (_) {}
  return intent;
}
async function handleLaunchIntent() {
  if (!state.operator) return;
  const intent=state.launchIntent || (()=>{try{return JSON.parse(storageGet(LAUNCH_INTENT_KEY)||'null');}catch{return null;}})(); if(!intent)return;
  storageRemove(LAUNCH_INTENT_KEY); state.launchIntent=null;
  if(intent.shareTitle||intent.shareText||intent.shareUrl){const record=stampOperator(createBlankRecord());record.history.adicional=[intent.shareTitle,intent.shareText,intent.shareUrl].filter(Boolean).join('\n');addAudit(record,'CONTEÚDO COMPARTILHADO','Conteúdo recebido pelo Share Target do PWA.');await dbPut(record);await refreshRecords();state.current=record;state.currentStep=0;await navigate('wizard');showToast('Conteúdo compartilhado foi anexado ao novo rascunho.');return;}
  if(intent.bo){let record=state.records.find(r=>r.numero===intent.bo||r.id===intent.bo);if(!record&&apiConfigured()&&navigator.onLine){try{const payload=await apiGet({action:'get',numero:intent.bo});if(payload.record){record=normalizeRecord(payload.record);await dbPut(record);await refreshRecords();}}catch(error){logClientError('deep-link',error);}}if(record){await openRecord(record.id);return;}showToast(`BO ${intent.bo} não encontrado neste aparelho.`);}
  if(intent.action==='new-bo'){await createNewBo();return;} if(intent.action==='records'){await navigate('records');return;} if(intent.action==='nexo'){const nx=await ensureAssistantLoaded();setTimeout(()=>nx?.open?.(),80);}
}

async function offerDraftRecovery() {
  const id=state.recoveryRecordId; if(!id)return; state.recoveryRecordId='';
  const record=state.records.find(r=>r.id===id&&r.status==='Rascunho'); if(!record)return;
  const choice=await openAppModal({kind:'info',eyebrow:'Recuperação automática',title:'Encontramos um BO não finalizado',message:'O aplicativo salvou automaticamente o preenchimento antes de ser fechado ou sair de primeiro plano.',details:`<strong>${escapeHtml(record.numero)}</strong><br>${escapeHtml(resolvedReference(record.basic)||'Ocorrência em preenchimento')}<br>Último salvamento: ${escapeHtml(formatDateTime(record.clientSync?.lastAutoSavedAt || record.updatedAt))}`,confirmText:'Continuar preenchimento',cancelText:'Ir para o início'});
  if(choice){addAudit(record,'RECUPERAR RASCUNHO','Preenchimento recuperado após reabertura do aplicativo.');await dbPut(record);await refreshRecords();await openRecord(record.id);} else clearNavigationState();
}

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
        state.recoveryRecordId = remembered.id;
        state.currentStep = Math.max(0, Math.min(Number(nav.currentStep || remembered.currentStep || 0), STEPS.length - 1));
        state.route = 'home';
      } else if (nav?.route === 'detail' && remembered) {
        state.current = structuredClone(remembered);
        state.route = 'detail';
      } else {
        state.route = 'home';
      }
    } else {
      state.route = 'login';
    }
    state.launchIntent = parseLaunchIntent();
    updateHeader();
    updateInstallButton();
    await render();
    updateConnectivityUi();
    if (state.operator) { scheduleLazyModules(); await offerDraftRecovery(); await handleLaunchIntent(); }
    if (navigator.onLine && apiConfigured()) {
      const pendingOperator = (() => { try { return JSON.parse(storageGet(PENDING_LOGIN_KEY) || 'null'); } catch { return null; } })();
      registerOperatorAccess(pendingOperator || state.operator);
      scheduleSyncRetry();
      setTimeout(()=>processSyncQueue().catch(error=>logClientError('init-sync',error)),1200);
    }
  } catch (error) {
    console.error(error);
    app.innerHTML = `<div class="notice danger"><strong>Não foi possível abrir o armazenamento local.</strong><br>${escapeHtml(error.message || 'Verifique o IndexedDB e, se a criptografia estiver ativa, confirme a senha.')}</div>`;
  }
}

init();
