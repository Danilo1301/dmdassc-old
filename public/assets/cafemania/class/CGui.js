class CGui {
  static LoadBars = {};
  static Buttons = {};

  static CreateLoadBar(name, texture_name, x, y, size) {
    var bar = new CLoadBar(name, texture_name, x, y, size);
    this.LoadBars[name] = bar;
    return bar;
  }

  static CreateButton(name, text, x, y, width, height) {
    var btn = new CButton(name, text, x, y, width, height);
    this.Buttons[name] = btn;
    return btn;
  }

  static Update(deltaTime) {
    for (var buttonName in this.Buttons) {
      this.Buttons[buttonName].Update(deltaTime);
    }
  }

  static Render() {
    for (var buttonName in this.Buttons) {
      this.Buttons[buttonName].Draw();
    }

    for (var barName in this.LoadBars) {
      this.LoadBars[barName].Draw();
    }
  }
}
