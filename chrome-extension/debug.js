chrome.webRequest.onBeforeRequest.addListener(
    function(details)
    {
      if((details.method) && details.method == 'POST') {
        console.log('requestBody:')
        console.log(details.requestBody)

        var buf = details.requestBody.raw[0].bytes;

        console.log('buf:' + buf);
        
        var buf2Int8 = new Int8Array(buf);
        var resultString = "";
        for(i=0;i<buf2Int8.length;i++){resultString+= String.fromCharCode(buf2Int8[i]);}
        JSONObj = JSON.parse(resultString);
        console.log(JSON.stringify(JSONObj));
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
    },  
    {urls: ["http://*.icantw.com/*"]},
    ['requestBody']
  );