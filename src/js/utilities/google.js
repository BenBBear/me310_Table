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
