const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

async function getSolarData() {
    // Remplacez ceci par la logique réelle pour obtenir les données solaires
    return {
        dayStatus: 'Good',
        nightStatus: 'Fair'
    };
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
