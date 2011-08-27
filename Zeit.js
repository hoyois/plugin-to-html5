/**
 * @link zeit.de
 */
addKiller("Zeit", {
	canKill: function(data) {
		return data.location.indexOf('//www.zeit.de/') !== -1;
	},
	process: function(data, callback) {
		var params = parseFlashVariables(data.params);
		var this_ = this;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'http://www.zeit.de/website-solr/select/?q=uuid:%22' + params.linkBaseURL + '%22&version=2.2&indent=on&wt=json&fl=id,title,created,teaser_text,date-last-modified,referenced,h264_url,graphical-preview-url-large', true);
		xhr.onload = function(event) {
			this_.parseResponse(event.target.responseText, callback);
		}
		xhr.send(null);
	},
	parseResponse: function(response, callback) {
		var data = JSON.parse(response);
		if(data.response.docs.length < 1) {
			return false;
		}
		callback({
			playlist: [{
				poster: data.response.docs[0]['graphical-preview-url-large'] ? data.response.docs[0]['graphical-preview-url-large'] : null,
				sources: [{
					url: data.response.docs[0].h264_url,
					format: 'h264',
					isNative: true,
					mediaType: 'video'
				}]
			}],
			isAudio: false
		});
	}
});
