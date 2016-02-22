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

		var self = this;
		this._socket.on("connect", function() {
			return callback(self._socket.id);
		});
	};

	Connection.prototype.disconnect = function disconnect(callback) {
		failFastUnlessConnected(this);

		this._socket.on("disconnect", function() {
			return callback();
		});
		this._socket.close();
	};

	Connection.prototype.sendPointerLocation = function sendPointerLocation(x, y) {
		failFastUnlessConnected(this);

		this._socket.emit("mouse", { x: x, y: y });
	};

	Connection.prototype.getSocketId = function getSocketId() {
		failFastUnlessConnected(this);
		return this._socket.id;
	};

	function failFastUnlessConnected(self) {
		failFast.unlessTrue(self._connectCalled, "Connection used before connect() called");
	}

}());