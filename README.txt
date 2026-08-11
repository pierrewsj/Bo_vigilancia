BO DIGITAL GSP — v34.1.0
Redação Profissional e Revisão NEXO

OBJETIVO
O BO Digital GSP v34 mantém o fluxo padronizado e a revisão textual da v33, acrescentando obrigatoriedade contextual. O aplicativo deixa de exigir dados que podem não existir na situação real e mantém campos técnicos disponíveis apenas como complementares quando fizer sentido.

PRINCÍPIO DA v34
- registrar o que foi efetivamente obtido;
- não criar MVM, matrícula, placa, documento, fornecedor ou código para satisfazer validação;
- tornar essenciais apenas os dados inerentes à natureza do BO;
- permitir registro de pessoa, veículo ou item não identificado quando essa for a condição real;
- manter a padronização sem induzir preenchimento fictício.

O aplicativo foi projetado para conduzir o vigilante durante a coleta de informações e transformar dados estruturados em um relato formal, objetivo e rastreável, sem criar fatos que não tenham sido registrados no BO.

FLUXO OPERACIONAL ADOTADO
1. O solicitante realiza o chamado por telefone.
2. O atendente repassa a solicitação ao vigilante.
3. Ao chegar ao local, o vigilante toca em “Novo boletim”.
4. Nesse momento, o aplicativo registra automaticamente o início do BO/atendimento.
5. O vigilante coleta e registra as informações guiado pelo modelo correspondente à ocorrência.
6. O NEXO pode gerar e revisar localmente a redação do relato consolidado.
7. Na etapa de revisão, o sistema aponta pendências essenciais e recomendações.
8. Ao tocar em “Finalizar e enviar”, o horário de término é registrado, o texto passa por uma revisão local final, o BO é finalizado e ocorre a tentativa de sincronização com o Google Sheets.

ORGANIZAÇÃO EM 5 ETAPAS
1. OCORRÊNCIA
   - natureza da ocorrência;
   - tipo de boletim;
   - data e hora do fato;
   - local e identificação detalhada;
   - solicitante;
   - diretoria e área/setor.

2. DADOS ESSENCIAIS
   - pessoas envolvidas;
   - relação do solicitante com o fato;
   - testemunhas;
   - veículos;
   - materiais, peças, equipamentos ou cargas.
   O aplicativo oculta automaticamente os grupos sem relação com o modelo escolhido.

3. APURAÇÃO
   - fonte principal do relato (solicitante, envolvido, testemunha, terceiro ou não identificada);
   - relato recebido de solicitante/envolvido/terceiro;
   - constatação própria da Segurança Patrimonial;
   - roteiro padronizado específico para a ocorrência.
   As perguntas são classificadas como Essenciais, Recomendadas ou Opcionais.

4. PROVIDÊNCIAS E EVIDÊNCIAS
   - providências adotadas;
   - áreas/responsáveis acionados;
   - desfecho;
   - fotos e documentos;
   - justificativa quando uma evidência essencial não puder ser registrada;
   - geração e revisão local do relato profissional.

5. REVISÃO E FINALIZAÇÃO
   - conferência dos blocos essenciais;
   - pendências clicáveis com retorno direto ao ponto de correção;
   - resumo de envolvidos, testemunhas, veículos e materiais;
   - apuração padronizada;
   - providências e evidências;
   - relato consolidado;
   - duração do atendimento;
   - revisão textual final;
   - confirmações obrigatórias antes da finalização.

PADRONIZAÇÃO POR TIPO DE BO
A versão possui 41 modelos distribuídos em 7 grupos:
- Acesso e credenciamento;
- Veículos e circulação;
- Materiais, peças e cargas;
- Pessoas, comportamento e saúde;
- Instalações, patrimônio e emergências;
- Segurança patrimonial e controle;
- Ocorrências não classificadas.

A nomenclatura foi revista para privilegiar clareza, neutralidade e precisão. Termos que poderiam antecipar culpa, intenção, diagnóstico ou classificação jurídica foram substituídos por descrições mais objetivas, como “Suspeita de subtração...” e “Alteração comportamental observada”.

Cada modelo define:
- quais entidades devem ser coletadas;
- quais perguntas são essenciais;
- quais informações são recomendadas;
- quando evidência é essencial ou recomendada;
- orientação operacional de preenchimento.

INFORMAÇÃO NÃO OBTIDA
O sistema não deve incentivar o preenchimento de informações inventadas. Quando uma informação essencial não puder ser obtida e o modelo permitir essa condição, o vigilante registra a indisponibilidade e a respectiva justificativa.

PADRÃO DE LINGUAGEM
O formulário e o relatório foram estruturados para distinguir:
- RELATO RECEBIDO: o que foi informado pelo solicitante, envolvido ou terceiro;
- CONSTATAÇÃO: o que a equipe de Segurança Patrimonial efetivamente observou/verificou;
- APURAÇÃO COMPLEMENTAR: dados objetivos coletados durante o atendimento;
- PROVIDÊNCIAS: ações executadas e áreas/responsáveis acionados;
- DESFECHO: condição final no momento do encerramento.

A fonte principal do relato é selecionada separadamente. O vigilante escreve apenas o conteúdo informado; o sistema adiciona automaticamente o conector adequado no relatório.

A redação evita, sempre que possível:
- conectores repetidos, como “segundo... segundo...”;
- repetições de palavras ou ideias muito próximas;
- expressões vagas como “nada aconteceu”;
- afirmações de culpa, intenção ou autoria sem base objetiva;
- diagnóstico de condição clínica ou influência de substâncias;
- conclusão jurídica não confirmada.

Exemplos preferenciais:
- “Segundo relato do solicitante...”
- “No local, a equipe de Segurança Patrimonial constatou...”
- “Conforme verificado durante o atendimento...”
- “Foram adotadas as seguintes providências...”
- “Não foi possível confirmar...”
- “Ao término do atendimento, não foram registrados novos desdobramentos.”

REVISÃO TEXTUAL NEXO — SEM API PAGA
A revisão textual introduzida na v33 permanece ativa na v34 com o comando “Revisar redação” ao relato profissional.

A revisão é executada localmente, sem Luna, OpenAI ou outra API paga. Ela aplica regras determinísticas para:
- remover conectores duplicados;
- reduzir repetições conhecidas;
- ajustar pontuação e espaços;
- corrigir alguns padrões frequentes de concordância/redação;
- substituir expressões informais ou pouco apropriadas por equivalentes profissionais;
- preservar a separação entre relato, constatação, providências e desfecho.

IMPORTANTE: essa revisão local não é um modelo de linguagem completo. Ela melhora padrões conhecidos e a estrutura do texto, mas não deve ser tratada como revisão semântica humana para qualquer frase possível. O sistema não inventa fatos nem altera deliberadamente o sentido do registro.

Antes da finalização, o aplicativo executa automaticamente uma última revisão local do relato e das providências. A ação fica registrada na auditoria quando houver alteração textual.

NEXO OPERADOR — RECURSOS LOCAIS
O NEXO continua funcionando sem API paga. Entre os recursos disponíveis:
- situação atual;
- prioridades;
- roteiro do BO atual;
- checklist do BO;
- geração do relato profissional;
- revisão da redação;
- consulta e abertura de registros;
- fila de sincronização;
- passagem de turno;
- diagnóstico;
- sincronização com confirmação;
- novo boletim por comando.

Exemplos:
“Nexo, roteiro deste BO.”
“Nexo, o que falta neste BO?”
“Nexo, situação atual.”


AJUSTE v34.1 — REVISÃO EDITÁVEL NA FINALIZAÇÃO
-------------------------------------------------
Na etapa 5, o botão “Revisar redação” não encerra mais a ação apenas com a mensagem de que nenhuma correção automática foi encontrada. Depois da análise local do NEXO, o vigilante recebe a opção “Editar texto” para abrir o relato consolidado em modo de correção manual.

O botão “Editar relato” da seção Relato consolidado também abre diretamente a correção orientada, com o texto em campo editável e o comando “Salvar correção e revisar”.

A revisão automática continua funcionando, mas não substitui a conferência humana. Mesmo quando o NEXO não identifica erro por regras locais, o texto permanece totalmente editável antes da finalização.

COMPATIBILIDADE COM REGISTROS ANTERIORES
A v34 mantém o mapeamento de nomenclaturas antigas. BOs e rascunhos criados em versões anteriores continuam sendo reconhecidos e abertos com a classificação equivalente atual.

Registros já FINALIZADOS não são silenciosamente reescritos. O histórico deve permanecer fiel ao que foi registrado no momento da finalização. Quando houver necessidade de corrigir um BO já concluído, o procedimento adequado é registrar complemento/retificação de forma auditável, e não substituir o texto original sem rastreabilidade.

CONFIABILIDADE E OFFLINE
Foram preservados os recursos de confiabilidade das versões anteriores:
- salvamento automático local;
- recuperação de rascunhos;
- funcionamento offline;
- fila de sincronização somente para BOs finalizados;
- retry/backoff;
- detecção de conflito entre aparelhos;
- auditoria;
- lightbox de evidências;
- atualização do PWA;
- diagnóstico do sistema;
- criptografia local opcional;
- atalhos e Share Target PWA.

TEMPO OPERACIONAL
O ciclo operacional adotado é único:
- início: criação do novo BO quando o vigilante chega ao local;
- fim: finalização/envio do BO;
- duração: intervalo entre esses dois momentos.
A apresentação detalhada do tempo fica concentrada na revisão e nas telas de consulta.

GOOGLE APPS SCRIPT
Backend requerido: API 6.3.0
Esquema requerido: compact-t

IMPORTANTE: as alterações da v34 são realizadas no frontend e mantêm compatibilidade com o Google Apps Script 6.3.0. Se o endpoint 6.3.0 já estiver publicado e funcionando, não é necessário criar uma nova implantação apenas para usar esta versão do aplicativo.

PUBLICAÇÃO NO GITHUB PAGES
1. Faça backup da versão atual.
2. Substitua os arquivos do repositório pelos arquivos deste pacote, preservando a mesma estrutura na raiz.
3. Aguarde a publicação do GitHub Pages.
4. Abra o aplicativo conectado à internet.
5. Quando o PWA detectar a nova versão, use “Atualizar agora”.
6. Em aparelhos que insistirem em cache antigo, feche e reabra o PWA após a publicação.

TESTE FUNCIONAL RECOMENDADO
Primeiro teste:
- Novo boletim;
- Segurança patrimonial e controle;
- Outra ocorrência relacionada à segurança patrimonial;
- preencher localização/solicitante;
- no relato recebido, escrever uma frase simples sem “Segundo relato...”;
- registrar uma constatação objetiva;
- preencher providência e condição final;
- gerar o relato;
- tocar em “Revisar redação”;
- revisar a etapa final;
- finalizar e conferir a sincronização.

Depois, teste modelos com comportamento diferente:
- Veículo apresentado com dano preexistente;
- Divergência de carga, quantidade ou documentação;
- Suspeita de subtração de material em área interna;
- Desaparecimento de material ou equipamento;
- Alteração comportamental observada;
- Suspeita de dano intencional ou sabotagem.

ARQUIVOS PRINCIPAIS
index.html                   Interface base
styles.css                   Layout e responsividade
app.js                       Regras, fluxo, persistência, redação e sincronização
bo-templates.js              Biblioteca dos 41 modelos padronizados
assistant.js                 NEXO Operador local
advanced.js                  Recursos avançados
pwa.js                       Instalação/atualização PWA
service-worker.js            Cache e funcionamento offline
manifest.json                Manifesto PWA/atalhos/share target
google-apps-script.gs        Referência do backend 6.3.0 já compatível
MATRIZ_BO_PADRONIZADOS.txt   Matriz funcional dos modelos
ALTERACOES_V33.txt           Resumo das alterações desta versão
TESTES_REALIZADOS.txt        Validações da versão

VERSÃO DO APLICATIVO
34.1.0
