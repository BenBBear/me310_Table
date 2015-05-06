(function(){

    var devices_module = Util.require('devices');
    var wlan_ip_module = Util.require('wlan_ip');

    /**
     Bind Module Utilities to Util Object
     */

    // get wlan ip of current machine
    Util.getWlanIp = wlan_ip_module;


     set up the sharing devices
     Util.devices = devices_module.open({
         Port: Constant.PORT,
         PasteasyDirectory: Constant.PasteasyDirectory
     });

     Util.devices.on('error', function(){
         var msg = 'Cound not open Sharing Devices!';
         alert(msg);
         throw new Error(msg);
     });
     Util.devices.on('success', function(){
         Constant.ServerAddr = 'http://' + Util.getWlanIp() + ':' + Constant.Port + '/#/upload-page';
     });



    //end
}());
