const Discord = require('discord.js');

class Server {
  static io;

  static create(_io) {
    var io = this.io = _io.of('/bots/discord');

    console.log("[socket:bots:discord] Server created!")

    io.on('connection', function (socket) {
      console.log("[socket:bots:discord] New connection");

      socket.on('get_status', function (fn) {
        fn(Bot.serializeStatus())
      });
    });
  }
}

class Bot {
  static token = undefined;
  static client = undefined;
  static tag = "[discord-bot]";
  static status = {state: 0, startTime: null};

  static login(token) {
    if(this.status.state != 0) { return false; }

    this.token = token = token || this.token;
    this.status.state = 1;

    this.log("Initializating...");

    this.client = new Discord.Client();
    this.client.login(token).then(this.onLogin.bind(this)).catch(console.error);
    this.client.on('ready', this.onReady.bind(this));
    this.client.on('message', this.onMessage.bind(this));
    return true;
  }

  static onLogin(token) {
    //Ctz que n vo usar isso
  }

  static onReady(e) {
    this.log("Ready!");
    this.status.state = 2;
    this.status.startTime = Date.now();

    setInterval(()=>{
      if(this.status.state != 2) { return; }
      if(this.client.user.presence.status != "invisible") { this.client.user.setStatus('invisible').then(()=>{ this.log("Status set to 'invisible'") }).catch(console.error); }
    },10);
  }

  static onMessage(msg) {
    if(msg.author.id == this.client.user.id) { return; }

    this.log(`Message from '${msg.author.username}': '${msg.content}'`);

    if(msg.content == "stop") { return this.stop(); }
    if(msg.content == "status") { return msg.channel.send(this.serializeStatus()); }

    msg.channel.send(msg.content);
  }

  static stop() {
    if(this.status.state != 2) { return false; }

    this.log("Stopped!");

    this.client.destroy();
    this.client = undefined;
    this.status.state = 0;
    return true;
  }

  static log(text) {
    console.log(this.tag + " " + text);
  }

  static serializeStatus() {
    return JSON.stringify({
      state: this.status.state,
      startTime: (this.status.state != 2 ? null : this.status.startTime),
      uptime: (this.status.state != 2 ? null : Date.now() - this.status.startTime)
    });
  }

  static createServer(_io) {
    Server.create(_io);
  }
}

module.exports = Bot;
