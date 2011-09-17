/**
 * @link zeit.de
 */
addKiller("Zeit", {

"canKill": function(data) {
	return /^http:\/\/video\.zeit\.de/.test(data.params.linkbaseurl);
},

"process": function(data, callback) {
	var _this = this;
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'http://www.zeit.de/website-solr/select/?q=uuid:%22' + data.params.linkbaseurl + '%22&version=2.2&indent=on&wt=json&fl=id,title,created,teaser_text,date-last-modified,referenced,h264_url,graphical-preview-url-large', true);
	xhr.onload = function(event) {
		_this.parseResponse(event.target.responseText, callback);
	}
	xhr.send(null);
},

"parseResponse": function(response, callback) {
	var json = JSON.parse(response);
	if(json.response.docs.length < 1) {
		return false;
	}
	callback({
		playlist: [{
			poster: json.response.docs[0]['graphical-preview-url-large'],
			sources: [{
				url: json.response.docs[0].h264_url,
				format: 'H.264',
				isNative: true
			}]
		}]
	});
}

});
