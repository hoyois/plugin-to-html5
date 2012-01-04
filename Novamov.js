// novamov killer (2012-01-03)

addKiller("novamov", {

"canKill": function(data) {
	if(!canPlayFLV) return false;
	if(/novaplayerv3\.swf/.test(data.src)) {return true;};
	return false;
},

"process": function(data, callback) {
	var flashvars = parseFlashVariables(data.params.flashvars);
	var url;
	if (flashvars.filekey && flashvars.file) {
		url = "http://www.novamov.com/api/player.api.php?key=" + flashvars.filekey + "&pass=undefined&codes=" + flashvars.cid + "&file=" + flashvars.file;
	}

	if (url) {
		var xhr = new XMLHttpRequest();
		_callback = callback;
		xhr.open('GET', url, true);
		xhr.onload = function() {
			var sources = [];
			var match = /url=([^&]+)&title=([^&]+)&/.exec(xhr.responseText);
			if (match) {
				_callback({
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
		};
		xhr.send(null);
	}
},

});
