/**
 * @link http://www.myspass.de/
 */
addKiller("Myspass", {
	canKill: function(data) {
		if(!data.src) {
			return false;
		}
		if(!data.src.indexOf("myspass.de/")) {
			return false;
		}
		return true;
	},
	process: function(data, callback) {
		var params = parseFlashVariables(data.params);
		if(!params.asf) {
			return false;
		}
		console.log(params);
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'http://www.myspass.de/myspass/includes/apps/video/getvideometadataxml.php?id=' + params.asf, true);
		xhr.onload = function() {
			// Send xml as text/html
			var xml = (new DOMParser()).parseFromString(xhr.responseText, "text/xml");
			callback({
				playlist: [{
					poster: xml.getElementsByTagName('imagePreview')[0].textContent,
					sources: [{
						url: xml.getElementsByTagName('url_flv')[0].textContent,
						format: 'FLV',
						isNative: false,
						mediaType: 'video'
					}]
				}],
				isAudio: false
			});
		}
		xhr.send(null);
	}
});
