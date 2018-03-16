
/***
 * author: Tushar Bochare
 * Email: mytusshar@gmail.com
 */

var fs = require("fs");
var path = require('path');
var constants = require('./constants.js');
var model = require('./data_model.js');
var utils = require('./utils.js');
var controller = require('./controller.js');
var dynamo = require('./dynamo.js');

var configData;

module.exports = class CognitoOperation {

    constructor(req, res) {
        this.aws = require('aws-sdk');
        configData = model.awsConfigData();
        this.aws.config.region = configData.awsRegion;
        this.aws.config.endpoint = null;
        this.initOperation(req, res);
    }

    initOperation(req, res) {
        var _aws = this.aws;
        function handleError(err) {
            console.log("CognitoOperation: errorHandler: ", err);
        }

        function handleData(data) {
            /********* setting req session data in data model*********/
            model.globalData(data);
            /********* sending response *********/
            utils.sendResponse(req, res);
        }

        var promise = this.getCognitoIdentity(req, res);
        promise.then(handleData, handleError);
    }

    /********** Cognito: initialize cognito operation ************/
    getCognitoIdentity(req, res) {
        var _aws = this.aws;

        var cognitoAsyncOperation = function(resolveCognito, rejectCognito) {
            var requestType = req.session.data.request;
            var params = utils.getAwsParams(req.session.data);

            /******* initialize the Credentials object *********/
            _aws.config.credentials = new _aws.CognitoIdentityCredentials(params);
            var cognitoCredentials = _aws.config.credentials;
        
            var getCognitoCredenials = function(err) {
                if (!err) {
                    var isUniqueUsername = model.isUniqueUsername();
                    /************* setting cognito data into request **********/
                    req.session.data.cognitoId = cognitoCredentials.identityId;
                    req.session.data.accessKey = cognitoCredentials.accessKeyId;
                    req.session.data.secretKey = cognitoCredentials.secretAccessKey;
                    req.session.data.sessionToken = cognitoCredentials.sessionToken;
        
                    var handleError = function(err) {
                        rejectCognito(err);
                    }
        
                    var handleInsertResult = function(data) {
                        resolveCognito(req.session.data);
                    }

                    var handleData = function(data) {
                        if(requestType == constants.REQ_LOGIN) {
                            utils.loginOperation(data, req.session.data);
                            resolveCognito(req.session.data);
                        } else if (requestType == constants.REQ_REGISTER){
                            if(data) {
                                req.session.data.status = constants.ALREADY_REGISTERED;
                                resolveCognito(req.session.data);
                            } else {
                                var regData = utils.registerOperation(req.session.data);
                                var paramsDB = dynamo.getParamsForDynamoDB(regData, constants.INSERT_DATA);
                                var promiseInsert = dynamo.insertData(paramsDB, new _aws.CognitoIdentityCredentials(params));
                                promiseInsert.then(handleInsertResult, handleError);
                            }
                        }
                    }

                    var handleDataUsername = function(data) {
                        if(data) {
                            if(isUniqueUsername && requestType == constants.REQ_LOGIN) {
                                if(data.cognito_id != req.session.data.cognitoId) {
                                    req.session.data.status = constants.INVALID_USERNAME;
                                    resolveCognito(req.session.data);
                                } else {
                                    var paramsDB = dynamo.getParamsForDynamoDB(req.session.data, constants.READ_COGNITO_ID);
                                    var promiseCognito = dynamo.readData(paramsDB, new _aws.CognitoIdentityCredentials(params));
                                    promiseCognito.then(handleDataCognito, handleError);
                                }                                
                            } else {
                                req.session.data.status = constants.NOT_UNIQUE_USERNAME;
                                resolveCognito(req.session.data);
                            }                            
                        } else {
                            if(isUniqueUsername && requestType == constants.REQ_LOGIN) {
                                req.session.data.status = constants.INVALID_USERNAME;
                                resolveCognito(req.session.data);
                            } else {
                                var paramsDB = dynamo.getParamsForDynamoDB(req.session.data, constants.READ_COGNITO_ID);
                                var promiseCognito = dynamo.readData(paramsDB, new _aws.CognitoIdentityCredentials(params));
                                promiseCognito.then(handleDataCognito, handleError);
                            }                            
                        }
                    }

                    var handleDataCognito = function(data) {
                        if(data) {
                            if(isUniqueUsername && requestType == constants.REQ_LOGIN) {
                                utils.loginOperation(data, req.session.data);
                                resolveCognito(req.session.data);
                            } else {
                                req.session.data.status = constants.ALREADY_REGISTERED;
                                resolveCognito(req.session.data);
                            }                            
                        } else {
                            if(isUniqueUsername && requestType == constants.REQ_LOGIN) {
                                req.session.data.status = constants.NOT_REGISTERED;
                                resolveCognito(req.session.data);
                            } else {
                                var regData = utils.registerOperation(req.session.data);
                                var paramsDB = dynamo.getParamsForDynamoDB(regData, constants.INSERT_DATA);
                                var promiseInsert = dynamo.insertData(paramsDB, new _aws.CognitoIdentityCredentials(params));
                                promiseInsert.then(handleInsertResult, handleError);
                            }
                        }
                    }
                    
                    /********* request Decision logic *********/
                    if(isUniqueUsername && requestType == constants.REQ_REGISTER) {
                        var paramsDB = dynamo.getParamsForDynamoDB(req.session.data, constants.READ_USERNAME);
                        var promiseUsername = dynamo.readData(paramsDB, new _aws.CognitoIdentityCredentials(params));
                        promiseUsername.then(handleDataUsername, handleError);
                    }
                    else if(isUniqueUsername && requestType == constants.REQ_LOGIN) {
                        var paramsDB = dynamo.getParamsForDynamoDB(req.session.data, constants.READ_USERNAME);
                        var promiseUsername = dynamo.readData(paramsDB, new _aws.CognitoIdentityCredentials(params));
                        promiseUsername.then(handleDataUsername, handleError);
                    } else {
                        var paramsDB = dynamo.getParamsForDynamoDB(req.session.data, constants.READ_COGNITO_ID);
                        var promise = dynamo.readData(paramsDB, new _aws.CognitoIdentityCredentials(params));
                        promise.then(handleData, handleError);
                    }
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
