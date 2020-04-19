class TBQuality {
  static qualities = {};

  static Init() {
    this.CreateQuality(6, "Unique", "rgb(255, 215, 0)");
    this.CreateQuality(11, "Strange", "rgb(255, 215, 0)");
    this.CreateQuality(3, "Vintage", "rgb(71, 98, 145)");
    this.CreateQuality(1, "Genuine", "rgb(77, 116, 85)");
    this.CreateQuality(5, "Unusual", "rgb(134, 80, 172)");
    this.CreateQuality(13, "Haunted", "rgb(0, 0, 0)");
    this.CreateQuality(14, "Collector", "rgb(0, 0, 0)");
  }

  static CreateQuality(id, name, color) {
    this.qualities[id] = new ItemQuality(id, name, color);
  }

  static GetQualityByName(name) {
    for (var id in this.qualities) {
      var ql = this.qualities[id];
      if(ql.name.toLowerCase() == name.toLowerCase()) { return ql; }
    }
  }

  static GetQualityById(id) {
    return this.qualities[id];
  }
}

class ItemQuality {
  constructor(id, name, color) {
    this.id = id;
    this.name = name;
    this.color = color;
  }
}

TBQuality.Init();

module.exports = TBQuality;
