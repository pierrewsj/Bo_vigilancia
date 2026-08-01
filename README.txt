BO DIGITAL — PROTÓTIPO PWA

Este pacote é um protótipo visual e funcional para validar o fluxo de Boletim de Ocorrência antes da construção definitiva no Power Apps.

RECURSOS
- Novo boletim com número automático.
- Salvamento de rascunho por etapas.
- Referência e sub-referência dependentes.
- Cadastro ilimitado de solicitantes, envolvidos e testemunhas.
- Cadastro de veículos e materiais.
- Anexos com pré-visualização.
- Histórico, revisão e finalização.
- Consulta por BO, pessoa, referência e placa.
- Exportação e importação dos dados de teste em JSON.
- Funcionamento offline depois do primeiro acesso.
- Instalação no celular como PWA.

IMPORTANTE
- Use somente dados fictícios.
- Os registros ficam no IndexedDB do navegador do aparelho.
- Não existe sincronização entre usuários.
- Esta versão não substitui o Power Apps definitivo, SharePoint, permissões corporativas, auditoria ou controles de segurança.

COMO TESTAR NO COMPUTADOR
O PWA deve ser aberto por um servidor web; não abra o index.html diretamente.

Opção simples com Visual Studio Code:
1. Abra a pasta no VS Code.
2. Instale a extensão Live Server.
3. Clique com o botão direito em index.html.
4. Escolha Open with Live Server.

COMO PUBLICAR NO GITHUB PAGES
1. Crie um repositório novo no GitHub.
2. Envie todos os arquivos e pastas deste pacote para a raiz do repositório.
3. Abra Settings > Pages.
4. Em Source, selecione Deploy from a branch.
5. Selecione a branch main e a pasta /root.
6. Salve e aguarde a geração do endereço HTTPS.

COMO INSTALAR NO ANDROID
1. Abra o endereço publicado no Google Chrome.
2. Toque no botão Instalar, quando ele aparecer no aplicativo, ou abra o menu do Chrome.
3. Escolha Instalar aplicativo ou Adicionar à tela inicial.

ARQUIVOS
- index.html: estrutura do aplicativo.
- styles.css: identidade visual e responsividade.
- app.js: fluxo, validações e armazenamento local.
- manifest.webmanifest: configurações de instalação.
- service-worker.js: cache para funcionamento offline.
- assets/: ícones do PWA.

PRÓXIMA ETAPA
Depois de validar telas, campos e navegação, a mesma estrutura poderá ser reproduzida no Power Apps com listas do SharePoint.
