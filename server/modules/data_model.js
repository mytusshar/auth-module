var exports = module.exports = {};

var fs = require("fs");
var path = require('path');
var constants = require('./constants.js');

var param_keys = {};
var reg_fields ={};
var global_data = {};

var login_status = constants.LOGIN_FAILURE;
var register_status = constants.REGISTER_FAILURE;
var request_type = constants.REQ_LOGIN;

exports.globalData = function(data) {
    if(data) {
        global_data[data.idd] = data;

        var keys = Object.keys(global_data);
        console.log("**********  GLOBAL DATA  ***********");
        for(var i=0; i<keys.length; i++) {
            var index = keys[i];
            console.log(index + ":: " + JSON.stringify(global_data[index]) + "\n");
        }
        console.log("*****************************************\n");
    } else {
        return global_data;
    }
}

/******** setter/getter for parameter keys *******/
exports.paramKeys = function(file_name) {
    if(file_name) {
        var configFile = fs.readFileSync(path.join(__dirname, file_name), 'utf8');
        var configData = JSON.parse(configFile);
        param_keys = configData.fields;
        reg_fields = configData.reg_fields;

    } else {
        return param_keys;
    }
}

/******** setter/getter for registration fields keys *******/
exports.getRegistrationFields = function() {
    return reg_fields;
}

/********** reading aws config data *********/
exports.awsConfigData = function() {
    /********* reading aws configuration from config file */
    var configFile = fs.readFileSync(path.join(__dirname, constants.CONFIG_FILE_NAME), 'utf8');
    var configData = JSON.parse(configFile);
    return configData;
}

/********* is login username field is provided ********/
exports.isLoginField = function() {
    var configFile = fs.readFileSync(path.join(__dirname, constants.CONFIG_FILE_NAME), 'utf8');
    var configData = JSON.parse(configFile);
    return configData.login_fields;
}