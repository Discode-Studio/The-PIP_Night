import discord
from discord.ext import commands
import yt_dlp
import os

# Définir les intents
intents = discord.Intents.default()
intents.message_content = True
intents.guilds = True
intents.guild_messages = True
intents.voice_states = True

# Configuration du bot avec les intents
bot = commands.Bot(command_prefix='!', intents=intents)

# Fonction pour obtenir l'URL du flux audio de YouTube
def get_youtube_audio_url(url):
    ydl_opts = {
        'format': 'bestaudio/best',
        'noplaylist': True,
        'quiet': True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
        return info['formats'][0]['url']

# Commande pour jouer la musique
@bot.command()
async def play(ctx, url):
    if ctx.author.voice:
        voice_channel = ctx.author.voice.channel
        if ctx.voice_client is None:
            vc = await voice_channel.connect()
        else:
            vc = ctx.voice_client

        audio_url = get_youtube_audio_url(url)
        if not vc.is_playing():
            vc.play(discord.FFmpegPCMAudio(audio_url), after=lambda e: print('Player error: %s' % e) if e else None)
            await ctx.send(f'Now playing: {url}')
        else:
            await ctx.send('Already playing audio.')
    else:
        await ctx.send("You are not connected to a voice channel.")

# Commande pour arrêter la musique
@bot.command()
async def stop(ctx):
    if ctx.voice_client:
        await ctx.voice_client.disconnect()
        await ctx.send('Stopped and disconnected from voice channel.')
    else:
        await ctx.send("I'm not connected to a voice channel.")

bot.run(os.getenv('DISCORD_BOT_TOKEN'))
