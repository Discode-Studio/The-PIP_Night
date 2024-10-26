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

// Fonction pour convertir l'heure en format "hhmm" en un format correct avec heures et minutes
function convertTimeToUTC(time) {
    const hours = time.slice(0, 2);
    const minutes = time.slice(2);
    return { hours: parseInt(hours, 10), minutes: parseInt(minutes, 10) };
}

function getCurrentUTC() {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace('T', ' ');
}

// Ajout de l'accolade manquante pour fermer la fonction
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

    const fetch = require('node-fetch'); // Make sure to install this with `npm install node-fetch`

async function getSolarData() {
    try {
        const response = await fetch('https://www.hamqsl.com/solarjson.php'); // URL for solar conditions API
        if (!response.ok) throw new Error('Error fetching solar data');

        const data = await response.json();

        // Return relevant solar data fields without interpretation
        return {
            SFI: data.solar.SFI, // Solar Flux Index
            K: data.solar.K,     // K-index
            A: data.solar.A,     // A-index
            xray: data.solar.xray, // X-ray flux
            sunspots: data.solar.sunspots // Number of sunspots
        };
    } catch (error) {
        console.error('Error fetching solar data:', error);
        return null;
    }
}

// Code to execute the 'solar' command
if (command === 'solar') {
    const solarInfo = await getSolarData();

    if (!solarInfo) {
        return message.channel.send('Unable to fetch solar information.');
    }

    const solarEmbed = new EmbedBuilder()
        .setColor(0x1E90FF)
        .setTitle('Real-Time Solar Conditions')
        .addFields(
            { name: 'Solar Flux Index (SFI)', value: solarInfo.SFI.toString(), inline: true },
            { name: 'K-index', value: solarInfo.K.toString(), inline: true },
            { name: 'A-index', value: solarInfo.A.toString(), inline: true },
            { name: 'X-ray Flux', value: solarInfo.xray, inline: true },
            { name: 'Sunspots', value: solarInfo.sunspots.toString(), inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Data retrieved from hamqsl.com' });

    message.channel.send({ embeds: [solarEmbed] });
    }
});

// Correction de la fermeture du code
client.login(process.env.DISCORD_BOT_TOKEN);
