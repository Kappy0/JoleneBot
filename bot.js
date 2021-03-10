const bot_settings = require("./botsettings.json");
const discord = require("discord.js");
const fetch = require("node-fetch"); //Used for Twitch API
const fs = module.require("fs"); //fs is Node.js's native file system module

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
		stream_list.users[i].announced = true;

		fs.writeFile("streams.json", JSON.stringify(stream_list, null, 4), err => {
							if(err) throw (err);
						});
	}

	bot.setInterval(() => {
		for(var i = 0; i < stream_list.users.length; i++)
		{
			let streamer = stream_list.users[i];

			fetch(stream_URL + streamer.username, {
				headers: api_headers,
			}).then(response => response.json())
			.then(body => {
				let data = body.data;

				if(data[0])
				{
					console.log("Got Twitch data!");
					if(!streamer.announced)
					{
						streamer.announced = true;

						let embed = new discord.MessageEmbed()
							//.setAuthor(`${data[0].user_name} is now live!`)
							.setDescription("https://twitch.tv/kappylp")
							.addField("Title", data[0].title)
							.addField("Game", data[0].game_name)
							//.setThumbnail(data[0].thumbnail_url)
							.setFooter("Started at " + data[0].started_at);

						let notif_channel = bot.channels.cache.get('556936544682901512');
						notif_channel.send(`@here ${data[0].user_name} is LIVE!`, {embed: embed});

						fs.writeFile("streams.json", JSON.stringify(stream_list, null, 4), err => {
							if(err) throw (err);
						});
					}
					else console.log("Stream has already been announced!");
				}
				else
				{
					console.log("No one's streaming");
					if(streamer.announced)
					{
						streamer.announced = false;

						fs.writeFile("streams.json", JSON.stringify(stream_list, null, 4), err => {
							if(err) throw (err);
						});
					}

					console.log("Checking status...");
					console.log(body);
				}
			}).catch((err) => console.log("Caught " + err.stack));
		}
	}, 60000);
});

bot.login(bot_settings.token);