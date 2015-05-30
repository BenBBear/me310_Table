var request = require('request');
var thunks = require('thunks')();


var thunk_request = thunks.thunkify(request);


var MultiRequest = function(links, cb) {
    var reqList = [];
    links.forEach(function(link) {
        reqList.push(thunk_request(link));
    });
    thunks.all(reqList)(function(err, res) {
        if (err) {
            cb(err);
        } else {
            cb(null, res);
        }
    });
};



var prefix = 'https://www.googleapis.com/customsearch/v1?key=AIzaSyBBlv0xsX5PS9-fW5z1Aab8FxzgCAXKWgs&cx=006496385873236739195:hu_sr_4w_hc&fields=kind,items(title,snippet,pagemap(cse_image))&q=';
function google(word, cb){
    var links = [];
    word = word || 'bear';
    cb = cb || function(){};
    for(var i = 0;i<3;i++){
        var l = prefix + word + '&num=10&start=' + (i*10+1);
        links.push(l);
    }
    MultiRequest(links, function(err,res){
        var result_images = [],
            result_words = [];
        res.forEach(function(r){
            var ta = JSON.parse(r[1]).items;
            ta.forEach(function(k,i){
                ta[i].description = ta[i].snippet;
                ta[i].pagemap && result_images.push(ta[i].pagemap.cse_image[0].src);
                delete ta[i].snippet;
                delete ta[i].pagemap;
            });
            result_words = result_words.concat(ta);
        });
        debugger;
    });
}

google();
