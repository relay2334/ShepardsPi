var spawn = require('child_process').spawn;
var config = require('config');
var Network = require('../models').Network;
var io = require('../web').io;

function montsharkParser() {
	var ssids = [];
	var cashed = [];

	// Old
	setInterval(function() {
		// Two arrays will hold ssids for reference.
		//cashed.forEach(element => {console.log("Cashe: " + element.essid + "  /Cache")});
		cashed.forEach(element => {
			Network.findOne({
				where: {
					essid: (element.essid),
					bssid: (element.bssid)
				 }
			}).then(project => {
				if (project == null) {
					console.log('TShark (Wireless): Added Network ' + element.essid);
					Network.create({
						bssid: element.bssid,
						channel: element.channel,
						auth: element.auth,
						essid: element.essid,
						power: element.power
					});
				}
				else {
					Network.update({
						channel: element.channel,
						power: element.power
					}, { where: { bssid: element.bssid, essid: element.essid } });
				} // If already in database then update power and channel

						io.emit('networks', {
						bssid: element.bssid,
						channel: element.channel,
						auth: element.auth,
						essid: element.essid,
						power: element.power
					}); // io emit
				});
			cashed = cashed.filter(value => {return value != element;}); // Quick way to delete old elements
		});

		io.emit('networks', 'refresh');
	}, 20000);	// 60 second timer.

		function getChannel(freq) {
			var chan = parseInt(freq);
			if(chan == 2412) {return 1;}
			if(chan == 2417) {return 2;}
			if(chan == 2422) {return 3;}
			if(chan == 2427) {return 4;}
			if(chan == 2432) {return 5;}
			if(chan == 2437) {return 6;}
			if(chan == 2442) {return 7;}
			if(chan == 2447) {return 8;}
			if(chan == 2452) {return 9;}
			if(chan == 2457) {return 10;}
			if(chan == 2462) {return 11;}
			if(chan == 2467) {return 12;}
		}

		function getAuth(sec) {
			if(sec == 2) {return "WPA2";}
			if(sec == "") {return "Open";}
			return sec;
		}

		function checkBoth(net) {
			for (var i in cashed) { if(cashed[i].essid == net.essid) {return false;} }
			for (var i in ssids) { if(ssids[i].essid == net.essid) {return false;} }
			return true;
		}

		function checkS(net) {
			for (var i in ssids) { if(ssids[i].essid == net.essid) {return false;} }
			return true;
		}

		function run() {
			console.log('TShark (Wireless): Instantiating tshark process.')
			var child = spawn('tshark -f "type mgt subtype beacon" -PS -l -Tfields  -e wlan.sa -e wlan.ssid -e radiotap.channel.freq -e radiotap.dbm_antsignal ' +
			'-e wlan.rsn.akms.type -E separator=* -i ' +
	 		config.Monitoring.MoniterInterface, [], {shell: '/bin/bash'}
		);

		child.stdout.on('data', function(data) {
			// Split per new line
			//console.log(data.toString() + " LINE!!!");
			var lines = data.toString().split('\n');
			// Parse all data by line
			for (var i in lines) {
				var net = {};
				var reg = /([0-9A-Fa-f]{2}\:){5}([0-9A-Fa-f]{2})\*.+\*\d{4}/g
				var rcheck = reg.exec(lines[i].toString());
				// Skip the first several lines of output from TShark to avoid anything thats not usable data.
				//console.log(lines[i]);
				if(rcheck) {
					//console.log(lines[i].toString());
					var raw = lines[i].split("*");
					//raw.forEach(element => {console.log("PART " + element + " PART ")});
					net = {
						bssid: raw[0].toString(),
						essid: raw[1].toString(),
						channel: getChannel(raw[2]),
						power: raw[3],
						auth: getAuth(raw[4]),

					} // Object
					//console.log("val: " + checkBoth(net));
					if(checkBoth(net)) {
						//console.log(net.essid);
						cashed.push(net);
					} // Tmp array
				} // Regex If
			} // For Loop
		}) // STDOUT


		child.stderr.on('data', function(data) {
			// What we are looking to do here is strip out the packet counters from entering
			// the console log.  We still want all other standard error entries to hit the
			// console log however, so a simple regex check to filter out the spammy data
			// should be all we need.
			var repkt = /Packets: (\d+)/g;
			if (!(repkt.exec(data.toString()))){
				console.log('TShark (Wireless): (stderr): ' + data.toString().replace(/(\r\n|\n|\r)/gm, ' '));
			}
		})

		child.on('close', function(code) {
			console.log('TShark (Wireless): child terminated with code ' + code);
			child = run()
		})

		child.on('error', function(error) {
			console.log('TShark (Wireless): Failed to start process');
		})
	}

	var child = run();
}

module.exports = { parser: montsharkParser}
