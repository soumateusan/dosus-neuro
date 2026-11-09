/* Doença de Parkinson — PCDT (Portaria Conjunta SAES/SECTICS nº 16, de 1º/08/2025) e orientações da SESAB/BA.
   Fonte: https://www.ba.gov.br/saude/saude/publicacoes/patologia/doenca-de-parkinson */
import { apresentacoes as apAlz, esquemas as esqAlz, pedidos as pedAlz } from "../alzheimer/dados.js";

export const LINK_SESAB = "https://www.ba.gov.br/saude/saude/publicacoes/patologia/doenca-de-parkinson";
export const PORTARIA = "Portaria Conjunta SAES/SECTICS nº 16, de 1º de agosto de 2025";

export const cids = [{ cod: "G20", desc: "Doença de Parkinson" }];

/* rivastigmina: mesmas apresentações do Alzheimer */
const riv = Object.fromEntries(Object.entries(apAlz).filter(([, a]) => a.fam === "riv"));

/* "lme" é o texto exato da lista do LME 2026 */
export const apresentacoes = {
  pram0125: { fam: "pram", nome: "Pramipexol 0,125 mg", un: "comprimido", grupo: "1A", lme: "Pramipexol 0,125 mg (comprimido)" },
  pram025: { fam: "pram", nome: "Pramipexol 0,25 mg", un: "comprimido", grupo: "1A", lme: "Pramipexol 0,25 mg (comprimido)" },
  pram1: { fam: "pram", nome: "Pramipexol 1 mg", un: "comprimido", grupo: "1A", lme: "Pramipexol 1 mg (comprimido)" },
  ras1: { fam: "ras", nome: "Rasagilina 1 mg", un: "comprimido", grupo: "1A", lme: "Rasagilina 1 mg (comprimido)" },
  ent200: { fam: "ent", nome: "Entacapona 200 mg", un: "comprimido", grupo: "1A", lme: "Entacapona 200 mg (comprimido)" },
  ama100: { fam: "ama", nome: "Amantadina 100 mg", un: "comprimido", grupo: "1B", lme: "Amantadina 100 mg (comprimido)" },
  clz25: { fam: "clz", nome: "Clozapina 25 mg", un: "comprimido", grupo: "1A", lme: "Clozapina 25 mg (comprimido)" },
  clz100: { fam: "clz", nome: "Clozapina 100 mg", un: "comprimido", grupo: "1A", lme: "Clozapina 100 mg (comprimido)" },
  ...riv,
};

export const familias = {
  pram: { nome: "Pramipexol", termo: "Pramipexol", indicacao: "Agonista dopaminérgico: sintomas motores em monoterapia nas fases iniciais ou associado à levodopa." },
  ras: { nome: "Rasagilina", termo: "Rasagilina", indicacao: "Inibidor da MAO-B: monoterapia inicial ou adjuvante à levodopa nas flutuações motoras. Contraindicada com outros IMAO, analgésicos narcóticos, ciclobenzaprina, fluoxetina/fluvoxamina, insuficiência hepática grave e feocromocitoma." },
  ent: { nome: "Entacapona", termo: "Entacapona", indicacao: "Inibidor da COMT: sempre associado à levodopa, nas flutuações motoras de fim de dose (um comprimido junto de cada dose de levodopa)." },
  ama: { nome: "Amantadina", termo: "Amantadina", indicacao: "Sintomas motores leves e discinesias induzidas por levodopa. Ajustar à função renal." },
  clz: { nome: "Clozapina", termo: "Clozapina", indicacao: "Sintomas psicóticos na doença de Parkinson, em doses baixas. Hemograma semanal nas primeiras 18 semanas e depois mensal." },
  riv: { nome: "Rivastigmina", termo: "Rivastigmina", indicacao: "Demência na doença de Parkinson (critérios do item III do formulário). Exige MEEM e CDR." },
};

const m6 = (...v) => [...v, ...Array(6 - v.length).fill(v[v.length - 1])];

/* esquemas prontos (editáveis) */
export const esquemas = [
  { id: "pram-tit", fam: "pram", nome: "Pramipexol — titulação (0,125 → 0,5 mg 8/8 h)", itens: [
    { ap: "pram0125", pos: "1ª semana: 1 comprimido de 0,125 mg de 8/8 horas.", meses: [21, 0, 0, 0, 0, 0] },
    { ap: "pram025", pos: "2ª semana: 1 comprimido de 0,25 mg de 8/8 horas. A partir da 3ª semana: 2 comprimidos (0,5 mg) de 8/8 horas, uso contínuo.", meses: [105, 180, 180, 180, 180, 180] },
  ] },
  { id: "pram025-8", fam: "pram", nome: "Pramipexol 0,25 mg 8/8 h", itens: [
    { ap: "pram025", pos: "Tomar 1 comprimido por via oral de 8/8 horas, uso contínuo.", meses: m6(90) },
  ] },
  { id: "pram05-8", fam: "pram", nome: "Pramipexol 0,5 mg 8/8 h", itens: [
    { ap: "pram025", pos: "Tomar 2 comprimidos por via oral de 8/8 horas, uso contínuo.", meses: m6(180) },
  ] },
  { id: "pram1-8", fam: "pram", nome: "Pramipexol 1 mg 8/8 h", itens: [
    { ap: "pram1", pos: "Tomar 1 comprimido por via oral de 8/8 horas, uso contínuo.", meses: m6(90) },
  ] },
  { id: "ras1", fam: "ras", nome: "Rasagilina 1 mg/dia", itens: [
    { ap: "ras1", pos: "Tomar 1 comprimido por via oral 1 vez ao dia, uso contínuo.", meses: m6(30) },
  ] },
  ...[3, 4, 5].map((n) => ({ id: `ent${n}`, fam: "ent", nome: `Entacapona 200 mg com levodopa ${n}x/dia`, itens: [
    { ap: "ent200", pos: `Tomar 1 comprimido por via oral junto com cada dose de levodopa (${n} vezes ao dia), uso contínuo.`, meses: m6(n * 30) },
  ] })),
  { id: "ama12", fam: "ama", nome: "Amantadina 100 mg 12/12 h", itens: [
    { ap: "ama100", pos: "Tomar 1 comprimido por via oral de 12/12 horas (última dose até o meio da tarde), uso contínuo.", meses: m6(60) },
  ] },
  { id: "ama8", fam: "ama", nome: "Amantadina 100 mg 8/8 h", itens: [
    { ap: "ama100", pos: "Tomar 1 comprimido por via oral de 8/8 horas (última dose até o meio da tarde), uso contínuo.", meses: m6(90) },
  ] },
  { id: "clz125", fam: "clz", nome: "Clozapina 12,5 mg à noite", itens: [
    { ap: "clz25", pos: "Tomar ½ comprimido (12,5 mg) por via oral à noite, uso contínuo.", meses: m6(15) },
  ] },
  { id: "clz25n", fam: "clz", nome: "Clozapina 25 mg à noite", itens: [
    { ap: "clz25", pos: "Tomar 1 comprimido por via oral à noite, uso contínuo.", meses: m6(30) },
  ] },
  { id: "clz50", fam: "clz", nome: "Clozapina 50 mg/dia", itens: [
    { ap: "clz25", pos: "Tomar 2 comprimidos por via oral à noite, uso contínuo.", meses: m6(60) },
  ] },
  { id: "clz100", fam: "clz", nome: "Clozapina 100 mg à noite", itens: [
    { ap: "clz100", pos: "Tomar 1 comprimido por via oral à noite, uso contínuo.", meses: m6(30) },
  ] },
  ...esqAlz.filter((e) => e.fam === "riv"),
];

/* exames para abertura, por medicamento (validade em meses) */
export const exames = [
  { id: "tgo", nome: "AST/TGO", val: 3, para: ["ras"] },
  { id: "tgp", nome: "ALT/TGP", val: 3, para: ["ras"] },
  { id: "ureia", nome: "Ureia", val: 3, para: ["ama"] },
  { id: "creat", nome: "Creatinina", val: 3, para: ["ama"] },
  { id: "hemo", nome: "Hemograma", val: 3, para: ["clz"] },
];

const PED = ["tgo", "tgp", "ureia", "creat", "hemo"];
export const pedidos = pedAlz.filter((p) => PED.includes(p.id));

/* ---------- formulário de acesso (modelo 2026) ---------- */
export const obrigatorios = [["bradi", "Bradicinesia (Obrigatório)"], ["rigidez", "Rigidez Muscular"], ["tremor", "Tremor De Repouso 4-6 Hz: Clinicamente"]];
export const suporte = [
  "Excelente Resposta a Terapia Dopaminérgica;",
  "Discinesias Induzidas por Levodopa;",
  "Tremor De Repouso Em Membros;",
  "Perda olfativa ou denervação simpática cardíaca na cintilografia.",
];
export const alerta = [
  "Rápida progressão do comprometimento da marcha;",
  "Ausência completa de progressão dos sintomas ou sinais motores ≥ 5 anos",
  "Disfunção bulbar precoce;",
  "Disfunção respiratória inspiratória;",
  "Insuficiência autonômica grave nos primeiros 5 anos de doença;",
  "Quedas recorrentes (> 1 por ano)",
  "Antercolo distônico e contraturas de mãos ou pés nos primeiros 10 anos;",
  "Ausência de qualquer uma das características não motoras comuns da doença;",
  "Sinais do trato piramidal inexplicáveis;",
  "Parkinsonismo simétrico bilateral.",
];
export const exclusao = [
  "Anormalidade cerebelares inequívocos;",
  "Paralisia do olhar vertical para baixo ou lentificação das sácades verticais;",
  "Diagnóstico de demência provável frontotemporal;",
  "Parkinsonismo restrito aos membros inferiores por mais de 3 anos;",
  "Uso de medicamentos que causam parkinsonismo (Neurolépticos/Depletores);",
  "Ausência de resposta a altas doses de levodopa;",
  "Perda sensorial cortical inequívoca;",
  "Neuroimagem funcional normal inequívoca do sistema dopaminérgico pré-sináptico;",
  "Evidência de outra doença ou síndrome parkinsoniana atípica.",
];
export const inclusaoDDP = [
  "Comprometimento das atividades de vida diária pela perda cognitiva;",
  "Ausência da depressão maior;",
  "Ausência de delírio;",
  "Ausência de outras condições clínicas que justifiquem a perda cognitiva, como por ex. Doença de Alzheimer.",
];
export const ciRasagilina = [
  "Diagnóstico de insuficiência hepática grave",
  "Uso de outro inibidor da MAO",
  "Em uso de analgésicos narcóticos",
  "Em uso de ciclobenzaprina",
  "Paciente com diagnóstico de feocromocitoma",
  "Em uso de fluoxetina ou fluvoxamina",
  "Indicação de realização de procedimentos cirúrgicos nos próximos 15 dias",
];

export const documentos = [
  { id: "ident", nome: "Cópia do documento de identidade e CPF do paciente" },
  { id: "resid", nome: "Cópia do comprovante de residência (paciente ou responsável legal)", nota: "Se em nome de terceiros, preencher o formulário específico da SESAB." },
  { id: "lme", nome: "LME adequadamente preenchido (renovar semestralmente)" },
  { id: "presc", nome: "Prescrição médica (Lei 13.732/2018, Portaria SVS/MS 344/1998, RDC 20/2011)" },
  { id: "ter", nome: "Termo de Esclarecimento e Responsabilidade (TER)" },
  { id: "acessoOuRel", nome: "Formulário de acesso OU relatório médico" },
];

export const unidades = [
  { regiao: "Capital e Região Metropolitana", nome: "CREASI — Centro de Referência Estadual de Atenção à Saúde do Idoso",
    end: "Av. Antônio Carlos Magalhães, s/nº, Edf. Professor José Maria de Magalhães Neto, Salvador - BA, 41820-000",
    tel: "Farmácia: 3354-3270 · 5739 · 5733", horario: "8h às 17h", email: "creasi.farmacia@saude.ba.gov.br" },
  { regiao: "Interior", nome: "Bases Regionais de Saúde e Núcleos Regionais de Saúde (antigas DIRES)" },
];
