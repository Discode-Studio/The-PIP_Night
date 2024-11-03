const { EmbedBuilder, Colors } = require('discord.js');
const https = require('https');
const axios = require('axios');

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
            httpsAgent: agent
        });
        
        const jsonData = response.data;

        // Affiche la structure des données pour le débogage
        console.log("Structure des données JSON :", JSON.stringify(jsonData, null, 2));

        // Vérification de la structure attendue dans jsonData
        if (!jsonData.solar || !jsonData.solar.bands || !jsonData.solar.bands.band) {
            console.error("La structure des données JSON est incorrecte.");
            return null;
        }

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
            return message.channel.send("Impossible de récupérer les informations solaires.");
        }

        const solarEmbed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle("Conditions pour la bande 80m-40m")
            .addFields(
                { name: "Jour", value: solarInfo.dayStatus, inline: true },
                { name: "Nuit", value: solarInfo.nightStatus, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: "Données récupérées depuis hamqsl.com" });

        message.channel.send({ embeds: [solarEmbed] });
    }
};
