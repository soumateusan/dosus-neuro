/* cabeçalho oficial (brasão + SESAB) usado nos termos, formulário, MEEM e CDR impressos */
import brasao from "./assets/brasao-bahia.jpg";

/* "atual" segue os modelos de 2026 (siglas entre parênteses), como nos documentos da epilepsia */
const LINHAS = {
  classico: [
    "Secretaria da Saúde do Estado da Bahia - SESAB",
    "Superintendência de Assistência Farmacêutica, Ciência e Tecnologia em Saúde - SAFTEC",
    "Diretoria de Assistência Farmacêutica – DASF",
    "Coordenação de Assistência Farmacêutica na Atenção Especializada - COAFE",
  ],
  atual: [
    "Secretaria da Saúde do Estado da Bahia (SESAB)",
    "Superintendência de Assistência Farmacêutica, Ciência e Tecnologias em Saúde (SAFTEC)",
    "Diretoria de Assistência Farmacêutica (DASF)",
    "Coordenação de Assistência Farmacêutica na Atenção Especializada (COAFE)",
  ],
};

export function CabecalhoSESAB({ variante = "classico" }) {
  return (
    <div className="border-y border-black py-2 mb-4 flex items-center gap-4">
      <img src={brasao} alt="" className="w-[64px] h-[66px] object-contain ml-8" />
      <div className="text-[10.5px] leading-[1.25]">
        <div className="font-bold text-[12px]">GOVERNO DO ESTADO DA BAHIA</div>
        {LINHAS[variante].map((l) => <div key={l}>{l}</div>)}
      </div>
    </div>
  );
}
