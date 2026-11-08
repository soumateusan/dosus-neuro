/* Epilepsia — módulo da patologia (seções, modelo de dados, checklist e telas) */
import { ClipboardCheck, User, FlaskConical, Pill, FileText, FileSignature, ListChecks, NotebookPen, Printer } from "lucide-react";
import { novaEpilepsia, derivar } from "./processo.js";
import { Visao, Paciente, Exames, Prescricao } from "./telas.jsx";
import { LME, Termo, Acesso, Relatorio, dadosLME } from "./documentos.jsx";
import { configSolicitacao } from "./textos.js";
import { dadosAPAC } from "../solicitacao.jsx";
import { ImprimirTudo as Base } from "../imprimirTudo.jsx";

const chk = (id) => (der) => der.checklist.find((c) => c.id === id)?.ok;

function ImprimirTudo(props) {
  const { pac, d, der, med } = props;
  const apac = dadosAPAC({ pac, med, solic: d.solic, ...configSolicitacao(pac, d, der) });
  const docs = [
    { id: "termo", nome: "Termo de esclarecimento e responsabilidade", falta: der.faltaTER, vias: true, render: (k) => <Termo key={k} {...props} /> },
    { id: "acesso", nome: "Formulário de acesso", falta: der.faltaAcesso, render: (k) => <Acesso key={k} {...props} /> },
  ];
  return <Base {...props} docs={docs} dadosLME={dadosLME} apac={apac} />;
}

export const epilepsia = {
  id: "epilepsia",
  nome: "Epilepsia",
  ativo: true,
  rodape: "Critérios conforme o PCDT da Epilepsia (Portaria Conjunta SAES/SCTIE nº 17/2018) e orientações da SESAB/BA.",
  novo: novaEpilepsia,
  derivar,
  inteiros: ["exames", "crises"],
  secoes: [
    { id: "visao", nome: "O que pedir", icone: ClipboardCheck },
    { id: "paciente", nome: "Paciente e história", icone: User },
    { id: "exames", nome: "Exames", icone: FlaskConical },
    { id: "prescricao", nome: "Prescrição", icone: Pill, ok: chk("presc") },
    { id: "lme", nome: "LME", icone: FileText, ok: chk("lme") },
    { id: "termo", nome: "Termo de esclarecimento", icone: FileSignature, ok: chk("ter") },
    { id: "acesso", nome: "Formulário de acesso", icone: ListChecks, ok: (der) => der.faltaAcesso.length === 0 },
    { id: "relatorio", nome: "Relatório médico", icone: NotebookPen, ok: (der) => der.faltaRel.length === 0 },
    { id: "imprimir", nome: "Imprimir tudo", icone: Printer },
  ],
  /* renovação: mantém história, crises, tratamento e prescrição; zera datas, exames pedidos e documentos gerados */
  renovar(old) {
    const novo = novaEpilepsia();
    return {
      ...old, tipo: "continuidade",
      hist: { ...old.hist, tratPrevio: true },
      trat: { ...old.trat, data: novo.trat.data },
      presc: { ...old.presc, data: novo.presc.data },
      lme: { ...old.lme, anamneseEditada: false, anamnese: "", geradoEm: null, data: novo.lme.data },
      termo: { ...old.termo, data: novo.termo.data },
      solic: { ...novo.solic },
      rel: novo.rel, docs: novo.docs,
    };
  },
  render(sec, props) {
    switch (sec) {
      case "visao": return <Visao {...props} />;
      case "paciente": return <Paciente {...props} />;
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
