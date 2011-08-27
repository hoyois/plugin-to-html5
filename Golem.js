/**
 * @link golem.de
 */
addKiller("Golem", {
	canKill: function(data) {
		return data.location.indexOf('.golem.de/') !== -1;
	},
	process: function(data, callback) {
		var params = parseFlashVariables(data.params)
		callback({
			playlist: [{
				poster: params.image_src,
				sources: [{
					url: 'http://video.golem.de/download/' + params.id,
					format: 'SD',
					isNative: true,
					mediaType: 'video'
				},
				{
					url: 'http://video.golem.de/download/' + params.id + '?q=high',
					format: 'HD',
					isNative: true,
					mediaType: 'video'
				}]
			}],
			isAudio: false
		});
	}
});
