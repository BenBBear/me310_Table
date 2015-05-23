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

    var app = Globals.app = angular.module('me310_Table', ['ionic', 'wu.masonry', 'ngDragDrop']);

    var message = {};
    message.startUp = function() {
        alert('Now the program should start.' +
            '\n\nMore Info of This Program Please See:\n\n https://github.com/BenBBear/me310_Table');
    };



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

    var SetUpScopeVariable = function($scope) {
        //**********//
        $scope.lexicon_input = "";
        $scope.main_gallery = ['img/bear.jpg']; //a array of images
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



    app.controller('AppCtrl', function($scope, storage_path, pasteasy_qrcode) {
        // Every Thing Goes Here
        storage_path.then(function(storage_path) {
            pasteasy_qrcode.then(function(pasteasy_qrcode) {

                // setup $scope variables
                SetUpScopeVariable($scope);

                /**
                 lexicon_input
                 main_gallery
                 lexicon_images
                 lexicon_words
                 */
                // setup the dirwatcher
                var dir_watcher = new Class.DirWatcher(storage_path, function(path, stat) {
                    if (Util.isImage(path))
                        $scope.main_gallery.push(path);
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
                    if (nv) {
                        latest_search_input = nv;
                        Util.getRelatedWord(Util.tokenizeAndStem(nv), function(err, origin_value, resultList) {
                            if (err)
                                throw err;
                            else {
                                if (origin_value == latest_search_input) {
                                    var result_to_display = [];
                                    resultList.forEach(function(r) {
                                        result_to_display = result_to_display.concat(r.slice(0, 10));
                                    });
                                    $scope.lexicon_words = result_to_display;
                                }
                            }
                        });

                        Util.googleImageSearch({
                            for: nv,
                            page: Constant.GoogleImagePageNumber
                        }, function(err, origin_value, images) {
                            if (err) {
                                throw err;
                            } else {
                                if (origin_value == latest_search_input) {
                                    $scope.lexicon_images = images;
                                    console.log(images);
                                }
                            }
                        });
                    }
                });


                // For Testing
                $scope.lexicon_input = 'office';


                // END
                message.startUp();
            });
        });
    });

    app.run(function(){
        Globals.app_scope = angular.element(document.body).scope();
    });



}());
