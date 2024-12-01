const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const drmSchedule = require('../drm_schedule.json'); // Assurez-vous que le chemin est correct

// Fonction pour obtenir le prochain temps de diffusion
function getNextBroadcastTime(nextSchedule) {
    const [hour, minute] = nextSchedule.time.split(':').map(Number);
    const nextBroadcast = new Date();
    nextBroadcast.setUTCHours(hour, minute, 0, 0);

    if (nextBroadcast < new Date()) {
        nextBroadcast.setUTCDate(nextBroadcast.getUTCDate() + 1); // Diffusion le lendemain
    }
    return nextBroadcast;
}

// Fonction pour formater la différence de temps
function formatTimeDifference(nextBroadcastTime) {
    const now = new Date();
    const diffMs = nextBroadcastTime - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours} hours and ${diffMinutes} minutes`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('drm')
        .setDescription('Get the next DRM broadcast schedule for a specific language.')
        .addStringOption(option =>
            option
                .setName('language')
                .setDescription('Language of the broadcast (e.g., english, french, etc.)')
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option
                .setName('ephemeral')
                .setDescription('Whether the response should be ephemeral (visible only to you).')
        ),

    async execute(interaction) {
        const language = interaction.options.getString('language').toLowerCase();
        const isEphemeral = interaction.options.getBoolean('ephemeral') ?? false;

        const supportedLanguages = [
            "german", "french", "english", "arabic", "italian", 
            "spanish", "multi", "tamil", "chinese", "mandarin", 
            "korean", "hindi", "balushi", "urdu"
        ];

        if (!supportedLanguages.includes(language)) {
            await interaction.reply({ 
                content: `❌ There is no broadcast schedule available for "${language}".`, 
                ephemeral: isEphemeral 
            });
            return;
        }

        const nextSchedule = drmSchedule.find(
            broadcast => broadcast.language.toLowerCase() === language
        );

        if (nextSchedule) {
            const nextBroadcastTime = getNextBroadcastTime(nextSchedule);
            const formattedTime = formatTimeDifference(nextBroadcastTime);

            const embed = new EmbedBuilder()
                .setColor(0x1E90FF)
                .setTitle(`📡 Next broadcast in ${language.charAt(0).toUpperCase() + language.slice(1)}`)
                .addFields(
                    { name: 'Time (UTC/GMT)', value: `${nextSchedule.time} (${formattedTime})`, inline: true },
                    { name: 'Broadcaster', value: nextSchedule.broadcaster, inline: true },
                    { name: 'Frequency', value: nextSchedule.frequency, inline: true },
                    { name: 'Target', value: nextSchedule.target, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: isEphemeral });
        } else {
            await interaction.reply({ 
                content: `❌ There is no upcoming broadcast in "${language}".`, 
                ephemeral: isEphemeral 
            });
        }
    },
};
