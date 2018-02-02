// constant routes
const SERVER_ADDRESS = "http://localhost:3000";
const FACEBOOK_LOGIN = SERVER_ADDRESS + "/auth/facebook";
const PROFILE = SERVER_ADDRESS + "/profile";

var win;

window.onload = function(){
    var fb = document.getElementById("facebook");
    fb.addEventListener("click", openIdentityProvider);
}

var recievedDataOperation = function(e) { 
    var data = e.data;                    
    if(data.isLoggedIn) {
        var result = "Name: " + data.name + "<br>" + 
                    "Email: " + data.email + "<br>" +
                    "ID: " + data.id + "<br>" + 
                    "CognitoID: " + data.cognitoId + "<br>" + 
                    "accessKey: " + data.accessKey + "<br>" + 
                    "secretKey: " + data.secretKey + "<br>" + 
                    "LoggedInStatus: " + data.isLoggedIn;

        document.getElementById("output").innerHTML = result;
    } else {
        document.getElementById("output").innerHTML = "Not logged In";
    }
    console.log("recieved: " + data);
}


function openIdentityProvider() {
    let params = `scrollbars=no, resizable=no, status=no, location=no,
                toolbar=no, menubar=no, width=600, height=500, left=100, top=100`;

    var url = FACEBOOK_LOGIN;
    win = window.open(url, '_blank', params);
    
    win.focus();

    var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
    // Listen to message from child window
    eventer(messageEvent, recievedDataOperation, false);
}


