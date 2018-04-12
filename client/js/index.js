
/***
 * author: Tushar Bochare
 * Email: mytusshar@gmail.com
 */

// buttons 
var buttonLoginBlock;
var buttonRegBlock;
var buttonLoginFacebook;
var buttonLoginGoogle;
var buttonLoginAmazon;
var buttonRegFacebook;
var buttonRegAmazon;
var buttonRegGoogle;

/********** facebook login/reg functions ********/
function regFacebookFunction() {
    register("facebook");
}
function loginFacebookFunction() {
    login("facebook");
}

/********** google login/reg functions ******/
function regGoogleFunction() {
    register("google");
}
function loginGoogleFunction() {
    login("google");
}

/********** amazon login/reg functions ******/
function regAmazonFunction() {
    register("amazon");
}
function loginAmazonFunction() { 
    login("amazon");
}

/******* login/register functions *******/
function showLoginBlock() {
    hideOrShowBlock(LOGIN);
};
function showRegBlock() { 
    hideOrShowBlock(REGISTER);
};

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

function browserStorage(data) {
    if (typeof(Storage) !== "undefined") {
        sessionStorage.setItem('user', JSON.stringify(data));
        console.log("%%%%% YES: storage available %%%%%%", JSON.parse(sessionStorage.user));
    } else {
        console.log("%%%%% NO: storage available %%%%%%");
    }
    return;
}

window.onload = function() {
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

    initModalIndex();
}

function openIdentityProvider(requestType, authProvider) {
    let params = `scrollbars=no, resizable=no, status=no, location=no,
                toolbar=no, menubar=no, width=700, height=600, left=100, top=100`;                    
    var url = URL_AUTHENTICATION;

    if(requestType == REGISTER) {
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

function handleErrorStyles(code, show, hide1, hide2, hide3) {
    if(code == 0) {
        show.style.display = "block";
    } else {
        show.style.display = "none";
    }
    hide1.style.display = "none";
    hide2.style.display = "none";
    hide3.style.display = "none";
}

function getFormData() {
    var name = document.getElementById("name").value.trim();
    var city = document.getElementById("city").value.trim();
    var email = document.getElementById("email").value.trim();
    var username = document.getElementById("username").value.trim();

    var errUsername = document.getElementById("errorusername");
    var errName = document.getElementById("errorname");
    var errCity = document.getElementById("errorcity");
    var errEmail = document.getElementById("erroremail");

    var data = {isValid: false};

    if(username == "") {
        errUsername.innerHTML = "Enter username!";
        handleErrorStyles(0, errUsername, errName, errCity, errEmail);
    } else if(name == "") {
        errName.innerHTML = "Enter Name!";
        handleErrorStyles(0, errName, errCity, errEmail, errUsername);
    } else if(email == "") {
        errEmail.innerHTML = "Enter Email ID!";
        handleErrorStyles(0, errEmail, errName, errCity, errUsername);
    } else if(city == "") {
        errCity.innerHTML = "Enter City Name!";
        handleErrorStyles(0, errCity, errEmail, errName, errUsername);
    } else {
        data = {
            isValid: true,
            username: username,
            name: name,
            city: city,
            request: REGISTER,
            email: email
        }
        handleErrorStyles(1, errCity, errEmail, errName, errUsername);
    }
    return data;
}

function appendURL(data, url) {
    if(data.request == REGISTER) {
        url = url + "?" + "username=" + data.username + "&" + "provider=" + data.provider + "&" + "request="
             + data.request + "&" + "name=" + data.name + "&" + "city=" + data.city + "&" + "email=" + data.email;
    } else {
        if(REQUIRE_LOGIN_NAME) {
            url = url + "?" + "provider=" + data.provider + "&" + "request=" + data.request + "&" + "username=" + data.username;
        } else {
            url = url + "?" + "provider=" + data.provider + "&" + "request=" + data.request;
        }        
    }
    return url;
}

function initModalIndex() {
    /********* modal close button ******/
    closeButton = document.getElementById("close");    
    closeButton.addEventListener("click", closeModalIndex);

    modalContainer = document.getElementById("modal-container");
    modal = document.getElementById("modal");
    alertText = document.getElementById("alert-text");    
}

function openModalIndex(message) {
    modalContainer.style.display = "block";
    modal.style.display = "block";
    alertText.innerHTML = message;
}

function closeModalIndex() {
    modalContainer.style.display = "none";
    modal.style.display = "none";
}