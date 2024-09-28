// Discord bot with NOAA API made by Discode Studio.
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const drmSchedule = require('./drm_schedule.json'); // Assurez-vous que le chemin est correct

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
    if (message.content.startsWith('!drm ')) {
        const args = message.content.slice(5).trim().toLowerCase(); // Mettre en minuscule
        const supportedLanguages = ["german", "french", "english", "arabic", "italian", "spanish", "multi", "tamil", "chinese", "mandarin", "korean", "hindi", "balushi", "urdu"];
        
        if (!supportedLanguages.includes(args)) {
            message.channel.send(`There is no broadcast schedule available for "${args}".`);
            return;
        }

        // Chercher l'entrée correspondante dans le fichier JSON
        const nextSchedule = drmSchedule.find(broadcast => broadcast.language.toLowerCase() === args);

        if (nextSchedule) {
            // Formater la réponse
            message.channel.send(`Next broadcast in ${args.charAt(0).toUpperCase() + args.slice(1)}:\nTime: ${nextSchedule.time}\nBroadcaster: ${nextSchedule.broadcaster}\nFrequency: ${nextSchedule.frequency}\nTarget: ${nextSchedule.target}`);
        } else {
            message.channel.send(`There is no upcoming broadcast in ${args}.`);
        }
    }

    if (message.content === '!drmschedule') {
        const scheduleMessage = drmSchedule.map(broadcast => {
            return `Time: ${broadcast.time}, Broadcaster: ${broadcast.broadcaster}, Frequency: ${broadcast.frequency}, Language: ${broadcast.language}`;
        }).join('\n');

        if (scheduleMessage.length > 0) {
            message.channel.send(`Broadcast Schedule:\n${scheduleMessage}`);
        } else {
            message.channel.send(`There is no broadcast schedule available.`);
        }
    }

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
});

client.login(process.env.DISCORD_BOT_TOKEN); // Assurez-vous que votre token est dans le fichier .env
