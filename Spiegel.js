addKiller("Spiegel", {
	
"canKill": function(data) {
	return /^http:\/\/www\.spiegel\.de\/static\/flash/.test(data.src);
},

"process": function(data, callback) {
	var videoID = data.baseURL.replace(/http.*-(\d+)-iframe.html/g, "$1");
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
