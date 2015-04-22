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
            .state('app.sketch', {
                url: '/sketch',
                templateUrl: 'tpl/sketch.html',
                resolve: {
                    deps: ['$ocLazyLoad', 'uiLoad',
                        function($ocLazyLoad, uiLoad) {
                            return uiLoad.load(JQ_CONFIG.sketchjs)
                                .then(
                                    function() {
                                        return $ocLazyLoad.load(['js/directives/ui-sketchboard.js', 'js/app/sketch/app.js']);
                                    }
                                );
                        }
                    ]
                }
            })
            .state('app.sharing-pasteasy', {
                url: '/sketch',
                templateUrl: 'tpl/sharing-pasteasy.html',
                resolve: {
                    deps: ['$ocLazyLoad', 'uiLoad',
                        function($ocLazyLoad, uiLoad) {
                            return uiLoad.load(JQ_CONFIG.sketchjs)
                                .then(
                                    function() {
                                        return $ocLazyLoad.load([ 'js/app/sharing-pasteasy/app.js']);
                                    }
                                );
                        }
                    ]
                }
            })
            .state('app.lexicon', {
                url:'/lexicon',
                templateUrl:'tpl/lexicon.html',
                resolve:{
                    deps:['$ozLazyLoad', function($ozLazyLoad){
                        return $ozLazyLoad.load(['js/app/lexicon/app.js']);
                    }]
                }
            })
        .state('app.default', {
            url: '/default',
            templateUrl: 'tpl/default.html'
        });

    }]);


// return $ocLazyLoad.load(['js/app/sharing/app.js']);
