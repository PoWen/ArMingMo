// Copyright (c) 2016 The ArMingMo Authors. All rights reserved.
/**
 * ArMingMo
 *
 */

// Container of background and tab Objs
var msgFromBackground = (localStorage.msgFromBackground) ? 
                        JSON.parse(localStorage.getItem("msgFromBackground")) : 
                        {};

var msgToBackground = (localStorage.msgToBackground) ? 
                      JSON.parse(localStorage.getItem("msgToBackground")) : 
                      {
                        state: {
                          bossWarTimerCalledFlag: 0,
                          fireFlag: 0,
                          manorStatus: 1,// 0: manor off, 1: manor on
                          manorString: '7,6,1,5,2,12,9,8'
                        },
                        tabId: '',
                        msg: ''
                      };


var tabObj = {};

var tabSwitcher = (localStorage.getItem(tabSwitcher)) ?
Number(localStorage.getItem("tabSwitcher")) :
'';


var tabStatus = (localStorage.tabStatus) ? 
JSON.parse(localStorage.getItem("tabStatus")) : 
[{
  tabId: '',
  manorString: '7,6,1,5,2,12,9,8',
  manorStatus: 1,// 0: manor off, 1: manor on
  sid: '',
  url: '',
  bossWarTimerCalledFlag: 0 // 0:not called, 1: called bossWar
}];


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
  // var comm = chrome.extension.connect({name: "Communication to Bg"});
  // comm.postMessage(msg);
  port.postMessage(msg);
  console.log('Post to bg',msg);
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
  var url = tabStatus[tabSwitcher].url;
  var retireString = function(decId) {
    strReturn = '{"act":"Manor.retireAll","sid":"' 
                + tabStatus[tabSwitcher].sid
                +'","body":"{\'decId\':'
                + decId
                + '}"}';
    return strReturn;
  }
  var retireArray = [1, 2, 5, 6, 7, 8, 9, 12];
  var i = 0;  
  var asycPost = function() {
    i++;
    httpPostString(retireString(retireArray[i]), url, (i < retireArray.length-1)? asycPost: function(){});
  }
  httpPostString(retireString(retireArray[i]), url, asycPost)
}

var manorOn = function() {
  var url = tabStatus[tabSwitcher].url;
  var autoAppointString = function(decId) {
    strReturn = '{"act":"Manor.autoAppoint","sid":"' 
                + tabStatus[tabSwitcher].sid
                +'","body":"{\'decId\':'
                + decId
                + '}"}';
    return strReturn;
  }
  tabStatus[tabSwitcher].manorString = document.getElementById('seq-of-manor-on').value;
  localStorage.setItem("tabStatus", JSON.stringify(tabStatus));
  appointArray = document.getElementById('seq-of-manor-on').value.split(',');

  var i = 0;  
  var asycPost = function() {
    i++;
    httpPostString(autoAppointString(appointArray[i]), url, (i < appointArray.length-1)? asycPost: function(){});
  }
  httpPostString(autoAppointString(appointArray[i]), url, asycPost)

}

// # Controls: Popup trigger background 
// My first function for chrome extension: Check the ArMingMo status to open the whole popup
var myFirstExtFunc = function() {
  console.log('listened!')
  if(tabStatus[tabSwitcher].sid){
    renderStatus('阿明謀成功開啟!');
    document.getElementById("ArMingMo-button-area").style.visibility = 'visible';
    document.getElementById("ArMing-status").style.visibility = 'hidden';
    if(tabStatus[tabSwitcher].manorStatus == 0) {
      document.getElementById("manor-switch").title = '表人趁現在 一鍵上軍府';
      document.getElementById("manor-switch").style['background-image'] = "url('manorSwitchOff.png')";
    }  else {
      document.getElementById("manor-switch").title = '扮豬吃老虎 就愛下軍府';
      document.getElementById("manor-switch").style['background-image'] = "url('manorSwitch.png')";
    }
  } else {
    renderStatus('請點擊主公頭像');
  }
}
// switch manor
var manorSwitch = function() {
  if(tabStatus[tabSwitcher].manorStatus == 1) {
    manorOff();
    renderStatus('軍府已下!');
    document.getElementById("manor-switch").title = '表人趁現在 一鍵上軍府';
    document.getElementById("manor-switch").style['background-image'] = "url('manorSwitchOff.png')";
    tabStatus[tabSwitcher].manorStatus = 0;
    localStorage.setItem("tabStatus", JSON.stringify(tabStatus));
  }  else {
    manorOn();
    renderStatus('軍府已上!');
    document.getElementById("manor-switch").title = '扮豬吃老虎 就愛下軍府';
    document.getElementById("manor-switch").style['background-image'] = "url('manorSwitch.png')";
    tabStatus[tabSwitcher].manorStatus = 1;
    localStorage.setItem("tabStatus", JSON.stringify(tabStatus));
  }
}


// BossWar automatic troop sender, popup part.
var myBossWarVar;
var bossWarTimerCalledFlag = 0;
var fireFlag = 0;
msgToBackground.state.bossWarTimerCalledFlag = bossWarTimerCalledFlag;

// the timer view of boss war status
function bossWarTimer() {
  var d = new Date();
  var restSec = 20*3600 - d.getHours()*3600 - d.getMinutes()*60 - d.getSeconds();
  var renderString;
  divString = '神將倒數 ' + Math.floor(restSec/3600) + ':' 
                        + Math.floor((restSec%3600)/60) + ':' 
                        + Math.floor((restSec%3600)%60);
  renderDiv('boss-war-status',divString); 

  if (d.getHours() == 20 & d.getMinutes() >= 0 & d.getMinutes() <= 30 & d.getSeconds() >= 0) {
    renderDiv('boss-war-status','該是阿明謀派兵中...');
    // if(fireFlag == 0) {
    //   fireFlag = 1;
    //   msgToBackground.state.fireFlag = fireFlag;
    //   postToBg(JSON.stringify(msgToBackground));
    // } 
  } else if (d.getHours() == 20 & d.getMinutes() >= 30) {
    renderDiv('boss-war-status','神將結束!');
    fireFlag = 0;
    clearInterval(myBossWarVar);
  }
}

var bossWar = function() {
  var now = new Date();
  if (now.getDay() == 0 || now.getDay() == 5) {
    renderStatus('今天有神將!');
    if (bossWarTimerCalledFlag == 0) {
      myBossWarVar = setInterval(bossWarTimer, 1000);

      
      // change bossWar Status
      bossWarTimerCalledFlag = 1;
      
      // post the timer trigger of bossWar to background
      var JSONstr = JSON.stringify(tabStatus[tabSwitcher]);
      postToBg(JSONstr);  
    
    
      tabStatus[tabSwitcher].bossWarTimerCalledFlag = bossWarTimerCalledFlag;
      localStorage.setItem('tabStatus',JSON.stringify(tabStatus));

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

// comm. to background.html pages
var port = chrome.extension.connect({name: "Sample Communication"});
msgToBackground.msg = 'Hi Background';
port.postMessage(JSON.stringify(msgToBackground));

// Listen to background message feeding
port.onMessage.addListener(function(msg) {
  //console.log("Global message recieved"+ msg);
  JSONmsg = JSON.parse(msg);
  // TODO: ISSUE- We should check if the msg comming from current Tab, right?   
  msgFromBackground = JSONmsg;
  if(tabSwitcher) {
    tabStatus[tabSwitcher].sid = JSONmsg.sid;
    tabStatus[tabSwitcher].url = JSONmsg.url;
    localStorage.setItem('tabStatus',JSON.stringify(tabStatus));
  }
  
});


// ## Listeners
// when popup loads, add listeners to buttons
document.addEventListener('DOMContentLoaded', function() {
  console.log("after DOM loaded message recieved"+ msgFromBackground);

  getCurrentTabId(function(id){
    renderStatus('tabId: '+id);
    msgToBackground.tabId = id;
    pastTabSwitcher = Number(localStorage.getItem('tabSwitcher'));

    var a = tabStatus.findIndex(function(d) { return d.tabId == id});
    if ( a != -1) {
      tabSwitcher = a;
    } else {
      tabSwitcher = tabStatus.length;
      console.log('tabSwitcher:',tabSwitcher);
      tabStatus[tabSwitcher] = {};
      tabStatus[tabSwitcher].tabId = id;
      tabStatus[tabSwitcher].manorString = '7,6,1,5,2,12,9,8';
    }

    
    localStorage.setItem('tabSwitcher',tabSwitcher);
    document.getElementById('seq-of-manor-on').value = tabStatus[tabSwitcher].manorString;

    // Check ArMingMo at correct Tab
    if(tabSwitcher == pastTabSwitcher){
      myFirstExtFunc();
    } else {
      renderStatus('請先點擊主公頭像!');
      console.log(msgFromBackground)
    }
  })


  // Listen to button clicks
  document.getElementById('ArMing-status').addEventListener('click', myFirstExtFunc); // ArMing connect
  document.getElementById('manor-switch').addEventListener('click', manorSwitch); // Switch the manor to tune your power
  document.getElementById('roulette').addEventListener('click', roulette); // Roulette
  //document.getElementById('grass-man').addEventListener('click', grass); // Earn money from grass-man
  document.getElementById('boss-war').addEventListener('click', bossWar); // Boss-war

});
