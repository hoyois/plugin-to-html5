// Welt killer (2011-09-16)

/**
 * Welt.de use brightcove
 *
 * @link http://www.welt.de/
 */
addKiller("Welt", {
	
"canKill": function(data) {
	return data.src.indexOf(".welt.de/multimedia/") !== -1;
},

"process": function(data, callback) {
	var params = parseFlashVariables(data.params.flashvars);
	var xhr = new XMLHttpRequest();
	xhr.open('GET', params.xmlsrc, true);
	xhr.onload = function() {
		var element = xhr.responseXML.getElementsByTagName('video')[0];
		callback({
			playlist: [{
				poster: element.getAttribute('img'),
				sources: [{
					url: element.getAttribute('src'),
					format: 'H.264',
					isNative: true
				}]
			}]
		});
	};
	xhr.send(null);
}

});
