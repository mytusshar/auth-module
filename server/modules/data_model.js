var exports = module.exports = {};

var fs = require("fs");
var path = require('path');
var constants = require('./constants.js');

var param_keys = {};
var reg_fields = {};
var user_data = {};
var reg_data = {};
var cognito_data = {};
var auth_data = {};
var provider;

var login_status = constants.LOGIN_FAILURE;  // code:=> {LoginSuccess: 1,, Loginfailure: 0,, }
var register_status = constants.REGISTER_FAILURE; // code:=> {AlreadyRegistered: 2,, NotRegistered: 3,, RegistrationFailure: 4,, }
var request_type = constants.REQ_LOGIN;


/******** setter/getter for ID obtained from auth provider*******/
exports.authProviderData = function(data) {
    if(data) {
        auth_data = data;
        console.log("DataModel: AuthProviderData: " + JSON.stringify(auth_data));
    } else {
        return auth_data;
    }
}


/******** setter/getter for cognito data*******/
exports.cognitoData = function(data) {
    if(data) {
        cognito_data = data;
        console.log("DataModel: CognitoData: " + JSON.stringify(cognito_data));
    } else {
        return cognito_data;
    }
}


/******** setter/getter for auth provider name *******/
exports.providerName = function(data) {
    if(data) {
        provider = data;
        console.log("DataModel: Provider: " + provider);
    } else {
        return provider;
    }
}


/******** setter/getter for request type *******/
exports.requestType = function(data) {
    if(data) {
        request_type = data;
    console.log("DataModel: ReqType: " + request_type);
    } else {
        return request_type;
    }
}


/******** setter/getter for login status *******/
exports.loginStatus = function(data) {
    if(data) {
        login_status = data;
        console.log("DataModel: loginStatus: " + login_status);
    } else {
        return login_status;
    }
}


/******** setter/getter for registration status *******/
exports.registrationStatus = function(status) {
    if(status) {
        register_status = status;
        console.log("*** registerStatus: " + register_status);
    } else {
        return register_status;
    }
}


/******** setter/getter for registration data *******/
exports.registrationData = function(data) {
    if(data) {
        reg_data = data;
        console.log("*** Data_model: REG DATA: " + JSON.stringify(reg_data));
    } else {
        return reg_data;
    }
}

/******** setter/getter for user data *******/
exports.userData = function(data) {
    if(data) {
        for(var i=0; i<param_keys.length; i++) {
            var key = param_keys[i];
            var value = data[key];
            user_data[key] = value;
        }
        console.log("Data_model: userData" + JSON.stringify(user_data));
    } else {
        return user_data;
    }
}


/******** setter/getter for parameter keys *******/
exports.paramKeys = function(file_name) {
    if(file_name) {
        var configFile = fs.readFileSync(path.join(__dirname, file_name), 'utf8');
        var configData = JSON.parse(configFile);
        param_keys = configData.fields;
        reg_fields = configData.reg_fields;
        console.log("Param Key:" + param_keys);
    } else {
        return param_keys;
    }
}


/******** setter/getter for registration fields keys *******/
exports.getRegistrationFields = function() {
    return reg_fields;
}
