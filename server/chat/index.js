const express = require('express'), router = express.Router();
const correctPath = require('../utils/correctPath.js');

let __serverPath = "/";

router.get('/', function(req, res) {
  if(correctPath.fix(req, res)) { return; };

  if(req.cookies.uid == undefined) {
    res.cookie("uid", makeid(40));
  }

  res.sendFile(`${__serverPath}/views/chat.html`);
})

module.exports.router = router;
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
