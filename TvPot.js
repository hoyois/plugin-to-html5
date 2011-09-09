var killer = new Object();
addKiller("TvPot", killer);

killer.canKill = function(data) {
  if(data.plugin !== "Flash") return false;
  if(data.src.indexOf("flvs.daum.net/") !== -1) {data.onsite = false; return true;}
  if(data.src.search(/tvpot\.daum\.net\/clip\/jloader2\.swf/) !== -1) {data.onsite = true; return true;}
  return false;
};

killer.process = function(data, callback) {
  if(data.onsite) {
    var flashvars = parseFlashVariables(data.params);
    if(flashvars.vid) this.processVideoID(flashvars.vid, callback);
    return;
  }

  // Embedded TvPot video
  var match = data.src.match(/flvs\.daum\.net\/flvPlayer\.swf\?vid\=([^&?]+)/);
  if(match) {
    this.processVideoID(match[1], callback);
  }
};

killer.processVideoID = function(videoID, callback) {
  callback({
    "playlist": [{
      "sources": [{
        "url": "http://rt.flvs.daum.net:8080/RTES/TenthVideo/"+videoID+"/video.mp4",
        "isNative": true
      }]
    }]
  });
};

//http://rt.flvs.daum.net:8080/RTES/Redirect?vid=3o4PqE1iMys$&
//http://rt.flvs.daum.net:8080/RTES/TenthVideo/3o4PqE1iMys$/video.mp4
//http://stream.tvpot.daum.net/XCN2XD/4Sy8Zm/BZ2LeI/Bs4g$$.mp4
