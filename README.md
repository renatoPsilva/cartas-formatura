# Cartões de Gratidão

Base de um site estático em português para a Turma Ginga presentear os homenageados da **Alpha EdTech** com cartões de gratidão personalizados, acessados por links individuais.

O conteúdo deste repositório é **de exemplo**. Nomes, disciplinas, textos e imagens são placeholders e devem ser substituídos pela Turma Ginga.

A home usa o símbolo da Turma Ginga no cartão da coleção e repete os três selos institucionais no rodapé (Ginga, Alpha EdTech e Cummins).

Cada carta é um cartão horizontal de 1160 × 820. Ela começa fechada dentro de um envelope verde com um carimbo de cera dourado; o carimbo é o único botão e, ao abrir, a folha sobe por trás dele e o envelope sai de cena. O envelope não conta como página e a carta não fecha de novo — para voltar ao envelope, recarregue o link sem hash (ou com `#/1`). Recarregar um link profundo `#/2` ou posterior reabre a carta naquela página. A troca de páginas é fade-out, respiro curto e fade-in apenas no conteúdo; a folha do cartão fica parada.

## URLs

- Site: <https://renatopsilva.github.io/cartas-formatura/>
- Editor (não listado): <https://renatopsilva.github.io/cartas-formatura/editor/>

O site e o editor usam `noindex, nofollow`, e o `robots.txt` bloqueia indexação. Isso não é login: quem tiver o link consegue abrir. Não coloque dados pessoais sensíveis no repositório.

## Stack

- HTML, CSS e JavaScript puros.
- Sem framework, sem build e sem CDN em runtime.
- Reveal.js 6.0.2, fflate e fontes vendorizados no repositório.
- Publicação direta pelo GitHub Pages, com `.nojekyll`.
- Caminhos relativos, para funcionar no project site `/cartas-formatura/`.

## Rodar localmente

Na raiz do projeto:

```bash
python3 -m http.server 8000
```

Abra:

- Site: <http://localhost:8000/>
- Editor: <http://localhost:8000/editor/>
- Carta piloto: <http://localhost:8000/carta/homenageada-exemplo/>

Não é preciso instalar nada. O servidor local evita restrições de `file://`, especialmente para o editor e para o ZIP.

## Estrutura

```text
.
├── index.html                  # capa do site, sem lista de homenageados
├── 404.html
├── robots.txt                  # Disallow: /
├── .nojekyll
├── dados.js                    # window.DADOS = [...]
├── PLANO.md                    # plano original desta base
├── README.md
├── DESIGN.md
├── AGENTS.md
├── LICENSES.md
├── carta/
│   ├── homenageada-exemplo/index.html
│   └── homenageado-01..07/index.html
├── editor/
│   └── index.html              # editor não listado, noindex
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
│   ├── fonts/                  # Fraunces + IBM Plex Sans WOFF2 + OFL
│   └── img/
│       ├── og/cartoes-de-gratidao.png
│       ├── marca/               # selo.svg, favicon.svg, selo-cera.webp/png, selos/
│       └── homenageados/
├── vendor/
│   ├── reveal/                 # reveal.js + reveal.css + LICENSE
│   └── fflate/                 # fflate + LICENSE
└── .opencode/skills/frontend-design/
```

## Como a equipe edita

1. Abra o editor em `/editor/` (local ou na URL publicada).
2. Escolha o cartão na lista lateral. Para remover um cartão do rascunho, use o **×** ao lado do nome; a pasta em `carta/` não é apagada.
3. Edite o envelope: apenas o nome. Em **Publicação**, ajuste o slug e a disciplina; a disciplina fica nos dados, não no envelope. O acento e o selo tipográfico são automáticos; os três selos e o carimbo são fixos. O envelope não tem retrato.
4. Edite as páginas internas. É possível adicionar, remover, duplicar e reordenar blocos de **texto**, **foto**, **recados**, **citação** e **assinatura**.
5. Envie imagens pelo próprio editor. Ele redimensiona o maior lado para no máximo 1600 px, tenta converter para WebP e usa JPEG como fallback. Dimensões e peso final aparecem no campo.
6. Use a prévia e o tema claro/escuro para conferir. A prévia reproduz o cartão 1160 × 820; os rótulos mostram “Capa” (o envelope) e depois as páginas 1..N, sem contar o envelope.
7. Clique em **Baixar ZIP**.
8. Extraia o ZIP na raiz do repositório, substituindo os arquivos existentes.
9. Confira, faça commit e envie:

```bash
git status
git add dados.js assets/img
git commit -m "Atualiza cartões de gratidão"
git push
```

O GitHub Pages publica a branch `main` automaticamente. Pode levar alguns minutos.

### O que fica salvo onde

- **Rascunho textual:** `localStorage`, chave `cg-editor-draft-v1`.
- **Imagens enviadas:** IndexedDB do navegador, banco `cartoes-gratidao-editor`.
- **Nada é enviado a um servidor.** O editor não tem login, banco ou token.
- O ZIP contém `dados.js`, as imagens referenciadas em `assets/img/homenageados/...` e um `LEIA-ME.txt` com o passo a passo. O carimbo de cera (`assets/img/marca/selo-cera.*`) e os três selos (`assets/img/marca/selos/`) são assets do site, não do ZIP.
- Ao trocar de navegador ou limpar os dados do site, o rascunho local se perde. Exporte o ZIP com frequência.

### Importar um dados.js

O botão **Importar** aceita um `dados.js` exportado pelo editor ou um JSON com a lista de cartões. As imagens precisam existir no repositório ou ser enviadas de novo; o arquivo de dados não carrega binários.

## Modelo de dados

`dados.js` é um script clássico, não um módulo, para funcionar em `file://` e no GitHub Pages:

```js
window.DADOS = [
  {
    slug: "homenageada-exemplo",
    nome: "Homenageada Exemplo",
    disciplina: "Desenvolvimento Web",
    acento: "azul", // automático
    selo: "PE",     // opcional; sem ele, as iniciais vêm do nome
    paginas: [
      { tipo: "texto", titulo: "Para começar", paragrafos: ["...", "..."] },
      { tipo: "foto", titulo: "Momentos", fotos: [{ src: "...", alt: "...", legenda: "..." }] },
      { tipo: "recados", titulo: "Recados", recados: [{ autor: "Aluno", texto: "..." }] },
      { tipo: "citacao", texto: "...", autor: "..." },
      { tipo: "assinatura", texto: "Com carinho, Turma Ginga", ano: "2026" }
    ]
  }
];
```

Regras:

- O envelope é gerado automaticamente. Ele não é um bloco de `paginas`.
- O envelope é o estado fechado da página 1. O contador mostra apenas as páginas internas: no piloto, `1 / 5`, não `1 / 6`.
- O carimbo de cera é o único botão. A página 1 começa atrás do envelope, em `scale(.83)`; a folha sobe por trás do carimbo, o envelope desliza para fora, a página 1 cresce até o palco e recebe o foco quando a abertura termina.
- `acento` aceita `seal`, `azul`, `verde`, `ameixa` ou `ocre`. O editor o define automaticamente e não expõe o campo; cartões existentes mantêm o valor.
- `selo` são as iniciais do selo tipográfico usado como fallback do carimbo de cera. Não são os três selos do envelope. O fecho da carta usa o símbolo da Turma Ginga em monocromático, não o `selo` do homenageado. O editor não expõe o campo: cartões antigos mantêm o valor até o nome ser editado, e cartões novos derivam as iniciais do nome.
- O envelope não tem retrato. As fotos da carta ficam nas páginas de `foto`.
- Se não houver página de assinatura, o renderer adiciona uma assinatura padrão no fim.
- **Caminhos de imagem são relativos à raiz do site** (`assets/img/...`). O renderer da carta, que fica em `carta/<slug>/`, prefixa `../../` automaticamente. O editor usa `../` para a prévia. O ZIP mantém os caminhos da raiz.
- Os textos de página devem caber no cartão. No desktop, o limite confortável é de ~600 caracteres; no celular, de ~350–400. O editor avisa acima de ~400 para o celular e acima de ~600 no geral. Textos maiores devem ser divididos em mais páginas; não há modo de leitura alternativo.

### Abertura, contador e links profundos

- Sem hash ou com `#/1`, a carta abre fechada no envelope.
- `#/2` em diante abre direto na página pedida, com o envelope considerado aberto. Exemplo: `#/2` mostra a primeira página interna.
- Voltar para `#/1` depois de aberta mostra a página 1 aberta, não o envelope.
- O contador fica fora do cartão e só aparece depois da abertura. As setas ficam dentro do cartão, no canto inferior direito; a indisponível fica desabilitada.
- A troca de páginas é sequencial: 260 ms de fade-out, 40 ms de respiro e 260 ms de fade-in apenas no conteúdo. A folha do cartão fica parada; o contador atualiza o número sem fade, e o conteúdo antigo some antes do novo entrar.
- A numeração nova não preserva hashes antigos (`#/2` antigo apontava para outra página). O site é novo; compartilhe os links atuais.

## Como adicionar um novo homenageado

O editor pode adicionar uma entrada em `dados.js`, mas **não cria a página HTML**.

1. Copie uma pasta existente:

```bash
cp -r carta/homenageado-01 carta/homenageado-08
```

2. Em `carta/homenageado-08/index.html`, ajuste:
   - `data-homenageado="homenageado-08"` no `<body>`;
   - `<title>`;
   - `meta name="description"`;
   - `og:title`, `og:description`, `og:url`;
   - `data-acento` (opcional): o acento é automático; se quiser evitar o flash antes do JS, copie o valor de `acento` do `dados.js`.
3. No editor, clique em **Adicionar homenageado**, use o slug `homenageado-08` e edite o conteúdo.
4. Exporte o ZIP e publique. O link será `/carta/homenageado-08/`.

Se o slug mudar, renomeie também a pasta e as meta tags. O editor avisa sobre isso.

## Os 8 cartões desta base

| Cartão | Slug | Link |
|---|---|---|
| Homenageada Exemplo (piloto) | `homenageada-exemplo` | `/carta/homenageada-exemplo/` |
| Homenageado 01 | `homenageado-01` | `/carta/homenageado-01/` |
| Homenageado 02 | `homenageado-02` | `/carta/homenageado-02/` |
| Homenageado 03 | `homenageado-03` | `/carta/homenageado-03/` |
| Homenageado 04 | `homenageado-04` | `/carta/homenageado-04/` |
| Homenageado 05 | `homenageado-05` | `/carta/homenageado-05/` |
| Homenageado 06 | `homenageado-06` | `/carta/homenageado-06/` |
| Homenageado 07 | `homenageado-07` | `/carta/homenageado-07/` |

Os links antigos com `professor`/`professora` foram substituídos; compartilhe os links novos.

No site publicado, os links completos ficam em:

```text
https://renatopsilva.github.io/cartas-formatura/carta/<slug>/
```

## Publicação e GitHub Pages

O repositório publica a branch `main`, na raiz, sem build:

```bash
git push origin main
```

Se o Pages precisar ser habilitado novamente:

```bash
gh api -X POST repos/renatoPsilva/cartas-formatura/pages \
  -f build_type=legacy \
  -F 'source[branch]=main' \
  -F 'source[path]=/'
```

Confira com:

```bash
gh api repos/renatoPsilva/cartas-formatura/pages
curl -I https://renatopsilva.github.io/cartas-formatura/
```

O `.nojekyll` na raiz evita o processamento do Jekyll. Não há `package.json`, bundler ou ação de deploy.

## Remover o editor após a formatura

O editor é uma página estática e não tem autenticação. A proteção é apenas a URL não listada + `noindex`. Depois da formatura:

```bash
rm -rf editor
git add -A
git commit -m "Remove o editor após a formatura"
git push
```

Se quiser manter uma cópia local para a equipe, guarde fora do repositório publicado. Não dependa do editor como armazenamento: ele salva apenas no navegador de quem editou.

## Limitações conhecidas

- O site exige JavaScript para a navegação da carta. Sem JS, há um aviso e o conteúdo não é exibido; o `noscript` explica.
- Não há upload direto para o GitHub. A publicação é feita por commit/push.
- O editor não tem autenticação, banco, login ou token. Quem souber a URL pode abrir, mas só altera o próprio navegador.
- Imagens antigas que não são mais referenciadas continuam no repositório até serem removidas manualmente.
- O `noindex` reduz a descoberta por buscadores, mas não torna os links secretos.
- O texto do cartão é dimensionado para caber no formato horizontal. Textos longos devem ser divididos em mais páginas; no celular, o cartão horizontal é pequeno por natureza e o texto que passa do cartão é cortado.
- O GitHub Pages pode demorar alguns minutos para atualizar após o push.

## Licenças

Fontes, Reveal.js, fflate e a skill de design têm licenças próprias. Veja [LICENSES.md](LICENSES.md) e os arquivos em `assets/fonts/`, `vendor/` e `.opencode/skills/frontend-design/`.
