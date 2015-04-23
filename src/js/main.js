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


        $scope.app.memory.appList = [{
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



Array.prototype.unique = function(){
    return this.reverse().filter(function (e, i, arr) {
        return arr.indexOf(e, i+1) === -1;
    }).reverse();
};



var unique = function(array){
    return array.reverse().filter(function (e, i, arr) {
        return arr.indexOf(e, i+1) === -1;
    }).reverse();
};
