const games = {}; // estado por chatId
const aguardandoReinicio = new Set(); // chats aguardando resposta se querem reiniciar
const { setDificuldade, getDificuldade, setAguardandoDificuldade, isAguardandoDificuldade } = require('./dificuldade');

const EMPTY = '⬜';
const X = '❌';
const O = '⭕';

function renderBoard(board) {
  return (
    `${board[0] || EMPTY} ${board[1] || EMPTY} ${board[2] || EMPTY}\n` +
    `${board[3] || EMPTY} ${board[4] || EMPTY} ${board[5] || EMPTY}\n` +
    `${board[6] || EMPTY} ${board[7] || EMPTY} ${board[8] || EMPTY}\n`
  );
}

function checkWinner(board) {
  const wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (const [a, b, c] of wins) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every((c) => c)) return 'draw';
  return null;
}

function createNewGame(chatId) {
  if (!games[chatId]) {
    games[chatId] = {
      board: Array(9).fill(null),
      turn: 'user',
      userWins: 0,
      botWins: 0,
      draws: 0
    };
  } else {
    games[chatId].board = Array(9).fill(null);
    games[chatId].turn = 'user';
  }
}

function findBestMoveFor(board, symbol) {
  const empties = board
    .map((v, i) => (v === null ? i : null))
    .filter((v) => v !== null);
  for (const idx of empties) {
    const clone = board.slice();
    clone[idx] = symbol;
    if (checkWinner(clone) === symbol) {
      return idx;
    }
  }
  return null;
}

function botMove(board, chatId) {
  const empties = board
    .map((v, i) => (v === null ? i : null))
    .filter((v) => v !== null);
  if (empties.length === 0) return;

  const nivel = getDificuldade(chatId); // 'facil', 'medio', 'dificil'

  // Fácil: sempre aleatório
  if (nivel === 'facil') {
    const idx = empties[Math.floor(Math.random() * empties.length)];
    board[idx] = O;
    return;
  }

  // Médio: tenta ganhar; se não der, joga aleatório
  if (nivel === 'medio') {
    const ganhar = findBestMoveFor(board, O);
    if (ganhar !== null) {
      board[ganhar] = O;
      return;
    }
    const idx = empties[Math.floor(Math.random() * empties.length)];
    board[idx] = O;
    return;
  }

  // Difícil: tenta ganhar, depois bloquear, depois estratégia de prioridade
  const ganhar = findBestMoveFor(board, O);
  if (ganhar !== null) {
    board[ganhar] = O;
    return;
  }

  const bloquear = findBestMoveFor(board, X);
  if (bloquear !== null) {
    board[bloquear] = O;
    return;
  }

  const prioridade = [4, 0, 2, 6, 8, 1, 3, 5, 7];
  for (const pos of prioridade) {
    if (board[pos] === null) {
      board[pos] = O;
      return;
    }
  }
}

function getStatusText(game) {
  const totalJogadas = game.board.filter((c) => c !== null).length;
  const restantes = 9 - totalJogadas;
  const userWins = game.userWins || 0;
  const botWins = game.botWins || 0;
  const draws = game.draws || 0;

  return (
    '📊 Placar do caos\n' +
    `🙂 Você: ${userWins}  |  🤖 Bot: ${botWins}  |  🤝 Empates: ${draws}\n` +
    `🧮 Jogadas restantes: ${restantes}`
  );
}

async function handleJogo(msg, texto) {
  const chatId = msg.from;
  let game = games[chatId];

  // Se estamos aguardando o usuário decidir se reinicia ou sai do jogo
  if (aguardandoReinicio.has(chatId)) {
    if (texto === '1' || texto === 'sim') {
      aguardandoReinicio.delete(chatId);
      createNewGame(chatId);
      game = games[chatId];
      const boardView = renderBoard(game.board);
      const statusText = getStatusText(game);
      await msg.reply(
        'Reiniciando o jogo da velha com a mesma dificuldade. Você continua sendo ' +
          X +
          '.\nEnvie um número de 1 a 9 para jogar na posição correspondente.\nPara sair do jogo, envie 0 ou "sair".\n\n' +
          boardView +
          '\n' +
          statusText
      );
      return true;
    }

    if (texto === '0' || texto === 'sair' || texto === 'nao' || texto === 'não') {
      aguardandoReinicio.delete(chatId);
      delete games[chatId];
      await msg.reply('Beleza, você saiu do jogo da velha. Se quiser jogar de novo depois, é só escolher a opção 5 do menu.');
      return true;
    }

    await msg.reply('Decide aí: envia 1 para reiniciar o jogo da velha ou 0/sair para encerrar.');
    return true;
  }

  // Etapa 1: usuário chamou o jogo, mas ainda não escolheu dificuldade
  if (!game && (texto === '5' || texto === 'jogo' || texto === 'jogo da velha')) {
    setAguardandoDificuldade(chatId, true);
    await msg.reply(
      'Antes de começar o jogo da velha, escolha a dificuldade:\n' +
        '1 - Fácil\n' +
        '2 - Médio\n' +
        '3 - Difícil\n\n' +
        'Envie o número da dificuldade ou 0/sair para cancelar.'
    );
    return true;
  }

  // Cancelar ainda na etapa de escolha de dificuldade
  if (!game && isAguardandoDificuldade(chatId) && (texto === '0' || texto === 'sair')) {
    setAguardandoDificuldade(chatId, false);
    await msg.reply('Você cancelou o jogo da velha antes de começar. Se quiser jogar depois, escolha a opção 5 do menu.');
    return true;
  }

  // Usuário respondendo com a dificuldade
  if (!game && isAguardandoDificuldade(chatId)) {
    if (!['1', '2', '3'].includes(texto)) {
      await msg.reply('Escolhe direito a dificuldade: 1 (Fácil), 2 (Médio) ou 3 (Difícil). Ou envie 0/sair para cancelar.');
      return true;
    }

    const mapa = {
      '1': 'facil',
      '2': 'medio',
      '3': 'dificil'
    };

    const labels = {
      facil: 'Fácil',
      medio: 'Médio',
      dificil: 'Difícil'
    };

    const nivel = mapa[texto];
    setDificuldade(chatId, nivel);
    setAguardandoDificuldade(chatId, false);

    createNewGame(chatId);
    game = games[chatId];
    const boardView = renderBoard(game.board);
    const statusText = getStatusText(game);
    const label = labels[nivel] || 'Fácil';

    await msg.reply(
      'Beleza, vamos jogar no modo ' +
        label +
        '.\nVocê é ' +
        X +
        '.\nEnvie um número de 1 a 9 para jogar na posição correspondente.\nPara sair do jogo, envie 0 ou "sair".\n\n' +
        boardView +
        '\n' +
        statusText
    );
    return true;
  }

  // Se não há jogo em andamento nem escolha de dificuldade pendente, deixa outras funcionalidades do bot tratarem a mensagem
  if (!game) return false; // nenhuma partida ativa

  // Permitir sair do jogo da velha
  if (texto === '0' || texto === 'sair') {
    delete games[chatId];
    await msg.reply('Você saiu do jogo da velha. Se quiser jogar de novo, escolha a opção 5 do menu.');
    return true;
  }

  // A partir daqui, só tratamos como jogo se já existir uma partida ativa
  // Espera número de 1 a 9
  if (!/^([1-9])$/.test(texto)) {
    // não trata como jogo, deixa outras opções do bot cuidarem
    return false;
  }

  const pos = parseInt(texto, 10) - 1;
  if (game.board[pos]) {
    await msg.reply('Essa casa já está ocupada. Escolha outra (1 a 9).');
    return true;
  }

  // Jogada do usuário
  game.board[pos] = X;
  let status = checkWinner(game.board);

  if (status === X) {
    const boardView = renderBoard(game.board);
    game.userWins = (game.userWins || 0) + 1;
    const statusText = getStatusText(game);
    aguardandoReinicio.add(chatId);
    await msg.reply(
      boardView +
        '\n\nVocê ganhou. Pelo menos alguém está vencendo alguma coisa hoje.' +
        '\n\n' +
        statusText +
        '\n\nQuer jogar de novo? Envie 1 para reiniciar com a mesma dificuldade ou 0/sair para encerrar.'
    );
    return true;
  }

  if (status === 'draw') {
    const boardView = renderBoard(game.board);
    game.draws = (game.draws || 0) + 1;
    const statusText = getStatusText(game);
    aguardandoReinicio.add(chatId);
    await msg.reply(
      boardView +
        '\n\nDeu empate. Combina com a sua vida: nada anda, mas também não acaba.' +
        '\n\n' +
        statusText +
        '\n\nQuer jogar de novo? Envie 1 para reiniciar com a mesma dificuldade ou 0/sair para encerrar.'
    );
    return true;
  }

  // Jogada do bot (de acordo com a dificuldade escolhida)
  botMove(game.board, chatId);
  status = checkWinner(game.board);
  const boardView = renderBoard(game.board);

  if (status === O) {
    game.botWins = (game.botWins || 0) + 1;
    const statusText = getStatusText(game);
    aguardandoReinicio.add(chatId);
    await msg.reply(
      boardView +
        '\n\nEu ganhei. Pelo menos em algum lugar as coisas estão funcionando do meu jeito.' +
        '\n\n' +
        statusText +
        '\n\nQuer tentar recuperar a dignidade? Envie 1 para reiniciar com a mesma dificuldade ou 0/sair para encerrar.'
    );
    return true;
  }

  if (status === 'draw') {
    game.draws = (game.draws || 0) + 1;
    const statusText = getStatusText(game);
    aguardandoReinicio.add(chatId);
    await msg.reply(
      boardView +
        '\n\nDeu empate. Universo equilibrado, você continua sofrendo.' +
        '\n\n' +
        statusText +
        '\n\nQuer jogar de novo? Envie 1 para reiniciar com a mesma dificuldade ou 0/sair para encerrar.'
    );
    return true;
  }

  const statusText = getStatusText(game);
  await msg.reply(boardView + '\n\nSua vez de novo. Envie um número de 1 a 9.\n\n' + statusText);
  return true;
}

module.exports = {
  handleJogo
};
