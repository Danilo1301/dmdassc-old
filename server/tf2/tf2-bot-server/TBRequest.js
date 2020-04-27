const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const TBQuality = require("./TBQuality");
const TBConversor = require("./TBConversor");

const fs = require("fs");

const offer_blacklist_words = ["lvl", "level", "halloween", "painted", "spectral", "spectrum", "part", "spell", "voices", "below", "footprints", "lime", "pink", "black", "white", "orange", "light green", "purple", "gold", "team spirit", "after eight", "value of teamwork"];

module.exports = class {
  static GetBody(url) {
    var self = this;
    return new Promise(function(resolve) {

      const tryFetch = function() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.setRequestHeader("Content-type", "text/plain; charset=UTF-8");
        xhr.send(null);
        xhr.onload = function () { resolve(xhr.responseText); }
        xhr.onerror = function () {
          console.log(`XML ERROR at (${url})`);
          console.log(`Retrying in 5 seconds...`);
          setTimeout(()=> { tryFetch() }, 5000)
        }
      };

      tryFetch();
    });
  }
};
