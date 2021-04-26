const bot_settings = require("./botsettings.json");
const discord = require("discord.js");
const fetch = require("node-fetch"); //Used for Twitch API
const fs = module.require("fs"); //fs is Node.js's native file system module

bot = new discord.Client();

//For grabbing Twitch API data
const stream_list = require("./streams.json");
const stream_URL = 'https://api.twitch.tv/helix/streams?user_login=';
const api_headers = {
	'Authorization':'Bearer '+ bot_settings.twitch_token,
	'Client-ID': bot_settings.client_id,
}

//Quick function to produce a date in my local CST timezone
let date = date => new Date(date.getTime() - date.getTimezoneOffset()*60000); 

//Logging output
const log_output = fs.createWriteStream('./logs/jolene-log.txt',{flags: 'a'});
const logger = new console.Console(log_output);

bot.once("ready", () => {
	console.log(`Bot is ready! ${bot.user.username}`);
	//console.log(bot.commands);

	logger.log("[" + date(new Date()).toISOString() + "] " + "Another log file test");
});

bot.on("ready", async() => {
	for(var i = 0; i < stream_list.users.length; i++)
	{
		//console.log(stream_list.users[i].username);
		stream_list.users[i].announced = false;

		fs.writeFile("streams.json", JSON.stringify(stream_list, null, 4), err => {
			if(err) logger.log("[" + date(new Date()).toISOString() + "] " + err);
		});
	}

	let stream_notif_channel = bot.channels.cache.get('556936544682901512');

	bot.setInterval(() => {
		for(var i = 0; i < stream_list.users.length; i++)
		{
			let streamer = stream_list.users[i];

			fetch(stream_URL + streamer.username, {
				headers: api_headers,
			}).then(response => response.json())
			.then(body => {
				let data = body.data;

				if(data[0] !== undefined)
				{
					console.log("Got Twitch data!");
					if(!streamer.announced)
					{
						streamer.announced = true;

						let embed = new discord.MessageEmbed()
							.setAuthor(streamer.username + " is now live!")
							.setDescription("https://twitch.tv/" + streamer.username)
							.setTitle(data[0].title)
							.addField("Game", data[0].game_name)
							//.setThumbnail(data[0].thumbnail_url)
							.setFooter("Started at " + data[0].started_at);

						stream_notif_channel.send(`@here ${data[0].user_name} is LIVE!`, {embed: embed});

						fs.writeFile("streams.json", JSON.stringify(stream_list, null, 4), err => {
							if(err) throw (err);
						});
					}
					//else console.log("Stream has already been announced!");
				}
				else
				{
					//console.log("No one's streaming");
					if(streamer.announced)
					{
						streamer.announced = false;

						fs.writeFile("streams.json", JSON.stringify(stream_list, null, 4), err => {
							if(err) throw (err);
						});
					}

					//console.log("Checking status...");
					//console.log(body);
				}
			}).catch((err) => logger.log("[" + date(new Date()).toISOString() + "] " + "Caught " + err.stack));
		}
	}, 60000);
});

bot.on("guildMemberAdd", async member => {
	let join_notif_channel = bot.channels.cache.get('836233040715841557');

	join_notif_channel.send(`Welcome to the Glitz Pit, ${member.user}! Try not to get destroyed out there.`);
});

bot.login(bot_settings.token);