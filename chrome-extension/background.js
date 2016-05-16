// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Simple extension to replace lolcat images from
// http://icanhascheezburger.com/ with loldog images instead.

// chrome.webRequest.onBeforeRequest.addListener(
//   function(info) {
//     console.log("Cat intercepted: " + info.url);
//     // Redirect the lolcal request to a random loldog URL.
//     var i = Math.round(Math.random() * loldogs.length);
//     return {redirectUrl: loldogs[i]};
//   },
//   // filters
//   {
//     urls: [
//       "https://i.chzbgr.com/*"
//     ],
//     types: ["image"]
//   },
//   // extraInfoSpec
//   ["blocking"]);
//var a;
var JSONObj;
chrome.webRequest.onBeforeRequest.addListener(
    function(details)
    {
        console.log(details.requestBody);
        
        var buf = details.requestBody.raw[0].bytes;
        var buf2Int8 = new Int8Array(buf);
        var resultString = "";
        for(i=0;i<buf2Int8.length;i++){resultString+= String.fromCharCode(buf2Int8[i]);}
        console.log(resultString);
        JSONObj = JSON.parse(resultString);
        if(JSONObj.sid) { console.log(JSONObj.sid);}
    },  
    {urls: ["http://*.icantw.com/*"]},
    ['requestBody']
);