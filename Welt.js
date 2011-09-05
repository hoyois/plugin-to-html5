/**
 * Welt.de use brightcove
 *
 * @link http://www.welt.de/
 */
addKiller("Welt", {
	canKill: function(data) {
		console.log(data);
		if(data.src.indexOf(".welt.de/")) {
			return true;
		}
		return false;
	},
	process: function(data, callback) {
		var params = parseFlashVariables(data.params);
		var xhr = new XMLHttpRequest();
		xhr.open('GET', params.xmlsrc, true);
		xhr.onload = function() {
			var element = xhr.responseXML.getElementsByTagName('video')[0];
			callback({
				playlist: [{
					poster: element.getAttribute('img'),
					sources: [{
						url: element.getAttribute('src'),
						format: 'h264',
						isNative: true,
						mediaType: 'video'
					}]
				}],
				isAudio: false
			});
		};
		xhr.send(null);
	}
});
