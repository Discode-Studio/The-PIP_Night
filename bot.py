import discord
from discord.ext import commands
import youtube_dl
import os

# Configuration du bot Discord
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix='!', intents=intents)

# Configurations de youtube-dl pour obtenir le flux audio
ydl_opts = {
    'format': 'bestaudio/best',
    'noplaylist': True,
    'quiet': True,
    'outtmpl': '%(id)s.%(ext)s',
    'postprocessors': [{
        'key': 'FFmpegExtractAudio',
        'preferredcodec': 'mp3',
        'preferredquality': '192',
    }],
    'postprocessor_args': [
        '-ar', '16000'
    ],
    'prefer_ffmpeg': True,
}

# Fonction pour obtenir l'URL du flux audio à partir d'une URL YouTube
def get_youtube_audio_url(url):
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
        return info['formats'][0]['url']

# Commande pour jouer une vidéo YouTube
@bot.command()
async def play(ctx, url: str):
    if ctx.voice_client:
        await ctx.voice_client.disconnect()
    if ctx.author.voice:
        channel = ctx.author.voice.channel
        await channel.connect()
        audio_url = get_youtube_audio_url(url)
        if audio_url:
            vc = ctx.voice_client
            source = discord.FFmpegPCMAudio(audio_url)
            vc.play(source)
            await ctx.send(f'Playing video from {url}')
        else:
            await ctx.send('Error fetching audio from YouTube')
    else:
        await ctx.send("You are not connected to a voice channel.")

# Commande pour arrêter la lecture
@bot.command()
async def stop(ctx):
    if ctx.voice_client:
        ctx.voice_client.stop()
        await ctx.send('Playback stopped')
    else:
        await ctx.send("Bot is not connected to a voice channel.")

# Commande pour quitter le canal vocal
@bot.command()
async def leave(ctx):
    if ctx.voice_client:
        await ctx.voice_client.disconnect()
        await ctx.send('Disconnected from voice channel')
    else:
        await ctx.send("Bot is not connected to a voice channel.")
# Run the bot
bot.run(os.getenv('DISCORD_BOT_TOKEN'))
