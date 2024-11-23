const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
const https = require('https');
const axios = require('axios');
const xml2js = require('xml2js');

// Fonction pour récupérer les données solaires
async function getSolarData() {
    try {
        // Récupérer les données XML depuis l'URL
        const response = await axios.get('https://www.hamqsl.com/solarxml.php', {
            httpsAgent: new https.Agent({ rejectUnauthorized: false })
        });

        // Convertir le XML en JSON
        const jsonData = await xml2js.parseStringPromise(response.data);

        // Vérifier la structure du JSON
        if (!jsonData.solar || !jsonData.solar.solardata || !jsonData.solar.solardata[0].calculatedconditions) {
            console.error("La structure des données JSON est incorrecte.");
            return null;
        }

        // Initialiser un objet pour stocker les conditions
        const solarConditions = {};

        // Accéder aux conditions calculées
        const conditions = jsonData.solar.solardata[0].calculatedconditions[0].band;

        // Extraire les données pour chaque bande
        conditions.forEach(band => {
            const bandName = band.$.name;
            const bandTime = band.$.time;
            const bandData = band._;

            // Initialiser les données pour la bande si nécessaire
            if (!solarConditions[bandName]) {
                solarConditions[bandName] = { day: '', night: '' };
            }

            // Attribuer les données en fonction du moment (jour/nuit)
            if (bandTime === 'day') {
                solarConditions[bandName].day = bandData;
            } else if (bandTime === 'night') {
                solarConditions[bandName].night = bandData;
            }
        });

        return solarConditions;
    } catch (error) {
        console.error('Erreur lors de la récupération des données solaires :', error);
        return null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('solar')
        .setDescription('Get the current solar band conditions.'),

    async execute(interaction) {
        await interaction.deferReply(); // Permet de traiter les données longues

        const solarInfo = await getSolarData();

        if (!solarInfo) {
            return interaction.editReply("❌ Unable to fetch solar information.");
        }

        const solarEmbed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle("☀️ Solar Conditions")
            .setTimestamp()
            .setFooter({ text: "Data retrieved from hamqsl.com" });

        // Ajouter les informations pour chaque bande
        for (const [bandName, conditions] of Object.entries(solarInfo)) {
            solarEmbed.addFields(
                { name: `${bandName} (Day)`, value: conditions.day || 'No data available', inline: true },
                { name: `${bandName} (Night)`, value: conditions.night || 'No data available', inline: true }
            );
        }

        await interaction.editReply({ embeds: [solarEmbed] });
    },
};
