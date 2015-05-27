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


    var recordFreq = function(hash, arr) {
        arr.forEach(function(x) {
            hash[x] = hash[x] || 0;
            hash[x]++;
        });
    };

    var sortObjectByValue = function(obj) {

        var sortable = [];
        for (var vehicle in obj)
            sortable.push([vehicle, obj[vehicle]]);
        sortable.sort(function(a, b) {
            return b[1] - a[1];
        });
        debugger;
        return sortable;
    };


    // new version
    var cheerio = require('cheerio');
    var excerptHtml = require('excerpt-html');
    Util.getRelatedWord = function(word, cb) {
        // cb(null, origin_value, resultList);
        var origin_value = word;
        google(word, function(err, next, links) {
            if (origin_value == Util.latest_search_input || !Util.latest_search_input) {
                if (err)
                    cb(err);
                else {
                    var freq_hash_map = {};

                    links.forEach(function(l) {
                        recordFreq(freq_hash_map, l.title.removeStopWordsAndGetArray());
                        recordFreq(freq_hash_map, l.description.removeStopWordsAndGetArray());
                    });
                    var num = 10,
                        resultList;
                    resultList = sortObjectByValue(freq_hash_map).slice(0,10).map(function(x){
                        return x[0];
                    });

                    cb(null, origin_value, resultList);
                    // Util.MultiRequest(links.map(function(x) {
                    //     return x.href;
                    // }).filter(function(x) {
                    //     return x;
                    // }), function(err, res) {
                    //     if (err) {
                    //         throw err;
                    //     } else {
                    //         if (origin_value == Util.latest_search_input || !Util.latest_search_input) {
                    //             res.forEach(function(r) {
                    //                 var body = r[1];
                    //                 debugger;
                    //                 excerptHtml(body);
                    //                 var $ = cheerio.load(body);

                    //             });

                    //         } else {
                    //             console.log('hit');
                    //         }
                    //     }
                    // });
                    //use title, description
                }
            } else {
                console.log('hit');
            }
        });

    };


}());
