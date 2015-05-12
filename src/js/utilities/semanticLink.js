(function(){
    var request = require('request');
    var thunks = require('thunks')();

    var semanticLink = 'http://semantic-link.com/related.php?word=';


    /**
     @param  {string},{an array of strings} words
     */
    var thunk_request = thunks.thunkify(request);
    function getRelatedWord(words, cb){
        if(!(words instanceof Array)){
            words = [words];
        }

        var reqList = [];
        words.forEach(function(word){
            console.log('Fetching related word for: ' + word);
            reqList.push(thunk_request(semanticLink + word));
        });
        return thunks.all(reqList)(function(err, res){
            console.log('One Fetch Operation Complete');
            var resultList = [];
            if(err)
                cb(err);
            res.forEach(function(r){
                var body = r[1];
                var parsed_body = JSON.parse(body);
                resultList.push(parsed_body.map(function(obj){
                    return obj.v;
                }));
            });
            // console.log(resultList);
            cb(null, resultList);
        });
    }

    Util.getRelatedWord = getRelatedWord;
    // getRelatedWord(['apple', 'bin'], function(err, resultList){
    //     debugger;
    // });

}());
