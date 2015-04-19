"use strict";

var models  = require('../models');

module.exports = function(sequelize, DataTypes) {
  var Comment = sequelize.define("Comment", {
    content:  {
        type: DataTypes.STRING,
        validate: {
            notNull: false
        }
    }
  },{
    classMethods: {
      associate: function(models) {
        Comment.hasOne(models.User, {
        	as: 'author'
        });
      }
    }
  });

  //Comment.sync();

  return Comment;
};