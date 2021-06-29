const discord = require("discord.js");
const fetch = require("node-fetch"); //Used for Twitch API
const fs = module.require("fs"); //fs is Node.js's native file system module

bot = new discord.Client();

//Utilities
const dateUtils = require('./date.js');
const logUtils = require('./logger.js');
const fileUtils = require('./file.js');
const apiUtils = require('./api.js');

//Settings
const bot_settings = require("./botsettings.json");
let api_settings = fileUtils.readSync('./apisettings.json');

//For grabbing Twitch API data
const stream_list = require("./streams.json");
const stream_URL = 'https://api.twitch.tv/helix/streams?user_login=';
let api_headers = {
	'Authorization':'Bearer '+ bot_settings.twitch_token,
	'Client-ID': bot_settings.client_id,
}

//Twitch Game IDs for Paper Mario 64, Paper Mario: The Thousand-Year Door, and Bug Fables
let pm64 = 18231;
let ttyd = 6855;
let bf = 511735;

//ID for the "Challenge Run" tag on Twitch
let challenge_run_tag = "81df4005-f654-40b2-9fc0-9fd767bc8e3e";

//Logging channel for bot on Discord itself
//let log_notif_channel = bot.channels.cache.get('276480687266332672');
let log_notif_channel = bot.channels.cache.get('856929671072841792'); //Test Channel

bot.once("ready", () => {
	console.log(`Bot is ready! ${bot.user.username}`);
	//console.log(bot.commands);

	for(var i = 0; i < stream_list.users.length; i++)
	{
		stream_list.users[i].announced = false;

		fileUtils.writeAsync("streams.json", stream_list);
	}

	logUtils.logger.log("[" + dateUtils.cen_time(new Date()).toISOString() + "] " + "Another log file test");
});

bot.on("ready", async() => {
	//let stream_notif_channel = bot.channels.cache.get('197417548294258688');
	let stream_notif_channel = bot.channels.cache.get('556936544682901512'); //Test Channel

	//Logging channel for bot on Discord itself
	//const log_notif_channel = bot.channels.cache.get('356828089327550485');
	const log_notif_channel = bot.channels.cache.get('856929671072841792'); //Test Channel

	let token_changed = false;

	bot.setInterval(() => {
		if(token_changed)
		{
			//refresh token params
			api_settings = fileUtils.readSync('./apisettings.json');

			api_headers = {
				//'Authorization':'Bearer '+ api_settings.twitch_token,
				'Authorization':'Bearer '+ api_settings.test,
				'Client-ID': api_settings.client_id,
			}

			token_changed = false;
		}

		for(var i = 0; i < stream_list.users.length; i++)
		{
			let streamer = stream_list.users[i];

			fetch(stream_URL + streamer.username, {
				headers: api_headers,
			})
			.then(res => apiUtils.twitch_api_status(res))
			.then(response => response.json())
			.then(body => {
				let data = body.data;

				if(data[0] !== undefined)
				{
					console.log("Got Twitch data!");
					if(true)
					//if(data[0].game_id === pm64 || data[0].game_id === ttyd || data[0].game_id === bf)
					{
						console.log("Found a valid game to announce!");
						if(!streamer.announced)
						{
							streamer.announced = true;

							let embed = new discord.MessageEmbed()
								//.setAuthor(streamer.username + " is now live!")
								.setAuthor(data[0].game_id)
								.setDescription("https://twitch.tv/" + streamer.username)
								.setTitle(data[0].title)
								.addField("Game", data[0].game_name)
								//.addField("Tags", data[0].tag_ids)
								//.setThumbnail(data[0].thumbnail_url)
								.setFooter("Started at " + data[0].started_at);

							stream_notif_channel.send(`@here ${data[0].user_name} is LIVE!`, {embed: embed});

							fileUtils.writeSync("streams.json", stream_list);
						}
					}
				}
				else
				{
					if(streamer.announced)
					{
						streamer.announced = false;

						fileUtils.writeSync("streams.json", stream_list);
						/*fs.writeFile("streams.json", JSON.stringify(stream_list, null, 4), err => {
							if(err) logger.log("[" + date(new Date()).toISOString() + "] " + err);
						});*/
					}

					//console.log("Checking status...");
					//console.log(body);
				}
			}).catch((err) => {
				log_notif_channel.send("Error accessing Twitch API.");
				logUtils.logger.log("[" + dateUtils.cen_time(new Date()).toISOString() + "] " + "Caught " + err.stack)

				token_changed = true;
			});
		}
	}, 60000);
});

bot.on("guildMemberAdd", async member => {
	//let join_notif_channel = bot.channels.cache.get('349563157561212928');
	let join_notif_channel = bot.channels.cache.get('836233040715841557'); //Test Channel

	join_notif_channel.send(`Welcome to the Glitz Pit, ${member.user}! Try not to get destroyed out there.`);
});

bot.login(bot_settings.token);