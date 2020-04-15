const express = require('express');
const app = express();
const path = require("path");
const server = require('http').Server(app);
const io = require('socket.io')(server);
const fs = require("fs");

const ping_logfile = "./pings.log";
const __serverPath = path.join(__dirname, "../");

require('./utils/local_env.js').defineEnvs();

const jogos = require('./jogos');
jogos.setServerPath(__serverPath);

const bots = require('./bots');
bots.setServerPath(__serverPath);
bots.createIoServer(io);

const cafemania_server = require('./cafemania_server');
cafemania_server.start(io);


app.use(express.static(path.join(__serverPath, "/public/")));
app.use('/jogos', jogos.router);
app.use('/bots', bots.router);


app.get('/', function(req, res) { res.sendFile(`${__serverPath}/views/home.html`); });
app.get('/chat', function(req, res) { res.sendFile(`${__serverPath}/views/chat.html`); });

app.get(`/${process.env.GOOGLE_SITE_VERIFICATION}.html`, function(req, res) { res.send(`google-site-verification: ${process.env.GOOGLE_SITE_VERIFICATION}.html`); })

app.all('/test', function(req, res) {
  console.log("[ping] /test");
  res.end("tested");
});

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




function fullDigits(n) {
  n = `${n}`;
  if(n.length > 1) { return n }
  return `0${n}`;
}

function getFullDate() {
  var p = new Date();
  return `${fullDigits(p.getDate())}/${fullDigits(p.getMonth()+1)}/${p.getUTCFullYear()} ${fullDigits(p.getHours())}:${fullDigits(p.getMinutes())}:${fullDigits(p.getSeconds())}`
}
