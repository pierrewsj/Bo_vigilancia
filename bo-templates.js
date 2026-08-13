'use strict';

// Biblioteca de roteiros operacionais do BO Digital GSP.
// Cada referência define quais cadastros são relevantes e quais perguntas devem ser feitas no local.
// Níveis: required = indispensável; recommended = recomendado; hidden = não exibir no fluxo padrão.
window.BO_TEMPLATE_LIBRARY = Object.freeze({
  'Tentativa de acesso não autorizado': {
    entities:{people:'required',witnesses:'recommended',vehicles:'recommended',materials:'hidden'}, evidence:'recommended',
    guidance:'Identifique quem tentou acessar, qual acesso foi pretendido, se havia autorização válida e qual providência foi adotada.',
    questions:[
      {id:'tipoAcesso',label:'Qual tipo de acesso foi pretendido?',type:'select',required:true,options:['Entrada de pessoa','Saída de pessoa','Entrada de veículo','Saída de veículo','Acesso a área interna/restrita','Outro']},
      {id:'motivoAlegado',label:'Qual foi o motivo alegado para o acesso?',type:'textarea',required:true,placeholder:'Registre de forma objetiva o motivo informado pela pessoa/condutor.'},
      {id:'credencial',label:'Havia credencial, crachá ou documento de acesso?',type:'select',required:true,options:['Sim, válido','Sim, porém inválido/divergente','Não','Não foi possível confirmar']},
      {id:'autorizacao',label:'Havia autorização válida para o acesso?',type:'select',required:true,options:['Sim','Não','Autorização pendente de confirmação','Não foi possível confirmar']},
      {id:'responsavelConsultado',label:'Responsável ou área consultada para confirmação',type:'text',recommended:true,placeholder:'Nome, setor ou função do responsável consultado.'},
      {id:'acessoOcorreu',label:'O acesso chegou a ocorrer?',type:'select',required:true,options:['Não, acesso impedido','Sim, antes da constatação','Sim, após autorização posterior','Não se aplica']},
      {id:'circunstancia',label:'Descreva a circunstância observada no ponto de acesso',type:'textarea',required:true,placeholder:'Informe como a situação foi identificada, sem conclusões não confirmadas.'}
    ]
  },
  'Divergência de autorização ou credencial': {
    entities:{people:'required',witnesses:'recommended',vehicles:'recommended',materials:'hidden'}, evidence:'recommended',
    guidance:'Registre a divergência de forma rastreável, indicando o documento apresentado, a inconsistência e a validação realizada.',
    questions:[
      {id:'tipoCredencial',label:'Documento/credencial apresentado',type:'select',required:true,options:['Crachá funcional','Credencial de terceiro','Credencial de visitante','Autorização eletrônica','Lista/cadastro de acesso','Documento pessoal','Outro']},
      {id:'identificacaoCredencial',label:'Número ou identificação da credencial/documento',type:'text',recommended:true,placeholder:'Informe número, código ou outra identificação disponível.'},
      {id:'tipoDivergencia',label:'Qual divergência foi constatada?',type:'select',required:true,options:['Validade expirada','Titularidade divergente','Cadastro inexistente','Foto/dados divergentes','Horário/local não autorizado','Documento incompleto','Outra divergência']},
      {id:'validacaoRealizada',label:'Como a autorização foi validada?',type:'textarea',required:true,placeholder:'Informe sistema, responsável ou área consultada.'},
      {id:'resultadoValidacao',label:'Resultado da validação',type:'select',required:true,options:['Acesso autorizado após confirmação','Acesso negado','Credencial recolhida/bloqueada','Orientação e regularização','Aguardando definição']},
      {id:'destinoCredencial',label:'Destino dado à credencial/documento',type:'select',recommended:true,options:['Devolvido ao portador','Recolhido pela Segurança','Entregue ao responsável','Bloqueado/cancelado','Não se aplica']}
    ]
  },
  'Acesso fora do horário autorizado': {
    entities:{people:'required',witnesses:'recommended',vehicles:'recommended',materials:'hidden'}, evidence:'recommended',
    guidance:'Compare o horário constatado com a autorização existente e registre quem autorizou eventual exceção.',
    questions:[
      {id:'movimento',label:'Movimento identificado',type:'select',required:true,options:['Entrada','Saída']},
      {id:'horarioConstatado',label:'Horário efetivamente constatado',type:'time',required:true},
      {id:'horarioAutorizado',label:'Horário/faixa autorizada',type:'text',required:true,placeholder:'Ex.: 07:00 às 17:00 ou “não havia autorização”.'},
      {id:'justificativa',label:'Justificativa apresentada',type:'textarea',required:true,placeholder:'Registre a justificativa exatamente de forma objetiva.'},
      {id:'responsavelConsultado',label:'Responsável/área consultada',type:'text',recommended:true},
      {id:'autorizacaoExcepcional',label:'Houve autorização excepcional?',type:'select',required:true,options:['Sim','Não','Não foi possível confirmar']},
      {id:'resultado',label:'Resultado do atendimento',type:'select',required:true,options:['Entrada/saída autorizada','Entrada/saída negada','Aguardou regularização','Outro desfecho']}
    ]
  },
  'Pessoa ou veículo em área de acesso restrito': {
    entities:{people:'required',witnesses:'recommended',vehicles:'recommended',materials:'hidden'}, evidence:'recommended',
    guidance:'Identifique o ocupante/veículo, a área restrita, a autorização existente e como ocorreu o acesso.',
    questions:[
      {id:'elemento',label:'O que foi localizado em área restrita?',type:'select',required:true,options:['Pessoa','Veículo','Pessoa e veículo']},
      {id:'areaRestrita',label:'Área restrita onde foi localizado',type:'text',required:true},
      {id:'motivoPermanencia',label:'Motivo informado para permanência/circulação',type:'textarea',required:true},
      {id:'autorizacao',label:'Possuía autorização para permanecer/circular no local?',type:'select',required:true,options:['Sim','Não','Autorização divergente','Não foi possível confirmar']},
      {id:'formaAcesso',label:'Como ocorreu o acesso à área?',type:'textarea',recommended:true,placeholder:'Registre portão, passagem, acompanhamento ou outra forma conhecida.'},
      {id:'responsavelArea',label:'Responsável pela área comunicado',type:'text',recommended:true},
      {id:'saidaArea',label:'A pessoa/veículo deixou a área após orientação?',type:'select',required:true,options:['Sim','Não','Não se aplica']}
    ]
  },
  'Outra ocorrência de acesso ou credenciamento': {
    entities:{people:'required',witnesses:'recommended',vehicles:'recommended',materials:'hidden'}, evidence:'recommended',
    guidance:'Classifique objetivamente o fato, identifique o acesso envolvido, a autorização e o desfecho.',
    questions:[
      {id:'situacao',label:'Descreva objetivamente a situação de acesso/credenciamento',type:'textarea',required:true},
      {id:'pontoAcesso',label:'Ponto de acesso envolvido',type:'text',required:true},
      {id:'autorizacao',label:'Situação da autorização',type:'select',required:true,options:['Regular','Irregular','Inexistente','Não foi possível confirmar','Não se aplica']},
      {id:'responsavelConsultado',label:'Responsável/área consultada',type:'text',recommended:true},
      {id:'resultado',label:'Resultado após atuação da Segurança',type:'textarea',required:true}
    ]
  },

  'Acidente ou colisão envolvendo veículo': {
    entities:{people:'required',witnesses:'recommended',vehicles:'required',materials:'hidden'}, evidence:'required',
    guidance:'Preserve a sequência dos fatos: veículos/condutores, dinâmica, posição, danos, vítimas, testemunhas e providências.',
    questions:[
      {id:'tipoAcidente',label:'Tipo de ocorrência viária',type:'select',required:true,options:['Colisão entre veículos','Abalroamento lateral entre veículos','Choque contra objeto/estrutura','Atropelamento','Tombamento/capotamento','Queda de carga com impacto viário','Outro']},
      {id:'dinamica',label:'Descreva a dinâmica do acidente conforme fatos observados e relatos',type:'textarea',required:true,placeholder:'Separe o que foi observado do que foi informado pelos envolvidos.'},
      {id:'posicaoVeiculos',label:'Os veículos foram movimentados antes do registro?',type:'select',required:true,options:['Não','Sim','Não foi possível confirmar','Não se aplica']},
      {id:'danosVisiveis',label:'Descreva os danos visíveis',type:'textarea',required:true,placeholder:'Informe partes atingidas sem estimar tecnicamente o dano.'},
      {id:'vitimas',label:'Houve vítima ou pessoa lesionada?',type:'select',required:true,options:['Não','Sim','Não foi possível confirmar']},
      {id:'atendimentoMedico',label:'Houve atendimento médico?',type:'select',required:true,options:['Não necessário','Sim, ambulatório interno','Sim, atendimento externo','Recusado pelo envolvido','Aguardando atendimento','Não foi possível confirmar']},
      {id:'sinalizacaoLocal',label:'Condição/sinalização relevante do local',type:'textarea',recommended:true,placeholder:'Iluminação, sinalização, piso, visibilidade ou outra condição observável.'},
      {id:'destinoVeiculos',label:'Destino/condição dos veículos após o atendimento',type:'textarea',required:true}
    ]
  },
  'Avaria constatada em veículo': {
    entities:{people:'required',witnesses:'recommended',vehicles:'required',materials:'hidden'}, evidence:'required',
    guidance:'Documente o veículo e a avaria exatamente como encontrada, sem atribuir causa sem evidência.',
    questions:[
      {id:'momentoConstatacao',label:'Quando a avaria foi percebida?',type:'select',required:true,options:['Na entrada da unidade','Durante permanência na unidade','Na saída da unidade','Após movimentação interna','Outro momento']},
      {id:'parteDanificada',label:'Parte(s) do veículo danificada(s)',type:'text',required:true,placeholder:'Ex.: para-choque dianteiro, lateral direita, retrovisor.'},
      {id:'descricaoDano',label:'Descrição objetiva da avaria',type:'textarea',required:true},
      {id:'causa',label:'Há causa conhecida ou indício verificável?',type:'select',required:true,options:['Não identificada','Relatada pelo condutor','Constatada por evidência no local','Relacionada a outra ocorrência registrada','Não foi possível confirmar']},
      {id:'causaDetalhe',label:'Detalhe da causa/relato, quando existente',type:'textarea',recommended:true},
      {id:'condutorDeclaracao',label:'Declaração relevante do condutor/responsável',type:'textarea',recommended:true},
      {id:'condicaoFinal',label:'Condição do veículo ao término do atendimento',type:'textarea',required:true}
    ]
  },
  'Veículo apresentado com dano preexistente': {
    entities:{people:'required',witnesses:'recommended',vehicles:'required',materials:'hidden'}, evidence:'required',
    guidance:'O objetivo é registrar que a avaria já estava presente na chegada. Identifique veículo, condutor, danos preexistentes e evidências.',
    questions:[
      {id:'portariaEntrada',label:'Portaria/ponto de entrada',type:'text',required:true},
      {id:'momentoConstatacao',label:'Momento da constatação',type:'select',required:true,options:['Antes de ingressar na unidade','Durante inspeção na portaria','Imediatamente após a entrada','Outro']},
      {id:'localizacaoDano',label:'Localização da avaria no veículo',type:'text',required:true},
      {id:'descricaoDano',label:'Descrição objetiva dos danos preexistentes',type:'textarea',required:true},
      {id:'condutorCiente',label:'O condutor foi cientificado do registro?',type:'select',required:true,options:['Sim','Não','Condutor não localizado','Não se aplica']},
      {id:'declaracaoCondutor',label:'Declaração do condutor, quando houver',type:'textarea',recommended:true},
      {id:'responsavelComunicado',label:'Responsável/área comunicada',type:'text',recommended:true}
    ]
  },
  'Estacionamento ou circulação em desacordo com as normas': {
    entities:{people:'recommended',witnesses:'hidden',vehicles:'required',materials:'hidden'}, evidence:'recommended',
    guidance:'Registre a situação viária em desacordo com o procedimento, a localização, a orientação realizada e o resultado.',
    questions:[
      {id:'tipoIrregularidade',label:'Tipo de irregularidade',type:'select',required:true,options:['Estacionamento em local proibido','Bloqueio de acesso/rota','Circulação em sentido/rota indevida','Velocidade ou manobra em desacordo com sinalização/procedimento','Parada em área operacional','Outra irregularidade']},
      {id:'localExato',label:'Posição/local exato do veículo',type:'text',required:true},
      {id:'sinalizacao',label:'Havia sinalização/orientação aplicável no local?',type:'select',required:true,options:['Sim','Não','Não foi possível confirmar']},
      {id:'condutorLocalizado',label:'O condutor foi localizado?',type:'select',required:true,options:['Sim','Não','Não se aplica']},
      {id:'orientacao',label:'Orientação realizada pela Segurança',type:'textarea',required:true},
      {id:'acatamento',label:'A orientação foi atendida?',type:'select',required:true,options:['Sim','Não','Parcialmente','Condutor não localizado']},
      {id:'reincidencia',label:'Há registro conhecido de reincidência?',type:'select',recommended:true,options:['Não identificado','Sim','Não foi verificado']}
    ]
  },
  'Remoção ou transporte de veículo por reboque': {
    entities:{people:'required',witnesses:'hidden',vehicles:'required',materials:'hidden'}, evidence:'required',
    guidance:'Documente autorização, empresa de reboque, condição do veículo, origem, destino e evidências antes da remoção.',
    questions:[
      {id:'motivoRemocao',label:'Motivo da remoção/reboque',type:'textarea',required:true},
      {id:'autorizador',label:'Quem solicitou/autorizou a remoção?',type:'text',required:true},
      {id:'empresaReboque',label:'Empresa responsável pelo reboque',type:'text',required:true},
      {id:'operadorReboque',label:'Condutor/operador do reboque',type:'text',recommended:true},
      {id:'origem',label:'Local de origem da remoção',type:'text',required:true},
      {id:'destino',label:'Destino informado',type:'text',required:true},
      {id:'condicaoPrevia',label:'Condição aparente do veículo antes da remoção',type:'textarea',required:true},
      {id:'horarioSaida',label:'Horário da retirada',type:'time',required:true}
    ]
  },
  'Veículo não identificado ou em situação suspeita': {
    entities:{people:'recommended',witnesses:'recommended',vehicles:'required',materials:'hidden'}, evidence:'required',
    guidance:'Registre somente características observáveis, localização, comportamento e verificações realizadas.',
    questions:[
      {id:'motivoSuspeita',label:'Qual fato objetivo motivou a abordagem/verificação?',type:'textarea',required:true},
      {id:'localizacao',label:'Localização e sentido de deslocamento',type:'text',required:true},
      {id:'caracteristicas',label:'Características observáveis do veículo',type:'textarea',required:true,placeholder:'Cor, tipo, adesivos, avarias, carga aparente ou outra característica.'},
      {id:'ocupantes',label:'Ocupantes identificados?',type:'select',required:true,options:['Sim','Não','Veículo sem ocupantes','Não foi possível abordar']},
      {id:'verificacao',label:'Verificações realizadas',type:'textarea',required:true},
      {id:'resultado',label:'Resultado da verificação',type:'select',required:true,options:['Situação regularizada/esclarecida','Acesso impedido','Veículo retirado do local','Acionada liderança/autoridade','Permaneceu em observação','Outro']}
    ]
  },
  'Outra ocorrência envolvendo veículos ou circulação': {
    entities:{people:'recommended',witnesses:'recommended',vehicles:'required',materials:'hidden'}, evidence:'recommended',
    guidance:'Descreva o fato viário de forma objetiva, identificando veículo, condutor quando possível, local e providência.',
    questions:[
      {id:'situacao',label:'Descrição objetiva da situação envolvendo o veículo',type:'textarea',required:true},
      {id:'condicaoLocal',label:'Condição relevante do local',type:'textarea',recommended:true},
      {id:'condutorIdentificado',label:'Condutor identificado?',type:'select',required:true,options:['Sim','Não','Não se aplica']},
      {id:'risco',label:'Havia risco imediato para pessoas, veículos ou operação?',type:'select',required:true,options:['Não','Sim','Não foi possível avaliar']},
      {id:'resultado',label:'Resultado da atuação da Segurança',type:'textarea',required:true}
    ]
  },

  'Avaria em material, peça, equipamento ou vasilhame': {
    entities:{people:'recommended',witnesses:'recommended',vehicles:'recommended',materials:'required'}, evidence:'required',
    guidance:'Identifique o item, quantidade, condição, dano, responsável, origem/destino quando aplicável e evidências.',
    questions:[
      {id:'tipoItem',label:'Tipo de item avariado',type:'select',required:true,options:['Peça','Equipamento','Vasilhame/embalagem','Componente','Ferramenta','Outro']},
      {id:'tipoDano',label:'Tipo de dano constatado',type:'text',required:true},
      {id:'extensao',label:'Descrição da extensão aparente da avaria',type:'textarea',required:true},
      {id:'embalagem',label:'Condição da embalagem/vasilhame',type:'select',recommended:true,options:['Íntegra','Danificada','Violada','Não havia embalagem','Não se aplica']},
      {id:'momento',label:'Momento/local em que a avaria foi constatada',type:'textarea',required:true},
      {id:'causa',label:'Há causa conhecida ou indício verificável?',type:'select',required:true,options:['Não identificada','Relacionada a manuseio/movimentação','Relacionada a transporte','Relatada por terceiro','Outra','Não foi possível confirmar']},
      {id:'responsavelMaterial',label:'Responsável/setor pelo item',type:'text',recommended:true}
    ]
  },
  'Divergência de carga, quantidade ou documentação': {
    entities:{people:'required',witnesses:'recommended',vehicles:'required',materials:'required'}, evidence:'recommended',
    guidance:'Confronte documento e constatação física. Registre quantidade prevista, encontrada, divergência, lacre e decisão tomada.',
    questions:[
      {id:'tipoDivergencia',label:'Natureza da divergência',type:'select',required:true,options:['Quantidade','Identificação do material','MVM/nota fiscal/documento','Lacre','Origem/destino','Condição da carga','Outra']},
      {id:'documento',label:'Documento de referência, quando existente',type:'text',recommended:true,placeholder:'MVM, NF, romaneio ou outro documento aplicável.' ,help:'MVM é específico para operações de movimentação em que esse documento exista; não informe número inexistente.'},
      {id:'quantidadePrevista',label:'Quantidade prevista/documentada',type:'number',recommended:true},
      {id:'quantidadeConstatada',label:'Quantidade constatada',type:'number',recommended:true},
      {id:'lacre',label:'Condição do lacre',type:'select',recommended:true,options:['Íntegro e correspondente','Íntegro com numeração divergente','Violado/rompido','Sem lacre','Não se aplica']},
      {id:'divergenciaDescricao',label:'Descreva objetivamente a divergência encontrada',type:'textarea',required:true},
      {id:'responsavelConferencia',label:'Responsável pela conferência/validação',type:'text',required:true},
      {id:'decisao',label:'Decisão adotada para a carga',type:'textarea',required:true,placeholder:'Liberada, retida, devolvida, aguardando ajuste documental etc.'}
    ]
  },
  'Suspeita de subtração de material em área interna': {
    entities:{people:'recommended',witnesses:'recommended',vehicles:'recommended',materials:'required'}, evidence:'recommended',
    guidance:'Diferencie relato de constatação. Registre o item, último local/horário conhecido, controle de acesso, buscas e indícios.',
    questions:[
      {id:'constatacao',label:'Como a ausência do material foi percebida?',type:'textarea',required:true},
      {id:'ultimaLocalizacao',label:'Última localização conhecida do material',type:'text',required:true},
      {id:'ultimaVisualizacao',label:'Data/horário aproximado em que foi visto pela última vez',type:'text',required:true},
      {id:'armazenamento',label:'Como o material estava armazenado/protegido?',type:'textarea',required:true},
      {id:'acessoLocal',label:'Quem possuía acesso autorizado ao local?',type:'textarea',recommended:true},
      {id:'buscaRealizada',label:'Buscas/verificações realizadas pela equipe',type:'textarea',required:true},
      {id:'cameras',label:'Há câmeras que possam contribuir para apuração?',type:'select',recommended:true,options:['Sim','Não','Não foi verificado','Não se aplica']},
      {id:'indicios',label:'Foram encontrados indícios materiais que possam sugerir subtração?',type:'select',required:true,options:['Não','Sim','Não foi possível confirmar']},
      {id:'indiciosDetalhe',label:'Detalhe dos indícios, quando existentes',type:'textarea',recommended:true}
    ]
  },
  'Suspeita de subtração de material em área externa': {
    entities:{people:'recommended',witnesses:'recommended',vehicles:'recommended',materials:'required'}, evidence:'recommended',
    guidance:'Registre o vínculo da área externa com a unidade, condições do local, último controle conhecido, buscas e indícios.',
    questions:[
      {id:'areaExterna',label:'Identifique precisamente a área externa',type:'text',required:true},
      {id:'constatacao',label:'Como a ausência do material foi percebida?',type:'textarea',required:true},
      {id:'ultimaLocalizacao',label:'Última localização conhecida do material',type:'text',required:true},
      {id:'ultimaVisualizacao',label:'Data/horário aproximado da última visualização',type:'text',required:true},
      {id:'condicaoLocal',label:'Condição de cercamento, acesso, iluminação ou proteção do local',type:'textarea',required:true},
      {id:'buscaRealizada',label:'Buscas/verificações realizadas',type:'textarea',required:true},
      {id:'cameras',label:'Há câmeras na região?',type:'select',recommended:true,options:['Sim','Não','Não foi verificado']},
      {id:'indicios',label:'Foram encontrados indícios que possam sugerir subtração?',type:'select',required:true,options:['Não','Sim','Não foi possível confirmar']},
      {id:'autoridade',label:'Houve acionamento de autoridade/apoio externo?',type:'select',recommended:true,options:['Não','Sim','Aguardando definição']}
    ]
  },
  'Desaparecimento de material ou equipamento': {
    entities:{people:'recommended',witnesses:'recommended',vehicles:'recommended',materials:'required'}, evidence:'recommended',
    guidance:'Não classifique automaticamente o desaparecimento como subtração. Registre último paradeiro, movimentações conhecidas, buscas realizadas e eventual existência de indícios objetivos.',
    questions:[
      {id:'constatacao',label:'Como o desaparecimento foi constatado?',type:'textarea',required:true},
      {id:'ultimaLocalizacao',label:'Última localização conhecida',type:'text',required:true},
      {id:'ultimaVisualizacao',label:'Última data/horário em que o item foi visto',type:'text',required:true},
      {id:'ultimoResponsavel',label:'Último responsável/usuário conhecido',type:'text',recommended:true},
      {id:'movimentacoes',label:'Movimentações conhecidas antes do desaparecimento',type:'textarea',recommended:true},
      {id:'locaisVerificados',label:'Locais verificados durante a busca',type:'textarea',required:true},
      {id:'resultadoBusca',label:'Resultado das buscas',type:'textarea',required:true},
      {id:'indiciosSubtracao',label:'Há indícios objetivos que possam sugerir subtração?',type:'select',required:true,options:['Não identificados','Sim','Não foi possível avaliar']},
      {id:'controleAcesso',label:'Havia controle de acesso/custódia do item?',type:'select',recommended:true,options:['Sim','Não','Parcial','Não foi possível confirmar']}
    ]
  },
  'Material ou equipamento localizado/recolhido': {
    entities:{people:'recommended',witnesses:'hidden',vehicles:'recommended',materials:'required'}, evidence:'recommended',
    guidance:'Registre origem da localização, condição do item e cadeia de custódia até a entrega/armazenamento.',
    questions:[
      {id:'localEncontrado',label:'Local exato onde o item foi encontrado',type:'text',required:true},
      {id:'quemEncontrou',label:'Quem localizou/entregou o item?',type:'text',required:true},
      {id:'condicao',label:'Condição aparente do item no recolhimento',type:'textarea',required:true},
      {id:'identificacaoDisponivel',label:'Havia identificação do proprietário/responsável?',type:'select',required:true,options:['Sim','Não','Parcial']},
      {id:'proprietario',label:'Possível proprietário/responsável identificado',type:'text',recommended:true},
      {id:'motivoRecolhimento',label:'Motivo do recolhimento pela Segurança',type:'textarea',required:true},
      {id:'custodia',label:'Onde e com quem o item ficou sob custódia?',type:'textarea',required:true},
      {id:'entregaPosterior',label:'Houve entrega posterior ao responsável?',type:'select',required:true,options:['Não, permanece sob custódia','Sim','Não se aplica']}
    ]
  },
  'Liberação ou conferência de carga': {
    entities:{people:'required',witnesses:'hidden',vehicles:'required',materials:'required'}, evidence:'recommended',
    guidance:'Registre documento, carga, veículo, motorista, lacre, resultado da conferência e responsável pela liberação.',
    questions:[
      {id:'operacao',label:'Tipo de operação',type:'select',required:true,options:['Entrada de carga','Saída de carga','Transferência interna','Conferência extraordinária','Acompanhamento de carga']},
      {id:'origem',label:'Origem da carga',type:'text',required:true},
      {id:'destino',label:'Destino da carga',type:'text',required:true},
      {id:'documento',label:'Documento de referência (MVM/NF/romaneio)',type:'text',required:true},
      {id:'lacre',label:'Condição do lacre',type:'select',recommended:true,options:['Íntegro e correspondente','Íntegro com divergência','Violado','Sem lacre','Não se aplica']},
      {id:'condicaoCarga',label:'Condição aparente da carga',type:'select',required:true,options:['Regular','Com avaria aparente','Com divergência','Não foi possível verificar']},
      {id:'resultadoConferencia',label:'Resultado da conferência',type:'textarea',required:true},
      {id:'responsavelLiberacao',label:'Responsável pela liberação/decisão',type:'text',required:true},
      {id:'horarioLiberacao',label:'Horário da liberação/encerramento da conferência',type:'time',recommended:true}
    ]
  },
  'Outra ocorrência envolvendo materiais, peças ou cargas': {
    entities:{people:'recommended',witnesses:'recommended',vehicles:'recommended',materials:'required'}, evidence:'recommended',
    guidance:'Identifique o material/carga, quantidade, responsável, documentação e a situação encontrada.',
    questions:[
      {id:'situacao',label:'Descrição objetiva da situação envolvendo material/peça/carga',type:'textarea',required:true},
      {id:'origem',label:'Origem conhecida',type:'text',recommended:true},
      {id:'destino',label:'Destino previsto',type:'text',recommended:true},
      {id:'documentacao',label:'Documentação relacionada',type:'text',recommended:true},
      {id:'condicao',label:'Condição do material/carga',type:'textarea',required:true},
      {id:'responsavel',label:'Responsável/setor pelo material',type:'text',required:true}
    ]
  },

  'Agressão física ou confronto entre pessoas': {
    entities:{people:'required',witnesses:'recommended',vehicles:'hidden',materials:'hidden'}, evidence:'recommended',
    guidance:'Registre participantes, fatos observados/relatados, lesões aparentes sem diagnóstico, testemunhas, atendimento e medidas de segurança.',
    questions:[
      {id:'dinamica',label:'Descreva a dinâmica do fato separando observação e relato',type:'textarea',required:true},
      {id:'contatoFisico',label:'Tipo de contato físico relatado/observado',type:'textarea',required:true},
      {id:'lesaoAparente',label:'Havia lesão aparente?',type:'select',required:true,options:['Não observada','Sim, aparente','Não foi possível verificar']},
      {id:'lesaoDescricao',label:'Descrição objetiva de sinais/lesões aparentes',type:'textarea',recommended:true,placeholder:'Não emitir diagnóstico; registrar somente o que é observável.'},
      {id:'atendimentoMedico',label:'Houve atendimento médico?',type:'select',required:true,options:['Não necessário','Sim','Recusado','Aguardando','Não foi possível confirmar']},
      {id:'separacao',label:'Foi necessário separar/afastar os envolvidos?',type:'select',required:true,options:['Não','Sim','Já estavam separados']},
      {id:'lideranca',label:'Liderança/RH/área responsável acionada',type:'text',recommended:true}
    ]
  },
  'Ameaça, ofensa ou conflito interpessoal': {
    entities:{people:'required',witnesses:'recommended',vehicles:'hidden',materials:'hidden'}, evidence:'recommended',
    guidance:'Registre palavras/condutas relevantes com objetividade, evitando qualificações pessoais. Diferencie relato de constatação.',
    questions:[
      {id:'tipoConflito',label:'Natureza do conflito',type:'select',required:true,options:['Discussão verbal','Ameaça relatada','Ofensa verbal','Constrangimento/intimidação','Conflito sem agressão física','Outro']},
      {id:'dinamica',label:'Descreva como o conflito ocorreu',type:'textarea',required:true},
      {id:'ameaca',label:'Houve ameaça?',type:'select',required:true,options:['Não','Sim, relatada','Sim, presenciada','Não foi possível confirmar']},
      {id:'conteudoRelevante',label:'Conteúdo relevante relatado/presenciado',type:'textarea',recommended:true,placeholder:'Registrar apenas o necessário para compreensão do fato.'},
      {id:'agressaoFisica',label:'Houve agressão física?',type:'select',required:true,options:['Não','Sim','Não foi possível confirmar']},
      {id:'situacaoControlada',label:'A situação foi controlada no local?',type:'select',required:true,options:['Sim','Não','Parcialmente']},
      {id:'areaAcionada',label:'Liderança/RH/área acionada',type:'text',recommended:true}
    ]
  },
  'Descumprimento de norma ou procedimento interno': {
    entities:{people:'required',witnesses:'recommended',vehicles:'recommended',materials:'recommended'}, evidence:'recommended',
    guidance:'Registre a norma/orientação aplicável, a conduta observada, a orientação prestada e o resultado, sem juízo disciplinar.',
    questions:[
      {id:'norma',label:'Norma, regra ou orientação relacionada',type:'text',required:true},
      {id:'conduta',label:'Conduta objetivamente observada',type:'textarea',required:true},
      {id:'orientacaoPrevia',label:'A pessoa havia sido orientada anteriormente sobre o procedimento?',type:'select',recommended:true,options:['Sim','Não','Não foi possível confirmar']},
      {id:'orientacaoAtual',label:'Orientação realizada no atendimento',type:'textarea',required:true},
      {id:'acatamento',label:'A orientação foi acatada?',type:'select',required:true,options:['Sim','Não','Parcialmente']},
      {id:'responsavelAcionado',label:'Responsável/liderança acionada',type:'text',recommended:true},
      {id:'impacto',label:'Houve impacto ou risco decorrente da conduta?',type:'textarea',recommended:true}
    ]
  },
  'Alteração comportamental observada': {
    entities:{people:'required',witnesses:'recommended',vehicles:'recommended',materials:'hidden'}, evidence:'recommended',
    guidance:'Registre somente sinais físicos e comportamentais observáveis. Não atribua causa, diagnóstico ou consumo de álcool/substâncias sem confirmação. Documente medidas preventivas e encaminhamento.',
    questions:[
      {id:'sinaisObservados',label:'Quais sinais comportamentais/físicos foram observados?',type:'textarea',required:true,placeholder:'Ex.: fala arrastada, dificuldade de equilíbrio, odor semelhante ao de bebida alcoólica, agitação. Descreva apenas o que foi observado.'},
      {id:'contexto',label:'Contexto em que os sinais foram percebidos',type:'textarea',required:true},
      {id:'atividadeRisco',label:'A pessoa estava conduzindo veículo/equipamento ou em atividade de risco?',type:'select',required:true,options:['Não','Sim','Não foi possível confirmar']},
      {id:'afastamento',label:'Foi adotada medida preventiva de afastamento da atividade/risco?',type:'select',required:true,options:['Não','Sim','Não se aplica']},
      {id:'atendimento',label:'Houve encaminhamento médico/ambulatório?',type:'select',required:true,options:['Não','Sim','Recusado','Aguardando']},
      {id:'lideranca',label:'Liderança/RH/área responsável acionada',type:'text',required:true},
      {id:'desfechoPessoa',label:'Condição/destino da pessoa ao final',type:'textarea',required:true}
    ]
  },
  'Mal-estar, atendimento médico ou acidente pessoal': {
    entities:{people:'required',witnesses:'recommended',vehicles:'recommended',materials:'recommended'}, evidence:'recommended',
    guidance:'Registre fatos e sinais observáveis, sem diagnóstico. Priorize atendimento, local, pessoa, circunstâncias e encaminhamento.',
    questions:[
      {id:'tipoOcorrencia',label:'Natureza aparente do atendimento',type:'select',required:true,options:['Mal-estar','Queda','Lesão durante atividade','Acidente pessoal','Desmaio/perda de consciência relatada','Outro']},
      {id:'circunstancia',label:'Circunstâncias em que ocorreu',type:'textarea',required:true},
      {id:'sinaisObservados',label:'Sinais/condição observável da pessoa',type:'textarea',required:true,placeholder:'Não emitir diagnóstico clínico.'},
      {id:'ambulancia',label:'Atendimento acionado',type:'select',required:true,options:['Ambulatório interno','SAMU/ambulância externa','Bombeiros','Primeiros socorros no local','Não necessário/recusado','Outro']},
      {id:'horarioAtendimento',label:'Horário aproximado do atendimento inicial',type:'time',recommended:true},
      {id:'encaminhamento',label:'Encaminhamento/destino da pessoa',type:'textarea',required:true},
      {id:'atividadeRelacionada',label:'Havia atividade/equipamento/material relacionado ao fato?',type:'select',recommended:true,options:['Não','Sim','Não foi possível confirmar']}
    ]
  },
  'Outra ocorrência envolvendo pessoas ou comportamento': {
    entities:{people:'required',witnesses:'recommended',vehicles:'recommended',materials:'recommended'}, evidence:'recommended',
    guidance:'Descreva a conduta/fato de forma objetiva, identifique envolvidos e registre a intervenção e o desfecho.',
    questions:[
      {id:'situacao',label:'Descrição objetiva da situação envolvendo pessoa(s)',type:'textarea',required:true},
      {id:'condutaObservada',label:'Conduta efetivamente observada pela Segurança',type:'textarea',required:true},
      {id:'relatoTerceiros',label:'Informações relevantes relatadas por terceiros',type:'textarea',recommended:true},
      {id:'risco',label:'Havia risco imediato?',type:'select',required:true,options:['Não','Sim','Não foi possível avaliar']},
      {id:'areaAcionada',label:'Liderança/RH/área acionada',type:'text',recommended:true},
      {id:'resultado',label:'Resultado da intervenção',type:'textarea',required:true}
    ]
  },

  'Dano em instalação, equipamento ou patrimônio': {
    entities:{people:'recommended',witnesses:'recommended',vehicles:'recommended',materials:'recommended'}, evidence:'required',
    guidance:'Identifique o bem, localização, dano aparente, circunstâncias, possíveis riscos e isolamento/reparo solicitado.',
    questions:[
      {id:'bemDanificado',label:'Instalação/equipamento/bem atingido',type:'text',required:true},
      {id:'tipoDano',label:'Tipo de dano aparente',type:'select',required:true,options:['Quebrado','Amassado','Arranhado','Riscado','Trincado','Deformado','Solto','Empenado','Furado','Descascado','Estourado','Múltiplos tipos','Outro']},
      {id:'descricao',label:'Descrição objetiva da extensão aparente',type:'textarea',required:true},
      {id:'causa',label:'Há causa conhecida ou indício verificável?',type:'select',required:true,options:['Não identificada','Acidental','Relacionada a veículo/equipamento','Ação intencional suspeita','Falha operacional','Outra','Não foi possível confirmar']},
      {id:'risco',label:'O dano gerou risco imediato?',type:'select',required:true,options:['Não','Sim','Não foi possível avaliar']},
      {id:'isolamento',label:'Foi necessário isolar/interditar o local?',type:'select',required:true,options:['Não','Sim','Parcialmente']},
      {id:'manutencao',label:'Manutenção/área responsável acionada',type:'text',required:true},
      {id:'condicaoFinal',label:'Condição do local/bem ao final',type:'textarea',required:true}
    ]
  },
  'Incêndio ou princípio de incêndio': {
    entities:{people:'recommended',witnesses:'recommended',vehicles:'recommended',materials:'recommended'}, evidence:'required',
    guidance:'Priorize segurança. Registre local, material/equipamento envolvido, sinais observados, combate, brigada/bombeiros, vítimas e condição final.',
    questions:[
      {id:'classificacao',label:'Situação constatada',type:'select',required:true,options:['Princípio de incêndio','Incêndio com chamas desenvolvidas','Fumaça/odor sem chama identificada','Ocorrência já controlada na chegada']},
      {id:'foco',label:'Material/equipamento/local de origem aparente',type:'text',required:true},
      {id:'sinais',label:'Sinais observados',type:'textarea',required:true,placeholder:'Fumaça, chamas, calor, odor, faíscas etc.'},
      {id:'combateInicial',label:'Houve combate inicial?',type:'select',required:true,options:['Não','Sim, com extintor','Sim, com hidrante','Sim, por sistema automático','Outro']},
      {id:'brigada',label:'Brigada foi acionada?',type:'select',required:true,options:['Sim','Não','Não se aplica']},
      {id:'bombeiros',label:'Corpo de Bombeiros/apoio externo acionado?',type:'select',required:true,options:['Sim','Não','Não se aplica']},
      {id:'vitimas',label:'Houve pessoa ferida/exposta?',type:'select',required:true,options:['Não','Sim','Não foi possível confirmar']},
      {id:'isolamento',label:'Área isolada/evacuada?',type:'select',required:true,options:['Não','Sim, parcialmente','Sim, totalmente']},
      {id:'normalizacao',label:'Condição final e horário aproximado de normalização',type:'textarea',required:true}
    ]
  },
  'Situação de emergência operacional': {
    entities:{people:'recommended',witnesses:'recommended',vehicles:'recommended',materials:'recommended'}, evidence:'recommended',
    guidance:'Registre risco imediato, medidas de controle, áreas acionadas, pessoas expostas e condição de normalização.',
    questions:[
      {id:'natureza',label:'Natureza da emergência',type:'text',required:true},
      {id:'riscoImediato',label:'Risco imediato identificado',type:'textarea',required:true},
      {id:'pessoasExpostas',label:'Havia pessoas potencialmente expostas?',type:'select',required:true,options:['Não','Sim','Não foi possível confirmar']},
      {id:'controleInicial',label:'Medidas imediatas de controle adotadas',type:'textarea',required:true},
      {id:'areasAcionadas',label:'Áreas/equipes acionadas',type:'textarea',required:true},
      {id:'interdicao',label:'Houve isolamento/interdição?',type:'select',required:true,options:['Não','Parcial','Total']},
      {id:'normalizacao',label:'Condição final/normalização',type:'textarea',required:true}
    ]
  },
  'Falha operacional com impacto': {
    entities:{people:'recommended',witnesses:'recommended',vehicles:'recommended',materials:'recommended'}, evidence:'recommended',
    guidance:'Registre a operação, desvio constatado, impacto observável, controle imediato e área responsável, sem atribuir culpa.',
    questions:[
      {id:'atividade',label:'Atividade/processo em execução',type:'text',required:true},
      {id:'desvio',label:'Falha/desvio objetivamente constatado',type:'textarea',required:true},
      {id:'impacto',label:'Impacto ou risco decorrente',type:'textarea',required:true},
      {id:'interrupcao',label:'Houve interrupção de atividade/processo?',type:'select',required:true,options:['Não','Sim, parcial','Sim, total']},
      {id:'controle',label:'Medida imediata de controle',type:'textarea',required:true},
      {id:'responsavel',label:'Área/responsável técnico acionado',type:'text',required:true},
      {id:'condicaoFinal',label:'Condição ao final do atendimento',type:'textarea',required:true}
    ]
  },
  'Vazamento, derramamento ou ocorrência ambiental': {
    entities:{people:'recommended',witnesses:'recommended',vehicles:'recommended',materials:'recommended'}, evidence:'required',
    guidance:'Identifique substância/material quando conhecido, origem, extensão aparente, drenagem/solo atingido, contenção e área ambiental acionada.',
    questions:[
      {id:'tipo',label:'Tipo de ocorrência ambiental',type:'select',required:true,options:['Vazamento','Derramamento','Descarte irregular','Emissão/fumaça/odor','Contaminação aparente','Outro']},
      {id:'substancia',label:'Substância/material envolvido',type:'text',required:true,placeholder:'Se desconhecido, registre “não identificado”.'},
      {id:'origem',label:'Origem/fonte aparente',type:'text',required:true},
      {id:'extensao',label:'Extensão aparente da ocorrência',type:'textarea',required:true},
      {id:'drenagem',label:'Atingiu solo, drenagem ou curso d’água?',type:'select',required:true,options:['Não','Sim','Não foi possível confirmar']},
      {id:'contencao',label:'Medidas de contenção adotadas',type:'textarea',required:true},
      {id:'areaAmbiental',label:'Área ambiental/manutenção acionada',type:'text',required:true},
      {id:'condicaoFinal',label:'Condição final do local',type:'textarea',required:true}
    ]
  },
  'Outra ocorrência envolvendo instalações ou emergência': {
    entities:{people:'recommended',witnesses:'recommended',vehicles:'recommended',materials:'recommended'}, evidence:'recommended',
    guidance:'Identifique o patrimônio/local, risco, medidas de controle, áreas acionadas e condição final.',
    questions:[
      {id:'situacao',label:'Descrição objetiva da situação',type:'textarea',required:true},
      {id:'bemArea',label:'Bem/instalação/área envolvida',type:'text',required:true},
      {id:'risco',label:'Risco identificado',type:'textarea',required:true},
      {id:'controle',label:'Medidas imediatas de controle',type:'textarea',required:true},
      {id:'areaAcionada',label:'Área responsável acionada',type:'text',required:true},
      {id:'resultado',label:'Condição final',type:'textarea',required:true}
    ]
  },

  'Irregularidade constatada em ronda interna': {
    entities:{people:'recommended',witnesses:'hidden',vehicles:'recommended',materials:'recommended'}, evidence:'recommended',
    guidance:'Registre o ponto da ronda, a irregularidade/constatação, risco, orientação e normalização.',
    questions:[
      {id:'pontoRonda',label:'Ponto/trecho da ronda em que o fato foi identificado',type:'text',required:true},
      {id:'constatacao',label:'O que foi constatado?',type:'textarea',required:true},
      {id:'risco',label:'Havia risco imediato?',type:'select',required:true,options:['Não','Sim','Não foi possível avaliar']},
      {id:'responsavelLocal',label:'Pessoa/setor responsável pelo local',type:'text',recommended:true},
      {id:'orientacao',label:'Orientação/providência realizada',type:'textarea',required:true},
      {id:'normalizacao',label:'Situação normalizada?',type:'select',required:true,options:['Sim','Não','Parcialmente','Aguardando área responsável']}
    ]
  },
  'Irregularidade constatada em ronda externa': {
    entities:{people:'recommended',witnesses:'hidden',vehicles:'recommended',materials:'recommended'}, evidence:'recommended',
    guidance:'Registre perímetro/local externo, fato observado, risco, pessoas/veículos relacionados e providência.',
    questions:[
      {id:'trecho',label:'Trecho/local externo da ronda',type:'text',required:true},
      {id:'constatacao',label:'O que foi constatado?',type:'textarea',required:true},
      {id:'risco',label:'Havia risco para perímetro, patrimônio ou pessoas?',type:'select',required:true,options:['Não','Sim','Não foi possível avaliar']},
      {id:'condicaoPerimetro',label:'Condição de cercamento, iluminação, portões ou barreiras',type:'textarea',recommended:true},
      {id:'orientacao',label:'Providência/acionamento realizado',type:'textarea',required:true},
      {id:'normalizacao',label:'Condição final',type:'textarea',required:true}
    ]
  },
  'Constatação em fiscalização ou inspeção de segurança': {
    entities:{people:'recommended',witnesses:'hidden',vehicles:'recommended',materials:'recommended'}, evidence:'recommended',
    guidance:'Registre objeto da fiscalização, requisito verificado, irregularidade, responsável e prazo/ação para regularização.',
    questions:[
      {id:'objeto',label:'Objeto da fiscalização/inspeção',type:'text',required:true},
      {id:'requisito',label:'Requisito/procedimento verificado',type:'text',required:true},
      {id:'resultado',label:'Resultado da verificação',type:'select',required:true,options:['Conforme','Não conforme','Conforme com ressalva','Não foi possível verificar integralmente']},
      {id:'irregularidade',label:'Irregularidade/ressalva identificada',type:'textarea',recommended:true},
      {id:'responsavel',label:'Responsável/setor informado',type:'text',recommended:true},
      {id:'acao',label:'Orientação/ação para regularização',type:'textarea',required:true},
      {id:'prazo',label:'Prazo/retorno acordado, quando aplicável',type:'text',recommended:true}
    ]
  },
  'Não conformidade identificada em processo ou procedimento': {
    entities:{people:'recommended',witnesses:'hidden',vehicles:'recommended',materials:'recommended'}, evidence:'recommended',
    guidance:'Registre o processo ou requisito, a evidência observada, a divergência, o impacto e o encaminhamento, sem atribuir culpa individual.',
    questions:[
      {id:'processo',label:'Processo/procedimento auditado',type:'text',required:true},
      {id:'requisito',label:'Requisito esperado',type:'textarea',required:true},
      {id:'evidencia',label:'Evidência/condição observada',type:'textarea',required:true},
      {id:'divergencia',label:'Divergência identificada',type:'textarea',required:true},
      {id:'impacto',label:'Impacto/risco associado',type:'textarea',recommended:true},
      {id:'responsavel',label:'Área/responsável comunicado',type:'text',required:true},
      {id:'encaminhamento',label:'Encaminhamento definido',type:'textarea',required:true}
    ]
  },
  'Suspeita de dano intencional ou sabotagem': {
    entities:{people:'recommended',witnesses:'recommended',vehicles:'recommended',materials:'recommended'}, evidence:'required',
    guidance:'Preserve fatos e evidências. Registre somente indícios verificáveis e medidas de preservação; não afirme autoria, intenção ou sabotagem como fato confirmado sem elementos objetivos.',
    questions:[
      {id:'fato',label:'Fato/dano objetivamente constatado',type:'textarea',required:true},
      {id:'bemAtingido',label:'Bem/processo/instalação atingida',type:'text',required:true},
      {id:'indicios',label:'Quais indícios verificáveis justificam a suspeita de ação intencional?',type:'textarea',required:true},
      {id:'autoria',label:'Há informação objetiva sobre possível autoria?',type:'select',required:true,options:['Não há informação','Há identificação sustentada por evidência','Há indicação apenas por relato de terceiro','Não foi possível confirmar']},
      {id:'preservacao',label:'Medidas de preservação do local/evidências',type:'textarea',required:true},
      {id:'cameras',label:'Imagens/câmeras foram preservadas ou solicitadas?',type:'select',recommended:true,options:['Sim','Não','Não há cobertura','Aguardando solicitação']},
      {id:'lideranca',label:'Gestão/área responsável acionada',type:'text',required:true}
    ]
  },
  'Ocorrência envolvendo empresa de segurança prestadora de serviço': {
    entities:{people:'required',witnesses:'recommended',vehicles:'recommended',materials:'recommended'}, evidence:'recommended',
    guidance:'Registre equipe/empresa envolvida, atividade, desvio/fato, impactos e comunicação à supervisão.',
    questions:[
      {id:'empresa',label:'Empresa prestadora de segurança envolvida',type:'text',required:true},
      {id:'atividade',label:'Atividade/posto relacionado',type:'text',required:true},
      {id:'fato',label:'Fato ou desvio objetivamente constatado',type:'textarea',required:true},
      {id:'procedimento',label:'Procedimento esperado, quando aplicável',type:'textarea',recommended:true},
      {id:'impacto',label:'Impacto/risco identificado',type:'textarea',recommended:true},
      {id:'supervisao',label:'Supervisor/responsável comunicado',type:'text',required:true},
      {id:'encaminhamento',label:'Encaminhamento adotado',type:'textarea',required:true}
    ]
  },
  'Outra ocorrência relacionada à segurança patrimonial': {
    entities:{people:'recommended',witnesses:'recommended',vehicles:'recommended',materials:'recommended'}, evidence:'recommended',
    guidance:'Contextualize a atuação da Segurança Patrimonial, registre o fato objetivamente verificado, eventual risco, providências adotadas e condição final.',
    questions:[
      {id:'atividade',label:'Contexto da atuação da Segurança Patrimonial',type:'text',required:true,placeholder:'Ex.: atendimento a chamado, ronda, apoio a área, verificação de perímetro.'},
      {id:'constatacao',label:'O que foi objetivamente constatado pela equipe?',type:'textarea',required:true},
      {id:'risco',label:'Qual risco foi identificado, se houver?',type:'textarea',recommended:true},
      {id:'providencia',label:'Qual providência ou acionamento foi realizado?',type:'textarea',required:true},
      {id:'resultado',label:'Condição final no encerramento do atendimento',type:'textarea',required:true}
    ]
  },

  'Ocorrência não enquadrada nas categorias existentes': {
    entities:{people:'recommended',witnesses:'recommended',vehicles:'recommended',materials:'recommended'}, evidence:'recommended',
    guidance:'Use somente quando nenhuma classificação específica representar adequadamente o fato. Registre a situação de forma objetiva, os elementos relacionados, eventual risco, providências e condição final.',
    questions:[
      {id:'situacao',label:'Descreva objetivamente a situação',type:'textarea',required:true},
      {id:'elementos',label:'Quais pessoas, veículos, materiais ou instalações estão envolvidos?',type:'textarea',required:true},
      {id:'risco',label:'Risco/impacto identificado',type:'textarea',recommended:true},
      {id:'norma',label:'Há norma/procedimento relacionado?',type:'text',recommended:true},
      {id:'providencia',label:'Providência adotada',type:'textarea',required:true},
      {id:'resultado',label:'Condição final',type:'textarea',required:true}
    ]
  },
  'Outra situação relevante para registro': {
    entities:{people:'recommended',witnesses:'recommended',vehicles:'recommended',materials:'recommended'}, evidence:'recommended',
    guidance:'Descreva a natureza do registro com objetividade e inclua somente elementos efetivamente relacionados ao fato.',
    questions:[
      {id:'natureza',label:'Natureza do registro',type:'text',required:true,placeholder:'Descreva em poucas palavras o assunto principal.'},
      {id:'situacao',label:'Descrição objetiva do fato',type:'textarea',required:true},
      {id:'elementos',label:'Elementos relacionados',type:'textarea',recommended:true},
      {id:'risco',label:'Risco/impacto identificado',type:'textarea',recommended:true},
      {id:'providencia',label:'Providência adotada',type:'textarea',required:true},
      {id:'resultado',label:'Condição final',type:'textarea',required:true}
    ]
  }
});

// v35 — especializações operacionais e regras adaptativas.
// Os 41 tipos principais permanecem estáveis; estas opções refinam o roteiro sem ampliar a lista inicial.
window.BO_SUBMODEL_LIBRARY = Object.freeze({
  'Outra ocorrência de acesso ou credenciamento': [
    {id:'cracha-manual',label:'Emissão manual/provisória de crachá',origin:'Solicitação recebida',entities:{people:'required',vehicles:'hidden',materials:'hidden'},evidence:'recommended',extraQuestions:[
      {id:'motivoCrachaManual',label:'Motivo da emissão manual/provisória',type:'select',required:true,options:['Sistema de acesso indisponível','Crachá definitivo indisponível','Autorização excepcional','Outro']},
      {id:'portariaCracha',label:'Portaria/ponto de atendimento',type:'text',required:true},
      {id:'quantidadeCracha',label:'Quantidade de crachás confeccionados',type:'number',required:true}
    ]}
  ],
  'Acesso fora do horário autorizado': [
    {id:'visitante-fora-horario',label:'Saída de visitante fora do horário previsto',entities:{people:'required',vehicles:'hidden',materials:'hidden'},evidence:'recommended'}
  ],
  'Material ou equipamento localizado/recolhido': [
    {id:'notebook-revista',label:'Notebook recolhido em revista',origin:'Revista / controle de acesso',entities:{people:'required',vehicles:'hidden',materials:'required'},evidence:'recommended',documentMode:'recommended',documentTypes:['Guarda de objetos','Carta/declaração','Outro']},
    {id:'objeto-revista',label:'Objeto/equipamento recolhido em revista',origin:'Revista / controle de acesso',entities:{people:'required',vehicles:'hidden',materials:'required'},evidence:'recommended',documentMode:'recommended',documentTypes:['Guarda de objetos','Carta/declaração','Outro']},
    {id:'objeto-pessoal',label:'Objeto pessoal encontrado',entities:{people:'recommended',vehicles:'hidden',materials:'required'},evidence:'recommended'},
    {id:'celular-encontrado',label:'Celular encontrado/recolhido',entities:{people:'recommended',vehicles:'hidden',materials:'required'},evidence:'required',evidenceRequirements:[{id:'item',label:'Foto do item encontrado',type:'photo',required:true}]},
    {id:'pecas-vasilhame',label:'Peças encontradas em vasilhame',entities:{people:'recommended',vehicles:'hidden',materials:'required'},evidence:'required',evidenceRequirements:[{id:'item',label:'Foto das peças encontradas',type:'photo',required:true},{id:'vasilhame',label:'Foto do vasilhame/identificação',type:'photo',required:true}],materialPolicy:{quantityCheck:true,technicalIdCheck:true,showContainer:true}},
    {id:'geral-material-encontrado',label:'Outro material/equipamento localizado ou recolhido',entities:{people:'recommended',vehicles:'recommended',materials:'required'},evidence:'required',evidenceRequirements:[{id:'item',label:'Foto do item',type:'photo',required:true},{id:'local',label:'Foto do local onde foi encontrado',type:'photo',required:false}],materialPolicy:{quantityCheck:true,technicalIdCheck:true}}
  ],
  'Acidente ou colisão envolvendo veículo': [
    {id:'colisao',label:'Colisão entre veículos',routingAnswers:{tipoAcidente:'Colisão entre veículos'},entities:{people:'required',vehicles:'required',materials:'hidden'},evidence:'required'},
    {id:'choque',label:'Choque contra objeto/estrutura',routingAnswers:{tipoAcidente:'Choque contra objeto/estrutura'},entities:{people:'required',vehicles:'required',materials:'recommended'},evidence:'required'},
    {id:'abalroamento',label:'Abalroamento lateral',routingAnswers:{tipoAcidente:'Abalroamento lateral entre veículos'},entities:{people:'required',vehicles:'required',materials:'hidden'},evidence:'required'},
    {id:'empilhadeira-carreta',label:'Empilhadeira x carreta/veículo',routingAnswers:{tipoAcidente:'Colisão entre veículos'},entities:{people:'required',vehicles:'required',materials:'recommended'},evidence:'required',documentMode:'recommended',documentTypes:['MVM','DANFE/NF','Outro']}
  ],
  'Avaria constatada em veículo': [
    {id:'pane-caminhao',label:'Pane/falha mecânica de caminhão na planta',entities:{people:'required',vehicles:'required',materials:'hidden'},evidence:'recommended',documentMode:'recommended',documentTypes:['MVM','Ordem de carga','Outro'],extraQuestions:[
      {id:'tipoFalhaMecanica',label:'Falha mecânica constatada',type:'text',required:true},
      {id:'tempoPermanencia',label:'Tempo aproximado de permanência na planta, quando relevante',type:'text',recommended:true}
    ]}
  ],
  'Estacionamento ou circulação em desacordo com as normas': [
    {id:'estacionamento-irregular',label:'Estacionamento irregular',entities:{people:'recommended',vehicles:'required',materials:'hidden'},evidence:'recommended'},
    {id:'sider-aberto',label:'Circulação de carreta com sider aberto',entities:{people:'required',vehicles:'required',materials:'hidden'},evidence:'recommended',documentMode:'recommended',documentTypes:['MVM','Outro']}
  ],
  'Remoção ou transporte de veículo por reboque': [
    {id:'reboque-customer-care',label:'Entrada/remoção de veículo por reboque',entities:{people:'required',vehicles:'required',materials:'hidden'},evidence:'required',documentMode:'recommended',documentTypes:['Ficha Customer Care','Outro']}
  ],
  'Avaria em material, peça, equipamento ou vasilhame': [
    {id:'queda-pecas-empilhadeira',label:'Queda de peças durante movimentação com empilhadeira',entities:{people:'required',vehicles:'required',materials:'required'},evidence:'required',documentMode:'recommended',documentTypes:['DANFE/NF','Outro'],materialPolicy:{quantityCheck:true,technicalIdCheck:true}},
    {id:'carga-tombada',label:'Carga tombada / peças com suspeita de avaria',entities:{people:'required',vehicles:'required',materials:'required'},evidence:'required',documentMode:'recommended',documentTypes:['MVM','DANFE/NF','Outro'],materialPolicy:{quantityCheck:true,technicalIdCheck:true}},
    {id:'pecas-molhadas',label:'Peças molhadas / contato com líquido',entities:{people:'required',vehicles:'recommended',materials:'required'},evidence:'required',documentMode:'recommended',documentTypes:['MVM','DANFE/NF','Outro'],materialPolicy:{quantityCheck:true,technicalIdCheck:true}},
    {id:'container-danificado',label:'Container/vasilhame danificado',entities:{people:'required',vehicles:'required',materials:'required'},evidence:'required',documentMode:'recommended',documentTypes:['MVM','DANFE/NF','Outro'],materialPolicy:{quantityCheck:false,technicalIdCheck:true,showContainer:true}}
  ],
  'Divergência de carga, quantidade ou documentação': [
    {id:'deem-maior',label:'Excedente de peças / DEEM maior',routingAnswers:{tipoDivergencia:'Quantidade'},entities:{people:'recommended',vehicles:'recommended',materials:'required'},evidence:'required',documentMode:'required',documentTypes:['DEEM','DANFE/NF','MVM','Outro'],requiredDocumentTypes:['DEEM'],materialPolicy:{quantityCheck:true,technicalIdCheck:true}},
    {id:'deem-menor',label:'Falta de peças / DEEM menor',routingAnswers:{tipoDivergencia:'Quantidade'},entities:{people:'recommended',vehicles:'recommended',materials:'required'},evidence:'required',documentMode:'required',documentTypes:['DEEM','DANFE/NF','MVM','Outro'],requiredDocumentTypes:['DEEM'],materialPolicy:{quantityCheck:true,technicalIdCheck:true}},
    {id:'destino-incorreto',label:'Carga com destino incorreto / CKD',routingAnswers:{tipoDivergencia:'Origem/destino'},entities:{people:'required',vehicles:'required',materials:'required'},evidence:'recommended',documentMode:'required',documentTypes:['MVM','DANFE/NF','Ordem de carga','Outro'],requiredDocumentTypes:['MVM'],materialPolicy:{quantityCheck:true,technicalIdCheck:true}},
    {id:'divergencia-documental',label:'Divergência documental',routingAnswers:{tipoDivergencia:'MVM/nota fiscal/documento'},entities:{people:'recommended',vehicles:'recommended',materials:'required'},evidence:'recommended',documentMode:'required',documentTypes:['MVM','DANFE/NF','Romaneio','Ordem de carga','Outro']}
  ],
  'Liberação ou conferência de carga': [
    {id:'conferencia-geral',label:'Conferência/liberação de carga',entities:{people:'required',vehicles:'required',materials:'required'},evidence:'recommended',documentMode:'required',documentTypes:['MVM','DANFE/NF','Romaneio','Ordem de carga','Outro'],materialPolicy:{quantityCheck:true,technicalIdCheck:true}},
    {id:'recusa-carregamento',label:'Recusa de carregamento',entities:{people:'required',vehicles:'required',materials:'recommended'},evidence:'recommended',documentMode:'required',documentTypes:['MVM','Ordem de carga','Outro'],requiredDocumentTypes:['MVM']}
  ],
  'Constatação em fiscalização ou inspeção de segurança': [
    {id:'fiscalizacao-transito',label:'Fiscalização de trânsito',origin:'Fiscalização / O.S.',entities:{people:'required',vehicles:'required',materials:'hidden'},evidence:'recommended',extraQuestions:[{id:'habilitacao',label:'Situação da habilitação/documentação do condutor',type:'select',required:true,options:['Regular','Não portava no momento','Irregular','Não foi possível confirmar']}]},
    {id:'fiscalizacao-radar',label:'Fiscalização com auxílio de radar',origin:'Fiscalização / O.S.',entities:{people:'required',vehicles:'required',materials:'hidden'},evidence:'recommended',extraQuestions:[{id:'velocidadeMedida',label:'Velocidade medida (km/h)',type:'number',required:true},{id:'velocidadePermitida',label:'Velocidade permitida na via (km/h)',type:'number',required:true}]},
    {id:'estado-conservacao-veiculo',label:'Estado de conservação de veículo',origin:'Fiscalização / O.S.',entities:{people:'required',vehicles:'required',materials:'hidden'},evidence:'required',documentMode:'recommended',documentTypes:['MVM','Outro']},
    {id:'os-empilhadeira',label:'O.S. com auxílio de empilhadeira',origin:'Fiscalização / O.S.',entities:{people:'required',vehicles:'required',materials:'required'},evidence:'required',documentMode:'recommended',documentTypes:['MVM','DANFE/NF','Outro'],materialPolicy:{quantityCheck:true,technicalIdCheck:true}}
  ],
  'Não conformidade identificada em processo ou procedimento': [
    {id:'overtime',label:'Permanência excessiva / overtime de veículo de carga',origin:'Auditoria',entities:{people:'required',vehicles:'required',materials:'recommended'},evidence:'recommended',documentMode:'required',documentTypes:['MVM','Outro'],requiredDocumentTypes:['MVM'],extraQuestions:[{id:'entradaPlanta',label:'Horário de entrada na planta',type:'time',required:true},{id:'saidaPlanta',label:'Horário de saída da planta',type:'time',required:true}]},
    {id:'mvm-extraviado-portaria',label:'MVM extraviado na portaria',origin:'Auditoria',entities:{people:'recommended',vehicles:'recommended',materials:'hidden'},evidence:'recommended',documentMode:'required',documentTypes:['MVM'],requiredDocumentTypes:['MVM'],extraQuestions:[{id:'localExtravio',label:'Local do extravio',type:'text',required:true},{id:'situacaoSistema',label:'Situação no sistema',type:'text',required:true}]},
    {id:'mvm-extraviado-guiche',label:'MVM extraviado no guichê',origin:'Auditoria',entities:{people:'recommended',vehicles:'required',materials:'hidden'},evidence:'recommended',documentMode:'required',documentTypes:['MVM'],requiredDocumentTypes:['MVM'],extraQuestions:[{id:'localExtravio',label:'Local do extravio',type:'text',required:true},{id:'regularizacaoMvm',label:'Como a saída foi regularizada?',type:'textarea',required:true}]},
    {id:'km-errado',label:'KM lançado incorretamente em sistema',origin:'Auditoria',entities:{people:'recommended',vehicles:'required',materials:'hidden'},evidence:'recommended',extraQuestions:[{id:'kmLancado',label:'KM lançado no sistema',type:'number',required:true},{id:'kmCorreto',label:'KM correto constatado',type:'number',required:true}]},
    {id:'prototipo-sem-lacre',label:'Protótipo sem lacre/proteção prevista',entities:{people:'required',vehicles:'required',materials:'recommended'},evidence:'required',documentMode:'recommended',documentTypes:['MVM','DANFE/NF','Outro']},
    {id:'uso-indevido-veiculo',label:'Utilização indevida de veículo',entities:{people:'required',vehicles:'required',materials:'hidden'},evidence:'recommended'},
    {id:'vestimenta',label:'Vestimenta em desacordo com norma interna',entities:{people:'required',vehicles:'hidden',materials:'hidden'},evidence:'recommended'},
    {id:'motorista-sem-epi',label:'Motorista sem EPI adequado',entities:{people:'required',vehicles:'required',materials:'hidden'},evidence:'recommended',documentMode:'recommended',documentTypes:['MVM','Outro']}
  ],
  'Falha operacional com impacto': [
    {id:'instabilidade-ronda',label:'Instabilidade/indisponibilidade do sistema Ronda',origin:'Constatação espontânea da Segurança',entities:{people:'recommended',vehicles:'hidden',materials:'hidden'},evidence:'recommended',extraQuestions:[{id:'inicioFalha',label:'Horário aproximado de início da falha',type:'time',required:true},{id:'contingencia',label:'Contingência utilizada',type:'textarea',required:true},{id:'normalizacaoSistema',label:'Horário aproximado de normalização',type:'time',recommended:true}]},
    {id:'transporte-fretado',label:'Ocorrência com transporte fretado',entities:{people:'required',vehicles:'recommended',materials:'hidden'},evidence:'recommended',extraQuestions:[{id:'linhaFretado',label:'Linha/identificação do fretado',type:'text',recommended:true},{id:'alternativaTransporte',label:'Alternativa adotada para o deslocamento',type:'text',required:true}]}
  ]
});

window.BO_ROUTING_QUESTION_IDS = Object.freeze({
  'Tentativa de acesso não autorizado':['tipoAcesso'],
  'Pessoa ou veículo em área de acesso restrito':['elemento'],
  'Acidente ou colisão envolvendo veículo':['tipoAcidente'],
  'Avaria em material, peça, equipamento ou vasilhame':['tipoItem'],
  'Divergência de carga, quantidade ou documentação':['tipoDivergencia'],
  'Liberação ou conferência de carga':['operacao'],
  'Estacionamento ou circulação em desacordo com as normas':['tipoIrregularidade'],
  'Mal-estar, atendimento médico ou acidente pessoal':['tipoOcorrencia'],
  'Incêndio ou princípio de incêndio':['classificacao'],
  'Vazamento, derramamento ou ocorrência ambiental':['tipo']
});

window.BO_QUESTION_CONDITIONS = Object.freeze({
  'Acidente ou colisão envolvendo veículo': {
    atendimentoMedico:{id:'vitimas',in:['Sim','Não foi possível confirmar']}
  },
  'Agressão física ou confronto entre pessoas': {
    lesaoDescricao:{id:'lesaoAparente',in:['Sim','Não foi possível confirmar']}
  },
  'Material ou equipamento localizado/recolhido': {
    proprietario:{id:'identificacaoDisponivel',in:['Sim','Não foi possível confirmar']}
  },
  'Divergência de carga, quantidade ou documentação': {
    lacre:{id:'tipoDivergencia',equals:'Lacre'}
  }
});

// Perguntas abaixo já são cobertas por campos únicos de constatação, providência e desfecho.
window.BO_QUESTION_EXCLUSIONS = Object.freeze({
  'Divergência de carga, quantidade ou documentação':['documento','quantidadePrevista','quantidadeConstatada'],
  'Liberação ou conferência de carga':['documento'],
  'Outra ocorrência envolvendo materiais, peças ou cargas':['documentacao'],
  'Acidente ou colisão envolvendo veículo':['danosVisiveis'],
  'Avaria constatada em veículo':['parteDanificada','descricaoDano','condicaoFinal'],
  'Veículo apresentado com dano preexistente':['localizacaoDano','descricaoDano'],
  'Outra ocorrência de acesso ou credenciamento':['resultado'],
  'Estacionamento ou circulação em desacordo com as normas':['orientacao'],
  'Outra ocorrência envolvendo veículos ou circulação':['resultado'],
  'Dano em instalação, equipamento ou patrimônio':['manutencao','condicaoFinal'],
  'Situação de emergência operacional':['controleInicial','areasAcionadas','normalizacao'],
  'Falha operacional com impacto':['controle','responsavel','condicaoFinal'],
  'Vazamento, derramamento ou ocorrência ambiental':['contencao','areaAmbiental','condicaoFinal'],
  'Outra ocorrência envolvendo instalações ou emergência':['situacao','controle','areaAcionada','resultado'],
  'Irregularidade constatada em ronda interna':['constatacao','orientacao','normalizacao'],
  'Irregularidade constatada em ronda externa':['constatacao','orientacao','normalizacao'],
  'Outra ocorrência relacionada à segurança patrimonial':['constatacao','providencia','resultado'],
  'Ocorrência não enquadrada nas categorias existentes':['situacao','providencia','resultado'],
  'Outra situação relevante para registro':['situacao','providencia','resultado'],
  'Outra ocorrência envolvendo pessoas ou comportamento':['areaAcionada','resultado']
});

window.BO_EVIDENCE_REQUIREMENTS = Object.freeze({
  'Acidente ou colisão envolvendo veículo':[
    {id:'local',label:'Foto geral do local',type:'photo',required:true},
    {id:'dano',label:'Foto dos danos/partes atingidas',type:'photo',required:true}
  ],
  'Avaria constatada em veículo':[
    {id:'identificacao-veiculo',label:'Foto da identificação do veículo',type:'photo',required:true},
    {id:'dano',label:'Foto da avaria',type:'photo',required:true}
  ],
  'Veículo apresentado com dano preexistente':[
    {id:'identificacao-veiculo',label:'Foto da identificação do veículo',type:'photo',required:true},
    {id:'dano',label:'Foto do dano preexistente',type:'photo',required:true}
  ],
  'Remoção ou transporte de veículo por reboque':[
    {id:'antes-remocao',label:'Foto do veículo antes da remoção',type:'photo',required:true}
  ],
  'Avaria em material, peça, equipamento ou vasilhame':[
    {id:'item',label:'Foto do item/carga avariada',type:'photo',required:true},
    {id:'dano',label:'Foto do detalhe da avaria',type:'photo',required:true}
  ],
  'Material ou equipamento localizado/recolhido':[
    {id:'item',label:'Foto do item localizado/recolhido',type:'photo',required:true},
    {id:'local',label:'Foto do local onde foi encontrado',type:'photo',required:false}
  ],
  'Dano em instalação, equipamento ou patrimônio':[
    {id:'geral',label:'Foto geral do local/bem',type:'photo',required:true},
    {id:'dano',label:'Foto do detalhe do dano',type:'photo',required:true}
  ],
  'Incêndio ou princípio de incêndio':[
    {id:'local',label:'Foto do local/dano, somente se houver condição segura',type:'photo',required:true,safety:true}
  ],
  'Suspeita de dano intencional ou sabotagem':[
    {id:'local',label:'Foto do local e indícios preserváveis',type:'photo',required:true,safety:true}
  ]
});
