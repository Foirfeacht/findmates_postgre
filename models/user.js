"use strict";

var models  = require('../models');

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {

        name:  DataTypes.STRING,
        image: DataTypes.STRING,
        email: DataTypes.STRING,
        roles: {
            type: DataTypes.ENUM,
            values: ['user', 'admin']
        },

        // facebook
        facebookId           : DataTypes.STRING,
        facebookToken        : DataTypes.STRING,
        facebookEmail        : DataTypes.STRING,
        facebookName         : DataTypes.STRING,
        facebookImage        : DataTypes.STRING,

        //vkontakte
        vkontakteId           : DataTypes.STRING,
        vkontakteToken        : DataTypes.STRING,
        vkontakteEmail        : DataTypes.STRING,
        vkontakteName         : DataTypes.STRING,
        vkontakteImage        : DataTypes.STRING,
  },{
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Event, {
            as: 'events'
        });
      }
    }
  });

  //User.sync();

  return User;
};

