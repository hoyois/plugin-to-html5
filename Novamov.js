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
		_this.parseResponse(parseFlashVariables(event.target.responseText), callback);
	};
	xhr.send(null);
},

"parseResponse": function(response, callback) {
	if (response.url && response.title) {
		callback({
			"playlist": [{
				"title": decodeURIComponent(response.title).replace(/&(.+)/i,""),
				"sources": [{
					"url": response.url,
					"format": "FLV",
					"isNative": false
					}]
				}]
		});
	}
}

});
