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

    // console.log("\n%%%%%% handleAuthRequest: " + JSON.stringify(req.session.data) + "\n");
    console.log("*************************************");
    console.log("****** NEW: " + provider + " " + requestType + " request. ******");
    console.log("*************************************");
    switch(requestType) {
        case constants.REQ_LOGIN: {
            switch(provider) {
                case constants.FACEBOOK: {
                    res.redirect(constants.FACEBOOK_LOGIN);
                }
                break;

                default: console.log("ERROR: Unknown login request.");
            }

        }
        break;

        case constants.REQ_REGISTER: {
            switch(provider) {
                case constants.FACEBOOK: {
                    res.redirect(constants.FACEBOOK_LOGIN);
                }
                break;

                default: console.log("ERROR: Unknown register request.");
            }
        }
        break;

        default: {
            console.log("\n****ERROR: Unknown request type. Include correct request type in url.");
        }
    }
}

app.get(constants.AUTH_REQUEST_URL, handleAuthRequest);


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

