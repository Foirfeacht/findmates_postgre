// load all the things we need
var FacebookStrategy = require('passport-facebook').Strategy;
var VKontakteStrategy = require('passport-vkontakte').Strategy;

// load up the user model
var models  = require('../models');
var express = require('express');


// load the auth variables
var configAuth = require('./auth'); // use this one for testing

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        models.User.find({where: {id: id}}).success(function(user) {
            done(null, user);
        }).error(function(err){
            done(err, null);
          });
    });

   

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

        clientID          : configAuth.facebookAuth.clientID,
        clientSecret      : configAuth.facebookAuth.clientSecret,
        callbackURL       : configAuth.facebookAuth.callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(req, token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {

                models.User.find({
                    where: {facebookId : profile.id }
                }).success(function(user) {

                    if (user) {

                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.facebookToken) {
                            user.facebookToken = token;
                            user.facebookName  = profile.name.givenName + ' ' + profile.name.familyName;
                            user.facebookEmail = (profile.emails[0].value || '').toLowerCase();
                            user.facebookImage = 'https://graph.facebook.com/' + profile.id + '/picture?height=350&width=250'; 

                            models.User.update(function(err) {
                                if (err)
                                    return done(err);
                                    
                                return done(null, user);
                            });
                        }

                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user, create them
                        models.User.create({
                            facebookId    : profile.id,
                            facebookToken : token,
                            facebookName  : profile.name.givenName + ' ' + profile.name.familyName,
                            facebookEmail : (profile.emails[0].value || '').toLowerCase(),
                            facebookImage : 'https://graph.facebook.com/' + profile.id + '/picture?height=350&width=250',
                            email         : (profile.emails[0].value || '').toLowerCase(),
                            name          : profile.name.givenName + ' ' + profile.name.familyName,
                            image         : 'https://graph.facebook.com/' + profile.id + '/picture?height=350&width=250'

                        }).success(function(user){
                            console.log(user);
                            return done(null, user)
                        }).error(function(err) {
                            return done(err);
                        });
                    }
                }).error(function(err) {
                    done(err)
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user            = req.user; // pull the user out of the session

                user.facebookId    = profile.id;
                user.facebookToken = token;
                user.facebookName  = profile.name.givenName + ' ' + profile.name.familyName;
                user.facebookEmail = (profile.emails[0].value || '').toLowerCase();
                user.facebookImage = 'https://graph.facebook.com/' + profile.id + '/picture?height=350&width=250';
                
                models.User.update(function(err) {
                    if (err)
                        return done(err);
                        
                    return done(null, user);
                });

            }
        });

    }));

// =========================================================================
    // VKONTAKTE ================================================================
    // =========================================================================
    passport.use(new VKontakteStrategy({

        clientID          : configAuth.vkontakteAuth.clientID,
        clientSecret      : configAuth.vkontakteAuth.clientSecret,
        callbackURL       : configAuth.vkontakteAuth.callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(req, token, refreshToken, params, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {

                models.User.find({
                    where: {facebookId : profile.id }
                }).success(function(user) {

                    if (user) {

                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.token) {
                            user.vkontakteToken = token;
                            user.vkontakteName  = profile.displayName;
                            user.vkontakteEmail = params.email.toLowerCase();
							user.vkontakteImage = profile.photos[0].value;
                            models.User.update(function(err) {
                                if (err)
                                    return done(err);
                                    
                                return done(null, user);
                            });
                        }

                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user, create them
                        models.User.create({
                            vkontakteId    : profile.id,
                            vkontakteToken : token,
                            vkontakteName  : profile.displayName,
                            vkontakteEmail : params.email.toLowerCase(),
                            vkontakteImage : profile.photos[0].value,
                            email          : params.email.toLowerCase(),
                            name           : profile.displayName,
                            image          : profile.photos[0].value

                        }).success(function(user){
                            console.log(user);
                            return done(null, user)
                        }).error(function(err) {
                            return done(err);
                        });
                    
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user            = req.user; // pull the user out of the session

                user.vkontakteId    = profile.id;
                user.vkontakteToken = token;
                user.vkontakteName  = profile.displayName;
                user.vkontakteEmail = params.email.toLowerCase();
				user.vkontakteImage = profile.photos[0].value;


                models.User.update(function(err) {
                    if (err)
                        return done(err);
                        
                    return done(null, user);
                });

            }
        });

    }));

};
