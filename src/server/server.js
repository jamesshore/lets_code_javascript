// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
(function() {
	"use strict";

	var HttpServer = require("./http_server.js");
	var RealTimeServer = require("./real_time_server.js");

	var Server = module.exports = function Server() {};

	Server.prototype.start = function(contentDir, notFoundPageToServe, portNumber, callback) {
		if (!portNumber) throw "port number is required";
		
		this._httpServerObj = new HttpServer(contentDir, notFoundPageToServe);

		// TODO: Fix _httpServer encapsulation breakage
		new RealTimeServer().start(this._httpServerObj._httpServer);

		this._httpServerObj.start(portNumber, callback);
	};

	Server.prototype.stop = function(callback) {
		if (this._httpServerObj === undefined) return callback(new Error("stop() called before server started"));

		this._httpServerObj.stop(callback);
	};

}());