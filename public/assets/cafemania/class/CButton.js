class CButton {
  constructor(name, text, x, y, width, height) {
    this.name = name;
    this.text = text;

    this._start_x = x;
    this._start_y = y;
    this._start_width = width;
    this._start_height = height;

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.isMouseOver = false;

    this.scale = 1;
    this.scale_target = 1;

    this.onClick;
    this.pressing = false;
  }

  OnClick(fn) {
    this.onClick = fn;
  }

  Update(deltaTime) {
    this.width = this._start_width;
    this.height = this._start_height;

    this.width *= this.scale;
    this.height *= this.scale;

    this.x = this._start_x - this.width/2
    this.y = this._start_y - this.height/2;

    var mp = CInput.Mouse;

    this.isMouseOver = mp.x >= this.x && mp.x < this.x + this.width && mp.y >= this.y && mp.y < this.y + this.height;

    this.scale = Math.lerp(this.scale, this.scale_target, 1.5 * deltaTime);

    if(this.isMouseOver) {
      if(CInput.Mouse.down) {
        this.scale_target = 0.95;

        if(!this.pressing) {
          this.pressing = true;
        }
      } else {
        if(this.pressing) {
          this.pressing = false;
          this.onClick();
        }
        this.scale_target = 1.1;
      }
    } else {
      this.scale_target = 1.0;
    }

    if(!CInput.Mouse.down && this.pressing) {
      this.pressing = false;
    }
  }

  Destroy() {
    delete CGui.Buttons[this.name];
  }

  Draw() {
    CScreen.ctx.globalAlpha = this.opacity;
    CScreen.DrawImage(CAssets.Get("btn_login"), this.x, this.y, this.width, this.height);


    var fontSize = 16;

    CScreen.Font.size = fontSize * this.scale;
    CScreen.SetAttribute("textAlign", "center");
    CScreen.SetAttribute("fillStyle", "#ffffff");
    CScreen.SetAttribute("strokeStyle", "#000000");
    CScreen.FillText(`ENTRAR`, this.x + this.width/2, this.y + this.height/2 + (5 * this.scale), this.width, 0);
    CScreen.ctx.globalAlpha = 1.0;

  }
}
