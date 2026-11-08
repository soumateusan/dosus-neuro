/* Tela do LME: genérica — cada patologia passa dadosLME() e a anamnese automática */
import { useState } from "react";
import { FileDown, ExternalLink, RefreshCw, Loader2 } from "lucide-react";
import { Txt, Escolha, Cartao, Aviso, Faltando } from "./comum.jsx";
import { abrirPDF, LME_URL } from "./lme-util.js";

export function LME({ pac, d, up, der, med, irPerfil, dadosLME, anamneseAuto }) {
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState("");
  const anamnese = d.lme.anamneseEditada ? d.lme.anamnese : anamneseAuto;
  const linhas = dadosLME(pac, d, der, med).meds;

  const gerar = async (baixar) => {
    setGerando(true); setErro("");
    try {
      const { gerarLME } = await import("./lme.js");
      const bytes = await gerarLME(dadosLME(pac, d, der, med));
      abrirPDF(bytes, `LME - ${pac.nome || "paciente"}.pdf`, baixar);
      up("lme.geradoEm", new Date().toISOString());
    } catch (e) {
      setErro(String(e.message || e));
    }
    setGerando(false);
  };

  const semPerfil = !med.nome || !med.cnes || !med.cns;
  return (
    <div className="space-y-4">
      <Faltando itens={der.faltaLME} ok="Todos os campos obrigatórios do LME estão preenchidos." />
      {semPerfil && <Aviso tom="slate">CNES, estabelecimento, nome e CNS do médico vêm do <button onClick={irPerfil} className="font-semibold text-teal-700 underline">perfil do médico</button> — preencha uma vez e vale para todos os pacientes.</Aviso>}

      <Cartao titulo="Medicamentos e quantidades" sub="Vêm da prescrição.">
        {linhas.length ? (
          <table className="w-full text-xs">
            <thead><tr className="text-slate-400"><th className="text-left font-medium pb-1">Medicamento</th>{[1, 2, 3, 4, 5, 6].map((m) => <th key={m} className="font-medium w-9">{m}º</th>)}</tr></thead>
            <tbody>
              {linhas.map((l, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="py-1.5 text-slate-700 pr-2">{l.lme}</td>
                  {l.meses.map((q, j) => <td key={j} className="text-center text-slate-600">{q || ""}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="text-sm text-slate-400">Nenhum medicamento escolhido ainda.</p>}
      </Cartao>

      <Cartao titulo="11 — Anamnese" direita={d.lme.anamneseEditada && (
        <button onClick={() => { up("lme.anamneseEditada", false); up("lme.anamnese", ""); }} className="flex items-center gap-1 text-xs text-teal-700 font-semibold"><RefreshCw size={12} /> refazer automática</button>
      )} sub={d.lme.anamneseEditada ? "Editada manualmente." : "Gerada automaticamente da história, MEEM, CDR e neuroimagem. Edite se quiser."}>
        <textarea rows={6} value={anamnese} onChange={(e) => { up("lme.anamnese", e.target.value); up("lme.anamneseEditada", true); }}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 leading-relaxed" />
        <p className={"text-[11px] mt-1 " + (anamnese.length > 900 ? "text-amber-600" : "text-slate-400")}>{anamnese.length} caracteres{anamnese.length > 900 ? " — texto longo, a fonte ficará pequena no PDF" : ""}</p>
      </Cartao>

      <Cartao titulo="Campos complementares">
        <div className="space-y-3">
          <div>
            <span className="block text-[11px] text-slate-500 mb-1">18 — Campos abaixo preenchidos por</span>
            <Escolha valor={d.lme.preenchidoPor} onChange={(x) => up("lme.preenchidoPor", x || "medico")}
              opcoes={[["paciente", "Paciente"], ["mae", "Mãe"], ["responsavel", "Responsável"], ["medico", "Médico solicitante"], ["outro", "Outro"]]} />
          </div>
          {d.lme.preenchidoPor === "outro" && (
            <div className="grid sm:grid-cols-2 gap-3">
              <Txt rot="Nome" valor={d.lme.outroNome} onChange={(x) => up("lme.outroNome", x)} />
              <Txt rot="CPF" valor={d.lme.outroCPF} onChange={(x) => up("lme.outroCPF", x)} />
            </div>
          )}
          <div>
            <span className="block text-[11px] text-slate-500 mb-1">21 — Documento do paciente informado</span>
            <Escolha valor={d.lme.docTipo} onChange={(x) => up("lme.docTipo", x || "CPF")} opcoes={[["CPF", `CPF ${pac.cpf ? `(${pac.cpf})` : "(não informado)"}`], ["CNS", `CNS ${pac.cns ? `(${pac.cns})` : "(não informado)"}`]]} />
          </div>
          <Txt rot="16 — Data da solicitação" tipo="date" valor={d.lme.data} onChange={(x) => up("lme.data", x)} className="max-w-[12rem]" />
          <p className="text-xs text-slate-400">Raça/cor, telefones e e-mail vêm da identificação do paciente; capacidade e responsável, do item "Capacidade".</p>
        </div>
      </Cartao>

      {erro && <Aviso tom="rose">{erro}</Aviso>}
      <div className="grid sm:grid-cols-2 gap-2">
        <button onClick={() => gerar(false)} disabled={gerando}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 disabled:opacity-50">
          {gerando ? <Loader2 size={16} className="animate-spin" /> : <ExternalLink size={16} />} Abrir LME preenchido
        </button>
        <button onClick={() => gerar(true)} disabled={gerando}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-slate-700 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50">
          <FileDown size={16} /> Baixar PDF
        </button>
      </div>
      <p className="text-[11px] text-slate-400 text-center">
        O PDF gerado continua editável. {d.lme.geradoEm && `Último gerado em ${new Date(d.lme.geradoEm).toLocaleString("pt-BR")}. `}
        <a href={LME_URL} target="_blank" rel="noreferrer" className="underline">LME em branco</a>
      </p>
    </div>
  );
}

