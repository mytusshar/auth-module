//Required modules and libraries
var express = require('express');
var session = require('express-session');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var cors = require('cors');

var controller = require('./modules/controller.js');
var constants = require('./modules/constants.js');
var model = require('./modules/data_model.js')

/********* initializing parameter keys ********* */
model.paramKeys(constants.CONFIG_FILE_NAME);


// Initialize express
var app = express();

// set session
app.use(session({
    secret: 'secret',
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


/********* registration route *********/
app.get(constants.FACEBOOK_REG, controller.getURLParam);


/*************** Facebook strategy *************/
passport.use(new FacebookStrategy(controller.facebookDeveloperDetails, controller.getUserDetails));

// GET facebook page for authentication
app.get(constants.FACEBOOK_LOGIN, passport.authenticate(constants.FACEBOOK, { scope: ['email'] }));

// GET facebook callback page
var passportAuth = passport.authenticate(constants.FACEBOOK, {
    failureRedirect: constants.FACEBOOK_LOGIN
});
app.get(constants.FACEBOOK_CALLBACK, passportAuth, controller.successRedirect);
/*************** Facebook strategy END *************/



// GET success page
app.get(constants.SUCCESS, controller.ensureAuthenticated, controller.cognitoOperation);

// GET send profile data to client
app.get(constants.PROFILE, controller.sendUserData);



// *********** Server listening on port 3000 *************//
app.set('port', 3000);
var terminalMSG =  function() {
    console.log('Express server listening on port ' + server.address().port);
}
var server = app.listen(app.get('port'), terminalMSG);