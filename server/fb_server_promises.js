
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

/////////////////////////////////////////////
///
var writeUserData = function(name, email, id){
  writeDB.insertData(name, email, id);
}
///
/////////////////////////////////////////////


var fbDeveloperDetails = {
  clientID: '158449238124791',
  clientSecret: 'd66db07cfd121522b6e3e6a7cd7e224a',
  callbackURL: 'http://localhost:3000/auth/facebook/callback',
  profileFields : ['emails', 'displayName', 'id']
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

app.get('/auth/facebook', passport.authenticate('facebook'));

var fbCallback = function(req, res) {
  console.log("inside: fbCallback");
  res.send("<html><body><h2>Successfully Logged in as " + USER_NAME + 
          "</h2><br><p>Close tab to continue visiting.</p></body></html>");
  console.log("inside: fbCallback => response send");          
}
app.get('/auth/facebook/callback', passport.authenticate('facebook'), fbCallback);

//added to handle error
var errHandler = function(err) {
  console.log("errorHandler:" + err);
}

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

app.listen(3000);






