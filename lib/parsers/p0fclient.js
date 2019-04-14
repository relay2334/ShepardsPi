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
			Host.findOne({
				where: {
					ip: ip,
					password: password,
					information: information,
					protocol: protocol
					}
			}).then(function(err, result) {
				if (!(result)) {
					Host.create({
						username: username,
						password: password,
						information: information,
						parser: 'ettercap',
						protocol: protocol,
						dns: dns
					});
					console.log('p0f: Added ' + username + ':' + password + ' Host');
					io.emit('hosts', {
						username: username,
						password: password,
						information: information,
						parser: 'ettercap',
						protocol: protocol,
						dns: dns
					});
				}
			});
		});
	}

	var child = run();
}


module.exports = { parser: p0fClientParser}
