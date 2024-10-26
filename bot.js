// Discord bot with NOAA API made by Discode Studio.
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Charger les commandes
const utcCommand = require('./commands/utc');
const drmCommand = require('./commands/drm');
const hfConditionsCommand = require('./commands/hfconditions');
const solarCommand = require('./commands/solar');

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const prefix = '!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Exécuter la commande appropriée
    if (command === 'utc') {
        await utcCommand.execute(message);
    } else if (command === 'drm') {
        await drmCommand.execute(message, args);
    } else if (command === 'hfconditions') {
        await hfConditionsCommand.execute(message);
    } else if (command === 'solar') {
        await solarCommand.execute(message);
    }
});

// Correction de la fermeture du code
client.login(process.env.DISCORD_BOT_TOKEN);
