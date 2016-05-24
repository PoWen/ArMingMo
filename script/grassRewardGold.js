// 阿明謀使用步驟:
// 1. 使用 Chrome 瀏覽器玩大皇帝，在遊戲分頁打開 "開發者工具"
// 2. 在console中找到你的 sid 填在本程式碼中的var sid = "你的sid" 
// 3. 在開發者工具的 network 中找到 m.do , 右鍵選擇將 m.do 開在新的視窗
// 4. 到新開的 m.do 分頁，開啟這個分頁的開發者工具。
// 5. 貼入整個城市碼到 m.do 分頁的開發者工具的 console。 目前僅支援 400 箭矢兌換 20000 金的獎項，非領取此獎項請勿嘗試此阿明謀功能。
// 6. 阿明謀純屬娛樂用, 請勿用做商業用途。使用後果請自行負責, 祝遊戲愉快。


var sid = "f707ca4616d8ec06b5308e2b52aa304cbaf1bd0f";

var server = "35";
var serverInfo;

var hostAddress = "kings" + server + ".icantw.com";
var postAddress = "http://" + hostAddress + "/m.do";
var httpRequest = new XMLHttpRequest();

    grassArrowGold2W = '{\"act\":\"GrassArrow.exchangeGrassArrow\",\"sid\":\"' + sid + '\",\"body\":\"{\'itemId\':11}\"}';

var rewardTimes = 0;
var eachReward = 20000;
//var totalReward;
httpRequest.onreadystatechange=function()
  {
  if (httpRequest.readyState==4 && httpRequest.status==200)
    {
    	//console.log(httpRequest.responseText);
    	grassServerInfo = eval("(" + httpRequest.responseText + ')');
    	
		
		if (grassServerInfo.ok == 1) {
			rewardTimes+= 1;

			console.log("領取金幣次數:" + rewardTimes + '\n'); 
		
			grassRewardGold();	
		}
		else console.log("領完囉~ 共領:" + rewardTimes*eachReward + "銀幣，下班!");
		
    }
  //else console.log("傳輸出現問題，請再次執行阿明謀!")
}

var grassRewardGold = function () {
	var drawTimer, refreshTimer; 
	drawTimer = 0;
	setTimeout(function() { 
		httpRequest.open("POST",postAddress,true);
		httpRequest.setRequestHeader("Accept","*/*");
		httpRequest.setRequestHeader("Accept-Language","zh-TW,zh;q=0.8,en-US;q=0.6,en;q=0.4,zh-CN;q=0.2");
		httpRequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		httpRequest.setRequestHeader("X-Requested-With","ShockwaveFlash/21.0.0.216");
		httpRequest.send(grassArrowGold2W);
	}, drawTimer);
}

grassRewardGold();

