/* ==========================================================================
   Editor local dos Cartões de Gratidão
   - rascunho textual em localStorage
   - imagens em IndexedDB (blobs) + prévia por object URL
   - exportação de dados.js e ZIP (fflate)
   ========================================================================== */
(function () {
  "use strict";

  var STORAGE_KEY = "cg-editor-draft-v1";
  var DB_NAME = "cartoes-gratidao-editor";
  var DB_STORE = "imagens";
  var ACENTOS = ["seal", "azul", "verde", "ameixa", "ocre"];
  var LIMITE_TEXTO = 600;
  var LIMITE_TEXTO_CELULAR = 400;
  var MAX_IMAGEM = 1600;
  var LIMITE_PESO = 500 * 1024;
  var MIN_LADO = 800;
  var SELO_WEBP = "../assets/img/marca/selo-cera.webp";
  var SELO_PNG = "../assets/img/marca/selo-cera.png";
  var SELOS_ENVELOPE = [
    {
      cor: "azul",
      marca: "ginga",
      webp: "../assets/img/marca/selos/selo-01.webp",
      png: "../assets/img/marca/selos/selo-01.png",
      largura: 180,
      altura: 180,
    },
    {
      cor: "verde",
      marca: "alpha",
      webp: "../assets/img/marca/selos/selo-02.webp",
      png: "../assets/img/marca/selos/selo-02.png",
      largura: 155,
      altura: 180,
    },
    {
      cor: "terra",
      marca: "cummins",
      webp: "../assets/img/marca/selos/selo-03.webp",
      png: "../assets/img/marca/selos/selo-03.png",
      largura: 180,
      altura: 166,
    },
  ];

  var db = null;
  var imagens = new Map();
  var salvarTimer = null;
  var previewTimer = null;
  var statusTimer = null;
  var escalaObserver = null;

  var estado = {
    dados: [],
    selecionado: 0,
  };

  /* ------------------------------------------------------------------------
     Utilidades
     ------------------------------------------------------------------------ */
  function $(seletor, raiz) {
    return (raiz || document).querySelector(seletor);
  }

  function $$(seletor, raiz) {
    return Array.prototype.slice.call((raiz || document).querySelectorAll(seletor));
  }

  function esc(valor) {
    return String(valor == null ? "" : valor).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  }

  function clone(valor) {
    return JSON.parse(JSON.stringify(valor));
  }

  function textoContagem(total) {
    var rotulo = total + " caracteres";
    if (total > LIMITE_TEXTO) return rotulo + " — acima do recomendado";
    if (total > LIMITE_TEXTO_CELULAR) {
      return rotulo + " — no celular, prefira até ~400";
    }
    return rotulo;
  }

  function formatarBytes(bytes) {
    if (!bytes && bytes !== 0) return "—";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function agora() {
    return new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function anunciar(mensagem, tipo) {
    var el = $("[data-status]");
    if (!el) return;
    el.textContent = mensagem;
    if (tipo) el.setAttribute("data-tipo", tipo);
    else el.removeAttribute("data-tipo");
    window.clearTimeout(statusTimer);
    statusTimer = window.setTimeout(function () {
      el.textContent = "Rascunho local neste navegador";
      el.removeAttribute("data-tipo");
    }, 6500);
  }

  function normalizarSlug(valor) {
    return String(valor || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64);
  }

  /* Migra rascunhos e dados antigos de “professor” para “homenageado”. */
  function migrarSlug(valor) {
    var slug = String(valor || "");
    if (slug === "professor") return "homenageado";
    if (slug === "professora") return "homenageada";
    if (slug.indexOf("professora-") === 0) {
      return "homenageada-" + slug.slice("professora-".length);
    }
    if (slug.indexOf("professor-") === 0) {
      return "homenageado-" + slug.slice("professor-".length);
    }
    return slug;
  }

  function migrarNome(valor) {
    var nome = String(valor == null ? "" : valor);
    if (nome === "Novo professor") return "Novo homenageado";
    return nome
      .replace(/^Professora\b/, "Homenageada")
      .replace(/^Professor\b/, "Homenageado");
  }

  function migrarCaminhoImagem(src) {
    var valor = String(src || "");
    var prefixo = "assets/img/professores/";
    if (valor.indexOf(prefixo) !== 0) return valor;
    var resto = valor.slice(prefixo.length);
    var barra = resto.indexOf("/");
    if (barra < 0) return "assets/img/homenageados/" + resto;
    var slug = resto.slice(0, barra);
    return (
      "assets/img/homenageados/" +
      migrarSlug(slug) +
      resto.slice(barra)
    );
  }

  function iniciaisDe(professor) {
    var bruto = String(professor.selo || "").trim();
    if (bruto) return bruto.slice(0, 3).toUpperCase();
    var partes = String(professor.nome || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean);
    return (
      partes
        .slice(0, 2)
        .map(function (parte) {
          return parte.charAt(0);
        })
        .join("")
        .toUpperCase() || "CG"
    );
  }

  function urlRepo(src) {
    var valor = String(src || "").trim();
    if (!valor) return "";
    if (/^(https?:|data:|blob:|\/)/i.test(valor)) return valor;
    if (valor.indexOf("../") === 0) return valor;
    return "../" + valor.replace(/^\.\//, "");
  }

  function urlPreview(src) {
    var valor = String(src || "").trim();
    if (!valor) return "";
    var entrada = imagens.get(valor);
    if (entrada && entrada.url) return entrada.url;
    return urlRepo(valor);
  }

  function normalizarCaminhoImagem(src) {
    var valor = String(src || "").trim();
    if (!valor || /^(https?:|data:|blob:|\/)/i.test(valor)) return valor;
    return valor.replace(/^(\.\.\/)+/, "").replace(/^\.\//, "");
  }

  function svgSelo(professor) {
    var iniciais = iniciaisDe(professor);
    var tamanho = iniciais.length > 2 ? 50 : iniciais.length === 2 ? 62 : 70;
    return (
      '<svg class="seal-mark" viewBox="0 0 200 200" focusable="false" aria-hidden="true">' +
      '<circle class="seal-line" cx="100" cy="100" r="95" stroke-width="1.3"/>' +
      '<circle class="seal-line" cx="100" cy="100" r="86" stroke-width="0.7" stroke-dasharray="1.5 5.5" opacity="0.58"/>' +
      '<circle class="seal-diamond" cx="100" cy="6" r="1.7"/>' +
      '<circle class="seal-diamond" cx="194" cy="100" r="1.7"/>' +
      '<circle class="seal-diamond" cx="100" cy="194" r="1.7"/>' +
      '<circle class="seal-diamond" cx="6" cy="100" r="1.7"/>' +
      '<text class="seal-year" x="100" y="50" text-anchor="middle">2026</text>' +
      '<text x="100" y="126" text-anchor="middle" font-size="' +
      tamanho +
      '" font-weight="360" letter-spacing="-1">' +
      esc(iniciais) +
      "</text>" +
      '<line class="seal-line" x1="69" y1="145" x2="131" y2="145" stroke-width="0.7" opacity="0.45"/>' +
      '<text class="seal-micro" x="100" y="165" text-anchor="middle">TURMA GINGA</text>' +
      "</svg>"
    );
  }

  /* ------------------------------------------------------------------------
     IndexedDB
     ------------------------------------------------------------------------ */
  function abrirDB() {
    return new Promise(function (resolve, reject) {
      if (!("indexedDB" in window)) {
        reject(new Error("IndexedDB indisponível"));
        return;
      }
      var requisicao = window.indexedDB.open(DB_NAME, 1);
      requisicao.onupgradeneeded = function () {
        var banco = requisicao.result;
        if (!banco.objectStoreNames.contains(DB_STORE)) {
          banco.createObjectStore(DB_STORE, { keyPath: "path" });
        }
      };
      requisicao.onsuccess = function () {
        resolve(requisicao.result);
      };
      requisicao.onerror = function () {
        reject(requisicao.error || new Error("Não foi possível abrir o banco"));
      };
    });
  }

  function idbGetAll() {
    return new Promise(function (resolve, reject) {
      if (!db) {
        resolve([]);
        return;
      }
      var tx = db.transaction(DB_STORE, "readonly");
      var req = tx.objectStore(DB_STORE).getAll();
      req.onsuccess = function () {
        resolve(req.result || []);
      };
      req.onerror = function () {
        reject(req.error);
      };
    });
  }

  function idbPut(entrada) {
    return new Promise(function (resolve, reject) {
      if (!db) {
        resolve(false);
        return;
      }
      var tx = db.transaction(DB_STORE, "readwrite");
      var req = tx.objectStore(DB_STORE).put(entrada);
      req.onsuccess = function () {
        resolve(true);
      };
      req.onerror = function () {
        reject(req.error);
      };
    });
  }

  function idbDelete(path) {
    return new Promise(function (resolve) {
      if (!db) {
        resolve(false);
        return;
      }
      var tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).delete(path);
      tx.oncomplete = function () {
        resolve(true);
      };
      tx.onerror = function () {
        resolve(false);
      };
    });
  }

  /* ------------------------------------------------------------------------
     Normalização e rascunho
     ------------------------------------------------------------------------ */
  function paginaPadrao(tipo) {
    if (tipo === "foto") {
      return {
        tipo: "foto",
        titulo: "",
        fotos: [{ src: "", alt: "", legenda: "" }],
      };
    }
    if (tipo === "recados") {
      return {
        tipo: "recados",
        titulo: "Recados",
        recados: [{ autor: "", texto: "" }],
      };
    }
    if (tipo === "citacao") {
      return { tipo: "citacao", texto: "", autor: "" };
    }
    if (tipo === "assinatura") {
      return {
        tipo: "assinatura",
        texto: "Com carinho, Turma Ginga",
        ano: "2026",
      };
    }
    return { tipo: "texto", titulo: "", paragrafos: [""] };
  }

  function normalizarPagina(pagina) {
    if (!pagina || typeof pagina !== "object") return null;
    var tipo = pagina.tipo;
    if (tipo === "texto") {
      var paragrafos = Array.isArray(pagina.paragrafos)
        ? pagina.paragrafos.map(function (p) {
            return String(p == null ? "" : p);
          })
        : [""];
      return {
        tipo: "texto",
        titulo: String(pagina.titulo || ""),
        paragrafos: paragrafos.length ? paragrafos : [""],
      };
    }
    if (tipo === "foto") {
      var fotos = Array.isArray(pagina.fotos)
        ? pagina.fotos.map(function (foto) {
            return {
              src: normalizarCaminhoImagem(foto && foto.src),
              alt: String((foto && foto.alt) || ""),
              legenda: String((foto && foto.legenda) || ""),
            };
          })
        : [];
      return {
        tipo: "foto",
        titulo: String(pagina.titulo || ""),
        fotos: fotos,
      };
    }
    if (tipo === "recados") {
      var recados = Array.isArray(pagina.recados)
        ? pagina.recados.map(function (recado) {
            return {
              autor: String((recado && recado.autor) || ""),
              texto: String((recado && recado.texto) || ""),
            };
          })
        : [];
      return {
        tipo: "recados",
        titulo: String(pagina.titulo || "Recados"),
        recados: recados,
      };
    }
    if (tipo === "citacao") {
      return {
        tipo: "citacao",
        texto: String(pagina.texto || ""),
        autor: String(pagina.autor || ""),
      };
    }
    if (tipo === "assinatura") {
      return {
        tipo: "assinatura",
        texto: String(pagina.texto || "Com carinho, Turma Ginga"),
        ano: String(pagina.ano || "2026"),
      };
    }
    return null;
  }

  function normalizarDados(dados) {
    if (!Array.isArray(dados)) return [];
    return dados
      .filter(function (professor) {
        return professor && typeof professor === "object";
      })
      .map(function (professor) {
        var nome = migrarNome(String(professor.nome || "Sem nome"));
        var normalizado = {
          slug: migrarSlug(
            normalizarSlug(professor.slug || nome || "homenageado")
          ),
          nome: nome,
          disciplina: String(professor.disciplina || ""),
          acento: ACENTOS.indexOf(professor.acento) >= 0 ? professor.acento : "seal",
          paginas: Array.isArray(professor.paginas)
            ? professor.paginas.map(normalizarPagina).filter(Boolean)
            : [],
        };
        normalizado.paginas.forEach(function (pagina) {
          if (pagina.tipo !== "foto") return;
          (pagina.fotos || []).forEach(function (foto) {
            foto.src = migrarCaminhoImagem(foto.src);
          });
        });
        /* O selo é legado: cartões antigos mantêm as iniciais, mas novos
           cartões derivam as iniciais do nome. Não grave selo vazio. */
        var selo = String(professor.selo || "").trim();
        if (selo) normalizado.selo = selo;
        return normalizado;
      });
  }

  function carregarRascunho() {
    try {
      var bruto = window.localStorage.getItem(STORAGE_KEY);
      if (!bruto) return null;
      var objeto = JSON.parse(bruto);
      var dados = Array.isArray(objeto) ? objeto : objeto && objeto.dados;
      if (!Array.isArray(dados) || !dados.length) return null;
      return normalizarDados(dados);
    } catch (erro) {
      return null;
    }
  }

  function agendarSalvar() {
    window.clearTimeout(salvarTimer);
    salvarTimer = window.setTimeout(function () {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ versao: 1, dados: estado.dados })
        );
        anunciar("Rascunho salvo às " + agora(), "ok");
      } catch (erro) {
        anunciar(
          "Não foi possível salvar o rascunho neste navegador. Baixe o ZIP para não perder o trabalho.",
          "erro"
        );
      }
    }, 350);
  }

  function atual() {
    return estado.dados[estado.selecionado] || null;
  }

  /* ------------------------------------------------------------------------
     Carga inicial
     ------------------------------------------------------------------------ */
  async function iniciar() {
    var rascunho = carregarRascunho();
    var base = Array.isArray(window.DADOS) ? normalizarDados(window.DADOS) : [];
    estado.dados = rascunho && rascunho.length ? rascunho : base;

    try {
      db = await abrirDB();
      var entradas = await idbGetAll();
      entradas.forEach(function (entrada) {
        if (!entrada || !entrada.path || !entrada.blob) return;
        var caminho = entrada.path;
        var caminhoNovo = migrarCaminhoImagem(caminho);
        var dados = {
          blob: entrada.blob,
          url: URL.createObjectURL(entrada.blob),
          width: entrada.width || 0,
          height: entrada.height || 0,
          bytes: entrada.bytes || entrada.blob.size || 0,
          type: entrada.type || entrada.blob.type || "image/webp",
        };
        imagens.set(caminhoNovo, dados);
        if (caminhoNovo === caminho) return;
        idbPut({
          path: caminhoNovo,
          blob: dados.blob,
          width: dados.width,
          height: dados.height,
          bytes: dados.bytes,
          type: dados.type,
        })
          .then(function () {
            return idbDelete(caminho);
          })
          .catch(function () {
            /* A sessão segue com o blob em memória. */
          });
      });
    } catch (erro) {
      anunciar(
        "IndexedDB indisponível: as imagens desta sessão ainda podem ser exportadas, mas não serão restauradas ao recarregar.",
        "erro"
      );
    }

    if (!estado.dados.length) {
      estado.dados = [];
    }
    estado.selecionado = 0;
    renderizarTudo();
    ligarEventosGlobais();
    if (window.ResizeObserver) {
      escalaObserver = new ResizeObserver(function () {
        ajustarEscalaPreview();
      });
      var stage = $("[data-preview]");
      if (stage) escalaObserver.observe(stage);
    }
  }

  function renderizarTudo() {
    renderizarLista();
    renderizarFormulario();
    renderizarPreview();
    var contador = $("[data-prof-count]");
    if (contador) contador.textContent = String(estado.dados.length);
    var vazio = $("[data-empty]");
    var wrap = $("[data-form-wrap]");
    var tem = !!atual();
    if (vazio) vazio.hidden = tem;
    if (wrap) wrap.hidden = !tem;
  }

  /* ------------------------------------------------------------------------
     Lista de homenageados
     ------------------------------------------------------------------------ */
  function renderizarLista() {
    var lista = $("[data-prof-list]");
    if (!lista) return;
    lista.innerHTML = estado.dados
      .map(function (professor, indice) {
        var nome = professor.nome || "Sem nome";
        return (
          '<li class="prof-row"><button class="prof-item" type="button" data-prof-index="' +
          indice +
          '" aria-current="' +
          (indice === estado.selecionado ? "true" : "false") +
          '">' +
          '<span class="prof-item__seal acento-' +
          esc(professor.acento) +
          '">' +
          esc(iniciaisDe(professor)) +
          "</span>" +
          '<span class="prof-item__text"><span class="prof-item__name">' +
          esc(nome) +
          '</span><span class="prof-item__slug">' +
          esc(professor.slug) +
          "</span></span></button>" +
          '<button class="prof-item__remove" type="button" data-remove-index="' +
          indice +
          '" aria-label="Remover ' +
          esc(nome) +
          ' da lista" title="Remover da lista">×</button></li>'
        );
      })
      .join("");
  }

  function atualizarItemLista() {
    var professor = atual();
    if (!professor) return;
    var item = $('[data-prof-index="' + estado.selecionado + '"]');
    if (!item) return;
    var nome = $(".prof-item__name", item);
    var slug = $(".prof-item__slug", item);
    var selo = $(".prof-item__seal", item);
    if (nome) nome.textContent = professor.nome || "Sem nome";
    if (slug) slug.textContent = professor.slug;
    if (selo) {
      selo.textContent = iniciaisDe(professor);
      selo.className = "prof-item__seal acento-" + professor.acento;
    }
    var remover = item.parentNode
      ? $(".prof-item__remove", item.parentNode)
      : null;
    if (remover) {
      remover.setAttribute(
        "aria-label",
        "Remover " + (professor.nome || "este cartão") + " da lista"
      );
    }
  }

  function atualizarSeloPainel() {
    var professor = atual();
    if (!professor) return;
    var alvo = $(".panel__seal");
    if (!alvo) return;
    alvo.setAttribute("data-acento", professor.acento);
    alvo.innerHTML = svgSelo(professor);
  }

  function selecionar(indice) {
    if (indice < 0 || indice >= estado.dados.length) return;
    estado.selecionado = indice;
    renderizarTudo();
    var form = $("#editor-form");
    if (form && window.matchMedia("(max-width: 800px)").matches) {
      form.scrollIntoView({ block: "start" });
    }
  }

  /* ------------------------------------------------------------------------
     Formulário
     ------------------------------------------------------------------------ */
  function renderizarFormulario() {
    var wrap = $("[data-form-wrap]");
    if (!wrap) return;
    var professor = atual();
    if (!professor) {
      wrap.innerHTML = "";
      return;
    }
    wrap.innerHTML =
      painelEnvelope(professor) +
      painelPublicacao(professor) +
      painelPaginas(professor);
    ligarFalhasImagensForm();
  }

  function painelEnvelope(professor) {
    return (
      '<section class="panel">' +
      '<div class="panel__head"><div><h2>Envelope</h2><p>Nome do homenageado. O acento e o selo tipográfico são automáticos; os três selos postais do envelope e o carimbo de cera são fixos.</p></div><div class="panel__seal" data-acento="' +
      esc(professor.acento) +
      '" aria-hidden="true">' +
      svgSelo(professor) +
      "</div></div>" +
      '<div class="panel__body"><label class="field"><span>Nome</span><input type="text" data-meta="nome" value="' +
      esc(professor.nome) +
      '"></label></div></section>'
    );
  }

  function painelPublicacao(professor) {
    return (
      '<section class="panel">' +
      '<div class="panel__head"><div><h2>Publicação</h2><p>O endereço do cartão e a disciplina. Nada aqui aparece no envelope.</p></div></div>' +
      '<div class="panel__body"><div class="field-grid">' +
      '<label class="field"><span>Slug (endereço)</span><input type="text" data-meta="slug" value="' +
      esc(professor.slug) +
      '" spellcheck="false" autocapitalize="off"><small>carta/<strong>' +
      esc(professor.slug) +
      "</strong>/ · use apenas letras minúsculas, números e hífens</small></label>" +
      '<label class="field"><span>Disciplina</span><input type="text" data-meta="disciplina" value="' +
      esc(professor.disciplina) +
      '"><small>Fica nos dados do cartão; não entra no envelope.</small></label>' +
      "</div></div>" +
      '<div class="panel__foot"><p>O link publicado usa o slug. Se mudar o slug, renomeie também a pasta <code>carta/<slug>/</code> e as meta tags.</p><button class="btn btn--small btn--danger" type="button" data-remove-homenageado>Remover cartão</button></div>' +
      "</section>"
    );
  }

  function painelPaginas(professor) {
    var paginas = Array.isArray(professor.paginas) ? professor.paginas : [];
    return (
      '<section class="panel">' +
      '<div class="panel__head"><div><h2>Páginas internas</h2><p>O envelope não entra aqui. Textos longos demais podem não caber no cartão; divida em mais páginas.</p></div>' +
      '<div class="pages-toolbar"><select data-add-page-type aria-label="Tipo de nova página">' +
      '<option value="texto">Texto</option>' +
      '<option value="foto">Foto</option>' +
      '<option value="recados">Recados</option>' +
      '<option value="citacao">Citação</option>' +
      '<option value="assinatura">Assinatura</option>' +
      "</select>" +
      '<button class="btn btn--small" type="button" data-add-page>Adicionar página</button></div>' +
      "</div>" +
      '<div class="panel__body"><div class="pages-list">' +
      (paginas.length
        ? paginas
            .map(function (pagina, indice) {
              return blocoPagina(pagina, indice, paginas.length);
            })
            .join("")
        : '<p class="field-list-empty">Nenhuma página interna. A carta terá só o envelope e uma assinatura padrão no site.</p>') +
      "</div></div></section>"
    );
  }

  function blocoPagina(pagina, indice, total) {
    var rotulos = {
      texto: "Texto",
      foto: "Foto",
      recados: "Recados",
      citacao: "Citação",
      assinatura: "Assinatura",
    };
    var sub = pagina.titulo || "";
    if (pagina.tipo === "texto") sub = (pagina.paragrafos || []).join(" ");
    if (pagina.tipo === "foto") sub = (pagina.fotos || []).length + " foto(s)";
    if (pagina.tipo === "recados") sub = (pagina.recados || []).length + " recado(s)";
    if (pagina.tipo === "assinatura") sub = pagina.texto || "";
    return (
      '<article class="page-block" data-page-block="' +
      indice +
      '">' +
      '<header class="page-block__head"><div class="page-block__title"><span class="page-block__num">' +
      (indice + 1) +
      '</span><span class="page-block__type">' +
      esc(rotulos[pagina.tipo] || pagina.tipo) +
      '</span><span class="page-block__sub">' +
      esc((sub || "").slice(0, 70)) +
      "</span></div>" +
      '<div class="page-block__actions">' +
      botaoIcone("subir", indice, "Mover página para cima", indice === 0, "↑") +
      botaoIcone("descer", indice, "Mover página para baixo", indice === total - 1, "↓") +
      botaoIcone("duplicar", indice, "Duplicar página", false, "⧉") +
      botaoIcone("remover", indice, "Remover página", false, "×") +
      "</div></header>" +
      '<div class="page-block__body">' +
      camposPagina(pagina, indice) +
      "</div></article>"
    );
  }

  function botaoIcone(acao, indice, rotulo, desabilitado, simbolo) {
    return (
      '<button class="icon-action" type="button" data-acao="' +
      acao +
      '" data-page="' +
      indice +
      '" aria-label="' +
      rotulo +
      '" title="' +
      rotulo +
      '"' +
      (desabilitado ? " disabled" : "") +
      ">" +
      esc(simbolo) +
      "</button>"
    );
  }

  function camposPagina(pagina, indice) {
    if (pagina.tipo === "texto") {
      var texto = (pagina.paragrafos || []).join("\n\n");
      var contagem = texto.length;
      return (
        '<label class="field"><span>Título (opcional)</span><input type="text" data-page="' +
        indice +
        '" data-campo="titulo" value="' +
        esc(pagina.titulo || "") +
        '"></label>' +
        '<label class="field"><span>Parágrafos</span><textarea data-page="' +
        indice +
        '" data-campo="paragrafos" rows="7" placeholder="Separe os parágrafos com uma linha em branco.">' +
        esc(texto) +
        '</textarea><small>Separe parágrafos com uma linha em branco. No desktop, o cartão fica melhor com até ~600 caracteres; no celular, até ~400. Textos maiores devem ser divididos em mais páginas.</small><span class="char-count' +
        (contagem > LIMITE_TEXTO ? " is-over" : "") +
        '" data-contador="' +
        indice +
        '">' +
        esc(textoContagem(contagem)) +
        "</span></label>"
      );
    }
    if (pagina.tipo === "foto") {
      var fotos = (pagina.fotos || [])
        .map(function (foto, fotoIndice) {
          return (
            '<div class="subcard"><div class="subcard__head"><strong>Foto ' +
            (fotoIndice + 1) +
            '</strong><div class="subcard__actions"><button class="icon-action" type="button" data-acao="remove-foto" data-page="' +
            indice +
            '" data-photo="' +
            fotoIndice +
            '" aria-label="Remover foto" title="Remover foto">×</button></div></div>' +
            uploaderHTML({
              src: foto.src,
              page: indice,
              photo: fotoIndice,
            }) +
            '<div class="field-grid" style="margin-top:12px">' +
            '<label class="field"><span>Texto alternativo</span><input type="text" data-page="' +
            indice +
            '" data-photo="' +
            fotoIndice +
            '" data-campo="alt" value="' +
            esc(foto.alt || "") +
            '"></label>' +
            '<label class="field"><span>Legenda</span><input type="text" data-page="' +
            indice +
            '" data-photo="' +
            fotoIndice +
            '" data-campo="legenda" value="' +
            esc(foto.legenda || "") +
            '"></label></div></div>'
          );
        })
        .join("");
      return (
        '<label class="field"><span>Título (opcional)</span><input type="text" data-page="' +
        indice +
        '" data-campo="titulo" value="' +
        esc(pagina.titulo || "") +
        '"></label>' +
        '<div class="page-list">' +
        (fotos || '<p class="field-list-empty">Nenhuma foto nesta página.</p>') +
        "</div>" +
        ((pagina.fotos || []).length < 3
          ? '<button class="btn btn--small btn--quiet" type="button" data-acao="add-foto" data-page="' +
            indice +
            '">Adicionar foto</button>'
          : '<p class="field-hint">Máximo de 3 fotos por página.</p>')
      );
    }
    if (pagina.tipo === "recados") {
      var recados = (pagina.recados || [])
        .map(function (recado, recadoIndice) {
          return (
            '<div class="subcard"><div class="subcard__head"><strong>Recado ' +
            (recadoIndice + 1) +
            '</strong><div class="subcard__actions"><button class="icon-action" type="button" data-acao="remove-recado" data-page="' +
            indice +
            '" data-recado="' +
            recadoIndice +
            '" aria-label="Remover recado" title="Remover recado">×</button></div></div>' +
            '<div class="field-grid">' +
            '<label class="field"><span>Autor</span><input type="text" data-page="' +
            indice +
            '" data-recado="' +
            recadoIndice +
            '" data-campo="autor" value="' +
            esc(recado.autor || "") +
            '"></label>' +
            '<label class="field field--full"><span>Mensagem</span><textarea data-page="' +
            indice +
            '" data-recado="' +
            recadoIndice +
            '" data-campo="texto" rows="3">' +
            esc(recado.texto || "") +
            "</textarea></label></div></div>"
          );
        })
        .join("");
      return (
        '<label class="field"><span>Título</span><input type="text" data-page="' +
        indice +
        '" data-campo="titulo" value="' +
        esc(pagina.titulo || "Recados") +
        '"></label>' +
        '<div class="page-list">' +
        (recados || '<p class="field-list-empty">Nenhum recado nesta página.</p>') +
        "</div>" +
        '<button class="btn btn--small btn--quiet" type="button" data-acao="add-recado" data-page="' +
        indice +
        '">Adicionar recado</button>'
      );
    }
    if (pagina.tipo === "citacao") {
      return (
        '<label class="field"><span>Trecho</span><textarea data-page="' +
        indice +
        '" data-campo="texto" rows="4">' +
        esc(pagina.texto || "") +
        "</textarea></label>" +
        '<label class="field"><span>Autor (opcional)</span><input type="text" data-page="' +
        indice +
        '" data-campo="autor" value="' +
        esc(pagina.autor || "") +
        '"></label>'
      );
    }
    return (
      '<label class="field"><span>Fechamento</span><input type="text" data-page="' +
      indice +
      '" data-campo="texto" value="' +
      esc(pagina.texto || "") +
      '"><small>Ex.: “Com carinho, Turma Ginga”.</small></label>' +
      '<label class="field"><span>Ano</span><input type="text" data-page="' +
      indice +
      '" data-campo="ano" value="' +
      esc(pagina.ano || "2026") +
      '"></label>'
    );
  }

  function placeholderImagemHTML() {
    return (
      '<span class="image-upload__empty" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" focusable="false">' +
      '<rect x="3.5" y="5" width="17" height="14" rx="1.5" fill="none" stroke="currentColor" stroke-width="1"/>' +
      '<path d="m5.5 16 4-4 3 3 3.5-3.5 3 3" fill="none" stroke="currentColor" stroke-width="1"/>' +
      '<circle cx="9" cy="9" r="1.2" fill="currentColor"/>' +
      "</svg></span>"
    );
  }

  function uploaderHTML(opcoes) {
    var src = String(opcoes.src || "").trim();
    var entrada = src ? imagens.get(src) : null;
    var resolvida = src ? urlPreview(src) : "";
    var meta = "";
    if (entrada && entrada.width && entrada.height) {
      meta =
        entrada.width +
        " × " +
        entrada.height +
        " px · " +
        formatarBytes(entrada.bytes) +
        " · " +
        (entrada.type === "image/jpeg" ? "JPEG" : "WebP");
    } else if (src) {
      meta = "Arquivo atual do repositório: " + src;
    } else {
      meta = "Sem imagem. No site, a página mostra um espaço reservado.";
    }
    var avisos = "";
    if (entrada && entrada.width && entrada.height) {
      var lados = Math.max(entrada.width || 0, entrada.height || 0);
      if (lados && lados < MIN_LADO) {
        avisos +=
          '<p class="image-upload__warn">A imagem tem ' +
          lados +
          " px no maior lado; o ideal é pelo menos " +
          MIN_LADO +
          " px.</p>";
      }
      if (entrada.bytes > LIMITE_PESO) {
        avisos +=
          '<p class="image-upload__warn">O arquivo final passou de 500 KB. Considere uma imagem menor.</p>';
      }
    }
    return (
      '<div class="image-upload" data-upload-zone' +
      (opcoes.page != null ? ' data-page="' + opcoes.page + '"' : "") +
      (opcoes.photo != null ? ' data-photo="' + opcoes.photo + '"' : "") +
      ">" +
      '<div class="image-upload__preview">' +
      (resolvida
        ? '<img src="' +
          esc(resolvida) +
          '" alt="" loading="lazy" data-preview-img>'
        : placeholderImagemHTML()) +
      "</div>" +
      '<div class="image-upload__body"><div class="image-upload__actions">' +
      '<button class="btn btn--small" type="button" data-escolher>Escolher imagem</button>' +
      (src
        ? '<button class="btn btn--small btn--quiet btn--danger" type="button" data-remover-imagem>Remover</button>'
        : "") +
      '<input class="image-upload__input" type="file" accept="image/*" data-file-input>' +
      "</div>" +
      '<p class="image-upload__meta">' +
      esc(meta) +
      "</p>" +
      avisos +
      "</div></div>"
    );
  }

  function ligarFalhasImagensForm() {
    $$(".image-upload__preview img", $("[data-form-wrap]")).forEach(function (img) {
      img.addEventListener("error", function () {
        var caixa = img.parentNode;
        if (!caixa) return;
        img.remove();
        if (!caixa.querySelector(".image-upload__empty")) {
          caixa.insertAdjacentHTML("beforeend", placeholderImagemHTML());
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     Eventos do formulário
     ------------------------------------------------------------------------ */
  function ligarEventosGlobais() {
    document.addEventListener("click", function (evento) {
      var removerItem = evento.target.closest("[data-remove-index]");
      if (removerItem) {
        removerHomenageado(Number(removerItem.getAttribute("data-remove-index")));
        return;
      }

      var botaoLista = evento.target.closest("[data-prof-index]");
      if (botaoLista) {
        selecionar(Number(botaoLista.getAttribute("data-prof-index")));
        return;
      }

      var importar = evento.target.closest("[data-import-trigger]");
      if (importar) {
        var inputImport = $("[data-import-input]");
        if (inputImport) inputImport.click();
        return;
      }

      if (evento.target.closest("[data-download-js]")) {
        baixarDadosJs();
        return;
      }

      if (evento.target.closest("[data-download-zip]")) {
        baixarZip();
        return;
      }

      if (evento.target.closest("[data-add-homenageado]")) {
        adicionarHomenageado();
        return;
      }

      if (evento.target.closest("[data-remove-homenageado]")) {
        removerHomenageado();
        return;
      }

      if (evento.target.closest("[data-add-page]")) {
        adicionarPagina();
        return;
      }

      var escolher = evento.target.closest("[data-escolher]");
      if (escolher) {
        var zona = escolher.closest("[data-upload-zone]");
        var input = zona ? $("[data-file-input]", zona) : null;
        if (input) input.click();
        return;
      }

      var removerImagem = evento.target.closest("[data-remover-imagem]");
      if (removerImagem) {
        removerImagemDoCampo(removerImagem.closest("[data-upload-zone]"));
        return;
      }

      var acao = evento.target.closest("[data-acao]");
      if (acao) {
        executarAcao(acao);
      }
    });

    document.addEventListener("input", function (evento) {
      var alvo = evento.target;
      if (!alvo.closest(".editor-form")) return;

      if (alvo.matches("[data-meta]")) {
        atualizarMeta(alvo);
        return;
      }
      if (alvo.matches("[data-page]")) {
        atualizarCampoPagina(alvo);
      }
    });

    document.addEventListener("change", function (evento) {
      var alvo = evento.target;
      if (alvo.matches("[data-import-input]")) {
        if (alvo.files && alvo.files[0]) importarArquivo(alvo.files[0]);
        alvo.value = "";
        return;
      }
      if (alvo.matches("[data-file-input]")) {
        var zona = alvo.closest("[data-upload-zone]");
        if (zona && alvo.files && alvo.files[0]) {
          processarUpload(alvo.files[0], zona);
        }
        alvo.value = "";
        return;
      }
      if (alvo.matches('[data-meta="slug"]')) {
        mudarSlug(alvo);
      }
    });

    document.addEventListener("dragover", function (evento) {
      var zona = evento.target.closest("[data-upload-zone]");
      if (!zona) return;
      evento.preventDefault();
      zona.classList.add("is-dragging");
    });

    document.addEventListener("dragleave", function (evento) {
      var zona = evento.target.closest("[data-upload-zone]");
      if (!zona) return;
      zona.classList.remove("is-dragging");
    });

    document.addEventListener("drop", function (evento) {
      var zona = evento.target.closest("[data-upload-zone]");
      if (!zona) return;
      evento.preventDefault();
      zona.classList.remove("is-dragging");
      var arquivo =
        evento.dataTransfer &&
        evento.dataTransfer.files &&
        evento.dataTransfer.files[0];
      if (arquivo) processarUpload(arquivo, zona);
    });

    window.addEventListener("resize", ajustarEscalaPreview);
  }

  function atualizarMeta(input) {
    var professor = atual();
    if (!professor) return;
    var campo = input.getAttribute("data-meta");
    /* O slug só é aplicado no blur/change, quando já dá para normalizar,
       validar duplicidade e reescrever os caminhos das imagens. */
    if (campo === "slug") return;
    professor[campo] = input.value;
    if (campo === "nome") {
      /* As iniciais agora são automáticas: editar o nome descarta o selo
         legado para não deixar “P1” em um cartão renomeado. */
      delete professor.selo;
      atualizarItemLista();
      atualizarSeloPainel();
    }
    agendarPreview();
    agendarSalvar();
  }

  function atualizarCampoPagina(input) {
    var professor = atual();
    if (!professor) return;
    var indice = Number(input.getAttribute("data-page"));
    var pagina = professor.paginas[indice];
    if (!pagina) return;
    var campo = input.getAttribute("data-campo");
    var valor = input.value;

    var fotoIndice = input.getAttribute("data-photo");
    var recadoIndice = input.getAttribute("data-recado");

    if (fotoIndice != null) {
      var foto = pagina.fotos && pagina.fotos[Number(fotoIndice)];
      if (!foto) return;
      foto[campo] = valor;
    } else if (recadoIndice != null) {
      var recado = pagina.recados && pagina.recados[Number(recadoIndice)];
      if (!recado) return;
      recado[campo] = valor;
    } else if (campo === "paragrafos") {
      pagina.paragrafos = valor
        .split(/\n\s*\n/)
        .map(function (p) {
          return p.trim();
        })
        .filter(function (p) {
          return p.length > 0;
        });
      if (!pagina.paragrafos.length) pagina.paragrafos = [""];
      var contador = $('[data-contador="' + indice + '"]');
      if (contador) {
        var total = pagina.paragrafos.join(" ").length;
        contador.textContent = textoContagem(total);
        contador.classList.toggle("is-over", total > LIMITE_TEXTO);
      }
    } else {
      pagina[campo] = valor;
    }

    var sub = $(
      '[data-page-block="' + indice + '"] .page-block__sub'
    );
    if (sub) {
      var resumo =
        campo === "titulo" || campo === "texto" || campo === "alt" || campo === "legenda"
          ? valor
          : sub.textContent;
      sub.textContent = resumo.slice(0, 70);
    }
    agendarPreview();
    agendarSalvar();
  }

  function agendarPreview() {
    window.clearTimeout(previewTimer);
    previewTimer = window.setTimeout(renderizarPreview, 160);
  }

  function executarAcao(botao) {
    var professor = atual();
    if (!professor) return;
    var acao = botao.getAttribute("data-acao");
    var indice = Number(botao.getAttribute("data-page"));
    var pagina = professor.paginas[indice];
    if (!pagina) return;

    if (acao === "subir" && indice > 0) {
      professor.paginas.splice(indice - 1, 0, professor.paginas.splice(indice, 1)[0]);
    } else if (acao === "descer" && indice < professor.paginas.length - 1) {
      professor.paginas.splice(indice + 1, 0, professor.paginas.splice(indice, 1)[0]);
    } else if (acao === "duplicar") {
      professor.paginas.splice(indice + 1, 0, clone(pagina));
    } else if (acao === "remover") {
      if (
        !window.confirm(
          "Remover a página " + (indice + 1) + " (“" + (pagina.titulo || pagina.tipo) + "”)?"
        )
      )
        return;
      professor.paginas.splice(indice, 1);
    } else if (acao === "add-foto") {
      if (!Array.isArray(pagina.fotos)) pagina.fotos = [];
      if (pagina.fotos.length >= 3) return;
      pagina.fotos.push({ src: "", alt: "", legenda: "" });
    } else if (acao === "remove-foto") {
      var fotoIndice = Number(botao.getAttribute("data-photo"));
      pagina.fotos.splice(fotoIndice, 1);
    } else if (acao === "add-recado") {
      if (!Array.isArray(pagina.recados)) pagina.recados = [];
      pagina.recados.push({ autor: "", texto: "" });
    } else if (acao === "remove-recado") {
      var recadoIndice = Number(botao.getAttribute("data-recado"));
      pagina.recados.splice(recadoIndice, 1);
    } else {
      return;
    }

    renderizarFormulario();
    renderizarPreview();
    agendarSalvar();
  }

  function adicionarPagina() {
    var professor = atual();
    if (!professor) return;
    var seletor = $("[data-add-page-type]");
    var tipo = seletor ? seletor.value : "texto";
    professor.paginas.push(paginaPadrao(tipo));
    renderizarFormulario();
    renderizarPreview();
    agendarSalvar();
    var blocos = $$(".page-block");
    var ultimo = blocos[blocos.length - 1];
    if (ultimo) ultimo.scrollIntoView({ block: "nearest", behavior: "smooth" });
    anunciar("Página adicionada.", "ok");
  }

  function adicionarHomenageado() {
    var usados = {};
    estado.dados.forEach(function (p) {
      usados[p.slug] = true;
    });
    var numero = 1;
    while (usados["homenageado-" + String(numero).padStart(2, "0")]) numero += 1;
    var slug = "homenageado-" + String(numero).padStart(2, "0");
    var novo = {
      slug: slug,
      nome: "Novo homenageado",
      disciplina: "Disciplina",
      acento: ACENTOS[numero % ACENTOS.length],
      paginas: [
        paginaPadrao("texto"),
        paginaPadrao("assinatura"),
      ],
    };
    estado.dados.push(novo);
    estado.selecionado = estado.dados.length - 1;
    renderizarTudo();
    agendarSalvar();
    anunciar(
      "Homenageado adicionado. Para publicar, crie carta/" +
        slug +
        "/index.html copiando um shell e ajuste data-homenageado e as meta tags.",
      "ok"
    );
  }

  function removerHomenageado(indice) {
    var alvoIndice = indice == null ? estado.selecionado : indice;
    var professor = estado.dados[alvoIndice];
    if (!professor) return;
    if (
      !window.confirm(
        "Remover “" +
          professor.nome +
          "” deste rascunho? A pasta carta/" +
          professor.slug +
          "/ não será apagada do repositório."
      )
    )
      return;
    estado.dados.splice(alvoIndice, 1);
    if (!estado.dados.length) {
      estado.selecionado = 0;
    } else if (alvoIndice < estado.selecionado) {
      estado.selecionado -= 1;
    } else if (alvoIndice === estado.selecionado) {
      estado.selecionado = Math.min(alvoIndice, estado.dados.length - 1);
    }
    renderizarTudo();
    agendarSalvar();
    anunciar("Homenageado removido do rascunho. O shell HTML permanece no repositório.", "ok");
  }

  function mudarSlug(input) {
    var professor = atual();
    if (!professor) return;
    var antigo = professor.slug;
    var novo = normalizarSlug(input.value);
    if (!novo) {
      input.value = antigo;
      anunciar("O slug não pode ficar vazio.", "erro");
      return;
    }
    var conflito = estado.dados.some(function (p, indice) {
      return indice !== estado.selecionado && p.slug === novo;
    });
    if (conflito) {
      input.value = antigo;
      anunciar("Já existe outro cartão com este slug.", "erro");
      return;
    }
    if (novo === antigo) {
      input.value = antigo;
      return;
    }
    var caminhosAntigos = caminhosDeImagens(professor);
    professor.slug = novo;
    professor.paginas.forEach(function (pagina) {
      if (pagina.tipo === "foto" && Array.isArray(pagina.fotos)) {
        pagina.fotos.forEach(function (foto) {
          foto.src = reescreverCaminho(foto.src, antigo, novo);
        });
      }
    });
    renomearImagens(antigo, novo, caminhosAntigos).then(function () {
      renderizarLista();
      renderizarFormulario();
      renderizarPreview();
      agendarSalvar();
      anunciar(
        "Slug atualizado. Renomeie a pasta carta/" +
          novo +
          "/ e as meta tags no HTML antes de publicar.",
        "ok"
      );
    });
  }

  function reescreverCaminho(caminho, antigo, novo) {
    var valor = String(caminho || "");
    var prefixo = "assets/img/homenageados/" + antigo + "/";
    if (valor.indexOf(prefixo) === 0) {
      return "assets/img/homenageados/" + novo + "/" + valor.slice(prefixo.length);
    }
    return valor;
  }

  function caminhosDeImagens(professor) {
    var caminhos = new Set();
    (professor.paginas || []).forEach(function (pagina) {
      if (pagina.tipo === "foto") {
        (pagina.fotos || []).forEach(function (foto) {
          if (foto && foto.src) caminhos.add(foto.src);
        });
      }
    });
    return Array.from(caminhos);
  }

  async function renomearImagens(antigo, novo, caminhosAntigos) {
    var prefixo = "assets/img/homenageados/" + antigo + "/";
    var caminhos = Array.from(
      new Set(
        (caminhosAntigos || []).concat(
          Array.from(imagens.keys()).filter(function (caminho) {
            return caminho.indexOf(prefixo) === 0;
          })
        )
      )
    );
    for (var i = 0; i < caminhos.length; i += 1) {
      var caminhoAntigo = caminhos[i];
      if (caminhoAntigo.indexOf(prefixo) !== 0) continue;
      var caminhoNovo =
        "assets/img/homenageados/" + novo + "/" + caminhoAntigo.slice(prefixo.length);
      var dados = imagens.get(caminhoAntigo);
      if (!dados) {
        /* Imagem que já estava no repositório: busca antes de mudar o slug,
           para que a prévia e o ZIP continuem com a imagem certa. */
        try {
          var resposta = await fetch(urlRepo(caminhoAntigo));
          if (resposta.ok) {
            var blob = await resposta.blob();
            dados = {
              blob: blob,
              url: URL.createObjectURL(blob),
              width: 0,
              height: 0,
              bytes: blob.size,
              type: blob.type,
            };
          }
        } catch (erro) {
          /* Sem acesso ao arquivo antigo (file:// ou arquivo ausente). */
        }
      }
      if (!dados) continue;
      imagens.delete(caminhoAntigo);
      imagens.set(caminhoNovo, dados);
      try {
        await idbPut({
          path: caminhoNovo,
          blob: dados.blob,
          width: dados.width,
          height: dados.height,
          bytes: dados.bytes,
          type: dados.type,
        });
        await idbDelete(caminhoAntigo);
      } catch (erro) {
        /* A sessão segue com o blob em memória. */
      }
    }
  }

  function removerImagemDoCampo(zona) {
    if (!zona) return;
    var professor = atual();
    if (!professor) return;
    var indice = Number(zona.getAttribute("data-page"));
    var fotoIndice = Number(zona.getAttribute("data-photo"));
    var pagina = professor.paginas[indice];
    if (pagina && pagina.fotos && pagina.fotos[fotoIndice]) {
      pagina.fotos[fotoIndice].src = "";
    }
    renderizarFormulario();
    renderizarPreview();
    agendarSalvar();
    anunciar("Imagem removida do cartão. O arquivo antigo pode continuar no repositório.", "ok");
  }

  /* ------------------------------------------------------------------------
     Upload e redimensionamento
     ------------------------------------------------------------------------ */
  function carregarImagem(arquivo) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(arquivo);
      var img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("Não foi possível ler a imagem."));
      };
      img.src = url;
    });
  }

  function paraBlob(canvas, tipo, qualidade) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(
        function (blob) {
          if (blob) resolve(blob);
          else reject(new Error("Não foi possível converter a imagem."));
        },
        tipo,
        qualidade
      );
    });
  }

  async function redimensionarImagem(arquivo) {
    var img = await carregarImagem(arquivo);
    var larguraOriginal = img.naturalWidth || img.width;
    var alturaOriginal = img.naturalHeight || img.height;
    if (!larguraOriginal || !alturaOriginal) {
      throw new Error("A imagem não tem dimensões válidas.");
    }
    var escala = Math.min(1, MAX_IMAGEM / Math.max(larguraOriginal, alturaOriginal));
    var largura = Math.max(1, Math.round(larguraOriginal * escala));
    var altura = Math.max(1, Math.round(alturaOriginal * escala));
    var canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;
    var ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas indisponível neste navegador.");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, largura, altura);

    var blob = await paraBlob(canvas, "image/webp", 0.82);
    var tipo = blob.type;
    if (tipo !== "image/webp") {
      /* Fallback JPEG: pinta o fundo para não virar preto com transparência. */
      var canvasJpeg = document.createElement("canvas");
      canvasJpeg.width = largura;
      canvasJpeg.height = altura;
      var ctxJpeg = canvasJpeg.getContext("2d");
      ctxJpeg.fillStyle = "#FAF7F0";
      ctxJpeg.fillRect(0, 0, largura, altura);
      ctxJpeg.drawImage(canvas, 0, 0);
      blob = await paraBlob(canvasJpeg, "image/jpeg", 0.86);
      tipo = blob.type;
    }
    var ext = tipo === "image/jpeg" ? "jpg" : "webp";
    return {
      blob: blob,
      width: largura,
      height: altura,
      widthOriginal: larguraOriginal,
      heightOriginal: alturaOriginal,
      type: tipo,
      ext: ext,
    };
  }

  async function processarUpload(arquivo, zona) {
    if (!arquivo || !/^image\//i.test(arquivo.type)) {
      anunciar("Escolha um arquivo de imagem.", "erro");
      return;
    }
    var professor = atual();
    if (!professor) return;
    var pageIndice =
      zona.getAttribute("data-page") != null
        ? Number(zona.getAttribute("data-page"))
        : null;
    var photoIndice =
      zona.getAttribute("data-photo") != null
        ? Number(zona.getAttribute("data-photo"))
        : null;

    zona.classList.add("is-busy");
    anunciar("Preparando imagem…", "ok");

    try {
      var resultado = await redimensionarImagem(arquivo);
      var pagina = professor.paginas[pageIndice];
      var foto = pagina && pagina.fotos && pagina.fotos[photoIndice];
      var caminhoAtual = foto ? String(foto.src || "") : "";
      var caminho;
      if (
        caminhoAtual.indexOf("assets/img/homenageados/") === 0 &&
        !/\.svg$/i.test(caminhoAtual)
      ) {
        caminho = caminhoAtual.replace(/\.[a-z0-9]+$/i, "") + "." + resultado.ext;
      } else {
        caminho =
          "assets/img/homenageados/" +
          professor.slug +
          "/foto-" +
          Date.now().toString(36).slice(-6) +
          "." +
          resultado.ext;
      }

      var existente = imagens.get(caminho);
      if (existente && existente.url) URL.revokeObjectURL(existente.url);
      var entrada = {
        blob: resultado.blob,
        url: URL.createObjectURL(resultado.blob),
        width: resultado.width,
        height: resultado.height,
        bytes: resultado.blob.size,
        type: resultado.type,
      };
      imagens.set(caminho, entrada);
      try {
        await idbPut({
          path: caminho,
          blob: resultado.blob,
          width: resultado.width,
          height: resultado.height,
          bytes: resultado.blob.size,
          type: resultado.type,
        });
      } catch (erro) {
        anunciar(
          "Imagem pronta, mas não foi possível guardá-la no IndexedDB. Exporte o ZIP nesta sessão.",
          "erro"
        );
      }

      var paginaAtual = professor.paginas[pageIndice];
      var fotoAtual = paginaAtual.fotos[photoIndice];
      fotoAtual.src = caminho;
      if (!fotoAtual.alt) {
        fotoAtual.alt = "Foto da carta de " + professor.nome;
      }

      renderizarFormulario();
      renderizarPreview();
      agendarSalvar();

      var avisos = [];
      if (Math.max(resultado.widthOriginal, resultado.heightOriginal) < MIN_LADO) {
        avisos.push("original menor que 800 px");
      }
      if (resultado.blob.size > LIMITE_PESO) {
        avisos.push("arquivo final acima de 500 KB");
      }
      anunciar(
        "Imagem pronta: " +
          resultado.width +
          " × " +
          resultado.height +
          " px, " +
          formatarBytes(resultado.blob.size) +
          (resultado.widthOriginal !== resultado.width
            ? " (redimensionada de " +
              resultado.widthOriginal +
              " × " +
              resultado.heightOriginal +
              ")"
            : "") +
          (avisos.length ? " — atenção: " + avisos.join(", ") + "." : "."),
        avisos.length ? "erro" : "ok"
      );
    } catch (erro) {
      anunciar(erro.message || "Não foi possível processar a imagem.", "erro");
      if (window.console && console.error) console.error(erro);
    } finally {
      zona.classList.remove("is-busy");
    }
  }

  /* ------------------------------------------------------------------------
     Prévia
     ------------------------------------------------------------------------ */
  function renderizarPreview() {
    var stage = $("[data-preview]");
    if (!stage) return;
    var professor = atual();
    if (!professor) {
      stage.innerHTML =
        '<p class="preview-empty">Escolha um cartão para ver a prévia.</p>';
      return;
    }
    stage.setAttribute("data-acento", professor.acento);
    var paginas = Array.isArray(professor.paginas) ? professor.paginas : [];
    var temAssinatura = paginas.some(function (pagina) {
      return pagina && pagina.tipo === "assinatura";
    });
    var lista = paginas.slice();
    if (!temAssinatura) {
      lista.push({
        tipo: "assinatura",
        texto: "Com carinho, Turma Ginga",
        ano: "2026",
      });
    }
    var total = lista.length;
    var itens = [];
    itens.push(
      previewItem(
        "Capa",
        "",
        '<div class="card card--envelope">' + previewCapa(professor) + "</div>"
      )
    );
    lista.forEach(function (pagina, indice) {
      var rotulo =
        pagina.titulo ||
        (pagina.tipo === "foto"
          ? "Fotos"
          : pagina.tipo === "recados"
            ? "Recados"
            : pagina.tipo === "citacao"
              ? "Citação"
              : pagina.tipo === "assinatura"
                ? "Assinatura"
                : "Texto");
      var classesCard =
        pagina.tipo === "foto"
          ? "card card--foto"
          : pagina.tipo === "recados"
            ? "card card--recados"
            : pagina.tipo === "citacao"
              ? "card card--citacao"
              : pagina.tipo === "assinatura"
                ? "card card--assinatura"
                : "card card--page";
      itens.push(
        previewItem(
          rotulo,
          indice + 1 + " / " + total,
          '<div class="' + classesCard + '">' + previewPagina(pagina) + "</div>"
        )
      );
    });
    stage.innerHTML = itens.join("");
    ajustarEscalaPreview();
    ligarFalhasImagensPreview();
  }

  function previewItem(rotulo, contador, cardHtml) {
    return (
      '<div class="preview-item"><p class="preview-label"><span>' +
      esc(rotulo) +
      "</span><span>" +
      esc(contador) +
      '</span></p><div class="preview-slide">' +
      cardHtml +
      "</div></div>"
    );
  }

  function previewCapa(professor) {
    var selos = SELOS_ENVELOPE.map(function (selo) {
      return (
        '<span class="envelope__selo envelope__selo--' +
        selo.cor +
        " envelope__selo--" +
        selo.marca +
        '">' +
        "<picture>" +
        '<source srcset="' +
        selo.webp +
        '" type="image/webp">' +
        '<img src="' +
        selo.png +
        '" alt="" width="' +
        selo.largura +
        '" height="' +
        selo.altura +
        '" loading="lazy" data-envelope-selo>' +
        "</picture>" +
        '<span class="envelope__selo-textura" aria-hidden="true"></span>' +
        "</span>"
      );
    }).join("");
    return (
      '<div class="envelope">' +
      '<div class="envelope__body">' +
      '<div class="envelope__address">' +
      '<p class="envelope__para">Para</p>' +
      '<h1 class="envelope__nome">' +
      esc(professor.nome) +
      "</h1>" +
      '<span class="envelope__rule" aria-hidden="true"></span>' +
      "</div>" +
      '<div class="envelope__selos" aria-hidden="true">' +
      selos +
      "</div>" +
      "</div>" +
      '<div class="seal-button" aria-hidden="true">' +
      '<span class="seal-button__media">' +
      '<picture class="seal-wax">' +
      '<source srcset="' +
      SELO_WEBP +
      '" type="image/webp">' +
      '<img src="' +
      SELO_PNG +
      '" alt="" width="480" height="465" loading="lazy">' +
      "</picture>" +
      '<span class="seal-fallback">' +
      svgSelo(professor) +
      "</span>" +
      "</span>" +
      "</div>" +
      '<p class="envelope__hint">Toque no carimbo para abrir.</p>' +
      "</div>"
    );
  }

  function gingaPreviewHtml() {
    return (
      '<div class="assinatura__seal" aria-hidden="true">' +
      '<picture class="assinatura__ginga">' +
      '<source srcset="' +
      urlRepo("assets/img/marca/selos/selo-01.webp") +
      '" type="image/webp">' +
      '<img src="' +
      urlRepo("assets/img/marca/selos/selo-01.png") +
      '" alt="" width="180" height="180" loading="lazy" decoding="async" data-assinatura-selo>' +
      "</picture>" +
      "</div>"
    );
  }

  function previewPagina(pagina) {
    if (pagina.tipo === "texto") {
      var paragrafos = (pagina.paragrafos || [])
        .filter(function (p) {
          return String(p || "").trim();
        })
        .map(function (p) {
          return "<p>" + esc(p).replace(/\n/g, "<br>") + "</p>";
        })
        .join("");
      return (
        '<div class="page-text' +
        (String((pagina.paragrafos || []).join(" ")).length > 400
          ? " page-text--long"
          : "") +
        '">' +
        (pagina.titulo ? "<h2>" + esc(pagina.titulo) + "</h2>" : "") +
        (paragrafos || '<p class="vazio">Esta página ainda está em branco.</p>') +
        "</div>"
      );
    }
    if (pagina.tipo === "foto") {
      var fotos = (pagina.fotos || []).slice(0, 6);
      if (!fotos.length) fotos = [{}];
      var classe =
        fotos.length === 1
          ? "photo-grid--1"
          : fotos.length === 2
            ? "photo-grid--2"
            : fotos.length === 3
              ? "photo-grid--3"
              : "photo-grid--many";
      return (
        (pagina.titulo
          ? '<div class="page-head"><h2>' + esc(pagina.titulo) + "</h2></div>"
          : "") +
        '<div class="photo-grid ' +
        classe +
        '">' +
        fotos
          .map(function (foto) {
            var src = foto && foto.src ? urlPreview(foto.src) : "";
            return (
              '<figure class="photo"><div class="photo__frame">' +
              (src
                ? '<img src="' + esc(src) + '" alt="" loading="lazy">'
                : "") +
              '<div class="photo__fallback"' +
              (src ? " hidden" : "") +
              '><div><span aria-hidden="true">□</span>Imagem não adicionada.</div></div></div>' +
              (foto && foto.legenda
                ? "<figcaption>" + esc(foto.legenda) + "</figcaption>"
                : "") +
              "</figure>"
            );
          })
          .join("") +
        "</div>"
      );
    }
    if (pagina.tipo === "recados") {
      var recados = (pagina.recados || []).filter(function (recado) {
        return recado && String(recado.texto || "").trim();
      });
      if (!recados.length) {
        recados = [{ texto: "Os recados da Turma Ginga ainda serão adicionados.", autor: "" }];
      }
      return (
        '<div class="page-head"><h2>' +
        esc(pagina.titulo || "Recados") +
        '</h2></div><ul class="recados-list">' +
        recados
          .map(function (recado) {
            return (
              "<li><blockquote><p>" +
              esc(recado.texto) +
              "</p></blockquote>" +
              (recado.autor ? "<cite>" + esc(recado.autor) + "</cite>" : "") +
              "</li>"
            );
          })
          .join("") +
        "</ul>"
      );
    }
    if (pagina.tipo === "citacao") {
      return (
        '<blockquote><p>' +
        esc(pagina.texto || "Uma frase da Turma Ginga ainda será escolhida.") +
        "</p>" +
        (pagina.autor ? "<cite>" + esc(pagina.autor) + "</cite>" : "") +
        "</blockquote>"
      );
    }
    var texto = String(pagina.texto || "Com carinho, Turma Ginga");
    var partes = texto.split(",");
    var abertura = partes.length > 1 ? partes.shift().trim() + "," : "Com carinho,";
    var nome = partes.join(",").trim() || "Turma Ginga";
    return (
      '<div class="assinatura__content"><p>' +
      esc(abertura) +
      "</p><strong>" +
      esc(nome) +
      '</strong><span class="assinatura__ano">' +
      esc(pagina.ano || "2026") +
      "</span>" +
      gingaPreviewHtml() +
      "</div>"
    );
  }

  function ajustarEscalaPreview() {
    var stage = $("[data-preview]");
    if (!stage) return;
    var slide = $(".preview-slide", stage);
    if (!slide) return;
    var largura = slide.getBoundingClientRect().width;
    if (!largura) return;
    stage.style.setProperty("--preview-scale", String(largura / 1160));
  }

  function ligarFalhasImagensPreview() {
    var stage = $("[data-preview]");
    if (!stage) return;
    $$("img", stage).forEach(function (img) {
      img.addEventListener("error", function () {
        img.style.display = "none";
        if (img.matches("[data-envelope-selo]")) {
          var marca = img.closest(".envelope__selo");
          if (marca) marca.hidden = true;
          return;
        }
        if (img.matches("[data-assinatura-selo]")) {
          var seloAssinatura = img.closest(".assinatura__seal");
          if (seloAssinatura) seloAssinatura.hidden = true;
          return;
        }
        var selo = img.closest(".seal-button");
        if (selo) selo.classList.add("is-fallback");
        var fallback = img.parentNode.querySelector(".photo__fallback");
        if (fallback) fallback.hidden = false;
      });
    });
  }

  /* ------------------------------------------------------------------------
     Importação e exportação
     ------------------------------------------------------------------------ */
  async function importarArquivo(arquivo) {
    try {
      var texto = await arquivo.text();
      var marcador = texto.lastIndexOf("window.DADOS");
      var inicio = texto.indexOf("[", marcador >= 0 ? marcador : 0);
      var fim = texto.lastIndexOf("]");
      if (inicio < 0 || fim <= inicio) throw new Error("Formato não reconhecido.");
      var json = texto.slice(inicio, fim + 1);
      var dados = JSON.parse(json);
      if (!Array.isArray(dados) || !dados.length) {
        throw new Error("O arquivo não contém uma lista de cartões.");
      }
      estado.dados = normalizarDados(dados);
      estado.selecionado = 0;
      renderizarTudo();
      agendarSalvar();
      anunciar(
        "Dados importados. As imagens precisam existir no repositório ou ser enviadas de novo.",
        "ok"
      );
    } catch (erro) {
      anunciar(
        "Não foi possível importar: " + (erro.message || "arquivo inválido."),
        "erro"
      );
    }
  }

  function validarDados() {
    var erros = [];
    var slugs = {};
    if (!estado.dados.length) erros.push("Não há nenhum cartão.");
    estado.dados.forEach(function (professor, indice) {
      var nome = professor.nome || "cartão " + (indice + 1);
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(professor.slug)) {
        erros.push(nome + ": slug inválido.");
      }
      if (slugs[professor.slug]) erros.push(nome + ": slug duplicado.");
      slugs[professor.slug] = true;
      if (!String(professor.nome || "").trim()) erros.push(nome + ": nome vazio.");
      if (!Array.isArray(professor.paginas)) {
        erros.push(nome + ": páginas inválidas.");
        return;
      }
      professor.paginas.forEach(function (pagina, paginaIndice) {
        if (
          ["texto", "foto", "recados", "citacao", "assinatura"].indexOf(
            pagina.tipo
          ) < 0
        ) {
          erros.push(nome + ": página " + (paginaIndice + 1) + " tem tipo desconhecido.");
        }
        var caminhos = [];
        if (pagina.tipo === "foto") {
          (pagina.fotos || []).forEach(function (foto) {
            if (foto.src) caminhos.push(foto.src);
          });
        }
        caminhos.forEach(function (caminho) {
          if (
            !/^assets\/img\//.test(caminho) ||
            caminho.indexOf("..") >= 0
          ) {
            erros.push(nome + ": caminho de imagem inválido (“" + caminho + "”).");
          }
        });
      });
    });
    return erros;
  }

  function gerarDadosJs() {
    return (
      "/* ==========================================================================\n" +
      "   Cartões de Gratidão — dados dos cartões\n" +
      "   Gerado pelo editor em " +
      new Date().toLocaleString("pt-BR") +
      "\n" +
      "   Script clássico: window.DADOS = [...]\n" +
      "   ========================================================================== */\n\n" +
      "window.DADOS = " +
      JSON.stringify(estado.dados, null, 2) +
      ";\n"
    );
  }

  function baixarBlob(blob, nome) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1500);
  }

  function baixarDadosJs() {
    var erros = validarDados();
    if (erros.length) {
      anunciar("Corrija antes de baixar: " + erros.slice(0, 3).join(" "), "erro");
      return;
    }
    baixarBlob(
      new Blob([gerarDadosJs()], { type: "text/javascript;charset=utf-8" }),
      "dados.js"
    );
    anunciar("dados.js baixado. Substitua o arquivo na raiz do repositório.", "ok");
  }

  async function obterBlobDoCaminho(caminho) {
    var entrada = imagens.get(caminho);
    if (entrada && entrada.blob) return entrada.blob;
    try {
      var resposta = await fetch(urlRepo(caminho));
      if (!resposta.ok) return null;
      return await resposta.blob();
    } catch (erro) {
      return null;
    }
  }

  async function baixarZip() {
    var erros = validarDados();
    if (erros.length) {
      anunciar("Corrija antes de gerar o ZIP: " + erros.slice(0, 3).join(" "), "erro");
      return;
    }
    if (!window.fflate) {
      anunciar("A biblioteca de ZIP não carregou. Recarregue a página.", "erro");
      return;
    }
    var botao = $("[data-download-zip]");
    if (botao) botao.disabled = true;
    anunciar("Montando o ZIP…", "ok");

    try {
      var arquivos = {};
      arquivos["dados.js"] = window.fflate.strToU8(gerarDadosJs());
      arquivos["LEIA-ME.txt"] = window.fflate.strToU8(textoLeiaMe());

      var caminhos = new Set();
      estado.dados.forEach(function (professor) {
        (professor.paginas || []).forEach(function (pagina) {
          if (pagina.tipo === "foto") {
            (pagina.fotos || []).forEach(function (foto) {
              if (foto.src) caminhos.add(foto.src);
            });
          }
        });
      });

      var faltando = [];
      var caminhosArray = Array.from(caminhos);
      for (var i = 0; i < caminhosArray.length; i += 1) {
        var caminho = caminhosArray[i];
        if (!/^assets\/img\//.test(caminho) || caminho.indexOf("..") >= 0) continue;
        var blob = await obterBlobDoCaminho(caminho);
        if (!blob) {
          faltando.push(caminho);
          continue;
        }
        var buffer = await blob.arrayBuffer();
        arquivos[caminho] = new Uint8Array(buffer);
      }

      var zip = window.fflate.zipSync(arquivos, { level: 6 });
      var nome =
        "cartoes-de-gratidao-" +
        new Date().toISOString().slice(0, 10) +
        ".zip";
      baixarBlob(new Blob([zip], { type: "application/zip" }), nome);
      anunciar(
        "ZIP baixado" +
          (faltando.length
            ? " com " +
              faltando.length +
              " imagem(ns) não encontrada(s). Confira o console/arquivos."
            : ". Extraia na raiz do repositório e faça commit."),
        faltando.length ? "erro" : "ok"
      );
      if (faltando.length && window.console) {
        console.warn("Imagens não encontradas para o ZIP:", faltando);
      }
    } catch (erro) {
      anunciar("Não foi possível gerar o ZIP: " + (erro.message || "erro."), "erro");
      if (window.console) console.error(erro);
    } finally {
      if (botao) botao.disabled = false;
    }
  }

  function textoLeiaMe() {
    return (
      "CARTÕES DE GRATIDÃO — PACOTE DE EDIÇÃO\n" +
      "Gerado em " +
      new Date().toLocaleString("pt-BR") +
      "\n\n" +
      "O QUE HÁ NESTE ZIP\n" +
      "- dados.js: conteúdo dos cartões (window.DADOS).\n" +
      "- assets/img/homenageados/...: imagens referenciadas pelos cartões.\n\n" +
      "COMO PUBLICAR\n" +
      "1. Extraia este ZIP na raiz do repositório cartas-formatura, substituindo os arquivos existentes.\n" +
      "2. Confira o que mudou com: git status\n" +
      "3. Adicione os arquivos: git add dados.js assets/img\n" +
      "4. Faça o commit: git commit -m \"Atualiza cartões de gratidão\"\n" +
      "5. Envie para o GitHub: git push\n" +
      "O GitHub Pages publica a branch main automaticamente. Pode levar alguns minutos.\n\n" +
      "IMPORTANTE\n" +
      "- O editor não publica sozinho; ele apenas exporta arquivos.\n" +
      "- Para um homenageado novo, crie carta/<slug>/index.html copiando um shell existente e ajuste data-homenageado e as meta tags.\n" +
      "- O editor deve ser removido ou bloqueado após a formatura.\n" +
      "- O envelope é o estado fechado da página 1 e não conta no total de páginas; o carimbo de cera abre a carta.\n" +
      "- O carimbo (assets/img/marca/selo-cera.*) e os três selos (assets/img/marca/selos/) são assets do site e não entram no ZIP.\n" +
      "- Textos: no desktop, até ~600 caracteres; no celular, até ~400. Textos maiores devem ser divididos em mais páginas.\n" +
      "- O site é noindex/nofollow e não aparece em buscadores; os links são privados por obscuridade, não por login.\n" +
      "- Imagens ausentes no ZIP continuam as que já estão no repositório.\n"
    );
  }

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
