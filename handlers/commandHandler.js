/*module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    // Tambahkan pengecekan agar tidak error
    if (!message || !message.content || !message.author) return;
    if (!message.content.startsWith('!') || message.author.bot) return;
    console.log(`✅ Message received: ${message.content}`);
    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);

    if (!command) {

  console.log(`❌ Command ${commandName} tidak ditemukan`);

  return;

}

    try {
      await command.execute(message, args);
    } catch (err) {
      console.error(`❌ Error saat menjalankan perintah: ${commandName}\n`, err);
      message.reply('Terjadi kesalahan saat menjalankan perintah ini.');
    }
  });
};const fs = require('fs');

const path = require('path');

module.exports = (client) => {

  const commandsPath = path.join(__dirname, '../commands');

  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {

    const filePath = path.join(commandsPath, file);

    const command = require(filePath);

    if (command.name && typeof command.execute === 'function') {

      client.commands.set(command.name, command);

      console.log(`✅ Command loaded: ${command.name}`);

    } else {

      console.warn(`⚠️  Command ${file} tidak valid.`);

    }

  }

};*/  // handlers/commandHandler.js

module.exports = (client) => {

  client.on('messageCreate', async (message) => {

    if (!message || !message.content || message.author.bot) return;

    if (!message.content.startsWith('!')) return;

    const args = message.content.slice(1).trim().split(/ +/);

    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);

    if (!command) return;

    try {

      await command.execute(message, args);

    } catch (err) {

      console.error(`❌ Error saat menjalankan perintah: ${commandName}\n`, err);

    //  message.reply('❌ Terjadi kesalahan saat menjalankan perintah ini.');

    }

  });

};
