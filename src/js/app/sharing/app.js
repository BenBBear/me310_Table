angular.module('app')
    .controller('sharingAppCtrl', ['$scope', 'ip', 'devices', function($scope, ip, devices) {
        debugger;
        $scope.uploadAddr = ip;
        var storage = $scope.app.storage;
        devices.emit('setFileList', storage.fileList);
        $scope.deleteFileByIndex = function(index) {
            storage.fileList.splice(index);
            devices.emit('removeFile', index);
        };
    }]);