var express = require('express'),
    formidable = require('formidable'),
    os = require('os'),
    fs = require('fs'),
    app = express(),
    appPath = process.cwd(),
    bodyParser = require('body-parser'),
    util = require('util'),
    emt = require('events').EventEmitter,
    port = 3000,
    interface = new emt(),
    path = require('path'),
    uploadDir = os.tmpDir();


if (typeof __dirname == 'undefined') {
    app.use(express.static(appPath + '/src/js/node/server/public'));
    uploadDir = path.resolve(appPath + '/src/js/node/server/public/uploads');
} else {
    app.use(express.static('./public/'));
    uploadDir = path.resolve('./public/uploads/');
}
app.use(bodyParser.json());

var imgSrcPrefix = 'js/node/server/public/uploads/';



var getForm = function() {
    var form = new formidable.IncomingForm();
    form.keepExtensions = true;
    return form;
};


var errMsg = "Table 内部服务器出现错误";
app.post('/upload', function(req, res) {
    var form = getForm();
    form.parse(req, function(err, fields, files) {
        var newPath = uploadDir + '/' + files.file.name,
            imgSrcPath = imgSrcPrefix + files.file.name;
        fs.rename(files.file.path, newPath, function(err) {
            if (err) {
                interface.emit('error', {
                    error: err,
                    message: errMsg
                });
                res.json({
                    valid: false,
                    message: errMsg
                });
            } else {
                interface.emit('file', {
                    path: newPath,
                    src: imgSrcPath,
                    name: files.file.name
                });
                res.json({
                    valid: true
                });
            }
        });
    });
});

app.listen(port, function() {
    var host = this.address().address;
    var port = this.address().port;
    console.log('Table Internal Server has been started at http://' + host + ":" + port);
});



module.exports = {
    port: 3000,
    interface: interface,
    uploadDir: uploadDir
};