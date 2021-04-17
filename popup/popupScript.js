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
console.log(classes.length);
console.log(classes[0]);
for (var i = 0; i < classes.length; i++) {
  classes[i].addEventListener("click", function (e) {
    var to_Copy = e.target.id;
    navigator.clipboard.writeText(to_Copy);
  });
}

//Code to send message from popup to content to open toolbar #WIP
let userClickForToolbar = document.getElementById('openToolBar');
userClickForToolbar.addEventListener("click", messenger);

function messenger() {
  let params = {
    active: true,
    currentWindow: true
  }
  chrome.tabs.query(params, gotTabs);
  function gotTabs(tabs) {
    var toolbarButtonState = "turnToolbarOn";
    let msg = toolbarButtonState;
    chrome.tabs.sendMessage(tabs[0].id, msg)
  }
}

//Come to the dark side, we use cookies!

//Debugging for copy to clipboard:
//console.log(e);
//console.log(e.target.id);