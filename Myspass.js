// Myspass killer (2011-09-16)

addKiller("Myspass", {
	
"canKill": function(data) {
	return data.src === "http://www.myspass.de/myspass/includes/apps/player/standard/player_core.swf";
},

"process": function(data, callback) {
	var params = parseFlashVariables(data.params.flashvars);
	if(!params.asf) {
		return false;
	}
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
					isNative: false
				}]
			}]
		});
	}
	xhr.send(null);
}

});