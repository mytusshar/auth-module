var fs = require("fs");
var path = require('path');

var constants = require('./constants.js');
var model = require('./data_model.js');
var utils = require('./utils.js');
var controller = require('./controller.js');


var configData;

module.exports = class CognitoOperation {

    constructor(req, res, type) {
        this.aws = require('aws-sdk');
        configData = model.awsConfigData();
        this.aws.config.region = configData.awsRegion;
        this.aws.config.endpoint = null;
        if(!type) {
            this.initOperation(req, res);
        } else {
            this.refreshTokenOperation(req, res);
        }
    }

    refreshTokenOperation(req, res) {
        var _aws = this.aws;
        var cognitoAsyncOperation = function(resolveCognito, rejectCognito) {
            // _aws.config.credentials.params = CognitoOperation.getAwsParams(req.body, "refresh");
            _aws.config.credentials.params = controller.getAwsParams(req.session.data);

            var refreshOperation = function(err) {
                if (!err) {
                    var refreshCreden = {};
                    refreshCreden.cognitoID = _aws.config.credentials.identityId;
                    refreshCreden.accessKey = _aws.config.credentials.accessKeyId;
                    refreshCreden.secretKey = _aws.config.credentials.secretAccessKey;

                    res.json({"REFRESH_DATA": refreshCreden});
                    resolveCognito();
                    console.log("\nXXX: ", refreshCreden, "\n\n********** Resolved & Refresh token response sent *******");
                } else {
                    console.log("REFRESH_ERROR: ", err);
                    res.json({"ERROR": err})
                    rejectCognito();
                }
            }
            _aws.config.credentials.refresh(refreshOperation);
        }
        
        return new Promise(cognitoAsyncOperation);
    }

    initOperation(req, res) {
        var _aws = this.aws;
        function handleError(err) {
            console.log("CognitoOperation: errorHandler: ", err);
            delete _aws.config.credentials;
            console.log("\nAWS Object: ", this.aws.config)
        }

        function handleData(data) {
            /********* setting req session data in data model*********/
            model.globalData(data);
            /********* sending response *********/
            utils.sendResponse(req, res);

            /////////////////////////////
            /********* deleting aws credentials *******/
            delete _aws.config.credentials;
            // console.log("\nAWS Object: ", _aws.config)
            /////////////////////////////
        }

        var promise = this.getCognitoIdentity(req, res);
        promise.then(handleData, handleError);
    }
           
    // static getAwsParams(sessionData, refreshToken) {
    //     var logins = {};
    //     var provider = sessionData.provider;
    //     var authToken;
    //     if(!refreshToken) {
    //         authToken = sessionData.auth_token;
    //     } else {
    //         authToken = sessionData.refresh_token;
    //     }
    
    //     switch(provider) {
    //         case constants.FACEBOOK: logins = {'graph.facebook.com': authToken};
    //         break;
    //         case constants.GOOGLE: logins = {'accounts.google.com': authToken};
    //         break;
    //         case constants.AMAZON: logins = {'www.amazon.com': authToken};
    //         break;
    //     }
    
    //     var params = {
    //         AccountId: configData.accountId,
    //         RoleArn: configData.iamRoleArn,
    //         IdentityPoolId: configData.cognitoIdentityPoolId,
    //         Logins: logins
    //     };
    
    //     return params;
    // }


    /********** Cognito: initialize cognito operation ************/
    getCognitoIdentity(req, res) {
        var _aws = this.aws;

        // var readData = function(userSessionData, awsCredentials, type) {
        //     _aws.config.credentials = awsCredentials;
        //     var params;

        //     var queryAsyncOperation = function(resolveQueryDB, rejectQueryDB) {
        //         var queryOperation = function(err, data) {                 
        //             if(err) {
        //                 console.log("\ntable:users::queryData::error - ", JSON.stringify(err, null, 2));
        //                 rejectQueryDB(err);
        //             } else {
        //                 console.log("\ntable:users::queryData::success", JSON.stringify(data.Items[0], null, 2) + "\n");
        //                 resolveQueryDB(data.Items[0]);
        //             }
        //         }
        //         var db = new _aws.DynamoDB.DocumentClient();
        //         db.query(params, queryOperation);        
        //     }

        //     var isUniqueUsername = model.isUniqueUsername();
        //     if(isUniqueUsername && type == "username") {
        //         params = {
        //             ExpressionAttributeValues: {
        //                 ':uname': userSessionData.username
        //             },
        //             KeyConditionExpression: 'username = :uname',
        //             TableName: constants.TABLE_NAME,
        //             IndexName: constants.INDEX_NAME
        //         };
        //         return new Promise(queryAsyncOperation);
        //     } else {
        //         params = {
        //             ExpressionAttributeValues: {
        //                 ':cog_id': userSessionData.cognito_id
        //             },
        //             KeyConditionExpression: 'cognito_id = :cog_id',
        //             TableName: constants.TABLE_NAME
        //         };
        //         return new Promise(queryAsyncOperation);
        //     }
        // }


        // var insertData = function(data, awsCredentials) {
        //     _aws.config.credentials = awsCredentials;
        //     var params = {
        //         TableName: constants.TABLE_NAME,
        //         Item: data
        //     };

        //     var insertOperation = function(err, data) {
        //         if(err) {
        //             console.log("\ntable:users::insertData::error - ", JSON.stringify(err, null, 2) + "\n");
        //         } else {
        //             console.log("\ntable:users::insertData::success\n");
        //         }
        //     }

        //     var db = new _aws.DynamoDB.DocumentClient();
        //     db.put(params, insertOperation);
        // }


        // var registerOperation = function(data, sessionData) {
        //     if(data) {
        //         /****** setting reg status for already registered or username exists condition *****/
        //         if(!sessionData.hasOwnProperty("status")) {
        //             sessionData.status = constants.ALREADY_REGISTERED;
        //         }              
        //     } else {
        //         var result = {
        //             auth_id: sessionData.auth_id,
        //             provider: sessionData.provider,
        //             cognito_id: sessionData.cognito_id
        //         }
        //         /****** setting login status in req session *****/
        //         sessionData.status = constants.LOGIN_SUCCESS;

        //         var keys = model.getRegistrationFields();
        //         for(var i=0; i<keys.length; i++) {
        //             var index = keys[i];
        //             if(sessionData.hasOwnProperty(index)) {
        //                 result[index] = sessionData[index];
        //             }
        //         }
        //         console.log("\nregisterOperation: DATA: ", JSON.stringify(result), "\n");
        //         /******* inserting data into DynamoDB *******/
        //         // var params = CognitoOperation.getAwsParams(req.session.data);
        //         var params = controller.getAwsParams(req.session.data);
        //         utils.insertData(result,  new _aws.CognitoIdentityCredentials(params));
        //     }
        // }


        var cognitoAsyncOperation = function(resolveCognito, rejectCognito) {
            var requestType = req.session.data.request;
            // var params = CognitoOperation.getAwsParams(req.session.data);
            var params = controller.getAwsParams(req.session.data);
            /******* initialize the Credentials object *********/
            _aws.config.credentials = new _aws.CognitoIdentityCredentials(params);
            var cognitoCredentials = _aws.config.credentials;
        
            var getCognitoCredenials = function(err) {
                if (!err) {
                    /************* setting cognito data into request **********/
                    req.session.data.cognito_id = cognitoCredentials.identityId;
                    req.session.data.accessKey = cognitoCredentials.accessKeyId;
                    req.session.data.secretKey = cognitoCredentials.secretAccessKey;
        
                    var handleError = function(err) {
                        rejectCognito(err);
                    }
        
                    var handleData = function(data) {
                        if(requestType == constants.REQ_LOGIN) {
                            utils.loginOperation(data, req.session.data);
                        } else {
                            utils.registerOperation(data, req.session.data);
                        }
                        resolveCognito(req.session.data);
                    }

                    var handleDataUsername = function(data) {
                        if(data) {
                            req.session.data.status = constants.NOT_UNIQUE_USERNAME;
                            utils.registerOperation(data, req.session.data);
                            resolveCognito(req.session.data);
                        } else {
                            var promiseCognito = utils.readData(req.session.data, new _aws.CognitoIdentityCredentials(params), "cognito");
                            promiseCognito.then(handleDataCognito, handleError);
                        }
                    }

                    var handleDataCognito = function(data) {
                        utils.registerOperation(data, req.session.data);
                        resolveCognito(req.session.data);
                    }
                    
                    var isUniqueUsername = model.isUniqueUsername();
                    if(isUniqueUsername && requestType == constants.REQ_REGISTER) {
                        var promiseUsername = utils.readData(req.session.data, new _aws.CognitoIdentityCredentials(params), "username");
                        promiseUsername.then(handleDataUsername, handleError);
                    } else {
                        /********* checking user already registered or not ********/
                        var promise = utils.readData(req.session.data, new _aws.CognitoIdentityCredentials(params));
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
