# Design — Cartões de Gratidão

## Conceito

Uma **coleção de cartões**, não um site de formatura. Cada homenageado recebe uma peça com capa e páginas internas, como uma carta impressa que foi digitalizada com cuidado. O cartão é o objeto principal; o site é apenas a mesa onde ele é aberto.

O elemento memorável é o **carimbo de cera dourado** no meio da borda de cima do envelope. Ele é o único objeto fotorrealista e o único dourado do projeto. O **selo tipográfico** com iniciais e ano continua como marca no envelope, no header e no favicon. O fecho da carta usa o **símbolo da Turma Ginga** em monocromático. A capa da home usa o mesmo símbolo, em verde, e o rodapé da home repete as três marcas do envelope, em monocromático. Os três selos postais ficam só no envelope.

**Nome:** Cartões de Gratidão.
**Público:** homenageados da Alpha EdTech e a Turma Ginga.
**Trabalho principal:** fazer cada homenageado reconhecer, em poucos segundos, que aquela carta foi feita para ele(a) — e então ler com calma.

## Direção visual

- Editorial, tátil e contido.
- Pedra, papel e um envelope verde profundo; tinta escura; um único acento por homenageado.
- Nada de confete, glitter, fitas, polaroides, scrapbook, música automática ou clichês de formatura. O único dourado é o carimbo de cera.
- O envelope tem identidade; as páginas de texto têm apenas o texto.
- O carimbo é a única exceção fotorrealista e o elemento memorável. Selo postal é permitido apenas nos três selos do envelope: papel creme perfurado, campo de cor vintage e a marca em creme, sem texto postal. Carimbo de correio, fita, kraft e papel rasgado continuam proibidos.

### Revisão contra os padrões genéricos

A direção original do plano já pedia pedra + papel + Fraunces + selo. O risco seria cair no “cartão SaaS” ou no “scrapbook de formatura”. As decisões para evitar isso:

- **Sem cards repetidos com sombra genérica.** Existe um único objeto: a folha. O chrome (toolbar, tema e contador) fica fora dela; apenas o par de setas entra na folha.
- **Sem papel creme + serifa de banco + terracota como fórmula.** O fundo é pedra fria (`#E9E4DA`), a tinta é verde-azulada (`#1B2A2E`), o envelope é verde profundo e o carimbo é dourado. O selo tipográfico padrão é um vermelho queimado. O acento varia por homenageado e aparece só em marcas, nunca no corpo.
- **Sem marcadores numerados decorativos.** Só a numeração real de página, fora do cartão.
- **Sem micro-labels em caixa alta por toda parte.** Os rótulos internos do selo tipográfico são a exceção: são parte do carimbo.
- **Movimento mínimo.** A transição de páginas é fade-out, respiro curto e fade-in apenas no conteúdo; a folha do cartão fica parada. O único gesto orquestrado é o envelope: o carimbo prende a folha, a folha sobe por trás dele e o envelope sai de cena. Depois de aberta, a carta não fecha de novo; recarregar volta ao envelope. `prefers-reduced-motion` desliga tudo.
- **Assimetria discreta.** O envelope tem o nome no eixo central, o carimbo no centro da borda e os três selos postais no canto superior direito. Não é um hero centralizado.

## Tokens

### Cor — tema claro

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#E9E4DA` | fundo pedra |
| `--card` | `#FAF7F0` | papel do cartão |
| `--ink` | `#1B2A2E` | tinta principal |
| `--muted` | `#67635B` | texto secundário (AA sobre pedra e papel) |
| `--line` | `#D8D0C3` | linhas e bordas |
| `--seal` | `#A33B32` | acento padrão |
| `--envelope` | `#1B2A2E` | corpo do envelope |
| `--envelope-deep` | `#131F21` | base do gradiente do envelope |
| `--envelope-ink` | `#F2ECE1` | texto do envelope |
| `--envelope-muted` | `#C9C1B4` | texto secundário do envelope |
| `--envelope-line` | `cream 18%` | bordas e fios do envelope |

### Cor — tema escuro

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#0E1618` | fundo |
| `--card` | `#162225` | papel |
| `--ink` | `#F2ECE1` | tinta |
| `--muted` | `#A8A196` | secundário |
| `--line` | `#2E3D40` | linhas |
| `--seal` | `#C46A5E` | acento padrão |
| `--envelope` | `#223437` | corpo do envelope |
| `--envelope-deep` | `#1A292C` | base do gradiente do envelope |
| `--envelope-line` | `cream 22%` | bordas e fios do envelope |

### Selos postais do envelope

Cores fixas nos dois temas, como papel e tinta de verdade.

| Token | Valor | Uso |
|---|---|---|
| `--stamp-paper` | `#EDE4D3` | papel creme perfurado |
| `--stamp-ink` | `#F2ECE1` | marca em creme |
| `--stamp-verde` | `#56705C` | campo da Alpha EdTech |
| `--stamp-azul` | `#466677` | campo da Ginga |
| `--stamp-terra` | `#985746` | campo da Cummins |

### Acentos por homenageado

| Nome | Claro | Escuro |
|---|---|---|
| `seal` | `#A33B32` | `#C46A5E` |
| `azul` | `#2F5D7A` | `#7FA6C0` |
| `verde` | `#4E6B52` | `#93B394` |
| `ameixa` | `#7A4E5A` | `#C48C9C` |
| `ocre` | `#B07A3C` | `#D8A75E` |

O acento aparece no fio curto sob o nome e em uma borda de citação. **Nunca no corpo do texto.** No envelope, use a variante clara (`--accent-envelope`), porque o fundo é escuro; o carimbo é dourado e não muda com o acento.

Contraste: `--muted` foi ajustado para `#67635B` para passar AA sobre o pedra. Os textos internos do selo tipográfico usam `--accent-ink`, uma variação mais escura/clara do acento, em vez do acento puro. O ocre puro não é usado em texto pequeno. No envelope, `--envelope-ink` e `--envelope-muted` passam AA sobre o verde.

### Dourado

O carimbo de cera é o **único** dourado do projeto. Ele é uma imagem fornecida pela Turma Ginga, não um gradiente nem um efeito CSS. Não use ouro em títulos, fios, ícones ou molduras.

## Tipografia

- **Fraunces** (variável, self-hosted): títulos, nome do homenageado e corpo da carta. O eixo `opsz` é usado grande no envelope e menor no texto; `SOFT` alta no corpo para uma leitura mais macia; `WONK` em 0 para manter a carta quieta.
- **IBM Plex Sans** (variável, self-hosted): navegação, rótulos, legendas, metadados e interface do editor.
- Sem fonte manuscrita, sem script, sem “assinatura” falsa.
- Corpo da carta: 30 px no desenho de 1160 × 820; 43 px no viewport estreito e 34 px nas páginas longas, compensando a escala do Reveal (cerca de 14–15 px e ~11 px na tela de 390 px). Linha de 1.44–1.58; medida confortável abaixo de 70ch.
- Títulos de página: 42 px no desenho; 48–54 px no mobile.
- Nome no envelope: 72 px no desenho; 96–108 px no mobile para compensar a escala do Reveal.
- `font-display: swap` e preload do subset latino.

## Layout

### Envelope

```text
palco 1160 × 820
                    ( carimbo )
  ┌──────────────────────────────────────────┐  ← envelope 1080 × 690
  │                          [1] [2] [3]     │  selos, canto superior direito
  │                                          │
  │                  Para                    │
  │          Nome do homenageado               │  72 px
  │                ─────                     │  fio de acento
  └──────────────────────────────────────────┘
        Toque no carimbo para abrir.           ← no chão, fora do envelope
```

- O envelope mede 1080 × 690 no palco de 1160 × 820, com 80 px de chão no topo, 40 px nas laterais e 50 px na base. O carimbo de 150 px fica no centro da borda superior, metade para fora; a borda de cima tem 2 px e as outras, 1 px.
- O corpo é verde profundo com grão CSS discreto; o texto é creme. O nome fica no eixo central, em Fraunces, com “Para” acima e uma linha fina de acento embaixo. A disciplina não entra na frente.
- Os três selos ficam em uma fileira horizontal no canto superior direito, a 36 px do topo e 60 px da direita. Cada um mede 80 × 100 px: papel creme perfurado (`--stamp-paper`), campo de cor vintage (`--stamp-verde`, `--stamp-azul`, `--stamp-terra`), a marca centralizada em creme e uma textura de grão/meio-tom em CSS sobre o campo. Sem texto postal. As fotos da carta ficam nas páginas internas.
- A frente não tem marca nem rodapé. A dica “Toque no carimbo para abrir” fica no chão, fora do objeto.
- O envelope, os selos e o carimbo são planos, sem sombra projetada. A separação vem da borda fina, da perfuração, do gradiente sutil do corpo e do contraste com o fundo.
- O carimbo é o único botão, com rótulo “Abrir a carta de Nome”; a imagem é decorativa e o selo tipográfico entra como fallback se ela falhar.
- O envelope é o estado fechado da página 1, não uma página extra. A folha começa em `scale(.83)`, com o topo na borda do envelope; ao abrir, sobe por trás do carimbo; o envelope desliza para fora; então a folha cresce até 1 e o texto entra.

### Página de texto

- Só o conteúdo, verticalmente centrado.
- Título opcional; parágrafos com 0.9em de respiro.
- Nenhum número, moldura, carimbo ou nota de margem dentro da folha.
- O contador fica no fundo, fora do cartão. O par de setas fica dentro da folha, no canto inferior direito, sem círculos e com a margem inferior reservada para ele.

### Página de foto

- 1–3 imagens, grid limpo; 1 grande, 2 lado a lado, 3 com a primeira ocupando duas linhas.
- Na folha horizontal, as fotos ganham largura e as legendas ficam logo abaixo de cada imagem.
- Falha de imagem vira um placeholder visual com aviso discreto, nunca um ícone quebrado.

### Recados

- Lista de mensagens curtas com autor.
- Duas colunas, inclusive no mobile, aproveitando a largura da folha horizontal.
- Réguas finas separam os blocos; o título e a lista formam um conjunto centrado na página.

### Citação

- Trecho grande em Fraunces, com uma régua de acento à esquerda e autor opcional abaixo.
- Sem aspas gigantes decorativas.

### Assinatura

- Fechamento centralizado, com “Com carinho,”, o nome da Turma Ginga, o ano e o símbolo da Turma Ginga em monocromático.
- É a única página interna centralizada; funciona como o fim de uma carta.

## Interação

- Reveal.js 6.0.2, um deck por homenageado, 1160 × 820, margem 0.02, centro ligado, sem autoplay. Controles do Reveal e barra de progresso desligados.
- A carta começa **fechada**: o primeiro slide contém a página 1 coberta pelo envelope. O carimbo é o único gatilho de abertura.
- Abertura: um “press” de ~120 ms; a folha começa em `scale(.83)`, com o topo na borda do envelope, e sobe ~80 px em ~500 ms; o envelope desliza para fora em ~750 ms, com um fade curto no fim; o texto entra na folha em ~320 ms assim que ela sai do envelope; no fim, a folha cresce até 1 em ~380 ms. A dica sai com o envelope. O envelope fica inerte e a página 1 recebe o foco. `prefers-reduced-motion` abre imediatamente.
- Depois de aberta, a carta não fecha de novo. Recarregar o link sem hash (ou `#/1`) volta ao envelope; um link profundo `#/2+` reabre na página pedida.
- Teclado, swipe e as setas internas ficam desabilitados enquanto a carta está fechada. O carimbo abre por Enter/Espaço.
- As setas ficam **dentro do cartão**, em um par no canto inferior direito, sem círculos. A indisponível fica `disabled` e esmaecida.
- O contador “1 / 5” fica **fora** do cartão, no canto inferior esquerdo, e só aparece depois da abertura. O envelope não conta como página; no piloto o total é 5.
- A troca de páginas é sequencial: o conteúdo atual faz fade-out em 260 ms, fica 40 ms de respiro e o novo conteúdo entra em 260 ms. A folha do cartão, a borda e a sombra ficam paradas; só o conteúdo faz o fade. O contador atualiza o número sem fade, e o conteúdo antigo some antes do novo aparecer.
- Toggle claro/escuro fixo, com `aria-pressed`, ícone sol/lua e persistência em `localStorage` (`cg-theme`). Na primeira visita, segue `prefers-color-scheme`. O tema é aplicado antes do CSS para evitar flash.
- Links profundos: sem hash ou `#/1` começam fechados; `#/2` em diante abre direto na página pedida, com o envelope considerado aberto. Voltar para a página 1 mostra a página aberta. A numeração nova não preserva hashes antigos.
- `prefers-reduced-motion`: transições e animações zeradas; o conteúdo aparece imediatamente e a troca de páginas não faz fade.

## Acessibilidade

- `lang="pt-BR"` em todas as páginas.
- Skip link para o conteúdo da carta.
- Foco visível em todos os botões, links e campos.
- Contraste AA: tinta 13.8:1, secundário 4.7:1 sobre pedra e 5.6:1 sobre papel no tema claro; no escuro, secundário 7.2:1. No envelope, o creme sobre o verde passa AA.
- Alt text obrigatório nas imagens; fallback visual quando a imagem falta. Se o carimbo de cera falhar, entra o selo tipográfico.
- O carimbo de cera é decorativo (`alt=""`) e o botão tem rótulo textual; o selo tipográfico e as imagens decorativas são `aria-hidden`. O símbolo do fecho também é decorativo, porque o texto “Turma Ginga” já identifica a assinatura.
- Enquanto fechada, a página 1 fica inerte e oculta para leitores de tela; só o carimbo é tabulável no deck. Depois de abrir, o envelope fica `inert` e `aria-hidden`, e o slide recebe o foco.
- Não há texto essencial dentro de imagens. A imagem OG é a exceção de compartilhamento, não conteúdo da página.
- O deck usa a região `aria-live` nativa do Reveal para anunciar a página atual.

## Responsivo

- **Desktop:** cartão horizontal centralizado, com margem para a toolbar no topo e o contador no rodapé.
- **Mobile (390 × 844):** o mesmo cartão 1160 × 820 é escalado; os tamanhos internos sobem para manter o corpo em torno de 14–15 px e o envelope legível. Textos longos reduzem um pouco o corpo; prefira dividir em mais páginas. O envelope mantém a composição: nome central, três selos postais no canto superior direito e carimbo na borda; os selos passam a 88 × 110 px e depois a 92 × 116 px para a perfuração não desaparecer. A dica encurta. Recados continuam em duas colunas. As setas internas ampliam a área de toque junto com o desenho.
- **Tablet:** escala intermediária; nenhuma alteração estrutural.
- **Home:** duas colunas no desktop, com o cartão da coleção em torno de 550 px; no mobile, empilha, mas o cartão continua horizontal. O cartão usa o símbolo da Turma Ginga no lugar do selo CG, em verde; o rodapé da página repete as três marcas do envelope (Ginga, Alpha EdTech e Cummins), em monocromático, sem o tratamento postal.
- Texto que não couber no cartão é cortado; divida em mais páginas. No desktop, o limite confortável é de ~600 caracteres; no celular, de ~350–400. O editor avisa acima de ~400 para o celular e acima de ~600 no geral; a página de texto ganha corpo menor a partir de ~400 caracteres.

## Imagens

- `assets/img/homenageados/<slug>/foto-01.webp`, `foto-02.webp`.
- `assets/img/marca/selo-cera.webp` e `selo-cera.png`: o carimbo de cera recortado, otimizado e com fallback PNG. O original `carimbo.png` é fonte local, não vai para o site.
- Placeholders atuais: SVGs abstratos, sem fotos falsas da internet.
- Imagem OG 1200 × 630, gerada a partir de HTML com as fontes do próprio projeto; traz o símbolo da Turma Ginga em verde.
- Favicon SVG com o selo CG.
- `loading="lazy"` e `decoding="async"` nas imagens de conteúdo; o carimbo com `loading="eager"` e fallback.

## Editor

O editor é uma ferramenta de trabalho: mais funcional do que o site, mas com os mesmos tokens. Três colunas no desktop (cartões, formulário, prévia), duas no tablet e uma no celular. A prévia usa as mesmas classes de cartão em 1160 × 820, escaladas por `transform` a partir da largura de 1160, para não divergir do resultado publicado. Os rótulos mostram “Capa” e depois as páginas 1..N; a capa é o envelope e não entra na contagem. A prévia “Capa” mostra o envelope; a disciplina continua no formulário, em **Publicação**, só nos dados, e não aparece nele.

## O que evitar

- Confete, glitter, dourado fora do carimbo de cera, balões, música automática, autoplay.
- Papel creme + terracota + serifa de banco como identidade padrão.
- Scrapbook, fita adesiva, polaroid, carimbo de “Parabéns”, carimbo de correio, papel kraft, papel rasgado. Selo postal só nos três selos do envelope.
- Texto dentro de imagem no conteúdo.
- Cards SaaS repetidos e sombras genéricas.
- Excesso de animação; mais de um momento orquestrado; giro 3D da capa na lombada.
- Lista pública de homenageados na raiz.
- Fontes manuscritas.
