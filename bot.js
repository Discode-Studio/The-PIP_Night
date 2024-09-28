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

            // Get the current time in UTC
            const nowUTC = new Date();
            const currentHourUTC = nowUTC.getUTCHours();

            // Function to parse time in HH:MM format to hour in number
            function parseTimeToHour(time) {
                const [hour, minute] = time.split(':').map(Number);
                return hour + minute / 60; // Convert minutes to a fraction of an hour
            }

            // Extract data from the table with id "table1" and filter based on the current time
            let scheduleData = '';
            $('#table1 tbody tr').each((i, element) => {
                const columns = $(element).children('td').map((i, el) => $(el).text().trim()).get();

                // Assuming the time is in the first column (adjust if needed)
                const startTime = columns[0];
                const endTime = columns[1]; // Assuming end time is the second column (adjust if needed)

                // Parse the start and end times to numbers (hours)
                const startHourUTC = parseTimeToHour(startTime);
                const endHourUTC = parseTimeToHour(endTime);

                // Check if the broadcast is within the next 2 hours or currently airing
                if (
                    (currentHourUTC >= startHourUTC && currentHourUTC <= endHourUTC) || // Currently airing
                    (startHourUTC > currentHourUTC && startHourUTC <= currentHourUTC + 2) // Starts in the next 2 hours
                ) {
                    scheduleData += columns.join(' | ') + '\n'; // Format row data
                }
            });

            if (scheduleData) {
                // Send the filtered schedule in the Discord chat
                message.channel.send(`DRM Broadcast Schedule (next 2 hours):\n\`\`\`${scheduleData}\`\`\``);
            } else {
                message.channel.send('No broadcasts found within the next 2 hours.');
            }
        } catch (error) {
            console.error('Error fetching DRM schedule:', error);
            message.channel.send('Failed to fetch DRM schedule. Please try again later.');
        }
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
