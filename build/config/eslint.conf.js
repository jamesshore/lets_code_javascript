// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	exports.options = {
		"parserOptions": {
			"ecmaVersion": 2017
		},
		"env": {
			"browser": true,
			"node": true,
			"commonjs": true
		},
		"extends": "eslint:recommended",
		"rules": {
			"semi": [
				"error",
				"always"
			]
		}
	};

}());
