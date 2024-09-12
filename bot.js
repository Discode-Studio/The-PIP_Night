require('dotenv').config();
const axios = require('axios');
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
    console.log('Bot is ready and connected!');
});

// Command to check HF conditions
client.on('messageCreate', message => {
    if (message.content === '!hfconditions') {
        axios.get('https://api.noaa.gov/space_weather_conditions') // Replace with actual NOAA API URL
            .then(response => {
                const conditions = response.data; // Adjust according to the API response structure
                message.channel.send(`Current HF conditions: ${conditions.summary}`);
            })
            .catch(error => console.error(error));
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
