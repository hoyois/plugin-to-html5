if (window.safari) {
	// SPIEGEL.DE HACKS for ClickToPlugin
	safari.extension.addContentStyleSheet("div.jw-controls.jw-reset {display: none !important;}", ["http://*.spiegel.de/*"], []);
	
	var injectedScript = `
		// This script tries to get the videoID out of the DOM
		function respondToMessage(theMessageEvent) {
			if(theMessageEvent.name === "getCurrentVideoID") {
				var videoID;
				var matchingListElement = document.querySelector("#js-video-slider .bx-wrapper .bx-viewport .bxslider .item_active");
				if (matchingListElement) {
					var dataVideoNode = matchingListElement.getAttributeNode("data-video");
					videoID = dataVideoNode.value;
				}
	    	    safari.self.tab.dispatchMessage("pushCurrentVideoID", videoID);
	    	}
		}
		safari.self.addEventListener("message", respondToMessage, false);
	`;

	safari.extension.addContentScript(injectedScript, ["http://*.spiegel.de/*"], [], true);

}


addKiller("Spiegel", {


"canKill": function(data) {
	return data.baseURL.startsWith("http://www.spiegel.de/");
},


"process": function(data, callback) {
	// Simple check if videoID is probably somewhere
	if (data.location.indexOf("-video-") !== -1) {
		var videoID = data.location.replace(/.*-video-(\d+).*.html/g, "$1");
		this.processVideoIDAndCreateCallback(videoID, callback);
	}
	else {
		// Only in the following case it makes sense to install the eventListener:
		if (data.src === "http://www.spiegel.de/static/flash/flashvideo/jwplayer7.flash.swf") {
			var _this = this;
			
			var myMessageEventListener = function (theMessageEvent) {
   			if(theMessageEvent.name === "pushCurrentVideoID") {
   				// remove us:
   				safari.application.removeEventListener(myMessageEventListener);
			    var videoID = theMessageEvent.message;
			    if(isNaN(videoID)) {
					return;
				}
					_this.processVideoIDAndCreateCallback.call(_this, videoID, callback);
			    }
			}
			
			safari.application.addEventListener("message", myMessageEventListener, false);	
			safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("getCurrentVideoID", "data");	
		}
	}
	
},


"processVideoIDAndCreateCallback": function(videoID, callback) {
	var _this = this;
	var xhr = new XMLHttpRequest();
	var jsonInfoUrl = "http://www.spiegel.de/video/video-" + videoID + ".json";
	xhr.open("GET", jsonInfoUrl, true);
	xhr.addEventListener("load", function() {
		var data = JSON.parse(xhr.responseText);
		if(data) {
			_this.createCallback(data, callback);
		} 
	}, false);
	xhr.send(null);
},


"createCallback": function(data, callback) {
	var videoURL = data.cdnhost + data.binaryfilename;
	callback({
			"playlist": [{
				"sources": [{
					"url": videoURL,
					"isNative": true
				}]
			}]
		});
}


});