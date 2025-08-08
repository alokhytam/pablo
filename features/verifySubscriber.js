const { Events, EmbedBuilder } = require('discord.js');
const { defaultFooter } = require('../utils/constants');

const subscriberRoleId = '1392778706514083912';
const verifyChannelId = '1392781015918973081';
const modChannelMention = '<#1393813087466946721>';
const mappingChannelMention = '<#1389133274328334476>';

const warningCounts = new Map();

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.channel.id !== verifyChannelId) return;
    if (message.author.bot) return;
    if (message.member.roles.cache.has(subscriberRoleId)) return;

    const attachment = message.attachments.first();
    const hasImage = attachment && attachment.contentType?.startsWith('image');
    const content = message.content.toLowerCase();

    const namaMatch = content.match(/nama yt\s*:\s*(.+)/i);
    const buktiMatch = content.match(/bukti subs\s*:\s*(.+)/i);

    const namaYT = namaMatch?.[1]?.trim();
    const buktiSubs = buktiMatch?.[1]?.trim();

    const isNamaValid = namaYT && namaYT.length > 0;
    const isBuktiValid = buktiSubs && buktiSubs.length > 0;
    const isFormatValid = isNamaValid && isBuktiValid && hasImage;

    const userId = message.author.id;

    if (isFormatValid) {
      try {

        const checkingMsg = await message.reply({
          content: `✅ ${message.member} Proses pengecekan subscriber 10 menit.`
        });

        const userMsg = message;

        setTimeout(async () => {
          await userMsg.delete().catch(() => {});
          await checkingMsg.delete().catch(() => {});

          await message.member.roles.add(subscriberRoleId);

          const embed = new EmbedBuilder()
            .setColor('#ffffff')
            .setDescription(`
**${message.member} accept subscriber**
**Silahkan ambil link di  :**
*Mod samp :* ${modChannelMention}
*Mapping samp :* ${mappingChannelMention}
**Terimakasih sudah subscribe🙏**
            `)
            .setImage(attachment.url)
            .setFooter(defaultFooter)
            .setTimestamp();

          await message.channel.send({ embeds: [embed] });
        }, 10 * 60 * 1000); // 10 menit
      } catch (err) {
        console.error('Gagal proses verifikasi subscriber:', err);
      }
      try {
        // Hapus pesan member dulu
        await message.delete().catch(() => {});

        // Tambah warning
        const count = warningCounts.get(userId) || 0;
        warningCounts.set(userId, count + 1);

        // Kirim peringatan
        const warning1 = await message.channel.send({
          content: `⚠️ ${message.member}, format kamu belum lengkap.\nPastikan isi:\n- **NAMA YT :** (wajib)\n- **BUKTI SUBS :** (wajib)\n- **Gambar bukti subs** dilampirkan.`
        });

        const warning2 = await message.channel.send({
          content: `\`\`\`
NAMA YT : 
BUKTI SUBS : 
NOTE : 
\`\`\``
        });

        setTimeout(() => {
          warning1.delete().catch(() => {});
          warning2.delete().catch(() => {});
        }, 20000);

        // Jika lebih dari 5 kali salah
        if (warningCounts.get(userId) >= 5) {
          warningCounts.set(userId, 0);
          const timeoutDuration = 24 * 60 * 60 * 1000; // 1 hari
          await message.member.timeout(timeoutDuration, 'Melanggar format subscriber sebanyak 5x');
          await message.channel.send({
            content: `⛔ ${message.member} telah di-timeout selama 1 hari karena melanggar format sebanyak 5 kali.`
          });
        }
      } catch (err) {
        console.error('Gagal menangani format salah:', err);
      }
    }
  }
};
