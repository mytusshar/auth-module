

var buttonRefresh;
var buttonDynamodbRead;

// const AWS_REGION = "us-east-1";
// const AWS_ENDPOINT = "https://dynamodb.us-east-1.amazonaws.com";
// const TABLE_NAME = "users";
// const SERVER_ADDRESS = "http://localhost:3000";
// const REFRESH_URL = SERVER_ADDRESS + "/refresh";

window.onload = function() {
    initializeClock('clockdiv', deadline);

    /******* refresh button *********/
    buttonRefresh = document.getElementById("refresh-button");
    buttonRefresh.addEventListener("click", refreshFunction);

    /******* dynamodb read operation ******/
    buttonDynamodbRead = document.getElementById("dynamodb-button");
    buttonDynamodbRead.addEventListener("click", dynamodbReadOperation)

    initializeProfile();
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
    // var url = SERVER_ADDRESS + "/refresh";
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
