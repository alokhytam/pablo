const { Events, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const channelId = '1397189295730720768';
const { defaultFooter } = require('../utils/constants');

const suspiciousPatterns = [
  {
    pattern: /https:\/\/discord\.com\/api\/webhooks\//i,
    risk: 'Tinggi',
    reason: 'Webhook ditemukan. Script dapat mencuri data dan mengirimkannya ke server eksternal.',
    hardStop: true
  },
  {
    pattern: /sendToDiscordEmbed/i,
    risk: 'Tinggi',
    reason: 'Script mencoba mengirim data ke Discord. Ini sering dipakai dalam keylogger.'
  },
  {
    pattern: /requests\.post/i,
    risk: 'Tinggi',
    reason: 'Mengirim data keluar melalui HTTP POST. Bisa jadi transmisi data rahasia.'
  },
  {
    pattern: /os\.execute/i,
    risk: 'Tinggi',
    reason: 'Perintah sistem dijalankan dari script. Ini berpotensi sangat berbahaya.'
  },
  {
    pattern: /inputtext/i,
    risk: 'Tinggi',
    reason: 'Script mencoba mengambil atau mengakses data sensitif pengguna.'
  },
  {
    pattern: /Username|Password/i,
    risk: 'Tinggi',
    reason: 'Pola input yang mencurigakan, mirip pengambilan akun.'
  },
  {
    pattern: /string\.char|string\.byte|loadstring|base64\.decode/i,
    risk: 'Sedang',
    reason: 'Script memakai teknik encoding atau obfuscation.'
  },
  {
    pattern: /game:HttpGet|socket\.http|http\.request/i,
    risk: 'Sedang',
    reason: 'Script mencoba koneksi ke luar, bisa jadi untuk mengambil file jahat.'
  },
  {
    pattern: /tonumber|v\d+\s*=\s*string\./i,
    risk: 'Rendah',
    reason: 'Variabel mencurigakan atau biasa digunakan dalam script terenkripsi.'
  }
];

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.channel.id !== channelId) return;
    if (message.author.bot) return;

    const attachment = message.attachments.first();
    if (!attachment || !attachment.name.endsWith('.lua')) return;

    try {
      const res = await axios.get(attachment.url);
      const content = res.data;
      const lines = content.split('\n');

      const matchedLines = [];
      let isObfuscated = false;

      lines.forEach((line, index) => {
        suspiciousPatterns.forEach(({ pattern, risk, reason, hardStop }) => {
          if (pattern.test(line)) {
            let detail = `🔴 [${risk}] Baris ${index + 1}: \`${line.trim().slice(0, 100)}\`\n➡️ ${reason}`;
            if (!hardStop) {
              detail += '\n⚠️ Pastikan kamu mengetahui **asal file ini** dan hanya gunakan dari sumber terpercaya.';
            }
            matchedLines.push(detail);
            if (hardStop) isObfuscated = true;
          }
        });
      });

      const embed = new EmbedBuilder()
        .setTitle('🧪 Pemeriksaan Script .lua')
        .setColor(isObfuscated || matchedLines.length > 0 ? 0xFF0000 : 0x00FF00)
        .setDescription(
          `**Pengirim:** ${message.author}\n` +
          `**Nama File:** \`${attachment.name}\`\n` +
          `**Ukuran:** ${content.length.toLocaleString()} karakter\n` +
          `**Jumlah Baris:** ${lines.length}\n` +
          `**Deteksi:** ${matchedLines.length} potensi risiko`
        )
        .setFooter(defaultFooter)
        .setTimestamp();

      if (matchedLines.length > 0) {
        embed.addFields({
          name: '⚠️ Status',
          value: isObfuscated
            ? 'Script mengandung webhook atau teknik obfuscation. Perlu ditinjau manual!'
            : 'Script mengandung pola berisiko. Periksa dengan teliti.'
        });

        // Split jika terlalu panjang
        let chunk = '';
        let index = 1;

        for (let line of matchedLines) {
          if ((chunk + '\n\n' + line).length > 1000) {
            embed.addFields({
              name: `🧩 Deteksi ${index}`,
              value: chunk
            });
            chunk = line;
            index++;
          } else {
            chunk += (chunk ? '\n\n' : '') + line;
          }
        }
        if (chunk) {
          embed.addFields({
            name: `🧩 Deteksi ${index}`,
            value: chunk
          });
        }

      } else {
        embed.addFields({
          name: '✅ Status',
          value: 'Script terlihat aman. Tidak ditemukan pola mencurigakan.'
        });
      }

      const luaFile = new AttachmentBuilder(Buffer.from(content), {
        name: attachment.name
      });

      await message.reply({
        content: matchedLines.length > 0
          ? '🚨 **Script mencurigakan terdeteksi! Harap berhati-hati.**'
          : '✅ Script aman.',
        embeds: [embed],
        files: [luaFile]
      });

    } catch (err) {
      console.error('Gagal memproses file .lua:', err);
      await message.reply('❌ Gagal memeriksa file. Pastikan file dapat diakses.');
    }
  }
};
