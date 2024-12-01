const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
const https = require('https');
const axios = require('axios');
const xml2js = require('xml2js');

// Fonction pour récupérer les données solaires
async function getSolarData() {
    try {
        const response = await axios.get('https://www.hamqsl.com/solarxml.php', {
            httpsAgent: new https.Agent({ rejectUnauthorized: false })
        });

        const jsonData = await xml2js.parseStringPromise(response.data);

        if (!jsonData.solar || !jsonData.solar.solardata || !jsonData.solar.solardata[0].calculatedconditions) {
            console.error("Structure JSON invalide.");
            return null;
        }

        const solarConditions = {};

        const conditions = jsonData.solar.solardata[0].calculatedconditions[0].band;

        conditions.forEach(band => {
            const bandName = band.$.name;
            const bandTime = band.$.time;
            const bandData = band._;

            if (!solarConditions[bandName]) {
                solarConditions[bandName] = { day: 'No data', night: 'No data' };
            }

            if (bandTime === 'day') {
                solarConditions[bandName].day = bandData || 'No data';
            } else if (bandTime === 'night') {
                solarConditions[bandName].night = bandData || 'No data';
            }
        });

        return solarConditions;
    } catch (error) {
        console.error('Erreur lors de la récupération des données solaires :', error.message);
        return null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('solar')
        .setDescription('Get the current solar band conditions.')
        .addBooleanOption(option =>
            option
                .setName('ephemeral')
                .setDescription('Whether the reply should be visible only to you.')
        ),

    async execute(interaction) {
        const ephemeral = interaction.options.getBoolean('ephemeral') ?? false;

        await interaction.deferReply({ ephemeral });

        const solarInfo = await getSolarData();

        if (!solarInfo) {
            return interaction.editReply("❌ Unable to fetch solar information. Please try again later.");
        }

        const solarEmbed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle("☀️ Current Solar Band Conditions")
            .setTimestamp()
            .setFooter({ text: "Data retrieved from hamqsl.com" });

        for (const [bandName, conditions] of Object.entries(solarInfo)) {
            solarEmbed.addFields(
                { name: `${bandName} (Day)`, value: conditions.day, inline: true },
                { name: `${bandName} (Night)`, value: conditions.night, inline: true }
            );
        }

        await interaction.editReply({ embeds: [solarEmbed] });
    },
};
