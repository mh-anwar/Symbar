
console.log("Content Script is running, SIR!");
//Apr 05, 09:41pm [YIP]: the content script is sandboxed to within the screen
//HTML Injection (you should see a copy_toolbar after you open it through the popup)
function toolbar_injector(message) {
  //console.log(message);
  if (message === "toolbar_on") {
    var div = document.createElement(div);
    div.className = "toolbar_base"
    div.setAttribute("id", "copy_toolbar")
    document.body.appendChild(div);

    fetch(chrome.runtime.getURL('toolbar/content_injection.html'))
      .then(response => response.text())
      .then(data => {
        document.getElementById('copy_toolbar').innerHTML = data;
        //Code for the Copy Function (for the copy buttons)
        document
          .getElementById("select-form")
          .addEventListener("change", function () {
            "use strict";
            var buttons_toggle = document.querySelector(".buttons_toggle"),
              target = document.getElementById(this.value);
            if (buttons_toggle !== null) {
              buttons_toggle.className = "button__list--div";
            }
            if (target !== null) {
              target.className = "buttons_toggle";
            }
          });
        //Code for the Copy Function (for the copy buttons)
        var copyButtonClass = document.getElementsByClassName("button--copy");
        for (var i = 0; i < copyButtonClass.length; i++) {
          copyButtonClass[i].addEventListener("click", function (e) {
            var text_to_copy = e.target.textContent;
            navigator.clipboard.writeText(text_to_copy);
          });
        }
        document.getElementById("close_toolbar").addEventListener("click", function () {
          chrome.storage.sync.get('toolbar_state', function (data) {
            var states_of_buttons = {};
            states_of_buttons['toolbar_state'];
            var toolbar_state = data['toolbar_state'];
            console.log("BEFORE SETTING IT" + toolbar_state)
            toolbar_state++;
            console.log("AFTER SETTING IT" + toolbar_state)
            states_of_buttons['toolbar_state'] = toolbar_state;
            chrome.storage.sync.set(states_of_buttons, function () {
              console.log("NOW SAVING IT")
            });
            request = "Content Script - Toolbar State Changed."
            chrome.runtime.sendMessage(request, function (response) {
              console.log(response);
            });
          });
          document.getElementById('copy_toolbar').remove()
        });
      });
  } else if (message === "toolbar_off") {
    document.getElementById('copy_toolbar').remove()
  }
  return true
}

chrome.runtime.onMessage.addListener(toolbar_injector);

/*
    var div = document.createElement(div);
    const style = document.createElement('style');
    div.className = "toolbar_base"
    div.setAttribute("id", "copy_toolbar")
    document.body.appendChild(div);
    div.innerHTML = "<h1>HELLOW WORLD. Basic Toolbar<h1>";
*/