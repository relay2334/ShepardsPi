var spawn = require('child_process').spawn;
var config = require('config');
var p0fclient = require('./p0fclient').parser; //API call

function p0fParser() {

	function run() {
		console.log('p0f: Instantiating p0f process and API.')

		var child = spawn('p0f -p -i ' + config.Monitoring.PromiscuousInterface + " -s " + config.Monitoring.p0f.APISocket, [], {shell: '/bin/bash'});

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
                                                p0fclient(ip);
                                        } // if internal ip addy

				}
				if(result.includes("server")) {
                                        var rawIP = result.replace("| server   = ", "");
                                        var ip = (rawIP.split("/"))[0];
					//console.log("p0f: IP FOUND:  " + ip);
					if (classifyIP(ip)) {
                                        	p0fclient(ip);
                               		}

                                }

				// When an ip if found check if it is an internal or external ip and
				// Use the p0f API to add the info to the database and push to webserver
			} // If data
		})

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
		var classify = parseInt(ipOctets[0]);
		if(classify == 10 || classify == 192) { // Fits private ip classification
			return true;
		}
		return false;
	}


	// Lets get this baby started!
	var child = run();
}


module.exports = { parser: p0fParser}
