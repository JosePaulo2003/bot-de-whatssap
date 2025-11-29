const blocked = new Set();
const pendingReplies = [];
const userLogs = new Map(); // id => [{ text, at }]

function isBlocked(id) {
  return blocked.has(id);
}

function setBlocked(id, shouldBlock) {
  if (!id) return;
  if (shouldBlock) {
    blocked.add(id);
  } else {
    blocked.delete(id);
  }
}

function queueReply(to, message) {
  if (!to || !message) return;
  pendingReplies.push({ to, message, createdAt: Date.now() });
}

function pullPendingReplies(max) {
  const limit = !max || max < 0 ? 20 : max;
  if (limit === 0) return [];
  return pendingReplies.splice(0, limit);
}

function logUserMessage(id, text) {
  if (!id) return;
  const arr = userLogs.get(id) || [];
  arr.push({ text: text || '', at: Date.now() });
  while (arr.length > 10) {
    arr.shift();
  }
  userLogs.set(id, arr);
}

function getAdminState() {
  const history = {};
  for (const [id, logs] of userLogs.entries()) {
    history[id] = logs;
  }
  return {
    blocked: Array.from(blocked),
    pendingReplies: [...pendingReplies],
    history
  };
}

function resetUserData(id) {
  if (!id) return;
  userLogs.delete(id);
  for (let i = pendingReplies.length - 1; i >= 0; i--) {
    if (pendingReplies[i].to === id) {
      pendingReplies.splice(i, 1);
    }
  }
}

module.exports = {
  isBlocked,
  setBlocked,
  queueReply,
  pullPendingReplies,
  getAdminState,
  logUserMessage,
  resetUserData
};
