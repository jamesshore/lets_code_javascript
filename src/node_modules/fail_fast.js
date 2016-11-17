// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
(function() {
	"use strict";

	exports.unlessDefined = function(variable, variableName) {
		variableName = variableName ? " [" + variableName + "] " : " ";
		if (variable === undefined) throw new FailFastException(exports.unlessDefined, "Required variable" + variableName + "was not defined");
	};

	exports.unlessTrue = function(variable, message) {
		if (message === undefined) message = "Expected condition to be true";

		if (variable === false) throw new FailFastException(exports.unlessTrue, message);
		if (variable !== true) throw new FailFastException(exports.unlessTrue, "Expected condition to be true or false");
	};

	exports.unreachable = function(message) {
		if (!message) message = "Unreachable code executed";

		throw new FailFastException(exports.unreachable, message);
	};

	var FailFastException = exports.FailFastException = function(fnToRemoveFromStackTrace, message) {
		if (Error.captureStackTrace) Error.captureStackTrace(this, fnToRemoveFromStackTrace);    // only works on Chrome/V8
		this.message = message;
	};
	FailFastException.prototype = new Error();
	FailFastException.prototype.constructor = FailFastException;
	FailFastException.prototype.name = "FailFastException";

}());