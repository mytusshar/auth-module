//Required modules and libraries
var express = require('express');
var session = require('express-session');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var cors = require('cors');

var controller = require('./modules/controller.js');
var constants = require('./modules/constants.js');
var model = require('./modules/data_model.js')
var User = require('./modules/user.js');


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

//////////////////////////////
//////////////////
/************* getting params from url ************/
var getURLParam = function(req) {
    var param = req.query;
    var data = {};

    var keys = model.getRegistrationFields();

    for(var i=0; i<keys.length; i++) {
        var key = keys[i];
        if(param.hasOwnProperty(key)) {
            var value = param[key];
            data[key] = value;
        }
    }
    return data;
}

/////////////////////////////////////////////////////////////
var redirect_home = function redirect_home(req, res){
    console.log("\nInside redirect_home");
    res.send("Login successful");
}


var strat = function(req, res, next){
    var data;
    passport.use(new FacebookStrategy(controller.facebookDeveloperDetails,
        function (accessToken, refreshToken, profile, done) { 
            profile.token = accessToken;

            process.nextTick(function () {    
                profile.token = accessToken;
                /********* setting provider *********/
                model.providerName(constants.FACEBOOK);
                model.requestType("login");

                var authProviderData = {
                    id: profile.id,
                    token: profile.token
                };
                /*********** setting authProviderData**********/  
                model.authProviderData(authProviderData);
            }); 
        }
    ));
    next();
}

app.get(
    constants.FACEBOOK_LOGIN
    ,strat
    ,passport.authenticate(constants.FACEBOOK, { scope: ['email'] })
    //,redirect_home
);
////////////////////////////////////////////////////////////////////////

var handleAuthRequest = function(req, res) {

    var user_data = getURLParam(req);
    var requestType = user_data.request;
    var provider = user_data.provider;

    switch(requestType) {
        case constants.REQ_LOGIN: {

            console.log("\n****LOGIN");

            switch(provider) {
                case constants.FACEBOOK: {
                    console.log("facebook login request.");
                    var user = new User(user_data);
                    req.class = user;
                    res.redirect(constants.FACEBOOK_LOGIN);
                }
                break;

                default: console.log("ERROR: Unknown login request.");
            }

        }
        break;

        case constants.REQ_REGISTER: {
            console.log("\n****REGISTER");

            switch(provider) {
                case constants.FACEBOOK: {
                    console.log("facebook register request.");
                    var user = new User(user_data);
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

app.get("/auth", handleAuthRequest);
//////////////////////////////////////
////////////////////////////////////////////////


// app.get(constants.FACEBOOK_LOGIN, passport.authenticate(constants.FACEBOOK, { scope: ['email'] }));

// GET facebook callback page
var passportAuth = passport.authenticate(constants.FACEBOOK, {
    failureRedirect: constants.FACEBOOK_LOGIN
});
app.get(constants.FACEBOOK_CALLBACK, passportAuth, controller.successRedirect);







/*************** Facebook strategy *************/
// passport.use(new FacebookStrategy(controller.facebookDeveloperDetails, controller.getUserDetails));

// GET facebook page for authentication
// app.get(constants.FACEBOOK_LOGIN, passport.authenticate(constants.FACEBOOK, { scope: ['email'] }));

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