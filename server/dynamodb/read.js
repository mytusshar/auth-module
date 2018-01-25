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

exports.readData = function(email) {
    var params = {
        TableName : "users",
        Key : {
            "email_id" : "mytusshar@gmail.com"
        }
    };

    // Return new promise 
    return new Promise(function(resolve, reject) {
        //Do async job
        docClient.get(params, function(err, data) {
            if(err) {
                console.log("users::readData::error - " + JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("email: " + data.Item.email_id, "\nname: " + data.Item.name);
                console.log("users::readData::success - " + JSON.stringify(data, null, 2));
                resolve(data.Item);
            }
        });
    });

}

