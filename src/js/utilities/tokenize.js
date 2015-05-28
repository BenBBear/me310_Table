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
