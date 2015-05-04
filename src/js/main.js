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
        description: 'Lorem ipsum caption',
        link: 'http://domain.com'
    };
    var data = [bear, bear];

    $('.galleria').css('height', 400);

    Library.Galleria
        .loadTheme('./lib/other/galleria/themes/classic/galleria.classic.min.js')
        .loadTheme('./lib/other/galleria/themes/azur/galleria.azur.min.js');

    // Library.Galleria.run('.galleria', {
    //     dataSource: data
    // });

    Galleria.run('.galleria', {
        theme: 'azur',
        dataSource: data
    });



    var gg;
    Functions.Debug.addBear = function() {
        debugger;
        gg.push(bear);
    };

    Functions.Debug.delBear = function() {
        debugger;
        var idx = gg.getIndex();
        gg.splice(idx, 1);
    };

    Galleria.ready(function() {
        // $('.galleria').data('galleria').enterFullscreen(); it works
        gg = $('.galleria').data('galleria');
    });

}
