CENTRAL GSP - Google Sheets como banco de dados

Aba obrigatória: CHAMADOS

Cabeçalhos da linha 1, de A até AB, nesta ordem:

A  ID_CHAMADO
B  DATA_HORA_ABERTURA
C  DATA_HORA_ATUALIZACAO
D  STATUS
E  TIPO_SOLICITACAO
F  PRIORIDADE
G  ORIGEM
H  NOME_SOLICITANTE
I  REGISTRO
J  TELEFONE
K  POSSUI_RAMAL
L  RAMAL
M  TIPO_EMPRESA
N  DIRETORIA
O  OUTRA_DIRETORIA
P  NOME_EMPRESA
Q  SETOR_AREA
R  GALPAO
S  POSSUI_COLUNA
T  COLUNA
U  POSSUI_SALA
V  SALA
W  REFERENCIA
X  CATEGORIA_CONFERENCIA
Y  CARACTERISTICA_OCORRENCIA
Z  DESCRICAO
AA RESPONSAVEL_GSP
AB OBSERVACAO_GSP

Observações:
- O aplicativo está conectado ao Apps Script informado pelo usuário.
- O campo Sub-referência não é uma coluna separada. As opções ficam dentro da referência/motivo da ocorrência.
- Se a diretoria for Outra, o app abre um campo para digitar e salva em OUTRA_DIRETORIA.
- Se não houver coluna ou sala, o app salva "Não possui".
