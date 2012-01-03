// novamov killer (2012-01-03)

addKiller("novamov", {

"canKill": function(data) {
	if(!canPlayFLV) return false;
	if(/novaplayerv3\.swf/.test(data.src)) {return true;};
	return false;
},

"process": function(data, callback) {
	var flashvars = parseFlashVariables(data.params.flashvars);
	var url = "http://www.novamov.com/api/player.api.php?key=" + flashvars.filekey + "&pass=undefined" + "&codes=" + flashvars.cid + "&file=" + flashvars.file;
	
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.onload = function() {
		var sources = [];
		var match = /url=([^&]+)&title=([^&]*)&/.exec(xhr.responseText);
		sources.push({"url": match[1], "format": "FLV", "isNative": false});
		callback({
			"playlist": [{"title": decodeURIComponent(match[2]), "sources": sources}]
		});
	};
	xhr.send(null);
},

});
