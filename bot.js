require('dotenv').config();
const axios = require('axios');
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent // This is crucial for reading message content
    ]
});

client.once('ready', () => {
    console.log('Bot is ready and connected!');
});

// Command to check HF conditions
client.on('messageCreate', message => {
    if (message.content === '!hfconditions') {
        axios.get('https://api.spaceweatherlive.com/api/spaceweather') // Exemple d'une autre API
            .then(response => {
                const conditions = response.data; // Adapter selon la structure de la réponse
                message.channel.send(`Current HF conditions: ${conditions.summary}`);
            })
            .catch(error => console.error('Error fetching HF conditions:', error));
    }
});


client.login(process.env.DISCORD_BOT_TOKEN);
