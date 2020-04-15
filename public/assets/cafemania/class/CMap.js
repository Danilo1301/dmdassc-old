class CMap {
  static tiles = {};

  static Create() {
    for (var iy = 0; iy < 10; iy++) {
      for (var ix = 0; ix < 8; ix++) {
        this.CreateTile(ix, iy);
      }
    }
  }

  static CreateTile(x, y) {
    var tile = new CTile(x, y);
    this.tiles[tile.name] = tile;
    return tile;
  }
}
