var exports = module.exports = {};

var fs = require("fs");
var path = require('path');
var aws = require('aws-sdk');

var routes = require('../routes.js');
var model = require('../facebook/data_model.js')

const CONFIG_FILE = 'config.json';
var docClient;

var awsAccountDetails = fs.readFileSync(path.join(__dirname, CONFIG_FILE), 'utf8');
var awsParam = JSON.parse(awsAccountDetails);

// set aws region
aws.config.region = awsParam.awsRegion;


var loginOperation = function(data) {
    var result;
    if(!data) {
        result = {
            name: "NOT REGISTRED USER",
            isLogin: true
        }
        /****** setting login status in data_model for not registered user*****/
        model.setRegStatus(routes.NOT_REGISTERED);
    } else {
        /****** setting login status in data_model*****/
        model.setLoginStatus(routes.LOGIN_SUCCESS);

        var cognitoData = model.getCognitoData();
        var accessKey = cognitoData.accessKey;
        var secretKey = cognitoData.secretKey;

        data['isLogin'] = true;
        data['accessKey'] = accessKey;
        data['secretKey'] = secretKey;

        result = data;                      
    }
    console.log("LoginOperation DATA: " + JSON.stringify(result));
    return result;
}

var registerOperation = function(data) {
    var result;
    if(data) {
        console.log("**** registerOperation: Already registered: " + JSON.stringify(data));                           
        /****** setting reg status in data_model for already registered user*****/
        model.setRegStatus(routes.ALREADY_REGISTERED);
        result = data;                  
    } else {

        var provider = model.getProviderName();
        var auth = model.getAuthProviderData();
        var authID = auth.id;

        var cognitoData = model.getCognitoData();
        var cognitoID = cognitoData.cognito_id;
        var accessKey = cognitoData.accessKey;
        var secretKey = cognitoData.secretKey;

        result = {
            id: authID,
            provider: provider,                        
            cognito_id: cognitoID,
            accessKey: accessKey,
            secretKey: secretKey,
            isLogin: true
        }

        /****** setting login status in data_model *****/
        model.setLoginStatus(routes.LOGIN_SUCCESS);

        /****** reading keys from data_model*****/
        var keys = model.getParamKeys();
        var reg_data = model.getRegistrationData();

        for(var i=6; i<keys.length; i++) {
            var index = keys[i];
            result[index] = reg_data[index];
        }
        console.log("registerOperation: DATA: " + JSON.stringify(result));  
        // inserting data into DynamoDB
        insertData(result);        
    }
    return result;
}

var cognitoAsyncOperation = function(resolve, reject) {

    var logins = {};
    var provider = model.getProviderName();
    var requestType = model.getReqType();
    
    var authData = model.getAuthProviderData();
    var authToken = authData.token;
    var authID = authData.id;

    switch(provider) {
        case "facebook": logins = {'graph.facebook.com': authToken};
        break;
        case "google": logins = {'accounts.google.com': authToken};
        break;
        case "amazon": logins = {'www.amazon.com': authToken};
        break;
    }

    var params = {
        AccountId: awsParam.accountId,
        RoleArn: awsParam.iamRoleArn,
        IdentityPoolId: awsParam.cognitoIdentityPoolId,
        Logins: logins
    };

    // initialize the Credentials object
    aws.config.credentials = new aws.CognitoIdentityCredentials(params);
  
    var getCognitoCredenials = function(err) {
        if (!err) {              
            /********** Database object must be initialize in here********/
            docClient = new aws.DynamoDB.DocumentClient();

            var udata = {};
           
            var cognitoID = aws.config.credentials.identityId;
            var accessKey = aws.config.credentials.accessKeyId;
            var secretKey = aws.config.credentials.secretAccessKey;

            /********* setting CognitoData *********/
            model.setCognitoData(cognitoID, accessKey, secretKey);
            
            if(requestType == "login") {
                /*********** checking if user not registered **********/
                var promise = readData(cognitoID);

                var handleError = function(err) {
                    console.log("** Login: ReadData:ERROR:: " + err);
                    reject(err);
                }               
                var handleData = function(data) {
                    this.udata = loginOperation(data);                                  
                    resolve(this.udata);
                }
                promise.then(handleData, handleError);

            } else {
                /*********** checking if user already registered **********/
                var promise = readData(cognitoID);
                // error handler for promises
                var handleError = function(err) {
                    console.log("ERROR::Register: ReadData: " + err);
                    reject(err);
                }                 

                var handleData = function(data) {
                    this.udata = registerOperation(data);
                    resolve(this.udata);
                }
                promise.then(handleData, handleError);                    
            }            
        } else {
            console.log("*** getCognitoData:ERROR: " + err);
            // Returns error
            reject(err);
        }
    }
    // Get the credentials for authenticated users
    aws.config.credentials.get(getCognitoCredenials);        
}

exports.getCognitoIdentity = function(req, res) {
    // Return new promise 
    return new Promise(cognitoAsyncOperation);
}

/********** DynamoDB: insert data operation ************/
var insertData = function(data) {
    var inputData = {
        "created_on": new Date().toString()
    };

    /****** reading keys from data_model*****/
    var keys = model.getParamKeys();

    for(var i=0; i<keys.length; i++) {
        var index = keys[i];
        inputData[index] = data[index];
    }

    var params = {
        TableName: routes.TABLE_NAME,
        Item: inputData
    };

    var insertOperation = function(err, data) {
        if(err) {
            console.log("sarvaha_users::insertData::error - " + JSON.stringify(err, null, 2));
        } else {
            console.log("sarvaha_users::insertData::success - ");
        }
    }
    docClient.put(params, insertOperation);
}

/************* read data using promise*************/
var readData = function(cognito_id) {
    var params = {
        TableName: routes.TABLE_NAME,
        Key: {
            "cognito_id": cognito_id,
        }
    };

    var readAsyncOperation = function(resolve, reject) {

        var readOperation = function(err, data) {
            if(err) {
                console.log("users::readData::error - " + JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("users::readData::success - " + JSON.stringify(data, null, 2));
                resolve(data.Item);
            }
        }
        docClient.get(params, readOperation);        
    }
    // Return new promise 
    return new Promise(readAsyncOperation);
}