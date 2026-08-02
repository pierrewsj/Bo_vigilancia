BO DIGITAL GSP — PWA COM GOOGLE SHEETS
======================================

O que foi alterado
------------------
1. O campo Sub-referência foi removido.
2. As opções de sub-referência foram incorporadas ao campo Referência.
   Exemplo: "Danos materiais — Entrada com danos".
3. Ao escolher "Outra" em Diretoria relacionada, aparece um campo para digitar.
4. Campos obrigatórios vazios ficam amarelos; preenchidos ficam levemente verdes.
5. Novo tema tecnológico azul/ciano, ícones SVG e novo assistente Guardião GSP.
6. Banco local no navegador com opção de sincronização pelo Google Sheets.

Arquivos principais
-------------------
- index.html: tela principal.
- styles.css: aparência do aplicativo.
- app.js: funcionamento, banco local, bot e conexão com a planilha.
- manifest.webmanifest e service-worker.js: instalação e funcionamento PWA.
- google-apps-script.gs: código do banco Google Sheets.
- assets/: ícones e imagem do Guardião.

Como testar no computador
-------------------------
Não abra apenas com duplo clique, porque o PWA e o service worker precisam de um servidor.

Opção GitHub Pages:
1. Crie um repositório no GitHub.
2. Envie todos os arquivos e a pasta assets, mantendo a estrutura.
3. Abra Settings > Pages.
4. Em Source, escolha Deploy from a branch.
5. Selecione main e /root.
6. Abra o endereço gerado.

Como configurar o Google Sheets
-------------------------------
1. Crie uma planilha Google em branco.
2. Na planilha, abra Extensões > Apps Script.
3. Apague o código existente e cole o conteúdo de google-apps-script.gs.
4. Salve.
5. Selecione a função setup e clique em Executar.
6. Autorize o acesso solicitado.
7. Clique em Implantar > Nova implantação.
8. Tipo: Aplicativo da Web.
9. Executar como: você.
10. Quem tem acesso: escolha a opção permitida pela sua organização.
11. Clique em Implantar e copie o endereço terminado em /exec.
12. No PWA, abra a aba Banco, cole o endereço e clique em Salvar endereço.
13. Clique em Testar conexão.

Abas criadas automaticamente na planilha
----------------------------------------
- BO_Ocorrencias
- BO_Pessoas
- BO_Veiculos
- BO_Materiais
- BO_Anexos

Observações importantes
-----------------------
- A versão continua salvando localmente para não perder rascunhos quando estiver sem internet.
- Ao clicar em Salvar ou Finalizar, o aplicativo tenta sincronizar se o Apps Script estiver configurado.
- Os arquivos anexados permanecem no navegador. A planilha recebe somente nome, tipo e tamanho.
- Esta é uma versão de protótipo. Use dados fictícios até a aprovação da empresa e a migração para Power Apps/SharePoint.
