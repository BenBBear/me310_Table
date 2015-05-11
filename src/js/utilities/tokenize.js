(function(){
    var natural = require('natural');
    Util.tokenizeAndStem = function(str){
        return natural.PorterStemmer.tokenizeAndStem(str);
    };
}());
