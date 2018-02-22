var exports = module.exports = {};

var fs = require("fs");
var path = require('path');
var services = require('./services.js');
var constants = require('./constants.js');
var model = require('./data_model.js');
var CognitoOperation = require('./services2.js');

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
    done(null, profile);
}

exports.successRedirect = function(req, res) {
    // console.log("\n%%%%%% SUCCESS REDIRECT: " + JSON.stringify(req.session) + "\n");
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
    var data = {};

    var keys = model.paramKeys();

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
    var auth_token = req.session.passport.user.token;
    var auth_data = req.session.passport.user._json;
    var sess_data = req.session.data;

    sess_data.auth_token = auth_token;
    sess_data.auth_id = auth_data.id;
    sess_data.auth_name = auth_data.name;
    sess_data.auth_email = auth_data.email;
    // console.log("\n%%%%%% ensureAuthenticated: " + JSON.stringify(req.session.data) + "\n");

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


exports.sendUserData = function(req, res){
    var global_data = model.globalData();
    var user_data = global_data[req.query.id];

    console.log("******** Sending Response ********");
    console.log("ID: " + req.query.id + "=> " + JSON.stringify(user_data) + "\n");

    var requestType = user_data.request;
    var reg_status = user_data.status;
    var login_status = user_data.status;
    var clientResponse;

    switch(requestType) {
        case constants.REQ_LOGIN: {
            if(login_status == constants.LOGIN_SUCCESS) {
                /****** send user data*****/
                clientResponse = user_data;
                clientResponse.status = constants.LOGIN_SUCCESS;
                message: "LOGIN SUCCESS"
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
                clientResponse = user_data;
                clientResponse.status = constants.LOGIN_SUCCESS;
                message: "REGISTER SUCCESS"
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
    console.log("******** ######### ********\n\n");
}


var sendResponse = function(req, res) {
    /********** setting authId in cookie to access the data of user having same id **********/
    // console.log("\n%%%%%% sendResponse: " + JSON.stringify(req.session.data) + "\n");
    res.cookie('userId', req.session.data.idd).sendFile(constants.RESPONSE_FILE, {root: __dirname });
}


/************* error handler for promises ****************/
var handleError = function(err) {
    console.log("CognitoOperation: errorHandler: " + err);
}


/******************* cognito operation *****************/
exports.cognitoOperation = function(req, res) {

    // console.log("\n%%%%%% cognitoOperation: " + JSON.stringify(req.session.data) + "\n");
    
    // var promise = services.getCognitoIdentity(req, res);
    // var handleData = function(data) {
    //     /********* setting req session data in data model*********/
    //     model.globalData(data);
    //     /********* sending response *********/
    //     sendResponse(req, res);
    // }
    // promise.then(handleData, handleError);

    var op = new CognitoOperation(req, res);
}


