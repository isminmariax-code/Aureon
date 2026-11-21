/* Aureon - troca "Entrar / Criar Conta" por "Meu Perfil / Sair" quando a pessoa está logada.
   Use em qualquer página (menos entrar.html e perfil.html). */
(() => {
  "use strict";

  // ===== COLE AQUI A MESMA URL E CHAVE ANON DO entrar.html =====
  const SUPABASE_URL = "https://lekomrszaspewopcokwg.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_5fi0MrkuA9nUyvC23fxpJQ_E2Nlkrbc";
  // =============================================================

  if (SUPABASE_URL.startsWith("COLE")) return;

  // Acha o botão/link pelo texto exato (ignora maiúsculas)
  function achar(texto) {
    return [...document.querySelectorAll("a, button")].filter((el) =>
      el.textContent.trim().toLowerCase() === texto && !el.closest("form")
    );
  }

  // Troca o elemento por uma cópia limpa (remove ações antigas) com novo texto e ação
  function trocar(el, texto, aoClicar, href) {
    const novo = el.cloneNode(false);
    novo.textContent = texto;
    if (novo.tagName === "A") novo.setAttribute("href", href || "#");
    novo.addEventListener("click", (e) => { e.preventDefault(); aoClicar(); });
    el.replaceWith(novo);
    return novo;
  }

  function iniciar() {
    const lib = window.supabase;
    if (!lib) return;
    const db = lib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    db.auth.getSession().then(({ data }) => {
      if (!data || !data.session) return;
      achar("entrar").forEach((el) => trocar(el, "Meu Perfil", () => { location.href = "perfil.html"; }, "perfil.html"));
      achar("criar conta").forEach((el) => trocar(el, "Sair", async () => { await db.auth.signOut(); location.reload(); }));
    }).catch(() => { /* se falhar, mantém os botões originais */ });
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
