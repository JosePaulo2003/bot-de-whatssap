# Bot de WhatsApp Pessoal

Bot pessoal para respostas prontas, menu interativo, piadas, criacao de figurinhas e respostas romanticas em estilo gotico para a namorada.

## Recursos

- QR Code no terminal.
- Painel admin em `http://localhost:3000`.
- Bloquear/desbloquear usuarios pelo painel.
- Enviar resposta manual pelo painel.
- Limpar historico, contadores ou contato inteiro.
- Criar figurinha quando receber imagem.
- Piadas aleatorias.
- Respostas prontas.
- Modo especial romantico gotico por contato marcado no painel ou por variavel de ambiente.

## Como ligar

Abra:

```bat
ligar_bot.bat
```

Ou rode:

```bat
npm start
```

## Gerenciar sessoes

Abra:

```bat
gerenciar_sessoes.bat
```

Use esse menu para procurar processos ativos, encerrar sessoes travadas, apagar o acesso atual ou gerar um novo QR Code.

## Primeiro uso

1. Execute `ligar_bot.bat`.
2. Escaneie o QR Code no WhatsApp.
3. Espere aparecer:

```text
Bot conectado ao WhatsApp! Pronto para receber mensagens.
```

4. Envie `menu` de outro numero.

## Menu

1. Respostas prontas
2. Criar figurinha
3. Piada aleatoria
4. Frase motivacional torta
5. Deixar recado / entrar na fila
6. Resumo
7. Historico

## Modo especial

Para evitar dados sensiveis no codigo, o numero alvo do modo especial nao fica salvo no projeto.

Use uma destas opcoes:

- Marque o contato como `Especial` no painel admin.
- Ou defina a variavel de ambiente `SPECIAL_MODE_NUMBER` antes de ligar o bot.
