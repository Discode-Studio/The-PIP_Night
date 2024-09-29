// Discord bot with NOAA API made by Discode Studio.
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const drmSchedule = require('./drm_schedule.json'); // Assurez-vous que le chemin est correct

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log('Bot is ready and connected!');
});

// Fonction pour ajuster la date de diffusion au jour actuel ou au lendemain si l'heure est passée
function getNextBroadcastTime(schedule) {
    const now = new Date();
    const [startHour] = schedule.time.split('-').map(time => parseInt(time, 10)); // Récupérer l'heure de début
    let broadcastDate = new Date(now); // Partir de la date actuelle

    // Ajuster la date avec l'heure de début du programme
    broadcastDate.setHours(startHour);
    broadcastDate.setMinutes(0, 0, 0); // Minutes et secondes à 0

    // Si l'heure de diffusion est déjà passée aujourd'hui, on passe au lendemain
    if (broadcastDate < now) {
        broadcastDate.setDate(broadcastDate.getDate() + 1);
    }

    // Gestion spéciale pour "Music 4 Joy", qui ne diffuse que les mardi et jeudi
    if (schedule.broadcaster === "Music 4 Joy") {
        const dayOfWeek = broadcastDate.getDay(); // 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi

        // Si aujourd'hui n'est ni mardi ni jeudi, passer au prochain mardi ou jeudi
        if (dayOfWeek !== 2 && dayOfWeek !== 4) {
            const daysUntilNextBroadcast = dayOfWeek < 2 ? 2 - dayOfWeek : 4 - dayOfWeek;
            broadcastDate.setDate(broadcastDate.getDate() + daysUntilNextBroadcast);
        }
    }

    return broadcastDate;
}

// Fonction pour calculer le temps restant avant le broadcast
function formatTimeDifference(broadcastDate) {
    const now = new Date();
    const timeDiff = broadcastDate - now; // Différence en millisecondes

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    const isToday = broadcastDate.getDate() === now.getDate();
    const dayLabel = isToday ? 'today' : 'tomorrow';

    return `: ${dayLabel} at ${broadcastDate.getUTCHours().toString().padStart(2, '0')}:${broadcastDate.getUTCMinutes().toString().padStart(2, '0')}, in ${hours}h${minutes.toString().padStart(2, '0')}m`;
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
            const formattedTime = formatTimeDifference(nextBroadcastTime); // Obtenir le temps formaté

            // Formater la réponse
            message.channel.send(`Next broadcast in ${args.charAt(0).toUpperCase() + args.slice(1)}:\nTime: ${nextSchedule.time} (UTC/GMT)${formattedTime}\nBroadcaster: ${nextSchedule.broadcaster}\nFrequency: ${nextSchedule.frequency}\nTarget: ${nextSchedule.target}`);
        } else {
            message.channel.send(`There is no upcoming broadcast in ${args}.`);
        }
    }

    if (message.content === '!drmschedule') {
        const scheduleMessage = drmSchedule.map(broadcast => {
            const nextBroadcastTime = getNextBroadcastTime(broadcast); // Utiliser la fonction pour ajuster la date
            const formattedTime = formatTimeDifference(nextBroadcastTime); // Obtenir le temps formaté

            return `Time: ${broadcast.time} (UTC/GMT)${formattedTime}, Broadcaster: ${broadcast.broadcaster}, Frequency: ${broadcast.frequency}, Language: ${broadcast.language}`;
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
