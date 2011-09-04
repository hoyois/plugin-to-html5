/**
 * @link gametrailers.com
 */
addKiller("Gametrailers", {
	canKill: function(data) {
		return data.location.indexOf('.gametrailers.com/') !== -1;
	},
	process: function(data, callback) {
		var part = data.src.split(':');
		if(part.length < 3) {
			return false;
		}
		console.log(data);
		var id = part.pop();
		var this_ = this;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'http://www.gametrailers.com/neo/?page=xml.mediaplayer.Mediagen&movieId=' + id, true);
		xhr.onload = function(event) {
			// Gametrailers send xml as text/html
			var xml = (new DOMParser()).parseFromString(event.target.responseText, "text/xml");
			this_.parseResponse(xml, callback);
		}
		xhr.send(null);
	},
	parseResponse: function(xml, callback) {
		var elements = xml.getElementsByTagName('src');
		if(elements.length < 1) {
			return false;
		}
		var src = elements[0].textContent;
		callback({
			playlist: [{
				sources: [{
					url: src,
					format: 'h264',
					isNative: true,
					mediaType: 'video'
				}]
			}],
			isAudio: false
		});
	}
});
