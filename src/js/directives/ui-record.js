angular.module('app')


.directive('myRecorder', function() {
    return {
        restrict: 'EA',
        templateUrl: 'tpl/directives/myRecorder.html',
        scope: {
            mrOption: '=',
            mrOutput: '=',
            sampleRate:'='
        },
        controller: function($scope, $element, $window, $interval) {

            function update_option( ){
                $scope.__option = angular.extend(default_option, $scope.mrOption);
            }
            $scope.mrOption = $scope.mrOption || {};
            var default_option = {
                realTime: false,
                SamplingPeriod: 1000
            };
            update_option();

            $scope.$watch(function(){
                return $scope.mrOption;
            },function(){
                if($scope.recording){
                    $scope.stop();
                    update_option();
                    $scope.start();
                }else{
                    update_option();
                }
            },true);


            var AudioContext = $window.AudioContext || $window.webkitAudioContext,
                navigator = $window.navigator;
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

            var audio_context = new AudioContext;
            $scope.sampleRate = audio_context.sampleRate;

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

            var AudioSampler = undefined;
            $scope.start = function() {
                recorder.record();
                if ($scope.__option.realTime) {
                    AudioSampler = $interval(function() {
                        recorder.exportWAV(function(blob) {
                            recorder.clear();
                            $scope.mrOutput = blob;
                        });
                    }, $scope.__option.SamplingPeriod);
                }
            };

            $scope.stop = function() {
                recorder.stop();
                // set mrOutput
                if ($scope.__option.realTime) {
                    $interval.cancel(AudioSampler);
                }
                recorder.exportWAV(function(blob) {
                    $scope.mrOutput = blob;
                    $scope.$apply();
                });
                recorder.clear();

            };
        }
    };
});
