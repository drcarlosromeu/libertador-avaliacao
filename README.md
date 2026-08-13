# LibertaDor · Avaliação de Seguimento

Formulário autoaplicado de avaliação de seguimento do programa LibertaDor (Programa de Tratamento da Dor Neuroplástica), Clínica Neuroliv, Salvador BA.

Página estática, sem servidor e sem banco de dados. As respostas do paciente ficam no aparelho dele até que ele mesmo as envie pelo WhatsApp da clínica, na forma de um código compacto. A equipe cola o código no modo "Sou da equipe" da mesma página para gerar a nota de prontuário, a linha da planilha interna e o registro do termo de consentimento.

## Fluxo

1. Paciente abre o link, responde a avaliação e assina o consentimento.
2. A página gera um PDF do termo (via imprimir / salvar como PDF) e um código com as respostas.
3. O botão final abre o WhatsApp da clínica com o código pré-preenchido; o paciente anexa o PDF na mesma conversa.
4. A equipe cola o código no modo equipe, completa os dados clínicos e arquiva: nota no prontuário, linha na planilha restrita e código na coluna de arquivo.

## Manutenção

- Número do WhatsApp que recebe as avaliações: constante `WHATSAPP_CLINICA` no início do script em `index.html`.
- Nenhum dado de paciente deve ser commitado neste repositório.
