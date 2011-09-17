// Vodpod killer (2011-09-16)

addKiller("Vodpod", {

"canKill": function(data) {
	return data.src.indexOf("widgets.vodpod.com/w/video_embed/") !== -1;
},

"process": function(data, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', "http://metauri.com/show.xml?uri=" + encodeURIComponent(data.src), true);
	
	xhr.onload = function() {
		var xml = xhr.responseXML;
		data.src = xml.getElementsByTagName("last_effective_uri")[0].textContent;
		var k;
		if(hasKiller("YouTube")) {
			k = getKiller("YouTube");
			if(k.canKill(data)) {
				k.process(data, callback);
				return;
			}
		}
		if(hasKiller("Vimeo")) {
			k = getKiller("Vimeo");
			if(k.canKill(data)) {
				k.process(data, callback);
				return;
			}
		}
		if(hasKiller("Blip")) {
			k = getKiller("Blip");
			if(k.canKill(data)) {
				k.process(data, callback);
				return;
			}
		}
	};
	xhr.send(null);
}

});
