// Copyright (c) 2016 The ArMingMo Authors. All rights reserved.

var msgToPopup = [];
msgToPopup[0] = {};
// msgToPopup.forEach(function(tabMsg) {if(tabMsg.tabId == xxx) {console.log('hi',tabMsg.tabId)}})

var msgFromPopup = {};

var serverInfo; // the container to store response information from httpPostString method 
var tabSwitcher = 0; // the state of the active tab


// Global functions ---------------------------------------------------------

// # Tab controls
// get Tab Id
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
// switch tabs and switch container
var getTabIdandSwitch = function() {
  getCurrentTabId(function(id){
    console.log('tabId: '+id);
    var a = msgToPopup.findIndex(function(d) { return d.tabId == id});
    if ( a != -1) {
      tabSwitcher = a;
    } else {
      tabSwitcher = msgToPopup.length;
      console.log('tabSwitcher:',tabSwitcher);
      msgToPopup[tabSwitcher] = {};
      msgToPopup[tabSwitcher].tabId = id;
      msgToPopup[tabSwitcher].state = {};
    }
  })
}

// # Post String to URL and get responses
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
// print serverInfo to console
var responseInfo = function(responseText) {
  console.log(JSON.parse(responseText));
}
// put serverInfo into global vars
var getResponseInfo = function(responseText) {
  serverInfo = JSON.parse(responseText)
}

// bossWar
var bossWar = function(msgObj) {
  sid = msgObj.sid;
  postAddress = msgObj.url;

  var timeFlag = 0;
  var troopFlag = 0;

  // Init
  var serverInfoOri, troopCode, heroInfo, chief;
  var httpRequest = new XMLHttpRequest();


  // functions
  var httpPostStringOri = function(stringContent) {
      httpRequest.open("POST",postAddress,true);
      httpRequest.setRequestHeader("Accept","*/*");
      httpRequest.setRequestHeader("Accept-Language","zh-TW,zh;q=0.8,en-US;q=0.6,en;q=0.4,zh-CN;q=0.2");
      httpRequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
      httpRequest.setRequestHeader("X-Requested-With","ShockwaveFlash/21.0.0.216");
      httpRequest.send(stringContent);
  }

  httpRequest.onreadystatechange=function() {
    if (httpRequest.readyState==4 && httpRequest.status==200) {
      serverInfoOri = JSON.parse(httpRequest.responseText);
      console.log(serverInfoOri);
      if (troopInfoFlag == 0) {
        heroInfo = JSON.stringify(serverInfoOri.heros);
        heroInfo = heroInfo.split("\"").join("\'");
        chief = serverInfoOri.chief;
        troopCode = '{"act":"BossWar.sendTroop","sid":"' + sid + '","body":"{\'heros\':' + heroInfo + ',\'chief\':' + chief + '}"}';
        troopInfoFlag = 1;
      }
    }
  }

  // getTroopInfo from PK
  var getPKTroops = '{"act":"Campaign.getAttFormation","sid":"' + sid + '","body":"{\'march\':\'PK\'}"}';
  var troopInfoFlag = 0;
  console.log(getPKTroops);
  httpPostStringOri(getPKTroops);

  // send troops automatically during 20:00~20:30 at Fri. and Sun.
  var myVar = setInterval(myTimer, 1000);

  function myTimer() {
      var d = new Date();
      console.log(d.toLocaleTimeString());
      if ((d.getDay() == 5||d.getDay() == 0) & d.getHours() == 20 & d.getMinutes() >= 0 & d.getMinutes() <= 30 ) {
        timeFlag = 1;
        troopFlag+= 1;
      }
      else {
        timeFlag = 0;
        clearInterval(myVar);
      }

      if ((troopFlag%31) == 1) {
        sendTroops();
        console.log("送出隊伍!")
      }
  }

  var sendTroops = function () {
    httpPostStringOri(troopCode)
  }
}

// End of global functions ---------------------------------------------------------

// Entrance of scripts -------------------------------------------------------------
// get Initial tabId and listen to webRequest
getCurrentTabId(function(id){
  msgToPopup[tabSwitcher].tabId = id;
  console.log('tabId:',id);

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

})
// listen to the changes of tab activation
chrome.tabs.onActiveChanged.addListener(getTabIdandSwitch)

// listen to connection of extension
chrome.extension.onConnect.addListener(function(port) {
  console.log("Connected .....");
  port.onMessage.addListener(function(msg) {
        console.log("message recieved "+ JSON.parse(msg).msg);
        // popupPostTriggerFunc(msg); 
        msgFromPopup = JSON.parse(msg);
              
        port.postMessage(JSON.stringify(msgToPopup[tabSwitcher]));

        msgToPopup[tabSwitcher].state.manorString = msgFromPopup.state.manorString;
        console.log('check:', JSON.stringify(msgToPopup[tabSwitcher]));
        
  });
});


// popup trigger this function
var popupPostTriggerFunc = function(msg) {
  msgFromPopup = JSON.parse(msg);
  msgToPopup[tabSwitcher].state.manorString = msgFromPopup.state.manorString;
  console.log('check:', msgToPopup[tabSwitcher].state);
  //console.log(JSONObj);
  // BossWarFlagCheck before running boss war
  
  // if((msgFromPopup.state.bossWarTimerCalledFlag) & msgFromPopup.state.fireFlag == 1) {
  //   bossWar(msgToPopup[tabSwitcher]);
  // }
}; 
