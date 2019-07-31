var spawn = require('child_process').spawn;
var config = require('config');
var p0fclient = require('./p0fclient').parser; //API call

function p0fParser(interface) {
	var toCheck = [];
	var die = false;

	var sioclient = require('socket.io-client');
	var sock = sioclient.connect("http://localhost:" + config.Sockets.web + "/");
	sock.emit('parser-check-in', ['p0f', interface]);

	//Check every minuite for new network hosts
	setInterval(function() {
		//Use a new array to remove duplicates
		//console.log(toCheck);
		let checked = Array.from(new Set(toCheck))
		//console.log(checked);
		//Send each unique ip to the API caller and add to DB
		if(die){return;}
		checked.forEach(ip => {p0fclient(ip);});
		//Empty the array after checking for duplicates and sending to api caller
		checked = null;
		toCheck = [];
	}, 60000);	// 60 second timer


	function run() {
		console.log('p0f: Instantiating p0f process and API.')

		var child = spawn('p0f -p -i ' + interface + " -s " + config.Monitoring.p0f.APISocket, [], {shell: '/bin/bash'});

		// Ettercap data capture...
		child.stdout.on('data', function(data) {
			// When we get new standard output, we want to check it against a couple of
			// regex patterns.
			var reg1 = /\| ([a-z]{6,}   = \d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/.+/g
			var rtest = reg1.exec(data.toString());

			// If both regex patterns yeidl useful data, then we will attempt to parse
			// the data into what we are looking for.
			if (rtest) {
				var result = rtest[0];
				if(result.includes("client")) {
					var rawIP = result.replace("| client   = ", "");
					var ip = (rawIP.split("/"))[0];
					//console.log("p0f: IP FOUND:  " + ip);
					if (classifyIP(ip)) {
                                                toCheck.push(ip);
                                        } // if internal ip addy

				}
				if(result.includes("server")) {
                                        var rawIP = result.replace("| server   = ", "");
                                        var ip = (rawIP.split("/"))[0];
					//console.log("p0f: IP FOUND:  " + ip);
					if (classifyIP(ip)) {
                                        	toCheck.push(ip);
                               		}

                                }

				// When an ip if found check if it is an internal or external ip and
				// Use the p0f API to add the info to the database and push to webserver
			} // If data
		})

		sock.on('die', function(code) {
			console.log("Killing p0f with code: " + code);
			die = true;
			child.kill(code);
		});

		child.stderr.on('data', function(data) {
			console.log('p0f: (stderr): ' + data.toString().replace(/(\r\n|\n|\r)/gm, ' '));
		})

		// If driftnet exists for some reason, log the event to the console
		// and then initiate a new instance to work from.
		child.on('close', function(code) {
			console.log('p0f: child terminated with code ' + code);
		})

		child.on('error', function(error) {
			console.log('p0f: Failed to start process');
		})
	}

	function classifyIP(ip) {
		var ipOctets = ip.split('.');
		var o1 = parseInt(ipOctets[0]);
		var o2 = parseInt(ipOctets[1]);
		if(o1 == 10) { // Fits private ip classification
			return true;
		}
		if(o1 == 172) {
			if (Boolean(o2 => 16) && Boolean(o2 <= 31)) {
				return true;
			}
		}
		if(o1 == 192) {
			if (o2 == 168) {
				return true;
			}
		}
		return false;
	}


	// Lets get this baby started!
	var child = run();
}


module.exports = { parser: p0fParser}
