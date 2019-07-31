const express = require('express');
var execFile = require('child_process').execFile;
const app = express();
var http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require("fs");
var bodyParser = require("body-parser");
const config = require("config");
var db = require('./models');
var async = require('async');

var sioclient = require('socket.io-client');
var sock = sioclient.connect("http://localhost:" + config.Sockets.web + "/", {
    reconnection: true
});
sock.on('connect', function () { console.log("[Web] Socket connected to parsers"); });

/*
This runs each time before the control page is loaded.
It polls the OS to figure out what NICs are connected
and provides the user with options based on the NIC's
capabilities and environmant. Updates with each refresh
*/
function prepIfList(callback) {
  var child = execFile('./ifList.sh', {cwd: "/home/dev/ShepardsPi/lib/parsers"}, (error, stdout, stderr) => {
    if (error) {throw error;}
  });
  var interfaces = [];
  child.stdout.on('data', function(data) {
    interfaces = (data.toString()).split(" ");
  });
  child.on('close', function(code) {
    interfaces[interfaces.length - 1] = interfaces[interfaces.length - 1].replace("\n", "")
    var interfaceObjs = [];
    interfaces.forEach( function(i){
        var interface = i.split(":");
        var itf = new Object;
        itf.name = interface[0].toString();
        if (interface[1] == "1") {itf.connected = true} else {itf.connected = false}
        itf.ip = interface[2].split("-")[0];
        itf.brd = interface[2].split("-")[1];
        if (interface[3] == "1") {itf.wireless = true} else {itf.wireless = false}
        interfaceObjs.push(itf);
    });
    return callback(interfaceObjs);
  });
}

//Running config Variables:
var listening = false;



//HTTPS
/*
var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
const https = requrire('https').createServer(credentials, app);
const httpsServer = https.listen(config.AppServer.httpsPort, () => {
  console.log(`HTTPS server running → PORT: ` + config.AppServer.httpsPort);
});

*/



//JSON to load the GridStack positions
var contents = fs.readFileSync(config.AppServer.gridConfig);
var jsonContent = JSON.parse(contents);

const httpServer = http.listen(config.AppServer.port, () => {
  console.log(`[Web] HTTP server running → PORT: ` + config.AppServer.port);
});

app.set('view engine', 'pug');
//Pull paths from config file
app.use('/static', express.static(config.AppServer.static));
app.use('/images/file', express.static(config.AppServer.images));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Time prototype
Date.prototype.rmHours = function(h) {
   this.setTime(this.getTime() - (h*60*60*1000));
   return this;
}



//Add an Element object (E) to the gridConf/grid.json and here per new panel)
app.get('/', (req, res) => {
  if(listening) {
    var ip = (req.ip).replace('::ffff:', '');
    console.log("[Web] Connection from: " + (ip));
    res.render('index', {
      version: config.WebUI.version,
      title: config.WebUI.title,
      E1: (jsonContent.grid.E1),
      E2: (jsonContent.grid.E2),
      E3: (jsonContent.grid.E3),
      E4: (jsonContent.grid.E4),
      E5: (jsonContent.grid.E5)
      });
  } //If interfaces are already listening

  else {
    res.redirect('/control');
  }
});



app.get('/control', (req, res) => {
  prepIfList(function(interfaces) {
    res.render('control', {
      version: config.WebUI.version,
      title: config.WebUI.title,
      interface: interfaces,
      monIF: config.Monitoring.MoniterInterface,
      promIF: config.Monitoring.PromiscuousInterface
      });
    });
});


app.post('/:intf/parsers',function(req,res){
  //console.log("/parsers Post Data: Interface: " + req.params.intf + "  Ett:" + req.body.Ettercap + " tsh " + req.body.TShark + " p0f " + req.body.p0f + " MON" + req.body.TSharkmon + " Driftnet " + req.body.Driftnet);
  sock.emit("web", [req.params.intf, req.body.Ettercap, req.body.TShark, req.body.p0f, req.body.TSharkmon, req.body.Driftnet, req.body.NGrep]);
  if (listening == false) {
    listening = true;
    res.redirect('/');
  }
  else {
    res.redirect('/control');
  }
});

app.get('/images/list', function(req, res) {
	db.Image.findAll({
		order: [[db.sequelize.fn('DATE', db.sequelize.col('date')), 'DESC']],
		limit: 200,
		raw: true,
	}).then(function(images) {
		res.json(images.reverse());
	})
})


app.get('/images/common', function(req, res) {
	db.Image.findAll({
		order: [[db.sequelize.fn('COUNT', db.sequelize.col('count')), 'DESC']],
		limit: 100,
		raw: true
	}).then(function(images) {
		res.json(images.reverse());
	})
})


app.get('/accounts/list', function(req, res){
	db.Account.findAll().then(function(accounts) {
		res.json(accounts);
	})
})

app.get('/networks/list', function(req, res){
	db.Network.findAll().then(function(networks) {
		res.json(networks);
	})
})

// Switching Vunls and Hosts to local instead of API calls
app.get('/hosts/list', function(req, res){
	db.Host.findAll().then(function(hosts) {
		res.json(hosts);
	})
})



app.get('/stats/protocols/:limit', function(req, res) {
	db.Stat.findAll({
 	  order: [[db.sequelize.fn('COUNT', db.sequelize.col('count')), 'DESC']],
	  limit: parseInt(req.params.limit),
	  group: ['transport']
	}).then(function(protos){
	    var dLimit = new Date();
	    dLimit = dLimit.rmHours(8);
            dLimit = dLimit.toISOString().replace(/T/, ' ').replace(/\..+/, '');
	    var protocols = []
            //var query = 'SELECT * FROM sheep.stats WHERE transport = :transport AND date >= :dateLim';
                async.each(protos, function (proto, next) {
                        var query = 'SELECT date, count FROM sheep.stats WHERE transport = \'' + proto.transport.toString() + '\' AND date >= \'' + dLimit + '\'';
                        db.sequelize.query(query, {
                            raw: true,
                            type: db.sequelize.QueryTypes.SELECT
                        }).then(function(results) {
                                        var d = [];
                                        results.forEach(function(stat) {
                                                        d.push([stat.date.getTime(), stat.count]);

                                        });

                                protocols.push({
                                label: proto.transport,
                                data: d
                                })

                                next()
                        })
                        .error(function (err) {
                                console.log(err);
                        });
                        },
                        function (error) {
                            res.json(protocols);
                })
        })
})

app.get('/proto/:proto/:limit', function(req, res) {
        db.Stat.findAll({
 	  order: [[db.sequelize.fn('COUNT', db.sequelize.col('count')), 'DESC']],
	  limit: parseInt(req.params.limit),
          where: {transport: req.params.proto}
	}).then(function(protos){
	    var dLimit = new Date();
	    dLimit = dLimit.rmHours(8);
            dLimit = dLimit.toISOString().replace(/T/, ' ').replace(/\..+/, '');
	    var protocols = []
            //var query = 'SELECT * FROM sheep.stats WHERE transport = :transport AND date >= :dateLim';
                async.each(protos, function (proto, next) {
                        var query = 'SELECT date, count FROM sheep.stats WHERE transport = \'' + proto.transport.toString() + '\' AND date >= \'' + dLimit + '\'';
                        db.sequelize.query(query, {
                            raw: true,
                            type: db.sequelize.QueryTypes.SELECT
                        }).then(function(results) {
                                        var d = [];
                                        results.forEach(function(stat) {
                                                    d.push([stat.date.getTime(), stat.count]);
                                        });

                                protocols.push({
                                label: proto.transport,
                                data: d
                                })

                                next()
                        })
                        .error(function (err) {
                                console.log("Stats: No data for custom protocol " + req.params.proto);
                        });
                        },
                        function (error) {
                        res.json(protocols);
                })
        })
})



module.exports = {
	io: io
}
