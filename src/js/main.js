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
        'wu.masonry', 'toaster'
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
                            if (Util.isImage(path))
                                $scope.main_gallery.unshift(path);
                            $apply($scope);
                        });

                        // start the server
                        var sharing_server = Util.createSharingServer({
                            Util: Util,
                            port: 3000,
                            path: storage_path
                        });


                        dir_watcher.start();
                        sharing_server.start();


                        // Watching the lexicon_input
                        var latest_search_input;
                        $scope.$watch('lexicon_input', function(nv, ov) {
                            latest_search_input = nv;
                            if (nv) {
                                Util.getRelatedWord(Util.tokenizeAndStem(nv), function(err, origin_value, resultList) {
                                    if (err)
                                        throw err;
                                    else {
                                        if (origin_value == latest_search_input) {
                                            var result_to_display = [];
                                            resultList.forEach(function(r) {
                                                result_to_display = result_to_display.concat(r.slice(0, 10));
                                            });
                                            $scope.lexicon_words = result_to_display.slice(0, 10);
                                            if (!$scope.$$phase) {
                                                $scope.$apply();
                                            }
                                        }
                                    }
                                });

                                Util.googleImageSearch({
                                    for: nv,
                                    page: Constant.GoogleImagePageNumber,
                                    rsz: Constant.GoogleImageNumberPerPage
                                }, function(err, origin_value, images) {
                                    if (err) {
                                        throw err;
                                    } else {
                                        if (origin_value == latest_search_input) {
                                            $scope.lexicon_images = images.map(function(img) {
                                                return img.url;
                                            });
                                            $apply($scope);
                                        }
                                    }
                                });
                            } else {
                                $scope.lexicon_images = [];
                                $scope.lexicon_images_cursor = 0;
                                $scope.lexicon_words = 0;
                            }
                        });

                        // Image Modal
                        $scope.openImageModal = function(src) {
                            $scope.current_gallery = src;
                            $scope.openImageModal.modal.show();
                        };
                        $scope.closeImageModal = function() {
                            $scope.openImageModal.modal.hide();
                        };
                        $ionicModal.fromTemplateUrl('image-modal.html', function(modal) {
                            $scope.openImageModal.modal = modal;
                        }, {
                            scope: $scope,
                            animation: 'slide-in-up'
                        });


                        // Qrcode Popover
                        $scope.openQrPopover = function($event) {
                            $scope.openQrPopover.popover.show($event);
                        };
                        $scope.closeQrPopover = function() {
                            $scope.openQrPopover.popover.hide();
                        };
                        $ionicPopover.fromTemplateUrl('qrcode-popover.html', {
                            scope: $scope
                        }).then(function(popover) {
                            $scope.openQrPopover.popover = popover;
                        });
                        $scope.pasteasy_qrcode = pasteasy_qrcode;
                        $scope.server_qrcode = Util.qrEncode(sharing_server.upload_addr);


                        // Drag And Drop
                        $scope.imageDropTo = function($data, where, deleted) {
                            $log.info('Dropping');
                            if ($data) {
                                if ($data.from == where) {
                                    $log.info('Drag Drop in the same place');
                                    return;
                                } else if ($data.to == where) {
                                    // data.index;
                                    // $data.index = $data.from.indexOf($data.image);
                                    if ($data.image != 'assets/images/bear.jpg') {
                                        if (!deleted) {
                                            var img = $data.from[$data.index];
                                            $data.to.unshift(img);
                                        }
                                        $data.from.splice($data.index, 1);

                                        $log.info('Drag Drop Successfully');
                                    }
                                }
                            }
                        };

                        // draggable:end
                        $scope.dragging_from_gallery = false;
                        $scope.dragging_from_lexicon = false;
                        var dragging = function(from, b) {
                            if (from == $scope.main_gallery) {
                                $log.info('dragging_from_gallery', b);
                                set('dragging_from_gallery', b);
                            } else if (from == $scope.lexicon_images) {
                                $log.info('dragging_from_lexicon', b);
                                set('dragging_from_lexicon', b);
                            }
                            $apply($scope);
                        };
                        $scope.$on('draggable:start', function($event, info) {
                            dragging(info.data.from, true);
                        });
                        $scope.$on('draggable:end', function($event, info) {

                            dragging(info.data.from, false);

                        });


                        //rotate
                        var rotate_hash = {};
                        $scope.rotate = function() {
                            var old = rotate_hash[document.body];
                            if (old) {
                                rotate_hash[document.body] += 90;
                                rotate_hash[document.body] = rotate_hash[document.body] % 360;
                                Util.rotate(document.body, rotate_hash[document.body]);
                            } else {
                                rotate_hash[document.body] = 90;
                                Util.rotate(document.body, 90);
                            }
                        };

                        function is(x, y, z) {
                            if (x == y)
                                return z;
                            return null;
                        }

                        //swipe
                        $scope.swipe = function(x) {
                            var angle = rotate_hash[document.body] || 0;
                            var direction;
                            switch (angle) { //todo here
                                case 0:
                                    direction = is(x, 'right', 'next') || is(x, 'left', 'prev') || 'stay';
                                    break;
                                case 90:
                                    direction = is(x, 'up', 'prev') || is(x, 'down', 'next') || 'stay';
                                    break;
                                case 180:
                                    direction = is(x, 'left', 'next') || is(x, 'right', 'prev') || 'stay';
                                    break;
                                case 270:
                                    direction = is(x, 'down', 'prev') || is(x, 'up', 'next') || 'stay';
                                    break;
                            }

                            console.log('image gonna ' + direction);

                            ($scope.current_gallery[direction] || function(){})();



                        };



                        $scope.addToGallery = function(image_modal_src) {
                            if ($scope.main_gallery.indexOf(image_modal_src) == -1) {
                                $scope.main_gallery.unshift(image_modal_src);
                                toaster.pop('success', "Well Done", "The Image Has Been Saved");

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
