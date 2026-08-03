BO DIGITAL GSP — PWA INDUSTRIAL COM GOOGLE SHEETS
=================================================

Versão 3.0 — revisão completa do protótipo
-----------------------------------------
- Novo layout tecnológico e industrial em grafite, azul e ciano.
- Textos e botões revisados para evitar frases incompletas.
- Ícones SVG distintos para cada função.
- Campo Sub-referência removido; suas opções foram incorporadas à Referência.
- “Outra” em Diretoria abre um campo para digitação.
- Campos obrigatórios vazios ficam amarelos; preenchidos ficam verdes.
- Cadastro ilimitado de pessoas, veículos, materiais e anexos.
- Caixa “Não há pessoa identificada” na etapa Pessoas.
- Duas caixas obrigatórias de confirmação na revisão final.
- Modais personalizados para salvar e sair, excluir, finalizar, limpar dados,
  testar conexão e informar sucesso ou erro.
- Rascunho local automático e integração opcional com Google Sheets.

Arquivos principais
-------------------
- index.html: estrutura da interface e modais.
- styles.css: tema industrial, responsividade e estados de validação.
- manifest.webmanifest e service-worker.js: instalação e funcionamento offline.
- google-apps-script.gs: banco de dados na planilha Google.
- assets/icon-192.png e icon-512.png: ícones do PWA.

Como testar
-----------
O PWA precisa ser aberto por HTTP/HTTPS. Não use apenas duplo clique no index.html.

GitHub Pages:
1. Crie um repositório no GitHub.
2. Envie todos os arquivos e a pasta assets sem alterar a estrutura.
3. Abra Settings > Pages.
4. Em Source, escolha Deploy from a branch.
5. Selecione main e /root.
6. Abra o endereço publicado.

Como configurar o Google Sheets
-------------------------------
1. Crie uma planilha Google em branco.
2. Abra Extensões > Apps Script.
3. Apague o código existente e cole google-apps-script.gs.
4. Salve e execute a função setup uma vez.
5. Autorize o acesso solicitado.
6. Abra Implantar > Nova implantação.
7. Escolha Aplicativo da Web.
8. Em Executar como, selecione você.
9. Em acesso, escolha a opção permitida pela organização.
10. Implante e copie o endereço terminado em /exec.
11. No PWA, abra Banco, cole o endereço e salve.
12. Clique em Testar conexão.

Abas criadas automaticamente
-----------------------------
- BO_Ocorrencias
- BO_Pessoas
- BO_Veiculos
- BO_Materiais
- BO_Anexos

Observações
-----------
- Use somente dados fictícios enquanto o protótipo não estiver aprovado.
- Anexos ficam no navegador; a planilha recebe nome, tipo e tamanho.
- Ao atualizar no GitHub, o novo service worker remove o cache da versão anterior.

ALTERAÇÃO DESTA VERSÃO
- O assistente virtual e todos os seus controles foram removidos para priorizar os testes do fluxo principal do aplicativo.


ENDPOINT PRÉ-CONFIGURADO
https://script.google.com/macros/s/AKfycbwrYFAMDKd02EQx41vsLsVI5TztZxOph7f7YJvJ8DDOwQoaFrCcxRr8HpNkBhlHlr-6TQ/exec
O endereço já aparece na aba Banco. Use o botão Testar conexão antes de enviar dados.

- Responsividade mobile revisada para telas de 320 px a 430 px, sem rolagem lateral e sem sobreposição dos botões de etapa.

ATUALIZAÇÃO V11
- Modal de saída com três opções: Salvar e sair, Continuar no boletim e Cancelar.
- A opção Cancelar abre uma confirmação antes de excluir o rascunho.
- Todas as listas suspensas do aplicativo foram substituídas visualmente por seletores em modais.
- Manifesto PWA atualizado com ícones comuns e maskable, ID próprio e modo standalone.
- Botão Instalar permanece disponível fora do modo aplicativo e orienta Android e iOS quando o navegador não fornece instalação automática.
- No Android, use um navegador compatível, como Chrome, Edge ou Samsung Internet, para instalar como aplicativo e exibi-lo junto aos demais apps.
- No iPhone/iPad, a Apple disponibiliza a instalação pelo Safari em Compartilhar > Adicionar à Tela de Início; a posição do app é controlada pelo iOS.


INSTALAÇÃO COMO APLICATIVO ANDROID
- Publique todos os arquivos na raiz do GitHub Pages por HTTPS.
- Abra o link diretamente no Google Chrome.
- O botão Instalar só aparece quando o navegador emitir o evento beforeinstallprompt.
- Não use a opção genérica “Adicionar à tela inicial” quando ela criar apenas um atalho.
- O manifesto desta versão segue o padrão simples do aplicativo Escala 9132: manifest.json, start_url direto e ícones 192/512.


VERSÃO 13 — INSTALAÇÃO
- Publique o CONTEÚDO da pasta bo_digital_pwa_gsheets na raiz do repositório.
- Não publique a pasta como uma subpasta adicional se o GitHub Pages estiver configurado para /root.
- Após publicar, abra pwa-diagnostico.html no mesmo endereço para conferir manifest e service worker.


VERSÃO 14 — INSTALAÇÃO PWA
- Arquivos na raiz do ZIP, igual ao aplicativo Escala 9132.
- Identidade estável no manifesto: bo-digital-gsp.
- Registro do Service Worker isolado em pwa.js, independente do restante do aplicativo.
- O botão Instalar aparece somente após beforeinstallprompt.


VERSÃO 15
- Corrigido o ícone da lupa sobre o texto no campo de pesquisa.
- Busca numérica agora considera a sequência final do BO: digitar 26 procura BO-AAAA-000026.
