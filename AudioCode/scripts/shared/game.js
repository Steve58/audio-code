// shared
// Shared utilities

"use strict";

(function () {
    window.g58 = window.g58 || {};
    window.g58.game = g58.game || {};
    
    
    window.addEventListener("load", function (event) {
        var goButton = document.querySelector("#gameButtons #go");

        goButton.addEventListener("click", function (event) {
            g58.game.canvas.clear();
        });
        
        g58.game.canvas = e58.canvas.getNew("gameCanvas");
    });
})();
