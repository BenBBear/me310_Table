/**
TODO in main:

- Set up Jssor Slider (combined with css tweaks and some html)
- Initialize (for PhotoGallery etc...)
- Hand code Interaction Logic  (combined with css to beautify the web page)
 */

function main() {

    var bear = {
        image: './assets/images/bear.jpg',
        thumb: './assets/images/bear.jpg',
        big: './assets/images/bear.jpg',
        title: 'my first image',
        description: 'Lorem ipsum caption'
    };
    var data = [bear, bear];
    var gallery = new Class.PhotoGallery({
        dataSource: data
    });


    Functions.Debug.addBear = function() {

        gallery.push(bear);
    };

    Functions.Debug.delBear = function() {
        gallery.removeCurrent();
    };


}
