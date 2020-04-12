const socket = io('/bots/discord');
let status = {};

const state = [["Desligado", "#d63c3c"], ["Iniciando...", "#b17901"], ["Ligado", "#309006"]];

const updateStatus = function() {
  $("#status").text(status.state == undefined ? "" : state[status.state][0]);
  $("#status").css("color", status.state == undefined ? "black" : state[status.state][1]);

  $("#uptime").text(status.state != 2 ? "" : (status.uptime/1000).toFixed(0) + " segundos");

  $("#starttime").text(status.state != 2 ? "" : status.startTime);
}

const getStatus = function() {
  socket.emit('get_status', function(data) {
    status = JSON.parse(data);
    updateStatus();
    setTimeout(()=> { getStatus(); },500);
  });
}

socket.on('connect', function () { getStatus(); });

updateStatus();
