addKiller("NaverVideo", {
"canKill": function(data) {
	if(data.src.indexOf("inKey") !== -1) data.onsite = true;
	else data.onsite = false;
	if(data.src.indexOf("serviceapi.nmv.naver.com/flash/NFPlayer.swf") !== -1) return true;
	return false;
},

"process": function(data, callback) {
	// in & out
	var match = data.src.match(/vid=([0-9A-F]+)&(in|out)Key=([0-9a-fV]+)/);
	if(match) {
		var videoid = match[1];
		var key = match[3];
		var inout = (data.onsite) ? "in" : "out";
		var videoxml = "http://serviceapi.nmv.naver.com/flash/play.nhn?vid=" + videoid + "&"+ inout +"Key=" + key;
		var infoxml = "http://serviceapi.nmv.naver.com/flash/videoInfo.nhn?vid=" + videoid + "&"+ inout +"Key=" + key;

		var xhr = new XMLHttpRequest();
		xhr.open('GET', videoxml, false);
		xhr.send(null);

		var videoUrl = xhr.responseXML.getElementsByTagName("Result")[0].getElementsByTagName("FlvUrl")[0].textContent;
		this.processVideoInfo(videoUrl, infoxml, callback);
	}
},

"processVideoInfo": function(videoUrl, infoxml, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', infoxml, true);
	xhr.onload = function(event) {
		var result = event.target.responseXML.getElementsByTagName("Result")[0];

		var link = result.getElementsByTagName("Link")[0].textContent;
		var title = result.getElementsByTagName("Subject")[0].textContent;
		var posterurl = result.getElementsByTagName("CoverImage")[0].textContent;
		var type = result.getElementsByTagName("VideoType")[0].textContent;

		callback({
			"playlist": [{
				"siteinfo": link,
				"title": title,
				"poster": posterurl,
				"sources": [{
					"url": videoUrl,
					"format": type,
					"isNative": (type == "MP4") ? true : false
				}]
			}]
		});				
	};
	xhr.send(null);
}

});
