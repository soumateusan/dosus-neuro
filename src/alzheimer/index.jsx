/* Doença de Alzheimer — módulo da patologia (seções, modelo de dados, checklist e telas) */
import { Brain, ClipboardCheck, User, FlaskConical, Pill, FileText, FileSignature, ListChecks, NotebookPen, Calculator, Printer } from "lucide-react";
import { MEEM } from "../shared/meem.jsx";
import { CDR } from "../shared/cdr.jsx";
import { DataAplicacao } from "../comum.jsx";
import { novoAlzheimer, derivar } from "./processo.js";
import { Visao, Paciente, Exames, Prescricao } from "./telas.jsx";
import { LME, Termo, Acesso, Relatorio } from "./documentos.jsx";
import { ImprimirTudo } from "./imprimir.jsx";

const chk = (id) => (der) => der.checklist.find((c) => c.id === id)?.ok;

export const alzheimer = {
  id: "alzheimer",
  nome: "Doença de Alzheimer",
  ativo: true,
  rodape: "Critérios conforme o PCDT da Doença de Alzheimer (Portaria Conjunta SAES/SCTIE nº 27/2025) e orientações da SESAB/BA.",
  novo: novoAlzheimer,
  derivar,
  /* campos que não são mesclados campo a campo ao reabrir um processo salvo */
  inteiros: ["meem", "cdr", "exames"],
  secoes: [
    { id: "visao", nome: "O que pedir / elegibilidade", icone: ClipboardCheck },
    { id: "paciente", nome: "Paciente e história", icone: User },
    { id: "meem", nome: "MEEM", icone: Brain, ok: chk("meem") },
    { id: "cdr", nome: "CDR", icone: Calculator, ok: chk("cdr") },
    { id: "exames", nome: "Exames", icone: FlaskConical, ok: chk("exames") },
    { id: "prescricao", nome: "Prescrição", icone: Pill, ok: chk("presc") },
    { id: "lme", nome: "LME", icone: FileText, ok: chk("lme") },
    { id: "termo", nome: "Termo de esclarecimento", icone: FileSignature, ok: chk("ter") },
    { id: "acesso", nome: "Formulário de acesso", icone: ListChecks, ok: (der) => der.faltaAcesso.length === 0 },
    { id: "relatorio", nome: "Relatório médico", icone: NotebookPen, ok: (der) => der.faltaRel.length === 0 },
    { id: "imprimir", nome: "Imprimir tudo", icone: Printer },
  ],
  /* data que vai no cabeçalho das fichas impressas do MEEM/CDR */
  dataFicha: (sec, d) => (sec === "cdr" ? d.cdrData : d.meemData),

  /* renovação: copia história, prescrição, exames e formulário; zera MEEM, CDR, datas e documentos gerados */
  renovar(old, resumo) {
    const novo = novoAlzheimer();
    return {
      ...old, tipo: "continuidade",
      meem: { ...novo.meem, words: old.meem?.words || novo.meem.words, escIdx: old.meem?.escIdx ?? null }, meemData: novo.meemData,
      cdr: novo.cdr, cdrAplicado: false, cdrData: novo.cdrData,
      presc: { ...old.presc, data: novo.presc.data },
      hist: { ...old.hist, tratPrevio: true, tratTexto: old.hist?.tratTexto || (resumo?.meds || []).join(" + "), estab: null },
      lme: { ...old.lme, anamneseEditada: false, anamnese: "", geradoEm: null, data: novo.lme.data },
      termo: { ...old.termo, data: novo.termo.data },
      acesso: { ...old.acesso, data: novo.acesso.data },
      solic: { ...novo.solic },
      rel: novo.rel, docs: novo.docs,
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
