var chokidar = require('chokidar'),
    setUpFileInput = function() {
        $("#inputFile").hide();
        $('#triggerFile').on('click', function(e) {
            e.preventDefault();
            $("#inputFile").trigger('click');
        });
    };






angular.module('app')
    .controller('sharing_pasteasyCtrl', ['$scope', 'ip', function($scope, ip) {
        setUpFileInput();
        $scope.images_in_dir = [];
        $scope.watcher = undefined;

        $scope.$watch('choosed_dir', function() {

            if ($scope.choosed_dir) {
                var dir_path = $scope.choosed_dir[0].path;
                if ($scope.watcher) {
                    $scope.watcher.close();
                }

                $scope.watcher = chokidar.watch(dir_path, {
                    ignored: /[\/\\]\./
                }).on('all', function(event, path) {
                    if (event == 'add') {
                        $scope.images_in_dir.push({
                            src: path
                        });
                        $scope.$apply();
                    }
                });
            }
        });
        $scope.deleteFile = function(idx) {
            this.images_in_dir.splice(idx, 1);
        };

    }]);
