(function(){
    var chokidar = require('chokidar');
    var noop = function(){};
    function DirWatcher(path,cb){
        this.path = path;
        this.addCb = cb;
    }

    DirWatcher.prototype = function(){
        return {
            start:function(){
                this.watcher = chokidar.watch(this.path,{
                    ignored: /[\/\\]\./
                }).on('add', this.addCb);
                return this;
            },
            stop:function(){
                this.watcher && this.watcher.close();
                return;
            }
        };
    }();


    Class.DirWatcher = DirWatcher;
}());
