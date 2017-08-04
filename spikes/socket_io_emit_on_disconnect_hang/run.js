(function() {
	"use strict";

	const socketIoClient = require("socket.io-client");
	const socketIoServer = require("socket.io");
	const http = require("http");
	const util = require("util");

	let httpServer;
	let ioServer;

	const PORT = 5020;

	startServer(async function() {
		console.log("SERVER STARTED");

		const connections = {};
		logAndTrackServerConnections(connections);
		logHttpConnections();

		console.log("** setting up server event handlers");
		ioServer.on("connect", function(serverSocket) {
			serverSocket.on("client_event", () => {
				console.log("CLIENT EVENT RECEIVED BY SERVER");
				console.log("** emitting server event");
				ioServer.emit("server_event", "server event sent in response to client event");
			});
			serverSocket.on("disconnect", (reason) => {
				// comment out following lines to prevent issue
				console.log("** emitting server event in disconnect handler");
				ioServer.emit("arbitrary_server_event", "server event sent during disconnect");
			});
		});

		console.log("** creating client sockets");
		const clientSocket1 = await createClientSocket();
		const clientSocket2 = await createClientSocket();

		console.log("** emitting client event");
		clientSocket1.emit("client_event", "client event");

		console.log("** waiting for server event");
		await new Promise((resolve) => {
			clientSocket1.on("server_event", () => {
				console.log("SERVER EVENT RECEIVED BY CLIENT");
				// use setTimeout, instead of calling resolve() directly, to prevent issue
				setTimeout(resolve, 200);
				resolve();
			});
		});

		console.log("** closing client sockets");
		await closeClientSocket(clientSocket1);
		await closeClientSocket(clientSocket2);

		// uncomment this block of code to prevent issue
		// console.log("** waiting for server sockets to disconnect");
		// const serverSockets = Object.values(connections);
		// const promises = serverSockets.map((serverSocket) => {
		// 	return new Promise((resolve) => serverSocket.on("disconnect", resolve));
		// });
		// await Promise.all(promises);

		await stopServer(ioServer);
		console.log("** end of test, Node.js should now exit")
	});

	function parallelCreateSockets(numSockets) {
		let createPromises = [];
		for (let i = 0; i < numSockets; i++) {
			createPromises.push(createSocket());
		}
		return Promise.all(createPromises);
	}

	function logAndTrackServerConnections(connections) {
		ioServer.on("connect", function(socket) {
			const key = socket.id;
			console.log("SERVER CONNECTED", key);
			connections[key] = socket;
			socket.on("disconnect", function(reason) {
				console.log(`SERVER DISCONNECTED; reason ${reason}; id ${socket.id}`);
				delete connections[key];
			});
		});
	}

	function logHttpConnections() {
		httpServer.on('connection', function(socket) {
			const id = socket.remoteAddress + ':' + socket.remotePort;
			console.log("HTTP CONNECT", id);
			socket.on("close", function() {
				console.log("HTTP DISCONNECT", id);
			});
		});
	}

	function logClientConnections(socket) {
		let id;
		socket.on("connect", function() {
			id = socket.id;
			console.log("CLIENT CONNECTED", id);
		});
		socket.on("disconnect", function() {
			console.log("CLIENT DISCONNECTED", id);
		});
	}

	function startServer(callback) {
		console.log("** starting server");
		httpServer = http.createServer();
		ioServer = socketIoServer(httpServer);
		httpServer.listen(PORT, callback);
	};

	async function stopServer(ioServer) {
		console.log("** stopping server");

		const close = util.promisify(ioServer.close.bind(ioServer));
		await close();
		console.log("SERVER STOPPED");
	}

	function createClientSocket() {
		const socket = socketIoClient("http://localhost:" + PORT);
		logClientConnections(socket);
		return new Promise(function(resolve) {
			socket.on("connect", function() {
				return resolve(socket);
			});
		});
	}

	function closeClientSocket(clientSocket) {
		const closePromise = new Promise(function(resolve) {
			clientSocket.on("disconnect", function() {
				return resolve();
			});
		});
		clientSocket.disconnect();

		return closePromise;
	}

}());