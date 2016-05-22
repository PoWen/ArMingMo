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
    var tab = tabs[0];
    tabObj = tabs[0];
    var tabId = tab.id;
    callback(tabId);
  });
}

getCurrentTabId(function(id){
  renderStatus('tabId: '+id);
})

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText + '\n' + document.getElementById('status').textContent;
}

function renderDiv(divName,divText) {
  document.getElementById(divName).textContent = divText;
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
  if (today.getDay() == 0 || today.getDay() == 6) {
    renderStatus('今天有神將!');
    
    if (bossWarTimerCalledFlag == 0) {
      var myVar = setInterval(myTimer, 1000);

      function myTimer() {
        var d = new Date();
        var restSec = 20*3600 - d.getHours()*3600 - d.getMinutes()*60 - d.getSeconds();
        var renderString;
        divString = '神將倒數 ' + Math.floor(restSec/3600) + ':' 
                              + Math.floor((restSec%3600)/60) + ':' 
                              + Math.floor((restSec%3600)%60);
        renderDiv('boss-war-status',divString); 
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

