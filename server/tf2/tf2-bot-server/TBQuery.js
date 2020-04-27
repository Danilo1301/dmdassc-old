const TBRequest = require("./TBRequest");
const TBEvents = require("./TBEvents");
const TBConversor = require("./TBConversor");

const TBStn = require("./TBStn");
const TBBackpack = require("./TBBackpack");

class TBQuery {
  static query = [];

  static events = new TBEvents();

  static on = this.events.Setup();

  static items_completed = 0;

  static AddItem(item) {
    //console.log(`Adding to query`)
    this.query.push(item);
  }

  static SearchNext() {
    var self = this;
    var item = this.query[0];

    if(!item) {
      this.events.TriggerEvent("search_ended");
      return console.log("no items");
    }

    console.log(item);

    if(item.urls.backpack == "") {
      self.query.shift();
      return self.SearchNext();
    }

    item.price = {};

    var ps = [];

    console.log(`[query] ${this.query.length} items left`);

    ps.push(TBStn.GetItemInfo(item.urls.stn));
    ps.push(TBBackpack.GetItemInfo(item.urls.backpack));

    Promise.all(ps).then(function(values) {
      var info_stn = values[0];
      var info_backpack = values[1];

      item.price.stn = {};
      item.price.backpack = {};

      item.max_stock = info_stn.max_stock;
      item.stock = info_stn.stock;

      item.price.stn.buy = info_stn.price_buy;
      item.price.stn.sell = info_stn.price_sell;

      item.price.backpack.buy = info_backpack.best_to_buy ? info_backpack.best_to_buy.price : null;
      item.price.backpack.sell = info_backpack.best_to_sell ? info_backpack.best_to_sell.price : null;

      if(item.price.backpack.sell && item.price.stn.buy) {
        item.profit1 = TBConversor.Convert(item.price.backpack.sell.scrap - item.price.stn.buy.scrap);
      } else {
        item.profit1 = null;
      }

      if(item.price.stn.sell && item.price.backpack.buy) {
        item.profit2 = TBConversor.Convert(item.price.stn.sell.scrap - item.price.backpack.buy.scrap);
      } else {
        item.profit2 = null;
      }

      item.updated_at = Date.now();

      self.query.shift();
      self.items_completed++;

      self.events.TriggerEvent("search_item_completed", [item, self.query.length]);

      self.SearchNext();
    }).catch(()=> {
      console.log("ERROR")
    });


  }
}

module.exports = TBQuery;
