addKiller("SKCommsVideo", {
  "canKill": function(data) {
    if (/v.nate.com/.test(data.src)) { data.site="nate"; return true;}
    if (/v.egloos.com/.test(data.src)) { data.site="egloos"; return true;}
    if (/dbi.video.cyworld.com/.test(data.src)) { data.site="cyworld"; return true; }
    return false;
  },

  "process": function(data, callback) {
    if(data.site=="nate") {
      return;
    }
    if(data.site=="egloos") {
      return;
    }
    if(data.site=="cyworld") {
      return;
    }
  }
});