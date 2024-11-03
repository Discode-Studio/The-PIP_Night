const { EmbedBuilder, Colors } = require('discord.js');
const https = require('https');
const axios = require('axios');
const xml2js = require('xml2js');

async function getSolarData() {
    try {
        // Récupérer le XML depuis l'URL
        const response = await axios.get('https://www.hamqsl.com/solarxml.php', {
            httpsAgent: new https.Agent({ rejectUnauthorized: false })
        });

        // Convertir le XML en JSON
        const jsonData = await xml2js.parseStringPromise(response.data);

        // Vérifier la structure JSON obtenue
        if (!jsonData.solar || !jsonData.solar.bands || !jsonData.solar.bands[0].band) {
            console.error("La structure des données JSON est incorrecte.");
            return null;
        }

        // Accéder aux données des bandes "80m-40m" pour jour et nuit
        const bands = jsonData.solar.bands[0].band;
        let dayStatus = '';
        let nightStatus = '';

        bands.forEach(band => {
            if (band.name[0] === '80m-40m') {
                dayStatus = band.day[0];
                nightStatus = band.night[0];
            }
        });
        
        return {
            dayStatus,
            nightStatus
        };
    } catch (error) {
        console.error('Error retrieving solar data :', error);
        return null;
    }
}

module.exports = {
    async execute(message) {
        const solarInfo = await getSolarData();

        if (!solarInfo) {
            return message.channel.send("Unable to retrieve solar information.");
}
        const solarEmbed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle("Conditions for the 80m-40m band")
            .addFields(
                { name: "Jour", value: solarInfo.dayStatus, inline: true },
                { name: "Nuit", value: solarInfo.nightStatus, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: "Data retrieved from hamqsl.com" });

        message.channel.send({ embeds: [solarEmbed] });
    }
};
