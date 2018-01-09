const mongoose = require('mongoose');

const UserLogSchema = new mongoose.Schema({
	user_id: {
		type: String,
		required: true
	},
	login_time: {
		type: String,
		required: true
	},
	ip: {
		type: String,
		required: true
	},
	user_agent: {
		type: String,
		required: true
	},
});

module.exports = mongoose.model('Userlog', UserLogSchema);
