const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

async function getSolarData() {
    const response = await fetch('https://www.hamqsl.com/solarxml.php');
    
    if (!response.ok) {
        throw new Error('Erreur de récupération des données solaires');
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
    
    // Récupération des valeurs pour "day" et "night" dans la balise `band` avec `name="80m-40m"`
    const bandElements = xmlDoc.querySelectorAll('band[name="80m-40m"]');
    
    let dayStatus = '';
    let nightStatus = '';

    bandElements.forEach(band => {
        const day = band.querySelector('day');
        const night = band.querySelector('night');
        
        if (day && night) {
            dayStatus = day.textContent;
            nightStatus = night.textContent;
        }
    });

    return {
        dayStatus,
        nightStatus
    };
}

// Appel de la fonction pour tester
getSolarData().then(data => {
    console.log(data);  // Affiche les statuts de jour et de nuit
}).catch(error => {
    console.error('Erreur:', error);
});
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
