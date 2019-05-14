var execFile = require('child_process').execFile;
var config = require('config');
var Host = require('../models').Host;
var io = require('../web').io;

function p0fClientParser(ip) {

	function run() {
		//console.log('p0f: API call on: ' + ip)
		var child = execFile('./p0f-client', [config.Monitoring.p0f.APISocket, ip], {cwd: "/home/dev/ShepardsPi/lib/parsers"}, (error, stdout, stderr) => {
			if (error) {
				throw error;
			}
		if(!(stdout.toString().includes("First seen"))) {
			console.log("p0f: API call failed on " + ip);
		}
		else {
			//vars for DB
			var os = "";
			var distance = "";
			var flows = "";
			var httpSoft = "";
			var firstSeen = "";
			var lastSeen = "";
			var netLink = "";

			/*
			SAMPLE OUTPUT:
			First seen    = 2019/04/17 10:33:31
			Last update   = 2019/04/17 10:33:33
			Total flows   = 10
			Detected OS   = Linux 3.11 and newer
			HTTP software = ???
			Network link  = Ethernet or modem
			Language      = ???
			Distance      = 0
			Sys change    = 2019/04/17 10:33:33
			*/
			var lines = stdout.toString().split('\n');
			for (var i in lines) {
				if(lines[i].includes("First seen")) {
					firstSeen = lines[i].replace("First seen    = ", "");
				}
				if(lines[i].includes("Last update")) {
					lastSeen = lines[i].replace("Last update   = ", "");
				}
				if(lines[i].includes("Detected OS")) {
					os = lines[i].replace("Detected OS   = ", "");
				}
				if(lines[i].includes("HTTP software")) {
					httpSoft = lines[i].replace("HTTP software = ", "");
				}
				if(lines[i].includes("Network link")) {
					netLink = lines[i].replace("Network link  = ", "");
				}
				if(lines[i].includes("Distance")) {
					distance = lines[i].replace("Distance      = ", "");
				}
				if(lines[i].includes("Total flows")) {
					flows = lines[i].replace("Total flows   = ", "");
				}
			}
			// console.log(os);
			// console.log(distance);
			// console.log(flows);
			// console.log(httpSoft);
			// console.log(firstSeen);
			// console.log(lastSeen);
			// console.log(netLink);

			Host.findOrCreate({where: {ip: ip}
				}).then(([host, created]) => {
					if(created) {
						console.log('p0f: Added host ' + ip + ' with OS ' + os);
						Host.update({
							os: os,
							distance: distance,
							flows: flows,
							httpSoft: httpSoft,
							lastSeen: lastSeen,
							netLink: netLink,
							firstSeen: firstSeen
						}, { where: { ip: ip } });
						io.emit('hosts', {
							ip: ip,
							os: os,
							distance: distance,
							flows: flows,
							httpSoft: httpSoft,
							firstSeen: firstSeen
						});
					}
				});
			}
		});
	}

	var child = run();
}


module.exports = { parser: p0fClientParser}
