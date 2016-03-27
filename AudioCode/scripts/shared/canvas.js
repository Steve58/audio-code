// Canvas
// Wraps an html5 canvas

"use strict";

(function () {
    window.e58 = window.e58 || {};
    e58.canvas = e58.canvas || {};

	function _Canvas(options) {
		var _instance = this;
        _instance.className = "e58.canvas";

		_instance.htmlElement = document.getElementById(options.htmlId);
		_instance.htmlElement.requestPointerLock =
			_instance.htmlElement.requestPointerLock ||
			_instance.htmlElement.mozRequestPointerLock ||
			_instance.htmlElement.webkitRequestPointerLock;
		
		_instance.width = null;
		_instance.height = null;
		_instance.clearColour = options.clearColour || "#ffffff";
				
		_instance.updateDimensions = function() {
			_instance.width = _instance.htmlElement.clientWidth;
			_instance.height = _instance.htmlElement.clientHeight;
			_instance.htmlElement.setAttribute("width", _instance.width);
			_instance.htmlElement.setAttribute("height", _instance.height);
			_instance.htmlElement.width = _instance.width;
			_instance.htmlElement.height = _instance.height;
		};
		
		_instance.getContext = function (strokeStyle, fillStyle, lineWidth) {
			var context = _instance.htmlElement.getContext("2d");
			context.lineWidth = lineWidth || 0.5;
            context.strokeStyle = strokeStyle || _instance.clearColour;
			context.fillStyle = fillStyle || _instance.clearColour;
			context.lineCap = "round";
			context.lineJoin = "round";
			return context;
		};
		
		_instance.clear = function () {
			var context = _instance.getContext();
			context.fillRect(0, 0, _instance.width, _instance.height);
		};
		
        _instance.context = null;
        _instance.startContext = function (strokeStyle, fillStyle, lineWidth) {
            _instance.context = _instance.getContext(strokeStyle, fillStyle, lineWidth);
            return _instance.context;
        };

        _instance.setLineWidth = function (lineWidth) {
            _instance.context.lineWidth = lineWidth;
        };

        _instance.setLineColour = function (strokeStyle) {
            _instance.context.strokeStyle = strokeStyle;
        };

        _instance.setFillColour = function (fillStyle) {
            _instance.context.fillStyle = fillStyle;
        };

        _instance.beginPath = function () {
            _instance.context.beginPath();
        };
        _instance.closePath = function () {
            _instance.context.closePath();
        };
        _instance.stroke = function () {
            _instance.context.stroke();
        };
        _instance.fill = function () {
            _instance.context.fill();
        };
        _instance.moveTo = function (x, y) {
            var drawPoint = getDrawPoint(x, y);
            _instance.context.moveTo(drawPoint.x, drawPoint.y);
        };
        _instance.lineTo = function (x, y) {
            var drawPoint = getDrawPoint(x, y);
            _instance.context.lineTo(drawPoint.x, drawPoint.y);
        };
        _instance.arc = function (x, y, radius, startRad, endRad) {
            var drawPoint = getDrawPoint(x, y);
            _instance.context.arc(drawPoint.x, drawPoint.y, radius, startRad, endRad);
        };

        _instance.fillText = function (text, sizePx, align, baseline) {
            _instance.context.font = ""
                + "normal "
                + (sizePx || 20) + "px "
                + "Verdana, Geneva, sans-serif";
            _instance.context.textAlign = align || "center";
            _instance.context.textBaseline = baseline || "middle";
            var drawPoint = getDrawPoint(0, 0);
            _instance.context.fillText(text, drawPoint.x, drawPoint.y);
        };

        _instance.getDimensions = function () {
            var w = _instance.width;
            var h = _instance.height;
            return {
                w: w,
                h: h,
                x: w,
                y: h,
                min: (w < h) ? w: h,
                max: (w > h) ? w: h
            };
        };

        _instance.drawOrigin = { x: 0, y: 0 };
        _instance.setDrawOrigin = function (x, y, xo, yo) {
            xo = xo || 0;
            yo = yo || 0;

            _instance.drawOrigin = {
                x: 0.5 * _instance.width  * (1 + xo) + x,
                y: 0.5 * _instance.height * (1 - yo) - y
            };
        };

        function getDrawPoint(x, y) {
            return {
                x: _instance.drawOrigin.x + x,
                y: _instance.drawOrigin.y - y
            };
        }

		_instance.updateDimensions();
	}

	e58.canvas.getNew = function (htmlId, clearColour) {
		return new _Canvas({
			htmlId: htmlId,
			clearColour: clearColour
		});
	};
})();

