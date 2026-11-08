import { hojeISO } from "../shared/ui.jsx";
import { situacaoExame } from "../alzheimer/dados.js";
import { apresentacoes, familias, faeBasicos, exames } from "./dados.js";

export const novaEpilepsia = () => ({
  cid: "",
  tipo: "inicio", // inicio | continuidade | troca
  hist: {
    descricao: "", idadeInicio: "", frequencia: "", ultimaCrise: "", etiologia: "",
    eegData: "", eegLaudo: "", rmData: "", rmLaudo: "",
    comorbidades: "", basicos: {}, outrosMeds: "",
    tratPrevio: null, tratTexto: "",
  },
  incl: [false, false, false],
  crises: {}, crisesOutras: "",
  trat: { mono1: null, mono2: null, assoc: null, justif: "", data: hojeISO() },
  presc: { itens: [], data: hojeISO() },
  lme: { anamnese: "", anamneseEditada: false, preenchidoPor: "medico", outroNome: "", outroCPF: "", docTipo: "CPF", data: hojeISO() },
  termo: { autoriza: null, local: "", data: hojeISO() },
  rel: { extra: "", usadoEm: null },
  exames: {},
  solic: { marcados: {}, codigos: {}, outros: [], motivo: "", data: hojeISO(), agrupar: false, principal: null, apacObs: "" },
  docs: { ident: false, resid: false },
});

const vazio = (v) => v == null || String(v).trim() === "";

/* pares com o mesmo mecanismo de ação, citados pela SESAB como a evitar */
const MESMO_MECANISMO = [["cbz", "pht"], ["pb", "vpa"]];

export function derivar(pac, d, med) {
  const itens = d.presc.itens || [];
  const fams = [...new Set(itens.map((i) => apresentacoes[i.ap]?.fam).filter(Boolean))];
  const nomesFam = fams.map((f) => familias[f].nome);
  const basicos = faeBasicos.filter((b) => d.hist.basicos?.[b.id]);
  /* todos os FAE do tratamento (CEAF + componente básico) */
  const emUso = [...fams.map((f) => ({ id: f, nome: familias[f].nome, espectro: familias[f].espectro })), ...basicos];
  const crisesMarcadas = Object.keys(d.crises || {}).filter((k) => d.crises[k]);

  /* associação: um de espectro amplo + um de espectro restrito; evitar mesmo mecanismo */
  let alertaAssoc = null;
  if (emUso.length >= 2) {
    const amplo = emUso.some((x) => x.espectro === "amplo"), restrito = emUso.some((x) => x.espectro === "restrito");
    const ids = emUso.map((x) => x.id);
    const repetido = MESMO_MECANISMO.find(([a, b]) => ids.includes(a) && ids.includes(b));
    if (repetido) alertaAssoc = `associação com o mesmo mecanismo de ação (${repetido.map((i) => faeBasicos.find((b) => b.id === i).nome.split("/")[0]).join(" + ")})`;
    else if (!(amplo && restrito)) alertaAssoc = `associação sem a combinação espectro amplo + espectro restrito (${emUso.map((x) => x.nome.split("/")[0]).join(" + ")})`;
  }

  const exStatus = exames.map((e) => ({ ...e, sit: situacaoExame(e, d.exames[e.id]) }));

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
  if (vazio(d.cid)) faltaLME.push("CID-10");
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
  if (!emUso.length) faltaTER.push("medicamento");
  if (vazio(d.termo.local) && vazio(med.cidade)) faltaTER.push("local");
  if (pac.incapaz && vazio(pac.responsavel)) faltaTER.push("responsável legal");
  faltaTER.push(...faltaMed);

  const t = d.trat;
  const faltaAcesso = [];
  if (vazio(pac.nome)) faltaAcesso.push("nome do paciente");
  if (vazio(d.cid)) faltaAcesso.push("CID-10");
  if (vazio(d.hist.descricao)) faltaAcesso.push("descrição do quadro clínico");
  if (vazio(d.hist.idadeInicio)) faltaAcesso.push("idade de início");
  if (!d.incl.some(Boolean)) faltaAcesso.push("critério de inclusão");
  if (!crisesMarcadas.length && vazio(d.crisesOutras)) faltaAcesso.push("tipo de crise");
  if (t.mono1 == null) faltaAcesso.push("3.1 primeira monoterapia");
  if (t.mono2 == null) faltaAcesso.push("3.2 segunda monoterapia");
  if (t.assoc == null) faltaAcesso.push("3.3 associação");
  if (!emUso.length) faltaAcesso.push("3.4 fármacos em uso");
  if (alertaAssoc && vazio(t.justif)) faltaAcesso.push("3.5 justificativa da associação");
  faltaAcesso.push(...faltaMed);

  const faltaRel = [];
  if (vazio(d.cid)) faltaRel.push("CID-10");
  if (vazio(d.hist.descricao)) faltaRel.push("história clínica");
  if (!crisesMarcadas.length && vazio(d.crisesOutras)) faltaRel.push("tipo de crise");
  if (!itens.length) faltaRel.push("medicamento solicitado");
  if (d.hist.tratPrevio == null) faltaRel.push("tratamento prévio");
  if (!d.rel.usadoEm) faltaRel.push("copiar ou imprimir o relatório");

  const checklist = [
    { id: "ident", nome: "Identidade e CPF do paciente (cópia)", ok: d.docs.ident, manual: true, falta: ["confirmar que o paciente trouxe a cópia"] },
    { id: "resid", nome: "Comprovante de residência (cópia)", ok: d.docs.resid, manual: true, falta: ["confirmar a cópia; se em nome de terceiros, formulário específico"] },
    { id: "presc", nome: "Prescrição médica", sec: "prescricao", ok: faltaPresc.length === 0, falta: faltaPresc },
    { id: "lme", nome: "LME", sec: "lme", ok: faltaLME.length === 0, falta: faltaLME },
    { id: "ter", nome: "Termo de Esclarecimento (TER)", sec: "termo", ok: faltaTER.length === 0, falta: faltaTER },
    { id: "acessoOuRel", nome: "Formulário de acesso OU relatório", sec: faltaAcesso.length <= faltaRel.length ? "acesso" : "relatorio",
      ok: faltaAcesso.length === 0 || faltaRel.length === 0,
      falta: faltaAcesso.length <= faltaRel.length ? faltaAcesso.map((f) => `formulário: ${f}`) : faltaRel.map((f) => `relatório: ${f}`) },
  ];
  if (alertaAssoc) checklist.push({ id: "assoc", nome: "Associação de antiepilépticos", sec: "acesso", ok: !vazio(t.justif), alerta: vazio(t.justif), falta: [`${alertaAssoc} — justificar no item 3.5`] });
  const feitos = checklist.filter((c) => c.ok).length;

  return { itens, fams, nomesFam, basicos, emUso, crisesMarcadas, alertaAssoc, exStatus, faltaLME, faltaPresc, faltaTER, faltaAcesso, faltaRel, checklist, feitos, contraind: false };
}
