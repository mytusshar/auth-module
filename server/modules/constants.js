var exports = module.exports = {};


/****** Status codes ******/
exports.REGISTER_FAILURE = 4;
exports.NOT_REGISTERED = 3;
exports.ALREADY_REGISTERED = 2;
exports.LOGIN_SUCCESS = 1;
exports.LOGIN_FAILURE = 0;

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
exports.TABLE_KEY = "cognito_id";

/********* request type ********/
exports.REQ_REGISTER = "register";
exports.REQ_LOGIN = "login";

exports.SERVER_ADDRESS = "http://localhost:3000";

// GET redirect to successful login page
exports.SUCCESS = "/success";

// GET sends user profile data to client
exports.PROFILE = "/profile";


/*********** facebook routes *************/
exports.FACEBOOK_LOGIN = "/auth/facebook";
exports.FACEBOOK_REG = "/reg/facebook"; 
exports.FACEBOOK_CALLBACK = "/auth/facebook/callback";


/*********** google routes *************/
exports.GOOGLE_LOGIN = "/auth/google";
exports.GOOGLE_REG = "/reg/google"; 
exports.GOOGLE_CALLBACK = "/auth/google/callback";


/*********** amazon routes *************/
exports.AMAZON_LOGIN = "/auth/amazon";
exports.AMAZON_REG = "/reg/amazon"; 
exports.AMAZON_CALLBACK = "/auth/amazon/callback";