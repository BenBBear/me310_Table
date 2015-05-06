(function() {
    var os = require('os');
    var wirelessName = ['en1', 'en4', 'wlan0', 'en0'];
    var getWifiIp = function() {
        var ifaces = os.networkInterfaces(),
            ip = undefined;
        wirelessName.forEach(function(name) {
            var wl = ifaces[name];
            if (wl) {
                wl.forEach(function(val) {
                    if (val.family == 'IPv4') {
                        ip = ip || val.address;
                    }
                });
            }
        });
        return ip;
    };
    Object.defineProperty(Util, "wifi_ip", {
        get: getWifiIp
    });
}());
