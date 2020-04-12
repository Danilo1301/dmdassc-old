class CAssets {
  static Assets = {};

  static HasLoaded(name) {
    return this.Assets[name].loaded;
  }

  static Get(name) {
    if(!this.Assets[name]) { return undefined; }
    return this.Assets[name].e;
  }

  static CreateAsset(name, e) {
    return this.Assets[name] = new CAsset(e, "", name);
  }
}

class CAsset {
  constructor(e, src, name) {
    this.e = e;
    this.src = src;
    this.name = name;
    this.loaded = false;
    this.width = e.width;
    this.height = e.height;
  }



  Load() {
    return new Promise((function(resolve, reject) {
      this.e.src = '/assets/cafemania/img/' + this.src;

      var onload = function() {
        resolve();
        this.loaded = true;
      }

      if(this.e instanceof Audio) {
        this.e.oncanplaythrough = onload.bind(this);
      } else {
        this.e.onload = onload.bind(this);
      }

    }).bind(this));
  }
}
