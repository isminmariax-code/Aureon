/* Lyra, a guia do Aureon
   Chatbot gratuito e simples: roda só no navegador, sem servidor e sem chave de API.
   Para usar: <script src="lyra.js"></script> antes de </body> em cada página. */
(() => {
    "use strict";
    if (window.__lyra) return;
    window.__lyra = true;

    const reduzido = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // A página Explorar Cursos tinha um botão provisório de IA: a Lyra o substitui
    ["ia-btn", "ia-box"].forEach((id) => { const e = document.getElementById(id); if (e) e.remove(); });

    /* ---------- Estilo ---------- */
    const css = `
.lyra-root{position:fixed;right:1rem;bottom:1rem;z-index:1049;font-family:"Segoe UI",system-ui,sans-serif;font-size:15px;color:#fff}
.lyra-root *{box-sizing:border-box}
.lyra-root [hidden]{display:none!important}
.lyra-bt{position:relative;display:block;width:64px;height:64px;padding:0;margin-left:auto;border:1px solid rgba(160,190,255,.6);border-radius:50%;cursor:pointer;background:radial-gradient(circle,#1b2275,#0b1030);box-shadow:0 0 22px rgba(130,150,255,.55);transition:transform .25s,box-shadow .25s}
.lyra-bt:hover{transform:scale(1.08);box-shadow:0 0 32px rgba(190,150,255,.75)}
.lyra-bt::after{content:"";position:absolute;inset:-4px;border-radius:50%;border:2px solid rgba(170,150,255,.6);opacity:0;animation:lyra-onda 2.8s ease-out infinite;pointer-events:none}
@keyframes lyra-onda{from{transform:scale(1);opacity:.8}to{transform:scale(1.6);opacity:0}}
.lyra-orb{display:block;margin:auto;pointer-events:none}
.lyra-bt:focus-visible,.lyra-ic:focus-visible,.lyra-chip:focus-visible,.lyra-env:focus-visible,.lyra-input:focus-visible{outline:2px solid #fff;outline-offset:3px}
.lyra-balao{position:absolute;right:0;bottom:78px;width:max-content;max-width:230px;padding:.6rem .9rem;border-radius:14px 14px 4px 14px;background:#161c68;border:1px solid #9fd8ff;box-shadow:0 0 18px rgba(130,150,255,.4);animation:lyra-entra .5s both}
.lyra-janela{position:absolute;right:0;bottom:78px;width:min(380px,calc(100vw - 2rem));height:min(560px,calc(100vh - 8rem));height:min(560px,calc(100dvh - 8rem));display:flex;flex-direction:column;overflow:hidden;border-radius:20px;background:rgba(12,16,52,.95);border:1px solid rgba(150,185,255,.55);box-shadow:0 10px 40px rgba(0,0,0,.5),0 0 30px rgba(130,150,255,.3);backdrop-filter:blur(10px);opacity:0;transform:translateY(16px) scale(.92);transform-origin:bottom right;transition:opacity .25s,transform .25s}
.lyra-janela.aberta{opacity:1;transform:none}
.lyra-fundo{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.lyra-topo{position:relative;display:flex;align-items:center;gap:.7rem;padding:.7rem .9rem;background:linear-gradient(90deg,rgba(80,110,255,.35),rgba(190,120,240,.3));border-bottom:1px solid rgba(150,185,255,.35)}
.lyra-topo>div{flex:1;display:flex;flex-direction:column;line-height:1.25}
.lyra-topo small{color:#cfd2ff}
.lyra-ic{width:32px;height:32px;border:0;border-radius:50%;background:rgba(255,255,255,.12);color:#fff;font-size:1.1rem;cursor:pointer;transition:background .2s}
.lyra-ic:hover{background:rgba(255,255,255,.25)}
.lyra-msgs{position:relative;flex:1;overflow-y:auto;padding:.9rem;display:flex;flex-direction:column;gap:.6rem;scroll-behavior:smooth}
.lyra-msg{display:flex;flex-direction:column;gap:.4rem;max-width:88%;animation:lyra-entra .35s both}
.lyra-msg.bot{align-self:flex-start}
.lyra-msg.user{align-self:flex-end}
.lyra-bolha{padding:.6rem .85rem;border-radius:16px;white-space:pre-line;line-height:1.4;overflow-wrap:anywhere}
.bot .lyra-bolha{background:rgba(60,70,170,.55);border:1px solid rgba(150,185,255,.4);border-bottom-left-radius:4px}
.user .lyra-bolha{background:linear-gradient(90deg,#9fe6ff,#d6a8ff);color:#14173f;border-bottom-right-radius:4px}
.lyra-acoes{display:flex;flex-wrap:wrap;gap:.4rem}
.lyra-chip{padding:.35rem .8rem;border-radius:999px;border:1px solid #9fd8ff;background:rgba(10,14,45,.6);color:#fff;font:inherit;font-size:.86rem;cursor:pointer;text-decoration:none;transition:background .2s,transform .2s}
.lyra-chip:hover{background:rgba(159,216,255,.22);transform:translateY(-2px)}
.lyra-chip-link{border:0;font-weight:600;color:#14173f;background:linear-gradient(90deg,#9fe6ff,#d6a8ff)}
.lyra-chip-link:hover{background:linear-gradient(90deg,#9fe6ff,#d6a8ff);filter:brightness(1.1)}
.lyra-dig{display:flex;gap:5px;align-self:flex-start;padding:.75rem .9rem;border-radius:16px;background:rgba(60,70,170,.55);animation:lyra-entra .3s both}
.lyra-dig i{width:7px;height:7px;border-radius:50%;background:#cfd2ff;animation:lyra-pula 1s ease-in-out infinite}
.lyra-dig i:nth-child(2){animation-delay:.15s}
.lyra-dig i:nth-child(3){animation-delay:.3s}
@keyframes lyra-pula{0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-5px);opacity:1}}
.lyra-form{position:relative;display:flex;gap:.5rem;padding:.6rem .8rem;border-top:1px solid rgba(150,185,255,.3)}
.lyra-input{flex:1;min-width:0;padding:.55rem .9rem;border-radius:999px;border:1px solid rgba(160,190,255,.5);background:rgba(10,14,45,.7);color:#fff;font:inherit}
.lyra-input::placeholder{color:rgba(255,255,255,.55)}
.lyra-env{width:40px;height:40px;border:0;border-radius:50%;cursor:pointer;color:#14173f;background:linear-gradient(90deg,#9fe6ff,#d6a8ff);transition:transform .2s}
.lyra-env:hover{transform:scale(1.1) rotate(-8deg)}
.lyra-aviso{position:relative;margin:0;padding:0 .8rem .5rem;font-size:.72rem;text-align:center;color:rgba(255,255,255,.55)}
@keyframes lyra-entra{from{opacity:0;transform:translateY(10px) scale(.96)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.lyra-root *,.lyra-root *::before,.lyra-root *::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}}
`;
    const estilo = document.createElement("style");
    estilo.textContent = css;
    document.head.appendChild(estilo);

    /* ---------- Estrutura ---------- */
    const raiz = document.createElement("div");
    raiz.className = "lyra-root";
    raiz.innerHTML = `
<div class="lyra-balao" id="lyra-balao" hidden>Oi! Eu sou a Lyra ✨ Posso te ajudar?</div>
<section class="lyra-janela" id="lyra-janela" role="dialog" aria-label="Conversa com a Lyra" hidden>
    <canvas class="lyra-fundo" id="lyra-fundo" aria-hidden="true"></canvas>
    <header class="lyra-topo">
        <canvas id="lyra-mini" aria-hidden="true"></canvas>
        <div><strong>Lyra</strong><small>Sua guia no Aureon</small></div>
        <button type="button" class="lyra-ic" id="lyra-reiniciar" aria-label="Reiniciar conversa">↻</button>
        <button type="button" class="lyra-ic" id="lyra-fechar" aria-label="Fechar conversa">×</button>
    </header>
    <div class="lyra-msgs" id="lyra-msgs" role="log" aria-live="polite" aria-relevant="additions"></div>
    <form class="lyra-form" id="lyra-form" autocomplete="off">
        <input class="lyra-input" id="lyra-input" type="text" maxlength="200" placeholder="Escreva aqui…" aria-label="Sua mensagem">
        <button type="submit" class="lyra-env" aria-label="Enviar mensagem">➤</button>
    </form>
    <p class="lyra-aviso">A Lyra usa respostas prontas. Ela não é uma IA completa.</p>
</section>
<button type="button" class="lyra-bt" id="lyra-bt" aria-label="Abrir conversa com a Lyra" aria-expanded="false" aria-controls="lyra-janela"><canvas class="lyra-orb" id="lyra-orb" aria-hidden="true"></canvas></button>`;
    document.body.appendChild(raiz);

    const $ = (id) => document.getElementById(id);
    const bt = $("lyra-bt"), janela = $("lyra-janela"), msgs = $("lyra-msgs"), entrada = $("lyra-input"), balao = $("lyra-balao");

    /* ---------- Animação: núcleo de luz feito de partículas ---------- */
    function criarOrb(canvas, tam, n) {
        canvas.width = canvas.height = Math.round(tam * dpr);
        canvas.style.width = canvas.style.height = tam + "px";
        const ctx = canvas.getContext("2d");
        const ps = Array.from({ length: n }, (_, i) => ({ a: Math.random() * 6.283, r: 0.12 + Math.random() * 0.24, v: (0.3 + Math.random() * 0.7) * (i % 2 ? 1 : -1), f: Math.random() * 6.283, h: i % 2 ? 205 : 275, t: 0.8 + Math.random() * 1.4 }));
        return (tempo) => {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, tam, tam);
            ctx.globalCompositeOperation = "lighter";
            const c = tam / 2, raio = tam * 0.42 * (1 + 0.07 * Math.sin(tempo / 650));
            const g = ctx.createRadialGradient(c, c, 0, c, c, raio);
            g.addColorStop(0, "rgba(235,245,255,.95)");
            g.addColorStop(0.25, "rgba(150,190,255,.6)");
            g.addColorStop(0.6, "rgba(170,120,255,.25)");
            g.addColorStop(1, "rgba(120,100,255,0)");
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(c, c, raio, 0, 6.283); ctx.fill();
            ps.forEach((p) => {
                const ang = p.a + p.v * tempo / 1000, rr = p.r * tam * (1 + 0.12 * Math.sin(tempo / 900 + p.f));
                ctx.fillStyle = "hsla(" + p.h + ",90%,75%," + (0.5 + 0.4 * Math.sin(tempo / 500 + p.f)) + ")";
                ctx.beginPath(); ctx.arc(c + Math.cos(ang) * rr, c + Math.sin(ang) * rr * 0.75, p.t * (tam / 60), 0, 6.283); ctx.fill();
            });
            ctx.globalCompositeOperation = "source-over";
        };
    }
    // Pontinhos de luz que sobem devagar no fundo da janela
    function criarFundo(canvas) {
        const ctx = canvas.getContext("2d");
        const ps = Array.from({ length: 34 }, () => ({ x: Math.random(), y: Math.random(), v: 0.01 + Math.random() * 0.03, r: 0.6 + Math.random() * 1.4, f: Math.random() * 6.283 }));
        let w = 0, h = 0;
        const medir = () => { w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); };
        const desenhar = (tempo) => {
            if (!w) medir();
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, w, h);
            ps.forEach((p) => {
                const y = (((p.y - (tempo / 1000) * p.v) % 1) + 1) % 1;
                ctx.fillStyle = "rgba(190,200,255," + (0.25 + 0.35 * Math.sin(tempo / 700 + p.f) ** 2) + ")";
                ctx.beginPath(); ctx.arc(p.x * w, y * h, p.r, 0, 6.283); ctx.fill();
            });
        };
        return { desenhar, medir };
    }
    const orb = criarOrb($("lyra-orb"), 56, 26);
    const mini = criarOrb($("lyra-mini"), 38, 16);
    const fundo = criarFundo($("lyra-fundo"));
    let aberto = false;
    function quadro(t) {
        orb(t);
        if (aberto) { mini(t); fundo.desenhar(t); }
        if (!reduzido) requestAnimationFrame(quadro);
    }
    quadro(0);

    /* ---------- Respostas da Lyra ---------- */
    let nome = "";
    try { nome = localStorage.getItem("lyra-nome") || ""; } catch (e) { /* segue sem lembrar */ }
    const RAPIDAS = [{ t: "Explorar novas áreas" }, { t: "Aprender rapidamente" }, { t: "Preciso de foco" }, { t: "Estou sem motivação" }];
    const L = {
        explorar: { t: "Abrir Explorar Cursos", link: "explorar-cursos.html" },
        comunidade: { t: "Ir para a Comunidade", link: "comunidade.html" },
        habilidades: { t: "Ver Minhas Habilidades", link: "minhas-habilidades.html" },
        conta: { t: "Criar minha conta", link: "entrar.html#cadastro" },
        entrar: { t: "Entrar", link: "entrar.html" }
    };
    const RESP = {
        boasVindas: () => ({ t: "Olá" + (nome ? ", " + nome : "") + " ✨\nEu sou a Lyra, a guia do Aureon. Como você gostaria de aprender hoje?", a: RAPIDAS }),
        saudacao: () => ({ t: "Olá" + (nome ? ", " + nome : "") + "! Como posso ajudar hoje?", a: RAPIDAS }),
        areas: () => ({ t: "Que bom! Aqui vão três caminhos para descobrir:\n• Psicologia Cognitiva: como pensamos e decidimos\n• Arte Generativa: arte criada com código\n• Música e Algoritmos: som e lógica juntos\nNo Explorar Cursos, o botão Surpreenda-me escolhe uma descoberta para você.", a: [L.explorar, { t: "Aprender rapidamente" }] }),
        rapido: () => ({ t: "Para pouco tempo, escolha cursos curtos: Storytelling para Vídeo (30 min), Figma do Zero (45 min) e Gestão Ágil na Prática (1 h). No Explorar Cursos, ative o filtro “Tenho pouco tempo”.\nDica: estudar 15 minutos por dia rende mais do que uma maratona rara.", a: [L.explorar, { t: "Preciso de foco" }] }),
        foco: () => ({ t: "Vamos organizar o seu foco:\n1. Escolha uma única tarefa\n2. Silencie o celular\n3. Estude 25 minutos e descanse 5 (método Pomodoro)\n4. Depois de 3 rodadas, faça uma pausa maior\nSe a tarefa parecer enorme, divida em partes de 10 minutos.", a: [{ t: "Estou sem motivação" }, { t: "Aprender rapidamente" }] }),
        motivacao: () => ({ t: "Isso acontece com todo mundo, e você não está sozinho(a). 💜\nTente a regra dos 10 minutos: comece só por 10 e depois decida se quer continuar. Comemore cada pequena vitória e lembre por que você começou.\nSe quiser, converse com outras pessoas na Comunidade.", a: [L.comunidade, { t: "Preciso de foco" }] }),
        crise: () => ({ t: "Sinto muito que você esteja sofrendo assim. Você importa, e não precisa passar por isso sozinho(a).\nPor favor, fale agora com alguém de confiança. No Brasil, o CVV atende 24 horas pelo telefone 188 (ligação gratuita). Se houver risco imediato, ligue 192 (SAMU) ou procure o pronto-socorro mais próximo.", a: [] }),
        como: () => ({ t: "O Aureon é uma plataforma web para universitários trocarem habilidades e receberem orientação acadêmica personalizada. Você explora cursos, mapeia suas habilidades, segue caminhos de aprendizagem e conversa com a comunidade. Eu sou a Lyra: te guio e sugiro por onde ir. ✨", a: [L.explorar, L.habilidades] }),
        conta: () => ({ t: "Para criar a sua conta, abra a tela de cadastro: você escolhe se é aluno(a) ou professor(a), preenche seus dados e marca seus interesses. Nesta versão de demonstração, nada é salvo.", a: [L.conta, L.entrar] }),
        comunidade: () => ({ t: "Na Comunidade você faz perguntas por área, responde dúvidas de colegas e acompanha os Top Contribuidores.", a: [L.comunidade] }),
        habilidades: () => ({ t: "Em Minhas Habilidades você vê o mapa de estrelas com o que já aprendeu, o que está aprendendo e o que ainda não começou, além do painel de evolução e das medalhas.", a: [L.habilidades] }),
        cursos: () => ({ t: "Temos cursos em Programação Criativa, Design de Interface, Arte Generativa, Edição de Vídeo, Música Digital, Web3, Gestão Ágil e Psicologia Cognitiva. Use a pesquisa e os filtros para achar o ideal para você.", a: [L.explorar, { t: "Explorar novas áreas" }] }),
        certificado: () => ({ t: "Os certificados fazem parte dos planos do Aureon. Como esta é uma versão de demonstração, eles ainda não são emitidos.", a: [] }),
        preco: () => ({ t: "Nesta versão, tudo no Aureon é gratuito: é um projeto acadêmico de demonstração.", a: [L.explorar] }),
        obrigado: () => ({ t: "Por nada! Estou aqui sempre que precisar. ✨", a: [] }),
        tchau: () => ({ t: "Até logo! Bons estudos. ✨", a: [] }),
        fallback: () => ({ t: "Ainda estou aprendendo e não entendi muito bem. 😊 Posso ajudar com cursos, habilidades, comunidade, foco e motivação. O que você prefere?", a: RAPIDAS })
    };
    // "$" no fim = palavra inteira; sem "$" = começo de palavra
    const INTENCOES = [
        { r: "saudacao", k: ["oi$", "ola$", "opa$", "bom dia", "boa tarde", "boa noite", "e ai$", "hello$"] },
        { r: "areas", k: ["explorar", "nova area", "novas area", "area$", "areas$", "descobr", "surpreend", "sugest", "o que estudar", "o que aprender", "por onde comec"] },
        { r: "rapido", k: ["rapid", "pouco tempo", "curto", "sem tempo", "microaprend", "minutos", "pressa"] },
        { r: "foco", k: ["foco", "concentr", "distra", "procrastin", "produtiv"] },
        { r: "motivacao", k: ["motiva", "desanim", "sem vontade", "cansad", "preguic", "nao consigo", "dificil", "travad", "ansios", "estress"] },
        { r: "como", k: ["como funciona", "o que e o aureon", "sobre o aureon", "aureon", "plataforma", "quem e voce", "o que voce faz"] },
        { r: "conta", k: ["conta", "cadastr", "registr", "inscrev", "login", "entrar", "senha"] },
        { r: "comunidade", k: ["comunidade", "pergunta", "duvida", "colega", "forum"] },
        { r: "habilidades", k: ["habilidade", "progresso", "nivel", "conquista", "medalha", "mapa"] },
        { r: "cursos", k: ["curso", "aula", "estudar", "programa", "python", "design", "figma", "video", "arte", "musica", "web3", "gestao", "psicolog"] },
        { r: "certificado", k: ["certificad", "diploma"] },
        { r: "preco", k: ["gratis", "gratuito", "preco", "pago$", "custa", "valor", "pagar"] },
        { r: "obrigado", k: ["obrigad", "valeu", "brigad"] },
        { r: "tchau", k: ["tchau", "ate logo", "ate mais", "adeus"] }
    ].map((i) => ({ r: i.r, res: i.k.map((k) => k.endsWith("$") ? new RegExp("(^|[^a-z0-9])" + k.slice(0, -1) + "($|[^a-z0-9])") : new RegExp("(^|[^a-z0-9])" + k)) }));
    const CRISE = ["suicid", "me matar", "quero morrer", "nao quero viver", "nao quero mais viver", "acabar com minha vida", "tirar minha vida", "me machucar", "automutil", "me cortar"].map((k) => new RegExp(k));
    const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    function interpretar(texto) {
        const apresentou = texto.match(/(?:meu nome (?:é|e)|me chamo|pode me chamar de)\s+(\p{L}{2,20})/iu);
        if (apresentou) {
            nome = apresentou[1].charAt(0).toUpperCase() + apresentou[1].slice(1).toLowerCase();
            try { localStorage.setItem("lyra-nome", nome); } catch (e) { /* segue sem lembrar */ }
            return { t: "Prazer, " + nome + "! ✨ Vou lembrar do seu nome neste navegador. Como posso ajudar?", a: RAPIDAS };
        }
        const n = norm(texto);
        if (CRISE.some((r) => r.test(n))) return RESP.crise();
        let melhor = null, max = 0;
        INTENCOES.forEach((i) => { const s = i.res.filter((r) => r.test(n)).length; if (s > max) { max = s; melhor = i; } });
        return melhor ? RESP[melhor.r]() : RESP.fallback();
    }

    /* ---------- Conversa ---------- */
    function el(tag, cls, txt) { const e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; }
    const espera = (ms) => new Promise((ok) => setTimeout(ok, reduzido ? 120 : ms));
    let cadeia = Promise.resolve(), geracao = 0;

    function rolar() { msgs.scrollTop = msgs.scrollHeight; }
    function addMsg(quem, texto, acoes) {
        const m = el("div", "lyra-msg " + quem);
        m.appendChild(el("div", "lyra-bolha", texto));
        if (acoes && acoes.length) {
            const a = el("div", "lyra-acoes");
            acoes.forEach((ac) => {
                if (ac.link) { const l = el("a", "lyra-chip lyra-chip-link", ac.t); l.href = ac.link; a.appendChild(l); }
                else { const b = el("button", "lyra-chip", ac.t); b.type = "button"; b.onclick = () => enviar(ac.t); a.appendChild(b); }
            });
            m.appendChild(a);
        }
        msgs.appendChild(m);
        rolar();
    }
    function falar(r) {
        const g = geracao;
        cadeia = cadeia.then(async () => {
            if (g !== geracao) return;
            const d = el("div", "lyra-dig");
            d.innerHTML = "<i></i><i></i><i></i>";
            d.setAttribute("aria-hidden", "true");
            msgs.appendChild(d); rolar();
            await espera(Math.min(1300, 500 + r.t.length * 8));
            d.remove();
            if (g === geracao) addMsg("bot", r.t, r.a);
        }).catch(() => { /* a conversa continua mesmo se algo falhar */ });
    }
    function enviar(texto) {
        texto = String(texto).trim().slice(0, 200);
        if (!texto) return;
        msgs.querySelectorAll(".lyra-acoes").forEach((a) => a.remove());
        addMsg("user", texto);
        falar(interpretar(texto));
    }

    /* ---------- Abrir e fechar ---------- */
    let iniciado = false;
    function abrir() {
        if (aberto) return;
        aberto = true;
        balao.hidden = true;
        janela.hidden = false;
        void janela.offsetWidth;
        janela.classList.add("aberta");
        bt.setAttribute("aria-expanded", "true");
        bt.setAttribute("aria-label", "Fechar conversa com a Lyra");
        fundo.medir();
        if (reduzido) { mini(0); fundo.desenhar(0); }
        if (!iniciado) { iniciado = true; falar(RESP.boasVindas()); }
        entrada.focus({ preventScroll: true });
    }
    function fechar(voltarFoco) {
        if (!aberto) return;
        aberto = false;
        janela.classList.remove("aberta");
        bt.setAttribute("aria-expanded", "false");
        bt.setAttribute("aria-label", "Abrir conversa com a Lyra");
        setTimeout(() => { if (!aberto) janela.hidden = true; }, 280);
        if (voltarFoco) bt.focus();
    }
    bt.addEventListener("click", () => (aberto ? fechar(false) : abrir()));
    $("lyra-fechar").addEventListener("click", () => fechar(true));
    $("lyra-reiniciar").addEventListener("click", () => {
        geracao++;
        cadeia = Promise.resolve();
        msgs.replaceChildren();
        falar(RESP.boasVindas());
        entrada.focus({ preventScroll: true });
    });
    janela.addEventListener("keydown", (e) => { if (e.key === "Escape") fechar(true); });
    window.addEventListener("resize", () => { if (aberto) fundo.medir(); });
    $("lyra-form").addEventListener("submit", (e) => {
        e.preventDefault();
        enviar(entrada.value);
        entrada.value = "";
    });
    window.Lyra = { abrir, fechar };

    // Convite discreto, uma vez por visita
    try {
        if (!sessionStorage.getItem("lyra-convite")) {
            sessionStorage.setItem("lyra-convite", "1");
            setTimeout(() => { if (!aberto) { balao.hidden = false; setTimeout(() => { balao.hidden = true; }, 7000); } }, 3500);
        }
    } catch (e) { /* sem convite */ }
})();
