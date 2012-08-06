function getMIMEType(resourceURL, handleMIMEType) {
	var xhr = new XMLHttpRequest();
	xhr.open('HEAD', resourceURL, true);
	var MIMEType = false;
	xhr.onreadystatechange = function () {
		if(!MIMEType && xhr.getResponseHeader("Content-Type")) {
			MIMEType = xhr.getResponseHeader("Content-Type");
			xhr.abort();
			handleMIMEType(MIMEType);
		}
	};
	xhr.send(null);
}

function stripParams(MIMEType) {
	return /^[^;]*/.exec(MIMEType)[0];
}

// Follows rfc3986 except ? and # in base are ignored (as in WebKit)
var schemeMatch = new RegExp("^[^:]+:");
var authorityMatch = new RegExp("^[^:]+://[^/]*");
function makeAbsoluteURL(url, base) {
	if(!url) return "";
	if(schemeMatch.test(url)) return url; // already absolute
	base = base.substring(0, base.split(/[?#]/)[0].lastIndexOf("/") + 1);
	if(url.charAt(0) === "/") {
		if(url.charAt(1) === "/") { // relative to scheme
			base = schemeMatch.exec(base)[0];
		} else { // relative to authority
			base = authorityMatch.exec(base)[0];
		}
	}
	return base + url;
}

function unescapeHTML(text) {
	var e = document.createElement("div");
	e.innerHTML = text.replace(/</g, "&lt;");
	return e.textContent;
}

function unescapeUnicode(text) {
	return text.replace(/\\u([0-9a-fA-F]{4})/g, function(s,c) {return String.fromCharCode(parseInt(c, 16));});
}

function parseWithRegExp(text, regex, processValue) { // regex needs 'g' flag
	var obj = {};
	if(!text) return obj;
	if(processValue === undefined) processValue = function(s) {return s;};
	var match;
	while(match = regex.exec(text)) {
		obj[match[1]] = processValue(match[2]);
	}
	return obj;
}
function parseFlashVariables(s) {return parseWithRegExp(s, /([^&=]*)=([^&]*)/g);}
function parseSLVariables(s) {return parseWithRegExp(s, /\s?([^,=]*)=([^,]*)/g);}

function extractDomain(url) {
	return /\/\/([^\/]+)\//.exec(url)[1];
}

function extractExt(url) {
	var i = url.search(/[?#]/);
	if(i === -1) i = undefined;
	url = url.substring(url.lastIndexOf("/", i) + 1, i);
	i = url.lastIndexOf(".");
	if(i === -1) return "";
	return url.substring(i + 1).toLowerCase().trimRight();
}

function parseXSPlaylist(playlistURL, baseURL, altPosterURL, track, handlePlaylistData) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", playlistURL, true);
	xhr.addEventListener("load", function() {
		var x = xhr.responseXML.getElementsByTagName("track");
		var playlist = [];
		var audioOnly = true;
		var startTrack = track;
		if(!(track >= 0 && track < x.length)) track = 0;
		var list, I, info, mediaURL, posterURL, title;
		
		for(var i = 0; i < x.length; i++) {
			// what about <jwplayer:streamer> rtmp??
			I = (i + track) % x.length;
			list = x[I].getElementsByTagName("location");
			if(list.length > 0) mediaURL = makeAbsoluteURL(list[0].textContent, baseURL);
			else if(i === 0) return;
			else continue;
			info = urlInfo(mediaURL);
			if(!info) {
				if(i === 0) return;
				if(i >= x.length - track) --startTrack;
				continue;
			} else if(!info.isAudio) audioOnly = false;
			info.url = mediaURL;
			
			list = x[I].getElementsByTagName("image");
			if(list.length > 0) posterURL = list[0].textContent;
			if(i === 0 && !posterURL) posterURL = altPosterURL;
			list = x[I].getElementsByTagName("title");
			if(list.length > 0) title = list[0].textContent;
			else {
				list = x[I].getElementsByTagName("annotation");
				if(list.length > 0) title = list[0].textContent;
			}
			
			playlist.push({
				"sources": [info],
				"poster": posterURL,
				"title": title
			});
		}
		handlePlaylistData({"playlist": playlist, "startTrack": startTrack, "audioOnly": audioOnly});
	}, false);
	xhr.send(null);
}
