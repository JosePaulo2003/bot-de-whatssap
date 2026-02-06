# Bot de WhatsApp (Ayano)

Bot em Node.js usando [`whatsapp-web.js`](https://github.com/JosePaulo2003/whatsapp-web.js) com:

- **Menu interativo** (piadas, motivacionais, destino, jogo da velha, status, conquistas)
- **Criação automática de figurinha** (envie imagem/GIF/vídeo curto)
- **Mensagens especiais para um número alvo** ("pessoa x")
- **Painel admin web** para acompanhar uso, bloquear usuários e responder manualmente

Este README explica:

- **Instalação e requisitos**
- **Como rodar o bot**
- **Como usar pelo WhatsApp**
- **Como mudar textos, número alvo, nome do bot e mensagens automáticas**

---

## 1. Pré‑requisitos

- Node.js 16+ instalado
- WhatsApp instalado no celular (para escanear o QR Code)
- Google Chrome/Chromium instalado (o `whatsapp-web.js` usa o Chromium via Puppeteer)

Na primeira execução o bot vai abrir uma sessão do WhatsApp Web controlada pelo código.

---

## 2. Instalação

Dentro da pasta do projeto:

```bash
npm install
```

Isso instala as dependências listadas em `package.json`:

- `whatsapp-web.js`
- `qrcode-terminal`

---

## 3. Como rodar o bot

Ainda na pasta do projeto:

```bash
node index.js
```

O que acontece na primeira vez:

1. O terminal mostra um QR Code em texto.
2. No celular, abra o WhatsApp → **Aparelhos conectados** → **Conectar um aparelho**.
3. Aponte a câmera para o QR Code do terminal.
4. Depois de conectar, o terminal deve mostrar `Bot conectado ao WhatsApp!`.
5. O painel admin sobe em `http://localhost:3000`.

Enquanto o processo estiver rodando, o bot ficará online.

---

## 4. Como usar pelo WhatsApp

### 4.1. Menu principal

- Em um chat com o número do bot, envie:

```text
menu
```

O bot envia uma imagem de menu com as opções:

- **1** – Piadas sarcásticas (várias categorias)
- **2** – Criar figurinha (envie mídia + opção 2)
- **3** – Mensagens motivacionais sarcásticas
- **4** – Consultar o destino (resposta sarcástica)
- **5** – Jogo da velha com emojis (com escolha de dificuldade)
- **6** – Status / ficha de RPG
- **7** – Ver conquistas de uso do bot

Se você já viu o menu e mandar qualquer coisa fora das opções, o bot responde com uma mensagem irônica padrão.

### 4.2. Figurinhas

- Envie **uma imagem, GIF ou vídeo curto** para o bot.
- Ele transforma automaticamente em **sticker**.

Se você enviar apenas `2` sem mídia, ele responde explicando o modo correto.

### 4.3. Jogo da velha

- Envie `5`, `jogo` ou `jogo da velha`.
- O bot pede a dificuldade: `1` Fácil, `2` Médio, `3` Difícil.
- Depois, envie números de `1` a `9` para marcar as casas.
- Envie `0` ou `sair` para sair do jogo.

### 4.4. Status e conquistas

- Opção `6`: gera um status/ficha em estilo RPG, usando textos em `status.js`.
- Opção `7`: mostra conquistas baseadas em quantas vezes a pessoa usou cada função (definidas em `conquistas.js`).

### 4.5. Número alvo ("meu amor")

Para um número específico (configurado em `config.js`):

- Mensagens `te amo` recebem respostas específicas (`euTeAmoRespostas` em `mensagens.js`).
- Mensagens normais (sem comando) recebem frases românticas (`mensagensBase` em `mensagens.js`).
- Existem mensagens automáticas de **bom dia / boa tarde / boa noite** configuradas no agendador.

---

## 5. Onde mudar textos, número alvo e nome do bot

### 5.1. Arquivo principal de configuração: `config.js`

Este arquivo concentra o que é mais fácil de customizar sem mexer na lógica.

Principais campos:

- **`owner.targetNumber`** – número alvo principal (formato `5599...@c.us`).
- **`owner.name`** – nome do dono usado em textos.
- **`bot.displayName`** – nome do bot mostrado em mensagens.
- **`bot.adminConsoleTitle` / `bot.adminPageTitle`** – título do painel admin.
- **`bot.adminLoveBanner`** – texto do selo especial no painel para o número alvo.
- **`messages.welcomeOthers`** – mensagem de apresentação automática para outras pessoas.
- **`messages.pauseReply` / `messages.resumeReply`** – respostas aos comandos `!pausar` e `!voltar`.
- **`messages.invalidMenuNumber`** – resposta quando digitam número fora de 1–7.
- **`messages.afterMenuInvalid`** – resposta irônica quando a pessoa ignora o menu.
- **`menu.caption`** – texto completo da legenda do menu (as opções 1–7).
- **`stickers.author` / `stickers.name`** – autor/nome usados nas figurinhas.
- **`scheduler.bomDia` / `boaTarde` / `boaNoite`** – textos das mensagens automáticas diárias.

> Para adaptar o bot para outra pessoa ou outro contexto, **comece editando apenas o `config.js`**.

### 5.2. Textos de conteúdo (piadas, frases, status, conquistas)

Esses arquivos já estão organizados como listas de textos. Você pode editar livremente o conteúdo das strings:

- `mensagens.js`
  - `mensagensBase`: mensagens românticas para o número alvo.
  - `piadas`: piadas sarcásticas (irônicas, programação, animes, etc.).
  - `motivacionaisSarc`: frases motivacionais sarcásticas.
  - `destinos`: respostas para "consultar o destino".
  - `euTeAmoRespostas`: respostas para quando o alvo manda "te amo".

- `status.js`
  - `perfisBase`: fichas/descrições em estilo RPG, usadas na opção de status.

- `conquistas.js`
  - Textos de conquistas (em `gerarConquistas`), incluindo emojis e descrições.

> Você pode mudar textos, emojis e tom de voz à vontade, desde que mantenha as aspas e a vírgula final de cada item.

---

## 6. Pontos onde o `config.js` é usado

- `index.js`
  - Número alvo (`pessoa x`) vem de `config.owner.targetNumber`.
  - Mensagem de boas‑vindas automática para novos usuários usa `config.messages.welcomeOthers`.
  - Respostas de `!pausar` / `!voltar` usam `config.messages.pauseReply` e `config.messages.resumeReply`.
  - Mensagem de erro ao digitar opção inválida (fora de 1–7) usa `config.messages.invalidMenuNumber`.
  - Mensagem irônica pós‑menu usa `config.messages.afterMenuInvalid`.
  - Legenda do menu usa `config.menu.caption`.
  - Metadados de figurinha usam `config.stickers.author` e `config.stickers.name`.
  - Agendador de bom dia/boa tarde/boa noite usa `config.scheduler.*`.

- `admin_panel.js`
  - Título da página (`<title>`) e do cabeçalho vêm de `config.bot.adminPageTitle` / `config.bot.adminConsoleTitle`.
  - Banner especial do usuário alvo usa `config.bot.adminLoveBanner`.
  - O próprio ID alvo exibido no painel vem de `config.owner.targetNumber`.

---

## 7. Painel admin

O painel é iniciado automaticamente por `index.js`:

- Servidor HTTP simples em `http://localhost:3000`.
- Mostra:
  - Total de interações e usuários
  - Cards por usuário com contadores por função
  - Históricos recentes de mensagens
  - Botão para **bloquear/desbloquear**
  - Botão para **resetar** progresso
  - Formulário para **responder manualmente** via bot

As APIs internas (`/api/usage`, `/api/block`, `/api/reply`, `/api/reset-user`) já estão implementadas em `admin_panel.js` e `admin_actions.js`.

---

## 8. Personalizando para outra pessoa/projeto

Para adaptar este bot para outro uso:

1. **Mude o número alvo e nome** em `config.js` (`owner` e `bot.displayName`).
2. Ajuste as mensagens de `scheduler` se não quiser bom dia/tarde/noite ou quiser outro tom.
3. Edite os textos em `mensagens.js`, `status.js` e `conquistas.js` conforme o estilo desejado (menos sarcástico, mais neutro, etc.).
4. Se quiser mudar as opções do menu (adicionar/remover), ajuste:
   - Texto do menu em `config.menu.caption`.
   - Mapeamento de comandos em `mapearOpcaoMenu` dentro de `index.js`.
   - As seções de tratamento de cada opção (1–7) em `index.js`.
