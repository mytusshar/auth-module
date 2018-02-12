var exports = module.exports = {};

var fs = require("fs");
var path = require('path');
var services = require('./services.js');
var constants = require('./constants.js');
var model = require('./data_model.js');

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
exports.getUserDetails = function(accessToken, refreshToken, profile, done) {
    profile.token = accessToken;
    /********* setting provider *********/
    model.providerName(constants.FACEBOOK);

    var authProviderData = {
        id: profile.id,
        token: profile.token
    };
    /*********** setting authProviderData**********/  
    model.authProviderData(authProviderData);
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


exports.ensureAuthenticated = function(req, res, next) {
    if(req.isAuthenticated()) {
        return next(); 
    }

    var provider = model.providerName();
    switch(provider) {
        case constants.FACEBOOK: res.redirect(constants.FACEBOOK_LOGIN);
        break;
        case constants.GOOGLE: res.redirect(constants.GOOGLE_LOGIN);
        break;
        case constants.AMAZON: res.redirect(constants.AMAZON_LOGIN);
        break;
    }    
}


/************* getting params from url ************/
exports.getURLParam = function(req, res) {
    var param = req.query;
    var reg_data = {};
    var keys = model.paramKeys();

    for(var i=0; i<keys.length; i++) {
        var key = keys[i];
        if(param.hasOwnProperty(key)) {
            var value = param[key];
            reg_data[key] = value;
        }
    }

    /********* setting registration data **********/
    model.registrationData(reg_data);
    /******** setting request type ***********/
    model.requestType(constants.REQ_REGISTER);
    /******** opening specified passport strategy ***********/
    res.redirect(constants.FACEBOOK_LOGIN);
}


exports.sendUserData = function(req, res){
    console.log("******** Sending Response ********")
    var requestType = model.requestType();
    var reg_status = model.registrationStatus();
    var login_status = model.loginStatus();
    var clientResponse;

    switch(requestType) {
        case constants.REQ_LOGIN: {
            if(login_status == constants.LOGIN_SUCCESS) {
                /****** send user data*****/
                clientResponse = model.userData();
                clientResponse.status = constants.LOGIN_SUCCESS;
                console.log("**** RESPONSE: Login Success and send User data: Message.");
            } 
            else if(reg_status == constants.NOT_REGISTERED){
                clientResponse = {
                    status: constants.NOT_REGISTERED,
                    message: "NOT_REGISTERED user"
                };
                console.log("**** RESPONSE: Not Registered User: Message.");
            } 
            else if(login_status == constants.LOGIN_FAILURE){
                clientResponse = {
                    status: constants.LOGIN_FAILURE,
                    message: "LOGIN FAILURE, try again"
                };
                console.log("**** RESPONSE: Login Failure: Message.");
            }
        }
        break;

        case constants.REQ_REGISTER: {
            if(reg_status == constants.ALREADY_REGISTERED) {
                clientResponse = {
                    status: constants.ALREADY_REGISTERED,
                    message: "ALREADY_REGISTERED user"
                };
                console.log("**** RESPONSE: Already Registered Please Login: Message.");
            } 
            else if(login_status == constants.LOGIN_SUCCESS) {
                /****** send user data*****/
                clientResponse = model.userData();
                clientResponse.status = constants.LOGIN_SUCCESS;
                console.log("**** RESPONSE: Register Success and send User data: Message.");
            } 
            else if(reg_status == constants.REGISTER_FAILURE){
                clientResponse = {
                    status: constants.REGISTER_FAILURE,
                    message: "REGISTER_FAILURE try again"
                };
                console.log("**** RESPONSE: Register Failure: Message.");
            }
        }
        break;

        default: console.log("DEFAULT: Undefined Request Type.");
    }

    res.json(clientResponse);
}


var sendResponse = function(req, res) {
    res.sendFile(constants.RESPONSE_FILE, {root: __dirname });
}


/************* error handler for promises ****************/
var handleError = function(err) {
    console.log("CognitoOperation: errorHandler:" + err);
}


/******************* cognito operation *****************/
exports.cognitoOperation = function(req, res) {    
    var promise = services.getCognitoIdentity(req, res);
    var handleData = function(data) {
        /********* setting userdata in data model*********/
        model.userData(data);
        /********* sending response *********/
        sendResponse(req, res);
    }
    promise.then(handleData, handleError);
}