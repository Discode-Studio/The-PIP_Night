// Discord bot with NOAA API made by Discode Studio.
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const xml2js = require('xml2js');
require('dotenv').config();

const drmSchedule = require('./drm_schedule.json'); // Assurez-vous que le chemin est correct

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});


function getCurrentUTC() {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace('T', ' '); // Renvoie une chaîne au format "YYYY-MM-DD HH:MM:SS"
}

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const prefix = '!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'utc') {
        const utcTime = getCurrentUTC();
        message.channel.send(`The current UTC time is: ${utcTime}`);
    }
// Fonction pour convertir l'heure en format "hhmm" en un format correct avec heures et minutes
function convertTimeToUTC(time) {
    const hours = time.slice(0, 2);
    const minutes = time.slice(2);
    return { hours: parseInt(hours, 10), minutes: parseInt(minutes, 10) };
}

// Fonction pour ajuster la date de diffusion au jour actuel ou au lendemain si l'heure est passée
function getNextBroadcastTime(schedule) {
    const now = new Date();
    const [startTime] = schedule.time.split('-').map(convertTimeToUTC);
    let broadcastDate = new Date(now);

    broadcastDate.setUTCHours(startTime.hours);
    broadcastDate.setUTCMinutes(startTime.minutes, 0, 0);

    if (broadcastDate < now) {
        broadcastDate.setUTCDate(broadcastDate.getUTCDate() + 1);
    }

    if (schedule.broadcaster === "Music 4 Joy") {
        const dayOfWeek = broadcastDate.getUTCDay();
        if (dayOfWeek !== 2 && dayOfWeek !== 4) {
            let daysUntilNextBroadcast = dayOfWeek < 2 ? 2 - dayOfWeek : dayOfWeek < 4 ? 4 - dayOfWeek : (2 + 7) - dayOfWeek;
            broadcastDate.setUTCDate(broadcastDate.getUTCDate() + daysUntilNextBroadcast);
        }
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

// Fonction pour récupérer les données solaires
async function getSolarData() {
    try {
        const response = await axios.get('https://www.hamqsl.com/solarxml.php');
        const xmlData = response.data;
        const parser = new xml2js.Parser({ explicitArray: false });
        const result = await parser.parseStringPromise(xmlData);

        const calculatedConditions = result.solar.solardata.calculatedconditions;

        if (!calculatedConditions || !calculatedConditions.band) {
            console.error('Structure XML inattendue:', result);
            return null;
        }

        const bands = Array.isArray(calculatedConditions.band) ? calculatedConditions.band : [calculatedConditions.band];
        const band80m40mDay = bands.find(band => band.$.name === "80m-40m" && band.$.time === "day");
        const band80m40mNight = bands.find(band => band.$.name === "80m-40m" && band.$.time === "night");

        if (!band80m40mDay || !band80m40mNight) {
            console.error('Les informations pour la bande 80m-40m sont manquantes.');
            return null;
        }

        return {
            dayStatus: band80m40mDay._ || band80m40mDay,
            nightStatus: band80m40mNight._ || band80m40mNight
        };
    } catch (error) {
        console.error('Error fetching solar data:', error);
        return null;
    }
}

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const prefix = '!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'drm') {
        const language = args[0]?.toLowerCase();
        const supportedLanguages = ["german", "french", "english", "arabic", "italian", "spanish", "multi", "tamil", "chinese", "mandarin", "korean", "hindi", "balushi", "urdu"];

        if (!supportedLanguages.includes(language)) {
            message.channel.send(`There is no broadcast schedule available for "${language}".`);
            return;
        }

        const nextSchedule = drmSchedule.find(broadcast => broadcast.language.toLowerCase() === language);

        if (nextSchedule) {
            const nextBroadcastTime = getNextBroadcastTime(nextSchedule);
            const formattedTime = formatTimeDifference(nextBroadcastTime);

            const embed = new EmbedBuilder()
                .setColor(0x1E90FF)
                .setTitle(`Next broadcast in ${language.charAt(0).toUpperCase() + language.slice(1)}`)
                .addFields(
                    { name: 'Time (UTC/GMT)', value: `${nextSchedule.time}${formattedTime}`, inline: true },
                    { name: 'Broadcaster', value: nextSchedule.broadcaster, inline: true },
                    { name: 'Frequency', value: nextSchedule.frequency, inline: true },
                    { name: 'Target', value: nextSchedule.target, inline: true }
                )
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } else {
            message.channel.send(`There is no upcoming broadcast in ${language}.`);
        }
    }

    if (command === 'hfconditions') {
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

    if (command === 'solar') {
        const solarInfo = await getSolarData();

        if (!solarInfo) {
            return message.channel.send('Unable to fetch solar information.');
        }

        const solarEmbed = new EmbedBuilder()
            .setColor(0x1E90FF)
            .setTitle('Conditions for the 80m-40m band')
            .addFields(
                { name: 'Day', value: solarInfo.dayStatus, inline: true },
                { name: 'Night', value: solarInfo.nightStatus, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Data retrieved from hamqsl.com' });

        message.channel.send({ embeds: [solarEmbed] });
    }
});

if (!process.env.DISCORD_BOT_TOKEN) {
    console.error("Le token Discord est manquant dans le fichier .env");
    process.exit(1);
}
client.login(process.env.DISCORD_BOT_TOKEN);
