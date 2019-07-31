var config = require('config');
var driftnet = require('./driftnet').parser; //Images
var tshark = require('./tshark').parser; //Network Stats
var ngrep = require('./ngrep').parser; //Images
var p0f = require('./p0fsock').parser; //Hosts Parser
var ettercap = require('./ettercap').parser; //Accounts Parser
var montshark = require('./montshark').parser; //Wireless Networks TShark
var config = require("config");
var ioServer = require('socket.io').listen(config.Sockets.web);

console.log("[Parsers] Socket Handler Started");

var activeInterfaces = [];


//Configure Socket
ioServer.on('connection', function (socket) {
    //Listen for check ins from each client
    socket.on('web-check-in', function (data) {
        console.log("[Parsers] Web Handler connected. ID: ", socket.client.id);
    }); //When data is recieved

    socket.on('parser-check-in', function (data) {
      console.log("[Parsers] Parser Handler connected. ID: ", socket.client.id, " Parser Type: ", data);
      p = new Object;
      p.parser = data[0];
      p.interface = data[1];
      p.socket = socket;
      activeInterfaces.push(p);
    });

    socket.on('web', function (data) {
      //wait for data from web
      console.log('new message from client:', data);
      //activeInterfaces.emit('die', 1)
      activeInterfaces.forEach(function(i) {
        //If the interface is listening kill the parser
        if (i.interface == data[0]) {
          console.log("[Parsers] Killing parser: ", i.parser);
          i.socket.emit('die', 1);
        }
      }); //Check each listening parser and kill any on that interface
      //Now that the interface is clean begin capturing
      if (data[1]) {ettercap(data[0]);}
      if (data[2]) {tshark(data[0]);}
      if (data[3]) {p0f(data[0]);}
      if (data[4]) {montshark(data[0]);}
      if (data[5]) {driftnet(data[0]);}
      if (data[6]) {ngrep(data[0]);}

    }); //When data is recieved
}); //Server to listen
