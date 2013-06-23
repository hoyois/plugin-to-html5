addKiller("YouTube", {

"playlistFilter": /^UL|^PL|^SP|^AL/,

"decoder": [null,[]],

"canKill": function(data) {
	if(/^https?:\/\/s\.ytimg\.com\//.test(data.src)) return true;
	if(/^https?:\/\/(?:www\.)?youtube(?:-nocookie|\.googleapis)?\.com\//.test(data.src)) {data.embed = true; return true;}
	return false;
},

"process": function(data, callback) {
	var videoID, playlistID, startTime;
	var onsite = /^https?:\/\/www\.youtube\.com\/watch/.test(data.location);
	var flashvars = {};
	
	if(data.embed) { // old-style YT embed
		var match = /\.com\/([vpe])\/+([^&?]+)/.exec(data.src);
		if(match) {
			if(match[1] === "p") playlistID = "PL" + match[2];
			else videoID = match[2];
		} else return;
		match = /[?&]start=([\d]+)/.exec(data.src);
		if(match) startTime = parseInt(match[1]);
	} else {
		flashvars = parseFlashVariables(data.params.flashvars);
		videoID = flashvars.video_id;
		if(!videoID) return;
		if(this.playlistFilter.test(flashvars.list)) playlistID = flashvars.list;
		if(onsite) {
			var match = /[#&?]t=(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?/.exec(data.location);
			if(match) {
				var hours = parseInt(match[1], 10) || 0;
				var minutes = parseInt(match[2], 10) || 0;
				var seconds = parseInt(match[3], 10) || 0;
				startTime = 3600 * hours + 60 * minutes + seconds;
			}
		} else startTime = parseInt(flashvars.start);
	}
	
	var _this = this;
	var mainCallback = function(mediaData) {
		mediaData.startTime = startTime;
		if(onsite) {
			mediaData.initScript = _this.initScript;
			mediaData.restoreScript = _this.restoreScript;
		}
		callback(mediaData);
	};
	
	if(playlistID) this.processPlaylist(playlistID, flashvars, !onsite, mainCallback, callback);
	else if(onsite) {
		if(!/%2[6C]sig%3D/.test(flashvars.url_encoded_fmt_stream_map) && data.src.indexOf(this.decoder[0]) === -1) this.updateDecoder(flashvars, data.src, mainCallback);
		else this.processFlashVars(flashvars, mainCallback);
	}
	else if(videoID) this.processVideoID(videoID, !onsite, mainCallback);
},

"processVideoID": function(videoID, isEmbed, callback) {
	var _this = this;
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "https://www.youtube.com/get_video_info?&video_id=" + videoID + "&eurl=http%3A%2F%2Fwww%2Eyoutube%2Ecom%2F", true);
	xhr.addEventListener("load", function() {
		var flashvars = parseFlashVariables(xhr.responseText);
		if(flashvars.status === "ok" && flashvars.ps !== "live") {
			_this.processFlashVars(flashvars, function(mediaData) {
				if(isEmbed) mediaData.playlist[0].siteInfo = {"name": "YouTube", "url": "http://www.youtube.com/watch?v=" + videoID};
				callback(mediaData);
			});
		} else { // happens e.g. if YT just removed content and didn't update its playlists yet
			callback({"playlist": [null]});
		}
	}, false);
	xhr.send(null);
},

"processFlashVars": function(flashvars, callback) {
	if(flashvars.ps === "live") return;
	var formatList = decodeURIComponent(flashvars.url_encoded_fmt_stream_map).split(",");
	
	var sources = [];
	var x;
	for(var i = 0; i < formatList.length; i++) {
		x = parseFlashVariables(formatList[i]);
		var source = this.processItag(x.itag);
		if(source) {
			source.url = decodeURIComponent(x.url) + "&title=" + flashvars.title + encodeURIComponent(" [" + source.format.split(" ")[0] + "]");
			if(x.sig) source.url += "&signature=" + x.sig;
			else if(x.s) source.url += "&signature=" + this.decodeSignature(x.s);
			sources.push(source);
		}
	}
	
	var posterURL;
	if(flashvars.iurlmaxres) posterURL = decodeURIComponent(flashvars.iurlmaxres);
	else if(flashvars.iurlsd) posterURL = decodeURIComponent(flashvars.iurlsd);
	else posterURL = "https://i.ytimg.com/vi/" + flashvars.video_id + "/hqdefault.jpg";
	
	callback({
		"playlist": [{
			"title": decodeURIComponent(flashvars.title.replace(/\+/g, " ")),
			"poster": posterURL,
			"sources": sources
		}]
	});
},

"updateDecoder": function(flashvars, src, callback) {
	var _this= this;
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "http://www.youtube.com/watch?v=" + flashvars.video_id, true);
	xhr.addEventListener("load", function() {
		var url = /https?:\\\/\\\/s\.ytimg\.com\\\/yts?\\\/jsbin\\\/html5player-vfl.{6}\.js/.exec(xhr.responseText)[0];
		var xhr2 = new XMLHttpRequest();
		xhr2.open("GET", url.replace(/\\\//g, "/"), true);
		xhr2.addEventListener("load", function() {
			var f = /function [A-Za-z]{2}\(a\)\{a=a\.split\(\"\"\);([^"]*)/.exec(xhr2.responseText)[1];
			var regex = /\(([^\d\)]*)(\d*)\)/g;
			_this.decoder[1] = [];
			var match;
			while(match = regex.exec(f)) {
				if(match[1] === "") {
					if(match[2] === "") _this.decoder[1].push([0]);
					else _this.decoder[1].push([1, parseInt(match[2])]);
				} else _this.decoder[1].push([2, parseInt(match[2])]);
			}
			_this.decoder[0] = /as3-vfl(.{6})\.swf/.exec(src)[1];
			_this.processFlashVars(flashvars, callback);
		}, false);
		xhr2.send(null);
	}, false);
	xhr.send(null);
},

"processPlaylist": function(playlistID, flashvars, isEmbed, mainCallback, callback) {
	var videoIDList = [];
	var _this = this;
	
	var loadAPIList = function(playlistURL, startIndex, reverse) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", playlistURL + "?start-index=" + startIndex + "&max-results=50", true);
		xhr.addEventListener("load", function() {
			if(xhr.status === 200) {
				var entries = xhr.responseXML.getElementsByTagName("entry");
				for(var i = 0; i < entries.length; i++) {
					try{ // being lazy
						videoIDList[reverse ? "unshift" : "push"](/\?v=([^&?']+)/.exec(entries[i].getElementsByTagNameNS("http://search.yahoo.com/mrss/", "player")[0].getAttribute("url"))[1]);
					} catch(e) {}
				}
				if(xhr.responseXML.querySelector("link[rel='next']") === null) processList();
				else loadAPIList(playlistURL, startIndex + 50, reverse);
			} else _this.processFlashVars(flashvars, mainCallback);
		}, false);
		xhr.send(null);
	};
	
	var loadPlaylist = function(page) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "http://www.youtube.com/playlist?list=" + playlistID + "&page=" + page, true);
		xhr.addEventListener("load", function() {
			if(xhr.status === 200) {
				var regex = /class=\"video-title-container\">\s*<a href=\"\/watch\?v=([^&]*)/g;
				var match;
				while(match = regex.exec(xhr.responseText)) {
					videoIDList.push(match[1]);
				}
				if(videoIDList.length < 100 * page) processList();
				else loadPlaylist(page + 1);
			} else _this.processFlashVars(flashvars, mainCallback);
		}, false);
		xhr.send(null);
	};
	
	var processList = function() {
		var track = 0;
		var length = videoIDList.length;
		if(flashvars.video_id) { // shift list so that videoID is first
			while(videoIDList[0] !== flashvars.video_id && track < length) {
				++track;
				videoIDList.push(videoIDList.shift());
			}
			if(track === length) {
				videoIDList.unshift(flashvars.video_id);
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
		if(/%26sig%3D/.test(flashvars.url_encoded_fmt_stream_map)) _this.processFlashVars(flashvars, callbackForPlaylist);
		else _this.processVideoID(videoIDList[0], isEmbed, callbackForPlaylist);
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
	
	if(/^UL/.test(playlistID)) {
		if(flashvars.ptchn) loadAPIList("https://gdata.youtube.com/feeds/api/users/" + flashvars.ptchn + "/uploads", 1, true);
		else if(flashvars.creator) loadAPIList("https://gdata.youtube.com/feeds/api/users/" + flashvars.creator + "/uploads", 1, true);
		else {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "https://www.youtube.com/watch?&v=" + playlistID.substring(2), true);
			xhr.addEventListener("load", function() {
				var match = /http:\/\/www\.youtube\.com\/user\/([^"]*)/.exec(xhr.responseText);
				if(match) loadAPIList("https://gdata.youtube.com/feeds/api/users/" + match[1] + "/uploads", 1, true);
				else _this.processFlashVars(flashvars, mainCallback);
			}, false);
			xhr.send(null);
		}
	} else loadPlaylist(1);
},

"processItag": function(itag) {
	if(itag === "38") return {"format": "4K MP4", "height": 2304, "isNative": true};
	if(itag === "37") return {"format": "1080p MP4", "height": 1080, "isNative": true};
	if(itag === "22") return {"format": "720p MP4", "height": 720, "isNative": true};
	if(itag === "18") return {"format": "360p MP4", "height": 360, "isNative": true};
	if(canPlayFLV) {
		if(itag === "35") return {"format": "480p FLV", "height": 480, "isNative": false};
		if(itag === "5") return {"format": "240p FLV", "height": 240, "isNative": false};
	}
	return false;
},

"decodeSignature": function(s) {
	s = s.split("");
	var cycle = function(i) {
	    var t = s[0];
	    s[0] = s[i%s.length];
	    s[i] = t;
	};
	for(var i = 0; i < this.decoder[1].length; i++) {
		switch(this.decoder[1][i][0]) {
		case 0: s = s.reverse(); break;
		case 1: s = s.slice(this.decoder[1][i][1]); break;
		case 2: cycle(this.decoder[1][i][1]); break;
		}
	}
	return s.join("");
},

"initScript": "\
	try{\
		if(!mediaElement.parentNode) throw null;\
		var seekTo = function(time) {\
			var seek = function() {\
				mediaElement.removeEventListener(\"loadeddata\", seek, false);\
				mediaElement.currentTime = time;\
				mediaElement.play();\
			};\
			if(mediaElement.readyState >= mediaElement.HAVE_CURRENT_DATA) {\
				mediaElement.pause();\
				seek();\
			} else {\
				mediaElement.preload = \"auto\";\
				mediaElement.addEventListener(\"loadeddata\", seek, false);\
			}\
			mediaElement.parentNode.focus();\
		};\
		window.yt = window.yt || {}; yt.www = yt.www || {}; yt.www.watch = yt.www.watch || {}; yt.www.watch.player = yt.www.watch.player || {};\
		yt.www.watch.player.flashSeekTo = yt.www.watch.player.seekTo;\
		Object.defineProperty(yt.www.watch.player, \"seekTo\", {\"get\": function() {return seekTo;}, \"set\": function(x) {yt.www.watch.player.flashSeekTo = x;}, \"configurable\": false, \"enumerable\": false});\
	} catch(e) {}",

"restoreScript": "\
	try{\
		var player = {\"seekTo\": yt.www.watch.player.flashSeekTo};\
		for(var e in yt.www.watch.player) {\
			if(e !== \"flashSeekTo\") player[e] = yt.www.watch.player[e];\
		}\
		yt.www.watch.player = player;\
	} catch(e) {}"

});
