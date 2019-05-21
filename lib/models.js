var Sequelize = require('sequelize');
var base64Img = require('base64-img');
var config = require('config');
var sequelize = new Sequelize(config.Database.uri, {logging: config.Database.logging});


var Image = sequelize.define('image', {
	id: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
	hash: Sequelize.STRING(32),
	count: {type: Sequelize.INTEGER, defaultValue: 0},
	url: Sequelize.STRING,
	filename: {type: Sequelize.STRING(42)},
	date: {type: Sequelize.DATE, defaultValue: Sequelize.NOW},
	nsfw: {type: Sequelize.INTEGER}
},{
	instanceMethods: {
		b64: function() {
			return base64Img.base64Sync(config.AppServer.images + '/' + this.filename);
		}
	}
})

var Account = sequelize.define('account', {
	id: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
	username: Sequelize.STRING,
	password: Sequelize.STRING,
	information: Sequelize.STRING,
	protocol: Sequelize.STRING,
	parser: Sequelize.STRING,
	host: Sequelize.STRING
})

var Stat = sequelize.define('stat', {
	id: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
	date: {type: Sequelize.DATE, defaultValue: Sequelize.NOW},
	count: {type: Sequelize.INTEGER, defaultValue: 0},
	transport: Sequelize.STRING
})

var Network = sequelize.define('network', {
	id: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
	bssid: Sequelize.STRING,
	channel: {type: Sequelize.INTEGER, defaultValue: 0},
	auth: Sequelize.STRING,
	essid: Sequelize.STRING,
	power: {type: Sequelize.INTEGER, defaultValue: 0}
})

var Host = sequelize.define('host', {
	id: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
	ip: {type: Sequelize.STRING(190)},
	os: {type: Sequelize.STRING(190)},
	distance: {type: Sequelize.INTEGER},
	flows: {type: Sequelize.INTEGER},
	httpSoft: {type: Sequelize.STRING(190)},
	firstSeen: {type: Sequelize.STRING(190)},
	lastSeen: {type: Sequelize.STRING(190)}
})


Image.sync();
Account.sync();
Network.sync();
Stat.sync();
Host.sync();

module.exports = {
	Account: Account,
	Image: Image,
	Stat: Stat,
	Host: Host,
	Network: Network,
	sequelize: sequelize
}
