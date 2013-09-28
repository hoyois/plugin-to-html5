addKiller("Flowplayer", {

"canKill": function(data) {
	return /(?:^|&)config=/.test(data.params.flashvars);
},

"process": function(data, callback) {
	try {
		var config = JSON.parse(parseFlashVariables(data.params.flashvars).config.replace(/\n/g, " "));
	} catch(e) {
		return;
	}
	
	var baseURL;
	if(config.clip)	baseURL = config.clip.baseUrl;
	
	var playlist = [];
	var audioOnly = true;
	var splash;
	
	var parseTitle = function(title) {return title;};
	if(/bimvid_player/.test(data.src)) parseTitle = function(title) {return unescapeHTML(title.replace(/\+/g, " "));};
	
	if(config.playList) config.playlist = config.playList;
	if(typeof config.playlist !== "object") {
		if(config.clip) config.playlist = [config.clip];
		else if(data.params.href) config.playlist = [data.params.href];
		else return;
	}
	
	config.playlist.forEach(function(clip) {
		if(typeof clip === "string") clip = {"url": clip};
		
		if(!clip.url) return;
		if(clip.live) return;
		if(clip.provider === "rtmp") return;
		
		clip.url = decodeURIComponent(clip.url);
		var source = extInfo(getExt(clip.url));
		if(source) {
			var base = clip.baseUrl ? clip.baseUrl : baseURL;
			if(base && !/^https?:/.test(clip.url)) {
				base = decodeURIComponent(base);
				if(!/\/$/.test(base) && !/^\//.test(clip.url)) base += "/";
				source.url = base + clip.url;
			} else {
				source.url = clip.url;
			}
			
			var poster;
			if(clip.coverImage) poster = decodeURIComponent(clip.coverImage.url);
			else if(clip.overlay) poster = decodeURIComponent(clip.overlay);
			else poster = splash;
			splash = undefined;
			
			playlist.push({
				"title": parseTitle(clip.title),
				"poster": poster,
				"sources": [source]
			});
			if(!source.isAudio) audioOnly = false;
		} else {
			var ext = getExt(clip.url);
			if(ext === "jpg" || ext === "png") splash = clip.url;
			else splash = undefined;
		}
	});
	
	if(playlist.length !== 0) callback({
		"playlist": playlist,
		"audioOnly": audioOnly
	});
}

});
