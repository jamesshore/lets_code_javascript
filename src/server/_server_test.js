// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
(function () {
	"use strict";

	var http = require("http");
	var fs = require("fs");
	var assert = require("assert");

	var server;

	var CONTENT_DIR = "generated/test";

	var INDEX_PAGE = "index.html";

	var INDEX_PAGE_DATA = "This is index page file";

	var PORT = 5020;
	var BASE_URL = "http://localhost:" + PORT;

	exports.unifiedTestCase = function (test) {
		var path = CONTENT_DIR + "/" + INDEX_PAGE;


		server = http.createServer();
		server.on("request", function(request, response) {
			var stream = fs.createReadStream(path);
			stream.pipe(response);



//			fs.readFile(path, function(err, fileContents) {
//				response.end(fileContents);
//			});
		});
		server.listen(PORT, function() {

			fs.writeFileSync(path, INDEX_PAGE_DATA);

			http.get(BASE_URL + "/" + INDEX_PAGE, function (response) {
				response.on("data", function(chunk) {
					console.log("DATA: " + chunk);
				});
				response.on("error", function(err) {
					console.log("ERROR", err);
				});
				response.on("end", function () {
					server.close(function() {
						fs.unlinkSync(path);
//									fs.unlink(path, function() {
						fs.writeFileSync(path, INDEX_PAGE_DATA);
						test.done();
//									});
					});
				});
			});
		});

	};

}());