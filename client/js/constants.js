
/***
 * author: Tushar Bochare
 * Email: mytusshar@gmail.com
 */
// const CLIENT_REDIRECT_URL = "http://localhost:8080/client/index.html";
const CLIENT_REDIRECT_URL = "http://envclient-env.us-east-1.elasticbeanstalk.com/index.html";

const AWS_REGION = "us-east-1";
const AWS_ENDPOINT = "http://dynamodb.us-east-1.amazonaws.com";
const TABLE_NAME = "users";

// const SERVER_ADDRESS = "http://localhost:8081";
const SERVER_ADDRESS = "https://sampleapplicationna-env.us-east-1.elasticbeanstalk.com";

const URL_AUTHENTICATION = SERVER_ADDRESS + "/auth";
const REFRESH_URL = SERVER_ADDRESS + "/refresh";

const REQUIRE_LOGIN_NAME = true;

const SESSION_EXPIRE_TIME = 0;
const SESSION_REFRESH_TIME = 5;
const SESSION_TIME = 60;

const LOGIN = "login";
const REGISTER = "register";

const PROFILE_FILE = "profile.html";
const INDEX_FILE = "index.html";