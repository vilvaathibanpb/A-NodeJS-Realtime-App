// Include our packages in our main server file
const express = require('express');
app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const passport = require('passport');
const config = require('./config/main');
const cors = require('cors');
const port = 3000;
const paymentRoutes = require('./app/routes/payment-routes');
const notifyRoutes = require('./app/routes/notify-routes');
const utilityRoutes = require('./app/routes/utility-routes');

// mongoose.Promise = require('bluebird');

// Use body-parser to get POST requests for API use
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// cors
app.use(cors());

// Log requests to console
app.use(morgan('dev'));

// Passport
app.use(passport.initialize());
require('./config/passport')(passport);

// Base Route
app.get('/', function(req, res) {
  res.send('Relax. We will put the home page here later.');
});

// Connect to database
mongoose.connect(config.database);
mongoose.Promise = global.Promise;

// Start the server
app.listen(port, '0.0.0.0');

console.log('Your server is running on port ' + port + '.');


// *****************  ROUTES *********************

// Auth API Routes
require('./app/routes')(app);
// Payment Routes
app.use('/payment', paymentRoutes);
// Notify Routes
app.use('/notify', notifyRoutes);
// Utility Routes
app.use('/utility', utilityRoutes);


