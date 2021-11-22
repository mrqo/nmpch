var background = (function () {
  var tmp = {};
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    for (var id in tmp) {
      if (tmp[id] && (typeof tmp[id] === "function")) {
        if (request.path === "background-to-popup") {
          if (request.method === id) tmp[id](request.data);
        }
      }
    }
  });
  /*  */
  return {
    "receive": function (id, callback) {tmp[id] = callback},
    "send": function (id, data) {chrome.runtime.sendMessage({"path": "popup-to-background", "method": id, "data": data})}
  }
})();

var config = {
  "handle": {},
  "global": {
    "hue": 360,
    "combo": '',
    "mode": "ON",
    "sepia" : 100,
    "grayscale" : 0,
    "contrast" : 100,
    "brightness": 100,
  },
  "load": function () {
    background.send("load");
    window.removeEventListener("load", config.load, false);
  },
  "store": function () {
    background.send("store", {
      "hue": config.global.hue,
      "mode": config.global.mode,
      "sepia": config.global.sepia,
      "contrast": config.global.contrast,
      "grayscale": config.global.grayscale,
      "brightness": config.global.brightness,
    });
  },
  "toggle": function (flag) {
    var lightson = document.getElementById("lights-on-footer");
    var lightsoff = document.getElementById("lights-off-footer");
    /*  */
    if (flag === "ON") {
      var hueslidervalue = document.getElementById("hue-slider-value");
      var hueslider = document.getElementById("hue-slider");
      lightsoff.setAttribute("active", "false");
      lightson.setAttribute("active", "true");
      hueslidervalue.style.opacity = "0.5";
      hueslider.style.opacity = "0.5";
      hueslider.disabled = true;
    } else {
      var hueslidervalue = document.getElementById("hue-slider-value");
      var hueslider = document.getElementById("hue-slider");
      lightson.setAttribute("active", "false");
      lightsoff.setAttribute("active", "true");
      hueslidervalue.style.opacity = "1.0";
      hueslider.style.opacity = "1.0";
      hueslider.disabled = false;
    }
  },
  "render": function (e) {
    var test = document.getElementById("test");
    var options = document.getElementById("options");
    var support = document.getElementById("support");
    var donation = document.getElementById("donation");
    var lightson = document.getElementById("lights-on");
    var lightsoff = document.getElementById("lights-off");
    var hueslider = document.getElementById("hue-slider");
    var sepiaslider = document.getElementById("sepia-slider");
    var addwhitelist = document.getElementById("add-whitelist");
    var dimmerslider = document.getElementById("dimmer-slider");
    var contrastslider = document.getElementById("contrast-slider");
    var grayscaleslider = document.getElementById("grayscale-slider");
    var removewhitelist = document.getElementById("remove-whitelist");
    /*  */
    config.handle.click = function (e) {
      config.global.mode = e.target.getAttribute("type");
      config.toggle(config.global.mode);
      config.store();
    };
    /*  */
    config.handle.change = function (e) {
      var id = e.target.getAttribute("id");
      if (id.indexOf("hue") !== -1) config.global.hue = e.target.value;
      if (id.indexOf("sepia") !== -1) config.global.sepia = e.target.value;
      if (id.indexOf("dimmer") !== -1) config.global.brightness = e.target.value;
      if (id.indexOf("contrast") !== -1) config.global.contrast = e.target.value;
      if (id.indexOf("grayscale") !== -1) config.global.grayscale = e.target.value;
      config.toggle(config.global.mode);
      config.store();
    };
    /*  */
    lightson.addEventListener("click", config.handle.click);
    lightsoff.addEventListener("click", config.handle.click);
    hueslider.addEventListener("input", config.handle.change);
    sepiaslider.addEventListener("input", config.handle.change);
    dimmerslider.addEventListener("input", config.handle.change);
    contrastslider.addEventListener("input", config.handle.change);
    grayscaleslider.addEventListener("input", config.handle.change);
    test.addEventListener("click", function () {background.send("test")});
    options.addEventListener("click", function () {background.send("options")});
    support.addEventListener("click", function () {background.send("support")});
    donation.addEventListener("click", function () {background.send("donation")});
    addwhitelist.addEventListener("click", function () {background.send("addwhitelist")});
    removewhitelist.addEventListener("click", function () {background.send("removewhitelist")});
    /*  */
    config.global.hue = e.hue;
    config.global.mode = e.mode;
    config.global.sepia = e.sepia;
    config.global.combo = e.modecombo;
    config.global.contrast = e.contrast;
    config.global.grayscale = e.grayscale;
    config.global.brightness = e.brightness;
    /*  */
    config.toggle(config.global.mode);
    hueslider.value = config.global.hue;
    sepiaslider.value = config.global.sepia;
    donation.textContent = "Make a donation";
    support.textContent = "Open support page";
    contrastslider.value = config.global.contrast;
    dimmerslider.value = config.global.brightness;
    grayscaleslider.value = config.global.grayscale;
    test.textContent = "Test and calibrate dark mode";
    addwhitelist.textContent = "Add current page to whitelist (" + e.addcombo + ')';
    removewhitelist.textContent = "Remove current page from whitelist (" + e.removecombo + ')';
    options.textContent = "Open options page (whitelist has " + e.whitelist.length + " items)";
  }
};

background.receive("storage", config.render);
window.addEventListener("load", config.load, false);
