var fs = require("fs");
var path = require('path');
var constants = require('./constants.js');
var controller = require('./controller.js');

var user_data = {};
var reg_data = {};
var cognito_data = {};
var auth_data = {};
var provider;

var login_status = constants.LOGIN_FAILURE;
var register_status = constants.REGISTER_FAILURE;
var request_type;


module.exports = class User {

    constructor(data) {
        user_data = data;       
        console.log("\nCLASS: contructor: " + JSON.stringify(user_data));

    }
    /******** setter/getter for ID obtained from auth provider*******/
    authProviderData(data) {
        if(data) {
            auth_data = data;
            console.log("CLASS: AuthProviderData: " + JSON.stringify(auth_data));
        } else {
            return auth_data;
        }
    }
    
    /******** setter/getter for cognito data*******/
    cognitoData(data) {
        if(data) {
            cognito_data = data;
            console.log("CLASS: CognitoData: " + JSON.stringify(cognito_data));
        } else {
            return cognito_data;
        }
    }


    /******** setter/getter for auth provider name *******/
    providerName(data) {
        return user_data.provider;
    }


    /******** setter/getter for request type *******/
    requestType() {
        return user_data.request;
    }    


    /******** setter/getter for login status *******/
    loginStatus(status) {
        if(status) {
            login_status = status;
            console.log("CLASS: loginStatus: " + login_status);
        } else {
            return login_status;
        }
    }


    /******** setter/getter for registration status *******/
    registrationStatus(status) {
        if(status) {
            register_status = status;
            console.log("CLASS: registerStatus: " + register_status);
        } else {
            return register_status;
        }
    }


    /******** setter/getter for registration data *******/
    registrationData(data) {
        return reg_data;
    }

    /******** setter/getter for user data *******/
    userData(data) {
        if(data) {
            for(var i=0; i<param_keys.length; i++) {
                var key = param_keys[i];
                var value = data[key];
                user_data[key] = value;
            }
            console.log("CLASS: userData" + JSON.stringify(user_data));
        } else {
            return user_data;
        }
    }

    sendResponse(req, res) {
        res.sendFile(constants.RESPONSE_FILE, {root: __dirname });
    }
    /************* error handler for promises ****************/
    handleError(err) {
        console.log("CognitoOperation: errorHandler:" + err);
    }

    cognitoOperation(req, res) {    
        var promise = services.getCognitoIdentity(req, res);
        var handleData = function(data) {
            /********* setting userdata in data model*********/
            userDatal(data);
            /********* sending response *********/
            sendResponse(req, res);
        }
        promise.then(handleData, handleError);
    }
};