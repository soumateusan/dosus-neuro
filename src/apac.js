/* Laudo para Solicitação/Autorização de Procedimento Ambulatorial (APAC).
   O PDF modelo não tem campos editáveis: o texto é escrito nas posições medidas das caixas.
   Coordenadas em pontos, medidas do TOPO da página (convertidas no desenho). */
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const APAC_URL = "/docs/laudo-apac.pdf";

const limpa = (s) => String(s ?? "").replace(/[–—]/g, "-").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[^\n\x20-\x7E\xA0-\xFF]/g, "");
const digitos = (s) => String(s ?? "").replace(/\D/g, "");

/* linhas das caixas de procedimento secundário (topo, base) */
const SEC = [[330.6, 351.6], [357.6, 377.6], [383.6, 404.6], [410.6, 430.6], [436.6, 457.6]];

export async function gerarAPAC(d) {
  const bytes = await fetch(APAC_URL).then((r) => {
    if (!r.ok) throw new Error("Não foi possível abrir o laudo APAC em branco.");
    return r.arrayBuffer();
  });
  const pdf = await PDFDocument.load(bytes);
  const pg = pdf.getPage(0);
  const H = pg.getHeight();
  const f = await pdf.embedFont(StandardFonts.Helvetica);
  const fb = await pdf.embedFont(StandardFonts.HelveticaBold);

  /* texto numa linha; reduz a fonte até caber na largura */
  const txt = (s, x, base, { tam = 9, larg = 400, font = f } = {}) => {
    s = limpa(s);
    if (!s) return;
    let t = tam;
    while (t > 5.5 && font.widthOfTextAtSize(s, t) > larg) t -= 0.25;
    while (s && font.widthOfTextAtSize(s, t) > larg) s = s.slice(0, -1);
    pg.drawText(s, { x, y: H - base, size: t, font });
  };
  const centro = (s, cx, base, tam = 9, font = f) => {
    s = limpa(s);
    if (!s) return;
    pg.drawText(s, { x: cx - font.widthOfTextAtSize(s, tam) / 2, y: H - base, size: tam, font });
  };
  /* um caractere por caixa */
  const caixas = (s, x0, passo, base, n, tam = 9.5) => {
    const c = String(s ?? "").slice(0, n).split("");
    c.forEach((ch, i) => centro(ch, x0 + passo * i + passo / 2, base, tam));
  };
  /* bloco de várias linhas com quebra automática */
  const paragrafo = (s, x, topo, larg, alturaMax, tam = 8) => {
    const linhas = [];
    for (const par of limpa(s).split("\n")) {
      let atual = "";
      for (const p of par.split(/\s+/)) {
        const tenta = atual ? `${atual} ${p}` : p;
        if (f.widthOfTextAtSize(tenta, tam) > larg && atual) { linhas.push(atual); atual = p; } else atual = tenta;
      }
      linhas.push(atual);
    }
    const lh = tam * 1.2;
    const cabe = Math.floor(alturaMax / lh);
    if (linhas.length > cabe && tam > 6) return paragrafo(s, x, topo, larg, alturaMax, tam - 0.5);
    linhas.slice(0, cabe).forEach((l, i) => pg.drawText(l, { x, y: H - (topo + tam + i * lh), size: tam, font: f }));
  };
  const branco = (x, topo, larg, alt) => pg.drawRectangle({ x, y: H - topo - alt, width: larg, height: alt, color: rgb(1, 1, 1) });
  const data = (iso, centros, base) => {
    if (!iso) return;
    const [a, m, dd] = iso.split("-");
    centro(dd, centros[0], base); centro(m, centros[1], base); centro(a, centros[2], base);
  };
  /* DDD em 2 caixas; número em 8 caixas (celular com 9 dígitos: apaga as divisórias e escreve corrido) */
  const telefone = (tel, topo, base) => {
    let n = digitos(tel);
    if (n.startsWith("55") && n.length > 11) n = n.slice(2);
    if (!n) return;
    const num = n.length >= 10 ? n.slice(2) : n;
    if (n.length >= 10) caixas(n.slice(0, 2), 404.4, 15.7, base, 2);
    if (num.length <= 8) caixas(num, 436, 15.78, base, 8);
    else {
      branco(437, topo + 7.6, 124, 9.6);
      centro(`${num.slice(0, num.length - 4)}-${num.slice(-4)}`, 499, base, 10);
    }
  };

  /* restos impressos no modelo (TESTE / IOIOIOI) */
  branco(34, 91, 416, 15);
  branco(456, 91, 105, 15);

  /* estabelecimento solicitante */
  txt(d.estabelecimento, 35, 103, { larg: 415 });
  txt(d.cnes, 459, 103, { larg: 100 });

  /* paciente */
  txt(d.nome, 35, 143, { larg: 362 });
  if (d.sexo === "M") centro("X", 426.7, 140.5, 9, fb);
  if (d.sexo === "F") centro("X", 460.5, 140.5, 9, fb);
  txt(d.prontuario, 480, 143, { larg: 80 });
  caixas(digitos(d.cns), 32.5, 17.67, 166, 15);
  data(d.nascimento, [318, 342, 372], 166);
  txt(d.raca, 404, 166, { tam: 8, larg: 57 });
  txt(d.etnia, 471, 166, { tam: 8, larg: 88 });
  txt(d.mae, 35, 191, { larg: 362 });
  telefone(d.tel1, 176.5, 192);
  txt(d.responsavel, 35, 215, { larg: 362 });
  telefone(d.tel2, 200.5, 216);
  txt(d.endereco, 35, 236, { larg: 525 });
  txt(d.municipio, 35, 261, { larg: 316 });
  txt(digitos(d.ibge), 358, 261, { larg: 76 });
  caixas(String(d.uf || "").toUpperCase(), 436.6, 16.6, 261, 2);
  caixas(digitos(d.cep), 469.8, 11.5, 261, 8, 8.5);

  /* procedimentos: o primeiro é o principal, até 5 secundários */
  const [princ, ...secs] = d.procedimentos || [];
  if (princ) {
    caixas(digitos(princ.cod), 32.5, 18, 303, 10);
    txt(princ.nome, 218, 302, { tam: 8, larg: 274 });
    centro(String(princ.qtd || 1), 527, 302);
  }
  secs.slice(0, 5).forEach((p, i) => {
    const base = SEC[i][1] - 5;
    caixas(digitos(p.cod), 32.5, 18, base, 10);
    txt(p.nome, 218, base, { tam: 8, larg: 292 });
    centro(String(p.qtd || 1), 537, base);
  });

  /* justificativa */
  txt(d.diagnostico, 35, 500, { tam: 8, larg: 298 });
  centro(d.cid, 367, 500);
  centro(d.cid2, 432, 500);
  paragrafo(d.observacoes, 35, 524, 524, 70);

  /* solicitação */
  txt(d.medico, 35, 638, { larg: 262 });
  data(d.data, [311, 333, 361], 638);
  caixas(digitos(d.cnsMedico), 145.6, 15.73, 662, 15);

  return pdf.save();
}
