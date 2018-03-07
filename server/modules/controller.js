var exports = module.exports = {};

var fs = require("fs");
var path = require('path');
var services = require('./services.js');
var constants = require('./constants.js');
var model = require('./data_model.js');
var CognitoOperation = require('./services.js');

/*********** reading developer details from config file*********I*/
var configFile = fs.readFileSync(path.join(__dirname, constants.CONFIG_FILE_NAME), 'utf8');
var configData = JSON.parse(configFile);

var facebookClient = configData.facebook;
var googleClient = configData.google;
var amazonClient = configData.amazon;

/***************** developer details ****************/
exports.googleDeveloperDetails = {
    clientID: googleClient.clientID,
    clientSecret: googleClient.clientSecret,
    callbackURL: googleClient.callbackURL,
    profileFields: googleClient.profileFields
}

exports.amazonDeveloperDetails = {
    clientID: amazonClient.clientID,
    clientSecret: amazonClient.clientSecret,
    callbackURL: amazonClient.callbackURL,
    profileFields: amazonClient.profileFields
}

exports.facebookDeveloperDetails = {
    clientID: facebookClient.clientID,
    clientSecret: facebookClient.clientSecret,
    callbackURL: facebookClient.callbackURL,
    profileFields: facebookClient.profileFields
}


/************ getting user details from auth provider *************/
exports.getUserDetails = function(accessToken, refreshToken, params, profile, done) {
    if(profile.provider == "google") {
        profile.token = params.id_token
    } else {
        profile.token = accessToken;
    }
    profile.refreshToken = refreshToken;
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

/************* getting params from url ************/
exports.getURLParam = function(req) {
    var param = req.query;
    var data = {
        request: param.request,
        provider: param.provider 
    };

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

exports.getAwsParams = function(sessionData, refreshToken) {
    var configData = model.awsConfigData();

    var logins = {};
    var provider = sessionData.provider;
    var authToken;
    if(!refreshToken) {
        authToken = sessionData.auth_token;
    } else {
        authToken = sessionData.refresh_token;
    }

    switch(provider) {
        case constants.FACEBOOK: logins = {'graph.facebook.com': authToken};
        break;
        case constants.GOOGLE: logins = {'accounts.google.com': authToken};
        break;
        case constants.AMAZON: logins = {'www.amazon.com': authToken};
        break;
    }

    var params = {
        AccountId: configData.accountId,
        RoleArn: configData.iamRoleArn,
        IdentityPoolId: configData.cognitoIdentityPoolId,
        Logins: logins
    };

    return params;
}


exports.ensureAuthenticated = function(req, res, next) {
    /*********** setting data from auth provider in request session ***********/
    var authData;
    var sessionData = req.session.data;
    var authData = req.session.passport.user._json;
    var provider = sessionData.provider;

    sessionData.auth_token = req.session.passport.user.token;
    sessionData.refresh_token = req.session.passport.user.refreshToken;
    sessionData.auth_name = authData.name;
    sessionData.auth_email = authData.email;

    /****** since passport-amazon return auth_id with key "user_id" ******/
    switch(provider) {
        case constants.AMAZON: sessionData.auth_id = authData.user_id;
        break;

        default: sessionData.auth_id = authData.id;
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