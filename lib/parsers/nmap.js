var spawn = require('child_process').spawn;
var config = require('config');
var io = require('../web').io;
var Host = require('../models').Host;

function nmapParser() {

	function nmap(ip) {
	
	var child = spawn('/opt/ShepardsPi/lib/parsers/nmapFormat.sh ' + ip, [], {shell: '/bin/bash'});
			
			child.stderr.on('data', function(data) {
                        	console.log('Nmap: (stderr): ' + data.toString().replace(/(\r\n|\n|\r)/gm, ' '));
                	});
                
			child.stdout.on('data', function(data) {
				console.log('Nmap: (stdout): ' + data.toString().replace(/(\r\n|\n|\r)/gm, ' '));
				var rdata = /(\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\*\d{1,5}\b)/g 
				var dataE = rdata.test(data.toString())
				if(dataE) {
					var raw = (data.toString()).split("*");
					var ip = raw[0];
					var ports = raw[1];
                        		console.log('Nmap: (stdout): Host ' + ip + ' discovered. Ports Open: ' + ports + ' ');
					Host.findOne({
					where: {
						ip: ip
					}//where loop
				}).then(function(err, result) {
					if (!(result)) {
						Host.create({
							ip: ip,
							name: "Test",
							ports: ports
						});//Host Create
						console.log('Nmap Host Added: Added ' + ip + '\t Open Ports: ' + ports);
						io.emit('hosts', {
							ip: ip,
							ports: ports
						});//IO EMIT
					}//IF
				});//THEN
					}//IF DATA
		});

		child.on('close', function(code) {
			console.log('Nmap: child terminated with code ' + code);
			await sleep(1080000000);
			run()
		});

		child.on('error', function(error) {
			console.log('Nmap: Failed to start process');
		});
	}
	
	async function scan() {
		console.log("Host Discovery Scan!");
                var ip = config.Monitoring.Nmap.target_range;
                var arr = ip.split(".");
                var oct = arr[0] + "." + arr[1] + "." + arr[2];
                var range = arr[3].split("-")
                var min = parseInt(range[0]);
                var max = parseInt(range[1]);
                for(var i=min;i<(max+1);i++) {
                        var get = oct + "." + i;
                        var ip = get.toString();
                	var arr = ip.split(".");
                	var check = parseInt(arr[0]) + "." + parseInt(arr[1]) + "." + parseInt(arr[2]) + "." + parseInt(arr[3]);
                	if(!(ip == check)){
                        	process.exit();
                	}
                	await sleep(config.Monitoring.Nmap.interval);
			nmap(ip);
			}

	}
	
	function sleep(ms){
    		return new Promise(resolve=>{
        		setTimeout(resolve,ms)
		    })
	}
	
	function run() {
                console.log('Nmap: Instantiating nmap process.')
                scan();
	}

	// Lets get this baby started!
	var child = run();
}


module.exports = { parser: nmapParser}
