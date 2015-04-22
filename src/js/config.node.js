var appPath = process.cwd(),
    _require = function(path) {
        return require(appPath + '/src/js' + path.slice(1));
    };




var util = _require('./node/util/util.js'),
    server = _require('./node/server/');

var natural = require('natural');
var wn = new natural.wordNet();



angular.module('app')
    .value('fs', require('fs'))
    .value('util', util)
    .value('ip', 'http://' + util.getWlanIp() + ':' + server.port + '/#/upload-page')
    .value('InternalServerPort', server.port)
    .value('devices', server.interface)
    .value('google', require('google'))
    .value('google_images', require('google-images'))
    .value('spellchecker', require('spellchecker'))
    .value('natural', natural)
    .value('wordNet', function(words, cb) {
        if (words instanceof Array) {
            words.forEach(function(x) {
                wn.lookup(x, cb);
            });
        } else {
            wn.lookup(words, cb);
        }
    })
    .value('tokenize', new natural.WordTokenizer());
