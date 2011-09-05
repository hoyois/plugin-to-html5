/**
 * @link http://www.prosieben.de/
 * @link http://www.kabeleins.de/
 * @link http://www.sat1.de/
 */
addKiller("Sevenone", {
	canKill: function(data) {
		if(data.src.indexOf("prosieben.de/")) {
			return true;
		}
		if(data.src.indexOf("kabeleins.de/")) {
			return true;
		}
		if(data.src.indexOf("sat1.de/")) {
			return true;
		}
		return false;
	},
	process: function(data, callback) {
		var clipId = parseFlashVariables(data.params).clip_id;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', "http://www.prosieben.de/dynamic/h264/h264map/?ClipID=" + clipId, true);
		xhr.onreadystatechange = function() {
			// We try to emulate HEAD requests
			if(xhr.readyState == 2) {
				// Placeholder mp4 is served as text/plain
				if(xhr.getResponseHeader('Content-Type') != 'text/plain') {
					callback({
						playlist: [{
							sources: [{
								url: "http://www.prosieben.de/dynamic/h264/h264map/?ClipID=" + clipId,
								format: 'h264',
								isNative: true,
								mediaType: 'video'
							}]
						}],
						isAudio: false
					});
				}
			}
			if(xhr.readyState > 2) {
				xhr.abort();
			}
		};
		xhr.send(null);
	}
});
