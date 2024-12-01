const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('receiver-list')
        .setDescription('Provides a list of receiver platforms with links.'),
    async execute(interaction) {
        const response = `**Receiver Platforms:**\n\n`
            + `**OpenWebRX:** https://www.receiverbook.de/\n`
            + `**WebSDR:** http://websdr.org/\n`
            + `**KiwiSDR:** http://kiwisdr.com/public/\n`
            + `**WebRX-888:** https://www.rx-888.com/web/rx.html\n`;

        await interaction.reply({ content: response, ephemeral: true });
    },
};
