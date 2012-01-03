// novamov killer (2012-01-03)

addKiller("novamov", {

"canKill": function(data) {
	if(!canPlayFLV) return false;
	if(/\/player\/novaplayerv[3-9]?\.swf/.test(data.src)) {return true;};
	return false;
},

"process": function(data, callback) {
	var flashvars = parseFlashVariables(data.params.flashvars);
	var url = "http://www.novamov.com/api/player.api.php?key=" + flashvars.filekey + "&file=" + flashvars.file;
	
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	var _this = this;
	xhr.onload = function() {
		var sources = [];
		var match = xhr.responseText.match("/url=([^&]+)&title=([^&]*)&/");
		sources.push({"url": match[1], "format": "FLV", "isNative": false});
		callback({
			"playlist": [{"title": match[2], "sources": sources}]
		});
	};
	xhr.send(null);
},

});
