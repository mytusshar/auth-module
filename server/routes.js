var exports = module.exports = {};


/****** Status codes ******/
exports.REGISTER_FAILURE = 4;
exports.NOT_REGISTERED = 3;
exports.ALREADY_REGISTERED = 2;
exports.LOGIN_SUCCESS = 1;
exports.LOGIN_FAILURE = 0;

exports.TABLE_NAME = "users";

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
exports.GOOGLE_CALLBACK = "/auth/google/callback";

/*********** amazon routes *************/
exports.AMAZON_LOGIN = "/auth/amazon";
exports.AMAZON_CALLBACK = "/auth/amazon/callback";