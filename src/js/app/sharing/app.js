angular.module('app')
    .controller('sharingAppCtrl', ['$scope', 'ip', 'devices', function($scope, ip, devices) {
        $scope.uploadAddr = ip;
        var storage = $scope.app.storage;
        devices.emit('setFileList', storage.file_list);
        $scope.deleteFileByIndex = function(index) {
            storage.file_list.splice(index, 1);
            devices.emit('removeFile', index);
        };
    }]);
