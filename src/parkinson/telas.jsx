import { ExternalLink, CheckCircle2, Circle, MapPin } from "lucide-react";
import { Txt, Escolha, Marca, Cartao, Aviso } from "../comum.jsx";
import { CartoesIdentificacao } from "../pacienteComum.jsx";
import { SolicitarExames } from "../solicitacao.jsx";
import { LinhaExame } from "../exames.jsx";
import { Prescricao as PrescricaoBase } from "../prescricao.jsx";
import { anosParaEscIdx } from "../alzheimer/processo.js";
import { meemCutoffs } from "../shared/meem.jsx";
import { apresentacoes, familias, esquemas, exames, obrigatorios, suporte, alerta, exclusao, inclusaoDDP, ciRasagilina, documentos, unidades, LINK_SESAB } from "./dados.js";
import { configSolicitacao } from "./textos.js";

/* ================= VISÃO GERAL ================= */
export function Visao({ pac, der, ir }) {
  return (
    <div className="space-y-4">
      <Cartao titulo="Documentos necessários" sub="Marcados em tempo real conforme você preenche. Toque para ir ao documento.">
        <div className="space-y-1.5">
          {documentos.map((doc) => {
            const c = der.checklist.find((x) => x.id === doc.id);
            return (
              <button key={doc.id} onClick={() => c?.sec && ir(c.sec)} className="w-full flex items-start gap-2 text-left rounded-lg px-2 py-1.5 hover:bg-slate-50">
                {c?.ok ? <CheckCircle2 size={16} className="text-teal-600 shrink-0 mt-0.5" /> : <Circle size={16} className="text-slate-300 shrink-0 mt-0.5" />}
                <span className="text-sm text-slate-700">{doc.nome}{doc.nota && <span className="block text-xs text-slate-400">{doc.nota}</span>}</span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-slate-500 mt-2 px-2">O relatório deve trazer CID-10, data de início do diagnóstico, ausência de depressão maior, de delírio e de outras condições que justifiquem a perda cognitiva, tratamento realizado, critérios de inclusão e ausência de exclusão e contraindicação.</p>
      </Cartao>

      {der.contraind && <Aviso tom="rose">{der.ciRas && "Contraindicação à rasagilina marcada. "}{der.entSemLevodopa && "Entacapona só é usada junto com levodopa."}</Aviso>}

      <Cartao titulo="Exames para abertura do processo">
        <div className="text-sm text-slate-700 space-y-2">
          <p><b>Todos os medicamentos:</b> avaliação clínica.</p>
          <p><b>Rasagilina:</b> AST/TGO e ALT/TGP (3 meses). <b>Amantadina:</b> ureia e creatinina (3 meses). <b>Clozapina:</b> hemograma (3 meses). <b>Rivastigmina:</b> MEEM e CDR.</p>
          <button onClick={() => ir("exames")} className="text-xs font-semibold text-teal-700 hover:underline">Pedir exames / registrar resultados →</button>
        </div>
      </Cartao>

      <Cartao titulo="Monitoramento e observações">
        <div className="text-sm text-slate-700 space-y-2">
          <p><b>Amantadina:</b> ureia e creatinina a critério médico. <b>Clozapina:</b> hemograma semanal nas primeiras 18 semanas e depois mensal. <b>Rivastigmina:</b> MEEM e CDR a cada 6 meses.</p>
          <p>A rasagilina é contraindicada em associação com fluoxetina e fluvoxamina. A unidade de referência pode pedir outros exames conforme a situação clínica.</p>
          <p><b>LME:</b> renovar semestralmente. Troca de medicamento ou aumento de dose: avaliação na unidade da avaliação inicial, por especialista.</p>
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

      <a href={LINK_SESAB} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-teal-700">
        <ExternalLink size={13} /> Página da SESAB — Doença de Parkinson (PCDT, fluxo de acesso, SIGTAP)
      </a>
      {pac.nome === "" && <p className="text-center text-xs text-slate-400">Comece pela aba <button className="font-semibold text-teal-700" onClick={() => ir("paciente")}>Paciente e história</button>.</p>}
    </div>
  );
}

/* lista de marcações guardada como array de booleanos */
function Marcas({ itens, valor = [], onChange, tom }) {
  return (
    <div className="space-y-1.5">
      {itens.map((t, i) => <Marca key={i} tom={tom} checked={!!valor[i]} onToggle={() => { const n = [...valor]; n[i] = !n[i]; onChange(n); }}>{t}</Marca>)}
    </div>
  );
}

/* ================= DIAGNÓSTICO (itens I e II do formulário) ================= */
export function CartaoDiagnostico({ d, up }) {
  const f = d.form;
  return (
    <Cartao titulo="Diagnóstico (formulário — itens I e II)">
      <span className="block text-xs font-semibold text-slate-600 mb-1.5">I. Critérios obrigatórios presentes</span>
      <div className="grid sm:grid-cols-3 gap-1.5">
        {obrigatorios.map(([id, n]) => <Marca key={id} checked={!!f.obrig?.[id]} onToggle={() => up(`form.obrig.${id}`, !f.obrig?.[id])}>{n}</Marca>)}
      </div>
      <span className="block text-xs font-semibold text-slate-600 mt-4 mb-1.5">II. Classificação</span>
      <Escolha valor={f.classif} onChange={(x) => up("form.classif", x)} opcoes={[["provavel", "DP provável"], ["estabelecida", "DP estabelecida"]]} />
      <div className="grid md:grid-cols-3 gap-3 mt-3">
        <div><span className="block text-xs font-semibold text-slate-600 mb-1.5">Critérios de suporte</span>
          <Marcas itens={suporte} valor={f.suporte} onChange={(n) => up("form.suporte", n)} /></div>
        <div><span className="block text-xs font-semibold text-amber-700 mb-1.5">Sinais de alerta (red flags)</span>
          <Marcas itens={alerta} valor={f.alerta} onChange={(n) => up("form.alerta", n)} tom="rose" /></div>
        <div><span className="block text-xs font-semibold text-rose-700 mb-1.5">Critérios de exclusão</span>
          <Marcas itens={exclusao} valor={f.exclusao} onChange={(n) => up("form.exclusao", n)} tom="rose" /></div>
      </div>
    </Cartao>
  );
}

/* ================= DEMÊNCIA NA DP (item III) ================= */
export function CartaoDDP({ d, up, der }) {
  const f = d.form;
  return (
    <Cartao titulo="III. Demência na doença de Parkinson (DDP)" sub={der.temRiv ? "Obrigatório para rivastigmina." : "Preencha se houver demência (necessário para rivastigmina)."}>
      <span className="block text-xs text-slate-600 mb-1">Paciente possui demência na doença de Parkinson?</span>
      <Escolha valor={f.ddp} onChange={(x) => up("form.ddp", x)} opcoes={[["sim", "Sim"], ["nao", "Não"]]} />
      {f.ddp === "sim" && (
        <div className="mt-3 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Txt rot="Início da DP" tipo="date" valor={d.hist.inicioDP} onChange={(x) => up("hist.inicioDP", x)} />
            <Txt rot="Início da DDP" tipo="date" valor={d.hist.inicioDDP} onChange={(x) => up("hist.inicioDDP", x)} />
          </div>
          <span className="block text-xs font-semibold text-slate-600">Critérios de inclusão (todos obrigatórios)</span>
          <Marcas itens={inclusaoDDP} valor={f.inclDDP} onChange={(n) => up("form.inclDDP", n)} />
        </div>
      )}
    </Cartao>
  );
}

/* ================= ANTECEDENTES, RASAGILINA E ENTACAPONA (itens IV a VI) ================= */
export function CartaoTerapeutica({ d, up, der }) {
  const h = d.hist;
  return (
    <Cartao titulo="IV–VI. Antecedentes terapêuticos, rasagilina e entacapona">
      <div className="space-y-3">
        <div>
          <span className="block text-xs text-slate-600 mb-1">IV. Já fez uso de medicamento para doença de Parkinson? <span className="text-rose-500">*</span></span>
          <Escolha valor={h.tratPrevio} onChange={(x) => up("hist.tratPrevio", x)} opcoes={[[true, "Sim"], [false, "Não"]]} />
        </div>
        {h.tratPrevio && <Txt rot="Quais?" ph="ex.: levodopa/benserazida 200/50 mg 8/8 h desde 2022; pramipexol com sonolência" valor={h.tratTexto} onChange={(x) => up("hist.tratTexto", x)} />}
        <div>
          <span className="block text-xs text-slate-600 mb-1">VI. Faz uso concomitante de levodopa?{der.temEnt && <span className="text-rose-500"> * (entacapona)</span>}</span>
          <Escolha valor={h.levodopa} onChange={(x) => up("hist.levodopa", x)} opcoes={[[true, "Sim"], [false, "Não"]]} />
          {h.levodopa && <Txt className="mt-2" rot="Levodopa — apresentação e dose" ph="ex.: levodopa/benserazida 200/50 mg, 1 comp. 6/6 h" valor={h.levodopaDose} onChange={(x) => up("hist.levodopaDose", x)} />}
          {der.entSemLevodopa && <p className="text-xs text-rose-700 mt-1">Entacapona só é usada junto com levodopa.</p>}
        </div>
        <div>
          <span className="block text-xs font-semibold text-slate-600 mb-1.5">V. Rasagilina — contraindicações aplicáveis{!der.temRas && <span className="font-normal text-slate-400"> (rasagilina não prescrita)</span>}</span>
          <Marcas itens={ciRasagilina} valor={d.form.ciRas} onChange={(n) => up("form.ciRas", n)} tom="rose" />
        </div>
      </div>
    </Cartao>
  );
}

/* ================= PACIENTE E HISTÓRIA ================= */
export function Paciente(props) {
  const { pac, upP, d, up } = props;
  const h = d.hist;
  const setEsc = (val) => { upP("escolaridade", val); up("meem", { ...d.meem, escIdx: anosParaEscIdx(val) }); };
  return (
    <div className="space-y-4">
      <Cartao titulo="Solicitação">
        <span className="block text-[11px] text-slate-500 mb-1">Tipo de solicitação</span>
        <Escolha valor={d.tipo} onChange={(x) => up("tipo", x || "inicio")} opcoes={[["inicio", "Início de tratamento"], ["continuidade", "Continuidade (renovação)"], ["troca", "Troca de medicamento / aumento de dose"]]} />
        <p className="text-xs text-slate-500 mt-2">CID-10: <b>G20</b> — Doença de Parkinson</p>
      </Cartao>
      <CartoesIdentificacao pac={pac} upP={upP} escolaridade={{
        onChange: setEsc,
        dica: pac.escolaridade !== "" ? `corte MEEM ${meemCutoffs[anosParaEscIdx(pac.escolaridade)][1]} (usado na rivastigmina)` : "usada no MEEM (rivastigmina)",
      }} />
      <Cartao titulo="História clínica" sub="Alimenta a anamnese do LME, o formulário de acesso e o relatório.">
        <div className="grid gap-3 sm:grid-cols-6">
          <Txt className="sm:col-span-2" rot="Início da doença de Parkinson" tipo="date" valor={h.inicioDP} onChange={(x) => up("hist.inicioDP", x)} />
          <Txt className="sm:col-span-4" rot="Estadiamento (opcional)" ph="ex.: Hoehn & Yahr 2; UPDRS-III 28" valor={h.estadio} onChange={(x) => up("hist.estadio", x)} />
          <Txt className="sm:col-span-6" area linhas={3} rot="Sintomas e evolução" ph="ex.: tremor de repouso em membro superior direito há 4 anos, com bradicinesia e rigidez assimétricas; flutuações de fim de dose há 1 ano"
            valor={h.sintomas} onChange={(x) => up("hist.sintomas", x)} />
          <Txt className="sm:col-span-6" area linhas={2} rot="Outros medicamentos em uso" valor={h.outrosMeds} onChange={(x) => up("hist.outrosMeds", x)} />
          <Txt className="sm:col-span-6" area linhas={2} rot="Comorbidades" valor={h.comorbidades} onChange={(x) => up("hist.comorbidades", x)} />
        </div>
      </Cartao>
      <CartaoDiagnostico {...props} />
      <CartaoDDP {...props} />
      <CartaoTerapeutica {...props} />
    </div>
  );
}

/* ================= EXAMES ================= */
export function Exames({ pac, d, up, der, med }) {
  const set = (id) => (val) => up(`exames.${id}`, val);
  const cfg = configSolicitacao(pac, d, der);
  const obrig = exames.filter((e) => e.para.some((x) => der.fams.includes(x)));
  const outros = exames.filter((e) => !obrig.includes(e));
  return (
    <div className="space-y-4">
      <SolicitarExames pac={pac} med={med} solic={d.solic} setSolic={(v) => up("solic", v)} {...cfg} />
      <div className="space-y-4 print:hidden">
        <h3 className="pt-2 text-sm font-bold text-slate-700">Resultados recebidos</h3>
        <Cartao titulo="Obrigatórios para o que foi prescrito" sub={der.fams.length ? `Medicamento(s): ${der.nomesFam.join(" + ")}` : "Escolha o medicamento na prescrição para ver os exames específicos."}>
          {obrig.length ? <div className="space-y-2">{obrig.map((e) => <LinhaExame key={e.id} ex={e} reg={d.exames[e.id]} set={set(e.id)} destaque />)}</div>
            : <p className="text-sm text-slate-400">Nenhum exame obrigatório — só avaliação clínica.</p>}
          {der.temRiv && <p className="text-xs text-slate-500 mt-2">Rivastigmina: aplique o MEEM e o CDR nas abas próprias.</p>}
        </Cartao>
        {outros.length > 0 && (
          <Cartao titulo="Específicos de outros medicamentos">
            <div className="space-y-2">{outros.map((e) => <LinhaExame key={e.id} ex={e} reg={d.exames[e.id]} set={set(e.id)} />)}</div>
          </Cartao>
        )}
      </div>
    </div>
  );
}

/* ================= PRESCRIÇÃO ================= */
const catPk = {
  apresentacoes, familias, esquemas,
  sub: "Clique na droga e no esquema. Doses usuais — ajuste conforme a resposta e a tolerância.",
  avisos: (fam, der) => {
    const l = [];
    if (fam === "ent" || der.temEnt) l.push("Entacapona: sempre junto com cada dose de levodopa.");
    if (fam === "ras" || der.temRas) l.push("Rasagilina: contraindicada com fluoxetina, fluvoxamina, outros IMAO, analgésicos narcóticos e ciclobenzaprina.");
    if (fam === "clz" || der.fams.includes("clz")) l.push("Clozapina: hemograma semanal nas primeiras 18 semanas e depois mensal.");
    if (fam === "riv" || der.temRiv) l.push("Rivastigmina: exige demência na DP (formulário item III), MEEM e CDR.");
    return l.length ? <div className="mt-2 space-y-1">{l.map((x) => <p key={x} className="text-xs text-amber-700">{x}</p>)}</div> : null;
  },
};
export const Prescricao = (props) => <PrescricaoBase {...props} cat={catPk} />;
