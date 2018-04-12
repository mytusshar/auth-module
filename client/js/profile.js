
/***
 * author: Tushar Bochare
 * Email: mytusshar@gmail.com
 */

var buttonDynamodbRead;
var buttonRefresh;
var buttonLogout;
var buttonLoginPage;
var navButtonHome;
var navButtonDevTools;
var modalContainer;
var modal;
var closeButton;
var alertText;
var homePage;
var devToolsPage;

window.onload = function() {
    /******* dynamodb read operation ******/
    buttonDynamodbRead = document.getElementById("dynamodb-button");
    buttonDynamodbRead.addEventListener("click", dynamodbReadOperation);
    buttonLogout = document.getElementById("button-logout");
    buttonLogout.addEventListener("click", logoutUser);

    navButtonDevTools = document.getElementById("developer-tools");
    navButtonDevTools.addEventListener("click", showDevTools);

    navButtonHome = document.getElementById("home");
    navButtonHome.addEventListener("click", showHomePage);

    homePage = document.getElementById("main-home");
    devToolsPage = document.getElementById("dev-tools");

    initModal();

    if(!sessionStorage.getItem("user")) {
        modalContainer.style.display = "block";
        modal.style.display = "block";
        closeButton.style.display = "none";
        buttonLoginPage.style.display = "block";
        alertText.innerHTML = "You are not logged in. Please login first.";
    } else {
        initializeClock();
        initializeProfile();
    }
}

function showDevTools() {
    homePage.style.display = "none";
    devToolsPage.style.display = "block";
}

function showHomePage() {
    homePage.style.display = "block";
    devToolsPage.style.display = "none";
}


function initializeProfile() {
    var userData = JSON.parse(sessionStorage.user);
    var element = document.getElementById('user-data');
    var keys = Object.keys(userData);
    var result = "";

    for(var i=0; i<keys.length; i++) {
        result += "<h4><font color=\"black\">" + keys[i] + ":</font>  "
                    + userData[keys[i]] + "<br></h4>"; 
    }
    element.innerHTML = result;
}

function getParamsForDynamodb() {
    var sessData = JSON.parse(sessionStorage.user);
    AWS.config.update({
        "region" : AWS_REGION,
        "endpoint" : AWS_ENDPOINT,
        "accessKeyId" : sessData.accessKey,
        "secretAccessKey" : sessData.secretKey,
        "sessionToken" : sessData.sessionToken
    });

    var params = {
        TableName: TABLE_NAME,
        Key:{
            "cognito_id": sessData.cognitoId
        }
    };
    return params;
}

function initModal() {
    /******* refresh button *********/
    buttonRefresh = document.getElementById("button-refresh");    
    buttonRefresh.addEventListener("click", refreshFunction);
    /********* modal close button ******/
    closeButton = document.getElementById("close");    
    closeButton.addEventListener("click", closeModal);
    /******** login-page return button ******/
    buttonLoginPage = document.getElementById("button-login-page")
    buttonLoginPage.addEventListener("click", openLoginPage);

    modalContainer = document.getElementById("modal-container");
    modal = document.getElementById("modal");
    alertText = document.getElementById("alert-text");    
}

function openLoginPage() {
    closeModal();
    loadLoginPage();
}

function loadLoginPage() {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("counter");
    window.open(INDEX_FILE, "_self");
}

function openModal(message, button) {
    modalContainer.style.display = "block";
    modal.style.display = "block";
    button.style.display = "block";
    alertText.innerHTML = message;
}

function closeModal() {
    if(buttonLoginPage.style.display == "block") {
        loadLoginPage();
    }
    modalContainer.style.display = "none";
    buttonRefresh.style.display = "none";
    buttonLoginPage.style.display = "none";
    modal.style.display = "none";
}