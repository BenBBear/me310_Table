angular.module('app')


.directive('sketchBoard', function() {
    return {
        restrict: 'EA',
        scope: {
            option: '='
        },
        link: function($scope, $element, attrs) {
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
                touchmove: function() {

                    switch (opt.tool) {
                        case "eraser":
                            for (var i = this.touches.length - 1, touch; i >= 0; i--) {
                                touch = this.touches[i];
                                this.lineCap = 'round';
                                this.lineJoin = 'round';
                                this.fillStyle = this.strokeStyle = "#FFFFFF";
                                this.lineWidth = opt.radius * 2;
                                this.beginPath();
                                this.moveTo(touch.ox, touch.oy);
                                this.lineTo(touch.x, touch.y);
                                this.stroke();
                            }
                            break;
                        case "pen":
                        default:
                            {
                                for (var i = this.touches.length - 1, touch; i >= 0; i--) {
                                    touch = this.touches[i];
                                    this.lineCap = 'round';
                                    this.lineJoin = 'round';
                                    this.fillStyle = this.strokeStyle = opt.colors[i % opt.colors.length];
                                    this.lineWidth = opt.radius;
                                    this.beginPath();
                                    this.moveTo(touch.ox, touch.oy);
                                    this.lineTo(touch.x, touch.y);
                                    this.stroke();
                                }
                                break;
                            }
                    }
                }
            });
        }
    };
});