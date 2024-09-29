// Discord bot with NOAA API made by Discode Studio.
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const drmSchedule = require('./drm_schedule.json'); // Assurez-vous que le chemin est correct
let bbcSchedule;

try {
    bbcSchedule = require('./bbc.json'); // Chargez le fichier bbc.json
} catch (error) {
    console.error('Error loading bbc.json:', error);
    bbcSchedule = []; // Assurez-vous que bbcSchedule est un tableau vide en cas d'erreur
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Fonction pour convertir l'heure en format "hhmm" en un format correct avec heures et minutes
function convertTimeToUTC(time) {
    const hours = time.slice(0, 2);
    const minutes = time.slice(2);
    return { hours: parseInt(hours, 10), minutes: parseInt(minutes, 10) };
}

// Fonction pour ajuster la date de diffusion au jour actuel ou au lendemain si l'heure est passée
function getNextBroadcastTime(schedule) {
    const now = new Date();
    const [startTime] = schedule.Start.split('-').map(time => convertTimeToUTC(time));
    let broadcastDate = new Date(now);

    broadcastDate.setUTCHours(startTime.hours);
    broadcastDate.setUTCMinutes(startTime.minutes, 0, 0);

    if (broadcastDate < now) {
        broadcastDate.setUTCDate(broadcastDate.getUTCDate() + 1);
    }

    return broadcastDate;
}

// Fonction pour calculer le temps restant avant le broadcast
function formatTimeDifference(broadcastDate) {
    const now = new Date();
    const timeDiff = broadcastDate - now;

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    const isToday = broadcastDate.getUTCDate() === now.getUTCDate();
    const dayLabel = isToday ? 'today' : 'tomorrow';

    return `: ${dayLabel} at ${broadcastDate.getUTCHours().toString().padStart(2, '0')}:${broadcastDate.getUTCMinutes().toString().padStart(2, '0')}, in ${hours}h${minutes.toString().padStart(2, '0')}m`;
}

client.on('messageCreate', async message => {
    if (message.content.startsWith('!drm ')) {
        const args = message.content.slice(5).trim().toLowerCase();
        const supportedLanguages = ["german", "french", "english", "arabic", "italian", "spanish", "multi", "tamil", "chinese", "mandarin", "korean", "hindi", "balushi", "urdu"];
        
        if (!supportedLanguages.includes(args)) {
            message.channel.send(`There is no broadcast schedule available for "${args}".`);
            return;
        }

        const nextSchedule = drmSchedule.find(broadcast => broadcast.language.toLowerCase() === args);

        if (nextSchedule) {
            const nextBroadcastTime = getNextBroadcastTime(nextSchedule);
            const formattedTime = formatTimeDifference(nextBroadcastTime);

            const embed = new EmbedBuilder()
                .setColor(0x1E90FF)
                .setTitle(`Next broadcast in ${args.charAt(0).toUpperCase() + args.slice(1)}`)
                .addFields(
                    { name: 'Time (UTC/GMT)', value: `${nextSchedule.time}${formattedTime}`, inline: true },
                    { name: 'Broadcaster', value: nextSchedule.broadcaster, inline: true },
                    { name: 'Frequency', value: nextSchedule.frequency, inline: true },
                    { name: 'Target', value: nextSchedule.target, inline: true }
                )
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } else {
            message.channel.send(`There is no upcoming broadcast in ${args}.`);
        }
    }

    if (message.content === '!drmschedule') {
        const scheduleMessage = drmSchedule.map(broadcast => {
            const nextBroadcastTime = getNextBroadcastTime(broadcast);
            const formattedTime = formatTimeDifference(nextBroadcastTime);

            return `Time: ${broadcast.time} (UTC/GMT)${formattedTime}, Broadcaster: ${broadcast.broadcaster}, Frequency: ${broadcast.frequency}, Language: ${broadcast.language}`;
        }).filter(Boolean).join('\n');

        if (scheduleMessage.length > 0) {
            const embed = new EmbedBuilder()
                .setColor(0x1E90FF)
                .setTitle('Broadcast Schedule')
                .setDescription(scheduleMessage)
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } else {
            message.channel.send(`There is no broadcast schedule available.`);
        }
    }

    // Commandes pour BBC
    if (message.content === '!bbc') {
        const nextBBCSchedule = bbcSchedule.find(broadcast => {
            const nextBroadcastTime = getNextBroadcastTime(broadcast);
            return nextBroadcastTime > new Date(); // Filtre les horaires futurs
        });

        if (nextBBCSchedule) {
            const nextBroadcastTime = getNextBroadcastTime(nextBBCSchedule);
            const formattedTime = formatTimeDifference(nextBroadcastTime);

            const embed = new EmbedBuilder()
                .setColor(0x1E90FF)
                .setTitle(`Next BBC broadcast`)
                .addFields(
                    { name: 'Time (UTC/GMT)', value: `${nextBBCSchedule.Start}-${nextBBCSchedule.End}${formattedTime}`, inline: true },
                    { name: 'Broadcaster', value: nextBBCSchedule.Station, inline: true },
                    { name: 'Frequency', value: nextBBCSchedule.Freq, inline: true },
                    { name: 'Target', value: nextBBCSchedule.Transmitter_Site, inline: true }
                )
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } else {
            message.channel.send(`There is no upcoming BBC broadcast.`);
        }
    }

    if (message.content === '!bbcschedule') {
        const scheduleMessage = bbcSchedule.map(broadcast => {
            const nextBroadcastTime = getNextBroadcastTime(broadcast);
            const formattedTime = formatTimeDifference(nextBroadcastTime);

            return `Time: ${broadcast.Start}-${broadcast.End} (UTC/GMT)${formattedTime}, Broadcaster: ${broadcast.Station}, Frequency: ${broadcast.Freq}, Language: ${broadcast.Language}`;
        }).filter(Boolean).join('\n');

        if (scheduleMessage.length > 0) {
            const embed = new EmbedBuilder()
                .setColor(0x1E90FF)
                .setTitle('BBC Broadcast Schedule')
                .setDescription(scheduleMessage)
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } else {
            message.channel.send(`There is no broadcast schedule available.`);
        }
    }

    if (message.content === '!hfconditions') {
        try {
            const response = await axios.get('https://services.swpc.noaa.gov/text/wwv.txt');
            const data = response.data;

            const embed = new EmbedBuilder()
                .setColor(0x1E90FF)
                .setTitle('Current HF conditions from NOAA')
                .setDescription(`\`\`\`${data}\`\`\``)
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching HF conditions:', error);
            message.channel.send('Failed to fetch HF conditions. Please try again later.');
        }
    }
});

client.login(process.env.DISCORD_BOT_TOKEN); // Assurez-vous que votre token est dans le fichier .env
