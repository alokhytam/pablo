const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberUpdate',
  async execute(oldMember, newMember) {
    const logChannelId = '1399569053995241524'; // ID channel untuk timeout logs
    const logChannel = newMember.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const oldTimeout = oldMember.communicationDisabledUntilTimestamp;
    const newTimeout = newMember.communicationDisabledUntilTimestamp;

/*    // Timeout diberikan
    if (!oldTimeout && newTimeout) {
      const embed = new EmbedBuilder()
        .setTitle('User Timed Out')
        .setColor('#FF9900')
        .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'User', value: `${newMember.user.tag} (${newMember.id})`, inline: false },
          { name: 'Until', value: `<t:${Math.floor(newTimeout / 1000)}:F>`, inline: false }
        )
        .setFooter({ text: `Timeout set in ${newMember.guild.name}` });

      return logChannel.send({ embeds: [embed] });
    }*/
  // Timeout dicabut
    if (oldTimeout && !newTimeout) {
      const embed = new EmbedBuilder()
        .setTitle('Timeout Removed')
        .setColor('#55FF55')
        .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'User', value: `${newMember.user.tag} (${newMember.id})`, inline: false },
          { name: 'Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
        )
        .setFooter({ text: `Timeout removed in ${newMember.guild.name}` });

      return logChannel.send({ embeds: [embed] });
    }
  },
};
