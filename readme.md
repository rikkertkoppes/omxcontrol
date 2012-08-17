omxcontrol
==========

Nodejs module to control omxplayer. Specifically written for the raspberry pi

Requirements
------------

* omxplayer (installed by default on the raspberry pi raspian image)
* nodejs (`apt-get install nodejs`)
* express (optional)

Usage
-----
    
Basic usage
    
    omx = require('omxcontrol');

    omx.start(filename);

    omx.pause();

    omx.quit();

Use with express as middleware. This type of usage exposes the above methods as an http api:

    omx = require('omxcontrol');
    express.use(omx());

    http://localhost/omx/start/:filename
    http://localhost/omx/pause
    http://localhost/omx/quit

You actually might not want to pass the real file name to the http api, probably to simplify things, but in my case, omxplayer needs a specific url to play youtube video. For this usecase, `omx()` can be passed a mapping function to map the filename to something else. Calling the provided start method is required to actually start the video. Your logic can be async and even choose not to start things:

    omx = require('omxcontrol');
    express.use(omx(function(fn,start) {
        //do something special
        start(fn);
    }));