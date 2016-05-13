// 使用者須輸入的資訊
var sid = "a123456789087653345678765434567765434511";
var server = "35";



// URL
var hostAddress = "kings" + server + ".icantw.com";
var postAddress = "http://" + hostAddress + "/m.do";

// Flags
var timeFlag = 0;
var troopFlag = 0;

// Init
var serverInfo, troopCode, heroInfo, chief;
var httpRequest = new XMLHttpRequest();


// functions
var httpPostString = function(stringContent) {
    httpRequest.open("POST",postAddress,true);
    httpRequest.setRequestHeader("Accept","*/*");
    httpRequest.setRequestHeader("Accept-Language","zh-TW,zh;q=0.8,en-US;q=0.6,en;q=0.4,zh-CN;q=0.2");
    httpRequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    httpRequest.setRequestHeader("X-Requested-With","ShockwaveFlash/21.0.0.216");
    httpRequest.send(stringContent);
}

httpRequest.onreadystatechange=function() {
  if (httpRequest.readyState==4 && httpRequest.status==200) {
    serverInfo = eval("(" + httpRequest.responseText + ')');
    console.log(serverInfo);
    if (troopInfoFlag == 0) {
      heroInfo = JSON.stringify(serverInfo.heros);
      heroInfo = heroInfo.split("\"").join("\'");
      chief = serverInfo.chief;
      troopCode = '{"act":"BossWar.sendTroop","sid":"' + sid + '","body":"{\'heros\':' + heroInfo + ',\'chief\':' + chief + '}"}';
      troopInfoFlag = 1;
    }
  }
}

// getTroopInfo from PK
var getPKTroops = '{"act":"Campaign.getAttFormation","sid":"' + sid + '","body":"{\'march\':\'PK\'}"}';
var troopInfoFlag = 0;
httpPostString(getPKTroops);

// send troops automatically during 20:00~20:30 at Fri. and Sun.
var myVar = setInterval(myTimer, 1000);

function myTimer() {
    var d = new Date();
    console.log(d.toLocaleTimeString());
    if ((d.getDay() == 5||d.getDay() == 0) & d.getHours() == 20 & d.getMinutes() >= 0 & d.getMinutes() <= 30 ) {
    	timeFlag = 1;
    	troopFlag+= 1;
    }
    else timeFlag = 0;

    if ((troopFlag%31) == 1) {
    	sendTroops();
    	console.log("送出隊伍!")
    }
}

var sendTroops = function () {
	httpPostString(troopCode)
}

