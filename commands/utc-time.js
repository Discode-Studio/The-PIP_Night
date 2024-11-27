const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('utc-time')
        .setDescription('Displays the current time in UTC with an optional offset..')
        .addIntegerOption(option =>
            option
                .setName('offset')
                .setDescription('Time offset from UTC (example: -3 or 2).')
                .setRequired(false)
        ),
    async execute(interaction) {
        const offset = interaction.options.getInteger('offset') || 0; // Par défaut, UTC
        const now = new Date();
        
        // Calcule l'heure avec le décalage
        const utcTime = new Date(now.getTime() + offset * 60 * 60 * 1000);
        const formattedTime = utcTime.toISOString().replace('T', ' ').substring(0, 19); // Format simplifié

        await interaction.reply(`🕒 The current time is : **${formattedTime} UTC${offset >= 0 ? `+${offset}` : offset}**`);
    },
};
