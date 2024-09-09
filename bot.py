import discord
from discord.ext import commands
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import asyncio
import os
import re

# Bot Discord setup
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix='!', intents=intents)

# Spotify setup
SPOTIPY_CLIENT_ID = 'edf8299cab7d4f6fbb34d030cdd91a12'
SPOTIPY_CLIENT_SECRET = '6afde91c803b423f9f3051e2ae88018f'
sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(client_id=SPOTIPY_CLIENT_ID, client_secret=SPOTIPY_CLIENT_SECRET))

# Variables for playback
playlist_url = 'https://open.spotify.com/playlist/4Ma9iJLpfuN5OVHW46DL0e'
available_tracks = []

# Extract the playlist ID from URL
def extract_playlist_id(url):
    match = re.search(r'playlist/([^/?]+)', url)
    if match:
        return match.group(1)
    raise ValueError("Invalid Spotify playlist URL")

# Function to get tracks from Spotify playlist
def fetch_tracks_from_spotify(playlist_url):
    playlist_id = extract_playlist_id(playlist_url)
    playlist = sp.playlist_tracks(playlist_id)
    tracks = []
    for item in playlist['items']:
        track = item['track']
        preview_url = track['preview_url']
        if preview_url:
            tracks.append(preview_url)
    return tracks

# Initialize available tracks
available_tracks = fetch_tracks_from_spotify(playlist_url)

# Bot commands to control audio
@bot.event
async def on_ready():
    print(f'Logged in as {bot.user.name}')

    # Ensure we start playing the playlist in the first voice channel found
    for guild in bot.guilds:
        voice_channel = discord.utils.get(guild.voice_channels, name="On demand music")
        if voice_channel:
            if not guild.voice_client:
                await voice_channel.connect()
            await play_playlist(guild.voice_client)
            break

async def play_playlist(vc):
    while True:
        for track_url in available_tracks:
            if vc.is_playing():
                vc.stop()
            source = discord.FFmpegPCMAudio(track_url)
            vc.play(source)
            while vc.is_playing():
                await asyncio.sleep(1)
        # Repeat playlist
        await asyncio.sleep(1)

@bot.command()
async def join(ctx):
    if ctx.author.voice:
        channel = ctx.author.voice.channel
        if ctx.voice_client:
            await ctx.voice_client.move_to(channel)
        else:
            await channel.connect()
    else:
        await ctx.send("You are not connected to a voice channel.")

@bot.command()
async def leave(ctx):
    if ctx.voice_client:
        await ctx.voice_client.disconnect()

@bot.command()
async def play(ctx):
    if ctx.voice_client:
        await play_playlist(ctx.voice_client)
    else:
        await ctx.send("Bot is not connected to a voice channel.")

# Run the bot
bot.run(os.getenv('DISCORD_BOT_TOKEN'))
