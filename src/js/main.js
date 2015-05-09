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

        var gallery = new Class.PhotoGallery({
            path: path,
            //this path should be selectable from startup of the program, currently just name it here
            ready: function(instance) {

                Util.qrcodeToHref('#qrcode-uploading', gallery.upload_addr)
                    .popUp('#qrcode-uploading', {
                        type: 'image'
                    });

                Util.onLexiconInput('.search-input', function(value) {
                    Util.googleImageSearch(value, function(err, images) {
                        Util.addLexiconResult('.search-content-next', {
                            images: images,
                            // onclick: "Util.downloadAndSave(this.src, Globals.PATH)"
                            onclick:"Globals.gallery.push(this.src)"
                        });
                    });
                });
                Util.hideSearchBar();
            }
        });

        Globals.PATH = path;
        Globals.gallery = gallery;

        // Functions.Debug.delPicture = function() {
        //     gallery.removeCurrent();
        // };


    }
}
