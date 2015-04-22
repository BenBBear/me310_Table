angular.module('app')
    .controller('AppCtrl', ['$scope', '$localStorage', 'ip', 'devices', function($scope, $localStorage, ip, devices) {
        $scope.app = {
            name: "chole",
            version: "0.0.1",
            setting: {},
            memory:{},
            storage: $localStorage
        };
        var storage = $scope.app.storage;
        storage.file_list = storage.file_list || [];
        if (devices._events.file !== undefined) {
            delete devices._events.file;
        }
        devices.on('file', function(file) {
            storage.file_list.push(file);
            $scope.$apply();

        });
        //


        $scope.memory.appList = [{
            name: "默认页",
            state: "app.default"
        }, {
            name: "文件共享",
            state: "app.sharing"
        }, {
            name: '画笔',
            state: 'app.sketch'
        },{
            name: 'sharing with pasteasy',
            state: 'app.sharing-pasteasy'
        }, {
            name:'lexicon',
            state:'app.lexicon'
        }];


    }]);
