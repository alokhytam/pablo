module.exports = {
  name: 'remove',
  async execute(message, args) {
    if (message.author.id !== '1269015630921728080') {
      return message.reply('❌ Kamu tidak punya izin untuk menjalankan perintah ini.');
    }

    const user = message.mentions.members.first();
    if (!user) return message.reply('❌ Mention user yang ingin dihapus dari channel.');

    await message.channel.permissionOverwrites.edit(user, {
      ViewChannel: false,
      SendMessages: false,
      ReadMessageHistory: false,
    });

    await message.reply(`✅ <@${user.id}> telah dihapus dari channel ini.`);
  }
};