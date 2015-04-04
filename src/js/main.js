angular.module('app')
    .controller('AppCtrl', ['$scope', '$localStorage', 'ip', 'devices', function($scope, $localStorage, ip, devices) {
        $scope.app = {
            name: "chole",
            version: "0.0.1",
            setting: {},
            storage: $localStorage
        };
        var storage = $scope.app.storage;
        // debugger
        storage.imgList = [];
        devices.on('file', function(file) {
            storage.imgList = storage.imgList || [];
            storage.imgList.push(file);
            $scope.$apply();
        });

        storage.appList = [{
            name: "默认页",
            state: "app.default"
        }, {
            name: "文件共享",
            state: "app.sharing"
        }];
    }]);