(function() {
    var gm = require('gm');
    var path = require('path');
    var randomstring = require("randomstring");

    Util.showSketchBoard = function(x) {
        x = x || '.sketching';
        $(x).show();
        return Util;
    };

    Util.hideSketchBoard = function(x) {
        x = x || '.sketching';
        $(x).hide();
        return Util;
    };

    Util.hideSketchBoardAndSave = function(sel_sketch, gallery) {
        sel_sketch = sel_sketch || '.sketching';
        gallery = gallery || Globals.gallery;
        var filepath = gallery.option.path;


        if ($(sel_sketch).is(":visible")) {
            var canvas = $(sel_sketch).find('canvas')[0];
            var DataUri = canvas.toDataURL();
            var current = gallery.current;
            gallery.push({
                image: DataUri,
                big: DataUri,
                thumb: DataUri,
                title: 'Note For ' + current.title,
                description: 'Note For ' + current.description
            }).last();


            // Util.fetchImages(current.image, DataUri, function(background, note) {
            //     gm(background)
            //         // .resize(gallery.width,gallery.height)
            //         .composite(note)
            //         .write(path.join(filepath, 'Note_' + randomstring.generate(7) + '.png'), function(err) {
            //             if (err)
            //                 throw err;
            //         });
            // });


        }
        return Util.hideSketchBoard(sel_sketch);
    };


}());
