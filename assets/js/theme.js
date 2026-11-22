/* ==========================================================================
   Tema claro/escuro
   Carregado no <head>, antes do CSS, para evitar flash de tema.
   Preferência: localStorage ("cg-theme"); primeira visita: sistema.
   ========================================================================== */
(function () {
  "use strict";

  var STORAGE_KEY = "cg-theme";
  var root = document.documentElement;

  function lerPreferencia() {
    try {
      var salvo = window.localStorage.getItem(STORAGE_KEY);
      if (salvo === "light" || salvo === "dark") return salvo;
    } catch (erro) {
      /* localStorage pode estar bloqueado; segue o sistema. */
    }
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function temaAtual() {
    return root.dataset.theme === "dark" ? "dark" : "light";
  }

  function aplicar(tema, persistir) {
    var valor = tema === "dark" ? "dark" : "light";
    root.dataset.theme = valor;
    root.style.colorScheme = valor;

    if (persistir) {
      try {
        window.localStorage.setItem(STORAGE_KEY, valor);
      } catch (erro) {
        /* Sem persistência: o tema ainda vale para esta visita. */
      }
    }

    atualizarBotoes(valor);
    document.dispatchEvent(
      new CustomEvent("tema:alterado", { detail: { tema: valor } })
    );
  }

  function atualizarBotoes(tema) {
    var botoes = document.querySelectorAll("[data-theme-toggle]");
    for (var i = 0; i < botoes.length; i += 1) {
      var botao = botoes[i];
      var escuro = tema === "dark";
      botao.setAttribute("aria-pressed", escuro ? "true" : "false");
      botao.setAttribute(
        "aria-label",
        escuro ? "Ativar tema claro" : "Ativar tema escuro"
      );
      botao.setAttribute(
        "title",
        escuro ? "Ativar tema claro" : "Ativar tema escuro"
      );
    }
  }

  function alternar() {
    var proximo = temaAtual() === "dark" ? "light" : "dark";
    aplicar(proximo, true);
  }

  /* Aplica antes do primeiro paint. */
  aplicar(lerPreferencia(), false);

  /* Delegação: funciona também para botões criados depois. */
  document.addEventListener("click", function (evento) {
    var botao = evento.target.closest
      ? evento.target.closest("[data-theme-toggle]")
      : null;
    if (!botao) return;
    evento.preventDefault();
    alternar();
  });

  document.addEventListener("DOMContentLoaded", function () {
    atualizarBotoes(temaAtual());
  });

  /* Se o sistema mudar e a pessoa nunca escolheu manualmente, acompanha. */
  if (window.matchMedia) {
    var consulta = window.matchMedia("(prefers-color-scheme: dark)");
    var aoMudarSistema = function (evento) {
      var salvo = null;
      try {
        salvo = window.localStorage.getItem(STORAGE_KEY);
      } catch (erro) {
        salvo = null;
      }
      if (salvo !== "light" && salvo !== "dark") {
        aplicar(evento.matches ? "dark" : "light", false);
      }
    };
    if (consulta.addEventListener) {
      consulta.addEventListener("change", aoMudarSistema);
    } else if (consulta.addListener) {
      consulta.addListener(aoMudarSistema);
    }
  }

  window.Tema = {
    atual: temaAtual,
    aplicar: aplicar,
    alternar: alternar,
  };
})();
