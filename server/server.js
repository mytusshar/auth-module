//Required modules and libraries
var express = require('express');
var session = require('express-session');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var AmazonStrategy = require('passport-amazon').Strategy;
var cors = require('cors');
var bodyParser = require('body-parser');

var controller = require('./modules/controller.js');
var constants = require('./modules/constants.js');
var model = require('./modules/data_model.js');
var CognitoOperation = require('./modules/services.js');

/********* initializing parameter keys ********* */
model.readConfiguration(constants.CONFIG_FILE_NAME);

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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Passport serialization
passport.serializeUser(controller.serializeParam);
passport.deserializeUser(controller.deserializeParam);

////////////////////
///////////
var userCount = 0;
///////////
////////////////////

/*********** Authentication request ***********/
var handleAuthRequest = function(req, res) {     
    var userData = controller.getURLParam(req);
    var requestType = userData.request;
    var provider = userData.provider;
    var uniqueId = ++userCount;
    /********* setting data in request session *********/
    req.session.data = userData;
    req.session.data.idd = uniqueId;

    console.log("\n*************************************");
    console.log("****** NEW: " + provider + " " + requestType + " request. ******");
    console.log("*************************************\n");

    switch(provider) {
        case constants.FACEBOOK: {
            res.redirect(constants.FACEBOOK_LOGIN);
        } break;
        case constants.GOOGLE: {
            res.redirect(constants.GOOGLE_LOGIN);
        } break;
        case constants.AMAZON: {
            res.redirect(constants.AMAZON_LOGIN);
        } break;
        default: console.log("ERROR: Unknown " + requestType + " request.");
    }
}
app.get(constants.AUTH_REQUEST_URL, handleAuthRequest);


/*********** refreh token route ****************/
var refreshOperation = function(req, res) {
    console.log("\nREFRESH TOKEN REQUEST: ", req.body.refresh_token);
    new CognitoOperation(req, res, "refresh");
}
app.post(constants.REFRESH_ROUTE, refreshOperation);


/*************** Facebook strategy *************/
passport.use(new FacebookStrategy(controller.facebookDeveloperDetails, controller.getUserDetails));
app.get(constants.FACEBOOK_LOGIN, passport.authenticate(constants.FACEBOOK, { scope: ['email'] }));

var authFacebook = passport.authenticate(constants.FACEBOOK, {
    failureRedirect: constants.FACEBOOK_LOGIN
});
app.get(constants.FACEBOOK_CALLBACK, authFacebook, controller.successRedirect);
/*************** Facebook strategy END *************/


/************** Google Strategy *****************/
passport.use(new GoogleStrategy(controller.googleDeveloperDetails, controller.getUserDetails));
app.get(constants.GOOGLE_LOGIN, passport.authenticate(constants.GOOGLE, { scope: ['email'], accessType: 'offline', prompt: 'consent' }));

var authGoogle = passport.authenticate(constants.GOOGLE, {
    failureRedirect: constants.GOOGLE_LOGIN
});
app.get(constants.GOOGLE_CALLBACK, authGoogle, controller.successRedirect);
/************** Google strategy END *************/


/************** Amazon Strategy *****************/
passport.use(new AmazonStrategy(controller.amazonDeveloperDetails, controller.getUserDetails));
app.get(constants.AMAZON_LOGIN, passport.authenticate(constants.AMAZON, { scope: ['profile'] }));

var authAmazon = passport.authenticate(constants.AMAZON, {
    failureRedirect: constants.AMAZON_LOGIN  
});
app.get(constants.AMAZON_CALLBACK, authAmazon, controller.successRedirect);
/************** Google strategy END *************/


// GET success page
app.get(constants.SUCCESS, controller.ensureAuthenticated, controller.cognitoOperation);

/*********** Server listening on port 3000 *************/
app.set('port', 3000);
var terminalMSG =  function() {
    console.log('Express server listening on port ' + server.address().port);
}
var server = app.listen(app.get('port'), terminalMSG);

