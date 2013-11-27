// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
(function () {
	"use strict";

	var http = require("http");
	var fs = require("fs");
	var assert = require("assert");

	var server;

	var CONTENT_DIR = "generated/test";

	var READ_FILE = "read.txt";
	var WRITE_FILE = "write.txt";

	var INDEX_PAGE_DATA = "This is index page file";

	var PORT = 5020;
	var BASE_URL = "http://localhost:" + PORT;

	exports.fileSystemEpermTestCase = function (test) {
		var readPath = CONTENT_DIR + "/" + READ_FILE;
		var writePath = CONTENT_DIR + "/" + WRITE_FILE;

		fs.writeFileSync(readPath, INDEX_PAGE_DATA);

		var readStream = fs.createReadStream(readPath);
		var writeStream = fs.createWriteStream(writePath);

		readStream.pipe(writeStream);

		readStream.on("close", function () {
			console.log("Read stream CLOSED!");
			test.done();
		});

		writeStream.on("finish", function () {
			console.log("Write stream FINISH!");
			console.log("Read file UNLINK...");
			fs.unlinkSync(readPath);
//			fs.unlink(readPath, function () {
			console.log("Done! Read file WRITE...");
			fs.writeFileSync(readPath, INDEX_PAGE_DATA);
			console.log("Done!");
//			});
		});
	};

//	exports.httpEpermTestCase = function (test) {
//		var path = CONTENT_DIR + "/" + READ_FILE;
//
//
//		server = http.createServer();
//		server.on("request", function(request, response) {
//			var stream = fs.createReadStream(path);
//			stream.pipe(response);
//
//			stream.on("close", function() {
//				console.log("File reading stream CLOSED!");
//			});
//
//			response.on("finish", function() {
//				console.log("Server response FINISH!");
//			});
//
//
////			fs.readFile(path, function(err, fileContents) {
////				response.end(fileContents);
////			});
//		});
//		server.listen(PORT, function() {
//
//			fs.writeFileSync(path, INDEX_PAGE_DATA);
//
//			http.get(BASE_URL + "/" + READ_FILE, function (response) {
//				response.on("data", function(chunk) {
//					console.log("DATA: " + chunk);
//				});
//				response.on("error", function(err) {
//					console.log("ERROR", err);
//				});
//				response.on("end", function () {
//					server.close(function() {
//						fs.unlinkSync(path);
////									fs.unlink(path, function() {
//						fs.writeFileSync(path, INDEX_PAGE_DATA);
//						test.done();
////									});
//					});
//				});
//			});
//		});
//
//	};

}());