var spawn = require('child_process').spawn;
var execFile = require('child_process').execFile;
var config = require('config');

function interfaceManager(interface, mode) {

	var die = false;
	if(mode == "Monitor") {
		var sioclient = require('socket.io-client');
		var sock = sioclient.connect("http://localhost:" + config.Sockets.web + "/");
		sock.emit('parser-check-in', ['interfaceManager', interface]);
	}


	function run() {
		if (mode == 'Managed') {
			var child = execFile('sudo bash interfacePrep.sh ' + interface + " 2", [], {
			cwd: "/home/dev/ShepardsPi/lib/parsers",
			shell: '/bin/bash'});
		} //mode Managed


		if (mode == 'Monitor') {
				var child = spawn('sudo bash interfacePrep.sh ' + interface + " 1", [], {
					cwd: "/home/dev/ShepardsPi/lib/parsers",
					shell: '/bin/bash'});

				child.stdout.on('data', function(data) {
					console.log("[Interface-Manager] ", data.toString());
				});

				child.stderr.on('data', function(data) {
					console.log("[Interface-Manager] ", data.toString());
				});

				child.on('close', function(code) {
					console.log('[Interface-Manager] child terminated with code ' + code);
				});

				child.on('error', function(error) {
					console.log('[Interface-Manager] Failed to start process');
				});

				sock.on('die', function(code) {
					console.log("Killing p0f with code: " + code);
					die = true;
					child.kill(code);
				});
		} //mode Monitor
}

	var child = run();
}

module.exports = { parser: interfaceManager}
