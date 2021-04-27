console.log("Settings script operational, SIR!")

function bakeCookie(cname, cvalue, exdays) { //sets the cookie name, the cookie itself, and the days until expiry
    var d = new Date(); //makes new date function
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000)); //gets current time
    var expires = "expires=" + d.toUTCString(); //turns d (date) into a string
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/"; //cookie = cookie name + cookie value + when it expires
}

function getCookie(cname) {
    var name = cname + "="; //adds the equals symbol because you cant put that in brackets
    var decodedCookie = decodeURIComponent(document.cookie); //decodes it or something
    var ca = decodedCookie.split(';'); //splits all cookies (divided by the semicolons)
    //space for readability
    for (var i = 0; i < ca.length; i++) { //repeats as many cookies as there are
        var c = ca[i]; //sets ca to c
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {//if cookie is found
            return c.substring(name.length, c.length);//return value of that cookie
        }
    }
    return ""; //else return nothing
}

function theme() {
    var modeSwitch = document.getElementById("modeSwitch");
    if (modeSwitch.checked) { //if switch pressed, turn on dark mode
        //console.log("dark mode on");
        bakeCookie("mode", "dark", "365")
    } else { //if it's already pressed, turn off dark mode
        //console.log("dark mode off");
        bakeCookie("mode", "lite", "365")
    }
    var currentMode = getCookie("mode");
    console.log(currentMode);
}

var checkbox = document.getElementById("modeSwitch");
checkbox.addEventListener('change', function () {
    theme();
});

//Navigation bar code
var xy = 0;
document.getElementById("test").addEventListener("click", function openNav() {
    if (xy % 2 == 0) {
        document.getElementById("sideNav").style.width = "250px";
        document.getElementById("settings").style.marginLeft = "250px";
    }
    else if (xy % 2 == 1) {
        document.getElementById("sideNav").style.width = "0";
        document.getElementById("settings").style.marginLeft = "0";
    }
    xy++;
})

document.getElementById("navCloseButton").addEventListener("click", function openNav() {
    document.getElementById("sideNav").style.width = "0";
    document.getElementById("settings").style.marginLeft = "0";
})