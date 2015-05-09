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
        init(function() {
            Util.onLexiconInput('.search-input', function(value) {
                Util.googleImageSearch(value, function(err, images) {
                    Util.addLexiconResult('.search-content-next', {
                        images: images,
                        // onclick: "Util.downloadAndSave(this.src, Globals.PATH)"
                        onclick: "Globals.gallery.push(this.src)"
                    });
                });
            });
            Util.hideSearchBar();
        }, 'lexicon');


        // init for sketching
        init(function() {
            var defaultBoard = new Library.DrawingBoard.Board('sketching',{
                background:'rgba(255,255,255,0.3)'
            });
            Util.hideSketchBoard();
        }, 'sketching');




    }
}
