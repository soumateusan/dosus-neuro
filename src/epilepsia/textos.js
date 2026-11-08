import { cids, nomeCrise, inclusao, PORTARIA, pedidos, apresentacoes } from "./dados.js";
import { idadeDe } from "../pacienteComum.jsx";

const fmt = (iso) => (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split("-").reverse().join("/") : iso || "");
const minusc = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const semPonto = (s) => String(s || "").trim().replace(/[.;]\s*$/, "");

export const cidDesc = (cod) => cids.find((c) => c.cod === cod)?.desc || "";
const sexoTxt = (p) => (p.sexo === "F" ? "sexo feminino" : p.sexo === "M" ? "sexo masculino" : "");

export function textoCrises(d, der) {
  const l = der.crisesMarcadas.map((id) => nomeCrise[id]).filter(Boolean);
  if (d.crisesOutras?.trim()) l.push(semPonto(d.crisesOutras));
  return l.join("; ");
}
const textoEEG = (h) => (h.eegLaudo || h.eegData ? `EEG${h.eegData ? ` (${fmt(h.eegData)})` : ""}${h.eegLaudo ? `: ${semPonto(h.eegLaudo)}` : ""}` : "");
const textoRM = (h) => (h.rmLaudo || h.rmData ? `RM do encéfalo${h.rmData ? ` (${fmt(h.rmData)})` : ""}${h.rmLaudo ? `: ${semPonto(h.rmLaudo)}` : ""}` : "");
const textoEmUso = (der) => der.emUso.map((x) => x.nome.split("/")[0].toLowerCase()).join(" + ");
const sn = (v) => (v === "sim" ? "sim" : v === "nao" ? "não" : "—");

const textoSolicitado = (der) => der.fams.map((f) => {
  const aps = [...new Set(der.itens.map((i) => i.ap).filter((ap) => apresentacoes[ap].fam === f))];
  return aps.map((ap) => apresentacoes[ap].lme).join(" e ");
}).join("; ");

/* campo 11 do LME */
export function anamneseLME(pac, d, der) {
  const h = d.hist, idade = idadeDe(pac);
  const p = [];
  p.push(`Paciente${idade ? ` de ${idade} anos` : ""}${sexoTxt(pac) ? `, ${sexoTxt(pac)}` : ""}, com epilepsia${h.idadeInicio ? ` desde os ${semPonto(h.idadeInicio)}` : ""}${h.etiologia ? ` (${minusc(semPonto(h.etiologia))})` : ""}.`);
  const cr = textoCrises(d, der);
  if (cr) p.push(`Crises (ILAE 2017): ${cr}.`);
  if (h.frequencia) p.push(`Frequência: ${minusc(semPonto(h.frequencia))}.`);
  const ex = [textoEEG(h), textoRM(h)].filter(Boolean).join(". ");
  if (ex) p.push(`${ex}.`);
  const t = d.trat;
  if (t.mono1 === "sim" || t.mono2 === "sim") p.push(`Falha ou intolerância à ${t.mono2 === "sim" ? "primeira e à segunda monoterapia" : "primeira monoterapia"}${h.tratTexto ? ` (${minusc(semPonto(h.tratTexto))})` : ""}.`);
  else if (h.tratTexto) p.push(`Tratamento prévio: ${minusc(semPonto(h.tratTexto))}.`);
  if (der.emUso.length) p.push(`Em uso: ${textoEmUso(der)}.`);
  if (d.tipo !== "inicio" && t.justif) p.push(`Justificativa: ${minusc(semPonto(t.justif))}.`);
  p.push("Diagnóstico estabelecido de epilepsia, sem critérios de exclusão do PCDT.");
  return p.join(" ");
}

/* relatório médico (alternativa ao formulário de acesso) */
export function textoRelatorio(pac, d, der, med) {
  const h = d.hist, t = d.trat, idade = idadeDe(pac);
  const L = ["RELATÓRIO MÉDICO — EPILEPSIA", ""];
  L.push(`Paciente: ${pac.nome || "_______________"}${idade ? `, ${idade} anos` : ""}${sexoTxt(pac) ? `, ${sexoTxt(pac)}` : ""}.`);
  if (pac.cns || pac.cpf) L.push([pac.cns && `CNS ${pac.cns}`, pac.cpf && `CPF ${pac.cpf}`].filter(Boolean).join(" · ") + ".");
  L.push(`CID-10: ${d.cid || "___"}${d.cid ? ` — ${cidDesc(d.cid)}` : ""}.`);
  L.push("", "HISTÓRIA CLÍNICA");
  L.push(`${semPonto(h.descricao) || "___"}.` + (h.idadeInicio ? ` Início dos sintomas aos ${semPonto(h.idadeInicio)}.` : "")
    + (h.etiologia ? ` Etiologia: ${minusc(semPonto(h.etiologia))}.` : "") + (h.frequencia ? ` Frequência das crises: ${minusc(semPonto(h.frequencia))}.` : "")
    + (h.ultimaCrise ? ` Última crise: ${semPonto(h.ultimaCrise)}.` : "") + (h.comorbidades ? ` Comorbidades: ${minusc(semPonto(h.comorbidades))}.` : ""));
  L.push("", "DIAGNÓSTICO E CLASSIFICAÇÃO DAS CRISES (ILAE 2017)");
  L.push(`${textoCrises(d, der) || "___"}.`);
  const incl = inclusao.filter((_, i) => d.incl[i]).map((x) => minusc(semPonto(x)));
  if (incl.length) L.push(`Critério de inclusão: ${incl.join("; ")}.`);
  const ex = [textoEEG(h), textoRM(h)].filter(Boolean);
  if (ex.length) L.push(`${ex.join(". ")}.`);
  L.push("", "TRATAMENTO MEDICAMENTOSO");
  L.push(`Primeira monoterapia com intolerância ou falha: ${sn(t.mono1)}. Segunda monoterapia com intolerância ou falha: ${sn(t.mono2)}. Em associação medicamentosa: ${sn(t.assoc)}.`);
  if (h.tratTexto) L.push(`Tratamentos realizados: ${semPonto(h.tratTexto)}.`);
  if (der.emUso.length) L.push(`Fármacos antiepilépticos em uso: ${textoEmUso(der)}.`);
  if (t.justif) L.push(`Justificativa da associação: ${semPonto(t.justif)}.`);
  L.push("", "CRITÉRIOS DE EXCLUSÃO");
  L.push("Diagnóstico de epilepsia estabelecido, sem suspeita de eventos paroxísticos não epilépticos. Sem intolerância, hipersensibilidade ou contraindicação ao medicamento solicitado.");
  L.push("", "CONDUTA");
  L.push(der.itens.length ? `Solicito ${textoSolicitado(der)}, conforme o Protocolo Clínico e Diretrizes Terapêuticas da Epilepsia (${PORTARIA.replace("PORTARIA CONJUNTA", "Portaria Conjunta").replace(" DE JUNHO DE ", " de junho de ").replace(", DE ", ", de ")}).` : "___");
  if (d.rel.extra) L.push("", d.rel.extra.trim());
  L.push("", `${med.cidade ? `${med.cidade}, ` : ""}${fmt(d.lme.data)}`);
  L.push(`${med.nome || "_______________"} — CRM ${med.crm || "____"}/${med.uf || "__"}`);
  return L.join("\n");
}

/* configuração da solicitação de exames (aba Exames) */
const MONIT = ["hemo", "plaq", "tgp", "tgo", "na", "k", "ct", "hdl", "ldl", "tg", "vitd", "tsh", "t4"];
export function configSolicitacao(pac, d, der) {
  const ok = (ref) => der.exStatus.find((e) => e.id === ref)?.sit.ok;
  const tagOk = { txt: "já tem válido", cls: "bg-teal-100 text-teal-800" };
  const grupos = [
    { id: "diag", nome: "Diagnóstico (não obrigatórios; RM só para epilepsia focal refratária)", ids: ["eeg", "rm"] },
    { id: "monit", nome: "Monitoramento anual", ids: MONIT, atalho: { rot: "marcar todos", ids: MONIT } },
  ].map((g) => ({ ...g, tags: Object.fromEntries(g.ids.map((id) => [id, ok(pedidos.find((p) => p.id === id).ref) ? tagOk : null])) }));
  const etapa = d.tipo === "inicio" ? "abertura de processo" : "monitoramento";
  const motivoPadrao = d.cid
    ? `Epilepsia (CID-10 ${d.cid}). Exames para ${etapa} de medicamento do Componente Especializado, conforme PCDT.`
    : `Epilepsia. Exames para ${etapa} de medicamento do Componente Especializado, conforme PCDT.`;
  return { catalogo: pedidos, grupos, motivoPadrao, obsAPAC: anamneseLME(pac, d, der), cid: d.cid, diagnostico: cidDesc(d.cid) };
}
