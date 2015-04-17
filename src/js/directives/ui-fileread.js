angular.module('app').directive("fileread", [function() {
    return {
        scope: {
            fileread: "="
        },
        link: function(scope, element, attributes) {
            element.bind("change", function(changeEvent) {
                scope.$apply(function() {
                    scope.fileread = [];
                    for(var i = 0;i<changeEvent.target.files.length;i++){
                        scope.fileread.push(changeEvent.target.files[i]);
                    }
                });
            });
        }
    };
}]);
