console.log("Settings script operational, SIR!")

// function bakeCookie(cname, cvalue, exdays) { //sets the cookie name, the cookie itself, and the days until expiry
//   var d = new Date(); //makes new date function
//   d.setTime(d.getTime() + (exdays*24*60*60*1000)); //gets current time
//   var expires = "expires="+ d.toUTCString(); //turns d (date) into a string
//   document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/"; //cookie = cookie name + cookie value + when it expires
// }
//
// function getCookie(cname) {
//     var name = cname + "="; //adds the equals symbol because you cant put that in brackets
//     var decodedCookie = decodeURIComponent(document.cookie); //decodes it or something
//     var ca = decodedCookie.split(';'); //splits all cookies (divided by the semicolons)
// //space for readability
//     for(var i = 0; i <ca.length; i++) { //repeats as many cookies as there are
//     var c = ca[i]; //sets ca to c
//     while (c.charAt(0) == ' ') {
//     c = c.substring(1);
//     }
//     if (c.indexOf(name) == 0) {//if cookie is found
//     return c.substring(name.length, c.length);//return value of that cookie
//     }
//     }
//     return ""; //else return nothing
// }
//
// function theme() {
//    var modeSwitch = document.getElementById("modeSwitch");
//    if (modeSwitch.checked) { //if switch pressed, turn on dark mode
//       //console.log("dark mode on");
//       bakeCookie("mode", "dark", "365")
//   } else { //if it's already pressed, turn off dark mode
//       //console.log("dark mode off");
//       bakeCookie("mode", "lite", "365")
//   }
//   var currentMode = getCookie("mode");
//   console.log(currentMode);
// }
//
// var checkbox = document.getElementById("modeSwitch");
// checkbox.addEventListener('change', function() {
//     theme();
// });

// Send message to background:
var request = "mode"

chrome.runtime.sendMessage(request, function (response) {
  console.log(`got a msg from worker: ${JSON.stringify(response)}`)
  chrome.storage.sync.get('buttonState', function (data) {
    onOrOff = data['buttonState'];
    console.log('(in the message sender): Set onOrOFf' + onOrOff)
    chrome.tabs.query(params, gotTabs);
  });
});

function gotTabs(tabs) {
  console.log('Set onOrOFf' + onOrOff)
  if (onOrOff % 2 == 0) {
    console.log("toolbar is now on" + stateOfButton['buttonState'])
    var toolbarButtonState = "turnToolbarOn";
    let msg = toolbarButtonState;
    chrome.tabs.sendMessage(tabs[0].id, msg)
    var toolbar = document.getElementById('openToolBar');
    toolbar.textContent = 'Close Toolbar';
  }
  if (onOrOff % 2 == 1) {
    console.log("toolbar is now off" + stateOfButton['buttonState'])
    var toolbarButtonState = "turnToolbarOff";
    let msg = toolbarButtonState;
    chrome.tabs.sendMessage(tabs[0].id, msg)
    var toolbar = document.getElementById('openToolBar');
    toolbar.textContent = 'Open Toolbar';
  }
}
}
