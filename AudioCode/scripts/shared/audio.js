// audio
// Audio handler

"use strict";

(function (){
    window.e58 = window.e58 || {};
    
    e58.audio = {
        context: new (window.AudioContext || window.webkitAudioContext)(),
        defaultGain: 0.5
    };
    
    var i, hz, hz0, hz2;
    e58.audio.hzPerBin = 21.55;
    e58.audio.binHz = [];
    for (i = 0; i < 1024; i++) {
        e58.audio.binHz.push(i * e58.audio.hzPerBin);
    }
    e58.audio.codeHz = [];
    e58.audio.codeBinIndexes = [];
    e58.audio.codeHzPairsA = [];
    e58.audio.codeHzPairsB = [];
    e58.audio.codeBinIndexPairsA = [];
    e58.audio.codeBinIndexPairsB = [];
    e58.audio.codeHzIndexPairsA = [];
    e58.audio.codeHzIndexPairsB = [];
    for (i = 0; i < 1024; i += 4) {
        hz = e58.audio.binHz[i];
        if (hz > 700 && e58.audio.codeHz.length < 12) {
            e58.audio.codeHz.push(hz);
            e58.audio.codeBinIndexes.push(i);
        }
    }
    for (i = 0; i < e58.audio.codeHz.length - 2; i++) {
        hz0 = e58.audio.codeHz[i];
        hz2 = e58.audio.codeHz[i + 2];
        switch (i % 4) {
            case 0:
                e58.audio.codeHzPairsA.push([hz0, hz2]);
                e58.audio.codeBinIndexPairsA.push([
                    e58.audio.codeBinIndexes[i],
                    e58.audio.codeBinIndexes[i + 2]]);
                e58.audio.codeHzIndexPairsA.push([i, i + 2]);
                break;
            case 1:
                e58.audio.codeHzPairsB.push([hz0, hz2]);
                e58.audio.codeBinIndexPairsB.push([
                    e58.audio.codeBinIndexes[i],
                    e58.audio.codeBinIndexes[i + 2]]);
                e58.audio.codeHzIndexPairsB.push([i, i + 2]);
                break;
            default:
                break;
        }
    }

    e58.audio.runOscillator = function (frequency, durationS) {
        var oscillator = e58.audio.context.createOscillator();
        var gain = e58.audio.context.createGain();
        oscillator.connect(gain);
        gain.connect(e58.audio.context.destination);
        
        oscillator.type = 'sin';
        oscillator.frequency.value = Number(frequency || 1000);
        oscillator.start();
        oscillator.stop(e58.audio.context.currentTime + (durationS || 0.5));
    };

    e58.audio.initialiseAnalyser = function (source, minDecibelsInput, maxDecibelsInput) {
        if (!e58.audio.analyser) {
            e58.audio.analyser = e58.audio.context.createAnalyser();
            source.connect(e58.audio.analyser);
        }
        
        e58.audio.analyser.fftSize = 2048;
        e58.audio.analyser.minDecibels = -Number(minDecibelsInput || 200);
        e58.audio.analyser.maxDecibels = -Number(maxDecibelsInput || 10);
        e58.audio.analyser.smoothingTimeConstant = 0.0;
    };
    
    e58.audio.runAnalyser = function () {
        var i;
        
        var frequencyData = new Float32Array(e58.audio.analyser.frequencyBinCount);
        e58.audio.analyser.getFloatFrequencyData(frequencyData);
        
        var timeData = new Float32Array(e58.audio.analyser.fftSize);
        e58.audio.analyser.getFloatTimeDomainData(timeData);
        
        var timeSorted = s58.sort(timeData);
        var timeMin = timeSorted[0];
        var timeMax = timeSorted[timeSorted.length - 1];
        var timeMedian = timeSorted[Math.floor(timeSorted.length / 2)];
        var timeSum = 0;
        var timeCount = 0;
        for (i = 0; i < timeData.length; i++) {
            if (timeData[i] != null) {
                timeData[i] = (timeData[i] - timeMin) / (timeMax - timeMin);
                timeSum += timeData[i];
                timeCount++;
            }
        }
        var timeMean = timeSum / (timeCount || 0);
        
        var frequencySorted = s58.sort(frequencyData);
        var frequencyMin = frequencySorted[0];
        var frequencyMax = frequencySorted[frequencySorted.length - 1];
        var frequencyMedian = frequencySorted[Math.floor(frequencySorted.length / 2)];
        var frequencySum = 0;
        var frequencyCount = 0;
        for (i = 0; i < frequencyData.length; i++) {
            if (frequencyData[i] != null) {
                frequencyData[i] = (frequencyData[i] - frequencyMin) / (frequencyMax - frequencyMin);
                frequencySum += frequencyData[i];
                frequencyCount++;
            }
        }
        var frequencyMean = frequencySum / (frequencyCount || 1);
        
        var encodedData = [];
        e58.audio.codeBinIndexes.forEach(function (binIndex, i) {
            encodedData.push(frequencyData[binIndex] > 2.0 * frequencyMean);
        });
        var encodedDataA = [];
        e58.audio.codeHzIndexPairsA.forEach(function (codeHzIndexPair, i) {
            encodedDataA.push(encodedData[codeHzIndexPair[0]] && encodedData[codeHzIndexPair[1]]);
        });
        var encodedDataB = [];
        e58.audio.codeHzIndexPairsB.forEach(function (codeHzIndexPair, i) {
            encodedDataB.push(encodedData[codeHzIndexPair[0]] && encodedData[codeHzIndexPair[1]]);
        });
                
        return {
            encodedData: encodedData,
            encodedDataA: encodedDataA,
            encodedDataB: encodedDataB,
            frequencyData: frequencyData,
            timeData: timeData
        };
    };
    
    window.addEventListener("load", function() {
        var audio = e58.audio;


    });
})();
