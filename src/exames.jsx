/* Linha de registro de um exame recebido (feito, data, resultado) com a validade calculada */
import { situacaoExame } from "./alzheimer/dados.js";

export function LinhaExame({ ex, reg, set, destaque }) {
  const sit = situacaoExame(ex, reg);
  const r = reg || {};
  return (
    <div className={"rounded-lg border p-2.5 " + (destaque ? (sit.ok ? "border-teal-200 bg-teal-50/40" : "border-amber-200 bg-amber-50/40") : "border-slate-200")}>
      <div className="flex items-start gap-2">
        <div className="w-6 pt-1"><input type="checkbox" checked={!!r.feito} onChange={(e) => set({ ...r, feito: e.target.checked })} className="w-4 h-4 accent-teal-600" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2">
            <span className="text-sm font-semibold text-slate-700">{ex.nome}</span>
            <span className={"text-[11px] " + (sit.ok ? "text-teal-700" : r.feito ? "text-amber-700" : "text-slate-400")}>
              {ex.val ? `validade ${ex.val} meses · ` : ""}{sit.txt}
            </span>
          </div>
          {ex.nota && <div className="text-[11px] text-slate-400">{ex.nota}</div>}
          {r.feito && (
            <div className="mt-2 grid grid-cols-[9.5rem_1fr] gap-2">
              <input type="date" value={r.data || ""} onChange={(e) => set({ ...r, data: e.target.value })}
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
              {ex.id !== "img" && <input placeholder="resultado (opcional)" value={r.resultado || ""} onChange={(e) => set({ ...r, resultado: e.target.value })}
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

