var execFile = require('child_process').execFile;
var config = require('config');
var Host = require('../models').Host;
var io = require('../web').io;

function p0fClientParser(ip) {

	function run() {
		console.log('p0f: API call on: ' + ip)
		var child = execFile('./p0f-client', [config.Monitoring.p0f.APISocket, ip], {cwd: "/home/dev/ShepardsPi/lib/parsers"}, (error, stdout, stderr) => {
			if (error) {
				throw error;
			}
			console.log(stdout);
		});
/*
		child.stdout.on('data', function(data) {
			console.log("START OF DATA" + data.toString() + "END OF DATA");
			var rproto = /^(.+?) :/gm
			var raw = rdata.exec(data.toString());
			var proto = rproto.exec(data.toString());
			if (raw && proto) {
				var username = raw[1];
				var password = raw[2];
				var information = raw[3];
				var protocol = proto[1];
				var dns = url.parse(raw[3]).hostname;

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
//Configure Database and vars					}
				}).then(function(err, result) {
					if (!(result)) {
						Account.create({
							username: username,
							password: password,
							information: information,
							parser: 'ettercap',
							protocol: protocol,
							dns: dns
						});
						console.log('p0f: Added ' + username + ':' + password + ' account');
						io.emit('accounts', {
							username: username,
							password: password,
							information: information,
							parser: 'ettercap',
							protocol: protocol,
							dns: dns
						});
					}
				});
			}
		})

		child.stderr.on('data', function(data) {
			console.log(': (stderr): ' + data.toString().replace(/(\r\n|\n|\r)/gm, ' '));
		})

		child.on('error', function(error) {
			console.log('p0f: Failed to start p0f-client. Make sure it is compiled and in \'lib/parsers!\'');
		})*/
	}

	// Lets get this baby started!
	var child = run();
}


module.exports = { parser: p0fClientParser}
