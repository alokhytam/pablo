module.exports = {
  name: 'close',
  async execute(message) {
    if (message.author.id !== '1269015630921728080') {
      return message.reply('❌ Kamu tidak punya izin untuk menjalankan perintah ini.');
    }

    await message.reply('⏳ Channel akan dihapus dalam 5 detik...');
    setTimeout(() => {
      message.channel.delete().catch(() => {});
    }, 5000);
  }
};