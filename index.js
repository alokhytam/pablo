require('dotenv').config();

// Pastikan folder storage tersedia
const path = require('path');
const storagePath = path.join(__dirname, 'data', 'storage');
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
}

// Simpan ke client agar bisa dipakai semua fitur
client.storagePath = storagePath;
client.sellerDataFile = path.join(storagePath, 'sellerData.json');
client.buyerDataFile = path.join(storagePath, 'buyerData.json');

// Inisialisasi Map di client
client.sellerMap = new Map();
client.buyerMap = new Map();

// Fungsi untuk load data JSON dari file ke Map
function loadData(filePath) {
  if (!fs.existsSync(filePath)) return new Map();
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return new Map(JSON.parse(raw));
  } catch (e) {
    console.error(`❌  Gagal load file ${filePath}:`, e);
    return new Map();
  }
}

// Load seller dan buyer data
client.sellerMap = loadData(client.sellerDataFile);
client.buyerMap = loadData(client.buyerDataFile);
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

//simpan data
const path = require('path');
const fs = require('fs');

// Load semua handler dan fitur
try {
  require('./handlers/interactionHandler')(client);
  console.log('✅  interactionHandler loaded');
} catch (e) {
  console.error('❌  interactionHandler gagal:\n', e.stack);
}

client.commands = new Collection();
client.slashCommands = new Collection();

// ✅ Harus dipanggil duluan!
try {
  require('./handlers/commandLoader')(client);
  console.log('✅ commandLoader loaded');
} catch (e) {
  console.error('❌ commandLoader gagal:', e);
}

//LOG BAN & TIMEOUT
require('./handlers/eventLoader')(client);

// ✅ Dipanggil setelah commandLoader
try {
  require('./handlers/commandHandler')(client);
  console.log('✅ commands loaded');
} catch (e) {
  console.error('❌ commands gagal:', e);
}

try {
  require('./utils/autoEmbed')(client);
  console.log('✅ autoEmbed loaded');
} catch (e) {
  console.error('❌ autoEmbed gagal:', e);
}
const productPoster = require('./features/productPoster');  

client.once('ready', () => {
  console.log(`✅ Bot aktif sebagai ${client.user.tag}`);
  productPoster.execute(client);
});

// Login bot
const token = process.env.TOKEN;

if (!token) {
  console.error('❌ TOKEN tidak ditemukan di file .env');
  process.exit(1);
}

client.login(token);
