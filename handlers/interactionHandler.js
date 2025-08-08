const midman = require('../features/midman');
const dmSession = require('../features/dmSession');
const cartManager = require('../features/cartManager');
const reminderManager = require('../features/reminderManager'); // Tambahkan di atas (global)
const productPoster = require('../features/productPoster');
const postCooldowns = new Map(); 
const clickedMinatUsers = new Set();
const clickedBuyUsers = new Set();

module.exports = (client) => {
  console.log('📥  interactionHandler aktif');

  client.on('interactionCreate', async (interaction) => {
    console.log('🔘 Interaksi diterima:', interaction.customId);

    // Tombol ditekan
    if (interaction.isButton()) {
      const customId = interaction.customId;
      if (!customId) return;
      const [action, sellerId] = customId.split('_');

      if (customId === 'open_ticket') {
        return await midman.openTicket(interaction, client);
      }
      if (action === 'buy') {
  const key = `${interaction.user.id}_${interaction.message.id}`;
  if (clickedBuyUsers.has(key)) {
    return await interaction.reply({
      content: '❌ Kamu sudah menekan tombol Beli untuk produk ini.',
      ephemeral: true
    });
  }

  clickedBuyUsers.add(key);
  return await midman.handleBuy(interaction, client, sellerId);
}
      if (action === 'chatpenjual') {
        return await dmSession.openSession(interaction, client);
      }
      if (action === 'cart') {
        return await cartManager.handleCart(interaction, client, sellerId);
      }
      if (action === 'reminder') {
        return await reminderManager.handleReminderButton(interaction, client);
      }
      if (action === 'minat') {
  const key = `${interaction.user.id}_${interaction.message.id}`;
  if (clickedMinatUsers.has(key)) {
    return await interaction.reply({
      content: '❗ Kamu sudah menekan tombol Tanya untuk produk ini.',
      ephemeral: true
    });
  }

  clickedMinatUsers.add(key);
  return await dmSession.openSession(interaction, client, sellerId);
}
      if (action === 'delete') {
        return await midman.deletePost(interaction, sellerId);
      }
      if (action === 'acceptorder') {
        return await midman.acceptOrder(interaction, client);
      }
      if (action === 'reply') {
        return await dmSession.handleReply(interaction);
      }
      if (action === 'ordermm') {
        const sessionId = sellerId;
        return await midman.handleOrderMMFromSession(interaction, client, sessionId);
      }
      if (customId.startsWith('postproduct_')) {
  const userId = interaction.user.id;
  const channelId = interaction.channel.id;
  const key = `${userId}_${channelId}`;
  const now = Date.now();
  const cooldown = 60 * 60 * 1000; // 1 jam

  if (postCooldowns.has(key)) {
    const lastPostTime = postCooldowns.get(key);
    const timeDiff = now - lastPostTime;
    if (timeDiff < cooldown) {
      const remaining = cooldown - timeDiff;
      const minutes = Math.ceil(remaining / 60000);
      return interaction.reply({
        content: `⏳  Kamu hanya bisa posting sekali setiap 1 jam di channel ini.\nTunggu **${minutes} menit** lagi.`,
        ephemeral: true
      });
    }
  }

  // Buka modal posting
  return await productPoster.openPostModal(interaction);
}
    }

    // Modal dikirim
    else if (interaction.isModalSubmit()) {
      const [modalAction, sessionId] = interaction.customId.split('_');

      if (modalAction === 'reminder') {
        return await reminderManager.handleReminderModal(interaction, client);
      }
      if (modalAction === 'modalreply') {
        return await dmSession.handleModalReply(interaction, client);
      }
if (interaction.customId.startsWith('submitpost_')) {
  await productPoster.handleSubmitModal(interaction);

  // Setelah berhasil posting, set cooldown
  const userId = interaction.user.id;
  const channelId = interaction.channel.id;
  const key = `${userId}_${channelId}`;
  postCooldowns.set(key, Date.now());

  // Hapus cooldown setelah 1 jam
  setTimeout(() => postCooldowns.delete(key), 60 * 60 * 1000);
     }
    }
  });
};
