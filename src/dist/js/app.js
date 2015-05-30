var Util = {}; // utility
var Node = {}; // Node Modules
var Class = {}; // Classes
var Constant = {
    DEBUG_UI:false,
    LexiconImagesPerPage:8,
    GalleryImagesPerPage:10,
    WordsPerPage:6
}; // Constant
var Settings = {};
var Functions = {
    Debug: {}
};

var Globals = {};

var Library = {
    QrCode:  require('qrcode-npm'),
    Jquery: $,
    Angular:angular
};

(function(){
    var prefix = './js/node_modules/';
    Util.require = function(x){
        try{
            return require(prefix+x);
        }catch(e){
            return require(x);
        }
    };
}());

Util.showSearchBar = function(bar, content){
    bar = bar || '.search-bar';
    content = content || '.search-content';

    $(bar).fadeIn(500);
    $(content).fadeIn(500);
    $(content+'-next').fadeIn(500);
    return Util;
};

Util.hideSearchBar = function(bar, content){
    bar = bar || '.search-bar';
    content = content || '.search-content';
    $(bar).fadeOut(500);
    $(content).fadeOut(500);
    $(content+'-next').fadeOut(500);
    return Util;
};

Util.createSharingServer = Util.require('sharing_server');

(function(){
    var http = require('http');
    var https = require('https');
    var fs = require('fs');
    var path = require('path');

    Util.download = function(src,cb){
        var filepath = path.join('/tmp/', path.basename(src));
        var file = fs.createWriteStream(filepath);
        var request = src.startsWith('https') ? https : http;
        var req = request.get(src, function(res) {
            res.pipe(file);
            file.on('finish', function() {
                file.close();
                cb(filepath);
            });
        });
    };
}());

(function() {
    var path = require('path');
    var randomstring = require('randomstring');
    var fs = require('fs');

    function decodeBase64Image(dataString) {
        var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
            response = {};

        if (matches.length !== 3) {
            return new Error('Invalid input string');
        }

        response.type = matches[1];
        response.data = new Buffer(matches[2], 'base64');

        return response;
    }

    Util.decodeBase64Image = decodeBase64Image;

    var ensurePath = function(img, cb) {
        if (path.dirname(img) != '.' && !img.startsWith('data:image')){
            cb(path.resolve(path.join('./','src',img)));
        }
        else if (img.startsWith('data:image')) {
            var imageBuffer = decodeBase64Image(img);
            var randomPath = "/tmp/" + randomstring.generate() + ".png";
            fs.writeFile(randomPath, imageBuffer.data, function(err) {
                cb(randomPath);
            });
        } else if(img.startsWith('http')) {
            Util.download(img, cb);
        } else{
            throw new Error('unrecognized image type');
        }
    };

    Util.fetchImages = function(img1, img2, cb) {
        ensurePath(img1, function(p1) {
            ensurePath(img2, function(p2) {
                cb(p1, p2);
            });
        });
    };
}());

(function() {
    var path = require('path');
    path.filename = function(x) {
        var base = path.basename(x),
            ext = path.extname(x);
        return base.slice(0, base.length - ext.length);
    };
}());

(function(){
    Util.getDefaultTheme = function(x){

        // TODO Here

        return {};
    };
    Settings.Theme = Util.getDefaultTheme();
}());

(function() {

    var prefix = 'https://www.googleapis.com/customsearch/v1?key=AIzaSyBBlv0xsX5PS9-fW5z1Aab8FxzgCAXKWgs&cx=006496385873236739195:hu_sr_4w_hc&fields=kind,items(title,snippet,pagemap(cse_image))&q=';


    function decapitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    var recordFreq = function(hash, word) {
        var words = word.removeStopWordsAndGetArray();
        words.forEach(function(w) {
            var stem = Util.stem(w);
            w = decapitalize(w);
            hash[stem] = hash[stem] || {
                count: 0,
                words: {}
            };
            hash[stem].count++;
            hash[stem].words[w] = hash[stem].words[w] || 0;
            hash[stem].words[w]++;
        });
    };


    var getTopStems = function(obj, num) {
        var sortable = [];
        for (var v in obj)
            sortable.push([v, obj[v].count]);
        sortable.sort(function(a, b) {
            return b[1] - a[1];
        });
        return sortable.slice(0, num).map(function(x) {
            return x[0];
        });
    };

    Util.google = function(word, cb) {
        var links = [];
        word = word || 'bear';
        var origin_value = word;
        cb = cb || function() {};
        for (var i = 0; i < 3; i++) {
            var l = prefix + word + '&num=10&start=' + (i * 10 + 1);
            links.push(l);
        }
        Util.MultiRequest(links, function(err, res) {
            if (origin_value == Util.latest_search_input || !Util.latest_search_input) {
                if (err)
                    cb(err);
                else {
                    try {
                        var result_images = [],
                            result_links = [],
                            result_words = [];
                        res.forEach(function(r) {
                            var x = JSON.parse(r[1]);
                            if(x.error){
                                cb(x.error);
                                return;
                            }

                            var ta = x.items;
                            ta.forEach(function(k, i) {
                                ta[i].pagemap && result_images.push(ta[i].pagemap.cse_image[0].src);
                                delete ta[i].pagemap;
                            });
                            result_links = result_links.concat(ta);
                        });

                        var freq_hash_map = {};
                        result_links.forEach(function(l) {
                            recordFreq(freq_hash_map, l.title || "");
                            recordFreq(freq_hash_map, l.snippet || "");
                        });
                        var top_stems = getTopStems(freq_hash_map, 30);

                        top_stems.forEach(function(word) {
                            var word_obj = freq_hash_map[word].words;
                            var max;
                            Object.keys(word_obj).forEach(function(key) {
                                max = (word_obj[key] > (word_obj[max] || 0)) ? key : max;
                            });
                            result_words.push(max);
                        });

                        cb(null, result_images, result_words);
                    } catch (e) {
                        cb(e);
                    }
                }
            }
        });
    };

}());

(function() {
    //**********//
    var thunks = require('thunks')();
    var request = require('request');



    Util.googleImageSearch = function(query, cb) { // {for: Value, page: Number}
        var query_list = [];
        query.for = query.for || query;
        query.page = query.page || 1;
        var origin_value = query.for;

        for (var i = 0; i < query.page; i++) {
            query_list.push({
                for: query.for,
                rsz:query.rsz,
                page: i
            });
        }

        var thunk_request = thunks.thunkify(request);

        var thunks_search_list = query_list.map(function(q) {
            return thunk_request("https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=" + (q.for.replace(/\s/g, '+')) + "&start=" + q.page + '&rsz='+ q.rsz);
        });

        thunks.all(thunks_search_list)(function(err, res, body) {
            if(origin_value == Util.latest_search_input || !Util.latest_search_input){
            try {
                if (err) {
                    cb(err);
                } else {
                    var images = [];
                    res.forEach(function(r){
                        images = images.concat(JSON.parse(r[1]).responseData.results);
                    });

                    cb(err, origin_value, images);
                }
            } catch (e) {
                cb(e);
            }
            }else{
                console.log('hit');
            }
        });
    };

}());

(function(){
    Util.isDefined = function(x){
        if(typeof(x) == 'undefined'){
            return false;
        }else{
            return true;
        }
    };
}());

(function() {
    var image_ext_array = [
        '.jpg','.jpeg','.png','.bmp','.gif','.svg'
    ];

    Util.isImage = function(x) {
        var path = require('path'),
            ext = path.extname(x);

        return image_ext_array.indexOf(ext) !== -1;
    };
}());

(function() {
    //**********//
    Util.onLexiconInput = function(query, cb) {
        $(query).on('input propertychange paste',function() {
            cb(this.value);
        });
    };

    Util.addLexiconResult = function(query, opt){
        var parent = $(query + "> #lexicon_images");
        parent.empty();
        $('<div class="clearfix" ></div>')
            .prependTo(parent);
        opt = opt || {};
        opt.images.forEach(function(img){
            $('<img/>',{
                src:img.url,
                class:'lexicon-result'
            }).click(opt.onclick || function(){}).prependTo(parent);
        });
    };

    Util.addLexiconResultForRelatedWord = function(query,opt){
        var parent = $(query + "> #lexicon_words");
        parent.empty();
        $('<div class="clearfix" ></div>')
            .prependTo(parent);
        opt = opt || {};
        opt.words.reverse().forEach(function(word){
            $('<span/>').addClass('lexicon-result-word').html(word).click(opt.onclick).prependTo(parent);
        });
    };


}());

(function(){
    var request = require('request');
    var thunks = require('thunks')();


    var thunk_request = thunks.thunkify(request);


    Util.MultiRequest = function(links, cb){
        var reqList = [];
        links.forEach(function(link) {
            reqList.push(thunk_request(link));
        });
        thunks.all(reqList)(function(err, res) {
            if(err){
                cb(err);
            }else{
                cb(null, res);
            }
        });
    };
})();

(function(){
    Util.choosePasteasyQrCode = function(x,y){
        x = x || '#choose-pasteasy-input';
        y = y || '#qrcode-pasteasy';
        $('#choose-pasteasy-input').change(function(event) {
            var qrpath = this.files[0].path;
            // Util.qrDecode(qrpath, function(err,result){
            //     if(err){
            //         throw new Error(err);
            //     }else{
            //         debugger;
            //         Util.qrcodeToHref (y, result)
            //             .popUp(y);
            //     }
            // });
            $(y).attr('href', qrpath);
            Util.popUp(y);
        });
        $(x).trigger('click');
        return Util;
    };
}());

(function() {

    Util.popUp = function(sel, opt) {
        var __opt = $.extend({
            type: 'image',
            mainClass:'mfp-zoom-in'
        }, opt);
        $(sel).magnificPopup(__opt);
        return Util;
    };
}());

(function() {

    String.prototype.startsWith = function(str) {
        return this.indexOf(str) === 0;
    };

    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };

    Array.prototype.remove = function() {
        var what, a = arguments,
            L = a.length,
            ax;
        while (L && this.length) {
            what = a[--L];
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1);
            }
        }
        return this;
    };


    String.isStopWord = function(word) {
        var regex = new RegExp("\\b" + word + "\\b", "i");
        if (stopWords.search(regex) < 0) {
            return false;
        } else {
            return true;
        }
    };

    String.prototype.removeStopWords = function() {
        var words = new Array();

        this.replace(/\b[\w]+\b/g,
            function($0) {
                if (!String.isStopWord($0)) {
                    words[words.length] = $0.trim();
                }
            }
        );
        return words.join(" ");
    };

    String.prototype.removeStopWordsAndGetArray = function() {
        var words = new Array();

        this.replace(/\b[\w]+\b/g,
            function($0) {
                if (!String.isStopWord($0)) {
                    words[words.length] = $0.trim();
                }
            });


        return words.filter(function(x){
            if(isNaN(+x)){
                return true;
            }else{
                return false;
            }
        });
    };


    var stopWords = "a,able,about,above,abst,accordance,according,accordingly,across,act,actually,added,adj,\
affected,affecting,affects,after,afterwards,again,against,ah,all,almost,alone,along,already,also,although,\
always,am,among,amongst,an,and,announce,another,any,anybody,anyhow,anymore,anyone,anything,anyway,anyways,\
anywhere,apparently,approximately,are,aren,arent,arise,around,as,aside,ask,asking,at,auth,available,away,awfully,\
b,back,be,became,because,become,becomes,becoming,been,before,beforehand,begin,beginning,beginnings,begins,behind,\
being,believe,below,beside,besides,between,beyond,biol,both,brief,briefly,but,by,c,ca,came,can,cannot,can't,cause,causes,\
certain,certainly,co,com,come,comes,contain,containing,contains,could,couldnt,d,date,did,didn't,different,do,does,doesn't,\
doing,done,don't,down,downwards,due,during,e,each,ed,edu,effect,eg,eight,eighty,either,else,elsewhere,end,ending,enough,\
especially,et,et-al,etc,even,ever,every,everybody,everyone,everything,everywhere,ex,except,f,far,few,ff,fifth,first,five,fix,\
followed,following,follows,for,former,formerly,forth,found,four,from,further,furthermore,g,gave,get,gets,getting,give,given,gives,\
giving,go,goes,gone,got,gotten,h,had,happens,hardly,has,hasn't,have,haven't,having,he,hed,hence,her,here,hereafter,hereby,herein,\
heres,hereupon,hers,herself,hes,hi,hid,him,himself,his,hither,home,how,howbeit,however,hundred,i,id,ie,if,i'll,im,immediate,\
immediately,importance,important,in,inc,indeed,index,information,instead,into,invention,inward,is,isn't,it,itd,it'll,its,itself,\
i've,j,just,k,keep,keeps,kept,kg,km,know,known,knows,l,largely,last,lately,later,latter,latterly,least,less,lest,let,lets,like,\
liked,likely,line,little,'ll,look,looking,looks,ltd,m,made,mainly,make,makes,many,may,maybe,me,mean,means,meantime,meanwhile,\
merely,mg,might,million,miss,ml,more,moreover,most,mostly,mr,mrs,much,mug,must,my,myself,n,na,name,namely,nay,nd,near,nearly,\
necessarily,necessary,need,needs,neither,never,nevertheless,new,next,nine,ninety,no,nobody,non,none,nonetheless,noone,nor,\
normally,nos,not,noted,nothing,now,nowhere,o,obtain,obtained,obviously,of,off,often,oh,ok,okay,old,omitted,on,once,one,ones,\
only,onto,or,ord,other,others,otherwise,ought,our,ours,ourselves,out,outside,over,overall,owing,own,p,page,pages,part,\
particular,particularly,past,per,perhaps,placed,please,plus,poorly,possible,possibly,potentially,pp,predominantly,present,\
previously,primarily,probably,promptly,proud,provides,put,q,que,quickly,quite,qv,r,ran,rather,rd,re,readily,really,recent,\
recently,ref,refs,regarding,regardless,regards,related,relatively,research,respectively,resulted,resulting,results,right,run,s,\
said,same,saw,say,saying,says,sec,section,see,seeing,seem,seemed,seeming,seems,seen,self,selves,sent,seven,several,shall,she,shed,\
she'll,shes,should,shouldn't,show,showed,shown,showns,shows,significant,significantly,similar,similarly,since,six,slightly,so,\
some,somebody,somehow,someone,somethan,something,sometime,sometimes,somewhat,somewhere,soon,sorry,specifically,specified,specify,\
specifying,still,stop,strongly,sub,substantially,successfully,such,sufficiently,suggest,sup,sure,t,take,taken,taking,tell,tends,\
th,than,thank,thanks,thanx,that,that'll,thats,that've,the,their,theirs,them,themselves,then,thence,there,thereafter,thereby,\
thered,therefore,therein,there'll,thereof,therere,theres,thereto,thereupon,there've,these,they,theyd,they'll,theyre,they've,\
think,this,those,thou,though,thoughh,thousand,throug,through,throughout,thru,thus,til,tip,to,together,too,took,toward,towards,\
tried,tries,truly,try,trying,ts,twice,two,u,un,under,unfortunately,unless,unlike,unlikely,until,unto,up,upon,ups,us,use,used,\
useful,usefully,usefulness,uses,using,usually,v,value,various,'ve,very,via,viz,vol,vols,vs,w,want,wants,was,wasn't,way,we,wed,\
welcome,we'll,went,were,weren't,we've,what,whatever,what'll,whats,when,whence,whenever,where,whereafter,whereas,whereby,wherein,\
wheres,whereupon,wherever,whether,which,while,whim,whither,who,whod,whoever,whole,who'll,whom,whomever,whos,whose,why,widely,\
willing,wish,with,within,without,won't,words,world,would,wouldn't,www,x,y,yes,yet,you,youd,you'll,your,youre,yours,yourself,\
yourselves,you've,z,zero";
}());

(function() {
    var Datauri = require('datauri'),
        qrcode = require('zxing');



    global.Image = Image;
    global.document = window.document;
    var path = require('path');

    Util.qrDecode = function(pathToImage, cb) {
        qrcode.decode(Datauri(path.resolve(pathToImage)), function(err, result) {
            if(err)
                console.error(err);
            cb(err, result);
        });
    };

}());

(function() {

    Util.qrEncode = function(x) {
        var qr = Library.QrCode.qrcode(8, 'M');
        qr.addData(x);
        qr.make();
        var img = $(qr.createImgTag());
        return $(img).attr('src');
    };
}());

(function() {
    Util.qrPopup = function(sel, opt) {
        sel = sel || '#qrcode-popover';
        var content = "";
        for(var name in opt.qrcode){
            var src = opt.qrcode[name];
            content += '<div>';
            content += '<img class="qrcode"  src="' + src + '" />';
            content += ' <figcaption>' + 'For' +  name + '</figcaption>';
            content += '</div><br><br>';
        }
        $(sel).webuiPopover({
            title: 'Qrcode',
            content: content,
            style: 'inverse',
            animation: 'pop',
            placement:  opt.placement || 'bottom-left'
        });
    };
}());

Util.qrcodeToHref = function(sel, text){
    var qrcode = Util.qrEncode(text);
    $(sel).attr('href', qrcode);
    return Util;
};

Util.redraw = function(sel){
    $(sel).hide().show(0);
    return Util;
};

(function() {
    var fs = require('fs'),
        path = require('path');

    Util.removeFile = function(p,cb){
        var file_to_remove;
        cb = cb || function(){};

        if(p instanceof Array)
            file_to_remove = path.join(p);
        else
            file_to_remove = p;
        fs.unlink(file_to_remove,cb);
    };
}());

/*
 * JQuery CSS Rotate property using CSS3 Transformations
 * Copyright (c) 2011 Jakub Jankiewicz  <http://jcubic.pl>
 * licensed under the LGPL Version 3 license.
 * http://www.gnu.org/licenses/lgpl.html
 */
(function($) {
    function getTransformProperty(element) {
        var properties = ['transform', 'WebkitTransform',
                          'MozTransform', 'msTransform',
                          'OTransform'];
        var p;
        while (p = properties.shift()) {
            if (element.style[p] !== undefined) {
                return p;
            }
        }
        return false;
    }
    $.cssHooks.rotate = {
        get: function(elem, computed, extra){
            var property = getTransformProperty(elem);
            if (property) {
                return elem.style[property].replace(/.*rotate\((.*)deg\).*/, '$1');
            } else {
                return '';
            }
        },
        set: function(elem, value){
            var property = getTransformProperty(elem);
            if (property) {
                value = parseInt(value);
                $(elem).data('rotatation', value);
                if (value === 0) {
                    elem.style[property] = '';
                } else {
                    elem.style[property] = 'rotate(' + value%360 + 'deg)';
                }
            } else {
                return '';
            }
            return '';
        }
    };
    $.fx.step.rotate = function(fx){
        $.cssHooks.rotate.set(fx.elem, fx.now);
    };
})($);


(function(){
    Util.rotate = function(query, degree){
        $(query).css('rotate',degree);
        return Util;
    };

}());

(function() {
    var request = require('request');
    var thunks = require('thunks')();

    var semanticLink = 'http://semantic-link.com/related.php?word=';


    /**
     @param  {string},{an array of strings} words
     */
    var thunk_request = thunks.thunkify(request);

    function getRelatedWord(words, cb) {
        words = Util.tokenizeAndStem(words);
        var origin_value;
        if (!(words instanceof Array)) {
            origin_value = words;
            words = [words];
        } else {
            origin_value = words.origin_value;
        }

        var reqList = [];
        words.forEach(function(word) {
            console.log('Fetching related word for: ' + word);
            reqList.push(thunk_request(semanticLink + word));
        });
        return thunks.all(reqList)(function(err, res) {
            if (origin_value == Util.latest_search_input || !Util.latest_search_input) {
                console.log('One Fetch Operation Complete');
                var resultList = [];
                if (err)
                    cb(err);
                res.forEach(function(r) {
                    var body = r[1];
                    var parsed_body = JSON.parse(body);
                    resultList.push(parsed_body.map(function(obj) {
                        return obj.v;
                    }));
                });
                // console.log(resultList);
                cb(null, origin_value, resultList);
            } else {
                console.log('hit');
            }
        });

    }

    Util.getRelatedWord = getRelatedWord;
    // getRelatedWord(['apple', 'bin'], function(err, resultList){
    //     debugger;
    // });


    var google = require('google');

    google.resultsPerPage = 25;


    var recordFreq = function(hash, word) {
        var words = word.removeStopWordsAndGetArray();
        words.forEach(function(w) {
            var stem = Util.stem(w);

            hash[stem] = hash[stem] || {
                count: 0,
                words: {}
            };
            hash[stem].count++;
            hash[stem].words[w] = hash[stem].words[w] || 0;
            hash[stem].words[w]++;
        });
    };


    var getTopStems = function(obj, num) {
        var sortable = [];
        for (var v in obj)
            sortable.push([v, obj[v].count]);
        sortable.sort(function(a, b) {
            return b[1] - a[1];
        });
        return sortable.slice(0, num).map(function(x) {
            return x[0];
        });
    };



    Util.getRelatedWord = function(w, cb) {
        // cb(null, origin_value, resultList);
        var origin_value = w.word;

        google(w.word, function(err, next, links) {
            if (origin_value == Util.latest_search_input || !Util.latest_search_input) {
                if (err)
                    cb(err);
                else {
                    //WEB WORKER START
                    // getTopStems:getTopStems,
                    // recordFreq:recordFreq,
                    var p = new Parallel('', {
                        env: {
                            links: links,
                            result_num:w.result_num
                        }
                    });
                    p.spawn(function(opt) {
                        var freq_hash_map = {};

                        String.isStopWord = function(word) {
                            var regex = new RegExp("\\b" + word + "\\b", "i");
                            if (stopWords.search(regex) < 0) {
                                return false;
                            } else {
                                return true;
                            }
                        };

                        String.prototype.removeStopWords = function() {
                            var words = new Array();

                            this.replace(/\b[\w]+\b/g,
                                function($0) {
                                    if (!String.isStopWord($0)) {
                                        words[words.length] = $0.trim();
                                    }
                                }
                            );
                            return words.join(" ");
                        };

                        String.prototype.removeStopWordsAndGetArray = function() {
                            var words = new Array();

                            this.replace(/\b[\w]+\b/g,
                                function($0) {
                                    if (!String.isStopWord($0)) {
                                        words[words.length] = $0.trim();
                                    }
                                });


                            return words.filter(function(x) {
                                if (isNaN(+x)) {
                                    return true;
                                } else {
                                    return false;
                                }
                            });
                        };


                        var stopWords = "a,able,about,above,abst,accordance,according,accordingly,across,act,actually,added,adj,\
affected,affecting,affects,after,afterwards,again,against,ah,all,almost,alone,along,already,also,although,\
always,am,among,amongst,an,and,announce,another,any,anybody,anyhow,anymore,anyone,anything,anyway,anyways,\
anywhere,apparently,approximately,are,aren,arent,arise,around,as,aside,ask,asking,at,auth,available,away,awfully,\
b,back,be,became,because,become,becomes,becoming,been,before,beforehand,begin,beginning,beginnings,begins,behind,\
being,believe,below,beside,besides,between,beyond,biol,both,brief,briefly,but,by,c,ca,came,can,cannot,can't,cause,causes,\
certain,certainly,co,com,come,comes,contain,containing,contains,could,couldnt,d,date,did,didn't,different,do,does,doesn't,\
doing,done,don't,down,downwards,due,during,e,each,ed,edu,effect,eg,eight,eighty,either,else,elsewhere,end,ending,enough,\
especially,et,et-al,etc,even,ever,every,everybody,everyone,everything,everywhere,ex,except,f,far,few,ff,fifth,first,five,fix,\
followed,following,follows,for,former,formerly,forth,found,four,from,further,furthermore,g,gave,get,gets,getting,give,given,gives,\
giving,go,goes,gone,got,gotten,h,had,happens,hardly,has,hasn't,have,haven't,having,he,hed,hence,her,here,hereafter,hereby,herein,\
heres,hereupon,hers,herself,hes,hi,hid,him,himself,his,hither,home,how,howbeit,however,hundred,i,id,ie,if,i'll,im,immediate,\
immediately,importance,important,in,inc,indeed,index,information,instead,into,invention,inward,is,isn't,it,itd,it'll,its,itself,\
i've,j,just,k,keep,keeps,kept,kg,km,know,known,knows,l,largely,last,lately,later,latter,latterly,least,less,lest,let,lets,like,\
liked,likely,line,little,'ll,look,looking,looks,ltd,m,made,mainly,make,makes,many,may,maybe,me,mean,means,meantime,meanwhile,\
merely,mg,might,million,miss,ml,more,moreover,most,mostly,mr,mrs,much,mug,must,my,myself,n,na,name,namely,nay,nd,near,nearly,\
necessarily,necessary,need,needs,neither,never,nevertheless,new,next,nine,ninety,no,nobody,non,none,nonetheless,noone,nor,\
normally,nos,not,noted,nothing,now,nowhere,o,obtain,obtained,obviously,of,off,often,oh,ok,okay,old,omitted,on,once,one,ones,\
only,onto,or,ord,other,others,otherwise,ought,our,ours,ourselves,out,outside,over,overall,owing,own,p,page,pages,part,\
particular,particularly,past,per,perhaps,placed,please,plus,poorly,possible,possibly,potentially,pp,predominantly,present,\
previously,primarily,probably,promptly,proud,provides,put,q,que,quickly,quite,qv,r,ran,rather,rd,re,readily,really,recent,\
recently,ref,refs,regarding,regardless,regards,related,relatively,research,respectively,resulted,resulting,results,right,run,s,\
said,same,saw,say,saying,says,sec,section,see,seeing,seem,seemed,seeming,seems,seen,self,selves,sent,seven,several,shall,she,shed,\
she'll,shes,should,shouldn't,show,showed,shown,showns,shows,significant,significantly,similar,similarly,since,six,slightly,so,\
some,somebody,somehow,someone,somethan,something,sometime,sometimes,somewhat,somewhere,soon,sorry,specifically,specified,specify,\
specifying,still,stop,strongly,sub,substantially,successfully,such,sufficiently,suggest,sup,sure,t,take,taken,taking,tell,tends,\
th,than,thank,thanks,thanx,that,that'll,thats,that've,the,their,theirs,them,themselves,then,thence,there,thereafter,thereby,\
thered,therefore,therein,there'll,thereof,therere,theres,thereto,thereupon,there've,these,they,theyd,they'll,theyre,they've,\
think,this,those,thou,though,thoughh,thousand,throug,through,throughout,thru,thus,til,tip,to,together,too,took,toward,towards,\
tried,tries,truly,try,trying,ts,twice,two,u,un,under,unfortunately,unless,unlike,unlikely,until,unto,up,upon,ups,us,use,used,\
useful,usefully,usefulness,uses,using,usually,v,value,various,'ve,very,via,viz,vol,vols,vs,w,want,wants,was,wasn't,way,we,wed,\
welcome,we'll,went,were,weren't,we've,what,whatever,what'll,whats,when,whence,whenever,where,whereafter,whereas,whereby,wherein,\
wheres,whereupon,wherever,whether,which,while,whim,whither,who,whod,whoever,whole,who'll,whom,whomever,whos,whose,why,widely,\
willing,wish,with,within,without,won't,words,world,would,wouldn't,www,x,y,yes,yet,you,youd,you'll,your,youre,yours,yourself,\
                        yourselves,you've,z,zero";

                        var stemmer = (function() {
                            var step2list = {
                                    "ational": "ate",
                                    "tional": "tion",
                                    "enci": "ence",
                                    "anci": "ance",
                                    "izer": "ize",
                                    "bli": "ble",
                                    "alli": "al",
                                    "entli": "ent",
                                    "eli": "e",
                                    "ousli": "ous",
                                    "ization": "ize",
                                    "ation": "ate",
                                    "ator": "ate",
                                    "alism": "al",
                                    "iveness": "ive",
                                    "fulness": "ful",
                                    "ousness": "ous",
                                    "aliti": "al",
                                    "iviti": "ive",
                                    "biliti": "ble",
                                    "logi": "log"
                                },

                                step3list = {
                                    "icate": "ic",
                                    "ative": "",
                                    "alize": "al",
                                    "iciti": "ic",
                                    "ical": "ic",
                                    "ful": "",
                                    "ness": ""
                                },

                                c = "[^aeiou]", // consonant
                                v = "[aeiouy]", // vowel
                                C = c + "[^aeiouy]*", // consonant sequence
                                V = v + "[aeiou]*", // vowel sequence

                                mgr0 = "^(" + C + ")?" + V + C, // [C]VC... is m>0
                                meq1 = "^(" + C + ")?" + V + C + "(" + V + ")?$", // [C]VC[V] is m=1
                                mgr1 = "^(" + C + ")?" + V + C + V + C, // [C]VCVC... is m>1
                                s_v = "^(" + C + ")?" + v; // vowel in stem

                            function dummyDebug() {}

                            function realDebug() {
                                console.log(Array.prototype.slice.call(arguments).join(' '));
                            }

                            return function(w, debug) {
                                var
                                    stem,
                                    suffix,
                                    firstch,
                                    re,
                                    re2,
                                    re3,
                                    re4,
                                    debugFunction,
                                    origword = w;

                                if (debug) {
                                    debugFunction = realDebug;
                                } else {
                                    debugFunction = dummyDebug;
                                }

                                if (w.length < 3) {
                                    return w;
                                }

                                firstch = w.substr(0, 1);
                                if (firstch == "y") {
                                    w = firstch.toUpperCase() + w.substr(1);
                                }

                                // Step 1a
                                re = /^(.+?)(ss|i)es$/;
                                re2 = /^(.+?)([^s])s$/;

                                if (re.test(w)) {
                                    w = w.replace(re, "$1$2");
                                    debugFunction('1a', re, w);

                                } else if (re2.test(w)) {
                                    w = w.replace(re2, "$1$2");
                                    debugFunction('1a', re2, w);
                                }

                                // Step 1b
                                re = /^(.+?)eed$/;
                                re2 = /^(.+?)(ed|ing)$/;
                                if (re.test(w)) {
                                    var fp = re.exec(w);
                                    re = new RegExp(mgr0);
                                    if (re.test(fp[1])) {
                                        re = /.$/;
                                        w = w.replace(re, "");
                                        debugFunction('1b', re, w);
                                    }
                                } else if (re2.test(w)) {
                                    var fp = re2.exec(w);
                                    stem = fp[1];
                                    re2 = new RegExp(s_v);
                                    if (re2.test(stem)) {
                                        w = stem;
                                        debugFunction('1b', re2, w);

                                        re2 = /(at|bl|iz)$/;
                                        re3 = new RegExp("([^aeiouylsz])\\1$");
                                        re4 = new RegExp("^" + C + v + "[^aeiouwxy]$");

                                        if (re2.test(w)) {
                                            w = w + "e";
                                            debugFunction('1b', re2, w);

                                        } else if (re3.test(w)) {
                                            re = /.$/;
                                            w = w.replace(re, "");
                                            debugFunction('1b', re3, w);

                                        } else if (re4.test(w)) {
                                            w = w + "e";
                                            debugFunction('1b', re4, w);
                                        }
                                    }
                                }

                                // Step 1c
                                re = new RegExp("^(.*" + v + ".*)y$");
                                if (re.test(w)) {
                                    var fp = re.exec(w);
                                    stem = fp[1];
                                    w = stem + "i";
                                    debugFunction('1c', re, w);
                                }

                                // Step 2
                                re = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
                                if (re.test(w)) {
                                    var fp = re.exec(w);
                                    stem = fp[1];
                                    suffix = fp[2];
                                    re = new RegExp(mgr0);
                                    if (re.test(stem)) {
                                        w = stem + step2list[suffix];
                                        debugFunction('2', re, w);
                                    }
                                }

                                // Step 3
                                re = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
                                if (re.test(w)) {
                                    var fp = re.exec(w);
                                    stem = fp[1];
                                    suffix = fp[2];
                                    re = new RegExp(mgr0);
                                    if (re.test(stem)) {
                                        w = stem + step3list[suffix];
                                        debugFunction('3', re, w);
                                    }
                                }

                                // Step 4
                                re = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
                                re2 = /^(.+?)(s|t)(ion)$/;
                                if (re.test(w)) {
                                    var fp = re.exec(w);
                                    stem = fp[1];
                                    re = new RegExp(mgr1);
                                    if (re.test(stem)) {
                                        w = stem;
                                        debugFunction('4', re, w);
                                    }
                                } else if (re2.test(w)) {
                                    var fp = re2.exec(w);
                                    stem = fp[1] + fp[2];
                                    re2 = new RegExp(mgr1);
                                    if (re2.test(stem)) {
                                        w = stem;
                                        debugFunction('4', re2, w);
                                    }
                                }

                                // Step 5
                                re = /^(.+?)e$/;
                                if (re.test(w)) {
                                    var fp = re.exec(w);
                                    stem = fp[1];
                                    re = new RegExp(mgr1);
                                    re2 = new RegExp(meq1);
                                    re3 = new RegExp("^" + C + v + "[^aeiouwxy]$");
                                    if (re.test(stem) || (re2.test(stem) && !(re3.test(stem)))) {
                                        w = stem;
                                        debugFunction('5', re, re2, re3, w);
                                    }
                                }

                                re = /ll$/;
                                re2 = new RegExp(mgr1);
                                if (re.test(w) && re2.test(w)) {
                                    re = /.$/;
                                    w = w.replace(re, "");
                                    debugFunction('5', re, re2, w);
                                }

                                // and turn initial Y back to y
                                if (firstch == "y") {
                                    w = firstch.toLowerCase() + w.substr(1);
                                }


                                return w;
                            };
                        })();
                        function decapitalize(string) {
                            return string.charAt(0).toUpperCase() + string.slice(1);
                        }
                        var recordFreq = function(hash, word) {
                            var words = word.removeStopWordsAndGetArray();
                            words.forEach(function(w) {
                                var stem = stemmer(w).toLowerCase();
                                w = decapitalize(w);
                                hash[stem] = hash[stem] || {
                                    count: 0,
                                    words: {}
                                };
                                hash[stem].count++;
                                hash[stem].words[w] = hash[stem].words[w] || 0;
                                hash[stem].words[w]++;
                            });
                        };


                        var getTopStems = function(obj, num) {
                            var sortable = [];
                            for (var v in obj)
                                sortable.push([v, obj[v].count]);
                            sortable.sort(function(a, b) {
                                return b[1] - a[1];
                            });
                            return sortable.slice(0, num).map(function(x) {
                                return x[0];
                            });
                        };

                        global.env.links.forEach(function(l) {
                            recordFreq(freq_hash_map, l.title || "");
                            recordFreq(freq_hash_map, l.description || "");
                        });
                        var resultList = [];
                        var top_stems = getTopStems(freq_hash_map, global.env.result_num);

                        top_stems.forEach(function(word) {
                            var word_obj = freq_hash_map[word].words;
                            var max;
                            Object.keys(word_obj).forEach(function(key) {
                                max = (word_obj[key] > (word_obj[max] || 0)) ? key : max;
                            });
                            resultList.push(max);
                        });
                        return resultList;
                    }).then(function(resultList) {
                        debugger;
                        cb(null, origin_value, resultList);
                    });
                    //WEB WORKER END
                }
            } else {
                console.log('hit');
            }
        });

    };


}());

(function() {
    var gm = require('gm');
    var path = require('path');
    var randomstring = require("randomstring");

    Util.showSketchBoard = function(x) {
        x = x || '.sketching';
        $(x).show();
        return Util;
    };

    Util.hideSketchBoard = function(x) {
        x = x || '.sketching';
        $(x).hide();
        return Util;
    };

    Util.hideSketchBoardAndSave = function(sel_sketch, gallery) {
        sel_sketch = sel_sketch || '.sketching';
        gallery = gallery || Globals.gallery;
        var filepath = gallery.option.path;


        if ($(sel_sketch).is(":visible")) {
            var canvas = $(sel_sketch).find('canvas')[0];
            var DataUri = canvas.toDataURL();
            var current = gallery.current;
            gallery.push({
                image: DataUri,
                big: DataUri,
                thumb: DataUri,
                title: 'Note For ' + current.title,
                description: 'Note For ' + current.description
            }).last();


            // Util.fetchImages(current.image, DataUri, function(background, note) {
            //     gm(background)
            //         // .resize(gallery.width,gallery.height)
            //         .composite(note)
            //         .write(path.join(filepath, 'Note_' + randomstring.generate(7) + '.png'), function(err) {
            //             if (err)
            //                 throw err;
            //         });
            // });


        }
        return Util.hideSketchBoard(sel_sketch);
    };


}());

Util.storage = window.localStorage;

(function() {
    var keyword = require('gramophone');
    var natural = require('natural'),
        tokenizer = new natural.WordTokenizer();
    Util.tokenizeAndStem = function(str) {
        var arr  = keyword.extract(str, {
            min: 1
        });
        var result = [];
        arr.forEach(function(str){
            result = result.concat(tokenizer.tokenize(str));
        });
        result.origin_value = str;
        return result;
    };

    Util.stem = natural.PorterStemmer.stem;
}());

(function() {
    var chokidar = require('chokidar');
    var noop = function() {};

    function DirWatcher(path, cb) {
        this.path = path;
        this.addCb = cb;
    }
    var Datauri = require('datauri');
    DirWatcher.prototype = function() {
        return {
            start: function(x) {
                x = x || 0;
                var me = this;
                this.watcher = chokidar.watch(this.path, {
                    ignored: /[\/\\]\./
                }).on('add', function(path,stat) {
                    // read it and turn it into base64 image
                    setTimeout(function() {
                        me.addCb(path,stat);
                    }, x);
                });
                return this;
            },
            stop: function() {
                this.watcher && this.watcher.close();
                return;
            },
            WAIT_TIME:5000
        };
    }();


    Class.DirWatcher = DirWatcher;
}());

(function(){


    /**
     What Methods it should have please refer to: https://github.com/BenBBear/me310_Table/wiki/Design-of-Classes

     You could use global variable [ Util Node Constant Class Settings].

     It doesn't matter whether those global variables you may use defined before here or not,

      - since you use those vars inside function definition
      - they will be refered when the main calls all the functions here
      - and certainly that time everything is defined already
     */
    var GestureDetector = function(){
        // TODO
    };

    GestureDetector.prototype = function(){
        // TODO
        return {};        //
    }();



    Class.GestureDetector = GestureDetector;
}());

(function() {

    /**
     What Methods it should have please refer to: https://github.com/BenBBear/me310_Table/wiki/Design-of-Classes

     You could use global variable [ Util Node Constant Class Settings].

     It doesn't matter whether those global variables you may use defined before here or not,

      - since you use those vars inside function definition
      - they will be refered when the main calls all the functions here
      - and certainly that time everything is defined already
     */
    var theme_path_a = './lib/other/galleria/themes/',
        theme_path_b = '/galleria.',
        theme_path_c = '.min.js';

    var retry_period = 300;

    var theBear = {
        image: './assets/images/bear.jpg',
        thumb: './assets/images/bear.jpg',
        big: './assets/images/bear.jpg',
        title: 'Bear',
        description: 'A Lovely Bear'
    };

    var makeImage = function(file_path) {
        var path = require('path');
        return {
            image: file_path,
            thumb: file_path,
            big: file_path,
            title: path.filename(file_path),
            description: path.basename(file_path)
        };
    };

    var makeVideo = function() {
        // TODO
        var msg = 'makeVideo not implemented';
        alert(msg);
        throw new Error(msg);
    };


    var PhotoGallery = function(opt) {
        // TODO
        var me = this;
        this.option = $.extend({}, opt);
        this.option.ready = this.option.ready || function() {};
        this.option.event = this.option.event || {};
        this.option.dataSource = this.option.dataSource || [theBear];

        var theme = this.option.theme = this.option.theme || 'azur';
        var theme_path = theme_path_a + theme + theme_path_b + theme + theme_path_c;
        this.element = this.element || '.galleria';
        this.Galleria.loadTheme(theme_path);
        Object.defineProperty(this, 'width', {
            get: function() {
                return $(this.element).width();
            }
        });
        Object.defineProperty(this, 'height', {
            get: function() {
                return $(this.element).height();
            }
        });

        /**
         Set up Gallery Storage
         */

        // me.galleria_instance
        this.dir_watcher = new Class.DirWatcher(this.option.path, function(path, stat) {
            // add the image/video into the Gallery
            var elm;

            if (path.endsWith('.json'))
                elm = makeVideo(path);
            else if (Util.isImage(path))
                elm = makeImage(path);


            // var arr = me.galleria_instance._data.concat(elm);
            if (elm)
                me.galleria_instance.push(elm);

        });
        this.option.Util = Util;

        this.sharing_server = Util.createSharingServer(this.option);
        this.upload_addr = this.sharing_server.upload_addr;


        console.log(this.option);
        /**
         Begin creating the Gallery
         */

        this.Galleria.run(this.element, this.option);
        me.Galleria.ready(function() {
            me.galleria_instance = this;
            for (var k in me.option.event) {
                this.bind(k, me.option.event[k]);
            }
            me.dir_watcher.start();
            me.sharing_server.start();
            me.option.ready(this);
        });

    };


    /**
     The "Static" Method of PhotoGallery
     */
    PhotoGallery.prototype = function() {
        return {
            Galleria: Library.Galleria,
            get current() {
                return this.galleria_instance.getData();
            },


            last: function() {
                var me = this;
                setTimeout(function() {
                    var len = me.galleria_instance._data.length;
                    me.galleria_instance.show(len - 1);
                }, 1000);
                return me;
            },
            push: function(url) {
                var me = this;
                if (typeof(url) == 'string')
                    me.galleria_instance.push(makeImage(url));
                else
                    me.galleria_instance.push(url);
                return me;
            },
            removeCurrent: function() {
                var me = this;
                if (me.galleria_instance) {
                    var idx = me.galleria_instance.getIndex();
                    var data = me.galleria_instance.getData();
                    me.galleria_instance.splice(idx, 1);
                    me.galleria_instance.next();
                    if (!data.image.startsWith('.')) {
                        // Not Default Image, could delete
                        // Remove the Image from Disk
                        Util.removeFile(data.image);
                    }
                } else {
                    setTimeout(function() {
                        me.removeCurrent();
                    }, retry_period);
                }
                return me;
            }

        };
    }();



    Class.PhotoGallery = PhotoGallery;
}());

(function(){

    /**
     What Methods it should have please refer to: https://github.com/BenBBear/me310_Table/wiki/Design-of-Classes

     You could use global variable [ Util Node Constant Class Settings].

     It doesn't matter whether those global variables you may use defined before here or not,

      - since you use those vars inside function definition
      - they will be refered when the main calls all the functions here
      - and certainly that time everything is defined already
     */
    var Sketch = function(){
        // TODO
    };

    Sketch.prototype = function(){
        // TODO
        return {};        //
    }();



    Class.Sketch = Sketch;
}());

(function(){

    /**
     What Methods it should have please refer to: https://github.com/BenBBear/me310_Table/wiki/Design-of-Classes

     You could use global variable [ Util Node Constant Class Settings].

     It doesn't matter whether those global variables you may use defined before here or not,

      - since you use those vars inside function definition
      - they will be refered when the main calls all the functions here
      - and certainly that time everything is defined already
     */
    var Theme = function(){
        // TODO
    };

    Theme.prototype = function(){
        // TODO
        return {};        //
    }();



    Class.Theme = Theme;
}());

/**
 Configuration
 */
Class.DirWatcher.prototype.WAIT_TIME = 0;


function main() {





    /**
     Need To wrap them as Promises
     - storage_path
     - pasteasy_qrcode
     */

}


(function() {
    var nop = function() {};
    var $apply = function($scope) {
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };




    var app = Globals.app = angular.module('me310_Table', ['ionic',
        'wu.masonry', 'toaster' // , 'angular-images-loaded'
        // 'ngDraggable'
    ]);

    var message = {};
    message.startUp = function() {
        alert('Now the program should start.' +
            '\n\nMore Info of This Program Please See:\n\n https://github.com/BenBBear/me310_Table');
    };



    app.directive('errRemove', function() {
        return {
            scope: {
                source: '='
            },

            controller: function($scope, $element, $attrs) {
                $element.bind('error', function() {
                    $scope.source.remove($attrs.src);
                });
            }
        };
    });
    app.factory('storage_path', function($q) {
        var me = this;
        var deferred = $q.defer();

        (function() {
            if (me.storage_path) {
                deferred.resolve(me.storage_path);
            } else {
                $('#storage_dir_chooser')
                    .change(function(event) {
                        me.storage_path = this.files[0].path;
                        deferred.resolve(me.storage_path);
                    })
                    .trigger('click');
            }
        }());
        return deferred.promise;
    });

    app.factory('pasteasy_qrcode', function($q) {
        var me = this;
        var deferred = $q.defer();

        (function() {
            if (me.pasteasy_qrcode) {
                deferred.resolve(me.pasteasy_qrcode);
            } else {

                $('#pasteasy_qr_chooser')
                    .change(function(event) {
                        me.pasteasy_qrcode = this.files[0].path;
                        deferred.resolve(me.pasteasy_qrcode);
                    })
                    .trigger('click');
            }
        }());
        return deferred.promise;
    });

    var SetUpGallery = function($scope) {
        //**********//
        $scope.lexicon_input = "";
        $scope.setLexiconInput = function(x) {
            $scope.lexicon_input = x;
        };

        $scope.main_gallery = ['assets/images/bear.jpg']; //a array of images
        $scope.h_main_gallery = [];
        $scope.$watch(function() {
            return $scope.main_gallery.length;
        }, function(nv, ov) {
            if (nv) {
                var h_main_gallery = [];
                var len = Math.ceil($scope.main_gallery.length / Constant.GalleryImagesPerPage);
                var i = 1;
                while (i <= len) {
                    var start, end;
                    start = (i - 1) * Constant.GalleryImagesPerPage;
                    end = i * Constant.GalleryImagesPerPage;
                    var tmp = $scope.main_gallery.slice(start, end);
                    h_main_gallery.push(tmp);
                    i++;
                }
                $scope.h_main_gallery = h_main_gallery;
            }
        });


        $scope.main_gallery_cursor = 0;
        $scope.gallery = {
            index: function(x) {
                $scope.main_gallery_cursor = x;
            },
            get current() {
                return $scope.main_gallery[$scope.main_gallery_cursor];
            },
            next: function() {
                if ($scope.main_gallery_cursor < $scope.main_gallery.length - 1)
                    $scope.main_gallery_cursor++;
                else {
                    $scope.main_gallery_cursor = 0;
                }
            },
            prev: function() {
                if ($scope.main_gallery_cursor > 0)
                    $scope.main_gallery_cursor--;
                else {
                    $scope.main_gallery_cursor = $scope.main_gallery.length - 1;
                }
            }
        };


        $scope.lexicon_images = []; //the image search results
        $scope.lexicon_images_cursor = 0;
        $scope.lexicon_words = []; //the relative words search results;
        $scope.lexiconWordsCursorReset = function() {
            $scope.lexicon_words_cursor_start = 0;
        };
        $scope.lexiconWordsCursorMore = function() {
            var len = $scope.lexicon_words.length;
            $scope.lexicon_words_cursor_start = ($scope.lexicon_words_cursor_start + Constant.WordsPerPage) % len;
        };
        $scope.lexiconWordsCursorReset();

        $scope.lexiconImagesSelectReset = function() {
            $scope.lexicon_images_select_start = 0;
        };
        $scope.lexiconImagesSelectMore = function() {
            var len = $scope.lexicon_images.length;
            $scope.lexicon_images_select_start = ($scope.lexicon_images_select_start + Constant.LexiconImagesPerPage) % len;
        };
        $scope.lexiconImagesSelectReset();


        $scope.lexicon = {
            index: function(x) {
                $scope.lexicon_images_cursor = x;
            },
            get current() {
                return $scope.lexicon_images[$scope.lexicon_images_cursor];
            },
            next: function() {
                if ($scope.lexicon_images_cursor < $scope.lexicon_images.length - 1)
                    $scope.lexicon_images_cursor++;
                else {
                    $scope.lexicon_images_cursor = 0;
                }
            },
            prev: function() {
                if ($scope.lexicon_images_cursor > 0)
                    $scope.lexicon_images_cursor--;
                else {
                    $scope.lexicon_images_cursor = $scope.lexicon_images.length - 1;
                }
            }
        };
    };


    if (!Constant.DEBUG_UI) {
        app.controller('AppCtrl',
            function($scope, $log, storage_path, pasteasy_qrcode, $ionicModal, $ionicPopover, $timeout, toaster, $window) {

                // Every Thing Goes Here
                storage_path.then(function(storage_path) {
                    pasteasy_qrcode.then(function(pasteasy_qrcode) {
                        $scope.storage_path = storage_path;
                        $scope.pasteasy_qrcode = pasteasy_qrcode;
                        $scope.WordsPerPage = Constant.WordsPerPage;
                        $scope.LexiconImagesPerPage = Constant.LexiconImagesPerPage;
                        $scope.GalleryImagesPerPage = Constant.GalleryImagesPerPage;

                        $scope.min = function(a, b) {
                            return Math.min(a, b);
                        };
                        $scope.range = function(n) {
                            return new Array(n);
                        };
                        var set = $scope.set = function(k, v) {
                            $scope[k] = v;
                            return set;
                        };
                        var get = $scope.get = function(k) {
                            return $scope[k];
                        };
                        // setup $scope variables
                        SetUpGallery($scope);


                        /**
                         lexicon_input
                         main_gallery
                         lexicon_images
                         lexicon_words
                         */
                        // setup the dirwatcher
                        var dir_watcher = new Class.DirWatcher(storage_path, function(path, stat) {
                            if (Util.isImage(path) || path.startsWith('data:image/')) {
                                $scope.main_gallery.push(path);
                                $scope.gallery.index(0);
                                $scope.openImageModal($scope.gallery);
                                toaster.pop({
                                    type: 'note',
                                    title: "Recieved",
                                    body: "Your Image will appear in the Last Page."
                                });
                                $apply($scope);
                            }
                        });

                        // start the server
                        var sharing_server = Util.createSharingServer({
                            Util: Util,
                            port: 3000,
                            path: storage_path
                        });


                        dir_watcher.start(1500);
                        sharing_server.start();
                        $scope.server_qrcode = Util.qrEncode(sharing_server.upload_addr);

                        // Watching the lexicon_input
                        Util.latest_search_input = "";
                        $scope.$watch('lexicon_input', function(nv, ov) {
                            Util.latest_search_input = nv;
                            if (nv) {
                                Util.google(nv, function(err, images, words) {
                                    if (err) {
                                        $log.error(err);
                                    } else {
                                        $scope.lexicon_images = images;
                                        $scope.lexicon_words = words;
                                        $scope.lexiconWordsCursorReset();
                                        $scope.lexiconImagesSelectReset();
                                        $apply($scope);
                                    }
                                });
                            } else {
                                $scope.lexicon_images = [];
                                $scope.lexicon_images_cursor = 0;
                                $scope.lexicon_words = [];
                            }
                        });

                        // Image Modal
                        $scope.openImageModal = function(src) {
                            $scope.current_gallery = src;
                            $scope.openImageModal.modal && $scope.openImageModal.modal.show();
                        };
                        $scope.closeImageModal = function() {
                            $scope.openImageModal.modal && $scope.openImageModal.modal.hide();
                        };
                        $ionicModal.fromTemplateUrl('image-modal.html', function(modal) {
                            $scope.openImageModal.modal = modal;
                        }, {
                            scope: $scope,
                            animation: 'slide-in-up'
                        });

                        //rotate
                        $scope.rotate = function(x) {
                            x = Math.abs(x);
                            console.log('previous body_angle is:' + $scope.body_angle || 0);
                            if (x !== undefined) {
                                $scope.body_angle = x;
                            } else {
                                var old = $scope.body_angle;
                                if (old) {
                                    $scope.body_angle += 90;
                                    $scope.body_angle = $scope.body_angle % 360;
                                } else {
                                    $scope.body_angle = 90;
                                }
                            }
                            console.log('current body_angle is:' + $scope.body_angle || 0);
                            // Util.rotate(document.body, $scope.body_angle);
                            Util.redraw('#my-body')
                                .rotate('#my-body', $scope.body_angle);

                            Util.rotate('.modal-backdrop', $scope.body_angle);
                        };

                        function is(x, y, z) {
                            if (x == y)
                                return z;
                            return null;
                        }

                        function onSwipe(x, cb) {
                            var angle = $scope.body_angle || 0;
                            var direction;

                            switch (angle) { //todo here
                                case 0:
                                    direction = is(x, 'right', 'right') || is(x, 'left', 'left') || 'stay';
                                    break;
                                case 90:
                                    direction = is(x, 'up', 'left') || is(x, 'down', 'right') || 'stay';
                                    break;
                                case 180:
                                    direction = is(x, 'left', 'right') || is(x, 'right', 'left') || 'stay';
                                    break;
                                case 270:
                                    direction = is(x, 'down', 'left') || is(x, 'up', 'right') || 'stay';
                                    break;
                            }
                            cb(direction);
                        }

                        //swipe
                        $scope.swipe = function(x) {
                            onSwipe(x, function(cmd) {
                                if (cmd == 'left') {
                                    cmd = 'next';
                                } else if (cmd == 'right') {
                                    cmd = 'prev';
                                }
                                ($scope.current_gallery[cmd] || function() {})();
                            });
                        };

                        //horizontal scroll
                        $scope.current_h_main_gallery_index = 0;
                        $scope.isHorizontalCurrentView = function(x) {
                            return $scope.current_h_main_gallery_index == x;
                        };
                        $scope.hscroll = function(direction) {
                            onSwipe(direction, function(cmd) {
                                var idx = $scope.current_h_main_gallery_index;
                                switch (cmd) {
                                    case 'left':
                                        {
                                            $log.info('h_main_gallery go next');
                                            $scope.current_h_main_gallery_index = idx < $scope.h_main_gallery.length - 1 ? idx + 1 : idx;
                                            break;
                                        }
                                    case 'right':
                                        {
                                            $log.info('h_main_gallery go prev');
                                            $scope.current_h_main_gallery_index = idx > 0 ? idx - 1 : 0;
                                            break;
                                        }
                                }
                            });
                        };



                        $scope.addToGallery = function(image_modal_src) {
                            if ($scope.main_gallery.indexOf(image_modal_src) == -1) {
                                $scope.main_gallery.push(image_modal_src);
                                toaster.pop('success', "Well Done", "The Image Has Been Saved");
                                $timeout(function() {
                                    $scope.current_h_main_gallery_index = $scope.h_main_gallery.length - 1;
                                });
                            }
                            return;
                        };




                        // Hand Writing
                        $ionicModal.fromTemplateUrl('handwriting-modal.html', function(modal) {
                            $scope.startWriting.modal = modal;
                        }, {
                            scope: $scope,
                            animation: 'slide-in-up'
                        });
                        $scope.startWriting = function() {
                            // $scope.startWriting.modal.show();
                            $scope.writing = true;
                        };
                        $scope.stopWriting = function() {
                            // $scope.startWriting.modal.hide();
                            $scope.writing = false;
                        };

                        function receiveMessage(e) {
                            console.log(e.data);
                            if (e.data == "please close me!!$$**") {
                                $scope.stopWriting();
                            } else {
                                $scope.lexicon_input = e.data;
                            }
                            $apply($scope);
                        }
                        $window.addEventListener('message', receiveMessage);





                        $scope.showQrCode = function(sel) {
                            var opacity = $(sel).css("opacity");
                            if (opacity == "1") {
                                $(sel).css("opacity", 0);
                            } else {
                                $(sel).css("opacity", 1);
                            }
                        };


                        // Theme
                        var themes = ['dark-blue'];

                        $scope.themes = {};
                        $scope.resetTheme = function (){
                            themes.forEach(function(x){
                                $scope.themes[x] = false;
                            });
                        };
                        $scope.themes_cursor = 0;
                        $scope.toggleTheme = function() {
                            var len = themes.length;
                            $scope.themes_cursor = ($scope.themes_cursor + 1) % len;
                            $scope.setTheme($scope.themes_cursor);
                        };
                        $scope.setTheme = function(idx){
                            idx = idx || 0;
                            $scope.resetTheme();
                            $scope.themes[themes[$scope.themes_cursor]] = true;
                        };
                        $scope.setTheme(0);

                        // END
                        message.startUp();
                    });
                });
            });

    } else {

        app.controller('AppCtrl', function($scope) {});
    }
    // should give up browser webkit recognition
    // use google speech api module (node-speakable) is a way to go
}());

if(Util.isDefined('main')){
    main();
} else{
    alert('Main Function is not Defined!');
}
