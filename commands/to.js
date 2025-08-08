const { EmbedBuilder } = require('discord.js');
const ms = require('ms');

function convertMsToReadable(msValue) {
  const seconds = msValue / 1000;
  if (seconds < 60) return `${seconds} detik`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} menit`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam`;
  return `${Math.floor(seconds / 86400)} hari`;
}

module.exports = {
  name: 'to',
  description: 'Memberi timeout kepada member',
  async execute(client, message, args) {
    if (message.author.id !== '1269015630921728080') return;

    let member = message.mentions.members.first();

    if (!member && args[0]) {
      try {
        const query = args[0];
        const allMembers = await message.guild.members.fetch();
        member = allMembers.find(
          m => m.id === query || m.user.username.toLowerCase() === query.toLowerCase()
        );
      } catch (err) {
        return message.reply('❌ Member tidak ditemukan. Gunakan mention, username, atau ID yang valid.');
      }
    }

    if (!member) return message.reply('❌ Member tidak ditemukan. Gunakan mention, username, atau ID yang valid.');

    const durationRaw = args[1];
    const duration = ms(durationRaw);
    if (!duration || isNaN(duration)) return message.reply('❌ Durasi timeout tidak valid.');

    const reason = args.slice(2).join(' ') || 'Tidak ada alasan diberikan';

    try {
      await member.timeout(duration, reason);

      const readableTime = convertMsToReadable(duration);
      const logChannel = await client.channels.fetch('1399569053995241524');

      const embed = new EmbedBuilder()
        .setColor('#ffffff')
        .setDescription(
          `**${member} has been timeout** <a:TimerSand:1399772453953343630>\n` +
          `**Reason :** ${reason}\n` +
          `**Time :** ${readableTime}\n` +
          `═════════════════════════`
        )
        .setImage('https://i.imgur.com/8v5tvoh.png')
        .setFooter({ text: '「✗」RTM XIOO SAMP' });

      await logChannel.send({ embeds: [embed] });
      await message.delete();
    } catch (err) {
      console.error('Gagal memberikan timeout:', err);
      message.reply('❌ Gagal memberikan timeout.');
    }
  }
};
