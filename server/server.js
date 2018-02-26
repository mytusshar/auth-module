//Required modules and libraries
var express = require('express');
var session = require('express-session');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var AmazonStrategy = require('passport-amazon').Strategy;
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

////////////////////
///////////
var user_count = 0;
///////////
////////////////////

/*********** Authentication request ***********/
var handleAuthRequest = function(req, res) {     
    var user_data = controller.getURLParam(req);
    var requestType = user_data.request;
    var provider = user_data.provider;
    var unique_id = ++user_count;

    /********* setting data in request session *********/
    req.session.data = user_data;
    req.session.data.idd = unique_id;

    console.log("\n*************************************");
    console.log("****** NEW: " + provider + " " + requestType + " request. ******");
    console.log("*************************************\n");

    switch(provider) {
        case constants.FACEBOOK: {
            res.redirect(constants.FACEBOOK_LOGIN);
        }
        break;

        case constants.GOOGLE: {
            res.redirect(constants.GOOGLE_LOGIN);
        }
        break;

        case constants.AMAZON: {
            res.redirect(constants.AMAZON_LOGIN);
        }
        break;

        default: console.log("ERROR: Unknown " + requestType + " request.");
    }

}

app.get(constants.AUTH_REQUEST_URL, handleAuthRequest);


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

app.get(constants.GOOGLE_LOGIN, passport.authenticate(constants.GOOGLE, { scope: ['email'] }));

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

