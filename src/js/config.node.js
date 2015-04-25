var appPath = process.cwd(),
    _require = function(path) {
        return require(appPath + '/src/js' + path.slice(1));
    };




var util = _require('./node/util/util.js'),
    server = _require('./node/server/');

var natural = require('natural'),
    wn = new natural.WordNet(),
    google = _require('./node/google/google-search.js'),
    google_image = _require('./node/google/google-images.js'),
    spc = _require('./node/spc-nwjs/'),
    tokenizer = new natural.WordTokenizer();

google.tld = 'com.hk';


angular.module('app')
    .value('fs', require('fs'))
    .value('util', util)
    .value('ip', 'http://' + util.getWlanIp() + ':' + server.port + '/#/upload-page')
    .value('devices', server.interface)
    .value('google', google)
    .value('google_image',google_image)
    .value('spellchecker', spc)
    .value('natural', natural)
    .value('wordNet', function(words, cb) {
        if (words.length !== undefined) {
            words.forEach(function(x) {
                wn.lookup(x, cb);
            });
        } else {
            wn.lookup(words, cb);
        }
    })
    .value('tokenizer', tokenizer);
