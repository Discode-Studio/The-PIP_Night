const { EmbedBuilder } = require('discord.js');
const drmSchedule = require('../drm_schedule.json'); // Assurez-vous que le chemin est correct

// Fonction pour obtenir le prochain temps de diffusion
function getNextBroadcastTime(nextSchedule) {
    // Implémentez votre logique ici pour obtenir le temps de diffusion
    return new Date(); // Remplacez ceci par la logique réelle
}

function formatTimeDifference(nextBroadcastTime) {
    // Implémentez votre logique pour formater la différence de temps
    return 'in X hours'; // Remplacez ceci par la logique réelle
}

module.exports = {
    execute(message, args) {
        const language = args[0]?.toLowerCase();
        const supportedLanguages = ["german", "french", "english", "arabic", "italian", "spanish", "multi", "tamil", "chinese", "mandarin", "korean", "hindi", "balushi", "urdu"];

        if (!supportedLanguages.includes(language)) {
            message.channel.send(`There is no broadcast schedule available for "${language}".`);
            return;
        }

        const nextSchedule = drmSchedule.find(broadcast => broadcast.language.toLowerCase() === language);

        if (nextSchedule) {
            const nextBroadcastTime = getNextBroadcastTime(nextSchedule);
            const formattedTime = formatTimeDifference(nextBroadcastTime);

            const embed = new EmbedBuilder()
                .setColor(0x1E90FF)
                .setTitle(`Next broadcast in ${language.charAt(0).toUpperCase() + language.slice(1)}`)
                .addFields(
                    { name: 'Time (UTC/GMT)', value: `${nextSchedule.time}${formattedTime}`, inline: true },
                    { name: 'Broadcaster', value: nextSchedule.broadcaster, inline: true },
                    { name: 'Frequency', value: nextSchedule.frequency, inline: true },
                    { name: 'Target', value: nextSchedule.target, inline: true }
                )
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } else {
            message.channel.send(`There is no upcoming broadcast in ${language}.`);
        }
    }
};
