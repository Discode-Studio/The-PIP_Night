const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lasco')
        .setDescription('Get the latest LASCO imagery from NOAA')
        .addStringOption(option =>
            option.setName('option')
                .setDescription('Choose the LASCO imagery type')
                .setRequired(true)
                .addChoices(
                    { name: 'C2', value: 'c2' },
                    { name: 'C3', value: 'c3' }
                ))
        .addBooleanOption(option =>
            option.setName('ephemeral')
                .setDescription('Display the message as ephemeral (default: false)')),

    async execute(interaction) {
        const option = interaction.options.getString('option');
        const ephemeral = interaction.options.getBoolean('ephemeral') ?? false;

        const imageUrl = option === 'c2'
            ? 'https://services.swpc.noaa.gov/images/animations/lasco-c2/latest.jpg'
            : 'https://services.swpc.noaa.gov/images/animations/lasco-c3/latest.jpg';

        const embed = new EmbedBuilder()
            .setTitle('LASCO Imagery')
            .setDescription(`Here is the latest LASCO-${option.toUpperCase()} imagery from NOAA.`)
            .setImage(imageUrl)
            .setFooter({ text: 'Data from NOAA Space Weather Prediction Center' });

        await interaction.reply({ embeds: [embed], ephemeral: ephemeral });
    }
};
