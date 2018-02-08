
var exports = module.exports = {};

var fs = require("fs");
var path = require('path');

var param_keys = {};
var user_data = {};
var reg_data = {};

var loginStatus = 0;  // code:=> {LoginSuccess: 1,, Loginfailure: 0,, }
var registerStatus = 0; // code:=> {AlreadyRegistered: 2,, NotRegistered: 3,, RegistrationFailure: 4,, }
var requestType = "login";

var provider;
var cognitoData = {};
var authProviderData = {};

const REG_CONFIG = 'reg_config.json';

/******** setter/getter for ID obtained from auth provider*******/
exports.setAuthProviderData = function(id, token) {
    authProviderData = {
        "id": id,
        "token": token
    };
    console.log("DataModel: AuthProviderData: " + JSON.stringify(authProviderData));
}
exports.getAuthProviderData = function() {
    return authProviderData;
}

/******** setter/getter for cognito data*******/
exports.setCognitoData = function(cognitoID, accessKey, secretKey) {
    cognitoData = {
        "cognito_id": cognitoID,
        "accessKey": accessKey,
        "secretKey": secretKey
    };
    console.log("DataModel: CognitoData: " + JSON.stringify(cognitoData));
}
exports.getCognitoData = function() {
    return cognitoData;
}

/******** setter/getter for auth provider name *******/
exports.setProviderName = function(name) {
    provider = name;
    console.log("DataModel: Provider: " + provider);
}
exports.getProviderName = function() {
    return provider;
}


/******** setter/getter for request type *******/
exports.setReqType = function(type) {
    requestType = type;
    console.log("DataModel: ReqType: " + requestType);
}
exports.getReqType = function() {
    return requestType;
}

/******** setter/getter for login status *******/
exports.setLoginStatus = function(status) {
    loginStatus = status;
    console.log("DataModel: loginStatus: " + loginStatus);
}
exports.getLoginStatus = function() {
    return loginStatus;
}

/******** setter/getter for registration status *******/
exports.setRegStatus = function(status) {
    registerStatus = status;
    console.log("*** registerStatus: " + registerStatus);
}
exports.getRegStatus = function() {
    return registerStatus;
}


/******** setter/getter for registration data *******/
exports.getRegistrationData = function() {
    return reg_data;
}
exports.setRegistrationData = function(data) {
    reg_data = data;
    console.log("*** Data_model: REG DATA: " + JSON.stringify(reg_data));
}


/******** setter/getter for parameter keys *******/
exports.getParamKeys = function() {
    return param_keys;
}
exports.setParamKeys = function() {
    var regConfig = fs.readFileSync(path.join(__dirname, '..', 'config', REG_CONFIG), 'utf8');
    var keys = JSON.parse(regConfig);

    param_keys = keys.fields;
    console.log("*** PARAM_KEYS: " + JSON.stringify(param_keys));
}


/******** setter/getter for user data *******/
exports.getUserData = function() {
    return user_data;
}
exports.setUserData = function(data) {

    for(var i=0; i<param_keys.length; i++) {
        var key = param_keys[i];
        var value = data[key];
        user_data[key] = value;
    }
    console.log("*** data_model: " + JSON.stringify(user_data));
}

