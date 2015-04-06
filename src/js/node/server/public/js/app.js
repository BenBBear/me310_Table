var app = angular.module('chole', ['ui.router', 'angularFileUpload', 'ngStorage', 'btford.socket-io'])

.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider
        .otherwise('/upload-page');

    $stateProvider
        .state('upload', {
            url: '/upload-page',
            templateUrl: 'tpl/upload.html'
        })
        .state('download', {
            url: '/download-page',
            templateUrl: 'tpl/download.html'
        });

});


app.
factory('socket', function(socketFactory) {
    var myIoSocket = io.connect(),
        mySocket = socketFactory({
            ioSocket: myIoSocket
        });
    return mySocket;
});

app.controller('AppCtrl', function($scope, $localStorage) {


    $scope.app = {
        name: "Table_Internal_Server",
        version: "0.0.0",
        setting: {},
        storage: $localStorage
    };
});



app.controller('uploadCtrl', function($scope, FileUploader) {
    var uploader = $scope.uploader = new FileUploader({
        url: '/upload',
        autoUpload: true
    });
});

app.controller('downloadCtrl', function($scope, socket) {
    var storage = $scope.app.storage;
    socket.emit('req:fileList');
    socket.on('res:fileList', function(x) {
        storage.fileList = x;
    });

    socket.on('cmd:removeFile', function(index) {
        storage.fileList.splice(index);
    });
    socket.on('cmd:setFileList', function(x) {
        storage.fileList = x;
    });
    socket.on('cmd:addFile', function(e) {
        storage.fileList.push(e);
    });
});