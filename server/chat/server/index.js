class CServer {
  static io;

  static Setup(io) {
    console.log("[socket:chat] Server created!")

    this.io = io.of('/chat');
    this.io.on('connection', this.OnConnection.bind(this));
  }

  static OnConnection(socket) {
    console.log("[socket:chat] New connection");

    socket.on("join", (callback) => {
      CChat.OnUserJoin(socket, callback);
    });
  }
}

class CUser {
  constructor(uid, socket) {
    this.uid = uid;
    this.address = "";
    this.nickname = "User-" + makeid(5);
    this.localMessages = [];
  }

  SetupSocket(socket) {
    this.socket = socket;
    this.socket.on("send_message", this.OnSendMessage.bind(this));
    this.socket.on("get_messages", this.OnGetMessages.bind(this));
    this.socket.on("disconnect", this.OnDisconnect.bind(this));

    this.localMessages = [];

    var msg_join = CChat.CreateServerMessage("#caf988", this.nickname + " joined the chat");
    msg_join.time -= 1;

    var msg = this.CreateLocalMessage(`
      <div class="container-fluid">
        <div class="row"></div>
        <div class="row">Welcome, ${this.nickname}!</div>
        <div class="row">Type /help for a list of commands</div>
        <div class="row"></div>
      </div>
      `);
    msg.background = "#ecd82e";
  }

  GetInfo() {
    return {uid: this.uid, nickname: this.nickname};
  }

  OnSendMessage(content) {
    if(content.startsWith("/")) {

      var args = content.split(" ");
      var cmd = args.splice(0, 1)[0].toLowerCase().slice(1);


      if(cmd == "help") {
        var msg = this.CreateLocalMessage(`
          <div class="container-fluid">
            <div class="row">Commands:</div>
            <div class="row">/help</div>
            <div class="row">/nick</div>
          </div>
          `);
        return
      }

      if(cmd == "clearchat") {
        return CChat.Messages = [];
      }

      if(cmd == "nick") {
        var str = "";
        for (var s of args) {
          str += `${s}${(args.indexOf(s) == args.length-1) ? "" : " "}`;
        }

        if(str.length == 0) {
          return this.CreateLocalMessage(`/nick [your-nick]`);
        }

        if(str.length <= 2) {
          return this.CreateLocalMessage(`Nickname too short!`);
        }
        if(str.length > 22) {
          return this.CreateLocalMessage(`Nickname too long!`);
        }

        //this.CreateLocalMessage(`You changed your name to '${str}'`);
        CChat.CreateServerMessage("#f6c94e", `'${this.nickname}' changed his nickname to '${str}'`);
        this.nickname = str;
        return
      }

      this.CreateLocalMessage("Unknown command: " + content);
      return;
    }

    CChat.CreateUserMessage(this, content);
  }

  CreateLocalMessage(content) {
    var msg = CChat.CreateDefaultMessage(true);
    msg.content = content;
    msg.background = "#c0c0c0";
    msg.allowHtml = true;
    this.localMessages.push(msg);
    return msg;
  }

  OnGetMessages(callback) {
    var messages = [];

    var all = [].concat(CChat.Messages).concat(this.localMessages);

    for (var i = all.length-1, n = 0; i >= 0; i--) {
      if(n < 15) {
        messages.push(all[i]);
      }
      n++;
    }

    callback(messages.sort((a,b) => { return a.time - b.time}));
  }

  OnDisconnect() {
    CChat.CreateServerMessage("#ef9f9f", `${this.nickname} left the chat`);
  }
}


class CChat {
  static SetupServer = CServer.Setup.bind(CServer);

  static Users = {};

  static Messages = [];

  static Init() {}

  static CreateDefaultMessage(notGlobal) {
    var msg = {
      id: makeid(40),
      background: "#ffffff",
      type: 1,
      time: Date.now()
    };
    if(notGlobal != true) { this.Messages.push(msg); }
    return msg;
  }

  static CreateUserMessage(user, content) {
    var msg = this.CreateDefaultMessage();
    msg.content = content;
    msg.type = 0;
    msg.nickname = user.nickname;
    return msg;
  }

  static CreateServerMessage(background, content) {
    var msg = this.CreateDefaultMessage();
    msg.content = content;
    msg.background = background;
    msg.type = 1;
    msg.allowHtml = true;
    return msg;
  }

  static OnUserJoin(socket, callback) {
    var uid = getCookie(socket.request.headers.cookie, "uid");
    var address = socket.handshake.address;

    var user = this.GetUser(uid, address);

    if(!user) { user = this.CreateUser(uid); }

    user.address = address;
    user.SetupSocket(socket);

    callback(user.GetInfo());
  }

  static CreateUser(uid) {
    var user = new CUser(uid);
    this.Users[uid] = user;
    return user;
  }

  static GetUser(uid, address) {
    if(this.Users[uid]) { return this.Users[uid]; }

    for (var k in this.Users) {
      if(this.Users[k].address == address) { return this.Users[k]; }
    }
  }
}

module.exports = CChat;

function getCookie(cookie, name){
    cookie = ";"+cookie;
    cookie = cookie.split("; ").join(";");
    cookie = cookie.split(" =").join("=");
    cookie = cookie.split(";"+name+"=");
    if(cookie.length<2){
        return null;
    }
    else{
        return decodeURIComponent(cookie[1].split(";")[0]);
    }
}

function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
