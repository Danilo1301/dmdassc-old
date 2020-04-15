const express = require('express'), router = express.Router();
const correctPath = require('../utils/correctPath.js');

let __serverPath = "/";

router.get('/', function(req, res) {
  if(correctPath.fix(req, res)) { return; };

  res.sendFile(`${__serverPath}/views/projetos.html`);
})

router.get('/uptime-monitoring', function(req, res) {
  if(correctPath.fix(req, res)) { return; };

  res.sendFile(`${__serverPath}/views/projetos/uptime-monitoring.html`);
});

module.exports.router = router;
module.exports.setServerPath = function(newPath) { __serverPath = newPath; };
