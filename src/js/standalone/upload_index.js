var app = angular.module('app', ['ionic', 'angularFileUpload']);


app.controller('AppCtrl', function($scope, FileUploader, $http) {
    var uploader = $scope.uploader = new FileUploader({
        url: '/upload',
        autoUpload: true
    });

    $scope.upload = function() {
        $('#file-input').trigger('click');
    };


    $scope.files = [];
    $http.get('/ls-storage').then(function(res) {
        if (!res.data.error) {
            $scope.files = res.data.files.map(function(file) {
                return {
                    name: file,
                    src: res.data.prefix + '/' + file
                };
            });
        }
    });
});
