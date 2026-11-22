/* ==========================================================================
   Modo "Ler a carta inteira"
   Recebe os dados do renderer e monta um artigo linear dentro de um <dialog>.
   ========================================================================== */
(function () {
  "use strict";

  var dialogo = document.getElementById("leitura");
  var conteudo = dialogo ? dialogo.querySelector("[data-reading-content]") : null;
  var titulo = dialogo ? dialogo.querySelector("[data-reading-title]") : null;
  var jaIniciado = false;
  var revealConfigAnterior = null;

  function esc(valor) {
    if (window.Cartao && typeof window.Cartao.esc === "function") {
      return window.Cartao.esc(valor);
    }
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

  function comQuebras(valor) {
    return esc(valor).replace(/\n/g, "<br>");
  }

  function figura(foto) {
    var srcOriginal = String(foto && foto.src ? foto.src : "").trim();
    var src = srcOriginal;
    if (src && window.Cartao && typeof window.Cartao.urlImagem === "function") {
      src = window.Cartao.urlImagem(src);
    }
    var alt = String(foto && foto.alt ? foto.alt : "").trim();
    var legenda = String(foto && foto.legenda ? foto.legenda : "").trim();
    if (!alt) alt = legenda || "Foto da carta";
    if (!src) {
      return (
        '<figure class="reading-figure reading-figure--placeholder"><p>Imagem ainda não adicionada.</p>' +
        (legenda ? "<figcaption>" + esc(legenda) + "</figcaption>" : "") +
        "</figure>"
      );
    }
    return (
      '<figure class="reading-figure"><img src="' +
      esc(src) +
      '" alt="' +
      esc(alt) +
      '" loading="lazy" decoding="async">' +
      (legenda ? "<figcaption>" + esc(legenda) + "</figcaption>" : "") +
      "</figure>"
    );
  }

  function secaoTexto(pagina, indice) {
    var paragrafos = Array.isArray(pagina.paragrafos) ? pagina.paragrafos : [];
    var corpo = paragrafos
      .filter(function (p) {
        return String(p || "").trim() !== "";
      })
      .map(function (p) {
        return "<p>" + comQuebras(p) + "</p>";
      })
      .join("");
    if (!corpo) corpo = "<p>Esta página ainda está em branco.</p>";
    return (
      '<section class="reading-section" aria-labelledby="leitura-sec-' +
      indice +
      '">' +
      "<h2 id=\"leitura-sec-" +
      indice +
      '">' +
      esc(pagina.titulo || "Carta") +
      "</h2>" +
      corpo +
      "</section>"
    );
  }

  function secaoFoto(pagina, indice) {
    var fotos = Array.isArray(pagina.fotos) ? pagina.fotos : [];
    if (!fotos.length) fotos = [{}];
    return (
      '<section class="reading-section" aria-labelledby="leitura-sec-' +
      indice +
      '">' +
      "<h2 id=\"leitura-sec-" +
      indice +
      '">' +
      esc(pagina.titulo || "Fotos") +
      "</h2>" +
      fotos.map(figura).join("") +
      "</section>"
    );
  }

  function secaoRecados(pagina, indice) {
    var recados = Array.isArray(pagina.recados) ? pagina.recados : [];
    var itens = recados
      .filter(function (recado) {
        return recado && String(recado.texto || "").trim() !== "";
      })
      .map(function (recado) {
        return (
          "<li><p>" +
          comQuebras(recado.texto) +
          "</p>" +
          (recado.autor ? "<span>" + esc(recado.autor) + "</span>" : "") +
          "</li>"
        );
      })
      .join("");
    if (!itens) {
      itens = "<li><p>Os recados da Turma Ginga ainda serão adicionados.</p></li>";
    }
    return (
      '<section class="reading-section" aria-labelledby="leitura-sec-' +
      indice +
      '">' +
      "<h2 id=\"leitura-sec-" +
      indice +
      '">' +
      esc(pagina.titulo || "Recados") +
      "</h2>" +
      '<ul class="reading-recados">' +
      itens +
      "</ul>" +
      "</section>"
    );
  }

  function secaoCitacao(pagina, indice) {
    var texto = String(pagina.texto || "").trim();
    if (!texto) texto = "Uma frase da Turma Ginga ainda será escolhida.";
    return (
      '<section class="reading-section reading-section--citacao" aria-labelledby="leitura-sec-' +
      indice +
      '">' +
      '<h2 class="visually-hidden" id="leitura-sec-' +
      indice +
      '">Citação</h2>' +
      "<blockquote><p>" +
      comQuebras(texto) +
      "</p></blockquote>" +
      (pagina.autor ? "<cite>" + esc(pagina.autor) + "</cite>" : "") +
      "</section>"
    );
  }

  function secaoAssinatura(pagina, indice) {
    var texto = String(pagina.texto || "Com carinho, Turma Ginga").trim();
    return (
      '<section class="reading-section reading-assinatura" aria-labelledby="leitura-sec-' +
      indice +
      '">' +
      '<h2 class="visually-hidden" id="leitura-sec-' +
      indice +
      '">Assinatura</h2>' +
      "<p>" +
      comQuebras(texto) +
      "</p>" +
      "<span>" +
      esc(pagina.ano || "2026") +
      "</span>" +
      (window.Cartao && window.Cartao.svgSelo
        ? window.Cartao.svgSelo(window.Cartao.professor)
        : "") +
      "</section>"
    );
  }

  function montar(professor) {
    if (!conteudo || !window.Cartao) return;
    var paginas = Array.isArray(professor.paginas) ? professor.paginas : [];
    var selo = window.Cartao.svgSelo
      ? window.Cartao.svgSelo(professor, { rodape: "TURMA GINGA" })
      : "";
    var partes = [];
    partes.push(
      '<header class="reading-cover">' +
        '<span class="reading-cover__eyebrow">Uma carta da Turma Ginga · Alpha EdTech</span>' +
        "<h1>" +
        esc(professor.nome) +
        "</h1>" +
        '<p class="reading-cover__discipline">' +
        esc(professor.disciplina || "Professor(a) da Alpha EdTech") +
        "</p>" +
        '<div class="reading-cover__seal">' +
        selo +
        "</div>" +
        "</header>"
    );

    paginas.forEach(function (pagina, indice) {
      if (!pagina || !pagina.tipo) return;
      var n = indice + 1;
      if (pagina.tipo === "texto") partes.push(secaoTexto(pagina, n));
      else if (pagina.tipo === "foto") partes.push(secaoFoto(pagina, n));
      else if (pagina.tipo === "recados") partes.push(secaoRecados(pagina, n));
      else if (pagina.tipo === "citacao") partes.push(secaoCitacao(pagina, n));
      else if (pagina.tipo === "assinatura")
        partes.push(secaoAssinatura(pagina, n));
    });

    var temAssinatura = paginas.some(function (pagina) {
      return pagina && pagina.tipo === "assinatura";
    });
    if (!temAssinatura) {
      partes.push(
        secaoAssinatura(
          { texto: "Com carinho, Turma Ginga", ano: "2026" },
          paginas.length + 1
        )
      );
    }

    conteudo.innerHTML =
      '<article class="reading-article">' + partes.join("") + "</article>";
    if (titulo) titulo.textContent = "Ler a carta de " + professor.nome;
    dialogo.setAttribute("aria-label", "Carta para " + professor.nome);
    ligarFalhasDeImagem();
  }

  function ligarFalhasDeImagem() {
    var imagens = conteudo.querySelectorAll("img");
    Array.prototype.forEach.call(imagens, function (img) {
      img.addEventListener("error", function () {
        var figure = img.closest(".reading-figure");
        if (!figure) return;
        var legenda = figure.querySelector("figcaption");
        var novo = document.createElement("figure");
        novo.className = "reading-figure reading-figure--placeholder";
        novo.innerHTML =
          "<p>Imagem ainda não disponível.</p>" +
          (legenda ? legenda.outerHTML : "");
        figure.parentNode.replaceChild(novo, figure);
      });
    });
  }

  function abrir() {
    if (!dialogo) return;
    if (!dialogo.open) {
      if (
        window.Cartao &&
        typeof window.Cartao.pausarNavegacao === "function"
      ) {
        window.Cartao.pausarNavegacao();
      } else if (window.Reveal && window.Reveal.getConfig) {
        if (window.Reveal.isOverview && window.Reveal.isOverview()) {
          window.Reveal.toggleOverview(false);
        }
        revealConfigAnterior = {
          keyboard: window.Reveal.getConfig().keyboard,
          touch: window.Reveal.getConfig().touch,
        };
        /* O teclado e o swipe passam a pertencer ao artigo. O hash é ignorado
           pelo listener do renderer enquanto o diálogo está aberto. */
        window.Reveal.configure({ keyboard: false, touch: false });
      }
      document.body.classList.add("leitura-aberta");
      dialogo.showModal();
      var rolagem = dialogo.querySelector(".reading-scroll");
      if (rolagem) rolagem.scrollTop = 0;
      var fechar = dialogo.querySelector("[data-close-reading]");
      if (fechar) {
        window.requestAnimationFrame(function () {
          fechar.focus();
        });
      }
    }
  }

  function fechar() {
    if (!dialogo || !dialogo.open) return;
    dialogo.close();
  }

  function restaurarDeck() {
    if (
      window.Cartao &&
      typeof window.Cartao.retomarNavegacao === "function"
    ) {
      window.Cartao.retomarNavegacao();
      revealConfigAnterior = null;
      return;
    }
    if (window.Reveal && window.Reveal.configure && revealConfigAnterior) {
      window.Reveal.configure(revealConfigAnterior);
      revealConfigAnterior = null;
    }
  }

  /* Escape deve fechar o artigo, não abrir a visão geral do Reveal. */
  document.addEventListener(
    "keydown",
    function (evento) {
      if (dialogo && dialogo.open && evento.key === "Escape") {
        evento.preventDefault();
        evento.stopImmediatePropagation();
        fechar();
      }
    },
    true
  );

  function iniciarComProfessor(professor) {
    if (!dialogo || !conteudo || jaIniciado) return;
    jaIniciado = true;
    montar(professor);
  }

  function prepararBotoes() {
    var aberturas = document.querySelectorAll("[data-open-reading]");
    Array.prototype.forEach.call(aberturas, function (botao) {
      botao.addEventListener("click", function (evento) {
        evento.preventDefault();
        abrir();
      });
    });

    var fechamentos = dialogo
      ? dialogo.querySelectorAll("[data-close-reading]")
      : [];
    Array.prototype.forEach.call(fechamentos, function (botao) {
      botao.addEventListener("click", function (evento) {
        evento.preventDefault();
        fechar();
      });
    });

    if (dialogo) {
      dialogo.addEventListener("close", function () {
        document.body.classList.remove("leitura-aberta");
        restaurarDeck();
      });
      dialogo.addEventListener("cancel", function (evento) {
        evento.preventDefault();
        fechar();
      });
      dialogo.addEventListener("click", function (evento) {
        if (evento.target === dialogo) fechar();
      });
    }
  }

  prepararBotoes();

  document.addEventListener("cartao:pronto", function (evento) {
    var professor = evento.detail && evento.detail.professor;
    if (professor) iniciarComProfessor(professor);
  });

  if (window.Cartao && window.Cartao.professor) {
    iniciarComProfessor(window.Cartao.professor);
  }
})();
