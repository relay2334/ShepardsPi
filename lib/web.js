const express = require('express');
const app = express();
var http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require("fs");
const config = require("config");
var db = require('./models');
var async = require('async');

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
  console.log(`HTTP server running → PORT: ` + config.AppServer.port);
});

app.set('view engine', 'pug');
//Pull paths from config file
app.use('/static', express.static(config.AppServer.static));
app.use('/images/file', express.static(config.AppServer.images));

//Time prototype
Date.prototype.rmHours = function(h) {
   this.setTime(this.getTime() - (h*60*60*1000));
   return this;
}


//Add an Element object (E) to the gridConf/grid.json and here per new panel)
app.get('/', (req, res) => {
  var ip = (req.ip).replace('::ffff:', '');
  console.log("Connection from: " + (ip));
  res.render('index', {
    version: config.WebUI.version,
    title: config.WebUI.title,
    E1: (jsonContent.grid.E1),
    E2: (jsonContent.grid.E2),
    E3: (jsonContent.grid.E3),
    E4: (jsonContent.grid.E4),
    E5: (jsonContent.grid.E5)
    });
});

app.get('/images/list', function(req, res) {
	db.Image.findAll({
		order: 'date DESC',
		limit: 200,
		raw: true,
	}).then(function(images) {
		res.json(images.reverse());
	})
})


app.get('/images/common', function(req, res) {
	db.Image.findAll({
		order: 'count DESC',
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
	  attributes: ['transport'],
	  order: [[db.sequelize.fn('COUNT', db.sequelize.col('count')), 'DESC']],
	  limit: parseInt(req.params.limit),
	  group: ['transport']
	}).then(function(protos){
	  var dLimit = new Date();
	  dLimit = dLimit.rmHours(8);

	  var protocols = []
	  async.each(protos, function (proto, next) {
	    db.Stat.findAll({
	      where: {
	        date: {gte: dLimit},
	        transport: proto.transport,
	      }
	    }).then(function(results) {
	      var d = [];
	      for (var a in results) {
	        d.push([results[a].date.getTime(), results[a].count]);
	      }

	      protocols.push({
	        label: proto.transport,
	        data: d
	      })

	      next()
	    })
	  }, function (error) {
	    res.json(protocols);
	  })
	})
})


module.exports = {
	io: io
}

