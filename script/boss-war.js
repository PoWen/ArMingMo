// 阿明謀使用步驟:
// 1. 使用 Chrome 瀏覽器玩大皇帝，在遊戲分頁打開 "開發者工具"
// 2. 在console中找到你的 sid 填在本程式碼中的var sid = "你的sid" 
// 3. 在開發者工具的 network 中找到 m.do , 右鍵選擇將 m.do 開在新的視窗
// 4. 到新開的 m.do 分頁，開啟這個分頁的開發者工具。
// 5. 貼入整個城市碼到 m.do 分頁的開發者工具的 console。
// 6. 阿明謀成功開啟! 每 10 秒 console 中會顯示現在時間。
// 7. 想讓盟友透過信件請你派兵, 請他寄信給你, 標題:阿明謀發xxx, 發完後暫時鎖住阿明謀發兵功能。必須要另外發一封信, 標題:解鎖
// 8. 想讓盟友透過信件請你宣戰, 請他寄信給你, 標題:阿明謀宣xxx, 發完後暫時鎖住阿明謀發兵功能。必須要另外發一封信, 標題:解鎖
// 9. 阿明謀純屬娛樂用, 請勿用做商業用途。使用後果請自行負責, 祝遊戲愉快。

// 使用者須輸入的資訊
var sid = "a81c843e717d47e8a29178cff222f1461a870d20";
var server = "40";



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
var getPKTroops = '{"act":"Campaign.getAttFormation","sid":"' + sid + '","body":"{\'march\':\'BOSS_WAR_PK\'}"}';
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

