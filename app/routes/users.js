/**
 * Created by vmaltsev on 4/17/2015.
 */
// and event model
var models  = require('../../models');

module.exports = function(app) {
	// =============================================================================
// ROUTES FOR USERS ==================================================
// =============================================================================

	// get all users
	app.get('/api/users', isLoggedIn, function(req, res) {
		var user = req.user;
		// use mongoose to get all meetings in the database
		models.User.findAll().then(function(err, users) {

			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err)

			res.json(users); // return all meetings in JSON format
		});
	});

	var userByID = function(req, res, next, id) {
		User.findById(id, function(err, profile) {
			if (err) return next(err);
			if (!profile) return next(new Error('Failed to load user ' + id));
			req.profile = profile;
			next();
		});
	};

	app.param('userId', userByID);

	app.get('/users/:userId', isLoggedIn, function(req, res){
		res.render('userprofile.ejs', {
			profile: req.profile,
			user : req.user
		});
	});
}

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}