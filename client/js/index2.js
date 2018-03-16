
/***
 * author: Tushar Bochare
 * Email: mytusshar@gmail.com
 */

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