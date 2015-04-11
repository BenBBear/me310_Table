angular.module('app')
    .controller('sketchAppCtrl', ['$scope', function($scope) {
        $scope.option = {
            tool: 'pen',
            radius: 3,
            colors: ['#000000', '#A7EBCA', '#FFFFFF', '#D8EBA7', '#868E80']
        };
        $scope.eraser = function() {
            this.option.tool = 'eraser';
            return this;
        };
        $scope.pen = function() {
            this.option.tool = 'pen';
            return this;
        };

    }]);