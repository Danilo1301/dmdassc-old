const express = require('express'), router = express.Router();
const correctPath = require('../utils/correctPath.js');

const tf2_bot_server = require('./tf2-bot-server');
tf2_bot_server.Init();

let __serverPath = "/";

let io;

router.get('/', function(req, res) {
  if(correctPath.fix(req, res)) { return; };

  res.sendFile(`${__serverPath}/views/tf2.html`);
})

router.get('/get', function(req, res) {
  if(correctPath.fix(req, res)) { return; };

  res.end("got");
});

router.get('/status', function(req, res) {
  if(correctPath.fix(req, res)) { return; };

  res.end(tf2_bot_server.GetPagesStatus());
});

const createIoServer = function(_io) {
  io = _io.of('/tf2');

  console.log("[socket:tf2] Server created!")

  io.on('connection', function (socket) {
    console.log("[socket:tf2] New connection");

    tf2_bot_server.AddUpdateListener(socket);

    socket.on("update_item", (itemid) => {
      tf2_bot_server.ManualUpdateItem(itemid);
    });

    socket.on('items', function (data, callback) {
      //console.log(data);

      var items = [];
      for (var item_id in tf2_bot_server.Items) {
        items.push(tf2_bot_server.Items[item_id]);
      }

      items = items.sort((a, b) => {
        var val_a = null;
        var val_b = null;
        if(data.t == 0) {
          val_a = a.updated_at || -999999999999999999;
          val_b = b.updated_at || -999999999999999999;
        }
        if(data.t == 1) {
          val_a = a.profit1 ? a.profit1.scrap : null;
          val_b = b.profit1 ? b.profit1.scrap : null;
        }
        if(data.t == 2) {
          val_a = a.profit2 ? a.profit2.scrap : null;
          val_b = b.profit2 ? b.profit2.scrap : null;
        }
        if(data.t == 3) {
          val_a = a.profit3 ? a.profit3.scrap : null;
          val_b = b.profit3 ? b.profit3.scrap : null;
        }

        return val_b - val_a;
      });

      callback({items: items.slice(data.i, data.i+data.m), pages: Math.ceil(items.length / data.m)});
    });
  });
}


module.exports.router = router;
module.exports.createIoServer = createIoServer;
module.exports.setServerPath = function(newPath) { __serverPath = newPath; };
