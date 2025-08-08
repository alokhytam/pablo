const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ban',
  description: 'Memberikan ban kepada member',
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

    const reason = args.slice(1).join(' ') || 'Tidak ada alasan diberikan';

    try {
      await member.ban({ reason });

      const logChannel = await client.channels.fetch('1393986336033345688');

      const embed = new EmbedBuilder()
        .setColor('#ffffff')
        .setDescription(
          `${member} ** has been banned** <a:Banned:1399770000562327573>\n` +
          `**Reason :**  ${reason}\n` +
          `═════════════════════════`
        )
        .setImage('https://i.imgur.com/cC8q7W9.png')
        .setFooter({ text: '「✗」RTM XIOO SAMP' });

      await logChannel.send({ embeds: [embed] });
      await message.delete();
    } catch (err) {
      console.error(err);
      message.reply('❌ Gagal melakukan ban.');
    }
  }
};
