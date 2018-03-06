var exports = module.exports = {};

var fs = require("fs");
var path = require('path');
var constants = require('./constants.js');

/**** config file data *****/
var configData;

// var param_keys = {};
// var reg_fields ={};
var globalData = {};

// var login_status = constants.LOGIN_FAILURE;
// var register_status = constants.REGISTER_FAILURE;
// var request_type = constants.REQ_LOGIN;

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

/******** reading config file *******/
exports.readConfiguration = function(file_name) {
    var configFile = fs.readFileSync(path.join(__dirname, file_name), 'utf8');
    configData = JSON.parse(configFile);
}

/******** setter/getter for parameter keys *******/
exports.paramKeys = function(file_name) {
    return configData.fields;
}

/******** setter/getter for registration fields keys *******/
exports.getRegistrationFields = function() {
    return configData.reg_fields;
}

/********** reading aws config data *********/
exports.awsConfigData = function() {
    return configData.aws;
}

/********* is login username field is provided ********/
exports.isUniqueUsername = function() {
    return configData.unique_username;
}

/********* is login username field is provided ********/
exports.awsReadOlnyConfig = function() {
    return configData.aws_read_config;
}