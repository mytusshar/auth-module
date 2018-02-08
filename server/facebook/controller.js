var exports = module.exports = {};

var fs = require("fs");
var path = require('path');
var services = require('../aws/services.js');
var routes = require('../routes.js');
var model = require('./data_model.js')

const REQ_REGISTER = "register";
const REQ_LOGIN = "login";
var isLogin = false;

const CONFIG_FILE = 'developer.json';
// reading developer details from JSON file
var facebookDeveloper = fs.readFileSync(path.join(__dirname, CONFIG_FILE), 'utf8');
var fbDev = JSON.parse(facebookDeveloper);

exports.developerDetails = {
    clientID: fbDev.clientID,
    clientSecret: fbDev.clientSecret,  
    callbackURL: fbDev.callbackURL,  
    profileFields: fbDev.profileFields 
}

exports.getUserDetails = function(accessToken, refreshToken, profile, done) {
    profile.token = accessToken;
    var id = profile.id;
    var token = profile.token;
    /********* setting provider *********/
    model.setProviderName("facebook");    
    /*********** setting authProviderData**********/  
    model.setAuthProviderData(id, token);
    done(null, profile);
}

exports.successRedirect = function(req, res) {
    res.redirect(routes.SUCCESS);
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

    var provider = model.getProviderName();
    switch(provider) {
        case "facebook": res.redirect(routes.FACEBOOK_LOGIN);
        break;
        case "google": res.redirect(routes.GOOGLE_LOGIN);
        break;
        case "amazon": res.redirect(routes.AMAZON_LOGIN);
        break;
    }    
}

exports.getURLParam = function(req, res) {

    var param = req.query;
    var reg_data = {};

    var keys = model.getParamKeys();

    for(var i=6; i<keys.length; i++) {
        var key = keys[i];
        var value = param[key];
        reg_data[key] = value;
    }

    /********* setting registration data **********/
    model.setRegistrationData(reg_data);

    /******** setting request type ***********/
    model.setReqType(REQ_REGISTER);

    /******** opening specified passport strategy ***********/
    res.redirect(routes.FACEBOOK_LOGIN);
}

exports.sendUserData = function(req, res){
    var clientResponse;
    
    console.log("******** Sending Response ********")
    var requestType = model.getReqType();
    var reg_status = model.getRegStatus();
    var login_status = model.getLoginStatus();

    if(requestType == "login") {        
        if(login_status == routes.LOGIN_SUCCESS) {
            /****** send user data*****/
            clientResponse = model.getUserData();
            console.log("**** RESPONSE: Login Success and send User data: Message.");
        } 
        else if(reg_status == routes.NOT_REGISTERED){
            clientResponse = {
                "status": routes.NOT_REGISTERED,
                "message": "NOT_REGISTERED user"
            };
            console.log("**** RESPONSE: Not Registered User: Message.");
        } 
        else if(login_status == routes.LOGIN_FAILURE){
            clientResponse = {
                "status": routes.LOGIN_FAILURE,
                "message": "LOGIN FAILURE, try again"
            };
            console.log("**** RESPONSE: Login Failure: Message.");
        }
    } else {
        if(reg_status == routes.ALREADY_REGISTERED) {
            clientResponse = {
                "status": routes.ALREADY_REGISTERED,
                "message": "ALREADY_REGISTERED user"
            };
            console.log("**** RESPONSE: Already Registered Please Login: Message.");
        } 
        else if(login_status == routes.LOGIN_SUCCESS) {
            /****** send user data*****/
            clientResponse = model.getUserData();
            console.log("**** RESPONSE: Register Success and send User data: Message.");
        } 
        else if(reg_status == routes.REGISTER_FAILURE){
            clientResponse = {
                "status": routes.REGISTER_FAILURE,
                "message": "REGISTER_FAILURE try again"
            };
            console.log("**** RESPONSE: Register Failure: Message.");
        }
    }
    
    res.json(clientResponse);
}

var sendResponse = function(req, res) {
    res.sendFile('response.html', {root: __dirname });
}

// error handler for promises
var handleError = function(err) {
    console.log("CognitoOperation: errorHandler:" + err);
}

// This page initialize the CognitoId and the Cognito client
exports.cognitoOperation = function(req, res) {    
    var promise = services.getCognitoIdentity(req, res);
    var handleData = function(data) {

        /********* setting userdata in data model*********/
        model.setUserData(data);

        /********* sending response *********/
        sendResponse(req, res);
    }
    promise.then(handleData, handleError);
}
