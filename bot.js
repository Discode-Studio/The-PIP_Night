const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent // Assurez-vous d'ajouter MessageContent si vous voulez lire le contenu des messages
    ]
});

client.once('ready', () => {
    console.log('Bot is ready and connected!');
});

client.on('messageCreate', async message => {
    if (message.content === '!hfconditions') {
        try {
            // Remplacez l'URL ci-dessous par l'URL de l'API de SolarHam si disponible
            const response = await axios.get('https://api.solarham.net/your-endpoint'); // Exemple d'URL
            const data = response.data;
            
            // Assurez-vous que cette partie correspond à la structure des données renvoyées par l'API
            const kIndex = data.someDataField; // Remplacez 'someDataField' par le champ correct des données

            message.channel.send(`Current K-index: ${kIndex}`);
        } catch (error) {
            console.error('Error fetching HF conditions:', error);
            message.channel.send('Failed to fetch HF conditions. Please try again later.');
        }
    }
});

client.login(process.env.BOT_TOKEN);
