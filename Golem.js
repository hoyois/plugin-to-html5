// Golem killer (2011-09-16)

addKiller("Golem", {
	
"canKill": function(data) {
	return data.src.indexOf('http://video.golem.de/nvplayer/') !== -1;
},

"process": function(data, callback) {
	var params = parseFlashVariables(data.params.flashvars)
	callback({
		playlist: [{
			poster: params.image_src,
			sources: [{
				url: 'http://video.golem.de/download/' + params.id + '?q=high',
				format: 'HD MP4',
				height: 720,
				isNative: true
			},
			{
				url: 'http://video.golem.de/download/' + params.id,
				format: 'SD MP4',
				height: 360,
				isNative: true
			}]
		}]
	});
}

});
