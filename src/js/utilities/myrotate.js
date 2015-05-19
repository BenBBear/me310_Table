(function() {
    Util.rotateUp = function(x) {
        document.getElementById("rotate_part").style.setProperty("-webkit-transform", "rotate(-180deg)", null);
    };
    Util.rotateDown = function(x) {
        document.getElementById("rotate_part").style.setProperty("-webkit-transform", "rotate(0deg)", null);
    };
    Util.rotateLeft = function(x) {
        document.getElementById("rotate_part").style.setProperty("-webkit-transform", "rotate(-270deg)", null);
    };
    Util.rotateRight = function(x) {
        document.getElementById("rotate_part").style.setProperty("-webkit-transform", "rotate(-90deg)", null);
    };
}());