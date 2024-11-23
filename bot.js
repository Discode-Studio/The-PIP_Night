// Discord bot with NOAA API made by Discode Studio.
const { Client, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();
const fs = require('fs');

// Initialisation du client Discord
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// Collection pour les commandes
client.commands = new Collection();

// Charger toutes les commandes depuis le dossier `commands`
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.warn(`[WARNING] La commande dans ${file} manque d'une propriété "data" ou "execute".`);
    }
}

// Quand le bot est prêt
client.once('ready', () => {
    console.log(`Bot en ligne en tant que ${client.user.tag}!`);
});

// Gestion des interactions (slash commands)
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Erreur lors de l'exécution de la commande ${interaction.commandName}:`, error);
        await interaction.reply({ content: 'Une erreur est survenue en exécutant cette commande.', ephemeral: true });
    }
});

// Connecter le bot à Discord
client.login(process.env.DISCORD_BOT_TOKEN);
