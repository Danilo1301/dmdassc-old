const express = require('express'), router = express.Router();
const correctPath = require('../utils/correctPath.js');

const discord_bot = require("./discord_bot.js");
const twitch_bot = require("./twitch_bot.js");
const steam_bot = require("./steam_bot.js");

let __serverPath = "/";

router.use(express.urlencoded());

router.get('/', function(req, res) {
  if(correctPath.fix(req, res)) { return; };

  res.sendFile(`${__serverPath}/views/bots.html`);
})

router.get('/twitch', function(req, res) {
  if(correctPath.fix(req, res)) { return; };

  res.sendFile(`${__serverPath}/views/bots/twitch.html`);
});

router.get('/discord', function(req, res) {
  if(correctPath.fix(req, res)) { return; };

  res.sendFile(`${__serverPath}/views/bots/discord.html`);
});

router.get('/steam', function(req, res) {
  if(correctPath.fix(req, res)) { return; };

  res.sendFile(`${__serverPath}/views/bots/steam.html`);
});

router.post('/steam/code', function(req, res) {
  if(correctPath.fix(req, res)) { return; };

  if(req.body.password == process.env.MASTER_PASSWORD) {
    return res.send(steam_bot.getAuthCode());
  }
  return res.send(steam_bot.getAuthCode(true));
});

router.post('/discord/toggle', function(req, res) {
  if(correctPath.fix(req, res)) { return; };

  if(req.body.password == process.env.MASTER_PASSWORD) {
    if(discord_bot.status.state != 0) {
      discord_bot.stop()
    } else {
      discord_bot.login()
    }
  } else {
    discord_bot.login()
    console.log(`[WARNING] Someone tried to toggle bot with password: '${req.body.password}'`);
  }

  res.redirect("/bots/discord");
});

const createIoServer = function(_io) {
  discord_bot.createServer(_io);
  twitch_bot.createServer(_io);
  steam_bot.createServer(_io);
}

module.exports.router = router;
module.exports.createIoServer = createIoServer;
module.exports.discord_bot = discord_bot;
module.exports.twitch_bot = twitch_bot;
module.exports.steam_bot = steam_bot;
module.exports.setServerPath = function(newPath) { __serverPath = newPath; };
