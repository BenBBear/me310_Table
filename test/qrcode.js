var Datauri = require('datauri'),
    qrcode = require('zxing');



qrcode.decode(Datauri('/Users/xyzhang/Documents/WorkSpace/me310_Table/src/assets/images/2015-05-06-162207-1.jpg'),function(err, result) {
    console.log(err,result);
});
