// novamov killer (2012-01-03)

addKiller("novamov", {

"canKill": function(data) {
	if(!canPlayFLV) return false;
	if(/novaplayerv3\.swf/.test(data.src)) {return true;};
	return false;
},

"process": function(data, callback) {
	var flashvars = parseFlashVariables(data.params.flashvars);
	var url = "http://www.novamov.com/api/player.api.php?key=" + flashvars.filekey + "&pass=undefined&codes=" + flashvars.cid + "&file=" + flashvars.file;
	var xhr = new XMLHttpRequest();
	var _this = this;
	xhr.open('GET', url, true);
	xhr.onload = function(event) {
		_this.parseResponse(event.target.responseText, callback);
	};
	xhr.send(null);
},

"parseResponse": function(response, callback) {
	var sources = [];
	var match = /url=([^&]+)&title=([^&]+)&/.exec(response);
	if (match) {
		callback({
			"playlist": [{
				"title": decodeURIComponent(match[2]),
				"sources": [{
					"url": match[1],
					"format": "FLV",
					"isNative": false
					}]
				}]
		});
	}
}

});
