/*
    git reset HEAD server/birds/app.js server/birds/cont.js server/birds/birds.js
*/
var exports = module.exports = {};

var fs = require("fs");
var path = require('path');
var AWS = require('aws-sdk');

var awsAccountDetails = fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8');
var awsParam = JSON.parse(awsAccountDetails);
 
// set AWS region
AWS.config.region = awsParam.awsRegion;

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
    // Return new promise 
    return new Promise(function(resolve, reject) {
        //initialize the Credentials object
        AWS.config.credentials = new AWS.CognitoIdentityCredentials(params);
        // Get the credentials for our user
        AWS.config.credentials.get(function(err) {
            if (!err) {
                // getting cognitoToken and setting login status
                var data = {
                    authProvider: provider,
                    userName: req.user.displayName,
                    userId: req.user.id,
                    userEmail: req.user.emails[0].value,
                    cognitoId: AWS.config.credentials.identityId,
                    accessKey: AWS.config.credentials.accessKeyId,
                    secretKey: AWS.config.credentials.secretAccessKey,
                    isLogin: true
                }
                console.log("Access Key: " + AWS.config.credentials.accessKeyId);
                console.log("Secret Key: " + AWS.config.credentials.secretAccessKey);
                console.log("Cognito Token: " + AWS.config.credentials.identityId);
                console.log("***********************");
                console.log("**** calling insertData ****");
                insertData(data);
                resolve(data);
            } else {
                console.log("*** getCognitoData:ERROR: " + err);
                reject(err);
            }
        });
    });
}

let docClient = new AWS.DynamoDB.DocumentClient();

var insertData = function(data) {
    var status = false;
    var inputData = {
        "provider": data.authProvider,
        "cognito_id": data.cognitoId,
        "name": data.userName,
        "id": data.userId,
        "email_id": data.userEmail,
        "created_on": new Date().toString()
    };

    var params = {
        TableName: "sarvaha_users",
        Item: inputData
    };

    docClient.put(params, function(err, data) {
        if(err) {
            console.log("users::insertData::error - " + JSON.stringify(err, null, 2));
        } else {
            console.log("users::insertData::success - ");
        }
    });
}