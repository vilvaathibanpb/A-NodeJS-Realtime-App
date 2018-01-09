var request = require('request');
const nodemailer = require('nodemailer');
var checksum = require('./checksum');
var jsSHA = require("jssha");
const config = require('../../config/main');



// Paytm Payment
exports.paytmPayment = function (req, res) {
    if (!req.body.ORDER_ID || !req.body.CUST_ID || !req.body.TXN_AMOUNT || !req.body.MOBILE_NO || !req.body.EMAIL) {
        res.send("Mandatory fields missing");
    } else {
        var paramlist = req.body;
        var paramarray = new Array();
        for (name in paramlist) {
            paramarray[name] = paramlist[name];
        }
        paramarray["MID"] = config.paytm.MID;
        paramarray["WEBSITE"] = config.paytm.WEBSITE;
        paramarray["CHANNEL_ID"] = config.paytm.CHANNEL_ID;
        paramarray["INDUSTRY_TYPE_ID"] = config.paytm.INDUSTRY_TYPE_ID;
        paramarray["REQUEST_TYPE"] = config.paytm.REQUEST_TYPE;
        var PAYTM_MERCHANT_KEY = config.paytm.PAYTM_MERCHANT_KEY;
        var responseData = {};
        checksum.genchecksum(paramarray, PAYTM_MERCHANT_KEY, function (err, result) {
            for (name in result) {
                responseData[name] = result[name];
            }
            res.send(responseData);
        });
    }
}

// Paytm Response
exports.payUMoneyPayment = function (req, res) {
    if (!req.body.txnid || !req.body.amount || !req.body.productinfo || !req.body.firstname || !req.body.email) {
        res.send("Mandatory fields missing");
    } else {
        var pd = req.body;
        var hashString = config.payumoney.key + '|' + pd.txnid + '|' + pd.amount + '|' + pd.productinfo + '|' + pd.firstname + '|' + pd.email + '|' + '||||||||||' + config.payumoney.salt
        var sha = new jsSHA('SHA-512', "TEXT");
        sha.update(hashString)
        var hash = sha.getHash("HEX");
        res.send({ 'hash': hash });
    }
}

// PayU payment
exports.payUMoneyPaymentResponse = function (req, res) {
    var pd = req.body;
    var hashString = config.payumoney.salt + '|' + pd.status + '||||||||||' + '|' + pd.email + '|' + pd.firstname + '|' + pd.productinfo + '|' + pd.amount + '|' + pd.txnid + '|' + config.payumoney.key
    var sha = new jsSHA('SHA-512', "TEXT");
    sha.update(hashString)
    var hash = sha.getHash("HEX");
    if (hash == pd.hash) {
        res.send({'status':pd.status});
    } else {
        res.send({'status':"Error occured"});
    }
}

// PayU Response
exports.paytmPaymentResponse = function (req, res) {
    var paramlist = req.body;
    if (checksum.verifychecksum(paramlist, config.paytm.PAYTM_MERCHANT_KEY)) {
        res.redirect("http://localhost:8080/paymentResponse?success")
    } else {
        res.redirect("http://localhost:8080/paymentResponse?error")
    };
}