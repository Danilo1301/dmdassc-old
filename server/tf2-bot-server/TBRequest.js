const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const TBQuality = require("./TBQuality");

const fs = require("fs");

module.exports = class {
  static GetBody(url) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.setRequestHeader("Content-type", "text/plain; charset=UTF-8");
      xhr.send(null);
      xhr.onload = function () { resolve(xhr.responseText); }
    });
  }

  static GetPrices_STN(url)
  {
    var self = this;
    return new Promise(function(resolve) {
      self.GetBody(url).then((body)=>{
        console.log(body)
      });

    });
  }

  static GetStnItemsInPage(category, page)
  {
    var colors_quality = {"#FFD700": 6, "#CF6A32": 11, "#830000": 14, "#4D7455": 1, "#38F3AB": 13, "#476291": 3, "#8650AC": 5};
    var self = this;
    return new Promise(function(resolve, reject) {
      self.GetBody(`https://stntrading.eu/backend/itemOverviewAjax?query=0&page=${page}&category=${category}&sort=1`).then((body)=>{
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

          if(info.quality == 5) {
            info.name = info.name.replace("Unusual ", "");
          }

          items.push(info);
        }

        resolve(items);
      })
    });
  }

  static GetBackpackSpreadsheetItems()
  {
    var colors_quality = {"#FFD700": 6, "#CF6A32": 11, "#830000": 14, "#4D7455": 1, "#38F3AB": 13, "#476291": 3};
    var self = this;
    var total_items = [];

    return new Promise(function(resolve) {
      self.GetBody(`https://backpack.tf/spreadsheet`).then((body)=>{
        var table = body.slice(body.indexOf('<tbody>')+7, body.indexOf('</tbody>'));

        var el_items = splitStringSegments(table, "<tr data-craftable='", "</tr>");

        for (var ei of el_items) {
          var item = {};

          var elements = getElementsInString(ei);
          item.name = elements[2].split("<")[0];
          item.craftable = elements[0].split("'")[1] == "1";
          item.qualities = {};

          if(item.name.endsWith(" ")) {
            item.name = item.name.slice(0, item.name.length-1);
          }

          for (var e of elements) {
            if(e.indexOf("<td abbr=") != -1 && e.indexOf("style") != -1) {
              var color = e.slice(e.indexOf(": ")+2, e.indexOf(";"));
              item.qualities[colors_quality[color]] =  elements[elements.indexOf(e)+1].split("'")[3];
            }
          }

          total_items.push(item);
        }

        resolve(total_items);
      });

    });


  }
};


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
  //console.log(`sobro: (${str})`)
}
