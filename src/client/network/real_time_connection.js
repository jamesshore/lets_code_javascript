// Copyright (c) 2015-2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/* global io:false */
(function() {
	"use strict";

	var failFast = require("fail_fast");
	var ServerPointerEvent = require("../../shared/server_pointer_event.js");
	var ClientPointerEvent = require("../../shared/client_pointer_event.js");
	var EventEmitter = require("./vendor/emitter-1.2.1.js");

	var Connection = module.exports = function() {
		this._connectCalled = false;
		this._socket = null;
		this._isNull = false;
		this._lastSentPointerLocation = null;
		this._pointerLocationHandlers = [];
	};

	Connection.createNull = function() {
		var connection = new Connection();
		connection._isNull = true;
		return connection;
	};

	Connection.prototype.connect = function(port, callback) {
		this._connectCalled = true;
		var origin = window.location.protocol + "//" + window.location.hostname + ":" + port;
		if (this._isNull) {
			this._socket = nullIo(origin);
			if (callback) return callback(null);
			else return;
		}

		this._socket = io(origin);

		if (callback !== undefined) this._socket.on("connect", function() {
			return callback(null);
		});
	};

	Connection.prototype.disconnect = function(callback) {
		failFastUnlessConnectCalled(this);

		this._socket.on("disconnect", function() {
			return callback(null);
		});
		this._socket.close();
	};

	Connection.prototype.sendPointerLocation = function(x, y) {
		failFastUnlessConnectCalled(this);

		this._lastSentPointerLocation = { x: x, y: y };
		this._socket.emit(ClientPointerEvent.EVENT_NAME, new ClientPointerEvent(x, y).toSerializableObject());
	};

	Connection.prototype.getLastSentPointerLocation = function() {
		failFastUnlessConnectCalled(this);

		return this._lastSentPointerLocation;
	};

	Connection.prototype.onPointerLocation = function(handler) {
		failFastUnlessConnectCalled(this);
		this._pointerLocationHandlers.push(handler);

		this._socket.on(ServerPointerEvent.EVENT_NAME, function(eventData) {
			return handler(ServerPointerEvent.fromSerializableObject(eventData));
		});
	};

	Connection.prototype.triggerPointerLocation = function(socketId, x, y) {
		failFastUnlessConnectCalled(this);
		var numHandlers = this._pointerLocationHandlers.length;
		if (numHandlers === 0) return;
		if (numHandlers > 1) failFast.unreachable("RealTimeConnection.triggerPointerLocation() only supports one handler");

		var event = new ServerPointerEvent(socketId, x, y);
		if (this._pointerLocationHandlers.length === 1) this._pointerLocationHandlers[0](event);
	};

	Connection.prototype.getSocketId = function() {
		failFastUnlessConnectCalled(this);
		if (!this.isConnected()) return null;

		else return this._socket.id;
	};

	Connection.prototype.getPort = function() {
		failFastUnlessConnectCalled(this);
		if (!this.isConnected()) return null;

		return this._socket.io.engine.port;
	};

	Connection.prototype.isConnected = function() {
		return this._socket !== null && this._socket.connected;
	};

	function failFastUnlessConnectCalled(self) {
		failFast.unlessTrue(self._connectCalled, "Connection used before connect() called");
	}


	//**** nullIo mimics the socket.io interface, but doesn't talk over the network

	function nullIo(origin) {
		return new NullSocket(parsePort(origin));
	}

	// This code based on https://gist.github.com/jlong/2428561
	function parsePort(url) {
		var parser = document.createElement('a');
		parser.href = url;
		return parser.port;
	}

	function NullSocket(port) {
		this._emitter = new EventEmitter();

		this.connected = true;
		this.id = "NullConnection";
		this.io = {
			engine: { port: port }
		};
	}

	NullSocket.prototype.emit = function() {
		// ignore all events (that's what makes this a "Null" Socket)
	};

	NullSocket.prototype.on = function(event, handler) {
		if (event === "disconnect") return this._emitter.on(event, handler);
		// ignore all other events
	};

	NullSocket.prototype.close = function() {
		this.connected = false;
		this._emitter.emit("disconnect");
	};

}());