/***
 * author: Tushar Bochare
 * Email: mytusshar@gmail.com
 */

var constants = require('./constants.js');
var model = require('./dataModel.js');
var utils = require('./utils.js');
var dynamo = require('./dynamo.js');

class CognitoAuthOperation {

    constructor(req, res) {
        this.aws = require('aws-sdk');
        var awsConfigData = model.awsConfigData();
        this.aws.config.region = awsConfigData.awsRegion;
        this.aws.config.endpoint = null;
        this.initOperation(req, res);
    }
    
    initOperation(req, res) {
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

    /********** algorithm to handle three use-cases ************/
    getCognitoIdentity(req, res) {
        var _aws = this.aws;

        function cognitoAsyncOperation(resolveCognito, rejectCognito) {
            var requestType = req.session.data.request;
            var params = utils.getAwsParamsForCognito(req.session.data);

            /******* initialize the Credentials object *********/
            _aws.config.credentials = new _aws.CognitoIdentityCredentials(params);
            var cognitoCredentials = _aws.config.credentials;
        
            function getCognitoCredenials(err) {
                if (!err) {
                    
                    var isUniqueUsername = false;
                    if(model.checkUniqueUsername()) {
                        isUniqueUsername = model.getUniqueUsername();
                    }

                    /************* setting cognito data into request **********/
                    req.session.data.cognitoId = cognitoCredentials.identityId;
                    req.session.data.accessKey = cognitoCredentials.accessKeyId;
                    req.session.data.secretKey = cognitoCredentials.secretAccessKey;
                    req.session.data.sessionToken = cognitoCredentials.sessionToken;
        
                    function handleError(err) {
                        rejectCognito(err);
                    }
        
                    function handleInsertResult(data) {
                        resolveCognito(req.session.data);
                    }

                    function handleData(data) {
                        if(requestType == constants.REQ_LOGIN) {
                            utils.loginOperationAfterCognito(data, req.session.data);
                            resolveCognito(req.session.data);
                        } else if (requestType == constants.REQ_REGISTER){
                            if(data) {
                                req.session.data.status = constants.ALREADY_REGISTERED;
                                resolveCognito(req.session.data);
                            } else {
                                var regData = utils.registerOperationAfterCognito(req.session.data);
                                var paramsDB = dynamo.getParamsForDynamoDB(regData, constants.INSERT_DATA);
                                var promiseInsert = dynamo.insertData(paramsDB, new _aws.CognitoIdentityCredentials(params));
                                promiseInsert.then(handleInsertResult, handleError);
                            }
                        }
                    }

                    function handleDataUsername(data) {
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

                    function handleDataCognito(data) {
                        if(data) {
                            if(isUniqueUsername && requestType == constants.REQ_LOGIN) {
                                utils.loginOperationAfterCognito(data, req.session.data);
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
                                var regData = utils.registerOperationAfterCognito(req.session.data);
                                var paramsDB = dynamo.getParamsForDynamoDB(regData, constants.INSERT_DATA);
                                var promiseInsert = dynamo.insertData(paramsDB, new _aws.CognitoIdentityCredentials(params));
                                promiseInsert.then(handleInsertResult, handleError);
                            }
                        }
                    }

                    function handleDataOnlyLogin(data) {
                        if(data) {
                            utils.loginOperationAfterCognito(data, req.session.data);
                            resolveCognito(req.session.data);
                        } else {
                            var regData = utils.registerOperationAfterCognito(req.session.data);
                            var paramsDB = dynamo.getParamsForDynamoDB(regData, constants.INSERT_DATA);
                            var promiseInsertOnlyLogin = dynamo.insertData(paramsDB, new _aws.CognitoIdentityCredentials(params));
                            promiseInsertOnlyLogin.then(handleInsertResult, handleError);
                        }
                    }
                    
                    /********* request Decision logic *********/
                    if(isUniqueUsername) {
                        if(requestType == constants.REQ_REGISTER) {
                            var paramsDB = dynamo.getParamsForDynamoDB(req.session.data, constants.READ_USERNAME);
                            var promiseUsername = dynamo.readData(paramsDB, new _aws.CognitoIdentityCredentials(params));
                            promiseUsername.then(handleDataUsername, handleError);
                        }
                        else if(requestType == constants.REQ_LOGIN) {
                            var paramsDB = dynamo.getParamsForDynamoDB(req.session.data, constants.READ_USERNAME);
                            var promiseUsername = dynamo.readData(paramsDB, new _aws.CognitoIdentityCredentials(params));
                            promiseUsername.then(handleDataUsername, handleError);
                        }
                    } else {
                        if(model.checkRegistrationFields()) {
                            var paramsDB = dynamo.getParamsForDynamoDB(req.session.data, constants.READ_COGNITO_ID);
                            var promise = dynamo.readData(paramsDB, new _aws.CognitoIdentityCredentials(params));
                            promise.then(handleData, handleError);
                        } else {
                            var paramsDB = dynamo.getParamsForDynamoDB(req.session.data, constants.READ_COGNITO_ID);
                            var promiseOnlyLogin = dynamo.readData(paramsDB, new _aws.CognitoIdentityCredentials(params));
                            promiseOnlyLogin.then(handleDataOnlyLogin, handleError);
                        }                        
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



class CognitoRefreshOperation {

    constructor(req, res) {
        function handleRefresh(data) {
            res.json({"refreshData": data});
            console.log("\n********** Resolved & Refresh token response sent *******");
        }
    
        function handleError(err) {
            res.json({"refreshError": err});
        }
    
        var promiseRefresh = this.refreshCognitoOperation(req, res);
        promiseRefresh.then(handleRefresh, handleError);
    }

    refreshCognitoOperation(req, res) {
        function cognitoAsyncOperation(resolveCognito, rejectCognito) {
            var params = utils.getAwsParamsForCognito(req.body);
            var _aws = new require('aws-sdk');
            var creden = new _aws.CognitoIdentityCredentials(params);
            var awsConfig = Object.assign({}, _aws.config);
            awsConfig.credentials = creden;
    
            function refreshOperation(err) {
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
}

module.exports = {
    CognitoAuthOperation : CognitoAuthOperation,
    CognitoRefreshOperation : CognitoRefreshOperation
}