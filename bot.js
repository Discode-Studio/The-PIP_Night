// Discord bot with NOAA API and DRM schedule fetch made by Discode Studio.
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent // intents
    ]
});

client.once('ready', () => {
    console.log('Bot is ready and connected!');
});

client.on('messageCreate', async message => {
    if (message.content === '!hfconditions') {
        try {
            // NOAA API
            const response = await axios.get('https://services.swpc.noaa.gov/text/wwv.txt');
            const data = response.data;

            // Discord chat
            message.channel.send(`Current HF conditions from NOAA:\n\`\`\`${data}\`\`\``);
        } catch (error) {
            console.error('Error fetching HF conditions:', error);
            message.channel.send('Failed to fetch HF conditions. Please try again later.');
        }
    }

    if (message.content === '!drmschedule') {
        try {
            // Fetch the DRM broadcast schedule page
            const response = await axios.get('https://www.drm.org/broadcast-schedule/');
            const html = response.data;

            // Load the HTML using cheerio
            const $ = cheerio.load(html);

            // Extract data from the table with id "table1"
            let scheduleData = '';
            $('#table1 tbody tr').each((i, element) => {
                const row = $(element).children('td').map((i, el) => $(el).text().trim()).get();
                scheduleData += row.join(' | ') + '\n';
            });

            if (scheduleData) {
                // Send the extracted schedule in the Discord chat
                message.channel.send(`DRM Broadcast Schedule:\n\`\`\`${scheduleData}\`\`\``);
            } else {
                message.channel.send('Failed to fetch DRM schedule. No data found.');
            }
        } catch (error) {
            console.error('Error fetching DRM schedule:', error);
            message.channel.send('Failed to fetch DRM schedule. Please try again later.');
        }
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
