class CLoader {
  static assetQueue = [];
  static progress = [0, 0];

  static RequestImage(src, name) {
    var asset = new CAsset(new Image, src, name);
    this.assetQueue.push(asset);
    CAssets.Assets[name] = asset;
  }

  static RequestAudio(src, name) {
    var asset = new CAsset(new Audio, src, name);
    this.assetQueue.push(asset);
    CAssets.Assets[name] = asset;
  }

  static LoadAssets() {
    this.progress[0] = 0;
    this.progress[1] = this.assetQueue.length;
    var promises = [];
    for (var asset of this.assetQueue) {
      var p = asset.Load();
      p.then(()=>{
        this.progress[0]++;
      });
      promises.push(p);
    }
    this.assetQueue = [];
    return Promise.all(promises);
  }
}
