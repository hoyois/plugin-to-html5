addKiller("SKCommsVideo", {
  "canKill": function(data) {
    if (/v.nate.com/.test(data.src)) { data.site="nate"; return true;}
    if (/v.egloos.com/.test(data.src)) { data.site="egloos"; return true;}
    if (/dbi.video.cyworld.com/.test(data.src)) { data.site="cyworld"; return true; }
    return false;
  },

  "process": function(data, callback) {
     var flashvars = parseFlashVariables(data.params.flashvars);
    // nate (pann, video, ...)
    if(data.site=="nate") {
      if(flashvars.mov_id) {
        this.processNateVideoID(flashvars.mov_id, callback);
      }

      // embedded Nate video
      var match = data.src.replace(/\|/g, "%7C").match(/v\.nate\.com\/v\.sk\/movie\/0%7C(\d+)\/(\d+)/);
      if (match) {
        this.processNateVideoID(match[2], callback);
      }
      return;
    }
    // Cyworld (merged by Nate)
    if(data.site=="cyworld") {
      if(flashvars.mov_id) {
        this.processNateVideoID(flashvars.mov_id, callback);
      }
      return;
    }

    // egloos (blog)
    if(data.site=="egloos") {
      if (flashvars.mov_id && flashvars.vs_keys) {
        // split vs_keys to blogid & serial
        var vs_keys = flashvars.vs_keys.split("|");
        this.processEgloosVideoID(flashvars.mov_id, vs_keys[0], vs_keys[1], callback);
      }

      // embedded Egloos Video
      var match = data.src.replace(/\|/g, "%7C").match(/v\.egloos\.com\/v\.sk\/egloos\/([a-z]\d+)%7C(\d+)\/(\d+)/);
      if (match) {
        this.processEgloosVideoID(match[3], match[1], match[2], callback);
      }
      return;
    }
  },

  "processNateVideoID": function(videoid, callback) {
    callback({
      "playlist": [{
        "sources": [{
          "url": "http://m.pann.nate.com/video/videoPlayUrlRealTime?video_id="+videoid+"",
          "isNative": true
        }]
      }]
    });
  },

  "processEgloosVideoID": function(videoid, blogid, serial, callback) {
    callback({
      "playlist": [{
        "sources": [{
          "url": "http://ebc.egloos.com/exec/mobile/play_movile_video.php?movieid="+videoid+"&blogid="+blogid+"&serial="+serial+"",
          "isNative": true
        }]
      }]
    });
  }
});
