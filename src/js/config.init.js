var Util = {}; // utility
var Node = {}; // Node Modules
var Class = {}; // Classes
var Constant = {}; // Constant
var Settings = {};
var Functions = {
    Debug: {}
};

var Library = {
    Galleria: Galleria,
    QrCode: QRCode,
    Jquery: $
};


/**
 Node & Browser Context Variable Patching
 */



global.Image = Image;
global.document = window.document;
