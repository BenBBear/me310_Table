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
        });
    };

}());
