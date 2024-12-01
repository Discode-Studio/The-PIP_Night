const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('receiver-list')
        .setDescription('Provides a list of receiver platforms with links.')
        .addBooleanOption(option =>
            option
                .setName('ephemeral')
                .setDescription('Whether the response should be ephemeral (visible only to you).')
        ),
    async execute(interaction) {
        const response = `**Receiver Platforms:**\n\n`
            + `**OpenWebRX:** https://www.receiverbook.de/\n`
            + `**WebSDR:** http://websdr.org/\n`
            + `**KiwiSDR:** http://kiwisdr.com/public/\n`
            + `**WebRX-888:** https://www.rx-888.com/web/rx.html\n`;

        // Récupération de l'option "ephemeral" avec une valeur par défaut (false)
        const isEphemeral = interaction.options.getBoolean('ephemeral') ?? false;

        await interaction.reply({ content: response, ephemeral: isEphemeral });
    },
};
