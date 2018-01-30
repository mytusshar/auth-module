//Required modules and libraries
var express = require('express');
var session = require('express-session');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var controller = require('./facebook/controller.js');
var services = require('./aws/services.js');
var cors = require('cors');

var AWS = require('aws-sdk');

// set AWS region
AWS.config.region = services.awsConfig.awsRegion;

//Initialize express
var app = express();

// set session
app.use(session({
    secret: 'foo',
    resave: true,
    saveUninitialized: true,
    cookie: {expires: false}
}));

//Initialization of passport
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());

//Passport serialization
passport.serializeUser(controller.serializeParam);
passport.deserializeUser(controller.deserializeParam);

//Using the facebook strategy to "Login with facebook"
passport.use(new FacebookStrategy(controller.developerDetails, controller.getUserDetails));

/* GET facebook page for authentication. */
app.get('/facebook', passport.authenticate('facebook'));

/* GET facebook callback page. */
var passportAuth = passport.authenticate('facebook', {
    failureRedirect: '/facebook'
});
app.get('/facebook/callback', passportAuth, controller.successRedirect);

//This page initialize the CognitoId and the Cognito client
var cognitoOperation = function(req, res) {
    var config = services.awsConfig;
    var params = {
        AccountId: config.awsAccountId, 
        RoleArn: config.iamRoleArn, 
        IdentityPoolId: config.cognitoIdentityPoolId, 
        Logins: {
            'graph.facebook.com': req.user.token
        }
    };

    //initialize the Credentials object
    AWS.config.credentials = new AWS.CognitoIdentityCredentials(params);
    // Get the credentials for our user
    AWS.config.credentials.get(function(err) {
        if (!err) {
            // getting CognitoToken
            COGNITO_TOKEN  = AWS.config.credentials.identityId;
            // setting login status
            IS_LOGGED_IN = true;
            var data = {
                userName: req.user.displayName,
                userId: req.user.id,
                userEmail: req.user.emails[0].value,
                cognitoId: COGNITO_TOKEN,
                isLogin: IS_LOGGED_IN
            }
            // setting user data
            controller.setUserData(data);
            console.log("*** COGNITO_TOKEN : " + COGNITO_TOKEN);
            //console.log(data);
        } else {
            console.log("*** getCognitoData:ERROR: " + err);
        }
    });
    // send response
    controller.sendResponse(req, res);
}
//GET success page
app.get('/success', controller.ensureAuthenticated, cognitoOperation);

// send profile data to client
app.get('/profile', controller.sendUserData);

// *********** Server listening on port 3000 *************//
app.set('port', 3000);
var terminalMSG =  function() {
    console.log('Express server listening on port ' + server.address().port);
}
var server = app.listen(app.get('port'), terminalMSG);