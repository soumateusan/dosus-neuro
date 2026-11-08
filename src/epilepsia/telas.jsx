import { ExternalLink, CheckCircle2, Circle, MapPin } from "lucide-react";
import { Txt, Escolha, Marca, Cartao, Aviso } from "../comum.jsx";
import { CartaoSolicitacao, CartoesIdentificacao } from "../pacienteComum.jsx";
import { SolicitarExames } from "../solicitacao.jsx";
import { LinhaExame } from "../exames.jsx";
import { Prescricao as PrescricaoBase } from "../prescricao.jsx";
import { cids, apresentacoes, familias, esquemas, faeBasicos, exames, examesMonitoramento, crises, inclusao, documentos, unidades, LINK_SESAB } from "./dados.js";
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
        <p className="text-xs text-slate-500 mt-2 px-2">O relatório deve trazer CID-10, história clínica detalhada, diagnóstico de epilepsia, descrição das crises pela classificação da ILAE e ausência de critério de exclusão.</p>
      </Cartao>

      {der.alertaAssoc && (
        <Aviso>
          <p><b>Associação:</b> {der.alertaAssoc}.</p>
          <p>A SESAB orienta associar um fármaco de espectro amplo (ácido valproico, lamotrigina, topiramato, levetiracetam) com um de espectro restrito (carbamazepina, fenitoína, fenobarbital) e evitar dois com o mesmo mecanismo. Associações fora disso precisam de justificativa técnica (item 3.5 do formulário).</p>
        </Aviso>
      )}

      <Cartao titulo="Exames">
        <div className="text-sm text-slate-700 space-y-2">
          <p><b>Abertura do processo:</b> nenhum exame obrigatório. Complementares para o diagnóstico: laudo do EEG e RM do encéfalo (só para epilepsias focais refratárias), validade de 12 meses.</p>
          <p><b>Monitoramento anual:</b> hemograma com plaquetas, ALT/TGP, AST/TGO, sódio, potássio, colesterol total e frações, triglicerídeos, vitamina D, TSH e T4 livre.</p>
          <button onClick={() => ir("exames")} className="text-xs font-semibold text-teal-700 hover:underline">Pedir exames / registrar resultados →</button>
        </div>
      </Cartao>

      <Cartao titulo="Associações e renovação">
        <div className="text-sm text-slate-700 space-y-2">
          <p>Em caso de falha do primeiro fármaco, tentar outra monoterapia; após falha da segunda, pode-se associar dois FAE. Associações excepcionais ou não recomendadas no PCDT exigem justificativa técnica.</p>
          <p><b>Troca de medicamento ou aumento de dose:</b> avaliação na unidade responsável pela avaliação inicial, por médico especialista. Recomenda-se justificar no relatório ou no campo 11 (anamnese) do LME.</p>
          <p><b>Continuidade sem troca nem aumento de dose:</b> avaliação na unidade de cadastro. <b>LME:</b> renovar semestralmente.</p>
          <p className="text-xs text-slate-500">Epilepsia refratária: atendimento por neurologista em hospital terciário habilitado em alta complexidade em Neurologia/Neurocirurgia.</p>
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
        <ExternalLink size={13} /> Página da SESAB — Epilepsia (PCDT, fluxo de acesso, SIGTAP)
      </a>
      {pac.nome === "" && <p className="text-center text-xs text-slate-400">Comece pela aba <button className="font-semibold text-teal-700" onClick={() => ir("paciente")}>Paciente e história</button>.</p>}
    </div>
  );
}

/* ================= CRISES E CRITÉRIOS (usado no paciente e no formulário) ================= */
export function CartaoCrises({ d, up }) {
  const tog = (id) => up(`crises.${id}`, !d.crises?.[id]);
  return (
    <Cartao titulo="Diagnóstico: critério de inclusão e tipo de crise (ILAE 2017)">
      <span className="block text-xs font-semibold text-slate-600 mb-1.5">1. Critério de inclusão (ao menos 1)</span>
      <div className="space-y-1.5">
        {inclusao.map((t, i) => <Marca key={i} checked={d.incl[i]} onToggle={() => up("incl", d.incl.map((x, k) => (k === i ? !x : x)))}>{t}</Marca>)}
      </div>
      <span className="block text-xs font-semibold text-slate-600 mt-4 mb-1.5">2. Tipo de crise (ao menos 1)</span>
      <div className="grid sm:grid-cols-3 gap-3">
        {crises.map((c) => (
          <div key={c.id} className="space-y-2">
            <div className="text-sm font-semibold text-slate-800">{c.nome}</div>
            {c.grupos.map((g, gi) => (
              <div key={gi}>
                {g.nome && <div className="text-[11px] font-semibold text-slate-500 mb-1">{g.nome}</div>}
                <div className="flex flex-wrap gap-1">
                  {g.itens.map(([id, nome]) => {
                    const on = !!d.crises?.[id];
                    return (
                      <button key={id} onClick={() => tog(id)}
                        className={"px-2 py-1 rounded-md text-xs border " + (on ? "bg-teal-600 border-teal-600 text-white font-semibold" : "bg-white border-slate-200 text-slate-600 hover:border-teal-400")}>
                        {nome}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <Txt className="mt-3" rot="4. Outras" valor={d.crisesOutras} onChange={(x) => up("crisesOutras", x)} />
    </Cartao>
  );
}

/* ================= TRATAMENTO (3.1 a 3.5 do formulário) ================= */
export function CartaoTratamento({ d, up, der }) {
  const t = d.trat;
  const sn = [["sim", "Sim"], ["nao", "Não"]];
  return (
    <Cartao titulo="3. Tratamento medicamentoso">
      <div className="space-y-3">
        <div><span className="block text-xs text-slate-600 mb-1">3.1 Realizou a <b>primeira</b> monoterapia e houve intolerância ou falha?</span>
          <Escolha valor={t.mono1} onChange={(x) => up("trat.mono1", x)} opcoes={sn} /></div>
        <div><span className="block text-xs text-slate-600 mb-1">3.2 Realizou a <b>segunda</b> monoterapia e houve intolerância ou falha?</span>
          <Escolha valor={t.mono2} onChange={(x) => up("trat.mono2", x)} opcoes={sn} /></div>
        <div><span className="block text-xs text-slate-600 mb-1">3.3 Está em uso de associação medicamentosa?</span>
          <Escolha valor={t.assoc} onChange={(x) => up("trat.assoc", x)} opcoes={sn} /></div>
        <div>
          <span className="block text-xs text-slate-600 mb-1">3.4 Antiepilépticos em uso atualmente</span>
          <p className="text-[11px] text-slate-400 mb-1.5">Os do CEAF vêm da prescrição ({der.nomesFam.join(", ") || "nenhum ainda"}). Marque os do componente básico:</p>
          <div className="flex flex-wrap gap-1.5">
            {faeBasicos.map((b) => {
              const on = !!d.hist.basicos?.[b.id];
              return (
                <button key={b.id} onClick={() => up(`hist.basicos.${b.id}`, !on)}
                  className={"px-2.5 py-1 rounded-lg text-xs border " + (on ? "bg-teal-600 border-teal-600 text-white font-semibold" : "bg-white border-slate-200 text-slate-600 hover:border-teal-400")}>
                  {b.nome}
                </button>
              );
            })}
          </div>
          {der.emUso.length > 0 && <p className="text-xs text-slate-600 mt-1.5">Em uso: <b>{der.emUso.map((x) => x.nome.split("/")[0]).join(" + ")}</b></p>}
        </div>
        {der.alertaAssoc && <Aviso>Associação: {der.alertaAssoc}. Justifique abaixo (3.5).</Aviso>}
        <Txt area linhas={3} rot="3.5 Justificativa técnica (associações fora da forma geral do PCDT)" valor={t.justif} onChange={(x) => up("trat.justif", x)} />
      </div>
    </Cartao>
  );
}

/* ================= PACIENTE E HISTÓRIA ================= */
export function Paciente(props) {
  const { pac, upP, d, up } = props;
  const h = d.hist;
  return (
    <div className="space-y-4">
      <CartaoSolicitacao d={d} up={up} cids={cids} />
      <CartoesIdentificacao pac={pac} upP={upP} />
      <Cartao titulo="História clínica" sub="Alimenta a anamnese do LME, o formulário de acesso e o relatório.">
        <div className="grid gap-3 sm:grid-cols-6">
          <Txt className="sm:col-span-6" area linhas={4} rot="Descrição detalhada: sinais, sintomas e evolução do quadro clínico" obrig
            ph="ex.: crises com sensação epigástrica ascendente seguida de perda de contato e automatismos oromandibulares, por 1 a 2 minutos, eventualmente evoluindo para crise tônico-clônica bilateral"
            valor={h.descricao} onChange={(x) => up("hist.descricao", x)} />
          <Txt className="sm:col-span-2" rot="Idade de início dos sintomas" obrig ph="ex.: 14 anos" valor={h.idadeInicio} onChange={(x) => up("hist.idadeInicio", x)} />
          <Txt className="sm:col-span-2" rot="Frequência das crises" ph="ex.: 4 por mês" valor={h.frequencia} onChange={(x) => up("hist.frequencia", x)} />
          <Txt className="sm:col-span-2" rot="Última crise" ph="ex.: há 10 dias" valor={h.ultimaCrise} onChange={(x) => up("hist.ultimaCrise", x)} />
          <Txt className="sm:col-span-6" rot="Etiologia / síndrome epiléptica" ph="ex.: esclerose mesial temporal esquerda" valor={h.etiologia} onChange={(x) => up("hist.etiologia", x)} />
          <Txt className="sm:col-span-2" rot="EEG — data" tipo="date" valor={h.eegData} onChange={(x) => up("hist.eegData", x)} />
          <Txt className="sm:col-span-4" rot="EEG — achados" ph="ex.: atividade epileptiforme temporal esquerda" valor={h.eegLaudo} onChange={(x) => up("hist.eegLaudo", x)} />
          <Txt className="sm:col-span-2" rot="RM do encéfalo — data" tipo="date" valor={h.rmData} onChange={(x) => up("hist.rmData", x)} />
          <Txt className="sm:col-span-4" rot="RM — achados" valor={h.rmLaudo} onChange={(x) => up("hist.rmLaudo", x)} />
          <Txt className="sm:col-span-6" area linhas={2} rot="Comorbidades" valor={h.comorbidades} onChange={(x) => up("hist.comorbidades", x)} />
          <div className="sm:col-span-6">
            <span className="block text-[11px] text-slate-500 mb-1">Realizou tratamento prévio ou está em tratamento da doença? <span className="text-rose-500">*</span></span>
            <Escolha valor={h.tratPrevio} onChange={(x) => up("hist.tratPrevio", x)} opcoes={[[false, "Não"], [true, "Sim"]]} />
          </div>
          {h.tratPrevio && <Txt className="sm:col-span-6" area linhas={2} rot="Relatar os tratamentos (fármaco, dose, resposta)" ph="ex.: carbamazepina 800 mg/dia por 2 anos, sem controle; valproato 1 g/dia com intolerância (tremor)" valor={h.tratTexto} onChange={(x) => up("hist.tratTexto", x)} />}
        </div>
      </Cartao>
      <CartaoCrises d={d} up={up} />
      <CartaoTratamento {...props} />
    </div>
  );
}

/* ================= EXAMES ================= */
export function Exames({ pac, d, up, der, med }) {
  const set = (id) => (val) => up(`exames.${id}`, val);
  const cfg = configSolicitacao(pac, d, der);
  return (
    <div className="space-y-4">
      <SolicitarExames pac={pac} med={med} solic={d.solic} setSolic={(v) => up("solic", v)} {...cfg} />
      <div className="space-y-4 print:hidden">
        <h3 className="pt-2 text-sm font-bold text-slate-700">Resultados recebidos</h3>
        <Cartao titulo="Diagnóstico (não obrigatórios para abrir o processo)">
          <div className="space-y-2">{exames.map((e) => <LinhaExame key={e.id} ex={e} reg={d.exames[e.id]} set={set(e.id)} />)}</div>
        </Cartao>
        <Cartao titulo="Monitoramento anual">
          <div className="space-y-2">{examesMonitoramento.map((e) => <LinhaExame key={e.id} ex={e} reg={d.exames[e.id]} set={set(e.id)} />)}</div>
        </Cartao>
      </div>
    </div>
  );
}

/* ================= PRESCRIÇÃO ================= */
const catEpi = {
  apresentacoes, familias, esquemas,
  sub: "Clique na droga e no esquema. Doses de adulto — em crianças, ajuste por peso.",
  avisos: (fam, der) => {
    const l = [];
    if (fam === "ltg" || der.fams.includes("ltg")) l.push(der.basicos.some((b) => b.id === "vpa")
      ? "Lamotrigina com valproato: titulação mais lenta e dose menor (risco de rash grave)."
      : "Lamotrigina: titular devagar; suspender se houver rash.");
    if (fam === "vgb" || der.fams.includes("vgb")) l.push("Vigabatrina: risco de defeito de campo visual — monitorar.");
    if (der.alertaAssoc) l.push(`Associação: ${der.alertaAssoc}. Justifique no formulário de acesso (3.5).`);
    return l.length ? <div className="mt-2 space-y-1">{l.map((x) => <p key={x} className="text-xs text-amber-700">{x}</p>)}</div> : null;
  },
};
export const Prescricao = (props) => <PrescricaoBase {...props} cat={catEpi} />;
