"use strict";

// This program is the same as eperm_repro.js, but it uses asynchronous fs calls
// rather than synchronous. It works without error on both Mac and Windows.

var fs = require("fs");
"use strict";

var PATH = "read.txt";

fs.writeFileSync(PATH, "foo");

console.log("Opening file");
var fd = fs.openSync(PATH, "r");
console.log("File opened.");

console.log("Unlinking file...");
fs.unlink(PATH, function () {
	console.log("Unlink successful.");

	console.log("Overwriting file...");
	fs.writeFile(PATH, "foo2", function () {
		console.log("Overwrite successful.");

		console.log("Closing file...");
		fs.closeSync(fd);
		console.log("File closed.");
	});
});