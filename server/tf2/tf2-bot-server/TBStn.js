const TBRequest = require("./TBRequest");

const TBConversor = require("./TBConversor");

//Genuine Companion Cube Pin

class TBStn {
  static categories = ["tf2-items", "tf2-hats", "tf2-stranges", "tf2-weapons", "tf2-vintages", "tf2-genuines"];
  //static categories = [];

  static body_preview = "";

  static GetItemInfo(url)
  {
    var self = this;
    return new Promise(function(resolve) {
      TBRequest.GetBody(url).then((body)=>{
        var info = {};

        var n = body.indexOf('<div class="stl-bx my-2">');
        var s = body.slice(n, body.indexOf('<div class="col-md-6 col-lg-7 col-xl-8">', n));
        var es = getElementsInString(s);
        var stock = parseInt(es[3].split("<")[0]);
        var max_stock = parseInt(es[5].split("<")[0]);


        var n = body.indexOf('<div class="col-md-6 col-lg-7 col-xl-8">');
        var s = body.slice(n, body.indexOf('</div></div>', n));

        var lastn = 0;

        var price_sell = null;
        var price_buy = null;

        while ((lastn = body.indexOf('<a class="tfip-pg-bx-wrap shadow-sm" onclick="', lastn)) != -1) {
          var n = body.indexOf("</a>", lastn);
          var s = body.slice(lastn, n+4);
          var es = getElementsInString(s);

          var val = es[5].split("for ")[1].split("<")[0];

          if(s.indexOf("Sell for") != -1) { price_sell = val; }

          if(s.indexOf("Buy from") != -1 && s.indexOf("Killstreak") == -1) { price_buy = val; }

          lastn = n;
        }

        if(price_buy) { price_buy = TBConversor.Convert(price_buy); }
        if(price_sell) { price_sell = TBConversor.Convert(price_sell); }

        info.price_buy = price_buy;
        info.price_sell = price_sell;
        info.stock = stock;
        info.max_stock = max_stock;

        resolve(info);


      });

    });
  }

  static GetItems()
  {
    var self = this;

    console.log(`Getting stn items`, this.categories);

    return new Promise(function(resolve, reject) {

      var ps = [];

      for (var c of self.categories) { ps.push(self.BrowsePagesOfCategory(c)); }

      Promise.all(ps).then(function(values) {
        var items = [];
        for (var v of values) {
          items = items.concat(v);
        }
        console.log(`${items.length} items found on STN`)
        resolve(items);
      });


    });
  }

  static BrowsePagesOfCategory(category)
  {
    var total_items = [];
    var last_items_len = null;
    var page = 1;
    var self = this;

    return new Promise(function(resolve) {

      (function loop(i) {
        if(last_items_len == 0) { return resolve(total_items); }

          if (true) new Promise((reslv) => {
            self.GetItemsInPage(category, i).then((items)=>{
              total_items = total_items.concat(items)
              last_items_len = items.length;

              console.log(`[tf2] Found ${items.length} items in '${category}' page ${i} (Total: ${total_items.length})`)
              reslv();
            });

          }).then(loop.bind(self, i+1));
      })(page);

    });
  }

  static GetItemsInPage(category, page)
  {
    var colors_quality = {"#FFD700": 6, "#CF6A32": 11, "#830000": 14, "#4D7455": 1, "#38F3AB": 13, "#476291": 3, "#8650AC": 5};
    var self = this;
    return new Promise(function(resolve, reject) {
      TBRequest.GetBody(`https://stntrading.eu/backend/itemOverviewAjax?query=0&page=${page}&category=${category}&sort=1`).then((body)=>{
        var items = [];
        var items_html = splitStringSegments(JSON.parse(decodeEntities(body)).html, "<div class='search-res-item-wrap'>", "</div></div></a></div>");

        for(var h of items_html)
        {
          var info = {};
          info.full_name = splitStringSegments(h, "<span class='item-name'>", "</span>", true);

          info.name = info.full_name;

          info.craftable = info.full_name.indexOf("Non-Craftable") == -1;

          if(!info.craftable) {
            info.name = info.name.replace("Non-Craftable ", "");
          }

          var n = h.indexOf("border-color:");
          info.quality = colors_quality[h.slice(n, h.indexOf(";", n)).split(" ")[1]];

          info.img = splitStringSegments(h, "<img src='", "' ></img>", true);
          info.href = splitStringSegments(h, "<div class='search-res-item-wrap'><a href='", "'><div class='search-res-item", true);

          if(info.quality == 11) {
            info.name = info.name.replace("Strange ", "");
          }
          if(info.quality == 1) {
            info.name = info.name.replace("Genuine ", "");
          }
          if(info.quality == 3) {
            info.name = info.name.replace("Vintage ", "");
          }
          if(info.quality == 5) {
            info.name = info.name.replace("Unusual ", "");
          }

          items.push(info);
        }

        resolve(items);
      })
    });
  }
}

module.exports = TBStn;


function splitStringSegments(text, from, to, onlyInside) {
  var el = [];
  var str = text;
  while (str.indexOf(from) != -1) {
      var seg = str.slice(str.indexOf(from), str.indexOf(to) + to.length);
      el.push(onlyInside ? (seg.replace(from, "").replace(to, "")) : seg);
      str = str.replace(seg, "");
  }
  return el.length == 1 ? el[0] : el;
}

function decodeEntities(encodedString) {
    var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    var translate = {
        "nbsp":" ",
        "amp" : "&",
        "quot": "\'",
        "lt"  : "<",
        "gt"  : ">"
    };
    return encodedString.replace(translate_re, function(match, entity) {
        return translate[entity];
    }).replace(/&#(\d+);/gi, function(match, numStr) {
        var num = parseInt(numStr, 10);
        return String.fromCharCode(num);
    });
}

function getElementsInString(str) {
  var parts = [];
  while (str.indexOf("<") != -1) {
    var sl = str.slice(0, str.indexOf(">")+1);
    str = str.replace(sl, "");
    sl = sl.replace(/\n/g, '');
    sl = sl.replace(/  /g, '');
    parts.push(sl);
  }
  return parts;
}
