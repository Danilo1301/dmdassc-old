const fs = require("fs");

const data_path = ".data/tf2/"

class TBStorage {
  static ReadFile(file)
  {
    var file_path = data_path + file + ".json";

    if(!fs.existsSync(data_path)) {
      fs.mkdirSync(".data/tf2");
    }

    if(!fs.existsSync(file_path)) {
      fs.writeFileSync(file_path, JSON.stringify({}));
      return;
    }

    return JSON.parse(fs.readFileSync(file_path, "utf8"));
  }

  static StoreInFile(file, data)
  {
    var file_path = data_path + file + ".json";
    fs.writeFileSync(file_path, JSON.stringify(data));
  }
}

module.exports = TBStorage;