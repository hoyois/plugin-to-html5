addKiller("CollegeHumor", {

"canKill": function(data) {
	return data.src.indexOf("collegehumor.cvcdn.com/moogaloop/") !== -1;
},

"process": function(data, callback) {
	var videoID = parseFlashVariables(data.params.flashvars).clip_id;
	if(!videoID) {
		var match = /[?&]clip_id=([^&]*)/.exec(data.src);
		if(match) videoID = match[1];
		else return;
	}
	
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "http://www.collegehumor.com/moogaloop/video/" + videoID, true);
	xhr.addEventListener("load", function() {
		var video = xhr.responseXML.querySelector("video");
		
		// YouTube redirection
		var provider = video.querySelector("provider");
		if(provider) {
			if(provider.textContent === "youtube" && hasKiller("YouTube")) {
				getKiller("YouTube").processVideoID(video.querySelector("youtubeID").textContent, callback);
			}
			return;
		}
		
		var videoURL = video.querySelector("file").textContent;
		if(!/\.mp4$/.test(videoURL)) return;
		
		var sources = [{
			"url": videoURL,
			"format": "360p MP4",
			"height": 360,
			"isNative": true
		}];
		
		var hq = video.querySelector("hq");
		if(hq) {
			sources.unshift({
				"url": hq.textContent,
				"format": "HQ MP4",
				"height": 480,
				"isNative": true
			});
		}
		
		callback({"playlist": [{
			"title": video.querySelector("caption").textContent,
			"poster": video.querySelector("thumbnail").textContent,
			"sources": sources
		}]});
	}, false);
	xhr.send(null);
}

});
