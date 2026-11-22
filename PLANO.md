# Plano de implementação — Cartões de Gratidão

> **Revisão (22/nov/2026):** o modo “Ler a carta inteira” foi removido do site. O fecho da carta passa a usar o símbolo da Turma Ginga em monocromático, no lugar do selo de iniciais; o `selo` do professor continua apenas como fallback do carimbo de cera. Textos longos devem ser divididos em mais páginas.

> **Revisão aprovada (20/nov/2026):** a capa 3D deixa de existir. A página 1 começa fechada dentro de um **envelope verde** de 1080 × 690, com um **carimbo de cera dourado** de 150 px no meio da borda superior. O carimbo é o único botão; ao abrir, a folha sobe por trás dele, o envelope desliza para fora e a folha cresce até o palco. A frente tem nome, três selos no canto inferior direito e um fio de acento; **não tem disciplina, marca nem rodapé**. O retrato é opcional no canto superior direito. O dourado do carimbo é a única exceção à regra de não usar dourado. A troca de páginas é fade-out (260 ms) + respiro (40 ms) + fade-in (260 ms) apenas no conteúdo; a folha fica parada e o contador atualiza o número sem fade. O resto da nota anterior continua, exceto o que conflitar com esta.

> **Revisão anterior (nov/2026):** o cartão deixou de ser retrato 820 × 1160 e passou a ser **horizontal 1160 × 820**, inclusive na home. A capa agora é o **estado fechado da página 1**: o selo abre uma capa 3D pela lombada esquerda e revela a primeira página, sem `Reveal.next()`. A capa não conta como página; o piloto mostra `1 / 5`. As setas ficam dentro do cartão, em par no canto inferior direito; o contador fica fora e só aparece depois da abertura; a barra de progresso foi removida. O Reveal continua, com fade lento. Sem hash ou `#/1` começa fechado; `#/2` em diante abre direto. Esta nota substitui as decisões de layout e interação abaixo que conflitarem com ela, mas é substituída pela revisão de 20/nov/2026 no que conflitar.

Este documento é a fonte de verdade para construir a base do site. O subagente deve ler tudo antes de começar e executar de ponta a ponta.

## 1. Objetivo

Criar a base de um site estático, em português, para a Turma Ginga presentear **8 professores da Alpha EdTech** com cartões de gratidão personalizados, acessados por links individuais.

O site será publicado no GitHub Pages. O conteúdo real será preenchido depois pela equipe; nesta etapa, usar **placeholders**. A base precisa ser boa o suficiente para ser mostrada aos colegas e fácil de editar por eles.

## 2. Contexto do repositório

- Pasta local: `/home/renato/Documentos/Projetos/cartas_formatura` — vazia, ainda sem git.
- Repo remoto: `renatoPsilva/Cartas_Formatura` — privado, vazio, criado em 04/11/2026.
- Descrição remota: “Cartas de formatura para os professores Alpha edtech com link compartilhável”.
- `gh` autenticado como `renatoPsilva`, com escopo `repo`; git usa SSH.
- O repo deve ser renomeado para **`cartas-formatura`**, tornado **público** e publicado via GitHub Pages.
- URL final: `https://renatopsilva.github.io/cartas-formatura/`
- Editor (não listado): `https://renatopsilva.github.io/cartas-formatura/editor/`

O usuário autorizou tornar o repo público. Fazer isso somente depois de a base estar testada localmente. Não usar Google Drive nem Cloudflare Images para servir imagens.

## 3. Restrições obrigatórias

- **HTML, CSS e JavaScript puros**. Sem React, Vue, Svelte, Astro, Tailwind ou framework equivalente.
- **Zero build no runtime**. O site publicado deve ser servido diretamente pelo GitHub Pages, com `.nojekyll`.
- **Sem CDN em runtime**. Vendorizar Reveal.js 6.0.2, biblioteca de ZIP e fontes dentro do repo.
- **Sem backend, sem banco, sem login, sem token**. O editor exporta arquivos.
- **Imagens ficam no repositório**, em `assets/img/`. Não usar Drive/Cloudflare para o site final.
- **Caminhos relativos** em todos os arquivos, para funcionar no project site do GitHub Pages (`/cartas-formatura/`).
- **Site em pt-BR**. `lang="pt-BR"` em todas as páginas.
- **Sem dados reais de professores**. Usar placeholders claros.
- **Sem indexação**: `noindex, nofollow` em todas as páginas e `robots.txt` com `Disallow: /`.
- **Sem lista pública de professores**. A raiz não lista nomes; o editor e o README listam os slugs para a equipe.
- **Sem confete, glitter, música automática, autoplay ou clichês de formatura. O único dourado é o carimbo de cera do envelope**; não usar ouro em nenhum outro elemento.
- **Acessibilidade**: teclado, foco visível, contraste, alt text e `prefers-reduced-motion`.
- **Mobile-first**: testar em 390×844 e 1440×900.

## 4. Entregáveis e estrutura de arquivos

Criar, no mínimo:

```text
.
├── index.html                     # capa do site, sem lista de professores
├── 404.html                       # opcional, mas recomendado
├── robots.txt                     # Disallow: /
├── .nojekyll
├── .gitignore
├── dados.js                       # window.DADOS = [...]
├── PLANO.md                       # este documento
├── README.md                      # como rodar, editar, publicar e remover o editor
├── DESIGN.md                      # tokens, tipografia, layouts, princípios
├── AGENTS.md                      # convenções para agentes e link para a skill
├── LICENSES.md                    # licenças de fontes/Reveal/fflate
├── carta/
│   ├── professora-exemplo/index.html
│   └── professor-01..07/index.html
├── editor/
│   └── index.html                 # editor não listado, noindex
├── assets/
│   ├── css/
│   │   ├── tokens.css
│   │   ├── base.css
│   │   ├── site.css
│   │   ├── reveal-theme.css
│   │   └── editor.css
│   ├── js/
│   │   ├── theme.js
│   │   ├── render-carta.js
│   │   └── editor.js
│   ├── fonts/                     # Fraunces + IBM Plex Sans WOFF2 + OFL
│   └── img/
│       ├── og/cartoes-de-gratidao.png
│       ├── marca/                 # selo tipográfico, carimbo de cera, favicon
│       └── professores/           # placeholders ou imagens reais
├── vendor/
│   ├── reveal/                    # reveal.js + reveal.css + LICENSE
│   └── fflate/ (ou jszip/)        # biblioteca de ZIP + licença
└── .opencode/
    └── skills/
        └── frontend-design/
            ├── SKILL.md
            └── LICENSE.txt
```

O número de páginas de professor é **8**: uma piloto (`professora-exemplo`) e sete placeholders (`professor-01` a `professor-07`). Se a equipe adicionar mais professores depois, será preciso duplicar um shell e atualizar as meta tags; documentar isso no README.

## 5. Design

### 5.1 Conceito

**Nome:** “Cartões de Gratidão”.
**Conceito:** uma coleção de cartões digitais. Cada professor recebe um cartão com um envelope de abertura e páginas internas limpas. O envelope carrega a identidade (nome, três selos, carimbo de cera, acento); a disciplina fica nos metadados. As páginas internas de texto têm **apenas o conteúdo da carta**, com margens generosas. Fotos, recados, citações e assinatura ficam em páginas próprias.

O elemento memorável é o **carimbo de cera dourado** no meio da borda do envelope. O resto deve ser quieto e editorial.

### 5.2 Tokens de cor

Tema claro:

```css
--bg: #E9E4DA;        /* fundo pedra */
--card: #FAF7F0;      /* cartão */
--ink: #1B2A2E;       /* tinta */
--muted: #6E6A62;     /* secundário */
--line: #D8D0C3;      /* linhas */
--seal: #A33B32;      /* selo/acento padrão */
```

Tema escuro:

```css
--bg: #0E1618;
--card: #162225;
--ink: #F2ECE1;
--muted: #A8A196;
--line: #2E3D40;
--seal: #C46A5E;
```

Acentos por professor (claro / escuro):

- azul: `#2F5D7A` / `#7FA6C0`
- verde: `#4E6B52` / `#93B394`
- ameixa: `#7A4E5A` / `#C48C9C`
- ocre: `#B07A3C` / `#D8A75E`
- selo (padrão): `#A33B32` / `#C46A5E`

O acento aparece no fio curto sob o nome e em linhas finas do interior. No envelope, usar a variante clara (`--accent-envelope`); o carimbo é dourado. **Nunca no corpo do texto.**

### 5.3 Tipografia

- **Fraunces** (variável) para títulos, capa e corpo da carta. Usar pesos 300–700; corpo com `SOFT 50`, `WONK 0`; títulos com `WONK 1` se ficar bom.
- **IBM Plex Sans** para navegação, números de página e pequenos rótulos.
- Sem fonte manuscrita. A página deve ser limpa.
- Self-host dos WOFF2 em `assets/fonts/`, com `font-display: swap` e licenças OFL.
- Tamanho de corpo confortável; linha de 60–70ch; `line-height` ~1.5.

### 5.4 Layout

- Cartão horizontal, base de design **1160×820**. Ver a nota de revisão no topo.
- Fundo pedra; cartão centralizado com borda fina, sombra suave e textura de papel discreta.
- **Envelope:** nome, três selos no canto inferior direito, carimbo de cera, fio de acento. Retrato opcional no canto superior direito. Sem disciplina, marca ou rodapé na frente. O envelope é o estado fechado da página 1; o carimbo é o único botão.
- **Página de texto:** só o conteúdo. Título opcional. Nenhum carimbo, moldura, nota de margem ou enfeite. O contador fica **fora** do cartão; o par de setas fica dentro, no canto inferior direito.
- **Página de foto:** 1–3 imagens com legenda, layout limpo. Sem fita adesiva, polaroid ou scrapbook.
- **Página de recados:** mensagens curtas com autor, em lista ou blocos discretos.
- **Página de citação:** um trecho em destaque, com autor opcional.
- **Página de assinatura:** fechamento da Turma Ginga, curso/ano e o símbolo da Turma Ginga em monocromático.
- Máximo de ~500–700 caracteres por página de texto; o editor deve avisar se passar.
- O envelope é gerado automaticamente a partir dos metadados; as páginas internas são blocos editáveis.

### 5.5 Interação

- Reveal.js 6.0.2, um deck por professor, 1160 × 820, centro ligado, sem autoplay e sem barra de progresso.
- Navegação por setas internas, teclado e swipe **depois** de abrir. Antes disso, só o carimbo responde.
- Um único momento orquestrado: o carimbo é um botão acessível; ao clicar, a folha sobe por trás dele, o envelope desliza para fora e a folha cresce até o palco. Não há giro 3D da capa.
- A troca de páginas é fade-out (260 ms), respiro (40 ms) e fade-in (260 ms) apenas no conteúdo; a folha do cartão fica fixa. O contador atualiza o número sem fade. Sem zoom, rotação ou deslize.
- `prefers-reduced-motion`: desligar transições e animações; abrir imediatamente.
- Toggle de tema claro/escuro fixo, acessível, com `aria-pressed` e ícone sol/lua. Persistir em `localStorage` (`cg-theme`); na primeira visita, seguir `prefers-color-scheme`. Aplicar o tema antes do paint para evitar flash.
- Indicador de página fora do cartão, só visível depois da abertura, atualizado em `slidechanged`. Total = páginas internas (o envelope não conta).
- A raiz é uma página simples, sem Reveal.js e sem lista de professores.

### 5.6 Revisão contra clichês

Evitar: papel creme + serifa de banco + terracota; cartões SaaS com sombra genérica; scrapbook postal (selo postal, carimbo de correio, fita, kraft, papel rasgado); confete; dourado fora do carimbo de cera; autoplay. A identidade vem da tipografia Fraunces, do cartão limpo, do envelope com carimbo de cera, do selo tipográfico e do acento por professor. Usar a skill `frontend-design` e tirar screenshots para se autocriticar.

## 6. Modelo de dados

`dados.js` é um script clássico (não módulo) para funcionar em `file://` e no GitHub Pages:

```js
window.DADOS = [
  {
    slug: "professora-exemplo",
    nome: "Professora Exemplo",
    disciplina: "Desenvolvimento Web",
    retrato: "assets/img/professores/professora-exemplo/retrato.webp", // ou ""
    retratoAlt: "Retrato da Professora Exemplo",
    acento: "azul", // "seal" | "azul" | "verde" | "ameixa" | "ocre"
    selo: "PE",     // iniciais do carimbo de fallback
    paginas: [
      { tipo: "texto", titulo: "Para começar", paragrafos: ["...", "..."] },
      { tipo: "texto", titulo: "O que ficou", paragrafos: ["..."] },
      { tipo: "foto", fotos: [{ src: "...", alt: "...", legenda: "..." }] },
      { tipo: "recados", recados: [{ autor: "Aluno", texto: "..." }] },
      { tipo: "citacao", texto: "...", autor: "..." },
      { tipo: "assinatura", texto: "Com carinho, Turma Ginga", ano: "2026" }
    ]
  }
];
```

Regras:

- O **envelope é automático** (não é um bloco de `paginas`). Ele usa `nome`, `acento`, `selo` e os três selos fixos; `retrato`/`retratoAlt` são opcionais no canto superior direito. A `disciplina` continua nos metadados, mas não aparece na frente.
- `paginas` é uma lista aberta de blocos internos. Tipos: `texto`, `foto`, `recados`, `citacao`, `assinatura`.
- O renderer monta: a página 1 com o envelope por cima (estado fechado) e mais um slide por bloco seguinte. Se não houver `assinatura`, adicionar uma assinatura padrão no fim. O envelope não é um slide separado.
- Se `retrato` estiver vazio ou a imagem falhar, o envelope fica sem retrato; os três selos permanecem. Nunca deixe ícone quebrado.
- Se uma foto estiver faltando, mostrar um placeholder discreto.
- O editor deve permitir adicionar, remover, duplicar e reordenar blocos; editar todos os campos; e alterar os metadados da capa.
- O editor pode adicionar um novo professor aos dados, mas **não cria o shell HTML**; documentar que é preciso duplicar uma pasta em `carta/` e atualizar as meta tags.

### Conteúdo piloto

- `professora-exemplo`: capa + 2 páginas de texto + 1 página de foto + 1 página de recados + 1 assinatura. Texto genérico, afetuoso, claramente placeholder.
- `professor-01` a `professor-07`: capa + 1 página de texto + assinatura, com nomes/disciplinas placeholder.
- Não usar nomes reais, fotos reais ou dados pessoais.

## 7. Site público

### Raiz

`index.html`:

- Título “Cartões de Gratidão”.
- Subtítulo “Para os professores da Alpha EdTech”.
- Parágrafo curto explicando o intuito: uma coleção de cartas da Turma Ginga; cada professor recebeu um link próprio.
- Nenhuma lista de professores.
- Toggle de tema.
- Visual com o símbolo da Turma Ginga no cartão da coleção e os três selos no rodapé, usando os tokens.
- `noindex`.

### Páginas de professor

`carta/<slug>/index.html` × 8:

- Shell estático com `<title>`, `description`, `og:title`, `og:description`, `og:image`, `twitter:card`, `noindex`.
- `<body data-professor="<slug>">`.
- Carregar `../../dados.js`, `../../vendor/reveal/reveal.js`, `../../assets/js/theme.js`, `../../assets/js/render-carta.js`, CSS correspondente.
- A página deve exibir um estado de carregamento e um erro amigável se o slug não existir.
- `<noscript>` com mensagem curta.
- Meta OG image genérica `../../assets/img/og/cartoes-de-gratidao.png` (1200×630).
- Título exemplo: “Para Professora Exemplo — Cartões de Gratidão”.
- Descrição exemplo: “Uma carta da Turma Ginga para Professora Exemplo.”

### Reveal.js

- Vendorizar `reveal.js` e `reveal.css` 6.0.2 em `vendor/reveal/`, com licença.
- Configuração (revisada):
  - `width: 1160`, `height: 820`
  - `margin: 0.02`
  - `center: true`
  - `controls: false`
  - `progress: false`
  - `keyboard: false` e `touch: false` até o envelope abrir
  - `hash: true`, `hashOneBasedIndex: true`, `history: false`
  - `respondToHashChanges: false` até abrir
  - `transition: 'fade'` como base; o tema implementa a sequência 260 ms + 40 ms + 260 ms
  - `transitionSpeed: 'slow'` (o CSS do tema controla a duração real)
  - `autoSlide: 0`
  - `loop: false`
  - `backgroundTransition: 'fade'`
- Sem plugins desnecessários.
- Customizar o tema via `assets/css/reveal-theme.css` e variáveis CSS. Não usar um tema pronto claro/escuro genérico.
- O card deve parecer uma folha, não um slide corporativo. Testar em mobile e ajustar tamanho do texto.

### Acessibilidade

- `lang="pt-BR"`.
- Skip link para o conteúdo da carta.
- Foco visível em botões, links e controles.
- Alt text em todas as imagens.
- Contraste AA.
- `prefers-reduced-motion`.
- Não usar texto dentro de imagem.

## 8. Editor

Criar `editor/index.html` + `assets/js/editor.js` + `assets/css/editor.css`.

Requisitos:

- Página **não listada**, com `noindex, nofollow`; não linkar a partir do site público.
- Carregar `../dados.js` e usar `window.DADOS`.
- Sidebar com os 8 professores; formulário para o professor selecionado.
- Editar metadados do envelope: slug, nome, disciplina, retrato, alt, acento, selo.
- Lista de páginas internas com:
  - adicionar página (seletor de tipo: texto, foto, recados, citação, assinatura);
  - remover, duplicar, reordenar (subir/descer);
  - editar campos específicos;
  - contador/aviso de texto longo.
- Prévia interna simples do cartão 1160 × 820 (envelope + páginas) usando os mesmos tokens; toggle claro/escuro. O envelope aparece como “Capa”, não entra na contagem das páginas e não mostra a disciplina.
- Upload de imagens:
  - aceitar qualquer imagem;
  - redimensionar o maior lado para no máximo 1600 px;
  - converter para WebP (fallback JPEG);
  - mostrar dimensões e peso final;
  - avisar se a imagem for menor que ~800 px ou passar de ~500 KB;
  - prévia, remover e substituir;
  - persistir blobs em IndexedDB e o rascunho textual em localStorage.
- Exportação:
  - botão “Baixar dados.js” (script clássico com `window.DADOS = ...`);
  - botão “Baixar ZIP” com `dados.js`, `assets/img/professores/<slug>/...` e um `LEIA-ME.txt` explicando como commitar;
  - usar `fflate` ou `JSZip` vendorizado, com licença;
  - o ZIP deve conter as imagens com os caminhos exatos referenciados em `dados.js`.
- Importação opcional de um `dados.js`/JSON para restaurar rascunho.
- Instruções na interface: “Baixe o ZIP, extraia na raiz do repositório, substitua os arquivos, commit e push.”
- O editor não salva em servidor; não usar tokens.
- Documentar que o editor deve ser removido (ou bloqueado) após a formatura.
- O editor pode ser mais funcional do que bonito, mas deve ser usável e responsivo.

## 9. Imagens

- Estrutura: `assets/img/professores/<slug>/retrato.webp`, `foto-01.webp`, etc.
- Carimbo de cera: `assets/img/marca/selo-cera.webp` + `selo-cera.png`, recortado de `carimbo.png` (fonte local, ignorada pelo git). O botão usa `<picture>` e o selo tipográfico como fallback.
- Placeholders: criar SVGs/CSS com iniciais/pattern; não usar fotos falsas da internet.
- A imagem OG genérica deve ser um PNG 1200×630 com o título e o símbolo da Turma Ginga, gerada via Playwright/HTML ou ImageMagick.
- Favicon SVG simples com o selo tipográfico.
- `loading="lazy"` e `decoding="async"` nas imagens; o retrato e o carimbo usam `loading="eager"`.
- O editor aplica as restrições no upload; o usuário não precisa fazer manualmente.
- Se uma imagem faltar, o site usa fallback visual, nunca um ícone quebrado.

## 10. Skill e documentação

### Skill frontend-design

- Criar `.opencode/skills/frontend-design/`.
- Baixar `SKILL.md` de `https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md`.
- Baixar `LICENSE.txt` do mesmo diretório do repo Anthropic; se o caminho exato falhar, localizar a licença no repositório e incluir.
- Ler a skill antes de implementar o visual e seguir seu processo (planejar, revisar, construir, criticar).
- Não alterar o conteúdo da skill, exceto se necessário para o caminho; manter a licença.

### AGENTS.md

Incluir convenções:

- Ler `.opencode/skills/frontend-design/SKILL.md` antes de mudanças visuais.
- Stack: HTML/CSS/JS puro; sem frameworks; sem build; sem CDN em runtime.
- Caminhos relativos.
- Cartões: envelope com identidade (nome, três selos, carimbo de cera, fio de acento, sem disciplina, marca ou rodapé); interior de texto limpo.
- Dados em `dados.js` (`window.DADOS`).
- Testar claro/escuro, mobile, teclado e `prefers-reduced-motion`.
- Não usar dados reais de professores.
- Imagens no repo; editor exporta ZIP.
- Site `noindex`.
- Idioma pt-BR.

### README.md

Incluir:

- Visão geral e URLs.
- Como rodar localmente: `python3 -m http.server 8000` e abrir `http://localhost:8000/`.
- Estrutura de arquivos.
- Como editar pelo editor: abrir `/editor/`, editar, baixar ZIP, extrair na raiz, commit/push.
- Como adicionar um novo professor: duplicar uma pasta em `carta/`, ajustar `data-professor` e meta tags, adicionar entrada em `dados.js`.
- Como remover o editor após a formatura.
- Limitações: sem upload direto; publicação via commit; site público e não indexado.
- Lista dos 8 slugs/URLs para a equipe.

### DESIGN.md

Documentar conceito, tokens claro/escuro, tipografia, layout, tipos de página, princípios, decisões de acessibilidade e o que evitar. Pode reaproveitar seções deste plano.

### Licenças

- Incluir licenças de Fraunces, IBM Plex Sans, Reveal.js e fflate/JSZip.
- `LICENSES.md` com links e arquivos em `vendor/`/`assets/fonts/`.

## 11. Deploy

1. Trabalhar localmente, testar.
2. Inicializar git na pasta atual:
   ```bash
   git init -b main
   git add .
   git commit -m "Base do site Cartões de Gratidão"
   ```
3. Renomear o repo remoto:
   ```bash
   gh repo rename cartas-formatura --repo renatoPsilva/Cartas_Formatura --yes
   ```
4. Configurar remote:
   ```bash
   git remote add origin git@github.com:renatoPsilva/cartas-formatura.git
   git push -u origin main
   ```
5. Tornar público (somente depois dos testes locais):
   ```bash
   gh repo edit renatoPsilva/cartas-formatura --visibility public --accept-visibility-change-consequences
   ```
6. Habilitar Pages (branch `main`, raiz):
   ```bash
   gh api -X POST repos/renatoPsilva/cartas-formatura/pages \
     -f build_type=legacy \
     -F 'source[branch]=main' \
     -F 'source[path]=/'
   ```
   Se o endpoint reclamar que já existe, usar `PUT` ou verificar `gh api repos/renatoPsilva/cartas-formatura/pages`.
7. Garantir `.nojekyll` na raiz.
8. Verificar a URL publicada com `curl -I` e Playwright. Pages pode levar alguns minutos.
9. Se o deploy falhar, documentar o passo manual e deixar o site testável localmente.

Não commitar `node_modules`, arquivos temporários, tokens ou dados pessoais.

## 12. Testes e QA

- Subir servidor local:
  ```bash
  python3 -m http.server 8000
  ```
- Testar com Playwright:
  - raiz;
  - carta piloto;
  - uma carta placeholder;
  - editor;
  - toggle claro/escuro e persistência;
  - navegação next/prev, teclado, swipe quando possível;
  - página de assinatura com o símbolo da Turma Ginga em monocromático;
  - 390×844 e 1440×900;
  - console sem erros;
  - imagens/fallbacks;
  - meta tags e `noindex`;
  - `prefers-reduced-motion` (emular se possível).
- Testar o ZIP do editor: gerar um download e conferir se contém `dados.js` + imagens + `LEIA-ME.txt`.
- Testar a URL do GitHub Pages.
- Corrigir o que for encontrado antes de finalizar.

## 13. Relatório final

Ao terminar, reportar em português:

- URL do site e do editor.
- O que foi construído.
- Como rodar localmente.
- Como a equipe edita e publica.
- Quais são os 8 slugs/links.
- O que ficou pendente ou limitado.
- Qualquer passo manual necessário.

## 14. Autonomia

- Executar de ponta a ponta sem pedir confirmação ao usuário.
- Tomar decisões razoáveis dentro deste plano e documentá-las.
- Priorizar: site público + piloto + editor funcional + deploy. Polimento extra depois.
- Se algo for impossível no ambiente, implementar a melhor alternativa e relatar.
- Não usar Google Drive, Cloudflare Images, backend, tokens ou dados reais.
- Não criar um site genérico: seguir a skill `frontend-design` e a direção “Cartões de Gratidão”.
