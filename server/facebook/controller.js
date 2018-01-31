var exports = module.exports = {};

var fs = require("fs");
var path = require('path');
var express = require('express');
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

var getUserData = function() {
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
    var html1 = "<html><body><h2>Successfully Logged in as ";
    var html2 = "</h2><br><p>Close tab to continue visiting.</p></body></html>";    
    res.send(html1 + userName + html2);
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

// This page initialize the CognitoId and the Cognito client
exports.cognitoOperation = function(req, res) {    
    var promise = services.getCognitoIdentity(req.user.token, PROVIDER, req, res);
    promise.then(function(data) {
        setUserData(data);
        sendResponse(req, res);     
    }, handleError);
}