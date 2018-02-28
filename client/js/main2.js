

var recievedDataOperation = function(e) { 
    var output =  document.getElementById("output");
    var data = e.data;
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


var handleErrorStyles = function(code, show, hide_1, hide_2, hide_3) {
    if(code == 0) {
        show.style.display = "block";
    } else {
        show.style.display = "none";
    }    
    hide_1.style.display = "none";
    hide_2.style.display = "none";
    hide_3.style.display = "none";
}



function getFormData() {
    var name = document.getElementById("name").value.trim();
    var city = document.getElementById("city").value.trim();
    var email = document.getElementById("email").value.trim();
    var username = document.getElementById("username").value.trim();

    var err_username = document.getElementById("errorusername");
    var err_name = document.getElementById("errorname");
    var err_city = document.getElementById("errorcity");
    var err_email = document.getElementById("erroremail");

    var data = {isValid: false};

    if(username == "") {
        err_username.innerHTML = "Enter username!";
        handleErrorStyles(0, err_username, err_name, err_city, err_email);
    } else if(name == "") {
        err_name.innerHTML = "Enter Name!";
        handleErrorStyles(0, err_name, err_city, err_email, err_username);
    } else if(email == "") {
        err_email.innerHTML = "Enter Email ID!";
        handleErrorStyles(0, err_email, err_name, err_city, err_username);
    } else if(city == "") {
        err_city.innerHTML = "Enter City Name!";
        handleErrorStyles(0, err_city, err_email, err_name, err_username);
    } else {
        data = {
            isValid: true,
            username: username,
            name: name,
            city: city,
            request: REGISTER,
            email: email
        }
        handleErrorStyles(1, err_city, err_email, err_name, err_username);
    }
    return data;
}


function appendURL(data, url) {
    if(data.request == REGISTER) {
        url = url + "?" + "username=" + data.username + "&" + "provider=" + data.provider + "&" + "request=" + data.request + "&" + "name=" + data.name + "&" + "city=" + data.city + "&" + "email=" + data.email;
    } else {
        if(REQUIRE_LOGIN_NAME) {
            url = url + "?" + "provider=" + data.provider + "&" + "request=" + data.request + "&" + "username=" + data.username;
        } else {
            url = url + "?" + "provider=" + data.provider + "&" + "request=" + data.request;
        }        
    }
    return url;
}