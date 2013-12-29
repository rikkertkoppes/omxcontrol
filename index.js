var exec = require('child_process').exec;
var parseurl = require('url');

var pipe = false;
var map = false;
var DEFAULT_PATH = '/omx';

omx.start = function(fn) {
    if (!pipe) {
        pipe = 'omxcontrol';
        exec('mkfifo '+pipe);
    }
    cb(fn);

    function cb(fn) {
        console.log(fn);
        exec('omxplayer -o hdmi "'+fn+'" < '+pipe,function(error, stdout, stderr) {
            console.log(stdout);
        });
        exec('echo . > '+pipe);
    }
};

omx.sendKey = function(key) {
    if (!pipe) return;
    exec('echo -n '+key+' > '+pipe);
};

omx.mapKey = function(command,key,then) {
    omx[command] = function() {
        omx.sendKey(key);
        if (then) {
            then();
        }
    };
};

omx.mapKey('pause','p');
omx.mapKey('quit','q',function() {
    exec('rm '+pipe);
    pipe = false;
});
omx.mapKey('play','.');
omx.mapKey('forward',"\x5b\x43");
omx.mapKey('backward',"\x5b\x44");
omx.mapKey('subs', 'm');

module.exports = omx;
