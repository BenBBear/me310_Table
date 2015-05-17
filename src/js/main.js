/**
TODO in main:

- Set up Jssor Slider (combined with css tweaks and some html)
- Initialize (for PhotoGallery etc...)
- Hand code Interaction Logic  (combined with css to beautify the web page)
 */





function main() {

    $("#storage_dir_chooser").trigger('click');
    $("#storage_dir_chooser").change(function(event) {
        __main(this.files[0].path);
    });

    /**
     Configuration
     */
    Class.DirWatcher.prototype.WAIT_TIME = 0;



    /**
     The True Main
    */
    function __main(path) {

        var init = function(f) {
            if (f) {
                init.queue.push(f);
            } else {
                init.queue.forEach(function(ifun) {
                    ifun();
                });
            }
            return init;
        };
        init.queue = [];



        var gallery = new Class.PhotoGallery({
            path: path,
            ready: function(instance) {
                init();
            }
        });



        Globals.PATH = path;
        Globals.gallery = gallery;
        Globals.init = init;


        // init for qrcode
        init(function() {
            Util.qrcodeToHref('#qrcode-uploading', gallery.upload_addr)
                .popUp('#qrcode-uploading', {
                    type: 'image'
                });
        }, 'qrcode');


        // init for lexicon
        var latest_search_input = "";
        init(function() {
            Util.onLexiconInput('.search-input', function(value) {

                latest_search_input = value;
                // the lexicon image searching part
                Util.googleImageSearch(value, function(err, origin_value, images) {
                    if (origin_value == latest_search_input) {
                        Util.addLexiconResult('.search-content-next', {
                            images: images,
                            onclick: function(){
                                gallery.push(this.src);
                            }
                        });
                    }
                });

                // the lexicon related words finding part
                Util.getRelatedWord(Util.tokenizeAndStem(value), function(err, origin_value, resultList) {
                    if (err)
                        throw err;
                    else {
                        if (origin_value == latest_search_input) {
                            var result_to_display = [];
                            resultList.forEach(function(r) {
                                result_to_display = result_to_display.concat(r.slice(0, 10));
                            });
                            Util.addLexiconResultForRelatedWord('.search-content-next', {
                                words: result_to_display,
                                onclick: function() {
                                    $('.search-input').val(this.innerHTML)
                                        .trigger('input');
                                }
                            });
                        }
                    }
                });

            });
            Util.hideSearchBar();
        }, 'lexicon');


        // init for sketching
        init(function() {
            var defaultBoard = new Library.DrawingBoard.Board('sketching', {
                background: 'rgba(255,255,255,0.3)'
            });
            Util.hideSketchBoard();
        }, 'sketching');




    }
}
