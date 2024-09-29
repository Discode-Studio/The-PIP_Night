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

// Fonction pour ajuster la date de diffusion au jour actuel ou au lendemain si l'heure est passée
function getNextBroadcastTime(schedule) {
    const [startHour] = schedule.time.split('-').map(time => parseInt(time, 10)); // Récupérer l'heure de début
    const now = new Date();
    let nextBroadcastTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour);

    // Si l'heure de diffusion est déjà passée pour aujourd'hui, ajoutez un jour
    if (nextBroadcastTime < now) {
        nextBroadcastTime.setDate(nextBroadcastTime.getDate() + 1);
    }

    // Gestion spéciale pour "Music 4 Joy", qui ne diffuse que les mardi et jeudi
    if (schedule.broadcaster === "Music 4 Joy") {
        const dayOfWeek = nextBroadcastTime.getDay(); // 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi

        // Si ce n'est pas mardi (2) ou jeudi (4), trouver le prochain mardi ou jeudi
        if (dayOfWeek !== 2 && dayOfWeek !== 4) {
            const daysUntilNextBroadcast = dayOfWeek < 2 ? 2 - dayOfWeek : 4 - dayOfWeek;
            nextBroadcastTime.setDate(nextBroadcastTime.getDate() + daysUntilNextBroadcast);
        }
    }

    return nextBroadcastTime;
}

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
            const nextBroadcastTime = getNextBroadcastTime(nextSchedule); // Utiliser la fonction pour ajuster la date

            const discordTimestamp = `<t:${Math.floor(nextBroadcastTime.getTime() / 1000)}:R>`; // Format timestamp Discord

            // Formater la réponse
            message.channel.send(`Next broadcast in ${args.charAt(0).toUpperCase() + args.slice(1)}:\nTime: ${nextSchedule.time} ${discordTimestamp}\nBroadcaster: ${nextSchedule.broadcaster}\nFrequency: ${nextSchedule.frequency}\nTarget: ${nextSchedule.target}`);
        } else {
            message.channel.send(`There is no upcoming broadcast in ${args}.`);
        }
    }

    if (message.content === '!drmschedule') {
        const now = new Date();
        const scheduleMessage = drmSchedule.map(broadcast => {
            const nextBroadcastTime = getNextBroadcastTime(broadcast); // Utiliser la fonction pour ajuster la date
            const discordTimestamp = `<t:${Math.floor(nextBroadcastTime.getTime() / 1000)}:R>`; // Format timestamp Discord

            return `Time: ${broadcast.time} ${discordTimestamp}, Broadcaster: ${broadcast.broadcaster}, Frequency: ${broadcast.frequency}, Language: ${broadcast.language}`;
        }).filter(Boolean).join('\n');

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
