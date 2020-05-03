const express = require('express'), router = express.Router();
const correctPath = require('../utils/correctPath.js');

const server = require('./server');
server.Init();

let __serverPath = "/";

let io;

router.get('/', function(req, res) {
  if(correctPath.fix(req, res)) { return; };

  if(req.cookies.uid == undefined) {
    res.cookie("uid", makeid(40));
  }

  res.sendFile(`${__serverPath}/views/chat.html`);
})

const createIoServer = server.SetupServer;



module.exports.router = router;
module.exports.createIoServer = createIoServer;
module.exports.setServerPath = function(newPath) { __serverPath = newPath; };

function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
