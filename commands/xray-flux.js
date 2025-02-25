const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('xray_flux')
        .setDescription('Get the latest X-ray flux absorption maps from NOAA')
        .addStringOption(option =>
            option.setName('frequency_range')
                .setDescription('Select the frequency range and region')
                .setRequired(true)
                .addChoices(
                    { name: '5 MHz - Global', value: 'https://services.swpc.noaa.gov/images/drap_f05_global.png' },
                    { name: '5 MHz - North', value: 'https://services.swpc.noaa.gov/images/drap_f05_n-pole.png' },
                    { name: '5 MHz - South', value: 'https://services.swpc.noaa.gov/images/drap_f05_s-pole.png' },
                    { name: '10 MHz - Global', value: 'https://services.swpc.noaa.gov/images/drap_f10_global.png' },
                    { name: '10 MHz - North', value: 'https://services.swpc.noaa.gov/images/drap_f10_n-pole.png' },
                    { name: '10 MHz - South', value: 'https://services.swpc.noaa.gov/images/drap_f10_s-pole.png' },
                    { name: '15 MHz - Global', value: 'https://services.swpc.noaa.gov/images/drap_f15_global.png' },
                    { name: '15 MHz - North', value: 'https://services.swpc.noaa.gov/images/drap_f15_n-pole.png' },
                    { name: '15 MHz - South', value: 'https://services.swpc.noaa.gov/images/drap_f15_s-pole.png' },
                    { name: '20 MHz - Global', value: 'https://services.swpc.noaa.gov/images/drap_f20_global.png' },
                    { name: '20 MHz - North', value: 'https://services.swpc.noaa.gov/images/drap_f20_n-pole.png' },
                    { name: '20 MHz - South', value: 'https://services.swpc.noaa.gov/images/drap_f20_s-pole.png' },
                    { name: '25 MHz - Global', value: 'https://services.swpc.noaa.gov/images/drap_f25_global.png' },
                    { name: '25 MHz - North', value: 'https://services.swpc.noaa.gov/images/drap_f25_n-pole.png' },
                    { name: '25 MHz - South', value: 'https://services.swpc.noaa.gov/images/drap_f25_s-pole.png' },
                    { name: '30 MHz - Global', value: 'https://services.swpc.noaa.gov/images/drap_f30_global.png' },
                    { name: '30 MHz - North', value: 'https://services.swpc.noaa.gov/images/drap_f30_n-pole.png' },
                    { name: '30 MHz - South', value: 'https://services.swpc.noaa.gov/images/drap_f30_s-pole.png' }
                ))
        .addBooleanOption(option =>
            option.setName('ephemeral')
                .setDescription('Display the message as ephemeral (default: false)')),

    async execute(interaction) {
        const imageUrl = interaction.options.getString('frequency_range');
        const ephemeral = interaction.options.getBoolean('ephemeral') ?? false;

        const embed = new EmbedBuilder()
            .setTitle('X-ray Flux Absorption')
            .setDescription('Here is the latest NOAA X-ray flux absorption map.')
            .setImage(imageUrl)
            .setFooter({ text: 'Data from NOAA Space Weather Prediction Center' });

        await interaction.reply({ embeds: [embed], ephemeral: ephemeral });
    }
};
