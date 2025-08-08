const { EmbedBuilder } = require('discord.js');
const { LOG_CHANNEL_ID } = require('./utils/constants');

// Fungsi utama pengiriman log
async function sendLog(client, {
  aksi = 'Tidak diketahui',
  user = 'Unknown',
  buyer = null,
  seller = null,
  status = 'Gagal',
  reason = '-',
  channelTitle = '-',
  cleanContent = '-'
}) {
  try {
    const guild = await client.guilds.fetch('1329155451253952653'); // ID Server kamu
    const channel = guild.channels.cache.get(LOG_CHANNEL_ID);

    if (!channel) {
      console.error('[logger] Channel log tidak ditemukan.');
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('📄 Log Aktivitas')
      .addFields(
  { name: 'Aksi', value: aksi, inline: true },
  ...(buyer && seller
    ? [
        { name: 'Buyer', value: buyer, inline: true },
        { name: 'Seller', value: seller, inline: true },
      ]
    : [
        { name: 'User', value: user, inline: true },
        { name: '\u200B', value: '\u200B', inline: true },
      ]),
  { name: 'Status', value: status, inline: true },
  { name: 'Alasan / Info', value: reason || '-', inline: false },
  { name: 'Judul Channel', value: channelTitle || '-', inline: false },
  { name: 'Deskripsi Produk', value: `\`\`\`${cleanContent || '-'}\`\`\``, inline: false }
)
      .setColor(status === 'Berhasil' ? 0x2ecc71 : 0xe74c3c)
      .setFooter({ text: 'XIOO Logger' })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error('[logger] Gagal mengirim log ke channel:', err);
  }
}

module.exports = { sendLog };
