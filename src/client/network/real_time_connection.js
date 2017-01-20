// Copyright (c) 2015-2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/* global io:false */
(function() {
	"use strict";

	var failFast = require("fail_fast");
	var ServerPointerEvent = require("../../shared/server_pointer_event.js");
	var EventEmitter = require("./vendor/emitter-1.2.1.js");
	var ServerDrawEvent = require("../../shared/server_draw_event.js");

	var Connection = module.exports = function() {
		return initialize(this, window.io);
	};

	Connection.createNull = function() {
		return initialize(new Connection(), Connection._nullIo);
	};
	
	function initialize(self, ioToInject) {
		self._io = ioToInject;
		self._connectCalled = false;
		self._socket = null;
		self._lastSentEvent = null;
		self._localEmitter = new EventEmitter();
		return self;
	}

	Connection.prototype.connect = function(port, callback) {
		this._connectCalled = true;
		var origin = window.location.protocol + "//" + window.location.hostname + ":" + port;
		this._socket = this._io(origin);
		// Choice of calling .once() instead of .on() is not tested. It only comes into play when the server
		// connection is interrupted, which we don't support yet
		if (callback !== undefined) this._socket.once("connect", function() {
			return callback(null);
		});
	};

	Connection.prototype.disconnect = function(callback) {
		failFastUnlessConnectCalled(this);

		// Choice of calling .once() instead of .on() is not tested. It only comes into play when the server
		// connection is interrupted, which we don't support yet
		this._socket.once("disconnect", function() {
			return callback(null);
		});
		this._socket.close();
	};

	Connection.prototype.onPointerLocation = function(handler) {
		failFastUnlessConnectCalled(this);

		this._localEmitter.on(ServerPointerEvent.EVENT_NAME, handler);
		this._socket.on(ServerPointerEvent.EVENT_NAME, function(eventData) {
			return handler(ServerPointerEvent.fromSerializableObject(eventData));
		});
	};

	Connection.prototype.triggerPointerLocation = function(socketId, x, y) {
		failFastUnlessConnectCalled(this);

		var event = new ServerPointerEvent(socketId, x, y);
		this._localEmitter.emit(ServerPointerEvent.EVENT_NAME, event);
	};

	Connection.prototype.sendEvent = function(event) {
		failFastUnlessConnectCalled(this);
		failFast.unlessDefined(event.name, "event.name");

		this._lastSentEvent = event;
		this._socket.emit(event.name, event.toSerializableObject());
	};

	Connection.prototype.getLastSentEvent = function() {
		return this._lastSentEvent;
	};

	Connection.prototype.onEvent = function(eventConstructor, handler) {
		failFastUnlessConnectCalled(this);
		failFast.unlessDefined(eventConstructor.EVENT_NAME, "eventConstructor.EVENT_NAME");

		this._localEmitter.on(eventConstructor.EVENT_NAME, handler);
		this._socket.on(eventConstructor.EVENT_NAME, function(eventData) {
			return handler(eventConstructor.fromSerializableObject(eventData));
		});
	};


	Connection.prototype.triggerDrawEvent = function(event) {
		failFastUnlessConnectCalled(this);

		this._localEmitter.emit(ServerDrawEvent.EVENT_NAME, event);
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

	// We're exposing this for test purposes only.
	Connection._nullIo = function(origin) {
		return new NullSocket(parsePort(origin));
	};

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

		asynchronousEmit(this._emitter, "connect");
	}

	NullSocket.prototype.emit = function() {
		// ignore all events (that's what makes this a "Null" Socket)
	};

	NullSocket.prototype.on = function(event, handler) {
		// ignore all events
	};

	NullSocket.prototype.once = function(event, handler) {
		if (event === "disconnect") return this._emitter.once(event, handler);
		if (event === "connect") return this._emitter.once(event, handler);
		// ignore all other events
	};

	NullSocket.prototype.close = function() {
		this.connected = false;
		asynchronousEmit(this._emitter, "disconnect");
	};

	function asynchronousEmit(emitter, event) {
		setTimeout(function() {
			emitter.emit(event);
		}, 0);
	}

}());