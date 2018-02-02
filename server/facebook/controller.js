var exports = module.exports = {};

var fs = require("fs");
var path = require('path');
var services = require('../aws/services.js');
var routes = require('../routes.js')

const PROVIDER = "facebook";
var userName;
var userEmail;
var userId;
var isLogin = false;
var cognitoToken;
var accessKey;
var secretKey;

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
    // console.log(profile);
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
    res.redirect(routes.FACEBOOK_LOGIN);
}

var getUserData= function() {
    var data = {
        provider: PROVIDER,
        isLoggedIn: isLogin,
        name: userName,
        email: userEmail,
        id: userId,
        cognitoId: cognitoToken,
        accessKey: accessKey,
        secretKey: secretKey
    }
    return data;
}

exports.sendUserData = function(req, res){
    var clientResponse;
    if (isLogin) {
        clientResponse = getUserData();
    } else {
        clientResponse = { isLoggedIn : isLogin };
    }
    res.json(clientResponse);
}

var sendResponse = function(req, res) {
    res.sendFile('response.html', {root: __dirname });
}

var setUserData = function(data) {
    userEmail = data.userEmail;
    userName = data.userName;
    userId = data.userId;
    cognitoToken = data.cognitoId;
    accessKey = data.accessKey;
    secretKey = data.secretKey;
    isLogin = data.isLogin;
}

// error handler for promises
var handleError = function(err) {
    console.log("errorHandler:" + err);
}
// data handler for promises

// This page initialize the CognitoId and the Cognito client
exports.cognitoOperation = function(req, res) {    
    var promise = services.getCognitoIdentity(req.user.token, PROVIDER, req, res);
    var handleData = function(data) {
        setUserData(data);
        sendResponse(req, res);
    }
    promise.then(handleData, handleError);
}