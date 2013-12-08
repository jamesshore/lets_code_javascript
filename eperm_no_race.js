"use strict";

// This program demonstrates a cross-platform inconsistency in Node.js between Mac and Windows.
// It deletes and overwrites a file before closing it.
// It will work on Mac but fail with an EPERM error on Windows.

var fs = require("fs");

var READ_PATH = "read.txt";

fs.writeFileSync(READ_PATH, "foo");

console.log("Opening read stream...");
var readStream = fs.createReadStream(READ_PATH);

readStream.on("open", function () {
	console.log("Read stream opened.");

	console.log("Unlinking read file...");
	fs.unlinkSync(READ_PATH);
	console.log("Unlink successful.");

	console.log("Overwriting read file...");
	fs.writeFileSync(READ_PATH, "foo2");
	console.log("Overwrite successful.");

	console.log("Closing read stream...");
	readStream.close();
});

readStream.on("close", function () {
	console.log("Read stream closed.");
});
