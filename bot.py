import discord
from discord.ext import commands
from pytube import YouTube
import io
import os

# Configuration du bot Discord
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix='!', intents=intents)

# Fonction pour obtenir le flux audio d'une vidéo YouTube
def get_youtube_audio_stream(url):
    yt = YouTube(url)
    stream = yt.streams.filter(only_audio=True).first()
    return stream

# Commande pour jouer une vidéo YouTube
@bot.command()
async def play(ctx, url: str):
    if ctx.voice_client:
        await ctx.voice_client.disconnect()
    if ctx.author.voice:
        channel = ctx.author.voice.channel
        await channel.connect()
        stream = get_youtube_audio_stream(url)
        if stream:
            audio_file = io.BytesIO()
            stream.stream_to_buffer(audio_file)
            audio_file.seek(0)
            vc = ctx.voice_client
            source = discord.PCMVolumeTransformer(discord.File(audio_file))
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

bot.run(os.getenv('DISCORD_BOT_TOKEN'))
