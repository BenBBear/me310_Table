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
        devices.on('file', function(file) {
            storage.fileList = storage.fileList || [];
            storage.fileList.push(file);
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