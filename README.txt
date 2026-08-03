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
