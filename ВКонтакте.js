addKiller("ВКонтакте", {

"canKill": function(data) {
	return data.src.indexOf("vkontakte.ru/swf/") !== -1 || data.src.indexOf("vk.com/swf/") !== -1;
},

"process": function(data, callback) {
	var flashvars = parseFlashVariables(data.params.flashvars);
	
	var posterURL = decodeURIComponent(flashvars.jpg);
	var title = unescapeHTML(decodeURIComponent(flashvars.md_title));
	var sources = [];
	
	[1080, 720, 480, 360, 240].forEach(function(res) {
		var url = flashvars["url" + res];
		if(!url) return;
		url = decodeURIComponent(url).split(/\?/)[0];
		var source = {"url": url, "format": res + "p MP4", "height": res, "isNative": true};
		if(getExt(url) === "mp4") sources.push(source);
		else if(canPlayFLV) {
			source.isNative = false;
			sources.push(source);
		}
	});
	
	callback({
		"playlist": [{"poster": posterURL, "title": title, "sources": sources}]
	});
}

});
