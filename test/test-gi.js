var client = require('./google-images.js');

client.search('node', function(err, images) {
	console.log(err, images);
})