module.exports = class {
  static io;

  static start(_io) {
    var io = this.io = _io.of('/cafemania');

    console.log("[socket:cafemania] Server created!")

    io.on('connection', function (socket) {
      console.log("[socket:cafemania] New connection");

      socket.emit("load_data", {});
    });

  }
}
