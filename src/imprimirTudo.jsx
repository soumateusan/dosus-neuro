/* Imprimir tudo: só os documentos com modelo oficial.
   Os documentos em HTML (termo, formulário, escalas) saem numa única impressão;
   LME e laudo APAC saem num único PDF. Cada patologia passa a lista de documentos. */
import { useState } from "react";
import { Printer, FileDown, ExternalLink, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Cartao, Aviso } from "./comum.jsx";
import { abrirPDF } from "./lme-util.js";

function Item({ on, set, nome, falta, extra, desab }) {
  const ok = !falta?.length;
  return (
    <div className={"rounded-lg border p-2.5 " + (desab ? "border-slate-100 bg-slate-50" : on ? "border-teal-300 bg-teal-50/50" : "border-slate-200")}>
      <label className={"flex items-start gap-2 " + (desab ? "opacity-50" : "cursor-pointer")}>
        <input type="checkbox" disabled={desab} checked={on && !desab} onChange={(e) => set(e.target.checked)} className="mt-0.5 w-4 h-4 accent-teal-600" />
        <span className="flex-1 min-w-0">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
            {nome}
            {!desab && (ok ? <CheckCircle2 size={14} className="text-teal-600" /> : <AlertTriangle size={14} className="text-amber-500" />)}
          </span>
          {!ok && <span className="block text-[11px] text-amber-700 leading-snug">Falta: {falta.slice(0, 4).join(" · ")}{falta.length > 4 ? ` · +${falta.length - 4}` : ""}</span>}
        </span>
        {extra}
      </label>
    </div>
  );
}

/* docs: [{ id, nome, falta, padrao, vias, render(key) }]; apac: resultado de dadosAPAC() */
export function ImprimirTudo({ pac, d, der, med, docs, dadosLME, apac }) {
  const temExames = apac.itens.length > 0;
  const [sel, setSel] = useState(() => ({
    ...Object.fromEntries(docs.map((x) => [x.id, x.padrao ?? true])),
    lme: der.itens.length > 0, apac: temExames,
  }));
  const [vias, setVias] = useState(2);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState("");
  const set = (k) => (v) => setSel((s) => ({ ...s, [k]: v }));

  const pdfSel = ["lme", "apac"].filter((k) => sel[k] && (k !== "apac" || temExames));

  const gerarPDF = async (baixar) => {
    setGerando(true); setErro("");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const final = await PDFDocument.create();
      const partes = [];
      if (pdfSel.includes("lme")) { const { gerarLME } = await import("./lme.js"); partes.push(await gerarLME(dadosLME(pac, d, der, med))); }
      if (pdfSel.includes("apac")) { const { gerarAPAC } = await import("./apac.js"); partes.push(await gerarAPAC(apac.pdf)); }
      for (const bytes of partes) {
        const doc = await PDFDocument.load(bytes);
        // o LME mantém os campos editáveis só quando sai sozinho; juntos, o conteúdo vai como está na página
        doc.getForm().flatten();
        const pgs = await final.copyPages(doc, doc.getPageIndices());
        pgs.forEach((p) => final.addPage(p));
      }
      abrirPDF(await final.save(), `${pdfSel.map((k) => k.toUpperCase()).join(" + ")} - ${pac.nome || "paciente"}.pdf`, baixar);
    } catch (e) { setErro(String(e.message || e)); }
    setGerando(false);
  };

  /* blocos impressos, cada um começando numa folha nova */
  const blocos = [];
  docs.forEach((x) => {
    if (!sel[x.id]) return;
    const n = x.vias ? vias : 1;
    for (let i = 0; i < n; i++) blocos.push(x.render(`${x.id}${i}`));
  });

  return (
    <>
    <div className="space-y-4 print:hidden">
      <Aviso tom="slate">Só os documentos com modelo oficial. Relatório, receita e pedidos de exame ficam nas próprias abas.</Aviso>

      <Cartao titulo="Para imprimir" sub="Saem juntos numa só impressão, cada um em folha nova. Para PDF, escolha “Salvar como PDF” na janela de impressão.">
        <div className="space-y-1.5">
          {docs.map((x) => (
            <Item key={x.id} on={sel[x.id]} set={set(x.id)} nome={x.nome} falta={x.falta}
              extra={x.vias && sel[x.id] && (
                <select value={vias} onChange={(e) => setVias(Number(e.target.value))} onClick={(e) => e.preventDefault()} className="rounded-md border border-slate-200 text-xs px-1 py-0.5 bg-white">
                  <option value={1}>1 via</option><option value={2}>2 vias</option>
                </select>
              )} />
          ))}
        </div>
        <button onClick={() => window.print()} disabled={!blocos.length}
          className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-slate-700 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-40">
          <Printer size={16} /> Imprimir {blocos.length} documento{blocos.length === 1 ? "" : "s"}
        </button>
      </Cartao>
      <Cartao titulo="PDFs oficiais" sub="LME e laudo APAC num único PDF.">
        <div className="space-y-1.5">
          <Item on={sel.lme} set={set("lme")} nome="LME" falta={der.faltaLME} />
          <Item on={sel.apac} set={set("apac")} nome={temExames ? `Laudo APAC (${Math.min(apac.itens.length, 6)} procedimento${apac.itens.length > 1 ? "s" : ""})` : "Laudo APAC — marque exame de imagem na aba Exames"}
            desab={!temExames} falta={[]} />
        </div>
        {erro && <div className="mt-2"><Aviso tom="rose">{erro}</Aviso></div>}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={() => gerarPDF(false)} disabled={gerando || !pdfSel.length}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 disabled:opacity-40">
            {gerando ? <Loader2 size={16} className="animate-spin" /> : <ExternalLink size={16} />} Abrir PDF
          </button>
          <button onClick={() => gerarPDF(true)} disabled={gerando || !pdfSel.length}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:border-teal-400 disabled:opacity-40">
            <FileDown size={16} /> Baixar PDF
          </button>
        </div>
      </Cartao>
    </div>

    <div className="hidden print:block">
      {blocos.map((b, i) => <div key={i} style={i > 0 ? { breakBefore: "page" } : undefined}>{b}</div>)}
    </div>
    </>
  );
}
