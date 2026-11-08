/* Prescrição genérica: cada patologia passa o catálogo (apresentações, famílias, esquemas prontos) */
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Cartao, TextoPronto, Imprimir, Faltando, fmt } from "./comum.jsx";

const plural = (un, n) => (n === 1 ? un : un === "cápsula" ? "cápsulas" : un === "comprimido" ? "comprimidos" : un === "adesivo" ? "adesivos" : "frascos");

/* texto para colar na prescrição eletrônica */
export function textoReceita(pac, d, der, med, apresentacoes) {
  const qtdTexto = (ap, n) => `${n} ${plural(apresentacoes[ap].un, n)}`;
  const linhas = [];
  linhas.push(`Paciente: ${pac.nome || "_______________"}`);
  if (pac.cpf || pac.cns) linhas.push([pac.cpf && `CPF: ${pac.cpf}`, pac.cns && `CNS: ${pac.cns}`].filter(Boolean).join(" · "));
  linhas.push("");
  const vias = new Set(der.itens.map((i) => (apresentacoes[i.ap].via || (apresentacoes[i.ap].un === "adesivo" ? "transdérmico" : "oral"))));
  linhas.push(`USO ${[...vias].map((x) => x.toUpperCase()).join(" E ")} — USO CONTÍNUO`);
  linhas.push("");
  der.itens.forEach((it, n) => {
    const ap = apresentacoes[it.ap];
    const meses = it.meses.filter((q) => q > 0).length;
    const total = it.meses.reduce((a, b) => a + (Number(b) || 0), 0);
    const q1 = it.meses.find((q) => q > 0) || 0;
    const qtd = meses > 1 && it.meses.filter((q) => q > 0).every((q) => q === q1)
      ? `${qtdTexto(it.ap, q1)} por mês (${meses} meses)`
      : `${qtdTexto(it.ap, total)}`;
    linhas.push(`${n + 1}. ${ap.nome} ——— ${qtd}`);
    linhas.push(`   ${it.pos}`);
    linhas.push("");
  });
  linhas.push(`${med.cidade ? `${med.cidade}, ` : ""}${fmt(d.presc.data)}`);
  linhas.push("");
  linhas.push(`${med.nome || "_______________"} — CRM ${med.crm || "____"}/${med.uf || "__"}`);
  return linhas.join("\n");
}

/* ================= PRESCRIÇÃO ================= */
export function Prescricao({ pac, d, up, der, med, cat }) {
  const { apresentacoes, familias, esquemas } = cat;
  const [fam, setFam] = useState(null);
  const itens = d.presc.itens;
  const setItens = (n) => up("presc.itens", n);
  const addEsquema = (e) => {
    const outros = itens.filter((i) => apresentacoes[i.ap]?.fam !== e.fam);
    setItens([...outros, ...e.itens.map((i) => ({ ...i, meses: [...i.meses] }))].slice(0, 6));
    setFam(null);
  };
  const setItem = (k, campo, val) => setItens(itens.map((it, i) => (i === k ? { ...it, [campo]: val } : it)));
  const texto = textoReceita(pac, d, der, med, apresentacoes);
  return (
    <>
    <div className="space-y-4 print:hidden">
      <Cartao titulo="Escolher o tratamento" sub={cat.sub || "Clique na droga e no esquema."}>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {Object.entries(familias).map(([k, f]) => (
            <button key={k} onClick={() => setFam(fam === k ? null : k)}
              className={"px-3 py-1.5 rounded-lg text-sm font-semibold border " + (fam === k ? "bg-teal-600 border-teal-600 text-white" : der.fams.includes(k) ? "bg-teal-50 border-teal-300 text-teal-800" : "bg-white border-slate-200 text-slate-600 hover:border-teal-400")}>
              {f.nome}
            </button>
          ))}
        </div>
        {fam && (
          <div className="grid gap-1.5 sm:grid-cols-2">
            {esquemas.filter((e) => e.fam === fam).map((e) => (
              <button key={e.id} onClick={() => addEsquema(e)}
                className="text-left rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:border-teal-400 hover:bg-teal-50">
                <Plus size={13} className="inline mr-1 text-teal-600" />{e.nome}
              </button>
            ))}
          </div>
        )}
        {fam && familias[fam].indicacao && <p className="text-xs text-slate-500 mt-2 leading-relaxed"><b>Indicação (PCDT):</b> {familias[fam].indicacao}</p>}
        {cat.avisos && cat.avisos(fam, der)}
      </Cartao>

      {itens.length > 0 && (
        <Cartao titulo="Itens da prescrição e do LME" sub="Quantidade por mês = colunas do LME (renovação semestral). Edite se precisar.">
          <div className="space-y-3">
            {itens.map((it, k) => (
              <div key={k} className="rounded-lg border border-slate-200 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <select value={it.ap} onChange={(e) => setItem(k, "ap", e.target.value)}
                    className="flex-1 min-w-0 rounded-lg border border-slate-200 px-2 py-1.5 text-sm font-semibold text-slate-800 bg-white">
                    {Object.entries(apresentacoes).map(([id, a]) => <option key={id} value={id}>{a.nome} — grupo {a.grupo}</option>)}
                  </select>
                  <button onClick={() => setItens(itens.filter((_, i) => i !== k))} className="text-slate-400 hover:text-rose-600 p-1"><Trash2 size={16} /></button>
                </div>
                <textarea rows={2} value={it.pos} onChange={(e) => setItem(k, "pos", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-700" />
                <div className="grid grid-cols-6 gap-1.5">
                  {it.meses.map((q, j) => (
                    <label key={j} className="block">
                      <span className="block text-[10px] text-slate-400 text-center">{j + 1}º mês</span>
                      <input type="number" min={0} value={q} onChange={(e) => setItem(k, "meses", it.meses.map((x, i) => (i === j ? Math.max(0, parseInt(e.target.value || "0", 10) || 0) : x)))}
                        className="w-full rounded-lg border border-slate-200 px-1 py-1 text-sm text-center" />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Cartao>
      )}

      <Cartao titulo="Prescrição pronta" direita={<input type="date" value={d.presc.data} onChange={(e) => up("presc.data", e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs" />}>
        <Faltando itens={der.faltaPresc} ok="Prescrição completa — copie para a prescrição eletrônica ou imprima." />
        <div className="mt-3 space-y-2">
          <TextoPronto texto={texto} linhas={12} />
          <Imprimir label="Imprimir receita" desab={!itens.length} />
        </div>
        <p className="text-[11px] text-slate-400 mt-2">Confira a forma de receituário exigida pela legislação sanitária vigente (Lei 13.732/2018; Portaria SVS/MS 344/1998).</p>
      </Cartao>

    </div>

      {/* receita impressa */}
      <div className="hidden print:block text-black text-[12px]">
        <div className="text-center border-b border-black pb-2 mb-4">
          <div className="font-bold text-[14px]">{med.estabelecimento || "RECEITUÁRIO"}</div>
          {med.endereco && <div className="text-[10px]">{med.endereco}</div>}
        </div>
        <pre className="whitespace-pre-wrap font-sans leading-relaxed">{texto}</pre>
        <div className="mt-16 w-72 mx-auto border-t border-black text-center text-[10px] pt-1">Assinatura e carimbo</div>
      </div>
    </>
  );
}
