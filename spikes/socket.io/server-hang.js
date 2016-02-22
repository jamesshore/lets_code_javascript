// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
  "use strict";

  var PORT = 5020;
	var TIMEOUT = 5000;

  var io = require('socket.io')(PORT);

	console.log("Waiting " + (TIMEOUT / 1000) + " seconds...");
	setTimeout(function() {
		io.close();
		console.log("PROCESS SHOULD NOW EXIT");
	}, TIMEOUT);

}());