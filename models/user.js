"use strict";

module.exports = function(sequelize, DataTypes) {

	var User = sequelize.define("users", {
    username: Sequelize.STRING,
    password: Sequelize.TEXT,
    role: Sequelize.STRING(6)
  });

  return User;
};