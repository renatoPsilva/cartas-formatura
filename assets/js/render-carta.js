/* ==========================================================================
   Renderer dos cartões
   Monta a primeira página com o envelope por cima (o cartão fechado), as
   demais páginas e o Reveal. O envelope sai pelo selo; a navegação só é
   liberada depois da abertura. Publica "cartao:pronto" para o modo de leitura.
   ========================================================================== */
(function () {
  "use strict";

  var ACENTOS = ["seal", "azul", "verde", "ameixa", "ocre"];
  var TIPOS_PAGINA = ["texto", "foto", "recados", "citacao", "assinatura"];
  var DURACAO_PRESS = 120;
  var DURACAO_ABERTURA = 1000;
  var DURACAO_TROCA_SAIDA = 260;
  var DURACAO_TROCA_PAUSA = 40;
  var DURACAO_TROCA_ENTRADA = 260;
  var ASSET_SELO_WEBP = "../../assets/img/marca/selo-cera.webp";
  var ASSET_SELO_PNG = "../../assets/img/marca/selo-cera.png";
  var SELOS_ENVELOPE = [
    {
      webp: "../../assets/img/marca/selos/selo-01.webp",
      png: "../../assets/img/marca/selos/selo-01.png",
      largura: 180,
      altura: 180,
    },
    {
      webp: "../../assets/img/marca/selos/selo-02.webp",
      png: "../../assets/img/marca/selos/selo-02.png",
      largura: 155,
      altura: 180,
    },
    {
      webp: "../../assets/img/marca/selos/selo-03.webp",
      png: "../../assets/img/marca/selos/selo-03.png",
      largura: 180,
      altura: 166,
    },
  ];
  var app = document.querySelector(".app");
  var elementoErro = document.querySelector("[data-erro]");
  var elementoErroTexto = document.querySelector("[data-erro-texto]");

  var totalPaginas = 0;
  var primeiroSlide = null;
  var nomeProfessor = "";
  var rotuloPrimeiraPagina = "";
  var estadoInterno = {
    abrindo: false,
    pausada: false,
    trocando: false,
    programatica: false,
    temporizadorPress: 0,
    temporizadorAbertura: 0,
  };

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

  function comQuebras(valor) {
    return esc(valor).replace(/\n/g, "<br>");
  }

  /* Os dados guardam caminhos relativos à raiz do site (assets/...).
     A página do professor está em carta/<slug>/, então prefixamos ../../. */
  function urlImagem(valor) {
    var src = String(valor || "").trim();
    if (!src) return "";
    if (/^(https?:|data:|blob:|\/)/i.test(src)) return src;
    if (src.indexOf("../../") === 0 || src.indexOf("../") === 0) return src;
    return "../../" + src.replace(/^\.\//, "");
  }

  function iniciaisDe(professor) {
    var bruto = String(professor.selo || "").trim();
    if (bruto) return bruto.slice(0, 3).toUpperCase();

    var partes = String(professor.nome || "")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter(function (parte) {
        return parte.length > 0;
      });
    var iniciais = partes
      .slice(0, 2)
      .map(function (parte) {
        return parte.charAt(0);
      })
      .join("");
    return (iniciais || "CG").toUpperCase();
  }

  function svgSelo(professor, opcoes) {
    var op = opcoes || {};
    var iniciais = iniciaisDe(professor || {});
    var ano = (professor && professor.ano) || "2026";
    var rodape = op.rodape || "TURMA GINGA";
    var tamanho =
      iniciais.length > 2 ? 50 : iniciais.length === 2 ? 62 : 70;
    var aria = op.decorativo === false ? "" : ' aria-hidden="true"';
    return (
      '<svg class="seal-mark" viewBox="0 0 200 200" focusable="false"' +
      aria +
      ">" +
      '<circle class="seal-line" cx="100" cy="100" r="95" stroke-width="1.3"/>' +
      '<circle class="seal-line" cx="100" cy="100" r="86" stroke-width="0.7" stroke-dasharray="1.5 5.5" opacity="0.58"/>' +
      '<circle class="seal-diamond" cx="100" cy="6" r="1.7"/>' +
      '<circle class="seal-diamond" cx="194" cy="100" r="1.7"/>' +
      '<circle class="seal-diamond" cx="100" cy="194" r="1.7"/>' +
      '<circle class="seal-diamond" cx="6" cy="100" r="1.7"/>' +
      '<text class="seal-year" x="100" y="50" text-anchor="middle">' +
      esc(ano) +
      "</text>" +
      '<text x="100" y="126" text-anchor="middle" font-size="' +
      tamanho +
      '" font-weight="360" letter-spacing="-1">' +
      esc(iniciais) +
      "</text>" +
      '<line class="seal-line" x1="69" y1="145" x2="131" y2="145" stroke-width="0.7" opacity="0.45"/>' +
      '<text class="seal-micro" x="100" y="165" text-anchor="middle">' +
      esc(rodape) +
      "</text>" +
      "</svg>"
    );
  }

  function selosHtml() {
    return (
      '<div class="envelope__selos" aria-hidden="true">' +
      SELOS_ENVELOPE.map(function (selo) {
        return (
          '<picture class="envelope__selo">' +
          '<source srcset="' +
          selo.webp +
          '" type="image/webp">' +
          '<img src="' +
          selo.png +
          '" alt="" width="' +
          selo.largura +
          '" height="' +
          selo.altura +
          '" loading="eager" decoding="async" data-envelope-selo>' +
          "</picture>"
        );
      }).join("") +
      "</div>"
    );
  }

  function retratoHtml(professor) {
    var src = String(professor.retrato || "").trim();
    if (!src) return "";
    var alt = String(professor.retratoAlt || "").trim();
    if (!alt) alt = "Retrato de " + (professor.nome || "professor");
    return (
      '<header class="envelope__top">' +
      '<div class="retrato" data-retrato>' +
      '<img src="' +
      esc(urlImagem(src)) +
      '" alt="' +
      esc(alt) +
      '" loading="eager" decoding="async" data-retrato-img>' +
      "</div>" +
      "</header>"
    );
  }

  function sealHtml(professor) {
    return (
      '<span class="seal-button__media">' +
      '<picture class="seal-wax">' +
      '<source srcset="' +
      ASSET_SELO_WEBP +
      '" type="image/webp">' +
      '<img src="' +
      ASSET_SELO_PNG +
      '" alt="" width="480" height="465" loading="eager" decoding="async" data-seal-img>' +
      "</picture>" +
      '<span class="seal-fallback" aria-hidden="true">' +
      svgSelo(professor) +
      "</span>" +
      "</span>"
    );
  }

  function envelopeHtml(professor) {
    var nome = professor.nome || "professor";
    return (
      '<div class="envelope" data-envelope>' +
      '<div class="envelope__body">' +
      retratoHtml(professor) +
      '<div class="envelope__address">' +
      '<p class="envelope__para">Para</p>' +
      '<h1 class="envelope__nome">' +
      esc(nome) +
      "</h1>" +
      '<span class="envelope__rule" aria-hidden="true"></span>' +
      "</div>" +
      selosHtml() +
      "</div>" +
      '<button class="seal-button" type="button" data-open-card aria-label="Abrir a carta de ' +
      esc(nome) +
      '">' +
      sealHtml(professor) +
      "</button>" +
      '<p class="envelope__hint">Toque no selo para abrir.</p>' +
      "</div>"
    );
  }

  function textoHtml(pagina) {
    var paragrafos = Array.isArray(pagina.paragrafos) ? pagina.paragrafos : [];
    var total = paragrafos.join(" ").length;
    var corpo = paragrafos
      .filter(function (p) {
        return String(p || "").trim() !== "";
      })
      .map(function (p) {
        return "<p>" + comQuebras(p) + "</p>";
      })
      .join("");
    if (!corpo) {
      corpo = '<p class="vazio">Esta página ainda está em branco.</p>';
    }
    return (
      '<div class="card card--page"><div class="page-text' +
      (total > 400 ? " page-text--long" : "") +
      '">' +
      (pagina.titulo ? "<h2>" + esc(pagina.titulo) + "</h2>" : "") +
      corpo +
      "</div></div>"
    );
  }

  function figuraHtml(foto) {
    var src = String(foto && foto.src ? foto.src : "").trim();
    var alt = String(foto && foto.alt ? foto.alt : "").trim();
    var legenda = String(foto && foto.legenda ? foto.legenda : "").trim();
    if (!alt) alt = legenda || "Foto da carta";
    return (
      "<figure class=\"photo\">" +
      '<div class="photo__frame">' +
      (src
        ? '<img src="' +
          esc(urlImagem(src)) +
          '" alt="' +
          esc(alt) +
          '" loading="lazy" decoding="async">'
        : "") +
      '<div class="photo__fallback"' +
      (src ? " hidden" : "") +
      '><div><span aria-hidden="true">□</span>Imagem ainda não adicionada.<br>Substitua no editor.</div></div>' +
      "</div>" +
      (legenda ? "<figcaption>" + esc(legenda) + "</figcaption>" : "") +
      "</figure>"
    );
  }

  function fotoHtml(pagina) {
    var fotos = Array.isArray(pagina.fotos) ? pagina.fotos.slice(0, 6) : [];
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
      '<div class="card card--foto">' +
      (pagina.titulo
        ? '<div class="page-head"><h2>' + esc(pagina.titulo) + "</h2></div>"
        : "") +
      '<div class="photo-grid ' +
      classe +
      '">' +
      fotos.map(figuraHtml).join("") +
      "</div></div>"
    );
  }

  function recadosHtml(pagina) {
    var recados = Array.isArray(pagina.recados) ? pagina.recados : [];
    var itens = recados
      .filter(function (recado) {
        return recado && String(recado.texto || "").trim() !== "";
      })
      .map(function (recado) {
        return (
          '<li><blockquote><p>' +
          comQuebras(recado.texto) +
          "</p></blockquote>" +
          (recado.autor ? "<cite>" + esc(recado.autor) + "</cite>" : "") +
          "</li>"
        );
      })
      .join("");
    if (!itens) {
      itens =
        '<li><blockquote><p>Os recados da Turma Ginga ainda serão adicionados.</p></blockquote></li>';
    }
    return (
      '<div class="card card--recados">' +
      '<div class="page-head"><h2>' +
      esc(pagina.titulo || "Recados") +
      "</h2></div>" +
      '<ul class="recados-list">' +
      itens +
      "</ul></div>"
    );
  }

  function citacaoHtml(pagina) {
    var texto = String(pagina.texto || "").trim();
    if (!texto) texto = "Uma frase da Turma Ginga ainda será escolhida.";
    return (
      '<div class="card card--citacao"><blockquote><p>' +
      comQuebras(texto) +
      "</p>" +
      (pagina.autor ? "<cite>" + esc(pagina.autor) + "</cite>" : "") +
      "</blockquote></div>"
    );
  }

  function separarAssinatura(texto) {
    var limpo = String(texto || "").trim();
    if (!limpo) {
      return { abertura: "Com carinho,", nome: "Turma Ginga" };
    }
    var indice = limpo.indexOf(",");
    if (indice > 0 && indice < limpo.length - 1) {
      return {
        abertura: limpo.slice(0, indice + 1).trim(),
        nome: limpo.slice(indice + 1).trim(),
      };
    }
    return { abertura: "Com carinho,", nome: limpo };
  }

  function assinaturaHtml(pagina, professor, padrao) {
    var dados = pagina || {};
    var partes = separarAssinatura(
      dados.texto || (padrao ? "Com carinho, Turma Ginga" : "")
    );
    var ano = dados.ano || "2026";
    return (
      '<div class="card card--assinatura"><div class="assinatura__content">' +
      "<p>" +
      esc(partes.abertura) +
      "</p>" +
      "<strong>" +
      esc(partes.nome) +
      "</strong>" +
      '<span class="assinatura__ano">' +
      esc(ano) +
      "</span>" +
      '<div class="assinatura__seal">' +
      svgSelo(professor) +
      "</div>" +
      "</div></div>"
    );
  }

  function paginaHtml(pagina, professor) {
    if (!pagina || !pagina.tipo) return "";
    if (pagina.tipo === "texto") return textoHtml(pagina);
    if (pagina.tipo === "foto") return fotoHtml(pagina);
    if (pagina.tipo === "recados") return recadosHtml(pagina);
    if (pagina.tipo === "citacao") return citacaoHtml(pagina);
    if (pagina.tipo === "assinatura")
      return assinaturaHtml(pagina, professor, false);
    return "";
  }

  function rotuloPagina(pagina, indice) {
    var tipo = pagina && pagina.tipo;
    var titulo = pagina && pagina.titulo;
    if (titulo) return titulo;
    if (tipo === "foto") return "Fotos";
    if (tipo === "recados") return "Recados";
    if (tipo === "citacao") return "Citação";
    if (tipo === "assinatura") return "Assinatura";
    return "Página " + indice;
  }

  function paginasEfetivas(professor) {
    var lista = (Array.isArray(professor.paginas) ? professor.paginas : [])
      .filter(function (pagina) {
        return pagina && TIPOS_PAGINA.indexOf(pagina.tipo) >= 0;
      })
      .slice();
    var temAssinatura = lista.some(function (pagina) {
      return pagina && pagina.tipo === "assinatura";
    });
    if (!temAssinatura) {
      lista.push({
        tipo: "assinatura",
        texto: "Com carinho, Turma Ginga",
        ano: "2026",
      });
    }
    return lista;
  }

  function navHtml(indice, total) {
    var prevDesabilitado = indice <= 1;
    var nextDesabilitado = indice >= total;
    return (
      '<div class="carta-nav" role="group" aria-label="Navegação da carta">' +
      '<button class="carta-nav__button" type="button" data-carta-nav="prev" aria-label="Página anterior"' +
      (prevDesabilitado ? " disabled" : "") +
      ">" +
      '<svg class="carta-nav__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7"></path></svg>' +
      "</button>" +
      '<button class="carta-nav__button" type="button" data-carta-nav="next" aria-label="Próxima página"' +
      (nextDesabilitado ? " disabled" : "") +
      ">" +
      '<svg class="carta-nav__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7"></path></svg>' +
      "</button>" +
      "</div>"
    );
  }

  function criarPaginaComNav(html, rotulo, indice, total) {
    var slide = document.createElement("section");
    slide.className = "slide slide--pagina";
    slide.innerHTML = html;
    var card = slide.querySelector(".card");
    if (card) card.insertAdjacentHTML("beforeend", navHtml(indice, total));
    slide.setAttribute("data-titulo", rotulo);
    slide.setAttribute(
      "aria-label",
      "Página " + indice + " de " + total + ": " + rotulo
    );
    slide.setAttribute("tabindex", "-1");
    return slide;
  }

  function criarPrimeiroSlide(pagina, professor, rotulo) {
    var slide = document.createElement("section");
    slide.className = "slide slide--abertura";
    slide.innerHTML =
      paginaHtml(pagina, professor) +
      '<div class="abertura__cena">' +
      envelopeHtml(professor) +
      "</div>";
    var card = slide.querySelector(".card");
    if (card) card.insertAdjacentHTML("beforeend", navHtml(1, totalPaginas));
    slide.setAttribute("data-titulo", rotulo);
    slide.setAttribute("aria-label", "Capa da carta para " + nomeProfessor);
    slide.setAttribute("tabindex", "-1");
    return slide;
  }

  function mostrarErro(mensagem) {
    if (app) app.dataset.estado = "erro";
    if (elementoErro) elementoErro.hidden = false;
    if (elementoErroTexto) elementoErroTexto.textContent = mensagem;
    document.title = "Carta não encontrada — Cartões de Gratidão";
  }

  function ligarImagens() {
    var retratos = document.querySelectorAll("[data-retrato-img]");
    Array.prototype.forEach.call(retratos, function (img) {
      function carregou() {
        var caixa = img.closest(".retrato");
        if (caixa) caixa.classList.add("has-image");
      }
      function falhou() {
        var caixa = img.closest(".retrato");
        if (caixa) caixa.hidden = true;
        if (img.parentNode) img.parentNode.removeChild(img);
      }
      if (img.complete && img.naturalWidth > 0) carregou();
      img.addEventListener("load", carregou);
      img.addEventListener("error", falhou);
    });

    var fotos = document.querySelectorAll(".photo__frame img");
    Array.prototype.forEach.call(fotos, function (img) {
      function falhou() {
        img.hidden = true;
        var fallback = img.parentNode.querySelector(".photo__fallback");
        if (fallback) fallback.hidden = false;
      }
      if (img.complete && img.naturalWidth === 0) falhou();
      img.addEventListener("error", falhou);
    });

    var selos = document.querySelectorAll("[data-seal-img]");
    Array.prototype.forEach.call(selos, function (img) {
      function falhou() {
        var botao = img.closest(".seal-button");
        if (botao) botao.classList.add("is-fallback");
      }
      if (img.complete && img.naturalWidth === 0) falhou();
      img.addEventListener("error", falhou);
    });

    var selosEnvelope = document.querySelectorAll("[data-envelope-selo]");
    Array.prototype.forEach.call(selosEnvelope, function (img) {
      function falhou() {
        var marca = img.closest(".envelope__selo");
        if (marca) marca.hidden = true;
      }
      if (img.complete && img.naturalWidth === 0) falhou();
      img.addEventListener("error", falhou);
    });
  }

  function atualizarHash() {
    if (!app || app.dataset.carta !== "aberta") return;
    var hash = "#/" + (window.Reveal.getIndices().h + 1);
    if (window.location.hash === hash) return;
    try {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search + hash
      );
    } catch (erro) {
      /* O endereço pode ser bloqueado em alguns contextos. */
    }
  }

  function atualizarIndicador() {
    var atual = document.querySelector("[data-page-current]");
    var total = document.querySelector("[data-page-total]");
    if (atual) atual.textContent = String(window.Reveal.getIndices().h + 1);
    if (total) total.textContent = String(totalPaginas);
    atualizarHash();
  }

  function rotuloPrimeiraPaginaAberta() {
    return (
      "Página 1 de " +
      totalPaginas +
      ": " +
      rotuloPrimeiraPagina
    );
  }

  function prepararCapaFechada() {
    if (!primeiroSlide || !app) return;
    app.dataset.carta = "fechada";
    primeiroSlide.setAttribute("aria-label", "Capa da carta para " + nomeProfessor);
    var pagina = primeiroSlide.querySelector(".card");
    if (pagina) {
      pagina.setAttribute("inert", "");
      pagina.setAttribute("aria-hidden", "true");
    }
    var envelope = primeiroSlide.querySelector("[data-envelope]");
    if (envelope) {
      envelope.removeAttribute("inert");
      envelope.removeAttribute("aria-hidden");
    }
  }

  function finalizarAbertura(opcoes) {
    var op = opcoes || {};
    if (!primeiroSlide || !app) return;
    window.clearTimeout(estadoInterno.temporizadorAbertura);
    window.clearTimeout(estadoInterno.temporizadorPress);
    estadoInterno.abrindo = false;
    app.dataset.carta = "aberta";

    var envelope = primeiroSlide.querySelector("[data-envelope]");
    if (envelope) {
      envelope.setAttribute("inert", "");
      envelope.setAttribute("aria-hidden", "true");
    }
    var pagina = primeiroSlide.querySelector(".card");
    if (pagina) {
      pagina.removeAttribute("inert");
      pagina.removeAttribute("aria-hidden");
    }
    primeiroSlide.setAttribute("aria-label", rotuloPrimeiraPaginaAberta());
    atualizarIndicador();
    liberarNavegacao();

    if (
      !op.semFoco &&
      !document.body.classList.contains("leitura-aberta")
    ) {
      window.requestAnimationFrame(function () {
        primeiroSlide.focus({ preventScroll: true });
      });
    }
  }

  function liberarNavegacao() {
    if (!window.Reveal || !window.Reveal.configure) return;
    if (document.body.classList.contains("leitura-aberta")) {
      estadoInterno.pausada = true;
      return;
    }
    var aberta = app && app.dataset.carta === "aberta";
    if (!aberta || estadoInterno.pausada) return;
    window.Reveal.configure({ keyboard: true, touch: true });
  }

  /* O Reveal só liga/desliga o listener de hash no initialize; por isso a
     navegação por hash é controlada aqui, com a flag de pausa do modo leitura. */
  function alvoDoHash(valor) {
    var encontrado = /^#\/(\d+)/.exec(String(valor || ""));
    if (!encontrado) return 0;
    var alvo = parseInt(encontrado[1], 10);
    if (!isFinite(alvo) || alvo < 1 || alvo > totalPaginas) return 0;
    return alvo;
  }

  function irParaSlideDireto(indice) {
    var slides = document.querySelector(".reveal .slides");
    if (slides) slides.classList.add("disable-slide-transitions");
    window.Reveal.slide(indice, 0, 0);
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        if (slides) slides.classList.remove("disable-slide-transitions");
      });
    });
  }

  function aoMudarHash() {
    if (!app || !window.Reveal) return;
    if (estadoInterno.pausada) return;
    if (document.body.classList.contains("leitura-aberta")) return;
    var alvo = alvoDoHash(window.location.hash);
    if (!alvo) return;

    if (alvo === 1) {
      if (app.dataset.carta === "aberta" && window.Reveal.getIndices().h !== 0) {
        window.Reveal.slide(0);
      }
      return;
    }

    if (app.dataset.carta === "aberta") {
      if (window.Reveal.getIndices().h !== alvo - 1) {
        window.Reveal.slide(alvo - 1);
      }
      return;
    }

    if (app.dataset.carta === "fechada") {
      irParaSlideDireto(alvo - 1);
      finalizarAbertura({ semFoco: true });
    }
  }

  function antesDeTrocarPagina(evento) {
    if (!app || app.dataset.carta !== "aberta") return;
    if (estadoInterno.pausada) return;
    if (document.body.classList.contains("leitura-aberta")) return;
    if (!evento || typeof evento.indexh !== "number") return;
    if (reduzirMovimento()) return;

    if (estadoInterno.programatica) {
      estadoInterno.programatica = false;
      return;
    }

    if (estadoInterno.trocando) {
      evento.preventDefault();
      return;
    }

    var atual = window.Reveal.getCurrentSlide();
    var destino = window.Reveal.getSlide(evento.indexh, evento.indexv);
    if (!atual || !destino || destino === atual) return;

    evento.preventDefault();
    estadoInterno.trocando = true;
    atual.classList.add("slide-saindo");

    window.setTimeout(function () {
      estadoInterno.programatica = true;
      window.Reveal.slide(evento.indexh, evento.indexv);
      atual.classList.remove("slide-saindo");
      window.setTimeout(function () {
        estadoInterno.programatica = false;
      }, 0);
      window.setTimeout(function () {
        estadoInterno.trocando = false;
      }, DURACAO_TROCA_ENTRADA);
    }, DURACAO_TROCA_SAIDA + DURACAO_TROCA_PAUSA);
  }

  function reduzirMovimento() {
    return !!(
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function abrirCarta() {
    if (!primeiroSlide || !app) return;
    if (app.dataset.carta !== "fechada" || estadoInterno.abrindo) return;

    if (reduzirMovimento()) {
      app.dataset.carta = "aberta";
      finalizarAbertura({ semFoco: false });
      return;
    }

    estadoInterno.abrindo = true;
    var botao = primeiroSlide.querySelector("[data-open-card]");
    if (botao) botao.classList.add("is-pressed");

    estadoInterno.temporizadorPress = window.setTimeout(function () {
      if (!estadoInterno.abrindo) return;
      app.dataset.carta = "abrindo";
      var envelope = primeiroSlide.querySelector("[data-envelope]");
      if (envelope) {
        envelope.setAttribute("inert", "");
        envelope.setAttribute("aria-hidden", "true");
      }
      estadoInterno.temporizadorAbertura = window.setTimeout(
        finalizarAbertura,
        DURACAO_ABERTURA
      );
    }, DURACAO_PRESS);
  }

  function pausarNavegacao() {
    estadoInterno.pausada = true;
    if (window.Reveal && window.Reveal.configure) {
      window.Reveal.configure({ keyboard: false, touch: false });
    }
  }

  function retomarNavegacao() {
    estadoInterno.pausada = false;
    if (!window.Reveal || !window.Reveal.configure) return;
    liberarNavegacao();
  }

  function ligarBotoesCarta() {
    var botao = primeiroSlide
      ? primeiroSlide.querySelector("[data-open-card]")
      : null;
    if (botao) {
      botao.addEventListener("click", abrirCarta);
    }

    document.addEventListener("click", function (evento) {
      var controle = evento.target.closest
        ? evento.target.closest("[data-carta-nav]")
        : null;
      if (!controle || !app || app.dataset.carta !== "aberta") return;
      if (controle.disabled) return;
      evento.preventDefault();
      if (controle.getAttribute("data-carta-nav") === "prev") {
        window.Reveal.prev();
      } else {
        window.Reveal.next();
      }
    });
  }

  function iniciar() {
    var slug = document.body.getAttribute("data-professor");
    var lista = Array.isArray(window.DADOS) ? window.DADOS : null;
    if (!lista) {
      mostrarErro(
        "Os dados da carta não carregaram. Recarregue a página ou avise a Turma Ginga."
      );
      return;
    }

    var professor = null;
    for (var i = 0; i < lista.length; i += 1) {
      if (lista[i] && lista[i].slug === slug) {
        professor = lista[i];
        break;
      }
    }

    if (!professor) {
      mostrarErro(
        "O link pode estar incompleto ou a carta ainda não foi publicada. Confira o endereço e tente de novo."
      );
      return;
    }

    var acento = ACENTOS.indexOf(professor.acento) >= 0 ? professor.acento : "seal";
    document.body.setAttribute("data-acento", acento);
    nomeProfessor = professor.nome || "professor";

    var paginas = paginasEfetivas(professor);
    totalPaginas = paginas.length;
    var slidesEl = document.querySelector(".reveal .slides");
    if (!slidesEl) {
      mostrarErro("Não foi possível montar a carta. Recarregue a página.");
      return;
    }

    slidesEl.innerHTML = "";
    rotuloPrimeiraPagina = rotuloPagina(paginas[0], 1);
    primeiroSlide = criarPrimeiroSlide(
      paginas[0],
      professor,
      rotuloPrimeiraPagina
    );
    slidesEl.appendChild(primeiroSlide);

    for (var indice = 1; indice < paginas.length; indice += 1) {
      var pagina = paginas[indice];
      var rotulo = rotuloPagina(pagina, indice + 1);
      slidesEl.appendChild(
        criarPaginaComNav(
          paginaHtml(pagina, professor),
          rotulo,
          indice + 1,
          totalPaginas
        )
      );
    }

    ligarImagens();

    if (!window.Reveal) {
      mostrarErro(
        "O leitor do cartão não carregou. Recarregue a página ou avise a Turma Ginga."
      );
      return;
    }

    /* Guardamos o hash e o retiramos antes do initialize: o Reveal interpreta
       o hash por conta própria mesmo com respondToHashChanges: false. A leitura
       e a validação do link profundo são feitas abaixo, depois do ready. */
    var hashInicial = window.location.hash;
    if (hashInicial) {
      try {
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );
      } catch (erro) {
        /* Se o navegador bloquear, o Reveal ainda pode ler o hash. */
      }
    }

    window.Reveal.initialize({
      width: 1160,
      height: 820,
      margin: 0.02,
      minScale: 0.2,
      maxScale: 1.5,
      center: true,
      controls: false,
      progress: false,
      keyboard: false,
      touch: false,
      hash: false,
      hashOneBasedIndex: true,
      history: false,
      transition: "fade",
      transitionSpeed: "slow",
      autoSlide: 0,
      loop: false,
      backgroundTransition: "fade",
      autoAnimate: false,
      slideNumber: false,
      showNotes: false,
      help: false,
      pause: true,
      scrollActivationWidth: 0,
      respondToHashChanges: false,
    }).then(function () {
      atualizarIndicador();
      ligarBotoesCarta();
      window.Reveal.on("slidechanged", atualizarIndicador);
      window.Reveal.on("beforeslidechange", antesDeTrocarPagina);

      var alvoInicial = alvoDoHash(hashInicial);
      if (alvoInicial > 1) {
        irParaSlideDireto(alvoInicial - 1);
        finalizarAbertura({ semFoco: true });
      } else {
        prepararCapaFechada();
      }

      window.addEventListener("hashchange", aoMudarHash);

      if (app) app.dataset.estado = "pronto";

      window.Cartao = {
        professor: professor,
        paginas: paginas,
        reveal: window.Reveal,
        svgSelo: svgSelo,
        urlImagem: urlImagem,
        esc: esc,
        pausarNavegacao: pausarNavegacao,
        retomarNavegacao: retomarNavegacao,
        estaAberta: function () {
          return !!app && app.dataset.carta === "aberta";
        },
      };

      document.dispatchEvent(
        new CustomEvent("cartao:pronto", {
          detail: { professor: professor, paginas: professor.paginas },
        })
      );
    }).catch(function (erro) {
      mostrarErro(
        "Não foi possível abrir o cartão neste navegador. Recarregue a página ou tente outro navegador."
      );
      if (window.console && console.error) console.error(erro);
    });
  }

  try {
    iniciar();
  } catch (erro) {
    mostrarErro(
      "Algo deu errado ao abrir esta carta. Recarregue a página ou avise a Turma Ginga."
    );
    if (window.console && console.error) console.error(erro);
  }
})();
