
/***
 * author: Tushar Bochare
 * Email: mytusshar@gmail.com
 */
var totalTime;
var minutes;
var seconds;
var value;
var minElement;
var secElement;
var interval;
var messageRefresh = "Your session will expire soon.<br>" +
                    "Please click Refresh button to refresh the session.";
var messageExpire = "Your session is Expired.<br>" +
                        "Please click button to login again.";

function initializeClock() {
    totalTime = SESSION_TIME;

    if (sessionStorage.getItem("counter")) {
        if (sessionStorage.getItem("counter") <= 0){
            value = parseInt(totalTime)*60;
        } else {
            value = sessionStorage.getItem("counter");
        }
    } else {
        value = parseInt(totalTime)*60;
    }

    minutes = parseInt(parseInt(value) / 60);
    seconds = parseInt(value) - parseInt(minutes)*60;

    minElement = document.getElementById('minutes');
    secElement = document.getElementById('seconds');
    minElement.innerHTML = minutes;
    secElement.innerHTML = seconds;

    if(!interval) {
        interval = setInterval(function() {
            counter();
        }, 1000);
    }    
}

function counter() {
    if (value <= 0) {
        sessionStorage.setItem("counter", totalTime*60);
        value = parseInt(totalTime)*60;
    } else {
        value = parseInt(value) - 1;
        sessionStorage.setItem("counter", value);
    }

    minutes = parseInt(parseInt(value) / 60);
    seconds = parseInt(value) - parseInt(minutes)*60;

    /****** showing refresh/login page return modal ******/
    if(minutes == SESSION_REFRESH_TIME && seconds == 59) {
        var sessData = JSON.parse(sessionStorage.user);
        if(sessData.provider != "facebook") {
            openModal(messageRefresh, buttonRefresh);                
        }
    }
    else if(minutes == SESSION_EXPIRE_TIME && seconds == 59) {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("counter");
        openModal(messageExpire, buttonLoginPage);
    }
    
    minElement.innerHTML = minutes;
    secElement.innerHTML = seconds;
};

