const { MessageEmbed } = require('discord.js');
const axios = require('axios');
const xml2js = require('xml2js');

// Function to fetch and process solar data
async function getSolarData() {
    try {
        // Fetch data from the link
        const response = await axios.get('https://www.hamqsl.com/solarxml.php');
        const xmlData = response.data;

        // Convert XML to JSON
        const result = await xml2js.parseStringPromise(xmlData, { explicitArray: false });
        const solarData = result.solar;

        // Get info for the "80m-40m" band
        const bandData = solarData.band[0]; // Assuming the first entry is "80m-40m"
        const dayStatus = bandData.day[0];
        const nightStatus = bandData.night[0];

        // Return relevant information
        return { dayStatus, nightStatus };
    } catch (error) {
        console.error('Error fetching solar data:', error);
        return null;
    }
}

// Discord command to display data in an embed
module.exports = {
    name: 'solar',
    description: 'Shows the conditions for the 80m-40m band during day and night',
    async execute(message, args) {
        const solarInfo = await getSolarData();

        if (!solarInfo) {
            return message.channel.send('Unable to fetch solar information.');
        }

        // Create the embed with the retrieved information
        const solarEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Conditions for the 80m-40m band')
            .addFields(
                { name: 'Day', value: solarInfo.dayStatus, inline: true },
                { name: 'Night', value: solarInfo.nightStatus, inline: true }
            )
            .setTimestamp()
            .setFooter('Data retrieved from hamqsl.com');

        // Send the embed to the channel
        message.channel.send({ embeds: [solarEmbed] });
    },
};
