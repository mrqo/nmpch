var background = (function () {
  var tmp = {};
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    for (var id in tmp) {
      if (tmp[id] && (typeof tmp[id] === "function")) {
        if (request.path === "background-to-options") {
          if (request.method === id) tmp[id](request.data);
        }
      }
    }
  });
  /*  */
  return {
    "receive": function (id, callback) {tmp[id] = callback},
    "send": function (id, data) {chrome.runtime.sendMessage({"path": "options-to-background", "method": id, "data": data})}
  }
})();

var config = {
  "whiteList": [],
  "store": function () {
    config.fill(config.whiteList);
    background.send("store", {"whiteList": config.whiteList});
  },
  "add": {
    "input": {
      "field": {
        "item": function () {
          var value = document.getElementById("input-field").value;
          var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
          if (value && regexp.test(value)) {
            var a = document.createElement('a');
            /*  */
            a.href = value;
            value = a.host;
            config.whiteList = config.whiteList.filter(function (e) {return e !== value});
            config.whiteList.push(value);
            config.store();
            /*  */
            document.getElementById("input-field").value = '';
          }
        }
      }
    }
  },
  "connect": function (elem, pref) {
    var att = "value";
    if (elem) {
      if (elem.type === "checkbox") att = "checked";
      if (elem.localName === "span") att = "textContent";
      if (elem.localName === "select") att = "selectedIndex";
      /*  */
      var pref = elem.getAttribute("data-pref");
      background.send("get", pref);
      elem.addEventListener("change", function () {
        background.send("changed", {
          "pref": pref, 
          "value": this[att]
        });
      });
    }
    /*  */
    return {
      get value () {return elem[att]},
      set value (val) {
        if (elem.type === "file") return;
        elem[att] = val;
      }
    }
  },
  "load": function () {
    config.whiteList = [];
    /*  */
    var prefs = [...document.querySelectorAll("*[data-pref]")];
    prefs.map(function (elem) {
      var pref = elem.getAttribute("data-pref");
      window[pref] = config.connect(elem, pref);
    });
    /*  */
    document.getElementById("input-field-add").addEventListener("click", config.add.input.field.item);
    /*  */
    document.getElementById("input-field").addEventListener("keypress", function (e) {
      if (e.keyCode === 13) {
        config.add.input.field.item(e);
      }
    });
    /*  */
    document.getElementById("white-list-table").addEventListener("click", function (e) {
      if (e.target.tagName.toLowerCase() === "td" || e.target.nodeName.toLowerCase() === "td") {
        if (e.target.getAttribute("type") === "close") {
          var url = e.target.parentNode.childNodes[1].textContent;
          config.whiteList = config.whiteList.filter(function (e) {return e && e !== url});
          /*  */
          config.store();
        }
      }
    });
    /*  */
    background.send("load");
    window.removeEventListener("load", config.load, false);
  },
  "fill": function (arr) {
    config.whiteList = arr;
    /*  */
    var count = 1;
    var table = document.getElementById("white-list-table");
    table.textContent = '';
    /*  */
    for (var i = arr.length - 1; i >= 0; i--) {
      var a = document.createElement('a');
      var tr = document.createElement("tr");
      var td1 = document.createElement("td");
      var td2 = document.createElement("td");
      var td3 = document.createElement("td");
      /*  */
      td1.textContent = count;
      td1.setAttribute("type", "number");
      td2.appendChild(a);
      a.textContent = arr[i];
      a.href = "https://" + arr[i];
      a.setAttribute("target", "_blank");
      /*  */
      td2.setAttribute("type", "item");
      td3.setAttribute("type", "close");
      td1.setAttribute("style", "color: #555");
      td2.setAttribute("style", "color: #555");
      td3.setAttribute("style", "color: #555");
      /*  */
      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
      table.appendChild(tr);
      count++;
    }
  }
};

background.receive("storage", function (o) {
  config.fill(o.whitelist);
});

background.receive("set", function (o) {
  if (window[o.pref]) {
    window[o.pref].value = o.value;
  };
});

window.addEventListener("load", config.load, false);