import { Txt, Escolha, Cartao, Aviso, TextoPronto, Imprimir, Faltando, CabecalhoSESAB, Lacuna, X, fmt } from "../comum.jsx";
import { LME as LMEBase } from "../lmeTela.jsx";
import { apresentacoes, obrigatorios, suporte, alerta, exclusao, inclusaoDDP, ciRasagilina, PORTARIA } from "./dados.js";
import { anamneseLME, textoRelatorio, cidDesc } from "./textos.js";
import { CartaoDiagnostico, CartaoDDP, CartaoTerapeutica } from "./telas.jsx";

/* ================= LME ================= */
export function dadosLME(pac, d, der, med) {
  const anamnese = d.lme.anamneseEditada ? d.lme.anamnese : anamneseLME(pac, d, der);
  return {
    cnes: med.cnes, estabelecimento: med.estabelecimento,
    nome: pac.nome, mae: pac.mae, peso: pac.peso, altura: pac.altura,
    meds: der.itens.map((i) => ({ lme: apresentacoes[i.ap].lme, meses: i.meses })), cid: "G20", diagnostico: cidDesc("G20"), anamnese,
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
const TERMO_MEDS = [["ama", "Amantadina"], ["pram", "Pramipexol"], ["clz", "Clozapina"], ["ras", "Rasagilina"], ["ent", "Entacapona"], ["riv", "Rivastigmina"]];
const P = ({ children }) => <p className="mt-1">▪ {children}</p>;

export function Termo({ pac, d, up, der, med }) {
  const local = d.termo.local || med.cidade || "";
  const [ano, mes, dia] = (d.termo.data || "").split("-");
  const tem = (f) => der.fams.includes(f);
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
            <span className="block text-[11px] text-slate-500 mb-1">Medicamentos — da prescrição</span>
            <div className="flex flex-wrap gap-1.5 text-sm">
              {TERMO_MEDS.map(([f, n]) => <span key={f} className={"px-2.5 py-1 rounded-lg border " + (tem(f) ? "bg-teal-50 border-teal-300 text-teal-800 font-semibold" : "border-slate-200 text-slate-400")}>{n}</span>)}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Txt rot="Local" ph={med.cidade || "cidade"} valor={d.termo.local} onChange={(x) => up("termo.local", x)} />
            <Txt rot="Data do atendimento" tipo="date" valor={d.termo.data} onChange={(x) => up("termo.data", x)} />
          </div>
        </div>
      </Cartao>
      <Imprimir label="Gerar PDF / imprimir termo" />
    </div>

    <div className="hidden print:block text-black text-[10px] leading-[1.3]">
      <CabecalhoSESAB />
      <div className="text-center font-bold text-[12px]">TERMO DE ESCLARECIMENTO E RESPONSABILIDADE - Doença de Parkinson</div>
      <div className="text-center font-bold text-[10.5px] mb-1.5">Amantadina, Clozapina, Entacapona, Pramipexol, Rasagilina, e Rivastigmina</div>
      <div className="text-justify">
        <p>
          Eu, <Lacuna v={pac.nome} w="260px" /> (nome do (a) paciente), declaro ter sido informado (a) claramente sobre os benefícios, riscos,
          contraindicações e principais eventos adversos relacionados ao uso de amantadina, clozapina, entacapona, pramipexol, rasagilina, e
          rivastigmina, indicados para o tratamento da doença de Parkinson. Os termos médicos foram explicados e todas as dúvidas foram
          esclarecidas pelo(a) médico(a) <Lacuna v={med.nome} w="220px" /> (nome do(a) médico(a) que prescreve).
        </p>
        <p className="mt-1">Fui também claramente informado (a) a respeito das seguintes contraindicações e potenciais eventos adversos:</p>
        <P>Amantadina: é contraindicada em casos de história de epilepsia, úlcera gástrica e úlcera duodenal. Os eventos adversos mais
          comuns incluem náusea, tontura e instabilidade, distúrbios do início e da manutenção do sono (insônias), episódios depressivos,
          irritabilidade e mau humor, alucinações, confusão, anorexia, boca seca, constipação, ataxia não especificada, edema (de membros
          inferiores), livedo reticularis (afecções da pele e do tecido celular subcutâneo, não especificado), hipotensão ortostática, cefaleia,
          sonolência, nervosismo, pesadelos, agitação e inquietação, diarreia (alteração do hábito intestinal) e fadiga;</P>
        <P>Clozapina: é contraindicada em pacientes incapazes de sofrerem hemogramas regulares, pacientes com antecedentes de
          granulocitopenia/agranulocitose tóxica ou idiossincrática (com exceção de granulocitopenia/agranulocitose causadas por quimioterapia
          prévia), transtornos hematopoiéticos, epilepsia não controlada, psicoses alcoólicas e tóxicas, intoxicação por drogas, afecções
          comatosas, colapso circulatório e/ou depressão do SNC de qualquer origem, transtornos renais ou cardíacos graves, hepatopatia ativa
          associada à náusea, anorexia ou icterícia, hepatopatia progressiva, insuficiência hepática, íleo paralítico, transtornos renais,
          hepatopatia ativa associada à náusea, anorexia ou icterícia, hepatopatia progressiva, insuficiência hepática. Os eventos adversos mais
          comuns incluem leucopenia/redução de glóbulos brancos/neutropenia, eosinofilia, leucocitose, ganho de peso, disartria,
          sonolência/sedação, vertigem, convulsões/abalos mioclônicos, sintomas extrapiramidais, acatisia, tremor, rigidez, dor de cabeça, visão
          borrada, taquicardia, alterações no eletrocardiograma, síncope, hipotensão postural, hipertensão, constipação, hipersalivação, náusea,
          vômito, boca seca, enzimas hepáticas elevadas, retenção urinária, incontinência urinária, hipertermia benigna, distúrbios na
          sudorese/regulação de temperatura, fadiga;</P>
        <P>Entacapona: é contraindicada em casos de disfunção hepática, pacientes com feocromocitoma por causa do risco aumentado de
          crise hipertensiva, história prévia de síndrome neuroléptica maligna e/ou rabdomiólise não traumática, uso concomitante de
          entacapona com os inibidores não-seletivos da monoaminoxidase, uso concomitante de um inibidor seletivo de MAO-A com um inibidor
          seletivo de MAO-B e entacapona. Os eventos adversos mais comuns incluem discinesia, náusea, urina anormal, diarreia, agravamento
          do parkinsonismo, tontura, dor abdominal, insônia, boca seca, fadiga, alucinações, constipação, distonia, aumento da transpiração,
          hipercinesia, cefaleia, câimbras nas pernas, confusão, pesadelos, queda, hipotensão postural, vertigem e tremor;</P>
        <P>Pramipexol: os eventos adversos mais comuns incluem tontura, discinesia, sonolência, náusea, comportamentos anormais
          (refletindo sintomas de transtornos do controle dos impulsos e comportamento compulsivo), sonhos anormais, confusão, alucinações,
          insônia, cefaleia, distúrbios visuais incluindo diplopia, visão embaçada e acuidade visual reduzida, hipotensão, constipação, vômito,
          fadiga, edema periférico e perda de peso incluindo perda de apetite;</P>
        <P>Rasagilina: é contraindicada no uso simultâneo com outros inibidores da MAO, analgésicos narcóticos, ciclobenzaprina, Hypericum
          perforatum; para pacientes com insuficiência hepática grave e feocromocitoma. Os eventos adversos mais comuns incluem cefaleia,
          depressão, vertigem e síndrome gripal (influenza e rinite), quando administrado em monoterapia; discinesia, hipotensão ortostática,
          queda, dor abdominal, náusea e vômito e boca seca, quando administrado em terapia adjunta com levodopa; dor musculoesquelética
          como dor nas costas e nuca, e artralgia em ambos os regimes;</P>
        <P>Rivastigimina: O uso de rivastigmina é contraindicado em pacientes com: conhecida hipersensibilidade à rivastigmina, a outros
          derivados do carbamato ou aos excipientes da fórmula; ou histórico prévio de reações no local de aplicação sugestivas de dermatite
          alérgica de contato com rivastigmina sistema transdérmico. Os eventos adversos relatados mais comumente são gastrintestinais,
          incluindo náusea (38%) e vômitos (23%). Fui informado que todos os medicamentos são contraindicados em caso de
          hipersensibilidade (alergia) aos fármacos ou aos componentes da fórmula e que o risco da ocorrência de eventos adversos aumenta
          com a superdosagem. Estou ciente de que este (s) medicamento (s) somente pode (m) ser utilizado por mim, comprometendo-me a
          devolvê-lo caso não queira ou não possa utilizá-lo ou se o tratamento for interrompido. Sei também que continuarei a ser atendido (a),
          inclusive em caso de desistir de usar o (s) medicamento (s). Autorizo o Ministério da Saúde e as Secretarias de Saúde a fazerem uso
          de informações relativas ao meu tratamento, desde que assegurado o anonimato. <X on={d.termo.autoriza === "sim"} /> Sim <X on={d.termo.autoriza === "nao"} /> Não</P>
        <p className="mt-1">Meu tratamento constará de um ou mais dos seguintes medicamentos:</p>
        <p className="mt-1">{TERMO_MEDS.map(([f, n]) => <span key={f} className="mr-2"><X on={tem(f)} /> {n}</span>)}</p>
      </div>
      <table className="w-full border-collapse border border-black mt-3 text-[10.5px]">
        <tbody>
          <tr><td className="border-x border-black px-2 pt-2 pb-1" colSpan={3}>
            <div className="flex justify-between gap-4"><span>Local: <b>{local}</b></span><span>Data do atendimento: <b>{dia || "   "} / {mes || "   "} / {ano || "     "}</b></span></div></td></tr>
          <tr><td className="border-x border-black px-2 py-1" colSpan={3}>
            <div className="flex justify-between gap-4"><span>Nome do paciente: <b>{pac.nome}</b></span><span>Nº do Cartão SUS: <b>{pac.cns}</b></span></div></td></tr>
          <tr><td className="border-x border-b border-black px-2 py-1" colSpan={3}>
            <div className="flex justify-between gap-4"><span>Nome do responsável legal: <b>{pac.incapaz || pac.responsavel ? pac.responsavel : ""}</b></span><span>Doc. Ident. <b>{pac.incapaz || pac.responsavel ? pac.respDoc : ""}</b></span></div></td></tr>
          <tr><td className="border border-black px-2 pt-8 pb-1 text-center" colSpan={3}>
            <div className="w-96 mx-auto border-t border-black pt-0.5">Assinatura do paciente ou do responsável legal</div></td></tr>
          <tr><td className="border border-black px-2 pt-8 pb-1">Assinatura e carimbo do Médico Responsável: <span className="inline-block w-56 border-b border-black" /></td>
            <td className="border border-black px-2 pt-8 pb-1 w-24">CRM: <b>{med.crm}</b></td>
            <td className="border border-black px-2 pt-8 pb-1 w-16">UF: <b>{med.uf}</b></td></tr>
        </tbody>
      </table>
      <p className="text-[8.5px] font-bold">
        OBSERVAÇÃO: Este Termo é obrigatório para solicitação de medicamento do Componente Especializado da Assistência Farmacêutica (CEAF) e
        deverá ser preenchido em duas vias: uma será arquivada na farmácia, e a outra, entregue ao usuário ou ao seu responsável legal.
      </p>
    </div>
    </>
  );
}

/* ================= FORMULÁRIO DE ACESSO (modelo 2026) ================= */
const C = ({ on }) => <span className="font-mono">[{on ? "X" : " "}]</span>;

export function Acesso(props) {
  const { pac, d, up, der, med } = props;
  const f = d.form, h = d.hist;
  const [ano, mes, dia] = (f.data || "").split("-");
  const linhas = Math.max(suporte.length, alerta.length, exclusao.length);
  const dataL = (iso) => (iso ? fmt(iso) : "___/______/______");
  return (
    <>
    <div className="space-y-4 print:hidden">
      <Faltando itens={der.faltaAcesso} ok="Formulário completo — gere o PDF para imprimir e assinar." />
      {der.contraind && <Aviso tom="rose">Há contraindicação marcada — revise antes de solicitar.</Aviso>}
      <Aviso tom="slate">Os blocos abaixo são os mesmos de Paciente e história — o que você marcar aqui aparece lá também. A data de nascimento vem da identificação do paciente.</Aviso>
      <CartaoDiagnostico {...props} />
      <CartaoDDP {...props} />
      <CartaoTerapeutica {...props} />
      <Txt className="max-w-[12rem]" rot="Data de preenchimento" tipo="date" valor={f.data} onChange={(x) => up("form.data", x)} />
      <Imprimir label="Gerar PDF / imprimir formulário" />
    </div>

    <div className="hidden print:block text-black text-[10.5px] leading-[1.3]">
      <CabecalhoSESAB />
      <div className="text-center font-bold text-[12px] mb-2">FORMULÁRIO DE ACESSO A MEDICAMENTOS PARA TRATAMENTO DA DOENÇA DE PARKINSON</div>
      <table className="w-full border border-black font-bold text-[11px] mb-2"><tbody>
        <tr><td className="px-2 pt-1">Nome do Paciente: <span className="font-normal">{pac.nome}</span></td><td className="px-2 pt-1 w-56">Data de Nascimento: <span className="font-normal">{fmt(pac.nascimento)}</span></td></tr>
        <tr><td className="px-2 pb-1">Médico Responsável: <span className="font-normal">{med.nome}</span></td><td className="px-2 pb-1">CRM: <span className="font-normal mr-6">{med.crm}</span> UF: <span className="font-normal">{med.uf}</span></td></tr>
      </tbody></table>
      <p className="text-center font-bold px-6">{PORTARIA}, que aprova o Protocolo Clínico e Diretrizes Terapêuticas (PCDT) da Doença de Parkinson (DP).</p>
      <p className="font-bold mt-2">I. CRITÉRIOS OBRIGATÓRIO PARA DIAGNÓSTICO DA DOENÇA DE PARKINSON.</p>
      <p>Assinale os critérios presentes no paciente:</p>
      <p className="mt-1">{obrigatorios.map(([id, n]) => <span key={id} className="mr-6"><C on={f.obrig?.[id]} /> {n}</span>)}</p>
      <p className="font-bold mt-2">II. CRITÉRIOS PARA O DIAGNÓSTICO DA DOENÇA DE PARKINSON <span className="text-[9px]">(PREENCHIMENTO OBRIGATÓRIO).</span></p>
      <p>Classifique o diagnóstico como <b>“DP provável” ou “DP Estabelecida”</b> e assinale os critérios de suporte, exclusão e sinais de alerta presentes, conforme avaliação clínica e critérios do PCDT.</p>
      <p className="font-bold mt-1">CLASSIFICAÇÃO: <C on={f.classif === "provavel"} /> DP PROVÁVEL <span className="ml-10" /><C on={f.classif === "estabelecida"} /> DP ESTABELECIDA</p>
      <table className="w-full border-collapse mt-1.5 text-[9.5px]">
        <thead><tr className="bg-neutral-100">
          <th className="border border-neutral-400 px-1.5 py-1">CRITÉRIOS DE SUPORTE</th>
          <th className="border border-neutral-400 px-1.5 py-1">SINAIS DE ALERTA<br />(RED FLAG)</th>
          <th className="border border-neutral-400 px-1.5 py-1">CRITÉRIOS DE EXCLUSÃO</th>
        </tr></thead>
        <tbody>
          {Array.from({ length: linhas }).map((_, i) => (
            <tr key={i}>
              {[[suporte, f.suporte], [alerta, f.alerta], [exclusao, f.exclusao]].map(([lista, val], j) => (
                <td key={j} className="border border-neutral-400 px-1.5 py-0.5 align-middle w-1/3">{lista[i] ? <><C on={val?.[i]} /> {lista[i]}</> : ""}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ breakBefore: "page" }} />
      <CabecalhoSESAB />
      <p className="font-bold">III. CRITÉRIOS PARA DEMÊNCIA NA DOENÇA DE PARKINSON (DDP)</p>
      <p>Paciente possui demência na doença de Parkinson? <C on={f.ddp === "sim"} /> SIM <C on={f.ddp === "nao"} /> NÃO</p>
      <table className="w-full border-collapse mt-1.5"><tbody>
        <tr className="bg-neutral-100 font-bold"><td className="border border-neutral-400 px-2 py-1 w-2/5">DADOS CLÍNICOS</td><td className="border border-neutral-400 px-2 py-1">CRITÉRIOS DE INCLUSÃO (OBRIGATÓRIO)</td></tr>
        <tr><td className="border border-neutral-400 px-2 py-1 align-top leading-7">
          INÍCIO DA DP: {f.ddp === "sim" ? dataL(h.inicioDP) : "___/______/______"}<br />INÍCIO DA DDP: {f.ddp === "sim" ? dataL(h.inicioDDP) : "___/______/______"}</td>
          <td className="border border-neutral-400 px-2 py-1 leading-6">{inclusaoDDP.map((t, i) => <div key={i}><C on={f.ddp === "sim" && f.inclDDP[i]} /> {t}</div>)}</td></tr>
      </tbody></table>
      <p className="font-bold mt-3">IV. ANTECEDENTES TERAPÊUTICOS</p>
      <p>• Paciente já fez uso de medicamento para doença de Parkinson? <C on={h.tratPrevio === true} /> Sim <C on={h.tratPrevio === false} /> Não</p>
      <p>• Quais? <span className="inline-block min-w-[440px] border-b border-black">{h.tratPrevio ? h.tratTexto : ""}</span></p>
      <p className="font-bold mt-3">V. PARA RASAGILINA</p>
      <p className="font-bold">Marque as contraindicações aplicáveis ao paciente:</p>
      {ciRasagilina.map((t, i) => <p key={i}><C on={f.ciRas?.[i]} /> {t}</p>)}
      <p className="font-bold mt-3">VI. PARA ENTACAPONA</p>
      <p>• Paciente faz uso concomitantemente de levodopa? <C on={h.levodopa === true} /> Sim <C on={h.levodopa === false} /> Não.</p>
      <p className="mt-5 text-[12px]">Declaro que o (a) paciente não apresenta contraindicação para o uso do medicamento prescrito.</p>
      <div className="mt-10 flex justify-between items-end">
        <p className="font-bold">Data de preenchimento: {dia || "____"} / {mes || "____"} / {ano || "_______"}</p>
        <div className="w-72 border-t border-black text-center font-bold pt-0.5">Assinatura e carimbo do médico</div>
      </div>
      <p className="mt-6 text-center px-8">
        Observação: O preenchimento deste formulário poderá ser substituído por relatório médico constando as informações de critérios de
        inclusão exigidos pela PORTARIA CONJUNTA SAES/SECTICS Nº 16, DE 1 DE AGOSTO DE 2025.
      </p>
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
      <Aviso tom="slate">O relatório substitui o formulário de acesso. Reúne CID-10, data de início, ausência de depressão maior, delírio e outras causas de perda cognitiva, tratamento, critérios de inclusão e ausência de exclusão e contraindicação — puxados das outras abas.</Aviso>
      <Faltando itens={der.faltaRel.filter((x) => !x.startsWith("copiar"))} ok="Relatório com todos os elementos exigidos." />
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
