// Copyright (c) 2016 The ArMingMo Authors. All rights reserved.

var msgToPopup = [];
msgToPopup[0] = {};
// tabId, 
// msgToPopup.forEach(function(tabMsg) {if(tabMsg.tabId == xxx) {console.log('hi',tabMsg.tabId)}})

var serverInfo; // the container to store response information from httpPostString method 
var tabSwitcher = 0; // the state of the active tab

var getCurrentTabId = function (callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };
  chrome.tabs.query(queryInfo, function(tabs) {
    var tab = tabs[0];
    var tabId = tab.id;
    callback(tabId);
  });
}
getCurrentTabId(function(id){
  msgToPopup[tabSwitcher].tabId = id;
  console.log('tabId:',id);
})

var getTabIdandSwitch = function() {
  getCurrentTabId(function(id){
    console.log('tabId: '+id);
    var a = msgToPopup.findIndex(function(d) { return d.tabId == id});
    console.log('a = ', a);
    if ( a != -1) {
      tabSwitcher = a;
    } else {
      tabSwitcher = msgToPopup.length;
      console.log('tabSwitcher:',tabSwitcher);
      msgToPopup[tabSwitcher] = {};
      msgToPopup[tabSwitcher].tabId = id;
    }
  })
}

chrome.tabs.onActiveChanged.addListener(getTabIdandSwitch)

chrome.webRequest.onBeforeRequest.addListener(
  function(details)
  {
    if((details.method) && details.method == 'POST') {
      var buf = details.requestBody.raw[0].bytes;
      var buf2Int8 = new Int8Array(buf);
      var resultString = "";
      for(i=0;i<buf2Int8.length;i++){resultString+= String.fromCharCode(buf2Int8[i]);}
      JSONObj = JSON.parse(resultString);
      console.log(JSON.stringify(JSONObj));
      if(JSONObj.sid) { 
        msgToPopup[tabSwitcher].sid = JSONObj.sid;
        msgToPopup[tabSwitcher].url = details.url;
      }  
    }
  },  
  {urls: ["http://*.icantw.com/*"]},
  ['requestBody']
);

chrome.extension.onConnect.addListener(function(port) {
  console.log("Connected .....");
  port.onMessage.addListener(function(msg) {
        console.log("message recieved "+ msg);
        port.postMessage(JSON.stringify(msgToPopup[tabSwitcher]));
  });
});


// Post String to URL
// Two kinds of callback:
// i) responseInfo: print the parsed JSON server response to console
// ii) getResponseInfo: put the parsed JSON server response into global variable "serverInfo"
var httpPostString = function(stringContent, url, callback) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.open("POST",url,true);
  httpRequest.setRequestHeader("Accept","*/*");
  httpRequest.setRequestHeader("Accept-Language","zh-TW,zh;q=0.8,en-US;q=0.6,en;q=0.4,zh-CN;q=0.2");
  httpRequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
  httpRequest.setRequestHeader("X-Requested-With","ShockwaveFlash/21.0.0.216");
  httpRequest.send(stringContent);

  httpRequest.onreadystatechange=function() {
    if (httpRequest.readyState==4 && httpRequest.status==200) {
        callback(httpRequest.responseText);
    }
  }
}

var responseInfo = function(responseText) {
  console.log(JSON.parse(responseText));
}

var getResponseInfo = function(responseText) {
  serverInfo = JSON.parse(responseText)
}
