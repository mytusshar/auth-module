
/***
 * author: Tushar Bochare
 * Email: mytusshar@gmail.com
 */

function getTimeRemaining(endtime) {
    var t = Date.parse(endtime) - Date.parse(new Date());
    var seconds = Math.floor((t / 1000) % 60);
    var minutes = Math.floor((t / 1000 / 60) % 60);
    var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
    var days = Math.floor(t / (1000 * 60 * 60 * 24));
    return {
        'total': t,
        'days': days,
        'hours': hours,
        'minutes': minutes,
        'seconds': seconds
    };
}

function initializeClock(id, endtime) {
    var clock = document.getElementById(id);
    var minutesSpan = clock.querySelector('.minutes');
    var secondsSpan = clock.querySelector('.seconds');

    function updateClock() {
        var t = getTimeRemaining(endtime);
        minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
        secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

        /****** showing refresh/login page return modal ******/
        if(t.minutes == SESSION_REFRESH_TIME && t.seconds == 45) {
            var sessData = JSON.parse(sessionStorage.user);
            if(sessData.provider != "facebook") {
                var message = "Your session will expire soon.<br>" +
                            "Please click Refresh button to refresh the session.";
                openModal(message, buttonRefresh);                
            }
        }
        else if(t.minutes == SESSION_EXPIRE_TIME && t.seconds == 30) {
            var message = "Your session is Expired.<br>" +
                            "Please click button to login again.";
            sessionStorage.removeItem("user");
            openModal(message, buttonLoginPage);
        }

        if (t.total <= 0) {
            clearInterval(timeinterval);
        }
    }

    updateClock();
    var timeinterval = setInterval(updateClock, 1000);
}

var deadline = new Date(Date.parse(new Date()) + 60 * 60 * 1000);

