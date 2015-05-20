(function() {

    /**
     What Methods it should have please refer to: https://github.com/BenBBear/me310_Table/wiki/Design-of-Classes

     You could use global variable [ Util Node Constant Class Settings].

     It doesn't matter whether those global variables you may use defined before here or not,

      - since you use those vars inside function definition
      - they will be refered when the main calls all the functions here
      - and certainly that time everything is defined already
     */
    var theme_path_a = './lib/other/galleria/themes/',
        theme_path_b = '/galleria.',
        theme_path_c = '.min.js';

    var retry_period = 300;

    var theBear = {
        image: './assets/images/bear.jpg',
        thumb: './assets/images/bear.jpg',
        big: './assets/images/bear.jpg',
        title: 'Bear',
        description: 'A Lovely Bear'
    };

    var makeImage = function(file_path) {
        var path = require('path');
        return {
            image: file_path,
            thumb: file_path,
            big: file_path,
            title: path.filename(file_path),
            description: path.basename(file_path)
        };
    };

    var makeVideo = function() {
        // TODO
        var msg = 'makeVideo not implemented';
        alert(msg);
        throw new Error(msg);
    };


    var PhotoGallery = function(opt) {
        // TODO
        var me = this;
        this.option = $.extend({}, opt);
        this.option.ready = this.option.ready || function() {};
        this.option.event = this.option.event || {};
        this.option.dataSource = this.option.dataSource || [theBear];

        var theme = this.option.theme = this.option.theme || 'azur';
        var theme_path = theme_path_a + theme + theme_path_b + theme + theme_path_c;
        this.element = this.element || '.galleria';
        this.Galleria.loadTheme(theme_path);
        Object.defineProperty(this, 'width', {
            get: function() {
                return $(this.element).width();
            }
        });
        Object.defineProperty(this, 'height', {
            get: function() {
                return $(this.element).height();
            }
        });

        /**
         Set up Gallery Storage
         */

        // me.galleria_instance
        this.dir_watcher = new Class.DirWatcher(this.option.path, function(path, stat) {
            // add the image/video into the Gallery
            var elm;

            if (path.endsWith('.json'))
                elm = makeVideo(path);
            else if (Util.isImage(path))
                elm = makeImage(path);


            // var arr = me.galleria_instance._data.concat(elm);
            if (elm)
                me.galleria_instance.push(elm);

        });
        this.option.Util = Util;

        this.sharing_server = Util.createSharingServer(this.option);
        this.upload_addr = this.sharing_server.upload_addr;


        console.log(this.option);
        /**
         Begin creating the Gallery
         */

        this.Galleria.run(this.element, this.option);
        me.Galleria.ready(function() {
            me.galleria_instance = this;
            for (var k in me.option.event) {
                this.bind(k, me.option.event[k]);
            }
            me.dir_watcher.start();
            me.sharing_server.start();
            me.option.ready(this);
        });

    };


    /**
     The "Static" Method of PhotoGallery
     */
    PhotoGallery.prototype = function() {
        return {
            Galleria: Library.Galleria,
            get current() {
                return this.galleria_instance.getData();
            },


            last: function() {
                var me = this;
                setTimeout(function() {
                    var len = me.galleria_instance._data.length;
                    me.galleria_instance.show(len - 1);
                }, 1000);
                return me;
            },
            push: function(url) {
                var me = this;
                if (typeof(url) == 'string')
                    me.galleria_instance.push(makeImage(url));
                else
                    me.galleria_instance.push(url);
                return me;
            },
            removeCurrent: function() {
                var me = this;
                if (me.galleria_instance) {
                    var idx = me.galleria_instance.getIndex();
                    var data = me.galleria_instance.getData();
                    me.galleria_instance.splice(idx, 1);
                    me.galleria_instance.next();
                    if (!data.image.startsWith('.')) {
                        // Not Default Image, could delete
                        // Remove the Image from Disk
                        Util.removeFile(data.image);
                    }
                } else {
                    setTimeout(function() {
                        me.removeCurrent();
                    }, retry_period);
                }
                return me;
            }

        };
    }();



    Class.PhotoGallery = PhotoGallery;
}());
