const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('utc')
        .setDescription('Get the current UTC time.'),
    async execute(interaction) {
        const currentUTC = new Date().toISOString().replace('T', ' ').split('.')[0];
        await interaction.reply(`🕒 Current UTC time: **${currentUTC}**`);
    },
};
