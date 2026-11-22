/* Aureon - quando a pessoa está logada, troca "Entrar" por "Meu Perfil" e "Criar Conta" por "Sair".
   Use em todas as páginas (menos entrar.html e perfil.html). */
(() => {
  "use strict";

  const SUPABASE_URL = "https://lekomrszaspewopcokwg.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_5fi0MrkuA9nUyvC23fxpJQ_E2Nlkrbc";

  const ENTRAR = ["entrar", "login", "fazer login"];
  const CRIAR = ["criar conta", "cadastre-se", "cadastrar"];

  let db = null;
  let trocou = false;

  function achar(lista) {
    return [...document.querySelectorAll("a, button")].filter((el) =>
      lista.includes(el.textContent.trim().toLowerCase()) && !el.closest("form")
    );
  }

  function trocar(el, texto, aoClicar, href) {
    const novo = el.cloneNode(false);
    novo.textContent = texto;
    if (novo.tagName === "A") novo.setAttribute("href", href || "#");
    novo.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); aoClicar(); });
    el.replaceWith(novo);
    trocou = true;
  }

  function aplicar() {
    achar(ENTRAR).forEach((el) => trocar(el, "Meu Perfil", () => { location.href = "perfil.html"; }, "perfil.html"));
    achar(CRIAR).forEach((el) => trocar(el, "Sair", async () => { await db.auth.signOut(); location.reload(); }));
  }


  // Plano B: se o menu não tiver "Entrar", cria um botão flutuante no canto da tela
  function flutuante() {
    if (trocou || document.getElementById("aureon-flutuante")) return;
    const caixa = document.createElement("div");
    caixa.id = "aureon-flutuante";
    caixa.style.cssText = "position:fixed;top:12px;right:12px;z-index:99999;display:flex;gap:8px;font:14px 'Segoe UI',system-ui,sans-serif";
    const estilo = "padding:8px 16px;border-radius:999px;cursor:pointer;text-decoration:none;color:#14173f;background:linear-gradient(90deg,#9fe6ff,#d6a8ff);border:0;font:inherit;font-weight:600";
    const a = document.createElement("a");
    a.href = "perfil.html"; a.textContent = "Meu Perfil"; a.style.cssText = estilo;
    const b = document.createElement("button");
    b.type = "button"; b.textContent = "Sair"; b.style.cssText = estilo.replace("color:#14173f","color:#fff").replace(/background:[^;]+;/, "background:rgba(20,26,70,.9);") + ";border:1px solid #9fd8ff";
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
      // se o menu for montado depois por outro script, aplica de novo (por até 8 segundos)
      const obs = new MutationObserver(aplicar);
      obs.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => { obs.disconnect(); flutuante(); }, 1800);
    }).catch(() => {});
  }

  function carregar() {
    if (window.supabase) { iniciar(); return; }
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js";
    s.onload = iniciar;
    document.head.appendChild(s);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", carregar);
  else carregar();
})();
