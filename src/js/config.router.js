angular.module('app')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

        $urlRouterProvider
            .otherwise('/app/default');

        $stateProvider
            .state('app', {
                abstract: true,
                url: '/app',
                templateUrl: 'tpl/app.html'
            })
            .state('app.sharing', {
                url: '/sharing',
                templateUrl: 'tpl/sharing.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function($ocLazyLoad) {
                            return $ocLazyLoad.load(['js/app/sharing/app.js']);
                        }
                    ]
                }
            })

        .state('app.default', {
            url: '/default',
            templateUrl: 'tpl/default.html'
        });

    }]);