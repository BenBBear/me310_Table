Util.showSearchBar = function(bar, content){
    bar = bar || '.search-bar';
    content = content || '.search-content';
    $(bar).fadeIn(500);
    $(content).fadeIn(500);
    return Util;
};

Util.hideSearchBar = function(bar, content){
    bar = bar || '.search-bar';
    content = content || '.search-content';
    $(bar).fadeOut(500);
    $(content).fadeOut(500);
    return Util;
};
