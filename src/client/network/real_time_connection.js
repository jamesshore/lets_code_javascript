// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/* global io:false */
(function() {
	"use strict";

	var failFast = require("../ui/fail_fast.js");

	var socket;

	var Connection = module.exports = function RealTimeConnection() {
		this._connectCalled = false;
	};

	Connection.prototype.connect = function connect(port, callback) {
		this._connectCalled = true;
		var origin = window.location.protocol + "//" + window.location.hostname + ":" + port;
		socket = io(origin);

		socket.on("connect", function() {
			return callback(socket.id);
		});
	};

	Connection.prototype.disconnect = function disconnect(callback) {
		failFastUnlessConnected(this);

		socket.on("disconnect", function() {
			return callback();
		});
		socket.close();
	};

	Connection.prototype.sendPointerLocation = function sendPointerLocation(x, y) {
		failFastUnlessConnected(this);

		socket.emit("mouse", { x: x, y: y });
	};

	function failFastUnlessConnected(self) {
		failFast.unlessTrue(self._connectCalled, "Connection used before connect() called");
	}

}());