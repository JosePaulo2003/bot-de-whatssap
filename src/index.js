const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const config = require('./config');
const store = require('./store');
const { startPanel } = require('./panel');
const {
  extractText,
  hasMedia,
  hasStickerImage,
  buildReply,
  normalizeText,
  unwrapMessage,
  isCommandText
} = require('./responses');
const { imageMessageToSticker } = require('./stickers');

let sock = null;
let reconnecting = false;
const processedMessages = new Set();
const sentGroupMessages = new Map();
const RUNTIME_DIR = path.join(__dirname, '..', 'runtime');
const LOCK_FILE = path.join(RUNTIME_DIR, 'bot.lock');

const originalConsoleError = console.error.bind(console);
const originalConsoleLog = console.log.bind(console);
const colors = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bright: '\x1b[1m'
};

function paint(color, text) {
  if (!process.stdout.isTTY) return text;
  return `${colors[color] || ''}${text}${colors.reset}`;
}

function colorForLog(args, fallback) {
  const text = args.map((item) => (typeof item === 'string' ? item : JSON.stringify(item))).join(' ');

  if (text.includes('Bot conectado')) return 'green';
  if (text.includes('Conectando') || text.includes('Versao do WhatsApp Web')) return 'cyan';
  if (text.includes('QR code')) return 'yellow';
  if (text.includes('Mensagem recebida') || text.includes('Resposta enviada')) return 'blue';
  if (text.includes('Figurinha enviada') || text.includes('Recado adicionado')) return 'magenta';
  if (text.includes('desconectado') || text.includes('Erro')) return 'red';
  return fallback;
}

function printBanner() {
  originalConsoleLog('');
  originalConsoleLog(paint('cyan', '============================================================'));
  originalConsoleLog(paint('bright', paint('white', '                 ASSISTENTE WHATSAPP')));
  originalConsoleLog(paint('cyan', '============================================================'));
  originalConsoleLog(paint('green', '[OK] Runtime iniciado'));
  originalConsoleLog(paint('cyan', '[INFO] Painel admin: http://localhost:3000'));
  originalConsoleLog(paint('yellow', '[INFO] Use gerenciar_sessoes.bat para sessoes, auth e novo acesso'));
  originalConsoleLog(paint('cyan', '============================================================'));
  originalConsoleLog('');
}

function shouldHideSessionNoise(args) {
  const text = args
    .map((item) => (item instanceof Error ? item.stack || item.message : String(item)))
    .join(' ');

  return (
    text.includes('Bad MAC') ||
    text.includes('Failed to decrypt message with any known session') ||
    text.includes('Closing session: SessionEntry')
  );
}

console.error = (...args) => {
  if (shouldHideSessionNoise(args)) {
    return;
  }

  originalConsoleError(...args.map((item) => (typeof item === 'string' ? paint('red', item) : item)));
};

console.log = (...args) => {
  if (shouldHideSessionNoise(args)) {
    return;
  }

  const color = colorForLog(args, 'white');
  originalConsoleLog(...args.map((item) => (typeof item === 'string' ? paint(color, item) : item)));
};

function isProcessAlive(pid) {
  if (!pid || Number.isNaN(pid)) return false;

  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return false;
  }
}

function acquireProcessLock() {
  fs.mkdirSync(RUNTIME_DIR, { recursive: true });

  if (fs.existsSync(LOCK_FILE)) {
    try {
      const current = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf8'));
      if (isProcessAlive(Number(current.pid))) {
        console.error(
          `Ja existe uma instancia do bot rodando neste projeto. PID ativo: ${current.pid}. ` +
            'Use gerenciar_sessoes.bat para procurar e encerrar sessoes ativas.'
        );
        process.exit(1);
      }
    } catch (error) {
      // Lock corrompido ou incompleto: sera substituido abaixo.
    }
  }

  fs.writeFileSync(
    LOCK_FILE,
    JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }, null, 2),
    'utf8'
  );
}

function releaseProcessLock() {
  try {
    if (!fs.existsSync(LOCK_FILE)) return;
    const current = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf8'));
    if (Number(current.pid) === process.pid) {
      fs.unlinkSync(LOCK_FILE);
    }
  } catch (error) {
    // Encerramento nao deve falhar por causa do lock.
  }
}

function getStatus() {
  const summary = store.getSummary();
  return summary.stats;
}

function logIgnoredMessage(reason, message) {
  if (!config.logIgnoredMessages) return;

  console.log('[IGNORADA]', {
    reason,
    jid: message?.key?.remoteJid || null,
    participant: message?.key?.participant || null,
    fromMe: !!message?.key?.fromMe,
    id: message?.key?.id || null
  });
}

function shouldProcessMessage(message) {
  if (!message || !message.key) {
    logIgnoredMessage('sem chave da mensagem', message);
    return false;
  }

  if (!message.message) {
    logIgnoredMessage('sem conteudo descriptografado', message);
    return false;
  }

  if (message.key.remoteJid === 'status@broadcast') {
    logIgnoredMessage('status broadcast', message);
    return false;
  }

  const isGroup = isGroupJid(message.key.remoteJid);

  if (message.key.fromMe && !isGroup) {
    logIgnoredMessage('mensagem propria no privado', message);
    return false;
  }

  if (isGroup) {
    if (config.ignoreGroups) {
      logIgnoredMessage('grupos desativados', message);
      return false;
    }
    if (config.groupReplyOrMentionOnly && !isGroupBotInteraction(message.message, message.key.remoteJid)) {
      logIgnoredMessage('grupo sem comando, resposta ou mencao ao bot', message);
      return false;
    }
    if (!config.groupReplyOrMentionOnly && config.groupMentionsOnly && !isBotMentioned(message.message)) {
      logIgnoredMessage('grupo sem mencao ao bot', message);
      return false;
    }
  }

  const id = message.key.id;
  if (id && processedMessages.has(id)) {
    logIgnoredMessage('mensagem duplicada', message);
    return false;
  }
  if (id) {
    processedMessages.add(id);
    setTimeout(() => processedMessages.delete(id), 10 * 60 * 1000);
  }

  return true;
}

function isGroupJid(jid) {
  return (jid || '').endsWith('@g.us');
}

function normalizeJid(jid) {
  return (jid || '').replace(/:\d+@/, '@');
}

function getBotJids() {
  const user = sock?.user || {};
  const candidates = [user.id, user.jid, user.lid]
    .map(normalizeJid)
    .filter(Boolean);

  for (const jid of [...candidates]) {
    const number = jid.split('@')[0];
    if (number) {
      candidates.push(`${number}@s.whatsapp.net`);
      candidates.push(`${number}@lid`);
    }
  }

  return [...new Set(candidates)];
}

function jidLocalPart(jid) {
  return normalizeJid(jid).split('@')[0] || '';
}

function isSameBotJid(jid) {
  const normalized = normalizeJid(jid);
  const local = jidLocalPart(normalized);
  const botJids = getBotJids();
  const botLocals = botJids.map(jidLocalPart).filter(Boolean);

  return botJids.includes(normalized) || (!!local && botLocals.includes(local));
}

function getContextInfo(message) {
  message = unwrapMessage(message);
  return (
    message?.conversation?.contextInfo ||
    message?.extendedTextMessage?.contextInfo ||
    message?.imageMessage?.contextInfo ||
    message?.videoMessage?.contextInfo ||
    message?.documentMessage?.contextInfo ||
    message?.audioMessage?.contextInfo ||
    message?.stickerMessage?.contextInfo ||
    {}
  );
}

function isBotMentioned(message) {
  const mentioned = (getContextInfo(message).mentionedJid || []).map(normalizeJid);
  return mentioned.some(isSameBotJid);
}

function isGroupBotInteraction(message, groupJid) {
  const text = stripBotMentionText(extractText(message));
  return (
    isBotMentioned(message) ||
    isReplyToBot(message, groupJid) ||
    textStartsWithBotAlias(extractText(message)) ||
    isCommandText(text) ||
    hasStickerImage(message)
  );
}

function isReplyToBot(message, groupJid) {
  const context = getContextInfo(message);
  const participant = normalizeJid(context.participant || '');
  const stanzaId = context.stanzaId || context.id || '';

  return (!!participant && isSameBotJid(participant)) || isKnownBotMessage(groupJid, stanzaId);
}

function rememberSentGroupMessage(groupJid, sent) {
  const id = sent?.key?.id;
  if (!isGroupJid(groupJid) || !id) return;

  const entries = sentGroupMessages.get(groupJid) || new Map();
  entries.set(id, Date.now() + 60 * 60 * 1000);
  sentGroupMessages.set(groupJid, entries);
}

function isKnownBotMessage(groupJid, stanzaId) {
  if (!isGroupJid(groupJid) || !stanzaId) return false;

  const entries = sentGroupMessages.get(groupJid);
  if (!entries) return false;

  const expiresAt = entries.get(stanzaId);
  if (!expiresAt) return false;

  if (expiresAt < Date.now()) {
    entries.delete(stanzaId);
    return false;
  }

  return true;
}

function getMentionAliases() {
  return [...(config.groupMentionAliases || []), config.botName]
    .map((alias) => normalizeText(alias).replace(/^@+/, '').trim())
    .filter(Boolean);
}

function textStartsWithBotAlias(text) {
  const normalized = normalizeText(text);
  if (!normalized) return false;

  return getMentionAliases().some((alias) => {
    return (
      normalized === `@${alias}` ||
      normalized.startsWith(`@${alias} `) ||
      normalized === alias ||
      normalized.startsWith(`${alias} `)
    );
  });
}

function stripBotMentionText(text) {
  const number = getBotJids()[0]?.split('@')[0];
  let clean = text || '';

  if (number) {
    clean = clean.replace(new RegExp(`@${number}`, 'g'), '');
  }

  for (const alias of getMentionAliases()) {
    clean = clean.replace(new RegExp(`(^|\\s)@?${escapeRegExp(alias)}(?=\\s|$)`, 'gi'), ' ');
  }

  return clean
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isSpecialModeJid(jid) {
  const configuredNumber = config.specialModeNumber;
  const matchesConfiguredNumber = configuredNumber && (jid || '').startsWith(`${configuredNumber}@`);
  return !!matchesConfiguredNumber || store.isGirlfriend(jid);
}

async function sendMessage(jid, text, quoted) {
  if (!sock) throw new Error('WhatsApp ainda nao esta conectado.');
  if (!jid || !text) throw new Error('Contato ou mensagem ausente.');
  const sent = await sock.sendMessage(jid, { text }, quoted ? { quoted } : undefined);
  rememberSentGroupMessage(jid, sent);
}

async function sendReply(jid, reply, quoted) {
  if (!sock) throw new Error('WhatsApp ainda nao esta conectado.');
  if (!jid || !reply?.text) throw new Error('Contato ou mensagem ausente.');

  let sent;
  if (reply.image) {
    sent = await sock.sendMessage(
      jid,
      {
        image: { url: reply.image },
        caption: reply.text
      },
      quoted ? { quoted } : undefined
    );
    rememberSentGroupMessage(jid, sent);
    return;
  }

  sent = await sock.sendMessage(jid, { text: reply.text }, quoted ? { quoted } : undefined);
  rememberSentGroupMessage(jid, sent);
}

async function syncContactProfile(jid, name) {
  if (!sock || !jid) return;

  const contact = store.getContact(jid, name);
  const lastUpdate = contact.profile?.pictureUpdatedAt
    ? new Date(contact.profile.pictureUpdatedAt).getTime()
    : 0;
  const sixHours = 6 * 60 * 60 * 1000;

  if (lastUpdate && Date.now() - lastUpdate < sixHours) {
    return;
  }

  let pictureUrl = '';
  try {
    pictureUrl = await sock.profilePictureUrl(jid, 'image');
  } catch (error) {
    pictureUrl = '';
  }

  store.setContactProfile(jid, {
    pictureUrl,
    pictureUpdatedAt: new Date().toISOString(),
    phoneHint: jid.split('@')[0] || ''
  });
}

async function handleMessage(message) {
  if (!shouldProcessMessage(message)) return;

  const jid = message.key.remoteJid;
  const isGroup = isGroupJid(jid);
  const contactJid = isGroup ? message.key.participant || jid : jid;
  const name = message.pushName || '';
  const rawText = extractText(message.message);
  const text = isGroup ? stripBotMentionText(rawText) : rawText;
  const media = hasMedia(message.message);
  const fromGirlfriend = isSpecialModeJid(contactJid);

  console.log('Mensagem recebida:', {
    jid,
    participant: message.key.participant || null,
    contactJid,
    name,
    text,
    media,
    group: isGroup
  });

  const contact = store.recordIncoming({ jid: contactJid, name, text });
  syncContactProfile(contactJid, name).catch((error) => {
    console.error('Erro ao atualizar perfil do contato:', error.message);
  });

  if (store.isBlocked(contactJid)) {
    console.log('Contato bloqueado, mensagem ignorada:', contactJid);
    return;
  }

  const awaitingNote = store.getAwaitingNote(contactJid);
  if (awaitingNote) {
    const noteText = text || (media ? '(recado enviado com arquivo)' : '');
    if (noteText) {
      const item = store.addPendingReply({
        jid: contactJid,
        chatJid: jid,
        name,
        text: noteText
      });
      store.clearAwaitingNote(contactJid);
      await sendMessage(
        jid,
        `Recado registrado. Voce entrou na fila de resposta como prioridade #${item.priority}.`,
        isGroup ? message : undefined
      );
      console.log('Recado adicionado na fila:', { jid: contactJid, priority: item.priority });
      return;
    }
  }

  const reply = buildReply({ text, media, contact, fromGirlfriend });
  if (reply.action === 'await_note') {
    store.setAwaitingNote(contactJid, { chatJid: jid, name });
  }

  if (reply.counter) {
    store.incrementCounter(contactJid, reply.counter);
  }

  if (reply.action === 'await_note') {
    await sendReply(jid, reply, isGroup ? message : undefined);
    return;
  }

  if (hasStickerImage(message.message)) {
    try {
      const sticker = await imageMessageToSticker(message, sock);
      const sent = await sock.sendMessage(jid, { sticker }, isGroup ? { quoted: message } : undefined);
      rememberSentGroupMessage(jid, sent);
      store.incrementCounter(contactJid, 'stickers');
      console.log('Figurinha enviada para:', jid);
      return;
    } catch (error) {
      console.error('Erro ao criar figurinha:', error);
      await sendMessage(
        jid,
        'Nao consegui criar a figurinha com essa imagem. Tente enviar outra foto.',
        isGroup ? message : undefined
      );
      return;
    }
  }

  await sendReply(jid, reply, isGroup ? message : undefined);
  console.log('Resposta enviada para:', jid);
}

async function startWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  let version;

  try {
    const latest = await fetchLatestBaileysVersion();
    version = latest.version;
    console.log('Versao do WhatsApp Web:', version.join('.'));
  } catch (error) {
    console.log('Nao foi possivel buscar a versao mais recente do WhatsApp Web. Tentando com versao padrao do Baileys.');
  }

  sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }),
    browser: [config.botName, 'Chrome', '1.0.0'],
    markOnlineOnConnect: true,
    syncFullHistory: false
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('QR code gerado. Escaneie com o WhatsApp.');
      qrcode.generate(qr, { small: true });
      store.touchStats({ connected: false, connectionStatus: 'qr' });
    }

    if (connection === 'connecting') {
      console.log('Conectando ao WhatsApp...');
      store.touchStats({ connected: false, connectionStatus: 'connecting' });
    }

    if (connection === 'open') {
      console.log('Bot conectado ao WhatsApp! Pronto para receber mensagens.');
      store.touchStats({
        connected: true,
        connectionStatus: 'online',
        startedAt: store.getSummary().stats.startedAt || new Date().toISOString()
      });
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const loggedOut = statusCode === DisconnectReason.loggedOut;
      console.log('WhatsApp desconectado:', { statusCode, loggedOut });
      store.touchStats({ connected: false, connectionStatus: loggedOut ? 'logged_out' : 'disconnected' });

      if (!loggedOut && !reconnecting) {
        reconnecting = true;
        setTimeout(async () => {
          reconnecting = false;
          await startWhatsApp();
        }, 3000);
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    console.log('Evento de mensagem:', {
      type,
      count: messages.length,
      ids: messages.map((message) => message.key?.id).filter(Boolean),
      chats: messages.map((message) => message.key?.remoteJid).filter(Boolean)
    });
    for (const message of messages) {
      try {
        await handleMessage(message);
      } catch (error) {
        console.error('Erro ao processar mensagem:', error);
      }
    }
  });
}

process.on('unhandledRejection', (reason) => {
  console.error('Erro assincrono capturado:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Erro inesperado capturado:', error);
  releaseProcessLock();
  process.exit(1);
});

process.on('exit', releaseProcessLock);

process.on('SIGINT', () => {
  releaseProcessLock();
  process.exit(0);
});

process.on('SIGTERM', () => {
  releaseProcessLock();
  process.exit(0);
});

acquireProcessLock();
printBanner();

startPanel({
  store,
  sendMessage,
  getStatus
});

startWhatsApp().catch((error) => {
  console.error('Erro ao iniciar WhatsApp:', error);
});
