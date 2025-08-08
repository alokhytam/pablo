const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ChannelType,
  PermissionsBitField
} = require('discord.js');
const { getSessionBySeller, sessionMap } = require('./dmSession'); // Pastikan path relatifnya sesuai
// Ganti sesuai ID admin & ID server kamu
const ADMIN_ID = '1269015630921728080';
const GUILD_ID = '1329155451253952653'; // Ganti dengan ID server kamu
const MIDMAN_CATEGORY_NAME = '[ INFO RTM ]';
const buyCooldowns = new Map();
// ==================== Open Ticket ====================
async function openTicket(interaction, client) {
  const guild = interaction.guild;
  if (!guild) return interaction.reply({ content: 'Tidak bisa membuat ticket di luar server.', ephemeral: true });
  const category = guild.channels.cache.find(c =>
    c.type === ChannelType.GuildCategory &&
    c.name === MIDMAN_CATEGORY_NAME
  );
  if (!category) return interaction.reply({ content: `Kategori "${MIDMAN_CATEGORY_NAME}" tidak ditemukan.`, ephemeral: true });
  const username = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
  const channelName = `「 💼」 mm-xiooᯓ★${username}`;
  const ticketChannel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: category.id,
    position: 0,
    permissionOverwrites: [
      { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
      { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] },
    ]
  });
  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle('📌 Instruksi Transaksi')
    .setDescription(`Silakan *tag* atau kirim **username** member yang akan melakukan transaksi di dalam channel ini.\n\nSetelah itu, mohon tag <@${ADMIN_ID}> agar admin menambahkan member tersebut ke dalam ticket.`);
  await ticketChannel.send({ embeds: [embed] });
  await interaction.reply({ content: `✅  Ticket dibuat: ${ticketChannel}`, ephemeral: true });
}
// ==================== Handle Buy ====================
async function handleBuy(interaction, client, sellerId) {
  try {
    const userId = interaction.user.id;
    const messageId = interaction.message.id;
    const key = `${userId}_${messageId}`;
    const cooldownTime = 30 * 1000;
    const lastUsed = buyCooldowns.get(key);
    const now = Date.now();
    if (lastUsed && (now - lastUsed < cooldownTime)) {
      const remaining = Math.ceil((cooldownTime - (now - lastUsed)) / 1000);
      return interaction.reply({ content: `⏳  Mohon tunggu ${remaining} detik sebelum memesan ulang.`, ephemeral: true });
    }
    buyCooldowns.set(key, now);
    setTimeout(() => buyCooldowns.delete(key), cooldownTime);
    const buyer = interaction.user;
    const message = interaction.message;
    const embed = message.embeds?.[0];
    const embedDesc = embed?.description || '';
    const cleanContentMatch = embedDesc.match(/```([\s\S]*?)```/);
    const cleanContent = cleanContentMatch ? cleanContentMatch[1] : '[Deskripsi tidak ditemukan]';
    const channelTitle = embed?.title || '[Judul tidak ditemukan]';
    if (!sellerId) return await interaction.reply({ content: '❌  Penjual tidak ditemukan.', ephemeral: true });
    const seller = await client.users.fetch(sellerId).catch(() => null);
    if (!seller) return await interaction.reply({ content: '❌  Gagal mengambil data penjual.', ephemeral: true });
    const sellerEmbed = new EmbedBuilder()
      .setTitle('📦 Order Baru Masuk!')
      .setDescription(`Kamu menerima permintaan order untuk produk berikut:\n\n**${channelTitle}**\n\`\`\`\n${cleanContent}\n\`\`\`\n\nKlik tombol di bawah untuk membuat channel Midman.`)
      .setFooter({ text: '「 ✗」  RTM XIOO SAMP' })
      .setColor(0x1e3a8a);
    const acceptButton = new ButtonBuilder()
      .setCustomId(`acceptorder_${interaction.guildId}`)
      .setLabel('Accept Order')
      .setStyle(ButtonStyle.Success);
    const row = new ActionRowBuilder().addComponents(acceptButton);
    await seller.send({ embeds: [sellerEmbed], components: [row] });
    const buyerEmbed = new EmbedBuilder()
  .setTitle('📢 Permintaan Order Terkirim')
  .setDescription(`Kamu telah mengirim permintaan order untuk produk berikut:\n\n**${channelTitle}**\n\`\`\`\n${cleanContent}\n\`\`\`\n\nSilakan tunggu hingga permintaanmu diterima dan channel Midman dibuat.`)
  .setFooter({ text: '「 ✗」  RTM XIOO SAMP' })
  .setColor(0x1e3a8a);

const chatButton = new ButtonBuilder()
  .setCustomId(`chatpenjual_${seller.id}`)
  .setLabel('💬 Chat Penjual')
  .setStyle(ButtonStyle.Primary);

const chatRow = new ActionRowBuilder().addComponents(chatButton);

await buyer.send({ embeds: [buyerEmbed], components: [chatRow] });
    const sessionId = `${seller.id}-${buyer.id}-${message.id}`;
    sessionMap.set(sessionId, {
      buyer,
      seller,
      buyerMsg: null,
      sellerMsg: null,
      title: channelTitle,
      productDesc: cleanContent,
      history: [],
      timeout: setTimeout(() => sessionMap.delete(sessionId), 12 * 60 * 60 *
1000)
    });
    await interaction.reply({ content: '✅  Permintaan sudah dikirim ke penjual via DM.', ephemeral: true });
  } catch (error) {
    console.error('[handleBuy error]', error);
    if (!interaction.replied) {
      await interaction.reply({ content: '❌  Terjadi kesalahan saat memproses order.', ephemeral: true });
    }
  }
}
// ==================== Accept Order ====================
async function acceptOrder(interaction, client) {
  const guildId = interaction.customId.split('_')[1];
  const GUILD_ID = '1329155451253952653';
  let guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) {
    try {
      guild = await client.guilds.fetch(GUILD_ID);
    } catch (e) {
      console.error('❌  Gagal fetch guild:', e);
      return interaction.reply({ content: '❌  Server tidak ditemukan (fetch gagal).', ephemeral: true });
    }
  }
  const session = getSessionBySeller(interaction.user.id);
if (!session || !session.buyer) {
  console.warn('❌ Tidak ditemukan sesi aktif atau buyer tidak terdaftar.');
  return interaction.reply({
    content: '❌ Tidak ditemukan sesi aktif Anda sebagai penjual.',
    ephemeral: true
  });
}
console.log('[ACCEPT ORDER] Session ditemukan:', session);

  const category = guild.channels.cache.find(c =>
    c.type === ChannelType.GuildCategory && c.name === MIDMAN_CATEGORY_NAME
  );
  if (!category) return interaction.reply({ content: '❌  Kategori tidak ditemukan.', ephemeral: true });
  const username = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
  const channelName = `「 💼」 mm-xiooᯓ★${username}`;
  const channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: category.id,
    position: 0,
    permissionOverwrites: [
      { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
      { id: session?.buyer?.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
      { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] },
    ]
  });
  if (session) {
    const transaksiEmbed = new EmbedBuilder()
      .setColor(0x1e3a8a)
      .setTitle('💼 TRANSAKSI MIDMAN DIBUKA')
      .setDescription(`**${session.title}**\n\`\`\`\n${session.productDesc}\n\`\`\`\n👤 **Pihak Terlibat**\n• Buyer  : <@${session.buyer.id}>\n• Seller :
<@${session.seller.id}>\n\n🔔 **Instruksi**\nSilakan tag <@${ADMIN_ID}> untuk memulai proses midman.`)
      .setFooter({ text: '「 ✗」  RTM XIOO SAMP', iconURL: client.user.displayAvatarURL() })
      .setTimestamp();
    await channel.send({ embeds: [transaksiEmbed] });
    // ✅  Kirim DM ke Buyer
    try {
      await session.buyer.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0x00aaff)
            .setTitle('📦 Order Kamu Diterima!')
            .setDescription(`Penjual telah menerima pesanan kamu.\nSilakan masuk ke channel:\n<#${channel.id}> untuk melanjutkan transaksi.`)
            .setFooter({ text: '「 ✗」  RTM XIOO SAMP' })
        ]
      });
    } catch (e) {
      console.warn('⚠️ Gagal mengirim DM ke buyer:', e);
    }
  }
  // ✅  Kirim notifikasi ke admin
  const notifEmbed = new EmbedBuilder()
    .setTitle('🔔 Notifikasi Order Diterima')
    .setDescription(`Channel midman telah dibuat: <#${channel.id}>`)
    .setColor(0xf1c40f);
  const adminUser = await client.users.fetch(ADMIN_ID).catch(() => null);
  if (adminUser) await adminUser.send({ embeds: [notifEmbed] });
  await interaction.reply({ content: `✅  Channel <#${channel.id}> berhasil dibuat.`, ephemeral: true });
}
// ==================== Order MM dari DM Session ====================
async function handleOrderMMFromSession(interaction, client, sessionId) {
  const session = sessionMap.get(sessionId);
  if (!session) return interaction.reply({ content: '❌  Sesi tidak ditemukan atau sudah kedaluwarsa.', ephemeral: true });
  let guild = client.guilds.cache.get(GUILD_ID);
if (!guild) {
  try {
    guild = await client.guilds.fetch(GUILD_ID);
  } catch (e) {
    console.error('❌  Gagal fetch guild:', e);
    return interaction.reply({ content: '❌  Server tidak ditemukan (fetch gagal).', ephemeral: true });
  }
}
  const category = guild.channels.cache.find(c =>
    c.type === ChannelType.GuildCategory && c.name === MIDMAN_CATEGORY_NAME
  );
  if (!category) return interaction.reply({ content: `❌  Kategori "${MIDMAN_CATEGORY_NAME}" tidak ditemukan.`, ephemeral: true });
  const username = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
  const channelName = `「 💼」 mm-xiooᯓ★${username}`;
  const channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: category.id,
    position: 0,
    permissionOverwrites: [
      { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
      { id: session.buyer.id, allow: [PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
      { id: session.seller.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
      { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] },
    ]
  });
  const transaksiEmbed = new EmbedBuilder()
    .setColor(0x1e3a8a)
    .setTitle('💼 TRANSAKSI MIDMAN DIBUKA')
    .setDescription(`**${session.title}**\n\`\`\`\n${session.productDesc}\n\`\`\`\n👤 **Pihak Terlibat**\n• Buyer  : <@${session.buyer.id}>\n• Seller : <@${session.seller.id}>\n\n🔔 **Instruksi**\nSilakan tag <@${ADMIN_ID}> untuk memulai proses midman.`)
    .setFooter({ text: '「 ✗」  RTM XIOO SAMP', iconURL: client.user.displayAvatarURL() })
    .setTimestamp();
  await channel.send({ embeds: [transaksiEmbed] });
  const adminUser = await client.users.fetch(ADMIN_ID).catch(() => null);
  if (adminUser) {
    const notif = new EmbedBuilder()
      .setTitle('🔔 Order dari Sesi Tanya')
      .setDescription(`Channel midman telah dibuat: <#${channel.id}>`)
      .setColor(0xf39c12);
    await adminUser.send({ embeds: [notif] });
  }
  await interaction.reply({ content: `✅  Channel <#${channel.id}> berhasil dibuat.`, ephemeral: true });
}
// ==================== Hapus Postingan ====================
async function deletePost(interaction, sellerId) {
  if (interaction.user.id !== sellerId) {
    return interaction.reply({ content: '❌  Kamu tidak punya izin untuk menghapus postingan ini.', ephemeral: true });
  }
  const message = interaction.message;
  if (message) await message.delete().catch(() => {});
}
module.exports = {
  openTicket,
  handleBuy,
  acceptOrder,
  handleOrderMMFromSession,
  deletePost
  };
