/**
 * Bateria de instrumentos do NRP (Programa de Recalibração Neural).
 *
 * REGRA DE FIDELIDADE: itens de instrumento validado NUNCA são redigidos de
 * memória. Os blocos marcados com `pendente: true` estão aguardando a redação
 * oficial da versão brasileira validada (copiar do artigo de validação ou do
 * material licenciado) e NÃO aparecem para o paciente até serem preenchidos
 * (e o `pendente` removido).
 *
 * Estrutura de cada instrumento:
 *   id        chave gravada no banco
 *   nome      título mostrado ao paciente
 *   instrucao texto de abertura
 *   tipo      'numerica' (0-10 por item) | 'likert' (opcoes fixas por item)
 *   opcoes    para likert: [{v: valor, t: 'texto'}]
 *   itens     lista de textos (ou {t, opcoes} para item com escala própria)
 *   visitas   em que visitas entra
 *   escore(respostas) -> {score, subscores}
 */

const VISITAS = {
  inicial:      { nome: "Avaliação inicial" },
  sessao4:      { nome: "Reavaliação · 4ª sessão" },
  sessao8:      { nome: "Reavaliação · 8ª sessão" },
  alta:         { nome: "Alta" },
  seguimento4m: { nome: "Seguimento · 4 meses" },
  extra:        { nome: "Avaliação extra" },
};

const INSTRUMENTOS = [
  {
    id: "end",
    nome: "Intensidade da dor",
    instrucao: "Para cada pergunta, escolha o número que melhor representa a sua dor, de 0 (nenhuma dor) a 10 (a pior dor que você pode imaginar).",
    tipo: "numerica",
    itens: [
      "Qual é a intensidade da sua dor AGORA?",
      "Nos últimos 7 dias, qual foi a intensidade MÉDIA da sua dor?",
      "Nos últimos 7 dias, qual foi a PIOR intensidade da sua dor?",
    ],
    visitas: ["inicial", "sessao4", "sessao8", "alta", "seguimento4m", "extra"],
    escore(r) {
      return { score: r[1], subscores: { agora: r[0], media7d: r[1], pior7d: r[2] } };
    },
  },

  {
    id: "int",
    nome: "Interferência da dor",
    instrucao: "Nos últimos 7 dias, o quanto a dor interferiu em cada área da sua vida? Escolha de 0 (não interferiu) a 10 (interferiu completamente).",
    tipo: "numerica",
    // Redação própria da clínica, inspirada nos domínios clássicos de
    // interferência. Não é reprodução do BPI (licença em verificação).
    itens: [
      "Nas suas atividades em geral",
      "No seu humor",
      "Na sua capacidade de andar e se locomover",
      "No seu trabalho, dentro ou fora de casa",
      "No seu relacionamento com outras pessoas",
      "No seu sono",
      "No seu prazer de viver",
    ],
    visitas: ["inicial", "sessao4", "sessao8", "alta", "seguimento4m", "extra"],
    escore(r) {
      const soma = r.reduce((a, b) => a + b, 0);
      return { score: Math.round((soma / r.length) * 10) / 10, subscores: null };
    },
  },

  {
    id: "phq9",
    nome: "Como você tem se sentido",
    instrucao: "Durante as últimas 2 semanas, com que frequência você foi incomodado(a) por qualquer um dos problemas abaixo?",
    tipo: "likert",
    // PHQ-9, domínio público (Pfizer). Redação padrão em português do Brasil.
    // CONFERIR contra a versão oficial impressa usada na clínica antes do uso.
    opcoes: [
      { v: 0, t: "Nenhuma vez" },
      { v: 1, t: "Vários dias" },
      { v: 2, t: "Mais da metade dos dias" },
      { v: 3, t: "Quase todos os dias" },
    ],
    itens: [
      "Pouco interesse ou pouco prazer em fazer as coisas",
      "Se sentir para baixo, deprimido(a) ou sem perspectiva",
      "Dificuldade para pegar no sono ou permanecer dormindo, ou dormir mais do que de costume",
      "Se sentir cansado(a) ou com pouca energia",
      "Falta de apetite ou comendo demais",
      "Se sentir mal consigo mesmo(a), ou achar que você é um fracasso ou que decepcionou sua família ou você mesmo(a)",
      "Dificuldade para se concentrar nas coisas, como ler o jornal ou ver televisão",
      "Lentidão para se movimentar ou falar, a ponto das outras pessoas perceberem? Ou o oposto: estar tão agitado(a) que você fica andando de um lado para o outro mais do que de costume",
      "Pensar em se ferir de alguma maneira ou que seria melhor estar morto(a)",
    ],
    visitas: ["inicial", "alta", "seguimento4m"],
    escore(r) {
      const soma = r.reduce((a, b) => a + b, 0);
      const faixa = soma < 5 ? "mínimo" : soma < 10 ? "leve" : soma < 15 ? "moderado" : soma < 20 ? "moderadamente grave" : "grave";
      return { score: soma, subscores: { faixa: faixa, item9: r[8] } };
    },
  },

  {
    id: "csi",
    nome: "Inventário de Sensibilização Central (BR-CSI)",
    pendente: true,
    nota_pendencia: "Copiar os 25 itens e as opções da versão brasileira validada (validação de Caumo e cols.). Escore: soma 0-100.",
    tipo: "likert",
    opcoes: [
      { v: 0, t: "Nunca" },
      { v: 1, t: "Raramente" },
      { v: 2, t: "Às vezes" },
      { v: 3, t: "Frequentemente" },
      { v: 4, t: "Sempre" },
    ],
    itens: [],
    visitas: ["inicial", "alta", "seguimento4m"],
    escore(r) {
      const soma = r.reduce((a, b) => a + b, 0);
      return { score: soma, subscores: { corte40: soma >= 40 } };
    },
  },

  {
    id: "pcs",
    nome: "Escala de Catastrofização da Dor (B-PCS)",
    pendente: true,
    nota_pendencia: "Copiar os 13 itens da versão brasileira validada (licença Mapi a verificar). Subescalas: ruminação (itens 8-11), magnificação (6,7,13), desamparo (1-5,12).",
    tipo: "likert",
    opcoes: [
      { v: 0, t: "Nem um pouco" },
      { v: 1, t: "Um pouco" },
      { v: 2, t: "Moderadamente" },
      { v: 3, t: "Muito" },
      { v: 4, t: "O tempo todo" },
    ],
    itens: [],
    visitas: ["inicial", "alta", "seguimento4m"],
    escore(r) {
      const soma = r.reduce((a, b) => a + b, 0);
      const pick = (idx) => idx.reduce((a, i) => a + r[i - 1], 0);
      return {
        score: soma,
        subscores: {
          ruminacao: pick([8, 9, 10, 11]),
          magnificacao: pick([6, 7, 13]),
          desamparo: pick([1, 2, 3, 4, 5, 12]),
        },
      };
    },
  },

  {
    id: "tsk11",
    nome: "Escala Tampa de Cinesiofobia (TSK-11)",
    pendente: true,
    nota_pendencia: "Copiar os 11 itens da versão brasileira validada da forma curta. Escore: soma 11-44 (itens de 1 a 4, sem inversão na TSK-11).",
    tipo: "likert",
    opcoes: [
      { v: 1, t: "Discordo totalmente" },
      { v: 2, t: "Discordo parcialmente" },
      { v: 3, t: "Concordo parcialmente" },
      { v: 4, t: "Concordo totalmente" },
    ],
    itens: [],
    visitas: ["inicial", "alta", "seguimento4m"],
    escore(r) {
      return { score: r.reduce((a, b) => a + b, 0), subscores: null };
    },
  },

  {
    id: "whoqol",
    nome: "Qualidade de vida (WHOQOL-bref)",
    pendente: true,
    nota_pendencia: "Copiar os 26 itens da versão brasileira oficial (Fleck e cols.) após o registro no grupo WHOQOL. Cada item tem escala própria de 5 pontos; domínios físico, psicológico, relações sociais e meio ambiente transformados 0-100 pela sintaxe oficial (itens 3, 4 e 26 invertidos).",
    tipo: "likert",
    opcoes: [],
    itens: [],
    visitas: ["inicial", "alta"],
    escore(r) {
      return { score: null, subscores: { pendente_sintaxe_oficial: true } };
    },
  },
];
