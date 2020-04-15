const request = require("request");
const delay = 180;
const url = "https://dmdassc.glitch.me";

module.exports = class {
  static startPing() {
    console.log(`[ping] Start pinging (${delay}s) [${url}]`);
    setInterval(()=>{
      request(url, {headers: {'User-Agent': 'Awake-Glitch'}}, (err, res, body) => {
        if (err) { return console.log("[ping] Error") }
        console.log("[ping] Request")
      });
    }, delay*1000);
  }
}
