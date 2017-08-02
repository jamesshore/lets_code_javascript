How does Socket.IO behave when the browser disconnects? Use this spike to manually check the following on multiple browsers. Does the server get a disconnect event when...
	* ...when the 'disconnect' button is pushed?
	* ...the page is reloaded?
	* ...the user navigates away?
	* ...the tab is closed?
	* ...the browser is closed?

To try it:

1. Start server: `node spikes/socket_io_disconnection/app.js`
2. Open client tabs in a browser: `http://localhost:8080`
3. Look at server and client consoles


Results: (is the disconnect event received by the server?)
* Firefox 54: yes in all cases
* Chrome 59: yes in all cases
* Safari 10.1.2 (desktop): yes in all cases
* IE11: yes in all cases
* MS Edge 14.14393.0: yes in all cases
* Mobile Safari 10.0.0: yes in all cases
* Chrome Mobile 44.0.2403: yes in all cases