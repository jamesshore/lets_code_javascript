// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global wwp:true, $, jQuery */

window.wwp = window.wwp || {};

(function() {
	"use strict";

	var DomElement = wwp.DomElement = function(jqueryElement) {
		this.element = jqueryElement;
	};

	DomElement.prototype.onSelectStart_ie8Only = function(callback) {
		this.element.on("selectstart", callback);
	};

	DomElement.prototype.onMouseDown = function(callback) {
		this.element.mousedown(mouseEventHandlerFn(this, callback));
	};

	DomElement.prototype.onMouseMove = function(callback) {
		var self = this;
		this.element.mousemove(mouseEventHandlerFn(this, callback));
	};

	DomElement.prototype.onMouseLeave = function(callback) {
		this.element.mouseleave(mouseEventHandlerFn(this, callback));
	};

	DomElement.prototype.onMouseUp = function(callback) {
		this.element.mouseup(mouseEventHandlerFn(this, callback));
	};

	function mouseEventHandlerFn(self, callback) {
		return function(event) {
			var offset = self.relativeOffset(event.pageX, event.pageY);
			callback(offset, event);
		};
	}

	DomElement.prototype.onSingleTouchStart = function(callback) {
		this.element.on("touchstart", oneTouchEventHandlerFn(this, callback));
	};

	DomElement.prototype.onSingleTouchMove = function(callback) {
		this.element.on("touchmove", oneTouchEventHandlerFn(this, callback));
	};

	DomElement.prototype.onSingleTouchEnd = function(callback) {
		this.element.on("touchend", oneTouchEventHandlerFn(this, callback));
	};

	DomElement.prototype.onSingleTouchCancel = function(callback) {
		this.element.on("touchcancel", oneTouchEventHandlerFn(this, callback));
	};

	function oneTouchEventHandlerFn(self, callback) {
		return function(event) {
			var originalEvent = event.originalEvent;
			if (originalEvent.touches.length !== 1) return;

			var pageX = originalEvent.touches[0].pageX;
			var pageY = originalEvent.touches[0].pageY;

			var offset = self.relativeOffset(pageX, pageY);
			callback(offset, event);
		};
	}

	DomElement.prototype.onMultiTouchStart = function(callback) {
		var self = this;
		this.element.on("touchstart", function(event) {
			var originalEvent = event.originalEvent;
			if (originalEvent.touches.length !== 1) callback();
		});
	};

	DomElement.prototype.relativeOffset = function(pageX, pageY) {
		var pageOffset = this.element.offset();

		return {
			x: pageX - pageOffset.left,
			y: pageY - pageOffset.top
		};
	};

	DomElement.prototype.pageOffset = function(relativeX, relativeY) {
		var topLeftOfDrawingArea = this.element.offset();
		return {
			x: relativeX + topLeftOfDrawingArea.left,
			y: relativeY + topLeftOfDrawingArea.top
		};
	};

}());