const { EmbedBuilder, Colors } = require('discord.js'); // Mise à jour pour Colors
const https = require('https');
const axios = require('axios');

// Création de l'agent HTTPS avec des certificats non vérifiés
const agent = new https.Agent({
    rejectUnauthorized: false
});

async function getSolarData() {
    try {
        // Requête vers l'API XML-to-JSON en utilisant l'agent HTTPS
        const response = await axios.get('https://api.xmltojson.com/convert', {
            params: {
                url: 'https://www.hamqsl.com/solarxml.php'
            },
            httpsAgent: agent // Utilisation de l'agent ici
        });
        
        const jsonData = response.data;

        // Accéder aux données des bandes "80m-40m" pour day et night
        const bands = jsonData.solar.bands.band;
        let dayStatus = '';
        let nightStatus = '';

        bands.forEach(band => {
            if (band.name === '80m-40m') {
                dayStatus = band.day;
                nightStatus = band.night;
            }
        });

        return {
            dayStatus,
            nightStatus
        };
    } catch (error) {
        console.error('Erreur lors de la récupération des données solaires :', error);
        return null;
    }
}

module.exports = {
    async execute(message) {
        const solarInfo = await getSolarData();

        if (!solarInfo) {
            return message.channel.send('Impossible de récupérer les informations solaires.');
        }

        const solarEmbed = new EmbedBuilder()
            .setColor(Colors.Blue) // Utilisation de Colors pour la couleur
            .setTitle('Conditions pour la bande 80m-40m')
            .addFields(
                { name: 'Jour', value: solarInfo.dayStatus, inline: true },
                { name: 'Nuit', value: solarInfo.nightStatus, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Données récupérées depuis hamqsl.com' });

        message.channel.send({ embeds: [solarEmbed] });
    }
};
