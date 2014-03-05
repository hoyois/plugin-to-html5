addKiller('RaiTv', {

    'canKill': function(data) {
        if (data.type !== 'application/x-silverlight' &&
            data.type !== 'application/x-silverlight-2' &&
            data.type !== 'application/x-shockwave-flash') return false;
        return data.src.indexOf('http://www.rai.tv/') !== -1;
    },

    'process': function(data, callback) {
        var chanNames = {
            'Rai Uno': 'RaiUno',
            'Rai Due': 'RaiDue',
            'Rai Tre': 'RaiTre',
            'Rai 5': 'RaiCinque',
            'Rai Premium': 'RaiPremium',
            'Rai YoYo': 'RaiYoyo',
            '1': 'RaiUno',
            '2': 'RaiDue',
            '3': 'RaiTre',
            '31': 'RaiCinque',
            '32': 'RaiPremium',
            '38': 'RaiYoyo'
        };
        var url = 'http://www.rai.it/dl/portale/html/palinsesti/replaytv/static/';
        var uest_loc = data.location.indexOf('?') + 1;
        var params = data.location.substring(uest_loc, data.location.length);
        var hash_loc = data.location.indexOf('#');
        params = params.substring(0, hash_loc != -1 ?
                            hash_loc : data.location.length);

        // Get parameters off URL string
        // from http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript#answer-3855394
        var qs = (function(a) {
            if (a == '') return {};
            var b = {};
            for (var i = 0; i < a.length; ++i)
            {
                var p = a[i].split('=');
                if (p.length != 2) continue;
                b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, ' '));
            }
            return b;
        })(params.split('&'));

        // Fix for parameters that might be named differently than usual
        if (!!!qs['vd'] && !!qs['day']) {
            qs['vd'] = qs['day'];
        }
        if (!!!qs['vc'] && !!qs['ch']) {
            qs['vc'] = qs['ch'];
        }

        url += chanNames[qs['vc']] + '_' + qs['vd'].replace(/-/g, '_') + '.html';

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.addEventListener('load', function() {
            var json = JSON.parse(xhr.responseText);
            var selected = {};

            // Find the entry for the program among a date-indexed json blob
            for (key in json[qs['vc']][qs['vd']]) {
                if (json[qs['vc']][qs['vd']].hasOwnProperty(key) &&
                    json[qs['vc']][qs['vd']][key]['i'] === qs['v']) {
                    selected = json[qs['vc']][qs['vd']][key];
                    break;
                }
            }

            // var videourl_mp4 = (!!selected.urlTablet ?
            //             selected.urlTablet : selected.h264);
            var sources = [];
            // if (videourl_mp4.indexOf(',') != -1) {
            //     videourl_mp4 = videourl_mp4.split(',');
            //     for (var i = 1; i < videourl_mp4.length - 1; i++) {
            //         console.log(videourl_mp4[i]);
            //         sources.push({ 'url': videourl_mp4[0] + ',' + videourl_mp4[i] + ',' + videourl_mp4[videourl_mp4.length - 1],
            //                       'format': videourl_mp4[i],
            //                       'isNative': true
            //                     });
            //     }
            // } else {
            //     sources = [{ 'url': videourl_mp4,
            //                  'format': 'h264',
            //                  'isNative': true
            //                 }];
            // }
            for (key in selected) {
                var h264_loc = key.indexOf('h264_');
                if (h264_loc == 0 && !!selected[key]) {
                    sources.push({ 'url': selected[key],
                                   'format': key.substring(5, key.length),
                                   'isNative': true
                                 });
                }
            }
            var poster = selected['image'];

            // console.log(selected, sources);
            callback({
                        'playlist': [{
                            'poster': poster,
                            'title': selected.t,
                            'sources': sources
                        }]
                    });
        }, false);
        xhr.send();
    }
});
