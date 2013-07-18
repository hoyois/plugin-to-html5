addKiller("Katu", {
   
   "canKill": function(data) {
      return /^https?:\/\/www.katu.com\//.test(data.location) && /^fin_videoplayer_/.test(data.params.id);
   },

   "process": function(data, callback) {
		var videoID = /^fin_videoplayer_([\d_]*)/.exec(data.params.id)[1];
		var xhr = new XMLHttpRequest();
		xhr.open("GET", data.location, true);
		xhr.addEventListener("load", function() {
			try{
				var config = new RegExp("fin_story_media\\['" + videoID + "'\\] = ([^;]*)").exec(xhr.responseText)[1];
				var file = /file: '([^']*)',/.exec(config)[1];
				var image = /image: '([^']*)',/.exec(config)[1];
			} catch(e) {
				return;
			}
			
			callback({"playlist": [{
				"sources": [{"url": file, "format": "MP4", "isNative": true}],
				"poster": image
			}]});
		},false);
		xhr.send();
   }
});