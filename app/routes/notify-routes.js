var express = require('express');
var config = require('../../config/main');
var notifyController = require('../controllers/notify-controller');
var nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const passport = require('passport');



const notifyRoutes = express.Router();
const requireAuth = passport.authenticate('jwt', { session: false });

notifyRoutes.post("/sms",requireAuth, notifyController.sendSMS);
notifyRoutes.post("/sms/verify",requireAuth, notifyController.verifySMS);
notifyRoutes.post("/email", notifyController.sendEmail);



module.exports = notifyRoutes;