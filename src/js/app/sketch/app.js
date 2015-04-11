angular.module('app')
    .controller('sketchAppCtrl', ['$scope', '$element', function($scope, $element) {
        // sketching in here
        var COLOURS = ['#E3EB64', '#A7EBCA', '#FFFFFF', '#D8EBA7', '#868E80'],
            radius = 2,
            //should change to conf obj that pass in ($watch this object inside link function)

            elm = $($element),
            mWidth = window.innerWidth,
            mHeight = window.innerHeight,
            paddingX = 30,
            paddingY = 30,
            $container = elm.find('#sketch-container'),
            container = $container[0],
            mode = "writing"; //or scrolling



        $container
            .width(mWidth)
            .height(mHeight);

        var canvas = Sketch.create({
            fullscreen: false,
            width: mWidth,
            height: mHeight,
            container: container,
            autoclear: false,
            setup: function() {
                console.log('setup');
            },
            // Event handlers
            keydown: function() {
                if (this.keys.C) this.clear();
            },

            // Mouse & touch events are merged, so handling touch events by default
            // and powering sketches using the touches array is recommended for easy
            // scalability. If you only need to handle the mouse / desktop browsers,
            // use the 0th touch element and you get wider device support for free.
            touchmove: function() {
                for (var i = this.touches.length - 1, touch; i >= 0; i--) {
                    touch = this.touches[i];
                    this.lineCap = 'round';
                    this.lineJoin = 'round';
                    this.fillStyle = this.strokeStyle = COLOURS[i % COLOURS.length];
                    this.lineWidth = radius;
                    this.beginPath();
                    this.moveTo(touch.ox, touch.oy);
                    this.lineTo(touch.x, touch.y);
                    this.stroke();
                }
            }
        });

        var board = elm.find('.sketch');


        // var _adjustWindow = function(wOpt, hOpt) {
        //     if (wOpt) {
        //         board.width(board.width() + paddingX);
        //     }
        //     if (hOpt) {
        //         board.height(board.height() + paddingY);
        //     }
        // };
        // var adjWidth = function(x) {
        //     _adjustWindow(true);
        // };
        // var adjHeight = function(x) {
        //     _adjustWindow(false, true);
        // };

        // board.on($.getMoveEvent(), function(e) {
        //     if (e.pageX && e.pageY) {
        //         if (Math.min(e.pageX, mWidth - e.pageX) < paddingX) {
        //             adjWidth(e.pageX);
        //         }
        //         if (Math.min(e.pageY, mHeight - e.pageY) < paddingY) {
        //             adjHeight(e.pageY);
        //         }
        //     }
        // });


    }]);