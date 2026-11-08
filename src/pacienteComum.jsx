/* Partes da tela do paciente que valem para todas as patologias */
import { Txt, Escolha, Marca, Cartao } from "./comum.jsx";

export const pacienteVazio = () => ({
  nome: "", nascimento: "", idade: "", sexo: "", mae: "", cpf: "", cns: "", peso: "", altura: "",
  tel1: "", tel2: "", email: "", raca: "", etnia: "", escolaridade: "", cidade: "",
  rg: "", prontuario: "", endereco: "", bairro: "", municipio: "", uf: "BA", cep: "", ibge: "",
  incapaz: false, responsavel: "", respDoc: "", respParentesco: "",
});

export function idadeDe(p) {
  if (p.nascimento) {
    const n = new Date(p.nascimento + "T00:00:00"), h = new Date();
    let i = h.getFullYear() - n.getFullYear();
    if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) i--;
    return i >= 0 && i < 130 ? String(i) : "";
  }
  return p.idade || "";
}

/* tipo de solicitação + CID-10 da patologia */
export function CartaoSolicitacao({ d, up, cids }) {
  return (
    <Cartao titulo="Solicitação">
        <div className="space-y-3">
          <div>
            <span className="block text-[11px] text-slate-500 mb-1">Tipo de solicitação</span>
            <Escolha valor={d.tipo} onChange={(x) => up("tipo", x || "inicio")} opcoes={[["inicio", "Início de tratamento"], ["continuidade", "Continuidade (renovação)"], ["troca", "Troca de medicamento / aumento de dose"]]} />
          </div>
          <div>
            <span className="block text-[11px] text-slate-500 mb-1">CID-10 <span className="text-rose-500">*</span></span>
            <div className="grid sm:grid-cols-2 gap-1.5">
              {cids.map((c) => (
                <Marca key={c.cod} checked={d.cid === c.cod} onToggle={() => up("cid", d.cid === c.cod ? "" : c.cod)}>
                  <b>{c.cod}</b> {c.desc}
                </Marca>
              ))}
            </div>
          </div>
        </div>
      </Cartao>
  );
}

/* identificação, documento/endereço e capacidade — salvos no paciente, usados em todos os documentos */
export function CartoesIdentificacao({ pac, upP, escolaridade }) {
  const idade = idadeDe(pac);
  return (
    <>
      <Cartao titulo="Identificação do paciente" sub="Fica salva no arquivo e preenche automaticamente todos os documentos.">
        <div className="grid gap-3 sm:grid-cols-6">
          <Txt className="sm:col-span-6" rot="Nome completo" obrig valor={pac.nome} onChange={(x) => upP("nome", x)} />
          <Txt className="sm:col-span-6" rot="Nome da mãe" obrig valor={pac.mae} onChange={(x) => upP("mae", x)} />
          <Txt className="sm:col-span-2" rot="Nascimento" tipo="date" valor={pac.nascimento} onChange={(x) => upP("nascimento", x)} dica={idade ? `${idade} anos` : ""} />
          {!pac.nascimento && <Txt className="sm:col-span-1" rot="Idade" tipo="number" valor={pac.idade} onChange={(x) => upP("idade", x)} />}
          <div className={pac.nascimento ? "sm:col-span-4" : "sm:col-span-3"}>
            <span className="block text-[11px] text-slate-500 mb-1">Sexo</span>
            <Escolha valor={pac.sexo} onChange={(x) => upP("sexo", x || "")} opcoes={[["F", "Feminino"], ["M", "Masculino"]]} />
          </div>
          <Txt className="sm:col-span-3" rot="CPF" valor={pac.cpf} onChange={(x) => upP("cpf", x)} />
          <Txt className="sm:col-span-3" rot="Cartão SUS (CNS)" valor={pac.cns} onChange={(x) => upP("cns", x)} />
          <Txt className="sm:col-span-2" rot="Peso (kg)" obrig tipo="number" valor={pac.peso} onChange={(x) => upP("peso", x)} />
          <Txt className="sm:col-span-2" rot="Altura (cm)" obrig tipo="number" valor={pac.altura} onChange={(x) => upP("altura", x)} />
          <Txt className="sm:col-span-2" rot="Escolaridade (anos de estudo)" obrig={!!escolaridade} tipo="number" min={0} valor={pac.escolaridade}
            onChange={escolaridade?.onChange || ((x) => upP("escolaridade", x))} dica={escolaridade?.dica || ""} />
          <Txt className="sm:col-span-3" rot="Telefone 1" valor={pac.tel1} onChange={(x) => upP("tel1", x)} />
          <Txt className="sm:col-span-3" rot="Telefone 2" valor={pac.tel2} onChange={(x) => upP("tel2", x)} />
          <Txt className="sm:col-span-6" rot="E-mail" tipo="email" valor={pac.email} onChange={(x) => upP("email", x)} />
          <div className="sm:col-span-6">
            <span className="block text-[11px] text-slate-500 mb-1">Raça/cor (autodeclarada)</span>
            <Escolha valor={pac.raca} onChange={(x) => upP("raca", x || "")} opcoes={[["branca", "Branca"], ["preta", "Preta"], ["parda", "Parda"], ["amarela", "Amarela"], ["indigena", "Indígena"]]} />
          </div>
          {pac.raca === "indigena" && <Txt className="sm:col-span-6" rot="Etnia" valor={pac.etnia} onChange={(x) => upP("etnia", x)} />}
        </div>
      </Cartao>

      <Cartao titulo="Documento e endereço" sub="Usados no pedido de exames (chequinho) e no laudo APAC.">
        <div className="grid gap-3 sm:grid-cols-6">
          <Txt className="sm:col-span-3" rot="RG (doc. de identidade)" valor={pac.rg} onChange={(x) => upP("rg", x)} />
          <Txt className="sm:col-span-3" rot="Nº do prontuário" valor={pac.prontuario} onChange={(x) => upP("prontuario", x)} />
          <Txt className="sm:col-span-4" rot="Endereço (rua, nº)" valor={pac.endereco} onChange={(x) => upP("endereco", x)} />
          <Txt className="sm:col-span-2" rot="Bairro" valor={pac.bairro} onChange={(x) => upP("bairro", x)} />
          <Txt className="sm:col-span-3" rot="Município" valor={pac.municipio} onChange={(x) => upP("municipio", x)} />
          <Txt className="sm:col-span-1" rot="UF" valor={pac.uf} onChange={(x) => upP("uf", x.toUpperCase().slice(0, 2))} />
          <Txt className="sm:col-span-2" rot="CEP" valor={pac.cep} onChange={(x) => upP("cep", x)} />
          <Txt className="sm:col-span-2" rot="Cód. IBGE do município" valor={pac.ibge} onChange={(x) => upP("ibge", x)} dica="Salvador: 2927408" />
        </div>
      </Cartao>

      <Cartao titulo="Capacidade e responsável legal" sub="LME (campo 13) e Termo de Esclarecimento.">
        <div className="space-y-3">
          <div>
            <span className="block text-[11px] text-slate-500 mb-1">Paciente considerado incapaz (arts. 3º e 4º do Código Civil)?</span>
            <Escolha valor={pac.incapaz} onChange={(x) => upP("incapaz", !!x)} opcoes={[[false, "Não"], [true, "Sim"]]} />
          </div>
          <div className="grid gap-3 sm:grid-cols-6">
            <Txt className="sm:col-span-3" rot={`Responsável legal${pac.incapaz ? " *" : ""}`} valor={pac.responsavel} onChange={(x) => upP("responsavel", x)} />
            <Txt className="sm:col-span-2" rot="Doc. de identidade do responsável" valor={pac.respDoc} onChange={(x) => upP("respDoc", x)} />
            <Txt className="sm:col-span-1" rot="Parentesco" valor={pac.respParentesco} onChange={(x) => upP("respParentesco", x)} />
          </div>
        </div>
      </Cartao>
    </>
  );
}
