const express = require('express');
const config = require('../../config/main');
const payController = require('../controllers/payment-controller');
var request = require('request');

const payRoutes = express.Router();

// Payment Routes
payRoutes.post('/paytm', payController.paytmPayment)
payRoutes.post('/payumoney', payController.payUMoneyPayment)


// Respone Routes
payRoutes.post('/paytm/response', payController.paytmPaymentResponse)
payRoutes.post('/payumoney/response', payController.payUMoneyPaymentResponse)

module.exports = payRoutes;