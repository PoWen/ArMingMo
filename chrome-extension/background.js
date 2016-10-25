// Copyright (c) 2016 The ArMingMo Authors. All rights reserved.

var msgToPopup = [];
msgToPopup[0] = {};
// msgToPopup.forEach(function(tabMsg) {if(tabMsg.tabId == xxx) {console.log('hi',tabMsg.tabId)}})

var msgFromPopup = {};

var serverInfo; // the container to store response information from httpPostString method 
var tabSwitcher = 0; // the state of the active tab
var tempScope;

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
    if(tab.id){
      var tabId = tab.id;
      callback(tabId);  
    } else callback(0);
    
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

// # Mutual functions of background and popup
// ## Post String to URL and get responses
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

// # Background functions
// bossWar
var bossWar = function(msgObj) {
  var sid = msgObj.sid;
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
  var getPKTroops = '{"act":"Campaign.getAttFormation","sid":"' + sid + '","body":"{\'march\':\'BOSS_WAR_PK\'}"}';
  var troopInfoFlag = 0;
  console.log(getPKTroops);
  httpPostStringOri(getPKTroops);

  // send troops automatically during 20:00~20:30 at Fri. and Sun.
  var myVar = setInterval(myTimer, 1000);

  function myTimer() {
      var d = new Date();
      console.log(d.toLocaleTimeString());
      console.log('sid:',sid);
      console.log('troopCode:',troopCode)
      if ((d.getDay() == 5||d.getDay() == 0) & d.getHours() == 20 & d.getMinutes() >= 0 & d.getMinutes() <= 30 ) {
        timeFlag = 1;
        troopFlag+= 1;
      }
      // else {
      //   timeFlag = 0;
      //   clearInterval(myVar);
      // }

      if ((troopFlag%31) == 1) {
        sendTroops();
        console.log("送出隊伍!")
      }
  }

  var sendTroops = function () {
    httpPostStringOri(troopCode)
  }
}

// nwl: national war loop
var nwloop = [];
var nwl = function(msgObj) {
  
  console.log("nwl called! Flag:" + msgObj.nwlCalledFlag)
  var sid = msgObj.sid;
  var url = msgObj.url;
  var cityId = msgObj.nwlCityId;
  var manorSeq = msgObj.manorString;
  var troopCode;
  var waitTimeout = Number(msgObj.nwlTimeout)*1000;
  var myName;

  // manor off, need sid 
  var manorOff = function() {
    var retireString = function(decId) {
      strReturn = '{"act":"Manor.retireAll","sid":"' 
                  + sid
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

  // manor on, need sid
  var manorOn = function() {
    var autoAppointString = function(decId) {
      strReturn = '{"act":"Manor.autoAppoint","sid":"' 
                  + sid
                  +'","body":"{\'decId\':'
                  + decId
                  + '}"}';
      return strReturn;
    }
    
    appointArray = manorSeq.split(',');

    var i = 0;  
    var asycPost = function() {
      i++;
      httpPostString(autoAppointString(appointArray[i]), url, (i < appointArray.length-1)? asycPost: function(){});
    }
    httpPostString(autoAppointString(appointArray[i]), url, asycPost)
  }

  var getMyTroopsHome = function(responseText) {

    var serverResponse = JSON.parse(responseText);
    if (serverResponse.trps) {
      var numOfTroops = serverResponse.trps.length;
      var nowTroops = 0;

      serverResponse.trps.reduce(function( p, c) { 
        if ((c.nm) && c.nm == myName) {
          var getMyTroopsBack = '{"act":"NationalWar.pullBackCorpsReserveTroops","sid":"' + sid + '","body":"{\'uid\':\'' + c.uid + '\'}"}';
        httpPostString( getMyTroopsBack, url, responseInfo);
      } 
      
      nowTroops++;
      
      if (nowTroops >= numOfTroops){
        setTimeout(sendTroopsWithLittleGrass, 5000);
      }
    
    },[]);  
    }
  }

  var sendTroopsWithLittleGrass = function(){
    var citySituationCMD = '{"act":"World.citySituationDetail","sid":"' + sid + '","body":"{\'cityId\':' + cityId + '}"}';
    var fieldDetect = function(responseText) {
      var serverInfo = JSON.parse(responseText);
      var d = new Date();
      if (serverInfo.rAtt == 0 && d.getHours()>8 && d.getHours()<24){
        var ifMyTroopThere = function(responseText) {
          var serverResponse = JSON.parse(responseText);
          console.log('serverResponse')
          console.log(serverResponse)
          if (serverResponse.disp.myTroops && serverResponse.disp.myTroops == '') {
            setTimeout(manorOff,0);  
            setTimeout(sendTroopsAndMonorOn,10000);  
          } else {
            var leaveWarString = '{"act":"NationalWar.leaveWar","sid":"' + sid + '","body":"{\'cityId\':' + cityId + '}"}';
            httpPostString( leaveWarString, url, function(){});
          }
        }

          
        var sendTroopsAndMonorOn = function(){
          var formatTroops = function(responseText) {
            serverInfo = JSON.parse(responseText);
            heroInfo = JSON.stringify(serverInfo.heros);
            heroInfo = heroInfo.split("\"").join("\'");
            chief = serverInfo.chief;
            troopCode = '{\'heros\':' + heroInfo + ',\'chief\':' + chief + '}';
            var ultimateCityTroop = '{"act":"NationalWar.sendTroops","sid":"' + sid + '","body":"{\'save\':'+ troopCode +',\'type\':\'NATIONAL_WAR\',\'cityId\':' + cityId + '}"}';
            // troopCode = '{\'heros\':' + heroInfo + ',\'chief\':' + chief + '}"}';
            var sendTroopFunc = function() {
                // var ultimateCityTroop = '{"act":"NationalWar.sendTroops","sid":"' + sid + '","body":"{\'save\':'+ troopCode +',\'type\':\'NATIONAL_WAR\',\'cityId\':' + cityId + '}"}';
              var leaveWar = function() {
                var leaveWarString = '{"act":"NationalWar.leaveWar","sid":"' + sid + '","body":"{\'cityId\':' + cityId + '}"}';
                httpPostString( leaveWarString, url, manorOn);
              }

              httpPostString( ultimateCityTroop, url, leaveWar);

            }
            var chooseSideString = '{"act":"NationalWar.chooseSide","sid":"' + sid + '","body":"{\'side\':\'LEFT\',\'cityId\':' + cityId + '}"}';
            httpPostString( chooseSideString, url, sendTroopFunc);
          }          
          var getPKTroops = '{"act":"Campaign.getAttFormation","sid":"' + sid + '","body":"{\'march\':\'PK\'}"}';
          httpPostString(getPKTroops , url, formatTroops);
        } 
          
        
        var enterWarString = '{"act":"NationalWar.enterWar","sid":"' + sid + '","body":"{\'cityId\':' + cityId + '}"}';
        httpPostString(enterWarString,url,ifMyTroopThere)        
      } else {
        if (serverInfo.rAtt != 0){
          console.log("已啟動, 但城市有玩家守軍");
        } else {
          console.log("已啟動, 9:00 ~ 23:00 將正常運作")
        }

      }     
    }
    httpPostString(citySituationCMD,url,fieldDetect)
  }

  var getMyTroops = function(responseText) {
    var serverResponse = JSON.parse(responseText);
    myName = serverResponse.nickName;
    var getMyTroopsCMD = '{"act":"NationalWar.getCorpsReserveTroops","sid":"' + sid + '","body":"{\'city\':0}"}'
    httpPostString( getMyTroopsCMD, url, getMyTroopsHome)
  }

  var singleCity = function() {
    var getMyNameCMD = '{"act":"Login.login","body":"{\'loginCode\':\'' + sid + '\',\'type\':\'WEB_BROWSER\'}"}';
    httpPostString( getMyNameCMD, url, getMyTroops);
  }
  
  if (msgObj.nwlCalledFlag ==1){
    console.log('開始刷城循環')
    singleCity();
    nwloop[tabSwitcher] = setInterval(singleCity,waitTimeout);
  } else {
    console.log('結束刷城循環')
    clearInterval(nwloop[tabSwitcher]);
  }
  
}


var cityOneOcc = '';
var cityTwoOcc = '';
// nwDualLoop: national war Dual loop
var nwDualLoopOne = [];
var nwDualLoopTwo = [];
var nwlDual = function(msgObj) {
  
  console.log("nwl Dual called! Flag:" + msgObj.nwlDualCalledFlag)
  var sid = msgObj.sid;
  var url = msgObj.url;
  var cityIdOne = msgObj.nwlCityIdOne;
  var cityIdTwo = msgObj.nwlCityIdTwo;
  var armyOne = msgObj.nwlArmyOne;
  var armyTwo = msgObj.nwlArmyTwo;
  var manorSeq = msgObj.manorString;
  var troopCode;
  var waitTimeout = Number(msgObj.nwlTimeout)*1000;
  var myName;

  console.log("cityIdOne:" + cityIdOne)
  // manor off, need sid 
  var manorOff = function() {
    var retireString = function(decId) {
      strReturn = '{"act":"Manor.retireAll","sid":"' 
                  + sid
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

  // manor on, need sid
  var manorOn = function() {
    var autoAppointString = function(decId) {
      strReturn = '{"act":"Manor.autoAppoint","sid":"' 
                  + sid
                  +'","body":"{\'decId\':'
                  + decId
                  + '}"}';
      return strReturn;
    }
    
    appointArray = manorSeq.split(',');

    var i = 0;  
    var asycPost = function() {
      i++;
      httpPostString(autoAppointString(appointArray[i]), url, (i < appointArray.length-1)? asycPost: function(){});
    }
    httpPostString(autoAppointString(appointArray[i]), url, asycPost)
  }

  var sendTroopsAndMonorOn = function(armyNo){
    var ultimateCityTroopOne = '{"act":"NationalWar.sendTroops","sid":"' + sid + '","body":"{\'save\':'+ armyOne +',\'type\':\'NATIONAL_WAR\',\'cityId\':' + cityIdOne + '}"}';
    var ultimateCityTroopTwo = '{"act":"NationalWar.sendTroops","sid":"' + sid + '","body":"{\'save\':'+ armyTwo +',\'type\':\'NATIONAL_WAR\',\'cityId\':' + cityIdTwo + '}"}';
    var sendTroopFuncOne = function() {
      var leaveWarOne = function() {
        var leaveWarStringOne = '{"act":"NationalWar.leaveWar","sid":"' + sid + '","body":"{\'cityId\':' + cityIdOne + '}"}';
        httpPostString( leaveWarStringOne, url, manorOn);
      }
      httpPostString( ultimateCityTroopOne, url, leaveWarOne);
    }
    var sendTroopFuncTwo = function() {
      var leaveWarTwo = function() {
        var leaveWarStringTwo = '{"act":"NationalWar.leaveWar","sid":"' + sid + '","body":"{\'cityId\':' + cityIdTwo + '}"}';
        httpPostString( leaveWarStringTwo, url, manorOn);
      }
      httpPostString( ultimateCityTroopTwo, url, leaveWarTwo);
    }
    var chooseSideStringOne = '{"act":"NationalWar.chooseSide","sid":"' + sid + '","body":"{\'side\':\'LEFT\',\'cityId\':' + cityIdOne + '}"}';
    var chooseSideStringTwo = '{"act":"NationalWar.chooseSide","sid":"' + sid + '","body":"{\'side\':\'LEFT\',\'cityId\':' + cityIdTwo + '}"}';
    if (armyNo == 1) {
      httpPostString( chooseSideStringOne, url, sendTroopFuncOne);  
    }
    if (armyNo == 2) {
      httpPostString( chooseSideStringTwo, url, sendTroopFuncTwo);  
    }
  }

  var sendTroopsWithLittleGrassOne = function() {
    var cityOneSituationCMD = '{"act":"World.citySituationDetail","sid":"' + sid + '","body":"{\'cityId\':' + cityIdOne + '}"}';
    var cityTwoSituationCMD = '{"act":"World.citySituationDetail","sid":"' + sid + '","body":"{\'cityId\':' + cityIdTwo + '}"}';
    
    if (cityOneOcc == '' || cityTwoOcc == '') {
        manorOff();
    }

    var fieldDetectOne = function(responseText) {
      var serverInfo = JSON.parse(responseText);
      var d = new Date();
      if (serverInfo.rAtt == 0 && d.getHours()>8 && d.getHours()<24){
        var ifMyTroopThereOne = function(responseText) {
          var serverResponse = JSON.parse(responseText);
          console.log('serverResponse')
          console.log(serverResponse)
          if (serverResponse.disp.myTroops && serverResponse.disp.myTroops == '') {
            if (cityOneOcc == '') {
              setTimeout(function(){sendTroopsAndMonorOn(1)},10000);
              console.log('city One send')
              cityOneOcc = 9;
            } else if (cityOneOcc>0 && cityOneOcc<=9) {
              cityOneOcc = cityOneOcc -1;
              console.log(cityOneOcc)
            } else { //else if (cityOneOcc == 0) 
              cityOneOcc = '';
              console.log('city One Final!')
            }
          } else {
            var leaveWarString = '{"act":"NationalWar.leaveWar","sid":"' + sid + '","body":"{\'cityId\':' + cityIdOne + '}"}';
            httpPostString( leaveWarString, url, function(){});
          }
        }
        var enterWarStringOne = '{"act":"NationalWar.enterWar","sid":"' + sid + '","body":"{\'cityId\':' + cityIdOne + '}"}';
        httpPostString(enterWarStringOne,url,ifMyTroopThereOne)        
      }   
    }

    httpPostString(cityOneSituationCMD,url,fieldDetectOne)
  }

  var sendTroopsWithLittleGrassTwo = function() {
    var cityTwoSituationCMD = '{"act":"World.citySituationDetail","sid":"' + sid + '","body":"{\'cityId\':' + cityIdTwo + '}"}';
    
    if (cityTwoOcc == '') {
        manorOff();
    }

    var fieldDetectTwo = function(responseText) {
      var serverInfo = JSON.parse(responseText);
      var d = new Date();
      if (serverInfo.rAtt == 0 && d.getHours()>8 && d.getHours()<24){
        var ifMyTroopThereTwo = function(responseText) {
          var serverResponse = JSON.parse(responseText);
          console.log('serverResponse')
          console.log(serverResponse)
          if (serverResponse.disp.myTroops && serverResponse.disp.myTroops == '') {
            if (cityTwoOcc == '') {
              setTimeout(function(){sendTroopsAndMonorOn(2)},10000);
              console.log('city two send')
              cityTwoOcc = 9;
            } else if (cityTwoOcc>0 && cityTwoOcc<=9) {
              cityTwoOcc = cityTwoOcc -1;
              console.log(cityTwoOcc)
            } else { //else if (cityTwoOcc == 0) 
              cityOneOcc = '';
              console.log('city Two Final!')
            }
          } else {
            var leaveWarString = '{"act":"NationalWar.leaveWar","sid":"' + sid + '","body":"{\'cityId\':' + cityIdTwo + '}"}';
            httpPostString( leaveWarString, url, function(){});
          }
        }
        var enterWarStringTwo = '{"act":"NationalWar.enterWar","sid":"' + sid + '","body":"{\'cityId\':' + cityIdTwo + '}"}';
        httpPostString(enterWarStringTwo,url,ifMyTroopThereTwo)        
      }   
    }

    httpPostString(cityTwoSituationCMD,url,fieldDetectTwo)
  }  
  
  
  if (msgObj.nwlDualCalledFlag ==1){
    console.log('開始刷城循環')
    sendTroopsWithLittleGrassOne();
    nwDualLoopOne[tabSwitcher] = setInterval(sendTroopsWithLittleGrassOne,waitTimeout);
    setTimeout(function(){sendTroopsWithLittleGrassTwo();nwDualLoopTwo[tabSwitcher] = setInterval(sendTroopsWithLittleGrassTwo,waitTimeout);},10000);
  } else {
    console.log('結束刷城循環')
    clearInterval(nwDualLoopOne[tabSwitcher]);
    clearInterval(nwDualLoopTwo[tabSwitcher]);
  }
}

// End of global functions ---------------------------------------------------------

// Entrance of scripts -------------------------------------------------------------
// get Initial tabId and listen to webRequest
// getCurrentTabId(function(id){
//   msgToPopup[tabSwitcher].tabId = id;
//   console.log('tabId:',id);

//   chrome.webRequest.onBeforeRequest.addListener(
//     function(details)
//     {
//       if((details.method) && details.method == 'POST') {
//         var buf = details.requestBody.raw[0].bytes;
//         var buf2Int8 = new Int8Array(buf);
//         var resultString = "";
//         for(i=0;i<buf2Int8.length;i++){resultString+= String.fromCharCode(buf2Int8[i]);}
//         JSONObj = JSON.parse(resultString);
//         //console.log(JSON.stringify(JSONObj));
//         if(JSONObj.sid) { 
//           msgToPopup[tabSwitcher].sid = JSONObj.sid;
//           msgToPopup[tabSwitcher].url = details.url;
//           tempScope = JSONObj;
//           if((JSONObj.act) && JSONObj.act == 'NationalWar.enterWar') {
//             msgToPopup[tabSwitcher].enterWarCityId = JSON.parse(JSONObj.body).cityId;
//           }
//           if((JSONObj.act) && JSONObj.act == 'Starry.fight') {
//             msgToPopup[tabSwitcher].starCampaignId = JSON.parse(JSONObj.body).campaignId;
//           }

//         }  
//       }
//     },  
//     {urls: ["http://*.icantw.com/*"]},
//     ['requestBody']
//   );

// })

chrome.webRequest.onBeforeRequest.addListener(
  function(details)
  {
    var getPOSTmsg = function(details) {
      if((details.method) && details.method == 'POST') {
        var buf = details.requestBody.raw[0].bytes;
        var buf2Int8 = new Int8Array(buf);
        var resultString = "";
        for(i=0;i<buf2Int8.length;i++){resultString+= String.fromCharCode(buf2Int8[i]);}
        JSONObj = JSON.parse(resultString);
        //console.log(JSON.stringify(JSONObj));
        if(JSONObj.sid) { 
          msgToPopup[tabSwitcher].sid = JSONObj.sid;
          msgToPopup[tabSwitcher].url = details.url;
          tempScope = JSONObj;
          if((JSONObj.act) && JSONObj.act == 'NationalWar.enterWar') {
            msgToPopup[tabSwitcher].enterWarCityId = JSON.parse(JSONObj.body).cityId;
          }
          if((JSONObj.act) && JSONObj.act == 'Starry.fight') {
            msgToPopup[tabSwitcher].starCampaignId = JSON.parse(JSONObj.body).campaignId;
          }

        }  
      }  
    }
    getCurrentTabId(function(id){
      console.log('id here:' + id);
      if (!msgToPopup[tabSwitcher].tabId) {
        msgToPopup[tabSwitcher].tabId = id;
        console.log('find new tab, tabId:',id);
        getPOSTmsg(details)
      } else {
        if (msgToPopup[tabSwitcher].tabId != id){
        console.log('This is not POST from current tab')    
        } else{
          getPOSTmsg(details)
        }
      }
    })
  },  
  {urls: ["http://*.icantw.com/*"]},
  ['requestBody']
);


// listen to the changes of tab activation
chrome.tabs.onActiveChanged.addListener(getTabIdandSwitch)

// listen to connection of extension
chrome.extension.onConnect.addListener(function(port) {
  console.log("Connected .....");
  port.onMessage.addListener(function(msg) {
        console.log("message recieved @@ "+ msg);
        popupPostTriggerFunc(msg); 
        msgFromPopup = JSON.parse(msg);
                      
        port.postMessage(JSON.stringify(msgToPopup[tabSwitcher]));

        // msgToPopup[tabSwitcher].state.manorString = msgFromPopup.state.manorString;
        console.log('check:', JSON.stringify(msgToPopup[tabSwitcher]));
        
  });
});


// popup trigger this function
var popupPostTriggerFunc = function(msg) {
  msgFromPopup = JSON.parse(msg);
  //msgToPopup[tabSwitcher].state.manorString = msgFromPopup.state.manorString;
  console.log('check popup trigger function:', msg);
  //console.log(JSONObj);
  
  // BossWarFlagCheck before running boss war
  
  if((msgFromPopup.bossWarTimerCalledFlag) & msgFromPopup.bossWarTimerCalledFlag == 1) {
    bossWar(msgFromPopup);
  }
  if (msgFromPopup.nwlClick) {
    nwl(msgFromPopup);
  }
  if (msgFromPopup.nwlDualClick) {
    nwlDual(msgFromPopup);
  }
}; 
