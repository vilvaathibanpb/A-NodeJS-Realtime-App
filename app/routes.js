// Import dependencies
const passport = require('passport');
const express = require('express');
const config = require('../config/main');
const jwt = require('jsonwebtoken');

// Set up middleware
const requireAuth = passport.authenticate('jwt', { session: false });

// Load models
const User = require('./models/user');
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

	// Register new users
	apiRoutes.post('/register', function (req, res) {
		console.log(req.body);
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
		console.log(req.body);
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
						res.status(200).json({ success: true, token: 'JWT ' + token });
					} else {
						res.status(401).json({ success: false, message: 'Authentication failed. Passwords did not match.' });
					}
				});
			}
		});
	});

	// Protect chat routes with JWT
	// GET messages for authenticated user
	// apiRoutes.get('/product/:category', requireAuth, function(req, res) {
	apiRoutes.get('/product/:category', requireAuth, function (req, res) {
		Product.findOne({
			product_category: req.params.category
		}, function (err, response) {
			if (err) { res.send(req.params.category); return; }
			if (!response) { res.status(404).send("The product type dont exist"); return; }
			res.json(response);
		})
	});

	apiRoutes.get('/auth/google', passport.authenticate('google', {
		scope: ['email' ]
	}));

	// apiRoutes.get('/auth/facebook', passport.authenticate('facebook',{ scope:'email' }));
	apiRoutes.get('/auth/facebook', passport.authenticate('facebook',{ scope: ['email','public_profile'] }));

	apiRoutes.get('/auth/google/redirect', passport.authenticate('google'), (req, res) => {
		// res.send(req.user);
		console.log(req.user , "jj");
		// res.redirect('/profile');
		const token = jwt.sign(req.user, config.secret, {
			expiresIn: 10080 // in seconds
		});
		res.status(200).json({ success: true, token: 'JWT ' + token });
	});

	apiRoutes.get('/auth/facebook/redirect', passport.authenticate('facebook'), (req, res) => {
		// res.send(req.user);
		// res.redirect('/profile');
		console.log(req.user);
		const token = jwt.sign(req.user, config.secret, {
			expiresIn: 10080 // in seconds
		});
		res.status(200).json({ success: true, token: 'JWT ' + token });
	});

	apiRoutes.get('/logout', (req, res) => {
		req.logout();
		res.send("success");
	});
	

	// Set url for API group routes
	app.use('/api', apiRoutes);
};
