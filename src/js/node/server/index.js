var express = require('express'),
    formidable = require('formidable'),
    os = require('os'),
    fs = require('fs'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    appPath = process.cwd(),
    bodyParser = require('body-parser'),
    util = require('util'),
    emt = require('events').EventEmitter,
    port = 3000,
    interface = new emt(),
    path = require('path'),
    uploadDir = os.tmpDir();


app.use(express.static(__dirname + '/public/'));
uploadDir = path.resolve(__dirname + '/public/uploads/');

app.use(bodyParser.json());

var imgSrcPrefix = 'js/node/server/public/uploads/',
    short_imgSrcPrefix = '/uploads/';



var getForm = function() {
    var form = new formidable.IncomingForm();
    form.keepExtensions = true;
    return form;
};


var errMsg = "Table 内部服务器出现错误",
    fileList = [];

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
                var e = {
                    short_src: short_imgSrcPrefix + files.file.name,
                    path: newPath,
                    src: imgSrcPath,
                    name: files.file.name
                };
                fileList.push(e);
                interface.emit('file', e);
                io.emit('cmd:addFile', e);
                res.json({
                    valid: true
                });
            }
        });
    });
});




io.on('connection', function(socket) {
    socket.on('req:fileList', function() {
        // debugger;
        socket.emit('res:fileList', fileList);
    });
});
interface.on('removeFile', function(index) {
    fileList.splice(index);
    io.emit('cmd:removeFile', index);
});


interface.on('setFileList', function(x) {
    fileList = x;
    io.emit('cmd:setFileList', x);
});




server.listen(port, function() {
    var host = this.address().address;
    var port = this.address().port;
    console.log('Table Internal Server has been started at http://' + host + ":" + port);
});

module.exports = {
    port: 3000,
    interface: interface,
    uploadDir: uploadDir
};