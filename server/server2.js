var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var cors = require('cors');

var app = express();

app.use(cookieParser());
app.use(session({secret: "secret"}));
app.use(cors());

var count_user = 0;

var user_requests = ["0"];




app.get('/', function(req, res){
    console.log("********(/) REQ: " + JSON.stringify(req.session));
    console.log("********(/views) CnnectID: " + req.cookies['connect.sid']);
    if(req.session.page_views){
        req.session.page_views++;
        res.send("You visited this page " + req.session.page_views + " times");
        // res.json({view: req.session.page_views});
    } else {
        req.session.page_views = 1;
        setTimeout(function () {
            res.send("You visited this page " + req.session.page_views + " times");
        }, 5000);
        // res.json({view: req.session.page_views});
    }
});



app.get('/views', function(req, res){
    console.log("********(/views) REQ: " + JSON.stringify(req.session));
    console.log("********(/views) CnnectID: " + req.cookies['connect.sid']);
    if(req.session.views){

        req.session.views++;

        var data = {
            views: req.session.views
        }

        user_requests[req.session.identifier] = req.session.views;

        console.log("Request UserID: " + req.session.identifier + " **** Views: " + req.session.views);
        console.log("USER_REQUESTS: " + JSON.stringify(user_requests));
        res.json(data);

   } else {
        req.session.views = 1;

        var key = count_user++;

        req.session.identifier = key;

        // add reqID to user_requests
        user_requests[key] = req.session.views;

        var data = {
            views: req.session.views
        }

        console.log("New userID: " + req.session.identifier + " **** Views: " + req.session.views);
        console.log("USER_REQUESTS: " + JSON.stringify(user_requests));
        res.json(data);
   }
});


app.get("/profile", function(req, res) {
    console.log("********(/profile) REQ: " + JSON.stringify(req.session));
    console.log("********(/views) CnnectID: " + req.cookies['connect.sid']);
    var data = {
        identifier: req.session.identifier,
        views: user_requests[req.session.identifier]
    }

    console.log("PROFILE:of " + req.session.identifier + " **** Views: " + user_requests[req.session.identifier]);
    res.json(data);
});

app.listen(3000);
console.log("Server started on 3000 port.");	