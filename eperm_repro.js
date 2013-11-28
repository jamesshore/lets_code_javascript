"use strict";

console.log("Starting timeout...");
setTimeout(function () {
	var fs = require("fs");

	var READ_PATH = "read.txt";
	var WRITE_PATH = "write.txt";

	fs.writeFileSync(READ_PATH, "foo");

	var readStream = fs.createReadStream(READ_PATH);
	var writeStream = fs.createWriteStream(WRITE_PATH);

	console.log("Starting pipe...");
	readStream.pipe(writeStream);

	readStream.on("close", function () {
		console.log("Read stream closed.");
	});

	writeStream.on("finish", function () {
		console.log("Write stream finished.");

		console.log("File unlink...");
		fs.unlinkSync(READ_PATH);
		console.log("Unlink successful.");

		console.log("File write...");
		fs.writeFileSync(READ_PATH, "foo");
		console.log("Write successful");
	});
}, 1000);