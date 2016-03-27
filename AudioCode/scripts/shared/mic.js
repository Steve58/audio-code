// mic
// Microphone features

"use strict";

(function () {
    window.e58 = window.e58 || {};

    e58.mic = e58.mic || {};

    e58.mic.initialise = function () {
        e58.mic.initialised = true;
    };

    e58.mic.start = function () {
        if (e58.mic.starting || e58.mic.running) {
            return;
        }
        
        if (!e58.mic.initialised) {
            e58.mic.initialise();
        }
        
        e58.mic.starting = true;
        
        var constraints = { audio: true, video: false };

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            //console.log("navigator.mediaDevices.getUserMedia (promise syntax)");
            navigator.mediaDevices.getUserMedia(constraints)
                .then(onSuccess)
                .catch(function (error) {
                    onError(error);
                    e58.mic.starting = true;
                    //console.log("navigator.mediaDevices.getUserMedia");
                    navigator.mediaDevices.getUserMedia(constraints, onSuccess, onError);
                });
        }
        else if (navigator.mozGetUserMedia) {
            //console.log("navigator.mozGetUserMedia");
            navigator.mozGetUserMedia(constraints, onSuccess, onError);
        }
        else if (navigator.webkitGetUserMedia) {
            //console.log("navigator.webkitGetUserMedia");
            navigator.webkitGetUserMedia(constraints, onSuccess, onError);
        }

        var pollWhetherRunningIntervalId;

        function onSuccess (stream) {            
            e58.mic.source = e58.audio.context.createMediaStreamSource(stream);
        }

        function onError(error) {
            console.error(error);
            e58.mic.starting = false;
        }
    };    
})();
