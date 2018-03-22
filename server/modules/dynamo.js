
/***
 * author: Tushar Bochare
 * Email: mytusshar@gmail.com
 */
var exports = module.exports = {};

var _aws = new require('aws-sdk');
var model = require('./data_model.js');
var constants = require('./constants.js');

exports.insertData = function(params, awsCredentials) {
    _aws.config.credentials = awsCredentials;

    function insertAsyncOperation(resolveInsertDB, rejectInsertDB) {
        function insertOperation(err, data) {                 
            if(err) {
                console.log("\ntable:users::insertData::error - ", JSON.stringify(err, null, 2) + "\n");
                rejectInsertDB(err);
            } else {
                console.log("\ntable:users::insertData::success\n");
                resolveInsertDB(data);
            }
        }
        var db = new _aws.DynamoDB.DocumentClient();
        db.put(params, insertOperation);        
    }
    return new Promise(insertAsyncOperation);
}

exports.readData = function(params, awsCredentials) {
    _aws.config.credentials = awsCredentials;
    
    function queryAsyncOperation(resolveQueryDB, rejectQueryDB) {
        function queryOperation(err, data) {                 
            if(err) {
                console.log("\ntable:users::queryData::error - ", JSON.stringify(err, null, 2));
                rejectQueryDB(err);
            } else {
                console.log("\ntable:users::queryData::success", JSON.stringify(data.Items[0], null, 2) + "\n");
                resolveQueryDB(data.Items[0]);
            }
        }
        var db = new _aws.DynamoDB.DocumentClient();
        db.query(params, queryOperation);        
    }
    return new Promise(queryAsyncOperation);
}

exports.getParamsForDynamoDB = function(data, code) {
    var isUniqueUsername = model.isUniqueUsername();
    if(isUniqueUsername && code == constants.READ_USERNAME) {
        params = {
            ExpressionAttributeValues: {
                ':uname': data.username
            },
            KeyConditionExpression: 'username = :uname',
            TableName: constants.TABLE_NAME,
            IndexName: constants.INDEX_NAME
        };
    }
    else if (code == constants.READ_COGNITO_ID){
        params = {
            ExpressionAttributeValues: {
                ':cog_id': data.cognitoId
            },
            KeyConditionExpression: 'cognito_id = :cog_id',
            TableName: constants.TABLE_NAME
        };
    }
    else if (code == constants.INSERT_DATA) {
        params = {
            TableName: constants.TABLE_NAME,
            Item: data
        };
    } else {
        console.log("UNDEFINED DynamoDB Operation.");
        return;
    }

    return params;
}