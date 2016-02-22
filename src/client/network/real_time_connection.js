// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/* global io:false */
(function() {
	"use strict";

	var failFast = require("../ui/fail_fast.js");

	var Connection = module.exports = function RealTimeConnection() {
		this._connectCalled = false;
		this._socket = null;
	};

	Connection.prototype.connect = function connect(port, callback) {
		this._connectCalled = true;
		var origin = window.location.protocol + "//" + window.location.hostname + ":" + port;
		this._socket = io(origin);

		this._socket.on("connect", function() {
			return callback(null);
		});
	};

	Connection.prototype.disconnect = function disconnect(callback) {
		failFastUnlessConnectCalled(this);

		this._socket.on("disconnect", function() {
			return callback(null);
		});
		this._socket.close();
	};

	Connection.prototype.sendPointerLocation = function sendPointerLocation(x, y) {
		failFastUnlessConnectCalled(this);
		this._socket.emit("mouse", { x: x, y: y });
	};

	Connection.prototype.getSocketId = function getSocketId() {
		failFastUnlessConnectCalled(this);
		return this._socket.id;
	};

	function failFastUnlessConnectCalled(self) {
		failFast.unlessTrue(self._connectCalled, "Connection used before connect() called");
	}

}());