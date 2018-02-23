var fs = require("fs");
var path = require('path');
var Cookie = require('js-cookie');
// var aws = require('aws-sdk');

var constants = require('./constants.js');
var model = require('./data_model.js')

/********* reading aws configuration from config file */
var configFile = fs.readFileSync(path.join(__dirname, constants.CONFIG_FILE_NAME), 'utf8');
var configData = JSON.parse(configFile);



module.exports = class CognitoOperation {

    constructor(req, res) {
        this.id = req.session.data.idd;
        this.req = req;
        this.res = res;
        this.docClient = null;
        this.sess_data = req.session.data;
        
        this.aws = require('aws-sdk');
        this.aws.config.region = configData.aws.awsRegion;

        this.initOperation(req, res);
    }


    getAws() {
        return this.aws;
    }


    initOperation(req, res) {

        var temp = this.getAws();
        console.log("Authentication: ", temp.config);

        var promise = this.getCognitoIdentity(req, res);

        /************* error handler for promises ****************/
        var handleError = function(err) {
            console.log("CognitoOperation: errorHandler: ", err);
        }

        var sendResponse = function(req, res) {
            /********** setting authId in cookie to access the data of user having same id **********/
            console.log("\n%%%%%% sendResponse: ", JSON.stringify(req.session.data) + "\n");
            // res.cookie('userId', data);
            // res.sendFile(constants.RESPONSE_FILE, {root: __dirname });


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


            res.cookie('userId', clientResponse);
            res.sendFile(constants.RESPONSE_FILE, {root: __dirname });


        }

        var handleData = function(data) {
            /********* setting req session data in data model*********/
            model.globalData(data);
            /********* sending response *********/
            sendResponse(req, res);
        }
        promise.then(handleData, handleError);
    }


           


    /********** Cognito: initialize cognito operation ************/
    getCognitoIdentity(req, res) {

        var temp = this.getAws();

        var cognitoAsyncOperation = function(resolveCognito, rejectCognito) {

            var requestType = req.session.data.request;

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
            var params = getAwsParams(req.session.data);


        
            /******* initialize the Credentials object *********/
            temp.config.credentials = new temp.CognitoIdentityCredentials(params);

            /***** assigning creadentials object to another variable *****/
            var cognito_credentials = temp.config.credentials;


        
            var getCognitoCredenials = function(err) {
                console.log("getCognitoCredenials");
                var docClient;
                /************* read data using promise *************/
                var readData = function(cognito_id, aws_creden) {

                    temp.config.credentials = aws_creden;
                    var db = new temp.DynamoDB.DocumentClient()

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
                                console.log("CognitoID: " + cognitoID + "\n");
                                console.log("CHECK: ", temp.config);
                                rejectReadDB(err);
                            } else {
                                console.log("\ntable:users::readData::success", JSON.stringify(data, null, 2) + "\n");
                                console.log("CHECK: ", temp.config);
                                resolveReadDB(data.Item);
                            }
                        }

                        db.get(params, readOperation);        
                    }

                    return new Promise(readAsyncOperation);
                }

                /********** DynamoDB: insert data operation ************/
                var insertData = function(data, aws_creden) {

                    temp.config.credentials = aws_creden;
                    var db = new temp.DynamoDB.DocumentClient()

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
                    db.put(params, insertOperation);
                }


                
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

                    console.log("\n%%%%%% getCognitoIdentity: ", JSON.stringify(req.session.data) + "\n");

                    /*************************************** */
                    /*************************************** */
                    /********* checking user already registered or not ********/
                    var promise = readData(cognitoID, new temp.CognitoIdentityCredentials(params));
                    /*************************************** */
                    /*************************************** */
        
                    var handleError = function(err) {
                        // console.log(requestType + ": ReadData:ERROR:: ", err);
                        rejectCognito(err);
                    }
        
                    var handleData = function(data) {
                        if(requestType == constants.REQ_LOGIN) {

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
                                console.log("LoginOperation DATA: ", JSON.stringify(sess_data));
                                console.log("**********************");
                            }
                            /***** calling loginOperation ****/
                            loginOperation(data, req.session.data);                            
                        } else {

                            var registerOperation = function(data, sess_data) {
                                var result;
                                if(data) {
                                    // console.log("**** registerOperation: Already registered: " + JSON.stringify(data));                           
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
                                    console.log("registerOperation: DATA: ", JSON.stringify(result));
                                    console.log("**********************");
                            
                                    /******* inserting data into DynamoDB *******/
                                    insertData(result,  new temp.CognitoIdentityCredentials(params));        
                                }
                            }
                            /***** calling registerOperation ****/
                            registerOperation(data, req.session.data);
                                        
                        }                            
                        resolveCognito(req.session.data);
                    }
        
                    promise.then(handleData, handleError);        
                } else {
                    // console.log("*** getCognitoData:ERROR: ", err);
                    // Returns error
                    rejectCognito(err);
                }
            }
            /********* Get the credentials for authenticated users *********/
            temp.config.credentials.get(getCognitoCredenials);        
        }

        return new Promise(cognitoAsyncOperation);
    }


};
















