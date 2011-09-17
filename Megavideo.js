// Megavideo killer (2011-09-16)

addKiller("Megavideo", {

"canKill": function(data) {
	if(!canPlayFLV) return false;
	if(/^http:\/\/wwwstatic\.megavideo\.com\/mv_player[2-9]?\.swf/.test(data.src)) {data.onsite = true; return true;};
	if(data.src.indexOf("megavideo.com/v/") !== -1) {data.onsite = false; return true;}
	return false;
},

"process": function(data, callback) {
	if(data.onsite) {
		this.processFlashVars(parseFlashVariables(data.params.flashvars), callback);
		return;
	}
	
	// embedded video
	var match = /megavideo\.com\/v\/([A-Z0-9]{8})/.exec(data.src);
	if(!match) return;
	
	var url = "http://megavideo.com/?v=" + match[1];
	
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	var _this = this;
	xhr.onload = function() {
		var callbackForEmbed = function(videoData) {
			videoData.playlist[0].siteInfo = {"name": "Megavideo", "url": url};
			callback(videoData);
		};
		var regex = new RegExp("flashvars\\.([0-9a-z_]*)\\s=\\s\\\"([^\"]*)\\\";", "g");
		_this.processFlashVars(parseWithRegExp(xhr.responseText, regex), callbackForEmbed);
	};
	xhr.send(null);
},

"processFlashVars": function(flashvars, callback) {
	var sources = [];
	
	var title;
	if(flashvars.title) title = decodeURIComponent(flashvars.title.replace(/\+/g, "%20")).toUpperCase();
	
	if(flashvars.hd === "1") {
		sources.push({"url": "http://www" + flashvars.hd_s + ".megavideo.com/files/" + this.decrypt(flashvars.hd_un, flashvars.hd_k1, flashvars.hd_k2) + "/" + title + ".flv", "format": "HD FLV", "resolution": 720, "isNative": false});
	}
	sources.push({"url": "http://www" + flashvars.s + ".megavideo.com/files/" + this.decrypt(flashvars.un, flashvars.k1, flashvars.k2) + "/" + title + ".flv", "format": "SD FLV", "resolution": 360, "isNative": false});
	
	callback({
		"playlist": [{"title": title, "sources": sources}]
	});
},

// taken from http://userscripts.org/scripts/review/87011
"decrypt": function(str, key1, key2) {
	var loc1 = [];
	for(var loc3 = 0; loc3 < str.length; ++loc3) {
		loc1.push(("000" + parseInt(str.charAt(loc3), 16).toString(2)).slice(-4));
	}
	loc1 = loc1.join("").split("");
	var loc6 = [];
	for(var loc3 = 0; loc3 < 384; ++loc3) {
		key1 = (key1 * 11 + 77213) % 81371;
		key2 = (key2 * 17 + 92717) % 192811;
		loc6[loc3] = (key1 + key2) % 128;
	}
	for(var loc3 = 256; loc3 >= 0; --loc3) {
		var loc5 = loc6[loc3];
		var loc4 = loc3 % 128;
		var loc8 = loc1[loc5];
		loc1[loc5] = loc1[loc4];
		loc1[loc4] = loc8;
	}
	for(var loc3 = 0; loc3 < 128; ++loc3) {
		loc1[loc3] = loc1[loc3] ^ loc6[loc3 + 256] & 1;
	}
	var loc12 = loc1.join("");
	var loc7 = [];
	for(var loc3 = 0; loc3 < loc12.length; loc3 = loc3 + 4) {
		var loc9 = loc12.substr(loc3, 4);
		loc7.push(loc9);
	}
	var loc2 = [];
	for(var loc3 = 0; loc3 < loc7.length; ++loc3) {
		loc2.push(parseInt(loc7[loc3], 2).toString(16));
	}
	return loc2.join("");
}

});
