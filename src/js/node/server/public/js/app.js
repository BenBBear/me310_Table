var app = angular.module('chole', ['ui.router', 'angularFileUpload']);


app.controller('AppCtrl', function($scope) {});



app.controller('uploadCtrl', function($scope, FileUploader) {
    var uploader = $scope.uploader = new FileUploader({
        url: '/upload',
        autoUpload: true
    });

});