"use strict";

// This program is the same as eperm_no_race.js, but it uses asynchronous fs calls
// rather than synchronous. It works without error on both Mac and Windows.

var fs = require("fs");

var READ_PATH = "read.txt";

fs.writeFileSync(READ_PATH, "foo");

console.log("Opening read stream...");
var readStream = fs.createReadStream(READ_PATH);

readStream.on("open", function () {
	console.log("Read stream opened.");

	console.log("Unlinking read file...");
	fs.unlink(READ_PATH, function () {
		console.log("Unlink successful.");

		console.log("Overwriting read file...");
		fs.writeFile(READ_PATH, "foo2", function () {
			console.log("Overwrite successful.");

			console.log("Closing read stream...");
			readStream.close();
		});
	});
});

readStream.on("close", function () {
	console.log("Read stream closed.");
});
