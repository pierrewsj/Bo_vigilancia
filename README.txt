BO DIGITAL GSP — VERSÃO 22.0.0

Arquivos principais:
- index.html
- app.js
- styles.css
- pwa.js
- service-worker.js
- manifest.json
- google-apps-script.gs

Principais melhorias desta versão:
- indicador textual de salvamento e sincronização no cabeçalho;
- número RASC não é mais apresentado como título principal;
- validação comum exibida diretamente na etapa e nos cartões, sem modal desnecessário;
- cartões de verificação com estado “Aguardando resposta” ou “Conferido”;
- confirmações finais persistidas antes da validação;
- relato automático ignora respostas vazias como “nada”, “não se aplica” e evita repetições;
- configurações técnicas ocultas durante o preenchimento e detalhes;
- redução de brilhos e melhor hierarquia visual;
- API Google Sheets 6.1.0 com planilha compacta A:U, formatos de data e cores de status.

Publicação recomendada:
1. Faça uma cópia da planilha e do repositório.
2. Substitua o Apps Script, execute setup e publique uma nova versão.
3. Confirme no /exec: version 6.1.0 e schema compact-u.
4. Substitua os arquivos do GitHub Pages.
5. Teste login, rascunho, fechamento do navegador, retomada, finalização online/offline e pesquisa.
