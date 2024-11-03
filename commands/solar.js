const { EmbedBuilder, Colors } = require('discord.js');
const https = require('https');
const axios = require('axios');
const xml2js = require('xml2js');

async function getSolarData() {
    try {
        // Retrieve XML data from the URL
        const response = await axios.get('https://www.hamqsl.com/solarxml.php', {
            httpsAgent: new https.Agent({ rejectUnauthorized: false })
        });

        // Convert XML to JSON
        const jsonData = await xml2js.parseStringPromise(response.data);

        // Log to check the structure
        console.log("JSON Structure:", JSON.stringify(jsonData, null, 2));

        // Check the JSON structure
        if (!jsonData.solar || !jsonData.solar.solardata || !jsonData.solar.solardata[0].calculatedconditions) {
            console.error("The structure of the JSON data is incorrect.");
            return null;
        }

        // Initialize an object to store band conditions
        const solarConditions = {};

        // Access the calculated conditions
        const conditions = jsonData.solar.solardata[0].calculatedconditions[0].band;

        // Iterate over bands to extract data
        conditions.forEach(band => {
            const bandName = band.$.name;
            const bandTime = band.$.time;
            const bandData = band._;

            // Initialize the object for the band if needed
            if (!solarConditions[bandName]) {
                solarConditions[bandName] = { day: '', night: '' };
            }

            // Assign data according to time (day/night)
            if (bandTime === 'day') {
                solarConditions[bandName].day = bandData;
            } else if (bandTime === 'night') {
                solarConditions[bandName].night = bandData;
            }
        });

        return solarConditions;
    } catch (error) {
        console.error('Error retrieving solar data:', error);
        return null;
    }
}

module.exports = {
    async execute(message) {
        const solarInfo = await getSolarData();

        if (!solarInfo) {
            return message.channel.send("Unable to fetch solar information.");
        }

        const solarEmbed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle("Solar Conditions")
            .setTimestamp()
            .setFooter({ text: "Data retrieved from hamqsl.com" });

        // Add fields for each band
        for (const [bandName, conditions] of Object.entries(solarInfo)) {
            solarEmbed.addFields(
                { name: `${bandName} (Day)`, value: conditions.day || 'No data available', inline: true },
                { name: `${bandName} (Night)`, value: conditions.night || 'No data available', inline: true }
            );
        }

        message.channel.send({ embeds: [solarEmbed] });
    }
};
