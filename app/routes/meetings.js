/**
 * Created by vmaltsev on 4/17/2015.
 */
// and event model
var models  = require('../../models');

module.exports = function(app) {
	// =============================================================================
// ROUTES FOR MEETINGS ==================================================
// =============================================================================


// get all meetings
	app.get('/api/meetings', isLoggedIn, function(req, res) {
		var user = req.user;
		// use mongoose to get all meetings in the database
		Meeting.find(function(err, meetings) {

			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err)

			res.json(meetings); // return all meetings in JSON format
		}).populate('_owner', 'ownerName');
	});

	// create meeting and send back all meetings after creation
	app.post('/api/meetings', isLoggedIn, function(req, res) {
		var user = req.user;

		// create a meeting, information comes from AJAX request from Angular
		Meeting.create({
			title : req.body.title,
			description: req.body.description,
			category: req.body.category,
			startDate: req.body.startDate,
			startTime: req.body.startTime,
			created_at: new Date(),
			latitude: req.body.latitude,
			longitude: req.body.longitude,
			position: req.body.position,
			location: req.body.location,
			visibility : req.body.visibility || 'Все',
			_owner: req.user._id,
			ownerName: req.user.name,
			ownerFacebook: req.user.facebook.id,
			ownerVkontakte: req.user.vkontakte.id,
			invitedUsers: req.body.invitedUsers
		}, function(err, meeting) {
			if (err)
				res.send(err);

			// get and return all the meetins after you create another
			Meeting.find(function(err, meetings) {
				if (err)
					res.send(err)
				res.json(meetings);
			});
		});

	});

	//meeting by id middleware

	var meetingByID = function(req, res, next, id) {
		Meeting.findById(id).populate('_owner', 'ownerName').exec(function(err, meeting) {
			if (err) return next(err);
			if (!meeting) return next(new Error('Failed to load meeting ' + id));
			req.meeting = meeting;
			next();
		});
	};

	app.param('meetingId', meetingByID);


	// decline invitation


	app.put('/decline/meetings/:id', isLoggedIn, function (req, res){

		var update = { $pull: {invitedUsers: {_id: req.user._id}} };

		Meeting.findByIdAndUpdate(req.params.id, update, function (err, meeting) {
			if(err)
				res.send (err)

			console.log("meeting joined");
			/*Meeting.find(function(err, meetings) {
			 if (err)
			 res.send(err)
			 res.json(meetings);
			 });*/
			res.json(meeting);
		});
	});


	// store user in meetings.joined
	app.put('/join/meetings/:id', isLoggedIn, function (req, res){
		var update = { $addToSet: {joinedUsers: req.user}, $pull: {invitedUsers: {_id: req.user._id}} };

		Meeting.findByIdAndUpdate(req.params.id, update, function (err, meeting) {
			if(err)
				res.send (err)

			console.log("meeting joined");
			/*Meeting.find(function(err, meetings) {
			 if (err)
			 res.send(err)
			 res.json(meetings);
			 });*/
			res.json(meeting);
		});
	});

	// and delete user from meetings.joined
	app.put('/unjoin/meetings/:id', isLoggedIn, function (req, res){

		var update = { $pull: {joinedUsers: {_id: req.user._id}}};

		Meeting.findByIdAndUpdate(req.params.id, update, function (err, meeting) {
			if(err)
				res.send (err)

			console.log("meeting updated");
			console.log(meeting.joinedUsers);
			/*Meeting.find(function(err, meetings) {
			 if (err)
			 res.send(err)
			 res.json(meetings);
			 });*/
			res.json(meeting);
		});
	});

	//update a meeting
	app.put('/api/meetings/:id', isLoggedIn, function (req, res){
		var user = req.user;
		var update = {
			$set: {
				title: req.body.title,
				description: req.body.description,
				category: req.body.category,
				startDate: req.body.startDate,
				updated_at: Date.now(),
				visibility: req.body.visibility
			},
			$addToSet: {
				invitedUsers: req.body.invitedUsers
			}
		};

		Meeting.findByIdAndUpdate(req.params.id, update, function (err, meeting) {
			if(!meeting) {
				res.statusCode = 404;
				return res.send({ error: 'Not found' });
			}
			if(err){
				res.send(err)
			}
			console.log("meeting updated");
			Meeting.find(function(err, meetings) {
				if (err)
					res.send(err)
				res.json(meetings);
			});
		});
	});


	// get single meeting

	app.get('/api/meetings/:meetingId', isLoggedIn, function(req, res){
		res.json(req.meeting);
	});

	//route to single meeting

	app.get('/meetings/:meetingId', isLoggedIn, function(req, res){
		res.render('meeting.ejs', {
			meeting: req.meeting,
			user : req.user
		});
	});

	// delete a meeting
	app.delete('/api/meetings/:meeting_id', isLoggedIn, function(req, res) {
		Meeting.remove({
			_id : req.params.meeting_id
		}, function(err, meeting) {
			if (err)
				res.send(err);

			// get and return all the meetings after you create another
			Meeting.find(function(err, meetings) {
				if (err)
					res.send(err)
				res.json(meetings);
			});
		});
	});

	// delete a meeting from single meeting page
	app.delete('/api/meeting/:meeting_id', isLoggedIn, function(req, res) {
		Meeting.remove({
			_id : req.params.meeting_id
		}, function(err, meeting) {
			if (err)
				res.send(err);

			res.redirect('/meetings');
		});
	});

	// =============================================================================
	// ROUTES FOR COMMENTS==================================================
	// =============================================================================

	// add message to meetings
	app.put('/addComment/meetings/:id', isLoggedIn, function (req, res){

		var update = { $push: {
			comments: {
				content: req.body.content,
				created_at: new Date(),
				_owner: req.user._id,
				ownerName: req.user.name,
				ownerFacebook: req.user.facebook.id,
				ownerVkontakte: req.user.vkontakte.id
			}
		}};

		Meeting.findByIdAndUpdate(req.params.id, update, {safe: true, upsert: true}, function (err, meeting) {
			if(!meeting) {
				res.statusCode = 404;
				return res.send({ error: 'Not found' });
			}
			console.log("comment updated");
			console.log(meeting.comments);
			Meeting.find(function(err, meetings) {
				if (err)
					res.send(err)
				res.json(meetings);
			});
		});

	});
}

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}
