const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('aurora_forecast')
        .setDescription('Get the latest aurora forecast from NOAA')
        .addStringOption(option =>
            option.setName('location')
                .setDescription('Choose the hemisphere')
                .setRequired(true)
                .addChoices(
                    { name: 'North', value: 'north' },
                    { name: 'South', value: 'south' }
                ))
        .addBooleanOption(option =>
            option.setName('ephemeral')
                .setDescription('Display the message as ephemeral')
                .setRequired(true)),

    async execute(interaction) {
        const location = interaction.options.getString('location');
        const ephemeral = interaction.options.getBoolean('ephemeral');

        const imageUrl = location === 'north'
            ? 'https://services.swpc.noaa.gov/images/animations/ovation/north/latest.jpg'
            : 'https://services.swpc.noaa.gov/images/animations/ovation/south/latest.jpg';

        const embed = new EmbedBuilder()
            .setTitle('Aurora Forecast')
            .setDescription(`Here is the latest ${location === 'north' ? 'Northern' : 'Southern'} Hemisphere aurora forecast.`)
            .setImage(imageUrl)
            .setFooter({ text: 'Data from NOAA Space Weather Prediction Center' });

        await interaction.reply({ embeds: [embed], ephemeral: ephemeral });
    }
};
