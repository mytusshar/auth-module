var exports = module.exports = {};

var fs          = require("fs");
var path        = require('path');
var express     = require('express')
var writeDB     = require("../dynamodb/write.js");
var readDB      = require("../dynamodb/read.js");
var bodyParser  = require('body-parser');
var cors        = require('cors');

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(cors());

var USER_NAME;
var USER_EMAIL;
var USER_ID;
var IS_LOGGED_IN;

// reading developer details from JSON file
var facebookDeveloper = fs.readFileSync(path.join(__dirname, 'developer.json'), 'utf8');
var fbDev = JSON.parse(facebookDeveloper);
exports.developerDetails = {
    clientID        : fbDev.clientID,  
    clientSecret    : fbDev.clientSecret,  
    callbackURL     : fbDev.callbackURL,  
    profileFields   : fbDev.profileFields 
}

exports.userDetails = function(accessToken, refreshToken, profile, cb) {
    USER_NAME       = profile.displayName;
    USER_EMAIL      = profile.emails[0].value;
    USER_ID         = profile.id;
    IS_LOGGED_IN    = true;
    writeDB.insertData(USER_NAME, USER_EMAIL, USER_ID);
    return cb(null, profile);
}

exports.successResponse = function(req, res) {
    res.send("<html><body><h2>Successfully Logged in as "
            + USER_NAME + 
            "</h2><br><p>Close tab to continue visiting.</p></body></html>");
} 

// error handler for promises
// var errHandler = function(err) {
//     console.log("errorHandler:" + err);
// }

// route profile
var clientResponse;
exports.sendUserData = function(req, res){
    if (require('connect-ensure-login').ensureLoggedIn()) {
        // var promise = readDB.readData(USER_EMAIL);
        // promise.then(function(Item) {
        //     res.json({ isLoggedIn : IS_LOGGED_IN,name : Item.name, email : Item.email_id, id : Item.id});          
        // }, errHandler);
        clientResponse = {  isLoggedIn  : IS_LOGGED_IN,
                            name        : USER_NAME, 
                            email       : USER_EMAIL, 
                            id          : USER_ID
                        };
        res.json(clientResponse);

    } else {
        clientResponse = { isLoggedIn : IS_LOGGED_IN };
        res.json(clientResponse);
    }
}