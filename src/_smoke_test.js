// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*jshint regexp:false*/

(function() {
	"use strict";

	var child_process = require("child_process");
	var http = require("http");
	var phantomjs = require("phantomjs");

	var runServer = require("./_run_server.js");

	var HOME_PAGE_URL = "http://localhost:5000";

	var serverProcess;

	exports.setUp = function(done) {
		runServer.runProgrammatically(function(process) {
			serverProcess = process;
			done();
		});
	};

	exports.tearDown = function(done) {
		if (!serverProcess) return;

		serverProcess.on("exit", function(code, signal) {
			done();
		});
		serverProcess.kill();
	};

	exports.test_canGetHomePage = function(test) {
		httpGet(HOME_PAGE_URL, function(response, receivedData) {
			var foundHomePage = receivedData.indexOf("WeeWikiPaint home page") !== -1;
			test.ok(foundHomePage, "home page should have contained test marker");
			test.done();
		});
	};

	exports.test_canGet404Page = function(test) {
		httpGet(HOME_PAGE_URL + "/nonexistant.html", function(response, receivedData) {
			var foundHomePage = receivedData.indexOf("WeeWikiPaint 404 page") !== -1;
			test.ok(foundHomePage, "404 page should have contained test marker");
			test.done();
		});
	};

	exports.test_userCanDrawOnPage = function(test) {
		var firefox = require("selenium-webdriver/firefox");
		var By = require("selenium-webdriver").By;

		var driver = new firefox.Driver();

		driver.get(HOME_PAGE_URL);

		driver.executeScript(function() {
			var client = require("./client.js");
			var HtmlElement = require("./html_element.js");

			var drawingArea = HtmlElement.fromId("drawing-area");
			drawingArea.triggerMouseDown(10, 20);
			drawingArea.triggerMouseMove(50, 80);
			drawingArea.triggerMouseUp(50, 60);

			var actual = JSON.stringify(client.drawingAreaCanvas.lineSegments());
			var expected = JSON.stringify([[ "10", "20", "50", "60" ]]);

			if (actual !== expected) return "lines drawn expected " + expected + " but was " + actual;
			else return null;
		});

		driver.quit().then(test.done);
	};

	//exports.test_userCanDrawOnPage = function(test) {
	//	var phantomJsProcess = child_process.spawn(phantomjs.path, ["src/_phantomjs.js"], { stdio: "inherit" });
	//	phantomJsProcess.on("exit", function(code) {
	//		test.equals(code, 0, "PhantomJS test failures");
	//		test.done();
	//	});
	//};

	//exports.test_browsersUsingSelenium_spike_replaceMe = function(test) {
	//	var firefox = require("selenium-webdriver/firefox");
	//	var By = require("selenium-webdriver").By;
	//
	//	var driver = new firefox.Driver();
	//	var promise;
	//
	//	promise = driver.get(HOME_PAGE_URL);
	//	//driver.findElement(By.name("q")).sendKeys("webdriver");
	//	//var promise = driver.findElement(By.name("btnG")).click();
	//
	//	promise.then(function() {
	//		setTimeout(function() {
	//			driver.quit().then(function() {
	//				test.done();
	//			});
	//		}, 2000);
	//	});
	//};

	function httpGet(url, callback) {
		var request = http.get(url);
		request.on("response", function(response) {
			var receivedData = "";
			response.setEncoding("utf8");

			response.on("data", function(chunk) {
				receivedData += chunk;
			});
			response.on("end", function() {
				callback(response, receivedData);
			});
		});
	}

}());