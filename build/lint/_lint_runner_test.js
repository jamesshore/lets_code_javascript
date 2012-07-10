/* Copyright (c) 2012 James Shore - See README.txt for license */
"use strict";

var expect = require("expect.js");
var assert = require("assert");
var fs = require("fs");
var path = require("path");

var lint = require("../lib/lint_runner.js");
var testDir = "build/temp_files/";

// console inspection code inspired by http://userinexperience.com/?p=714
function TestConsole(newFunction) {
	var original;
	this.redirect = function(newFunction) {
		assert.ok(!original, "Console already redirected");
		original = console.log;
		console.log = newFunction;
	};
	this.ignore = function() {
		this.redirect(function() {});
	};
	this.restore = function() {
		assert.ok(original, "Console not redirected");
		console.log = original;
		original = null;
	};
}

function inspectConsole(test) {
	var output = [];
	var console = new TestConsole();
	console.redirect(function(string) {
		output.push(string);
	});
	test(output);
	console.restore();
}

var testConsole = new TestConsole();

beforeEach(function() {
	testConsole.ignore();
});

afterEach(function() {
	testConsole.restore();
});


describe("Source code validation", function() {
	it("should pass good source code", function(){
		expect(lint.validateSource("var a = 1;")).to.be(true);
	});

	it("should fail bad source code", function() {
		expect(lint.validateSource("bargledy-bargle")).to.be(false);
	});

	it("should respect options", function() {
		expect(lint.validateSource("a = 1", { asi: true })).to.be(true);
	});

	it("should respect globals", function() {
		expect(lint.validateSource("a = 1;", { undef: true }, { a: true })).to.be(true);
	});
});

describe("File validation", function() {
	var testFile = testDir + "file-validation.js";

	function writeTestFile(sourceCode) {
		fs.writeFileSync(testFile, sourceCode);
	}

	afterEach(function() {
		if (path.existsSync(testFile)) fs.unlinkSync(testFile);
		assert.ok(!path.existsSync(testFile), "Could not delete test file: " + testFile);
	});

	it("should load file from file system (UTF-8 assumed)", function() {
		writeTestFile("var a = 1");
		expect(lint.validateFile(testFile)).to.be(false);
	});

	it("should respect options", function() {
		writeTestFile("a = 1");
		expect(lint.validateFile(testFile, { asi: true })).to.be(true);
	});

	it("should respect globals", function() {
		writeTestFile("a = 1;");
		expect(lint.validateFile(testFile, { undef: true }, { a: true })).to.be(true);
	});

	it("should report filename", function() {
		inspectConsole(function(output) {
			writeTestFile("");
			lint.validateFile(testFile);
			expect(output).to.eql([testFile + " ok"]);
		});
	});
});

describe("File list validation", function() {
	var testRoot = testDir + "file-list-validation.js-";
	var testFiles;

	beforeEach(function() {
		testFiles = [];
	});

	function writeTestFiles() {
		for (var i = 0; i < arguments.length; i++) {
			var testFile = testRoot + i;
			fs.writeFileSync(testFile, arguments[i]);
			testFiles.push(testFile);
		}
	}

	afterEach(function() {
		testFiles.forEach(function(testFile) {
			fs.unlinkSync(testFile);
			assert.ok(!path.existsSync(testFile), "Could not delete test file: " + testFile);
		});
	});

	it("should respect options", function() {
		writeTestFiles("var a=1");
		expect(lint.validateFileList(testFiles, { asi: true })).to.be(true);
	});

	it("should respect globals", function() {
		writeTestFiles("a = 1;");
		expect(lint.validateFileList(testFiles, { undef: true }, { a: true })).to.be(true);
	});

	it("should pass when all files valid", function() {
		writeTestFiles("var a=1;", "var b=1;", "var c=1;");
		expect(lint.validateFileList(testFiles)).to.be(true);
	});

	it("should fail when any file invalid", function() {
		writeTestFiles("var a=1;", "var b=1;", "YARR", "var d=1;");
		expect(lint.validateFileList(testFiles)).to.be(false);
	});

	it("should report filenames", function() {
		inspectConsole(function(output) {
			writeTestFiles("var a=1;", "var b=1;", "var c=1;");
			lint.validateFileList(testFiles);
			expect(output).to.eql([
				testFiles[0] + " ok",
				testFiles[1] + " ok",
				testFiles[2] + " ok"
			]);
		});
	});

	it("should validate later files even if early file fails", function() {
		inspectConsole(function(output) {
			writeTestFiles("YARR=1", "var b=1;", "var c=1;");
			lint.validateFileList(testFiles);
			expect(output[0]).to.eql(testFiles[0] + " failed");
			expect(output[3]).to.eql(testFiles[1] + " ok");
			expect(output[4]).to.eql(testFiles[2] + " ok");
		});
	});
});

describe("Error reporting", function() {
	it("should say 'ok' on pass", function() {
		inspectConsole(function(output) {
			lint.validateSource("");
			expect(output).to.eql(["ok"]);
		});
	});

	it("should report errors on failure", function() {
		inspectConsole(function(output) {
			lint.validateSource("foo;");
			expect(output).to.eql([
				"failed",
				"1: foo;",
				"   Expected an assignment or function call and instead saw an expression."
			]);
		});
	});

	it("should report all errors", function() {
		inspectConsole(function(output) {
			lint.validateSource("foo;\nbar()");
			expect(output).to.eql([
				"failed",
				"1: foo;",
				"   Expected an assignment or function call and instead saw an expression.",
				"2: bar()",
				"   Missing semicolon."
			]);
		});
	});

	it("should trim whitespace from source code", function() {
		inspectConsole(function(output) {
			lint.validateSource("   foo()\t \n");
			expect(output[1]).to.eql("1: foo()");
		});
	});

	it("should include optional description", function() {
		inspectConsole(function(output) {
			lint.validateSource("", {}, {}, "code A");
			expect(output[0]).to.eql("code A ok");
		});
		inspectConsole(function(output) {
			lint.validateSource("foo;", {}, {}, "code B");
			expect(output[0]).to.eql("code B failed");
		});
	});

	// To do: Some edge cases that I don't know how to trigger, so haven't tested or supported:
	// 1- two reasons in a row (line number & evidence undefined); may not occur in current version
	// 2- null element at end of errors array; occurs when JSHint catches exception
});
