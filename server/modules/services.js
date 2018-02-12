var exports = module.exports = {};

var fs = require("fs");
var path = require('path');
var aws = require('aws-sdk');

var constants = require('./constants.js');
var model = require('./data_model.js')

/********* reading aws configuration from config file */
var configFile = fs.readFileSync(path.join(__dirname, constants.CONFIG_FILE_NAME), 'utf8');
var configData = JSON.parse(configFile);

/********* setting aws region ********/
aws.config.region = configData.aws.awsRegion;

/*********** document client for dynamoDB operation *********/
var docClient;

/*******************************************************/
var loginOperation = function(data) {
    var result;
    if(!data) {
        result = {
            name: "NOT REGISTERED USER",
        }
        /****** setting login status in data_model for not registered user*****/
        model.registrationStatus(constants.NOT_REGISTERED);
    } else {
        /****** setting login status in data_model*****/
        model.loginStatus(constants.LOGIN_SUCCESS);

        var cognitoData = model.cognitoData();
        var accessKey = cognitoData.accessKey;
        var secretKey = cognitoData.secretKey;

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
        model.registrationStatus(constants.ALREADY_REGISTERED);
        result = data;                  
    } else {
        var provider = model.providerName();
        var auth = model.authProviderData();
        var authID = auth.id;

        var cognitoData = model.cognitoData();
        var cognitoID = cognitoData.cognito_id;
        var accessKey = cognitoData.accessKey;
        var secretKey = cognitoData.secretKey;

        result = {
            id: authID,
            provider: provider,
            cognito_id: cognitoID,
            accessKey: accessKey,
            secretKey: secretKey,
            created_on: new Date().toString()
        }

        /****** setting login status in data_model *****/
        model.loginStatus(constants.LOGIN_SUCCESS);

        /****** reading keys from data_model*****/
        var keys = model.paramKeys();
        var reg_data = model.registrationData();

        for(var i=0; i<keys.length; i++) {
            var index = keys[i];
            if(reg_data.hasOwnProperty(index)) {
                result[index] = reg_data[index];
            }
        }
        console.log("registerOperation: DATA: " + JSON.stringify(result));

        // inserting data into DynamoDB
        insertData(result);        
    }
    return result;
}


var getAwsParams = function() {
    var logins = {};
    var provider = model.providerName();

    var authData = model.authProviderData();
    var authToken = authData.token;

    switch(provider) {
        case constants.FACEBOOK: logins = {'graph.facebook.com': authToken};
        break;
        case constants.GOOGLE: logins = {'accounts.google.com': authToken};
        break;
        case constants.AMAZON: logins = {'www.amazon.com': authToken};
        break;
    }

    var params = {
        AccountId: configData.aws.accountId,
        RoleArn: configData.aws.iamRoleArn,
        IdentityPoolId: configData.aws.cognitoIdentityPoolId,
        Logins: logins
    };

    return params;
}


var cognitoAsyncOperation = function(resolveCognito, rejectCognito) {

    var requestType = model.requestType();
    var params = getAwsParams();

    /******* initialize the Credentials object *********/
    aws.config.credentials = new aws.CognitoIdentityCredentials(params);
    /***** assigning creadentials object to another variable *****/
    var cognito_credentials = aws.config.credentials;
  
    var getCognitoCredenials = function(err) {
        if (!err) {               
            /********** Database object must be initialize in here********/
            docClient = new aws.DynamoDB.DocumentClient();

            var udata = {};
            var cognitoID = cognito_credentials.identityId;
            var accessKey = cognito_credentials.accessKeyId;
            var secretKey = cognito_credentials.secretAccessKey;

            cognitoData = {
                cognito_id: cognitoID,
                accessKey: accessKey,
                secretKey: secretKey
            };
            /********* setting CognitoData *********/
            model.cognitoData(cognitoData);
            
            /********* checking user already registered or not ********/
            var promise = readData(cognitoID);

            var handleError = function(err) {
                console.log(requestType + ": ReadData:ERROR:: " + err);
                rejectCognito(err);
            }

            var handleData = function(data) {
                if(requestType == constants.REQ_LOGIN) {
                    /***** calling loginOperation ****/
                    udata = loginOperation(data);
                } else {
                    /***** calling registerOperation ****/
                    udata = registerOperation(data);
                }                            
                resolveCognito(udata);
            }

            promise.then(handleData, handleError);

        } else {
            console.log("*** getCognitoData:ERROR: " + err);
            // Returns error
            rejectCognito(err);
        }
    }
    /********* Get the credentials for authenticated users *********/
    aws.config.credentials.get(getCognitoCredenials);        
}


/********** Cognito: initaites cognito operation ************/
exports.getCognitoIdentity = function(req, res) {
    return new Promise(cognitoAsyncOperation);
}


/********** DynamoDB: insert data operation ************/
var insertData = function(data) {
    var params = {
        TableName: constants.TABLE_NAME,
        Item: data
    };

    var insertOperation = function(err, data) {
        if(err) {
            console.log("table:users::insertData::error - " + JSON.stringify(err, null, 2));
        } else {
            console.log("table:users::insertData::success");
        }
    }
    docClient.put(params, insertOperation);
}


/************* read data using promise *************/
var readData = function(cognito_id) {
    var params = {
        TableName: constants.TABLE_NAME,
        Key: {
            cognito_id: cognito_id,
        }
    };

    var readAsyncOperation = function(resolveReadDB, rejectReadDB) {
        var readOperation = function(err, data) {
            if(err) {
                console.log("table:users::readData::error - " + JSON.stringify(err, null, 2));
                rejectReadDB(err);
            } else {
                console.log("table:users::readData::success" + JSON.stringify(data, null, 2));
                resolveReadDB(data.Item);
            }
        }
        docClient.get(params, readOperation);        
    }

    return new Promise(readAsyncOperation);
}