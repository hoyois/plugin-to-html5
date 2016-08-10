if(window.safari) {
	// YOUTUBE HACKS for ClickToPlugin
	var script = "var s = document.createElement('script'); s.textContent = 'if(!/[?&]html5=1/.test(location.search)){";
	// Disable SPF
	script += "ytspf={};Object.defineProperty(ytspf,\"enabled\",{\"value\":false});";
	// Disable HTML5
	script += "HTMLMediaElement.prototype.canPlayType=function(){return\"\";};HTMLMediaElement.prototype.nativePlay=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){if(this.className===\"CTPmediaElement\")this.nativePlay();else{this.removeAttribute(\"src\");this.load();}};";
	// Disable Flash version checking...
	// ... on /watch pages
	script += "ytplayer={};Object.defineProperty(ytplayer,\"config\",{\"get\":function(){return ytplayer.$;},\"set\":function($){$.min_version=\"0.0.0\";$.url_v9as2=$.url;ytplayer.$=$;}});";
	// ... on /embed pages
	script += "yt={\"config_\":{}};Object.defineProperty(yt.config_,\"PLAYER_CONFIG\",{\"get\":function(){return yt.config_.$;},\"set\":function($){$.min_version=\"0.0.0\";$.url_v9as2=$.url;yt.config_.$=$;}});";
	// ... on /user pages
	script += "document.addEventListener(\"DOMContentLoaded\",function(){var v=document.getElementById(\"upsell-video\");if(v)v.dataset.swfConfig=v.dataset.swfConfig.replace(/(min_version[^\\\\d]*)\\\\d+\\\\.\\\\d+\\\\.\\\\d+/,\"$10.0.0\").replace(/(url_v9as2\\\":\\\")\\\"/,\"$1\"+ytplayer.config.url.replace(/\\\\//g,\"\\\\\\\\/\")+\"\\\\\"\");},true);";
	script += "}'; document.documentElement.appendChild(s);";
	safari.extension.addContentScript(script, ["http://www.youtube.com/*", "https://www.youtube.com/*"], [], false);
}

addKiller("YouTube", {

"canKill": function(data) {
	if(/^https?:\/\/s\.ytimg\.com\//.test(data.src)) return true;
	if(/^https?:\/\/(?:www\.)?youtube(?:-nocookie|\.googleapis)?\.com\/[vpe]\//.test(data.src)) {data.embed = true; return true;}
	return false;
},

"process": function(data, callback) {
	var videoID, playlistID, startTime;
	var onsite = /^https?:\/\/www\.youtube\.com\/watch\?/.test(data.location);
	
	if(data.embed) { // old-style YT embed
		var match = /\.com\/([vpe])\/+([^&?]+)/.exec(data.src);
		if(match) {
			if(match[1] === "p") playlistID = "PL" + match[2];
			else videoID = match[2];
		} else return;
		match = /[?&]start=([\d]+)/.exec(data.src);
		if(match) startTime = parseInt(match[1]);
	} else {
		var flashvars = parseFlashVariables(data.params.flashvars);
		videoID = flashvars.video_id;
		if(!videoID) return;
		
		if(/^PL|^FL|^SP|^AL/.test(flashvars.list)) playlistID = flashvars.list;
		if(onsite) {
			var match = /[#&?]t=(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?/.exec(data.location);
			if(match) {
				var hours = parseInt(match[1]) || 0;
				var minutes = parseInt(match[2]) || 0;
				var seconds = parseInt(match[3]) || 0;
				startTime = 3600 * hours + 60 * minutes + seconds;
			}
		} else startTime = parseInt(flashvars.start);
	}
	
	var mainCallback = function(mediaData) {
		mediaData.startTime = startTime;
		if(onsite) {
			mediaData.initScript = "try{var _this=this;var seekTo=function(time){var seek=function(){_this.removeEventListener(\"loadeddata\",seek,false);_this.play();_this.currentTime=time;};if(_this.readyState>=_this.HAVE_CURRENT_DATA)seek();else{_this.preload=\"auto\";_this.addEventListener(\"loadeddata\",seek,false);}_this.parentNode.focus();};window.yt=window.yt||{};yt.www=yt.www||{};yt.www.watch=yt.www.watch||{};yt.www.watch.player=yt.www.watch.player||{};yt.www.watch.player.flashSeekTo=yt.www.watch.player.seekTo;Object.defineProperty(yt.www.watch.player,\"seekTo\",{\"get\":function(){return seekTo;},\"set\":function(x){yt.www.watch.player.flashSeekTo=x;},\"enumerable\":false,\"configurable\":false});}catch(e){}";
			mediaData.restoreScript = "try{var player={\"seekTo\":yt.www.watch.player.flashSeekTo};for(var e in yt.www.watch.player){if(e!==\"flashSeekTo\")player[e]=yt.www.watch.player[e];}yt.www.watch.player=player;}catch(e){}";
		}
		callback(mediaData);
	};
	
	if(playlistID) this.processPlaylist(playlistID, videoID, mainCallback, callback);
	else if(videoID) this.processVideoID(videoID, !onsite, mainCallback);
},

"processVideoID": function(videoID, isEmbed, callback) {
	var _this = this;
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "https://www.youtube.com/get_video_info?&video_id=" + videoID + "&eurl=http%3A%2F%2Fwww%2Eyoutube%2Ecom%2F&sts=135957536242", true);
	xhr.addEventListener("load", function() {
		var flashvars = parseFlashVariables(xhr.responseText);
		if(flashvars.status === "ok") {
			_this.processFlashVars(flashvars, isEmbed ? function(mediaData) {
				mediaData.playlist[0].siteInfo = {"name": "YouTube", "url": "http://www.youtube.com/watch?v=" + videoID};
				callback(mediaData);
			} : callback);
		} else { // e.g. region-blocked video
			callback({"playlist": [null]});
		}
	}, false);
	xhr.send(null);
},

"processFlashVars": function(flashvars, callback) {
	if(flashvars.ps === "live" && !flashvars.hlsvp) return;
	
	var sources = [];
	var title = flashvars.title.replace(/%22/g, "%5C%22");
	
	// Get video URLs
	if(flashvars.url_encoded_fmt_stream_map) { // Get 240p, 360p, and 720p
		var fmtList = decodeURIComponent(flashvars.url_encoded_fmt_stream_map).split(",");
		var fmt, source;
		for(var i = 0; i < fmtList.length; i++) {
			fmt = parseFlashVariables(fmtList[i]);
			if(!fmt.url) continue;
			
			if(fmt.itag === "22") {
				source = {"format": "720p MP4", "height": 720, "isNative": true};
			} else if(fmt.itag === "18") {
				source = {"format": "360p MP4", "height": 360, "isNative": true};
			} else if(canPlayFLV && fmt.itag === "5") {
				source = {"format": "240p FLV", "height": 240, "isNative": false};
			} else continue;
			
			source.url = decodeURIComponent(fmt.url);
			if(fmt.sig) source.url += "&signature=" + fmt.sig;
			else if(fmt.s) source.url += "&signature=" + this.decodeSignature(fmt.s);
			// title parameter cannot be more than 228 unescaped characters
			if(unescape(title + source.height).length < 225) source.url += "&title=" + title + "%20%5B" + source.height + "p%5D";
			sources.push(source);
		}
	} else if(flashvars.hlsvp) {
		sources.push({"url": decodeURIComponent(flashvars.hlsvp), "format": "HLS", "isNative": true});
	}
	
	var poster, title;
	if(flashvars.iurlmaxres) poster = decodeURIComponent(flashvars.iurlmaxres);
	else if(flashvars.iurlsd) poster = decodeURIComponent(flashvars.iurlsd);
	else poster = "https://i.ytimg.com/vi/" + flashvars.video_id + "/hqdefault.jpg";
	if(flashvars.title) title = decodeURIComponent(flashvars.title.replace(/\+/g, " "));
	
	sources.sort(function(s, t) {
		return s.height < t.height ? 1 : -1;
	});
	
	callback({
		"playlist": [{
			"title": title,
			"poster": poster,
			"sources": sources
		}]
	});
},

"decodeSignature": function(s) {
	s = s.split("");
	s = s.slice(3);
	s = s.reverse();
	s = s.slice(2);
	s = s.reverse();
	s = s.slice(1);
	s = s.reverse();
	var t = s[0];
	s[0] = s[67%s.length];
	s[67] = t;
	return s.join("");
},

"processPlaylist": function(playlistID, videoID, mainCallback, callback) {
	var videoIDList = [];
	var _this = this;
	
	var loadPlaylist = function(url) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url ? url : "https://www.youtube.com/playlist?list=" + playlistID, true);
		xhr.addEventListener("load", function() {
			if(xhr.status === 200) {
				var regex = /\bdata-video-id=\\?"([^\\"]*)\\?"/g;
				var match;
				while(match = regex.exec(xhr.responseText)) {
					videoIDList.push(match[1]);
				}
				match = /\bdata-uix-load-more-href=\\?"([^"]*)\\?"/.exec(xhr.responseText);
				if(match === null) processList();
				else loadPlaylist("https://www.youtube.com" + unescapeUnicode(match[1]).replace(/\\/g, "").replace(/&amp;/g, "&"));
			} else if(videoID) _this.processVideoID(videoID, false, mainCallback);
		}, false);
		xhr.send(null);
	};
	
	var processList = function() {
		var track = 0;
		var length = videoIDList.length;
		if(videoID) { // shift list so that videoID is first
			while(videoIDList[0] !== videoID && track < length) {
				++track;
				videoIDList.push(videoIDList.shift());
			}
			if(track === length) {
				videoIDList.unshift(videoID);
				++length;
				track = 0;
			}
		}
		
		var callbackForPlaylist = function(mediaData) {
			mediaData.playlistLength = length;
			mediaData.startTrack = track;
			mainCallback(mediaData);
		};
		
		// load the first video at once
		_this.processVideoID(videoIDList[0], !videoID, callbackForPlaylist);
		videoIDList.shift();
		unloadList();
	};
	
	var unloadList = function() {
		if(videoIDList.length === 0) return;
		var i = 0;
		var imax = videoIDList.length;
		if(imax > 3) imax = 3; // load by groups of 3
		var mediaData = {"loadAfter": true, "playlist": []};
		var next = function(data) {
			mediaData.playlist.push(data.playlist[0]);
			++i;
			if(i === imax) {
				callback(mediaData);
				unloadList();
			} else _this.processVideoID(videoIDList.shift(), true, next);
		};
		_this.processVideoID(videoIDList.shift(), true, next);
	};
	
	loadPlaylist();
}

});
