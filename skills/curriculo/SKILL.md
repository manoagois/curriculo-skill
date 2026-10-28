---
name: curriculo
description: Monta, revisa e atualiza currículo em DOCX + PDF (A4, uma coluna, legível por ATS, foto opcional) a partir de texto, PDF, DOCX ou Lattes, e roda uma banca de leitores que tenta reprovar o currículo. Use quando o pedido envolver currículo, CV ou resume — criar, melhorar, adaptar a uma vaga, avaliar ("passa na triagem?", "banca") ou registrar a versão que a pessoa editou.
---

# Currículo

O currículo é da pessoa, não do agente. Cada linha precisa ser algo que ela sustenta numa entrevista: **fidelidade** vem antes de impacto.

## 1. Fontes e vaga

Leia todas as fontes enviadas (texto, PDF, DOCX, Lattes, certificados). A versão mais recente é a base; versões antigas só completam fatos que faltam, preservando a redação da pessoa. Se a pessoa já editou o arquivo (no Pages ou no Word), a edição dela é a base.

Sem vaga nem cargo-alvo, faça uma pergunta antes de seguir: para qual vaga ou cargo é o currículo?

Pronto quando cada fato que vai entrar no currículo tem uma fonte: um documento, ou uma resposta da pessoa.

## 2. Lacunas

Liste o que falta (datas, carga horária, atribuições do cargo atual, escopo) e pergunte tudo numa mensagem só. Lacuna sem resposta fica fora do arquivo final e vai para a lista de pendências; o arquivo nunca leva "[preencher]".

## 3. Banca

Rode a banca quando a pessoa pedir avaliação, quando o currículo for para uma vaga nova ou quando a versão for a primeira. Ajuste pontual dispensa. Procedimento em [banca.md](banca.md).

## 4. Texto

- **Atribuição real.** Escreva o que o cargo faz, no verbo que a pessoa usa. Escopo ("única", "todas as contas", "100%") e volume só com confirmação explícita; sem número, descreva a tarefa sem quantificar. Tarefa de apoio não vira responsabilidade principal.
- Verbo do tamanho do papel: auditoria identifica inconsistência; quem corrige o registro é a equipe assistencial.
- Ferramenta sem certificado entra sem nível ("Pacote Office"), a menos que a pessoa declare o nível.
- Termos-chave da vaga entram onde a pessoa tem o fato correspondente.
- Cargos da mesma empresa ficam agrupados sob ela, com uma linha de contexto da trajetória (admissão e promoções).
- Resumo em duas a quatro frases: anos de experiência, onde, foco atual, especializações.
- Ordem: cabeçalho, resumo, experiência, formação, habilidades, cursos, idiomas, produção científica.

## 5. Arquivos

Trabalhe numa pasta no scratchpad:

1. `npm i docx@9.15.0` na pasta; copie [gerar.js](gerar.js).
2. Escreva `cv.json` no formato de [modelo.json](modelo.json) (experiência com `cargos` para quem teve promoções; `secoes` livres no fim).
3. Foto: extraia do Lattes ou do PDF com pypdf (`page.images`) num venv e recorte o busto com Pillow; salve como `foto.jpg` ao lado do JSON. Sem foto, omita o campo.
4. `node gerar.js cv.json cv.docx`.
5. PDF pelo Pages (não há LibreOffice na máquina). O Pages precisa estar aberto antes do AppleScript, senão dá erro -600:
   ```sh
   open -gja Pages   # espere o processo Pages aparecer (pgrep -x Pages)
   osascript -e 'tell application "Pages"
     set d to open POSIX file "/abs/cv.docx"
     export d to POSIX file "/abs/cv.pdf" as PDF
     close d saving no
   end tell'
   ```
6. Confira o visual: divida as páginas com pypdf e gere PNG com `sips -s format png pagina.pdf --out pagina.png`; leia os PNGs. Pronto quando nenhuma seção quebra sozinha no fim de página, a foto não cobre texto e o currículo cabe em duas páginas.
7. Grave `Curriculo - <Nome> - <Cargo>.docx` e `.pdf` na pasta das fontes. Se já existir arquivo com esse nome editado depois da última geração, use outro nome em vez de sobrescrever.

## 6. Entrega

Informe os caminhos, as pendências e as perguntas abertas. Peça que a pessoa confira as atribuições de cada cargo.

Quando a pessoa devolver uma versão editada, compare com a gerada linha a linha, trate a dela como vigente e registre o que mudou e o que isso ensina sobre a próxima escrita (atribuição cortada, verbo trocado, termo acrescentado).
