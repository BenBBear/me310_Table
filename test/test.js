var Speakable = require('speakable')
var speakable = new Speakable({
	key: 'AIzaSyBBlv0xsX5PS9-fW5z1Aab8FxzgCAXKWgs'
});

speakable.on('speechStart', function() {
	console.log('onSpeechStart');
});

speakable.on('speechStop', function() {
	console.log('onSpeechStop');
});

speakable.on('speechReady', function() {
	console.log('onSpeechReady');
});

speakable.on('error', function(err) {
	console.log('onError:');
	console.log(err);
	speakable.recordVoice();
});

speakable.on('speechResult', function(recognizedWords) {
	console.log('onSpeechResult:')
	console.log(recognizedWords);
	speakable.recordVoice();
});

speakable.recordVoice();