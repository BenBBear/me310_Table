(function() {
    //**********//
    Util.onLexiconInput = function(query, cb) {
        $(query).on('input propertychange paste',function() {
            cb(this.value);
        });
    };


    Util.addLexiconResultToGallery = function(){};

    Util.addLexiconResult = function(query, opt){
        var parent = $(query);
        parent.empty();
        $('<div class="clearfix" ></div>')
            .prependTo(parent);
        opt = opt || {};
        opt.images.forEach(function(img){
            $('<img/>',{
                src:img.url,
                class:'lexicon-result',
                onclick: opt.onclick || function(){}
            }).prependTo(parent);
        });

    };

}());
