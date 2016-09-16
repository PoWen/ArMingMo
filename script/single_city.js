// 目前要是副盟主以上才有辦法用這段程式碼(要有調兵權限)
// 找sid方法: 到阿明謀按右鍵, 檢查彈出視窗, 在彈出視窗的 console 貼上下面這一行 var = sid = xxxxx
// var sid = tabStatus[tabSwitcher].sid
	
// sid 找到之後貼這裡v
    var sid = "f707ca4616d8ec06b5308e2bc5c1ee3a3c1ad4d4";
	var url = "http://kingua10.icantw.com/m.do";
	var cityId = "78"; // 晉陽:23; 交趾: 78; 
	var waitTimeout = 860000; // 90兵城市給940000; 80兵城市給880000;

// http://kingua9.icantw.com/m.do // 31服合後

	// 這邊輸入你的名字
	var myName = "成都端木叔明.S35"; // 成都端木叔明

	// 這邊輸入你上軍府的數字
	var manorSeq = '1,7,5,6,8,12,9,2';

	// 這邊是你的刷城隊, 因人而異, 程式會自動抓你較量切磋的陣行, 請先用刷城隊挑戰呶大
	var troopCode; // = '{\'heros\':[{\'x\':-2,\'y\':0,\'index\':23},{\'x\':-4,\'y\':0,\'index\':54},{\'x\':-3,\'y\':-1,\'index\':31},{\'x\':-5,\'y\':-1,\'index\':21},{\'x\':-3,\'y\':1,\'index\':27}],\'chief\':31}';
	
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
	  serverInfo = JSON.parse(responseText);
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


	var sendTroopsWithLittleGrass = function(){
	    var sendTroopsAndMonorOn = function(){
	    	var formatTroops = function(responseText) {
	  			
		    		var enterWarString = '{"act":"NationalWar.enterWar","sid":"' + sid + '","body":"{\'cityId\':' + cityId + '}"}';
			    	var chooseSide = function() {
			    		var chooseSideString = '{"act":"NationalWar.chooseSide","sid":"' + sid + '","body":"{\'side\':\'LEFT\',\'cityId\':' + cityId + '}"}';
			    		var sendTroopFunc = function() {
			    			// var ultimateCityTroop = '{"act":"NationalWar.sendTroops","sid":"' + sid + '","body":"{\'save\':'+ troopCode +',\'type\':\'NATIONAL_WAR\',\'cityId\':' + cityId + '}"}';
			    			var leaveWar = function() {
			    				var leaveWarString = '{"act":"NationalWar.leaveWar","sid":"' + sid + '","body":"{\'cityId\':' + cityId + '}"}';
			    				httpPostString( leaveWarString, url, manorOn);
			    			}
							httpPostString( ultimateCityTroop, url, leaveWar);				
			    		}
			    		httpPostString( chooseSideString, url, sendTroopFunc);
			    	}
			    
	  			
	  			serverInfo = JSON.parse(responseText);
			    heroInfo = JSON.stringify(serverInfo.heros);
			    heroInfo = heroInfo.split("\"").join("\'");
			    chief = serverInfo.chief;
			    troopCode = '{\'heros\':' + heroInfo + ',\'chief\':' + chief + '}';
			    var ultimateCityTroop = '{"act":"NationalWar.sendTroops","sid":"' + sid + '","body":"{\'save\':'+ troopCode +',\'type\':\'NATIONAL_WAR\',\'cityId\':' + cityId + '}"}';
			    // troopCode = '{\'heros\':' + heroInfo + ',\'chief\':' + chief + '}"}';
			    httpPostString( enterWarString, url, chooseSide);
	    	}
	    	var getPKTroops = '{"act":"Campaign.getAttFormation","sid":"' + sid + '","body":"{\'march\':\'PK\'}"}';
			httpPostString(getPKTroops , url, formatTroops);

	    	
	    }	
	  setTimeout(manorOff,0);  
	  setTimeout(sendTroopsAndMonorOn,10000);
	}

var getCityTroops = '{"act":"NationalWar.getCorpsReserveTroops","sid":"' + sid + '","body":"{\'city\':78}"}';
httpPostString( getCityTroops, url, getMyTroopsHome);
	
 var singleCity = function() {
 	var getCityTroops = '{"act":"NationalWar.getCorpsReserveTroops","sid":"' + sid + '","body":"{\'city\':78}"}';
 	httpPostString( getCityTroops, url, getMyTroopsHome);
 }

 var singleCityLoop = setInterval(singleCity, waitTimeout); 
