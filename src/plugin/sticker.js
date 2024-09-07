import fs from 'fs/promises';
import config from '../../config.cjs';

const stickerCommand = async (m, gss) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();
  const arg = text.split(' ')[0]; 

  const packname = global.packname || "𝐄𝐭𝐡𝐢𝐱-𝐌𝐃";
  const author = global.author || "🥵💫👿";

  const validCommands = ['sticker', 's', 'autosticker'];

  if (cmd === 'autosticker') {
    if (arg === 'on') {
      config.AUTO_STICKER = true;
      await m.reply('Auto-sticker is now enabled.');
    } else if (arg === 'off') {
      config.AUTO_STICKER = false;
      await m.reply('Auto-sticker is now disabled.');
    } else {
      await m.reply('Usage: /autosticker on|off');
    }
    return;
  }

  if (config.AUTO_STICKER && !m.key.fromMe) {
    if (m.type === 'imageMessage') {
      let mediac = await m.download();
      if (mediac) {
        await gss.sendImageAsSticker(m.from, mediac, m, { packname, author });
        console.log(`Auto sticker detected and sent`);
        return;
      }
    } else if (m.type === 'videoMessage' && m.msg.seconds <= 11) {
      let mediac = await m.download();
      if (mediac) {
        await gss.sendVideoAsSticker(m.from, mediac, m, { packname, author });
        return;
      }
    }
  }

  if (validCommands.includes(cmd)) {
    const quoted = m.quoted || {};

    if (!quoted || (quoted.mtype !== 'imageMessage' && quoted.mtype !== 'videoMessage')) {
      return m.reply(`Send/Reply with an image or video to convert into a sticker using ${prefix + cmd}`);
    }

    const media = await quoted.download();
    if (!media) {
      return m.reply('Failed to download the media.');
    }

    const filePath = `./${Date.now()}.${quoted.mtype === 'imageMessage' ? 'png' : 'mp4'}`;
    await fs.writeFile(filePath, media);

    if (quoted.mtype === 'imageMessage') {
      const stickerBuffer = await fs.readFile(filePath);
      await gss.sendImageAsSticker(m.from, stickerBuffer, m, { packname, author });
    } else if (quoted.mtype === 'videoMessage') {
      await gss.sendVideoAsSticker(m.from, filePath, m, { packname, author });
    }
    await fs.unlink(filePath);
  }
};

export default stickerCommand;
