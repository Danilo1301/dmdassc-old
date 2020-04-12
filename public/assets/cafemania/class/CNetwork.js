class CNetwork {
  static connected = false;

  static Socket;

  static Connect() {
    return new Promise((function(resolve, reject) {
      var socket = io("/cafemania");
      socket.on("connect", ()=> {});
      socket.on("load_data", (data)=> { this.OnGetLoadData(data, resolve); });
    }).bind(this));
  }

  static OnGetLoadData(data, resolve) {
    this.connected = true;
    console.log(data);
    resolve();
  }
}
