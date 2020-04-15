class CGameLoop {
  static tickFunction;
  static bind;
  static lastTick = null;
  static _frames = 0;
  static lastFpsCheckTime = null;

  static Initializate() {
    this.tickFunction = CGame.GameTick;
    this.bind = CGame;
    this.Loop();
  }

  static Loop() {
    if(Date.now() - this.lastFpsCheckTime > 1000) {
      this.lastFpsCheckTime = Date.now();
      CGame.fps = this._frames;
      this._frames = 0;
    }
    this._frames++;
    this.tickFunction.bind(this.bind)((Date.now() - (this.lastTick || Date.now())) / 60);
    this.lastTick = Date.now();
    window.requestAnimationFrame(this.Loop.bind(this));
  }
}
