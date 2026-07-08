const sharp = require('sharp');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

async function imageMessageToSticker(message, sock) {
  const buffer = await downloadMediaMessage(
    message,
    'buffer',
    {},
    {
      logger: undefined,
      reuploadRequest: sock?.updateMediaMessage
    }
  );

  if (!buffer || !buffer.length) {
    throw new Error('Nao foi possivel baixar a imagem.');
  }

  return sharp(buffer)
    .rotate()
    .resize(512, 512, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .webp({ quality: 85 })
    .toBuffer();
}

module.exports = {
  imageMessageToSticker
};
