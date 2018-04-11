
function recievedDataOperation(e) { 
    var output =  document.getElementById("output");
    var data = e.data;
    console.log(data);

    if(data.status == 1) {
        var result = "UserName: " + data.username + "<br>" +  
                    "Name: " + data.name + "<br>" + 
                    "Email: " + data.email + "<br>" +
                    "CognitoID: " + data.cognitoId + "<br>";

        /******* storing data in localStorage ******/
        browserStorage(data);
        /******* opening profile window *********/
        window.open(PROFILE_FILE, "_self");
    } else {
        output.style.display = "block";
        output.innerHTML = JSON.stringify(data);
    }
}


function login(provider) {
    openIdentityProvider(LOGIN, provider);
}


function register(provider) {
    openIdentityProvider(REGISTER, provider);
}


function logoutUser() {
    var sessData = JSON.parse(sessionStorage.user);
    /***** removing user details and clock timer from seesionStorage *****/
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("counter");

    switch(sessData.provider) {
        case "google":
            window.location.href = "https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue="
                + CLIENT_REDIRECT_URL;
        break;
        case "facebook":
            window.location.href = "https://www.facebook.com/logout.php?next=" + CLIENT_REDIRECT_URL
                + "&access_token=" + sessData.authToken;
        break;
        case "amazon":
            window.location.href = CLIENT_REDIRECT_URL;
        break;
    }
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