const verifySubscriber = require('../features/verifySubscriber');

// Konstanta deteksi spam link
const allowedChannelId = '1393903007556698212';
const logChannelId = '1401373469979185162';
const exemptedMemberId = '1269015630921728080';
const linkRegex = /(https?:\/\/[^\s]+)/gi;

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (!message.guild || message.author.bot) return;

    // ✅ DETEKSI SPAM LINK
    if (
      linkRegex.test(message.content) &&
      message.author.id !== exemptedMemberId &&
      message.channel.id !== allowedChannelId
    ) {
      try {
        await message.delete();
        await message.member.timeout(3600000, 'Spam link di channel tidak diizinkan');

        const logChannel = message.guild.channels.cache.get(logChannelId);
        if (logChannel) {
          await logChannel.send({
            content: `🚨 **Spam link terdeteksi dan dihapus!**
👤 Pengirim: <@${message.author.id}> \`(${message.author.tag})\`
📍 Channel asal: <#${message.channel.id}>
🔗 Konten:
${message.content}`
          });
        }
      } catch (err) {
        console.error('[SPAM LINK DETECTION ERROR]', err);
      }
    }

    // ✅ VERIFIKASI SUBS
    await verifySubscriber.execute(message, client);

    // ✅ HANDLE COMMAND
    const prefix = '!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);
    if (!command) return;

    try {
      await command.execute(client, message, args);
    } catch (error) {
      console.error(error);
    }
  }
};
