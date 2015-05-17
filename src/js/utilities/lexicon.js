(function() {
    //**********//
    Util.onLexiconInput = function(query, cb) {
        $(query).on('input propertychange paste',function() {
            cb(this.value);
        });
    };

    Util.addLexiconResult = function(query, opt){
        var parent = $(query + "> #lexicon_images");
        parent.empty();
        $('<div class="clearfix" ></div>')
            .prependTo(parent);
        opt = opt || {};
        opt.images.forEach(function(img){
            $('<img/>',{
                src:img.url,
                class:'lexicon-result'
            }).click(opt.onclick || function(){}).prependTo(parent);
        });
    };

    Util.addLexiconResultForRelatedWord = function(query,opt){
        var parent = $(query + "> #lexicon_words");
        parent.empty();
        $('<div class="clearfix" ></div>')
            .prependTo(parent);
        opt = opt || {};
        opt.words.reverse().forEach(function(word){
            $('<span/>').addClass('lexicon-result-word').html(word).click(opt.onclick).prependTo(parent);
        });
    };


}());
