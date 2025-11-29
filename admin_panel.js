const http = require('http');
const fs = require('fs');
const path = require('path');
const { getResumoUso, gerarConquistas, resetUser } = require('./conquistas');
const { getAdminState, setBlocked, queueReply, resetUserData } = require('./admin_actions');
const config = require('./config');

function gerarHtmlShell() {
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${config.bot.adminPageTitle}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background: #020617; color: #e5e7eb; font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 14px; }
    header { padding: 16px 24px; background: #000; border-bottom: 1px solid #22c55e33; display: flex; align-items: center; justify-content: space-between; }
    header h1 { margin: 0; font-size: 20px; color: #22c55e; letter-spacing: 0.12em; text-transform: uppercase; }
    header span { font-size: 12px; color: #6b7280; }
    main { padding: 16px 24px 24px; display: grid; grid-template-columns: minmax(0, 3.2fr) minmax(320px, 1.6fr); gap: 16px; }
    .panel { background: radial-gradient(circle at top left, #022c22 0, #020617 45%, #000 100%); border-radius: 10px; border: 1px solid #22c55e33; padding: 12px 14px; box-shadow: 0 0 0 1px #000; }
    .panel-title { font-size: 13px; color: #a3e635; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.14em; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-bottom: 10px; }
    .metric { padding: 8px 10px; background: #020617; border-radius: 8px; border: 1px solid #22c55e22; font-size: 12px; }
    .metric-label { color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; }
    .metric-value { font-size: 20px; color: #bbf7d0; }
    .metric-sub { font-size: 11px; color: #4b5563; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 6px; }
    th, td { padding: 6px 8px; text-align: left; white-space: nowrap; }
    thead tr { background: #022c22; }
    tbody tr:nth-child(even) { background: #020617; }
    tbody tr:nth-child(odd) { background: #030712; }
    th { font-weight: 500; font-size: 10px; color: #a3e635; border-bottom: 1px solid #22c55e33; }
    td { border-bottom: 1px solid #020617; }
    .badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 999px; font-size: 11px; background: #022c22; color: #bbf7d0; border: 1px solid #22c55e66; }
    .badge-dot { width: 6px; height: 6px; border-radius: 999px; background: #22c55e; margin-right: 4px; animation: pulse 1.5s infinite; }
    .muted { color: #6b7280; font-size: 10px; }
    .actions { display: flex; gap: 4px; align-items: center; }
    button { cursor: pointer; border-radius: 4px; border: 1px solid #22c55e66; background: #022c22; color: #bbf7d0; font-size: 10px; padding: 3px 6px; font-family: inherit; }
    button.danger { border-color: #ef4444aa; background: #450a0a; color: #fecaca; }
    button:disabled { opacity: 0.4; cursor: default; }
    .log { height: 220px; background: #020617; border-radius: 8px; border: 1px solid #111827; padding: 8px 10px; font-size: 12px; overflow-y: auto; }
    .log-line { white-space: pre-wrap; }
    .log-line span.time { color: #6b7280; margin-right: 4px; }
    .log-line span.tag { color: #22c55e; margin-right: 4px; }
    .reply-form { display: flex; flex-direction: column; gap: 4px; margin-top: 6px; }
    .reply-form textarea { resize: vertical; min-height: 60px; max-height: 140px; border-radius: 4px; border: 1px solid #111827; background: #020617; color: #e5e7eb; font-size: 12px; padding: 6px 8px; font-family: inherit; }
    .reply-form-footer { display: flex; justify-content: space-between; align-items: center; gap: 4px; }
    .reply-form-footer button { flex-shrink: 0; }
    .reply-target { font-size: 10px; color: #9ca3af; }
    .pill { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 999px; border: 1px solid #374151; font-size: 11px; color: #9ca3af; }
    @keyframes pulse { 0%, 100% { opacity: 0.4; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1); } }
    /* Cards de usuários (substituem a visão de ranking detalhado) */
    .user-cards { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 10px; max-height: 360px; overflow-y: auto; }
    .user-card { flex: 1 1 280px; min-width: 280px; max-width: 360px; background: #020617; border-radius: 8px; border: 1px solid #1f2937; padding: 8px 10px; font-size: 12px; }
    .user-card.alvo { border-color: #8b5cf6; box-shadow: 0 0 14px #8b5cf6aa; position: relative; }
    .user-card-alvo-banner { position: absolute; top: -8px; right: 8px; background: linear-gradient(90deg,#8b5cf6,#ec4899); color: #0b1120; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: bold; border: 1px solid #c4b5fd; }
    .user-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .user-card-left { display: flex; align-items: center; gap: 6px; }
    .user-avatar { width: 26px; height: 26px; border-radius: 999px; background: #022c22; border: 1px solid #16a34a66; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #bbf7d0; }
    .user-card-id { font-size: 11px; color: #e5e7eb; }
    .user-card-badges { display: flex; gap: 4px; font-size: 10px; align-items: center; }
    .user-card-badge { padding: 1px 6px; border-radius: 999px; border: 1px solid #374151; color: #9ca3af; }
    .user-card-badge.blocked { border-color: #b91c1c; color: #fecaca; }
    .user-card-stat { font-size: 11px; color: #9ca3af; }
    .user-card-progress { font-size: 11px; color: #a3e635; margin-top: 2px; }
    .user-card-messages { margin-top: 4px; font-size: 11px; color: #9ca3af; max-height: 90px; overflow-y: auto; }
    .user-card-messages div { white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
    @media (max-width: 900px) { main { grid-template-columns: minmax(0, 1fr); } }
  </style>
</head>
<body>
  <header>
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="width:32px;height:32px;border-radius:999px;overflow:hidden;border:1px solid #22c55e66;background:#020617;flex-shrink:0;">
        <img src="/bot-avatar" alt="Bot" style="width:100%;height:100%;object-fit:cover;display:block;" />
      </div>
      <div>
        <h1>${config.bot.adminConsoleTitle}</h1>
        <span id="subtitle">aguardando dados...</span>
      </div>
    </div>
    <span class="badge"><span class="badge-dot"></span>ONLINE</span>
  </header>
  <main>
    <section class="panel" id="stats-panel">
      <div class="panel-title">[ METRICS ]</div>
      <div class="metrics" id="metrics"></div>
      <div class="muted" style="margin-top:4px;">auto refresh ~3s | dados em memória do processo atual</div>
      <div style="margin-top:8px; font-size:11px; color:#9ca3af;">Usuários (ranking + detalhes)</div>
      <div class="user-cards" id="user-cards"></div>
    </section>
    <section class="panel" id="control-panel">
      <div class="panel-title">[ CONSOLE ]</div>
      <div class="pill" id="summary-pill">usuarios: 0 | interações: 0</div>
      <div class="log" id="log"></div>
      <div class="reply-form">
        <div class="reply-target" id="reply-target">sem alvo selecionado</div>
        <textarea id="reply-text" placeholder="Digite uma resposta manual para enviar via bot..."></textarea>
        <div class="reply-form-footer">
          <span class="muted" id="reply-hint">clique em "resp" em um usuário para definir o alvo</span>
          <button id="reply-send" disabled>ENVIAR</button>
        </div>
      </div>
    </section>
  </main>
  <script>
    const state = {
      data: null,
      selectedUser: null,
      lastLogLines: []
    };

    function log(line) {
      const logEl = document.getElementById('log');
      const now = new Date();
      const time = now.toLocaleTimeString('pt-BR', { hour12: false });
      const div = document.createElement('div');
      div.className = 'log-line';
      div.innerHTML = '<span class="time">[' + time + ']</span><span class="tag">admin</span><span>' + line + '</span>';
      logEl.appendChild(div);
      logEl.scrollTop = logEl.scrollHeight;
    }

    async function fetchData() {
      try {
        const res = await fetch('/api/usage', { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        state.data = json;
        renderFromData();
      } catch (e) {
        log('erro ao buscar dados: ' + e.message);
      }
    }

    function renderFromData() {
      const d = state.data;
      if (!d) return;
      const usuarios = d.usuarios || [];
      const totais = d.totaisGerais || { total: 0, piadas: 0, figurinhas: 0, jogos: 0, motivacionais: 0, destinos: 0, menus: 0 };
      const blocked = new Set(d.blocked || []);
      const history = d.history || {};
      const subtitle = document.getElementById('subtitle');
      subtitle.textContent = 'usuarios: ' + usuarios.length + ' | interações: ' + totais.total;

      const metricsEl = document.getElementById('metrics');
      metricsEl.innerHTML = '';
      const addMetric = function(label, value, sub) {
        const div = document.createElement('div');
        div.className = 'metric';
        let html = '<div class="metric-label">' + label + '</div>' +
          '<div class="metric-value">' + value + '</div>';
        if (sub) {
          html += '<div class="metric-sub">' + sub + '</div>';
        }
        div.innerHTML = html;
        metricsEl.appendChild(div);
      };
      addMetric('TOTAL', totais.total, 'todas as interações');
      addMetric('USUÁRIOS', usuarios.length, 'contatos únicos');
      addMetric('PIADAS', totais.piadas, 'opção 1');
      addMetric('FIGURINHAS', totais.figurinhas, 'mídia -> sticker');
      addMetric('JOGOS', totais.jogos, 'jogo da velha');
      addMetric('MOTIVACIONAIS', totais.motivacionais, 'opção 3');
      addMetric('DESTINOS', totais.destinos, 'opção 4');
      addMetric('MENUS', totais.menus, 'aberturas de menu');

      document.getElementById('summary-pill').textContent = 'usuarios: ' + usuarios.length + ' | interações: ' + totais.total;

      // Cards dinâmicos de usuário (incluem info de ranking + ações)
      const cardsEl = document.getElementById('user-cards');
      if (!cardsEl) return;
      cardsEl.innerHTML = '';
      if (!usuarios.length) {
        const empty = document.createElement('div');
        empty.className = 'muted';
        empty.textContent = 'Nenhum uso registrado ainda.';
        cardsEl.appendChild(empty);
        return;
      }

      const meuAmorId = '${config.owner.targetNumber}';

      usuarios.forEach(function(u, index) {
        const logs = history[u.id] || [];

        const card = document.createElement('div');
        card.className = 'user-card';

        const isAlvo = u.id === meuAmorId;
        if (isAlvo) {
          card.classList.add('alvo');
          const banner = document.createElement('div');
          banner.className = 'user-card-alvo-banner';
          banner.textContent = '${config.bot.adminLoveBanner}';
          card.appendChild(banner);
        }

        const header = document.createElement('div');
        header.className = 'user-card-header';

        const left = document.createElement('div');
        left.className = 'user-card-left';

        const avatar = document.createElement('div');
        avatar.className = 'user-avatar';
        const initials = (u.id || '?').replace(/@.+$/, '').slice(-4);
        avatar.textContent = initials;

        const idSpan = document.createElement('span');
        idSpan.className = 'user-card-id';
        idSpan.textContent = '#' + (index + 1) + ' • ' + u.id;

        left.appendChild(avatar);
        left.appendChild(idSpan);

        const badges = document.createElement('div');
        badges.className = 'user-card-badges';

        const totalSpan = document.createElement('span');
        totalSpan.className = 'user-card-badge';
        totalSpan.textContent = 'total: ' + u.total;
        const jogosSpan = document.createElement('span');
        jogosSpan.className = 'user-card-badge';
        jogosSpan.textContent = 'jogos: ' + u.jogos;
        const blockSpan = document.createElement('span');
        blockSpan.className = 'user-card-badge' + (blocked.has(u.id) ? ' blocked' : '');
        blockSpan.textContent = blocked.has(u.id) ? 'BLOCK' : 'OK';
        badges.appendChild(totalSpan);
        badges.appendChild(jogosSpan);
        badges.appendChild(blockSpan);

        header.appendChild(left);
        header.appendChild(badges);

        const stats = document.createElement('div');
        stats.className = 'user-card-stat';
        stats.textContent = 'piadas ' + u.piadas + ' • fig ' + u.figurinhas + ' • motiv ' + u.motivacionais + ' • destino ' + u.destinos + ' • menu ' + u.menus;

        const progress = document.createElement('div');
        progress.className = 'user-card-progress';
        if (u.conquistasResumo) {
          progress.textContent = u.conquistasResumo;
        } else {
          progress.textContent = 'sem conquistas ainda.';
        }

        const msgs = document.createElement('div');
        msgs.className = 'user-card-messages';
        if (!logs.length) {
          const line = document.createElement('div');
          line.textContent = 'sem histórico de mensagens ainda.';
          msgs.appendChild(line);
        } else {
          logs.slice().reverse().forEach(function(item) {
            const line = document.createElement('div');
            line.textContent = item.text || '(vazio)';
            msgs.appendChild(line);
          });
        }

        const actions = document.createElement('div');
        actions.className = 'actions';
        const blockBtn = document.createElement('button');
        const isBlockedUser = blocked.has(u.id);
        blockBtn.textContent = isBlockedUser ? 'UNBLOCK' : 'BLOCK';
        if (isBlockedUser) blockBtn.classList.add('danger');
        blockBtn.onclick = function() { toggleBlock(u.id, !isBlockedUser); };

        const replyBtn = document.createElement('button');
        replyBtn.textContent = 'RESP';
        replyBtn.onclick = function() { selectUserForReply(u.id); };

        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'RESET';
        resetBtn.onclick = function() { resetUserFromPanel(u.id); };

        actions.appendChild(blockBtn);
        actions.appendChild(replyBtn);
        actions.appendChild(resetBtn);

        card.appendChild(header);
        card.appendChild(stats);
        card.appendChild(progress);
        card.appendChild(msgs);
        card.appendChild(actions);
        cardsEl.appendChild(card);
      });
    }

    async function resetUserFromPanel(id) {
      if (!id) return;
      try {
        await fetch('/api/reset-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: id })
        });
        log('reset de progresso para ' + id);
        fetchData();
      } catch (e) {
        log('erro ao resetar usuário: ' + e.message);
      }
    }

    async function toggleBlock(id, block) {
      try {
        await fetch('/api/block', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: id, block: block })
        });
        log((block ? 'bloqueando ' : 'desbloqueando ') + id);
        fetchData();
      } catch (e) {
        log('erro ao alterar bloqueio: ' + e.message);
      }
    }

    function selectUserForReply(id) {
      state.selectedUser = id;
      document.getElementById('reply-target').textContent = 'alvo: ' + id;
      document.getElementById('reply-hint').textContent = 'mensagem será enviada via WhatsApp pelo bot';
      document.getElementById('reply-send').disabled = false;
      log('alvo de resposta selecionado: ' + id);
    }

    async function sendReply() {
      const target = state.selectedUser;
      const textEl = document.getElementById('reply-text');
      const msg = textEl.value.trim();
      if (!target || !msg) return;
      try {
        await fetch('/api/reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: target, message: msg })
        });
        log('fila -> resposta manual para ' + target);
        textEl.value = '';
      } catch (e) {
        log('erro ao enfileirar resposta: ' + e.message);
      }
    }

    document.addEventListener('DOMContentLoaded', () => {
      document.getElementById('reply-send').addEventListener('click', sendReply);
      fetchData();
      setInterval(fetchData, 3000);
      log('console iniciado');
    });
  </script>
</body>
</html>`;

  return html;
}

function startAdminPanel(port = 3000) {
  const server = http.createServer((req, res) => {
    const ip = req.socket.remoteAddress;
    console.log(`[admin-panel] Requisição recebida: ${req.method} ${req.url} de ${ip}`);

    if (req.method === 'GET' && req.url === '/bot-avatar') {
      try {
        const imgPath = path.join(__dirname, 'assets', 'menu', 'bot.jpg');
        const stream = fs.createReadStream(imgPath);
        stream.on('error', () => {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('bot avatar not found');
        });
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        stream.pipe(res);
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('error loading bot avatar');
      }
      return;
    }

    if (req.method === 'POST' && req.url === '/api/reset-user') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}');
          if (parsed.id) {
            resetUser(parsed.id);
            resetUserData(parsed.id);
          }
          res.writeHead(204, {
            'Access-Control-Allow-Origin': '*'
          });
          res.end();
        } catch (e) {
          res.writeHead(400, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({ error: 'invalid body' }));
        }
      });
      return;
    }

    if (req.method === 'GET' && req.url === '/api/usage') {
      const { usuarios, totaisGerais } = getResumoUso();
      const adminState = getAdminState();
      const withConquistas = usuarios.map((u) => {
        const conquistasTexto = gerarConquistas(u.id).split('\n')[0] || '';
        return { ...u, conquistasResumo: conquistasTexto };
      });
      const payload = {
        usuarios: withConquistas,
        totaisGerais,
        blocked: adminState.blocked,
        pendingReplies: adminState.pendingReplies,
        history: adminState.history
      };
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify(payload));
      return;
    }

    if (req.method === 'POST' && req.url === '/api/block') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}');
          setBlocked(parsed.id, !!parsed.block);
          res.writeHead(204, {
            'Access-Control-Allow-Origin': '*'
          });
          res.end();
        } catch (e) {
          res.writeHead(400, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({ error: 'invalid body' }));
        }
      });
      return;
    }

    if (req.method === 'POST' && req.url === '/api/reply') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}');
          queueReply(parsed.id, parsed.message);
          res.writeHead(204, {
            'Access-Control-Allow-Origin': '*'
          });
          res.end();
        } catch (e) {
          res.writeHead(400, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({ error: 'invalid body' }));
        }
      });
      return;
    }

    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      res.end();
      return;
    }

    const html = gerarHtmlShell();
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });

  server.listen(port, () => {
    console.log(`Painel admin rodando em http://localhost:${port}`);
  });
}

module.exports = {
  startAdminPanel
};
