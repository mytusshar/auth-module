
/***
 * author: Tushar Bochare
 * Email: mytusshar@gmail.com
 */

var buttonDynamodbRead;
var buttonRefresh;
var buttonLogout;
var buttonLoginPage;
var modalContainer;
var modal;
var closeButton;
var alertText;

window.onload = function() {    
    /******* dynamodb read operation ******/
    buttonDynamodbRead = document.getElementById("dynamodb-button");
    buttonDynamodbRead.addEventListener("click", dynamodbReadOperation);

    buttonLogout = document.getElementById("button-logout");
    buttonLogout.addEventListener("click", logoutUser);

    initializeClock();
    initializeProfile();
    initModal();
}

function logoutUser() {
    var sessData = JSON.parse(sessionStorage.user);
    var logoutUrl;

    switch(sessData.provider) {
        case "google": logoutUrl = 'https://mail.google.com/mail/?logout&hl=fr';
        break;
        case "amazon": logoutUrl = "https://www.amazon.com/gp/flex/sign-out.html/ref=nav_youraccount_signout?ie=UTF8&action=sign-out&path=%2Fgp%2Fyourstore%2Fhome&signIn=1&useRedirectOnSuccess=1";
                    // "https://console.aws.amazon.com/ec2/logout!doLogout";
                    // "https://www.amazon.in/signout";                    
        break;
        case "facebook": logoutUrl = 'https://www.facebook.com/logout.php?next=http://127.0.0.1:5500/logout.php&access_token=' + sessData.authToken;
        break;
    }

    var params = 'width=600,height=500,menubar=no,status=no,location=no,toolbar=no,scrollbars=no,top=200,left=200';
    var newWindow = window.open(logoutUrl, 'You are being logout', params);

    setTimeout(closeTabOnLoad, 3000);

    function closeTabOnLoad() {
        if (newWindow) {
            newWindow.close();
        }
        loadLoginPage()
    }
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

function refreshFunction() {
    console.log("Fetch: ", sessionStorage.user);
    fetch(REFRESH_URL, {
        method : 'POST',
        headers: {
            'Accept' : 'application/json, text/plain, */*',
            'Content-type': 'application/json'
        },
        body: sessionStorage.user
    })
    .then((res) => res.json())
    .then((data) => {
        data = data.refreshData;
        console.log("refresh data: ", data);
        /******** reasigning refresh data in session storage *******/
        var sessData = JSON.parse(sessionStorage.user);
        sessData.sessionToken = data.sessionToken;
        sessData.accessKey = data.accessKey;
        sessData.secretKey = data.secretKey;
        sessionStorage.user = JSON.stringify(sessData);

        initializeProfile();
        closeModal();
        /****** initializing clock again **********/
        sessionStorage.removeItem("counter");
        initializeClock();
    })
    .catch((err) => console.log(err))
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

function dynamodbReadOperation() {
    var params = getParamsForDynamodb();
    var docClient = new AWS.DynamoDB.DocumentClient();
    
    docClient.get(params, function(err, data) {
        if (err) {
            document.getElementById('button-result').innerHTML = "Unable to read item: " + "\n" + JSON.stringify(err, undefined, 2);
        } else {
            document.getElementById('button-result').innerHTML = "GetItem succeeded: " + "\n" + JSON.stringify(data, undefined, 2);
        }
    });
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