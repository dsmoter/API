"use strict";

module.exports = function(sequelize, DataTypes) {

	var User = sequelize.define("User", {
      "id": {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      "name": {
        type: DataTypes.STRING
      },
      "password": {
        type: DataTypes.TEXT
      },
      "role": {
        type: DataTypes.STRING(6)
      }
    },
    {
      createdAt: false,
      updatedAt: false,
      tableName: "users"
    }
  );

  return User;
};