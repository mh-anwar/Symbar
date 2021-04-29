//Remember https://imgflip.com/i/57j1ib
//Code for the dropdown to show the copy buttons
document
  .getElementById("selectionForm")
  .addEventListener("change", function () {
    "use strict";
    var vis = document.querySelector(".vis"),
      target = document.getElementById(this.value);
    if (vis !== null) {
      vis.className = "buttonsDiv";
    }
    if (target !== null) {
      target.className = "vis";
    }
  });

//Code to open the options page (through button in popup)
document.querySelector("#optionOpenerButton").addEventListener("click", function () {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL("../settingsPage/settingsBasic.html"));
  }
});

//Code for the Copy Function (for the copy buttons)
var copyButtonClass = document.getElementsByClassName("copyButton");
for (var i = 0; i < copyButtonClass.length; i++) {
  copyButtonClass[i].addEventListener("click", function (e) {
    var to_Copy = e.target.textContent;
    //console.log(e.target.textContent);
    navigator.clipboard.writeText(to_Copy);
  });
}

//Code to send message from popup to content to open toolbar #WIP
let userClickForToolbar = document.getElementById('openToolBar');

var onOrOff;
var stateOfButton = {};
stateOfButton['buttonState'];

userClickForToolbar.addEventListener("click", messenger);

function messenger() {
  // Send message to background:
  const request = "Toolbar State."
  let params = {
    active: true,
    currentWindow: true
  }
  chrome.runtime.sendMessage(request, function (response) {
    console.log(response);
    chrome.storage.sync.get('buttonState', function (data) {
      onOrOff = data['buttonState'];
      console.log('(in the message sender): Set onOrOFf' + onOrOff)
      chrome.tabs.query(params, gotTabs);
    });
  });

  function gotTabs(tabs) {
    if (onOrOff % 2 == 0) {
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

window.onload = function () {
  const request = "Onload - Toolbar State."
  chrome.runtime.sendMessage(request, function () {
    chrome.storage.sync.get('buttonState', function (data) {
      onOrOff = data['buttonState'];
      console.log('Onload - Got the state and set it to ' + onOrOff);
      if (onOrOff % 2 == 0) {
        var toolbar = document.getElementById('openToolBar');
        toolbar.textContent = 'Close Toolbar';
      }
    });
  });
};


//Come to the dark side, we use cookies!

//Debugging for copy to clipboard:
//console.log(e);
//console.log(e.target.id);