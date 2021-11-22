var app = {};

app.hotkey = {
  "on": {
    "pressed": function (callback) {
      chrome.commands.onCommand.addListener(function (e) {
        if (e) {
          if (callback) {
            callback(e);
          }
        }
      });
    }
  }
};

app.popup = {
  "message": {},
  "receive": function (id, callback) {
    app.popup.message[id] = callback;
  },
  "send": function (id, data) {
    chrome.runtime.sendMessage({
      "data": data,
      "method": id,
      "path": "background-to-popup"
    });
  }
};

app.options = {
  "message": {},
  "receive": function (id, callback) {
    app.options.message[id] = callback;
  },
  "send": function (id, data) {
    chrome.runtime.sendMessage({
      "data": data,
      "method": id,
      "path": "background-to-options"
    });
  }
};

app.on = {
  "management": function (callback) {
    chrome.management.getSelf(callback);
  },
  "uninstalled": function (url) {
    chrome.runtime.setUninstallURL(url, function () {});
  },
  "installed": function (callback) {
    chrome.runtime.onInstalled.addListener(function (e) {
      app.storage.load(function () {
        callback(e);
      });
    });
  },
  "startup": function (callback) {
    chrome.runtime.onStartup.addListener(function (e) {
      app.storage.load(function () {
        callback(e);
      });
    });
  },
  "message": function (callback) {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      app.storage.load(function () {
        callback(request, sender, sendResponse);
      });
      /*  */
      return true;
    });
  }
};

app.page = {
  "message": {},
  "receive": function (id, callback) {
    app.page.message[id] = callback;
  },
  "send": function (id, data, tabId, frameId) {
    chrome.tabs.query({}, function (tabs) {
      var tmp = chrome.runtime.lastError;
      if (tabs && tabs.length) {
        var options = {
          "method": id, 
          "data": data,
          "path": "background-to-page"
        };
        /*  */
        tabs.forEach(function (tab) {
          if (tab) {
            if (tabId !== null) {
              if (tabId === tab.id) {
                if (frameId !== null) {
                  chrome.tabs.sendMessage(tab.id, options, {"frameId": frameId});
                } else {
                  chrome.tabs.sendMessage(tab.id, options);
                }
              }
            } else {
              chrome.tabs.sendMessage(tab.id, options);
            }
          }
        });
      }
    });
  }
};

app.button = {
  "timeout": null,
  "icon": function (tabId, path, callback) {
    if (path && typeof path === "object") {
      var options = {"path": path};
      if (tabId) options["tabId"] = tabId;
      /*  */
      if (app.button.timeout) clearTimeout(app.button.timeout);
      app.button.timeout = setTimeout(function () {
        chrome.action.setIcon(options, function (e) {
          if (callback) callback(e);
        }); 
      }, 300);
    } else {
      var options = {
        "path": {
          "16": "../data/icons/" + (path ? path + '/' : '') + "16.png",
          "32": "../data/icons/" + (path ? path + '/' : '') + "32.png",
          "48": "../data/icons/" + (path ? path + '/' : '') + "48.png",
          "64": "../data/icons/" + (path ? path + '/' : '') + "64.png"
        }
      };
      /*  */
      if (tabId) options["tabId"] = tabId;
      /*  */
      if (app.button.timeout) clearTimeout(app.button.timeout);
      app.button.timeout = setTimeout(function () {
        chrome.action.setIcon(options, function (e) {
          if (callback) callback(e);
        }); 
      }, 300);
    }
  }
};

app.storage = (function () {
  chrome.storage.onChanged.addListener(function () {
    chrome.storage.local.get(null, function (e) {
      app.storage.local = e;
      if (app.storage.callback) {
        if (typeof app.storage.callback === "function") {
          app.storage.callback(true);
        }
      }
    });
  });
  /*  */
  return {
    "local": {},
    "callback": null,
    "read": function (id) {
      return app.storage.local[id];
    },
    "clear": function (callback) {
      chrome.storage.local.clear(function () {
        if (callback) {
          callback();
        }
      });
    },
    "on": {
      "changed": function (callback) {
        if (callback) {
          app.storage.callback = callback;
        }
      }
    },
    "write": function (id, data, callback) {
      var tmp = {};
      tmp[id] = data;
      app.storage.local[id] = data;
      chrome.storage.local.set(tmp, function (e) {
        if (callback) callback(e);
      });
    },
    "load": function (callback) {
      var keys = Object.keys(app.storage.local);
      if (keys && keys.length) {
        if (callback) callback("cache");
      } else {
        chrome.storage.local.get(null, function (e) {
          app.storage.local = e;
          if (callback) callback("disk");
        });
      }
    }
  }
})();

app.tab = {
  "options": function () {
    chrome.runtime.openOptionsPage();
  },
  "open": function (url, index, active, callback) {
    var properties = {
      "url": url, 
      "active": active !== undefined ? active : true
    };
    /*  */
    if (index !== undefined) {
      if (typeof index === "number") {
        properties.index = index + 1;
      }
    }
    /*  */
    chrome.tabs.create(properties, function (tab) {
      if (callback) callback(tab);
    }); 
  },
  "query": {
    "index": function (callback) {
      chrome.tabs.query({"active": true, "currentWindow": true}, function (tabs) {
        var tmp = chrome.runtime.lastError;
        if (tabs && tabs.length) {
          callback(tabs[0].index);
        } else callback(undefined);
      });
    },
    "active": function (callback) {
      chrome.tabs.query({"active": true, "currentWindow": true}, function (tabs) {
        var tmp = chrome.runtime.lastError;
        if (tabs && tabs.length) {
          callback(tabs[0]);
        } else callback(undefined);
      });
    }
  },
  "on": {
    "created": function (callback) {
      chrome.tabs.onCreated.addListener(function (tab) {
        app.storage.load(function () {
          callback(tab);
        }); 
      });
    },
    "updated": function (callback) {
      chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
        app.storage.load(function () {
          if (info && info.status) {
            callback(info, tab);
          }
        });
      });
    },
    "activated": function (callback) {
      chrome.tabs.onActivated.addListener(function (activeInfo) {
        app.storage.load(function () {
          chrome.tabs.get(activeInfo.tabId, function (tab) {
            var error = chrome.runtime.lastError;
            callback(tab ? tab : {"id": activeInfo.tabId});
          });
        });
      });
    }
  }
};