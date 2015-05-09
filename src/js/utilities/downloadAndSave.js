(function(){
    var http = require('http');
    var https = require('https');
    var fs = require('fs');
    var path = require('path');

    Util.downloadAndSave = function(src,pathToSave){
        var file = fs.createWriteStream(path.join(pathToSave, path.basename(src)));
        var request = src.startsWith('https') ? https : http;
        var req = request.get(src, function(res) {
            res.pipe(file);
            file.on('finish', function() {
                file.close();
            });
        });
    };
}());
