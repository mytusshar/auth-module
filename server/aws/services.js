/*
    git reset HEAD server/birds/app.js server/birds/cont.js server/birds/birds.js
*/
var exports = module.exports = {};

var fs = require("fs");
var path = require('path');
var aws = require('aws-sdk');

const CONFIG_FILE = 'config.json';
const TABLE_NAME = "users";
var docClient;
var awsAccountDetails = fs.readFileSync(path.join(__dirname, CONFIG_FILE), 'utf8');
var awsParam = JSON.parse(awsAccountDetails);
 
// set aws region
aws.config.region = awsParam.awsRegion;

// using promise
exports.getCognitoIdentity = function(authToken, provider, req, res) {
    var params = {
        AccountId: awsParam.accountId,
        RoleArn: awsParam.iamRoleArn, 
        IdentityPoolId: awsParam.cognitoIdentityPoolId,
        Logins: {
            'graph.facebook.com': authToken
        }
    };
   
    var cognitoAsyncOperation = function(resolve, reject) {
        //initialize the Credentials object
        aws.config.credentials = new aws.CognitoIdentityCredentials(params);

        var getCognitoCredenials = function(err) {
            if (!err) {
                // getting cognitoToken and setting login status
                var data = {
                    authProvider: provider,
                    userName: req.user.displayName,
                    userId: req.user.id,
                    userEmail: req.user.emails[0].value,
                    cognitoId: aws.config.credentials.identityId,
                    accessKey: aws.config.credentials.accessKeyId,
                    secretKey: aws.config.credentials.secretAccessKey,
                    isLogin: true
                }

                /********************************************************/
                docClient = new aws.DynamoDB.DocumentClient();
                /*********************************************************/
                
                console.log("***********************");
                console.log(data);
                console.log("***********************");
                // inserting data into DynamoDB
                insertData(data);
                // Returns data
                resolve(data);
            } else {
                console.log("*** getCognitoData:ERROR: " + err);
                // Returns error
                reject(err);
            }
        }
        // Get the credentials for authenticated users
        aws.config.credentials.get(getCognitoCredenials);        
    }
    // Return new promise 
    return new Promise(cognitoAsyncOperation);
}


var insertData = function(data) {
    var inputData = {
        "provider": data.authProvider,
        "cognito_id": data.cognitoId,
        "name": data.userName,
        "id": data.userId,
        "email_id": data.userEmail,
        "created_on": new Date().toString()
    };

    var params = {
        TableName: TABLE_NAME,
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

