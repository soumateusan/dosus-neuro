/* Imprimir tudo — Doença de Alzheimer: termo, formulário de acesso, MEEM e CDR; LME + APAC */
import { PacienteCtx } from "../shared/ui.jsx";
import { MEEM } from "../shared/meem.jsx";
import { CDR } from "../shared/cdr.jsx";
import { Termo, Acesso, dadosLME } from "./documentos.jsx";
import { configSolicitacao } from "./solic.js";
import { dadosAPAC } from "../solicitacao.jsx";
import { idadeDe } from "./processo.js";
import { ImprimirTudo as Base } from "../imprimirTudo.jsx";

export function ImprimirTudo(props) {
  const { pac, d, der, med } = props;
  const apac = dadosAPAC({ pac, med, solic: d.solic, ...configSolicitacao(pac, d, der) });
  const ctx = (data) => ({ nome: pac.nome, idade: idadeDe(pac), data, app: "DOSUS Neuro" });
  const docs = [
    { id: "termo", nome: "Termo de esclarecimento e responsabilidade", falta: der.faltaTER, vias: true, render: (k) => <Termo key={k} {...props} /> },
    { id: "acesso", nome: "Formulário de acesso", falta: der.faltaAcesso, render: (k) => <Acesso key={k} {...props} /> },
    { id: "meem", nome: "MEEM", falta: der.meemAplicado ? [] : ["aplicar o MEEM"], padrao: der.meemAplicado,
      render: (k) => <PacienteCtx.Provider key={k} value={ctx(d.meemData)}><MEEM estado={d.meem} setEstado={() => {}} /></PacienteCtx.Provider> },
    { id: "cdr", nome: "CDR", falta: d.cdrAplicado ? [] : ["aplicar o CDR"], padrao: d.cdrAplicado,
      render: (k) => <PacienteCtx.Provider key={k} value={ctx(d.cdrData)}><CDR estado={d.cdr} setEstado={() => {}} /></PacienteCtx.Provider> },
  ];
  return <Base {...props} docs={docs} dadosLME={dadosLME} apac={apac} />;
}
