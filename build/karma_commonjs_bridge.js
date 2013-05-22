// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
/*globals require:true */

(function() {
	"use strict";

//	dump(JSON.stringify(window.__karma__.files));

	Object.keys(window.__karma__.files).forEach(function(file) {
		dump("file: " + file);
	});

	window.require = function(filename) {
		dump("REQUIRE CALLED: " + filename);
	};

//	var tests = Object.keys(window.__karma__.files).filter(function (file) {
//	      return /Spec\.js$/.test(file);
//	});

}());