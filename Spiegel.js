if(window.safari) {
	// SPIEGEL.DE HACKS for ClickToPlugin
	safari.extension.addContentStyleSheet("div.jw-controls.jw-reset {display: none !important;}", ["http://*.spiegel.de/*"], []);
}


addKiller("Spiegel", {
	
"canKill": function(data) {
	return (data.baseURL == "http://www.spiegel.de/video/") || 
		(/^http:\/\/www\.spiegel\.de\/static\/flash/.test(data.src));
},

"process": function(data, callback) {
	var _this = this;
	if (data.baseURL == "http://www.spiegel.de/video/") {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", data.baseURL, true);
		xhr.addEventListener("load", function() {
			var videoID = xhr.responseText.replace(/[\s\S]*<div id="spPanoPlayer(\d+)"[\s\S]*/g, "$1")
			if(!isNaN(videoID)) {
				_this.createCallback(videoID, callback);
			} 
		}, false);
		xhr.send(null);
	}
	else {
		var videoID = data.baseURL.replace(/.*-video-(\d+).*.html/g, "$1");
		if(!isNaN(videoID)) {
			_this.createCallback(videoID, callback);
		} 
	}
},


"createCallback": function(videoID, callback) {
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
