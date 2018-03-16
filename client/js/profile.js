
/***
 * author: Tushar Bochare
 * Email: mytusshar@gmail.com
 */

var buttonDynamodbRead;
var buttonRefresh;
var buttonLoginPage;
var modalContainer;
var modal;
var closeButton;
var alertText;

window.onload = function() {    
    /******* dynamodb read operation ******/
    buttonDynamodbRead = document.getElementById("dynamodb-button");
    buttonDynamodbRead.addEventListener("click", dynamodbReadOperation)

    initializeClock('clockdiv', deadline);
    initializeProfile();
    initModal();
}

var initializeProfile = function() {
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

var refreshFunction = function() {
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
        initializeClock('clockdiv', deadline);
    })
    .catch((err) => console.log(err))
}

var getParamsForDynamodb = function() {
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

var dynamodbReadOperation = function() {
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

var initModal = function() {
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

var openLoginPage = function() {
    closeModal();
    sessionStorage.removeItem("user");
    window.open(INDEX_FILE, "_self");
}

var openModal = function(message, button) {
    modalContainer.style.display = "block";
    modal.style.display = "block";
    button.style.display = "block";
    alertText.innerHTML = message;
}

var closeModal = function() {
    modalContainer.style.display = "none";
    buttonRefresh.style.display = "none";
    buttonLoginPage.style.display = "none";
    modal.style.display = "none";
}