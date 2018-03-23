
/***
 * author: Tushar Bochare
 * Email: mytusshar@gmail.com
 */

var exports = module.exports = {};

var fs = require("fs");
var path = require('path');
var constants = require('./constants.js');

/**** config file data *****/
var configData;
var globalData = {};
var requestId = 0;

exports.globalData = function(data) {
    if(data) {
        globalData[data.idd] = data;

        var keys = Object.keys(globalData);
        console.log("**********  GLOBAL DATA  ***********");
        for(var i=0; i<keys.length; i++) {
            var index = keys[i];
            console.log(index + ":: " + JSON.stringify(globalData[index]) + "\n");
        }
        console.log("*****************************************\n");
    } else {
        return globalData;
    }
}

exports.getRequestId = function() {
    return ++requestId;
}

/******** reading config file *******/
exports.readConfiguration = function() {
    var configFile = fs.readFileSync(path.join(__dirname, constants.CONFIG_FILE_NAME), 'utf8');
    configData = JSON.parse(configFile);

    return configData;
}

/********** return configData ********/
exports.getConfigurationData = function() {
    return configData;
}

/********** reading aws config data *********/
exports.awsConfigData = function() {
    return configData.aws;
}

/********* is login username field is provided ********/
exports.checkUniqueUsername = function() {
    if(configData.hasOwnProperty("uniqueUsername")) {
        return true;
    } else {
        return false;
    }
}

exports.checkGoogleDeveloperDetails = function() {
    if(configData.hasOwnProperty(constants.PROVIDER_GOOGLE)) {
        return true;
    } else {
        return false;
    }
}

exports.checkAmazonDeveloperDetails = function() {
    if(configData.hasOwnProperty(constants.PROVIDER_AMAZON)) {
        return true;
    } else {
        return false;
    }
}

exports.checkFacebookDeveloperDetails = function() {
    if(configData.hasOwnProperty(constants.PROVIDER_FACEBOOK)) {
        return true;
    } else {
        return false;
    }
}

exports.checkRegistrationFields = function() {
    if(configData.hasOwnProperty("regFields")) {
        return true;
    } else {
        return false;
    }
}


/******** setter/getter for registration fields keys *******/
exports.getRegistrationFields = function() {
    return configData.regFields;
}

exports.getGoogleClientDetails = function() {
    return configData.google;
}

exports.getAmazonClientDetails = function() {
    return configData.amazon;
}

exports.getFacebookClientDetails = function() {
    return configData.facebook;
}

exports.getUniqueUsername = function() {
    return configData.uniqueUsername;
}

