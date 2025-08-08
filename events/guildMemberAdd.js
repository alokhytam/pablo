const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    console.log(`[JOIN] ${member.user.tag} bergabung ke ${member.guild.name}`);

    const channel = client.channels.cache.get('1329167925508177991');
    if (!channel) {
      console.log('❌ Channel welcome tidak ditemukan');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0xffffff)
      .setTitle('**Selamat Datang!!👏**')
      .setDescription(`**${member} Terima kasih sudah bergabung🙏**\n═════════════════════════`)
      .setImage('https://cdn.discordapp.com/attachments/1393216105908011020/1400073305339203735/Proyek_Baru_38_B9D22B4.gif')
      .setFooter({ text: '「 ✗」 RTM XIOO SAMP' });

    try {
      await channel.send({ embeds: [embed] });
      console.log(`[✅] Embed welcome dikirim ke #${channel.name}`);
    } catch (err) {
      console.error('❌ Gagal mengirim embed welcome:', err);
    }
  }
};
