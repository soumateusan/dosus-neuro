import { cids, apresentacoes, obrigatorios, suporte, alerta, inclusaoDDP, PORTARIA, pedidos } from "./dados.js";
import { idadeDe } from "../pacienteComum.jsx";

const fmt = (iso) => (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split("-").reverse().join("/") : iso || "");
const v = (n) => String(n).replace(".", ",");
const minusc = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const semPonto = (s) => String(s || "").trim().replace(/[.;]\s*$/, "");
const sexoTxt = (p) => (p.sexo === "F" ? "sexo feminino" : p.sexo === "M" ? "sexo masculino" : "");

export const cidDesc = (cod) => cids.find((c) => c.cod === cod)?.desc || "";

const maiusc = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const baixa = (s) => semPonto(s).toLowerCase().replace("hz", "Hz").replace("mao", "MAO");
const sinais = (d) => obrigatorios.filter(([id]) => d.form.obrig?.[id]).map(([, n]) => baixa(n.replace(" (Obrigatório)", "").replace(": Clinicamente", "")));
const textoSolicitado = (der) => der.fams.map((f) => {
  const aps = [...new Set(der.itens.map((i) => i.ap).filter((ap) => apresentacoes[ap].fam === f))];
  return aps.map((ap) => apresentacoes[ap].lme).join(" e ");
}).join("; ");
const textoEscalas = (d, der) => [
  der.meemAplicado && `MEEM ${der.meem.total}/30${d.meemData ? ` (${fmt(d.meemData)})` : ""}`,
  d.cdrAplicado && `CDR global ${v(der.cdr.global)}${d.cdrData ? ` (${fmt(d.cdrData)})` : ""}`,
].filter(Boolean).join("; ");

export function anamneseLME(pac, d, der) {
  const h = d.hist, f = d.form, idade = idadeDe(pac);
  const p = [];
  p.push(`Paciente${idade ? ` de ${idade} anos` : ""}${sexoTxt(pac) ? `, ${sexoTxt(pac)}` : ""}, com doença de Parkinson${f.classif ? ` ${f.classif === "estabelecida" ? "clinicamente estabelecida" : "provável"}` : ""}${h.inicioDP ? `, início em ${fmt(h.inicioDP)}` : ""}.`);
  const s = sinais(d);
  if (s.length) p.push(`Apresenta ${s.join(", ")}.`);
  if (h.sintomas) p.push(`${maiusc(semPonto(h.sintomas))}.`);
  if (h.levodopa) p.push(`Em uso de levodopa${h.levodopaDose ? ` (${semPonto(h.levodopaDose)})` : ""}.`);
  if (h.tratTexto) p.push(`Tratamentos prévios: ${minusc(semPonto(h.tratTexto))}.`);
  if (der.temRiv && f.ddp === "sim") {
    p.push(`Demência na doença de Parkinson${h.inicioDDP ? ` desde ${fmt(h.inicioDDP)}` : ""}, com comprometimento das atividades de vida diária, sem depressão maior, delírio ou outra causa para a perda cognitiva.`);
    const esc = textoEscalas(d, der);
    if (esc) p.push(`${esc}.`);
  }
  p.push("Preenche critérios do PCDT, sem critérios de exclusão ou contraindicações ao medicamento solicitado.");
  return p.join(" ");
}

export function textoRelatorio(pac, d, der, med) {
  const h = d.hist, f = d.form, idade = idadeDe(pac);
  const L = ["RELATÓRIO MÉDICO — DOENÇA DE PARKINSON", ""];
  L.push(`Paciente: ${pac.nome || "_______________"}${idade ? `, ${idade} anos` : ""}${sexoTxt(pac) ? `, ${sexoTxt(pac)}` : ""}.`);
  if (pac.cns || pac.cpf) L.push([pac.cns && `CNS ${pac.cns}`, pac.cpf && `CPF ${pac.cpf}`].filter(Boolean).join(" · ") + ".");
  L.push(`CID-10: G20 — ${cidDesc("G20")}.`);
  L.push("", "HISTÓRIA CLÍNICA");
  L.push(`Diagnóstico de doença de Parkinson${h.inicioDP ? ` com início em ${fmt(h.inicioDP)}` : ""}.${h.sintomas ? ` ${maiusc(semPonto(h.sintomas))}.` : ""}${h.estadio ? ` Estadiamento: ${semPonto(h.estadio)}.` : ""}${h.comorbidades ? ` Comorbidades: ${minusc(semPonto(h.comorbidades))}.` : ""}`);
  L.push("", "CRITÉRIOS DIAGNÓSTICOS (PCDT)");
  const s = sinais(d);
  L.push(`${s.length ? `Presentes: ${s.join(", ")}.` : "___"}${f.classif ? ` Classificação: doença de Parkinson ${f.classif === "estabelecida" ? "clinicamente estabelecida" : "provável"}.` : ""}`);
  const sup = suporte.filter((_, i) => f.suporte[i]).map(baixa);
  if (sup.length) L.push(`Critérios de suporte: ${sup.join("; ")}.`);
  const al = alerta.filter((_, i) => f.alerta[i]).map(baixa);
  L.push(al.length ? `Sinais de alerta: ${al.join("; ")}.` : "Sem sinais de alerta (red flags).");
  L.push(der.excluido ? "ATENÇÃO: há critério de exclusão marcado." : "Sem critérios de exclusão.");
  if (f.ddp === "sim") {
    L.push("", "DEMÊNCIA NA DOENÇA DE PARKINSON");
    L.push(`Início da demência${h.inicioDDP ? ` em ${fmt(h.inicioDDP)}` : ""}. ${inclusaoDDP.filter((_, i) => f.inclDDP[i]).map(semPonto).join("; ")}.`);
    const esc = textoEscalas(d, der);
    if (esc) L.push(`${esc}.`);
  }
  L.push("", "TRATAMENTO MEDICAMENTOSO");
  L.push(h.tratPrevio ? `${semPonto(h.tratTexto) || "Em tratamento para a doença"}.` : h.tratPrevio === false ? "Sem tratamento prévio para a doença." : "___");
  if (h.levodopa != null) L.push(h.levodopa ? `Em uso de levodopa${h.levodopaDose ? ` (${semPonto(h.levodopaDose)})` : ""}.` : "Sem uso de levodopa.");
  if (h.outrosMeds) L.push(`Outros medicamentos: ${minusc(semPonto(h.outrosMeds))}.`);
  L.push("", "CONTRAINDICAÇÕES");
  L.push(der.contraind ? "ATENÇÃO: contraindicação marcada no formulário." : "Sem contraindicações ao medicamento solicitado.");
  L.push("", "CONDUTA");
  L.push(der.itens.length ? `Solicito ${textoSolicitado(der)}, conforme o Protocolo Clínico e Diretrizes Terapêuticas da Doença de Parkinson (${PORTARIA}).` : "___");
  if (d.rel.extra) L.push("", d.rel.extra.trim());
  L.push("", `${med.cidade ? `${med.cidade}, ` : ""}${fmt(d.lme.data)}`);
  L.push(`${med.nome || "_______________"} — CRM ${med.crm || "____"}/${med.uf || "__"}`);
  return L.join("\n");
}

export function configSolicitacao(pac, d, der) {
  const ok = (ref) => der.exStatus.find((e) => e.id === ref)?.sit.ok;
  const obrig = der.exStatus.map((e) => e.id);
  const tag = (id) => (ok(id) ? { txt: "já tem válido", cls: "bg-teal-100 text-teal-800" } : obrig.includes(id) ? { txt: "obrigatório", cls: "bg-amber-100 text-amber-800" } : null);
  const ids = pedidos.map((p) => p.id);
  const grupos = [{ id: "lab", nome: "Exames por medicamento (rasagilina: TGO/TGP · amantadina: ureia/creatinina · clozapina: hemograma)", ids,
    atalho: { rot: "marcar obrigatórios", ids: obrig.filter((id) => !ok(id)) }, tags: Object.fromEntries(ids.map((id) => [id, tag(id)])) }];
  const etapa = d.tipo === "inicio" ? "abertura de processo" : "monitoramento";
  return {
    catalogo: pedidos, grupos,
    motivoPadrao: `Doença de Parkinson (CID-10 G20). Exames para ${etapa} de medicamento do Componente Especializado, conforme PCDT.`,
    obsAPAC: anamneseLME(pac, d, der), cid: "G20", diagnostico: cidDesc("G20"),
  };
}
