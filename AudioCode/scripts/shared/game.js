// shared
// Shared utilities

"use strict";

(function () {
    window.g58 = window.g58 || {};
    window.g58.game = g58.game || {};
    
    
    window.addEventListener("load", function (event) {
        g58.game.canvas = e58.canvas.getNew("gameCanvas");
        
        var codeHzButtonsA = [];
        var codeHzButtonsB = [];
        
        var messageInTextbox = document.querySelector("#messageIn");
        var messageOutTextbox = document.querySelector("#messageOut");
        var sendButton = document.querySelector("#send");
        var bandARadio = document.querySelector("input[type=radio][name=band][value=A]");
        var bandBRadio = document.querySelector("input[type=radio][name=band][value=B]");
        
        var initialiseButton = document.querySelector("#gameButtons #initialise");
        initialiseButton.addEventListener("click", function (event) {
            g58.game.canvas.clear();
            e58.mic.start();
        });
        
        var analyseIntervalId;
        var minDecibelsInput = document.querySelector("#gameButtons #minDecibels");
        var maxDecibelsInput = document.querySelector("#gameButtons #maxDecibels");
        var startButton = document.querySelector("#gameButtons #start");
        startButton.addEventListener("click", function (event) {
            if (!e58.audio.analyser) {
                e58.audio.initialiseAnalyser(e58.mic.source, -minDecibelsInput, -maxDecibelsInput);
            }
            
            analyseIntervalId = setInterval(function () {
                var audioData = e58.audio.runAnalyser();
                
                var receivedMessage;
                if (bandARadio.checked) {
                    audioData.encodedDataB.forEach(function (value, i) {
                        codeHzButtonsB[i].className = value ? "code-hz-on" : "code-hz-off";
                    });
                    e58.audio.receivePacket(audioData.encodedDataB, "B");
                    receivedMessage = e58.audio.getMessage("B");
                }
                else {
                    audioData.encodedDataA.forEach(function (value, i) {
                        codeHzButtonsA[i].className = value ? "code-hz-on" : "code-hz-off";
                    });
                    e58.audio.receivePacket(audioData.encodedDataA, "A");
                    receivedMessage = e58.audio.getMessage("A");
                }
                
                if (receivedMessage) {
                    messageInTextbox.value = receivedMessage.toString();
                }
                                
                g58.game.canvas.clear();
                g58.game.canvas.startContext(s58.rgba(50), s58.rgba(50), 2);
                
                g58.game.canvas.setDrawOrigin(+0, +0, -0.9, -0.4);
                g58.game.canvas.beginPath();
                audioData.frequencyData.forEach(function (frequencyDatum, i) {
                    var x = 0.4 * g58.game.canvas.width * i / audioData.frequencyData.length;
                    var y = 0.4 * g58.game.canvas.height * frequencyDatum;
                    if (i == 0) {
                        g58.game.canvas.moveTo(x, y);
                    }
                    else {
                        g58.game.canvas.lineTo(x, y);
                    }
                });
                g58.game.canvas.stroke();
                
                g58.game.canvas.setDrawOrigin(+0, +0, +0.1, -0.4);
                g58.game.canvas.beginPath();
                audioData.timeData.forEach(function (timeDatum, i) {
                    var x = 0.4 * g58.game.canvas.width * i / audioData.timeData.length;
                    var y = 0.4 * g58.game.canvas.height * timeDatum;
                    if (i == 0) {
                        g58.game.canvas.moveTo(x, y);
                    }
                    else {
                        g58.game.canvas.lineTo(x, y);
                    }
                });                
                g58.game.canvas.stroke();
            }, 20);
        });
        
        var stopButton = document.querySelector("#gameButtons #stop");
        stopButton.addEventListener("click", function (event) {
            if (analyseIntervalId != null) {
                clearInterval(analyseIntervalId);
            }
        });
                
        var codeHzButtonsADiv = document.querySelector("#codeHzButtonsA");
        e58.audio.codeHzPairsA.forEach(function (codeHzPair, i) {
            var codeHzButton = codeHzButtonsADiv.appendChild(document.createElement("button"));
            codeHzButton.innerHTML = "A" + i;
            codeHzButton.className = "code-hz-off";
            codeHzButton.addEventListener("click", function (event) {
                e58.audio.runCodeHz(i, "A");
            });
            codeHzButtonsA.push(codeHzButton);
        });
        
        var codeHzButtonsBDiv = document.querySelector("#codeHzButtonsB");
        e58.audio.codeHzPairsB.forEach(function (codeHzPair, i) {
            var codeHzButton = codeHzButtonsBDiv.appendChild(document.createElement("button"));
            codeHzButton.innerHTML = "B" + i;
            codeHzButton.className = "code-hz-off";
            codeHzButton.addEventListener("click", function (event) {
                e58.audio.runCodeHz(i, "B");
            });
            codeHzButtonsB.push(codeHzButton);
        });
                
        sendButton.addEventListener("click", function (event) {
            e58.audio.sendMessage(
                (messageOutTextbox.value || "").split(","),
                bandARadio.checked ? "A" : "B");
        });
    });
})();
