const socket = io("/chat", {
  transports: ['websocket']
});

console.log("websocket")

let messages = [];


let message_templates = [(`
  <div class="msg row border py-3">
    <div class="col-auto px-2" style="max-width: 60px;">
      <span class="msg-time">TIME</span>
    </div>
    <div class="col px-1">
      <span style="display: none;" class="msg-badge badge">BADGE</span>
      <b class="msg-username">USER_NAME</b>
      <b>:</b>
      <span class="msg-text">MESSAGE</span>
    </div>
  </div>
`), (`
  <div class="msg row border py-3">
    <div class="col-auto px-2" style="max-width: 60px;">
      <span class="msg-time">TIME</span>
    </div>
    <div class="col px-1">
      <span style="display: none;" class="msg-badge badge">SERVER</span>
      <b class="msg-text">SERVER_MESSAGE</b>
    </div>
  </div>
`)];

//messages.push({id: "1523", type: 1, content: "MyUser entrou no chat", background: "#caf988", badge: {color: "#ffffff", background: "#3fa008", text: "Server"}});
//messages.push({id: "6235", type: 0, content: "hm", nickname: "OtherUser25"});
//messages.push({id: "8723", type: 0, content: "hm", nickname: "MyUser"});

const setMsgInfo = function(msg_e, msg) {

  if(msg.badge) {
    msg_e.find(".msg-badge").show();
    msg_e.find(".msg-badge").text(msg.badge.text);
    msg_e.find(".msg-badge").css("background-color", msg.badge.background);
    msg_e.find(".msg-badge").css("color", msg.badge.color);
  }

  msg_e.find(".msg-username").text(msg.nickname);
  if(msg.allowHtml) {
    msg_e.find(".msg-text").html(msg.content);
  } else {
    msg_e.find(".msg-text").text(msg.content);
  }


  var t = new Date(msg.time).toString().split(" ")[4].split(":")

  msg_e.find(".msg-time").text(`${t[0]}:${t[1]}`);

  if(msg.background) {
    msg_e.css("background-color", msg.background);
  }
}

const getMessages = function() {
  socket.emit("get_messages", (data) => {


    for (var msg of data) {
      var added = false;

      for (var m of messages) {
        if(m.id == msg.id) {
          added = true; break;
        }
      }

      if(!added) {
        messages.push(msg);
      }
    }

    for (var m of messages) {
      var exists = false;

      for (var msg of data) {
        if(m.id == msg.id) {
          exists = true; break;
        }
      }

      if(!exists && socket.connected) {
        var n = messages.splice(messages.indexOf(m), 1)
        $("div[msg-id='"+m.id+"']").remove();
      }
    }




    setTimeout(()=> {
      getMessages();
    }, 100)
  });
}
getMessages();


const sendMessage = function() {
  socket.emit("send_message", $("#inputText").val());
  $("#inputText").val("")
}

$("#inputText").on('keydown', function(e) { if (e.which == 13) { sendMessage(); } });

setInterval(()=> {


  var newMessages = 0;

  for (var msg of messages) {

    if($("div[msg-id='"+msg.id+"']")[0] != undefined) { continue; }

    var msg_e;

    msg_e = $(message_templates[msg.type]);

    msg_e.attr("msg-id", msg.id);

    msg_e.css("opacity", "0");
    msg_e.hide();

    $(".msg-list").append(msg_e);

    setMsgInfo(msg_e, msg);

    msg_e.show();
    msg_e.css("opacity", "1");

    newMessages++;
  }

  var scroll = $("#scroll-wnd")[0];

  if(newMessages > 0) {
    if((scroll.scrollHeight - scroll.scrollTop < scroll.clientHeight + 100) || newMessages > 5) {
      scroll.scrollTop = scroll.scrollHeight - scroll.clientHeight;
    }
  }
},100);

socket.on("connect", () => {
  console.log("join..")
  socket.emit("join", (info) => {
    console.log("join answer", info)
  });
})

socket.on("disconnect", () => {
  messages.push({"id":"DISCONNECT_fqid8Cb5FewMABrxKVjClcXbnTuJln1V","background":"#ff3a3a","type":1,"time":1588606933135,"content":"You lost connection to the server. Please, refresh the page!","allowHtml":true});
})
