// Sevenone killer (2011-09-16)

/**
 * @link http://www.prosieben.de/
 * @link http://www.kabeleins.de/
 * @link http://www.sat1.de/
 * @link http://www.ran.de/
 */
addKiller("Sevenone", {
	
"canKill": function(data) {
	return /^http:\/\/(?:tvtotal\.prosieben\.de|www\.kabeleins\.de|www\.sat1\.de|www\.ran\.de).*(?:player_core|HybridPlayer)\.swf$/.test(data.src);
},

"process": function(data, callback) {
	var clipId = parseFlashVariables(data.params.flashvars).clip_id;
	var handleMIMEType = function(type) {
		if(type === 'text/plain') return;
		callback({
			playlist: [{
				sources: [{
					url: "http://www.prosieben.de/dynamic/h264/h264map/?ClipID=" + clipId,
					format: 'MP4',
					isNative: true
				}]
			}]
		});
	};
	getMIMEType("http://www.prosieben.de/dynamic/h264/h264map/?ClipID=" + clipId, handleMIMEType);
}

});