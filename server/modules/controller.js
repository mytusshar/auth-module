
/***
 * author: Tushar Bochare
 * Email: mytusshar@gmail.com
 */

var exports = module.exports = {};

var fs = require("fs");
var path = require('path');
var refresh = require('passport-oauth2-refresh');

var services = require('./services.js');
var constants = require('./constants.js');
var model = require('./data_model.js');
var CognitoOperation = require('./services.js');
var controller = require('./controller.js');
var utils = require('./utils.js');

/*********** reading developer details from config file*********I*/
var configFile = fs.readFileSync(path.join(__dirname, constants.CONFIG_FILE_NAME), 'utf8');
var configData = JSON.parse(configFile);

// exports.googleDeveloperDetails = configData.google;
// exports.facebookDeveloperDetails = configData.facebook;
// exports.amazonDeveloperDetails = configData.amazon;

if(configData.hasOwnProperty("google")) {
    exports.googleDeveloperDetails = configData.google;
}

if(configData.hasOwnProperty("amazon")) {
    exports.amazonDeveloperDetails = configData.amazon;
}

if(configData.hasOwnProperty("facebook")) {
    exports.facebookDeveloperDetails = configData.facebook;
}

/************ getting user details from auth provider *************/
exports.getUserDetails = function(accessToken, refreshToken, params, profile, done) {
    if(profile.provider == "google") {
        profile.token = params.id_token
        profile.accessToken = accessToken;
    } else {
        profile.token = accessToken;
    }
    profile.refreshToken = refreshToken;
    profile.params = params;
    done(null, profile);
}

exports.successRedirect = function(req, res) {
    res.redirect(constants.SUCCESS);
}

exports.deserializeParam = function(obj, done) {
    done(null, obj);
}

exports.serializeParam = function(user, done) {
    done(null, user);
}

/*********** Authentication request ***********/
exports.handleAuthRequest = function(req, res) {
    var userData = controller.getURLParam(req);
    var requestType = userData.request;
    var provider = userData.provider;
    var uniqueId = model.getRequestId();
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



exports.getGoogleIdToken = function(req, res) {
    var refreshToken = req.body.refreshToken;
    var accessToken = req.body.accessToken;
    var google = require('googleapis');
    var OAuth2 = google.google.auth.OAuth2;
    var client = model.getGoogleClientDetails();
    var oauth2Client = new OAuth2(
        client.clientID,
        client.clientSecret,
        client.callbackURL
    );

    var googleCreden = {
        access_token: accessToken,
        refresh_token: refreshToken
    }
    oauth2Client.setCredentials(googleCreden);

    oauth2Client.refreshAccessToken(responseRefreshOperation);
    function responseRefreshOperation(err, tokens) {
        if(err) {
            console.log("\nrefreshAccessToken: ERROR: ", err);
        } else {
            req.body.newAccessToken = tokens.id_token;
            utils.refreshCognitoInit(req, res);
        }
    }
}

exports.refreshOperation = function(req, res) {
    var refreshToken = req.body.refreshToken;
    var provider = req.body.provider;
    console.log("\n******* REFRESH TOKEN REQUEST: FROM: " + provider + " **********\n");

    switch(provider) {
        case constants.GOOGLE: controller.getGoogleIdToken(req, res);
        break;
        case constants.FACEBOOK: res.json({"FACEBOOK_REFRESH_TOKEN": "FACEBOOK DOES NOT PROVIDE REFRESH TOKEN"});
        break;
        default: {
            function refreshFunction(err, accessToken) {
                if(err) {
                    console.log("\nREFRESH AccessToken ERROR: ", err);
                    res.json({"refresh": "error occured"});
                } else {      
                    req.body.newAccessToken = accessToken;
                    utils.refreshCognitoInit(req, res);
                }
            }
            refresh.requestNewAccessToken(provider, refreshToken, refreshFunction);
        }
    }
}

/************* getting params from url ************/
exports.getURLParam = function(req) {
    var param = req.query;
    var data = {
        request: param.request,
        provider: param.provider
    };

    var configData = model.getConfigurationData();

    if(configData.hasOwnProperty("regFields")) {
        var keys = configData.regFields;
        for(var i=0; i<keys.length; i++) {
            var key = keys[i];
            if(param.hasOwnProperty(key)) {
                var value = param[key];
                data[key] = value;
            }
        }
    }

    // "regFields": ["username", "name", "city", "email"],

    // var keys = model.getRegistrationFields();
    // for(var i=0; i<keys.length; i++) {
    //     var key = keys[i];
    //     if(param.hasOwnProperty(key)) {
    //         var value = param[key];
    //         data[key] = value;
    //     }
    // }
    return data;
}

exports.ensureAuthenticated = function(req, res, next) {
    /*********** setting data from auth provider in request session ***********/
    var authData;
    var sessionData = req.session.data;
    var authData = req.session.passport.user._json;
    var provider = sessionData.provider;

    sessionData.authToken = req.session.passport.user.token;
    sessionData.accessToken = req.session.passport.user.accessToken;
    sessionData.refreshToken = req.session.passport.user.refreshToken;
    sessionData.authName = authData.name;
    sessionData.authEmail = authData.email;

    /****** since passport-amazon return auth_id with key "user_id" ******/
    switch(provider) {
        case constants.AMAZON: sessionData.authId = authData.user_id;
        break;

        default: sessionData.authId = authData.id;
    }

    if(req.isAuthenticated()) {
        return next(); 
    }

    switch(provider) {
        case constants.FACEBOOK: res.redirect(constants.FACEBOOK_LOGIN);
        break;
        case constants.GOOGLE: res.redirect(constants.GOOGLE_LOGIN);
        break;
        case constants.AMAZON: res.redirect(constants.AMAZON_LOGIN);
        break;
    }
}

/******************* cognito operation *****************/
exports.cognitoOperation = function(req, res) {
    new CognitoOperation(req, res);
}