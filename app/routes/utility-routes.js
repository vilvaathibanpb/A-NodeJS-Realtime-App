const express = require('express');
const config = require('../../config/main');
const utilityController = require('../controllers/utility-controller');

const utilityRoutes = express.Router();

// Payment Routes
utilityRoutes.post('/search', utilityController.masterSearch)

module.exports = utilityRoutes;