// Veoh killer (2011-09-16)

addKiller("Veoh", {

"canKill": function(data) {
	return data.src.indexOf("veoh.com/static/swf/") !== -1 || data.src.indexOf("veohplayer.swf") !== -1;
},

"process": function(data, callback) {
	var isEmbed = false;
	var videoID = parseFlashVariables(data.params.flashvars).permalinkid;
	if(!videoID) { // embedded video
		isEmbed = true;
		var match = /permalinkId=([^&]+)/.exec(data.src);
		if(match) videoID = match[1];
		else return;
	}
	
	var xhr = new XMLHttpRequest();
	xhr.open('GET', "http://www.veoh.com/rest/video/" + videoID + "/details", true);
	xhr.onload = function() {
		var element = xhr.responseXML.getElementsByTagName("video")[0];
		if(!element || element.getAttribute("isExternalMedia") === "true") return;
		
		var videoURL = element.getAttribute("fullPreviewHashPath");
		var isNative = false;
		var format = "FLV";
		
		if(/\.mp4\?/.test(videoURL)) {
			isNative = true;
			format = "MP4";
		} else if(!canPlayFLV) return;
		
		var posterURL = element.getAttribute("fullHighResImagePath");
		var title = element.getAttribute("title");
		
		var siteInfo;
		if(isEmbed || data.location === "http://www.veoh.com/") siteInfo = {"name": "Veoh", "url": "http://www.veoh.com/watch/" + videoID};
		
		callback({
			"playlist": [{
				"title": title,
				"poster": posterURL,
				"sources": [{"url": videoURL, "format": format, "isNative": isNative}],
				"siteInfo": siteInfo
			}]
		});
	};
	xhr.send(null);
}

});
