angular.module('app')
    .controller('AppCtrl', ['$scope', '$localStorage', 'ip', 'devices', function($scope, $localStorage, ip, devices) {
        $scope.app = {
            name: "chole",
            version: "0.0.1",
            setting: {},
            storage: $localStorage
        };
        var storage = $scope.app.storage;
        storage.imgList = [];
        devices.on('file', function(file) {
            storage.imgList.push(file);
        });
    }]);