const Steam = require("steam");
const SteamTotp = require('steam-totp');

const BOT_TAG = "steam-bot";
const OWNER_ID = "76561198092596612";


var steamClient = new Steam.SteamClient();
var steamUser = new Steam.SteamUser(steamClient);
var steamFriends = new Steam.SteamFriends(steamClient);

class Server {
  static io;

  static create(_io) {
    var io = this.io = _io.of('/bots/steam');

    this.log("Server created!")

    io.on('connection', function (socket) {
      this.log("New connection")

      socket.on('get_status', function (fn) { fn(Bot.serializeStatus()) });
    });
  }

  static log(text) { console.log(`[${BOT_TAG}_socket] ${text}`); };
}

class Bot {
  static settings;
  static firstConnection;
  static setupCompleted = false;

  static auth_code = "";

  static login(username, password, shared_secret) {
    if(username != undefined) { this.settings = {username: username, password: password, shared_secret: shared_secret}; }

    this.setupListeners();

    steamClient.connect();
  }

  static getAuthCode(fake) {
    if(fake) { return SteamTotp.generateAuthCode(Math.random()*10000+"A"); }
    return this.auth_code = SteamTotp.generateAuthCode(this.settings.shared_secret); ;
  }

  static setupListeners() {
    if(this.setupCompleted) { return; }
    this.setupCompleted = true;

    var settings = this.settings;

    steamClient.on('connected', (function() {

      var code = this.getAuthCode();

      this.log("Trying to login");

      //return this.log("Login canceled!");

      steamUser.logOn({
        account_name: settings.username,
        password: settings.password,
        two_factor_code: code
      });
    }).bind(this));

    steamClient.on('error', (function(e) {
      this.log("Login failed");
      setTimeout(()=> {
        this.login();
      }, 30000);
    }).bind(this));

    steamFriends.on("friendMsg", function(steamID, message) {
      console.log("Friend message from " + steamID+ ": " + message);

      if (message == "Ping") {
        steamFriends.sendMessage(steamID, "Pong");
        console.log("Send back: Pong");
      } else {
        steamFriends.sendMessage(steamID, message);
        console.log("Send back the standard reply");
      }
    });

    steamClient.on('logOnResponse', function() {
      if(steamClient.loggedOn) {
        steamFriends.sendMessage(OWNER_ID, "I'm now online!");
      } else {

      }
    });
  }

  static serializeStatus() {
    var data = {oi: ":3"};
    return JSON.stringify(data);
  }

  static createServer(_io) { Server.create(_io); }

  static log(text) { console.log(`[${BOT_TAG}] ${text}`); };
}

module.exports = Bot;
