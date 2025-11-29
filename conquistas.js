const fs = require('fs');
const path = require('path');

const counters = {};

const DATA_FILE = path.join(__dirname, 'counters_data.json');

function carregarCounters() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      if (raw) {
        const parsed = JSON.parse(raw);
        Object.assign(counters, parsed || {});
      }
    }
  } catch (e) {
    // se der erro na leitura, ignora e começa vazio
    console.error('Erro ao carregar counters_data.json:', e.message);
  }
}

function salvarCounters() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(counters, null, 2), 'utf8');
  } catch (e) {
    console.error('Erro ao salvar counters_data.json:', e.message);
  }
}

carregarCounters();

function getUser(from) {
  if (!counters[from]) {
    counters[from] = {
      piadas: 0,
      figurinhas: 0,
      jogos: 0,
      motivacionais: 0,
      destinos: 0,
      menus: 0
    };
  }
  return counters[from];
}

function registrarUso(from, tipo) {
  const user = getUser(from);
  if (tipo in user) {
    user[tipo] += 1;
  }
  salvarCounters();
}

function gerarConquistas(from) {
  const u = getUser(from);
  const conquistas = [];

  if (u.piadas >= 5) {
    conquistas.push('🏆 Conquista: Viciado(a) em piadas sarcásticas. Você já pediu piada mais de 5 vezes.');
  }
  if (u.figurinhas >= 5) {
    conquistas.push('🏆 Conquista: Mestre das figurinhas. Você já transformou várias imagens em stickers.');
  }
  if (u.jogos >= 3) {
    conquistas.push('🏆 Conquista: Sobrevivente do jogo da velha. Já encarou o bot algumas vezes.');
  }
  if (u.motivacionais >= 3) {
    conquistas.push('🏆 Conquista: Sobrevivendo à motivação sarcástica. Você já pediu “força” irônica mais de uma vez.');
  }
  if (u.destinos >= 3) {
    conquistas.push('🏆 Conquista: Dependente do destino. Você consulta o bot mais que o próprio bom senso.');
  }
  if (u.menus >= 5) {
    conquistas.push('🏆 Conquista: Explorador(a) de menu. Você vive voltando pro cardápio do caos.');
  }

  // Conquistas extras por volume de uso
  const totalInteracoes =
    u.piadas + u.figurinhas + u.jogos + u.motivacionais + u.destinos + u.menus;

  if (totalInteracoes >= 10) {
    conquistas.push('⭐ Conquista: Usuário(a) recorrente. Você já usou o bot mais de 10 vezes.');
  }
  if (totalInteracoes >= 30) {
    conquistas.push('🌟 Conquista: Morador(a) oficial do bot. Sua frequência de uso está oficialmente alta.');
  }
  if (totalInteracoes >= 60) {
    conquistas.push('💫 Conquista: Viciado(a) em entretenimento automatizado. Talvez seja hora de beber água.');
  }

  // Conquistas de especialização
  if (u.piadas >= 20) {
    conquistas.push('📚 Conquista: Enciclopédia do sarcasmo. Você praticamente usa o bot como fonte oficial de piadas ácidas.');
  }
  if (u.figurinhas >= 15) {
    conquistas.push('🖼️ Conquista: Fábrica de stickers. Qualquer imagem perto de você corre o risco de virar figurinha.');
  }
  if (u.jogos >= 10) {
    conquistas.push('🎮 Conquista: Guerreiro(a) da velha guarda. Você já desafiou o bot várias vezes no jogo da velha.');
  }
  if (u.motivacionais >= 10) {
    conquistas.push('💬 Conquista: Sobrevivente da motivação tóxica. Você insiste em pedir frases motivacionais mesmo sabendo que vem ironia.');
  }
  if (u.destinos >= 10) {
    conquistas.push('🔮 Conquista: Oráculo dependente. Você consulta o destino do bot como se ele fosse menos confuso que a vida real.');
  }
  if (u.menus >= 15) {
    conquistas.push('🧭 Conquista: Turista de menu. Você visita o menu com tanta frequência que já sabe as opções de cabeça.');
  }

  // Conquistas de estilo de uso
  if (u.piadas > 0 && u.figurinhas === 0 && u.jogos === 0 && u.motivacionais === 0 && u.destinos === 0) {
    conquistas.push('🎭 Conquista: Minimalista do sarcasmo. Você só vem aqui buscar piada e vai embora. Respeitável.');
  }
  if (u.figurinhas > 0 && u.piadas === 0 && u.jogos === 0 && u.motivacionais === 0 && u.destinos === 0) {
    conquistas.push('🧩 Conquista: Artesão(ã) de figurinhas. Você ignora todo o resto e usa o bot como fábrica de stickers.');
  }
  if (u.jogos > 0 && totalInteracoes === u.jogos) {
    conquistas.push('🕹️ Conquista: Viciado(a) em jogo da velha. Você ignora todas as outras funções e só quer bater no bot (ou apanhar dele).');
  }
  if (u.motivacionais > 0 && totalInteracoes === u.motivacionais) {
    conquistas.push('📢 Conquista: Consumidor(a) de tapa na cara motivacional. Você só vem atrás das frases tortas de incentivo.');
  }
  if (u.destinos > 0 && totalInteracoes === u.destinos) {
    conquistas.push('🧿 Conquista: Aluno(a) do destino. Sua principal fonte de decisão é um bot sarcástico. Corajoso(a).');
  }

  // Conquistas de equilíbrio
  const categoriasUsadas = ['piadas', 'figurinhas', 'jogos', 'motivacionais', 'destinos', 'menus'].filter(
    (k) => u[k] > 0
  ).length;

  if (categoriasUsadas >= 4 && totalInteracoes >= 20) {
    conquistas.push('🌍 Conquista: Explorador(a) completo(a). Você já testou quase tudo que o bot oferece.');
  }
  if (categoriasUsadas === 1 && totalInteracoes >= 10) {
    conquistas.push('🎯 Conquista: Mono-build. Você escolheu um tipo de função do bot e está upando ela no máximo.');
  }

  if (conquistas.length === 0) {
    return '⚪ Ainda não há conquistas desbloqueadas. Continue usando o bot e talvez o universo te dê uma estrelinha (ou pelo menos um sticker).';
  }

  // Barra de progresso geral (em relação a um alvo simbólico de 50 interações)
  const alvo = 50;
  const progresso = Math.max(0, Math.min(1, totalInteracoes / alvo));
  const blocosTotais = 20;
  const blocosCheios = Math.round(progresso * blocosTotais);
  const blocosVazios = blocosTotais - blocosCheios;
  const barraBase = 'Progresso geral: [' + '█'.repeat(blocosCheios) + '░'.repeat(blocosVazios) + `] ${Math.round(progresso * 100)}%`;

  let nivel = 'Nível: 🔰 Iniciante do caos';
  if (progresso >= 0.3 && progresso < 0.7) {
    nivel = 'Nível: ⚔️ Intermediário(a) da insanidade controlada';
  } else if (progresso >= 0.7) {
    nivel = 'Nível: 💀 Mestre supremo do entretenimento duvidoso';
  }

  const barra = barraBase + '\n' + nivel;

  return barra + '\n\n' + conquistas.join('\n');
}

function getResumoUso() {
  const usuarios = Object.keys(counters).map((id) => {
    const u = counters[id];
    const total =
      u.piadas + u.figurinhas + u.jogos + u.motivacionais + u.destinos + u.menus;
    return {
      id,
      ...u,
      total
    };
  });

  const totaisGerais = usuarios.reduce(
    (acc, u) => {
      acc.piadas += u.piadas;
      acc.figurinhas += u.figurinhas;
      acc.jogos += u.jogos;
      acc.motivacionais += u.motivacionais;
      acc.destinos += u.destinos;
      acc.menus += u.menus;
      acc.total += u.total;
      return acc;
    },
    {
      piadas: 0,
      figurinhas: 0,
      jogos: 0,
      motivacionais: 0,
      destinos: 0,
      menus: 0,
      total: 0
    }
  );

  usuarios.sort((a, b) => b.total - a.total);

  return {
    usuarios,
    totaisGerais
  };
}

function resetUser(id) {
  if (id && counters[id]) {
    delete counters[id];
    salvarCounters();
  }
}

module.exports = {
  registrarUso,
  gerarConquistas,
  getResumoUso,
  resetUser
};
