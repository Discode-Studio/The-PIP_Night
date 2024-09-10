import discord
from discord.ext import commands
import wavelink
import os

# Définir les intents
intents = discord.Intents.default()
intents.message_content = True
intents.guilds = True
intents.guild_messages = True
intents.voice_states = True

# Configuration du bot avec les intents
bot = commands.Bot(command_prefix='!', intents=intents)

# Fonction de démarrage du bot
@bot.event
async def on_ready():
    print(f'Logged in as {bot.user.name}')
    bot.loop.create_task(connect_nodes())

# Connexion aux nodes Lavalink
async def connect_nodes():
    await bot.wait_until_ready()
    node = wavelink.Node(uri='http://localhost:2333', password='youshallnotpass')
    await wavelink.NodePool.connect(node)

# Commande pour rejoindre un canal vocal
@bot.command()
async def join(ctx):
    if ctx.author.voice:
        voice_channel = ctx.author.voice.channel
        vc = ctx.voice_client
        
        if not vc:
            await voice_channel.connect(cls=wavelink.Player)
            await ctx.send(f'Joined {voice_channel}!')
        else:
            await ctx.send("Already in a voice channel.")
    else:
        await ctx.send("You need to join a voice channel first.")

# Commande pour jouer une piste à partir d'un lien YouTube
@bot.command()
async def play(ctx, url: str):
    vc = ctx.voice_client
    if not vc:
        await ctx.send("Bot is not in a voice channel. Use !join to make the bot join a channel.")
        return
    
    # Charger et jouer une piste YouTube
    track = await wavelink.YouTubeTrack.search(query=url, return_first=True)

    # Lancer la piste dans le canal vocal
    await vc.play(track)
    await ctx.send(f'Now playing: {track.title}')

# Commande pour rechercher une piste YouTube
@bot.command()
async def search(ctx, *, query: str):
    vc = ctx.voice_client
    if not vc:
        await ctx.send("Bot is not in a voice channel. Use !join to make the bot join a channel.")
        return
    
    # Recherche des pistes YouTube
    results = await wavelink.YouTubeTrack.search(query=query)
    if results:
        track = results[0]  # Prendre la première piste trouvée
        await vc.play(track)
        await ctx.send(f'Now playing: {track.title}')
    else:
        await ctx.send("No results found.")

# Commande pour arrêter la musique
@bot.command()
async def stop(ctx):
    vc = ctx.voice_client
    if vc:
        await vc.disconnect()
        await ctx.send('Stopped and disconnected from the voice channel.')
    else:
        await ctx.send("I'm not connected to a voice channel.")

bot.run(os.getenv('DISCORD_BOT_TOKEN'))
