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
        Comment.belongsTo(models.User, {
        	as: 'author',
        	constraints: false
        });
        Comment.belongsTo(models.Event, {
        	as: 'event',
        	constraints: false
        });
      }
    }
  });

  return Comment;
};