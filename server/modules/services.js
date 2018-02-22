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
var loginOperation = function(data, sess_data) {
    if(!data) {
        /****** setting login status in data_model for not registered user*****/
        sess_data.status = constants.NOT_REGISTERED;
    } else {
        /****** setting login status in data_model*****/
        sess_data.status = constants.LOGIN_SUCCESS;

        var keys = model.getRegistrationFields();

        for(var i=0; i<keys.length; i++) {
            var index = keys[i];
            if(data.hasOwnProperty(index)) {
                sess_data[index] = data[index];
            }
        }
    }
    console.log("**********************");
    console.log("LoginOperation DATA: " + JSON.stringify(sess_data));
    console.log("**********************");
}


var registerOperation = function(data, sess_data) {
    var result;
    if(data) {                         
        /****** setting reg status in data_model for already registered user*****/
        sess_data.status = constants.ALREADY_REGISTERED;                
    } else {

        result = {
            auth_id: sess_data.auth_id,
            provider: sess_data.provider,
            cognito_id: sess_data.cognito_id,
            created_on: new Date().toString()
        }

        /****** setting login status in data_model *****/
        sess_data.status = constants.LOGIN_SUCCESS;

        /****** reading keys from data_model*****/
        var keys = model.getRegistrationFields();

        for(var i=0; i<keys.length; i++) {
            var index = keys[i];
            if(sess_data.hasOwnProperty(index)) {
                result[index] = sess_data[index];
            }
        }
        console.log("**********************");
        console.log("registerOperation: DATA: " + JSON.stringify(result));
        console.log("**********************");

        /******* inserting data into DynamoDB *******/
        insertData(result);        
    }
}


var getAwsParams = function(sess_data) {
    var logins = {};
    var provider = sess_data.provider;
    var authToken = sess_data.auth_token;

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




/********** Cognito: initialize cognito operation ************/
exports.getCognitoIdentity = function(req, res) {

    var cognitoAsyncOperation = function(resolveCognito, rejectCognito) {

        var requestType = req.session.data.request;
        var params = getAwsParams(req.session.data);
    
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

                /************* setting cognito data into request **********/
                req.session.data.cognito_id = cognitoID;
                req.session.data.accessKey = accessKey;
                req.session.data.secretKey = secretKey;

                /********* checking user already registered or not ********/
                var promise = readData(cognitoID);
    
                var handleError = function(err) {
                    console.log(requestType + ": ReadData:ERROR:: " + err);
                    rejectCognito(err);
                }
    
                var handleData = function(data) {
                    if(requestType == constants.REQ_LOGIN) {
                        /***** calling loginOperation ****/
                        loginOperation(data, req.session.data);
                    } else {
                        /***** calling registerOperation ****/
                        registerOperation(data, req.session.data);
                    }                            
                    resolveCognito(req.session.data);
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
            console.log("\ntable:users::insertData::error - " + JSON.stringify(err, null, 2) + "\n");
        } else {
            console.log("\ntable:users::insertData::success\n");
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
                console.log("\ntable:users::readData::error - " + JSON.stringify(err, null, 2) + "\n");
                rejectReadDB(err);
            } else {
                console.log("\ntable:users::readData::success" + JSON.stringify(data, null, 2) + "\n");
                resolveReadDB(data.Item);
            }
        }
        docClient.get(params, readOperation);        
    }

    return new Promise(readAsyncOperation);
}
