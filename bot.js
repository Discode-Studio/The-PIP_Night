// Discord bot with NOAA API and DRM schedule fetch made by Discode Studio.
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const scheduleData = require('./drm_schedule.json'); // Assuming you save the JSON in drm_schedule.json

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

// Function to convert time ranges (e.g., "0500-0600") to numerical hours
function parseTimeRangeToHours(timeRange) {
    const [start, end] = timeRange.split('-').map(time => {
        const [hour, minute] = time.match(/.{1,2}/g).map(Number);
        return hour + minute / 60;
    });
    return { start, end };
}

client.on('messageCreate', async message => {
    if (message.content.startsWith('!drm')) {
        const args = message.content.split(' ');
        const requestedLanguage = args[1]?.toLowerCase(); // Convert user input to lowercase for case-insensitive comparison

        // Check if the requested language is supported
        if (!requestedLanguage || !supportedLanguages.includes(requestedLanguage)) {
            return message.channel.send(`There is no broadcast schedule available for "${requestedLanguage}".`);
        }

        // Get the current time in UTC
        const nowUTC = new Date();
        const currentHourUTC = nowUTC.getUTCHours() + nowUTC.getUTCMinutes() / 60;

        let nextSchedule = '';
        let foundCurrent = false;

        // Find the next or ongoing schedule for the requested language
        for (const schedule of scheduleData) {
            const { start, end } = parseTimeRangeToHours(schedule.time);
            if (schedule.language.toLowerCase() === requestedLanguage) {
                if (currentHourUTC >= start && currentHourUTC <= end) {
                    nextSchedule = `There is currently a broadcast in ${requestedLanguage}. It started at ${schedule.time} UTC and is broadcasting on ${schedule.frequency} kHz.`;
                    foundCurrent = true;
                    break;
                } else if (start > currentHourUTC && !foundCurrent) {
                    nextSchedule = `The next broadcast in ${requestedLanguage} will start at ${schedule.time} UTC on ${schedule.frequency} kHz.`;
                    foundCurrent = true;
                    break;
                }
            }
        }

        if (!nextSchedule) {
            nextSchedule = `There is no upcoming broadcast in ${requestedLanguage}.`;
        }

        // Send the result to the Discord channel
        message.channel.send(nextSchedule);
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
