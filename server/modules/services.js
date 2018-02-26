var fs = require("fs");
var path = require('path');

var constants = require('./constants.js');
var model = require('./data_model.js')

var configData = model.awsConfigData();

module.exports = class CognitoOperation {

    constructor(req, res) {
        this.aws = require('aws-sdk');
        this.aws.config.region = configData.aws.awsRegion;
        this.initOperation(req, res);
    }

    initOperation(req, res) {
        // var _aws = this.getAws();
        // console.log("Authentication: ", _aws.config);     
        function handleError(err) {
            console.log("CognitoOperation: errorHandler: ", err);
        }    

        function handleData(data) {
            /********* setting req session data in data model*********/
            model.globalData(data);
            /********* sending response *********/
            CognitoOperation.sendResponse(req, res);
        }

        var promise = this.getCognitoIdentity(req, res);
        promise.then(handleData, handleError);
    }


    static sendResponse(req, res) {
        /********** setting authId in cookie to access the data of user having same id **********/
        var user_data = req.session.data;
        var requestType = user_data.request;
        var reg_status = user_data.status;
        var login_status = user_data.status;
        var clientResponse;

        switch(requestType) {
            case constants.REQ_LOGIN: {
                if(login_status == constants.LOGIN_SUCCESS) {
                    /****** send user data*****/
                    clientResponse = user_data;
                    clientResponse.message= "LOGIN SUCCESS"
                    console.log("**** RESPONSE: Login Success and send User data: Message.");
                } 
                else if(reg_status == constants.NOT_REGISTERED){
                    clientResponse = {
                        status: constants.NOT_REGISTERED,
                        message: "NOT_REGISTERED user"
                    };
                    console.log("**** RESPONSE: Not Registered User: Message.");
                } 
                else if(login_status == constants.LOGIN_FAILURE){
                    clientResponse = {
                        status: constants.LOGIN_FAILURE,
                        message: "LOGIN FAILURE, try again"
                    };
                    console.log("**** RESPONSE: Login Failure: Message.");
                }
            }
            break;

            case constants.REQ_REGISTER: {
                if(reg_status == constants.ALREADY_REGISTERED) {
                    clientResponse = {
                        status: constants.ALREADY_REGISTERED,
                        message: "ALREADY_REGISTERED user"
                    };
                    console.log("**** RESPONSE: Already Registered Please Login: Message.");
                } 
                else if(login_status == constants.LOGIN_SUCCESS) {
                    /****** send user data*****/
                    clientResponse = user_data;
                    clientResponse.message = "REGISTER SUCCESS"
                    console.log("**** RESPONSE: Register Success and send User data: Message.");
                } 
                else if(reg_status == constants.REGISTER_FAILURE){
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

           
    static getAwsParams(sess_data) {
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
    getCognitoIdentity(req, res) {
        // var _aws = this.getAws();
        var _aws = this.aws;

        var readData = function(cognito_id, aws_creden) {
            _aws.config.credentials = aws_creden;
 
            var params = {
                TableName: constants.TABLE_NAME,
                Key: {
                    cognito_id: cognito_id,
                }
            };

            var readAsyncOperation = function(resolveReadDB, rejectReadDB) {
                var readOperation = function(err, data) {
                    if(err) {
                        console.log("\ntable:users::readData::error - ", JSON.stringify(err, null, 2));
                        rejectReadDB(err);
                    } else {
                        console.log("\ntable:users::readData::success", JSON.stringify(data, null, 2) + "\n");
                        resolveReadDB(data.Item);
                    }
                }
                // console.log("CHECK: ", _aws.config);
                var db = new _aws.DynamoDB.DocumentClient();
                db.get(params, readOperation);        
            }

            return new Promise(readAsyncOperation);
        }


        var insertData = function(data, aws_creden) {
            _aws.config.credentials = aws_creden;
           
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
            console.log("\nLoginOperation DATA: ", JSON.stringify(sess_data), "\n");
        }


        var registerOperation = function(data, sess_data) {            
            if(data) {                       
                /****** setting reg status in data_model for already registered user*****/
                sess_data.status = constants.ALREADY_REGISTERED;                
            } else {        
                var result = {
                    auth_id: sess_data.auth_id,
                    provider: sess_data.provider,
                    cognito_id: sess_data.cognito_id
                }        
                /****** setting login status in req session *****/
                sess_data.status = constants.LOGIN_SUCCESS;        

                var keys = model.getRegistrationFields();        
                for(var i=0; i<keys.length; i++) {
                    var index = keys[i];
                    if(sess_data.hasOwnProperty(index)) {
                        result[index] = sess_data[index];
                    }
                }
                console.log("\nregisterOperation: DATA: ", JSON.stringify(result), "\n");        
                /******* inserting data into DynamoDB *******/
                var params = CognitoOperation.getAwsParams(req.session.data);
                insertData(result,  new _aws.CognitoIdentityCredentials(params));        
            }
        }


        var cognitoAsyncOperation = function(resolveCognito, rejectCognito) {
            var requestType = req.session.data.request;                      
            var params = CognitoOperation.getAwsParams(req.session.data);

            /******* initialize the Credentials object *********/
            _aws.config.credentials = new _aws.CognitoIdentityCredentials(params);
            var cognito_credentials = _aws.config.credentials;
        
            var getCognitoCredenials = function(err) {                
                if (!err) {               
                    /********** Database object must be initialize in here********/        
                    var udata = {};
                    var cognitoID = cognito_credentials.identityId;
                    var accessKey = cognito_credentials.accessKeyId;
                    var secretKey = cognito_credentials.secretAccessKey;
                    /************* setting cognito data into request **********/
                    req.session.data.cognito_id = cognitoID;
                    req.session.data.accessKey = accessKey;
                    req.session.data.secretKey = secretKey;                    
        
                    var handleError = function(err) {
                        rejectCognito(err);
                    }
        
                    var handleData = function(data) {
                        if(requestType == constants.REQ_LOGIN) {                            
                            loginOperation(data, req.session.data);                            
                        } else {                            
                            registerOperation(data, req.session.data);                                        
                        }                            
                        resolveCognito(req.session.data);
                    }
                    /********* checking user already registered or not ********/
                    var promise = readData(cognitoID, new _aws.CognitoIdentityCredentials(params));
                    promise.then(handleData, handleError);        
                } else {
                    rejectCognito(err);
                }
            }
            /********* Get the credentials for authenticated users *********/
            _aws.config.credentials.get(getCognitoCredenials);        
        }

        return new Promise(cognitoAsyncOperation);
    }

};
