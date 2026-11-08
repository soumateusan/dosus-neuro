import { Txt, Escolha, Cartao, Aviso, TextoPronto, Imprimir, Faltando, CabecalhoSESAB, Lacuna, X, fmt } from "../comum.jsx";
import { LME as LMEBase } from "../lmeTela.jsx";
import { apresentacoes, crises, inclusao, PORTARIA } from "./dados.js";
import { anamneseLME, textoRelatorio, cidDesc } from "./textos.js";
import { CartaoCrises, CartaoTratamento } from "./telas.jsx";

/* ================= LME ================= */
export function dadosLME(pac, d, der, med) {
  const anamnese = d.lme.anamneseEditada ? d.lme.anamnese : anamneseLME(pac, d, der);
  return {
    cnes: med.cnes, estabelecimento: med.estabelecimento,
    nome: pac.nome, mae: pac.mae, peso: pac.peso, altura: pac.altura,
    meds: der.itens.map((i) => ({ lme: apresentacoes[i.ap].lme, meses: i.meses })), cid: d.cid, diagnostico: cidDesc(d.cid), anamnese,
    tratPrevio: d.hist.tratPrevio, tratTexto: d.hist.tratTexto,
    incapaz: pac.incapaz, responsavel: pac.responsavel,
    medico: med.nome, cnsMedico: med.cns, data: fmt(d.lme.data),
    preenchidoPor: d.lme.preenchidoPor, outroNome: d.lme.outroNome, outroCPF: d.lme.outroCPF,
    raca: pac.raca, etnia: pac.etnia, tel1: pac.tel1, tel2: pac.tel2,
    docTipo: d.lme.docTipo, docNumero: d.lme.docTipo === "CNS" ? pac.cns : pac.cpf, email: pac.email,
  };
}
export const LME = (props) => <LMEBase {...props} dadosLME={dadosLME} anamneseAuto={anamneseLME(props.pac, props.d, props.der)} />;

/* ================= TERMO DE ESCLARECIMENTO E RESPONSABILIDADE ================= */
/* ordem do modelo da SESAB; "id" liga ao que está prescrito (CEAF) ou marcado como em uso (básico) */
const TERMO_MEDS = [
  [["cbz", "carbamazepina"], ["lev", "levetiracetam"], ["clb", "clobazam"], ["ltg", "lamotrigina"], ["czp", "clonazepam"], ["top", "topiramato"]],
  [["eto", "etossuximida"], ["pri", "primidona"], ["pht", "fenitoína"], ["vgb", "vigabatrina"], ["pb", "fenobarbital"], ["gbp", "gabapentina"]],
  [["vpa", "ácido valproico/valproato de sódio"]],
];

export function Termo({ pac, d, up, der, med }) {
  const local = d.termo.local || med.cidade || "";
  const [ano, mes, dia] = (d.termo.data || "").split("-");
  const emUso = new Set(der.emUso.map((x) => x.id));
  return (
    <>
    <div className="space-y-4 print:hidden">
      <Faltando itens={der.faltaTER} ok="Termo pronto para imprimir e assinar (em duas vias)." />
      <Cartao titulo="Lacunas do termo" sub="Nome do paciente, médico, CRM e medicamentos já vêm preenchidos.">
        <div className="space-y-3">
          <div>
            <span className="block text-[11px] text-slate-500 mb-1">Autoriza o Ministério da Saúde e as Secretarias de Saúde a usarem informações do tratamento, assegurado o anonimato? <span className="text-rose-500">*</span></span>
            <Escolha valor={d.termo.autoriza} onChange={(x) => up("termo.autoriza", x)} opcoes={[["sim", "Sim"], ["nao", "Não"]]} />
          </div>
          <div>
            <span className="block text-[11px] text-slate-500 mb-1">Medicamentos marcados — prescrição + FAE do componente básico em uso (marque em Paciente → 3.4)</span>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {TERMO_MEDS.flat().map(([id, n]) => (
                <span key={id} className={"px-2 py-0.5 rounded-md border " + (emUso.has(id) ? "bg-teal-50 border-teal-300 text-teal-800 font-semibold" : "border-slate-200 text-slate-400")}>{n}</span>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Txt rot="Local" ph={med.cidade || "cidade"} valor={d.termo.local} onChange={(x) => up("termo.local", x)} />
            <Txt rot="Data" tipo="date" valor={d.termo.data} onChange={(x) => up("termo.data", x)} />
          </div>
        </div>
      </Cartao>
      <Imprimir label="Gerar PDF / imprimir termo" />
    </div>

    <div className="hidden print:block text-black text-[11px] leading-[1.32]">
      <CabecalhoSESAB variante="atual" />
      <div className="text-center font-bold text-[12.5px] space-y-1.5 mb-3">
        <div>TERMO DE ESCLARECIMENTO E RESPONSABILIDADE</div>
        <div>EPILEPSIA</div>
        <div className="text-[11.5px]">Clobazam, Etossuximida, Gabapentina, Lamotrigina, Levetiracetam, Topiramato, Vigabatrina</div>
      </div>
      <div className="text-justify">
        <p>
          Eu, <Lacuna v={pac.nome} w="280px" />(nome do(a) paciente), declaro ter sido informado(a) claramente sobre benefícios, riscos,
          contraindicações e principais efeitos adversos relacionados ao uso de ácido valproico/valproato de sódio, carbamazepina, clobazam,
          clonazepam, etossuximida, fenitoína, fenobarbital, gabapentina, lamotrigina, levetiracetam, primidona, topiramato e vigabatrina,
          indicados para o tratamento da epilepsia. Os termos médicos foram explicados e todas as minhas dúvidas foram resolvidas pelo médico{" "}
          <Lacuna v={med.nome} w="240px" /> (nome do médico que prescreve). Assim, declaro que fui claramente informado(a) de que o
          medicamento que passo a receber pode trazer as seguintes melhoras: Controle completo das crises; Melhora da qualidade de vida.
        </p>
        <p>Fui também claramente informado(a) a respeito das seguintes contraindicações, potenciais efeitos adversos e riscos do uso do medicamento:</p>
        <p className="indent-4">
          Gravidez: todos os anti epilépticos tem um risco pequeno de provocar problemas para o feto se usados durante a gestação. Pacientes
          com vida sexual ativa, que pretendem engravidar ou que estão gestantes devem procurar o seu médico para orientações sobre o risco
          de malformações e os ajustes de dose dos antiepilépticos que deverão ser realizados durante a gestação;
        </p>
        <p>Os principais efeitos adversos dos medicamentos para epilepsia são:</p>
        <p className="indent-4">Clobazam: sonolência, transtornos de memória e de comportamento, perda progressiva do efeito;</p>
        <p className="indent-4">Etossuximida: diarreia, náusea, vômitos, sonolência, perda de peso, dor de cabeça;</p>
        <p className="indent-4">Gabapentina: aumento do apetite, ganho de peso, tontura, incoordenação, dor de cabeça, tremor, cansaço, náusea, comportamento agressivo (em crianças);</p>
        <p className="indent-4">Lamotrigina: dor de cabeça, náusea, vômitos, visão dupla, tonturas, incoordenação e tremor;</p>
        <p className="indent-4">Levetiracetam: tontura, sonolência, desânimo, cansaço e dor de cabeça;</p>
        <p className="indent-4">Topiramato: sonolência, perda do apetite, cansaço, nervosismo, pensamento lento, dificuldade de encontrar palavras, dificuldade de concentração, perda de peso, cálculo renal e glaucoma;</p>
        <p className="indent-4">Vigabatrina: defeitos do campo visual, sonolência, dor de cabeça, tontura, incoordenação, transtornos de memória e de comportamento, ganho de peso e tremor.</p>
        <p>
          Usualmente estes efeitos adversos são leves e temporários, e se eles se agravarem, ou não desaparecerem, o paciente deve retornar
          ao médico. Estou ciente de que este medicamento somente pode ser utilizado por mim, comprometendo-me a devolvê-lo caso não queira ou
          não possa utilizá-lo ou se o tratamento for interrompido
        </p>
        <p className="mt-2">
          Sei também que continuarei a ser atendido (a), inclusive em caso de desistir de usar o medicamento. Autorizo o Ministério da Saúde e
          as Secretarias de Saúde a fazerem uso de informações relativas ao meu tratamento, desde que assegurado o anonimato.{" "}
          <X on={d.termo.autoriza === "sim"} /> Sim <X on={d.termo.autoriza === "nao"} /> Não
        </p>
        <p>O meu tratamento constará do(s) seguinte(s) medicamento (s):</p>
        {TERMO_MEDS.map((linha, i) => (
          <p key={i}>{linha.map(([id, n]) => <span key={id} className="mr-3"><X on={emUso.has(id)} /> {n}</span>)}</p>
        ))}
      </div>

      <table className="w-full border-collapse border border-black mt-3 text-[11px]">
        <tbody>
          <tr><td className="border border-black px-2 py-1" colSpan={2}>Local: <b>{local}</b></td>
            <td className="border border-black px-2 py-1 w-52">Data: <b>{dia || "   "} / {mes || "   "} / {ano || "     "}</b></td></tr>
          <tr><td className="border border-black px-2 py-1" colSpan={2}>Nome do paciente: <b>{pac.nome}</b></td>
            <td className="border border-black px-2 py-1">Cartão SUS: <b>{pac.cns}</b></td></tr>
          <tr><td className="border border-black px-2 py-1" colSpan={2}>Nome do responsável legal: <b>{pac.incapaz || pac.responsavel ? pac.responsavel : ""}</b></td>
            <td className="border border-black px-2 py-1">Doc.Ident.: <b>{pac.incapaz || pac.responsavel ? pac.respDoc : ""}</b></td></tr>
          <tr><td className="border border-black px-2 pt-10 pb-1 text-center" colSpan={3}>
            <div className="w-80 mx-auto border-t border-black pt-0.5">Assinatura do paciente ou do responsável legal</div></td></tr>
          <tr><td className="border border-black px-2 py-1">Médico Responsável: <b>{med.nome}</b></td>
            <td className="border border-black px-2 py-1 w-36">CRM: <b>{med.crm}</b></td>
            <td className="border border-black px-2 py-1">UF: <b>{med.uf}</b></td></tr>
          <tr><td className="border border-black px-2 pt-12 pb-1 text-center" colSpan={3}>
            <div className="w-64 mx-auto border-t border-black pt-0.5">Assinatura e carimbo do médico</div></td></tr>
        </tbody>
      </table>
      <p className="mt-1 text-[8.5px] font-bold">
        Observação: Este Termo é obrigatório ao se solicitar o fornecimento de medicamento do Componente Especializado da Assistência
        Farmacêutica e deverá ser preenchido em duas vias: uma será arquivada na farmácia, e a outra, entregue ao usuário ou ao seu responsável legal.
      </p>
    </div>
    </>
  );
}

/* ================= FORMULÁRIO DE ACESSO ================= */
const Linhas = ({ texto, n }) => (
  <div className="whitespace-pre-wrap leading-[22px] min-h-[1px]" style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 21px, #000 21px, #000 22px)", minHeight: `${n * 22}px` }}>{texto}</div>
);

export function Acesso(props) {
  const { pac, d, up, der, med } = props;
  const [ano, mes, dia] = (d.trat.data || "").split("-");
  const t = d.trat;
  const emUsoTxt = der.emUso.map((x) => x.nome.split("/")[0]).join(", ");
  return (
    <>
    <div className="space-y-4 print:hidden">
      <Faltando itens={der.faltaAcesso} ok="Formulário completo — gere o PDF para imprimir e assinar." />
      <Aviso tom="slate">Descrição do quadro, idade de início e tratamentos vêm de Paciente e história. Os blocos abaixo são os mesmos de lá — o que você marcar aqui aparece lá também.</Aviso>
      <Cartao titulo="Quadro clínico">
        <Txt area linhas={4} rot="Descrição detalhada informando sinais, sintomas e evolução do quadro clínico" valor={d.hist.descricao} onChange={(x) => up("hist.descricao", x)} />
        <Txt className="mt-3 max-w-xs" rot="Idade em que apresentou os primeiros sintomas" valor={d.hist.idadeInicio} onChange={(x) => up("hist.idadeInicio", x)} />
      </Cartao>
      <CartaoCrises d={d} up={up} />
      <CartaoTratamento {...props} />
      <Txt className="max-w-[12rem]" rot="Data do preenchimento" tipo="date" valor={t.data} onChange={(x) => up("trat.data", x)} />
      <Imprimir label="Gerar PDF / imprimir formulário" />
    </div>

    <div className="hidden print:block text-black text-[11.5px] leading-[1.35]">
      <CabecalhoSESAB variante="atual" />
      <div className="text-center font-bold text-[13px] mb-1">FORMULÁRIO DE ACESSO - EPILEPSIA</div>
      <div className="text-center font-bold text-[12px] mb-3">{PORTARIA}</div>
      <table className="w-full border-collapse border border-black font-bold mb-3">
        <tbody>
          <tr><td className="border border-black px-2 py-1" colSpan={3}>Nome do Paciente: <span className="font-normal">{pac.nome}</span></td></tr>
          <tr><td className="border border-black px-2 py-1">Médico Responsável: <span className="font-normal">{med.nome}</span></td>
            <td className="border border-black px-2 py-1 w-32">CRM: <span className="font-normal">{med.crm}</span></td>
            <td className="border border-black px-2 py-1 w-24">UF: <span className="font-normal">{med.uf}</span></td></tr>
          <tr><td className="border border-black px-2 py-1" colSpan={3}>
            <div className="flex justify-between"><span>CID-10: <span className="font-normal">{d.cid}</span></span>
              <span className="mr-8">Data do preenchimento: <span className="font-normal">{dia || "  "} / {mes || "  "} / {ano || "    "}</span></span></div></td></tr>
        </tbody>
      </table>
      <p className="font-bold">Descrição detalhada informando sinais, sintomas e evolução do quadro clínico:</p>
      <Linhas texto={d.hist.descricao} n={4} />
      <p className="font-bold mt-2">Qual a idade paciente apresentou os primeiros sintomas (início da doença)? <span className="font-normal underline">{d.hist.idadeInicio || " ".repeat(20)}</span></p>
      <p className="font-bold mt-2">1 - Qual dos Critérios de inclusão o (a) paciente apresenta (marcar com X em ao menos 1)?</p>
      {inclusao.map((x, i) => <p key={i}><X on={d.incl[i]} /> {x}</p>)}
      <p className="font-bold mt-2">2 - Tipo de Crise apresentada pelo paciente (marcar ao menos 1 tipo de início) – ILAE 2017:</p>
      <div className="grid grid-cols-3 gap-3 mt-1">
        {crises.map((c) => (
          <div key={c.id}>
            <p className="font-bold">{c.nome}</p>
            {c.grupos.map((g, gi) => (
              <div key={gi}>
                {g.nome && <p className="font-bold">{g.nome}:</p>}
                {c.id === "f" && !g.nome
                  ? <p>{g.itens.map(([id, n]) => <span key={id} className="mr-1"><X on={d.crises?.[id]} /> {n}</span>)}</p>
                  : g.itens.map(([id, n]) => <p key={id}><X on={d.crises?.[id]} /> {n}</p>)}
              </div>
            ))}
            {c.id === "d" && (<><p className="font-bold mt-2">4. Outras:</p><p className="underline">{d.crisesOutras}</p></>)}
          </div>
        ))}
      </div>

      <div style={{ breakBefore: "page" }} />
      <CabecalhoSESAB variante="atual" />
      <p className="font-bold mt-1">3 - Tratamento Medicamentoso:</p>
      <p className="font-bold mt-2">3.1 Paciente realizou a PRIMEIRA monoterapia e houve intolerância ou falha ao fármaco?</p>
      <p><X on={t.mono1 === "sim"} /> Sim</p><p><X on={t.mono1 === "nao"} /> Não</p>
      <p className="font-bold mt-2">3.2 Paciente realizou a SEGUNDA monoterapia e houve intolerância ou falha ao fármaco?</p>
      <p><X on={t.mono2 === "sim"} /> Sim</p><p><X on={t.mono2 === "nao"} /> Não</p>
      <p className="font-bold mt-2">3.3 Paciente está em uso de associação medicamentosa?</p>
      <p><X on={t.assoc === "sim"} /> Sim</p><p><X on={t.assoc === "nao"} /> Não</p>
      <p className="font-bold mt-2">3.4 Quais fármacos antiepilépticos o(a) paciente está utilizando atualmente?</p>
      <Linhas texto={emUsoTxt} n={1} />
      <p className="font-bold mt-3 text-justify">3.5 Em caso de associações medicamentosas que fogem à forma geral informada no protocolo clínico, solicitamos a justificativa técnica do médico assistente:</p>
      <Linhas texto={t.justif} n={4} />
      <p className="font-bold mt-10 text-justify">
        Declaro, para os devidos fins, que o(a) paciente não apresenta critérios de exclusão, atende integralmente aos critérios de inclusão e
        não possui intolerância, hipersensibilidade ou contraindicação aos fármacos antiepilépticos em uso.
      </p>
      <div className="mt-24 w-72 mx-auto border-t border-black text-center font-bold pt-1">Assinatura e carimbo do médico</div>
    </div>
    </>
  );
}

/* ================= RELATÓRIO MÉDICO ================= */
export function Relatorio({ pac, d, up, der, med }) {
  const texto = textoRelatorio(pac, d, der, med);
  const usado = () => up("rel.usadoEm", new Date().toISOString());
  return (
    <>
    <div className="space-y-4 print:hidden">
      <Aviso tom="slate">O relatório substitui o formulário de acesso. Reúne CID-10, história clínica detalhada, descrição das crises (ILAE), tratamento e ausência de critério de exclusão — puxados das outras abas.</Aviso>
      <Faltando itens={der.faltaRel.filter((f) => !f.startsWith("copiar"))} ok="Relatório com todos os elementos exigidos." />
      <Txt area linhas={3} rot="Texto adicional (opcional, entra antes da assinatura)" valor={d.rel.extra} onChange={(x) => up("rel.extra", x)} />
      <TextoPronto texto={texto} linhas={22} onUsado={usado} />
      <Imprimir label="Imprimir relatório" onClick={usado} />
      {d.rel.usadoEm && <p className="text-[11px] text-slate-400 text-center">Usado em {new Date(d.rel.usadoEm).toLocaleString("pt-BR")}.</p>}
    </div>
    <div className="hidden print:block text-black text-[12px]">
      {(med.estabelecimento || med.endereco) && (
        <div className="text-center border-b border-black pb-2 mb-4">
          <div className="font-bold text-[13px]">{med.estabelecimento}</div>
          {med.endereco && <div className="text-[10px]">{med.endereco}</div>}
        </div>
      )}
      <pre className="whitespace-pre-wrap font-sans leading-relaxed">{texto}</pre>
      <div className="mt-16 w-80 mx-auto border-t border-black text-center text-[10px] pt-1">Carimbo e assinatura do médico</div>
    </div>
    </>
  );
}

