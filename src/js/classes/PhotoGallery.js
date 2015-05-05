(function(){

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

    var PhotoGallery = function(opt){
        // TODO
        this.option = $.extend({}, opt);
        this.option.ready =  this.option.ready || function(){};
        this.option.event  = this.option.event || {};

        var theme = this.option.theme = this.option.theme || 'azur';
        var theme_path = theme_path_a + theme + theme_path_b + theme + theme_path_c;
        this.element = this.element || '.galleria';
        this.Galleria.loadTheme(theme_path);
        this.Galleria.run(this.element, this.option);
        var me = this;
        me.Galleria.ready(function(){
            me.galleria_instance = this;
            for(var k in me.option.event){
                this.bind(k, me.option.event[k]);
            }
            me.option.ready();
        });

    };

    PhotoGallery.prototype = function(){
        return {
            Galleria: Library.Galleria,
            push:function(x){
                var me = this;
                if(me.galleria_instance){
                    me.galleria_instance.push(x);
                }else{
                    setTimeout(function(){
                        me.push(x);
                    }, retry_period);
                }
                return me;
            },
            removeCurrent:function(){
                var me = this;
                if(me.galleria_instance){
                    var idx = me.galleria_instance.getIndex();
                    me.galleria_instance.splice(idx,1);
                }else{
                    setTimeout(function(){
                        me.removeCurrent();
                    }, retry_period);
                }
                return me;
            }

        };
    }();



    Class.PhotoGallery = PhotoGallery;
}());
