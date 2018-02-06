
var aws = require('aws-sdk');
// let awsConfig = {
//     "region"            : "us-east-1",
//     "endpoint"          : "https://dynamodb.us-east-1.amazonaws.com",
//     "accessKeyId"       : "AKIAIGBRTSI3TQ6THKLA",
//     "secretAccessKey"   : "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"
// };

let awsConfig = {
    "region"            : "us-east-1",
    "endpoint"          : "https://dynamodb.us-east-1.amazonaws.com",
    "accessKeyId"       : "ASIAJA442HXODU4B7KTA",
    "secretAccessKey"   : "B2NUTv2q0ogyYIyV1O6ClBz7yqV+ilXj+OkvsLKs"
};

aws.config.update(awsConfig);

let docClient = new aws.DynamoDB.DocumentClient();

var readData = function(email) {
    var params = {
        TableName : "users",
        Key : {
            "cognito_id": "tushar",
        }
        
    };

    //Do async job
    docClient.get(params, function(err, data) {
        if(err) {
            console.log("users::readData::error - " + JSON.stringify(err, null, 2));
        } else {
            console.log("users::readData::success - " + JSON.stringify(data, null, 2));
        }
    });

}

readData();
