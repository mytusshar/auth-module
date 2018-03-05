// constant routes
const SERVER_ADDRESS = "http://localhost:3000";
const FACEBOOK_LOGIN = SERVER_ADDRESS + "/auth/facebook";
const FACEBOOK_REG = SERVER_ADDRESS + "/reg/facebook";
const URL_AUTHENTICATION = SERVER_ADDRESS + "/auth";
const PROFILE = SERVER_ADDRESS + "/profile";
const REQUIRE_LOGIN_NAME = false;

const LOGIN = "login";
const REGISTER = "register";

// buttons 
var buttonLoginBlock;
var buttonRegBlock;
var buttonLoginFacebook;
var buttonLoginGoogle;
var buttonLoginAmazon;
var buttonRegFacebook;
var buttonRegAmazon;
var buttonRegGoogle;

var buttonRefresh;
var userDataForRefresh;

/********** facebook login/reg functions ********/
var regFacebookFunction = function(){ 
    openIdentityProvider(REGISTER, "facebook");
}
var loginFacebookFunction = function(){ 
    openIdentityProvider(LOGIN, "facebook");
}

/********** google login/reg functions ******/
var regGoogleFunction = function(){ 
    openIdentityProvider(REGISTER, "google");
}
var loginGoogleFunction = function(){ 
    openIdentityProvider(LOGIN, "google");
}

/********** amazon login/reg functions ******/
var regAmazonFunction = function(){ 
    openIdentityProvider(REGISTER, "amazon");
}
var loginAmazonFunction = function(){ 
    openIdentityProvider(LOGIN, "amazon");
}

/******* login/register functions *******/
var showLoginBlock = function(){ 
    hideOrShowBlock(LOGIN);
};
var showRegBlock = function(){ 
    hideOrShowBlock(REGISTER);
};

var refreshFunction = function() {
    var url = SERVER_ADDRESS + "/refresh";
    console.log("Fetch: ", userDataForRefresh);
    fetch(url, {
        method : 'POST',
        headers: {
            'Accept' : 'application/json, text/plain, */*',
            'Content-type': 'application/json'
        },
        body: JSON.stringify(userDataForRefresh)
    })
    .then((res) => res.json())
    .then((data) => {
        console.log("refresh data: ", data);
    })
    .catch((err) => console.log(err))
}


function hideOrShowBlock(buttonType) {
    var regBlock = document.getElementById("register-block");
    var loginBlock = document.getElementById("login-block");

    if(loginBlock.style.display !== "block" && buttonType == LOGIN) {
        loginBlock.style.display = "block";
        regBlock.style.display = "none";
    } 
    else if(regBlock.style.display !== "block" && buttonType == REGISTER) {
        regBlock.style.display = "block";
        loginBlock.style.display = "none";
    }
}

var recievedDataOperation = function(e) { 
    var output =  document.getElementById("output");
    var data = e.data;

    /********* refresh data assign ********/
    userDataForRefresh = data;

    if(data.status == 1) {
        var result = "UserName: " + data.username + "<br>" +  
                    "Name: " + data.name + "<br>" + 
                    "Email: " + data.email + "<br>" +
                    "CognitoID: " + data.cognito_id + "<br>";
                    
        output.innerHTML = result;
    } else {
        output.innerHTML = JSON.stringify(data);
    }
    console.log("recieved: " + JSON.stringify(data));
}


window.onload = function(){

    /******* refresh button *********/
    buttonRefresh = document.getElementById("refresh");
    buttonRefresh.addEventListener("click", refreshFunction);


    /******* facebook buttons *******/
    buttonLoginFacebook = document.getElementById("facebook");
    buttonLoginFacebook.addEventListener("click", loginFacebookFunction);
    buttonRegFacebook = document.getElementById("reg-facebook");
    buttonRegFacebook.addEventListener("click", regFacebookFunction);

    /******* google buttons *******/
    buttonLoginGoogle = document.getElementById("google");
    buttonLoginGoogle.addEventListener("click", loginGoogleFunction);
    buttonRegGoogle = document.getElementById("reg-google");
    buttonRegGoogle.addEventListener("click", regGoogleFunction);
    
    /******* amazon buttons *******/
    buttonLoginAmazon = document.getElementById("amazon");
    buttonLoginAmazon.addEventListener("click", loginAmazonFunction);
    buttonRegAmazon = document.getElementById("reg-amazon");
    buttonRegAmazon.addEventListener("click", regAmazonFunction);

    /******* login/register buttons *******/
    buttonLoginBlock = document.getElementById("b-login");
    buttonLoginBlock.addEventListener("click", showLoginBlock);
    buttonRegBlock = document.getElementById("b-register");
    buttonRegBlock.addEventListener("click", showRegBlock);
}


function openIdentityProvider(req_type, authProvider) {
    let params = `scrollbars=no, resizable=no, status=no, location=no,
                toolbar=no, menubar=no, width=700, height=600, left=100, top=100`;                    
    var url = URL_AUTHENTICATION;

    if(req_type == REGISTER) {
        var userData = getFormData();
        console.log(userData)
        userData.provider = authProvider;
        // return if not isValid data
        if(!userData.isValid) {
            return; 
        }
        url = appendURL(userData, url);
        console.log("REG:URL: " + url);
    } else {
        var data = {
            request: LOGIN,
            provider: authProvider
        }
        // getting user_name
        if(REQUIRE_LOGIN_NAME) {
            var name = document.getElementById("user-name").value.trim();
            var errUname = document.getElementById("error-username");
            if(name == "") {
                errUname.innerHTML = "Enter Name!";
                errUname.style.display = "block";
                return;
            } else {
                errUname.style.display = "none";
            }
            data.username = name
        }
        url = appendURL(data, url);
        console.log("LOG:URL: " + url);
    }
    
    var win = window.open(url, '_blank', params);    
    win.focus();

    var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
    // Listen to message from child window
    eventer(messageEvent, recievedDataOperation, false);
}


