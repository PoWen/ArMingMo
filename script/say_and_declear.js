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

var sid = "1c06a3cc197f102ac8c053ff6ec2c88ecf42fe69";
var server = "ub5";
var serverInfo;

var totalScore = 0; 
var arrowNum = 0;
var archeryInfo, scoreInfo, shootScore, shootShout, nextShootX,getArcheryInfo, hostAddress, postAddress;
var drawLottery, refreshLottery;
var hostAddress = "king" + server + ".icantw.com";
var postAddress = "http://" + hostAddress + "/m.do";
var archery = new XMLHttpRequest();
var httpRequest = new XMLHttpRequest();

var cityIdMap = {
  "許昌" : 2, 
  "建業" : 3, 
  "長安" : 4, 
  "襄陽" : 5, 
  "成都" : 6, 
  "南皮" : 7, 
  "濟南" : 8, 
  "太原" : 9,
  "漢中" : 11, 
  "壽春" : 12, 
  "江陵" : 13, 
  "鄴城" : 14, 
  "徐州" : 15, 
  "宛城" : 16, 
  "南陽" : 17, 
  "柴桑" : 18, 
  "江州" : 19, 
  "長沙" : 20, 
  "北平" : 21, 
  "涿郡" : 22, 
  "晉陽" : 23, 
  "平原" : 24, 
  "下邳" : 28, 
  "吳郡" : 29, 
  "盧江" : 30, 
  "渤海" : 25, 
  "薊城" : 26, 
  "任城" : 27, 
  "丹陽" : 31, 
  "南海" : 32, 
  "上庸" : 33, 
  "雲南" : 34, 
  "梓潼" : 35, 
  "咸陽" : 36, 
  "北海" : 37, 
  "譙郡" : 38, 
  "上黨" : 39, 
  "濮陽" : 41, 
  "陳留" : 42, 
  "襄平" : 43, 
  "永安" : 44, 
  "清河" : 45, 
  "臨淄" : 46, 
  "瑯琊" : 47, 
  "廣陵" : 48, 
  "榮陽" : 50, 
  "合肥" : 51,
  "會稽" : 52,
  "豫章" : 53,
  "汝南" : 54,
  "江夏" : 55,
  "武陵" : 56,
  "零陵" : 57,
  "桂陽" : 58,
  "新野" : 60,
  "下卉" : 62,
  "閬中" : 64,
  "陳倉" : 65,
  "陸口" : 66,
  "真定" : 67,
  "巴丘" : 68,
  "桂林" : 69,
  "建寧" : 70,
  "武陽" : 72,
  "椎陽" : 73,
  "小沛" : 74,
  "樂陵" : 75,
  "鄱陽" : 77,
  "公安" : 83,
  "盧陵" : 84,
  "弘農" : 85,
  "交阯" : 78,
  "江油" : 79,
  "建安" : 80,
  "劍閣" : 86,
  "樂浪" : 87,
  "天水" : 88,
  "黎陽" : 89,
  "酒泉" : 90,
  "杳中" : 91,
  "雒城" : 92,
  "淮陰" : 93,
  "安定" : 94,
  "易京" : 95,
  "界橋" : 100,
  "雁門關" : 101,
  "壺關" : 102,
  "白馬" : 103,
  "定陶" : 104,
  "汜水關" : 106,
  "虎牢關" : 107,
  "函谷關" : 108,
  "武關" : 109,
  "濡須口" : 110,
  "牛渚" : 111,
  "赤壁" : 112,
  "博望坡" : 113,
  "檀溪" : 114,
  "長阪坡" : 115,
  "華容" : 116,
  "夷陵" : 117,
  "潼關" : 118,
  "五丈原" : 119,
  "散關" : 120,
  "祈山" : 121,
  "街亭" : 122,
  "錦竹關" : 126,
  "陽平關" : 123,
  "葭萌關" : 124,
  "白水關" : 125
}


var actionFlag = 0;
var troopFlag = 0;
var serverInfo;
var readEmailFlag = 0;
var packingTroopFlag = 0;
var speakFlag = 0;
var attendTroopFlag = 0;
var myVar = setInterval(myTimer, 10000);
var emailId;
var talkContent;

function myTimer() {
    var d = new Date();
    console.log(d.toLocaleTimeString());
    //d.getTime()
    if (d.getHours() >= 9 & d.getHours() <= 23) {
      emailBot()
    }
}


var cityId, troops, trpIdString, goCorps;
    getArcheryInfo = '{"act":"Archery.getArcheryInfo","sid":"' + sid + '","body":"{' + "'" + 'type' + "':'NORMAL'}" + '"}';
    drawLottery = '{"act":"Lottery.drawLottery","sid":"' + sid + '"}';
    refreshLottery = '{"act":"Lottery.refreshLottery","sid":"' + sid + '"}';
    bossWarTroopCode = '{"act":"BossWar.sendTroop","sid":' + sid + '","body":"{' +"'"+'chief'+"'"+':15,'+"'"+'heros'+"'"+':[{'+"'"+'x'+"'"+':-2,'+"'"+'y'+"'"+':0,'+"'"+'index'+"'"+':11},{'+"'"+'x'+"'"+':-4,'+"'"+'y'+"'"+':0,'+"'"+'index'+"'"+':3},{'+"'"+'x'+"'"+':-3,'+"'"+'y'+"'"+':-1,'+"'"+'index'+"'"+':39},{'+"'"+'x'+"'"+':-5,'+"'"+'y'+"'"+':-1,'+"'"+'index'+"'"+':13},{'+"'"+'x'+"'"+':-5,'+"'"+'y'+"'"+':1,'+"'"+'index'+"'"+':15}]}' +'"}';//神將無雙部隊資訊
    grassArrowGold2W = '{\"act\":\"GrassArrow.exchangeGrassArrow\",\"sid\":\"' + sid + '\",\"body\":\"{\'itemId\':11}\"}';
    openEmailPubgame = '{"act":"Email.openInBox","sid":"' + sid + '"}';
    openEmailCommand = '{"act":"Email.openInBox","sid":"' + sid + '"}';
    reactMessage = '{"act":"Chat.sendMessage","sid":"' + sid + '","body":"{\'message\':\'阿明謀好棒棒\',\'channel\':\'COUNTRY\'}"}';

var httpPostString = function(stringContent) {
    httpRequest.open("POST",postAddress,true);
    httpRequest.setRequestHeader("Accept","*/*");
    httpRequest.setRequestHeader("Accept-Language","zh-TW,zh;q=0.8,en-US;q=0.6,en;q=0.4,zh-CN;q=0.2");
    httpRequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    httpRequest.setRequestHeader("X-Requested-With","ShockwaveFlash/21.0.0.216");
    httpRequest.send(stringContent);
}

httpRequest.onreadystatechange=function() {
  if (httpRequest.readyState==4 && httpRequest.status==200)
      {
        //console.log(httpRequest.responseText);
        serverInfo = eval("(" + httpRequest.responseText + ')');
    if (readEmailFlag == 1 & speakFlag ==1){
        console.log("content under readEmailFlag:" + serverInfo.content);
        countryTalk(serverInfo.content);
        readEmailFlag = 0;
        speakFlag = 0;
      }
    else if (troopFlag == 0 & packingTroopFlag ==1){
      console.log('發兵宣兵');

      troops = serverInfo.trps;
      console.log(serverInfo);
      
      trpIdString = '';
      for (var i = 0; i <troops.length-1; i++) {
        trpIdString+= '\'' + Math.floor(troops[i].uid) + '\',';
      }
      trpIdString+= '\'' + Math.floor(troops[troops.length-1].uid) + '\'';

      goCorps = '{"act":"NationalWar.goCorps","sid":"' + sid +'","body":"{\'city\':' + cityId + ',\'trpIds\':[' + trpIdString + ']}"}';
      useReserveTroops = '{"act":"NationalWar.useReserveTroops","sid":"' + sid +'","body":"{\'city\':' + cityId + ',\'trpIds\':[' + trpIdString + ']}"}';
      acturalTroop = attendTroopFlag? useReserveTroops:goCorps
      httpPostString(acturalTroop);
      packingTroopFlag = 0;
    }
    else if (readEmailFlag == 1 & troopFlag ==1){
        getCorpsReserveTroops = '{"act":"NationalWar.getCorpsReserveTroops","sid":"' + sid + '","body":"{\'city\':' + cityId + '}"}';
        httpPostString(getCorpsReserveTroops);
        readEmailFlag = 0;
        troopFlag = 0;
        packingTroopFlag = 1;
    }

    else if (serverInfo.emails[0].subject == '阿明謀說話' & actionFlag ==0){
        emailId = serverInfo.emails[0].id;
        openEmail(serverInfo.emails[0].id);
        actionFlag = 1;
        speakFlag = 1;
        console.log('有人要阿明謀說話~ 阿明謀說話完就鎖死了')
    }
    else if (serverInfo.emails[0].subject.substring(0,4) == '阿明謀宣' & actionFlag ==0){
        emailId = serverInfo.emails[0].id;
        openEmail(serverInfo.emails[0].id);
        actionFlag = 1;
        troopFlag = 1;
        cityId = cityIdMap[serverInfo.emails[0].subject.slice(4)];
        console.log('有人要阿明謀宣' + serverInfo.emails[0].subject.slice(4) +'~ 阿明謀發完就鎖死了')
    }
    else if (serverInfo.emails[0].subject.substring(0,4) == '阿明謀發' & actionFlag ==0){
        emailId = serverInfo.emails[0].id;
        openEmail(serverInfo.emails[0].id);
        actionFlag = 1;
        troopFlag = 1;
        cityId = cityIdMap[serverInfo.emails[0].subject.slice(4)];
        attendTroopFlag = 1;
        console.log('有人要阿明謀發' + serverInfo.emails[0].subject.slice(4) +'~ 阿明謀發完就鎖死了')
    }
    else if (serverInfo.emails[0].subject == '解鎖' & actionFlag ==1){
        actionFlag = 0;
        console.log('阿明謀解鎖!')
    }
  }
  //else console.log("傳輸出現問題，請再次執行阿明謀!")
}

var openEmail = function (id) {
    var openEmailCommand = '{"act":"Email.read","sid":"' + sid + '","body":"{\'emailId\':' + id+ '}"}';
    console.log("openEmail:" + openEmailCommand);
    httpPostString(openEmailCommand);
    readEmailFlag = 1;
}

var countryTalk = function (talkContent) {
    var talkCommand =  '{"act":"Chat.sendMessage","sid":"' + sid + '","body":"{\'channel\':\'WORLD\',\'message\':\''+ talkContent + '\'}"}';
    httpPostString(talkCommand);
    console.log("country Talk:" + talkContent);
}

var httpPostString = function(stringContent) {
    httpRequest.open("POST",postAddress,true);
    httpRequest.setRequestHeader("Accept","*/*");
    httpRequest.setRequestHeader("Accept-Language","zh-TW,zh;q=0.8,en-US;q=0.6,en;q=0.4,zh-CN;q=0.2");
    httpRequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    httpRequest.setRequestHeader("X-Requested-With","ShockwaveFlash/21.0.0.216");
    httpRequest.send(stringContent);

}

var emailBot = function () {
  httpPostString(openEmailCommand)
}


