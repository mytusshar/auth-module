
var exports = module.exports = {};

var aws = require('aws-sdk');
let awsConfig = {
    "region"            : "us-east-2",
    "endpoint"          : "https://dynamodb.us-east-2.amazonaws.com",
    "accessKeyId"       : "AKIAIGBRTSI3TQ6THKLA",
    "secretAccessKey"   : "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"
};

aws.config.update(awsConfig);

let docClient = new aws.DynamoDB.DocumentClient();

exports.insertData = function(name, email, id) {
    var status = false;
    var inputData = {
        "id"            : id,
        "email_id"      : email,
        "name"          : name,
        "created_on"    : new Date().toString()
    };

    var params = {
        TableName   : "users",
        Item        : inputData
    };

    docClient.put(params, function(err, data) {
        if(err) {
            console.log("users::insertData::error - " + JSON.stringify(err, null, 2));
        } else {
            console.log("users::insertData::success - ");
        }
    })

}

