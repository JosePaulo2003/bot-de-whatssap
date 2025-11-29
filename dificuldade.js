const dificuldades = new Map(); // chatId => nivel ('facil' | 'medio' | 'dificil')
const aguardando = new Set(); // chatId que ainda não escolheram dificuldade

function setDificuldade(chatId, nivel) {
  if (!chatId || !nivel) return;
  dificuldades.set(chatId, nivel);
}

function getDificuldade(chatId) {
  if (!chatId) return 'facil';
  return dificuldades.get(chatId) || 'facil';
}

function setAguardandoDificuldade(chatId, valor) {
  if (!chatId) return;
  if (valor) {
    aguardando.add(chatId);
  } else {
    aguardando.delete(chatId);
  }
}

function isAguardandoDificuldade(chatId) {
  if (!chatId) return false;
  return aguardando.has(chatId);
}

module.exports = {
  setDificuldade,
  getDificuldade,
  setAguardandoDificuldade,
  isAguardandoDificuldade
};
