const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'fee',
  async execute(message) {
    if (message.author.id !== '1269015630921728080') {
      return message.reply('❌ Kamu tidak punya izin untuk menjalankan perintah ini.');
    }

    const embed = new EmbedBuilder()
      .setTitle('💼  [ LIST FEE MM XIOO SAMP ] 💼\n\n') // Spasi setelah judul
      .setDescription(
        '0   - 29K       FEE  1K\n\n' +
        '30  - 79K       FEE  2K\n\n' +
        '80  - 149K      FEE  4K\n\n' +
        '150 - 199K      FEE  6K\n\n' +
        '249 - 399K      FEE 10K\n\n' +
        '400 - 499K      FEE 20K\n\n' +
        '500 - 599K      FEE 30K\n\n' +
        '600 - 899K      FEE 45K\n\n' +
        '900 - 1JT+      FEE 80K\n\n' +
        'TT       : 15K\n\n' +
        'BT       : 10K\n\n' +
        'ALLREFF  : +10K\n\n' +
        '**TRANSAKSI BATAL?? FEE KEPOTONG**'
      )
      .setFooter({
        text: '「✗」 RTM XIOO SAMP',
        iconURL: 'https://cdn.discordapp.com/attachments/1393216105908011020/1398938677966798868/Proyek_Baru_6_B1A697E_11zon.jpg'
      })
      .setColor(0x1e3a8a);

    await message.channel.send({ embeds: [embed] });
  }
};