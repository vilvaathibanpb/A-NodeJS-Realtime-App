const nodemailer = require('nodemailer');
const config = require('../../config/main');
var request = require('request');
const User = require('../models/user');

// SMS Notification
exports.sendSMS = function (req, res) {
    var code = Math.floor(100000 + Math.random() * 900000)
    var message = "OTP for DocketTech is "+ code + " . Please do not share it with anyone."
    request.get({ url: "http://trans.kapsystem.com/api/v4/?api_key=" + config.sms.key + "&method=sms&sender=" + config.sms.senderId + "&to=" + req.body.mobile + "&message=" + message }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            User.findById(req.user._id, (err, user) => {  
                // Handle any possible database errors
                if (err) {
                    res.status(500).send(err);
                } else {
                    user.otp = code;
                    user.otp_expires = new Date();                  
            
                    // Save the updated document back to the database
                    user.save((err, todo) => {
                        if (err) {
                            // res.status(500).send(err)
                            console.log(err);
                        }
                    });
                }
            });
            res.json(JSON.parse(body));
            return;
        }
        else{
            res.status(500).send(error);
        }
    });
}

exports.verifySMS = function(req, res){
    User.findById(req.user._id , (err, user) => {
        if(err){
            res.status(500).send(err);
        }else{
            if(user.otp == req.body.otp){
                var time = new Date();
                console.log(time.getTime() - user.otp_expires.getTime(), "1" ,time.getTime() , "2", user.otp_expires.getTime() , (15*60));

                if(new Date() - user.otp_expires > (15*60*1000)){
                    res.status(500).send("OTP Expired");                
                }else{
                    res.status(200).send("OTP Matched");
                }
            }else{
                res.status(404).send("Invalid OTP");
            }
        }
    });
}

// EMail Notification
exports.sendEmail = function (req, res) {
    var transporter = nodemailer.createTransport({
        service: config.email.provider,
        auth: {
            user: config.email.id,
            pass: config.email.password
        }
    });

    const mailOptions = {
        from: config.email.id, // sender address
        to: req.body.to, // list of receivers
        subject: req.body.subject, // Subject line
        html: req.body.message// plain text body
    };

    transporter.sendMail(mailOptions, function (err, info) {
        if(err)
          res.send(err)
        else
          res.send(info);
     });
}

