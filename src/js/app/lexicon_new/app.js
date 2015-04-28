(function() {
    var fs = require('fs');

    angular.module('app').controller('lexicon_newAppCtrl', function($scope, google_image) {
        $scope.debug = function() {
            debugger;
        };
        $scope.log = "";

        function log() {
            for (var i = 0; i < arguments.length; i++)
                $scope.log += arguments[i];
        }
        $scope.err = undefined;

        function errCheck(err) {
            if (err) {
                $scope.err = err;
                return false;
            } else {
                return true;
            }
        }
        $scope.settings = {
            imgStyle: {
                'max-height': '9em',
                'max-width': '16em'
            }
        };
        $scope.images_result = [];

        $scope.$watch('lc_text', function(newVal, oldVal) {
            if (newVal) {
                google_image.search(newVal, function(err, images) {
                    if (errCheck(err)) {
                        $scope.images_result = images;
                    }
                });
            }
        });



        $scope.my_recorder_option = {
            realTime: true
        };
        $scope.lc_audio = undefined;
        $scope.$watch('lc_audio', function() {
            if ($scope.lc_audio) {
                var arrayBuffer;
                var fileReader = new FileReader();
                fileReader.onload = function(evt) {
                    debugger;
                    arrayBuffer = evt.target.result;
                    debugger;
                    var buffer = new Buffer(new Uint8Array(arrayBuffer));
                    fs.writeFile("/Users/xyzhang/Documents/WorkSpace/newTable/listen.wav", buffer, function(err) {
                        if (err) {
                            console.log(err);
                        }
                        console.log("The file was saved!");
                    });
                };
                fileReader.readAsArrayBuffer($scope.lc_audio);
            }
        });

        // debugger;
        $scope.lang = "en-US";
        $scope.final = "";
        $scope.inter = "";


    });
}());
