const { Events, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const channelId = '1400831622265442465';

function isMediaFile(name) {
  return /\.(mp3|mp4)$/i.test(name);
}

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.channel.id !== channelId) return;
    if (message.author.bot) return;

    const attachment = message.attachments.first();
    if (!attachment || !isMediaFile(attachment.name)) return;

    const tempPath = path.join('/tmp', `${Date.now()}_${attachment.name}`);

    try {
      // Unduh file ke /tmp
      const fileRes = await axios.get(attachment.url, { responseType: 'stream' });
      const writer = fs.createWriteStream(tempPath);
      await new Promise((resolve, reject) => {
        fileRes.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Upload ke Top4Top
      const form = new FormData();
      form.append('file', fs.createReadStream(tempPath));
      form.append('submit', 'upload');

      const uploadRes = await axios.post('https://top4top.io/upload.php', form, {
        headers: form.getHeaders(),
      });

      const match = uploadRes.data.match(/https:\/\/[^"' ]+top4top\.io[^"' ]+/);
      if (!match) throw new Error('Gagal mengambil URL hasil upload.');

      const link = match[0];

      // Kirim embed respon
      const embed = new EmbedBuilder()
        .setTitle('📻 Boombox Link')
        .setDescription(`**${attachment.name}**\n[Klik untuk membuka](${link})`)
        .setColor(0x9933ff)
        .setFooter({ text: 'File berhasil diunggah ke Top4Top' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (err) {
      console.error('❌ Gagal memproses boombox:', err);
      await message.reply('❌ Gagal mengunggah file ke Top4Top.');
    } finally {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  },
};
