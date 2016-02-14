Example of using socket.io for multi-user real-time web
 
To try it:

1. Start server: `node spikes/socket.io/app.js`
2. Open multiple client tabs in a browser: `http://localhost:8080`
3. Look at server and client consoles


Also: 

* client-race.js demonstrates a race condition in the socket.io client. It was exposed by our attempt to test socket.io. The issue was fixed in v1.4.5. It was reported here: https://github.com/socketio/socket.io-client/issues/935

* server-hang.js and server-hang.html demonstrates a bug in the socket.io server that prevents the server process from exiting. The issue was reported here: https://github.com/socketio/socket.io/issues/1602