
/***
 * author: Tushar Bochare
 * Email: mytusshar@gmail.com
 */

var exports = module.exports = {};

/****** Status codes ******/
exports.LOGIN_FAILURE = 0;
exports.LOGIN_SUCCESS = 1;
exports.ALREADY_REGISTERED = 2;
exports.NOT_REGISTERED = 3;
exports.REGISTER_FAILURE = 4;
exports.NOT_UNIQUE_USERNAME = 5;
exports.INVALID_USERNAME = 6;

/****** DynamoDB operation Code *****/
exports.READ_USERNAME = 0;
exports.READ_COGNITO_ID = 1;
exports.INSERT_DATA  = 2;


/******* providers name ********/
exports.FACEBOOK = "facebook";
exports.AMAZON = "amazon";
exports.GOOGLE = "google";

/***** configuration file name ****/
exports.CONFIG_FILE_NAME = "config.json";

/****** response file name  *******/
exports.RESPONSE_FILE = "response.html";

/********* table params **********/
exports.TABLE_NAME = "users";
exports.INDEX_NAME = 'username-index';
exports.TABLE_NAME_2 = "users2";

/********* request type ********/
exports.REQ_REGISTER = "register";
exports.REQ_LOGIN = "login";

/********** Auth request URL *********/
exports.AUTH_REQUEST_URL = "/auth";

// GET redirect to successful login page
exports.SUCCESS = "/success";

/*********** facebook routes *************/
exports.FACEBOOK_LOGIN = "/auth/facebook";
exports.FACEBOOK_CALLBACK = "/auth/facebook/callback";


/*********** google routes *************/
exports.GOOGLE_LOGIN = "/auth/google";
exports.GOOGLE_CALLBACK = "/auth/google/callback";


/*********** amazon routes *************/
exports.AMAZON_LOGIN = "/auth/amazon"; 
exports.AMAZON_CALLBACK = "/auth/amazon/callback";


/****** refresh credentials route *********/
exports.REFRESH_ROUTE = "/refresh";


/*
,
"Condition": {
    "ForAllValues:StringEquals": {
        "dynamodb:LeadingKeys": "${cognito-identity.amazonaws.com:sub}"
    }
}
*/