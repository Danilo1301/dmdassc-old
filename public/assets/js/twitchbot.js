const socket = io('/bots/twitch');

const updateStatus = function(status) {
  if(!status) { return; }
  console.log("a", status)

  $("#data").html(`<div><b>Pergunta atual:</b> ${status.question == null ? "Aguardando próxima rodada..." : `${status.question[0]} + ${status.question[1]}`}</div>`);
  for (var u of status.users) {
    $("#data").html(  $("#data").html() + `<div><b>${u.name}</b>: ${u.points} acertos</div>`);
  }

}

const getStatus = function() {
  socket.emit('get_status', function(data) {
    updateStatus(JSON.parse(data));
    setTimeout(()=> { getStatus(); },500);
  });
}

socket.on('connect', function () { getStatus(); });

updateStatus();
