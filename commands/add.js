module.exports = {
  name: 'add',
  async execute(message, args) {
    if (message.author.id !== '1269015630921728080') {
      return message.reply('❌ Kamu tidak punya izin untuk menjalankan perintah ini.');
    }

    const target = args[0];
    if (!target) return message.reply('❌ Berikan mention, username, atau ID user.');

    let member = message.mentions.members.first();
    if (!member) {
      member = message.guild.members.cache.find(m =>
        m.user.username.toLowerCase() === target.toLowerCase() ||
        m.id === target
      );
    }

    if (!member) {
      return message.reply('❌ Member tidak ditemukan. Gunakan mention, username, atau ID yang valid.');
    }

    await message.channel.permissionOverwrites.edit(member, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
    });

    await message.reply(`✅ <@${member.id}> telah ditambahkan ke channel ini.`);
  }
};
