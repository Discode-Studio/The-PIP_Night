const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hf_conditions')
        .setDescription('Fetches the current HF conditions from NOAA.'),

    async execute(interaction) {
        try {
            await interaction.deferReply(); // Indique que le bot traite la commande
            const response = await axios.get('https://services.swpc.noaa.gov/text/wwv.txt');
            const data = response.data;

            const embed = new EmbedBuilder()
                .setColor(0x1E90FF)
                .setTitle('Current HF conditions from NOAA')
                .setDescription(`\`\`\`${data}\`\`\``)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching HF conditions:', error);
            await interaction.editReply('Failed to fetch HF conditions. Please try again later.');
        }
    },
};
