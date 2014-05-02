addKiller("tudou", {

"canKill": function(data) {
	return (data.src.indexOf("tudouui") !== -1 || data.src.indexOf("player\.opengg\.me\/td\.php") !== -1 || data.src.indexOf("www\.tudou\.com") !== -1);
	

},

  
  
"process": function(data, callback) {



if((data.src.indexOf("tudouui") !== -1)) {
		var flashvars = parseFlashVariables(data.params.flashvars);
	var match = flashvars.iid;
		 var _this = this;
    _this.showurl(data,match,callback);		
		
}else{
   if((data.src.indexOf("&iid\=") !== -1)) {
 

     var vid = /iid\=([\s\S]*?)\//.exec(data.src);
      vid = vid[1];
     
     var match =vid;
     	 var _this = this;
    _this.showurl(data,match,callback);
   }else{
   
   
   
         if((data.src.indexOf("www\.tudou\.com") !== -1)) {var url= "http://218.204.102.10/ClickToPlugin/do.php?tudou="+escape(data.src);
         }else{
         
         url= "http://218.204.102.10/ClickToPlugin/do.php?tudouop="+escape(data.src); }
       var xmlhttp1=new XMLHttpRequest();
       xmlhttp1.open("GET",url,true);
       xmlhttp1.addEventListener("load", function(event) {
       var match = xmlhttp1.responseText;
      
       var  url2 = "http://v2.tudou.com/v?st=1%2C2%2C3%2C4%2C5%2C99&it="+match;
     var xmlhttp=new XMLHttpRequest();
       xmlhttp.open("GET",url2,true);
       xmlhttp.addEventListener("load", function(event) {
       var type = xmlhttp.responseText;
       
	var sources =[];
	var videoid=match.toString();
	
	var videolink =videoid.substr(0,3)+"/"+videoid.substr(3,3)+"/"+videoid.substr(6,3);
	var link = 'http://m3u8.tdimg.com/'+videolink;
	
	 // HD
	if(/brt\=\"99\"/.exec(type)){
		sources.push({"url": link+"/99.m3u8", "format": "åŽŸç”»", "height": 500, "isNative": true});
		}
		if(/brt\=\"5\"/.exec(type)){
		sources.push({"url": link+"/5.m3u8", "format": "è¶…æ¸…720P", "height": 500, "isNative": true});
		}
		if(/brt\=\"4\"/.exec(type)){
		sources.push({"url": link+"/4.m3u8", "format": "è¶…æ¸…480P", "height": 500, "isNative": true});
		}
	 // SD
    if(/brt\=\"3\"/.exec(type)){
	sources.push({"url": link+"/3.m3u8", "format": "é«˜æ¸…360P", "height": 500, "isNative": true});
	 //var time= Date.parse(new Date())/1000;
	 	// NO
	 	}
	if(/brt\=\"2\"/.exec(type)){
	 sources.push({"url": link+"/2.m3u8", "format": "æµç•…256P", "height": 500, "isNative": true});
	}
	
	var image = "http://i1.tdimg.com/"+videolink+"/p.jpg";
	
	
	callback({
		"playlist": [{
			"title": data.title,
			"poster": image,
			"sources": sources
			
	 }]});
 }, false);

       xmlhttp.send(null);
	 
          }, false);

       xmlhttp1.send(null);

	  }
         
 }
}, 
 
 "showurl": function(data,match,callback){
    var  url2 = "http://v2.tudou.com/v?st=1%2C2%2C3%2C4%2C5%2C99&it="+match;
     var xmlhttp=new XMLHttpRequest();
       xmlhttp.open("GET",url2,true);
       xmlhttp.addEventListener("load", function(event) {
       var type = xmlhttp.responseText;
       
	var sources =[];
	var videoid=match.toString();
	
	var videolink =videoid.substr(0,3)+"/"+videoid.substr(3,3)+"/"+videoid.substr(6,3);
	var link = 'http://m3u8.tdimg.com/'+videolink;
	
	 // HD
	if(/brt\=\"99\"/.exec(type)){
		sources.push({"url": link+"/99.m3u8", "format": "åŽŸç”»", "height": 500, "isNative": true});
		}
		if(/brt\=\"5\"/.exec(type)){
		sources.push({"url": link+"/5.m3u8", "format": "è¶…æ¸…720P", "height": 500, "isNative": true});
		}
		if(/brt\=\"4\"/.exec(type)){
		sources.push({"url": link+"/4.m3u8", "format": "è¶…æ¸…480P", "height": 500, "isNative": true});
		}
	 // SD
    if(/brt\=\"3\"/.exec(type)){
	sources.push({"url": link+"/3.m3u8", "format": "é«˜æ¸…360P", "height": 500, "isNative": true});
	 //var time= Date.parse(new Date())/1000;
	 	// NO
	 	}
	if(/brt\=\"2\"/.exec(type)){
	 sources.push({"url": link+"/2.m3u8", "format": "æµç•…256P", "height": 500, "isNative": true});
	}
	
	var image = "http://i1.tdimg.com/"+videolink+"/p.jpg";
	
	
	callback({
		"playlist": [{
			"title": data.title,
			"poster": image,
			"sources": sources
			
	 }]});
 }, false);

       xmlhttp.send(null);
}

});

