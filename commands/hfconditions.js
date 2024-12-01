const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('conditions')
        .setDescription('Fetches the current HF conditions from NOAA.')
        .addBooleanOption(option =>
            option
                .setName('ephemeral')
                .setDescription('Whether the response should be ephemeral (visible only to you).')
        ),
    async execute(interaction) {
        try {
            // Récupération de l'option 'ephemeral' (par défaut : false)
            const isEphemeral = interaction.options.getBoolean('ephemeral') ?? false;

            // Début de la réponse différée
            await interaction.deferReply({ ephemeral: isEphemeral });

            // Récupération des données depuis NOAA
            const response = await axios.get('https://services.swpc.noaa.gov/text/wwv.txt');
            const data = response.data;

            // Création de l'embed
            const embed = new EmbedBuilder()
                .setColor(0x1E90FF)
                .setTitle('Current HF Conditions from NOAA')
                .setDescription(`\`\`\`${data}\`\`\``)
                .setTimestamp();

            // Envoi de la réponse avec l'embed
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching HF conditions:', error);

            // Réponse en cas d'erreur
            await interaction.editReply({ 
                content: 'Failed to fetch HF conditions. Please try again later.', 
                ephemeral: isEphemeral 
            });
        }
    },
};
