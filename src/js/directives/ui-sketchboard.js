angular.module('app')


.directive('sketchBoard', function() {
    return {
        restrict: 'EA',
        scope: {
            option: '='
        },
        link: function($scope, $element, attrs) {
            var ERASER_MAG = 4;
            // sketching in here
            var _colors = ['#E3EB64', '#A7EBCA', '#FFFFFF', '#D8EBA7', '#868E80'];
            var option = {
                tool: "pen",
                radius: 2,
                color: _colors
            };

            angular.extend(option, $scope.option || {});
            $scope.$watch(function() {
                return $scope.option;
            }, function() {
                angular.extend(option, $scope.option || {});
            }, true);


            $element.append("<div id='sketch-container'></div>");

            var $container = $($element).find('#sketch-container'),
                container = $container[0],
                opt = option;


            var canvas = Sketch.create({
                fullscreen: true,
                container: container,
                autoclear: false,
                keydown: function() {
                    if (this.keys.C) this.clear();
                },
                touchstart: function() {
                    // debugger;
                    console.log('TOUCHSTART');
                },
                touchend: function() {
                    // debugger;
                    console.log('TOUCHEND');
                },
                touchmove: function() {
                    var me = this;
                    switch (opt.tool) {
                        case "eraser":
                            for (var i = me.touches.length - 1, touch; i >= 0; i--) {
                                touch = me.touches[i];

                                shouldDraw(touch, function() {
                                    me.lineCap = 'round';
                                    me.lineJoin = 'round';
                                    me.fillStyle = me.strokeStyle = "#FFFFFF";
                                    me.lineWidth = opt.radius * ERASER_MAG;
                                    me.beginPath();
                                    me.moveTo(touch.ox, touch.oy);
                                    me.lineTo(touch.x, touch.y);
                                    me.stroke();
                                });
                            }
                            break;
                        case "pen":
                        default:
                            {

                                for (var i = me.touches.length - 1, touch; i >= 0; i--) {
                                    touch = me.touches[i];
                                    // debugger;
                                    // console.log('me => ', me);
                                    // console.log('me.touches[',i,'] =>',touch);

                                    shouldDraw(touch, function() {
                                        me.lineCap = 'round';
                                        me.lineJoin = 'round';
                                        me.fillStyle = me.strokeStyle = opt.colors[i % opt.colors.length];
                                        me.lineWidth = opt.radius;
                                        me.beginPath();
                                        me.moveTo(touch.ox, touch.oy);
                                        me.lineTo(touch.x, touch.y);
                                        me.stroke();
                                    });
                                    // touch => {ox,oy 之前坐标
                                    //           x,y 现在坐标
                                    //           dx,dy ox - x, oy - y}
                                }
                                break;
                            }
                    }
                }
            });
        }
    };
});

//**************************************************************************************************//
var threshold = 10,
    just_start = false;
var square = function(x) {
        return Math.pow(x, 2);
    },
    sqrt = Math.sqrt;

function distance(p1, p2) {
    return sqrt(square((p1.x || p1.ox) - (p2.x || p2.ox)) + square((p1.y || p1.oy) - (p2.y || p2.oy)));
}

function shouldDraw(touch, cb) {
    if (distance({
            x: touch.x,
            y: touch.y
        }, {
            x: touch.ox,
            y: touch.oy
        }) < threshold) {
        cb();
    }
}
