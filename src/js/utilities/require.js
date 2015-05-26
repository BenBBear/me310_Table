(function(){
    var prefix = './js/node_modules/';
    Util.require = function(x){
        try{
            return require(prefix+x);
        }catch(e){
            return require(x);
        }
    };
}());
