const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Schema defines how the user's data will be stored in MongoDB
const UserSchema = new mongoose.Schema({
	email: {
		type: String,
		lowercase: true,
		unique: true,
		required: true
	},
	password: {
		type: String
	},
	mobile: {
		type: String
	},
	name: {
		type: String,
		required: true
	},
	otp:{
		type: String
	},
	otp_expires : {
		type: Date,
		default: new Date()
	},
	google_id: {
		type: String,
		default: null
	},
	facebook_id: {
		type: String,
		default: null
	},
	thumbnail: {
		type: String
	},
	role: {
		type: String,
		enum: ['Client', 'Business', 'Admin'],
		default: 'Client'
	}
});

// Saves the user's password hashed (plain text password storage is not good)
UserSchema.pre('save', function (next) {
	const user = this;
	if(!user.google_id && !user.facebook_id){
		if (this.isModified('password') || this.isNew) {
			bcrypt.genSalt(10, function (err, salt) {
				if (err) {
					return next(err);
				}
				bcrypt.hash(user.password, salt, function (err, hash) {
					if (err) {
						return next(err);
					}
					user.password = hash;
					next();
				});
			});
		} else {
			return next();
		}
	}else{
		return next();
	}
});

// Create method to compare password input to password saved in database
UserSchema.methods.comparePassword = function (pw, cb) {
	bcrypt.compare(pw, this.password, function (err, isMatch) {
		if (err) {
			return cb(err);
		}
		cb(null, isMatch);
	});
};

module.exports = mongoose.model('User', UserSchema);
