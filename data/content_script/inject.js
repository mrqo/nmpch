var background = (function () {
  var tmp = {};
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    for (var id in tmp) {
      if (tmp[id] && (typeof tmp[id] === "function")) {
        if (request.path === "background-to-page") {
          if (request.method === id) tmp[id](request.data);
        }
      }
    }
  });
  /*  */
  return {
    "receive": function (id, callback) {tmp[id] = callback},
    "send": function (id, data) {chrome.runtime.sendMessage({"path": "page-to-background", "method": id, "data": data})}
  }
})();

var config = {
  "night": {
    "mode": {
      "object": {},
      "element": {},
      "top": {"url": ''},
      "host": {"name": ''},
      "is": {"iframe": ''},
      "whitelist": {"string": ''},
      "inject": {"permission": false},
      "black": {"colors": {"string": ''}},
      "white": {"colors": {"string": ''}},
      "color": {"body": '', "html": '', "background": ''}
    }
  },
  "methods": {
    "style": {
      "remove": function () {
        config.night.mode.element.style.textContent = '';
        config.night.mode.element.link.removeAttribute("href");
      },
      "mutation": function (e) {
        const callback = function (mutations) {
          for (let mutation of mutations) {
            if (mutation.type === "childList") {
              var addedNodes = Array.from(mutation.addedNodes);
              /*  */
              for (var i = 0; i < addedNodes.length; i++) {
                var node = addedNodes[i];
                if (node.nodeType !== 3) {
                  if (node instanceof Element) {
                    try {
                      var tmp = window.getComputedStyle(node, null);
                      var a = e.backgroundimage && tmp.backgroundImage && tmp.backgroundImage !== "none";
                      var b = e.backgroundcolor && tmp.backgroundColor && tmp.backgroundColor !== "none";
                      var c = b && config.night.mode.white.colors.string.indexOf(tmp.backgroundColor.replace(/ /g, '')) === -1;
                      if (a || c) {
                        node.classList.add("night-mode-extra-class-for-background-image");
                      }
                    } catch (e) {}
                  }
                }
              }
            }
          }
        };
        /*  */
        const observer = new MutationObserver(callback);
        var container = document.documentElement;
        observer.observe(container, {"childList": true, "subtree": true});
        window.addEventListener("load", function () {
          window.setTimeout(function () {
            observer.disconnect();
          }, 10 * 1000);
        });
      },
      "add": function (o) {
        if (JSON.stringify(o) === JSON.stringify(config.night.mode.object)) return;
        if (document.documentElement && document.body) config.night.mode.object = o;
        /*  */
        var sepia = parseInt(o.sepia);
        var contrast = parseInt(o.contrast);
        var grayscale = parseInt(o.grayscale);
        var brightness = parseInt(o.brightness);
        var http = document.location.href.indexOf("http") === 0;
        var href = config.night.mode.element.link.getAttribute("href");
        /*  */
        config.night.mode.top.url = window === window.top;
        config.night.mode.is.iframe = o.frame && window !== window.top;
        config.night.mode.host.name = o.top ? new URL(o.top).host : '';
        config.night.mode.whitelist.string = o.whitelist ? o.whitelist.join('|') : '';
        config.night.mode.black.colors.string = ["black", "#000", "#000000", "rgb(0,0,0)", "rgba(0,0,0,1)"].join('|');
        config.night.mode.color.body = document.body ? (window.getComputedStyle(document.body, null).backgroundColor || 'N/A').replace(/ /g, '') : 'N/A';
        config.night.mode.white.colors.string = ["white", "#FFF", "#FFFFFF", "rgb(255,255,255)", "rgba(255,255,255,1)", "transparent", "rgba(0,0,0,0)", "rgba(255,255,255,0)"].join('|');
        config.night.mode.color.html = document.documentElement ? (window.getComputedStyle(document.documentElement, null).backgroundColor || 'N/A').replace(/ /g, '') : 'N/A';
        config.night.mode.color.background = o.hasblack ? (config.night.mode.black.colors.string.indexOf(config.night.mode.color.body) !== -1 || config.night.mode.black.colors.string.indexOf(config.night.mode.color.html) !== -1) : false;
        /*  */
        config.night.mode.inject.permission = (config.night.mode.color.background === false) ? (o.top ? config.night.mode.whitelist.string.indexOf(config.night.mode.host.name) === -1 : true) : false;
        if (config.night.mode.inject.permission === false) return config.methods.style.remove();
        if (config.night.mode.top.url === false && !o.frame) config.methods.style.remove();
        /*  */
        if (config.night.mode.top.url || config.night.mode.is.iframe) {
          if (o.mode === "OFF") {
            config.night.mode.element.style.textContent =
                                (http ?               "html " : "body ") +
                                                      "{" +
                                                      "background-color: #010101 " +
                                                      "!important; " +
                                                      "filter: invert(100%) " +
                                (o.hue !== 360 ?      "hue-rotate(" + o.hue + "deg) " : '') +
                                (grayscale !== 0 ?    "grayscale(" + grayscale + "%) " : '') +
                                (contrast !== 100 ?   "contrast(" + contrast + "%) " : '') +
                                (brightness !== 100 ? "brightness(" + brightness + "%) " : '') +
                                (sepia !== 100 ?      "sepia(" + sepia + "%) " : '') +
                                                      "!important;" +
                                                      "}" +
                                (o.bodydark ?         " body {background: #DDDDDD !important}" : '');
            /*  */
            if (o.backgroundimage || o.backgroundcolor) config.methods.style.mutation(o);
            if (href !== config.night.mode.element.path) {
              config.night.mode.element.link.setAttribute("href", config.night.mode.element.path);
            }
          } else {
            config.methods.style.remove();
            var white = "background-color: #FFFFFF";
            var a = grayscale !== 0 ? "grayscale(" + grayscale + "%) " : '';
            var b = contrast !== 100 ? "contrast(" + contrast + "%) " : '';
            var c = brightness !== 100 ? "brightness(" + brightness + "%) " : '';
            var d = sepia !== 100 ? "sepia(" + sepia + "%) " : '';
            var filter = (a || b || c || d) ? " filter: " + (a + b + c + d) + "!important;" : '';
            config.night.mode.element.style.textContent = (http ? "html" : "body") + " {" + white + " !important;" + filter + "} body {" + white + ";}";
          }
        }
      }
    }
  }
};

config.night.mode.element.link = document.getElementById("night-mode-pro-link");
config.night.mode.element.style = document.getElementById("night-mode-pro-style");
config.night.mode.element.path = chrome.runtime.getURL("data/content_script/inject.css");
config.night.mode.element.head = document.documentElement || document.head || document.querySelector("head");

if (!config.night.mode.element.style) {
  config.night.mode.element.style = document.createElement("style");
  config.night.mode.element.style.setAttribute("lang", "en");
  config.night.mode.element.style.setAttribute("type", "text/css");
  config.night.mode.element.style.setAttribute("id", "night-mode-pro-style");
  if (config.night.mode.element.head) config.night.mode.element.head.insertBefore(config.night.mode.element.style, config.night.mode.element.head.firstChild);
}

if (!config.night.mode.element.link) {
  config.night.mode.element.link = document.createElement("link");
  config.night.mode.element.link.setAttribute("type", "text/css");
  config.night.mode.element.link.setAttribute("rel", "stylesheet");
  config.night.mode.element.link.setAttribute("id", "night-mode-pro-link");
  if (config.night.mode.element.head) config.night.mode.element.head.appendChild(config.night.mode.element.link);
}

background.send("load");
background.receive("storage", config.methods.style.add);
