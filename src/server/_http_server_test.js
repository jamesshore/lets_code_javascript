// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const HttpServer = require("./http_server.js");
	const assert = require("_assert");
	const async = require("async");
	const http = require("http");
	const fs = require("fs");
	const util = require("util");

	const writeFile = util.promisify(fs.writeFile);
	const unlink = util.promisify(fs.unlink);

	const CONTENT_DIR = "generated/test";

	const INDEX_PAGE = "index.html";
	const OTHER_PAGE = "other.html";
	const NOT_FOUND_PAGE = "test404.html";

	const INDEX_PAGE_DATA = "This is index page file";
	const OTHER_PAGE_DATA = "This is another page";
	const NOT_FOUND_DATA = "This is 404 page file";

	const PORT = 5020;
	const BASE_URL = "http://localhost:" + PORT;

	const TEST_FILES = [
		[ CONTENT_DIR + "/" + INDEX_PAGE, INDEX_PAGE_DATA],
		[ CONTENT_DIR + "/" + OTHER_PAGE, OTHER_PAGE_DATA],
		[ CONTENT_DIR + "/" + NOT_FOUND_PAGE, NOT_FOUND_DATA]
	];

	describe("HTTP Server", function() {

		let server = new HttpServer(CONTENT_DIR, NOT_FOUND_PAGE);

		beforeEach(async () => {
			await Promise.all([
				createTestFiles(),
				server.start(PORT)
			]);
		});

		afterEach(async () => {
			await Promise.all([
				deleteTestFiles(),
				server.stop()
			]);
		});

		it("serves files from directory", async () => {
			let [ response, responseData ] = await httpGet(BASE_URL + "/" + INDEX_PAGE);
			assert.equal(response.statusCode, 200, "status code");
			assert.equal(responseData, INDEX_PAGE_DATA, "response text");
		});

		it("sets content-type and charset for HTML files", async () => {
			let [ response ] = await httpGet(BASE_URL + "/" + INDEX_PAGE);
			assert.equal(response.headers["content-type"], "text/html; charset=UTF-8", "content-type header");
		});

		it("supports multiple files", async () => {
			let [ response, responseData ] = await httpGet(BASE_URL + "/" + OTHER_PAGE);
			assert.equal(response.statusCode, 200, "status code");
			assert.equal(responseData, OTHER_PAGE_DATA, "response text");
		});

		it("serves index.html when asked for home page", async () => {
			let [ response, responseData ] = await httpGet(BASE_URL);
			assert.equal(response.statusCode, 200, "status code");
			assert.equal(responseData, INDEX_PAGE_DATA, "response text");
		});

		it("returns 404 when file doesn't exist", async () => {
			let [ response, responseData ] = await httpGet(BASE_URL + "/bargle");
			assert.equal(response.statusCode, 404, "status code");
			assert.equal(responseData, NOT_FOUND_DATA, "404 text");
		});

		it("sets content-type and charset for 404 page", async () => {
			let [ response ] = await httpGet(BASE_URL + "/bargle");
			assert.equal(response.headers["content-type"], "text/html; charset=UTF-8", "content-type header");
		});

		function httpGet(url) {
			return new Promise((resolve, reject) => {
				http.get(url, function(response) {
					let receivedData = "";
					response.setEncoding("utf8");

					response.on("data", function(chunk) {
						receivedData += chunk;
					});
					response.on("error", reject);
					response.on("end", function() {
						resolve([ response, receivedData ]);
					});
				});
			});
		}

	});

	function createTestFiles() {
		return Promise.all(TEST_FILES.map(([ file, data ]) => {
			return writeFile(file, data);
		}));
	}

	function deleteTestFiles() {
		return Promise.all(TEST_FILES.map(([ file ]) => {
			return unlink(file);
		}));
	}

}());