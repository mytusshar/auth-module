// constant routes
const SERVER_ADDRESS = "http://localhost:3000";
const FACEBOOK_LOGIN = SERVER_ADDRESS + "/auth/facebook";
const FACEBOOK_REG = SERVER_ADDRESS + "/reg/facebook";
const URL_AUTHENTICATION = SERVER_ADDRESS + "/auth";
const PROFILE = SERVER_ADDRESS + "/profile";
const REQUIRE_LOGIN_NAME = false;

// buttons 
var b_login;
var b_register;
var b_reg_facebook;
var b_login_facebook;
var b_login_google;
var b_reg_google;
var b_login_amazon;
var b_reg_amazon;

const LOGIN = "login";
const REGISTER = "register";
/********** facebook login/reg functions ********/
var b_reg_facebookFunction = function(){ 
    openIdentityProvider(REGISTER, "facebook");
}
var b_facebookFunction = function(){ 
    openIdentityProvider(LOGIN, "facebook");
}

/********** google login/reg functions ******/
var b_reg_googleFunction = function(){ 
    openIdentityProvider(REGISTER, "google");
}
var b_googleFunction = function(){ 
    openIdentityProvider(LOGIN, "google");
}

/********** amazon login/reg functions ******/
var b_reg_amazonFunction = function(){ 
    openIdentityProvider(REGISTER, "amazon");
}
var b_amazonFunction = function(){ 
    openIdentityProvider(LOGIN, "amazon");
}

/******* login/register functions *******/
var b_loginFunction = function(){ 
    hideOrShowBlock(LOGIN);
};
var b_RegFunction = function(){ 
    hideOrShowBlock(REGISTER);
};


function hideOrShowBlock(b_type) {
    var reg_block = document.getElementById("register-block");
    var login_block = document.getElementById("login-block");

    if(login_block.style.display !== "block" && b_type == LOGIN) {
        login_block.style.display = "block";
        reg_block.style.display = "none";
    } 
    else if(reg_block.style.display !== "block" && b_type == REGISTER) {
        reg_block.style.display = "block";
        login_block.style.display = "none";
    }
}

window.onload = function(){
    /******* facebook buttons *******/
    b_login_facebook = document.getElementById("facebook");
    b_login_facebook.addEventListener("click", b_facebookFunction);
    b_reg_facebook = document.getElementById("reg_facebook");
    b_reg_facebook.addEventListener("click", b_reg_facebookFunction);

    /******* google buttons *******/
    b_login_google = document.getElementById("google");
    b_login_google.addEventListener("click", b_googleFunction);
    b_reg_google = document.getElementById("reg_google");
    b_reg_google.addEventListener("click", b_reg_googleFunction);
    
    /******* amazon buttons *******/
    b_login_amazon = document.getElementById("amazon");
    b_login_amazon.addEventListener("click", b_amazonFunction);
    b_reg_amazon = document.getElementById("reg_amazon");
    b_reg_amazon.addEventListener("click", b_reg_amazonFunction);

    /******* login/register buttons *******/
    b_login = document.getElementById("b_login");
    b_login.addEventListener("click", b_loginFunction);
    b_register = document.getElementById("b_register");
    b_register.addEventListener("click", b_RegFunction);
}


function openIdentityProvider(req_type, authProvider) {
    let params = `scrollbars=no, resizable=no, status=no, location=no,
                toolbar=no, menubar=no, width=700, height=600, left=100, top=100`;                    
    var url = URL_AUTHENTICATION;

    if(req_type == REGISTER) {
        var user_data = getFormData();
        console.log(user_data)
        user_data.provider = authProvider;
        // return if not isValid data
        if(!user_data.isValid) {
            return; 
        }
        url = appendURL(user_data, url);
        console.log("REG:URL: " + url);
    } else {
        var data = {
            request: LOGIN,
            provider: authProvider
        }
        // getting user_name
        if(REQUIRE_LOGIN_NAME) {
            var name = document.getElementById("user_name").value.trim();
            var err_name = document.getElementById("error_username");
            if(name == "") {
                err_name.innerHTML = "Enter Name!";
                err_name.style.display = "block";
                return;
            } else {
                err_name.style.display = "none";
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


