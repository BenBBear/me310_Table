(function() {
    //**********//
    var google_images = Util.require('google-images');
    Util.googleImageSearch = function(x, cb) {
        google_images.search(x, function(err, images) {
            if (err)
                cb(err);
            else {
                cb(err, x, images);
            }
        });
    };

}());
