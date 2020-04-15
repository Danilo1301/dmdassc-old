console.log("^^")

$.get( "/uptimestatus", function(res) {
  var data = JSON.parse(res);

  console.log(data);

  for (var name in data.status) {
    var s = data.status[name];

    var e = $(`
      <p>
        <button style="width: 200px" class="btn btn-${s.state ? "success" : "danger"}" type="button" data-toggle="collapse" data-target="#collapse_${name}" aria-expanded="false" aria-controls="collapseExample">
          ${name}
        </button>
      </p>
      <div class="collapse" id="collapse_${name}" style="padding-bottom: 15px;">
        <div class="card card-body history"></div>
      </div>`);


    e.find(".history").append(`<div>Status: <span class="badge badge-${s.state ? "success" : "danger"}">${s.state ? "UP" : "DOWN"}</span></div>`);

    if(!s.state) {
      e.find(".history").append(`<div>Tempo fora do ar: ${((Date.now()-s.last)/1000).toFixed(0)} segundos</div>`);
    } else {
      if(data.history[name] != undefined) {
        var lastDown = data.history[name][data.history[name].length-1];
        e.find(".history").append(`<div>Tempo: ${((Date.now() - lastDown.to)/1000).toFixed(0)} segundos</div>`);
      }
    }

    if(data.history[name] != undefined) {
      for (var i = data.history[name].length-1; i >= 0; i--) {
        console.log(name, i)
        var down = data.history[name][i];
        e.find(".history").append(`<div><span class="badge badge-warning">${((down.to-down.from)/1000).toFixed(0)} segundos</span> ${down.from} -> ${down.to}</div>`);
      }
    }




    $("#info").append(e);
  }
});
