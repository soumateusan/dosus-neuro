/* Configuração da solicitação de exames para a Doença de Alzheimer */
import { pedidos } from "./dados.js";
import { anamneseLME, cidDesc } from "./textos.js";

const tagObrig = { txt: "obrigatório", cls: "bg-amber-100 text-amber-800" };
const tagOk = { txt: "já tem válido", cls: "bg-teal-100 text-teal-800" };

export function configSolicitacao(pac, d, der) {
  const okEx = (ref) => der.exStatus.find((e) => e.id === ref)?.sit.ok;
  const obrigIds = [];
  if (der.fams.includes("gal")) obrigIds.push("creat", "tgo", "tgp");
  else if (der.fams.includes("mem")) obrigIds.push("creat");
  const tag = (id) => {
    const ref = pedidos.find((p) => p.id === id).ref;
    if (okEx(ref)) return tagOk;
    if (id === "rm" || id === "tc" || obrigIds.includes(id)) return tagObrig;
    return null;
  };
  const complementares = pedidos.filter((p) => p.grupo === "lab" && !obrigIds.includes(p.id)).map((p) => p.id);
  const grupos = [
    { id: "img", nome: "Neuroimagem (obrigatória: TC ou, de preferência, RM)", ids: ["rm", "tc"] },
    ...(obrigIds.length ? [{ id: "obrig", nome: `Obrigatórios para ${der.nomesFam.join(" + ")}`, ids: obrigIds,
      atalho: { rot: "marcar pendentes", ids: obrigIds.filter((id) => !okEx(pedidos.find((p) => p.id === id).ref)) } }] : []),
    { id: "compl", nome: "Complementares (PCDT, a critério médico)", ids: complementares, atalho: { rot: "marcar todos", ids: complementares } },
  ].map((g) => ({ ...g, tags: Object.fromEntries(g.ids.map((id) => [id, tag(id)])) }));

  const etapa = d.tipo === "inicio" ? "abertura de processo" : "acompanhamento/renovação";
  const motivoPadrao = d.cid
    ? `${cidDesc(d.cid)} (CID-10 ${d.cid}). Exames para ${etapa} de medicamento do Componente Especializado, conforme PCDT.`
    : `Investigação de síndrome demencial. Exames para ${etapa} de medicamento do Componente Especializado, conforme PCDT.`;
  return { catalogo: pedidos, grupos, motivoPadrao, obsAPAC: anamneseLME(pac, d, der), cid: d.cid, diagnostico: cidDesc(d.cid) };
}
