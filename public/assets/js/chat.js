const socket = io("dmdassc-chat.glitch.me");
//const socket = io("127.0.0.1:3001");

let messages = [];

let commands = [["help"], ["admin login", "[argr1] [arg2]"]];

let message_templates = [(`
  <div class="msg row border py-3">
    <div class="col-auto px-2" style="max-width: 60px;">
      <span class="msg-time">TIME</span>
    </div>
    <div class="col px-1">
      <span style="display: none;" class="msg-badge badge">BADGE</span>
      <b class="msg-username">USER_NAME</b>
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



  if(msg.user) {
    msg_e.find(".msg-username").text(msg.user.nickname);
    msg_e.find(".msg-username").css("background-color", msg.user.background);
    msg_e.find(".msg-username").css("color", msg.user.color);

    if(msg.user.badge) {
      msg_e.find(".msg-badge").show();
      msg_e.find(".msg-badge").text(msg.user.badge.text);
      msg_e.find(".msg-badge").css("background-color", msg.user.badge.background);
      msg_e.find(".msg-badge").css("color", msg.user.badge.color);
    }
  }






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
  $("#inputText").val("");
  $("#cmd-list").hide();
}

$("#inputText").on('keydown', (e) => { if(e.which == 13) { sendMessage(); } });
$('#inputText').on('input', (e) => {
  var val = $('#inputText').val();

  var display_commands = [];

  if(val.startsWith("/")) {
    for (var cmd of commands) {
      if(cmd[0].includes(val.slice(1))) {
        display_commands.push(cmd);
      }
    }

    $("#cmd-list").show();
    $("#cmd-list div").remove();
    $("#cmd-list").css("top", `-${40*display_commands.length}px`);

    for (var cmd of display_commands) {
      var elm = `<div class="row px-2 py-2 border" style="height: 40px;">/${cmd[0]} <b style="margin-left: 5px">${cmd[1] || ""}</b></div>`;
      $("#cmd-list").append(elm);
    }
  } else {
      $("#cmd-list").hide();
  }


});

setInterval(()=> {

  var scroll = document.getElementById("scroll-wnd");

  var newMessages = 0;
  var canScroll = scroll.scrollHeight - scroll.scrollTop < scroll.clientHeight + 100;

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


  if(newMessages > 0) {
    if((canScroll) || newMessages > 5) {
      scroll.scrollTop = scroll.scrollHeight - scroll.clientHeight;
    }
  }


},100);

socket.on("connect", () => {
  //console.log("join..")

  socket.emit("join", (info) => {



    //console.log("join answer", info)
  });
})

socket.on("disconnect", () => {
  messages.push({"id":"DISCONNECT_fqid8Cb5FewMABrxKVjClcXbnTuJln1V","background":"#ff3a3a","type":1,"time":Date.now(),"content":"You lost connection to the server. Please, refresh the page!","allowHtml":true});
})
