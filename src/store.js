const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'state.json');

function emptyState() {
  return {
    contacts: {},
    blocked: {},
    special: {
      girlfriendJids: {}
    },
    processedMessages: {},
    awaitingNotes: {},
    pendingReplies: [],
    stats: {
      startedAt: null,
      connected: false,
      connectionStatus: 'offline',
      lastEventAt: null
    }
  };
}

let state = emptyState();

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function load() {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    save();
    return;
  }

  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    state = raw ? { ...emptyState(), ...JSON.parse(raw) } : emptyState();
    state.contacts = state.contacts || {};
    state.blocked = state.blocked || {};
    state.special = {
      girlfriendJids: {},
      ...(state.special || {})
    };
    state.special.girlfriendJids = state.special.girlfriendJids || {};
    state.processedMessages = state.processedMessages || {};
    state.awaitingNotes = state.awaitingNotes || {};
    state.pendingReplies = state.pendingReplies || [];
    state.stats = { ...emptyState().stats, ...(state.stats || {}) };
  } catch (error) {
    console.error('Erro ao carregar data/state.json:', error.message);
    state = emptyState();
  }
}

function save() {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf8');
}

function touchStats(partial) {
  state.stats = {
    ...state.stats,
    ...partial,
    lastEventAt: new Date().toISOString()
  };
  save();
}

function pruneProcessedMessages(limit = 800) {
  const entries = Object.entries(state.processedMessages || {});
  if (entries.length <= limit) return;

  entries
    .sort((a, b) => new Date(b[1]) - new Date(a[1]))
    .slice(limit)
    .forEach(([id]) => {
      delete state.processedMessages[id];
    });
}

function hasProcessedMessage(id) {
  return !!(id && state.processedMessages && state.processedMessages[id]);
}

function markProcessedMessage(id, limit) {
  if (!id) return;
  state.processedMessages[id] = new Date().toISOString();
  pruneProcessedMessages(limit);
  save();
}

function getContact(jid, name) {
  if (!state.contacts[jid]) {
    state.contacts[jid] = {
      jid,
      name: name || '',
      firstSeenAt: new Date().toISOString(),
      lastSeenAt: null,
      profile: {
        pictureUrl: '',
        pictureUpdatedAt: null,
        phoneHint: jid.split('@')[0] || ''
      },
      counters: {
        messages: 0,
        menus: 0,
        respostas: 0,
        stickers: 0,
        piadas: 0,
        motivacionais: 0,
        romanticas: 0,
        manualReplies: 0
      },
      lastMessages: []
    };
  }

  if (name && state.contacts[jid].name !== name) {
    state.contacts[jid].name = name;
  }

  state.contacts[jid].profile = {
    pictureUrl: '',
    pictureUpdatedAt: null,
    phoneHint: jid.split('@')[0] || '',
    ...(state.contacts[jid].profile || {})
  };

  return state.contacts[jid];
}

function recordIncoming({ jid, name, text }) {
  const contact = getContact(jid, name);
  contact.lastSeenAt = new Date().toISOString();
  contact.counters.messages += 1;
  contact.lastMessages.push({
    text: text || '',
    at: new Date().toISOString()
  });

  while (contact.lastMessages.length > 10) {
    contact.lastMessages.shift();
  }

  save();
  return contact;
}

function incrementCounter(jid, counter) {
  const contact = getContact(jid);
  if (!contact.counters[counter]) {
    contact.counters[counter] = 0;
  }
  contact.counters[counter] += 1;
  save();
}

function setAwaitingNote(jid, data) {
  state.awaitingNotes[jid] = {
    jid,
    chatJid: data.chatJid || jid,
    name: data.name || '',
    requestedAt: new Date().toISOString()
  };
  save();
}

function getAwaitingNote(jid) {
  return state.awaitingNotes[jid] || null;
}

function clearAwaitingNote(jid) {
  delete state.awaitingNotes[jid];
  save();
}

function addPendingReply({ jid, chatJid, name, text }) {
  const now = new Date().toISOString();
  const openItems = state.pendingReplies.filter((item) => item.status !== 'done');
  const item = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    priority: openItems.length + 1,
    jid,
    chatJid: chatJid || jid,
    name: name || '',
    text: text || '',
    status: 'open',
    createdAt: now,
    resolvedAt: null
  };

  state.pendingReplies.push(item);
  save();
  return item;
}

function resolvePendingReply(id) {
  const item = state.pendingReplies.find((entry) => entry.id === id);
  if (item) {
    item.status = 'done';
    item.resolvedAt = new Date().toISOString();
    save();
  }
}

function setContactProfile(jid, profile) {
  const contact = getContact(jid);
  contact.profile = {
    ...(contact.profile || {}),
    ...profile,
    phoneHint: profile.phoneHint || contact.profile?.phoneHint || jid.split('@')[0] || ''
  };
  save();
}

function isBlocked(jid) {
  return !!state.blocked[jid];
}

function setBlocked(jid, blocked) {
  if (blocked) {
    state.blocked[jid] = true;
  } else {
    delete state.blocked[jid];
  }
  save();
}

function isGirlfriend(jid) {
  return !!state.special.girlfriendJids[jid];
}

function setGirlfriend(jid, enabled) {
  if (enabled) {
    state.special.girlfriendJids[jid] = true;
  } else {
    delete state.special.girlfriendJids[jid];
  }
  save();
}

function clearContact(jid, mode) {
  const contact = state.contacts[jid];

  if (mode === 'all') {
    delete state.contacts[jid];
    delete state.blocked[jid];
    delete state.special.girlfriendJids[jid];
    delete state.awaitingNotes[jid];
    state.pendingReplies = state.pendingReplies.filter((item) => item.jid !== jid);
  } else if (mode === 'history' && contact) {
    contact.lastMessages = [];
  } else if (mode === 'counters' && contact) {
    contact.counters = {
      messages: 0,
      menus: 0,
      respostas: 0,
      stickers: 0,
      piadas: 0,
      motivacionais: 0,
      romanticas: 0,
      manualReplies: 0
    };
  } else if (mode === 'pending') {
    state.pendingReplies = state.pendingReplies.filter((item) => item.jid !== jid);
    delete state.awaitingNotes[jid];
  } else if (mode === 'blocked') {
    delete state.blocked[jid];
  }

  save();
}

function getSummary() {
  const contacts = Object.values(state.contacts).map((contact) => {
    const counters = contact.counters || {};
    const total =
      (counters.messages || 0) +
      (counters.menus || 0) +
      (counters.respostas || 0) +
      (counters.stickers || 0) +
      (counters.piadas || 0) +
      (counters.motivacionais || 0) +
      (counters.romanticas || 0) +
      (counters.manualReplies || 0);

    return {
      ...contact,
      total,
      blocked: !!state.blocked[contact.jid],
      girlfriend: !!state.special.girlfriendJids[contact.jid]
    };
  });

  contacts.sort((a, b) => {
    return new Date(b.lastSeenAt || b.firstSeenAt) - new Date(a.lastSeenAt || a.firstSeenAt);
  });

  const totals = contacts.reduce(
    (acc, contact) => {
      const counters = contact.counters || {};
      acc.contacts += 1;
      acc.messages += counters.messages || 0;
      acc.menus += counters.menus || 0;
      acc.respostas += counters.respostas || 0;
      acc.stickers += counters.stickers || 0;
      acc.piadas += counters.piadas || 0;
      acc.motivacionais += counters.motivacionais || 0;
      acc.romanticas += counters.romanticas || 0;
      acc.manualReplies += counters.manualReplies || 0;
      acc.total += contact.total || 0;
      return acc;
    },
    {
      contacts: 0,
      messages: 0,
      menus: 0,
      respostas: 0,
      stickers: 0,
      piadas: 0,
      motivacionais: 0,
      romanticas: 0,
      manualReplies: 0,
      pendingOpen: state.pendingReplies.filter((item) => item.status !== 'done').length,
      total: 0
    }
  );

  return {
    stats: state.stats,
    contacts,
    totals,
    blocked: state.blocked,
    special: state.special,
    pendingReplies: state.pendingReplies
      .filter((item) => item.status !== 'done')
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((item, index) => ({ ...item, priority: index + 1 })),
    resolvedReplies: state.pendingReplies.filter((item) => item.status === 'done').slice(-20)
  };
}

load();

module.exports = {
  load,
  save,
  touchStats,
  hasProcessedMessage,
  markProcessedMessage,
  getContact,
  recordIncoming,
  incrementCounter,
  setAwaitingNote,
  getAwaitingNote,
  clearAwaitingNote,
  addPendingReply,
  resolvePendingReply,
  setContactProfile,
  isBlocked,
  setBlocked,
  isGirlfriend,
  setGirlfriend,
  clearContact,
  getSummary
};
