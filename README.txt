BO DIGITAL GSP — v27.0.0

Correção crítica de sincronização:
- API Google Sheets 6.3.0 / schema compact-t.
- O ID interno do BO funciona como chave de idempotência.
- Reenvios do mesmo BO nunca devem gerar um segundo número oficial.
- Se o Google Sheets gravar e a resposta ao celular falhar, o aplicativo consulta o servidor pelo ID e recupera o número oficial.
- Anexos já enviados ao Drive são reaproveitados em novas tentativas.
- Mantidas as melhorias da v26: revisão profissional, referências reorganizadas, responsividade e Assistente Operacional.

Atualização recomendada:
1. Substituir o código do Apps Script pelo arquivo google-apps-script.gs.
2. Salvar e publicar uma NOVA VERSÃO da implantação existente.
3. Confirmar no /exec: version 6.3.0, revision v27-sync-idempotente, schema compact-t.
4. Substituir os arquivos do aplicativo no GitHub pelos deste pacote.
5. Fechar e reabrir o PWA.
6. No BO que ficou como RASC, tocar uma única vez em Sincronizar.
