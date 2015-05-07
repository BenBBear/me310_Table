Util.qrcodeToHref = function(sel, text){
    var qrcode = Util.qrEncode(text);
    $(sel).attr('href', qrcode);
    return Util;
};
