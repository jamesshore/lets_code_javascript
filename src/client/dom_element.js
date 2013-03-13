// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global wwp:true, $, jQuery */

window.wwp = window.wwp || {};

(function() {
	"use strict";

	var DomElement = wwp.DomElement = function(jqueryElement) {
		this.element = jqueryElement;
	};

	DomElement.prototype.onMouseDown = function(callback) {
		var self = this;
		this.element.mousedown(function(event) {
			var offset = self.relativeOffset(event.pageX, event.pageY);
			callback(offset, event);
		});
	};

	DomElement.prototype.onMouseMove = function(callback) {
		var self = this;
		this.element.mousemove(function(event) {
			var offset = self.relativeOffset(event.pageX, event.pageY);
			callback(offset);
		});
	};

	DomElement.prototype.onMouseLeave = function(callback) {
		this.element.mouseleave(callback);
	};

	DomElement.prototype.onMouseUp = function(callback) {
		this.element.mouseup(callback);
	};

	DomElement.prototype.onTouchStart = function(callback) {
		var self = this;
		this.element.on("touchstart", function(event) {
			var originalEvent = event.originalEvent;
			var pageX = originalEvent.touches[0].pageX;
			var pageY = originalEvent.touches[0].pageY;

			var offset = self.relativeOffset(pageX, pageY);
			callback(offset, event);
		});
	};

	DomElement.prototype.onTouchMove = function(callback) {
		this.element.on("touchmove", callback);
	};

	DomElement.prototype.onTouchEnd = function(callback) {
		this.element.on("touchend", callback);
	};

	DomElement.prototype.onTouchCancel = function(callback) {
		this.element.on("touchcancel", callback);
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