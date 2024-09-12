const axios = require('axios');
const cheerio = require('cheerio');
const { Client, Intents } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.once('ready', () => {
    console.log('Bot is ready and connected!');
});

client.on('messageCreate', async message => {
    if (message.content === '!hfconditions') {
        try {
            // Remplacez l'URL par l'URL du site SolarHam ou d'un autre site pertinent
            const { data } = await axios.get('https://www.solarham.net/');
            const $ = cheerio.load(data);

            // Adapte le sélecteur selon la structure du site web
            const kIndex = $('selector-for-k-index').text(); // Remplace par le sélecteur correct

            message.channel.send(`Current K-index: ${kIndex}`);
        } catch (error) {
            console.error('Error fetching HF conditions:', error);
            message.channel.send('Failed to fetch HF conditions. Please try again later.');
        }
    }
});

client.login(process.env.BOT_TOKEN);
