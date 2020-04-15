let messages = [];

let message_templates = [(`
  <div class="server_incoming_msg">
    <div class="server_received_msg">
      <div class="received_withd_msg">
        <p></p>
      </div>
    </div>
  </div>
`), (`
  <div class="incoming_msg">
    <div class="incoming_msg_img">
      <img src="https://ptetutorials.com/images/user-profile.png">
    </div>
    <div class="received_msg">
      <div class="received_withd_msg">
        <p><b class="nickname"></b><span></span></p>
      </div>
    </div>
  </div>
`),(`
  <div class="outgoing_msg">
    <div class="outgoing_msg_img">
      <img src="https://ptetutorials.com/images/user-profile.png">
    </div>
    <div class="sent_msg">
      <p><b class="nickname"></b><span></span></p>
    </div>
  </div>
`)];

messages.push({id: "1523", type: 0, content: "MyUser entrou no chat"});
messages.push({id: "6235", type: 1, content: "hm", nickname: "OtherUser25"});
messages.push({id: "8723", type: 1, content: "hm", nickname: "MyUser"});

setInterval(()=> {
  for (var msg of messages) {

    if($("div[msg-id='"+msg.id+"']")[0] != undefined) { continue; }

    var msg_e;
    if(msg.type == 0) {
      msg_e = $(message_templates[0]);
      msg_e.find("p").text(msg.content);
    }

    if(msg.type == 1) {
      msg_e = $(message_templates[((msg.nickname == "MyUser") ? 2 : 1)]);
      msg_e.find(".nickname").text(msg.nickname + ":");
      msg_e.find("span").text(msg.content);
    }

    msg_e.attr("msg-id", msg.id);
    $(".msg_history").append(msg_e);
  }
},500)
