var gi = require('my-google-images');

gi.search({
    for: 'office',
    page: 0
}, function(err, images) {
    console.log('Search With Object', err, images);
});



// gi.search('office', function(err, images) {
//     console.log('Search With String', err, images);
// });


// gi.search(
//     'office', {
//         callback: function(err, images) {
//             console.log('Search With Object', err, images);
//         },
//         page: 1
//     });
