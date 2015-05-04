(function(){
    var prefix = './js/node_modules/';
    Util.require = function(x){
        return require(prefix+x);
    };
}());
