// Commande pour UTC
function getCurrentUTC() {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace('T', ' ');
}

module.exports = {
    execute(message) {
        const utcTime = getCurrentUTC();
        message.channel.send(`The current UTC time is: ${utcTime}`);
    }
};
