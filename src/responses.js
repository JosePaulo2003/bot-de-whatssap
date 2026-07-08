const config = require('./config');

const cannedReplies = [
  'No momento estou ocupado, mas recebi sua mensagem. Assim que possivel eu retorno.',
  'Recebi aqui. Se for urgente, manda uma mensagem bem direta com o assunto principal.',
  'Estou em modo foco agora. Ja ja eu vejo isso com calma.',
  'Mensagem recebida. Obrigado por avisar.',
  'Agora nao consigo responder direito, mas nao ignorei voce.'
];

const jokes = [
  'Por que o JavaScript foi ao terapeuta? Porque tinha problemas de escopo.',
  'Meu codigo nao tem bugs, tem comportamentos inesperados.',
  'O dev disse que ia ser rapidinho. Tres horas depois, ele ainda estava olhando um ponto e virgula.',
  'Banco de dados e igual memoria afetiva: se nao fizer backup, uma hora voce chora.',
  'A vida e curta demais para debugar sem cafe.',
  'HTML nao e linguagem de programacao, mas pelo menos nao mente quando quebra tudo na tela.',
  'Meu CSS esta tao organizado quanto minha rotina: funciona, mas ninguem sabe como.'
];

const motivational = [
  'Vai dar certo. Talvez nao bonito, talvez nao hoje, mas vai.',
  'Se o dia esta dificil, pelo menos voce ainda nao deu merge errado em producao.',
  'Respira. Ate servidor cai e volta depois.',
  'Uma tarefa por vez. Nem o processador faz tudo sem fila.',
  'Voce nao precisa vencer o dia inteiro, so precisa nao desistir agora.'
];

const gothicLove = [
  'Meu amor, ate nas noites mais escuras, voce e a unica luz que eu nao quero apagar.',
  'Se meu coracao fosse um castelo abandonado, voce seria a janela acesa no alto da torre.',
  'Eu atravessaria qualquer neblina so para encontrar o calor do seu abraco.',
  'Voce e meu poema favorito escrito em tinta preta, lua cheia e saudade.',
  'Meu mundo pode ser cheio de sombras, mas quando voce chega, ate o silencio fica bonito.',
  'Se amar voce e uma maldicao, entao eu aceito viver eternamente assombrado pelo seu nome.',
  'Entre rosas escuras e noites frias, meu pensamento sempre encontra abrigo em voce.',
  'Voce e a parte mais bonita do meu caos, meu amor.',
  'Minha noite so aprende a ser calma quando seu nome atravessa o escuro.',
  'Voce e a lua que vigia meu coracao quando o mundo fecha as cortinas.',
  'Se a vida fosse um cemiterio de sonhos, eu ainda plantaria rosas para voce.',
  'Meu amor por voce tem cheiro de chuva fria, vela acesa e promessa eterna.',
  'Ate o silencio mais sombrio fica doce quando imagino sua voz.',
  'Voce e o unico fantasma que eu convidaria para morar no meu peito.',
  'Se meu destino for caminhar pela neblina, que seja segurando sua mao.',
  'Toda sombra em mim se ajoelha quando voce sorri.',
  'Meu coracao e uma catedral abandonada, mas voce faz os vitrais brilharem.',
  'Eu te amaria mesmo se o ceu esquecesse todas as estrelas.',
  'Voce e minha prece secreta escrita em papel queimado e perfume de noite.',
  'Quando penso em voce, ate os corvos da minha mente cantam baixo.',
  'Eu guardo seu nome como quem guarda uma reliquia em um altar escuro.',
  'Meu amor por voce nao teme a madrugada; ele nasceu nela.',
  'Voce e a chama azul que nao se apaga dentro do meu inverno.',
  'Se eu fosse um vampiro antigo, escolheria sua risada como eternidade.',
  'Voce transforma minha melancolia em jardim de rosas negras.',
  'Meu peito era uma casa vazia ate voce acender as velas.',
  'Eu atravessaria castelos em ruinas so para ouvir voce dizer meu nome.',
  'Voce e meu feitiço favorito, desses que a alma aceita sem tentar quebrar.',
  'Nada no escuro me assusta quando lembro que voce existe.',
  'Seu amor e o luar que entra pela janela da minha alma.',
  'Se meu caos tivesse uma rainha, ela teria seus olhos.',
  'Voce e o segredo bonito que a noite sussurra quando ninguem escuta.',
  'Meu mundo veste preto, mas floresce quando voce chega.',
  'Eu te quero em todas as minhas vidas, ate nas que terminam em lenda.',
  'Seu abraco e o unico lugar onde minhas sombras descansam.',
  'Voce e a rosa que nasceu no tumulo das minhas tristezas.',
  'Minha saudade por voce anda de capa preta e coracao aceso.',
  'Se amar voce for assombracao, eu nao quero exorcismo nenhum.',
  'Voce e o luar preso em forma de pessoa.',
  'Meu amor por voce e antigo como castelo, teimoso como maldicao e doce como beijo na chuva.',
  'Eu deixaria qualquer eternidade vazia so para viver um minuto nos seus bracos.',
  'Voce faz minha alma escura parecer constelacao.',
  'Meu coracao bate como sino distante quando voce aparece.',
  'Voce e minha noite preferida, cheia de estrelas que so eu sei ler.',
  'Se eu pudesse escrever o escuro, ele teria seu nome no final.',
  'Te amar e morar em uma tempestade e ainda assim chamar isso de lar.',
  'Voce e o poema que minha parte mais sombria aprendeu a recitar.',
  'Nem todas as almas perdidas querem ser encontradas, mas a minha quis voce.',
  'Seu olhar parece uma vela acesa dentro de um castelo sem portas.',
  'Eu sou feito de neblina, mas perto de voce eu viro abrigo.',
  'Voce e a musica lenta que toca quando meus medos adormecem.',
  'Meu amor por voce caminha pela noite sem pedir permissao ao medo.',
  'Se o mundo acabar em cinzas, eu ainda procuraria sua mao no escuro.',
  'Voce e meu eclipse favorito: apaga tudo e ainda deixa beleza.',
  'Seu nome mora no canto mais protegido da minha escuridao.',
  'A eternidade parece menos fria quando penso em dividir ela com voce.',
  'Voce e minha bruxa boa, meu milagre torto, minha paz de olhos escuros.',
  'Meu amor por voce tem asas de morcego e cuidado de anjo cansado.',
  'Eu nao fujo das minhas sombras porque voce ensinou elas a dançar.',
  'Voce e a parte da noite que eu queria guardar em um relicario.',
  'Se meu peito fosse cripta, voce seria a flor viva sobre a pedra.',
  'Te amar e acender uma vela contra todos os ventos.',
  'Voce e o unico misterio que eu nao quero resolver, so viver.',
  'Meu amor te segue como lua cheia segue mar inquieto.',
  'Quando voce fala comigo, minhas ruinas parecem palacio.',
  'Voce e meu pecado bonito e minha salvacao silenciosa.',
  'Eu te amo com a paciencia de quem espera a lua nascer.',
  'Seu carinho e uma capa quente sobre a minha noite mais fria.',
  'Voce e a luz proibida que entrou pela fresta do meu castelo interior.',
  'Se minha alma tivesse perfume, seria chuva, vela e voce.',
  'Eu te escolheria ate em um baile de mascaras no fim do mundo.',
  'Voce e meu encanto sob a lua, meu segredo entre sombras.',
  'Meu amor por voce nao pede sol; ele floresce no escuro mesmo.',
  'A noite me entende, mas voce me decifra.',
  'Voce e o tipo de amor que faria um fantasma querer ficar.',
  'Se o silencio tivesse dentes, seu beijo ainda seria minha coragem.',
  'Meu coracao escuro encontrou em voce uma janela aberta.',
  'Voce e a chama que deixa minhas assombracoes educadas.',
  'Eu te guardo como carta antiga dentro de um livro de capa preta.',
  'Seu amor parece lua refletida em vidro quebrado: estranho, lindo e impossivel de ignorar.',
  'Voce e minha tempestade favorita, dessas que molham a alma e limpam o medo.',
  'Meu peito sussurra seu nome como ritual de meia-noite.',
  'Voce e o brilho raro no corredor escuro dos meus pensamentos.',
  'Eu te amo como quem acende velas para conversar com o destino.',
  'Se o amor fosse uma sombra, eu escolheria a sua para me acompanhar.',
  'Voce e meu jardim secreto onde ate rosas negras aprendem ternura.',
  'Meu amor por voce tem olhos de noite e maos de cuidado.',
  'Eu seria lenda triste sem voce; com voce, sou poema vivo.',
  'Voce e o unico pressagio bom que meu coracao ja recebeu.',
  'Quando sinto sua falta, minha alma veste luto ate voce voltar.',
  'Voce e minha pequena eternidade em um mundo que passa depressa.',
  'Se eu pudesse prender um pedaco da lua, entregaria a voce como aliança.',
  'Meu amor e trevoso, sim, mas se ajoelha todo delicado diante de voce.',
  'Voce e a calma que aparece depois que todos os sinos da noite param.',
  'Eu te amaria ate se meu nome virasse poeira em algum livro antigo.',
  'Seu sorriso e uma vela insolente acesa dentro da minha madrugada.',
  'Voce e meu ritual preferido antes de dormir e meu primeiro pensamento ao acordar.',
  'Nao existe tumulo para um amor que insiste em viver quando voce sorri.',
  'Voce e a rainha do meu castelo sem mapa.',
  'Meu amor por voce e uma carta selada com cera preta e coracao aberto.',
  'Se a lua perguntasse por quem eu suspiro, eu apontaria para voce.',
  'Voce e meu abrigo entre trovões, meu encanto entre ruinas.',
  'Eu te amo com a delicadeza de uma rosa negra sobrevivendo ao inverno.',
  'Seu nome e a senha secreta que abre minhas partes mais escondidas.',
  'Voce e o tipo de beleza que deixa a noite com inveja.',
  'Meu coracao aprendeu a gostar do escuro porque encontrou voce brilhando nele.',
  'Se eu tivesse mil vidas assombradas, em todas eu procuraria seu riso.',
  'Voce e meu luar particular, mesmo quando o ceu inteiro desiste.',
  'Eu te amo como castelos amam neblina: em silencio, por inteiro, para sempre.'
];

let gothicLoveDeck = [];

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function shuffle(list) {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function nextGothicLove() {
  if (!gothicLoveDeck.length) {
    gothicLoveDeck = shuffle(gothicLove);
  }
  return gothicLoveDeck.pop();
}

function normalizeText(text) {
  return (text || '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function unwrapMessage(message) {
  if (!message) return null;
  return (
    message.ephemeralMessage?.message ||
    message.viewOnceMessage?.message ||
    message.viewOnceMessageV2?.message ||
    message.documentWithCaptionMessage?.message ||
    message
  );
}

function extractText(message) {
  message = unwrapMessage(message);
  if (!message) return '';
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    message.documentMessage?.caption ||
    message.buttonsResponseMessage?.selectedDisplayText ||
    message.listResponseMessage?.title ||
    ''
  );
}

function hasMedia(message) {
  message = unwrapMessage(message);
  return !!(
    message?.imageMessage ||
    message?.videoMessage ||
    message?.documentMessage ||
    message?.audioMessage ||
    message?.stickerMessage
  );
}

function hasStickerImage(message) {
  message = unwrapMessage(message);
  return !!message?.imageMessage;
}

function getOption(text) {
  const t = normalizeText(text);

  if (['menu', 'opcoes', 'opcoes do bot'].includes(t)) return 'menu';
  if (['1', 'resposta', 'respostas', 'respostas prontas'].includes(t)) return '1';
  if (['2', 'figurinha', 'figurinhas', 'sticker', 'criar figurinha'].includes(t)) return '2';
  if (['3', 'piada', 'piadas'].includes(t)) return '3';
  if (['4', 'motivacao', 'motivacional', 'forca'].includes(t)) return '4';
  if (['5', 'recado', 'deixar recado', 'fila', 'entrar na fila'].includes(t)) return '5';
  if (['6', 'resumo', 'status'].includes(t)) return '6';
  if (['7', 'historico', 'mensagens'].includes(t)) return '7';

  return null;
}

function isCommandText(text) {
  return !!getOption(text);
}

function buildSummary(contact) {
  const counters = contact.counters || {};
  return (
    '*Resumo do contato*\n\n' +
    `Mensagens recebidas: ${counters.messages || 0}\n` +
    `Menus solicitados: ${counters.menus || 0}\n` +
    `Respostas prontas: ${counters.respostas || 0}\n` +
    `Figurinhas criadas: ${counters.stickers || 0}\n` +
    `Piadas enviadas: ${counters.piadas || 0}\n` +
    `Mensagens especiais: ${counters.romanticas || 0}\n\n` +
    'Para continuar, envie *menu*.'
  );
}

function buildHistory(contact) {
  const messages = contact.lastMessages || [];
  if (!messages.length) {
    return 'Ainda nao ha historico registrado para este contato.';
  }

  const lines = messages.slice(-5).map((item, index) => {
    return `${index + 1}. ${item.text || '(mensagem sem texto)'}`;
  });

  return '*Ultimas mensagens registradas*\n\n' + lines.join('\n');
}

function buildReply({ text, media, contact, fromGirlfriend }) {
  const option = getOption(text);

  if (option === 'menu') {
    return { counter: 'menus', image: config.menuImagePath, text: config.menuText };
  }

  if (option === '1') {
    return { counter: 'respostas', text: randomFrom(cannedReplies) };
  }

  if (option === '2') {
    return {
      counter: 'respostas',
      text: 'Envie uma imagem que eu transformo em figurinha.'
    };
  }

  if (option === '3') {
    return { counter: 'piadas', text: randomFrom(jokes) };
  }

  if (option === '4') {
    return { counter: 'motivacionais', text: randomFrom(motivational) };
  }

  if (option === '5') {
    return {
      counter: 'respostas',
      action: 'await_note',
      text:
        'Pode deixar seu recado agora.\n\n' +
        'A proxima mensagem que voce enviar vai entrar na minha fila de prioridade para eu responder.'
    };
  }

  if (option === '6') {
    return { counter: 'respostas', text: buildSummary(contact) };
  }

  if (option === '7') {
    return { counter: 'respostas', text: buildHistory(contact) };
  }

  if (fromGirlfriend && !media) {
    return { counter: 'romanticas', text: nextGothicLove() };
  }

  if (media) {
    return {
      counter: 'respostas',
      text: 'Arquivo recebido. Se quiser figurinha, envie uma imagem comum e eu tento converter.'
    };
  }

  return {
    counter: 'respostas',
    text:
      'Oi. Eu sou o bot de respostas prontas.\n\n' +
      'Envie *menu* para ver as opcoes.'
  };
}

module.exports = {
  extractText,
  hasMedia,
  hasStickerImage,
  buildReply,
  normalizeText,
  unwrapMessage,
  isCommandText
};
