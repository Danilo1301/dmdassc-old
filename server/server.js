const express = require('express'), app = express(), path = require("path"), server = require('http').Server(app), io = require('socket.io')(server);

let __serverPath = path.join(__dirname, "../");

app.use(express.static(path.join(__serverPath, "/public/")));

//const discordbot = require('./discordbot'); discordbot.setServerPath(__serverPath); discordbot.createIoServer(io);
//const twitchbot = require('./twitchbot'); twitchbot.setServerPath(__serverPath); twitchbot.createIoServer(io);
const jogos = require('./jogos'); jogos.setServerPath(__serverPath);
const bots = require('./bots'); bots.setServerPath(__serverPath);
bots.createIoServer(io);

const cafemania_server = require('./cafemania_server');
cafemania_server.start(io);

require('./utils/local_env.js').defineEnvs();
require('./utils/ping.js').startPing();

app.get('/', function(req, res) {
  res.sendFile(`${__serverPath}/views/home.html`);
});

app.get(`/${process.env.GOOGLE_SITE_VERIFICATION}.html`, function(req, res) {
  res.send(`google-site-verification: ${process.env.GOOGLE_SITE_VERIFICATION}.html`);
})

//app.use('/discordbot', discordbot.router);
//app.use('/twitchbot', twitchbot.router);
app.use('/jogos', jogos.router);
app.use('/bots', bots.router);

app.get('*', function(req, res) {
  res.redirect("/");
})

server.listen(3000, function() {
  console.log('[web] Listening on port 3000...');

  bots.discord_bot.login(process.env.DISCORD_TOKEN);
  bots.twitch_bot.login(process.env.TWITCH_OAUTH);
  bots.steam_bot.login(process.env.STEAM_USERNAME, process.env.STEAM_PASSWORD, process.env.STEAM_SHARED_SECRET);
});

io.on('connection', function (socket) {
  console.log("[socket:home] New connection");
});
