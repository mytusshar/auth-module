
const AWS_REGION = "us-east-1";
const AWS_ENDPOINT = "http://dynamodb.us-east-1.amazonaws.com";
const TABLE_NAME = "users";

const SERVER_ADDRESS = "http://localhost:8081";
const FACEBOOK_LOGIN = SERVER_ADDRESS + "/auth/facebook";
const FACEBOOK_REG = SERVER_ADDRESS + "/reg/facebook";
const URL_AUTHENTICATION = SERVER_ADDRESS + "/auth";
const PROFILE = SERVER_ADDRESS + "/profile";
const REFRESH_URL = SERVER_ADDRESS + "/refresh";
const REQUIRE_LOGIN_NAME = true;

const SESSION_EXPIRE_TIME = 59;
const SESSION_REFRESH_TIME = 59;

const LOGIN = "login";
const REGISTER = "register";
const PROFILE_FILE = "profile.html";
const INDEX_FILE = "index.html";