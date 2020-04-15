const fs = require("fs");
const file = "local_env.json";

module.exports = class {
  static defineEnvs() {
    if(!fs.existsSync(file)) { return; }
    let data = JSON.parse(fs.readFileSync(file, "utf8"));
    for (var key in data) { process.env[key] = data[key]; }
  }
}
