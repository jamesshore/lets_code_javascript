// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
/*globals require:true */

(function() {
	"use strict";


//	Object.keys(window.__karma__.files).forEach(function(file) {
//		dump("file: " + file);
//	});

//	dump(JSON.stringify(window.__karma__.files));

	var cachedModules = {};

	function requireFn(basepath) {
		return function(dependency) {
			return require(basepath, dependency);
		};
	};

	var require = window.__karma__.CJSRequire = function(basepath, dependency) {
		console.log("REQUIRED: " + dependency + " FROM: " + basepath);


		var dependencyPath = normalizePath(basepath, dependency);

		// find module
		var moduleFn = window.__karma__.CJSModules[dependencyPath];
		if (moduleFn === undefined) throw new Error("Could not find module '" + dependency + "' from '" + basepath + "'");

		// run the module (if necessary)
		var module = cachedModules[dependencyPath];
		if (module === undefined) {
			console.log("EXECUTING: " + dependency);
			module = { exports: {} };
			moduleFn(requireFn(basepath), module, module.exports);
			cachedModules[dependencyPath] = module;
		}
		return module.exports;
	};

	for (var modulePath in window.__karma__.CJSModules) {
		require(modulePath, modulePath);
	};

	function normalizePath(basePath, relativePath) {
		if (isFullPath(relativePath)) return relativePath;
		if (!isFullPath(basePath)) throw new Error("basePath should be full path, but was [" + basePath + "]");

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

		function isFullPath(path) {
			var unixFullPath = (path.charAt(0) === "/");
			var windowsFullPath = (path.indexOf(":") !== -1);

			return unixFullPath || windowsFullPath;
		}
	}


//	window.require = function(filename) {
//		dump("REQUIRE CALLED: " + filename);
//	};

//	var tests = Object.keys(window.__karma__.files).filter(function (file) {
//	      return /Spec\.js$/.test(file);
//	});

}());