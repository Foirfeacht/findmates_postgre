"use strict";

var models  = require('../models');

module.exports = function(sequelize, DataTypes) {
  var Participant = sequelize.define("Participant", {
    status: {
        type: DataTypes.ENUM, 
        values: ['joined', 'invited']
    }
  });
  return Participant;
};