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
     The True Main
    */
    function __main(path) {

        var gallery = new Class.PhotoGallery({
            path: path,
            //this path should be selectable from startup of the program, currently just name it here
            ready:function(instance){
                // console.log(gallery.upload_addr);
            }
        });



        Functions.Debug.delPicture = function() {
            gallery.removeCurrent();
        };
    }
}
