// shared
// Shared utilities

"use strict";

(function () {
    window.s58 = window.s58 || {};
    s58.shared = s58.shared || {};

    s58.HALFPI  = 0.5 * Math.PI;
    s58.PI      = 1.0 * Math.PI;
    s58.PIHALF  = 1.5 * Math.PI;
    s58.TWOPI   = 2.0 * Math.PI;
    s58.THREEPI = 3.0 * Math.PI;
    s58.FOURPI  = 4.0 * Math.PI;

    window.addEventListener("error", function (event) {
        if (s58.vars && s58.vars.alertOnError) {
            alert("error: " + event.message);
        }
    });

    s58.isChrome = (window.navigator.userAgent.search("Chrome") >= 0);

    s58.isFirefox = (window.navigator.userAgent.search("Firefox") >= 0);
    
    s58.sign = function (value) {
        return value && value > 0 ? 1 : -1;
    };

    s58.sort = function () {
        var i;
        var values = arguments.length > 1 ? arguments : arguments[0];
        var valuesCopy = [];
        for (i = 0; i < values.length; i++) {
            valuesCopy.push(values[i]);
        }
        return valuesCopy.sort(function (a, b) {
            return a > b;
        });    
    };

    s58.min = function () {
        var values = arguments.length > 1 ? arguments : arguments[0];
        return s58.sort(values)[0];
    };

    s58.max = function () {
        var values = arguments.length > 1 ? arguments : arguments[0];
        return s58.sort(values).reverse()[0];
    };

    s58.degToRad = function (degrees) {
        return (degrees || 0) / 180 * s58.PI;
    };

    s58.radToDeg = function (radians) {
        return (radians || 0) / s58.PI * 180;
    };

    // Returns an equivalent angle in the range -PI to +PI
    s58.radPiToPi = function (radians) {
        radians = radians || 0;
        while (radians < s58.PI) {
            radians += s58.TWOPI;
        }
        while (radians > s58.PI) {
            radians -= s58.TWOPI;
        }
        return radians;
    };

    s58.rgba = function () {
        var r = 0, g = 0, b = 0, a = 1.0;
        switch (arguments.length) {
            case 4:
                a = arguments[3];
            case 3:
                r = arguments[0];
                g = arguments[1];
                b = arguments[2];
                break;
            case 2:
                a = arguments[1];
            case 1:
                if (typeof arguments[0] == "string") {
                    r = g = b = arguments[0];
                }
                else if (arguments[0].length == 4) {
                    a = arguments[0][1];
                }
                if (arguments[0].length >= 3) {
                    r = arguments[0][0];
                    g = arguments[0][1];
                    b = arguments[0][2];
                }
                else if (arguments[0].length == 1) {
                    r = g = b = arguments[0][0];
                }
                else {
                    r = g = b = arguments[0];
                }
                break;
            default:
                break;
        }
        return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
    };
})();
