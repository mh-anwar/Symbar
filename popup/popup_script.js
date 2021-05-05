//Remember https://imgflip.com/i/57j1ib
window.onload = function () {
  const request = "Onload - Toolbar State."
  chrome.runtime.sendMessage(request, function () {
    chrome.storage.sync.get('toolbar_state', function (data) {
      toolbar_state = data['toolbar_state'];
      //console.log('Onload - Got the state and set it to ' + toolbar_state);
      if (toolbar_state % 2 == 0) {
        toolbar.textContent = 'Close Toolbar';
      }
    });
  });
};
//Code for the dropdown to show the copy buttons
document
  .getElementById("select_form")
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

//Code to open the options page (through button in popup)
document.querySelector("#options_button").addEventListener("click", function () {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL("../settingsPage/settingsBasic.html"));
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

//Code to send message from popup to content to open toolbar #WIP
let toolbar = document.getElementById('open_toolbar');

var toolbar_state;
var states_of_buttons = {};
states_of_buttons['toolbar_state'];
toolbar.addEventListener("click", worker_messenger);

function worker_messenger() {
  // Send message to background:
  const request = "Toolbar State."

  chrome.runtime.sendMessage(request, function (response) {
    console.log(response);
    chrome.storage.sync.get('toolbar_state', function (data) {
      toolbar_state = data['toolbar_state'];
      chrome.tabs.query({ active: true, currentWindow: true }, content_script_messenger);
    });
  });

  function content_script_messenger(tabs) {
    if (toolbar_state % 2 == 0) {
      let content_script_message = "toolbar_on";
      chrome.tabs.sendMessage(tabs[0].id, content_script_message);
      toolbar.textContent = 'Close Toolbar';
    } else if (toolbar_state % 2 == 1) {
      console.log("toolbar is now off" + toolbar_state)
      let content_script_message = "toolbar_off";
      chrome.tabs.sendMessage(tabs[0].id, content_script_message);
      toolbar.textContent = 'Open Toolbar';
    }
  }
}


//Come to the dark side, we use cookies!