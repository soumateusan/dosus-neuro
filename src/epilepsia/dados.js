/* Epilepsia — PCDT (Portaria Conjunta SAES/SCTIE nº 17, de 21/06/2018) e orientações da SESAB/BA.
   Fonte: https://www.ba.gov.br/saude/publicacoes/patologia/epilepsia-refrataria */

export const LINK_SESAB = "https://www.ba.gov.br/saude/publicacoes/patologia/epilepsia-refrataria";
export const PORTARIA = "PORTARIA CONJUNTA Nº 17, DE 21 DE JUNHO DE 2018";

export const cids = [
  { cod: "G40.0", desc: "Epilepsia e síndromes epilépticas idiopáticas definidas por sua localização (focal) (parcial) com crises de início focal" },
  { cod: "G40.1", desc: "Epilepsia e síndromes epilépticas sintomáticas definidas por sua localização (focal) (parcial) com crises parciais simples" },
  { cod: "G40.2", desc: "Epilepsia e síndromes epilépticas sintomáticas definidas por sua localização (focal) (parcial) com crises parciais complexas" },
  { cod: "G40.3", desc: "Epilepsia e síndromes epilépticas generalizadas idiopáticas" },
  { cod: "G40.4", desc: "Outras epilepsias e síndromes epilépticas generalizadas" },
  { cod: "G40.5", desc: "Síndromes epilépticas especiais" },
  { cod: "G40.6", desc: "Crises de grande mal, não especificada (com ou sem pequeno mal)" },
  { cod: "G40.7", desc: "Pequeno mal não especificado, sem crises de grande mal" },
  { cod: "G40.8", desc: "Outras epilepsias" },
];

/* apresentações do CEAF — "lme" é o texto exato da lista do LME 2026 */
export const apresentacoes = {
  clb10: { fam: "clb", nome: "Clobazam 10 mg", un: "comprimido", grupo: "2", lme: "Clobazam 10 mg (comprimido)" },
  eto: { fam: "eto", nome: "Etossuximida 50 mg/mL (frasco 120 mL)", un: "frasco", grupo: "2", lme: "Etossuximida 50 mg/mL (frasco de 120mL)" },
  gbp300: { fam: "gbp", nome: "Gabapentina 300 mg", un: "cápsula", grupo: "2", lme: "Gabapentina 300 mg (cápsula)" },
  ltg25: { fam: "ltg", nome: "Lamotrigina 25 mg", un: "comprimido", grupo: "2", lme: "Lamotrigina 25 mg (comprimido)" },
  ltg50: { fam: "ltg", nome: "Lamotrigina 50 mg", un: "comprimido", grupo: "2", lme: "Lamotrigina 50 mg (comprimido)" },
  ltg100: { fam: "ltg", nome: "Lamotrigina 100 mg", un: "comprimido", grupo: "2", lme: "Lamotrigina 100 mg (comprimido)" },
  lev250: { fam: "lev", nome: "Levetiracetam 250 mg", un: "comprimido", grupo: "1A", lme: "Levetiracetam 250 mg (comprimido)" },
  lev500: { fam: "lev", nome: "Levetiracetam 500 mg", un: "comprimido", grupo: "1A", lme: "Levetiracetam 500 mg (comprimido)" },
  lev750: { fam: "lev", nome: "Levetiracetam 750 mg", un: "comprimido", grupo: "1A", lme: "Levetiracetam 750 mg (comprimido)" },
  lev1000: { fam: "lev", nome: "Levetiracetam 1000 mg", un: "comprimido", grupo: "1A", lme: "Levetiracetam 1000 mg (comprimido)" },
  levSol: { fam: "lev", nome: "Levetiracetam 100 mg/mL solução oral (frasco 150 mL)", un: "frasco", grupo: "1A", lme: "Levetiracetam 100 mg/ml solução oral (por frasco de 150 mL)" },
  top25: { fam: "top", nome: "Topiramato 25 mg", un: "comprimido", grupo: "2", lme: "Topiramato 25 mg (comprimido)" },
  top50: { fam: "top", nome: "Topiramato 50 mg", un: "comprimido", grupo: "2", lme: "Topiramato 50 mg (comprimido)" },
  top100: { fam: "top", nome: "Topiramato 100 mg", un: "comprimido", grupo: "2", lme: "Topiramato 100 mg (comprimido)" },
  vgb500: { fam: "vgb", nome: "Vigabatrina 500 mg", un: "comprimido", grupo: "2", lme: "Vigabatrina 500 mg (comprimido)" },
};

/* espectro (observações da SESAB): associar um de espectro amplo com um de espectro restrito */
export const familias = {
  lev: { nome: "Levetiracetam", termo: "levetiracetam", espectro: "amplo",
    indicacao: "Epilepsia focal e primariamente generalizada como terapia adjuvante em casos refratários à monoterapia de primeira linha; crises mioclônicas em EMJ (adjuvante, refratários); crises em pacientes com microcefalia (adjuvante, após falha de outros FAE do PCDT)." },
  ltg: { nome: "Lamotrigina", termo: "lamotrigina", espectro: "amplo",
    indicacao: "Monoterapia de crises focais ou primariamente generalizadas em > 12 anos com intolerância ou refratariedade a FAE de primeira linha; adjuvante em crises focais e na síndrome de Lennox-Gastaut em > 2 anos." },
  top: { nome: "Topiramato", termo: "topiramato", espectro: "amplo",
    indicacao: "Monoterapia de crises focais ou primariamente TCG em > 10 anos com intolerância ou refratariedade a outros de primeira linha; adjuvante em crises focais, primariamente generalizadas ou da síndrome de Lennox-Gastaut em > 2 anos." },
  clb: { nome: "Clobazam", termo: "clobazam", espectro: "amplo",
    indicacao: "Terapia adjuvante de crises parciais e generalizadas refratárias; terapia intermitente (por exemplo, crises catameniais)." },
  gbp: { nome: "Gabapentina", termo: "gabapentina", espectro: "restrito",
    indicacao: "Terapia adjuvante de crises focais com ou sem generalização secundária em pacientes > 3 anos." },
  vgb: { nome: "Vigabatrina", termo: "vigabatrina", espectro: "restrito",
    indicacao: "Monoterapia de espasmos epilépticos, particularmente na esclerose tuberosa; adjuvante em crises focais com ou sem generalização secundária em qualquer idade." },
  eto: { nome: "Etossuximida", termo: "etossuximida", espectro: "restrito",
    indicacao: "Crises de ausência em pacientes com 3 anos ou mais; adjuvante de mioclonias negativas, crises astáticas e certas epilepsias mioclônicas." },
};

/* FAE do componente básico (não vêm pelo CEAF, mas entram no termo e no formulário) */
export const faeBasicos = [
  { id: "cbz", nome: "Carbamazepina", espectro: "restrito" },
  { id: "vpa", nome: "Ácido valproico/valproato de sódio", espectro: "amplo" },
  { id: "pht", nome: "Fenitoína", espectro: "restrito" },
  { id: "pb", nome: "Fenobarbital", espectro: "restrito" },
  { id: "czp", nome: "Clonazepam", espectro: "amplo" },
  { id: "pri", nome: "Primidona", espectro: "restrito" },
];

const m6 = (...v) => [...v, ...Array(6 - v.length).fill(v[v.length - 1])];
const fr = (mlDia, tam) => Math.ceil((mlDia * 30) / tam);

/* esquemas prontos (doses de adulto; em crianças ajuste por peso) — tudo editável depois */
export const esquemas = [
  { id: "lev-tit", fam: "lev", nome: "Levetiracetam — titulação (500 → 1000 mg 12/12 h)", itens: [
    { ap: "lev500", pos: "Tomar 1 comprimido por via oral de 12/12 horas por 2 semanas; depois 2 comprimidos de 12/12 horas.", meses: [90, 0, 0, 0, 0, 0] },
    { ap: "lev1000", pos: "A partir do 2º mês, tomar 1 comprimido de 1000 mg por via oral de 12/12 horas, uso contínuo.", meses: [0, 60, 60, 60, 60, 60] },
  ] },
  ...[["lev250", "250"], ["lev500", "500"], ["lev750", "750"], ["lev1000", "1000"]].map(([ap, mg]) => ({
    id: `${ap}-12`, fam: "lev", nome: `Levetiracetam ${mg} mg 12/12 h`, itens: [
      { ap, pos: "Tomar 1 comprimido por via oral de 12/12 horas, uso contínuo.", meses: m6(60) },
    ] })),
  { id: "lev1500", fam: "lev", nome: "Levetiracetam 1500 mg 12/12 h", itens: [
    { ap: "lev750", pos: "Tomar 2 comprimidos por via oral de 12/12 horas, uso contínuo.", meses: m6(120) },
  ] },
  ...[2.5, 5, 10].map((ml) => ({ id: `levSol${ml}`, fam: "lev", nome: `Levetiracetam solução — ${String(ml).replace(".", ",")} mL 12/12 h`, itens: [
    { ap: "levSol", pos: `Tomar ${String(ml).replace(".", ",")} mL (${ml * 100} mg) por via oral de 12/12 horas, uso contínuo.`, meses: m6(fr(ml * 2, 150)) },
  ] })),

  { id: "ltg-tit", fam: "ltg", nome: "Lamotrigina — titulação lenta (sem valproato)", itens: [
    { ap: "ltg25", pos: "Semanas 1 e 2: 1 comprimido de 25 mg por dia. Semanas 3 e 4: 2 comprimidos (50 mg) por dia.", meses: [42, 0, 0, 0, 0, 0] },
    { ap: "ltg50", pos: "2º mês: 1 comprimido de 50 mg de 12/12 horas (100 mg/dia).", meses: [0, 60, 0, 0, 0, 0] },
    { ap: "ltg100", pos: "A partir do 3º mês: 1 comprimido de 100 mg de 12/12 horas (200 mg/dia), uso contínuo.", meses: [0, 0, 60, 60, 60, 60] },
  ] },
  ...[["ltg50", "50"], ["ltg100", "100"]].map(([ap, mg]) => ({
    id: `${ap}-12`, fam: "ltg", nome: `Lamotrigina ${mg} mg 12/12 h`, itens: [
      { ap, pos: "Tomar 1 comprimido por via oral de 12/12 horas, uso contínuo.", meses: m6(60) },
    ] })),

  { id: "top-tit", fam: "top", nome: "Topiramato — titulação (25 → 50 mg 12/12 h)", itens: [
    { ap: "top25", pos: "1ª semana: 1 comprimido à noite. 2ª: 1 de 12/12 h. 3ª: 1 pela manhã e 2 à noite. 4ª: 2 de 12/12 h.", meses: [70, 0, 0, 0, 0, 0] },
    { ap: "top50", pos: "A partir do 2º mês: 1 comprimido de 50 mg de 12/12 horas, uso contínuo.", meses: [0, 60, 60, 60, 60, 60] },
  ] },
  ...[["top50", "50"], ["top100", "100"]].map(([ap, mg]) => ({
    id: `${ap}-12`, fam: "top", nome: `Topiramato ${mg} mg 12/12 h`, itens: [
      { ap, pos: "Tomar 1 comprimido por via oral de 12/12 horas, uso contínuo.", meses: m6(60) },
    ] })),

  { id: "clb10n", fam: "clb", nome: "Clobazam 10 mg à noite", itens: [
    { ap: "clb10", pos: "Tomar 1 comprimido por via oral à noite, uso contínuo.", meses: m6(30) },
  ] },
  { id: "clb10-12", fam: "clb", nome: "Clobazam 10 mg 12/12 h", itens: [
    { ap: "clb10", pos: "Tomar 1 comprimido por via oral de 12/12 horas, uso contínuo.", meses: m6(60) },
  ] },

  { id: "gbp-tit", fam: "gbp", nome: "Gabapentina — titulação (300 mg 8/8 h)", itens: [
    { ap: "gbp300", pos: "1º dia: 1 cápsula à noite. 2º dia: 1 cápsula de 12/12 h. A partir do 3º dia: 1 cápsula de 8/8 horas, uso contínuo.", meses: m6(90) },
  ] },
  { id: "gbp600", fam: "gbp", nome: "Gabapentina 600 mg 8/8 h", itens: [
    { ap: "gbp300", pos: "Tomar 2 cápsulas por via oral de 8/8 horas, uso contínuo.", meses: m6(180) },
  ] },

  ...[[1, 60], [2, 120], [3, 180]].map(([n, q]) => ({ id: `vgb${n}`, fam: "vgb", nome: `Vigabatrina ${n * 500} mg 12/12 h`, itens: [
    { ap: "vgb500", pos: `Tomar ${n} comprimido${n > 1 ? "s" : ""} por via oral de 12/12 horas, uso contínuo.`, meses: m6(q) },
  ] })),

  ...[5, 7.5, 10].map((ml) => ({ id: `eto${ml}`, fam: "eto", nome: `Etossuximida — ${String(ml).replace(".", ",")} mL 12/12 h`, itens: [
    { ap: "eto", pos: `Tomar ${String(ml).replace(".", ",")} mL (${ml * 50} mg) por via oral de 12/12 horas, uso contínuo.`, meses: m6(fr(ml * 2, 120)) },
  ] })),
];

/* exames: nenhum obrigatório para abrir o processo; validade em meses */
export const exames = [
  { id: "eeg", nome: "Laudo do eletroencefalograma (EEG)", val: 12, nota: "complementar para diagnóstico" },
  { id: "rm", nome: "RM do encéfalo", val: 12, nota: "apenas para epilepsias focais refratárias" },
];
export const examesMonitoramento = [
  { id: "hemo", nome: "Hemograma com plaquetas" }, { id: "tgp", nome: "ALT/TGP" }, { id: "tgo", nome: "AST/TGO" },
  { id: "na", nome: "Sódio" }, { id: "k", nome: "Potássio" }, { id: "lip", nome: "Colesterol total e frações" },
  { id: "tg", nome: "Triglicerídeos" }, { id: "vitd", nome: "Vitamina D" }, { id: "tsh", nome: "TSH" }, { id: "t4", nome: "T4 livre" },
].map((e) => ({ ...e, val: 12 }));

/* pedidos de exame (códigos SIGTAP editáveis na tela — confira no SIGTAP) */
export const pedidos = [
  { id: "eeg", nome: "Eletroencefalograma (EEG)", cod: "0211050083", ref: "eeg", grupo: "imagem" },
  { id: "rm", nome: "Ressonância magnética de crânio", cod: "0207010064", ref: "rm", grupo: "imagem" },
  { id: "hemo", nome: "Hemograma completo", cod: "0202020380", ref: "hemo", grupo: "lab" },
  { id: "plaq", nome: "Contagem de plaquetas", cod: "0202020029", ref: "hemo", grupo: "lab" },
  { id: "tgp", nome: "Dosagem de transaminase glutâmico-pirúvica (TGP/ALT)", cod: "0202010651", ref: "tgp", grupo: "lab" },
  { id: "tgo", nome: "Dosagem de transaminase glutâmico-oxalacética (TGO/AST)", cod: "0202010643", ref: "tgo", grupo: "lab" },
  { id: "na", nome: "Dosagem de sódio", cod: "0202010635", ref: "na", grupo: "lab" },
  { id: "k", nome: "Dosagem de potássio", cod: "0202010600", ref: "k", grupo: "lab" },
  { id: "ct", nome: "Dosagem de colesterol total", cod: "0202010295", ref: "lip", grupo: "lab" },
  { id: "hdl", nome: "Dosagem de colesterol HDL", cod: "0202010279", ref: "lip", grupo: "lab" },
  { id: "ldl", nome: "Dosagem de colesterol LDL", cod: "0202010287", ref: "lip", grupo: "lab" },
  { id: "tg", nome: "Dosagem de triglicerídeos", cod: "0202010678", ref: "tg", grupo: "lab" },
  { id: "vitd", nome: "Dosagem de 25-hidroxivitamina D", cod: "0202010767", ref: "vitd", grupo: "lab" },
  { id: "tsh", nome: "Dosagem de hormônio tireoestimulante (TSH)", cod: "0202060250", ref: "tsh", grupo: "lab" },
  { id: "t4", nome: "Dosagem de tiroxina livre (T4 livre)", cod: "0202060381", ref: "t4", grupo: "lab" },
];

/* tipos de crise — ILAE 2017, como no formulário de acesso */
export const crises = [
  { id: "f", nome: "1. Início focal", grupos: [
    { nome: null, itens: [["f-perc", "Perceptiva"], ["f-disp", "Disperceptiva"]] },
    { nome: "Motora", itens: [["f-auto", "automatismo"], ["f-aton", "atônicas"], ["f-clon", "clônicas"], ["f-esp", "espasmos epilépticos"], ["f-hiper", "hipercinéticas"], ["f-mio", "mioclônicas"], ["f-ton", "tônicas"]] },
    { nome: "Não motora", itens: [["f-autn", "autonômicas"], ["f-parada", "parada comportamental"], ["f-cogn", "cognitivas"], ["f-emoc", "emocionais"], ["f-sens", "sensoriais"], ["f-tcb", "focal evoluindo para tônico-clônica bilateral"]] },
  ] },
  { id: "g", nome: "2. Início generalizado", grupos: [
    { nome: "Motora", itens: [["g-tc", "tônico-clônicas"], ["g-clon", "clônicas"], ["g-ton", "tônicas"], ["g-mio", "mioclônicas"], ["g-mtc", "mioclônico-tônico-clônicas"], ["g-mat", "mioclônico-atônicas"], ["g-aton", "atônicas"], ["g-esp", "espasmos epilépticos"]] },
    { nome: "Não motora (ausências)", itens: [["g-tip", "típicas"], ["g-atip", "atípicas"], ["g-amio", "mioclônicas"], ["g-palp", "mioclonias palpebrais"]] },
  ] },
  { id: "d", nome: "3. Início desconhecido", grupos: [
    { nome: "Motora", itens: [["d-tc", "tônico-clônicas"], ["d-esp", "espasmos epilépticos"]] },
    { nome: "Não motora", itens: [["d-parada", "parada comportamental"]] },
  ] },
];
export const nomeCrise = Object.fromEntries(crises.flatMap((c) => c.grupos.flatMap((g) => g.itens.map(([id, n]) => [id, `${c.nome.replace(/^\d\. /, "").toLowerCase()}${g.nome ? ` ${g.nome.toLowerCase()}` : ""}: ${n.toLowerCase()}`]))));

export const inclusao = [
  "Tem apresentado duas crises epilépticas no intervalo mínimo de 24 horas;",
  "Tem apresentado uma crise e tem um risco de recorrência de crises acima de 60%;",
  "Tem diagnóstico estabelecido de uma síndrome epiléptica específica.",
];

export const documentos = [
  { id: "ident", nome: "Cópia do documento de identidade e CPF do paciente" },
  { id: "resid", nome: "Cópia do comprovante de residência (paciente ou responsável legal)", nota: "Se em nome de terceiros, preencher o formulário específico da SESAB." },
  { id: "lme", nome: "LME adequadamente preenchido (renovar semestralmente)" },
  { id: "presc", nome: "Prescrição médica (Lei 13.732/2018, Portaria SVS/MS 344/1998)" },
  { id: "ter", nome: "Termo de Esclarecimento e Responsabilidade (TER)" },
  { id: "acessoOuRel", nome: "Formulário de acesso OU relatório médico" },
];

export const unidades = [
  { regiao: "Capital e Região Metropolitana", nome: "HEML — Hospital Especializado Mario Leal",
    end: "Rua Conde de Porto Alegre, 11, IAPI (próximo ao Atakarejo), Salvador - BA",
    tel: "(71) 3256-8216 · (71) 99330-4725 (WhatsApp)", horario: "7h às 16h", email: "hmleal.farmacia@saude.ba.gov.br" },
  { regiao: "Interior", nome: "Núcleos Regionais de Saúde ou Bases Regionais de Saúde (antigas DIRES)" },
];
