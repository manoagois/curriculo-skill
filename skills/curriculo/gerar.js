// Gera o currículo em DOCX a partir de um JSON (formato em modelo.json).
// Uso: node gerar.js cv.json saida.docx   (precisa de docx@9.15.0 instalado na pasta de trabalho)
const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, LevelFormat, BorderStyle,
  TabStopType, HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom, TextWrappingType,
  TextWrappingSide, ExternalHyperlink } = require(require.resolve('docx', { paths: [process.cwd()] }));

const [, , entrada, saida] = process.argv;
if (!entrada || !saida) { console.error('uso: node gerar.js cv.json saida.docx'); process.exit(1); }
const cv = JSON.parse(fs.readFileSync(entrada, 'utf8'));

const ACC = cv.cor || '1F4E5F', GRAY = '555555', FONT = 'Calibri';
const W = 11906 - 2 * 1000; // largura A4 menos margens (DXA)

const r = (text, o = {}) => new TextRun({ text, font: FONT, size: 20, ...o });
const p = (children, o = {}) => new Paragraph({ children, spacing: { after: 40, line: 264 }, ...o });
const section = (title) => new Paragraph({
  children: [r(title.toUpperCase(), { bold: true, size: 21, color: ACC, characterSpacing: 30 })],
  spacing: { before: 200, after: 80 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACC, space: 2 } },
  keepNext: true,
});
// Título à esquerda e data à direita na mesma linha
const row = (left, right = '', o = {}) => new Paragraph({
  children: [r(left, { bold: true, size: 21, ...o }), r('\t' + right, { color: GRAY })],
  tabStops: [{ type: TabStopType.RIGHT, position: W }],
  spacing: { before: 100, after: 20 }, keepNext: true,
});
const sub = (text) => p([r(text, { italics: true, color: GRAY })], { keepNext: true });
// Item com rótulo opcional em negrito: "Rótulo: texto"
const runs = (it) => typeof it === 'string' ? [r(it)] : [r(it.rotulo + ': ', { bold: true }), r(it.texto)];
const bullet = (it) => new Paragraph({ children: runs(it), numbering: { reference: 'b', level: 0 }, spacing: { after: 30, line: 264 } });
const texto = (t) => p([r(t)], { alignment: AlignmentType.JUSTIFIED });
const detalhe = (d) => d && p(runs(d));
// typeof antes de c.link: String.prototype.link existe e quebraria o teste
const contato = (c) => typeof c === 'string' ? r(c, { color: GRAY, size: 19 })
  : c.link ? new ExternalHyperlink({ link: c.link, children: [r(c.texto, { color: GRAY, size: 19 })] })
  : r(c.texto, { color: GRAY, size: 19 });
const linhaContato = (itens, last) => p(itens.flatMap((c, i) => i ? [r('  ·  ', { color: GRAY, size: 19 }), contato(c)] : [contato(c)]),
  last ? { spacing: { after: 160 } } : {});

const cabecalho = [];
if (cv.foto) {
  cabecalho.push(new ImageRun({
    type: path.extname(cv.foto).slice(1).replace('jpeg', 'jpg'),
    data: fs.readFileSync(path.resolve(path.dirname(entrada), cv.foto)),
    transformation: { width: 86, height: 100 },
    floating: {
      horizontalPosition: { relative: HorizontalPositionRelativeFrom.MARGIN, align: 'right' },
      verticalPosition: { relative: VerticalPositionRelativeFrom.MARGIN, align: 'top' },
      wrap: { type: TextWrappingType.SQUARE, side: TextWrappingSide.LEFT },
      margins: { left: 114300 },
    },
    altText: { title: 'Foto', description: 'Foto de ' + cv.nome, name: 'foto' },
  }));
}
cabecalho.push(r(cv.nome.toUpperCase(), { bold: true, size: 32, color: ACC }));

const children = [
  new Paragraph({ children: cabecalho, spacing: { after: 40 } }),
  p([r(cv.titulo, { size: 23, color: '222222' })], { spacing: { after: 100 } }),
  ...cv.contato.map((linha, i) => linhaContato(linha, i === cv.contato.length - 1)),
];

if (cv.resumo) children.push(section('Resumo'), texto(cv.resumo));

if (cv.experiencia?.length) {
  children.push(section('Experiência Profissional'));
  for (const e of cv.experiencia) {
    // Empresa com vários cargos: empresa em destaque e cargos abaixo; cargo único: só o cargo
    if (e.cargos) {
      children.push(row(e.empresa, e.periodo, { size: 22, color: ACC }));
      if (e.nota) children.push(sub(e.nota));
      for (const c of e.cargos) children.push(row(c.titulo, c.periodo), ...c.bullets.map(bullet));
    } else {
      children.push(row(e.titulo, e.periodo, { size: 22, color: ACC }));
      if (e.nota) children.push(sub(e.nota));
      children.push(...(e.bullets || []).map(bullet));
    }
  }
}

if (cv.formacao?.length) {
  children.push(section('Formação Acadêmica'));
  for (const f of cv.formacao) {
    children.push(row(f.titulo, f.periodo));
    if (f.instituicao) children.push(sub(f.instituicao));
    if (f.detalhe) children.push(detalhe(f.detalhe));
  }
}

for (const s of cv.secoes || []) {
  children.push(section(s.titulo));
  if (s.texto) children.push(texto(s.texto));
  children.push(...(s.itens || []).map(bullet));
}

const doc = new Document({
  creator: cv.nome,
  title: cv.arquivo || 'Currículo - ' + cv.nome,
  styles: { default: { document: { run: { font: FONT, size: 20 } } } },
  numbering: { config: [{ reference: 'b', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•',
    alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 300, hanging: 220 } } } }] }] },
  sections: [{ properties: { page: { size: { width: 11906, height: 16838 },
    margin: { top: 850, bottom: 850, left: 1000, right: 1000 } } }, children }],
});

Packer.toBuffer(doc).then((b) => fs.writeFileSync(saida, b));
