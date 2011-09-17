// Gamestar killer (2011-09-16)

addKiller("Gamestar", {
	
"canKill": function(data) {
	return data.src.indexOf('http://www.gamestar.de/jw') !== -1;
},

"process": function(data, callback) {
	var params = parseFlashVariables(data.params.flashvars);
	callback({
		playlist: [{
			sources: [{
				url: decodeURIComponent(params.file),
				format: 'H.264',
				isNative: true
			}]
		}],
		isAudio: false
	});
}

});
