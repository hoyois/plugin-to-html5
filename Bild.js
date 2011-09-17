// Bild killer (2011-09-16)

addKiller("Bild", {
	
"canKill": function(data) {
	return data.src.indexOf('http://www.bild.de/media/') !== -1;
},

"process": function(data, callback) {
	var params = parseFlashVariables(data.params.flashvars);
	var _this = this;
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'http://www.bild.de' + params.xmlsrc, true);
	xhr.onload = function(event) {
		_this.parseResponse(event.target.responseXML, callback);
	}
	xhr.send(null);
},

"parseResponse": function(response, callback) {
	if(response === null) return;
	var videos = response.getElementsByTagName('video');
	if(videos.length < 1) {
		return false;
	}
	callback({
		playlist: [{
			poster: videos[0].getAttribute('img'),
			sources: [{
				url: videos[0].getAttribute('src'),
				format: 'H.264',
				isNative: true
			}]
		}],
		isAudio: false
	});
}

});
