const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

async function getSolarData() {
    try {
        // Requête vers l'API XML-to-JSON pour transformer le XML en JSON
        const response = await axios.get('https://api.xmltojson.com/convert', {
            params: {
                // URL de la source XML à convertir
                url: 'https://www.hamqsl.com/solarxml.php'
            }
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
};
