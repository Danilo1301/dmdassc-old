const express = require('express'), router = express.Router();
const correctPath = require('../utils/correctPath.js');

let __serverPath = "/";

router.get('/', function(req, res) {
  if(correctPath.fix(req, res)) { return; };

  res.sendFile(`${__serverPath}/views/jogos.html`);
})

router.get('/cafemania', function(req, res) {
  if(correctPath.fix(req, res)) { return; };

  res.sendFile(`${__serverPath}/views/jogos/cafemania.html`);
});

module.exports.router = router;
module.exports.setServerPath = function(newPath) { __serverPath = newPath; };
