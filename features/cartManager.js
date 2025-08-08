const {
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const { sendLog } = require('../logger'); // pastikan path benar
const { CHANNEL_TITLES } = require('../utils/constants'); // gunakan judul channel
const userCartChannels = new Map(); // userId -> TextChannel
const userAddedMessages = new Map(); // userId -> Set of messageId

async function handleCart(interaction, client, sellerId) {
  const userId = interaction.user.id;
  const guild = interaction.guild;
  const username = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
  const embed = interaction.message.embeds?.[0];
  const messageId = interaction.message.id;

  if (!embed) {
    await sendLog(interaction.client, {
      aksi: 'Tambah ke Keranjang',
      user: `${interaction.user.tag} (${interaction.user.id})`,
      status: 'Gagal',
      reason: 'Embed tidak ditemukan pada pesan',
      channelTitle: CHANNEL_TITLES[interaction.channelId] || '-',
      cleanContent: '-'
    });
    return interaction.reply({ content: '❌  Tidak bisa menambahkan ke keranjang.', ephemeral: true });
  }

  if (!userAddedMessages.has(userId)) userAddedMessages.set(userId, new Set());
  const addedMessages = userAddedMessages.get(userId);
  if (addedMessages.has(messageId)) {
    return interaction.reply({ content: '⚠️ Postingan ini sudah ada di keranjangmu.', ephemeral: true });
  }

  const category = guild.channels.cache.find(
    c => c.type === ChannelType.GuildCategory && c.name === '[ INFO RTM ]'
  );
  if (!category) {
    await sendLog(interaction.client, {
      aksi: 'Tambah ke Keranjang',
      user: `${interaction.user.tag} (${interaction.user.id})`,
      status: 'Gagal',
      reason: 'Kategori [ INFO RTM ] tidak ditemukan',
      channelTitle: CHANNEL_TITLES[interaction.channelId] || '-',
      cleanContent: embed.description || '-'
    });
    return interaction.reply({ content: '❌  Kategori tidak ditemukan.', ephemeral: true });
  }

  let cartChannel = userCartChannels.get(userId);
  if (cartChannel && !guild.channels.cache.has(cartChannel.id)) {
    userCartChannels.delete(userId);
    cartChannel = null;
  }

  if (!cartChannel) {
    const channelName = `🛒〢  keranjang-${username}`;
    cartChannel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: category.id,
      position: 0,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: userId,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
        {
          id: client.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ManageChannels,
          ],
        },
      ],
    });
    userCartChannels.set(userId, cartChannel);
  }

  const originalComponents = interaction.message.components[0]?.components || [];
  const filteredButtons = originalComponents.filter(btn =>
    !btn.customId?.startsWith('cart_') && !btn.customId?.startsWith('delete_')
  );
  const reminderButton = new ButtonBuilder()
    .setCustomId(`reminder_${userId}`)
    .setLabel('🔔 Ingatkan Saya')
    .setStyle(ButtonStyle.Secondary);
  const row1 = new ActionRowBuilder().addComponents(filteredButtons);
  const row2 = new ActionRowBuilder().addComponents(reminderButton);

  await cartChannel.send({
    content: `🛒 Produk ditambahkan ke keranjang oleh <@${userId}>`,
    embeds: [embed],
    components: [row1, row2]
  });

  addedMessages.add(messageId);

  await sendLog(interaction.client, {
    aksi: 'Tambah ke Keranjang',
    user: `${interaction.user.tag} (${interaction.user.id})`,
    status: 'Berhasil',
    reason: 'Produk ditambahkan ke channel keranjang',
    channelTitle: CHANNEL_TITLES[interaction.channelId] || '-',
    cleanContent: embed.description || '-'
  });

  await interaction.reply({ content: '✅  Produk ditambahkan ke keranjangmu.', ephemeral: true });
}

module.exports = { handleCart };
