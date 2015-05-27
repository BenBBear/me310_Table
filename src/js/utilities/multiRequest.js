(function(){
        var request = require('request');
    var thunks = require('thunks')();

    var semanticLink = 'http://semantic-link.com/related.php?word=';

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
