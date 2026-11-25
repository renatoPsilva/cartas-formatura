# Convenções para agentes

Este repositório é uma base estática para os **Cartões de Gratidão** da Turma Ginga, da Alpha EdTech.

## Antes de mexer no visual

1. Leia `.opencode/skills/frontend-design/SKILL.md` **inteiro**.
2. Leia `DESIGN.md` e `PLANO.md` para entender a direção, os tokens e as restrições.
3. Se for uma mudança visual, tire screenshots em claro/escuro e em 390 × 844 e 1440 × 900; critique o resultado antes de finalizar.
4. Para uma passada de limpeza de copy ou enfeites de interface, invoque `@unslop-ui` no alvo. Use `--surface` apenas quando o pedido for explicitamente visual e confira contra `DESIGN.md`.

## Stack e restrições

- HTML, CSS e JavaScript puros. Sem React, Vue, Svelte, Astro, Tailwind ou framework equivalente.
- Sem build step. O site é servido diretamente pelo GitHub Pages.
- Sem CDN em runtime. Reveal.js, fflate e fontes são vendorizados no repositório.
- Sem backend, banco, login ou token.
- Caminhos relativos em todos os arquivos. O site vive em `/cartas-formatura/`. A exceção é `404.html`, que usa `<base href="/cartas-formatura/">` porque o GitHub Pages serve o 404 mantendo a URL profunda original.
- `.nojekyll` na raiz.
- Site em pt-BR; `lang="pt-BR"` em todas as páginas.
- Todas as páginas com `noindex, nofollow`. `robots.txt` com `Disallow: /`.
- Conteúdo real dos 10 homenageados, adaptado dos itens “Carta Afetiva” do projeto Stitch da Turma Ginga. Não invente fatos, cenas ou falas: use os briefs do Stitch. As imagens atuais são ilustrações geradas por IA; o alt deve declarar isso. Não publique dados pessoais sensíveis.
- Sem lista pública de homenageados na raiz.
- Sem confete, glitter, autoplay, música automática ou clichês de formatura. O único dourado é o carimbo de cera do envelope; não use ouro em nenhum outro elemento.

## Estrutura de conteúdo

- `dados.js` define `window.DADOS`, um script clássico.
- O envelope é automático: `nome`, `acento` e `selo` (iniciais do selo tipográfico e fallback do carimbo) e três selos fixos no canto inferior direito. Não há retrato. A disciplina continua nos dados, mas não aparece na frente.
- `paginas` é uma lista ordenada de blocos: `texto`, `foto`, `recados`, `citacao`, `assinatura`.
- Se não houver `assinatura`, o renderer adiciona uma no fim.
- O envelope é o **estado fechado da página 1**, não um slide extra. O total do contador é o número de páginas internas; em uma carta de 7 páginas, `1 / 7`.
- A carta começa fechada. O carimbo de cera é o único botão: ao abrir, a folha sobe por trás dele, o envelope desliza para fora, o texto entra e a folha cresce até o palco. Não há giro 3D de página. Depois de aberta, ela não fecha de novo. Recarregar sem hash (ou `#/1`) volta ao envelope; recarregar `#/2+` reabre na página pedida.
- Sem hash ou `#/1` começam fechados; `#/2` em diante abre direto na página pedida, com o envelope considerado aberto.
- **Caminhos de imagem nos dados são relativos à raiz do site** (`assets/img/...`). `render-carta.js` prefixa `../../` nas páginas de homenageado. O editor prefixa `../` na prévia. O ZIP mantém os caminhos da raiz.
- Acentos válidos: `seal`, `azul`, `verde`, `ameixa`, `ocre`. O acento é automático; o editor não o expõe.
- O `selo` é automático e derivado do nome para cartões novos. Valores antigos são preservados até o nome ser editado; não há campo de selo no editor.
- Mantenha os textos de página dentro do cartão; não há modo de leitura alternativo. Textos maiores devem ser divididos em mais páginas. No desktop, o limite confortável é de ~600 caracteres; no celular, de ~350–400; o editor avisa acima de ~400 para o celular.

## Direção visual

- O cartão parece uma folha, não um slide corporativo.
- O envelope tem identidade: nome grande, três selos no canto inferior direito, carimbo de cera dourado e fio de acento; sem disciplina, marca, retrato ou rodapé na frente.
- Os três selos são marcas discretas em creme monocromático; não competem com o carimbo.
- Interior de texto limpo: sem molduras, carimbos, números ou enfeites dentro da folha.
- O fecho da carta usa o símbolo da Turma Ginga em monocromático, no lugar do selo de iniciais. O selo de iniciais continua no envelope como fallback do carimbo.
- O contador de páginas fica **fora** do cartão, no fundo, e só aparece depois da abertura. O par de setas fica **dentro** do cartão, no canto inferior direito, sem círculos. Não há barra de progresso.
- O carimbo de cera é o elemento memorável. Não adicione outro objeto decorativo além dos três selos do envelope.
- A capa da home usa o símbolo da Turma Ginga no lugar do selo CG, em verde; o rodapé da home repete os três selos do envelope (Ginga, Alpha EdTech e Cummins), em monocromático.
- O envelope e o carimbo são planos: sem sombra projetada. A separação vem da borda fina e do fundo.
- O acento aparece no fio curto sob o nome e em linhas finas do interior; o carimbo é dourado. Nunca no corpo do texto.
- A transição entre páginas é fade-out, respiro curto e fade-in apenas no conteúdo (texto, fotos, recados); a folha do cartão fica parada. Sem deslize, giro ou barra.
- Fraunces para display/corpo da carta; IBM Plex Sans para navegação e interface.
- Textura de papel discreta via CSS, não imagem de fundo pesada.

## Acessibilidade

- Teclado e foco visível em tudo.
- `aria-pressed` no toggle de tema; persistir em `cg-theme`.
- `prefers-reduced-motion` desliga animações/transições.
- Skip link para o conteúdo da carta.
- Enquanto a carta está fechada, a página 1 é inerte e oculta para leitores de tela; só o carimbo é tabulável no deck. Depois de abrir, o envelope fica `inert` e o foco vai para a página 1.
- Alt text em todas as imagens; fallback quando faltarem. O carimbo de cera é decorativo (`alt=""`) e o botão tem rótulo textual; se a imagem falhar, entra o selo tipográfico.
- Contraste AA. `--muted` claro é `#67635B`; textos pequenos do selo tipográfico usam `--accent-ink`; no envelope, use `--envelope-ink` / `--envelope-muted`.
- Não usar texto essencial dentro de imagem.

## Editor

- Página não listada em `editor/`, com `noindex, nofollow`; não linkar do site público.
- Deve carregar `../dados.js` e usar `window.DADOS`.
- A prévia usa o cartão 1160 × 820 e escala a partir de 1160. Os rótulos são “Capa” e páginas 1..N; a capa é o envelope e não conta como página. A prévia “Capa” mostra o envelope; a disciplina fica só nos dados e não aparece na prévia.
- O formulário do envelope expõe apenas o **Nome**. Acento, selo tipográfico e retrato não têm campos: acento e selo são automáticos; não há retrato.
- A lista lateral tem um **×** por cartão para remover do rascunho, com confirmação. A pasta `carta/<slug>/` não é apagada.
- Upload de imagens: maior lado ≤ 1600 px, WebP com fallback JPEG, aviso para < 800 px ou > 500 KB.
- Rascunho textual em `localStorage` (`cg-editor-draft-v1`); blobs em IndexedDB (`cartoes-gratidao-editor`).
- Exportação: `dados.js` e ZIP com `dados.js` + imagens + `LEIA-ME.txt`.
- O ZIP deve manter exatamente os caminhos referenciados nos dados.
- O editor não cria shells HTML. Ao adicionar homenageado, documente que é preciso duplicar uma pasta em `carta/` e ajustar `data-homenageado` e meta tags.
- Após a formatura, o editor deve ser removido ou bloqueado. Veja o README.

## Testes antes de publicar

- Servidor local: `python3 -m http.server 8000`.
- Chrome headless via `puppeteer-core` em 390 × 844 e 1440 × 900.
- Raiz, pelo menos duas cartas reais, editor e 404.
- Envelope fechado, quadro do meio da abertura (folha saindo por trás do carimbo) e página 1 aberta, em claro/escuro.
- A transição entre páginas é fade-out, respiro curto e fade-in; o conteúdo antigo deve sumir antes do novo entrar, mas a folha do cartão não pode piscar nem desaparecer. O contador atualiza o número sem fazer fade.
- Contador e setas ocultos fechado; visíveis e corretos depois. Setas `disabled` na primeira e na última página; sem círculos e sem barra de progresso.
- Claro/escuro + persistência.
- Teclado: só o carimbo tabulável no deck fechado, Enter/Space para abrir, foco na página 1, setas e Home/End.
- Hash: sem hash e `#/1` fechados; `#/2` e `#/3` abertos direto; voltar à página 1 mostra a página aberta.
- Swipe quando possível.
- A página de assinatura mostra o símbolo da Turma Ginga em monocromático, sem as iniciais do homenageado, em claro/escuro e nas duas larguras.
- `prefers-reduced-motion` abre sem transição e troca as páginas sem fade.
- Home horizontal em desktop e mobile.
- Console sem erros; imagens/fallbacks (inclusive o carimbo de cera); meta tags e `noindex`.
- Editor: o **×** da lista remove só o rascunho, pede confirmação e mantém uma seleção válida; **Adicionar homenageado** cria o próximo slug `homenageado-XX`.
- ZIP do editor com `dados.js` + imagens + `LEIA-ME.txt`.
- Verificar a URL publicada do GitHub Pages depois do deploy.

## O que não fazer

- Não usar Google Drive, Cloudflare Images, backend, banco ou tokens.
- Não commitar `node_modules`, screenshots de teste, ZIPs, arquivos temporários ou dados pessoais.
- Não renomear/slug sem atualizar a pasta `carta/<slug>/`, as meta tags e os caminhos de imagem.
- Não editar o conteúdo de `.opencode/skills/frontend-design/SKILL.md` nem remover a licença.
- Não transformar a raiz em uma lista de cartões.
- Não usar ouro fora do carimbo de cera. Não adicionar selo postal, carimbo de correio, fita, papel kraft, papel rasgado ou qualquer outro prop de scrapbook.
- Não voltar ao giro 3D da capa na lombada: a abertura é o envelope e a folha saindo.
