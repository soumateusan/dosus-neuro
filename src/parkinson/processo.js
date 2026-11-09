import { hojeISO } from "../shared/ui.jsx";
import { meemCalc, meemInicial } from "../shared/meem.jsx";
import { cdrCalc, cdrInicial } from "../shared/cdr.jsx";
import { situacaoExame } from "../alzheimer/dados.js";
import { apresentacoes, familias, exames } from "./dados.js";

export const novoParkinson = () => ({
  cid: "G20",
  tipo: "inicio",
  hist: {
    inicioDP: "", inicioDDP: "", sintomas: "", estadio: "", levodopa: null, levodopaDose: "",
    outrosMeds: "", comorbidades: "", tratPrevio: null, tratTexto: "",
  },
  form: {
    obrig: {}, classif: null, suporte: [], alerta: [], exclusao: [],
    ddp: null, inclDDP: [false, false, false, false], ciRas: [], data: hojeISO(),
  },
  meem: meemInicial, meemData: hojeISO(),
  cdr: cdrInicial, cdrAplicado: false, cdrData: hojeISO(),
  presc: { itens: [], data: hojeISO() },
  lme: { anamnese: "", anamneseEditada: false, preenchidoPor: "medico", outroNome: "", outroCPF: "", docTipo: "CPF", data: hojeISO() },
  termo: { autoriza: null, local: "", data: hojeISO() },
  rel: { extra: "", usadoEm: null },
  exames: {},
  solic: { marcados: {}, codigos: {}, outros: [], motivo: "", data: hojeISO(), agrupar: false, principal: null, apacObs: "" },
  docs: { ident: false, resid: false },
});

const vazio = (v) => v == null || String(v).trim() === "";
const algum = (arr) => (arr || []).some(Boolean);

export function derivar(pac, d, med) {
  const itens = d.presc.itens || [];
  const fams = [...new Set(itens.map((i) => apresentacoes[i.ap]?.fam).filter(Boolean))];
  const nomesFam = fams.map((f) => familias[f].nome);
  const f = d.form;
  const temRiv = fams.includes("riv"), temRas = fams.includes("ras"), temEnt = fams.includes("ent");
  const meem = meemCalc(d.meem), cdr = cdrCalc(d.cdr);
  const meemAplicado = meem.marcados;

  /* exames obrigatórios conforme os medicamentos */
  const exStatus = exames.filter((e) => e.para.some((x) => fams.includes(x))).map((e) => ({ ...e, sit: situacaoExame(e, d.exames[e.id]) }));
  const exPend = exStatus.filter((e) => !e.sit.ok);

  /* contraindicações e alertas */
  const ciRas = temRas && algum(f.ciRas);
  const entSemLevodopa = temEnt && d.hist.levodopa === false;
  const excluido = algum(f.exclusao);
  const contraind = ciRas || entSemLevodopa;

  const faltaMed = [];
  if (vazio(med.nome)) faltaMed.push("nome do médico");
  if (vazio(med.crm)) faltaMed.push("CRM");
  if (vazio(med.uf)) faltaMed.push("UF do CRM");

  const faltaLME = [];
  if (vazio(med.cnes)) faltaLME.push("CNES");
  if (vazio(med.estabelecimento)) faltaLME.push("estabelecimento");
  if (vazio(pac.nome)) faltaLME.push("nome do paciente");
  if (vazio(pac.mae)) faltaLME.push("nome da mãe");
  if (vazio(pac.peso)) faltaLME.push("peso");
  if (vazio(pac.altura)) faltaLME.push("altura");
  if (!itens.length) faltaLME.push("medicamento");
  if (d.hist.tratPrevio == null) faltaLME.push("tratamento prévio (sim/não)");
  if (vazio(med.nome)) faltaLME.push("nome do médico");
  if (vazio(med.cns)) faltaLME.push("CNS do médico");
  if (pac.incapaz && vazio(pac.responsavel)) faltaLME.push("nome do responsável");

  const faltaPresc = [];
  if (!itens.length) faltaPresc.push("escolher o medicamento");
  if (vazio(pac.nome)) faltaPresc.push("nome do paciente");
  faltaPresc.push(...faltaMed);

  const faltaTER = [];
  if (vazio(pac.nome)) faltaTER.push("nome do paciente");
  if (d.termo.autoriza == null) faltaTER.push("autorização de uso das informações");
  if (!itens.length) faltaTER.push("medicamento");
  if (vazio(d.termo.local) && vazio(med.cidade)) faltaTER.push("local");
  if (pac.incapaz && vazio(pac.responsavel)) faltaTER.push("responsável legal");
  faltaTER.push(...faltaMed);

  const faltaAcesso = [];
  if (vazio(pac.nome)) faltaAcesso.push("nome do paciente");
  if (vazio(pac.nascimento)) faltaAcesso.push("data de nascimento");
  if (!f.obrig?.bradi) faltaAcesso.push("bradicinesia (obrigatória)");
  if (!f.obrig?.rigidez && !f.obrig?.tremor) faltaAcesso.push("rigidez ou tremor de repouso");
  if (!f.classif) faltaAcesso.push("classificação (provável/estabelecida)");
  if (excluido) faltaAcesso.push("há critério de exclusão marcado");
  if (f.ddp == null) faltaAcesso.push("demência na DP (sim/não)");
  if (f.ddp === "sim") {
    if (vazio(d.hist.inicioDP) || vazio(d.hist.inicioDDP)) faltaAcesso.push("datas de início da DP e da DDP");
    if (!f.inclDDP.every(Boolean)) faltaAcesso.push("critérios de inclusão da DDP");
  }
  if (temRiv && f.ddp !== "sim") faltaAcesso.push("rivastigmina exige demência na DP");
  if (d.hist.tratPrevio == null) faltaAcesso.push("antecedentes terapêuticos");
  if (temEnt && d.hist.levodopa == null) faltaAcesso.push("uso de levodopa (entacapona)");
  if (entSemLevodopa) faltaAcesso.push("entacapona sem levodopa");
  if (ciRas) faltaAcesso.push("contraindicação à rasagilina marcada");
  faltaAcesso.push(...faltaMed);

  const faltaRel = [];
  if (vazio(d.hist.inicioDP)) faltaRel.push("data de início da DP");
  if (vazio(d.hist.sintomas)) faltaRel.push("história clínica");
  if (!itens.length) faltaRel.push("medicamento solicitado");
  if (d.hist.tratPrevio == null) faltaRel.push("tratamento prévio");
  if (temRiv && !f.inclDDP.every(Boolean)) faltaRel.push("ausência de depressão maior, delírio e outras causas");
  if (!d.rel.usadoEm) faltaRel.push("copiar ou imprimir o relatório");

  const checklist = [
    { id: "ident", nome: "Identidade e CPF do paciente (cópia)", ok: d.docs.ident, manual: true, falta: ["confirmar que o paciente trouxe a cópia"] },
    { id: "resid", nome: "Comprovante de residência (cópia)", ok: d.docs.resid, manual: true, falta: ["confirmar a cópia; se em nome de terceiros, formulário específico"] },
  ];
  if (temRiv) {
    checklist.push({ id: "meem", nome: "MEEM", sec: "meem", ok: meemAplicado, falta: ["aplicar o MEEM (rivastigmina)"] });
    checklist.push({ id: "cdr", nome: "CDR", sec: "cdr", ok: d.cdrAplicado, falta: ["aplicar o CDR (rivastigmina)"] });
  }
  if (exStatus.length) checklist.push({ id: "exames", nome: "Exames obrigatórios", sec: "exames", ok: exPend.length === 0, falta: exPend.map((e) => `${e.nome}: ${e.sit.txt}`) });
  checklist.push(
    { id: "presc", nome: "Prescrição médica", sec: "prescricao", ok: faltaPresc.length === 0, falta: faltaPresc },
    { id: "lme", nome: "LME", sec: "lme", ok: faltaLME.length === 0, falta: faltaLME },
    { id: "ter", nome: "Termo de Esclarecimento (TER)", sec: "termo", ok: faltaTER.length === 0, falta: faltaTER },
    { id: "acessoOuRel", nome: "Formulário de acesso OU relatório", sec: faltaAcesso.length <= faltaRel.length ? "acesso" : "relatorio",
      ok: faltaAcesso.length === 0 || faltaRel.length === 0,
      falta: faltaAcesso.length <= faltaRel.length ? faltaAcesso.map((x) => `formulário: ${x}`) : faltaRel.map((x) => `relatório: ${x}`) },
  );
  const feitos = checklist.filter((c) => c.ok).length;

  return { itens, fams, nomesFam, temRiv, temRas, temEnt, meem, cdr, meemAplicado, exStatus, exPend, ciRas, entSemLevodopa, excluido, contraind,
    faltaLME, faltaPresc, faltaTER, faltaAcesso, faltaRel, checklist, feitos };
}
