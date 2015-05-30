(function() {
    var chokidar = require('chokidar');
    var noop = function() {};

    function DirWatcher(path, cb) {
        this.path = path;
        this.addCb = cb;
    }
    var Datauri = require('datauri');
    DirWatcher.prototype = function() {
        return {
            start: function(x) {
                x = x || 0;
                var me = this;
                this.watcher = chokidar.watch(this.path, {
                    ignored: /[\/\\]\./
                }).on('add', function(path,stat) {
                    // read it and turn it into base64 image
                    setTimeout(function() {
                        me.addCb(path,stat);
                    }, x);
                });
                return this;
            },
            stop: function() {
                this.watcher && this.watcher.close();
                return;
            },
            WAIT_TIME:5000
        };
    }();


    Class.DirWatcher = DirWatcher;
}());
