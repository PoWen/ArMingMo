// Copyright (c) 2016 The ArMingMo Authors. All rights reserved.
/**
 * ArMingMo
 *
 */


//
var cityIdMap = {
  "虎牢關" : 107,
  "博望坡" : 113,
  "葭萌關" : 124,
  "夷陵" : 117,
  "檀溪" : 114,
  "白馬" : 103,
  "濡須口" : 110,
  "牛渚" : 111,
  "綿竹關" : 126,
  "白水關" : 125,
  "陽平關" : 123,
  "五丈原" : 119,
  "武關" : 109,
  "潼關" : 118,
  "街亭" : 122,
  "散關" : 120,
  "祁山" : 121,
  "函谷關" : 108,
  "雁門關" : 101,
  "界橋" : 100,
  "壺關" : 102,
  "官渡" : 105,
  "汜水關" : 106,
  "定陶" : 104,
  "華容" : 116,
  "赤壁" : 112,
  "長阪坡" : 115,
  "上庸": 33
}

var cityNameMap = {
  "107": "虎牢關",
  "113": "博望坡",
  "124": "葭萌關",
  "117": "夷陵",
  "114": "檀溪",
  "103": "白馬",
  "110": "濡須口",
  "111": "牛渚",
  "126": "綿竹關",
  "125": "白水關",
  "123": "陽平關",
  "119": "五丈原",
  "109": "武關",
  "118": "潼關",
  "122": "街亭",
  "120": "散關",
  "121": "祁山",
  "108": "函谷關",
  "101": "雁門關",
  "100": "界橋",
  "102": "壺關",
  "105": "官渡",
  "106": "汜水關",
  "104": "定陶",
  "116": "華容",
  "112": "赤壁",
  "115": "長阪坡",
  "33": "上庸"
}



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
                        msg: '',
                        nwlClick: 0,
                        nwlDualClick: 0
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
  bossWarTimerCalledFlag: 0, // 0:not called, 1: called bossWar
  nwlCalledFlag: 0, // 0: not called, 1: call national war loop
  topPVPCalledFlag: 0, // 0: not called, 1: call national war loop
  nwlDualCalledFlag: 0,
  nwlCityId: '',
  nwlCityIdOne: '',
  nwlCityIdTwo: '',
  nwlClick: 0,
  nwlDualClick: 0,
  nwlTimeout: 860,
  topPVPTimeout: 240,
  password: ''
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

var httpGet = function(url) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.open("GET",url,true);
  httpRequest.setRequestHeader("Accept","*/*");
  httpRequest.setRequestHeader("Accept-Language","zh-TW,zh;q=0.8,en-US;q=0.6,en;q=0.4,zh-CN;q=0.2");
  httpRequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
  httpRequest.setRequestHeader("X-Requested-With","ShockwaveFlash/21.0.0.216");
  httpRequest.send();
}

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
var manorResponseInfo = function(responseText) {
  var manorResponse = JSON.parse(responseText);
  if(manorResponse.disp.rewards){
    renderStatus(manorResponse.disp.rewards.resources.CONTRIBUTION)  
  } else {
    renderStatus('0');
  }
}

// # manor switch
var manorOff = function() {
  var url = tabStatus[tabSwitcher].url;
  var retireString = function(decId) {
    strReturn = '{"act":"Manor.retireAllA","sid":"' 
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
    strReturn = '{"act":"Manor.autoAppointA","sid":"' 
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
// fake auth
var fakeAuth = function() {

  console.log(tabStatus[tabSwitcher].password);
  var password = (document.getElementById('password').value) ? (document.getElementById('password').value) : tabStatus[tabSwitcher].password;
  tabStatus[tabSwitcher].password = password;
  localStorage.setItem("tabStatus", JSON.stringify(tabStatus));
  
  if(passwordCheck(password)) {
    document.getElementById("ArMingMo-password-area").style.height = '0px';
    document.getElementById("ArMingMo-status-area").style.visibility = 'visible';
    document.getElementById("ArMingMo-password-area").style.visibility = 'hidden';  
  } else {
    document.getElementById('password').value = "密碼錯了喔"
  }
}

var passwordCheck = function(password) {
  return (password == "9487945") ? 1 : 0 
}

// My first function for chrome extension: Check the ArMingMo status to open the whole popup
var myFirstExtFunc = function() {
  console.log('listened!')

  if(tabStatus[tabSwitcher].sid){
    renderStatus('阿明謀成功開啟!');
    document.getElementById("ArMingMo-button-area").style.visibility = 'visible';
    document.getElementById("ArMing-status").style.visibility = 'hidden';
    console.log('manorStatus:' + tabStatus[tabSwitcher].manorStatus);
    if(tabStatus[tabSwitcher].manorStatus == 0) {
      document.getElementById("manor-switch").title = '表人趁現在 一鍵上軍府';
      document.getElementById("manor-switch").style['background-image'] = "url('manorSwitchOff.png')";
    }  else {
      document.getElementById("manor-switch").title = '扮豬吃老虎 就愛下軍府';
      document.getElementById("manor-switch").style['background-image'] = "url('manorSwitch.png')";
    }
    //console.log('nwlFlag:' + tabStatus[tabSwitcher].nwlCalledFlag);
    if(tabStatus[tabSwitcher].nwlCalledFlag == 0) {
      document.getElementById("nwl-single-city").title = '選定要刷的城市編號, 上下軍府連刷單一城市。刷城隊伍從武藝較量隊伍抓取，請到排行榜使用刷城隊伍找人較量。';
      document.getElementById("nwl-single-city").style['background-image'] = "url('nwl-single-city.png')";
    }  else {
      document.getElementById("nwl-single-city").title = '停止刷城, 整裝待發!';
      document.getElementById("nwl-single-city").style['background-image'] = "url('nwl-single-city-off.gif')";
    }
    if(tabStatus[tabSwitcher].topPVPCalledFlag == 0) {
      document.getElementById("top-pvp").title = '選定要刷的城市編號, 上下軍府連刷單一城市。刷城隊伍從武藝較量隊伍抓取，請到排行榜使用刷城隊伍找人較量。';
      document.getElementById("top-pvp").style['background-image'] = "url('nwl-single-city.png')";
    }  else {
      document.getElementById("top-pvp").title = '停止刷城, 整裝待發!';
      document.getElementById("top-pvp").style['background-image'] = "url('nwl-single-city-off.gif')";
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

var manorDetect = function() {
  if(!(tabStatus[tabSwitcher].enterWarCityId)){
    renderStatus('偵測不到戰場請再次進入戰場');
  } else {
    var cityId = tabStatus[tabSwitcher].enterWarCityId
    var cityName = cityNameMap[cityId.toString()];
    var NationalWarStr = '{"act":"NationalWar.enterWar","sid":"' + tabStatus[tabSwitcher].sid + '","body":"{\'cityId\':' + cityId +'}"}';
    detectResponseHeader = '偵測' + cityName + '軍功中...'
    renderStatus(detectResponseHeader);
    //console.log(NationalWarStr)
    httpPostString(NationalWarStr, tabStatus[tabSwitcher].url, manorResponseInfo)   
    
    //renderStatus(cityName);

    //}

    //renderStatus('阿明累了, 乖乖等信件啦!')
  }
}

var roulette = function() {
  if(tabStatus[tabSwitcher].sid) {
    var rouletteCheck = function(responseText) {
      var rouletteResponse = JSON.parse(responseText);
      console.log(rouletteResponse);
      if (rouletteResponse.ok){
        httpPostString(refreshLottery, url, rouletteCheck);
        renderStatus('刷新'); 
      }
      else if (rouletteResponse.freeLotteryTimes > 1){
        spinTimes = rouletteResponse.freeLotteryTimes;
        renderStatus("剩餘免費次數:" + spinTimes + '\n'); 
        httpPostString(drawLottery, url, rouletteCheck);
      }
      else renderStatus("剩下最後一轉，請轉一下確認拿到多少鐵!")
    }
    var sid = tabStatus[tabSwitcher].sid;
    var url = tabStatus[tabSwitcher].url;
    var drawLottery = '{"act":"Lottery.drawLottery","sid":"' + sid + '"}';
    var refreshLottery = '{"act":"Lottery.refreshLottery","sid":"' + sid + '"}';
    httpPostString(drawLottery, url, rouletteCheck)
  } else {
    renderStatus('請點擊主公頭像');
  }
}

var xmas = function() {
  var xmasPres = document.getElementById("xmasPres").value;
  if(tabStatus[tabSwitcher].sid) {
    var rouletteCheck = function(responseText) {
      var rouletteResponse = JSON.parse(responseText);
      console.log(rouletteResponse);
      if (rouletteResponse.ok){
        httpPostString(drawLottery, url, rouletteCheck);
        renderStatus('領獎!'); 
      }
      // else if (rouletteResponse.freeLotteryTimes > 1){
      //   spinTimes = rouletteResponse.freeLotteryTimes;
      //   renderStatus("剩餘免費次數:" + spinTimes + '\n'); 
      //   httpPostString(drawLottery, url, rouletteCheck);
      // }
      else renderStatus("閱歷已用盡, 請買新月曆!")
    }
    var sid = tabStatus[tabSwitcher].sid;
    var url = tabStatus[tabSwitcher].url;
    //var drawLottery = '{"act":"Lottery.drawLottery","sid":"' + sid + '"}'; // 鐵轉盤
    // var drawLottery = '{"act":"JifenShop.buyFixItem","sid":"' + sid + '","body":"{\'id\':' + xmasPres + '}"}'; //聖誕出包
    var drawLottery = '{"act":"Shop.buyUndergoShopItem","sid":"' + sid + '","body":"{\'shopId\':' + xmasPres + '}"}';
    httpPostString(drawLottery, url, rouletteCheck)
  } else {
    renderStatus('請點擊主公頭像');
  }
}

var grassMan = function() {
  if(tabStatus[tabSwitcher].sid) {
    var grassRewardGold = function(responseText) {
      var grassResponse = JSON.parse(responseText);
      if (grassResponse.ok == 1){
        rewardTimes+= 1;
        var renderGrass = "領取金幣次數:" + rewardTimes;
        renderStatus(renderGrass); 
        httpPostString(grassArrowGold2W,url,grassRewardGold);    
      } else {
        var renderGrass = "領完囉~ 共領:" + rewardTimes*eachReward + "銀幣，下班!";
        renderStatus(renderGrass);
      }
    }
    var sid = tabStatus[tabSwitcher].sid;
    var url = tabStatus[tabSwitcher].url;
    var rewardTimes = 0;
    var eachReward = 20000;
    var grassArrowGold2W = '{\"act\":\"GrassArrow.exchangeGrassArrow\",\"sid\":\"' + sid + '\",\"body\":\"{\'itemId\':11}\"}';
    httpPostString(grassArrowGold2W, url, grassRewardGold)
  } else {
    renderStatus('請點擊主公頭像');
  }
}

var shootTimes = 0;
var shootScore = 0;
var oneArchery = function() {
  if(tabStatus[tabSwitcher].sid) {
    var doShoot = function(responseText){
      var showScore = function(shootInfoText) {
        shootInfo = JSON.parse(shootInfoText);
        if(shootInfo.nWind){
          if(shootTimes < 10){
            shootTimes++;
            var getScore = (shootInfo.ring);
            shootScore+= getScore;
            var scoreString = '射出第' + shootTimes + '箭, 得' + getScore + '分';
            renderStatus(scoreString);
            
          } else {
            var getScore = shootInfo.ring;
            shootScore+= getScore;
            shootTimes++;
            var scoreString = '射出第' + shootTimes + '箭, 得' + getScore + '分';
            renderStatus(scoreString);
            var finalScoreString = '共得' + shootScore + '分';
            renderStatus(finalScoreString);
          }
        } else {
          renderStatus('拳四狼: 你已經射了!')
        }
      }
      var archeryInfo = JSON.parse(responseText);
      var nextShootX = Math.round(archeryInfo.wind*-2/30);
      var nextShootCMD = '{"act":"Archery.shoot","sid":"' + sid + '","body":"{\'x\':' + nextShootX + ',\'y\':10,\'type\':\'ONEYEAY\'}"}'; //NORMAL
      httpPostString(nextShootCMD,url,showScore);
    }
    var sid = tabStatus[tabSwitcher].sid;
    var url = tabStatus[tabSwitcher].url;
    var getArcheryInfo = '{"act":"Archery.getArcheryInfo","sid":"' + sid + '","body":"{\'type\':\'ONEYEAY\'}"}';//NORMAL
    httpPostString(getArcheryInfo,url,doShoot);
  } else {
    renderStatus('請點擊主公頭像');
  }
}

var starDetect = function() {
  if(!(tabStatus[tabSwitcher].starCampaignId)){
    renderStatus('偵測不到星星, 請再進出覽星壇');
  } else {
    var starId = tabStatus[tabSwitcher].starCampaignId
    detectResponseHeader = '偵測到恆星編號' + starId + '...'
    renderStatus(detectResponseHeader);
    
  }
}



var starGet = function() {
  var campaignIdHere = document.getElementById("star-get-id").value;
  // var getAttFormation = function(responseText) {
  //   var getNextEnemies = function(responseText) {
  //     var troopResponse = JSON.parse(responseText);
  //     heroInfo = JSON.stringify(troopResponse.heros);
  //     heroInfo = heroInfo.split("\"").join("\'");
  //     chief = troopResponse.chief;
  //     var saveFormation = function(responseText) {
  //       var fightNext = function(responseText) {
  //         var quitCampaign = function(responseText) {
  //           var renderResult = function(responseText){
  //             var fightResult = JSON.parse(responseText);
  //             if (fightResult.ok) {
  //               renderStatus('大概成功了吧, 離開戰鬥畫面檢查一下');
  //             }
  //             else {
  //               renderStatus('大概成功了吧, 不管了我要上班去了!');
  //             }
  //           }
  //           var quitCampaign = '{"act":"Campaign.quitCampaign","sid":"' + sid + '"}';
  //           httpPostString(quitCampaign,url,renderResult)
  //         }
  //         var fightNextCMD = '{"act":"Campaign.fightNext","sid":"' + sid + '"}';
  //         httpPostString(fightNextCMD,url,quitCampaign);
  //         renderStatus('刷星'); 
  //       }
  //       var saveFormationCMD = '{"act":"Campaign.saveFormation","sid":"' + sid + '","body":"{\'heros\':' + heroInfo + ',\'chief\':' + chief + '}"}';
  //       httpPostString(saveFormationCMD,url,fightNext);
  //     }
  //     var nextEnemiesCMD = '{"act":"Campaign.nextEnemies","sid":"' + sid + '"}';
  //     httpPostString(nextEnemiesCMD,url,saveFormation)
  //   }
  //   getAttFormationCMD = '{"act":"Campaign.getAttFormation","sid":"' + sid + '","body":"{\'march\':\'STARRY\'}"}';
  //   httpPostString(getAttFormationCMD, url, getNextEnemies);
    
  // }
  //}
  var starReact = function(responseText) {
    var reactObj = JSON.parse(responseText);
    renderStatus('掃蕩星星編號:'+ campaignIdHere)

  }
  var sid = tabStatus[tabSwitcher].sid;
  var url = tabStatus[tabSwitcher].url;
  var getStarryInfo = '{"act":"Starry.batchStarry","sid":"' + sid + '","body":"{\'campaignId\':'+ campaignIdHere + ',\'count\':1}"}';
  // httpPostString(getStarryInfo, url, getAttFormation)
  httpPostString(getStarryInfo, url, starReact)
}

var starThree = function() {
	var starEat = function() {
	  var getAttFormation = function(responseText) {
	    var getNextEnemies = function(responseText) {
	      var troopResponse = JSON.parse(responseText);
	      heroInfo = JSON.stringify(troopResponse.heros);
	      heroInfo = heroInfo.split("\"").join("\'");
	      chief = troopResponse.chief;
	      var saveFormation = function(responseText) {
	        var fightNext = function(responseText) {
	          var quitCampaign = function(responseText) {
	            var renderResult = function(responseText){
	              campaignId++;
	              var fightResult = JSON.parse(responseText);
	              if (fightResult.ok) {
	                renderStatus('大概成功了吧, 離開戰鬥畫面檢查一下');
	              }
	              else {
	                renderStatus('大概成功了吧, 不管了我要上班去了!');
	              }
	            }
	            var quitCampaign = '{"act":"Campaign.quitCampaign","sid":"' + sid + '"}';
	            httpPostString(quitCampaign,url,renderResult)
	          }
	          var fightNextCMD = '{"act":"Campaign.fightNext","sid":"' + sid + '"}';
	          httpPostString(fightNextCMD,url,quitCampaign);
	          renderStatus('刷星'); 
	        }
	        var saveFormationCMD = '{"act":"Campaign.saveFormation","sid":"' + sid + '","body":"{\'heros\':' + heroInfo + ',\'chief\':' + chief + '}"}';
	        httpPostString(saveFormationCMD,url,fightNext);
	      }
	      var nextEnemiesCMD = '{"act":"Campaign.nextEnemies","sid":"' + sid + '"}';
	      httpPostString(nextEnemiesCMD,url,saveFormation)
	    }
	    getAttFormationCMD = '{"act":"Campaign.getAttFormation","sid":"' + sid + '","body":"{\'march\':\'STARRY\'}"}';
	    httpPostString(getAttFormationCMD, url, getNextEnemies);
	    
	  }
	  var sid = tabStatus[tabSwitcher].sid;
	  var url = tabStatus[tabSwitcher].url;
	  var getStarryInfo = '{"act":"Starry.fight","sid":"' + sid + '","body":"{\'campaignId\':'+ campaignId + '}"}';
	  httpPostString(getStarryInfo, url, getAttFormation)
	}

	var campaignId = document.getElementById("star-three-start").value;
	
	setTimeout(starEat,0);
	setTimeout(starEat,500);
	setTimeout(starEat,1000);
}

  var starEatCMD = function() {
    var getAttFormation = function(responseText) {
      var getNextEnemies = function(responseText) {
        var troopResponse = JSON.parse(responseText);
        heroInfo = JSON.stringify(troopResponse.heros);
        heroInfo = heroInfo.split("\"").join("\'");
        chief = troopResponse.chief;
        var saveFormation = function(responseText) {
          var fightNext = function(responseText) {
            var quitCampaign = function(responseText) {
              var renderResult = function(responseText){
                campaignId++;
                var fightResult = JSON.parse(responseText);
                if (fightResult.ok) {
                  renderStatus('大概成功了吧, 離開戰鬥畫面檢查一下');
                }
                else {
                  renderStatus('大概成功了吧, 不管了我要上班去了!');
                }
              }
              var quitCampaign = '{"act":"Campaign.quitCampaign","sid":"' + sid + '"}';
              httpPostString(quitCampaign,url,renderResult)
            }
            var fightNextCMD = '{"act":"Campaign.fightNext","sid":"' + sid + '"}';
            httpPostString(fightNextCMD,url,quitCampaign);
            renderStatus('刷星'); 
          }
          var saveFormationCMD = '{"act":"Campaign.saveFormation","sid":"' + sid + '","body":"{\'heros\':' + heroInfo + ',\'chief\':' + chief + '}"}';
          httpPostString(saveFormationCMD,url,fightNext);
        }
        var nextEnemiesCMD = '{"act":"Campaign.nextEnemies","sid":"' + sid + '"}';
        httpPostString(nextEnemiesCMD,url,saveFormation)
      }
      getAttFormationCMD = '{"act":"Campaign.getAttFormation","sid":"' + sid + '","body":"{\'march\':\'STARRY\'}"}';
      httpPostString(getAttFormationCMD, url, getNextEnemies);
      
    }
    var sid = tabStatus[tabSwitcher].sid;
    var url = tabStatus[tabSwitcher].url;
    var getStarryInfo = '{"act":"Starry.fight","sid":"' + sid + '","body":"{\'campaignId\':'+ campaignId + '}"}';
    httpPostString(getStarryInfo, url, getAttFormation)
  }

// var oneArchery = function() {
//   if(tabStatus[tabSwitcher].sid) {
//     var lookArchery = function(responseText) {
//       var OneYearResponse = JSON.parse(responseText);
//       if (OneYearResponse.ok == 1){
//         var nextShoot = function(responseText) {
//           var archeryInfo = JSON.parse(responseText);
//           if(shootTimes < 10){
//             shootTimes++;
//             var getScore = (archeryInfo.ring)?archeryInfo.ring:0;
//             shootScore+= getScore;
//             if(shootTimes>1) {
//               var scoreString = '射出第' + (shootTimes-1) + '箭, 得' + getScore + '分';
//               renderStatus(scoreString);
//             }
//             var nextShootX = (archeryInfo.wind)? Math.round(archeryInfo.wind*-2/30) : Math.round(archeryInfo.nWind*-2/30);
//             var nextShootCMD = '{"act":"Archery.shoot","sid":"' + sid + '","body":"{\'x\':' + nextShootX + ',\'y\':10,\'type\':\'ONEYEAY\'}"}';
//             httpPostString(nextShootCMD,url,nextShoot);
//           } else {
//             var getScore = archeryInfo.ring;
//             shootScore+= getScore;
//             var scoreString = '射出第' + shootTimes + '箭, 得' + getScore + '分';
//             renderStatus(scoreString);
//             var finalScoreString = '共得' + shootScore + '分';
//             renderStatus(finalScoreString);
//             // var enterArcheryString1 = '{"act":"OneYear.playArcheryInfo","sid":"' + sid + '"}';
//             // var enterArcheryString2 = '{"act":"Archery.archeryOpenInfo","sid":"' + sid + '","body":"{\'type\':\'ONEYEAY\'}"}';
//             // httpPostString(enterArcheryString1,url,function(){});
//             // httpPostString(enterArcheryString2,url,function(){});
//             // httpGet('http://kingres.icantw.com/snres/res/ui/activity/archery_118211.bin?v=1461295399%5F118211');
//             // httpGet('http://kingres.icantw.com/snres/res/effects/ui/archeryFlag_76998.bin?v=1443004136%5F76998');
//           }
          
//         }
//         var getArcheryInfo = '{"act":"Archery.getArcheryInfo","sid":"' + sid + '","body":"{\'type\':\'ONEYEAY\'}"}';
//         httpPostString(getArcheryInfo,url,nextShoot);
//       } else {
//         renderStatus('異常情況, 請重整頁面手動射完')
//       }
//     }
//     var sid = tabStatus[tabSwitcher].sid;
//     var url = tabStatus[tabSwitcher].url;
//     var shootTimes = 0;
//     var shootScore = 0;
//     var buyArchery = '{\"act\":\"OneYear.buyArchery\",\"sid\":\"' + sid + '\"}';
//     httpPostString(buyArchery, url, lookArchery)
//   } else {
//     renderStatus('請點擊主公頭像');
//   }
// }

var multiCityFire = function() {
  var mcfCityArray = document.getElementById("mcf-city-id").value.split(',');
  var getTroopsCMD = '{"act":"NationalWar.getCorpsReserveTroops","sid":"' + tabStatus[tabSwitcher].sid + '","body":"{\'city\':' + mcfCityArray[0] + '}"}'  

  var sortAndSend = function(responseText) {
    var corpsTroopsInfo = JSON.parse(responseText);
    var byPower = corpsTroopsInfo.trps.slice(0);
    byPower.sort(function(a,b) {
      return a.power - b.power;
    });
    
    for (i=0; i<mcfCityArray.length; i++) {
      var troopIdString = '\'trpIds\':[' + byPower[i].uid + '],';
      var useReserveTroopsCMD = '{"act":"NationalWar.useReserveTroops","sid":"' + tabStatus[tabSwitcher].sid + '","body":"{' + troopIdString + '\'city\':' + mcfCityArray[i] + '}"}';
      statusString = '派兵:' + mcfCityArray[i];
      renderStatus(statusString);
      httpPostString(useReserveTroopsCMD,tabStatus[tabSwitcher].url,function(){renderStatus('已派兵');});
    }
  } 
  httpPostString(getTroopsCMD,tabStatus[tabSwitcher].url,sortAndSend)
}  

var multiCityFireBig = function() {
  var mcfCityArray = document.getElementById("mcf-city-id").value.split(',');
  var getTroopsCMD = '{"act":"NationalWar.getCorpsReserveTroops","sid":"' + tabStatus[tabSwitcher].sid + '","body":"{\'city\':' + mcfCityArray[0] + '}"}'  

  var sortAndSend = function(responseText) {
    var corpsTroopsInfo = JSON.parse(responseText);
    var byPower = corpsTroopsInfo.trps.slice(0);
    byPower.sort(function(a,b) {
      return a.power - b.power;
    });
    
    for (i=0; i<mcfCityArray.length; i++) {
      var bigTroopNum = byPower.length - i -1;
      console.log(bigTroopNum);
      var troopIdString = '\'trpIds\':[' + byPower[bigTroopNum].uid + '],';
      var useReserveTroopsCMD = '{"act":"NationalWar.useReserveTroops","sid":"' + tabStatus[tabSwitcher].sid + '","body":"{' + troopIdString + '\'city\':' + mcfCityArray[i] + '}"}';
      statusString = '派兵:' + mcfCityArray[i];
      renderStatus(statusString);
      httpPostString(useReserveTroopsCMD,tabStatus[tabSwitcher].url,function(){renderStatus('已派兵');});
    }
  } 
  httpPostString(getTroopsCMD,tabStatus[tabSwitcher].url,sortAndSend)
}  
  
// 單城循環連刷
var nwlSingleCity = function() {
    if (tabStatus[tabSwitcher].nwlCalledFlag == 0) {
      // change nwl Status
      tabStatus[tabSwitcher].nwlCalledFlag = 1;
      tabStatus[tabSwitcher].nwlCityId = document.getElementById("nwl-city-id").value;
      tabStatus[tabSwitcher].nwlTimeout = document.getElementById("nwl-timeout").value;
      // post the timer trigger of bossWar to background
      var JSONstr = JSON.stringify(tabStatus[tabSwitcher]);
      localStorage.setItem('tabStatus',JSON.stringify(tabStatus));
      tabStatus[tabSwitcher].nwlClick = 1;
      postToBg(JSONstr);  
      document.getElementById("nwl-single-city").title = '您累了嗎? 無米不樂嗎? 停止刷城';
      document.getElementById("nwl-single-city").style['background-image'] = "url('nwl-single-city-off.gif')";
      renderStatus('刷刷刷~~ 刷到天荒地老');

    } else if (tabStatus[tabSwitcher].nwlCalledFlag == 1) {
      // change nwl Status
      tabStatus[tabSwitcher].nwlCalledFlag = 0;
      // tabStatus[tabSwitcher].nwlCityId = document.getElementById("nwl-city-id").value;

      var JSONstr = JSON.stringify(tabStatus[tabSwitcher]);
      localStorage.setItem('tabStatus',JSON.stringify(tabStatus));
      tabStatus[tabSwitcher].nwlClick = 1;
      postToBg(JSONstr);  
      
      document.getElementById("nwl-single-city").title = '選定要刷的城市編號, 上下軍府連刷單一城市。刷城隊伍從武藝較量隊伍抓取，請到排行榜使用刷城隊伍找人較量。';
      document.getElementById("nwl-single-city").style['background-image'] = "url('nwl-single-city.png')";
      renderStatus('停止刷城, 整裝待發!')
    }  
}

// 巔峰對決
var topPVP = function() {
    if (tabStatus[tabSwitcher].topPVPCalledFlag == 0) {
      // change topPVP Status
      tabStatus[tabSwitcher].topPVPCalledFlag = 1;
      tabStatus[tabSwitcher].topPVPTimeout = 240;
      tabStatus[tabSwitcher].troopOne = document.getElementById("pvp-army-one").value;
      tabStatus[tabSwitcher].troopTwo = document.getElementById("pvp-army-two").value;
      tabStatus[tabSwitcher].troopThree = document.getElementById("pvp-army-three").value;
      // post the timer trigger of bossWar to background
      var JSONstr = JSON.stringify(tabStatus[tabSwitcher]);
      localStorage.setItem('tabStatus',JSON.stringify(tabStatus));
      tabStatus[tabSwitcher].topPVPClick = 1;
      postToBg(JSONstr);  
      document.getElementById("top-pvp").title = '您瘋夠了嗎? 停止羊癲瘋';
      document.getElementById("top-pvp").style['background-image'] = "url('nwl-single-city-off.gif')";
      renderStatus('戰戰戰~~ 戰到天荒地老');

    } else if (tabStatus[tabSwitcher].topPVPCalledFlag == 1) {
      // change topPVP Status
      tabStatus[tabSwitcher].topPVPCalledFlag = 0;
      // tabStatus[tabSwitcher].topPVPCityId = document.getElementById("topPVP-city-id").value;

      var JSONstr = JSON.stringify(tabStatus[tabSwitcher]);
      localStorage.setItem('tabStatus',JSON.stringify(tabStatus));
      tabStatus[tabSwitcher].topPVPClick = 1;
      postToBg(JSONstr);  
      
      document.getElementById("top-pvp").title = '指派三個部隊(不指派的話應該會照順序隨便派), 點選羊癲瘋, 將會在指定的時間自動幫你刷巔峰對決。';
      document.getElementById("top-pvp").style['background-image'] = "url('nwl-single-city.png')";
      renderStatus('停止發瘋, 變身小綿羊!')
    }  
}

var sendByPowerRange = function() {
  var sprCity = document.getElementById("spr-city-id").value;
  var sprUpperBoundary = document.getElementById("spr-ub").value;
  var sprLowerBoundary = document.getElementById("spr-lb").value;
  var getTroopsCMD = '{"act":"NationalWar.getCorpsReserveTroops","sid":"' + tabStatus[tabSwitcher].sid + '","body":"{\'city\':' + sprCity + '}"}';
  var sortAndSend = function(responseText) {
    var corpsTroopsInfo = JSON.parse(responseText);
    var byPower = corpsTroopsInfo.trps.slice(0);
    byPower.sort(function(a,b) {
      return a.power - b.power;
    });
    var troopIdString = '\'trpIds\':[';
    for (i=0; i<byPower.length; i++) {
      if (byPower[i].power<=sprUpperBoundary && byPower[i].power >= sprLowerBoundary){
        troopIdString = troopIdString + '\'' + byPower[i].uid + '\',';
      }
    }
    troopIdString = troopIdString.slice(0,troopIdString.length-1);
    troopIdString = troopIdString + '],';
    var useReserveTroopsCMD = '{"act":"NationalWar.useReserveTroops","sid":"' + tabStatus[tabSwitcher].sid + '","body":"{' + troopIdString + '\'city\':' + sprCity + '}"}';
    httpPostString(useReserveTroopsCMD,tabStatus[tabSwitcher].url,function(){renderStatus('已派兵!');});
  }
  httpPostString(getTroopsCMD,tabStatus[tabSwitcher].url,sortAndSend)
  
}

// 玩家偵測

var playerDetect = function() {
  var playerResponseInfo = function(responseText) {
    var playerInfo = JSON.parse(responseText);
    if (playerInfo.nickName) {
      renderStatus('偵測到玩家:' + playerInfo.nickName);
    } else {
      renderStatus('偵測不到任何玩家, 請看看你的背後...');
    }

  }
  var playerDetectStr = '{"act":"Login.login","body":"{\'loginCode\':\'' + tabStatus[tabSwitcher].sid + '\',\'type\':\'WEB_BROWSER\'}"}';
  httpPostString(playerDetectStr, tabStatus[tabSwitcher].url, playerResponseInfo)   

}

// 偵測觀星圖 變數名稱請再修改
var myStar = function() {
  var playerResponseInfo = function(responseText) {
    var playerInfo = JSON.parse(responseText);
    console.log(playerInfo.firecrackers[0].id)
    if (playerInfo.firecrackers) {
      var crackerNos = '';
      for(i=0;i<playerInfo.firecrackers.length;i++) {
        crackerNos = crackerNos + playerInfo.firecrackers[i].id + ',\n'
      }
      renderStatus('偵測到星圖: \n' + crackerNos);
    } else {
      renderStatus('偵測不到任何星圖, 今天大概是陰天吧...');
    }
  }
  var playerDetectStr = '{"act":"StarGazing.myFirecrackerInfo","sid":"' + tabStatus[tabSwitcher].sid + '"}';
  httpPostString(playerDetectStr, tabStatus[tabSwitcher].url, playerResponseInfo)   
}

var yourStar = function() {
  var playerResponseInfo = function(responseText) {
    var playerInfo = JSON.parse(responseText);
    if (playerInfo.ok) {
      renderStatus('偷星成功');
    } else {
      renderStatus('吃到假星圖QQ');
    }
  }
  var starMapNo = document.getElementById('your-star-id').value;
  var playerDetectStr = '{"act":"StarGazing.litOne","sid":"' + tabStatus[tabSwitcher].sid + '","body":"{\'id\':\'' + starMapNo + '\'}"}';
  httpPostString(playerDetectStr, tabStatus[tabSwitcher].url, playerResponseInfo)   
}

var getPKTroop = function() {
  var sid = tabStatus[tabSwitcher].sid;
  var url = tabStatus[tabSwitcher].url;
  var getPKTroops = '{"act":"Campaign.getAttFormation","sid":"' + sid + '","body":"{\'march\':\'PK\'}"}';
  var renderTroops = function(responseText) {
    var serverInfo = JSON.parse(responseText);
    var heroInfo = JSON.stringify(serverInfo.heros);
    var heroInfo = heroInfo.split("\"").join("\'");
    var chief = serverInfo.chief;
    var troopCode = '{\'heros\':' + heroInfo + ',\'chief\':' + chief + '}';
    console.log(troopCode);
    renderArmy(troopCode);
  }
  httpPostString(getPKTroops , url, renderTroops);
  
  
}

var nwlDualCity = function() {
    if (tabStatus[tabSwitcher].nwlDualCalledFlag == 0) {
      // change nwl Status
      tabStatus[tabSwitcher].nwlDualCalledFlag = 1;
      tabStatus[tabSwitcher].nwlCityIdOne = document.getElementById("dual-city-one").value;
      tabStatus[tabSwitcher].nwlCityIdTwo = document.getElementById("dual-city-two").value;
      tabStatus[tabSwitcher].nwlArmyOne = document.getElementById("dual-army-one").value;
      tabStatus[tabSwitcher].nwlArmyTwo = document.getElementById("dual-army-two").value;
      tabStatus[tabSwitcher].nwlTimeout = 20;
      // post the timer trigger of bossWar to background
      var JSONstr = JSON.stringify(tabStatus[tabSwitcher]);
      localStorage.setItem('tabStatus',JSON.stringify(tabStatus));
      tabStatus[tabSwitcher].nwlDualClick = 1;
      postToBg(JSONstr);  
      document.getElementById("nwl-dual-city").title = '您累了嗎? 無米不樂嗎? 停止刷城';
      document.getElementById("nwl-dual-city").style['background-image'] = "url('nwl-single-city-off.gif')";
      renderStatus('刷刷刷~~ 刷到天荒地老');

    } else if (tabStatus[tabSwitcher].nwlDualCalledFlag == 1) {
      // change nwl Status
      tabStatus[tabSwitcher].nwlDualCalledFlag = 0;
      // tabStatus[tabSwitcher].nwlCityId = document.getElementById("nwl-city-id").value;

      var JSONstr = JSON.stringify(tabStatus[tabSwitcher]);
      localStorage.setItem('tabStatus',JSON.stringify(tabStatus));
      tabStatus[tabSwitcher].nwlDualClick = 1;
      postToBg(JSONstr);  
      
      document.getElementById("nwl-dual-city").title = '挑戰呶大一次後設定好 PK 部隊後, 抓取 PK 部隊資訊。部隊資訊顯示於上方訊息框, 請自行複製貼到雙城奇謀部隊設定欄位';
      document.getElementById("nwl-dual-city").style['background-image'] = "url('nwl-single-city.png')";
      renderStatus('停止刷城, 整裝待發!')
    }  
}

//"{"act":"StarGazing.myFirecrackerInfo","sid":"f707ca4616d8ec06b5308e2b231fc12166420962"}"
// {"act":"StarGazing.hisFirecrackerInfo","sid":"0bc9d65f55237611df38489cd51fe154a8aa38e8","body":"{\"id\":\"343399815184384700\"}"}
// {"act":"StarGazing.litOne","sid":"0bc9d65f55237611df38489cd51fe154a8aa38e8","body":"{\"id\":\"343399815184384699\"}"}

// ----------------------------------------------------------------------------------

// # View render --------------------------------------------------------------------
function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText + '\n' + document.getElementById('status').textContent;
}

function renderArmy(statusText) {
  document.getElementById('army').textContent = statusText ;
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
  if((JSONmsg.tabId) && JSONmsg.tabId == tabStatus[tabSwitcher].tabId ) {
    msgFromBackground = JSONmsg;
    if(tabSwitcher) {
      tabStatus[tabSwitcher].sid = JSONmsg.sid;
      tabStatus[tabSwitcher].url = JSONmsg.url;
      tabStatus[tabSwitcher].enterWarCityId = JSONmsg.enterWarCityId;
      tabStatus[tabSwitcher].starCampaignId = JSONmsg.starCampaignId;
      console.log(JSONmsg)
      localStorage.setItem('tabStatus',JSON.stringify(tabStatus));
    }
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
      tabStatus[tabSwitcher].manorStatus = 1;// 0: manor off, 1: manor on
      tabStatus[tabSwitcher].nwlCalledFlag = 0; // 0: not called, 1: call national war loop
      tabStatus[tabSwitcher].topPVPCalledFlag = 0; // 0: not called, 1: call national war loop
      tabStatus[tabSwitcher].nwlDualCalledFlag = 0; // 0: not called, 1: call national war loop
      tabStatus[tabSwitcher].nwlCityId = '';
      tabStatus[tabSwitcher].nwlCityIdOne = '';
      tabStatus[tabSwitcher].nwlCityIdTwo = '';
      tabStatus[tabSwitcher].nwlArmyOne = '';
      tabStatus[tabSwitcher].nwlArmyTwo = '';
      tabStatus[tabSwitcher].nwlClick = 0;
      tabStatus[tabSwitcher].nwlDualClick = 0;
      tabStatus[tabSwitcher].password = '';
    }

    
    localStorage.setItem('tabSwitcher',tabSwitcher);
    document.getElementById('seq-of-manor-on').value = tabStatus[tabSwitcher].manorString;

    // Check ArMingMo at correct Tab
    if(passwordCheck(tabStatus[tabSwitcher].password)){
      document.getElementById("ArMingMo-status-area").style.visibility = 'visible';
      document.getElementById("ArMingMo-password-area").style.visibility = 'hidden';  
      document.getElementById("ArMingMo-password-area").style.height = '0px';
      if(tabSwitcher == pastTabSwitcher){
        myFirstExtFunc();
      } else {
        renderStatus('請先點擊主公頭像!');
        console.log(msgFromBackground)
      }  
    }
    
  })

  // if(tabStatus[tabSwitcher].password) {
  //   fakeAuth()
  // };
  // Listen to button clicks
  document.getElementById('Fake-auth').addEventListener('click', fakeAuth); // ArMing connect
  document.getElementById('ArMing-status').addEventListener('click', myFirstExtFunc); // ArMing connect
  document.getElementById('manor-switch').addEventListener('click', manorSwitch); // Switch the manor to tune your power
  document.getElementById('multi-city-fire').addEventListener('click', multiCityFire); // fire to multi cities from small
  document.getElementById('multi-city-fire-big').addEventListener('click', multiCityFireBig); // fire to multi cities from big
  document.getElementById('nwl-single-city').addEventListener('click', nwlSingleCity); // national war loop
  document.getElementById('send-by-power-range').addEventListener('click', sendByPowerRange); // send by power range
  document.getElementById('player-detect').addEventListener('click', playerDetect); // player detect
  document.getElementById('manor-detect').addEventListener('click', manorDetect); // Detect the earned manor
  document.getElementById('roulette').addEventListener('click', roulette); // Roulette
  document.getElementById('xmas').addEventListener('click', xmas); // Xmax
  document.getElementById('grass-man').addEventListener('click', grassMan); // Earn money from grass-man
  document.getElementById('boss-war').addEventListener('click', bossWar); // Boss-war
  document.getElementById('one-archery').addEventListener('click', oneArchery); // Archery
  document.getElementById('star-detect').addEventListener('click', starDetect); // Star detect
  document.getElementById('star-get').addEventListener('click', starGet); // Star get
  document.getElementById('star-three').addEventListener('click', starThree); // Star five
  document.getElementById('my-star').addEventListener('click', myStar); // Star five
  document.getElementById('your-star').addEventListener('click', yourStar); // Star five
  document.getElementById('get-PK-troop').addEventListener('click', getPKTroop); // Get PK troops
  document.getElementById('nwl-dual-city').addEventListener('click', nwlDualCity); // Dual city loop
  document.getElementById('top-pvp').addEventListener('click', topPVP); // top pvp

});
