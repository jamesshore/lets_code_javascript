// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var io = require('socket.io');
    var async = require("async");
	var ClientPointerEvent = require("../shared/client_pointer_event.js");
	var ClientRemovePointerEvent = require("../shared/client_remove_pointer_event.js");
	var ClientDrawEvent = require("../shared/client_draw_event.js");
	var ClientClearScreenEvent = require("../shared/client_clear_screen_event.js");
	var EventRepository = require("./event_repository.js");

	// Consider Jay Bazuzi's suggestions from E494 comments (direct connection from client to server when testing)
	// http://disq.us/p/1gobws6  http://www.letscodejavascript.com/v3/comments/live/494

	var RealTimeServer = module.exports = function RealTimeServer() {
		this._socketIoConnections = {};
	};

	RealTimeServer.prototype.start = function(httpServer) {
		this._ioServer = io(httpServer);

		trackSocketIoConnections(this);
		handleSocketIoEvents(this, this._ioServer);
	};

	RealTimeServer.prototype.handleClientEvent = function(clientEvent, clientId) {
		var serverEvent = processClientEvent(this, clientEvent, clientId);
		this._ioServer.emit(serverEvent.name(), serverEvent.toSerializableObject());
	};

	RealTimeServer.prototype.numberOfActiveConnections = function() {
		return Object.keys(this._socketIoConnections).length;
    };

    RealTimeServer.prototype.disconnectAll = function (callback) {
        if (this._disconnectAllCallback)
            throw "Only supporting one disconnectAll() call at a time.";

        if (this.numberOfActiveConnections() === 0) {
            callback();
        }
        else {
            this._disconnectAllCallback = callback;
            async.each(this._socketIoConnections, function (socket) { socket.disconnect(); });
        }
    };

    function trackSocketIoConnections(self) {
		// Inspired by isaacs https://github.com/isaacs/server-destroy/commit/71f1a988e1b05c395e879b18b850713d1774fa92
        self._ioServer.on("connection", function(socket) {
			var key = socket.id;
            self._socketIoConnections[key] = socket;

            socket.on("disconnect", function () {
                delete self._socketIoConnections[key];

                if (self._disconnectAllCallback && self.numberOfActiveConnections() === 0) {
                    self._disconnectAllCallback();
                    self._disconnectAllCallback = null;
                }
			});
		});
	}

	function processClientEvent(self, clientEvent, clientId) {
		var serverEvent = clientEvent.toServerEvent(clientId);
		self._eventRepo.store(serverEvent);
		return serverEvent;
	}

	function handleSocketIoEvents(self, ioServer) {
		self._eventRepo = new EventRepository();

		ioServer.on("connect", function(socket) {
			replayPreviousEvents(self, socket);
			handleClientEvents(self, socket);
		});
	}

	function replayPreviousEvents(self, socket) {
		self._eventRepo.replay().forEach(function(event) {
			socket.emit(event.name(), event.toSerializableObject());
		});
	}

	function handleClientEvents(self, socket) {
		var supportedEvents = [
			ClientPointerEvent,
			ClientRemovePointerEvent,
			ClientDrawEvent,
			ClientClearScreenEvent
		];

		supportedEvents.forEach(function(eventConstructor) {
			socket.on(eventConstructor.EVENT_NAME, function(eventData) {
				var clientEvent = eventConstructor.fromSerializableObject(eventData);
				var serverEvent = processClientEvent(self, clientEvent, socket.id);
				socket.broadcast.emit(serverEvent.name(), serverEvent.toSerializableObject());
			});
		});
	}

}());