var fs = require("fs");
var assert = require("assert");

var READ_FILE = "read.txt";
var WRITE_FILE = "write.txt";

var readPath = READ_FILE;
var writePath = WRITE_FILE;

fs.writeFileSync(readPath, "foo");

var readStream = fs.createReadStream(readPath);
var writeStream = fs.createWriteStream(writePath);

console.log("Starting pipe...");
readStream.pipe(writeStream);

readStream.on("close", function() {
	console.log("Read stream closed.");
});

writeStream.on("finish", function() {
	console.log("Write stream finished.");

	console.log("File unlink...");
	fs.unlinkSync(readPath);
	console.log("Unlink successful.");

	console.log("File write...");
	fs.writeFileSync(readPath, "foo");
	console.log("Write successful");
});
