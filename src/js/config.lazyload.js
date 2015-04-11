angular.module('app')
    .constant('MODULE_CONFIG', {})
    .constant('JQ_CONFIG', {
        qrcode: ['./bower_components/qrcode/lib/qrcode.min.js'],
        sketchjs: ['./bower_components/sketch.js/js/sketch.min.js']
    })
    .config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
        $ocLazyLoadProvider.config({
            debug: true,
            events: true,
            modules: [{
                name: 'ja.qr',
                files: ['./bower_components/angular-qr/angular-qr.min.js']
            }]
        });
    }]);