const { PermissionsBitField } = require('discord.js');

module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const prefix = '!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // ======== !add ========
    if (command === 'add') {
      const userId = args[0];
      if (!userId) return message.reply('❌ Masukkan ID Discord user yang ingin ditambahkan.');

      try {
        await message.channel.permissionOverwrites.edit(userId, {
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true
        });

        message.reply(`✅ User dengan ID ${userId} telah ditambahkan ke channel ini.`);
      } catch (err) {
        message.reply('❌ Gagal menambahkan user. Pastikan ID benar dan bot punya izin.');
      }
    }

    // ======== !remove ========
    else if (command === 'remove') {
      const userId = args[0];
      if (!userId) return message.reply('❌ Masukkan ID Discord user yang ingin dihapus.');

      try {
        await message.channel.permissionOverwrites.edit(userId, {
          ViewChannel: false
        });

        message.reply(`✅ User dengan ID ${userId} telah dihapus dari channel ini.`);
      } catch (err) {
        message.reply('❌ Gagal menghapus user. Pastikan ID benar dan bot punya izin.');
      }
    }

    // ======== !close ========
    else if (command === 'close') {
      message.reply('🗑️ Channel akan dihapus dalam 5 detik...');
      setTimeout(() => {
        message.channel.delete().catch(console.error);
      }, 5000);
    }
  });
};