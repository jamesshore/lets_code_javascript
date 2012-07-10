task("default", ["lint"]);

desc("Lint everything");
task("lint", [], function() {
	var lint = require("./build/lint/lint_runner.js");
	lint.validateFile("jakefile.js", {}, {});
});
