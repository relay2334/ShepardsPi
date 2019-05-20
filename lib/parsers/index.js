var config = require('config');
var driftnet = require('./driftnet').parser; //Images
var tshark = require('./tshark').parser; //Network Stats
var ngrep = require('./ngrep').parser; //Images
var p0f = require('./p0fsock').parser; //Hosts Parser
var ettercap = require('./ettercap').parser; //Accounts Parser 
var montshark = require('./montshark').parser; //Wireless Networks TShark

// For each parser, if autostart is set to true in the config
// file, then we will want to fire that parser up.
if (config.Monitoring.Driftnet.autostart)   	{ driftnet(); }
if (config.Monitoring.NGrep.autostart) 		    { ngrep(); }
if (config.Monitoring.TShark.autostart) 	    { tshark(); }
if (config.Monitoring.Ettercap.autostart)	    { ettercap(); }
if (config.Monitoring.MoniterTShark.autostart)       	{ montshark(); }
if (config.Monitoring.p0f.autostart)           { p0f(); }
