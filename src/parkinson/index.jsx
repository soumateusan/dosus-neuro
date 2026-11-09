/* Doença de Parkinson — módulo da patologia (seções, modelo de dados, checklist e telas) */
import { Brain, Calculator, ClipboardCheck, User, FlaskConical, Pill, FileText, FileSignature, ListChecks, NotebookPen, Printer } from "lucide-react";
import { PacienteCtx } from "../shared/ui.jsx";
import { MEEM } from "../shared/meem.jsx";
import { CDR } from "../shared/cdr.jsx";
import { DataAplicacao } from "../comum.jsx";
import { idadeDe } from "../pacienteComum.jsx";
import { novoParkinson, derivar } from "./processo.js";
import { Visao, Paciente, Exames, Prescricao } from "./telas.jsx";
import { LME, Termo, Acesso, Relatorio, dadosLME } from "./documentos.jsx";
import { configSolicitacao } from "./textos.js";
import { dadosAPAC } from "../solicitacao.jsx";
import { ImprimirTudo as Base } from "../imprimirTudo.jsx";

const chk = (id) => (der) => der.checklist.find((c) => c.id === id)?.ok;

function ImprimirTudo(props) {
  const { pac, d, der, med } = props;
  const apac = dadosAPAC({ pac, med, solic: d.solic, ...configSolicitacao(pac, d, der) });
  const ctx = (data) => ({ nome: pac.nome, idade: idadeDe(pac), data, app: "DOSUS Neuro" });
  const docs = [
    { id: "termo", nome: "Termo de esclarecimento e responsabilidade", falta: der.faltaTER, vias: true, render: (k) => <Termo key={k} {...props} /> },
    { id: "acesso", nome: "Formulário de acesso", falta: der.faltaAcesso, render: (k) => <Acesso key={k} {...props} /> },
  ];
  if (der.temRiv) docs.push(
    { id: "meem", nome: "MEEM", falta: der.meemAplicado ? [] : ["aplicar o MEEM"], padrao: der.meemAplicado,
      render: (k) => <PacienteCtx.Provider key={k} value={ctx(d.meemData)}><MEEM estado={d.meem} setEstado={() => {}} /></PacienteCtx.Provider> },
    { id: "cdr", nome: "CDR", falta: d.cdrAplicado ? [] : ["aplicar o CDR"], padrao: d.cdrAplicado,
      render: (k) => <PacienteCtx.Provider key={k} value={ctx(d.cdrData)}><CDR estado={d.cdr} setEstado={() => {}} /></PacienteCtx.Provider> },
  );
  return <Base {...props} docs={docs} dadosLME={dadosLME} apac={apac} />;
}

export const parkinson = {
  id: "parkinson",
  nome: "Doença de Parkinson",
  ativo: true,
  rodape: "Critérios conforme o PCDT da Doença de Parkinson (Portaria Conjunta SAES/SECTICS nº 16/2025) e orientações da SESAB/BA.",
  novo: novoParkinson,
  derivar,
  inteiros: ["meem", "cdr", "exames"],
  secoes: [
    { id: "visao", nome: "O que pedir", icone: ClipboardCheck },
    { id: "paciente", nome: "Paciente e história", icone: User },
    { id: "meem", nome: "MEEM (rivastigmina)", icone: Brain, ok: (der) => (der.temRiv ? chk("meem")(der) : null) },
    { id: "cdr", nome: "CDR (rivastigmina)", icone: Calculator, ok: (der) => (der.temRiv ? chk("cdr")(der) : null) },
    { id: "exames", nome: "Exames", icone: FlaskConical, ok: (der) => (der.exStatus.length ? chk("exames")(der) : null) },
    { id: "prescricao", nome: "Prescrição", icone: Pill, ok: chk("presc") },
    { id: "lme", nome: "LME", icone: FileText, ok: chk("lme") },
    { id: "termo", nome: "Termo de esclarecimento", icone: FileSignature, ok: chk("ter") },
    { id: "acesso", nome: "Formulário de acesso", icone: ListChecks, ok: (der) => der.faltaAcesso.length === 0 },
    { id: "relatorio", nome: "Relatório médico", icone: NotebookPen, ok: (der) => der.faltaRel.length === 0 },
    { id: "imprimir", nome: "Imprimir tudo", icone: Printer },
  ],
  dataFicha: (sec, d) => (sec === "cdr" ? d.cdrData : d.meemData),
  /* renovação: mantém história, formulário e prescrição; zera escalas, datas e documentos gerados */
  renovar(old) {
    const novo = novoParkinson();
    return {
      ...old, tipo: "continuidade",
      hist: { ...old.hist, tratPrevio: true },
      form: { ...old.form, data: novo.form.data },
      meem: { ...novo.meem, escIdx: old.meem?.escIdx ?? null }, meemData: novo.meemData,
      cdr: novo.cdr, cdrAplicado: false, cdrData: novo.cdrData,
      presc: { ...old.presc, data: novo.presc.data },
      lme: { ...old.lme, anamneseEditada: false, anamnese: "", geradoEm: null, data: novo.lme.data },
      termo: { ...old.termo, data: novo.termo.data },
      solic: { ...novo.solic }, rel: novo.rel, docs: novo.docs,
    };
  },
  render(sec, props) {
    const { d, up } = props;
    switch (sec) {
      case "visao": return <Visao {...props} />;
      case "paciente": return <Paciente {...props} />;
      case "meem": return (
        <div className="space-y-3">
          <DataAplicacao valor={d.meemData} onChange={(v) => up("meemData", v)} />
          <MEEM estado={d.meem} setEstado={(v) => up("meem", v)} />
        </div>
      );
      case "cdr": return (
        <div className="space-y-3">
          <DataAplicacao valor={d.cdrData} onChange={(v) => up("cdrData", v)} />
          <CDR estado={d.cdr} setEstado={(v) => { up("cdr", v); up("cdrAplicado", true); }} />
        </div>
      );
      case "exames": return <Exames {...props} />;
      case "prescricao": return <Prescricao {...props} />;
      case "lme": return <LME {...props} />;
      case "termo": return <Termo {...props} />;
      case "acesso": return <Acesso {...props} />;
      case "relatorio": return <Relatorio {...props} />;
      case "imprimir": return <ImprimirTudo {...props} />;
      default: return null;
    }
  },
};
