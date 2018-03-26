
/***
 * author: Tushar Bochare
 * Email: mytusshar@gmail.com
 */

var exports = module.exports = {};

var refresh = require('passport-oauth2-refresh');
var constants = require('./constants.js');
var model = require('./dataModel.js');
var cognito = require('./cognito.js');
var controller = require('./controller.js');


exports.initDependencies = function() {
    var configData = model.readConfiguration();

    if(model.checkGoogleDeveloperDetails()) {
        exports.googleDeveloperDetails = model.getGoogleClientDetails();
    }
    
    if(model.checkAmazonDeveloperDetails()) {
        exports.amazonDeveloperDetails = model.getAmazonClientDetails();
    }
    
    if(model.checkFacebookDeveloperDetails()) {
        exports.facebookDeveloperDetails = model.getFacebookClientDetails();
    }
}

/************ getting user details from auth provider *************/
exports.getUserDetails = function(accessToken, refreshToken, params, profile, done) {
    if(profile.provider == constants.PROVIDER_GOOGLE) {
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
        case constants.FACEBOOK:
            res.redirect(constants.FACEBOOK_LOGIN);
        break;
        case constants.GOOGLE:
            res.redirect(constants.GOOGLE_LOGIN);
        break;
        case constants.AMAZON:
            res.redirect(constants.AMAZON_LOGIN);
        break;
        default:
            console.log("ERROR: Unknown " + requestType + " request.");
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
            cognitoRefreshOperation(req, res);
        }
    }
}

exports.refreshOperation = function(req, res) {
    var refreshToken = req.body.refreshToken;
    var provider = req.body.provider;
    console.log("\n******* REFRESH TOKEN REQUEST: FROM: " + provider + " **********\n");

    switch(provider) {
        case constants.GOOGLE:
            controller.getGoogleIdToken(req, res);
        break;
        case constants.FACEBOOK:
            res.json({"FACEBOOK_REFRESH_TOKEN": "FACEBOOK DOES NOT PROVIDE REFRESH TOKEN"});
        break;
        default: {
            function refreshFunction(err, accessToken) {
                if(err) {
                    console.log("\nREFRESH AccessToken ERROR: ", err);
                    res.json({"refresh": "error occured"});
                } else {      
                    req.body.newAccessToken = accessToken;
                    cognitoRefreshOperation(req, res);
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

    if(model.checkRegistrationFields()) {
        var keys = model.getRegistrationFields();
        for(var i=0; i<keys.length; i++) {
            var key = keys[i];
            if(param.hasOwnProperty(key)) {
                var value = param[key];
                data[key] = value;
            }
        }
    }

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
        case constants.AMAZON:
            sessionData.authId = authData.user_id;
        break;

        default:
            sessionData.authId = authData.id;
    }

    if(req.isAuthenticated()) {
        return next(); 
    }

    switch(provider) {
        case constants.FACEBOOK:
            res.redirect(constants.FACEBOOK_LOGIN);
        break;
        case constants.GOOGLE:
            res.redirect(constants.GOOGLE_LOGIN);
        break;
        case constants.AMAZON:
            res.redirect(constants.AMAZON_LOGIN);
        break;
    }
}

/******************* cognito operation *****************/
exports.cognitoAuthOperation = function(req, res) {
    new cognito.CognitoAuthOperation(req, res);
}

function cognitoRefreshOperation(req, res) {
    new cognito.CognitoRefreshOperation(req, res);
}
