const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent // <-- intents
    ]
});

client.once('ready', () => {
    console.log('Bot is ready and connected!');
});

client.on('messageCreate', async message => {
    if (message.content === '!hfconditions') {
        try {
            // Requête pour obtenir les données de NOAA
            const response = await axios.get('https://services.swpc.noaa.gov/text/wwv.txt');
            const data = response.data;

            // Envoie des données directement dans le canal Discord
            message.channel.send(`Current HF conditions from NOAA:\n\`\`\`${data}\`\`\``);
        } catch (error) {
            console.error('Error fetching HF conditions:', error);
            message.channel.send('Failed to fetch HF conditions. Please try again later.');
        }
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
