var exec = require('child_process').exec;
var parseurl = require('url');

var pipe = false;
var map = false;
var DEFAULT_PATH = '/omx';

function omx(mapper) {
    map = mapper;
    return omx.express;
}

omx.express = function(req,res,next) {
    if (req.path.indexOf(DEFAULT_PATH) === 0) {
        //replace + and decode
        path = decodeURIComponent(req.path.replace(/\+/g, ' '));
        //remove leading and trailing /
        path = path.replace(/^\/|\/$/g,'');
        //split and remove leading path
        var parts = path.split('/');
        parts.shift();
        var command = parts.shift();
        console.log('executing',command,parts);
        if (omx[command]) {
            if (command === 'start') {
                omx.start(parts.join('/')+'?'+parseurl.parse(req.url).query);
            } else {
                omx[command].apply(this,parts);
            }
            //prevent anything else from being served from this subpath
            res.end('executed '+command);
            return;
        }
    }
    next();
};

var file = 'http://o-o---preferred---ams03s15---v19---lscache2.c.youtube.com/videoplayback?ip=86.89.231.15&upn=Fwirm5Yaelk&sparams=algorithm%2Cburst%2Ccp%2Cfactor%2Cgcr%2Cid%2Cip%2Cipbits%2Citag%2Csource%2Cupn%2Cexpire&fexp=908920%2C914057%2C904822%2C907217%2C919804%2C920704%2C912806%2C906831%2C911406%2C913550%2C912706&mt=1345230372&key=yt1&algorithm=throttle-factor&burst=40&ipbits=8&itag=22&sver=3&signature=2593ACB710B923807F0194EB927C96381630815B.11F6B8F7A1419296378EEE54C0FD3CB677882512&mv=m&source=youtube&ms=au&gcr=nl&expire=1345255588&factor=1.25&cp=U0hTSlJQU19NUkNOM19KSldGOng4aG1CaVAyblB3&id=7bf983b89baf6632';

omx.start = function(fn) {
    if (!pipe) {
        pipe = 'omxcontrol';
        exec('mkfifo '+pipe);
    }
    if (map) {
        map(fn,cb);
    }

    function cb(fn) {
        console.log(fn);
        fn = file;
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
omx.mapKey('forward',"$'\\x1b\\x5b\\x43'");
omx.mapKey('backward',"$'\\x1b\\x5b\\x44'");

module.exports = omx;