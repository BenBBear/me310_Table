/**
 Configuration
 */
Class.DirWatcher.prototype.WAIT_TIME = 0;


function main() {





    /**
     Need To wrap them as Promises
     - storage_path
     - pasteasy_qrcode
     */

}


(function() {
    var nop = function() {};
    var $apply = function($scope) {
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };




    var app = Globals.app = angular.module('me310_Table', ['ionic',
        'wu.masonry', 'toaster' // , 'angular-images-loaded'
        // 'ngDraggable'
    ]);

    var message = {};
    message.startUp = function() {
        alert('Now the program should start.' +
            '\n\nMore Info of This Program Please See:\n\n https://github.com/BenBBear/me310_Table');
    };



    app.directive('errRemove', function() {
        return {
            scope: {
                source: '='
            },

            controller: function($scope, $element, $attrs) {
                $element.bind('error', function() {
                    $scope.source.remove($attrs.src);
                });
            }
        };
    });
    app.factory('storage_path', function($q) {
        var me = this;
        var deferred = $q.defer();

        (function() {
            if (me.storage_path) {
                deferred.resolve(me.storage_path);
            } else {
                $('#storage_dir_chooser')
                    .change(function(event) {
                        me.storage_path = this.files[0].path;
                        deferred.resolve(me.storage_path);
                    })
                    .trigger('click');
            }
        }());
        return deferred.promise;
    });

    app.factory('pasteasy_qrcode', function($q) {
        var me = this;
        var deferred = $q.defer();

        (function() {
            if (me.pasteasy_qrcode) {
                deferred.resolve(me.pasteasy_qrcode);
            } else {

                $('#pasteasy_qr_chooser')
                    .change(function(event) {
                        me.pasteasy_qrcode = this.files[0].path;
                        deferred.resolve(me.pasteasy_qrcode);
                    })
                    .trigger('click');
            }
        }());
        return deferred.promise;
    });

    var SetUpGallery = function($scope) {
        //**********//
        $scope.lexicon_input = "";
        $scope.setLexiconInput = function(x) {
            $scope.lexicon_input = x;
        };

        $scope.main_gallery = ['assets/images/bear.jpg']; //a array of images
        $scope.h_main_gallery = [];
        $scope.$watch(function() {
            return $scope.main_gallery.length;
        }, function(nv, ov) {
            if (nv) {
                var h_main_gallery = [];
                var len = Math.ceil($scope.main_gallery.length / Constant.GalleryImagesPerPage);
                var i = 1;
                while (i <= len) {
                    var start, end;
                    start = (i - 1) * Constant.GalleryImagesPerPage;
                    end = i * Constant.GalleryImagesPerPage;
                    var tmp = $scope.main_gallery.slice(start, end);
                    h_main_gallery.push(tmp);
                    i++;
                }
                $scope.h_main_gallery = h_main_gallery;
            }
        });


        $scope.main_gallery_cursor = 0;
        $scope.gallery = {
            index: function(x) {
                $scope.main_gallery_cursor = x;
            },
            get current() {
                return $scope.main_gallery[$scope.main_gallery_cursor];
            },
            next: function() {
                if ($scope.main_gallery_cursor < $scope.main_gallery.length - 1)
                    $scope.main_gallery_cursor++;
                else {
                    $scope.main_gallery_cursor = 0;
                }
            },
            prev: function() {
                if ($scope.main_gallery_cursor > 0)
                    $scope.main_gallery_cursor--;
                else {
                    $scope.main_gallery_cursor = $scope.main_gallery.length - 1;
                }
            }
        };


        $scope.lexicon_images = []; //the image search results
        $scope.lexicon_images_cursor = 0;
        $scope.lexicon_words = []; //the relative words search results;
        $scope.lexiconWordsCursorReset = function() {
            $scope.lexicon_words_cursor_start = 0;
        };
        $scope.lexiconWordsCursorMore = function() {
            var len = $scope.lexicon_words.length;
            $scope.lexicon_words_cursor_start = ($scope.lexicon_words_cursor_start + Constant.WordsPerPage) % len;
        };
        $scope.lexiconWordsCursorReset();

        $scope.lexiconImagesSelectReset = function() {
            $scope.lexicon_images_select_start = 0;
        };
        $scope.lexiconImagesSelectMore = function() {
            var len = $scope.lexicon_images.length;
            $scope.lexicon_images_select_start = ($scope.lexicon_images_select_start + Constant.LexiconImagesPerPage) % len;
        };
        $scope.lexiconImagesSelectReset();


        $scope.lexicon = {
            index: function(x) {
                $scope.lexicon_images_cursor = x;
            },
            get current() {
                return $scope.lexicon_images[$scope.lexicon_images_cursor];
            },
            next: function() {
                if ($scope.lexicon_images_cursor < $scope.lexicon_images.length - 1)
                    $scope.lexicon_images_cursor++;
                else {
                    $scope.lexicon_images_cursor = 0;
                }
            },
            prev: function() {
                if ($scope.lexicon_images_cursor > 0)
                    $scope.lexicon_images_cursor--;
                else {
                    $scope.lexicon_images_cursor = $scope.lexicon_images.length - 1;
                }
            }
        };
    };


    if (!Constant.DEBUG_UI) {
        app.controller('AppCtrl',
            function($scope, $log, storage_path, pasteasy_qrcode, $ionicModal, $ionicPopover, $timeout, toaster, $window) {

                // Every Thing Goes Here
                storage_path.then(function(storage_path) {
                    pasteasy_qrcode.then(function(pasteasy_qrcode) {
                        $scope.storage_path = storage_path;
                        $scope.pasteasy_qrcode = pasteasy_qrcode;
                        $scope.WordsPerPage = Constant.WordsPerPage;
                        $scope.LexiconImagesPerPage = Constant.LexiconImagesPerPage;
                        $scope.GalleryImagesPerPage = Constant.GalleryImagesPerPage;

                        $scope.min = function(a, b) {
                            return Math.min(a, b);
                        };
                        $scope.range = function(n) {
                            return new Array(n);
                        };
                        var set = $scope.set = function(k, v) {
                            $scope[k] = v;
                            return set;
                        };
                        var get = $scope.get = function(k) {
                            return $scope[k];
                        };
                        // setup $scope variables
                        SetUpGallery($scope);


                        /**
                         lexicon_input
                         main_gallery
                         lexicon_images
                         lexicon_words
                         */
                        // setup the dirwatcher
                        var dir_watcher = new Class.DirWatcher(storage_path, function(path, stat) {
                            if (Util.isImage(path) || path.startsWith('data:image/')) {
                                $scope.main_gallery.push(path);
                                $scope.gallery.index($scope.main_gallery.length-1);
                                $scope.openImageModal($scope.gallery);
                                toaster.pop({
                                    type: 'note',
                                    title: "Recieved",
                                    body: "Your Image will appear in the Last Page."
                                });
                                $apply($scope);
                            }
                        });

                        // start the server
                        var sharing_server = Util.createSharingServer({
                            Util: Util,
                            port: 3000,
                            path: storage_path
                        });


                        dir_watcher.start(1500);
                        sharing_server.start();
                        $scope.server_qrcode = Util.qrEncode(sharing_server.upload_addr);

                        // Watching the lexicon_input
                        Util.latest_search_input = "";
                        $scope.$watch('lexicon_input', function(nv, ov) {
                            Util.latest_search_input = nv;
                            if (nv) {
                                Util.google(nv, function(err, images, words) {
                                    if (err) {
                                        $log.error(err);
                                    } else {
                                        $scope.lexicon_images = images;
                                        $scope.lexicon_words = words;
                                        $scope.lexiconWordsCursorReset();
                                        $scope.lexiconImagesSelectReset();
                                        $apply($scope);
                                    }
                                });
                            } else {
                                $scope.lexicon_images = [];
                                $scope.lexicon_images_cursor = 0;
                                $scope.lexicon_words = [];
                            }
                        });

                        // Image Modal
                        $scope.openImageModal = function(src) {
                            $scope.current_gallery = src;
                            $scope.openImageModal.modal && $scope.openImageModal.modal.show();
                        };
                        $scope.closeImageModal = function() {
                            $scope.openImageModal.modal && $scope.openImageModal.modal.hide();
                        };
                        $ionicModal.fromTemplateUrl('image-modal.html', function(modal) {
                            $scope.openImageModal.modal = modal;
                        }, {
                            scope: $scope,
                            animation: 'slide-in-up'
                        });

                        //rotate
                        $scope.body_angle = 0;
                        $scope.rotate = function(x) {
                            x = Math.abs(x);
                            console.log('previous body_angle is:' + $scope.body_angle || 0);
                            if (x !== undefined) {
                                $scope.body_angle = x;
                            } else {
                                var old = $scope.body_angle;
                                if (old) {
                                    $scope.body_angle += 90;
                                    $scope.body_angle = $scope.body_angle % 360;
                                } else {
                                    $scope.body_angle = 90;
                                }
                            }
                            console.log('current body_angle is:' + $scope.body_angle || 0);
                            // Util.rotate(document.body, $scope.body_angle);
                            Util.redraw('#my-body')
                                .rotate('#my-body', $scope.body_angle);

                            Util.rotate('.modal-backdrop', $scope.body_angle);
                        };

                        function is(x, y, z) {
                            if (x == y)
                                return z;
                            return null;
                        }

                        function onSwipe(x, cb) {
                            var angle = $scope.body_angle || 0;
                            var direction;

                            switch (angle) { //todo here
                                case 0:
                                    direction = is(x, 'right', 'right') || is(x, 'left', 'left') || 'stay';
                                    break;
                                case 90:
                                    direction = is(x, 'up', 'left') || is(x, 'down', 'right') || 'stay';
                                    break;
                                case 180:
                                    direction = is(x, 'left', 'right') || is(x, 'right', 'left') || 'stay';
                                    break;
                                case 270:
                                    direction = is(x, 'down', 'left') || is(x, 'up', 'right') || 'stay';
                                    break;
                            }
                            cb(direction);
                        }

                        //swipe
                        $scope.swipe = function(x) {
                            onSwipe(x, function(cmd) {
                                if (cmd == 'left') {
                                    cmd = 'next';
                                } else if (cmd == 'right') {
                                    cmd = 'prev';
                                }
                                ($scope.current_gallery[cmd] || function() {})();
                            });
                        };

                        //horizontal scroll
                        $scope.current_h_main_gallery_index = 0;
                        $scope.isHorizontalCurrentView = function(x) {
                            return $scope.current_h_main_gallery_index == x;
                        };
                        $scope.hscroll = function(direction) {
                            onSwipe(direction, function(cmd) {
                                var idx = $scope.current_h_main_gallery_index;
                                switch (cmd) {
                                    case 'left':
                                        {
                                            $log.info('h_main_gallery go next');
                                            $scope.current_h_main_gallery_index = idx < $scope.h_main_gallery.length - 1 ? idx + 1 : idx;
                                            break;
                                        }
                                    case 'right':
                                        {
                                            $log.info('h_main_gallery go prev');
                                            $scope.current_h_main_gallery_index = idx > 0 ? idx - 1 : 0;
                                            break;
                                        }
                                }
                            });
                        };



                        $scope.addToGallery = function(image_modal_src) {
                            if ($scope.main_gallery.indexOf(image_modal_src) == -1) {
                                $scope.main_gallery.push(image_modal_src);
                                toaster.pop('success', "Well Done", "The Image Has Been Saved");
                                $timeout(function() {
                                    $scope.current_h_main_gallery_index = $scope.h_main_gallery.length - 1;
                                });
                            }
                            return;
                        };




                        // Hand Writing
                        $ionicModal.fromTemplateUrl('handwriting-modal.html', function(modal) {
                            $scope.startWriting.modal = modal;
                        }, {
                            scope: $scope,
                            animation: 'slide-in-up'
                        });
                        $scope.startWriting = function() {
                            // $scope.startWriting.modal.show();
                            $scope.writing = true;
                        };
                        $scope.stopWriting = function() {
                            // $scope.startWriting.modal.hide();
                            $scope.writing = false;
                        };

                        function receiveMessage(e) {
                            console.log(e.data);
                            if (e.data == "please close me!!$$**") {
                                $scope.stopWriting();
                            } else {
                                $scope.lexicon_input = e.data;
                            }
                            $apply($scope);
                        }
                        $window.addEventListener('message', receiveMessage);





                        $scope.showQrCode = function(sel) {
                            var opacity = $(sel).css("opacity");
                            if (opacity == "1") {
                                $(sel).css("opacity", 0);
                            } else {
                                $(sel).css("opacity", 1);
                            }
                        };


                        // Theme
                        var themes = ['dark-blue'];

                        $scope.themes = {};
                        $scope.resetTheme = function (){
                            themes.forEach(function(x){
                                $scope.themes[x] = false;
                            });
                        };
                        $scope.themes_cursor = 0;
                        $scope.toggleTheme = function() {
                            var len = themes.length;
                            $scope.themes_cursor = ($scope.themes_cursor + 1) % len;
                            $scope.setTheme($scope.themes_cursor);
                        };
                        $scope.setTheme = function(idx){
                            idx = idx || 0;
                            $scope.resetTheme();
                            $scope.themes[themes[$scope.themes_cursor]] = true;
                        };
                        $scope.setTheme(0);

                        // END
                        message.startUp();
                    });
                });
            });

    } else {

        app.controller('AppCtrl', function($scope) {});
    }
    // should give up browser webkit recognition
    // use google speech api module (node-speakable) is a way to go
}());
