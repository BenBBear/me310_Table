(function() {
    function capitalize(s) {
        return s.replace(/\S/, function(m) { return m.toUpperCase(); });
    }
    var Recognition = function(arg_option) {
        if (!('webkitSpeechRecognition' in window)) {
            this.disable = true;
            return;
        }

        this.__engine = new webkitSpeechRecognition();

        this.recognizing = false;
        var me = this;


        this.option = {
            lang: arg_option.lang || 'en-US',
            onstart: function() {
                me.recognizing = true;
                arg_option.onstart && arg_option.onstart();
            },
            onend: function() {
                me.recognizing = false;
                arg_option.onend && arg_option.onend();
            },
            onerror: function(event) {
                arg_option.onerror && arg_option.onerror(event);
            },
            onresult: function(event) {
                arg_option.onresult && arg_option.onresult(event);
            }
        };

    };

    Recognition.prototype = function() {
        return {
            stop: function() {
                if (!this.disable) {
                    if (this.__engine) {
                        if(this.recognizing)
                            this.__engine.stop();
                    } else
                        throw new Error('Speech Recognition Engine is undefined');
                }
                return this;
            },
            start: function() {
                if (!this.disable) {
                    if(this.recognizing){
                        this.__engine.stop();
                    }

                    for (var k in this.option) {
                        this.__engine[k] = this.option[k];
                    }

                    this.__engine.start();
                }
                return this;
            },
            setLang:function(x){
                this.option.lang = x;
                return this;
            }
        };
    }();



    var microphone_img = {};
    microphone_img.recording = 'mic-animate.gif';
    microphone_img.start = 'mic.gif';
    microphone_img.disabled = 'mic-slash.gif';




    angular.module('app').directive('mySpeechRecognition', function() {
        return {
            restrict: 'EA',
            templateUrl: 'tpl/directives/mySpeechRecognition.html',
            scope: {
                finalOuput: '=',
                interOutput:'=',
                lang: '='
            },
            controller: function($scope) {
                $scope.finalOuput = "";
                $scope.interOutput = "";

                $scope.microphone = microphone_img.start;




                var sp_engine = new Recognition({
                    onresult: $scope.onResult || function(event) {

                        for (var i = event.resultIndex; i < event.results.length; ++i) {
                            if (event.results[i].isFinal) {
                                $scope.finalOuput += event.results[i][0].transcript;
                            } else {
                                $scope.interOutput += event.results[i][0].transcript;
                            }
                        }
                        $scope.finalOuput = capitalize($scope.finalOuput);

                    },
                    onstart: function() {
                        $scope.microphone = microphone_img.start;
                    },
                    onend: function() {
                        $scope.microphone = microphone_img.recording;
                    },
                    onerror: function() {},
                    lang: $scope.lang
                });
                if (sp_engine.disabled) {
                    $scope.microphone = microphone_img.disabled;
                }

                $scope.$watch('lang', function(){
                    sp_engine
                        .stop()
                        .setLang($scope.lang)
                        .start();
                });

                $scope.toggle = function() {
                    if (!sp_engine.disabled) {
                        if (sp_engine.recognizing) {
                            sp_engine.stop();
                        } else {
                            $scope.finalOuput = "";
                            $scope.interOutput = "";
                            sp_engine.start();
                        }
                    }
                };

            }
        };
    });


}());
