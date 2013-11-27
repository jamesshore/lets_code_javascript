// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
(function () {
	"use strict";

	var http = require("http");
	var fs = require("fs");
	var assert = require("assert");
	var send = require("send");

	var server;

	var CONTENT_DIR = "generated/test";

	var INDEX_PAGE = "index.html";
	var NOT_FOUND_PAGE = "test404.html";

	var INDEX_PAGE_DATA = "This is index page file";

	var PORT = 5020;
	var BASE_URL = "http://localhost:" + PORT;

	exports.unifiedTestCase = function (test) {
		server = http.createServer();
		server.on("request", function(request, response) {
			response.end("foo");
//			send(request, request.url).
//					root(CONTENT_DIR).
//					pipe(response);
		});
		server.listen(PORT, function() {

			var path = CONTENT_DIR + "/" + INDEX_PAGE;
			fs.writeFileSync(path, INDEX_PAGE_DATA);

			http.get(BASE_URL + "/" + INDEX_PAGE, function (response) {
				response.on("data", function() {});
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