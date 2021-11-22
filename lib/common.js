var core = {
  "start": function () {
    core.load();
  },
  "install": function () {
    core.load();
  },
  "load": function () {
    core.update();
  },
  "update": function (context, e) {
    var options = {
      "hue": config.addon.hue,
      "mode": config.addon.mode,
      "top": e ? e.top || '' : '',
      "sepia": config.addon.sepia,
      "frame": config.addon.frame,
      "hasblack": config.addon.hasblack,
      "bodydark": config.addon.bodydark,
      "contrast": config.addon.contrast,
      "addcombo": config.hotkey.addcombo,
      "whitelist": config.whitelist.array,
      "grayscale": config.addon.grayscale,
      "modecombo": config.hotkey.modecombo,
      "brightness": config.addon.brightness,
      "removecombo": config.hotkey.removecombo,
      "backgroundimage": config.addon.hasbackgroundimage,
      "backgroundcolor": config.addon.hasbackgroundcolor
    };
    /*  */
    core.automatic.timer.run();
    app.button.icon(null, config.addon.mode);
    /*  */
    if (context === "popup") app.popup.send("storage", options);
    if (context === "options") app.options.send("storage", options);
    if (context === "page") {
      core.update("options");
      app.page.send("storage", options, e ? e.tabId : null, e ? e.frameId : null);
    }
  },
  "automatic": {
    "timer": {
      "timeout": {
        "on": null, 
        "off": null
      },
      "run": function () {
        if (config.automatic.mode) {
          core.automatic.timer.on();
          core.automatic.timer.off();
        }
      },
      "on": function () {
        var date = new Date();
        var H = config.automatic.on.split(':')[0];
        var M = config.automatic.on.split(':')[1];
        var diff = new Date(date.getFullYear(), date.getMonth(), date.getDate(), Number(H), Number(M), 0, 0) - date;
        if (diff < 0) diff += 86400000;
        /*  */
        if (core.automatic.timer.timeout.on) clearTimeout(core.automatic.timer.timeout.on);
        core.automatic.timer.timeout.on = setTimeout(function () {
          if (config.automatic.mode) {
            config.addon.mode = "OFF";
            core.update("page");
          }
        }, diff);
      },
      "off": function () {
        var date = new Date();
        var H = config.automatic.off.split(':')[0];
        var M = config.automatic.off.split(':')[1];
        var diff = new Date(date.getFullYear(), date.getMonth(), date.getDate(), Number(H), Number(M), 0, 0) - date;
        if (diff < 0) diff += 86400000;
        /*  */
        if (core.automatic.timer.timeout.off) clearTimeout(core.automatic.timer.timeout.off);
        core.automatic.timer.timeout.off = setTimeout(function () {
          if (config.automatic.mode) {
            config.addon.mode = "ON";
            core.update("page");
          }
        }, diff);
      }
    }
  }
};

app.popup.receive("load", function () {
  core.update("popup");
});

app.page.receive("load", function (e) {
  core.update("page", e);
});

app.options.receive("load", function () {
  core.update("options");
});

app.options.receive("store", function (e) {
  config.whitelist.array = e.whiteList;
  core.update("page");
});

app.options.receive("get", function (pref) {
  app.options.send("set", {
    "pref": pref, 
    "value": config.get(pref)
  });
});

app.options.receive("changed", function (e) {
  config.set(e.pref, e.value);
  /*  */
  app.options.send("set", {
    "pref": e.pref, 
    "value": config.get(e.pref)
  });
  /*  */
  core.update("page");
});

app.popup.receive("store", function (e) {
  config.addon.brightness = e.brightness;
  config.addon.grayscale = e.grayscale;
  config.addon.contrast = e.contrast;
  config.addon.sepia = e.sepia;
  config.addon.mode = e.mode;
  config.addon.hue = e.hue;
  /*  */
  core.update("page");
});

app.hotkey.on.pressed(function (e) {
  if (e === "add-to-whitelist" && config.hotkey.add) {
    config.whitelist.add();
  } else if (e === "remove-from-whitelist" && config.hotkey.remove) {
    config.whitelist.remove();
  } else if (e === "toggle-night-mode" && config.hotkey.mode) {
    config.addon.mode = config.addon.mode === "ON" ? "OFF" : "ON";
    core.update("page");
  }
  /*  */
  core.update("popup");
});

app.tab.on.created(function (tab) {core.update("page", tab)});
app.tab.on.updated(function (info, tab) {core.update("page", tab)});

app.popup.receive("options", app.tab.options);
app.popup.receive("addwhitelist", config.whitelist.add);
app.popup.receive("removewhitelist", config.whitelist.remove);
app.popup.receive("test", function () {app.tab.open(config.test.page)});
app.popup.receive("support", function () {app.tab.open(app.homepage())});
app.popup.receive("donation", function () {app.tab.open(app.homepage() + "?reason=support")});

app.on.startup(core.start);
app.on.installed(core.install);