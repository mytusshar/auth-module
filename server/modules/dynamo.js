

exports.readData = function(user_sess_data, aws_creden, key_type) {
    _aws.config.credentials = aws_creden; 
    var params;

    var queryAsyncOperation = function(resolveQueryDB, rejectQueryDB) {
        var queryOperation = function(err, data) {                 
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

    var isUniqueUsername = model.isUniqueUsername();
    if(isUniqueUsername && key_type == "username") {
        params = {
            ExpressionAttributeValues: {
                ':uname': user_sess_data.username
            },
            KeyConditionExpression: 'username = :uname',
            TableName: constants.TABLE_NAME,
            IndexName: constants.INDEX_NAME
        };
        return new Promise(queryAsyncOperation);
    } else {
        params = {
            ExpressionAttributeValues: {
                ':cog_id': user_sess_data.cognito_id
            },
            KeyConditionExpression: 'cognito_id = :cog_id',
            TableName: constants.TABLE_NAME
        };
        return new Promise(queryAsyncOperation);
    }
}