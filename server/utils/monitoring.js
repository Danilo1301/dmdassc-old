const fs = require('fs');
const file_data = "./.data/monitoring_services.json";
const file_history = "./.data/monitoring_down_history.json";

let last_saved_amount = 0;
let history = {};

module.exports = class {
  static services = {};

  static init() {
    this.readStoredData();

    setInterval(()=> {
      for (var name in this.services) {
        if(this.services[name].state) {
          var dt = Date.now() - this.services[name].last;

          if(dt > 2000 && this.services[name].last != 0) {
            console.log(`[monitoring] ${name} was down for ${dt}ms`);
            if(!history[name]) { history[name] = [] }
            history[name].push({from: this.services[name].last, to: Date.now()});
          }

          this.services[name].last = Date.now();
        }
      }
      this.saveData();
    },1000)
  }

  static getStatus() {
    return {status: this.services, history: history};
  }

  static saveData() {
    fs.writeFileSync(file_data, JSON.stringify(this.services));
    fs.writeFileSync(file_history, JSON.stringify(history));

  }

  static readStoredData() {
    if(fs.existsSync(file_data)) {
      var data = JSON.parse(fs.readFileSync(file_data, "utf8"));
      for (var name in data) {
        this.services[name] = data[name];
        this.services[name].state = false;
      }
    }

    if(fs.existsSync(file_history)) {
      var data = JSON.parse(fs.readFileSync(file_history, "utf8"));
      history = data;
    }

    this.saveData();
  }

  static startMonitoring(name) {
    if(this.services[name]) { return; }
    this.services[name] = {state: false, last: 0};
  }

  static setStatus(name, status) {
    this.services[name].state = status;
  }
}
