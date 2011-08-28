/**
 * @link gamestar.de
 */
addKiller("Gamestar", {
	canKill: function(data) {
		return data.location.indexOf('//www.gamestar.de/') !== -1;
	},
	process: function(data, callback) {
		var params = parseFlashVariables(data.params);
		callback({
			playlist: [{
				sources: [{
					url: unescape(params.file),
					format: 'h264',
					isNative: true,
					mediaType: 'video'
				}]
			}],
			isAudio: false
		});
	}
});
