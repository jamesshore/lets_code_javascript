// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
/*globals require:true */

(function() {
	"use strict";


//	Object.keys(window.__karma__.files).forEach(function(file) {
//		dump("file: " + file);
//	});

//	dump(JSON.stringify(window.__karma__.files));

	var cachedModules = {};

	var require = window.__karma__.CJSRequire = function(dependency) {
		dump("REQUIRED: " + dependency);

		var basepath = "/Users/jshore/Documents/Projects/weewikipaint/src/client";

		// normalize (this code sucks, fix me please!)
		var dependencyPath;
		if (dependency.charAt(0) === "/") {
			dependencyPath = dependency;
		}
		else {
			var dependencyRegex = /^\.\/(.*)$/;
			var filePart = dependencyRegex.exec(dependency)[1];
			var dependencyPath = basepath + "/" + filePart;
		}

		// find module
		var moduleFn = window.__karma__.CJSModules[dependencyPath];
		if (moduleFn === undefined) throw new Error("Could not find module [" + dependency + "]");

		// run the module (if necessary)
		var module = cachedModules[dependencyPath];
		if (module === undefined) {
			dump("EXECUTING: " + dependency);
			module = { exports: {} };
			moduleFn(require, module, module.exports);
			cachedModules[dependencyPath] = module;
		}
		return module.exports;
	};

	for (var modulePath in window.__karma__.CJSModules) {
		require(modulePath);
	};



//	window.require = function(filename) {
//		dump("REQUIRE CALLED: " + filename);
//	};

//	var tests = Object.keys(window.__karma__.files).filter(function (file) {
//	      return /Spec\.js$/.test(file);
//	});

}());