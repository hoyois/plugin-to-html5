addKiller("youku", {

"canKill": function(data) {
	
	if(data.src.indexOf("static\.youku\.com") !== -1) {data.onsite = true; return true;}
    if(data.src.indexOf("player\.youku\.com") !== -1) {data.onsite = false; return true;}
	return false;
	
},

"process": function(data, callback) {

   if(data.onsite)
   
   {
   if(data.src.indexOf("qplayer\.swf") !== -1) {var match = /VideoIDS\=([\s\S]*?)\&/.exec(data.src);
	match = match[1];}
   else{
	var flashvars = parseFlashVariables(data.params.flashvars);
	var match = flashvars.VideoIDS;
}
	}else{
	//var flashvars = parseFlashVariables(data.data);
	var match = /sid\/([\s\S]*?)\/v\.swf/.exec(data.src);
	match = match[1];

	}
//alert(match);
var time=(new Date()).getTime().toString().substr(0,10);
if(match)
{
	var surl = "http://v.youku.com/player/getPlayList/VideoIDS/"+match+"/timezone/+08/version/5/source/video?password=&ran="+time+"&n=3";
}
//alert(surl);

var xmlhttp=new XMLHttpRequest();
   xmlhttp.open("GET",surl,true);
xmlhttp.addEventListener("load", function(event) {
var matchdata = xmlhttp.responseText;

	var sources =[];
	// HD
	var type = /streamtypes\"\:\[([\s\S]*?)\]/.exec(matchdata);
	var pic =  /logo\"\:\"([\s\S]*?)\"/.exec(matchdata);
	pic =pic[1].replace(/\\/g, "");
	type = type[1];
	var video="";
	var type = /streamtypes\"\:\[([\s\S]*?)\]/.exec(matchdata);
var pic =  /logo\"\:\"([\s\S]*?)\"/.exec(matchdata);
pic =pic[1].replace(/\\/g, "");
type = type[1];
if(/hd2/.exec(type)){
sources.push({"url": "http://v.youku.com/player/getM3U8/vid/"+match+"/type/hd2/ts/"+time+"/v.m3u8", "format": "è¶…æ¸…", "height": 500, "isNative": true});
 }
// SD
if(/mp4/.exec(type)){
sources.push({"url": "http://v.youku.com/player/getM3U8/vid/"+match+"/type/mp4/ts/"+time+"/v.m3u8", "format": "é«˜æ¸…", "height": 500, "isNative": true});
// NO
}
if(/flv/.exec(type)){
sources.push({"url": "http://v.youku.com/player/getM3U8/vid/"+match+"/type/flv/ts/"+time+"/v.m3u8", "format": "æµç•…", "height": 500, "isNative": true});
}
	

	callback({
		"playlist": [{
			"title": data.title,
			"poster": pic,
			"sources": sources
			
	 }]});
	 
}, false);

  xmlhttp.send(null);


}

});

