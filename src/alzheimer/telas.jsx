import { ExternalLink, CheckCircle2, Circle, AlertTriangle, MapPin } from "lucide-react";
import { Txt, Escolha, Cartao, fmt } from "../comum.jsx";
import { cids, apresentacoes, familias, esquemas, exames, examesComplementares, criterios, avaliaCriterio, documentos, unidades, LINK_SESAB } from "./dados.js";
import { anosParaEscIdx } from "./processo.js";
import { CartaoSolicitacao, CartoesIdentificacao } from "../pacienteComum.jsx";
import { configSolicitacao } from "./solic.js";
import { SolicitarExames } from "../solicitacao.jsx";
import { LinhaExame } from "../exames.jsx";
import { Prescricao as PrescricaoBase } from "../prescricao.jsx";
import { meemCutoffs } from "../shared/meem.jsx";

const v = (n) => String(n).replace(".", ",");

/* ================= VISÃO GERAL: o que pedir + elegibilidade ================= */
export function Visao({ pac, d, der, ir }) {
  return (
    <div className="space-y-4">
      <Cartao titulo="Elegibilidade pelos escores (PCDT)"
        sub={der.meemAplicado && d.cdrAplicado && der.escBaixa != null
          ? `MEEM ${der.meem.total}/30 · CDR ${v(der.cdr.global)} · escolaridade ${der.escBaixa ? "≤ 4 anos" : "> 4 anos"}`
          : "Aplique o MEEM e o CDR e informe a escolaridade para conferir automaticamente."}>
        <div className="space-y-2">
          {criterios.map((c) => {
            const pronto = der.meemAplicado && d.cdrAplicado && der.escBaixa != null;
            const r = pronto ? avaliaCriterio(c, der.meem.total, der.escBaixa, der.cdr.global) : null;
            const escolhido = der.crit === c.id;
            return (
              <div key={c.id} className={"rounded-lg border p-3 text-sm " + (r?.ok ? "border-teal-300 bg-teal-50" : escolhido && r ? "border-amber-300 bg-amber-50" : "border-slate-200")}>
                <div className="flex items-start gap-2">
                  {r ? (r.ok ? <CheckCircle2 size={17} className="text-teal-600 shrink-0 mt-0.5" /> : <AlertTriangle size={17} className="text-amber-500 shrink-0 mt-0.5" />)
                     : <Circle size={17} className="text-slate-300 shrink-0 mt-0.5" />}
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-800">{c.nome}{escolhido && <span className="ml-2 text-[11px] font-semibold text-teal-700 bg-white border border-teal-200 rounded-full px-2 py-0.5">prescrito</span>}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      MEEM {c.alto[0]}–{c.alto[1]} (&gt; 4 anos de estudo) ou {c.baixo[0]}–{c.baixo[1]} (≤ 4 anos) · CDR {c.cdr.join(" ou ")}
                    </div>
                    {r && !r.ok && (
                      <div className="text-xs text-amber-700 mt-1">
                        {!r.meemOk && `MEEM ${der.meem.total} fora de ${r.faixa[0]}–${r.faixa[1]}. `}
                        {!r.cdrOk && `CDR ${v(der.cdr.global)} não é ${c.cdr.join(" ou ")}.`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Cartao>

      <Cartao titulo="Documentos necessários" sub="Marcados em tempo real conforme você preenche. Toque para ir ao documento.">
        <div className="space-y-1.5">
          {documentos.map((doc) => {
            const c = der.checklist.find((x) => x.id === doc.id) || der.checklist.find((x) => doc.id === "meem" && x.id === "meem");
            return (
              <button key={doc.id} onClick={() => c?.sec && ir(c.sec)}
                className="w-full flex items-start gap-2 text-left rounded-lg px-2 py-1.5 hover:bg-slate-50">
                {c?.ok ? <CheckCircle2 size={16} className="text-teal-600 shrink-0 mt-0.5" /> : <Circle size={16} className="text-slate-300 shrink-0 mt-0.5" />}
                <span className="text-sm text-slate-700">{doc.nome}{doc.nota && <span className="block text-xs text-slate-400">{doc.nota}</span>}</span>
              </button>
            );
          })}
        </div>
      </Cartao>

      <Cartao titulo="Exames para abertura do processo">
        <div className="text-sm text-slate-700 space-y-2">
          <p><b>Todos os medicamentos:</b> laudo de TC ou RM de encéfalo (validade indeterminada).</p>
          <p><b>Galantamina, também:</b> creatinina, ALT/TGP e AST/TGO (validade 3 meses).</p>
          <p><b>Memantina, também:</b> creatinina ou TFG (validade 3 meses).</p>
          <p className="text-xs text-slate-500">Complementares, a critério médico (PCDT): hemograma, sódio, potássio, cálcio, glicose, creatinina, ureia, TSH, B12 e ácido fólico, AST/TGO, ALT/TGP (3 meses); sífilis e HIV (12 meses).</p>
          <button onClick={() => ir("exames")} className="text-xs font-semibold text-teal-700 hover:underline">Registrar exames e datas →</button>
        </div>
      </Cartao>

      <Cartao titulo="Monitoramento e renovação">
        <div className="text-sm text-slate-700 space-y-2">
          <p><b>MEEM e CDR:</b> ao final de 3–4 meses do início e depois a cada 6 meses. <b>Galantamina:</b> creatinina, TGO e TGP a critério médico.</p>
          <p><b>LME:</b> renovar semestralmente.</p>
          <p><b>Troca de medicamento ou aumento de dose:</b> avaliação na unidade responsável pela avaliação inicial, por médico especialista se previsto.</p>
          <p><b>Continuidade sem troca nem aumento de dose:</b> avaliação na unidade de cadastro.</p>
        </div>
      </Cartao>

      <Cartao titulo="Unidades de referência (Bahia)">
        <div className="space-y-3">
          {unidades.map((u) => (
            <div key={u.nome} className="text-sm text-slate-700 flex gap-2">
              <MapPin size={15} className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">{u.regiao}</div>
                <div className="font-semibold">{u.nome}</div>
                {u.end && <div className="text-xs text-slate-500">{u.end}</div>}
                {u.tel && <div className="text-xs text-slate-500">Tel.: {u.tel} · {u.horario}</div>}
                {u.email && <div className="text-xs text-slate-500">{u.email}</div>}
              </div>
            </div>
          ))}
        </div>
      </Cartao>

      <a href={LINK_SESAB} target="_blank" rel="noreferrer"
        className="flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-teal-700">
        <ExternalLink size={13} /> Página da SESAB — Doença de Alzheimer (PCDT, fluxo de acesso, SIGTAP)
      </a>
      {pac.nome === "" && <p className="text-center text-xs text-slate-400">Comece pela aba <button className="font-semibold text-teal-700" onClick={() => ir("paciente")}>Paciente e história</button>.</p>}
    </div>
  );
}

/* ================= PACIENTE E HISTÓRIA CLÍNICA ================= */
export function Paciente({ pac, upP, d, up }) {
  const setEsc = (val) => {
    upP("escolaridade", val);
    up("meem", { ...d.meem, escIdx: anosParaEscIdx(val) });
  };
  return (
    <div className="space-y-4">
      <CartaoSolicitacao d={d} up={up} cids={cids} />

      <CartoesIdentificacao pac={pac} upP={upP} escolaridade={{
        onChange: setEsc,
        dica: pac.escolaridade !== "" ? (Number(pac.escolaridade) <= 4 ? "≤ 4 anos — faixas de baixa escolaridade" : "> 4 anos") + ` · corte MEEM ${meemCutoffs[anosParaEscIdx(pac.escolaridade)][1]}` : "",
      }} />

      <Cartao titulo="História clínica" sub="Alimenta a anamnese do LME e o relatório médico.">
        <div className="grid gap-3">
          <Txt rot="Início dos sintomas" ph="ex.: há cerca de 3 anos" valor={d.hist.inicio} onChange={(x) => up("hist.inicio", x)} />
          <Txt area linhas={3} rot="Sintomas / queixas cognitivas" ph="ex.: esquecimento de fatos recentes, repetição de perguntas, desorientação em trajetos conhecidos"
            valor={d.hist.queixas} onChange={(x) => up("hist.queixas", x)} />
          <Txt area linhas={2} rot="Repercussão funcional" ph="ex.: deixou de administrar as finanças e precisa de supervisão para medicações"
            valor={d.hist.funcional} onChange={(x) => up("hist.funcional", x)} />
          <div className="grid gap-3 sm:grid-cols-[auto_10rem_1fr] items-end">
            <div>
              <span className="block text-[11px] text-slate-500 mb-1">Neuroimagem</span>
              <Escolha valor={d.hist.neuroTipo} onChange={(x) => up("hist.neuroTipo", x || "RM")} opcoes={[["RM", "RM"], ["TC", "TC"]]} />
            </div>
            <Txt rot="Data do exame" tipo="date" valor={d.hist.neuroData} onChange={(x) => up("hist.neuroData", x)} />
            <Txt rot="Achados" ph="ex.: atrofia hipocampal bilateral, sem lesões vasculares significativas" valor={d.hist.neuroLaudo} onChange={(x) => up("hist.neuroLaudo", x)} />
          </div>
          <Txt area linhas={2} rot="Comorbidades" valor={d.hist.comorbidades} onChange={(x) => up("hist.comorbidades", x)} />
          <Txt area linhas={2} rot="Medicamentos em uso" valor={d.hist.medicamentos} onChange={(x) => up("hist.medicamentos", x)} />
          <div>
            <span className="block text-[11px] text-slate-500 mb-1">Realizou tratamento prévio ou está em tratamento da doença? <span className="text-rose-500">*</span></span>
            <Escolha valor={d.hist.tratPrevio} onChange={(x) => up("hist.tratPrevio", x)} opcoes={[[false, "Não"], [true, "Sim"]]} />
          </div>
          {d.hist.tratPrevio && <Txt rot="Relatar o tratamento" ph="ex.: donepezila 10 mg/dia desde 2024" valor={d.hist.tratTexto} onChange={(x) => up("hist.tratTexto", x)} />}
          <div>
            <span className="block text-[11px] text-slate-500 mb-1">Em caso de continuidade, houve estabilização ou melhora clínica?</span>
            <Escolha valor={d.hist.estab} onChange={(x) => up("hist.estab", x)} opcoes={[["sim", "Sim"], ["nao", "Não"], ["na", "Não se aplica — início"]]} />
          </div>
        </div>
      </Cartao>
    </div>
  );
}

/* ================= EXAMES ================= */
export function Exames({ pac, d, up, der, med }) {
  const set = (id) => (val) => up(`exames.${id}`, val);
  const cfg = configSolicitacao(pac, d, der);
  const obrig = exames.filter((e) => e.para === "todos" || e.para.some((f) => der.fams.includes(f)));
  const outros = exames.filter((e) => !obrig.includes(e));
  return (
    <div className="space-y-4">
      <SolicitarExames pac={pac} med={med} solic={d.solic} setSolic={(v) => up("solic", v)} {...cfg} />
      <div className="space-y-4 print:hidden">
      <h3 className="pt-2 text-sm font-bold text-slate-700">Resultados recebidos</h3>
      <Cartao titulo="Obrigatórios para o que foi prescrito" sub={der.fams.length ? `Medicamento(s): ${der.nomesFam.join(" + ")}` : "Escolha o medicamento na prescrição para ver os exames específicos."}>
        <div className="space-y-2">
          {obrig.map((e) => <LinhaExame key={e.id} ex={e} reg={d.exames[e.id]} set={set(e.id)} destaque />)}
        </div>
        {d.hist.neuroData && !d.exames.img?.feito && (
          <button onClick={() => up("exames.img", { feito: true, data: d.hist.neuroData })} className="mt-2 text-xs font-semibold text-teal-700 hover:underline">
            Usar a {d.hist.neuroTipo} de {fmt(d.hist.neuroData)} informada na história →
          </button>
        )}
      </Cartao>
      {outros.length > 0 && (
        <Cartao titulo="Específicos de outros medicamentos">
          <div className="space-y-2">{outros.map((e) => <LinhaExame key={e.id} ex={e} reg={d.exames[e.id]} set={set(e.id)} />)}</div>
        </Cartao>
      )}
      <Cartao titulo="Complementares (não obrigatórios)" sub="Podem ser solicitados conforme critério médico, de acordo com o PCDT.">
        <div className="space-y-2">{examesComplementares.map((e) => <LinhaExame key={e.id} ex={e} reg={d.exames[e.id]} set={set(e.id)} />)}</div>
      </Cartao>
      </div>
    </div>
  );
}

/* ================= PRESCRIÇÃO ================= */
const catAlz = {
  apresentacoes, familias, esquemas,
  sub: "Clique na droga e no esquema. Memantina pode ser associada a um inibidor da acetilcolinesterase.",
  avisos: (fam, der) => {
    const temIAChE = der.fams.some((f) => familias[f].classe === "iache");
    if (fam === "mem" && !temIAChE) return <p className="text-xs text-slate-400 mt-2">Sem inibidor associado = memantina em monoterapia (MEEM 5–11 / 3–7 e CDR 3).</p>;
    if (fam && fam !== "mem" && temIAChE && !der.fams.includes(fam)) return <p className="text-xs text-amber-600 mt-2">Ao escolher, o inibidor anterior será mantido — remova-o abaixo se for troca.</p>;
    return null;
  },
};
export const Prescricao = (props) => <PrescricaoBase {...props} cat={catAlz} />;
