const perfisBase = [
  `Classe: Sobrevivente cansado.
Nível de caos interno: 87%.
Chance de responder mensagens: depende do humor e do Wi-Fi.`,
  `Classe: Mago da procrastinação.
Pontos de mana: quase zero.
Habilidade especial: deixar tudo pra depois com estilo.`,
  `Classe: Guerreiro(a) do drama.
Defesa emocional: baixa.
Ataque especial: pensar demais em tudo.`,
  `Classe: Tank de problema.
Carga atual: acima do recomendado.
Habilidade passiva: aguenta mais do que devia.`,
  `Classe: Suporte emocional dos outros.
Auto-cura: em manutenção.
Habilidade secreta: dizer “tá tudo bem” quando não tá.`,
  `Classe: Hacker da própria vida.
Bug conhecido: se sabota sozinho(a).
Patch de correção: ainda em desenvolvimento.`,
  `Classe: Andarilho(a) de rolês mentais.
Localização atual: pensando em 3 coisas ao mesmo tempo.
GPS emocional: recalculando rota.`,
  `Classe: Mago social em cooldown.
Charisma: alto quando tem energia.
Habilidade limitada: responder rápido.`,
  `Classe: NPC principal da própria história.
Missões ativas: mais do que o necessário.
Recompensas: ainda não vieram todas.`,
  `Classe: Aprendiz de adulto.
Manual de instruções: perdido.
Status: improvisando desde sempre.`,
  `Classe: Bardo do caos.
Instrumento principal: notificações aleatórias.
Buff: aumenta o drama em 20% em qualquer conversa.
Debuff: atenção focada reduzida à metade.`,
  `Classe: Clérigo do café.
Recurso sagrado: cafeína.
Habilidade diária: ressuscitar a própria vontade de viver por 30 minutos.
Fraqueza: reuniões longas.`,
  `Classe: Arqueiro da desculpa.
Precisão: 95% em arrumar justificativa pra tudo.
Habilidade especial: “não deu tempo”.
Resistência a cobranças: baixa.`,
  `Classe: Ladino da mensagem visualizada.
Passiva: lê e some.
Habilidade ativa: responder mentalmente e achar que mandou.
Alinhamento: caótico ocupado.`,
  `Classe: Paladino da boa intenção.
Juramento: vai organizar a vida “semana que vem”.
Arma: listas de tarefa que nunca acabam.
Limitação: foco intermitente.`,
  `Classe: Invocador de problema.
Magia principal: “o que pode dar errado?”.
Efeito colateral: descobre na prática.
Afinidade: drama e cafeína.`,
  `Classe: Druida do quarto bagunçado.
Habitat natural: cama.
Companheiro animal: travesseiro.
Habilidade: camuflagem em cobertor em dias de caos.`,
  `Classe: Monge da sobrecarga.
Disciplina: tenta, mas o mundo não ajuda.
Barra de estresse: quase sempre cheia.
Especial: 3 respirações fundas antes de surtar.`,
  `Classe: Engenheiro(a) de expectativas.
Projeto atual: vida ideal.
Status do projeto: em atraso desde o início.
Risco: alta chance de refazer tudo do zero.`,
  `Classe: Necromante de planos antigos.
Habilidade: ressuscitar ideias que deveriam ter ficado mortas.
Efeito colateral: arrependimento leve a moderado.
Afinidade: nostalgia.`,
  `Classe: Alquimista da agenda.
Mistura compromissos, metas e promessas.
Resultado: explosões de cansaço em horários aleatórios.
Item raro: tempo livre.`,
  `Classe: Guardião(a) do Wi-Fi.
Poder principal: sumir quando a conexão cai.
Fraqueza: reuniões por vídeo.
Buff: 10% mais coragem com fone de ouvido.`,
  `Classe: Batedor da ansiedade.
Campo de visão: todos os piores cenários possíveis.
Passiva: traduz silêncio como problema.
Habilidade: criar filme mental completo em 5 segundos.`,
  `Classe: Artista do excesso de pensamento.
Ferramenta: cérebro em overclock.
Obra favorita: conversas imaginárias que nunca acontecem.
Fraqueza: descanso real.`,
  `Classe: Samurai do sono atrasado.
Código de honra: “só mais um episódio”.
Pontos de vida: reduzidos.
Penalidade: acordar funcional é missão épica.`,
  `Classe: Cartógrafo(a) de caminhos errados.
Especialidade: aprender na rota mais longa.
Mapa atual: cheio de desvios emocionais.
Objetivo: chegar em algum lugar que faça sentido.`,
  `Classe: Feiticeiro(a) do áudio longo.
Magia proibida: mandar áudio de 5 minutos dizendo que é rapidinho.
Tempo de recarga: vergonha depois de ouvir o próprio áudio.
Efeito colateral: vontade de apagar tudo.`,
  `Classe: Gladiador(a) de grupo de família.
Arena: WhatsApp com bom dia diário.
Arma: mutar conversa.
Habilidade especial: ignorar discussão inútil.`,
  `Classe: Sentinela da notificação.
Reflexo: abre mensagem na hora errada.
Debuff: não consegue responder de imediato.
Status: vive devendo resposta pra alguém.`,
  `Classe: Ilusionista da organização.
Magia: parece que está tudo sob controle.
Realidade: 17 coisas pendentes.
Skill: esconder o caos com humor.`,
  `Classe: Mercador(a) de tempo emprestado.
Recurso principal: horas que não existem.
Negócio: empresta sono, cobra em cansaço.
Saldo atual: negativo.`,
  `Classe: Bárbaro(a) da sinceridade tardia.
HP emocional: baixo.
Ataque: fala o que sente só quando já passou do limite.
Passiva: arrependimento pós-desabafo.`,
  `Classe: Cronomante atrasado(a).
Habilidade: mexer no próprio horário só na teoria.
Na prática: chega atrasado e cansado.
Buff: sempre tem explicação longa.`,
  `Classe: Refém da segunda-feira.
Maldição: sensação de recomeço infinito.
Resistência: café.
Fraqueza: alarmes consecutivos.`,
  `Classe: Viajante do feed infinito.
Transporte: polegar em rolagem automática.
Destino: lugar nenhum.
Habilidade: perder horas sem perceber.`,
  `Classe: Bibliófilo(a) de fanfics mentais.
Inventário: histórias que nunca saem da cabeça.
Buff: imaginação absurda.
Debuff: foco no mundo real.`,
  `Classe: Domador(a) de expectativa alheia.
Campo de batalha: “você devia…”.
Defesa: ignorar parte, absorver outra.
Estado: exausto(a).`,
  `Classe: Oráculo offline.
Intuição boa, paciência pouca.
Perguntas internas: muitas.
Respostas: aparecem só depois que já tomou a decisão.`,
  `Classe: Ferreiro(a) de limites.
Trabalho: dizer “não” sem culpa.
Progresso: 32% concluído.
Bug: ainda aceita coisa demais às vezes.`,
  `Classe: Ranger da vida social limitada.
Área segura: casa.
Inimigo natural: convite inesperado.
Ganho de XP: sair e não se arrepender.`,
  `Classe: Mestre das abas abertas.
Inventário: 37 coisas começadas, 2 terminadas.
Passiva: viver em modo multitarefa travado.
Quest atual: fechar uma aba sem abrir outra.`,
  `Classe: Curandeiro(a) de conversa alheia.
Função: ouvir desabafo dos outros.
Skill escondida: não falar dos próprios.
Estado: emocionalmente cansado(a) porém educado(a).`,
  `Classe: Alquimista de mensagem não enviada.
Especialidade: escrever textão e apagar.
Reagente principal: orgulho.
Efeito: silêncio dramático.`,
  `Classe: Sobrecarregado(a) funcional.
Status: faz mil coisas e parece normal.
Buff: consegue entregar no limite.
Debuff: não sabe como descansar.`,
  `Classe: Colecionador(a) de inícios.
Habilidade: começar projetos empolgado(a).
Ponto fraco: finalização.
Inventário: ideias demais, tempo de menos.`,
  `Classe: Explorador(a) de crushs impossíveis.
Radar: sempre mira no mais complicado.
Mapa: cheio de terreno emocional instável.
Conclusão: gosta de desafio, ou de sofrer.`,
  `Classe: Guardião(ã) do silêncio desconfortável.
Perícia: transformar um “oi” em análise excessiva.
Skill: pensar em 40 respostas e não mandar nenhuma.
Resultado: mais um diálogo que nunca existiu.`,
  `Classe: Habitante do “tanto faz mas me importo”.
Frase padrão: “ah, tanto faz”.
Tradução: se importa, mas não quer discutir.
Resistência: evitou briga extra hoje.`,
  `Classe: Bardo(a) de indiretas.
Instrumento: stories.
Repertório: frases que “não são pra ninguém”.
Alvo: todo mundo sabe pra quem é.`,
  `Classe: Monge do fone de ouvido.
Meditação: playlist no volume máximo.
Mundo externo: parcialmente ignorado.
Weakness: chamada de vídeo surpresa.`,
  `Classe: Administrador(a) de grupo mutado.
Função oficial: nenhuma.
Função real: só aparece pra rir de meme.
Status: presença silenciosa porém constante.`,
  `Classe: Acrobata da agenda emocional.
Habilidade: equilibrar sentimentos, tarefas e medo de falhar.
Chance de queda: estatisticamente alta.
Recovery: piada pra disfarçar.`,
  `Classe: Engolidor(a) de “tá tudo bem”.
Consumo diário: emoções engolidas.
Efeito colateral: cansaço acumulado.
Remédio: falar com alguém de confiança (quando der).`,
  `Classe: Mestre do “depois eu vejo”.
Tempo verbal favorito: futuro indefinido.
Caixa de entrada: cheia.
Vida: também.`,
  `Classe: Cavaleiro(a) do “só hoje”.
Promessa padrão: amanhã eu me organizo.
Loop: hoje nunca acaba.
Buff: consegue rir do próprio caos.`,
  `Classe: Sentinela da madrugada.
Turno: ativo quando deveria estar dormindo.
Pensamentos: todos de uma vez.
Boss final: alarme do dia seguinte.`,
  `Classe: Colecionador(a) de conversas começadas.
Mensagens: muitas.
Respostas: nem tantas.
Conclusão: intenção ótima, execução duvidosa.`,
  `Classe: Andarilho(a) do “e se...”.
Região favorita: cenários hipotéticos.
Habilidade: criar realidades paralelas na cabeça.
Efeito: dificuldade de ficar no presente.`,
  `Classe: Cultivador(a) de planta morta.
Histórico: já tentou autocuidado mas esqueceu de regar.
Status atual: tentando de novo.
Buff: pelo menos ainda se importa.`,
  `Classe: Xamã do meme.
Linguagem sagrada: sticker.
Ritual: responder seriedade com piada.
Resultado: sobrevive rindo pra não chorar.`,
  `Classe: Teórico(a) de planos perfeitos.
Excelência em planejamento.
Ponto fraco: execução no mundo real.
Diagnóstico: cérebro PMO, corpo modo soneca.`,
  `Classe: Guardião(ã) de promessas antigas.
Inventário: “um dia a gente marca”.
Cooldown: infinito.
Status: socialmente exausto(a), mas educado(a).`,
  `Classe: Engenheiro(a) de fuga mental.
Passiva: se distrai pra longe quando o assunto aperta.
Skill: pensar em outra coisa sem sair do lugar.
Buff: protege, mas também atrasa.`,
  `Classe: Piloto automático da rotina.
Rota atual: acordar, sobreviver, repetir.
Manual: ninguém entregou.
Meta secreta: achar sentido no caminho.`,
  `Classe: Treinador(a) de expectativas.
Monstros internos: “podia ter feito melhor”.
Método de treino: tentativa e erro.
Estado: cansaço porém teimosia.`,
  `Classe: Viajante do calendário.
Agenda: cheia de planos riscados.
Habilidade: remarcar sem culpa aparente.
XP: acumulando experiência em improviso.`,
  `Classe: Operador(a) do caos controlado.
Painel de controle: cheio de alarmes piscando.
Resposta padrão: “depois eu vejo isso”.
Sistema: misteriosamente ainda de pé.`,
  `Classe: Necromante de mensagens.
Skill: reviver conversa de 3 dias atrás como se fosse agora.
Side effect: confunde linha do tempo social.
Alinhamento: caótico nostálgico.`,
  `Classe: Chefe de si mesmo sem RH.
Cobrança interna: alta.
Reconhecimento: quase zero.
Plano de carreira: tentar não pirar.`,
  `Classe: Bibliotecário(a) de pensamentos não ditos.
Estante mental: cheia.
Livros lançados: poucos.
Medo: reação dos outros ao conteúdo.`,
  `Classe: Lutador(a) de turnos mentais.
Round 1: motivação.
Round 2: cansaço.
Round 3: “vou tentar de novo amanhã”.`,
  `Classe: Operador(a) de modo avião emocional.
Habilidade: desligar sentimento por uns minutos.
Risco: esquecer de ligar de volta.
Log: acumulando coisas não processadas.`,
  `Classe: Batedor(a) do próprio limite.
Área de exploração: até onde dá pra ir sem quebrar.
Registro: já passou do limite algumas vezes.
Conclusão: ainda assim continua.`,
  `Classe: Domador(a) de urgências falsas.
Ambiente: tudo parece urgente.
Skill: descobrir depois que dava pra ter feito com calma.
XP ganho: muito estresse pra pouco resultado.`,
  `Classe: Escudeiro(a) das próprias falhas.
Defesa: se critica antes que os outros critiquem.
Buff: leve imunidade a julgamento externo.
Debuff: dificuldade em reconhecer acertos.`,
  `Classe: Equilibrista de prazos.
Cordas: responsabilidade, sono e humor.
Vento: imprevistos constantes.
Objetivo: não cair feio.`,
  `Classe: Conjurador(a) de “mas tá tudo bem”.
Feitiço: minimizar o próprio caos.
Componente material: sorriso cansado.
Efeito: ninguém vê o tamanho da bagunça por trás.`,
  `Classe: Viajante interdimensional do “e se”.
Portais: arrependimento e curiosidade.
Destino favorito: finais alternativos que nunca existiram.
Conseqüência: dificuldade em ficar aqui e agora.`
];

function gerarStatus(from) {
  // Poderia usar from pra customizar no futuro
  const base = perfisBase[Math.floor(Math.random() * perfisBase.length)];
  return base;
}

module.exports = {
  gerarStatus
};
