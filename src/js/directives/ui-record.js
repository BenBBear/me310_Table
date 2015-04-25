angular.module('app')


.directive('myRecorder', function() {
    return {
        restrict: 'EA',
        templateUrl: 'tpl/directives/myRecorder.html',
        scope: {
            mrOption: '=',
            mrOutput: '='
        },
        controller: function($scope, $element, $window) {
            var AudioContext = $window.AudioContext || $window.webkitAudioContext,
                navigator = $window.navigator;
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

            var audio_context = new AudioContext;
            var recorder;


            function startUserMedia(stream) {
                var input = audio_context.createMediaStreamSource(stream);
                recorder = new Recorder(input, {
                    workerPath: 'js/mylib/recorderWorker.js'
                });
            }

            navigator.getUserMedia({
                audio: true
            }, startUserMedia, function(e) {
                alert('No live audio input: ' + e);
            });


            $scope.recording = false;
            $scope.toggle = function() {
                if (this.recording) {
                    this.stop();
                } else {
                    this.start();
                }
                this.recording = !this.recording;
            };

            $scope.start = function() {
                recorder.record();
            };

            $scope.stop = function() {
                recorder.stop();
                // set mrOutput
                recorder.exportWAV(function(blob) {
                    $scope.mrOutput = blob;
                    $scope.$apply();
                });
                recorder.clear();
            };
        }
    };
});
