// Flowplayer killer (2011-09-16)

addKiller("Flowplayer", {

"canKill": function(data) {
	if(!/(?:^|&)config=/.test(data.params.flashvars)) return false;
	if(/flowplayer[^\/]*\.swf/i.test(data.src)) {return true;}
	if(/bimvid_player-[^\/.]*\.swf(?:\?|$)/.test(data.src)) {data.bim = true; return true;}
},

"process": function(data, callback) {
	var config = JSON.parse(parseFlashVariables(data.params.flashvars).config);
	var baseURL;
	if(config.clip) baseURL = config.clip.baseUrl;
	
	var mediaURL, info;
	var playlist = [];
	var audioOnly = true;
	
	var parseTitle = function(title) {return title};
	if(data.bim) parseTitle = function(title) {return unescapeHTML(title.replace(/\+/g, " "));}
	
	if(config.playList) config.playlist = config.playList;
	if(typeof config.playlist === "object") {
		for(var i = 0; i < config.playlist.length; i++) {
			if(config.playlist[i].provider === "rtmp") continue;
			mediaURL = config.playlist[i].url;
			info = urlInfo(mediaURL);
			if(info) {
				if(config.playlist[i].baseUrl) baseURL = config.playlist[i].baseUrl;
				if(baseURL) {
					if(!/\/$/.test(baseURL)) baseURL += "/";
					mediaURL = baseURL + mediaURL;
				}
				info.url = mediaURL;
				// info.height = ?
				playlist.push({
					"title": parseTitle(config.playlist[i].title),
					"poster": config.playlist[i].overlay,
					"sources": [info]
				});
				if(!info.isAudio) audioOnly = false;
			}
		}
	} else if(config.clip) {
		if(config.clip.provider === "rtmp") return;
		mediaURL = config.clip.url;
		if(!mediaURL) return;
		info = urlInfo(mediaURL);
		if(info) {
			if(baseURL) {
				if(!/\/$/.test(baseURL)) baseURL += "/";
				mediaURL = baseURL + mediaURL;
			}
			info.url = mediaURL;
			playlist.push({
				"title": parseTitle(config.playlist[i].title),
				"poster": config.clip.overlay,
				"sources": [info]
			});
			if(!info.isAudio) audioOnly = false;
		}
	} else return;
	
	callback({
		"playlist": playlist,
		"audioOnly": audioOnly
	});
}

});
