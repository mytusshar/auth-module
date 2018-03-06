
var exports = module.exports = {};

var _aws = new require('aws-sdk');

var constants = require('./constants.js');
var model = require('./data_model.js');
var controller = require('./controller.js');

exports.sendResponse = function(req, res) {
    /********** setting authId in cookie to access the data of user having same id **********/
    var userData = req.session.data;
    var requestType = userData.request;
    var regStatus = userData.status;
    var loginStatus = userData.status;
    var clientResponse;

    switch(requestType) {
        case constants.REQ_LOGIN: {
            if(loginStatus == constants.LOGIN_SUCCESS) {
                /****** send user data*****/
                clientResponse = userData;
                clientResponse.message= "LOGIN SUCCESS"
                console.log("**** RESPONSE: Login Success and send User data: Message.");
            } 
            else if(regStatus == constants.NOT_REGISTERED){
                clientResponse = {
                    status: constants.NOT_REGISTERED,
                    message: "NOT_REGISTERED user"
                };
                console.log("**** RESPONSE: Not Registered User: Message.");
            } 
            else if(loginStatus == constants.LOGIN_FAILURE){
                clientResponse = {
                    status: constants.LOGIN_FAILURE,
                    message: "LOGIN FAILURE, try again"
                };
                console.log("**** RESPONSE: Login Failure: Message.");
            }
        }
        break;

        case constants.REQ_REGISTER: {
            if(regStatus == constants.ALREADY_REGISTERED) {
                clientResponse = {
                    status: constants.ALREADY_REGISTERED,
                    message: "ALREADY_REGISTERED user"
                };
                console.log("**** RESPONSE: Already Registered Please Login: Message.");
            }
            else if(regStatus == constants.NOT_UNIQUE_USERNAME) {
                clientResponse = {
                    status: constants.NOT_UNIQUE_USERNAME,
                    message: "USERNAME_ALREADY_EXISTS"
                };
                console.log("**** RESPONSE: USERNAME_ALREADY_EXISTS, use other username: Message.");
            }
            else if(loginStatus == constants.LOGIN_SUCCESS) {
                /****** send user data*****/
                clientResponse = userData;
                clientResponse.message = "REGISTER SUCCESS"
                console.log("**** RESPONSE: Register Success and send User data: Message.");
            } 
            else if(regStatus == constants.REGISTER_FAILURE){
                clientResponse = {
                    status: constants.REGISTER_FAILURE,
                    message: "REGISTER_FAILURE try again"
                };
                console.log("**** RESPONSE: Register Failure: Message.");
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
            if(data.cognito_id != sessionData.cognito_id) {
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


exports.registerOperation = function(data, sessionData) {
    if(data) {
        /****** setting reg status for already registered or username exists condition *****/
        if(!sessionData.hasOwnProperty("status")) {
            sessionData.status = constants.ALREADY_REGISTERED;
        }              
    } else {
        var result = {
            auth_id: sessionData.auth_id,
            provider: sessionData.provider,
            cognito_id: sessionData.cognito_id
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
        /******* inserting data into DynamoDB *******/
        // var params = CognitoOperation.getAwsParams(req.session.data);
        var params = controller.getAwsParams(sessionData);
        insertData(result,  new _aws.CognitoIdentityCredentials(params));
    }
}



exports.getAwsParams = function(sessionData, refreshToken) {
    var configData = model.awsConfigData();

    var logins = {};
    var provider = sessionData.provider;
    var authToken;
    if(!refreshToken) {
        authToken = sessionData.auth_token;
    } else {
        authToken = sessionData.refresh_token;
    }

    switch(provider) {
        case constants.FACEBOOK: logins = {'graph.facebook.com': authToken};
        break;
        case constants.GOOGLE: logins = {'accounts.google.com': authToken};
        break;
        case constants.AMAZON: logins = {'www.amazon.com': authToken};
        break;
    }

    var params = {
        AccountId: configData.accountId,
        RoleArn: configData.iamRoleArn,
        IdentityPoolId: configData.cognitoIdentityPoolId,
        Logins: logins
    };

    return params;
}


// exports.dynamodbParams = function() {

// }
var insertData = function(data, awsCredentials) {
    _aws.config.credentials = awsCredentials;
    var params = {
        TableName: constants.TABLE_NAME,
        Item: data
    };

    var insertOperation = function(err, data) {
        if(err) {
            console.log("\ntable:users::insertData::error - ", JSON.stringify(err, null, 2) + "\n");
        } else {
            console.log("\ntable:users::insertData::success\n");
        }
    }

    var db = new _aws.DynamoDB.DocumentClient();
    db.put(params, insertOperation);
}


exports.readData = function(userSessionData, awsCredentials, type) {
    _aws.config.credentials = awsCredentials;
    var params;

    var queryAsyncOperation = function(resolveQueryDB, rejectQueryDB) {
        var queryOperation = function(err, data) {                 
            if(err) {
                console.log("\ntable:users::queryData::error - ", JSON.stringify(err, null, 2));
                rejectQueryDB(err);
            } else {
                console.log("\ntable:users::queryData::success", JSON.stringify(data.Items[0], null, 2) + "\n");
                resolveQueryDB(data.Items[0]);
            }
        }
        var db = new _aws.DynamoDB.DocumentClient();
        db.query(params, queryOperation);        
    }

    var isUniqueUsername = model.isUniqueUsername();
    if(isUniqueUsername && type == "username") {
        params = {
            ExpressionAttributeValues: {
                ':uname': userSessionData.username
            },
            KeyConditionExpression: 'username = :uname',
            TableName: constants.TABLE_NAME,
            IndexName: constants.INDEX_NAME
        };
        return new Promise(queryAsyncOperation);
    } else {
        params = {
            ExpressionAttributeValues: {
                ':cog_id': userSessionData.cognito_id
            },
            KeyConditionExpression: 'cognito_id = :cog_id',
            TableName: constants.TABLE_NAME
        };
        return new Promise(queryAsyncOperation);
    }
}


