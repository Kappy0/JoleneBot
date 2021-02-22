const bot_settings = require("./botsettings.json");
const discord = require("discord.js");
const fetch = require("node-fetch"); //Used for Twitch API

bot = new discord.Client();

//For grabbing Twitch API data
const stream_list = require("./streams.json");
const stream_URL = 'https://api.twitch.tv/helix/streams?user_id=';
const api_headers = {
	'Authorization':'Bearer '+ bot_settings.twitch_token,
	'Client-ID':'hvkh2ps0jcndeha05urm1uy4j0nu5k',
}

bot.once("ready", () => {
	console.log(`Bot is ready! ${bot.user.username}`);
});

bot.on("ready", async() => {
	console.log(stream_list);
});

bot.login(bot_settings.token);