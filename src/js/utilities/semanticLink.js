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

    var sortObjectByValue = function(obj) {
        var sortable = [];
        for (var vehicle in obj)
            sortable.push([vehicle, obj[vehicle]]);
        sortable.sort(function(a, b) {
            return b[1] - a[1];
        });
        return sortable;
    };

    var getTopStems = function(obj,num){
        var sortable = [];
        for (var v in obj)
            sortable.push([v, obj[v].count]);
        sortable.sort(function(a, b) {
            return b[1] - a[1];
        });
        return sortable.slice(0,num).map(function(x){
            return x[0];
        });
    };


    // new version
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
                        recordFreq(freq_hash_map, l.title || "");
                        recordFreq(freq_hash_map, l.description || "");
                    });
                    var num = 10,
                        resultList = [];
                    var top_stems = getTopStems(freq_hash_map, 10);

                    top_stems.forEach(function(word){
                        var word_obj  = freq_hash_map[word].words;
                        var max;
                        Object.keys(word_obj).forEach(function(key){
                            max = (word_obj[key] > (word_obj[max] || 0)) ? key : max;
                        });
                        resultList.push(max);
                    });
                    cb(null, origin_value, resultList);
                }
            } else {
                console.log('hit');
            }
        });

    };


}());
