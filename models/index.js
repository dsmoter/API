var fs = require("fs");
var path = require("path");
var config = require("../config/config.json");
var Sequelize = require('sequelize');
var sequelize = new Sequelize(config.database, config.user, config.password, {
  dialect: config.dialect,
  host: config.host
});

var db = {};

fs
	.readdirSync(__dirname)
  .filter(function(file){
    return (file !== "index.js")
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;