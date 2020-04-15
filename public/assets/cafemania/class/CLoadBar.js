class CLoadBar {
  constructor(name, texture_name, x, y, size) {
    this.name = name;
    this.texture_name = texture_name;

    this.x = x;
    this.y = y;

    this.width = size[0];
    this.height = size[1];
    this.texture_width = size[0]; //I have to fix this :'(
    this.texture_height = size[1];

    this.Textures = [];

    this.Render1 = {canvas: document.createElement('canvas')};
    this.Render1.ctx = this.Render1.canvas.getContext('2d');
    this.Render1.canvas.width = this.texture_width;
    this.Render1.canvas.height = this.texture_height;

    this.progress = 0;

    this.SetupTextures();
  }

  SetupTextures() {
    var txd_cut = CAssets.Get(this.texture_name + "_cut");
    var w = (txd_cut.width-1)/2;

    this.Textures.push(CAssets.Get(this.texture_name));
    this.Textures.push(CAssets.CreateAsset(this.texture + "_cut_L", CScreen.CropImage(txd_cut, 0, 0, w, txd_cut.height)).e);
    this.Textures.push(CAssets.CreateAsset(this.texture + "_cut_R", CScreen.CropImage(txd_cut, w+1, 0, w, txd_cut.height)).e);
  }

  Draw() {
    var ctx = this.Render1.ctx;

    if(this.progress > 1) { this.progress = 1; }
    if(this.progress < 0) { this.progress = 0; }

    var txd_bar = this.Textures[0];
    var txd_clipL = this.Textures[1];
    var txd_clipR = this.Textures[2];

    ctx.globalCompositeOperation = "source-over";

    for (var i = 0; i < Math.ceil(this.texture_width / txd_bar.width); i++) {
      ctx.drawImage(txd_bar, i*txd_bar.width, 0, txd_bar.width, this.texture_height);
    }

    ctx.globalCompositeOperation='destination-out';

    var width = this.width*this.progress;
    var w = txd_clipL.width;

    ctx.drawImage(txd_clipL, 0, 0, w, this.height);
    ctx.drawImage(txd_clipR, width-w, 0, w, this.height);

    ctx.globalCompositeOperation='destination-in';

    ctx.fillRect(0, 0, width, this.height);

    ctx.globalCompositeOperation = "source-over";

    CScreen.DrawImage(this.Render1.canvas, this.x, this.y, this.width, this.height);
  }

  Destroy() {
    delete CGui.LoadBars[this.name];
  }
}
