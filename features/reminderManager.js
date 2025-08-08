const { ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');

const reminderMap = new Map(); // Menyimpan jadwal reminder

async function handleReminderButton(interaction) {
      const modal = new ModalBuilder()
  .setCustomId(`reminder_${interaction.message.id}`)
  .setTitle('⏰ Setel Pengingat')
  .addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('durasi')
        .setLabel('Waktu (hitung mundur)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Contoh: 10 menit')
        .setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('pesan')
        .setLabel('Pesan (opsional)')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Contoh: beli gun midman xioo')
        .setRequired(false)
    )
  );

  await interaction.showModal(modal);
}

async function handleReminderModal(interaction, client) {
  const durasiInput = interaction.fields.getTextInputValue('durasi');
  const pesan = interaction.fields.getTextInputValue('pesan');
  const embed = interaction.message.embeds[0];
  const userId = interaction.user.id;
  const channel = interaction.channel;
  const channelName = channel.name;

  const match = durasiInput.match(/(\d+)\s*(menit|jam|detik)/i);
  if (!match) {
    return await interaction.reply({ content: '❌ Format waktu tidak valid. Contoh: 10 menit', ephemeral: true });
  }

  let durationMs = 0;
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  if (unit === 'menit') durationMs = value * 60 * 1000;
  else if (unit === 'jam') durationMs = value * 60 * 60 * 1000;
  else if (unit === 'detik') durationMs = value * 1000;

  await interaction.reply({ content: '✅  Pengingat telah dijadwalkan!', ephemeral: true });

  setTimeout(async () => {
    const ping = `<@${userId}>`;
    const reminderEmbed = new EmbedBuilder()
      .setTitle('🔔 Pesananmu sudah menunggu..')
      .setDescription(`📦 **${channelName}**\n\n${embed.description || 'Deskripsi produk tidak tersedia.'}\n\n**Gunakan jasa *midman XIOO* agar terhindar dari penipuan!**\n${pesan ? `\n💬 ${pesan}` : ''}`)
      .setColor(0xffd700)
      .setFooter({ text: 'RTM XIOO Pengingat' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`buy_${userId}`)
        .setLabel('💳 Beli')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`minat_${userId}`)
        .setLabel('🗨️ Tanya')
        .setStyle(ButtonStyle.Success)
    );

    // DM ke user
    await interaction.user.send({
      content: `🔔 Pesananmu sudah menunggu!\nCek keranjangmu di: ${channel.url}`,
      embeds: [embed, reminderEmbed],
      components: [row]
    }).catch(() => {});

    // Notifikasi ke channel keranjang
    await channel.send({
      content: `${ping}`,
      embeds: [reminderEmbed],
      components: [row]
    });
  }, durationMs);
}

module.exports = {
  handleReminderButton,
  handleReminderModal
};
