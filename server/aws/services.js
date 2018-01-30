var exports = module.exports = {};

var fs = require("fs");
var path = require('path');

var awsAccountDetails = fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8');
var awsParam = JSON.parse(awsAccountDetails);

exports.awsConfig = {
    awsAccountId: awsParam.accountId,
    awsRegion: awsParam.awsRegion, 
    cognitoIdentityPoolId: awsParam.cognitoIdentityPoolId,
    iamRoleArn: awsParam.iamRoleArn
}

/*
git reset HEAD server/birds/app.js server/birds/cont.js server/birds/birds.js
*/