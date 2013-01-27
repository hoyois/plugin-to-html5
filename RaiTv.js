addKiller("RaiTv", {
   
   "canKill": function(data) {
      if(data.type !== "application/x-silverlight") return false;
      return data.src.indexOf("http://www.rai.tv/") !== -1;
   },

   "process": function(data, callback) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", data.location);
		xhr.addEventListener("load", function() {
			var xml = new DOMParser().parseFromString(xhr.responseText, "text/xml");
			var videourl_mp4 = /<meta name="videourl_mp4" content="(.*)"/.exec(xhr.responseText);
			if(!videourl_mp4){
				videourl_mp4 = /"h264": "(.*)"/.exec(xhr.responseText);
			}
			var poster = /div data-cloud.*data-img="(.*)" d/.exec(xhr.responseText);
			callback({
			         "playlist": [{
			            "poster": poster[1],
			            "sources": [{
			               "url": videourl_mp4[1],
			               "isNative": true
			            }]
			         }]
			      });
		},false);
		xhr.send();
   }
});