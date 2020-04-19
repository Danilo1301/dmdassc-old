const fs = require("fs");

const TBRequest = require("./TBRequest");
const TBQuality = require("./TBQuality");
const TBItem = require("./TBItem");
const TBQuery = require("./TBQuery");

const path_backpack_items = ".data/tf2/backpack_items.json";
const path_stn_items = ".data/tf2/stn_items.json";

let items_custom_urls = [
  {name: "Unusual Horseless Headless Horsemann's Headtaker", craftable: true, quality: 5, url: "https://backpack.tf/stats/Unusual/Horseless%20Headless%20Horsemann%27s%20Headtaker/Tradable/Craftable"},
  {name: "Gargoyle Case", craftable: true, quality: 6, url: "https://backpack.tf/stats/Unique/Gargoyle%20Case/Tradable/Craftable"},
  {name: "Creepy Crawly Case", craftable: true, quality: 6, url: "https://backpack.tf/stats/Unique/Creepy%20Crawly%20Case/Tradable/Craftable"},
  {name: "Infernal Reward War Paint Case", craftable: true, quality: 6, url: "https://backpack.tf/stats/Unique/Infernal%20Reward%20War%20Paint%20Case/Tradable/Craftable"}
];

class TB {
  static categories = ["tf2-items", "tf2-hats"];

  static backpack_items = [];
  static stn_items = [];

  static Items = [];

  static Init()
  {
    this.ReadLocalStorage();

    if(this.backpack_items.length == 0) {
      TBRequest.GetBackpackSpreadsheetItems().then((items) => {
        fs.writeFileSync(path_backpack_items, JSON.stringify({lastUpdated: Date.now(), items: items}));
        TB.backpack_items = items;
        TB.GetStnInfo();
      });
    } else {
      this.GetStnInfo();
    }
  }

  static ReadLocalStorage()
  {
    if(!fs.existsSync(path_backpack_items)) {
      fs.mkdirSync(".data/tf2");
      fs.writeFileSync(path_backpack_items, "{}");
      fs.writeFileSync(path_stn_items, "{}");
    }

    var data_bp = JSON.parse(fs.readFileSync(path_backpack_items, "utf8"));

    if(Date.now() - data_bp.lastUpdated < 3*24*60*60*1000) { // 3 dias
      this.backpack_items = data_bp.items;
    }

    var data_stn = JSON.parse(fs.readFileSync(path_stn_items, "utf8"));

    if(Date.now() - data_stn.lastUpdated < 3*24*60*60*1000) { // 3 dias
      this.stn_items = data_stn.items;
    }
  }

  static GetStnInfo()
  {
    if(this.stn_items.length != 0) {
      return this.ProcessItemsInfo();
    }

    var ps = [];

    for (var c of this.categories) {
      ps.push(this.BrowsePagesOfCategory(c));
    }

    Promise.all(ps).then(function(values) {
      var items = [];
      for (var v of values) {
        items = items.concat(v);
      }
      TB.stn_items = items;
      fs.writeFileSync(path_stn_items, JSON.stringify({lastUpdated: Date.now(), items: items}));
      console.log(`Found ${TB.stn_items.length} items on STN`);
      TB.ProcessItemsInfo();
    });
  }

  static ProcessItemsInfo()
  {
    for (var it of TB.stn_items) {
      var item = new TBItem(it.quality, it.full_name, it.name, it.craftable);
      item.urls.stn = "https://stntrading.eu" + it.href;

      var found = undefined;

      for (var bp_it of TB.backpack_items) {
        if(item.craftable == bp_it.craftable && (item.name.toLowerCase() == bp_it.name.toLowerCase() || item.name.toLowerCase().replace("the ", "") == bp_it.name.toLowerCase().replace("the ", ""))) {
          found = bp_it;
          break;
        }
      }

      if(found) {
        item.urls.backpack = "https://backpack.tf/" + found.qualities[item.quality.id];
      } else {
        for (var cu of items_custom_urls) {
          if(cu.name == item.full_name && cu.craftable == item.craftable && cu.quality == item.quality.id) {
            item.urls.backpack = cu.url;
          }
        }
      }

      if(item.urls.backpack == "") {
        //console.log(item)
        console.log("Could not find");
      }
      this.Items.push(item);
    }

    console.log("OK");

    TBQuery.AddItems(this.Items);
    TBQuery.SearchNext();
  }


  static BrowsePagesOfCategory(category)
  {
    var total_items = [];
    var last_items_len = null;
    var page = 1;

    return new Promise(function(resolve) {

      (function loop(i) {
        if(last_items_len == 0) { return resolve(total_items); }

          if (true) new Promise((reslv) => {
            TBRequest.GetStnItemsInPage(category, i).then((items)=>{
              total_items = total_items.concat(items)
              last_items_len = items.length;
              console.log(`[tf2] Found ${items.length} items in '${category}' page ${i} (Total: ${total_items.length})`)
              reslv();
            });

          }).then(loop.bind(TB, i+1));
      })(page);

    });
  }

}

module.exports = TB;
