const bot_settings = require("./botsettings.json");
const discord = require("discord.js");
const fetch = require("node-fetch"); //Used for Twitch API

bot = new discord.Client();

//For grabbing Twitch API data
const stream_list = require("./streams.json");
const stream_URL = 'https://api.twitch.tv/helix/streams?user_id=';
const api_headers = {
	'Authorization':'Bearer '+ bot_settings.twitch_token,
	'Client-ID': bot_settings.client_id,
}

bot.once("ready", () => {
	console.log(`Bot is ready! ${bot.user.username}`);
	//console.log(Object.keys(stream_list.users).length);
	console.log(stream_list.users.length);
});

bot.on("ready", async() => {
	for(var i = 0; i < stream_list.users.length; i++)
	{
		console.log(stream_list.users[i].username);
	}
});

bot.login(bot_settings.token);