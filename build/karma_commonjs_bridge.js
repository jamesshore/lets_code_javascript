// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
/*globals require:true */

(function() {
	"use strict";


//	Object.keys(window.__karma__.files).forEach(function(file) {
//		dump("file: " + file);
//	});

//	dump(JSON.stringify(window.__karma__.files));

	window.__karma__.CJSModules = {};
	window.__karma__.CJSRequire = function(dependency) {
		var basepath = "/Users/jshore/Documents/Projects/weewikipaint/src/client";

		// normalize
		var dependencyRegex = /^\.\/(.*)$/;
		var filePart = dependencyRegex.exec(dependency)[1];
		var dependencyPath = basepath + "/" + filePart;

		var exports = window.__karma__.CJSModules[dependencyPath].exports;
		return exports;
	};

//	window.require = function(filename) {
//		dump("REQUIRE CALLED: " + filename);
//	};

//	var tests = Object.keys(window.__karma__.files).filter(function (file) {
//	      return /Spec\.js$/.test(file);
//	});

}());