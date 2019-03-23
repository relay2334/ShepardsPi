var config = require('config');
var driftnet = require('./driftnet').parser;
var tshark = require('./tshark').parser;
var ngrep = require('./ngrep').parser;
//var nmap = require('./nmap').parser;
var ettercap = require('./ettercap').parser;
//var airmon = require('./airmon').parser;

// For each parser, if autostart is set to true in the config
// file, then we will want to fire that parser up.
if (config.Monitoring.Driftnet.autostart)   	{ driftnet(); }
if (config.Monitoring.NGrep.autostart) 		    { ngrep(); }
if (config.Monitoring.TShark.autostart) 	    { tshark(); }
//if (config.Monitoring.Nmap.autostart)	      	{ nmap(); }
if (config.Monitoring.Ettercap.autostart)	    { ettercap(); }
//if (config.Monitoring.Airmon.autostart)       	{ airmon(); }
