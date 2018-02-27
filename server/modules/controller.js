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
    // console.log("\n Auth Provider Data: PARAMS: ", profile);
    done(null, profile);
}

exports.successRedirect = function(req, res) {
    // console.log("\n OUTPUT: ", req.session);
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

    /******* for handling username while login request ********/
    var isLoginField = model.isLoginField();
    if(param.request == constants.REQ_LOGIN && isLoginField) {
        data.username = param.username;
    }

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

exports.ensureAuthenticated = function(req, res, next) {
    /*********** setting data from auth provider in request session ***********/
    var auth_data;
    var sess_data = req.session.data;
    var auth_data = req.session.passport.user._json;
    var provider = sess_data.provider;
    // console.log("\nCHECK PROFILE DATA: ", req.session);
    sess_data.auth_token = req.session.passport.user.token;
    sess_data.auth_name = auth_data.name;
    sess_data.auth_email = auth_data.email;

    /****** since passport-amazon return auth id with key "user_id" ******/
    switch(provider) {
        case constants.AMAZON: sess_data.auth_id = auth_data.user_id;
        break;

        default: sess_data.auth_id = auth_data.id;
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


