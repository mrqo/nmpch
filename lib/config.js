var config = {};

config.test = {"page": "https://webbrowsertools.com/darkmode/"};

config.welcome = {
  set open (val) {app.storage.write("support", val)},
  set lastupdate (val) {app.storage.write("lastupdate", val)},
  get open () {return app.storage.read("support") !== undefined ? app.storage.read("support") : true},
  get lastupdate () {return app.storage.read("lastupdate") !== undefined ? app.storage.read("lastupdate") : 0}
};

config.automatic = {
  set on (val) {app.storage.write("automatic-on", val)},
  set off (val) {app.storage.write("automatic-off", val)},
  set mode (val) {app.storage.write("automatic-mode", val)},
  get on () {return app.storage.read("automatic-on") || "00:00"},
  get off () {return app.storage.read("automatic-off") || "00:00"},
  get mode () {return app.storage.read("automatic-mode") !== undefined ? app.storage.read("automatic-mode") : false}
};

config.hotkey = {
  set add (val) {app.storage.write("hotkey-add", val)},
  set mode (val) {app.storage.write("hotkey-mode", val)},
  set remove (val) {app.storage.write("hotkey-remove", val)},
  set addcombo (val) {app.storage.write("hotkey-addcombo", val)},
  set modecombo (val) {app.storage.write("hotkey-modecombo", val)},
  set removecombo (val) {app.storage.write("hotkey-removecombo", val)},
  get addcombo () {return app.storage.read("hotkey-addcombo") || "Ctrl + Shift + U"},
  get modecombo () {return app.storage.read("hotkey-modecombo") || "Ctrl + Shift + Y"},
  get removecombo () {return app.storage.read("hotkey-removecombo") || "Ctrl + Shift + F"},
  get add () {return app.storage.read("hotkey-add") !== undefined ? app.storage.read("hotkey-add") : true},
  get mode () {return app.storage.read("hotkey-mode") !== undefined ? app.storage.read("hotkey-mode") : true},
  get remove () {return app.storage.read("hotkey-remove") !== undefined ? app.storage.read("hotkey-remove") : true}
};

config.whitelist = {
  set array (val) {app.storage.write("whitelist", JSON.stringify(val))},
  get array () {
    var tmp = app.storage.read("whitelist");
    if (!tmp || tmp === undefined || typeof tmp === "undefined") {
      return (navigator.userAgent.indexOf("Firefox") !== -1 ? ["askubuntu.com", "www.amazon.com", "keep.google.com", "www.facebook.com", "linuxfoundation.org"] : []);
    } else return JSON.parse(tmp || "[]");
  },
  "remove": function () {
    app.tab.query.active(function (tab) {
      if (tab) {
        if (tab.url) {
          var tmp = config.whitelist.array;
          var host = new URL(tab.url).host;
          /*  */
          if (tmp.indexOf(host) !== -1) {
            tmp.splice(tmp.indexOf(host), 1);
            config.whitelist.array = tmp;
            /*  */
            if (tab) {
              core.update("page", {
                "top": tab.url,
                "tabId": tab.id
              });
            }
          }
        }
      }
    });
  },
  "add": function () {
    app.tab.query.active(function (tab) {
      if (tab) {
        if (tab.url) {
          var tmp = config.whitelist.array;
          var host = new URL(tab.url).host;
          /*  */
          if (tmp.indexOf(host) === -1) {
            tmp.push(host);
            config.whitelist.array = tmp;
            /*  */
            if (tab) {
              core.update("page", {
                "top": tab.url,
                "tabId": tab.id
              });
            }
          }   
        }
      }
    });
  }
};

config.addon = {
  set mode (val) {app.storage.write("dimmerMode", val)},
  set frame (val) {app.storage.write("dimmerFrame", val)},
  set bodydark (val) {app.storage.write("bodyDark", val)},
  set hasblack (val) {app.storage.write("hasBlack", val)},
  get mode () {return app.storage.read("dimmerMode") || "ON"},
  set hasbackgroundcolor (val) {app.storage.write("hasBackgroundColor", val)},
  set hasbackgroundimage (val) {app.storage.write("hasBackgroundImage", val)},
  get hasblack () {return app.storage.read("hasBlack") !== undefined ? app.storage.read("hasBlack") : true},
  get bodydark () {return app.storage.read("bodyDark") !== undefined ? app.storage.read("bodyDark") : false},
  get frame () {return app.storage.read("dimmerFrame") !== undefined ? app.storage.read("dimmerFrame") : false},
  get hue () {return parseInt(app.storage.read("dimmerHue") !== undefined ? app.storage.read("dimmerHue") : "360")},
  get hasbackgroundcolor () {return app.storage.read("hasBackgroundColor") !== undefined ? app.storage.read("hasBackgroundColor") : false},
  get hasbackgroundimage () {return app.storage.read("hasBackgroundImage") !== undefined ? app.storage.read("hasBackgroundImage") : false},
  set hue (val) {
    if (!val || isNaN(val)) val = 0;
    val = parseInt(val);
    if (val < 0) val = 0;
    if (val > 360) val = 360;
    app.storage.write("dimmerHue", val);
  },
  get contrast () {return parseInt(app.storage.read("contrastScale") !== undefined  ? app.storage.read("contrastScale") : "100")},
  set contrast (val) {
    if (!val || isNaN(val)) val = 0;
    val = parseInt(val);
    if (val < 0) val = 0;
    if (val > 200) val = 100;
    app.storage.write("contrastScale", val);
  },
  get brightness () {return parseInt(app.storage.read("dimmerScale") !== undefined ? app.storage.read("dimmerScale") : "100")},
  set brightness (val) {
    if (!val || isNaN(val)) val = 0;
    val = parseInt(val);
    if (val < 0) val = 0;
    if (val > 100) val = 100;
    app.storage.write("dimmerScale", val);
  },
  get grayscale () {return parseInt(app.storage.read("grayScale") !== undefined ? app.storage.read("grayScale") : "0")},
  set grayscale (val) {
    if (!val || isNaN(val)) val = 0;
    val = parseInt(val);
    if (val < 0) val = 0;
    if (val > 100) val = 100;
    app.storage.write("grayScale", val);
  },
  get sepia () {return parseInt(app.storage.read("sepiaScale") !== undefined ? app.storage.read("sepiaScale") : "100")},
  set sepia (val) {
    if (!val || isNaN(val)) val = 0;
    val = parseInt(val);
    if (val < 0) val = 0;
    if (val > 100) val = 100;
    app.storage.write("sepiaScale", val);
  }
};

config.get = function (name) {return name.split('.').reduce(function (p, c) {return p[c]}, config)};

config.set = function (name, value) {
  function set(name, value, scope) {
    name = name.split('.');
    if (name.length > 1) {
      set.call((scope || this)[name.shift()], name.join('.'), value);
    } else {
      this[name[0]] = value;
    }
  }
  /*  */
  set(name, value, config);
};
