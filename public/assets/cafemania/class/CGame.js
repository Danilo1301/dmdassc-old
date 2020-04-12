class CGame {
  static bPreloadFinished = false;
  static bOnLogin = false;
  static bOnMainLoad = false;
  static bOnGame = false;

  static Initializate() {
    this.PreLoad();
    CInput.Initializate();
    CGameLoop.Initializate();
  }

  static PreLoad() {
    CLoader.RequestImage("bars/bar1.png", "bar1");
    CLoader.RequestImage("bars/bar1_cut.png", "bar1_cut");
    CLoader.RequestImage("bg/bg_load1.png", "bg_load1");
    CLoader.RequestImage("bg_loadbar1.png", "bg_loadbar1");
    CLoader.RequestImage("btn_login.png", "btn_login");
    CLoader.RequestImage("logo.png", "logo");

    CLoader.LoadAssets().then(()=>{

      CGApi.Load().then((isLoggedIn)=> {
        this.bPreloadFinished = true;
        if(isLoggedIn) {
          this.MainLoad();
          return;
        }
        this.bOnLogin = true;
        this.button_login = CGui.CreateButton("login", "ENTRAR", 1024/2, 768/2 + 90, 200, 50);
        this.button_login.OnClick((() => {
          CGApi.SignIn().then((result)=>{
            if(!result) { return }
            CGApi.GetProfile();
            this.bOnLogin = false;
            this.button_login.Destroy();
            this.MainLoad();
          });
        }).bind(this));
      })
    });
  }

  static MainLoad() {
    this.bOnMainLoad = true;
    this.loadbar_loading1 = CGui.CreateLoadBar("loading1", "bar1", 207, 657, [611, 28])

    CMap.Create();

    CLoader.RequestImage("street.png", "street");
    for (var i = 0; i < 10; i++) { //simulating load ._.
      CLoader.RequestAudio("som19.wav", "sound_"+i);
    }

    CNetwork.Connect().then(()=> {
      CLoader.LoadAssets().then(()=>{
        this.loadbar_loading1.Destroy();
        this.bOnMainLoad = false;
        this.bOnGame = true;
      });
    });


  }

  static GameTick(deltaTime) {
    CScreen.Resize();

    if(!this.bPreloadFinished) { return CScreen.FillBackground("black"); }

    this.Update(deltaTime);
    this.Render();
  }

  static Update(deltaTime) {
    if(this.bOnMainLoad) {
      if(!CNetwork.connected) {
        this.loadbar_loading1.progress = 0;
      } else {
        this.loadbar_loading1.progress = CLoader.progress[0] / CLoader.progress[1];
      }

    }

    CGui.Update(deltaTime);
  }

  static Render() {

    if(this.bOnGame) {
      CScreen.FillBackground(CAssets.Get("white"));
    } else {
      CScreen.FillBackground(CAssets.Get("bg_load1"));
      if(this.bOnLogin) {
        CScreen.Font.size = 32;
        CScreen.SetAttribute("textAlign", "center");
        CScreen.SetAttribute("fillStyle", "#F7E718");
        CScreen.SetAttribute("strokeStyle", "#623300");
        CScreen.FillOutlineText(`Você não está logado!`, 512, 280, 8);

        CScreen.ctx.globalAlpha = this.loadingOpacity;
        CScreen.Font.size = 25;
        CScreen.SetAttribute("fillStyle", "#ffffff");
        CScreen.SetAttribute("strokeStyle", "#000000");
        CScreen.FillOutlineText(`Entre com sua conta Google para continuar`, 512, 380, 8);
        CScreen.ctx.globalAlpha = 1.0;
      }

      if(this.bOnMainLoad) {
        CScreen.DrawImage(CAssets.Get("logo"), 1024/2 - 450/2, 40, 450, 250);
        CScreen.DrawImage(CAssets.Get("bg_loadbar1"), 1024/2 - 670/2, 645);
      }
    }

    CGui.Render();
  }
}
