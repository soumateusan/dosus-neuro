/* cabeçalho oficial (brasão + SESAB) usado nos termos, formulário, MEEM e CDR impressos */
import brasao from "./assets/brasao-bahia.jpg";

export function CabecalhoSESAB() {
  return (
    <div className="border-y border-black py-2 mb-4 flex items-center gap-4">
      <img src={brasao} alt="" className="w-[64px] h-[66px] object-contain ml-8" />
      <div className="text-[10.5px] leading-[1.25]">
        <div className="font-bold text-[12px]">GOVERNO DO ESTADO DA BAHIA</div>
        <div>Secretaria da Saúde do Estado da Bahia - SESAB</div>
        <div>Superintendência de Assistência Farmacêutica, Ciência e Tecnologia em Saúde - SAFTEC</div>
        <div>Diretoria de Assistência Farmacêutica – DASF</div>
        <div>Coordenação de Assistência Farmacêutica na Atenção Especializada - COAFE</div>
      </div>
    </div>
  );
}
