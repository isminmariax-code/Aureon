/* Aureon v6 - quando a pessoa está logada, troca "Entrar" por "Meu Perfil" e "Criar Conta" por "Sair" no menu.
   Use em todas as páginas (menos entrar.html e perfil.html). Leve: troca uma vez e para. */
(() => {
  "use strict";
  if (window.__aureonSessao) return; // nunca roda duas vezes
  window.__aureonSessao = true;
  console.log("aureon-sessao v6");

  const SUPABASE_URL = "https://lekomrszaspewopcokwg.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_5fi0MrkuA9nUyvC23fxpJQ_E2Nlkrbc";

  const ENTRAR = ["entrar", "login", "fazer login"];
  const CRIAR = ["criar conta", "cadastre-se", "cadastrar"];

  let db = null;
  let trocou = false;
  const txt = (el) => (el.textContent || "").trim().toLowerCase();

  function tipoDe(el) {
    if (el.id === "bnt-login") return "entrar";
    if (el.id === "bnt-register") return "criar";
    const t = txt(el);
    if (CRIAR.includes(t)) return "criar";
    if (ENTRAR.includes(t)) return "entrar";
    if (el.tagName === "A" && t.length < 30) {
      const h = (el.getAttribute("href") || "").toLowerCase();
      if (h.includes("entrar.html")) return h.includes("cadastro") ? "criar" : "entrar";
    }
    return null;
  }

  function trocar(el, texto, aoClicar, href) {
    const novo = el.cloneNode(false);
    novo.removeAttribute("onclick");
    novo.dataset.aureon = "1"; // marca para nunca trocar duas vezes
    novo.textContent = texto;
    if (novo.tagName === "A") novo.setAttribute("href", href || "#");
    novo.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); aoClicar(); });
    el.replaceWith(novo);
    trocou = true;
  }

  function aplicar() {
    document.querySelectorAll("a, button, [role='button']").forEach((el) => {
      if (el.dataset.aureon === "1" || el.closest("#aureon-flutuante")) return;
      const f = el.closest("form");
      if (f && f.querySelector("input, textarea, select")) return; // formulários de verdade ficam como estão
      const tipo = tipoDe(el);
      if (tipo === "entrar") trocar(el, "Meu Perfil", () => { location.href = "perfil.html"; }, "perfil.html");
      else if (tipo === "criar") trocar(el, "Sair", async () => { await db.auth.signOut(); location.reload(); });
    });
  }

  // Plano B: se o menu não for encontrado, mostra botões pequenos no canto da tela
  function flutuante() {
    if (trocou || document.getElementById("aureon-flutuante")) return;
    const caixa = document.createElement("div");
    caixa.id = "aureon-flutuante";
    caixa.style.cssText = "position:fixed;top:12px;right:12px;z-index:99999;display:flex;gap:8px;font:14px 'Segoe UI',system-ui,sans-serif";
    const base = "appearance:none;outline:0;box-shadow:none;margin:0;padding:8px 16px;border-radius:999px;cursor:pointer;text-decoration:none;font:inherit;font-weight:600;line-height:1.2;";
    const a = document.createElement("a");
    a.href = "perfil.html"; a.textContent = "Meu Perfil";
    a.style.cssText = base + "color:#14173f;background:linear-gradient(90deg,#9fe6ff,#d6a8ff);border:0";
    const b = document.createElement("button");
    b.type = "button"; b.textContent = "Sair";
    b.style.cssText = base + "color:#fff;background:rgba(20,26,70,.95);border:1px solid #9fd8ff";
    b.addEventListener("click", async () => { await db.auth.signOut(); location.reload(); });
    caixa.append(a, b);
    document.body.appendChild(caixa);
  }

  function iniciar() {
    if (!window.supabase) return;
    db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    db.auth.getSession().then(({ data }) => {
      if (!data || !data.session) return;
      aplicar();
      if (trocou) return; // pronto: trocou uma vez e parou
      // menu montado depois por outro script: tenta algumas vezes e para
      let n = 0;
      const rep = setInterval(() => {
        aplicar();
        if (trocou || ++n >= 8) { clearInterval(rep); flutuante(); }
      }, 400);
    }).catch(() => {});
  }

  function carregar() {
    const st = document.createElement("style");
    st.textContent = "html,body{max-width:100%;overflow-x:hidden}";
    document.head.appendChild(st);
    if (window.supabase) { iniciar(); return; }
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js";
    s.async = true;
    s.onload = iniciar;
    document.head.appendChild(s);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", carregar);
  else carregar();
})();
