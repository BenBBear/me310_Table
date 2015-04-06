angular.module('app')
    .config(['$stateProvider', '$urlRouterProvider', 'JQ_CONFIG', function($stateProvider, $urlRouterProvider, JQ_CONFIG) {

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
                    deps: ['$ocLazyLoad', 'uiLoad',
                        function($ocLazyLoad, uiLoad) {
                            return uiLoad.load(JQ_CONFIG.qrcode)
                                .then(
                                    function() {
                                        return $ocLazyLoad.load(['ja.qr', 'js/app/sharing/app.js']);
                                    }
                                );
                        }
                    ]
                }
            })

        .state('app.default', {
            url: '/default',
            templateUrl: 'tpl/default.html'
        });

    }]);


// return $ocLazyLoad.load(['js/app/sharing/app.js']);