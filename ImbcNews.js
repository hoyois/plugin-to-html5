addKiller("ImbcNews", {
	"canKill": function(data) {
		if(data.src.indexOf("ImbcNewsPlayer.swf") !== -1) return true;
		return false;
	},

	"process": function(data, callback) {
		var flashvars = parseFlashVariables(data.params.flashvars);
		var match = flashvars.vodUrl.match(/^rtmp:\/\/(.+)\.mp4$/i);
		if(match) {
			var start_time = flashvars.startTime;
			var end_time = flashvars.endTime;
			var img_url = flashvars.imgUrl;
			var url = "http://"+ match[1] +".mp4/playlist.m3u8?wowzaplaystart="+ start_time +"&wowzaplayduration="+ (end_time - start_time);
			callback({
				"playlist": [{
					"poster": img_url,
					"sources": [{
						"url": url,
						"format": "MP4",
						"isNative": true
					}]
				}]
			});

		}
	}
});
