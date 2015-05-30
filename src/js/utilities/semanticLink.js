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
