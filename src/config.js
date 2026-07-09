const path = require('path');

module.exports = {
  botName: 'Bot do Desenvolvedor',
  panelPort: 3000,
  ignoreGroups: false,
  groupReplyOrMentionOnly: true,
  groupMentionsOnly: false,
  logIgnoredMessages: true,
  messageReplayGraceSeconds: 30,
  processedMessageCacheLimit: 800,
  groupMentionAliases: ['bot', 'Bot do Desenvolvedor'],
  specialModeNumber: (process.env.SPECIAL_MODE_NUMBER || '').replace(/\D/g, ''),
  adminTitle: 'Painel do Bot Pessoal',
  stickerAuthor: 'Bot do Desenvolvedor',
  stickerPack: 'Figurinhas do Bot',
  menuImagePath: path.join(__dirname, '..', 'assets', 'bot-avatar.png'),
  menuText:
    '*MENU DO BOT*\n\n' +
    '1 - Respostas prontas\n' +
    '2 - Criar figurinha\n' +
    '3 - Piada aleatoria\n' +
    '4 - Frase motivacional torta\n' +
    '5 - Deixar recado / entrar na fila\n' +
    '6 - Ver resumo do atendimento\n' +
    '7 - Ver historico de mensagens\n\n' +
    'Envie o numero da opcao desejada.\n' +
    'Para criar figurinha, envie uma imagem com ou sem legenda.'
};
