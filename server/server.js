
var fs          = require("fs");
var express     = require('express');
var passport    = require('passport');
var Strategy    = require('passport-facebook').Strategy;
var bodyParser  = require('body-parser');
var cors        = require('cors');
var writeDB     = require("./dynamodb/write.js");
var readDB      = require("./dynamodb/read.js");
var controller  = require('./facebook/controller.js');

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(require('cookie-parser')());
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());

// ********** facebook authentication ***********//

passport.use(new Strategy(controller.developerDetails, controller.userDetails));

var serializeFunction = function(user, cb) { cb(null, user);  }
passport.serializeUser(serializeFunction);

var deserializeFunction = function(obj, cb) { cb(null, obj);  }
passport.deserializeUser(deserializeFunction);

app.get('/facebook', passport.authenticate('facebook'));

var callbackParam = passport.authenticate('facebook', { successRedirect: '/success', failureRedirect: '/facebook' })
app.get('/facebook/callback', callbackParam);

app.get('/success', controller.successResponse);

app.get('/profile', controller.sendUserData);


// *********** Sserver listening on port 3000 *************//
app.listen(3000);
console.log('server started on 3000 port');