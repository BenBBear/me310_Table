(function() {

    Util.qrEncode = function(x) {
        var qr = Library.QrCode.qrcode(4, 'M');
        qr.addData(x);
        qr.make();
        var img = $(qr.createImgTag());
        return $(img).attr('src');
    };
}());
