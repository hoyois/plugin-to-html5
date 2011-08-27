/**
 * @link bild.de
 */
addKiller("Bild", {
	canKill: function(data) {
		return data.location.indexOf('//www.bild.de/') !== -1;
	},
	process: function(data, callback) {
		var params = parseFlashVariables(data.params);
		var this_ = this;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'http://www.bild.de' + params.xmlsrc, true);
		xhr.onload = function(event) {
			this_.parseResponse(event.target.responseXML, callback);
		}
		xhr.send(null);
	},
	parseResponse: function(response, callback) {
		var videos = response.getElementsByTagName('video');
		if(videos.length < 1) {
			return false;
		}
		callback({
			playlist: [{
				poster: videos[0].hasAttribute('img') ? videos[0].getAttribute('img') : null,
				sources: [{
					url: videos[0].getAttribute('src'),
					format: 'h264',
					isNative: true,
					mediaType: 'video'
				}]
			}],
			isAudio: false
		});
	}
});
