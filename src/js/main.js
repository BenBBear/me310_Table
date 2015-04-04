angular.module('app')
    .controller('AppCtrl', ['$scope', '$localStorage', function($scope, $localStorage) {
        $scope.app = {
            name: "chole",
            version: "0.0.1",
            setting: {},
            storage: $localStorage
        };
    }]);