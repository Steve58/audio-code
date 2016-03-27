// audio
// Audio handler

"use strict";

(function (){
    window.e58 = window.e58 || {};
    
    e58.audio = {
        context: new (window.AudioContext || window.webkitAudioContext)(),
        defaultGain: 0.5
    };
    
    var i
    
    var codes = {
        nextNumber: 14,
        nextMessage: 15
    };
    
    var packetIntervalMs = 800;
    var packetDurationMs = 700;
    
    // var packetCountThreshold = 5;
    
    var hz, hz0, hz2;
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
    
    e58.audio.sendingMessageA = [];
    e58.audio.sendingMessageB = [];
    e58.audio.receivingMessageA = [];
    e58.audio.receivingMessageB = [];    
    e58.audio.receivedMessageA = null;
    e58.audio.receivedMessageB = null;

    e58.audio.runOscillator = function (frequency, durationMs) {
        var oscillator = e58.audio.context.createOscillator();
        var gain = e58.audio.context.createGain();
        oscillator.connect(gain);
        gain.connect(e58.audio.context.destination);
        
        oscillator.type = 'sin';
        oscillator.frequency.value = Number(frequency || 1000);
        oscillator.start();
        oscillator.stop(e58.audio.context.currentTime + ((durationMs || 100) / 1000));
    };
    
    e58.audio.runCodeHz = function (index, band) {
        var codeHzPairs = (band == "A") ? e58.audio.codeHzPairsA : e58.audio.codeHzPairsB;
        e58.audio.runOscillator(codeHzPairs[index][0], packetDurationMs);
        e58.audio.runOscillator(codeHzPairs[index][1], packetDurationMs);
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
    
    e58.audio.sendMessage = function (numberArray, band) {
        var sendingMessage = (band == "A") ? e58.audio.sendingMessageA : e58.audio.sendingMessageB;
        if (sendingMessage.length) {
            return;
        }
        
        sendingMessage = encodeMessage(numberArray);
        
        if (band == "A") {
            e58.audio.sendingMessageA = sendingMessage;
        }
        else {
            e58.audio.sendingMessageB = sendingMessage;
        }
        
        console.log("Sending message on band " + band);
        console.log(numberArray);
        
        setTimeout(
            (band == "A") ? sendQueuedPacketA : sendQueuedPacketB,
            packetIntervalMs);
    }
    
    function sendQueuedPacketA() {
        if (e58.audio.sendingMessageA.length) {
            sendPacket(e58.audio.sendingMessageA.shift(), "A");
            setTimeout(sendQueuedPacketA, packetIntervalMs);
        }        
    }
    
    function sendQueuedPacketB() {
        if (e58.audio.sendingMessageB.length) {
            sendPacket(e58.audio.sendingMessageB.shift(), "B");
            setTimeout(sendQueuedPacketB, packetIntervalMs);
        }        
    }
    
    function sendPacket(packet, band) {
        console.log(packet);
        
        var testBits = [];
        [4, 2, 1].forEach(function (bit, i) {
            if (bit & packet) {
                e58.audio.runCodeHz(i, band);
            }
            testBits.push(Boolean(bit & packet));
        });
        
        var i;
        // for (i = 0; i < packetCountThreshold * 2; i++) {
            e58.audio.receivePacket(testBits, (band == "A") ? "B" : "A");
        // }
    }
    
    function encodeMessage(numberArray) {
        var packets = [];
        packets.push(4);
        
        numberArray.forEach(function (number) {
            packets = packets.concat(encodeNumber(number));
        });
        
        packets = packets.concat(encode4bit(codes.nextMessage));
        
        packets.push(4);
        
        var i = checkAnyConsecutiveIdentical(packets);
        while (i != null) {
            packets.splice(i, 0, 4);
            i = checkAnyConsecutiveIdentical(packets)
        }
        
        return packets;
    }
    
    function checkAnyConsecutiveIdentical(packets) {
        var i;
        for (i = 1; i < packets.length; i++) {
            if (packets[i - 1] == packets[i]) {
                return i;
            }
        }
        return null;
    }
    
    function encodeNumber(number) {
        var i, numberCharacter;
        var packets = [];
        if (number == null) {
            packets = packets.concat(encode4bit(codes.nextNumber));
        }
        else {
            number = Number(number);
            var numberString = number.toString();
            for (i = 0; i < numberString.length; i++) {
                numberCharacter = numberString[i];
                packets = packets.concat(encode4bit(Number(numberCharacter)));
            }
            packets = packets.concat(encode4bit(codes.nextNumber));
        }
        return packets;
    }
    
    function encode4bit(value) {
        return [
            8 & value ? 2 : 1,
            4 & value ? 2 : 1,
            2 & value ? 2 : 1,
            1 & value ? 2 : 1 ];
    }
    
    e58.audio.receivePacket = function (encodedData, band) {
        var packetValue = 0;        
        encodedData.forEach(function (item, i) {
            if (item) {
                packetValue = [4, 2, 1][i];
            }
        });
        
        if (packetValue == 0) {
            return;
        }
        
        var receivingMessage = (band == "A") ? e58.audio.receivingMessageA : e58.audio.receivingMessageB;
        if (receivingMessage.length && receivingMessage[receivingMessage.length - 1] == packetValue) {
            return;
        }
        
        console.log("Receiving packet on band " + band);
        console.log(encodedData, packetValue);
        
        var message;
        if (band == "A") {
            e58.audio.receivingMessageA.push(packetValue);
            message = decodeMessage(e58.audio.receivingMessageA, band);
            if (message) {
                e58.audio.receivingMessageA = [];
                e58.audio.receivedMessageA = message;
            }
        }
        else {
            e58.audio.receivingMessageB.push(packetValue);
            message = decodeMessage(e58.audio.receivingMessageB, band);
            if (message) {
                e58.audio.receivingMessageB = [];
                e58.audio.receivedMessageB = message;
            }
        }
    };
    
    function decode4bit(fourBitData) {
        var byteString = "";
        fourBitData.forEach(function (bit) {
            byteString += (bit == 2) ? "1" : "0";
        });
        return parseInt(byteString, 2);
    }
    
    function decodeMessage(message, band) {
        var i;
        
        // i = checkForWeakPackets(message);
        // while (i && i >= 0) {
            // message.splice(i, 1);
            // i = checkForWeakPackets(message);
        // }
        
        var packets = [];
        message.forEach(function (packet, i) {
            if (i == 0 || packet != packets[packets.length - 1]) {
                packets.push(packet);
            }
        });
        
        if (packets[packets.length - 1] != 4) {
            return null;
        }
        
        packets = packets.filter(function (packet) {
            return packet != 4;
        });
        
        if (!packets.length) {
            return null;
        }
        
        console.log("Filtered packets ");
        console.log(packets);
        
        var numberString = "";
        var numbers = [];
        var fourBitValue;
        for (i = 0; i < packets.length; i += 4) {
            fourBitValue = decode4bit([packets[i], packets[i + 1], packets[i + 2], packets[i + 3]]);
            switch(fourBitValue) {
                case 15:
                    console.log("Received message on band " + band);
                    console.log(numbers);
                    return numbers;
                case 14:
                    numbers.push(numberString ? Number(numberString) : null);
                    numberString = "";
                    break;
                default:
                    numberString += fourBitValue;
                    break;
            }
        }
        
        return null;
    }
        
    // function checkForWeakPackets(packets) {
        // var i;
        // for (i = 0; i < packets.length; i++) {
            // if (getNeighbours(packets, i).filter(p => p == packets[i]).length < packetCountThreshold) {
                // return i;
            // }
        // }
        // return null;
    // }
    
    function getNeighbours(packets, index) {
        var i;
        var neighbours = [];
        for (i = index - packetCountThreshold; i < index + packetCountThreshold; i++) {
            if (i >= 0 && i < packets.length) {
                neighbours.push(packets[i]);
            }
        }
        return neighbours;
    }
        
    e58.audio.getMessage = function (band) {
        if (band == "A") {
            if (e58.audio.receivedMessageA) {
                var message = e58.audio.receivedMessageA;
                e58.audio.receivedMessageA = null;
                return message;
            }
        }
        else {
            if (e58.audio.receivedMessageB) {
                var message = e58.audio.receivedMessageB;
                e58.audio.receivedMessageB = null;
                return message;
            }
        }
    };
    
    window.addEventListener("load", function() {
    });
})();
