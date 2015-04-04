var appPath = process.cwd(),
    _require = function(path) {
        return require(appPath + '/src/js' + path.slice(1));
    };




var util = _require('./node/util/util.js'),
    server = _require('./node/server/');



angular.module('app')
    .value('fs', require('fs'))
    .value('util', util)
    .value('ip', util.getWlanIp())
    .value('InternalServerPort', server.port)
    .value('devices', server.interface);