var exports = module.exports = {};

var fs = require("fs");
var path = require('path');
var express = require('express');

var USER_NAME;
var USER_EMAIL;
var USER_ID;
var IS_LOGGED_IN = false;
var COGNITO_TOKEN;

// reading developer details from JSON file
var facebookDeveloper = fs.readFileSync(path.join(__dirname, 'developer.json'), 'utf8');
var fbDev = JSON.parse(facebookDeveloper);
exports.developerDetails = {
    clientID: fbDev.clientID,  
    clientSecret: fbDev.clientSecret,  
    callbackURL: fbDev.callbackURL,  
    profileFields: fbDev.profileFields 
}

exports.getUserDetails = function(accessToken, refreshToken, profile, done) {
    //console.log("**** getUserDetails function");
    profile.token = accessToken;
    var user = profile;
    done(null, profile);
}

exports.successRedirect = function(req, res) {
    res.redirect('/success');
}

exports.deserializeParam = function(obj, done) {
    //console.log("****Inside deserializeuser");
    done(null, obj);
}

exports.serializeParam = function(user, done) {
    //console.log("****Inside serializeuser");
    done(null, user);
}

exports.sendResponse = function(req, res) {
    var html1 = "<html><body><h2>Successfully Logged in as ";
    var html2 = "</h2><br><p>Close tab to continue visiting.</p></body></html>";    
    res.send(html1 + USER_NAME + html2);
    //writeDB.insertData(USER_NAME, USER_EMAIL, COGNITO_TOKEN);
}

exports.ensureAuthenticated = function(req, res, next) {
    if(req.isAuthenticated()) {
        return next(); 
    }
    res.redirect('/facebook');
}

exports.setUserData = function(data) {
    USER_EMAIL = data.userName;
    USER_NAME = data.userEmail;
    USER_ID = data.userId;
    COGNITO_TOKEN = data.cognitoId;
    IS_LOGGED_IN = data.isLogin;
}

var getUserData = function() {
    var data = {
        isLoggedIn: IS_LOGGED_IN,
        name: USER_NAME,
        email: USER_EMAIL,
        id: USER_ID,
        cognitoId: COGNITO_TOKEN
    }
    return data;
}

exports.sendUserData = function(req, res){
    var clientResponse;
    if (IS_LOGGED_IN) {
        clientResponse = getUserData();
    } else {
        clientResponse = { isLoggedIn : IS_LOGGED_IN };
    }

    res.json(clientResponse);
}