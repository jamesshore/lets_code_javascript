// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";


	exports.backgroundColor = function backgroundColor(element) {
		return normalizeColorString(element.getRawStyle("background-color"));
	};

	exports.fontFamily = function fontFamily(element) {
		var family = element.getRawStyle("font-family");
		family = family.replace(/\"/g, '');

		var fonts = family.split(",");
		for (var i = 0; i < fonts.length; i++) {
			fonts[i] = trim(fonts[i]);
		}

		return fonts.join(", ");
	};

	// Based on MDN code at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
	function trim(str) {
		var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
		return str.replace(rtrim, '');
	}

	function normalizeColorString(color) {
		if (color === "white") return "rgb(255, 255, 255)";
		if (color === "transparent") return "rgba(0, 0, 0, 0)";

		var colorGroups = color.match(/^#(..)(..)(..)/);    // look for presence of #rrggbb string
		if (colorGroups === null) return color;   // if doesn't match, assume we have rgb() string

		var r = parseInt(colorGroups[1], 16);
		var g = parseInt(colorGroups[2], 16);
		var b = parseInt(colorGroups[3], 16);
		return "rgb(" + r + ", " + g + ", " + b + ")";
	}

}());