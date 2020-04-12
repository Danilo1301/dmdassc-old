class CInput {
  static Mouse = {x: 0, y: 0};

  static Initializate() {


    window.addEventListener("mousemove", e => {
      var rect = CScreen.canvas.getBoundingClientRect();

      this.Mouse.x = (e.clientX - rect.left) / CScreen.scale.x,
      this.Mouse.y = (e.clientY - rect.top) / CScreen.scale.y
    });

    window.addEventListener("mouseup", e => {
      this.Mouse.down = false;
    });

    window.addEventListener("mousedown", e => {
      this.Mouse.down = true;
    });
  }
}
