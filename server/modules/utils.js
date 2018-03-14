
var exports = module.exports = {};

var _aws = new require('aws-sdk');

var constants = require('./constants.js');
var model = require('./data_model.js');
var controller = require('./controller.js');
var dynamo = require('./dynamo.js');

exports.sendResponse = function(req, res) {
    /********** setting authId in cookie to access the data of user having same id **********/
    var userData = req.session.data;
    var requestType = userData.request;
    var requestStatus = userData.status;
    var clientResponse;

    switch(requestType) {
        case constants.REQ_LOGIN: {
            switch(requestStatus) {
                case constants.LOGIN_SUCCESS: {
                    /****** send user data*****/
                    clientResponse = userData;
                    clientResponse.message= "LOGIN SUCCESS"
                    console.log("**** RESPONSE: Login Success and send User data: Message.");
                } break;

                case constants.NOT_REGISTERED: {
                    clientResponse = {
                        status: constants.NOT_REGISTERED,
                        message: "NOT_REGISTERED user"
                    };
                    console.log("**** RESPONSE: Not Registered User: Message.");
                } break;

                case constants.LOGIN_FAILURE: {
                    clientResponse = {
                        status: constants.LOGIN_FAILURE,
                        message: "LOGIN FAILURE, try again"
                    };
                    console.log("**** RESPONSE: Login Failure: Message.");
                } break;

                case constants.INVALID_USERNAME: {
                    clientResponse = {
                        status: constants.INVALID_USERNAME,
                        message: "INVALID_USERNAME, username doesnot match with any account."
                    };
                    console.log("**** RESPONSE: Invalid username: Message.");
                }
            }
        }
        break;

        case constants.REQ_REGISTER: {
            switch(requestStatus) {
                case constants.ALREADY_REGISTERED: {
                    clientResponse = {
                        status: constants.ALREADY_REGISTERED,
                        message: "ALREADY_REGISTERED user"
                    };
                    console.log("**** RESPONSE: Already Registered Please Login: Message.");
                } break;

                case constants.NOT_UNIQUE_USERNAME: {
                    clientResponse = {
                        status: constants.NOT_UNIQUE_USERNAME,
                        message: "USERNAME_ALREADY_EXISTS"
                    };
                    console.log("**** RESPONSE: USERNAME_ALREADY_EXISTS, use other username: Message.");
                } break;

                case constants.LOGIN_SUCCESS: {
                    /****** send user data*****/
                    clientResponse = userData;
                    clientResponse.message = "REGISTER SUCCESS"
                    console.log("**** RESPONSE: Register Success and send User data: Message.");
                } break;

                case constants.REGISTER_FAILURE: {
                    clientResponse = {
                        status: constants.REGISTER_FAILURE,
                        message: "REGISTER_FAILURE try again"
                    };
                    console.log("**** RESPONSE: Register Failure: Message.");
                }
            }
        }
        break;

        default: console.log("DEFAULT: Undefined Request Type.");
    }

    /********** setting user data in cookie *********/
    console.log("\n");
    res.cookie('userId', clientResponse);
    res.sendFile(constants.RESPONSE_FILE, {root: __dirname });
}


exports.loginOperation = function(data, sessionData) {
    if(!data) {
        /****** setting login status in data_model for not registered user*****/
        sessionData.status = constants.NOT_REGISTERED;
    } else {              
        var isUniqueUsername = model.isUniqueUsername();
        if(isUniqueUsername) {
            if(data.cognito_id != sessionData.cognitoId) {
                /****** setting login status in data_model for not registered user*****/
                sessionData.status = constants.NOT_REGISTERED;
            } else {
                /****** setting login status in data_model*****/
                sessionData.status = constants.LOGIN_SUCCESS;
            }
        } else {
            /****** setting login status in data_model*****/
            sessionData.status = constants.LOGIN_SUCCESS;        
        }

        var keys = model.getRegistrationFields();        
        for(var i=0; i<keys.length; i++) {
            var index = keys[i];
            if(data.hasOwnProperty(index)) {
                sessionData[index] = data[index];
            }
        }
    }
    console.log("\nLoginOperation DATA: ", JSON.stringify(sessionData), "\n");
}


exports.registerOperation = function(sessionData) {
    var result = {
        authId: sessionData.authId,
        provider: sessionData.provider,
        cognito_id: sessionData.cognitoId
    }
    /****** setting login status in req session *****/
    sessionData.status = constants.LOGIN_SUCCESS;

    var keys = model.getRegistrationFields();
    for(var i=0; i<keys.length; i++) {
        var index = keys[i];
        if(sessionData.hasOwnProperty(index)) {
            result[index] = sessionData[index];
        }
    }
    console.log("\nregisterOperation: DATA: ", JSON.stringify(result), "\n");
    return result;
}

exports.refreshCognitoInit = function(req, res) {
    var handleRefresh = function(data) {
        res.json({"refreshData": data});
        console.log("\n********** Resolved & Refresh token response sent *******");
    }

    var handleError = function(err) {
        res.json({"refreshError": err});
    }

    var promiseRefresh = refreshCognitoOperation(req, res);
    promiseRefresh.then(handleRefresh, handleError);
}

var refreshCognitoOperation = function(req, res) {
    var cognitoAsyncOperation = function(resolveCognito, rejectCognito) {
        var params = controller.getAwsParams(req.body);
        var creden = new _aws.CognitoIdentityCredentials(params);
        var awsConfig = Object.assign({}, _aws.config);
        awsConfig.credentials = creden;

        var refreshOperation = function(err) {
            if (!err) { 
                var credentials = {};
                credentials.cognitoId = awsConfig.credentials.identityId;
                credentials.accessKey = awsConfig.credentials.accessKeyId;
                credentials.secretKey = awsConfig.credentials.secretAccessKey;
                credentials.sessionToken = awsConfig.credentials.sessionToken;
                console.log("\nREFRESH_COGNITO_SUCCESS: ", credentials);                
                resolveCognito(credentials);
            } else {
                console.log("\nREFRESH_COGNITO_ERROR: ", err);
                rejectCognito(err);
            }
        }
        awsConfig.credentials.refresh(refreshOperation);
    }
    return new Promise(cognitoAsyncOperation);
}