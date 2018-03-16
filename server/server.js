

/***
 * author: Tushar Bochare
 * Email: mytusshar@gmail.com
 */

//Required modules
var express = require('express');
var session = require('express-session');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var AmazonStrategy = require('passport-amazon').Strategy;
var refresh = require('passport-oauth2-refresh');
var cors = require('cors');
var bodyParser = require('body-parser');

var controller = require('./modules/controller.js');
var constants = require('./modules/constants.js');
var model = require('./modules/data_model.js');
var CognitoOperation = require('./modules/services.js');
var utils = require('./modules/utils.js');

/********* initializing parameter keys ********* */
model.readConfiguration();

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

/********* authentication url **********/
app.get(constants.AUTH_REQUEST_URL, controller.handleAuthRequest);

/*********** refreh token route ****************/
app.post(constants.REFRESH_ROUTE, controller.refreshOperation);


/*************** Facebook strategy *************/
var facebookStrat = new FacebookStrategy(controller.facebookDeveloperDetails, controller.getUserDetails);
passport.use(facebookStrat);
app.get(constants.FACEBOOK_LOGIN, passport.authenticate(constants.FACEBOOK, { scope: ['email'] }));

var authFacebook = passport.authenticate(constants.FACEBOOK, {
    failureRedirect: constants.FACEBOOK_LOGIN
});
app.get(constants.FACEBOOK_CALLBACK, authFacebook, controller.successRedirect);
/*************** Facebook strategy END *************/


/************** Google Strategy *****************/
var googleStrat = new GoogleStrategy(controller.googleDeveloperDetails, controller.getUserDetails);
passport.use(googleStrat);
app.get(constants.GOOGLE_LOGIN, passport.authenticate(constants.GOOGLE, { scope: ['email'], accessType: 'offline', prompt: 'consent' }));

var authGoogle = passport.authenticate(constants.GOOGLE, {
    failureRedirect: constants.GOOGLE_LOGIN
});
app.get(constants.GOOGLE_CALLBACK, authGoogle, controller.successRedirect);
/************** Google strategy END *************/


/************** Amazon Strategy *****************/
var amazonStrat = new AmazonStrategy(controller.amazonDeveloperDetails, controller.getUserDetails);
passport.use(amazonStrat);
refresh.use(amazonStrat);
app.get(constants.AMAZON_LOGIN, passport.authenticate(constants.AMAZON, { scope: ['profile'] }));

var authAmazon = passport.authenticate(constants.AMAZON, {
    failureRedirect: constants.AMAZON_LOGIN  
});
app.get(constants.AMAZON_CALLBACK, authAmazon, controller.successRedirect);
/************** Google strategy END *************/


// GET success page
app.get(constants.SUCCESS, controller.ensureAuthenticated, controller.cognitoOperation);

app.get("/", function(req, res) {
    res.json({"Status": "server runnning successfully"});
});
/*********** Server listening on port 3000 *************/
app.set('port', 8081);
var terminalMSG =  function() {
    console.log('Express server listening on port ' + server.address().port);
}
var server = app.listen(app.get('port'), terminalMSG);

