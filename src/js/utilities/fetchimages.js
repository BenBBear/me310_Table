(function() {
    var path = require('path');
    var randomstring = require('randomstring');

    var ensurePath = function(img, cb) {
        if (path.dirname(img) != '.')
            cb(img);
        else if (img.startsWith('data:image')) {
            var base64Data = img.replace(/^data:image\/png;base64,/, "");
            var randomPath = "/tmp/" + randomstring.generate() + ".png";
            require("fs").writeFile(randomPath, base64Data, 'base64', function(err) {
                cb(randomPath);
            });
        } else if(img.startsWith('http')) {
            Util.download(img, cb);
        } else{
            throw new Error('unrecognized image type');
        }
    };

    Util.fetchImages = function(img1, img2, cb) {
        ensurePath(img1, function(p1) {
            ensurePath(img2, function(p2) {
                cb(p1, p2);
            });
        });
    };
}());
