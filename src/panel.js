const http = require('http');
const config = require('./config');

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(payload));
}

function html() {
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${config.adminTitle}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #f3f6fb; color: #102033; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    header { max-width: 1220px; margin: 14px auto 0; padding: 18px 20px; background: #fff; border: 1px solid #dce5f0; border-radius: 16px; box-shadow: 0 18px 45px rgba(15, 23, 42, .08); display: flex; justify-content: space-between; align-items: center; gap: 18px; }
    h1 { margin: 0; font-size: 22px; letter-spacing: -.01em; }
    .sub { color: #64748b; font-size: 13px; margin-top: 3px; }
    main { max-width: 1220px; margin: 14px auto 28px; display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(360px, .9fr); gap: 16px; }
    .panel { background: #fff; border: 1px solid #dce5f0; border-radius: 16px; padding: 18px; box-shadow: 0 18px 45px rgba(15, 23, 42, .07); }
    .title { color: #64748b; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; font-weight: 900; margin-bottom: 12px; }
    .badge { display: inline-flex; align-items: center; gap: 7px; border-radius: 999px; padding: 7px 12px; background: #ecfdf5; color: #166534; border: 1px solid #bbf7d0; font-size: 12px; font-weight: 900; white-space: nowrap; }
    .badge.off { background: #fff1f2; color: #be123c; border-color: #fecdd3; }
    .dot { width: 7px; height: 7px; border-radius: 99px; background: currentColor; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
    .metric { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 13px; }
    .metric-label { color: #64748b; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; font-weight: 900; }
    .metric-value { color: #2563eb; font-size: 27px; font-weight: 950; line-height: 1; margin-top: 5px; }
    .metric-sub { color: #64748b; font-size: 12px; margin-top: 6px; }
    .contacts { margin-top: 14px; display: grid; gap: 10px; max-height: 560px; overflow-y: auto; padding-right: 4px; }
    .queue { margin-top: 14px; display: grid; gap: 10px; }
    .queue-item { border: 1px solid #bfdbfe; background: #f8fbff; border-radius: 14px; padding: 12px; }
    .queue-head { display: flex; justify-content: space-between; gap: 10px; align-items: flex-start; }
    .queue-priority { color: #1d4ed8; font-size: 18px; font-weight: 950; }
    .queue-text { margin-top: 8px; color: #102033; font-size: 13px; white-space: pre-wrap; word-break: break-word; }
    .contact-card { width: 100%; text-align: left; border: 1px solid #e2e8f0; border-radius: 14px; padding: 12px; background: #fff; color: inherit; display: grid; grid-template-columns: 52px minmax(0, 1fr) auto; gap: 12px; align-items: center; }
    .contact-card:hover, .contact-card.active { border-color: #93c5fd; background: #f8fbff; }
    .avatar { width: 52px; height: 52px; border-radius: 16px; object-fit: cover; border: 1px solid #dbeafe; background: linear-gradient(135deg, #dbeafe, #eef2ff); color: #1d4ed8; display: grid; place-items: center; font-size: 20px; font-weight: 950; flex: 0 0 auto; overflow: hidden; }
    .avatar.big { width: 74px; height: 74px; border-radius: 22px; font-size: 28px; }
    .avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .name { font-weight: 900; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .jid { color: #64748b; font-size: 12px; word-break: break-all; margin-top: 2px; }
    .muted { color: #64748b; font-size: 12px; }
    .mini-row { color: #64748b; font-size: 12px; margin-top: 6px; display: flex; gap: 8px; flex-wrap: wrap; }
    .pill { border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 999px; padding: 4px 8px; color: #64748b; font-size: 11px; display: inline-block; font-weight: 800; }
    .pill.blocked { color: #dc2626; background: #fff1f2; border-color: #fecaca; }
    .pill.special { color: #6d28d9; background: #f5f3ff; border-color: #ddd6fe; }
    .profile-head { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
    .profile-name { font-size: 20px; font-weight: 950; line-height: 1.15; }
    .profile-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 12px 0; }
    .info { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px; min-width: 0; }
    .info-label { color: #64748b; font-size: 10px; letter-spacing: .08em; text-transform: uppercase; font-weight: 900; }
    .info-value { margin-top: 4px; font-weight: 850; font-size: 13px; word-break: break-word; }
    .messages { margin-top: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 8px; max-height: 190px; overflow-y: auto; }
    .message { padding: 8px; border-bottom: 1px solid #e2e8f0; }
    .message:last-child { border-bottom: 0; }
    .message-time { color: #64748b; font-size: 11px; margin-bottom: 3px; }
    .message-text { color: #102033; font-size: 13px; white-space: pre-wrap; word-break: break-word; }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    button { cursor: pointer; border: 1px solid #bfdbfe; background: #eff6ff; color: #1d4ed8; border-radius: 9px; font-weight: 850; padding: 7px 10px; font: inherit; }
    button.danger { background: #fff1f2; border-color: #fecaca; color: #dc2626; }
    button.primary { background: #2563eb; border-color: #2563eb; color: #fff; }
    button:disabled { opacity: .45; cursor: not-allowed; }
    .log { height: 140px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px; overflow-y: auto; font-size: 12px; line-height: 1.5; margin-top: 10px; }
    textarea { width: 100%; min-height: 86px; margin-top: 10px; padding: 12px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; resize: vertical; font: inherit; }
    .empty { color: #64748b; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 14px; padding: 16px; text-align: center; }
    @media (max-width: 920px) { header, main { width: calc(100% - 24px); } main { grid-template-columns: 1fr; } .profile-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>${config.adminTitle}</h1>
      <div class="sub" id="subtitle">carregando...</div>
    </div>
    <div class="badge off" id="status"><span class="dot"></span><span>OFFLINE</span></div>
  </header>
  <main>
    <section class="panel">
      <div class="title">Resumo geral</div>
      <div class="metrics" id="metrics"></div>
      <div class="title" style="margin-top:16px;">Fila de resposta</div>
      <div class="queue" id="queue"></div>
      <div class="title" style="margin-top:16px;">Quem chamou</div>
      <div class="contacts" id="contacts"></div>
    </section>
    <aside class="panel">
      <div class="title">Perfil selecionado</div>
      <div id="profile" class="empty">Selecione um contato para ver perfil, historico e acoes.</div>
      <div class="title" style="margin-top:16px;">Resposta manual</div>
      <div class="pill" id="selected">sem contato selecionado</div>
      <div class="log" id="log"></div>
      <textarea id="reply" placeholder="Digite uma resposta manual para enviar pelo WhatsApp..."></textarea>
      <div class="actions">
        <button class="primary" id="send" disabled>Enviar</button>
      </div>
    </aside>
  </main>
  <script>
    let selectedJid = null;
    let latestData = null;

    function escapeHtml(value) {
      return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
    }

    function formatDate(value) {
      if (!value) return 'sem registro';
      return new Date(value).toLocaleString('pt-BR');
    }

    function displayName(contact) {
      return contact.name || contact.profile?.phoneHint || contact.jid || 'Contato';
    }

    function avatar(contact, size) {
      const name = displayName(contact);
      const initial = escapeHtml(name.trim().charAt(0).toUpperCase() || '?');
      const cls = 'avatar' + (size === 'big' ? ' big' : '');
      const picture = contact.profile?.pictureUrl;
      if (picture) {
        return '<div class="' + cls + '"><img src="' + escapeHtml(picture) + '" referrerpolicy="no-referrer" onerror="this.parentElement.textContent=\\'' + initial + '\\'; this.remove();" /></div>';
      }
      return '<div class="' + cls + '">' + initial + '</div>';
    }

    function line(text) {
      const log = document.getElementById('log');
      const div = document.createElement('div');
      div.textContent = '[' + new Date().toLocaleTimeString('pt-BR') + '] ' + text;
      log.appendChild(div);
      log.scrollTop = log.scrollHeight;
    }

    function metric(label, value, sub) {
      return '<div class="metric"><div class="metric-label">' + label + '</div><div class="metric-value">' + value + '</div><div class="metric-sub">' + sub + '</div></div>';
    }

    function info(label, value) {
      return '<div class="info"><div class="info-label">' + label + '</div><div class="info-value">' + escapeHtml(value) + '</div></div>';
    }

    function findContact(jid) {
      if (!latestData) return null;
      return latestData.contacts.find((contact) => contact.jid === jid) || null;
    }

    async function api(path, options) {
      const res = await fetch(path, options);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      if (res.status === 204) return null;
      return res.json();
    }

    function renderProfile(contact) {
      const profile = document.getElementById('profile');
      if (!contact) {
        profile.className = 'empty';
        profile.textContent = 'Selecione um contato para ver perfil, historico e acoes.';
        return;
      }

      profile.className = '';
      const counters = contact.counters || {};
      const messages = (contact.lastMessages || []).slice(-8).reverse().map((m) => {
        return '<div class="message"><div class="message-time">' + escapeHtml(formatDate(m.at)) + '</div><div class="message-text">' + escapeHtml(m.text || '(sem texto)') + '</div></div>';
      }).join('');

      profile.innerHTML =
        '<div class="profile-head">' +
          avatar(contact, 'big') +
          '<div><div class="profile-name">' + escapeHtml(displayName(contact)) + '</div>' +
          '<div class="jid">' + escapeHtml(contact.jid) + '</div>' +
          '<div class="mini-row">' +
            '<span class="pill ' + (contact.blocked ? 'blocked' : '') + '">' + (contact.blocked ? 'bloqueado' : 'liberado') + '</span>' +
            (contact.girlfriend ? '<span class="pill special">especial</span>' : '<span class="pill">comum</span>') +
          '</div></div>' +
        '</div>' +
        '<div class="profile-grid">' +
          info('Primeiro contato', formatDate(contact.firstSeenAt)) +
          info('Ultima mensagem', formatDate(contact.lastSeenAt)) +
          info('Identificador', contact.jid) +
          info('Possivel numero', contact.profile?.phoneHint || 'nao informado') +
          info('Mensagens', counters.messages || 0) +
          info('Total de interacoes', contact.total || 0) +
          info('Respostas prontas', counters.respostas || 0) +
          info('Menus abertos', counters.menus || 0) +
          info('Figurinhas', counters.stickers || 0) +
          info('Respostas manuais', counters.manualReplies || 0) +
          info('Piadas', counters.piadas || 0) +
          info('Especial', counters.romanticas || 0) +
        '</div>' +
        '<div class="title" style="margin-top:12px;">Ultimas mensagens</div>' +
        '<div class="messages">' + (messages || '<div class="muted">sem historico de mensagens</div>') + '</div>' +
        '<div class="actions">' +
          '<button onclick="selectContact(\\'' + contact.jid + '\\')">Responder</button>' +
          '<button onclick="blockContact(\\'' + contact.jid + '\\',' + (!contact.blocked) + ')">' + (contact.blocked ? 'Desbloquear' : 'Bloquear') + '</button>' +
          '<button onclick="markSpecial(\\'' + contact.jid + '\\',' + (!contact.girlfriend) + ')">' + (contact.girlfriend ? 'Remover especial' : 'Marcar especial') + '</button>' +
          '<button class="danger" onclick="clearContact(\\'' + contact.jid + '\\')">Limpar</button>' +
        '</div>';
    }

    function render(data) {
      latestData = data;
      const connected = data.stats && data.stats.connected;
      const status = document.getElementById('status');
      status.className = 'badge' + (connected ? '' : ' off');
      status.innerHTML = '<span class="dot"></span><span>' + (connected ? 'ONLINE' : 'OFFLINE') + '</span>';
      document.getElementById('subtitle').textContent = 'contatos: ' + data.totals.contacts + ' | interacoes: ' + data.totals.total + ' | estado: ' + (data.stats.connectionStatus || 'offline');

      document.getElementById('metrics').innerHTML =
        metric('TOTAL', data.totals.total, 'todas as interacoes') +
        metric('CONTATOS', data.totals.contacts, 'contatos unicos') +
        metric('MENSAGENS', data.totals.messages, 'recebidas') +
        metric('MENUS', data.totals.menus, 'aberturas') +
        metric('RESPOSTAS', data.totals.respostas, 'prontas') +
        metric('FILA', data.totals.pendingOpen || 0, 'aguardando resposta') +
        metric('FIGURINHAS', data.totals.stickers, 'criadas') +
        metric('PIADAS', data.totals.piadas, 'enviadas') +
        metric('ESPECIAIS', data.totals.romanticas, 'contato especial');

      const queue = document.getElementById('queue');
      if (!data.pendingReplies.length) {
        queue.innerHTML = '<div class="empty">Nenhum recado na fila agora.</div>';
      } else {
        queue.innerHTML = data.pendingReplies.map((item) => {
          const contact = data.contacts.find((entry) => entry.jid === item.jid) || item;
          return '<div class="queue-item">' +
            '<div class="queue-head"><div><div class="queue-priority">#' + item.priority + ' ' + escapeHtml(displayName(contact)) + '</div>' +
            '<div class="jid">' + escapeHtml(item.jid) + '</div>' +
            '<div class="muted">recebido em ' + escapeHtml(formatDate(item.createdAt)) + '</div>' +
            (item.chatJid && item.chatJid !== item.jid ? '<div class="muted">origem: ' + escapeHtml(item.chatJid) + '</div>' : '') +
            '</div><span class="pill">aguardando</span></div>' +
            '<div class="queue-text">' + escapeHtml(item.text || '(sem texto)') + '</div>' +
            '<div class="actions">' +
              '<button onclick="selectPending(\\'' + item.id + '\\')">Responder</button>' +
              '<button onclick="resolvePending(\\'' + item.id + '\\')">Concluir</button>' +
            '</div>' +
          '</div>';
        }).join('');
      }

      const contacts = document.getElementById('contacts');
      if (!data.contacts.length) {
        contacts.innerHTML = '<div class="empty">Nenhum contato registrado ainda.</div>';
        renderProfile(null);
        return;
      }

      if (!selectedJid) {
        selectedJid = data.contacts[0].jid;
        document.getElementById('selected').textContent = 'contato: ' + selectedJid;
        document.getElementById('send').disabled = false;
      }

      contacts.innerHTML = data.contacts.map((contact) => {
        const counters = contact.counters || {};
        const selected = contact.jid === selectedJid ? ' active' : '';
        return '<button class="contact-card' + selected + '" onclick="selectContact(\\'' + contact.jid + '\\')">' +
          avatar(contact) +
          '<div><div class="name">' + escapeHtml(displayName(contact)) + '</div><div class="jid">' + escapeHtml(contact.jid) + '</div>' +
          '<div class="mini-row"><span>msg ' + (counters.messages || 0) + '</span><span>resp ' + (counters.respostas || 0) + '</span><span>total ' + (contact.total || 0) + '</span></div></div>' +
          '<div><span class="pill ' + (contact.blocked ? 'blocked' : '') + '">' + (contact.blocked ? 'bloqueado' : 'ok') + '</span>' + (contact.girlfriend ? '<br><span class="pill special" style="margin-top:6px;">especial</span>' : '') + '</div>' +
        '</button>';
      }).join('');

      renderProfile(data.contacts.find((contact) => contact.jid === selectedJid) || data.contacts[0]);
    }

    window.selectContact = function(jid) {
      selectedJid = jid;
      document.getElementById('selected').textContent = 'contato: ' + jid;
      document.getElementById('send').disabled = false;
      if (latestData) render(latestData);
      line('contato selecionado: ' + jid);
    };

    window.selectPending = function(id) {
      const item = latestData && latestData.pendingReplies.find((entry) => entry.id === id);
      if (!item) return;
      selectedJid = item.jid;
      document.getElementById('selected').textContent = 'fila #' + item.priority + ': ' + item.jid;
      document.getElementById('send').disabled = false;
      document.getElementById('reply').value = '';
      renderProfile(findContact(item.jid));
      line('item da fila selecionado: #' + item.priority);
    };

    window.resolvePending = async function(id) {
      await api('/api/pending/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      line('item da fila concluido');
      refresh();
    };

    window.blockContact = async function(jid, blocked) {
      await api('/api/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jid, blocked })
      });
      line((blocked ? 'bloqueado: ' : 'desbloqueado: ') + jid);
      refresh();
    };

    window.markSpecial = async function(jid, enabled) {
      await api('/api/girlfriend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jid, enabled })
      });
      line((enabled ? 'contato especial: ' : 'especial removido: ') + jid);
      refresh();
    };

    window.clearContact = async function(jid) {
      const mode = prompt('Limpar o que?\\n1 - historico\\n2 - contadores\\n3 - bloqueio\\n4 - tudo');
      const map = { '1': 'history', '2': 'counters', '3': 'blocked', '4': 'all' };
      if (!map[mode]) return;
      await api('/api/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jid, mode: map[mode] })
      });
      if (map[mode] === 'all' && selectedJid === jid) {
        selectedJid = null;
        document.getElementById('selected').textContent = 'sem contato selecionado';
        document.getElementById('send').disabled = true;
      }
      line('limpeza aplicada: ' + jid);
      refresh();
    };

    async function refresh() {
      try {
        render(await api('/api/state'));
      } catch (error) {
        line('erro ao buscar dados: ' + error.message);
      }
    }

    document.getElementById('send').addEventListener('click', async () => {
      const text = document.getElementById('reply').value.trim();
      if (!selectedJid || !text) return;
      await api('/api/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jid: selectedJid, text })
      });
      document.getElementById('reply').value = '';
      line('resposta enviada para ' + selectedJid);
      refresh();
    });

    line('painel iniciado');
    refresh();
    setInterval(refresh, 3000);
  </script>
</body>
</html>`;
}

function startPanel({ store, sendMessage, getStatus }) {
  const server = http.createServer(async (req, res) => {
    try {
      if (req.method === 'OPTIONS') {
        res.writeHead(204, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
      }

      if (req.method === 'GET' && req.url === '/api/state') {
        sendJson(res, 200, {
          ...store.getSummary(),
          runtime: getStatus()
        });
        return;
      }

      if (req.method === 'POST' && req.url === '/api/reply') {
        const body = await readJson(req);
        await sendMessage(body.jid, body.text);
        store.incrementCounter(body.jid, 'manualReplies');
        sendJson(res, 200, { ok: true });
        return;
      }

      if (req.method === 'POST' && req.url === '/api/block') {
        const body = await readJson(req);
        store.setBlocked(body.jid, !!body.blocked);
        sendJson(res, 200, { ok: true });
        return;
      }

      if (req.method === 'POST' && req.url === '/api/girlfriend') {
        const body = await readJson(req);
        store.setGirlfriend(body.jid, !!body.enabled);
        sendJson(res, 200, { ok: true });
        return;
      }

      if (req.method === 'POST' && req.url === '/api/pending/resolve') {
        const body = await readJson(req);
        store.resolvePendingReply(body.id);
        sendJson(res, 200, { ok: true });
        return;
      }

      if (req.method === 'POST' && req.url === '/api/clear') {
        const body = await readJson(req);
        store.clearContact(body.jid, body.mode);
        sendJson(res, 200, { ok: true });
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html());
    } catch (error) {
      sendJson(res, 500, { ok: false, error: error.message });
    }
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Porta ${config.panelPort} ja esta em uso. Use gerenciar_sessoes.bat para localizar e encerrar o processo antigo.`);
      return;
    }
    console.error('Erro no painel admin:', error);
  });

  server.listen(config.panelPort, () => {
    console.log(`Painel admin rodando em http://localhost:${config.panelPort}`);
  });

  return server;
}

module.exports = {
  startPanel
};
