var spawn = require('child_process').spawn;
var config = require('config');
var Network = require('../models').Network;
var parseXML = require('xml2js').parseString;
var io = require('../web').io;

function montsharkParser() {
	var ssids = {};	// Array to check for networks before making a database call

	// As the ssids array is keeping state of the current packet counts
	// for the various ssids we have seen, we need to be able to schedule
	// routine checkpointing of the data and commiting that information to the
	// database.  We will run the checkpoiting every *90 seconds.
	setInterval(function() {
		// As we are checkpointing every minute, we want to make sure that the
		// data is represented on a minute-by-minute basis, and not with a
		// higher fidelity than that.  So what we are doing here is creating the
		// ts variable with a date fidelity equal to the current minute.
		var d = new Date();
		var ts = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), 0);

		console.log('TShark (Wireless): Initiating Checkpoint for ' + ts);

		// Now we need to iterate through all of the keys in the array and
		// create a new database entry for each one.
		for (var key in items){
			// console.log('TShark: Checkpointing ' + key + ' at ' + items[key])
			Network.findOne({
					where: {
						username: username,
						password: password,
						information: information,
						protocol: protocol
					}
				}).then(function(err, result) {
					if (!(result)) {
						Network.create({
							username: username,
							password: password,
							information: information,
							parser: 'ettercap',
							protocol: protocol,
							dns: dns
						});
						console.log('TShark (Wireless): Added ' + ssid + ':' + password);
						io.emit('networks', {
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
		io.emit('protocols', 'refresh');
	}, 60000);	// 60 second timer.

	// 
	function run() {
		var skip = true;		// The line skipping flag. Set to true until we encounter a packet.
		var raw_packet = '';	// The raw packet string. XML assembly happens on this variable.

		console.log('TShark (Wireless): Instantiating tshark process.')

		var child = spawn('tshark -f "type mgt subtype beacon" -PS -l -Tfields  -e wlan.sa -e wlan.ssid -e radiotap.channel.freq -e radiotap.dbm_antsignal -e wlan.rsn.akms.type -i ' + config.Monitoring.interface, [], {shell: '/bin/bash'}
		);


		child.stdout.on('data', function(data) {
			
			// As Tshark is generating enough output to cause Node.js to buffer
			// the output, we want to make sure that we are parsing through the
			// line-by-line and reconstructing complete packet definitions.  So
			// we will split the output buffer based on carriage returns and
			// interact with each line.
			var lines = data.toString().split('\n');
			for (var i in lines) {

				// The first several lines output from TShark include the XML
				// definition and the schema for the PSML specification.  As
				// these lines are not important to use, we will want to simply
				// ignore them.  I'm using a rudimentary skip flag that is set
				// to true until we see a <packet> flag in the stream.
				if (skip) {
					if (lines[i].indexOf('<packet>') > -1){
						skip = false;
						console.log('TShark: Starting to process packet data.')
					}
				}
				if (!(skip)) {
					raw_packet = raw_packet.concat(lines[i])

					// New we need to see if the raw_packet is complete.  If it is, then
					// we will need to parse the raw_packet and attempt to marry it to
					// the data we have on hand.
					if (lines[i].indexOf('</packet>') > -1) {
						var pkt = raw_packet;
						raw_packet = ''
						parseXML(pkt, function(err, packet) {
							// The PSML specification is as such:
							//
							//<packet>
                            //<section>9706</section>
                            //<section>4.772284141</section>
                            //<section>Actionte_45:09:02</section>
                            //<section>Broadcast</section>
                            //<section>802.11</section>
                            //<section>292</section>
                            //<section>Beacon frame, SN=1792, FN=0, Flags=........C, BI=100, SSID=BCycling</section>
                            //</packet>

							// What we are looking for is the transport protocol, which
							// is the 5th section in the PSML spec.  We will take that
							// peice of information and then keep track fo the number of
							// packets we see with that transport.
							var transport = packet.packet.section[4];
							if (!(transport in ssids)) {
								ssids[transport] = 0;
							}
							ssids[transport] += 1;
							//console.log(': ' + transport + '++')
						});
					}				
				}
			}
		})

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
