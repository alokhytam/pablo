const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildBanAdd',
  async execute(ban) {
    const { guild, user } = ban;

    const logChannelId = '1393986336033345688'; // ID channel untuk ban logs
    const logChannel = guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('User Banned')
      .setColor('#FF5555')
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'User', value: `${user.tag} (${user.id})`, inline: false },
        { name: 'Tanggal', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
      )
      .setFooter({ text: `Banned from ${guild.name}` });

    logChannel.send({ embeds: [embed] });
  },
};
