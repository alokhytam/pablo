const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require('discord.js');
const { defaultFooter } = require('../utils/constants');
const { sendLog } = require('../logger');
const fs = require('fs');
const path = require('path');

const sessionsFile = path.join(__dirname, '../data/sessions.json');
const sessionMap = new Map();

// =================== Load Sesi Saat Bot Mulai ===================
if (fs.existsSync(sessionsFile)) {
  const saved = JSON.parse(fs.readFileSync(sessionsFile, 'utf8'));
  for (const sessionId in saved) {
    const data = saved[sessionId];
    sessionMap.set(sessionId, {
      buyer: { id: data.buyer.id },
      seller: { id: data.seller.id },
      title: data.title,
      productDesc: data.productDesc,
      guildId: data.guildId,
      history: data.history,
      timeout: setTimeout(() => sessionMap.delete(sessionId), data.remainingTime || 12 * 60 * 60 * 1000)
    });
  }
}
// =================== Buka Sesi Tanya ===================
async function openSession(interaction, client) {
  const buyer = interaction.user;
  const message = interaction.message;
  const embed = message.embeds?.[0];
  const embedDesc = embed?.description || '';
  const cleanContentMatch = embedDesc.match(/```([\s\S]*?)```/);
  const cleanContent = cleanContentMatch ? cleanContentMatch[1] : '[Deskripsi tidak ditemukan]';
  const channelTitle = embed?.title || '[Judul tidak ditemukan]';

  const [, sellerId] = interaction.customId.split('_');
  const seller = sellerId ? await client.users.fetch(sellerId).catch(() => null) : null;
  if (!seller) {
    return interaction.reply({ content: '❌  Tidak dapat menemukan data penjual dari pesan.', ephemeral: true });
  }

  const sessionId = `${seller.id}-${buyer.id}-${message.id}`;
  if (sessionMap.has(sessionId)) {
    return interaction.reply({ content: '❗  Kamu sudah memulai sesi tanya untuk produk ini.', ephemeral: true });
  }

  const replyButton = new ButtonBuilder()
    .setCustomId(`reply_${sessionId}`)
    .setLabel('Balas')
    .setStyle(ButtonStyle.Primary);
  const orderButton = new ButtonBuilder()
    .setCustomId(`ordermm_${sessionId}`)
    .setLabel('Order mm')
    .setStyle(ButtonStyle.Secondary);
  const row = new ActionRowBuilder().addComponents(replyButton, orderButton);

  const embedToDM = new EmbedBuilder()
    .setTitle('📨 Sesi Tanya Penjual')
    .setDescription(
      `Kamu ingin bertanya terkait produk ini:\n\n` +
      `**${channelTitle}**\n\`\`\`\n${cleanContent}\n\`\`\`\n\n` +
      `**[ Sistem chat BOT RTM XIOO ]**\n` +
      `\`\`\`\n(Obrolan akan muncul di sini)\n\`\`\`\n` +
      `Silakan klik tombol Balas untuk mengirim pertanyaan atau order midman\n\n`
    )
    .setFooter(defaultFooter)
    .setColor(0xffffff);

  const buyerMsg = await buyer.send({ embeds: [embedToDM], components: [row] }).catch(() => {});
  const sellerMsg = await seller.send({ embeds: [embedToDM], components: [row] }).catch(() => {});

  sessionMap.set(sessionId, {
    buyer,
    seller,
    buyerMsg,
    sellerMsg,
    title: channelTitle,
    productDesc: cleanContent,
    history: [],
    timeout: setTimeout(() => sessionMap.delete(sessionId), 12 * 60 * 60 * 1000)
  });

  saveSessionsToFile();

  await interaction.reply({ content: '✅  Sesi tanya telah dikirim ke DM kamu dan penjual.', ephemeral: true });

  // =================== Tambahkan LOGS ===================
await sendLog(client, {
  aksi: 'Buka Sesi Tanya',
  seller: seller ? `${seller.tag} (${seller.id})` : `Unknown (${sellerId})`,
  buyer: `${buyer.tag} (${buyer.id})`,
  status: 'Berhasil',
  channelTitle,
  cleanContent
});
}
// =================== Modal Balasan ===================
async function handleReply(interaction) {
  const sessionId = interaction.customId.split('_')[1];

  const modal = new ModalBuilder()
    .setCustomId(`modalreply_${sessionId}`)
    .setTitle('Ketik Pesanmu')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('isi_pesan')
          .setLabel('Apa yang ingin kamu sampaikan?')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
      )
    );

  await interaction.showModal(modal);
}

// =================== Kirim Balasan ===================

async function handleModalReply(interaction, client) {
  const sessionId = interaction.customId.split('_')[1];
  const isiPesan = interaction.fields.getTextInputValue('isi_pesan');
  const [sellerId, buyerId] = sessionId.split('-');
  const sender = interaction.user;
  const session = sessionMap.get(sessionId);

  if (!session) {
    return interaction.reply({ content: '❌ Sesi tidak ditemukan atau sudah kedaluwarsa.', ephemeral: true });
  }

  const isSeller = sender.id === sellerId;
  const labelForBuyer = isSeller ? 'Seller' : 'Anda';
  const labelForSeller = isSeller ? 'Anda' : 'Buyer';

const now = new Date().toLocaleString('id-ID', {
  timeZone: 'Asia/Jakarta',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
});
const timestamp = `[${now}]`;

  // Simpan history dalam dua versi
session.history.push({
  buyer: `${timestamp} ${labelForBuyer} : ${isiPesan}`,
  seller: `${timestamp} ${labelForSeller} : ${isiPesan}`
});
  saveSessionsToFile();
  const buyerHistory = session.history.map(m => m.buyer).join('\n');
  const sellerHistory = session.history.map(m => m.seller).join('\n');

  function buildEmbed(historyText) {
    return new EmbedBuilder()
      .setTitle('📨 Sesi Tanya Penjual')
      .setDescription(
        `Kamu ingin bertanya terkait produk ini:\n\n` +
        `**${session.title}**\n\`\`\`\n${session.productDesc}\n\`\`\`\n\n` +
        `**[ Sistem chat BOT RTM XIOO ]**\n` +
        `\`\`\`\n${historyText}\n\`\`\`\n` +
        `Silakan klik tombol Balas untuk mengirim pertanyaan atau order midman\n\n` 
      )
      .setFooter(defaultFooter)
      .setColor(0xffffff);
  }

  const replyButton = new ButtonBuilder()
    .setCustomId(`reply_${sessionId}`)
    .setLabel('Balas')
    .setStyle(ButtonStyle.Primary);

  const orderButton = new ButtonBuilder()
    .setCustomId(`ordermm_${sessionId}`)
    .setLabel('Order mm')
    .setStyle(ButtonStyle.Secondary);

  const row = new ActionRowBuilder().addComponents(replyButton, orderButton);

  if (session.buyerMsg?.editable) {
    session.buyerMsg.edit({
      embeds: [buildEmbed(buyerHistory)],
      components: [row]
    }).catch(() => {});
  }

  if (session.sellerMsg?.editable) {
    session.sellerMsg.edit({
      embeds: [buildEmbed(sellerHistory)],
      components: [row]
    }).catch(() => {});
  }

  const recipient = sender.id === buyerId ? session.seller : session.buyer;
  const notif = new EmbedBuilder()
    .setDescription(`📩 **Pesan baru dari ${isSeller ? 'penjual' : 'pembeli'} di sesi tanya produk.**`)
    .setColor(0xffffff);

  await recipient.send({ embeds: [notif] }).catch(() => {});

  await interaction.reply({
    content: '✅ Pesan kamu telah dikirim dan penerima sudah diberi notifikasi.',
    ephemeral: true
  });
}

// =================== Order Midman dari Sesi Tanya ===================
async function handleOrderMM(interaction, client) {
  const sessionId = interaction.customId.split('_')[1];
  const session = sessionMap.get(sessionId);

  if (!session) {
    return interaction.reply({ content: '❌ Sesi tidak ditemukan atau sudah kedaluwarsa.', ephemeral: true });
  }

  const guild = client.guilds.cache.get(session.guildId || interaction.guildId);
  if (!guild) return interaction.reply({ content: '❌ Guild tidak ditemukan.', ephemeral: true });

  const category = guild.channels.cache.find(c => c.name === '[ INFO RTM ]' && c.type === 4); // 4 = Category
  if (!category) return interaction.reply({ content: '❌ Kategori `[ INFO RTM ]` tidak ditemukan.', ephemeral: true });

  const channelName = `「💼」mm-xiooᯓ★${session.buyer.username.slice(0, 10)}`;

  const channel = await guild.channels.create({
    name: channelName,
    type: 0, // 0 = GUILD_TEXT
    parent: category.id,
    permissionOverwrites: [
      {
        id: guild.id,
        deny: ['ViewChannel']
      },
      {
        id: session.buyer.id,
        allow: ['ViewChannel', 'SendMessages']
      },
      {
        id: session.seller.id,
        allow: ['ViewChannel', 'SendMessages']
      }
    ]
  });

  const embed = new EmbedBuilder()
    .setTitle('💼 Order Midman Dibuat')
    .setDescription(`Channel ini dibuat untuk memfasilitasi transaksi midman antara pembeli dan penjual dari sesi tanya.`)
    .addFields(
      { name: '🛒 Produk', value: `**${session.title}**`, inline: false },
      { name: '📌 Deskripsi', value: `\`\`\`\n${session.productDesc}\n\`\`\``, inline: false }
    )
    .setFooter(defaultFooter)
    .setColor(0xffffff);

  await channel.send({ content: `Channel Midman berhasil dibuat.`, embeds: [embed] });

  await interaction.reply({
    content: `✅ Channel Midman berhasil dibuat: ${channel}`,
    ephemeral: true
  });
}

// =================== Simpan Sesi ke File ===================
function saveSessionsToFile() {
  const raw = {};
  for (const [sessionId, data] of sessionMap.entries()) {
    const remaining = data.timeout?._idleTimeout - (Date.now() - data.timeout._idleStart) || 0;
    raw[sessionId] = {
      buyer: { id: data.buyer.id },
      seller: { id: data.seller.id },
      title: data.title,
      productDesc: data.productDesc,
      history: data.history,
      remainingTime: remaining
    };
  }
  fs.writeFileSync(sessionsFile, JSON.stringify(raw, null, 2));
}

function getSessionBySeller(sellerId) {
  return [...sessionMap.values()].find(s => s.seller?.id === sellerId) || null;


loadSessionsFromFile();
}
module.exports = {
  openSession,
  handleReply,
  handleModalReply,
  handleOrderMM,
  getSessionBySeller,
  sessionMap,
  saveSessionsToFile
};

