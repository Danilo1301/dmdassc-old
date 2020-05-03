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
    this.nickname = "User " + makeid(5);
  }

  SetupSocket(socket) {
    this.socket = socket;
    this.socket.on("send_message", this.OnSendMessage.bind(this));
    this.socket.on("get_messages", this.OnGetMessages.bind(this));
    this.socket.on("disconnect", this.OnDisconnect.bind(this));
  }

  GetInfo() {
    return {uid: this.uid, nickname: this.nickname};
  }

  OnSendMessage(content) {
    if(content.startsWith("/")) {
      if(content.toLowerCase() == "/clearchat") {
        CChat.Messages = [];
      }
      return;
    }


    CChat.CreateUserMessage(this, content);
  }

  OnGetMessages(callback) {
    var messages = [];

    for (var i = CChat.Messages.length-1, n = 0; i >= 0; i--) {
      if(n < 15) {
        messages.push(CChat.Messages[i]);
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

  static CreateDefaultMessage() {
    var msg = {
      id: makeid(40),
      background: "#ffffff",
      type: 1,
      time: Date.now()
    };
    this.Messages.push(msg);
    return msg;
  }

  static CreateUserMessage(user, content) {
    var msg = this.CreateDefaultMessage();
    msg.content = content;
    msg.type = 0;
    msg.nickname = user.nickname;
  }

  static CreateServerMessage(backgrond, content) {
    var msg = this.CreateDefaultMessage();
    msg.content = content;
    msg.background = backgrond;
    msg.type = 1;
  }

  static OnUserJoin(socket, callback) {
    var uid = getCookie(socket.request.headers.cookie, "uid");
    var address = socket.handshake.address;

    var user = this.GetUser(uid, address);

    if(!user) { user = this.CreateUser(uid); }

    user.address = address;
    user.SetupSocket(socket);

    CChat.CreateServerMessage("#caf988", user.nickname + " joined the chat");

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
