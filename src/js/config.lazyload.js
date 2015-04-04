angular.module('app')
    .constant('MODULE_CONFIG', {})
    .constant('JQ_CONFIG', {})
    .config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
        $ocLazyLoadProvider.config({
            debug: true,
            events: true,
            modules: []
        });
    }]);