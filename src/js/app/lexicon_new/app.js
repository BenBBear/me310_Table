angular.module('app').controller('lexicon_newAppCtrl', function($scope, google_image) {
    $scope.debug = function() {
        debugger;
    };

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


    $scope.lc_audio = undefined;

});
