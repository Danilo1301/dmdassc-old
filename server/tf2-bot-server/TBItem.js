const TBQuality = require("./TBQuality");

class TBItem {
  constructor(quality_id, full_name, name, craftable) {
    this.full_name = full_name;
    this.name = name;
    this.craftable = craftable;
    this.quality = TBQuality.GetQualityById(quality_id);
    this.urls = {stn: "", backpack: ""};
  }
}

module.exports = TBItem;
