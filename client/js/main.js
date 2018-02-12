// constant routes
const SERVER_ADDRESS = "http://localhost:3000";
const FACEBOOK_LOGIN = SERVER_ADDRESS + "/auth/facebook";
const FACEBOOK_REG = SERVER_ADDRESS + "/reg/facebook";
const PROFILE = SERVER_ADDRESS + "/profile";

// buttons 
var b_login_facebook;
var b_login;
var b_register;
var b_reg_facebook;

const LOGIN = "login";
const REGISTER = "register";


var b_reg_facebookFunction = function(){ 
    openIdentityProvider(REGISTER);
}

var b_facebookFunction = function(){ 
    openIdentityProvider(LOGIN);
}

var b_loginFunction = function(){ 
    hideOrShowBlock(LOGIN);
};

var b_RegFunction = function(){ 
    hideOrShowBlock(REGISTER);
};

window.onload = function(){
    b_facebook = document.getElementById("facebook");
    b_facebook.addEventListener("click", b_facebookFunction);
    
    b_reg_facebook = document.getElementById("reg_facebook");
    b_reg_facebook.addEventListener("click", b_reg_facebookFunction);

    b_login = document.getElementById("b_login");
    b_login.addEventListener("click", b_loginFunction);

    b_register = document.getElementById("b_register");
    b_register.addEventListener("click", b_RegFunction);
}

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

var recievedDataOperation = function(e) { 
    var output =  document.getElementById("output");
    var data = e.data;                    
    if(data.status == 1) {
        var result = "Name: " + data.name + "<br>" + 
                    "Email: " + data.email + "<br>" +
                    "CognitoID: " + data.cognito_id + "<br>";
                    
        output.innerHTML = result;
    } else {
        output.innerHTML = JSON.stringify(data);
    }
    console.log("recieved: " + JSON.stringify(data));
}

var handleErrorStyles = function(code, show, hide_1, hide_2) {
    if(code == 0) {
        show.style.display = "block";
    } else {
        show.style.display = "none";
    }    
    hide_1.style.display = "none";
    hide_2.style.display = "none";
}

function getFormData() {
    var name = document.getElementById("username").value.trim();
    var city = document.getElementById("city").value.trim();
    var email = document.getElementById("email").value.trim();

    var err_name = document.getElementById("errorname");
    var err_city = document.getElementById("errorcity");
    var err_email = document.getElementById("erroremail");

    var data = {isValid: false};

    if(name == "") {
        err_name.innerHTML = "Enter Name!";
        handleErrorStyles(0, err_name, err_city, err_email);
    } else if(email == "") {
        err_email.innerHTML = "Enter Email ID!";
        handleErrorStyles(0, err_email, err_name, err_city);
    } else if(city == "") {
        err_city.innerHTML = "Enter City Name!";
        handleErrorStyles(0, err_city, err_email, err_name);
    } else {
        data = {
            isValid: true,
            name: name,
            city: city,
            email: email
        }
        handleErrorStyles(1, err_city, err_email, err_name);
    }
    return data;
}

function appendURL(data, url) {
    url = url + "?" + "name=" + data.name + "&" + "city=" + data.city + "&" + "email=" + data.email;
    return url;
}

function openIdentityProvider(req_type) {
    let params = `scrollbars=no, resizable=no, status=no, location=no,
                toolbar=no, menubar=no, width=700, height=600, left=100, top=100`;
                    
    var url = FACEBOOK_LOGIN;

    if(req_type == REGISTER) {
        var user_data = getFormData();
        // return if not isValid data
        if(!user_data.isValid) {
            return; 
        }
        
        url = FACEBOOK_REG;
        url = appendURL(user_data, url);
    }
    
    var win = window.open(url, '_blank', params);
    
    win.focus();

    var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
    // Listen to message from child window
    eventer(messageEvent, recievedDataOperation, false);
}


