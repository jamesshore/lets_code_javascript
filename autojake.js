// Thanks to Davide Alberto Molin for contributing this code.
// See http://www.letscodejavascript.com/v3/comments/live/7 for details.

(function() {
	"use strict";

	var gaze = require("gaze");
	var spawn = require("child_process").spawn;

	var buildRunning = false;

	gaze("src/**/*.js", function(err, watcher) {
		watcher.on("all", function(evt, filepath) {
			if (buildRunning) return;
			buildRunning = true;

			console.log("\n> jake");
			var jake = spawn("node_modules/.bin/jake", [], { stdio: "inherit" });

			jake.on("exit", function(code) {
				buildRunning = false;
			});
		});
	});

}());
