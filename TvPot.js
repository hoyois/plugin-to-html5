var killer = new Object();
addKiller("TvPot", killer);

killer.canKill = function(data) {
  if(data.src.indexOf("flvs.daum.net/") !== -1) {data.onsite = false; return true;}
  if(data.src.search(/clip\/jloader2\.swf/) !== -1) {data.onsite = true; return true;}
  return false;
};

killer.process = function(data, callback) {
  if(data.onsite) {
    var flashvars = parseFlashVariables(data.params.flashvars);
    if(flashvars.vid) this.processVideoID(flashvars.vid, callback);
    // fallback
    var match = data.src.match(/clip\/jloader2\.swf\?([^&]+&)?vid\=([^&?]+)/);
    if(match) {
      this.processVideoID(match[2], callback);
    }
    return;
  }

  // Embedded TvPot video
  var match = data.src.match(/flvs\.daum\.net\/flvPlayer\.swf\?([^&]+&)?vid\=([^&?]+)/);
  if(match) {
    this.processVideoID(match[2], callback);
  }
};

killer.processVideoID = function(videoID, callback) {
  callback({
    "playlist": [{
      "sources": [{
        "url": "http://rt.flvs.daum.net:8080/RTES/Redirect?vid="+videoID+"",
        "isNative": true
      }]
    }]
  });
};
