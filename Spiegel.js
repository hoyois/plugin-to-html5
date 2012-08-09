addKiller("Spiegel", {
	
"canKill": function(data) {
	return /^http:\/\/www\.spiegel\.de\/static\/flash/.test(data.src);
},

"process": function(data, callback) {
	var videoID = parseFlashVariables(data.params.flashvars).videoid;
	callback({
		"playlist": [{
			"sources": [{
				"url": "http://www.spiegel.de/video/media/video-" + videoID + ".html",
				"isNative": true
			}]
		}]
	});
}

});
