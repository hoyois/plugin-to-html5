// Flowplayer killer (2011-08-14)
// by Marc Hoyois

var killer = new Object();
addKiller("Flowplayer", killer);

killer.canKill = function(data) {
	if(data.plugin !== "Flash") return false;
	if(!/(?:^|&)config=/.test(data.params)) return false;
	if(/flowplayer[^\/]*\.swf/i.test(data.src)) {return true;}
	if(/bimvid_player-[^\/.]*\.swf$/.test(data.src)) {data.bim = true; return true;}
};

killer.process = function(data, callback) {
	var config = JSON.parse(decodeURIComponent(parseFlashVariables(data.params).config));
	var baseURL;
	if(config.clip) baseURL = config.clip.baseUrl;
	
	var mediaURL, ext;
	var playlist = new Array();
	var isAudio = true;
	
	var parseTitle = function(title) {return title};
	if(data.bim) parseTitle = function(title) {return unescapeHTML(title.replace(/\+/g, " "));}
	
	if(config.playList) config.playlist = config.playList;
	if(typeof config.playlist === "object") {
		for(var i = 0; i < config.playlist.length; i++) {
			if(config.playlist[i].provider === "rtmp") continue;
			mediaURL = config.playlist[i].url;
			ext = extInfo(mediaURL);
			if(ext) {
				if(config.playlist[i].baseUrl) baseURL = config.playlist[i].baseUrl;
				if(baseURL) {
					if(!/\/$/.test(baseURL)) baseURL += "/";
					mediaURL = baseURL + mediaURL;
				}
				playlist.push({"title": parseTitle(config.playlist[i].title), "poster": config.playlist[i].overlay, "sources": [{"url": mediaURL, "mediaType": ext.mediaType, "isNative": ext.isNative}]}); // resolution:
				if(ext.mediaType === "video") isAudio = false;
			}
		}
	} else if(config.clip) {
		if(config.clip.provider === "rtmp") return;
		mediaURL = config.clip.url;
		if(!mediaURL) return;
		ext = extInfo(mediaURL);
		if(ext) {
			if(baseURL) {
				if(!/\/$/.test(baseURL)) baseURL += "/";
				mediaURL = baseURL + mediaURL;
			}
			playlist.push({"title": parseTitle(config.playlist[i].title), "poster": config.clip.overlay, "sources": [{"url": mediaURL, "mediaType": ext.mediaType, "isNative": ext.isNative}]});
			if(ext.mediaType === "video") isAudio = false;
		}
	} else return;
	
	var mediaData = {
		"playlist": playlist,
		"isAudio": isAudio
	};
	callback(mediaData);
};
