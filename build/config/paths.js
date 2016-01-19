// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var glob = require("glob");
	var path = require("path");

	exports.generatedDir = "generated";
	exports.tempTestfileDir = "generated/test";

	exports.buildDir = "generated/dist";
	exports.buildServerDir = "generated/dist/server";
	exports.buildSharedDir = "generated/dist/shared";
	exports.buildClientDir = "generated/dist/client";
	exports.buildClientIndexHtml = "generated/dist/client/index.html";
	exports.buildClient404Html = "generated/dist/client/404.html";
	exports.buildIntermediateFilesToErase = function() {
		return deglob([
			"./generated/dist/client/_*",
			"./generated/dist/client/bundle.js",
			"./generated/dist/client/screen.css"
		]);
	};

	exports.incrementalDir = "generated/incremental";
	exports.serverTestTarget = "generated/incremental/server.test";
	exports.socketIoTestTarget = "generated/incremental/socketio.test";
	exports.clientTestTarget = "generated/incremental/client.test";
	exports.cssTestTarget = "generated/incremental/css.test";

	exports.karmaConfig = "./build/config/karma.conf.js";

	exports.serverTestFiles = function() {
		return deglob("src/server/**/_*_test.js");
	};

	exports.clientJsTestDependencies = function() {
		return deglob([
			"src/client/js/**/*",
			"src/shared/**/*"
		], [
			"src/client/js/*real_time_network*.js",
			"src/client/js/vendor/socket.io*.js"
		]);
	};

	exports.cssTestDependencies = function() {
		return deglob([
			"src/client/content/**/*",
			"src/shared/**/*"
		]);
	};

	exports.serverFiles = function() {
		return deglob([
			"src/server/**/*.js",
			"src/shared/**/*.js"
		]);
	};

	exports.socketIoFiles = function() {
		return deglob([
			"src/client/js/*real_time_network*.js",
			"src/client/js/vendor/socket.io*.js",

		]);
	};

	exports.smokeTestFiles = function() {
		return deglob("src/_*_test.js");
	};

	exports.lintFiles = function() {
		return deglob([
			"*.js",
			"build/**/*.js",
			"src/client/js/*.js",
			"src/client/content/*.js",
			"src/server/**/*.js",
			"src/shared/**/*.js",
			"src/*.js"
		]);
	};

	exports.lintOutput = function() {
		return exports.lintFiles().map(function(pathname) {
			return "generated/incremental/lint/" + pathname + ".lint";
		});
	};

	exports.lintDirectories = function() {
		return exports.lintOutput().map(function(lintDependency) {
			return path.dirname(lintDependency);
		});
	};

	function deglob(patternsToFind, patternsToIgnore) {
		var globPattern = patternsToFind;
		if (Array.isArray(patternsToFind)) {
			if (patternsToFind.length === 1) {
				globPattern = patternsToFind[0];
			}
			else {
				globPattern = "{" + patternsToFind.join(",") + "}";
			}
		}

		return glob.sync(globPattern, { ignore: patternsToIgnore });
	}

}());