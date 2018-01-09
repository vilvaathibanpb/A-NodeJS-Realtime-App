// Import dependencies
const passport = require('passport');
const express = require('express');
const config = require('../config/main');
const jwt = require('jsonwebtoken');

// Set up middleware
const requireAuth = passport.authenticate('jwt', { session: false });

// Load models
const User = require('./models/user');
const Userlog = require('./models/user_log');
const Product = require('./models/product');

// Export the routes for our app to use
module.exports = function (app) {
	// API Route Section

	// Initialize passport for use
	app.use(passport.initialize());

	// Bring in defined Passport Strategy
	require('../config/passport')(passport);

	// Create API group routes
	const apiRoutes = express.Router();
	const saveLog = function(user,req){
		
		let dt = new Date();
		const log = new Userlog({
			 user_id : user._id,
			 login_time : dt.toUTCString(),
			 ip : req.header('x-forwarded-for') || req.connection.remoteAddress,
			 user_agent : req.headers['user-agent']

		});
		// console.log(log);
		log.save(function(err){
			if(err) { console.log(err) }
			return;
		})
		// console.log(user_id, login_time, ip, browser);

	}

	// Register new users
	apiRoutes.post('/register', function (req, res) {
		if (!req.body.email || !req.body.password) {
			res.status(400).json({ success: false, message: 'Please enter email and password.' });
		} else {
			const newUser = new User({
				email: req.body.email,
				password: req.body.password,
				name: req.body.name,
				mobile: req.body.mobile
			});

			// Attempt to save the user
			newUser.save(function (err) {
				if (err) {
					return res.status(400).json({ success: false, message: err });
				}
				res.status(201).json({ success: true, message: 'Successfully created new user.' });
			});
		}
	});

	// Authenticate the user and get a JSON Web Token to include in the header of future requests.
	apiRoutes.post('/authenticate', function (req, res) {
		User.findOne({
			email: req.body.email
		}, function (err, user) {
			if (err) throw err;

			if (!user) {
				res.status(401).json({ success: false, message: 'Authentication failed. User not found.' });
			} else {
				// Check if password matches
				user.comparePassword(req.body.password, function (err, isMatch) {
					if (isMatch && !err) {
						// Create token if the password matched and no error was thrown
						const token = jwt.sign(user, config.secret, {
							expiresIn: 10080 // in seconds
						});
						saveLog(user,req);
						res.status(200).json({ success: true, token: 'JWT ' + token });
					} else {
						res.status(401).json({ success: false, message: 'Authentication failed. Passwords did not match.' });
					}
				});
			}
		});
	});

	// Product List Api
	apiRoutes.get('/product/:category', function (req, res) {
		Product.findOne({
			product_category: req.params.category
		}, function (err, response) {
			if (err) { res.send(req.params.category); return; }
			if (!response) { res.status(404).send("The product type dont exist"); return; }
			res.json(response);
		})
	});

	// Google Auth
	apiRoutes.get('/auth/google', passport.authenticate('google', {
		scope: ['email' ]
	}));

	// Facebook Auth
	apiRoutes.get('/auth/facebook', passport.authenticate('facebook',{ scope: ['email','public_profile'] }));

	// Google Redirect
	apiRoutes.get('/auth/google/redirect', passport.authenticate('google'), (req, res) => {
		const token = jwt.sign(req.user, config.secret, {
			expiresIn: 10080 // in seconds
		});
		saveLog(req.user,req);
		res.redirect('http://localhost:8080/authToken?token=' + 'JWT ' + token);
	});

	// Facebook Redirect
	apiRoutes.get('/auth/facebook/redirect', passport.authenticate('facebook'), (req, res) => {
		const token = jwt.sign(req.user, config.secret, {
			expiresIn: 10080 // in seconds
		});
		saveLog(req.user,req);		
		res.redirect('http://localhost:8080/authToken?token=' + 'JWT ' + token);
	});

	// Logout
	apiRoutes.get('/logout', (req, res) => {
		req.logout();
		res.send("success");
	});
	
	// Set url for API group routes
	app.use('/api', apiRoutes);
};
