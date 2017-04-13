// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
(function() {
	"use strict";

	var HttpServer = require("./http_server.js");
	var RealTimeServer = require("./real_time_server.js");

	var Server = module.exports = function Server() {};

	Server.prototype.start = function(contentDir, notFoundPageToServe, portNumber, callback) {
		if (!portNumber) throw "port number is required";
		
		this._httpServer = new HttpServer(contentDir, notFoundPageToServe);
		var realTimeServer = new RealTimeServer();

		// must be done in this order
		realTimeServer.start(this._httpServer.getNodeServer());
		this._httpServer.start(portNumber, callback);
	};

	Server.prototype.stop = function(callback) {
		if (this._httpServer === undefined) return callback(new Error("stop() called before server started"));

		this._httpServer.stop(callback);
	};

}());