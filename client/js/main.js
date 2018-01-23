function getUserData() {
    const url = "http://localhost:3000/profile";
    console.log("inside getUserData");
    fetch(url)
    .then((res) => res.json())
    .then((data) => {
                            
        if(data.isLoggedIn) {
            var result = "Name: " + data.name + "<br>"
                    + "Email: " + data.email + "<br>" 
                    + "ID: " + data.id + "<br>"
                    + "LoggedInStatus: " + data.isLoggedIn;

            document.getElementById("output").innerHTML = result;

            stopTimer()
        }
        console.log("recieved: " + data);
    })
    .catch((err) => {
        console.log(err);
        document.getElementById("output").innerHTML = err;
    })

}

var timer;
function startRequestingData() {
    timer = setInterval(getUserData, 5000);
}

function stopTimer() {
    clearInterval(timer);
}

function openInNewTab() {
    let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
                width=600,height=300,left=100,top=100`;

    var url = "http://localhost:3000/auth/facebook";
    var win = window.open(url, '_blank', params);
    win.focus();
    startRequestingData();                
}