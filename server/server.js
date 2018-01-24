
var fs = require("fs");
var express = require('express');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var bodyParser = require('body-parser');
var cors = require('cors');
var writeDB = require("./write.js");
var readDB = require("./read.js");

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(require('cookie-parser')());
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());

var USER_NAME;
var USER_EMAIL;
var USER_ID;
var IS_LOGGED_IN = false;

// getting user details from facebook
var fbUserDetails = function(accessToken, refreshToken, profile, cb) {
    console.log("inside: fbUserDetails");
    console.log(profile.emails[0].value, profile.displayName, profile.id);
    USER_NAME = profile.displayName;
    USER_EMAIL = profile.emails[0].value;
    USER_ID = profile.id;
    IS_LOGGED_IN = true;
    writeUserData(USER_NAME, USER_EMAIL, USER_ID);
    return cb(null, profile);
}


// inserting user data in DynamoDB
var writeUserData = function(name, email, id){
  writeDB.insertData(name, email, id);
}

// getting developer details from facebook_developer.json file
var facebookDeveloper = fs.readFileSync("facebook_developer.json");
var fbDev = JSON.parse(facebookDeveloper);
console.log("facebook Developer: " + fbDev.profileFields);

var fbDeveloperDetails = {
  clientID : fbDev.clientID,  
  clientSecret : fbDev.clientSecret,  
  callbackURL : fbDev.callbackURL,  
  profileFields : fbDev.profileFields 
}

passport.use(new Strategy(fbDeveloperDetails, fbUserDetails));

passport.serializeUser(function(user, cb) {
  console.log("inside: serializeUser");
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  console.log("inside: deserializeUser");
  cb(null, obj);
});

// route auth/facebook 
app.get('/auth/facebook', passport.authenticate('facebook'));

// route auth/facebook/callback
app.get('/auth/facebook/callback', passport.authenticate('facebook',  
                { successRedirect: '/success', failureRedirect: '/auth/facebook' }));

// route success
var successResponse = function(req, res) {
  res.send("<html><body><h2>Successfully Logged in as " + USER_NAME + 
          "</h2><br><p>Close tab to continue visiting.</p></body></html>");
}                        
app.get('/success', successResponse);

// error handler for promises
var errHandler = function(err) {
  console.log("errorHandler:" + err);
}

// route profile
var sendUserData = function(req, res){
  if (require('connect-ensure-login').ensureLoggedIn()) {
    // var promise = readDB.readData(USER_EMAIL);
    // promise
    // .then(function(Item) {
    //     console.log("sendUserData: " + JSON.stringify(Item)); 
    //     res.json({
    //       isLoggedIn : IS_LOGGED_IN,
    //       name : Item.name, 
    //       email : Item.email_id, 
    //       id : Item.id
    //     });          
    // }, errHandler);
    res.json({
      isLoggedIn : IS_LOGGED_IN,
      name : USER_NAME, 
      email : USER_EMAIL, 
      id : USER_ID
    });
  } else {
    res.json({
      isLoggedIn : IS_LOGGED_IN
    });
  }

}
app.get('/profile', sendUserData);

// server starts here
app.listen(3000);
console.log('***Server started on PORT number 3000.***')






