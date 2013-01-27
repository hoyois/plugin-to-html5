addKiller("XinMSN", {
   
   "canKill": function(data) {
      return data.src.indexOf("video.s-msn.com/") !== -1;
   },

   "process": function(data, callback) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", data.location);
		xhr.addEventListener("load", function() {
			var config = xhr.responseText;
			var i = config.indexOf("videoFiles:");
			config = config.substring(i+12);
			i = config.indexOf("]");
			config = config.substring(0,i+1);
			
			var videoFiles = JSON.parse(config.replace(/'/g, "\"").replace(/\\x/g, "%").replace(/([{,] ?)([a-zA-Z]*):/g, "$1\"$2\":"));
			
			var sources = [];
			var heights = {};
			
			for(var i = videoFiles.length - 1; i >= 0; i--) {
				if(heights[videoFiles[i].height]) continue;
				heights[videoFiles[i].height] = true;
				var url = decodeURIComponent(videoFiles[i].url);
				if(/\.mp4$/.test(url)) sources.push({
					"isNative": true,
					"url": url,
					"height": videoFiles[i].height,
					"format": videoFiles[i].height + "p MP4"
				});
			}
			
			callback({
			         "playlist": [{
			            "poster": undefined,
			            "sources": sources
			         }]
			      });
		},false);
		xhr.send();
   }
});