// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
(function() {
	"use strict";

	var jake = require("jake");

	var run = exports.run = function(oneCommand, successCallback, failureCallback, options) {
		options = options || {};
		var suppressOutput = (options.suppressOutput === true);

		var stdout = "";
		var child = jake.createExec(oneCommand);
		child.on("stdout", function(data) {
			if (!suppressOutput) process.stdout.write(data);
			stdout += data;
		});
		child.on("stderr", function(data) {
			process.stderr.write(data);
		});
		child.on("cmdEnd", function() {
			successCallback(stdout);
		});
		child.on("error", function() {
			failureCallback(stdout);
		});

		if (!suppressOutput) console.log("> " + oneCommand);
		child.run();
	};

	exports.runMany = function(commands, successCallback, failureCallback) {
		var stdout = [];
		function serializedSh(command) {
			if (command) {
				run(command, function(oneStdout) {
					stdout.push(oneStdout);
					serializedSh(commands.shift());
				}, failureCallback);
			}
			else {
				successCallback(stdout);
			}
		}
		serializedSh(commands.shift());
	};

}());