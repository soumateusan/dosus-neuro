/* Solicitação de exames: chequinho SESAB (impresso), texto para o prontuário e laudo APAC.
   Genérico — cada patologia passa o catálogo de exames, o motivo e a justificativa. */
import { useState } from "react";
import { Plus, Trash2, Printer, Loader2, FileDown, ExternalLink } from "lucide-react";
import { Cartao, Aviso, TextoPronto, fmt } from "./comum.jsx";
import { abrirPDF } from "./lme-util.js";
import { fmtSigtap } from "./alzheimer/dados.js";

export const racaNome = { branca: "Branca", preta: "Preta", parda: "Parda", amarela: "Amarela", indigena: "Indígena" };

/* exames marcados, na ordem do catálogo, com o código (editado ou padrão) */
export function itensSolicitados(solic, catalogo) {
  const doCat = catalogo.filter((e) => solic.marcados[e.id]).map((e) => ({ ...e, cod: solic.codigos[e.id] ?? e.cod }));
  const outros = (solic.outros || []).filter((o) => o.nome.trim()).map((o, i) => ({ id: `outro${i}`, nome: o.nome, cod: o.cod, grupo: o.grupo || "lab" }));
  return [...doCat, ...outros];
}

/* guias: uma por exame, ou exames de laboratório juntos numa só */
export function montarGuias(itens, agrupar) {
  if (!agrupar) return itens.map((i) => ({ exame: i.nome, cod: fmtSigtap(i.cod) }));
  const lab = itens.filter((i) => i.grupo === "lab");
  const resto = itens.filter((i) => i.grupo !== "lab").map((i) => ({ exame: i.nome, cod: fmtSigtap(i.cod) }));
  if (lab.length) resto.push({ exame: lab.map((i) => `${i.nome}${i.cod ? ` (${fmtSigtap(i.cod)})` : ""}`).join("; "), cod: "" });
  return resto;
}

const enderecoTxt = (p) => [p.endereco, p.bairro, [p.municipio, p.uf].filter(Boolean).join("/"), p.cep && `CEP ${p.cep}`].filter(Boolean).join(", ");

export function textoSolicitacao(pac, itens, motivo, data, med) {
  const L = ["SOLICITAÇÃO DE EXAMES", ""];
  L.push(`Paciente: ${pac.nome || "_______________"}`);
  const docs = [pac.cns && `CNS ${pac.cns}`, pac.cpf && `CPF ${pac.cpf}`].filter(Boolean).join(" · ");
  if (docs) L.push(docs);
  L.push(`Indicação clínica: ${motivo}`);
  L.push("");
  itens.forEach((i, n) => L.push(`${n + 1}. ${i.nome}${i.cod ? ` — SIGTAP ${fmtSigtap(i.cod)}` : ""}`));
  L.push("");
  L.push(`${med.cidade ? `${med.cidade}, ` : ""}${fmt(data)}`);
  L.push(`${med.nome || "_______________"} — CRM ${med.crm || "____"}/${med.uf || "__"}`);
  return L.join("\n");
}

/* ---------- chequinho SESAB (modelo "Solicitação de exame ou procedimentos") ---------- */
function Rot({ children }) {
  return <div className="text-[6.5px] font-bold uppercase tracking-tight leading-none">{children}</div>;
}
function Chequinho({ pac, guia, motivo, data, med }) {
  const c = "border-black px-1.5 pt-1 pb-0.5 align-top";
  return (
    <div className="border-[1.5px] border-black w-full text-[10px] leading-tight break-inside-avoid" style={{ height: "84mm" }}>
      <div className="flex border-b border-black" style={{ height: "11mm" }}>
        <div className="w-[34mm] border-r border-black flex flex-col items-center justify-center leading-none">
          <div className="text-[17px] font-black tracking-tight">SESAB</div>
          <div className="text-[8px] font-bold border-t-2 border-black px-2 mt-0.5">SUS</div>
        </div>
        <div className="flex-1 flex items-center justify-center font-bold text-[13px] tracking-wide">SOLICITAÇÃO DE EXAME OU PROCEDIMENTOS</div>
      </div>
      <table className="w-full border-collapse table-fixed" style={{ height: "73mm" }}>
        <tbody>
          <tr style={{ height: "10mm" }}>
            <td colSpan={2} className={c + " border-b border-r"}><Rot>Nome do paciente</Rot><div className="mt-1 font-semibold">{pac.nome}</div></td>
            <td className={c + " border-b w-[34mm]"}><Rot>Doc. identidade</Rot><div className="mt-1">{pac.rg || pac.cpf || pac.cns}</div></td>
          </tr>
          <tr style={{ height: "10mm" }}>
            <td colSpan={3} className={c + " border-b"}><Rot>Endereço do paciente</Rot><div className="mt-1">{enderecoTxt(pac)}</div></td>
          </tr>
          <tr style={{ height: "11mm" }}>
            <td colSpan={3} className={c + " border-b"}><Rot>Motivo da solicitação</Rot><div className="mt-0.5 text-[9px]">{motivo}</div></td>
          </tr>
          <tr style={{ height: "14mm" }}>
            <td colSpan={2} className={c + " border-b border-r"}><Rot>Exame ou procedimento solicitado</Rot>
              <div className={"mt-1 font-semibold " + (guia.exame.length > 120 ? "text-[8px]" : guia.exame.length > 60 ? "text-[9px]" : "text-[11px]")}>{guia.exame}</div></td>
            <td className={c + " border-b text-center"}><Rot>Código</Rot><div className="mt-2 font-mono font-semibold text-[10.5px]">{guia.cod || "|__|__|__|__|"}</div></td>
          </tr>
          <tr>
            <td className={c + " border-r"}>
              <Rot>Profissional solicitante</Rot>
              <div className="mt-1 text-[9px]">{med.nome}{med.crm && <> — CRM {med.crm}/{med.uf}</>}</div>
              <div className="mt-[8.5mm] flex items-end gap-1"><Rot>Data</Rot><span className="text-[9px]">{fmt(data)}</span></div>
            </td>
            <td className={c + " border-r w-[52mm]"}><Rot>Autorização</Rot><div className="mt-[13mm]"><Rot>Data</Rot></div></td>
            <td className={c}><Rot>Paciente</Rot><div className="mt-[13mm]"><Rot>Data</Rot></div></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function FolhaChequinhos({ pac, guias, motivo, data, med }) {
  return (
    <div className="hidden print:block text-black">
      {guias.map((g, i) => (
        <div key={i} style={i > 0 && i % 3 === 0 ? { breakBefore: "page" } : undefined} className="mb-[6mm]">
          <Chequinho pac={pac} guia={g} motivo={motivo} data={data} med={med} />
        </div>
      ))}
    </div>
  );
}

/* dados do laudo APAC a partir do paciente, médico e exames marcados */
export function dadosAPAC({ pac, med, solic, catalogo, motivoPadrao, obsAPAC, cid, diagnostico }) {
  // exames de laboratório não entram na APAC (só imagem e outros procedimentos)
  const itens = itensSolicitados(solic, catalogo).filter((i) => i.grupo !== "lab");
  const motivo = solic.motivo || motivoPadrao;
  const principalId = solic.principal && itens.some((i) => i.id === solic.principal) ? solic.principal : (itens.find((i) => i.grupo === "imagem") || itens[0])?.id;
  const ordem = [...itens.filter((i) => i.id === principalId), ...itens.filter((i) => i.id !== principalId)];
  return {
    itens, principalId, motivo,
    pdf: {
      estabelecimento: med.estabelecimento, cnes: med.cnes,
      nome: pac.nome, sexo: pac.sexo, prontuario: pac.prontuario, cns: pac.cns, nascimento: pac.nascimento,
      raca: racaNome[pac.raca] || "", etnia: pac.raca === "indigena" ? pac.etnia : "", mae: pac.mae, tel1: pac.tel1,
      responsavel: pac.responsavel, tel2: pac.tel2, endereco: [pac.endereco, pac.bairro].filter(Boolean).join(", "),
      municipio: pac.municipio, ibge: pac.ibge, uf: pac.uf, cep: pac.cep,
      procedimentos: ordem.slice(0, 6).map((i) => ({ cod: i.cod, nome: i.nome, qtd: 1 })),
      diagnostico, cid, observacoes: solic.apacObs || `${motivo}\n${obsAPAC}`,
      medico: med.nome, data: solic.data, cnsMedico: med.cns,
    },
  };
}

/* ---------- tela: marcar exames + 3 saídas ---------- */
export function SolicitarExames({ pac, med, solic, setSolic, catalogo, grupos, motivoPadrao, obsAPAC, cid, diagnostico }) {
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState("");
  const s = solic;
  const set = (k, v) => setSolic({ ...s, [k]: v });
  const itens = itensSolicitados(s, catalogo);
  const motivo = s.motivo || motivoPadrao;
  const guias = montarGuias(itens, s.agrupar);
  const texto = textoSolicitacao(pac, itens, motivo, s.data, med);
  const { principalId, itens: itensAPAC } = dadosAPAC({ pac, med, solic: s, catalogo, motivoPadrao, obsAPAC, cid, diagnostico });

  const toggle = (id) => set("marcados", { ...s.marcados, [id]: !s.marcados[id] });
  const marcar = (ids) => set("marcados", { ...s.marcados, ...Object.fromEntries(ids.map((i) => [i, true])) });

  const gerarAPAC = async (baixar) => {
    setGerando(true); setErro("");
    try {
      const { gerarAPAC: gerar } = await import("./apac.js");
      const bytes = await gerar(dadosAPAC({ pac, med, solic: s, catalogo, motivoPadrao, obsAPAC, cid, diagnostico }).pdf);
      abrirPDF(bytes, `APAC - ${pac.nome || "paciente"}.pdf`, baixar);
    } catch (e) { setErro(String(e.message || e)); }
    setGerando(false);
  };

  return (
    <>
    <div className="space-y-4 print:hidden">
    <Cartao titulo="Solicitar exames" sub="Marque o que vai pedir (no sistema ou em outro local). No fim: chequinho, texto ou laudo APAC.">
      <div className="space-y-4">
        {grupos.map((g) => (
          <div key={g.id}>
            <div className="flex items-baseline justify-between gap-2 mb-1.5">
              <span className="text-xs font-semibold text-slate-600">{g.nome}</span>
              {g.atalho && <button onClick={() => marcar(g.atalho.ids)} className="text-[11px] font-semibold text-teal-700 hover:underline">{g.atalho.rot}</button>}
            </div>
            <div className="grid sm:grid-cols-2 gap-1.5">
              {g.ids.map((id) => {
                const e = catalogo.find((x) => x.id === id);
                const on = !!s.marcados[id];
                const tag = g.tags?.[id];
                return (
                  <div key={id} className={"rounded-lg border text-sm transition-colors " + (on ? "bg-teal-50 border-teal-300" : "bg-white border-slate-200")}>
                    <button onClick={() => toggle(id)} className="w-full flex items-start gap-2 px-2.5 pt-2 pb-1 text-left">
                      <input type="checkbox" readOnly checked={on} className="mt-0.5 w-4 h-4 accent-teal-600 pointer-events-none" />
                      <span className="leading-snug text-slate-700">{e.nome}{tag && <span className={"ml-1.5 text-[10px] font-semibold px-1.5 py-px rounded " + tag.cls}>{tag.txt}</span>}</span>
                    </button>
                    <div className="pl-8 pr-2 pb-1.5 flex items-center gap-1 text-[11px] text-slate-400">
                      SIGTAP
                      <input value={s.codigos[id] ?? e.cod} onChange={(ev) => set("codigos", { ...s.codigos, [id]: ev.target.value.replace(/\D/g, "").slice(0, 10) })}
                        className="w-24 bg-transparent font-mono text-slate-500 border-b border-dashed border-slate-300 focus:border-teal-400 outline-none" />
                      <span className="font-mono">{fmtSigtap(s.codigos[id] ?? e.cod) !== (s.codigos[id] ?? e.cod) ? fmtSigtap(s.codigos[id] ?? e.cod) : ""}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div>
          <span className="text-xs font-semibold text-slate-600">Outros exames</span>
          <div className="space-y-1.5 mt-1.5">
            {(s.outros || []).map((o, i) => (
              <div key={i} className="flex gap-1.5">
                <input value={o.nome} placeholder="nome do exame" onChange={(e) => set("outros", s.outros.map((x, k) => (k === i ? { ...x, nome: e.target.value } : x)))}
                  className="flex-1 min-w-0 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm" />
                <input value={o.cod} placeholder="SIGTAP" onChange={(e) => set("outros", s.outros.map((x, k) => (k === i ? { ...x, cod: e.target.value.replace(/\D/g, "").slice(0, 10) } : x)))}
                  className="w-28 rounded-lg border border-slate-200 px-2 py-1.5 text-sm font-mono" />
                <select value={o.grupo || "lab"} onChange={(e) => set("outros", s.outros.map((x, k) => (k === i ? { ...x, grupo: e.target.value } : x)))}
                  className="rounded-lg border border-slate-200 px-1.5 text-xs bg-white"><option value="lab">laboratório</option><option value="imagem">imagem/outro</option></select>
                <button onClick={() => set("outros", s.outros.filter((_, k) => k !== i))} className="text-slate-400 hover:text-rose-600 px-1"><Trash2 size={15} /></button>
              </div>
            ))}
            <button onClick={() => set("outros", [...(s.outros || []), { nome: "", cod: "", grupo: "lab" }])} className="flex items-center gap-1 text-xs font-semibold text-teal-700"><Plus size={13} /> adicionar exame</button>
          </div>
        </div>
      </div>
    </Cartao>

    {itens.length > 0 && (
      <Cartao titulo={`Solicitação — ${itens.length} exame${itens.length > 1 ? "s" : ""}`}
        direita={<input type="date" value={s.data} onChange={(e) => set("data", e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs" />}>
        <div className="space-y-4">
          <label className="block">
            <span className="block text-[11px] text-slate-500 mb-1">Motivo da solicitação / indicação clínica</span>
            <textarea rows={2} value={motivo} onChange={(e) => set("motivo", e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700" />
          </label>

          {/* 1. chequinho */}
          <div className="rounded-lg border border-slate-200 p-3 space-y-2">
            <div className="text-sm font-semibold text-slate-800">1. Chequinho SUS (solicitação de exame SESAB)</div>
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input type="checkbox" checked={!!s.agrupar} onChange={(e) => set("agrupar", e.target.checked)} className="accent-teal-600" />
              Exames de laboratório juntos numa guia só (imagem continua uma por guia)
            </label>
            {!pac.endereco && <p className="text-[11px] text-amber-700">Endereço do paciente em branco — preencha em Paciente e história.</p>}
            <button onClick={() => window.print()} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-700 text-white text-sm font-semibold hover:bg-slate-800">
              <Printer size={16} /> Imprimir {guias.length} guia{guias.length > 1 ? "s" : ""} ({Math.ceil(guias.length / 3)} folha{Math.ceil(guias.length / 3) > 1 ? "s" : ""} A4)
            </button>
          </div>

          {/* 2. texto */}
          <div className="rounded-lg border border-slate-200 p-3 space-y-2">
            <div className="text-sm font-semibold text-slate-800">2. Copiar a solicitação (prontuário / sistema)</div>
            <TextoPronto texto={texto} linhas={Math.min(14, itens.length + 9)} />
          </div>

          {/* 3. APAC */}
          <div className="rounded-lg border border-slate-200 p-3 space-y-2">
            <div className="text-sm font-semibold text-slate-800">3. Laudo APAC <span className="font-normal text-xs text-slate-500">— só imagem e outros procedimentos; exames de laboratório não entram</span></div>
            {itensAPAC.length === 0 ? <p className="text-xs text-slate-500">Nenhum exame de imagem ou procedimento marcado.</p> : <>
            <label className="block">
              <span className="block text-[11px] text-slate-500 mb-1">Procedimento principal (os demais entram como secundários)</span>
              <select value={principalId || ""} onChange={(e) => set("principal", e.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm bg-white">
                {itensAPAC.map((i) => <option key={i.id} value={i.id}>{i.nome} — {fmtSigtap(i.cod)}</option>)}
              </select>
            </label>
            {itensAPAC.length > 6 && <Aviso>O laudo tem 1 principal + 5 secundários: {itensAPAC.length - 6} exame(s) ficarão de fora. Gere outro laudo para eles.</Aviso>}
            <label className="block">
              <span className="block text-[11px] text-slate-500 mb-1">40 — Observações (justificativa)</span>
              <textarea rows={4} value={s.apacObs || `${motivo}\n${obsAPAC}`} onChange={(e) => set("apacObs", e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700" />
            </label>
            {(!med.cnes || !med.cns) && <p className="text-[11px] text-amber-700">CNES e CNS do médico vêm do Perfil do médico.</p>}
            {erro && <Aviso tom="rose">{erro}</Aviso>}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => gerarAPAC(false)} disabled={gerando} className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 disabled:opacity-50">
                {gerando ? <Loader2 size={16} className="animate-spin" /> : <ExternalLink size={16} />} Abrir APAC
              </button>
              <button onClick={() => gerarAPAC(true)} disabled={gerando} className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:border-teal-400 disabled:opacity-50">
                <FileDown size={16} /> Baixar PDF
              </button>
            </div>
          </>}
          </div>
        </div>
      </Cartao>
    )}
    </div>
    <FolhaChequinhos pac={pac} guias={guias} motivo={motivo} data={s.data} med={med} />
    </>
  );
}
