const TBRequest = require("./TBRequest");

class TBQuery {
  static query = [];

  static AddItems(items) {
    console.log(`Adding ${items.length} items to query`)
    this.query = this.query.concat(items);
  }

  static SearchNext() {
    var item = this.query[0];
    console.log('query:', item.urls);

    TBRequest.GetPrices_STN(item.urls.stn);
  }
}

module.exports = TBQuery;
