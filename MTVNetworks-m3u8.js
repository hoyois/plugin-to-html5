addKiller("MTVNetworks", {

"contexts": {
	"cms:video:thedailyshow.com:": "11",
	"cms:episode:thedailyshow.com:": "1", // with tdslocal.mud => shadow.comedycentral.com
	"cms:video:colbertnation.com:": "8",
	"cms:episode:colbertnation.com:": "7", // not iPad-compatible
	// "arc:video:gametrailers.com:": "1", // works without context
	// "cms:item:southparkstudios.com:": "1", // works without context
	"cms:content:southparkstudios.com:": "3",
	"cms:video:comedycentral.com:": "6", // no example found
	"arc:playlist:comedycentral.com:": "4",
	// "arc:video:comedycentral.com:": "1", // works without context
	// "cms:video:tosh.comedycentral.com:": "1", // works without context
	// "cms:promo:tosh.comedycentral.com:": "1", // works without context
	"hcx:content:comedycentral.co.uk:": "3"//, // no example found
	// "cms:video:jokes.com:": "1", // works without context
	// "uma:video:mtv.com:": "1" // works without context
	// "uma:videolist:mtv.com:" // only works without context
},

"canKill": function(data) {
	return data.src.indexOf("media.mtvnservices.com") !== -1;
},

"process": function(data, callback) {
	var mgid = /mgid:([^.]*[.\w]+:)[-\w]+/.exec(data.src);
	if(!mgid) return;
	var context = "";
	if(this.contexts[mgid[1]]) context = "/context" + this.contexts[mgid[1]];
	
	var _this = this;
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "http://media.mtvnservices.com/pmt/e1/players/mgid:" + mgid[1] + context + "/config.xml", true);
	xhr.addEventListener("load", function() {
		var xml = xhr.responseXML;
		var feedURL = xml.getElementsByTagName("feed")[0].textContent.replace(/\n/g, "").replace("{uri}", mgid[0]);
		if(mgid[1] === "cms:episode:thedailyshow.com:") {
			feedURL = feedURL.replace("tdslocal.mud", "shadow.comedycentral.com");
		}
		if(feedURL) _this.processFeedURL(feedURL, mgid[1], callback);
	}, false);
	xhr.send(null);
},

"processFeedURL": function(feedURL, mgid, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", feedURL, true);
	xhr.addEventListener("load", function() {
		var xml = new DOMParser().parseFromString(xhr.responseText.replace(/^\s+/,""), "text/xml");
		var items = xml.getElementsByTagName("item");
		
		var mgidList = [];
		var playlist = [];
		
		var content, poster, title, mgidItem;
		for(var i = 0; i < items.length; i++) {
			mgid = items[i].getElementsByTagName("guid")[0];
			if(!mgid) continue;
			mgidItem = {"mgid": mgid.textContent};
			
			poster = items[i].getElementsByTagNameNS("http://search.yahoo.com/mrss/", "thumbnail")[0];
			if(poster) mgidItem.poster = poster.getAttribute("url");
			
			title = items[i].getElementsByTagName("title")[0];
			if(title) mgidItem.title = title.textContent;
			
			mgidList.push(mgidItem);
		}
		
		var length = mgidList.length - 1;
		
		var next = function() {
			if(mgidList.length === 0) callback({"playlist": playlist});
			else addToPlaylist(mgidList.shift());
		};
		
		var addToPlaylist = function(mgidItem) {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "http://media.mtvnservices.com/player/html5/mediagen/?uri=" + mgidItem.mgid + "&device=iPad", true);
			delete mgidItem.mgid;
			xhr.addEventListener("load", function() {
				var xml = new DOMParser().parseFromString(xhr.responseText.replace(/^\s+/,""), "text/xml");
				var videoURL = xml.getElementsByTagName("src")[0];
				if(videoURL) {
					mgidItem.sources = [{"url": videoURL.textContent, "isNative": true}];
					playlist.push(mgidItem);
				} else {
					if(mgidList.length === length) return;
				}
				next();
			}, false);
			xhr.send(null);
		};
		
		next();
		
	}, false);
	xhr.send(null);
}

});
