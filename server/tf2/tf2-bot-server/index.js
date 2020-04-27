const fs = require("fs");

const TBStn = require("./TBStn");
const TBBackpack = require("./TBBackpack");

const TBStorage = require("./TBStorage");

const TBRequest = require("./TBRequest");
const TBQuality = require("./TBQuality");
const TBQuery = require("./TBQuery");
const TBConversor = require("./TBConversor");

const path_backpack_items = ".data/tf2/backpack_items.json";
const path_items = ".data/tf2/items.json";
const path_data = ".data/tf2/data.json";

let items_custom_urls = [
  {name: "Unusual Horseless Headless Horsemann's Headtaker", craftable: true, quality: 5, url: "https://backpack.tf/stats/Unusual/Horseless%20Headless%20Horsemann%27s%20Headtaker/Tradable/Craftable"},
  {name: "Gargoyle Case", craftable: true, quality: 6, url: "https://backpack.tf/stats/Unique/Gargoyle%20Case/Tradable/Craftable"},
  {name: "Creepy Crawly Case", craftable: true, quality: 6, url: "https://backpack.tf/stats/Unique/Creepy%20Crawly%20Case/Tradable/Craftable"},
  {name: "Infernal Reward War Paint Case", craftable: true, quality: 6, url: "https://backpack.tf/stats/Unique/Infernal%20Reward%20War%20Paint%20Case/Tradable/Craftable"}
];

class TB {
  static Items = {};
  static Data = {};
  static BackpackSpreadsheet = [];

  static GetPagesStatus()
  {
    return `<b>eae</b>`;
  }

  static Init()
  {
    this.ReadLocalStorage();

    TBBackpack.GetItemInfo("https://backpack.tf/stats/Unique/Mann%20Co.%20Supply%20Crate%20Key/Tradable/Craftable").then((info) => {

      if(info.best_to_sell) {
        this.Data.key_price = info.best_to_sell.price;
      }
      TBConversor.SetKeyPrice(this.Data.key_price);

      console.log(`Key price is: ${TBConversor.key.string}`);

      this.GetSpreadsheetInfo().then((spreadsheet) => {
        TBStorage.StoreInFile("spreadsheet", spreadsheet);

        TBStn.GetItems().then((items) => {

          console.log("---------------------")

          for (var item of items) {
            var found_item = null;

            var id = makeid(20);

            if(found_item) {
              id = item.id;
            } else {
              TB.Items[id] = {id: id};
            }

            TB.Items[id].full_name = item.full_name;
            TB.Items[id].name = item.name;
            TB.Items[id].craftable = item.craftable;
            TB.Items[id].quality = TBQuality.GetQualityById(item.quality);
            TB.Items[id].img = item.img;
            TB.Items[id].href = item.href;

            if(!TB.Items[id].urls) {
              TB.Items[id].urls = {stn: "https://stntrading.eu" + item.href, backpack: ""};
            }

            if(!TB.Items[id].urls.backpack) {
              for (var spreadsheet_item of TB.BackpackSpreadsheet) {
                if(item.craftable == spreadsheet_item.craftable && (item.name.toLowerCase() == spreadsheet_item.name.toLowerCase() || item.name.toLowerCase().replace("the ", "") == spreadsheet_item.name.toLowerCase().replace("the ", ""))) {
                  var ur = spreadsheet_item.qualities[TB.Items[id].quality.id];
                  if(ur != undefined) {
                    TB.Items[id].urls.backpack = "https://backpack.tf" + ur;
                  }
                  break;
                }
              }
            }

            if(!TB.Items[id].urls.backpack) {
              for (var cu of items_custom_urls) {
                if(cu.name == TB.Items[id].full_name && cu.craftable == TB.Items[id].craftable && cu.quality == TB.Items[id].quality.id) {
                  TB.Items[id].urls.backpack = cu.url;
                  break;
                }
              }
            }
          }

          console.log("Query")
          // --------------- query

          TBQuery.on("search_item_completed", (item, left)=> {
            //console.log("search_item_completed", left, item)

            TB.Items[item.id] = item;

            if(TBQuery.items_completed % 5 == 0) {
              //Save
            }
          })

          TBQuery.on("search_ended", ()=> {
            TB.AddRandomItemsToQuery();
          });

          this.AddRandomItemsToQuery();

        })
      });
    });

    return;
  }

  static AddRandomItemsToQuery()
  {
    var random_items = [];

    for (var id in TB.Items) { random_items.push(TB.Items[id]); }

    while (random_items.length > 0) {
      TBQuery.AddItem(random_items.splice(Math.round(Math.random()*(random_items.length-1)), 1)[0]);
    }
    TBQuery.SearchNext();
  }

  static GetSpreadsheetInfo()
  {
    var self = this;

    return new Promise(function(resolve, reject) {
      if(self.BackpackSpreadsheet.length != 0) { return resolve(self.BackpackSpreadsheet); }

      TBBackpack.GetSpreadsheet().then((spreadsheet) => {
        resolve(spreadsheet);
      });

    });
  }

  static ReadLocalStorage()
  {
    var data_spreadsheet = TBStorage.ReadFile("spreadsheet");

    this.BackpackSpreadsheet = data_spreadsheet;
  }

}

module.exports = TB;

function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
