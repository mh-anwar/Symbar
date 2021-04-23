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
    window.open(chrome.runtime.getURL("settingsBasic.html"));
  }
});

//Code for the Copy Function (for the copy buttons)
var classes = document.getElementsByClassName("copyButton");
//debuggers:
//console.log(classes.length);
//console.log(classes[0]);
for (var i = 0; i < classes.length; i++) {
  classes[i].addEventListener("click", function (e) {
    var to_Copy = e.target.id;
    navigator.clipboard.writeText(to_Copy);
  });
}

//Code to send message from popup to content to open toolbar #WIP
let userClickForToolbar = document.getElementById('openToolBar');

var onOrOff;
var stateOfButton = {};
stateOfButton['buttonState'];
userClickForToolbar.addEventListener("load", function () {
  console.log("loaded");
});
userClickForToolbar.addEventListener("click", messenger);

function messenger() {
  let params = {
    active: true,
    currentWindow: true
  }

  // Send message to background:
  var request = "We need the variable."

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



//Come to the dark side, we use cookies!

//Debugging for copy to clipboard:
//console.log(e);
//console.log(e.target.id);
/*
var onOrOff = 1;
var stateOfButton = {};
stateOfButton['buttonState'] = onOrOff;
chrome.storage.sync.set(stateOfButton, function () {
  // this called after the save
  console.log("now we have set the state to 1")
});

chrome.storage.sync.get('buttonState', function (data) {
      // this is called after the retrieve.
      onOrOff = data['buttonState'];
      console.log(stateOfButton)
    });
  stateOfButton['buttonState'] = onOrOff;
  chrome.storage.sync.set(stateOfButton, function () {
    // this called after the save
  });
*/