const { Client, GatewayIntentBits } = require('discord.js');
const drmSchedule = require('./drm_schedule.json'); // Assurez-vous que le chemin est correct

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
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
});

client.login('YOUR_BOT_TOKEN'); // Remplacez 'YOUR_BOT_TOKEN' par votre token de bot
