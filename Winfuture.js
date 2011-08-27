/**
 * @link winfuture.de
 */
addKiller("Winfuture", {
	canKill: function(data) {
		return data.location.indexOf('//winfuture.de/') !== -1;
	},
	process: function(data, callback) {
		var params = parseFlashVariables(data.params);
		params.config = JSON.parse(params.config);
		params.config.playlist = params.config.playlist.map(function(playlist) {
			playlist.url = unescape(playlist.url);
			return playlist;
		});
		
		callback({
			playlist: [{
				sources: [{
					url: params.config.playlist[0].url.replace('&mode=540', '&mode=270'),
					format: 'SD',
					isNative: true,
					mediaType: 'video'
				},
				{
					url: params.config.playlist[0].url.replace('&mode=270', '&mode=540'),
					format: 'HD',
					isNative: true,
					mediaType: 'video'
				}]
			}],
			isAudio: false
		});
	}
});

// config=http://videos.pcgames.de/embed/pcgames/eb0634f77aff3f488cca/
