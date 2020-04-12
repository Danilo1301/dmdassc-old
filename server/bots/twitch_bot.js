const tmi = require('tmi.js');
const username = "botzin_dahora";
const fs = require('fs');
const file_data = "./.data/twitchbot_questions.json";

const channels = {askOn: "danilom1301", others: ["botzin_dahora"]}

class Server {
  static io;

  static create(_io) {
    var io = this.io = _io.of('/bots/twitch');

    console.log("[socket:bots:twitch] Server created!")

    io.on('connection', function (socket) {
      console.log("[socket:bots:twitch] New connection");

      socket.on('get_status', function (fn) {
        fn(Bot.serializeStatus())
      });
    });
  }
}

class Questions {
  static client = undefined;
  static bot = undefined;

  static quest = {
    num1: null,
    num2: null,
    answer: null
  }

  static users = {};

  static usersCorrect = [];

  static setup(bot) {
    this.client = bot.client;
    this.bot = bot;

    this.client.on('message', this.onMessage.bind(this));

    if(fs.existsSync(file_data)) {
      var data = JSON.parse(fs.readFileSync(file_data, "utf8"));
      for (var name in data) {
        this.users[name] = new QUser(name, data[name].points);
      }
    } else {
      this.saveData();
    }

    this.client.join(channels.askOn).then((data) => {
      setTimeout(()=> {
        this.askQuestion();
      },5*1000)


    }).catch(console.error);

  }

  static getUserPosInRank(user) {
    var rank = [];

    for (var u in this.users) {
      rank.push(this.users[u]);
    }

    rank = rank.sort(function(a, b){return b.points - a.points});

    for (var u in this.users) {
      this.users[u].rank = rank.indexOf(this.users[u])+1;
    }

    return user.rank;
  }

  static onMessage(channel, userstate, msg, self) {

    if(channel.indexOf(channels.askOn) == -1) { return; };

    if(msg.startsWith("!")) {
      let cmd = new ChatCommand(msg);


      if(cmd.getCmd() == "parar") {
        this.stopped = true;
      }

      if(cmd.getCmd() == "iniciar") {
        this.stopped = false;
        this.askQuestion();
      }

      if(cmd.getCmd() == "resetranks") {
        var n = 0;
        for (var username in this.users) {
          this.users[username].points = 0;
          n++;
        }
        this.bot.sendChat(channels.askOn, `Todos os ${n} Ranks foram resetados!`);
      }

      if(cmd.getCmd() == "user") {
        var user = cmd.getArg(0);
        var message = cmd.getText(1);

        this.onMessage(channels.askOn, {"message-type": "chat", "username": user}, message, false);
      }
    }

    if(self) { return; }

    if(this.quest.answer != undefined) {
      if(msg.split(" ").includes(`${this.quest.answer}`)) {

        userstate["username"] = userstate["username"].toLowerCase();

        if(this.usersCorrect.includes(this.users[userstate["username"]])) { return }
        var user = this.users[userstate["username"]];


        if(user == undefined) {
          user = this.users[userstate["username"]] = new QUser(userstate["username"], 0);
          user.newUser = true;
        }

        user.points++;
        user.rank = this.getUserPosInRank(user);

        if(true) { // if(user.newUser)
          this.bot.sendChat(channels.askOn, `@${user.name} acertou! Rank: #${user.rank} (${user.points} acertos)`);
          user.newUser = false;
        } else {
          console.log(`[twitch-bot] ${user.name} acertou!`)
        }

        //console.log(`USER_STATS ${user.name} #${user.rank} - ${user.points} pts`);
        this.saveData();
        this.usersCorrect.push(this.users[userstate["username"]]);
      }
    }
  }

  static askQuestion() {
    if(this.stopped) { return; }

    this.quest.num1 = Math.round(Math.random()*12)+1;
    this.quest.num2 = Math.round(Math.random()*12)+1;
    this.quest.answer = this.quest.num1 + this.quest.num2;
    this.bot.sendChat(channels.askOn, `/me ${this.quest.num1} + ${this.quest.num2} = ?`);
    this.usersCorrect = [];

    //this.onMessage(channels.askOn, {"message-type": "chat", "username": "geniodamath"}, `${this.quest.answer+(Math.round(Math.random()*1))}`, false);
    //this.onMessage(channels.askOn, {"message-type": "chat", "username": "nickfoda"}, `${this.quest.answer+(Math.round(Math.random()*1))}`, false);



    setTimeout(()=> {
      this.proccessAnswers();
    }, 40*1000)
  }



  static proccessAnswers() {
    if(this.stopped) { return; }

    this.quest.answer = undefined;
    var text = `/me Fim de jogo. `;
    if(this.usersCorrect.length > 0) {

      for (var user of this.usersCorrect) {
        var i = this.usersCorrect.indexOf(user);
        text += `@${user.name}(#${user.rank})${(i == this.usersCorrect.length-2) ? " e " : (i == this.usersCorrect.length-1 ? "" : ", ")}`;
      }

      text += (this.usersCorrect.length > 1 ? ' acertaram!': ' acertou!');

    } else {
      text += "Ninguém acertou!"
    }
    this.bot.sendChat(channels.askOn, text);

    this.saveData();

    setTimeout(()=> {
      this.askQuestion();
    },20*1000)
  }

  static saveData() {
    var data = {};
    for (var u in this.users) {
      var user = this.users[u];
      data[user.name] = {points: user.points}
    }
    fs.writeFileSync(file_data, JSON.stringify(data));
  }
}

class ChatCommand {
  constructor(msg) {
    this.args = msg.split(" ");
    this.cmd = this.args.shift().replace("!", "").toLowerCase();
  }

  getCmd() {
    return this.cmd;
  }

  getArg(n) {
    return this.args[n];
  }

  getText(n) {
    var text = "";
    for (var i = n; i < this.args.length; i++) {
      text += this.args[i] + (i == this.args.length-1 ? "" : " ");
    }
    return text;
  }
}

class QUser {
  constructor(name, points) {
    this.name = name;
    this.points = points;
  }
}

class Bot {
  static client = undefined;

  static limits = {whisper: {max: 3, current: 0, maxtime: 1000, delay: 200, query: [], last: null}, chat: {max: 20, current: 0, maxtime: 30000, delay: 2000, query: [], last: null}};


  static login(OAUTH_TOKEN) {
    this.client = new tmi.client({debug: true, identity: {username: username, password: OAUTH_TOKEN}, channels: [channels.askOn].concat(channels.others)});
    this.client.on('connected', this.onConnected.bind(this));
    this.client.connect();
  }

  static onMessage(channel, userstate, msg, self) {}

  static onConnected(addr, port) {
    console.log(`[twitch-bot] Connected to ${addr}:${port}`);
    Questions.setup(this);


    setInterval(()=>{
      this.verifyQuery();
    },10)
  }

  static sendChat(channel, msg) {
    this.limits.chat.query.push({channel: channel, msg: msg});
  }

  static sendWhisper(user, msg) {
    return

    this.limits.whisper.query.push({user: user, msg: msg});
  }

  static verifyQuery() {
    for (var k in this.limits) {
      var limit = this.limits[k];

      limit.last = limit.last || Date.now() - limit.delay;

      if(limit.query.length > 0) {

        if(Date.now() - limit.last > limit.delay) {
          if(limit.current < limit.max) {
            var query = limit.query[0];

            console.log("[twitch-bot] Sending: '"+query.msg+"'")

            if(k == "chat") {
              this.client.say(query.channel, query.msg);
            }

            //

            limit.last = Date.now();
            limit.query.splice(0, 1);
            limit.current++;

            if(limit.endtime == undefined) {
              limit.endtime = Date.now()+limit.maxtime;
            }
          }
        }
      }

      if(limit.endtime-Date.now() <= 0) {
        limit.endtime = undefined;
        limit.current = 0;
      }

    }
  }

  static createServer(_io) {
    Server.create(_io);
  }

  static serializeStatus() {
    var data = {
      users: [],
      question: null
    };

    if(Questions.quest.answer != undefined) {
      data.question = [Questions.quest.num1, Questions.quest.num2]
    }

    for (var username in Questions.users) {
      data.users.push({name: username, points: Questions.users[username].points});
    }

    return JSON.stringify(data);
  }
}

module.exports = Bot;
