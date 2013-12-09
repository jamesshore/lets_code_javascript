"use strict";

// This program demonstrates a cross-platform inconsistency in Node.js between Mac and Windows.
// It deletes and overwrites a file before closing it.
// It will work on Mac but fail with an EPERM error on Windows.

var fs = require("fs");

var PATH = "read.txt";

fs.writeFileSync(PATH, "foo");

console.log("Opening file");
var fd = fs.openSync(PATH, "r");
console.log("File opened.");

console.log("Unlinking file...");
fs.unlinkSync(PATH);
console.log("Unlink successful.");

console.log("Overwriting file...");
fs.writeFileSync(PATH, "foo2");
console.log("Overwrite successful.");

console.log("Closing file...");
fs.closeSync(fd);
console.log("File closed.")