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
		var basepath = "/Users/jshore/Documents/Projects/weewikipaint/src/client/html_element.js";

		var dependencyPath = normalizePath(basepath, dependency);

		// find module
		var moduleFn = window.__karma__.CJSModules[dependencyPath];
		if (moduleFn === undefined) throw new Error("Could not find module [" + dependency + "]");

		// run the module (if necessary)
		var module = cachedModules[dependencyPath];
		if (module === undefined) {
			module = { exports: {} };
			moduleFn(require, module, module.exports);
			cachedModules[dependencyPath] = module;
		}
		return module.exports;
	};

	for (var modulePath in window.__karma__.CJSModules) {
		require(modulePath);
	};

	function normalizePath(basePath, relativePath) {
		if (relativePath.charAt(0) === "/") return relativePath;
		if (basePath.charAt(0) !== "/") throw new Error("basePath should start with '/', but was [" + basePath + "]");

		var baseComponents = basePath.split("/");
		var relativeComponents = relativePath.split("/");

		baseComponents.pop();     // remove file portion of basePath before starting
		while (relativeComponents.length > 0) {
			var nextComponent = relativeComponents.shift();

			if (nextComponent === ".") continue;
			else if (nextComponent === "..") baseComponents.pop();
			else baseComponents.push(nextComponent);
		}
		return baseComponents.join("/");
	}


//	window.require = function(filename) {
//		dump("REQUIRE CALLED: " + filename);
//	};

//	var tests = Object.keys(window.__karma__.files).filter(function (file) {
//	      return /Spec\.js$/.test(file);
//	});

}());