//Required modules and libraries
var express = require('express');
var session = require('express-session');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var controller = require('./facebook/controller.js');
var cors = require('cors');

// Initialize express
var app = express();

// set session
app.use(session({
    secret: 'foo',
    resave: true,
    saveUninitialized: true,
    cookie: {expires: false}
}));

// Initialization of passport
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());

// Passport serialization
passport.serializeUser(controller.serializeParam);
passport.deserializeUser(controller.deserializeParam);

// Using the facebook strategy to "Login with facebook"
passport.use(new FacebookStrategy(controller.developerDetails, controller.getUserDetails));

// GET facebook page for authentication
app.get('/facebook', passport.authenticate('facebook', {
    scope: ['email']
  }));

// GET facebook callback page
var passportAuth = passport.authenticate('facebook', {
    failureRedirect: '/facebook'
});
app.get('/facebook/callback', passportAuth, controller.successRedirect);

// GET success page
app.get('/success', controller.ensureAuthenticated, controller.cognitoOperation);

// send profile data to client
app.get('/profile', controller.sendUserData);

// *********** Server listening on port 3000 *************//
app.set('port', 3000);
var terminalMSG =  function() {
    console.log('Express server listening on port ' + server.address().port);
}
var server = app.listen(app.get('port'), terminalMSG);