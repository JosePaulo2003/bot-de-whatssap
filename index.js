const path = require('path');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const { mensagensBase, piadas, motivacionaisSarc, destinos, euTeAmoRespostas } = require('./mensagens');
const { handleJogo } = require('./jogo');
const { gerarStatus } = require('./status');
const { registrarUso, gerarConquistas } = require('./conquistas');
const { startAdminPanel } = require('./admin_panel');
const { isBlocked, pullPendingReplies, logUserMessage } = require('./admin_actions');
const config = require('./config');

const saudouUsuarios = new Set();
const usuariosRegistrados = new Set(); // para garantir que apareçam no painel desde a primeira mensagem
const usuariosQueJaViramMenu = new Set(); // para saber quem já chamou o menu pelo menos uma vez

// Mensagens românticas para a minha namorada linda <3

let indiceMensagem = 0; // índice atual (não mais usado para fila, mantido só por compatibilidade se precisar)
let indicePiada = 0; // índice atual da fila de piadas
let indiceMotivacional = 0; // índice atual das mensagens motivacionais

let botPausado = false; // controle global de pausa

function mapearOpcaoMenu(texto) {
  if (!texto) return null;
  const t = texto.toLowerCase();

  if (
    [
      '1',
      'piadas',
      'piada',
      'piadas sarcásticas',
      'piadas sarcasticas',
      'piadas sarcaticas',
      'piada sarcástica',
      'piada sarcastica'
    ].includes(t)
  ) {
    return '1';
  }

  if (
    [
      '2',
      'figurinha',
      'figurinhas',
      'criar figurinha',
      'sticker',
      'stickerzinha',
      'criar sticker',
      'criar figurinhas',
    ].includes(t)
  ) {
    return '2';
  }

  if (
    [
      '3',
      'motivacao',
      'motivação',
      'motivacao sarcastica',
      'motivação sarcástica',
      'motivacao sarcástica',
      'motivação sarcastica',
      'motivação sarcástica',
      'motivacionais',
      'motivacionais sarcásticas'
    ].includes(t)
  ) {
    return '3';
  }

  if (
    [
      '4',
      'destino',
      'consultar o destino',
      'consultar destino',
      'ver destino'
    ].includes(t)
  ) {
    return '4';
  }

  if (
    [
      '5',
      'jogo da velha',
      'jogo da velha (emojis)',
      'velha',
      'jogo',
      'jogo velha'
    ].includes(t)
  ) {
    return '5';
  }

  if (
    [
      '6',
      'status',
      'ficha',
      'ficha de rpg',
      'status / ficha de rpg',
      'rpg'
    ].includes(t)
  ) {
    return '6';
  }

  if (
    [
      '7',
      'conquistas',
      'ver conquistas',
      'achievements'
    ].includes(t)
  ) {
    return '7';
  }

  return null;
}

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', (qr) => {
  console.log('QR code gerado. Escaneie com o WhatsApp do seu celular.');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('Bot conectado ao WhatsApp!');
  iniciarAgendadorDeMensagens();

  setInterval(async () => {
    try {
      const pendentes = pullPendingReplies(20);
      for (const item of pendentes) {
        await client.sendMessage(item.to, item.message);
      }
    } catch (err) {
      console.error('Erro ao enviar respostas do painel admin:', err);
    }
  }, 2000);
});

client.on('message', async (msg) => {
  const meuAmor = config.owner.targetNumber;

  try {
    const texto = (msg.body || '').trim().toLowerCase();
    const from = msg.from;
    const opcaoMenu = mapearOpcaoMenu(texto);

    // Se for grupo, só responde se o bot for mencionado
    try {
      const chat = await msg.getChat();
      if (chat && chat.isGroup) {
        const botId = client.info && client.info.wid && client.info.wid._serialized;
        const mentioned = msg.mentionedIds || [];
        if (!botId || !mentioned.includes(botId)) {
          console.log('Mensagem em grupo ignorada (sem menção ao bot):', from, texto);
          return;
        }
      }
    } catch (e) {
      console.error('Erro ao verificar se é grupo/menção:', e);
    }

    logUserMessage(from, msg.body || '');

    // Registrar usuário no contador assim que ele mandar a primeira mensagem
    if (!usuariosRegistrados.has(from)) {
      usuariosRegistrados.add(from);
      registrarUso(from, 'menus');
    }

    // Comandos de pausa só são aceitos do número alvo
    if (from === meuAmor) {
      if (texto === '!pausar') {
        botPausado = true;
        await msg.reply(config.messages.pauseReply);
        return;
      }
      if (texto === '!voltar') {
        botPausado = false;
        await msg.reply(config.messages.resumeReply);
        return;
      }
    }

    if (botPausado) {
      // Quando pausado, não responde nada para ninguém
      console.log('Mensagem ignorada porque o bot está pausado:', from, texto);
      return;
    }

    if (isBlocked(from)) {
      console.log('Mensagem ignorada de usuário bloqueado via painel admin:', from);
      return;
    }

    // Se for o "meuAmor" e for alguma forma de "te amo", responde com variação fofa de eu te amo
    if (from === meuAmor && /te\s*amo/i.test(msg.body || '')) {
      const idx = Math.floor(Math.random() * euTeAmoRespostas.length);
      const respostaTeAmo = euTeAmoRespostas[idx];
      await msg.reply(respostaTeAmo);
      return;
    }

    // Apresentação automática UMA vez por usuário em chat privado (exceto alvo),
    // apenas se não for comando conhecido nem mídia
    if (from !== meuAmor && !saudouUsuarios.has(from)) {
      const comandosConhecidos = ['menu'];
      const ehComando = comandosConhecidos.includes(texto) || !!opcaoMenu;

      if (!ehComando && !msg.hasMedia) {
        saudouUsuarios.add(from);
        await msg.reply(config.messages.welcomeOthers);
        return;
      }
    }

    // Regras compartilhadas (para qualquer número): menu, piadas, figurinhas, jogos, status, conquistas

    // Se enviar mídia (imagem ou GIF/vídeo curto), transforma em figurinha (opção 2 do menu)
    if (msg.hasMedia && (msg.type === 'image' || msg.type === 'video')) {
      const media = await msg.downloadMedia();
      registrarUso(from, 'figurinhas');
      await client.sendMessage(from, media, {
        sendMediaAsSticker: true,
        stickerAuthor: config.stickers.author,
        stickerName: config.stickers.name
      });
      return;
    }

    // OPÇÃO 5: jogo da velha com emojis (módulo separado)
    const jogoTratado = await handleJogo(msg, texto);
    if (jogoTratado) {
      registrarUso(from, 'jogos');
      return;
    }

    // OPÇÃO 2 digitada sem mídia: instrução sarcástica
    if (opcaoMenu === '2' && !msg.hasMedia) {
      await msg.reply(
        'Opção 2 é simples, mas aparentemente eu preciso explicar: manda uma foto, GIF ou vídeo curto e eu transformo na figurinha que você não sabia que precisava. Não adianta só digitar 2 e olhar pra minha cara digital.'
      );
      return;
    }

    // OPÇÃO 3: mensagens motivacionais sarcásticas (agora aleatórias)
    if (opcaoMenu === '3') {
      const idxMot = Math.floor(Math.random() * motivacionaisSarc.length);
      const frase = motivacionaisSarc[idxMot];
      registrarUso(from, 'motivacionais');
      await msg.reply(frase);
      return;
    }

    // OPÇÃO 4: consultar o destino (resposta sarcástica)
    if (opcaoMenu === '4') {
      const respostaDestino = destinos[Math.floor(Math.random() * destinos.length)];
      registrarUso(from, 'destinos');
      await msg.reply(respostaDestino);
      return;
    }

    // OPÇÃO 6: status/perfil sarcástico
    if (opcaoMenu === '6') {
      const statusTexto = gerarStatus(from);
      await msg.reply(statusTexto);
      return;
    }

    // OPÇÃO 7: conquistas
    if (opcaoMenu === '7') {
      const textoConquistas = gerarConquistas(from);
      await msg.reply(textoConquistas);
      return;
    }

    // MENU para qualquer pessoa
    if (texto === 'menu') {
      const menuPath = path.join(__dirname, 'assets', 'menu', 'menu.jpg');
      const media = await MessageMedia.fromFilePath(menuPath);

      registrarUso(from, 'menus');
      usuariosQueJaViramMenu.add(from);

      await client.sendMessage(from, media, {
        caption: config.menu.caption
      });
      return;
    }

    // Tratamento de opção inválida do menu (números fora de 1-7)
    const opcoesValidasMenu = ['1', '2', '3', '4', '5', '6', '7'];
    if (/^\d+$/.test(texto) && !opcoesValidasMenu.includes(texto)) {
      await msg.reply(config.messages.invalidMenuNumber);
      return;
    }

    // OPÇÃO 1: piadas para qualquer pessoa (imagem + legenda), agora em ordem aleatória
    if (opcaoMenu === '1') {
      const idxPiada = Math.floor(Math.random() * piadas.length);
      const piada = piadas[idxPiada];

      try {
        const imgPath = path.join(__dirname, 'assets', 'piadas', 'piada.jpg');
        const media = await MessageMedia.fromFilePath(imgPath);

        await client.sendMessage(from, media, {
          caption: piada
        });
      } catch (e) {
        // Se der erro ao carregar a imagem, envia só o texto da piada
        await msg.reply(piada);
      }

      registrarUso(from, 'piadas');
      return;
    }

    // Se for o meuAmor e não for nenhum comando conhecido/mídia, manda mensagem fofa
    if (from === meuAmor && !msg.hasMedia) {
      const comandosConhecidos = ['menu', '!pausar', '!voltar'];
      const ehComando = comandosConhecidos.includes(texto) || !!opcaoMenu;
      if (!ehComando) {
        const idxMsg = Math.floor(Math.random() * mensagensBase.length);
        const resposta = mensagensBase[idxMsg];
        await msg.reply(resposta);
        return;
      }
    }

    // Para qualquer outro usuário que já viu o menu, qualquer coisa fora das opções vira "opção inválida" irônica
    if (from !== meuAmor && !msg.hasMedia && usuariosQueJaViramMenu.has(from)) {
      const comandosExtras = ['!pausar', '!voltar'];
      const ehConhecido = texto === 'menu' || !!opcaoMenu || comandosExtras.includes(texto);

      if (!ehConhecido && texto.length > 0) {
        await msg.reply(config.messages.afterMenuInvalid);
        return;
      }
    }
  } catch (error) {
    console.error('Erro ao responder mensagem:', error);
  }
});

// Envio automático de bom dia, boa tarde e boa noite
function iniciarAgendadorDeMensagens() {
  const alvo = config.owner.targetNumber;

  let ultimoDiaBomDia = null;
  let ultimoDiaBoaTarde = null;
  let ultimoDiaBoaNoite = null;

  setInterval(async () => {
    const agora = new Date();
    const horas = agora.getHours();
    const minutos = agora.getMinutes();
    const dia = agora.toDateString(); // identifica o dia atual

    try {
      // Bom dia às 08:00
      if (horas === 8 && minutos === 0 && ultimoDiaBomDia !== dia) {
        await client.sendMessage(alvo, config.scheduler.bomDia);
        ultimoDiaBomDia = dia;
      }

      // Boa tarde às 12:00
      if (horas === 12 && minutos === 0 && ultimoDiaBoaTarde !== dia) {
        await client.sendMessage(alvo, config.scheduler.boaTarde);
        ultimoDiaBoaTarde = dia;
      }

      // Boa noite às 23:00
      if (horas === 23 && minutos === 0 && ultimoDiaBoaNoite !== dia) {
        await client.sendMessage(alvo, config.scheduler.boaNoite);
        ultimoDiaBoaNoite = dia;
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem automática:', error);
    }
  }, 60 * 1000); // verifica a cada minuto
}

client.initialize();

startAdminPanel(3000);

