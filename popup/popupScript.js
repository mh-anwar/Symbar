//Below is the code for the buttons within the dropdowns
document
  .getElementById("selectionForm")
  .addEventListener("change", function () {
    "use strict";
    var vis = document.querySelector(".vis"),
      target = document.getElementById(this.value);
    if (vis !== null) {
      vis.className = "inv";
    }
    if (target !== null) {
      target.className = "vis";
    }
  });

//Options page opener
document.querySelector("#optionOpenerButton").addEventListener("click", function () {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL("settings_Basic.html"));
  }
});

//The Copy Function (TCF)
var classes = document.getElementsByClassName("copyButton");
console.log(classes.length)
console.log(classes[0])
for (var i = 0; i < classes.length; i++) {
  classes[i].addEventListener("click", function (e) {
    console.log("yaa");
    console.log(e);
    console.log(e.target.id);
    var to_Copy = e.target.id;
    navigator.clipboard.writeText(to_Copy);
  });
}

//Code to send message from popup to content to open toolbar
let userClickForToolbar = document.getElementById('openToolBar');
userClickForToolbar.addEventListener("click", function () {
  var toolbarButtonState = 1;
  console.log("You clicked the 'Open Toolbar' Button! Why tho?")
  console.log(toolbarButtonState)
  chrome.tabs.sendMessage(tabs[0].id, toolbarButtonState);
})


//Come to the dark side, we use cookies!
