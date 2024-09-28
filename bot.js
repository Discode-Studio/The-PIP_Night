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

// Supported languages list (in lowercase for case-insensitive comparison)
const supportedLanguages = [
    "german", "french", "english", "arabic", "italian", "spanish",
    "multi", "tamil", "chinese", "mandarin", "korean", "hindi", 
    "balushi", "urdu"
];

// Function to parse time in HH:MM format to hour in number
function parseTimeToHour(time) {
    const [hour, minute] = time.split(':').map(Number);
    return hour + minute / 60; // Convert minutes to a fraction of an hour
}

client.on('messageCreate', async message => {
    if (message.content.startsWith('!drm')) {
        const args = message.content.split(' ');
        const requestedLanguage = args[1]?.toLowerCase(); // Convert user input to lowercase for case-insensitive comparison

        // Check if the requested language is supported
        if (!requestedLanguage || !supportedLanguages.includes(requestedLanguage)) {
            return message.channel.send(`There is no broadcast schedule available for "${requestedLanguage}".`);
        }

        try {
            // Fetch the DRM broadcast schedule page
            const response = await axios.get('https://www.drm.org/broadcast-schedule/');
            const html = response.data;

            // Load the HTML using cheerio
            const $ = cheerio.load(html);

            // Get the current time in UTC
            const nowUTC = new Date();
            const currentHourUTC = nowUTC.getUTCHours();

            let nextSchedule = '';

            // Extract data from the table with id "table1" and search for the requested language
            $('#table1 tbody tr').each((i, element) => {
                const columns = $(element).children('td').map((i, el) => $(el).text().trim()).get();

                // Assuming language is in the 5th column and start time is in the first column (adjust if needed)
                const startTime = columns[0];
                const endTime = columns[1]; // Assuming end time is in the second column
                const broadcastLanguage = columns[4].toLowerCase(); // Convert table language to lowercase for comparison

                // Parse the start time to numbers (hours)
                const startHourUTC = parseTimeToHour(startTime);
                const endHourUTC = parseTimeToHour(endTime);

                // If the broadcast matches the requested language (case insensitive)
                if (broadcastLanguage === requestedLanguage) {
                    // Check if the broadcast is ongoing or in the future
                    if (currentHourUTC >= startHourUTC && currentHourUTC <= endHourUTC) {
                        nextSchedule = `There is currently a broadcast in ${requestedLanguage}. It started at ${startTime} UTC and will end at ${endTime} UTC.`;
                    } else if (startHourUTC > currentHourUTC && !nextSchedule) {
                        nextSchedule = `The next broadcast in ${requestedLanguage} will start at ${startTime} UTC and will end at ${endTime} UTC.`;
                    }
                }
            });

            // If no schedule was found, inform the user
            if (!nextSchedule) {
                nextSchedule = `There is no upcoming broadcast in ${requestedLanguage}.`;
            }

            // Send the result to the Discord channel
            message.channel.send(nextSchedule);

        } catch (error) {
            console.error('Error fetching DRM schedule:', error);
            message.channel.send('Failed to fetch DRM schedule. Please try again later.');
        }
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
