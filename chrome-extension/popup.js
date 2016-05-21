// Copyright (c) 2016 The ArMingMo Authors. All rights reserved.
/**
 * ArMingMo
 *
 */
var msgFromBackground = {};

tabObj = {};
function getCurrentTabId(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];
    tabObj = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var tabId = tab.id;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    //console.assert(typeof id == 'string', 'tab.url should be a string');

    callback(tabId);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, function(tabs) {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

getCurrentTabId(function(id){
  renderStatus('tabId: '+id);
})

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('button1').addEventListener('click', myFirstExtFunc);
  document.getElementById('boss-war').addEventListener('click', bossWar)

});


var myFirstExtFunc = function() {
    console.log('listened!')
    if(msgFromBackground.sid){
      renderStatus('阿明謀成功開啟!');
      document.getElementById("ArMingMo-button-area").style.visibility = 'visible';
    } else {
      renderStatus('請點擊主公頭像');
    }
}


var bossWarTimerCalledFlag = 0;
var bossWar = function() {
  var today = new Date();
  if (today.getDay() == 0 || today.getDay() == 5) {
    renderStatus('今天有神將!');
    
    if (bossWarTimerCalledFlag == 0) {
      var myVar = setInterval(myTimer, 1000);

      function myTimer() {
        var d = new Date();
        var restSec = 20*3600 - d.getHours()*3600 - d.getMinutes()*60 - d.getSeconds();
        var renderString;
        renderString = '神將倒數 ' + Math.floor(restSec/3600) + ':' 
                              + Math.floor((restSec%3600)/60) + ':' 
                              + Math.floor((restSec%3600)%60);
        renderStatus(renderString); 
        // console.log(d.toLocaleTimeString());
        // if (d.getDay() == 0 & d.getHours() == 20 & d.getMinutes() >= 0 & d.getMinutes() <= 30 & d.getSeconds() >= 0) {
        //   timeFlag = 1;
        //   troopFlag+= 1;
        // }
        // else timeFlag = 0;

        // if ((troopFlag%31) == 1) {
        //   sendTroops();
        //   console.log("送出隊伍!")
        // }
      }
      bossWarTimerCalledFlag = 1;
    } else {
      renderStatus('神將已開，請去約會~')
    }

    
  } else {
    renderStatus('今天沒有神將!');
  }
}


// comm. to background.html pages
var port = chrome.extension.connect({name: "Sample Communication"});
port.postMessage("Hi BackGround");
port.onMessage.addListener(function(msg) {
  console.log("message recieved"+ msg);
  msgFromBackground = JSON.parse(msg);
});

