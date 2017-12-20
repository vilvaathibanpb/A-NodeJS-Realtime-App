const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../app/models/user');
const config = require('../config/main');




// Setup work and export for the JWT passport strategy
module.exports = function (passport) {
	const opts = {
		jwtFromRequest: ExtractJwt.fromAuthHeader(),
		secretOrKey: config.secret
	};

	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
		User.findById(id).then((user) => {
			done(null, user);
		});
	});

	passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
			const jwt_user_id = jwt_payload._doc._id
			console.log(jwt_user_id);
			User.findById(jwt_user_id, function (err, user) {
				if (err) {
					return done(err, false);
				}
				if (user) {
					done(null, user);
				} else {
					done(null, false);
				}
			});
		})
	);

	passport.use(new GoogleStrategy({
			// options for google strategy
			clientID: config.google.clientID,
			clientSecret: config.google.clientSecret,
			callbackURL: '/api/auth/google/redirect'
		}, (accessToken, refreshToken, profile, done) => {
			console.log(profile, "Vilva");
			// check if user already exists in our own db
			User.findOne({ google_id: profile.id }).then((currentUser) => {
				if (currentUser) {
					// already have this user
					console.log('user is: ', currentUser);
					done(null, currentUser);
				} else {
					// if not, create user in our db
					new User({
						email: profile.emails[0].value,
						google_id: profile.id,
						name: profile.displayName,
						thumbnail: profile._json.image.url
					}).save().then((newUser) => {
						console.log('created new user: ', newUser);
						done(null, newUser);
					});
				}
			});
		})
	);

	passport.use(new FacebookStrategy({
			clientID: config.facebook.clientID,
			clientSecret: config.facebook.clientSecret,
			callbackURL: 'http://localhost:3000/api/auth/facebook/redirect',
			profileFields: ['id', 'displayName', 'email' , 'picture']
		},
		function (accessToken, refreshToken, profile, done) {
			// console.log(profile, "Vilva");
			// check if user already exists in our own db
			User.findOne({ facebook_id: profile.id }).then((currentUser) => {
				if (currentUser) {
					// already have this user
					console.log('user is: ', currentUser);
					done(null, currentUser);
				} else {
					// if not, create user in our db
					new User({
						email: profile.emails[0].value,
						facebook_id: profile.id,
						name: profile.displayName,
						thumbnail: profile.photos[0].value
					}).save().then((newUser) => {
						console.log('created new user: ', newUser);
						done(null, newUser);
					});
				}
			});
		}
	));


};
