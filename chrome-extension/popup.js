// Copyright (c) 2016 The ArMingMo Authors. All rights reserved.
/**
 * ArMingMo
 *
 */

// Container of background and tab Objs
var msgFromBackground = {};
// {
//   tabId: '',
//   sid: '',
//   url: ''
// };
// schema of msgToBackground:
// {
//   tabId: String, // tabId
//   sid: String, // sid
//   url: String, // url
// }
var msgToBackground = {
  state: {
    bossWarTimerCalledFlag: 0,
    fireFlag: 0,
    manorStatus: 1 // 0: manor off, 1: manor on
  },
  tabId: '',
  msg: ''
};
// schema of msgToBackground:
// {
//   state: {
//     bossWarTimerCalledFlag: String, // Flag
//   },
//   tabId: String,
//   msg: String
// }

tabObj = {};

// Global functions -----------------------------------------------------------------
// Get current tabId
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
// Background Connector
var  postToBg = function(msg) {
  var comm = chrome.extension.connect({name: "Communication to Bg"});
  comm.postMessage(msg);
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

// # manor switch
var manorOff = function() {
  var url = msgFromBackground.url;
  var retireString = function(decId) {
    strReturn = '{"act":"Manor.retireAll","sid":"' 
                + msgFromBackground.sid
                +'","body":"{\'decId\':'
                + decId
                + '}"}';
    return strReturn;
  }
  var retireArray = [1, 2, 5, 6, 7, 8, 9, 12];
  for (var i = 0; i < retireArray.length; i++) {
    httpPostString(retireString(retireArray[i]), url, function(){});
  }
}
  // 1 2 5 6 7 8 9 12
  // }
var manorOn = function() {
  var url = msgFromBackground.url;
  var autoAppointString = function(decId) {
    strReturn = '{"act":"Manor.autoAppoint","sid":"' 
                + msgFromBackground.sid
                +'","body":"{\'decId\':'
                + decId
                + '}"}';
    return strReturn;
  }
  appointArray = document.getElementById('seq-of-manor-on').value.split(',');
  var i = 0;
  var myvar = setInterval(function(){
    httpPostString(autoAppointString(appointArray[i]), url, function(){});
    i++;
    if (i == (appointArray.length - 1)){
      clearInterval(myvar);
    }
  },200);
  // for (var i = 0; i < appointArray.length; i++) {
    
  // }
}

// # Controls: Popup trigger background 
// My first function for chrome extension: Check the ArMingMo status to open the whole popup
var myFirstExtFunc = function() {
  console.log('listened!')
  if(msgFromBackground.sid){
    renderStatus('阿明謀成功開啟!');
    document.getElementById("ArMingMo-button-area").style.visibility = 'visible';
    document.getElementById("ArMing-status").style.visibility = 'hidden';
  } else {
    renderStatus('請點擊主公頭像');
  }
}
// switch manor
var manorSwitch = function() {
  if(msgToBackground.state.manorStatus == 1) {
    manorOff();
    renderStatus('軍府已下!');
    document.getElementById("manor-switch").title = '表人趁現在 一鍵上軍府';
    document.getElementById("manor-switch").style['background-image'] = "url('manorSwitchOff.png')";
    msgToBackground.state.manorStatus = 0;
  }  else {
    manorOn();
    renderStatus('軍府已上!');
    document.getElementById("manor-switch").title = '扮豬吃老虎 就愛下軍府';
    document.getElementById("manor-switch").style['background-image'] = "url('manorSwitch.png')";
    msgToBackground.state.manorStatus = 1;
  }
}

// BossWar automatic troop sender, popup part.
var bossWarTimerCalledFlag = 0;
var fireFlag = 0;
msgToBackground.state.bossWarTimerCalledFlag = bossWarTimerCalledFlag;
// var bossWar = function () {
//   var JSONstr = JSON.stringify(msgToBackground);
//   // var JSONstr = 'Boss War CAlled!'
//   postToBg(JSONstr);
// }
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
        divString = '神將倒數 ' + Math.floor(restSec/3600) + ':' 
                              + Math.floor((restSec%3600)/60) + ':' 
                              + Math.floor((restSec%3600)%60);
        renderDiv('boss-war-status',divString); 

        if (d.getHours() == 20 & d.getMinutes() >= 0 & d.getMinutes() <= 30 & d.getSeconds() >= 0) {
          renderDiv('boss-war-status','阿明謀派兵中...');
          if(fireFlag == 0) {
            fireFlag = 1;
            msgToBackground.state.fireFlag = fireFlag;
            postToBg(JSON.stringify(msgToBackground));
          } 
        } else if (d.getHours() == 20 & d.getMinutes() >= 30) {
          renderDiv('boss-war-status','神將結束!');
          fireFlag = 0;
          clearInterval(myVar);
        }
      }
      bossWarTimerCalledFlag = 1;
      msgToBackground.state.bossWarTimerCalledFlag = bossWarTimerCalledFlag;
      var JSONstr = JSON.stringify(msgToBackground);
      postToBg(JSONstr);
    } else if (bossWarTimerCalledFlag == 1) {
      renderStatus('神將已開，請去約會~')
    } 

    
  } else {
    renderStatus('今天沒有神將!');
  }
}


// ----------------------------------------------------------------------------------

// # View render --------------------------------------------------------------------
function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText + '\n' + document.getElementById('status').textContent;
}

function renderDiv(divName,divText) {
  document.getElementById(divName).textContent = divText;
}
//-----------------------------------------------------------------------------------








// Entrance of popup--------------------------------------------------
// get current tabId and print to view
getCurrentTabId(function(id){
  renderStatus('tabId: '+id);
  msgToBackground.tabId = id;
})
// comm. to background.html pages
var port = chrome.extension.connect({name: "Sample Communication"});
msgToBackground.msg = 'Hi Background';
port.postMessage(JSON.stringify(msgToBackground));

// ## Listeners
// Listen to background connect
port.onMessage.addListener(function(msg) {
  console.log("message recieved"+ msg);
  msgFromBackground = JSON.parse(msg);
});
// when popup loads, add listeners to buttons
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('ArMing-status').addEventListener('click', myFirstExtFunc); // ArMing connect
  document.getElementById('manor-switch').addEventListener('click', manorSwitch); // Switch the manor to tune your power
  document.getElementById('roulette').addEventListener('click', roulette); // Roulette
  //document.getElementById('grass-man').addEventListener('click', grass); // Earn money from grass-man
  
  document.getElementById('boss-war').addEventListener('click', bossWar); // Boss-war

});
