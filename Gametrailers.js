// Gametrailers killer (2011-09-16)

addKiller("Gametrailers", {
	
"canKill": function(data) {
	return data.src.indexOf(':video:gametrailers.com:') !== -1;
},

"process": function(data, callback) {
	var match = /:([0-9]*)$/.exec(data.src);
	if(!match) return;
	var _this = this;
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'http://www.gametrailers.com/neo/?page=xml.mediaplayer.Mediagen&movieId=' + match[1], true);
	xhr.onload = function(event) {
		// Gametrailers send xml as text/html
		var xml = (new DOMParser()).parseFromString(event.target.responseText, "text/xml");
		_this.parseResponse(xml, callback);
	}
	xhr.send(null);
},

"parseResponse": function(xml, callback) {
	var elements = xml.getElementsByTagName('src');
	if(elements.length < 1) {
		return false;
	}
	var src = elements[0].textContent;
	var info = urlInfo(src);
	if(!info) return;
	info.url = src;
	var rendition = xml.getElementsByTagName('rendition');
	if(rendition.length > 0) {
		info.height = parseInt(rendition[0].getAttribute("height"));
		if(info.height >= 720) info.format = "HD " + info.format;
	}
	callback({
		playlist: [{
			sources: [info]
		}]
	});
}

});
