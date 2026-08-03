BO DIGITAL GSP — VERSÃO 16
==========================

Esta versão reorganiza o preenchimento para reduzir dúvidas, esquecimentos e digitação repetitiva.

PRINCIPAIS MELHORIAS
--------------------
- Fluxo reduzido para 5 etapas: Ocorrência, Elementos relacionados, Relato e providências, Evidências e Revisão.
- Recomendações automáticas conforme a referência escolhida.
- Explicação das referências e orientação específica conforme o tipo de local.
- Opção para salvar os dados do emissor no aparelho e preencher os próximos BOs automaticamente.
- Confirmação explícita de “não se aplica” para pessoas, testemunhas, veículos, materiais, providências e anexos.
- Regras diferentes para pessoa Stellantis, terceirizada e sem vínculo.
- Bloqueio de matrícula, documento, placa ou chassi duplicado dentro do mesmo BO.
- Histórico guiado por perguntas curtas e geração automática do relato consolidado.
- Validação de data/hora futura, matrícula, e-mail, placa, chassi, quantidade e campos obrigatórios.
- Fotos separadas em câmera, galeria e documentos, com redução automática de imagens.
- Lista de pendências antes da finalização.
- Pesquisa local e direta no Google Sheets; digitar 26 procura a sequência BO-AAAA-000026.
- Número temporário RASC enquanto offline e número oficial gerado pelo Apps Script com bloqueio de sequência.
- Sincronização automática e estados: salvo no aparelho, aguardando internet, enviando, sincronizado ou falha.
- Relacionamentos internos por ID, evitando erro quando existem pessoas com nomes iguais.
- Complementos, retificações e novos anexos depois da finalização, sem alterar silenciosamente o registro original.
- Configurações técnicas retiradas da navegação operacional e acessíveis pelo ícone de engrenagem.
- Anexos enviados para uma pasta privada no Google Drive durante a sincronização.
- PWA, cache offline e layout responsivo mantidos.

ATUALIZAÇÃO OBRIGATÓRIA DO GOOGLE APPS SCRIPT
---------------------------------------------
O novo aplicativo depende da API v4.0 incluída no arquivo google-apps-script.gs.

1. Abra a planilha Google usada como banco.
2. Entre em Extensões > Apps Script.
3. Substitua todo o código antigo pelo conteúdo de google-apps-script.gs.
4. Salve.
5. Execute a função setup uma vez.
6. Autorize o acesso à Planilha e ao Google Drive quando solicitado.
7. Abra Implantar > Gerenciar implantações.
8. Edite a implantação atual.
9. Selecione Nova versão e clique em Implantar.
10. O endereço /exec pode continuar o mesmo.

A função setup cria ou atualiza estas abas:
- BO_Ocorrencias
- BO_Pessoas
- BO_Veiculos
- BO_Materiais
- BO_Anexos
- BO_Complementos
- BO_Sequencia

ANEXOS NO GOOGLE DRIVE
----------------------
- A função setup cria a pasta privada BO_Digital_GSP_Anexos no Drive do proprietário do script.
- Cada BO recebe uma subpasta própria.
- Enquanto estiver offline, o arquivo permanece no aparelho.
- Ao sincronizar, o arquivo é enviado ao Drive e o link é salvo na aba BO_Anexos.
- Os arquivos permanecem privados conforme as permissões da conta Google proprietária.

PUBLICAÇÃO DO PWA
-----------------
1. Extraia o ZIP.
2. Apague ou substitua os arquivos antigos do repositório.
3. Envie diretamente todos os arquivos desta pasta para a raiz do GitHub Pages.
4. Não publique o ZIP e não crie uma pasta adicional acima do index.html.
5. Aguarde a publicação terminar.
6. Feche e abra o aplicativo novamente para o novo service worker atualizar o cache.

TESTE RECOMENDADO
-----------------
1. Abra Configurações técnicas pelo ícone de engrenagem.
2. Clique em Testar conexão.
3. Crie um BO usando dados fictícios.
4. Inclua pessoa, veículo ou material conforme o teste.
5. Gere o relato guiado.
6. Inclua uma foto pequena.
7. Finalize o BO.
8. Confirme se o número RASC mudou para BO-AAAA-000001 ou para a próxima sequência.
9. Confira as abas da planilha e a pasta BO_Digital_GSP_Anexos no Drive.
10. Pesquise o BO no aplicativo digitando apenas a sequência final, por exemplo 1 ou 26.

SEGURANÇA
---------
Esta ainda é uma solução de protótipo baseada em Google Sheets e Apps Script. Use dados fictícios até que a empresa aprove o armazenamento, as permissões, a política de retenção e o tratamento das informações pessoais e das evidências.
