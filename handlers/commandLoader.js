// handlers/commandLoader.js
const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  const commandsPath = path.join(__dirname, '../commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    // Format slash command
    if (command.data && command.data.name && typeof command.execute === 'function') {
      client.slashCommands.set(command.data.name, command);
      console.log(`✅  Slash Command loaded: ${command.data.name}`);
    }

    // Format prefix command
    else if (command.name && typeof command.execute === 'function') {
      client.commands.set(command.name, command);
      console.log(`✅  Prefix Command loaded: ${command.name}`);
    }

    else {
      console.warn(`⚠️ Command tidak valid: ${file}`);
    }
  }
};
