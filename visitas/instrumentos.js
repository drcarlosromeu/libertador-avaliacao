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
    nome: "Questionário de Sensibilização Central",
    // Fonte OFICIAL: BP-CSI (grupo Dor & Neuromodulação, HCPA; validação Caumo
    // e cols. 2017, J Pain Res 10:2109-2122), PDF distribuído pelo detentor do
    // instrumento (PRIDE, pridedallas.com). Cópia em docs/fontes-instrumentos/.
    // Nota: no PDF oficial o item 20 está numerado "0." por erro tipográfico da
    // própria fonte; a posição entre os itens 19 e 21 confirma que é o item 20.
    instrucao: "Os sintomas avaliados por este questionário se referem a sua presença diária ou na maioria dos dias dos últimos três meses. Escolha a melhor resposta para cada questão.",
    tipo: "likert",
    opcoes: [
      { v: 0, t: "Nunca" },
      { v: 1, t: "Raramente" },
      { v: 2, t: "Às vezes" },
      { v: 3, t: "Frequentemente" },
      { v: 4, t: "Sempre" },
    ],
    itens: [
      "Sinto-me cansado(a) ao acordar pela manhã.",
      "Sinto que minha musculatura está enrijecida e dolorida.",
      "Tenho crises de ansiedade.",
      "Costumo apertar (ranger) os dentes.",
      "Tenho diarreia e/ou prisão de ventre.",
      "Preciso de ajuda para fazer as tarefas diárias.",
      "Sou sensível à luminosidade excessiva.",
      "Canso-me facilmente ao realizar atividades diárias que exigem algum esforço físico.",
      "Sinto dor em todo o corpo.",
      "Tenho dores de cabeça.",
      "Sinto desconforto e/ou ardência ao urinar.",
      "Durmo mal.",
      "Tenho dificuldade para me concentrar.",
      "Tenho problemas de pele como ressecamento, coceira e vermelhidão.",
      "O estresse piora meus sintomas.",
      "Me sinto triste ou deprimido(a).",
      "Tenho pouca energia.",
      "Tenho tensão muscular no pescoço e nos ombros.",
      "Tenho dor no queixo.",
      "Fico enjoado(a) e tonto(a) com cheiros como o de perfumes.",
      "Preciso urinar frequentemente.",
      "Quando vou dormir à noite sinto minhas pernas inquietas e desconfortáveis.",
      "Tenho dificuldade para me lembrar das coisas.",
      "Sofri trauma emocional na infância.",
      "Tenho dor na região pélvica.",
    ],
    visitas: ["inicial", "alta", "seguimento4m"],
    escore(r) {
      const soma = r.reduce((a, b) => a + b, 0);
      const faixa = soma < 30 ? "subclínico" : soma < 40 ? "leve" : soma < 50 ? "moderado" : soma < 60 ? "grave" : "extremo";
      return { score: soma, subscores: { faixa: faixa, corte40: soma >= 40 } };
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
    nome: "Qualidade de vida (WHOQOL-abreviado)",
    // Fonte OFICIAL: WHOQOL-abreviado, versão em português do Grupo WHOQOL
    // Brasil (Fleck e cols., UFRGS/OMS), PDF do site oficial do grupo
    // (ufrgs.br/qualidep). Cópia + sintaxe de escore em docs/fontes-instrumentos/.
    // Escore: itens 3, 4 e 26 invertidos; domínios conforme o manual da OMS
    // (físico 3,4,10,15,16,17,18; psicológico 5,6,7,11,19,26; relações 20,21,22;
    // ambiente 8,9,12,13,14,23,24,25), transformados para 0-100.
    // OBS: a sintaxe SPSS distribuída pelo grupo omite o item 19 do domínio
    // psicológico; o manual oficial da OMS o inclui, e este app segue o manual.
    instrucao: "Este questionário é sobre como você se sente a respeito de sua qualidade de vida, saúde e outras áreas de sua vida. Responda pensando nas duas últimas semanas. Se não tiver certeza sobre que resposta dar, escolha a que lhe parece mais apropriada.",
    tipo: "likert",
    opcoes: [],
    itens: (function () {
      const intensidade = [
        { v: 1, t: "Nada" }, { v: 2, t: "Muito pouco" }, { v: 3, t: "Mais ou menos" },
        { v: 4, t: "Bastante" }, { v: 5, t: "Extremamente" }];
      const capacidade = [
        { v: 1, t: "Nada" }, { v: 2, t: "Muito pouco" }, { v: 3, t: "Médio" },
        { v: 4, t: "Muito" }, { v: 5, t: "Completamente" }];
      const satisfacao = [
        { v: 1, t: "Muito insatisfeito(a)" }, { v: 2, t: "Insatisfeito(a)" },
        { v: 3, t: "Nem satisfeito(a) nem insatisfeito(a)" },
        { v: 4, t: "Satisfeito(a)" }, { v: 5, t: "Muito satisfeito(a)" }];
      return [
        { t: "Como você avaliaria sua qualidade de vida?", opcoes: [
          { v: 1, t: "Muito ruim" }, { v: 2, t: "Ruim" }, { v: 3, t: "Nem ruim nem boa" },
          { v: 4, t: "Boa" }, { v: 5, t: "Muito boa" }] },
        { t: "Quão satisfeito(a) você está com a sua saúde?", opcoes: satisfacao },
        { t: "Em que medida você acha que sua dor (física) impede você de fazer o que você precisa?", opcoes: intensidade },
        { t: "O quanto você precisa de algum tratamento médico para levar sua vida diária?", opcoes: intensidade },
        { t: "O quanto você aproveita a vida?", opcoes: intensidade },
        { t: "Em que medida você acha que a sua vida tem sentido?", opcoes: intensidade },
        { t: "O quanto você consegue se concentrar?", opcoes: intensidade },
        { t: "O quanto você se sente em segurança em sua vida diária?", opcoes: intensidade },
        { t: "Quão saudável é o seu ambiente físico (clima, barulho, poluição, atrativos)?", opcoes: intensidade },
        { t: "Você tem energia suficiente para seu dia-a-dia?", opcoes: capacidade },
        { t: "Você é capaz de aceitar sua aparência física?", opcoes: capacidade },
        { t: "Você tem dinheiro suficiente para satisfazer suas necessidades?", opcoes: capacidade },
        { t: "Quão disponíveis para você estão as informações que precisa no seu dia-a-dia?", opcoes: capacidade },
        { t: "Em que medida você tem oportunidades de atividade de lazer?", opcoes: capacidade },
        { t: "Quão bem você é capaz de se locomover?", opcoes: [
          { v: 1, t: "Muito ruim" }, { v: 2, t: "Ruim" }, { v: 3, t: "Nem ruim nem bom" },
          { v: 4, t: "Bom" }, { v: 5, t: "Muito bom" }] },
        { t: "Quão satisfeito(a) você está com o seu sono?", opcoes: satisfacao },
        { t: "Quão satisfeito(a) você está com sua capacidade de desempenhar as atividades do seu dia-a-dia?", opcoes: satisfacao },
        { t: "Quão satisfeito(a) você está com sua capacidade para o trabalho?", opcoes: satisfacao },
        { t: "Quão satisfeito(a) você está consigo mesmo?", opcoes: satisfacao },
        { t: "Quão satisfeito(a) você está com suas relações pessoais (amigos, parentes, conhecidos, colegas)?", opcoes: satisfacao },
        { t: "Quão satisfeito(a) você está com sua vida sexual?", opcoes: satisfacao },
        { t: "Quão satisfeito(a) você está com o apoio que você recebe de seus amigos?", opcoes: satisfacao },
        { t: "Quão satisfeito(a) você está com as condições do local onde mora?", opcoes: satisfacao },
        { t: "Quão satisfeito(a) você está com o seu acesso aos serviços de saúde?", opcoes: satisfacao },
        { t: "Quão satisfeito(a) você está com o seu meio de transporte?", opcoes: satisfacao },
        { t: "Com que frequência você tem sentimentos negativos tais como mau humor, desespero, ansiedade, depressão?", opcoes: [
          { v: 1, t: "Nunca" }, { v: 2, t: "Algumas vezes" }, { v: 3, t: "Frequentemente" },
          { v: 4, t: "Muito frequentemente" }, { v: 5, t: "Sempre" }] },
      ];
    })(),
    visitas: ["inicial", "alta"],
    escore(r) {
      const v = r.slice();
      [2, 3, 25].forEach(function (i) { v[i] = 6 - v[i]; }); // itens 3, 4 e 26 invertidos
      const dom = function (idx) {
        const soma = idx.reduce(function (a, i) { return a + v[i - 1]; }, 0);
        const media = soma / idx.length;
        return Math.round((media * 4 - 4) * (100 / 16) * 10) / 10; // 0 a 100
      };
      return {
        score: null,
        subscores: {
          fisico: dom([3, 4, 10, 15, 16, 17, 18]),
          psicologico: dom([5, 6, 7, 11, 19, 26]),
          relacoes: dom([20, 21, 22]),
          ambiente: dom([8, 9, 12, 13, 14, 23, 24, 25]),
          qv_geral_1a5: r[0],
          satisfacao_saude_1a5: r[1],
        },
      };
    },
  },
];
